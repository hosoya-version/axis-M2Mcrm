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
各項目は { "value": 抽出値(文字列), "confidence": 信頼度(0〜100の整数) } の形式にしてください。
読み取れない項目は value を空文字 ""、confidence を 0 にしてください。

項目キー:
- company_name      会社名
- company_name_kana 会社名フリガナ
- contact_name      ご担当者名
- tel               電話番号(TEL)
- fax               FAX番号
- address           住所
- email             メールアドレス(Email)
- department        部署名

出力例:
{"company_name":{"value":"〇〇株式会社","confidence":95},"company_name_kana":{"value":"マルマルカブシキガイシャ","confidence":80},"contact_name":{"value":"山田 太郎","confidence":90},"tel":{"value":"03-0000-0000","confidence":88},"fax":{"value":"","confidence":0},"address":{"value":"東京都...","confidence":78},"email":{"value":"taro@example.co.jp","confidence":99},"department":{"value":"営業部","confidence":70}}`;

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
        max_tokens: 1024,
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
