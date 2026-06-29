// =============================================================
// Supabase Edge Function: extract-pdf
// 申込書PDF（base64）を受け取り、Anthropic Claude Haiku で
// 会社名・フリガナ・担当者名・TEL・FAX・住所・Email・部署名 を抽出して返す。
//
// Anthropic APIキーはブラウザに出さず、Supabaseのsecretsから読み込む:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy extract-pdf
// =============================================================

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = "claude-haiku-4-5-20251001";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

// レスポンステキストから最初のJSONオブジェクトを抽出してパース
function parseFirstJsonObject(text: string): unknown | null {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

const EXTRACTION_PROMPT = `あなたは日本語の申込書・発注書PDFから情報を正確に抽出するアシスタントです。
添付PDFから以下の項目を抽出し、JSONオブジェクトのみを返してください（前後に説明文やコードフェンスを付けない）。

【重要ルール】
- 読み取れない項目・記載のない項目は必ず value を空文字 ""、confidence を 0 にすること
- 絶対に推測・補完・サンプル値を入れないこと
- PDFに記載されている値をそのまま抽出すること
- 日付は PDF 記載の通り YYYY-MM-DD 形式で抽出すること（記載がなければ ""）
- 今日の日付や現在の日付を使わないこと

【抽出項目】
各項目は { "value": 抽出値(文字列), "confidence": 信頼度(0〜100の整数) } の形式にすること。

基本情報:
- company_name      発注者・申込者の会社名
- company_name_kana 会社名フリガナ（記載があれば）
- contact_name      ご担当者名（発注者側の担当者）
- tel               電話番号(TEL)
- fax               FAX番号
- address           住所（都道府県から番地まで）
- email             メールアドレス
- department        部署名
- apply_date        申込日（YYYY-MM-DD形式）
- notes             備考・特記事項（「急ぎでお願いします」等の記載があれば必ず抽出）

商品情報（products配列）と金額照合:
- products          注文された商品の配列。各要素は
                    {"code": "商品コード", "name": "商品名", "quantity": 数量(整数), "unit_price": 単価(整数), "subtotal": 小計(整数)} の形式。
                    ・「数量」欄が空欄・0・「ー」「-」「—」の行は完全に無視し、配列に含めないこと。
                    ・数量に正の整数が記載されている行のみ抽出すること。
                    ・subtotal は quantity × unit_price とすること。
- pdf_total         PDFに「合計（税別）」「合計」「Total」等の記載があれば、その金額(整数)。無ければ 0。
- calculated_total  上記 products の subtotal を合算した値(整数)。
- warnings          文字列の配列。pdf_total と calculated_total が一致しない場合は
                    "金額不一致: PDF合計=X, 計算合計=Y" を追加する。問題なければ空配列 []。

サブスクリプション情報:
- subscription      サービス申込欄が記載されている場合のみオブジェクトで返す。
                    記載がない場合は null を返すこと（絶対に推測しない）。
                    記載がある場合: {"plan": "プラン名", "monthly_fee": 月額(整数), "cycle": "契約サイクル"}

出力例:
{
  "company_name": {"value": "ウツノミヤ電気管理事務所", "confidence": 95},
  "company_name_kana": {"value": "", "confidence": 0},
  "contact_name": {"value": "宇津宮 利至", "confidence": 90},
  "tel": {"value": "080-2571-3392", "confidence": 88},
  "fax": {"value": "", "confidence": 0},
  "address": {"value": "岩手県花巻市野田326-14 テラスハウス/レレヤマB-2", "confidence": 85},
  "email": {"value": "utsunomiya-emo@tbz.t-com.ne.jp", "confidence": 99},
  "department": {"value": "", "confidence": 0},
  "apply_date": {"value": "2026-01-13", "confidence": 95},
  "notes": {"value": "", "confidence": 0},
  "products": [
    {"code": "OSSAZ100R_A_CP", "name": "絶縁監視装置 AZ100 標準セット", "quantity": 1, "unit_price": 48700, "subtotal": 48700}
  ],
  "pdf_total": 48700,
  "calculated_total": 48700,
  "warnings": [],
  "subscription": null
}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "POST only" }, 405);
  }
  if (!ANTHROPIC_API_KEY) {
    return json(
      { error: "ANTHROPIC_API_KEY secret is not set on this Edge Function" },
      500,
    );
  }

  let pdfBase64: string | undefined;
  try {
    const body = await req.json();
    pdfBase64 = body?.pdfBase64;
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }
  if (!pdfBase64 || typeof pdfBase64 !== "string") {
    return json({ error: "pdfBase64 (string) is required" }, 400);
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              { type: "text", text: EXTRACTION_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const detail = await anthropicRes.text();
      return json(
        { error: "Anthropic API error", status: anthropicRes.status, detail },
        502,
      );
    }

    const data = await anthropicRes.json();
    const textBlock = Array.isArray(data?.content)
      ? data.content.find((b: { type?: string }) => b?.type === "text")
      : null;
    const raw: string = textBlock?.text ?? "";
    const extraction = parseFirstJsonObject(raw);

    if (!extraction) {
      return json({ error: "抽出結果をJSONとして解析できませんでした", raw }, 502);
    }
    return json({ extraction, model: MODEL }, 200);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
