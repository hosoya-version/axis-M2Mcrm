-- =============================================
-- AxisCRM RLSポリシー設定SQL
-- Phase 4-⑤完了後にSupabase SQL Editorで実行
-- =============================================

-- axis_ids
ALTER TABLE axis_ids ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "axis_ids_authenticated" ON axis_ids;
CREATE POLICY "axis_ids_authenticated" ON axis_ids
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL ON axis_ids TO authenticated;

-- sales_a
ALTER TABLE sales_a ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sales_a_authenticated" ON sales_a;
CREATE POLICY "sales_a_authenticated" ON sales_a
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL ON sales_a TO authenticated;

-- construction_b
ALTER TABLE construction_b ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "construction_b_authenticated" ON construction_b;
CREATE POLICY "construction_b_authenticated" ON construction_b
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL ON construction_b TO authenticated;

-- service_c
ALTER TABLE service_c ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_c_authenticated" ON service_c;
CREATE POLICY "service_c_authenticated" ON service_c
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL ON service_c TO authenticated;

-- 確認
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('axis_ids','sales_a','construction_b','service_c')
ORDER BY tablename;
