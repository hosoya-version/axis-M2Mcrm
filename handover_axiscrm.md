# AxisCRM 開発引き継ぎ文（次セッション用）

AxisCRM（M2M-Datas by Axis Cloud）開発の続きをお願いします。Claude Codeに全部やらせる方針で進めてください。

## 【完了済みフェーズ】

- Phase 3：Auth・ログイン・セッション・membersテーブル連携 ✅
- Phase 4-①〜⑧：全画面Supabase連携 ✅
- Phase 5：サブスク更新モーダル・saveServiceNew/saveRefund永続化・郵便番号検索削除 ✅
- Phase 6：GitHub Pages CSS修正・RLS強化・パスワードフロー修正 ✅
- Phase 7：申込ウィザードPDF解析（Claude Haiku + Supabase Edge Function） ✅
- Phase 8：デモ会バグ修正21項目一括対応 ✅

## 【最新commit】
db04901（21項目バグ修正）/ 2bd2593（insert_products.sql修正）

## 【インフラ】

- 本番URL：https://hosoya-version.github.io/axis-M2Mcrm/index.html
- ローカル：serve.bat（python http.server 3000）→ http://[::1]:3000/index.html
- Supabase：https://ejtaqzwqadkcdbvxocfw.supabase.co
- テストユーザー：hosoya@agringo.jp
- Supabaseクライアント：window._sb
- Edge Functions：extract-pdf（PDF解析）、reset-member-password（PW初期化）、request-password-reset（PW再設定依頼）

## 【重要な実装事実】

- axis_id = 親ID文字列（表示名は「アクシスID」）、branch_id = 枝番コード文字列
- status等は日本語値（「契約中」「更新済」「未請求」「入金済」）
- 臨時商品はtemp_productsテーブル
- membersカラム：is_initial_pw（trueで初回ログイン時パスワード変更強制）
- PDF解析：ウィザードStep1でPDFアップロード→Edge Function→Haiku→Step2自動表示
- window.currentUser = {uid, displayName, name, email, role}（app.html headで非同期設定）
- メンバー管理はポーリング方式（setInterval）でcurrentUser待ち

## 【membersテーブル構成】
email, last_name, first_name, role, is_initial_pw, is_active, created_at, updated_at, auth_uid, phone, company

---

## 【今回の作業内容（Phase 9：デモ会後の修正項目）】

### 🔴 優先度: 高（基本機能のバグ）

#### ① パスワードリセット依頼エラー（401）
- **症状**: index.htmlの「パスワードが不明な方はこちら」→メール入力→「依頼を送信」を押すと `エラー: 401` が表示される
- **再現**: tests@axis.co.jp で発生確認
- **推定原因**: Edge Function `request-password-reset` の認証設定問題、またはApikey/Authorizationヘッダーの不備
- **対応**: 
  - Edge Functionログ確認（Supabase Dashboard → Edge Functions → Logs）
  - verify_jwt の設定を確認（公開APIなので false が必要な可能性）
  - 必要なら Authorization: Bearer ${SUPABASE_ANON_KEY} ヘッダー追加

#### ② Chrome戻るボタンでログイン画面まで戻る
- **症状**: app.html内でChromeの戻るボタンを押すと、一個前の画面ではなくログイン画面まで戻ってしまう
- **推定原因**: SPA画面遷移で history.pushState を使っていないため、ブラウザ履歴に画面遷移が記録されていない
- **対応**: 
  - 画面切替関数（showScreen等）で history.pushState({screen: 'xxx'}, '', '#xxx') を呼ぶ
  - popstateイベントで履歴に応じた画面復元
  - ログイン画面への戻りは認証チェックで制御

#### ③ 企業削除機能の欠如
- **症状**: 企業管理画面で企業自体を削除する方法がない（アクシスIDは削除できるが企業が残る）
- **例**: 「ウツノミヤ電気管理事務所」の紐づくアクシスIDを全削除しても企業が消えない
- **対応**:
  - 企業管理一覧に「削除」ボタン追加
  - 削除前に「紐づくアクシスID・拠点・担当者があります」の確認ダイアログ
  - カスケード削除またはエラー表示（branches, contacts, casesとの関連確認）

#### ④ 案件管理：集計の不整合と枝番ゼロ問題
- **症状A**: 「今月の申込書6件」「発行済み枝番8件 A:3 B:3 C:2」「累計申込書89件」と一覧表示の3件が一致していない（全部今月の申込なのに集計が合わない）
- **症状B**: 一覧で「枝番数0件」表示のレコードがある（NTT東日本、テスト工業）
- **対応**:
  - 集計クエリ修正（今月件数、累計件数の正確な集計）
  - 枝番は最低1から付番（0は禁止）
  - 既存データのマイグレーション（枝番0を1にリナンバー）

