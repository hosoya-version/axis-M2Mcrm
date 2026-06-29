# AxisCRM（M2M-Datas by Axis Cloud）

## 概要
機器販売・工事管理・サブスクリプションの3種取引に対応したCRMシステム。

## アクセス
- GitHub Pages：https://hosoya-version.github.io/axis-M2Mcrm/
- ローカル開発：serve.bat起動 → http://[::1]:3000/index.html

## 技術構成
- フロントエンド：HTML / CSS / Vanilla JavaScript
- バックエンド：Supabase（Auth・Database・RLS）
- ホスティング：GitHub Pages

## ファイル構成
- index.html：ログイン・パスワードリセット画面
- app.html：メインアプリ画面
- js/app.js：メインロジック
- js/config.js：Supabase接続情報
- sql/：Supabase用SQLファイル群

## カスタムIDルール
- 親ID：YYYYMMDD + 3桁連番（例：20260614001）
- 枝番A：親ID + A + 2桁（機器販売）
- 枝番B：親ID + B + 2桁（工事管理）
- 枝番C：親ID + C + 2桁（サービス・更新でC02→C03）

## テストアカウント
- hosoya@agringo.jp（管理者）

## 開発フェーズ
- Phase 3：Auth・ログイン・セッション ✅
- Phase 4-①：企業管理 ✅
- Phase 4-②：担当者管理 ✅
- Phase 4-③：代理店・商品マスタ ✅
- Phase 4-④：案件管理一覧 ✅
- Phase 4-⑤：申込ウィザード（企業検索・担当者検索・確定登録INSERT） ✅
- Phase 4-⑥：サブスク更新 confirmRenewal → service_c INSERT ✅
- Phase 4-⑦：入金登録 registerPayment → billing_status 更新 ✅
- Phase 4-⑧：臨時商品マスタ登録 → temp_products INSERT ✅

### 残課題（任意・未着手）
- 郵便番号検索のモック（住所API連携 or 削除）
- C サービス新規登録フォーム（saveServiceNew）の Supabase 永続化
- 返金登録（saveRefund）の Supabase 永続化
- サブスク更新のトリガーUI（更新モーダルHTML）は未実装。confirmRenewal の
  データ処理は実装・検証済みだが、現状UIから到達する導線がない。
