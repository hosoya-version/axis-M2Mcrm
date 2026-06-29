-- =============================================
-- AxisCRM テーブル構造確認SQL
-- Supabase SQL Editor で実行して結果を確認する
-- =============================================

-- axis_ids カラム確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'axis_ids'
ORDER BY ordinal_position;

-- sales_a カラム確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sales_a'
ORDER BY ordinal_position;

-- construction_b カラム確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'construction_b'
ORDER BY ordinal_position;

-- service_c カラム確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'service_c'
ORDER BY ordinal_position;

-- RLSポリシー確認
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('axis_ids','sales_a','construction_b','service_c')
ORDER BY tablename;
