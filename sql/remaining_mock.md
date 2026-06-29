# 残モック箇所リスト（Phase 4-⑥⑦⑧対応状況）

## Phase 4-⑥⑦⑧（対応済み）

### Phase 4-⑥ サブスク更新Supabase化 ✅
- `confirmRenewal()` を service_c への実INSERTに置換（async化）
- 枝番Cをインクリメントした新branch_idを発行（axis_idは親IDのまま）
- 契約期間を旧終了日の翌日から1年で自動計算、renewal_count+1、
  parent_branch_id に更新元uuidを記録、旧レコードstatusを「更新済」に
- ※注意: 更新モーダルのトリガーUI（subsc-renewal-modal等のHTML）は
  app.html に未実装。関数のデータ処理は検証済みだがUI導線は未整備。

### Phase 4-⑦ 入金登録Supabase化 ✅
- `registerPayment()` を async化し billing_status を「入金済」に更新
- `loadUnpaidPayments()` で sales_a/construction_b/service_c の未請求枝番を
  入金登録 select に動的反映（value="table::branch_id"）
- `openPaymentModal()` を追加、payments 画面遷移時にも未請求一覧をロード

### Phase 4-⑧ 臨時商品マスタ登録Supabase化 ✅
- 臨時商品マスタをモック配列から temp_products テーブル連携に置換
- 新規登録→INSERT、既存編集→UPDATE、一覧→DBから描画（いずれもasync）
- 投入先は専用の temp_products テーブル（指示書の products ではなく、
  実スキーマに存在する temp_products を採用：product_name/unit/
  unit_price/cost_price/notes）

## 残モック（任意・未対応）
- 郵便番号検索（モック文字列）→ 住所API連携 or 削除
- `saveServiceNew()`：C サービス新規登録フォーム → service_c 未永続化
- `saveRefund()`：返金登録 → DOM追記のみ、DB未永続化
- 管理者チェック/価格履歴：temp_products に該当列が無いため一覧では非表示（—）

## alert()一覧（UX改善候補・現状維持で可）
- 各種バリデーション・完了通知（alertのまま運用可）
