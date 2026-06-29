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

const EXTRACTION_PROMPT = `あなたは日本語の申込書PDFから情報を抽出するアシスタントです。
添付PDFから以下の項目を抽出し、JSONオブジェクトのみを返してください（前後に説明文やコードフェンスを付けない）。

【最重要・厳守事項】
- PDFに実際に記載されている値のみを抽出すること。サンプル値・推測値・初期値・架空のデータは絶対に返さないこと。
- 読み取れなかった・記載が無いフィールドは、必ず value を空文字 "" とし confidence を 0 にすること（それらしい値を捏造しない）。
- 確信が持てない場合も空文字 "" を返すこと。

各テキスト項目は { "value": 抽出値(文字列), "confidence": 信頼度(0〜100の整数) } の形式にしてください。

項目キー（テキスト項目）:
- company_name      会社名
- company_name_kana 会社名フリガナ
- contact_name      ご担当者欄に記載された氏名をそのまま抽出する。記載がなければ ""。
- tel               電話番号(TEL)
- fax               FAX番号
- address           住所
- email             メールアドレス(Email)
- department        部署名
- apply_date        お申込日。必ず YYYY-MM-DD 形式の文字列で正確に抽出すること。記載が無い場合は "" を返す。
- notes             備考・特記事項。「急ぎでお願いします」等の連絡事項を含め、備考欄・特記事項欄の内容を必ず抽出する。無ければ ""。

加えて、以下の構造化項目も返すこと:

- products: 注文された商品の配列。各要素は
    { "product_code": 商品コード(文字列), "quantity": 数量(整数) }
  ・商品コードごとに数量を正確に対応させること。
  ・数量が空欄の品目は quantity を 0 とする。
  ・数量の記載がある品目のみ正の整数を入れる。
  ・該当する商品行が無ければ空配列 [] を返す。

- subscription: サブスクリプション項目（月額／台、契約サイクル等）が記載されている場合のみ
    { "monthly_unit_price": 月額単価(整数), "unit_count": 台数(整数), "cycle": 契約サイクル(文字列) }
  を返す。サブスクの記載がまったく無い場合は subscription を null（JSONのnull）にすること。

出力例:
{"company_name":{"value":"〇〇株式会社","confidence":95},"company_name_kana":{"value":"マルマルカブシキガイシャ","confidence":80},"contact_name":{"value":"山田 太郎","confidence":90},"tel":{"value":"03-0000-0000","confidence":88},"fax":{"value":"","confidence":0},"address":{"value":"東京都...","confidence":78},"email":{"value":"taro@example.co.jp","confidence":99},"department":{"value":"営業部","confidence":70},"apply_date":{"value":"2026-06-14","confidence":92},"notes":{"value":"急ぎでお願いします","confidence":85},"products":[{"product_code":"OSSAZ100R_A_CP","quantity":2},{"product_code":"OSSLTEANTB","quantity":0}],"subscription":null}`;

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
