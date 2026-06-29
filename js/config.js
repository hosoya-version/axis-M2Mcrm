const SUPABASE_URL = 'https://ejtaqzwqadkcdbvxocfw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdGFxendxYWRrY2RidnhvY2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MjI1MDQsImV4cCI6MjA5ODE5ODUwNH0.60IP9Xi5U-TK48sNPiRaEXa3zHW4w5MWXRen1TWAUgw';

// Anthropic APIキーはここ（クライアント）には置きません。
// PDF解析は Supabase Edge Function「extract-pdf」をプロキシとして呼び出し、
// キーは Supabase の Secrets（環境変数 ANTHROPIC_API_KEY）にのみ保存します。
// 設定: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...