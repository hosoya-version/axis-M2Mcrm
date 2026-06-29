-- =============================================
-- AxisCRM 本番メンバー追加SQL
-- Supabase SQL Editorで実行（Auth登録後に実行）
-- ※ Supabase AuthでユーザーをUIから作成した後、
--    そのUIDをここに入力して実行する
-- =============================================

-- メンバーテーブルへの追加テンプレート
-- UIDはSupabase Auth → Users画面で確認する

-- 例：
-- INSERT INTO members (id, email, name, role, is_initial_pw) VALUES
-- ('ここにUID', 'email@example.com', '氏名', 'user', true);

-- 現在登録済みメンバー確認
SELECT id, email, name, role, is_initial_pw
FROM members
ORDER BY created_at;
