# extract-pdf — PDF解析プロキシ Edge Function

申込書PDFを Anthropic Claude Haiku で解析し、企業・担当者情報を抽出して返す。
Anthropic APIキーはブラウザに出さず、Supabase の Secrets に保存する。

## デプロイ手順

```bash
# 1. Supabase CLI でログイン & プロジェクトをリンク
supabase login
supabase link --project-ref ejtaqzwqadkcdbvxocfw

# 2. Anthropic APIキーを Secrets に登録（ブラウザには出ない）
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxx

# 3. Edge Function をデプロイ
supabase functions deploy extract-pdf
```

## 動作確認（cURL）

```bash
# <ANON_KEY> は js/config.js の SUPABASE_ANON_KEY
curl -i -X POST \
  "https://ejtaqzwqadkcdbvxocfw.supabase.co/functions/v1/extract-pdf" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "content-type: application/json" \
  -d '{"pdfBase64":"<PDFをbase64化した文字列>"}'
```

## 入出力

- リクエスト: `{ "pdfBase64": "<base64 (data: プレフィックス無し)>" }`
- レスポンス: `{ "extraction": { "company_name": {"value","confidence"}, ... }, "model": "..." }`

## クライアント側

`js/app.js` の `analyzePdf()` が `window._sb.functions.invoke('extract-pdf', { body: { pdfBase64 } })`
で呼び出す。認証トークン（ログインセッション）は SDK が自動付与するため、
未ログインの第三者はこのプロキシを叩けない（verify_jwt 既定有効）。

## 注意

- 本物の Anthropic キーは **Secrets のみ**。`js/config.js` やリポジトリに書かない。
- `verify_jwt` を無効化しない（無効化すると誰でもプロキシ経由で課金できてしまう）。