#### ⑤ Cサブスクサービス追加不可（致命的）
- **症状**: 申込ウィザードStep4で「+ 工事B（工事管理）を追加」ボタンはあるが、Cサブスクサービスを追加するボタンが見当たらない
- **対応**: 
  - 「+ サブスクC を追加」ボタンを Step4 に追加
  - Cサブスクサービス入力フォーム（商品選択・開始日・金額等）の実装
  - 確定時に services テーブルへinsert + branch_id (C枝番) の発行

---

### 🟡 優先度: 中（PDF解析の精度向上）

#### ⑥ 発注書AI解析の精度問題（数量・合計額のズレ）
- **症状**: 「ご発注書.pdf」の実際の合計は ¥48,700（標準セット1台のみ）だが、システム側は ¥62,700 と算出される
- **原因**: 数量0の商品が「読み取り値」に表示されてしまっている、または不要な行が合計に加算されている
- **対応**:
  - extract-pdf Edge Function（Claude Haiku）のプロンプト改善
    - 「数量欄に数字が記載されている行のみ抽出」を明示
    - 「数量0または空欄の行は除外」
  - フロント側でも数量0行を非表示にする
  - 合計金額は明細から再計算（PDF記載の合計と照合検証）

#### ⑦ 既存企業マッチングAI判定
- **症状**: 現状は単純な文字列マッチング、AI判定の類似度スコアが表示されていない
- **対応**:
  - extract-pdf Edge Function内で、抽出した企業名と既存DBの企業名リストを Haiku に渡して類似度判定
  - 候補に「マッチング度: 95%」等のスコア表示
  - 信頼度80%以上は「強い一致」、50-80%は「候補」、未満は「新規推奨」

#### ⑧ 担当者登録ステップの改善
- **症状A**: 発注書の担当者がメイン担当者に自動設定されていない
- **症状B**: 既存企業に紐づく他の担当者（過去登録済み）が候補として表示されない
- **対応**:
  - Step3で発注書PDF記載の担当者を「★ メイン担当者」フラグ付きで表示
  - 既存企業選択時、その企業の contacts テーブルから既存担当者を「サブ担当者候補」として並列表示
  - 「★メインに設定」ボタンでメイン入替可能（既存仕様維持）

---

### 🟢 優先度: 低（UI改善）

#### ⑨ 担当者管理：アクシスID数が全員0件問題
- **症状**: 担当者管理一覧で全担当者のアクシスID数が「0件」と表示される
- **推定原因**: 担当者-案件の紐付けクエリ（contact_id ベースのカウント）が機能していない
- **対応**:
  - 担当者ごとの cases / branches カウントクエリ修正
  - cases テーブルの contact_id, branches テーブルの contact_id 構造を確認
  - 「削除」ボタン追加（紐づく案件確認後）

#### ⑩ 代理店編集機能の欠如
- **症状**: 代理店管理一覧に「編集」ボタンがない（「+新規登録」のみ）
- **対応**: 
  - 代理店一覧の各行に「編集」「削除」ボタン追加
  - 編集モーダル実装（代理店名・フリガナ・電話・メール・住所・紐づく企業）

---

### 🔵 追加調査：モックHTML対比チェック

**重要**: ファイル分割（Phase 3-③）・Supabase連携（Phase 4）の過程で、**元のモック（単一HTML）にあった機能が消えてしまっている可能性がある**ため、次セッションで網羅的な対比チェックをお願いします。

- **比較対象**: 
  - 元モック（GitHub履歴の Phase 3-③ 直前コミット、または細谷さんの手元バックアップ）
  - 現在のapp.html（最新commit: db04901）
- **チェック項目例**: 
  - 各画面のボタン数・モーダル数
  - 機能（フィルター、ソート、エクスポート、印刷、検索等）
  - 表示項目（カラム、ステータスバッジ、ツールチップ等）
- **進め方**: Claude Codeで両ファイルをdiffし、機能消失をリスト化 → 細谷さん確認 → 優先度付けて復活

---

## 【参考ファイル】
- 発注書サンプル: `ご発注書.pdf`（合計¥48,700の検証用）
- バグ報告書: `アクシスクラウド_M2M-DATAS-_-_Google_スライド.pdf`（10項目）

## 【確認ダイアログ】
全てYes/allow。git pushまで自動実行OK。
