-- =============================================
-- AxisCRM 商品マスタ モックデータ投入SQL
-- Supabase SQL Editor で実行してください。
-- PDF注文書（絶縁監視装置 AZ100 一式）から抽出した品目です。
--
-- products テーブル想定カラム:
--   product_code, product_name, unit, unit_price, cost_price, category, is_active, notes
-- ※ cost_price は仮置き（売価の約65%）。実原価が判明したら更新してください。
-- =============================================

INSERT INTO products (product_code, product_name, unit, unit_price, cost_price, category, is_active, notes) VALUES
  ('OSSAZ100R_A_CP', '絶縁監視装置 AZ100 標準セット',        '式', 48700, 31600, '機器',   true, '標準セット'),
  ('OSSAZ100R_B_CP', '絶縁監視装置 AZ100 入れ換えセット',      '式', 45700, 29700, '機器',   true, '入れ換えセット'),
  ('OSSVREFCBLA',    '位相設定用ケーブル 4m',                '本', 13000,  8450, 'ケーブル', true, ''),
  ('OSSZCT4PD',      'ZCT 4pin 4m',                          '本',  4000,  2600, 'ZCT',    true, ''),
  ('OSSZCTCBL4PA',   'ZCT 4ピン用延長ケーブル 4m',            '本',  2000,  1300, 'ケーブル', true, ''),
  ('OSSZCTCV34A',    'ZCT変換ケーブル',                       '本',  1300,   850, 'ケーブル', true, ''),
  ('OSSPWRCBLC',     '電源ケーブル 1.5m',                    '本',  1000,   650, 'ケーブル', true, ''),
  ('OSSPWRCBLA',     '電源ケーブル 3m',                      '本',  1000,   650, 'ケーブル', true, ''),
  ('OSSLTEANTB',     '外部アンテナ 5m',                      '本', 10000,  6500, 'アンテナ', true, ''),
  ('OSKCARR',        '送料',                                 '式',   500,   500, 'その他',  true, '送料')
ON CONFLICT (product_code) DO UPDATE SET
  product_name = EXCLUDED.product_name,
  unit         = EXCLUDED.unit,
  unit_price   = EXCLUDED.unit_price,
  cost_price   = EXCLUDED.cost_price,
  category     = EXCLUDED.category,
  is_active    = EXCLUDED.is_active,
  notes        = EXCLUDED.notes;

-- 確認:
-- SELECT product_code, product_name, unit, unit_price, cost_price, category, is_active FROM products ORDER BY product_code;

-- 注意: ON CONFLICT (product_code) は product_code に UNIQUE 制約が必要です。
--       制約が無くエラーになる場合は、上の "ON CONFLICT ... notes;" 部分を削除し、
--       末尾を ";" にした単純な INSERT として実行してください。
--       （UNIQUE を付与する場合: ALTER TABLE products ADD CONSTRAINT products_code_uniq UNIQUE (product_code);）
