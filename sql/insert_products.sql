-- AxisCRM 商品マスタ投入SQL
INSERT INTO products (product_code, product_name, unit, unit_price, cost_price, category, is_active, notes) VALUES
  ('OSSAZ100R_A_CP', '絶縁監視装置 AZ100 標準セット',    '台',  48700, 31700, '機器',    true, '標準セット'),
  ('OSSAZ100R_B_CP', '絶縁監視装置 AZ100 入れ換えセット','台',  45700, 29700, '機器',    true, '入れ換えセット'),
  ('OSSVREFCBLA',    '位相設定用ケーブル 4m',             '本',  13000,  8450, 'ケーブル',true, ''),
  ('OSSZCT4PD',      'ZCT 4pin 4m AZ100R用',             '個',   4000,  2600, 'ZCT',     true, ''),
  ('OSSZCTCBL4PA',   'ZCT 4ピン用延長ケーブル 4m',       '本',   2000,  1300, 'ケーブル',true, ''),
  ('OSSZCTCV34A',    'ZCT変換ケーブル',                   '本',   1300,   850, 'ケーブル',true, ''),
  ('OSSPWRCBLC',     '電源ケーブル 1.5m 2p アース線付',  '本',   1000,   650, 'ケーブル',true, ''),
  ('OSSPWRCBLA',     '電源ケーブル 3m 2p アース線なし',  '本',   1000,   650, 'ケーブル',true, ''),
  ('OSSLTEANTB',     '外部アンテナ 5m AZ100R用',          '個',  10000,  6500, '機器',    true, ''),
  ('OSKCARR',        '送料',                              '式',    500,   500, 'その他',  true, '送料');
