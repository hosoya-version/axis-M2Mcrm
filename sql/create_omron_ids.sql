-- =============================================
-- AxisCRM オムロンID テーブル作成SQL
-- Supabase SQL Editor で実行してください。
-- サブスク詳細モーダル「オムロンID」タブの登録/変更で使用します。
-- =============================================

CREATE TABLE IF NOT EXISTS omron_ids (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_id  text        NOT NULL,           -- 紐づくサービス（service_c.branch_id 等）
  unit_no     integer,                        -- 台番（1台目, 2台目 ...）
  omron_id    text,                           -- オムロンID
  initial_id  text,                           -- 初期ID
  initial_pw  text,                           -- 初期Password
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_omron_ids_service ON omron_ids (service_id);

-- RLS（必要に応じて調整）。デモ用に認証ユーザーへ全操作を許可:
ALTER TABLE omron_ids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS omron_ids_all ON omron_ids;
CREATE POLICY omron_ids_all ON omron_ids
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 確認:
-- SELECT service_id, unit_no, omron_id, initial_id, initial_pw FROM omron_ids ORDER BY service_id, unit_no;
