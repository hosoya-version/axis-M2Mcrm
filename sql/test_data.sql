-- =============================================
-- AxisCRM テストデータ投入SQL
-- Supabase SQL Editor で実行する
-- =============================================

-- 1. companies（企業）テストデータ
INSERT INTO companies (company_name, company_name_kana, phone, postal_code, address) VALUES
('オムロン ソーシアルソリューションズ株式会社', 'オムロンソーシアルソリューションズ', '03-6718-3700', '108-0075', '東京都港区港南2-3-13'),
('株式会社テスト商事', 'テストショウジ', '052-000-0001', '460-0001', '愛知県名古屋市中区テスト1-1-1'),
('サンプル工業株式会社', 'サンプルコウギョウ', '06-0000-0001', '530-0001', '大阪府大阪市北区サンプル2-2-2')
ON CONFLICT DO NOTHING;

-- 2. products（商品）テストデータ  
INSERT INTO products (product_code, product_name, unit_price, cost_price, status) VALUES
('OSSAZ100R_A_CP', '標準セット（AZ100R）', 48700, 30000, '販売中'),
('OSSAZ100R_B_CP', '入れ換えセット（AZ100R）', 42000, 25000, '販売中'),
('OSS_LTE_INS', 'LTE絶縁監視サービス', 900, 400, '販売中')
ON CONFLICT DO NOTHING;

-- 3. 確認クエリ
SELECT 'companies' as tbl, count(*) as cnt FROM companies
UNION ALL
SELECT 'products', count(*) FROM products;
