-- =============================================================
-- AxisCRM Phase 6 本番運用直前チェック — 必須DB修正・確認SQL
-- Supabase SQL Editor で実行してください
-- =============================================================

-- -------------------------------------------------------------
-- 【6-②】全テーブルのRLS有効状態を一覧確認
-- relrowsecurity = true なら RLS 有効
-- -------------------------------------------------------------
SELECT n.nspname AS schema, c.relname AS table, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;

-- ポリシー一覧
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- 任意ハードニング：anonロールに残っている axis_ids のSELECT権限を剥奪
-- （RLSで行は保護されているが、未認証はそもそもクエリ自体を拒否すべき）
REVOKE SELECT ON public.axis_ids FROM anon;

-- =============================================================
-- 【6-④・必須】members の自己UPDATEポリシーを追加
-- 現状: 認証ユーザーが自分の members 行を UPDATE しようとしても
--       RLSのUPDATEポリシーが無いため 0 行更新（エラーは出ない）。
--       → パスワード変更後に is_initial_pw=false に落とせず、
--         毎回パスワード変更画面に戻る無限ループになる。
-- =============================================================
GRANT UPDATE ON public.members TO authenticated;

-- 自分自身の members 行だけ更新可能にする
DROP POLICY IF EXISTS members_update_own ON public.members;
CREATE POLICY members_update_own ON public.members
  FOR UPDATE TO authenticated
  USING (auth_uid = auth.uid())
  WITH CHECK (auth_uid = auth.uid());

-- 管理者は全メンバーを更新可能（メンバー管理・PW初期化機能で必要）
DROP POLICY IF EXISTS members_update_admin ON public.members;
CREATE POLICY members_update_admin ON public.members
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.members m
            WHERE m.auth_uid = auth.uid() AND m.role = 'admin')
  )
  WITH CHECK (true);

-- 確認: ポリシーが付いたか
SELECT policyname, cmd, roles FROM pg_policies
WHERE schemaname='public' AND tablename='members' ORDER BY cmd;

-- =============================================================
-- 【6-③】デモ会用テストアカウントの作成
-- 手順:
--   1) Supabase Dashboard → Authentication → Users → Add user
--      - Email:    demo@agringo.jp
--      - Password: axis0120   （初期パスワード）
--      - Auto Confirm User: ON（メール確認をスキップ）
--   2) 作成された User の UID をコピーし、下のINSERTの :auth_uid に貼る
--   3) 下記INSERTを実行（is_initial_pw=true で初回PW変更フローを体験できる）
-- =============================================================
INSERT INTO public.members
  (auth_uid, email, last_name, first_name, role, is_initial_pw, is_active)
VALUES
  ('ここにDashboardで作成したUIDを貼り付け',
   'demo@agringo.jp', 'デモ', '太郎', 'user', true, true);

-- 確認
SELECT email, last_name, first_name, role, is_initial_pw, is_active
FROM public.members ORDER BY created_at;
