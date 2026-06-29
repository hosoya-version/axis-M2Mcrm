/*
 * AxisCRM — ダミーデータ & ロジック
 *
 * ID採番ルール:
 *   親ID   : YYYYMMDD + 3桁連番  例: 20260614001
 *   枝番A  : 親ID + "A" + 2桁連番  例: 20260614001A01
 *   枝番B  : 親ID + "B" + 2桁連番  例: 20260614001B01
 *   枝番C  : 親ID + "C" + 2桁連番  例: 20260614001C01
 *              Cは年次更新のたびに連番が増加 (C01→C02→C03...)
 *   枝番A02: 同一申込書への追加発注時のみ発行
 */



// ===== ダミーデータ定義 =====
const priceHistoryData = {
  'PRD-001': [
    { start: '2026/01/01', end: '—（現在）', sell: '¥1,200', cost: '¥480', margin: '60%', reason: '仕入れ値改定' },
    { start: '2025/04/01', end: '2025/12/31', sell: '¥1,200', cost: '¥520', margin: '57%', reason: '初期設定' }
  ],
  'PRD-002': [
    { start: '2026/01/01', end: '—（現在）', sell: '¥98,000', cost: '¥64,000', margin: '35%', reason: '仕入れ価格改定' },
    { start: '2025/01/01', end: '2025/12/31', sell: '¥95,000', cost: '¥62,000', margin: '35%', reason: '初期設定' }
  ],
  'PRD-003': [
    { start: '2026/01/01', end: '—（現在）', sell: '¥48,700', cost: '¥31,600', margin: '35%', reason: '現行価格' }
  ],
  'PRD-099': [
    { start: '2025/07/01', end: '—（現在）', sell: '¥3,800', cost: '¥1,500', margin: '61%', reason: '初期設定' }
  ],
  'SVC-001': [
    { start: '2026/01/01', end: '—（現在）', sell: '¥400,000', cost: '¥220,000', margin: '45%', reason: '現行価格' }
  ],
  'SVC-002': [
    { start: '2026/01/01', end: '—（現在）', sell: '¥200,000', cost: '¥130,000', margin: '35%', reason: '現行価格' }
  ],
  'SUB-001': [
    { start: '2025/04/01', end: '—（現在）', sell: '¥48,000', cost: '¥15,000', margin: '69%', reason: 'プラン改定' }
  ],
  'SUB-002': [
    { start: '2025/04/01', end: '—（現在）', sell: '¥120,000', cost: '¥38,000', margin: '68%', reason: 'プラン改定' }
  ],
  'SUB-003': [
    { start: '2024/09/01', end: '—（現在）', sell: '¥600', cost: '¥200', margin: '67%', reason: '初期設定' }
  ]
};

let salesAData = [
  {
    id: 1, axisId: '20260614002A01', company: 'オムロンSS', status: '処理中',
    items: [
      { name: '絶縁監視装置 AZ100 標準セット', code: 'OSSAZ100A2_O_CP', qty: '1台', unit: 48700, sub: 48700, cost: 31000 },
      { name: '位相設定用ケーブル 4m', code: 'OSSVREFCBLA', qty: '1本', unit: 13000, sub: 13000, cost: 9000 },
      { name: '電源ケーブル 1.5m', code: 'OSSPWRCBLC', qty: '1本', unit: 1000, sub: 1000, cost: 800 }
    ],
    deliveryDate: null, delivery: '未設定', billingStatus: '未請求', invoice: '未請求', attachments: []
  },
  {
    id: 2, axisId: '20260614001A01', company: 'NTT東日本', status: '処理中',
    items: [
      { name: 'M2Mセット 1式', code: 'PRD-002', qty: '1式', unit: 98000, sub: 98000, cost: 39000 },
      { name: 'LANケーブル Cat6', code: 'PRD-001', qty: '0本', unit: 0, sub: 0, cost: 0 }
    ],
    deliveryDate: null, delivery: '未設定', billingStatus: '未請求', invoice: '未請求', attachments: []
  },
  {
    id: 3, axisId: '20260610001A01', company: 'テスト工業', status: '納品済',
    items: [
      { name: '絶縁監視装置 AZ100', code: 'PRD-003', qty: '3台', unit: 48700, sub: 146100, cost: 93000 },
      { name: 'M2Mセット 1式', code: 'PRD-002', qty: '1式', unit: 98000, sub: 98000, cost: 39000 },
      { name: '配線工事（追加品）', code: 'SVC-001x', qty: '1式', unit: 485900, sub: 485900, cost: 288000 }
    ],
    deliveryDate: '2026-06-10', delivery: '2026/06/10', billingStatus: '入金済', invoice: '¥730,000 請求済',
    attachments: [
      { name: '納品書_20260610.pdf', size: '245 KB', uploadedAt: '2026-06-10 14:22', uploader: '管理者 太郎' }
    ]
  },
  {
    id: 4, axisId: '20260610001A02', company: 'テスト工業', status: '納品済',
    items: [
      { name: '固定ネジセット M3×10（追加）', code: 'PRD-099', qty: '64袋', unit: 3800, sub: 240000, cost: 96000 }
    ],
    deliveryDate: '2026-06-12', delivery: '2026/06/12', billingStatus: '請求済', invoice: '¥240,000 請求済', attachments: []
  }
];

const salesADataByKey = {};
function buildSalesADataByKey() {
  salesAData.forEach(d => { salesADataByKey[d.axisId] = d; });
}
buildSalesADataByKey();

const salesBData = {
  '20260614001B01': {
    company: 'NTT東日本', name: '名古屋 設備工事', status: '施工中',
    items: [
      { name: '基礎工事', desc: '基盤整備・アンカー設置', qty: '1式', sell: 200000, cost: 130000 },
      { name: '配線工事', desc: 'LANケーブル敷設100m', qty: '1式', sell: 400000, cost: 220000 },
      { name: '仕上げ・検査', desc: '動作確認・養生撤去', qty: '1式', sell: 200000, cost: 110000 }
    ]
  },
  '20260610001B01': {
    company: 'テスト工業', name: '大阪 更新工事', status: '完了・未請求',
    items: [
      { name: '基礎工事', desc: '既設撤去・基盤整備', qty: '1式', sell: 600000, cost: 350000 },
      { name: '配線工事', desc: '新設配線・接続試験', qty: '1式', sell: 600000, cost: 350000 }
    ]
  },
  '20251101001B01': {
    company: 'NTT東日本（埼玉）', name: '埼玉 メンテ', status: '完了・請求済',
    items: [
      { name: '定期メンテナンス', desc: '動作確認・清掃・消耗品交換', qty: '1式', sell: 450000, cost: 260000 }
    ]
  }
};

const subscData = {
  '20240901001C03': {
    company: 'NTT東日本', plan: 'プレミアムプラン',
    monthly: 120000, cost: 38000,
    timeline: [
      { id: 'C03', period: '2026/09〜2027/08', status: 'current' },
      { id: 'C02', period: '2025/09〜2026/08', status: 'ended' },
      { id: 'C01', period: '2024/09〜2025/08', status: 'ended' },
      { id: '申込', period: '2024/09/01 申込書受付（初回）', status: 'origin' }
    ]
  },
  '20260601001C01': {
    company: 'サブスク商事', plan: 'スタンダードプラン',
    monthly: 48000, cost: 15000,
    timeline: [
      { id: 'C01', period: '2026/07〜2027/06', status: 'current' },
      { id: '申込', period: '2026/06/01 申込書受付（初回）', status: 'origin' }
    ]
  },
  '20251101001C02': {
    company: 'NTT東日本（埼玉）', plan: 'ライトプラン',
    monthly: 18000, cost: 6000,
    timeline: [
      { id: 'C02', period: '2026/11〜2027/10', status: 'current' },
      { id: 'C01', period: '2025/11〜2026/10', status: 'ended' },
      { id: '申込', period: '2025/11/01 申込書受付（初回）', status: 'origin' }
    ]
  },
  '20260614001C01': {
    company: 'NTT東日本（名古屋）', plan: 'プレミアムプラン',
    monthly: 120000, cost: 38000,
    timeline: [
      { id: 'C01', period: '2026/07〜2027/06（課金前）', status: 'current' },
      { id: '申込', period: '2026/06/14 申込書受付（初回）', status: 'origin' }
    ]
  },
  '20260614002C01': {
    company: 'オムロンSS', plan: 'LTE絶縁監視サービス',
    monthly: 600, cost: 200,
    timeline: [
      { id: 'C01', period: '2025/08〜2026/07', status: 'current' },
      { id: '申込', period: '2026/06/14 申込書受付（初回）', status: 'origin' }
    ]
  }
};

const PRODUCT_MASTER = [
  { code: 'OSSAZ100A2_O_CP', name: '絶縁監視装置 AZ100 標準セット', price: 48700 },
  { code: 'OSSVREFCBLA', name: '位相設定用ケーブル 4m', price: 13000 },
  { code: 'OSSPWRCBLC', name: '電源ケーブル 1.5m', price: 1000 },
  { code: 'OSSLTEEXT', name: 'LTEモジュール拡張キット', price: 25000 },
  { code: 'OSSCUR100A', name: '電流センサー 100A', price: 8000 },
  { code: 'OSSVOL200V', name: '電圧センサー 200V', price: 9500 },
  { code: 'PRD-001', name: 'LANケーブル Cat6', price: 1200 },
  { code: 'PRD-002', name: 'M2Mセット 1式', price: 98000 },
  { code: 'PRD-099', name: '固定ネジセット M3×10', price: 3800 }
];

function updateStep4Products() {
  const rows = document.querySelectorAll('.step4-prd-row');
  let total = 0;
  rows.forEach(row => {
    const qtyInput = row.querySelector('.prd-qty');
    const priceInput = row.querySelector('.prd-price');
    const subEl = row.querySelector('.prd-sub');
    const nameInput = row.querySelector('.prd-name');
    
    const qty = parseInt(qtyInput.value) || 0;
    const price = parseInt(priceInput.value) || 0;
    const sub = qty * price;
    total += sub;
    
    if (subEl) subEl.textContent = '¥' + sub.toLocaleString();
    
    if (qty === 0) {
      row.style.backgroundColor = '#F9F9F9';
      row.style.color = 'var(--text-muted)';
      if (nameInput) nameInput.style.color = 'var(--text-muted)';
      if (priceInput) priceInput.style.color = 'var(--text-muted)';
    } else {
      row.style.backgroundColor = '#ffffff';
      row.style.color = '#000000';
      if (nameInput) nameInput.style.color = '#000000';
      if (priceInput) priceInput.style.color = '#000000';
    }
  });
  
  const sumEl = document.getElementById('step4-prd-total');
  if (sumEl) sumEl.textContent = '¥' + total.toLocaleString();
}

// ===== ナビゲーション =====
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));

  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  const navItem = document.querySelector(`[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');
}

// サイドバーメニュー初期化
document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
  item.addEventListener('click', () => {
    navigate(item.dataset.page);
    if (item.dataset.page === 'companies') {
      companyCurrentPage = 1;
      loadCompanies();
      applyCompanyFilter();
    } else if (item.dataset.page === 'contacts') {
      loadContacts().then(() => {
        initContactFilter();
        applyContactFilter();
      });
    } else if (item.dataset.page === 'agencies') {
      renderAgencyTable();
    } else if (item.dataset.page === 'products') {
      renderProductTable();
    } else if (item.dataset.page === 'orders') {
      initOrderFilter();
      applyOrderFilter();
    } else if (item.dataset.page === 'temp-products') {
      renderTempProductTable();
    }
  });
});

// 初回ロード時の初期化
document.addEventListener('DOMContentLoaded', () => {
  applyCompanyFilter();
  initContactFilter();
  applyContactFilter();
  renderAgencyTable();
  renderProductTable();
  renderTempProductTable();
  buildSalesADataByKey();
  renderSalesATable();
  initOrderFilter();
  applyOrderFilter();
});

// ===== 企業管理：Supabaseデータ =====
let companiesData = [];

async function loadCompanies() {
  const sb = window._sb;
  if (!sb) return;

  // companies テーブルから全件取得（実カラム名に合わせる）
  const { data: companies, error: cErr } = await sb
    .from('companies')
    .select('id, company_name, company_name_kana, phone, fax, postal_code, address');
  if (cErr) { console.error('companies取得エラー:', cErr); return; }

  // branches テーブルから集計
  const { data: branches, error: bErr } = await sb
    .from('branches')
    .select('id, company_id');
  if (bErr) { console.error('branches取得エラー:', bErr); return; }

  // contacts テーブルから集計
  const { data: contacts, error: ctErr } = await sb
    .from('contacts')
    .select('id, company_id');
  if (ctErr) { console.error('contacts取得エラー:', ctErr); return; }

  // 企業ごとに件数を集計してマージ（表示用カラム名に変換）
  companiesData = companies.map(c => {
    const axisIdCount = branches.filter(b => b.company_id === c.id).length;
    const contactCount = contacts ? contacts.filter(ct => ct.company_id === c.id).length : 0;
    return {
      id:           c.id,
      name:         c.company_name,
      furigana:     c.company_name_kana,
      tel:          c.phone,
      fax:          c.fax,
      zip:          c.postal_code,
      address:      c.address,
      axisIdCount,
      contactCount,
    };
  });

  // 読み込み完了後に画面を更新
  applyCompanyFilter();
}

// ===== 企業管理：ページネーション変数 =====
let companyCurrentPage = 1;
const COMPANY_PAGE_SIZE = 20;
let companyFilteredData = [];

function sortCompanies(data) {
  return [...data].sort((a, b) => b.axisIdCount - a.axisIdCount);
}

function renderCompanyTable(data) {
  const tbody = document.querySelector('#company-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.forEach(company => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-700">${company.name}</td>
      <td>${company.furigana}</td>
      <td>${company.tel}</td>
      <td>${company.fax || '—'}</td>
      <td>${company.zip}</td>
      <td>${company.address}</td>
      <td>
        <span onclick="jumpToAxisList('${company.name}')" style="color:var(--accent); cursor:pointer; text-decoration:underline;">
          ${company.axisIdCount}件
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="goToContacts('${company.name}')">
          <i class="ti ti-users"></i> ${company.contactCount}名
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function jumpToAxisList(companyName) {
  navigate('orders');
  initOrderFilter();

  const subtitle = document.getElementById('orders-subtitle');
  const clearBtn = document.getElementById('orders-clear-filter');
  if (subtitle) subtitle.textContent = companyName + ' の案件（アクシスID）一覧';
  if (clearBtn) clearBtn.style.display = 'inline-flex';

  const companyFilter = document.getElementById('order-company-filter');
  if (companyFilter) companyFilter.value = companyName;
  applyOrderFilter();
}

function renderCompanyPagination() {
  const infoEl = document.getElementById('company-pagination-info');
  const btnsEl = document.getElementById('company-pagination-buttons');
  if (!infoEl || !btnsEl) return;

  const total = companyFilteredData.length;
  const totalPages = Math.ceil(total / COMPANY_PAGE_SIZE) || 1;
  const start = (companyCurrentPage - 1) * COMPANY_PAGE_SIZE + 1;
  const end = Math.min(companyCurrentPage * COMPANY_PAGE_SIZE, total);

  if (total === 0) {
    infoEl.textContent = '該当する企業が見つかりません';
  } else {
    infoEl.textContent = `${total}件中 ${start}〜${end}件を表示`;
  }

  btnsEl.innerHTML = '';
  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.textContent = '前へ';
  prevBtn.disabled = (companyCurrentPage <= 1);
  prevBtn.onclick = () => { if (companyCurrentPage > 1) { companyCurrentPage--; updateCompanyView(); } };
  btnsEl.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const numBtn = document.createElement('button');
    numBtn.className = `page-btn ${i === companyCurrentPage ? 'active' : ''}`;
    numBtn.textContent = i;
    numBtn.onclick = () => { companyCurrentPage = i; updateCompanyView(); };
    btnsEl.appendChild(numBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.textContent = '次へ';
  nextBtn.disabled = (companyCurrentPage >= totalPages);
  nextBtn.onclick = () => { if (companyCurrentPage < totalPages) { companyCurrentPage++; updateCompanyView(); } };
  btnsEl.appendChild(nextBtn);
}

function updateCompanyView() {
  const sorted = sortCompanies(companyFilteredData);
  const startIndex = (companyCurrentPage - 1) * COMPANY_PAGE_SIZE;
  const paginated = sorted.slice(startIndex, startIndex + COMPANY_PAGE_SIZE);
  renderCompanyTable(paginated);
  renderCompanyPagination();
}

function applyCompanyFilter() {
  const qEl = document.getElementById('company-search');
  const q = qEl ? qEl.value.trim().toLowerCase() : '';
  companyFilteredData = companiesData.filter(c => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.furigana.toLowerCase().includes(q) ||
      c.tel.includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.zip.includes(q)
    );
  });
  companyCurrentPage = 1;
  updateCompanyView();
}

// =============================
// Phase 4-② 担当者データ Supabase取得
// =============================
window.contactsData = [];

async function loadContacts() {
  const sb = window._sb;
  if (!sb) {
    console.error('Supabaseクライアントが未初期化です');
    return;
  }

  const { data, error } = await sb
    .from('contacts')
    .select(`
      id,
      company_id,
      branch_id,
      last_name,
      first_name,
      last_name_kana,
      first_name_kana,
      email,
      phone,
      role,
      is_main,
      notes,
      companies ( name ),
      branches ( name )
    `)
    .order('last_name', { ascending: true });

  if (error) {
    console.error('担当者データの取得に失敗しました:', error);
    return;
  }

  // app.js 内の他の関数から参照できるようにグローバルへ保存
  window.contactsData = data.map(c => ({
    id:           c.id,
    last_name:    c.last_name,
    first_name:   c.first_name,
    last_name_kana: c.last_name_kana,
    first_name_kana: c.first_name_kana,
    // 画面表示用の結合フィールド
    name:         `${c.last_name ?? ''} ${c.first_name ?? ''}`.trim(),
    furigana:     `${c.last_name_kana ?? ''} ${c.first_name_kana ?? ''}`.trim(),
    companyName:  c.companies?.name ?? '—',
    branchName:   c.branches?.name  ?? '—',
    email:        c.email  ?? '—',
    phone:        c.phone  ?? '—',
    tel:          c.phone  ?? '—',
    fax:          '—',
    role:         c.role   ?? '',
    department:   c.role   ?? '—',
    position:     c.is_main ? 'メイン' : '',
    is_main:      c.is_main ?? false,
    notes:        c.notes  ?? '',
    company_id:   c.company_id,
    branch_id:    c.branch_id,
    axisIdCount:  0,
  }));

  console.log(`担当者データ取得完了: ${window.contactsData.length}件`);
}

function renderContactTable(data) {
  const list = data || window.contactsData || [];
  const tbody = document.querySelector('#contact-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  list.forEach(contact => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${contact.name}</td>
      <td>${contact.furigana}</td>
      <td>${contact.companyName}</td>
      <td>${contact.department}</td>
      <td>${contact.position}</td>
      <td>${contact.tel}</td>
      <td>${contact.fax}</td>
      <td><a href="mailto:${contact.email}" style="color:#2563eb;">${contact.email}</a></td>
      <td>
        <span onclick="jumpToAxisListFromContact('${contact.name}')" style="color:#2563eb;cursor:pointer;text-decoration:underline;">
          ${contact.axisIdCount}件
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function jumpToAxisListFromContact(contactName) {
  const c = (window.contactsData || []).find(x => x.name === contactName);
  const companyName = c ? c.companyName : '';
  if (companyName) {
    jumpToAxisList(companyName);
  } else {
    navigate('orders');
    initOrderFilter();
    const searchInput = document.getElementById('order-search-input');
    if (searchInput) searchInput.value = contactName;
    applyOrderFilter();
  }
}

// ===== 案件管理（アクシスID）一覧：モックデータ＆処理 =====
const ordersData = [
  // === オムロンSS株式会社 9件 ===
  {
    pid: '20260614002',
    company: 'オムロンSS株式会社',
    branch: '東京本社',
    contact: '山田 健太',
    date: '2026/06/14',
    types: ['A', 'C'],
    branchCountText: '2件',
    children: [
      { cid: '20260614002A01', tag: 'a', desc: '機器販売　絶縁監視装置AZ100 3品 / ¥62,700', target: 'sales-a' },
      { cid: '20260614002C01', tag: 'c', desc: 'サブスク　LTE絶縁監視サービス ¥600/月', target: 'sales-c' }
    ]
  },
  {
    pid: '20260612001',
    company: 'オムロンSS株式会社',
    branch: '東京本社',
    contact: '佐藤 一郎',
    date: '2026/06/12',
    types: ['A'],
    branchCountText: '1件',
    children: [
      { cid: '20260612001A01', tag: 'a', desc: '機器販売　太陽光センサーBOX 5台 / ¥150,000', target: 'sales-a' }
    ]
  },
  {
    pid: '20260608003',
    company: 'オムロンSS株式会社',
    branch: '関西支店',
    contact: '田中 美咲',
    date: '2026/06/08',
    types: ['B', 'C'],
    branchCountText: '2件',
    children: [
      { cid: '20260608003B01', tag: 'b', desc: '工事　工場内通信配線工事 / ¥450,000', target: 'sales-b' },
      { cid: '20260608003C01', tag: 'c', desc: 'サブスク　クラウド稼働監視パック ¥12,000/月', target: 'sales-c' }
    ]
  },
  {
    pid: '20260528001',
    company: 'オムロンSS株式会社',
    branch: '名古屋営業所',
    contact: '山田 健太',
    date: '2026/05/28',
    types: ['A', 'B'],
    branchCountText: '2件',
    children: [
      { cid: '20260528001A01', tag: 'a', desc: '機器販売　電力モニタKM50 10台 / ¥280,000', target: 'sales-a' },
      { cid: '20260528001B01', tag: 'b', desc: '工事　盤内取付工事 / ¥180,000', target: 'sales-b' }
    ]
  },
  {
    pid: '20260515002',
    company: 'オムロンSS株式会社',
    branch: '東京本社',
    contact: '佐藤 一郎',
    date: '2026/05/15',
    types: ['C'],
    branchCountText: '1件',
    children: [
      { cid: '20260515002C01', tag: 'c', desc: 'サブスク　エネルギー分析AIサービス ¥30,000/月', target: 'sales-c' }
    ]
  },
  {
    pid: '20260420001',
    company: 'オムロンSS株式会社',
    branch: '九州支店',
    contact: '田中 美咲',
    date: '2026/04/20',
    types: ['A'],
    branchCountText: '1件',
    children: [
      { cid: '20260420001A01', tag: 'a', desc: '機器販売　環境センサーゲートウェイ 2台 / ¥90,000', target: 'sales-a' }
    ]
  },
  {
    pid: '20260405004',
    company: 'オムロンSS株式会社',
    branch: '東京本社',
    contact: '山田 健太',
    date: '2026/04/05',
    types: ['B'],
    branchCountText: '1件',
    children: [
      { cid: '20260405004B01', tag: 'b', desc: '工事　EMSシステム導入設定工事 / ¥600,000', target: 'sales-b' }
    ]
  },
  {
    pid: '20260318002',
    company: 'オムロンSS株式会社',
    branch: '東北支店',
    contact: '佐藤 一郎',
    date: '2026/03/18',
    types: ['A', 'C'],
    branchCountText: '2件',
    children: [
      { cid: '20260318002A01', tag: 'a', desc: '機器販売　通信ユニット 4台 / ¥80,000', target: 'sales-a' },
      { cid: '20260318002C01', tag: 'c', desc: 'サブスク　リモートメンテパック ¥8,000/月', target: 'sales-c' }
    ]
  },
  {
    pid: '20260210001',
    company: 'オムロンSS株式会社',
    branch: '東京本社',
    contact: '山田 健太',
    date: '2026/02/10',
    types: ['C'],
    branchCountText: '1件',
    children: [
      { cid: '20260210001C01', tag: 'c', desc: 'サブスク　設備予知保全プラットフォーム ¥50,000/月', target: 'sales-c' }
    ]
  },

  // === 他企業のデータ（既存内容の維持・拡張） ===
  {
    pid: '20260614001',
    company: 'NTT東日本株式会社',
    branch: '名古屋支店',
    contact: '斎藤 健一',
    date: '2026/06/14',
    types: ['A', 'B', 'C'],
    branchCountText: '3件',
    children: [
      { cid: '20260614001A01', tag: 'a', desc: '機器販売　M2Mセット 2品 / ¥98,000', target: 'sales-a' },
      { cid: '20260614001B01', tag: 'b', desc: '工事　名古屋 設備工事 ¥800,000', target: 'sales-b' },
      { cid: '20260614001C01', tag: 'c', desc: 'サブスク　プレミアムプラン ¥120,000/月', target: 'sales-c' }
    ]
  },
  {
    pid: '20260610001',
    company: 'テスト工業株式会社',
    branch: '本社',
    contact: '鈴木 太郎',
    date: '2026/06/10',
    types: ['A', 'B'],
    branchCountText: '3件',
    children: [
      { cid: '20260610001A01', tag: 'a', desc: '機器販売　3品 / ¥730,000', target: 'sales-a' },
      { cid: '20260610001A02', tag: 'a', desc: '機器販売（追加発注）　1品 / ¥240,000', target: 'sales-a' },
      { cid: '20260610001B01', tag: 'b', desc: '工事　大阪 更新工事 ¥1,200,000', target: 'sales-b' }
    ]
  },
  {
    pid: '20260601001',
    company: 'サブスク商事株式会社',
    branch: '本社',
    contact: '田中 花子',
    date: '2026/06/01',
    types: ['C'],
    branchCountText: '1件',
    children: [
      { cid: '20260601001C01', tag: 'c', desc: 'サブスク　スタンダードプラン ¥48,000/月', target: 'sales-c' }
    ]
  },
  {
    pid: '20240901001',
    company: 'NTT東日本株式会社',
    branch: '名古屋支店',
    contact: '斎藤 健一',
    date: '2024/09/01',
    types: ['C'],
    branchCountText: 'C×3件',
    children: [
      { cid: '20240901001C01', tag: 'c', desc: 'サブスク（終了）　プレミアムプラン 2024/09〜2025/08', target: null },
      { cid: '20240901001C02', tag: 'c', desc: 'サブスク（終了）　プレミアムプラン 2025/09〜2026/08', target: null },
      { cid: '20240901001C03', tag: 'c', desc: 'サブスク（現行）　プレミアムプラン 2026/09〜2027/08', target: 'sales-c' }
    ]
  }
];

function renderOrderTable(data) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  data.forEach(order => {
    // 親行
    const trParent = document.createElement('tr');
    trParent.className = 'parent-row clickable';
    trParent.setAttribute('onclick', `toggleAccordion('order-${order.pid}')`);

    const typesHtml = order.types.map(t => `<span class="tag tag-${t.toLowerCase()}" style="margin-right:3px;">${t}</span>`).join('');
    const companyBranch = order.company + (order.branch ? '／' + order.branch : '');

    trParent.innerHTML = `
      <td><span class="pid">${order.pid}</span></td>
      <td>${companyBranch}</td>
      <td>${order.contact}</td>
      <td>${order.date}</td>
      <td>${typesHtml}</td>
      <td>${order.branchCountText}</td>
      <td><button class="btn btn-sm btn-secondary" onclick="event.stopPropagation()"><i class="ti ti-eye"></i> 詳細</button></td>
    `;
    tbody.appendChild(trParent);

    // 子行
    if (order.children && order.children.length > 0) {
      order.children.forEach((child, i) => {
        const trChild = document.createElement('tr');
        trChild.className = 'accordion-child child-row';
        trChild.id = `acc-${order.pid}-${i+1}`;
        
        const btnHtml = child.target ? `<button class="btn btn-sm btn-secondary" style="margin-left:12px;" onclick="navigate('${child.target}')">→ ${child.target === 'sales-a' ? '機器販売管理' : child.target === 'sales-b' ? '工事管理' : 'サブスク管理'}</button>` : '';
        
        trChild.innerHTML = `
          <td colspan="7">
            <span class="cid-${child.tag}">${child.cid}</span>　${child.desc}
            ${btnHtml}
          </td>
        `;
        tbody.appendChild(trChild);
      });
    }
  });
}

let orderFilterInitialized = false;
function initOrderFilter() {
  const select = document.getElementById('order-company-filter');
  if (!select || orderFilterInitialized) return;
  const companies = [...new Set(ordersData.map(o => o.company))];
  companies.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
  orderFilterInitialized = true;
}

function applyOrderFilter() {
  const q = document.getElementById('order-search-input')?.value.trim().toLowerCase() || '';
  const companyFilter = document.getElementById('order-company-filter')?.value || '';

  const filtered = ordersData.filter(o => {
    const matchQ = o.pid.includes(q) || o.company.toLowerCase().includes(q) || o.contact.toLowerCase().includes(q) || (o.children && o.children.some(c => c.cid.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)));
    const matchCompany = companyFilter === '' || o.company === companyFilter;
    return matchQ && matchCompany;
  });

  renderOrderTable(filtered);
}

function clearOrderFilter() {
  const searchInput = document.getElementById('order-search-input');
  const companyFilter = document.getElementById('order-company-filter');
  if (searchInput) searchInput.value = '';
  if (companyFilter) companyFilter.value = '';

  const subtitle = document.getElementById('orders-subtitle');
  const clearBtn = document.getElementById('orders-clear-filter');
  if (subtitle) subtitle.textContent = '全申込書・枝番の管理';
  if (clearBtn) clearBtn.style.display = 'none';

  applyOrderFilter();
}

let contactFilterInitialized = false;
function initContactFilter() {
  if (contactFilterInitialized) return;
  contactFilterInitialized = true;
}

function applyContactFilter() {
  const keyword = document.getElementById('contact-search-input')?.value || '';
  const list = window.contactsData || [];
  const filtered = list.filter(c => {
    const matchKeyword =
      (c.name || '').includes(keyword) ||
      (c.furigana || '').includes(keyword) ||
      (c.companyName || '').includes(keyword) ||
      (c.tel || c.phone || '').includes(keyword) ||
      (c.email || '').includes(keyword);
    return matchKeyword;
  });
  renderContactTable(filtered);
}

function clearContactFilter() {
  const searchInput = document.getElementById('contact-search-input');
  if (searchInput) searchInput.value = '';

  const subtitle = document.getElementById('contacts-subtitle');
  const clearBtn = document.getElementById('contacts-clear-filter');
  if (subtitle) subtitle.textContent = '全担当者一覧';
  if (clearBtn) clearBtn.style.display = 'none';

  applyContactFilter();
}

function goToContacts(companyName) {
  navigate('contacts');
  loadContacts().then(() => {
    initContactFilter();

    const subtitle = document.getElementById('contacts-subtitle');
    const clearBtn = document.getElementById('contacts-clear-filter');
    if (subtitle) subtitle.textContent = companyName + ' の担当者';
    if (clearBtn) clearBtn.style.display = 'inline-flex';

    const searchInput = document.getElementById('contact-search-input');
    if (searchInput) searchInput.value = companyName;
    applyContactFilter();
  });
}

// ===== 代理店管理 =====
async function loadAgencies() {
  const { data, error } = await window._sb
    .from('agencies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('agencies取得エラー:', error);
    return [];
  }
  return data || [];
}

async function renderAgencyTable() {
  const tbody = document.querySelector('#agency-table tbody');
  if (!tbody) return;
  const agencies = await loadAgencies();
  const rows = agencies.map(a => {
    return `<tr>
      <td>${a.agency_name || ''}</td>
      <td>${a.agency_name_kana || ''}</td>
      <td>${a.postal_code || ''}</td>
      <td>${a.address || ''}</td>
      <td>${a.phone || ''}</td>
      <td>${a.notes || ''}</td>
    </tr>`;
  });
  tbody.innerHTML = rows.join('');
}

// ===== 代理店管理：企業検索（インクリメンタルサーチ） =====
function searchAgencyCompany(inputEl) {
  const keyword = inputEl.value || '';
  const suggestions = inputEl.nextElementSibling;
  if (!suggestions) return;

  if (keyword.trim() === '') {
    suggestions.style.display = 'none';
    return;
  }

  const matched = companiesData.filter(c =>
    c.name.includes(keyword) || c.furigana.includes(keyword)
  );

  suggestions.innerHTML = '';
  if (matched.length === 0) {
    suggestions.style.display = 'none';
    return;
  }

  matched.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.name}（${c.furigana}）`;
    li.style.cssText = 'padding:8px 12px;cursor:pointer;font-size:13px;border-bottom:1px solid #f3f4f6;';
    li.onmouseover = () => li.style.background = '#f0f4ff';
    li.onmouseout = () => li.style.background = '#fff';
    li.onclick = () => {
      inputEl.value = c.name;
      inputEl.dataset.value = c.name;
      suggestions.style.display = 'none';
    };
    suggestions.appendChild(li);
  });
  suggestions.style.display = 'block';
}

function addAgencyCompanyField() {
  const container = document.getElementById('agency-company-list');
  if (!container) return;
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:6px;align-items:flex-start;';
  div.innerHTML = `
    <div style="position:relative;flex:1;">
      <input
        type="text"
        class="agency-company-input"
        placeholder="企業名またはフリガナで検索..."
        oninput="searchAgencyCompany(this)"
        autocomplete="off"
        style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box;"
      />
      <ul class="agency-company-suggestions"
        style="display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #d1d5db;border-radius:6px;max-height:180px;overflow-y:auto;z-index:1000;margin:0;padding:0;list-style:none;box-shadow:0 4px 8px rgba(0,0,0,0.1);">
      </ul>
    </div>
    <button type="button" onclick="this.closest('div').parentElement.remove()"
      style="padding:6px 10px;background:#ef4444;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;white-space:nowrap;">
      ✕
    </button>
  `;
  container.appendChild(div);
}

document.addEventListener('click', function(e) {
  document.querySelectorAll('.agency-company-suggestions').forEach(list => {
    if (!list.previousElementSibling?.contains(e.target) && !list.contains(e.target)) {
      list.style.display = 'none';
    }
  });
});

function addAxisIdField() {
  const container = document.getElementById('agency-axis-id-list');
  if (!container) return;
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:6px;align-items:center;';
  div.innerHTML = `
    <input type="text" class="agency-axis-id-input" placeholder="例：AX-0001" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;width:200px;" />
    <button type="button" onclick="this.parentElement.remove()" style="padding:6px 10px;background:#ef4444;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;">✕</button>
  `;
  container.appendChild(div);
}

function openAgencyModal() {
  document.getElementById('agency-modal-title').textContent = '代理店 新規登録';
  document.getElementById('agency-edit-id').value = '';
  document.getElementById('agency-name').value = '';
  document.getElementById('agency-furigana').value = '';
  document.getElementById('agency-tel').value = '';
  document.getElementById('agency-email').value = '';
  document.getElementById('agency-address').value = '';

  // 企業入力欄をリセット
  const companyContainer = document.getElementById('agency-company-list');
  if (companyContainer) {
    companyContainer.innerHTML = `
      <div style="display:flex;gap:6px;align-items:flex-start;">
        <div style="position:relative;flex:1;">
          <input
            type="text"
            class="agency-company-input"
            placeholder="企業名またはフリガナで検索..."
            oninput="searchAgencyCompany(this)"
            autocomplete="off"
            style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box;"
          />
          <ul class="agency-company-suggestions"
            style="display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #d1d5db;border-radius:6px;max-height:180px;overflow-y:auto;z-index:1000;margin:0;padding:0;list-style:none;box-shadow:0 4px 8px rgba(0,0,0,0.1);">
          </ul>
        </div>
        <button type="button" onclick="addAgencyCompanyField()"
          style="padding:6px 12px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;white-space:nowrap;">
          ＋追加
        </button>
      </div>
    `;
  }

  const container = document.getElementById('agency-axis-id-list');
  if (container) {
    container.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;">
        <input type="text" class="agency-axis-id-input" placeholder="例：AX-0001" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;width:200px;" />
        <button type="button" onclick="addAxisIdField()" style="padding:6px 12px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;">＋追加</button>
      </div>
    `;
  }
  openModal('agency-modal');
}

function openAgencyEditModal(agencyId) {
  const agency = agenciesData.find(a => a.id === agencyId);
  if (!agency) return;

  document.getElementById('agency-modal-title').textContent = '代理店 編集';
  document.getElementById('agency-edit-id').value = agency.id;
  document.getElementById('agency-name').value = agency.name || '';
  document.getElementById('agency-furigana').value = agency.furigana || '';
  document.getElementById('agency-tel').value = agency.tel || '';
  document.getElementById('agency-email').value = agency.email || '';
  document.getElementById('agency-address').value = agency.address || '';

  // 企業入力欄をリセットして既存データを再生成
  const companyContainer = document.getElementById('agency-company-list');
  if (companyContainer) {
    companyContainer.innerHTML = '';
    const companies = agency.linkedCompanies && agency.linkedCompanies.length > 0
      ? agency.linkedCompanies
      : [''];
    companies.forEach((companyName, index) => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;gap:6px;align-items:flex-start;';
      div.innerHTML = `
        <div style="position:relative;flex:1;">
          <input
            type="text"
            class="agency-company-input"
            value="${companyName}"
            placeholder="企業名またはフリガナで検索..."
            oninput="searchAgencyCompany(this)"
            autocomplete="off"
            style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;box-sizing:border-box;"
          />
          <ul class="agency-company-suggestions"
            style="display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #d1d5db;border-radius:6px;max-height:180px;overflow-y:auto;z-index:1000;margin:0;padding:0;list-style:none;box-shadow:0 4px 8px rgba(0,0,0,0.1);">
          </ul>
        </div>
        ${index === 0
          ? `<button type="button" onclick="addAgencyCompanyField()"
               style="padding:6px 12px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;white-space:nowrap;">＋追加</button>`
          : `<button type="button" onclick="this.closest('div').parentElement.remove()"
               style="padding:6px 10px;background:#ef4444;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;white-space:nowrap;">✕</button>`
        }
      `;
      companyContainer.appendChild(div);
    });
  }

  const container = document.getElementById('agency-axis-id-list');
  if (container) {
    container.innerHTML = '';
    const ids = agency.linkedAxisIds && agency.linkedAxisIds.length > 0 ? agency.linkedAxisIds : [''];
    ids.forEach((axisId, index) => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;gap:6px;align-items:center;';
      div.innerHTML = `
        <input type="text" class="agency-axis-id-input" value="${axisId}" placeholder="例：AX-0001" style="padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;width:200px;" />
        ${index === 0
          ? `<button type="button" onclick="addAxisIdField()" style="padding:6px 12px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;">＋追加</button>`
          : `<button type="button" onclick="this.parentElement.remove()" style="padding:6px 10px;background:#ef4444;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;">✕</button>`
        }
      `;
      container.appendChild(div);
    });
  }
  openModal('agency-modal');
}

function saveAgency() {
  const editId = document.getElementById('agency-edit-id').value;
  const name = document.getElementById('agency-name').value.trim();
  if (!name) { alert('代理店名を入力してください'); return; }
  const furigana = document.getElementById('agency-furigana').value.trim();
  const tel = document.getElementById('agency-tel').value.trim();
  const email = document.getElementById('agency-email').value.trim();
  const address = document.getElementById('agency-address').value.trim();
  // 複数企業名を配列で取得
  const linkedCompanies = Array.from(
    document.querySelectorAll('.agency-company-input')
  ).map(input => input.value.trim()).filter(v => v !== '');
  const linkedAxisIds = Array.from(document.querySelectorAll('.agency-axis-id-input')).map(input => input.value.trim()).filter(v => v !== '');

  if (editId) {
    const id = parseInt(editId, 10);
    const index = agenciesData.findIndex(a => a.id === id);
    if (index !== -1) agenciesData[index] = { id, name, furigana, tel, email, address, linkedCompanies, linkedAxisIds };
  } else {
    const newId = agenciesData.length > 0 ? Math.max(...agenciesData.map(a => a.id)) + 1 : 1;
    agenciesData.push({ id: newId, name, furigana, tel, email, address, linkedCompanies, linkedAxisIds });
  }
  closeModal('agency-modal');
  renderAgencyTable();
}

function deleteAgency(id) {
  if (confirm('この代理店を削除してもよろしいですか？')) {
    agenciesData = agenciesData.filter(a => a.id !== id);
    renderAgencyTable();
  }
}

// ===== 価格履歴（商品マスタ画面ボタン） =====
function openPriceHistory(code) {
  const data = priceHistoryData[code] || [];
  const title = document.getElementById('price-history-title');
  title.textContent = '価格履歴 — ' + code;

  let rows = data.map(d => `
    <tr>
      <td>${d.start}</td>
      <td>${d.end}</td>
      <td>${d.sell}</td>
      <td>${d.cost}</td>
      <td><span class="badge badge-green">${d.margin}</span></td>
      <td>${d.reason}</td>
    </tr>`).join('');

  document.getElementById('price-history-body').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>適用開始日</th><th>適用終了日</th><th>売価</th><th>原価</th><th>粗利率</th><th>変更理由</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  openModal('price-history-modal');
}

// ===== 商品マスタ =====
async function loadProducts() {
  const { data, error } = await window._sb
    .from('products')
    .select('*')
    .order('product_code', { ascending: true });

  if (error) {
    console.error('products取得エラー:', error);
    return [];
  }
  return data || [];
}

async function renderProductTable() {
  const tbody = document.querySelector('#product-tbody');
  if (!tbody) return;
  const products = await loadProducts();
  tbody.innerHTML = '';
  if (!products || products.length === 0) return;
  const rows = products.map(p => {
    return `<tr>
      <td>${p.product_code || ''}</td>
      <td>${p.product_name || ''}</td>
      <td>${p.unit || ''}</td>
      <td>${p.unit_price != null ? p.unit_price.toLocaleString() : ''}</td>
      <td>${p.cost_price != null ? p.cost_price.toLocaleString() : ''}</td>
      <td>${p.category || ''}</td>
      <td>${p.is_active ? '有効' : '無効'}</td>
      <td>${p.notes || ''}</td>
    </tr>`;
  });
  tbody.innerHTML = rows.join('');
}

// ===== 商品マスタ：編集モーダル =====
let editingProductId = null;

function openProductEditModal(productId) {
  const product = productsData.find(p => p.id === productId);
  if (!product) return;
  editingProductId = productId;

  document.getElementById('edit-product-code').value  = product.code  || '';
  document.getElementById('edit-product-name').value  = product.name  || '';
  document.getElementById('edit-product-price').value = product.price || '';
  document.getElementById('edit-product-cost').value  = product.cost  || '';

  // 価格履歴の表示（編集履歴 + priceHistoryDataの旧データをマージ）
  const tbody = document.getElementById('product-price-history-body');
  tbody.innerHTML = '';
  const editHistory = product.priceHistory || [];
  const staticHistory = (priceHistoryData[product.code] || []).map(h => ({
    date: h.start, price: parseInt((h.sell || '0').replace(/[^0-9]/g, ''), 10),
    cost: parseInt((h.cost || '0').replace(/[^0-9]/g, ''), 10)
  }));
  const allHistory = [...editHistory, ...staticHistory];

  if (allHistory.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="padding:8px;text-align:center;color:#9ca3af;">履歴なし</td></tr>';
  } else {
    allHistory.forEach(h => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:6px 10px;border:1px solid #e5e7eb;">${h.date}</td>
        <td style="padding:6px 10px;border:1px solid #e5e7eb;text-align:right;">¥${Number(h.price).toLocaleString()}</td>
        <td style="padding:6px 10px;border:1px solid #e5e7eb;text-align:right;">¥${Number(h.cost).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('product-edit-modal').style.display = 'flex';
}

function closeProductEditModal() {
  document.getElementById('product-edit-modal').style.display = 'none';
  editingProductId = null;
}

function saveProductEdit() {
  const product = productsData.find(p => p.id === editingProductId);
  if (!product) return;

  const newPrice = parseInt(document.getElementById('edit-product-price').value) || 0;
  const newCost  = parseInt(document.getElementById('edit-product-cost').value)  || 0;

  // 価格変更時は旧価格を履歴に追加
  if (newPrice !== product.price || newCost !== product.cost) {
    if (!product.priceHistory) product.priceHistory = [];
    product.priceHistory.unshift({
      date:  new Date().toLocaleDateString('ja-JP'),
      price: product.price,
      cost:  product.cost
    });
  }

  product.name  = document.getElementById('edit-product-name').value;
  product.price = newPrice;
  product.cost  = newCost;

  closeProductEditModal();
  renderProductTable();
}

// ===== 臨時商品マスタ：モックデータ =====
let tempProductsData = [
  {
    id: 1,
    code: 'TEMP-001',
    name: '\u7279\u6b8a\u30bb\u30f3\u30b5\u30fc\u30e6\u30cb\u30c3\u30c8A',
    price: 85000,
    cost: 52000,
    unit: '\u500b',
    note: '\u901a\u5e38\u30e9\u30a4\u30f3\u30ca\u30c3\u30d7\u5916\u306e\u7279\u6ce8\u54c1',
    isChecked: false,
    checkedBy: null,
    checkedAt: null,
    priceHistory: []
  },
  {
    id: 2,
    code: 'TEMP-002',
    name: '\u30ab\u30b9\u30bf\u30e0\u5236\u5fa1\u30dc\u30fc\u30c9',
    price: 120000,
    cost: 78000,
    unit: '\u679a',
    note: '\u4e00\u6642\u7684\u306a\u4ee3\u66ff\u54c1\u3068\u3057\u3066\u4f7f\u7528',
    isChecked: true,
    checkedBy: '\u7ba1\u7406\u8005 \u592a\u90ce',
    checkedAt: '2026-05-10',
    priceHistory: []
  },
  {
    id: 3,
    code: 'TEMP-003',
    name: '\u8a66\u4f5c\u30e2\u30b8\u30e5\u30fc\u30ebX',
    price: 45000,
    cost: 30000,
    unit: '\u5f0f',
    note: '\u8a66\u9a13\u5c0e\u5165\u54c1',
    isChecked: false,
    checkedBy: null,
    checkedAt: null,
    priceHistory: []
  },
];

// ===== 臨時商品マスタ：テーブル描画 =====
function renderTempProductTable() {
  const tbody = document.querySelector('#temp-product-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  tempProductsData.forEach(product => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product.code}</td>
      <td>${product.name}</td>
      <td style="text-align:right;">\u00a5${product.price.toLocaleString()}</td>
      <td style="text-align:right;">\u00a5${product.cost.toLocaleString()}</td>
      <td style="text-align:center;">${product.unit}</td>
      <td style="color:#6b7280;font-size:12px;">${product.note || '\u2014'}</td>
      <td style="text-align:center;">
        <button class="btn-history"
          onclick="openTempProductEditModal(${product.id})"
          style="padding:4px 10px;border:1px solid #d1d5db;background:#fff;border-radius:4px;font-size:12px;cursor:pointer;">
          \u5c65\u6b74\u30fb\u7de8\u96c6
        </button>
      </td>
      <td style="text-align:center;">
        ${product.isChecked
          ? `<span style="color:#16a34a;font-weight:600;">\u2714 \u30c1\u30a7\u30c3\u30af\u6e08</span>
             <br><span style="font-size:11px;color:#6b7280;">${product.checkedBy}\uff08${product.checkedAt}\uff09</span>`
          : `<button onclick="checkTempProduct(${product.id})"
               style="padding:4px 12px;background:#f59e0b;color:#fff;border:none;border-radius:4px;font-size:12px;cursor:pointer;">
               \u30c1\u30a7\u30c3\u30af\u3059\u308b
             </button>`
        }
      </td>
      <td>
        <button class="btn-edit"
          onclick="openTempProductEditModal(${product.id})"
          style="padding:4px 10px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px;">
          \u7de8\u96c6
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== 臨時商品マスタ：管理者チェック =====
function checkTempProduct(productId) {
  if (!currentUser || currentUser.role !== 'admin') {
    alert('\u7ba1\u7406\u8005\u306e\u307f\u3053\u306e\u64cd\u4f5c\u3092\u884c\u3048\u307e\u3059\u3002');
    return;
  }
  const product = tempProductsData.find(p => p.id === productId);
  if (!product) return;

  const confirmed = confirm(`\u300c${product.name}\u300d\u3092\u4f7f\u7528\u6e08\u307f\u3068\u3057\u3066\u30c1\u30a7\u30c3\u30af\u3057\u307e\u3059\u304b\uff1f`);
  if (!confirmed) return;

  product.isChecked = true;
  product.checkedBy = currentUser.name || '\u7ba1\u7406\u8005';
  product.checkedAt = new Date().toLocaleDateString('ja-JP');
  renderTempProductTable();
}

// ===== 臨時商品マスタ：新規登録（スタブ） =====
function openNewTempProductModal() {
  const newId = tempProductsData.length > 0 ? Math.max(...tempProductsData.map(p => p.id)) + 1 : 1;
  const newCode = 'TEMP-' + String(newId).padStart(3, '0');
  tempProductsData.push({
    id: newId, code: newCode, name: '', price: 0, cost: 0,
    unit: '\u500b', note: '', isChecked: false, checkedBy: null, checkedAt: null, priceHistory: []
  });
  openTempProductEditModal(newId);
}

// ===== 臨時商品マスタ：編集モーダル開閉・保存 =====
let editingTempProductId = null;

function openTempProductEditModal(productId) {
  const product = tempProductsData.find(p => p.id === productId);
  if (!product) return;
  editingTempProductId = productId;

  document.getElementById('edit-temp-product-code').value  = product.code  || '';
  document.getElementById('edit-temp-product-name').value  = product.name  || '';
  document.getElementById('edit-temp-product-price').value = product.price || '';
  document.getElementById('edit-temp-product-cost').value  = product.cost  || '';
  document.getElementById('edit-temp-product-unit').value  = product.unit  || '';
  document.getElementById('edit-temp-product-note').value  = product.note  || '';

  const tbody = document.getElementById('temp-product-price-history-body');
  tbody.innerHTML = '';
  const history = product.priceHistory || [];
  if (history.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="padding:8px;text-align:center;color:#9ca3af;">\u5c65\u6b74\u306a\u3057</td></tr>';
  } else {
    history.forEach(h => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:6px 10px;border:1px solid #e5e7eb;">${h.date}</td>
        <td style="padding:6px 10px;border:1px solid #e5e7eb;text-align:right;">\u00a5${Number(h.price).toLocaleString()}</td>
        <td style="padding:6px 10px;border:1px solid #e5e7eb;text-align:right;">\u00a5${Number(h.cost).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('temp-product-edit-modal').style.display = 'flex';
}

function closeTempProductEditModal() {
  document.getElementById('temp-product-edit-modal').style.display = 'none';
  editingTempProductId = null;
}

function saveTempProductEdit() {
  const product = tempProductsData.find(p => p.id === editingTempProductId);
  if (!product) return;

  const newPrice = parseInt(document.getElementById('edit-temp-product-price').value) || 0;
  const newCost  = parseInt(document.getElementById('edit-temp-product-cost').value)  || 0;

  if (newPrice !== product.price || newCost !== product.cost) {
    if (!product.priceHistory) product.priceHistory = [];
    product.priceHistory.unshift({
      date:  new Date().toLocaleDateString('ja-JP'),
      price: product.price,
      cost:  product.cost
    });
  }

  product.name  = document.getElementById('edit-temp-product-name').value;
  product.price = newPrice;
  product.cost  = newCost;
  product.unit  = document.getElementById('edit-temp-product-unit').value;
  product.note  = document.getElementById('edit-temp-product-note').value;

  closeTempProductEditModal();
  renderTempProductTable();
}

// ===== 売価・原価マスタ =====
function renderPriceTable() {
  const code = document.getElementById('price-product-select').value;
  const wrap = document.getElementById('price-table-wrap');
  const tbody = document.getElementById('price-history-tbody');

  if (!code) { wrap.style.display = 'none'; return; }
  const data = priceHistoryData[code] || [];
  wrap.style.display = 'block';

  tbody.innerHTML = data.map(d => `
    <tr>
      <td>${d.start}</td>
      <td>${d.end}</td>
      <td>${d.sell}</td>
      <td>${d.cost}</td>
      <td><span class="badge badge-green">${d.margin}</span></td>
      <td>${d.reason}</td>
    </tr>`).join('');
}

// ===== ウィザード =====
let currentWizardStep = 1;
const totalSteps = 5;

function updateWizardUI() {
  for (let i = 1; i <= totalSteps; i++) {
    const stepEl = document.getElementById('wstep-' + i);
    const bodyEl = document.getElementById('wizard-step-' + i);
    if (!stepEl) continue;

    stepEl.classList.remove('active', 'completed');
    if (i < currentWizardStep) {
      stepEl.classList.add('completed');
      stepEl.querySelector('.wizard-step-num').innerHTML = '<i class="ti ti-check" style="font-size: 13px;"></i>';
    } else if (i === currentWizardStep) {
      stepEl.classList.add('active');
      stepEl.querySelector('.wizard-step-num').textContent = i;
    } else {
      stepEl.querySelector('.wizard-step-num').textContent = i;
    }

    if (bodyEl) {
      bodyEl.classList.toggle('active', i === currentWizardStep);
    }
  }
}

function wizardNext() {
  if (currentWizardStep < totalSteps) {
    currentWizardStep++;
    updateWizardUI();
  }
}

function wizardPrev() {
  if (currentWizardStep > 1) {
    currentWizardStep--;
    updateWizardUI();
  }
}

function resetWizard() {
  currentWizardStep = 1;
  // ステップ番号アイコンをリセット
  for (let i = 1; i <= totalSteps; i++) {
    const stepEl = document.getElementById('wstep-' + i);
    if (stepEl) stepEl.querySelector('.wizard-step-num').textContent = i;
  }
  // 候補選択リセット
  selectedCandidate = null;
  document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('step2-next').classList.add('btn-disabled');
  updateWizardUI();
}

// 受付タイプ選択
let fileUploaded = false;
let selectedType = 'pdf';

function selectType(type) {
  selectedType = type;
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('type-' + type).classList.add('selected');
  checkStep1Next();
}

function handleFileUpload() {
  if (selectedType !== 'pdf' && selectedType !== 'excel') return;
  fileUploaded = true;
  document.getElementById('file-dropzone').style.borderColor = 'var(--accent)';
  document.getElementById('file-dropzone').style.backgroundColor = '#EEF4FB';
  document.getElementById('file-dropzone').innerHTML = '<i class="ti ti-check" style="color:var(--accent);"></i><div style="font-size:14px;font-weight:600;margin-bottom:4px;color:var(--accent);">ファイルがアップロードされました</div>';
  document.getElementById('step1-form-container').style.display = 'block';
  validateStep1();
}

function validateStep1() {
  const reqs = document.querySelectorAll('.step1-req');
  let allFilled = true;
  reqs.forEach(req => {
    if (!req.value.trim()) allFilled = false;
  });
  const btn = document.getElementById('step1-next');
  if (fileUploaded && (selectedType === 'pdf' || selectedType === 'excel') && allFilled) {
    btn.classList.remove('btn-disabled');
  } else {
    btn.classList.add('btn-disabled');
  }
}

function checkStep1Next() {
  validateStep1();
}

function onOrdererInput() {
  validateStep1();
  const cb = document.getElementById('copy-orderer');
  if (cb && cb.checked) {
    copyOrdererToDelivery();
  }
}

function onCopyOrdererChange() {
  const cb = document.getElementById('copy-orderer');
  if (cb && cb.checked) {
    copyOrdererToDelivery();
  }
}

function copyOrdererToDelivery() {
  const getVal = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };

  setVal('s1-dlv-zip', getVal('s1-zip'));
  setVal('s1-dlv-address', getVal('s1-address'));
  setVal('s1-dlv-company', getVal('s1-company'));
  setVal('s1-dlv-dept', getVal('s1-dept'));
  setVal('s1-dlv-title', getVal('s1-title'));
  setVal('s1-dlv-name', getVal('s1-name'));
  setVal('s1-dlv-tel', getVal('s1-tel'));
  setVal('s1-dlv-fax', getVal('s1-mobile'));
}

function checkDlvZipCode() {
  const zip = document.getElementById('s1-dlv-zip').value;
  const res = document.getElementById('dlv-zip-result');
  if (zip && zip.length >= 7 && res) {
    res.textContent = '東京都港区芝公園...（モック検索結果）';
    res.style.color = 'var(--text-muted)';
  }
}

function checkZipCode() {
  const zip = document.getElementById('s1-zip').value;
  const res = document.getElementById('zip-result');
  if (zip.length >= 7) {
    res.textContent = '東京都港区芝公園...（モック検索結果）';
    res.style.color = 'var(--text-muted)';
  } else {
    res.textContent = '郵便番号を入力してください';
    res.style.color = 'red';
  }
}

// 企業候補選択
let selectedCandidate = null;
function selectCandidate(n) {
  selectedCandidate = n;
  document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('cand-' + n).classList.add('selected');
  document.getElementById('step2-next').classList.remove('btn-disabled');
}

let salesBCount = 0;
function addSalesBRow() {
  const container = document.getElementById('sales-b-container');
  if (salesBCount === 0) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.marginBottom = '16px';
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
        <input type="checkbox" id="include-b" checked style="width:16px;height:16px;cursor:pointer;">
        <label for="include-b" style="font-size:14px;font-weight:700;cursor:pointer;"><span class="tag tag-b">B 工事管理</span></label>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>工事名</th><th>数量</th><th>単価</th><th>小計</th><th>操作</th></tr>
          </thead>
          <tbody id="sales-b-tbody"></tbody>
        </table>
      </div>`;
    container.appendChild(card);
  }
  
  const tbody = document.getElementById('sales-b-tbody');
  const tr = document.createElement('tr');
  tr.id = 'sales-b-row-' + salesBCount;
  tr.innerHTML = `
    <td><input type="text" class="form-control" style="font-size: 13px;padding:4px;" placeholder="工事名を入力"></td>
    <td><input type="number" class="form-control" style="font-size: 13px;padding:4px;width:60px;" value="1" oninput="updateSalesBRow(${salesBCount})"></td>
    <td><input type="number" class="form-control" style="font-size: 13px;padding:4px;width:80px;" value="0" oninput="updateSalesBRow(${salesBCount})"></td>
    <td class="fw-700">¥0</td>
    <td><button class="btn btn-sm btn-danger" onclick="removeSalesBRow(${salesBCount})"><i class="ti ti-x"></i></button></td>
  `;
  tbody.appendChild(tr);
  salesBCount++;
}

function updateSalesBRow(idx) {
  const tr = document.getElementById('sales-b-row-' + idx);
  if (!tr) return;
  const qty = parseInt(tr.querySelectorAll('input[type="number"]')[0].value) || 0;
  const price = parseInt(tr.querySelectorAll('input[type="number"]')[1].value) || 0;
  const sub = qty * price;
  tr.querySelector('.fw-700').textContent = '¥' + sub.toLocaleString();
}

function removeSalesBRow(idx) {
  const tr = document.getElementById('sales-b-row-' + idx);
  if (tr) tr.remove();
  const tbody = document.getElementById('sales-b-tbody');
  if (tbody && tbody.children.length === 0) {
    document.getElementById('sales-b-container').innerHTML = '';
    salesBCount = 0;
  }
}

// ===== 担当者カード（ウィザードSt3） =====
let contactCardCount = 2;
let mainContactIdx = 0;

function setMainContact(idx) {
  mainContactIdx = idx;
  for (let i = 0; i < contactCardCount; i++) {
    const card = document.getElementById('contact-' + i);
    if (!card) continue;
    const badge = card.querySelector('.badge');
    const headerBtns = card.querySelectorAll('.contact-card-header button');

    if (i === idx) {
      card.classList.add('main-contact');
      if (badge) { badge.className = 'badge badge-black'; badge.textContent = '★ メイン担当者'; }
      headerBtns.forEach(b => b.remove());
    } else {
      card.classList.remove('main-contact');
      if (badge) { badge.className = 'badge badge-gray'; badge.textContent = 'サブ担当者'; }
      // メイン設定ボタンを追加（なければ）
      const hdr = card.querySelector('.contact-card-header');
      if (hdr && !hdr.querySelector('button')) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-secondary';
        const capturedI = i;
        btn.onclick = () => setMainContact(capturedI);
        btn.innerHTML = '★ メインに設定';
        hdr.appendChild(btn);
      }
    }
  }
}

function addContactCard() {
  const container = document.getElementById('contact-cards-container');
  const idx = contactCardCount;
  const div = document.createElement('div');
  div.className = 'contact-card';
  div.id = 'contact-' + idx;
  div.innerHTML = `
    <button class="contact-card-remove" onclick="removeContactCard(${idx})"><i class="ti ti-x"></i></button>
    <div class="contact-card-header">
      <div>
        <div class="contact-card-name">新規担当者</div>
        <span class="badge badge-gray" style="margin-top:4px;">サブ担当者</span>
      </div>
      <button class="btn btn-sm btn-secondary" onclick="setMainContact(${idx})">★ メインに設定</button>
    </div>
    <div class="contact-card-form">
      <div class="form-group"><label class="form-label">氏名</label><input class="form-control" placeholder="氏名"></div>
      <div class="form-group"><label class="form-label">役職</label><input class="form-control" placeholder="役職"></div>
      <div class="form-group"><label class="form-label">部署</label><input class="form-control" placeholder="部署名"></div>
      <div class="form-group"><label class="form-label">電話番号</label><input class="form-control" placeholder="電話番号"></div>
      <div class="form-group"><label class="form-label">FAX</label><input class="form-control" placeholder="FAX"></div>
      <div class="form-group"><label class="form-label">携帯電話</label><input class="form-control" placeholder="携帯電話"></div>
      <div class="form-group" style="grid-column:1/-1;"><label class="form-label">メールアドレス</label><input class="form-control" placeholder="メールアドレス"></div>
    </div>`;
  container.appendChild(div);
  contactCardCount++;
}

function removeContactCard(idx) {
  const card = document.getElementById('contact-' + idx);
  if (card) card.remove();
  // メイン担当者が削除された場合、idx=0をメインに
  if (mainContactIdx === idx) {
    mainContactIdx = 0;
    const firstCard = document.getElementById('contact-0');
    if (firstCard) {
      firstCard.classList.add('main-contact');
      const badge = firstCard.querySelector('.badge');
      if (badge) { badge.className = 'badge badge-black'; badge.textContent = '★ メイン担当者'; }
    }
  }
}

function addMockContact(nameStr) {
  const container = document.getElementById('contact-cards-container');
  const idx = contactCardCount;
  const div = document.createElement('div');
  div.className = 'contact-card';
  div.id = 'contact-' + idx;
  div.innerHTML = `
    <button class="contact-card-remove" onclick="removeContactCard(${idx})"><i class="ti ti-x"></i></button>
    <div class="contact-card-header">
      <div>
        <div class="contact-card-name">${nameStr.split(' ')[0]} ${nameStr.split(' ')[1] || ''}</div>
        <span class="badge badge-gray" style="margin-top:4px;">サブ担当者</span>
        <span class="src-auto" style="margin-left:6px;background:#E3F2FD;color:#1976D2;">DB検索</span>
      </div>
      <button class="btn btn-sm btn-secondary" onclick="setMainContact(${idx})">★ メインに設定</button>
    </div>
    <div class="contact-card-form">
      <div class="form-group"><label class="form-label">氏名</label><input class="form-control" value="${nameStr.split(' ')[0]} ${nameStr.split(' ')[1] || ''}"></div>
      <div class="form-group"><label class="form-label">役職</label><input class="form-control" value=""></div>
      <div class="form-group"><label class="form-label">部署</label><input class="form-control" value="${nameStr.match(/\((.*?)\)/)?.[1] || ''}"></div>
      <div class="form-group"><label class="form-label">電話番号</label><input class="form-control" value="03-0000-0000"></div>
      <div class="form-group"><label class="form-label">FAX</label><input class="form-control" value=""></div>
      <div class="form-group"><label class="form-label">携帯電話</label><input class="form-control" value="090-0000-0000"></div>
      <div class="form-group" style="grid-column:1/-1;"><label class="form-label">メールアドレス</label><input class="form-control" value="sample@example.com"></div>
    </div>`;
  container.appendChild(div);
  contactCardCount++;
}

function confirmContactUpdate() {
  if (confirm("データベースにない情報を更新する際は、データベースを上書きしますか？")) {
    wizardNext();
  }
}

function markManualEdit(el) {
  const tr = el.closest('tr');
  if (tr) {
    const srcCol = tr.querySelector('.src-col');
    if (srcCol) {
      srcCol.innerHTML = '<span class="src-auto" style="background:#FFF3E0;color:#E65100;">✍️ 手修正</span>';
    }
  }
}

// ===== accordion（申込書管理） =====
const accordionState = {};
function toggleAccordion(key) {
  accordionState[key] = !accordionState[key];
  const open = accordionState[key];

  // 該当する子行を全て開閉
  const prefix = 'acc-' + key.replace('order-', '');
  let i = 1;
  while (true) {
    const row = document.getElementById(prefix + '-' + i);
    if (!row) break;
    row.classList.toggle('open', open);
    i++;
  }

  // 親行のexpandedクラス
  const parentRows = document.querySelectorAll('.parent-row');
  parentRows.forEach(r => {
    const fn = r.getAttribute('onclick');
    if (fn && fn.includes(key)) {
      r.classList.toggle('expanded', open);
    }
  });
}

// ===== 機器販売（A）：テーブル描画 =====
function renderSalesATable() {
  const tbody = document.getElementById('sales-a-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  salesAData.forEach(item => {
    const total   = item.items.reduce((s, i) => s + i.sub, 0);
    const cost    = item.items.reduce((s, i) => s + (i.unit * (parseInt(i.qty) || 0) - i.sub + i.sub), 0);
    const profit  = total - (item.items.reduce((s, i) => s + (i.cost || 0), 0));
    const itemQty = item.items.length + '品';

    const statusBadge = item.status === '納品済'
      ? `<span style="padding:3px 10px;background:#dcfce7;color:#16a34a;border-radius:20px;font-size:12px;font-weight:600;">納品済</span>`
      : `<span style="padding:3px 10px;background:#fef9c3;color:#b45309;border-radius:20px;font-size:12px;font-weight:600;">処理中</span>`;

    const billingColor = {
      '未請求': { bg:'#f3f4f6', color:'#6b7280' },
      '請求済': { bg:'#dbeafe', color:'#1d4ed8' },
      '入金済': { bg:'#dcfce7', color:'#16a34a' }
    }[item.billingStatus] || { bg:'#f3f4f6', color:'#6b7280' };
    const billingBadge = `<span style="padding:3px 10px;background:${billingColor.bg};color:${billingColor.color};border-radius:20px;font-size:12px;font-weight:600;">${item.billingStatus}</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="cid-a">${item.axisId}</span></td>
      <td>${item.company}</td>
      <td>${itemQty}</td>
      <td>¥${total.toLocaleString()}</td>
      <td>¥${item.items.reduce((s,i) => s+(i.cost||0),0).toLocaleString()}</td>
      <td>¥${(total - item.items.reduce((s,i) => s+(i.cost||0),0)).toLocaleString()}</td>
      <td style="text-align:center;">${statusBadge}</td>
      <td style="text-align:center;">${item.deliveryDate || '—'}</td>
      <td style="text-align:center;">${billingBadge}</td>
      <td style="display:flex;gap:4px;">
        <button class="btn-edit" onclick="openSalesAStatusModal(${item.id})"
          style="padding:4px 10px;background:#f59e0b;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">
          設定
        </button>
        <button class="btn-detail" onclick="openSalesADetailModal(${item.id})"
          style="padding:4px 10px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">
          詳細
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== 機器販売（A）：ステータス設定 =====
let editingSalesAId = null;

function openSalesAStatusModal(itemId) {
  const item = salesAData.find(d => d.id === itemId);
  if (!item) return;
  editingSalesAId = itemId;

  document.querySelectorAll('input[name="sales-a-status"]').forEach(r => {
    r.checked = r.value === item.status;
  });
  document.querySelectorAll('input[name="sales-a-billing"]').forEach(r => {
    r.checked = r.value === item.billingStatus;
  });
  document.getElementById('sales-a-delivery-date').value = item.deliveryDate || '';

  document.getElementById('sales-a-status-modal').style.display = 'flex';
}

function closeSalesAStatusModal() {
  document.getElementById('sales-a-status-modal').style.display = 'none';
  editingSalesAId = null;
}

function saveSalesAStatus() {
  const item = salesAData.find(d => d.id === editingSalesAId);
  if (!item) return;

  const status       = document.querySelector('input[name="sales-a-status"]:checked')?.value  || '処理中';
  const billing      = document.querySelector('input[name="sales-a-billing"]:checked')?.value || '未請求';
  const deliveryDate = document.getElementById('sales-a-delivery-date').value;

  item.status        = status;
  item.billingStatus = billing;
  item.deliveryDate  = deliveryDate || null;

  // salesADataByKey も同期
  if (salesADataByKey[item.axisId]) {
    salesADataByKey[item.axisId].status   = status;
    salesADataByKey[item.axisId].delivery = deliveryDate || '未設定';
    salesADataByKey[item.axisId].invoice  = billing;
  }

  closeSalesAStatusModal();
  renderSalesATable();
}

// ===== 機器販売（A）：詳細モーダル（添付エリア付き） =====
let currentSalesADetailId = null;

function openSalesADetailModal(itemId) {
  currentSalesADetailId = itemId;
  const item = salesAData.find(d => d.id === itemId);
  if (!item) return;
  if (!item.attachments) item.attachments = [];

  const total = item.items.reduce((s, i) => s + i.sub, 0);
  const rows  = item.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td class="cid-a" style="font-size:13px;">${i.code}</td>
      <td>${i.qty}</td>
      <td>¥${i.unit.toLocaleString()}</td>
      <td class="fw-700">¥${i.sub.toLocaleString()}</td>
    </tr>`).join('');

  const billingColor = {
    '未請求': '#6b7280', '請求済': '#1d4ed8', '入金済': '#16a34a'
  }[item.billingStatus] || '#6b7280';

  document.getElementById('sales-a-modal-title').textContent = `機器販売詳細 — ${item.axisId}`;
  document.getElementById('sales-a-modal-body').innerHTML = `
    <div style="margin-bottom:12px;">
      <span style="color:var(--text-muted);font-size:13px;">企業名：</span><strong>${item.company}</strong>
      <span style="margin-left:16px;color:var(--text-muted);font-size:13px;">ステータス：</span>
      <span class="badge ${item.status === '納品済' ? 'badge-green' : 'badge-yellow'}">${item.status}</span>
      <span style="margin-left:12px;color:var(--text-muted);font-size:13px;">請求状況：</span>
      <span style="font-weight:600;color:${billingColor};">${item.billingStatus}</span>
    </div>
    <div class="table-wrap" style="margin-bottom:14px;">
      <table>
        <thead><tr><th>商品名</th><th>型番・コード</th><th>数量</th><th>単価</th><th>小計</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="sum-row"><td colspan="4">合計（税別）</td><td class="fw-700">¥${total.toLocaleString()}</td></tr>
        </tbody>
      </table>
    </div>
    <div style="display:flex;gap:16px;font-size:13px;margin-bottom:4px;">
      <div><span style="color:var(--text-muted);">納品日：</span><strong>${item.deliveryDate || '未設定'}</strong></div>
    </div>

    <!-- 添付ファイルエリア -->
    <div style="margin-top:24px;border-top:1px solid #e5e7eb;padding-top:20px;">
      <h4 style="margin:0 0 12px;font-size:14px;font-weight:600;">📎 添付ファイル（見積書・請求書）</h4>
      <div id="sales-a-drop-zone"
        ondragover="event.preventDefault();this.style.background='#eff6ff';"
        ondragleave="this.style.background='#f9fafb';"
        ondrop="handleSalesAFileDrop(event)"
        style="border:2px dashed #93c5fd;border-radius:8px;padding:32px;text-align:center;background:#f9fafb;cursor:pointer;transition:background 0.2s;">
        <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">ここにファイルをドラッグ＆ドロップ</p>
        <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;">PDF・Excel・Word・画像 対応</p>
        <label style="padding:8px 16px;background:#2563eb;color:#fff;border-radius:6px;font-size:13px;cursor:pointer;">
          ファイルを選択
          <input type="file" id="sales-a-file-input" multiple
            accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg"
            style="display:none;" onchange="handleSalesAFileSelect(event)" />
        </label>
      </div>
      <div style="margin-top:16px;">
        <h5 style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;">添付履歴</h5>
        <div id="sales-a-attachment-list" style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;"></div>
      </div>
    </div>
  `;

  // 添付履歴を描画
  renderSalesAAttachments(item);
  openModal('sales-a-modal');
}

// 旧APIとの互換性（文字列キーでも開ける）
function openSalesADetail(id) {
  // salesADataByKey から対応する item の id を探す
  const item = salesAData.find(d => d.axisId === id);
  if (item) {
    openSalesADetailModal(item.id);
  }
}

function renderSalesAAttachments(item) {
  const list = document.getElementById('sales-a-attachment-list');
  if (!list) return;
  if (!item.attachments || item.attachments.length === 0) {
    list.innerHTML = '<p style="font-size:13px;color:#9ca3af;margin:0;">添付ファイルはありません</p>';
    return;
  }
  list.innerHTML = '';
  [...item.attachments].reverse().forEach(att => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:13px;';
    div.innerHTML = `
      <span style="flex:1;">📄 ${att.name}</span>
      <span style="color:#9ca3af;font-size:12px;">${att.uploadedAt}</span>
      <span style="color:#6b7280;font-size:12px;">${att.size}</span>
    `;
    list.appendChild(div);
  });
}

function handleSalesAFileDrop(event) {
  event.preventDefault();
  const zone = document.getElementById('sales-a-drop-zone');
  if (zone) zone.style.background = '#f9fafb';
  const files = Array.from(event.dataTransfer.files);
  addSalesAAttachments(files);
}

function handleSalesAFileSelect(event) {
  const files = Array.from(event.target.files);
  addSalesAAttachments(files);
  event.target.value = '';
}

function addSalesAAttachments(files) {
  const item = salesAData.find(d => d.id === currentSalesADetailId);
  if (!item) return;
  if (!item.attachments) item.attachments = [];

  files.forEach(file => {
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    item.attachments.push({
      name:       file.name,
      uploadedAt: new Date().toLocaleString('ja-JP'),
      size:       file.size > 1024 * 1024 ? `${sizeMB}MB` : `${sizeKB}KB`
    });
  });

  renderSalesAAttachments(item);
}



// ===== 工事詳細 =====
function openSalesBDetail(id) {
  const d = salesBData[id];
  if (!d) return;

  const totalSell = d.items.reduce((s, i) => s + i.sell, 0);
  const totalCost = d.items.reduce((s, i) => s + i.cost, 0);
  const totalProfit = totalSell - totalCost;

  const rows = d.items.map(i => {
    const profit = i.sell - i.cost;
    return `<tr>
      <td>${i.name}</td>
      <td>${i.desc}</td>
      <td>${i.qty}</td>
      <td>¥${i.sell.toLocaleString()}</td>
      <td>¥${i.cost.toLocaleString()}</td>
      <td class="fw-700">¥${i.sell.toLocaleString()}</td>
      <td>¥${i.cost.toLocaleString()}</td>
      <td class="fw-700">¥${profit.toLocaleString()}</td>
    </tr>`;
  }).join('');

  document.getElementById('sales-b-modal-title').textContent = `工事管理詳細 — ${id}`;
  document.getElementById('sales-b-modal-body').innerHTML = `
    <div style="margin-bottom:12px;">
      <span style="color:var(--text-muted);font-size: 13px;">企業名：</span><strong>${d.company}</strong>
      <span style="margin-left:12px;color:var(--text-muted);font-size: 13px;">件名：</span><strong>${d.name}</strong>
      <span style="margin-left:12px;"></span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>工事項目名</th><th>内容</th><th>数量</th><th>売価</th><th>原価</th><th>小計売上</th><th>小計原価</th><th>粗利</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="sum-row">
            <td colspan="5">合計</td>
            <td>¥${totalSell.toLocaleString()}</td>
            <td>¥${totalCost.toLocaleString()}</td>
            <td>¥${totalProfit.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>`;
  openModal('sales-b-modal');
}

// ===== サブスク詳細 =====
function openSubscDetail(id) {
  const d = subscData[id];
  if (!d) return;

  const timelineHtml = d.timeline.map(t => {
    const isCurrent = t.status === 'current';
    const isOrigin  = t.status === 'origin';
    const cls = isCurrent ? 'current' : (t.status === 'ended' ? 'ended' : '');
    return `<div class="timeline-item ${cls}">
      <div style="font-size: 13px;font-weight:700;color:${isCurrent ? 'var(--cid-c)' : 'var(--text-muted)'};">
        ${isOrigin ? '● ' : (isCurrent ? '★ 現行 ' : '')}${t.id}
      </div>
      <div style="font-size:13px;font-weight:${isCurrent ? '700' : '400'};">${t.period}</div>
    </div>`;
  }).join('');

  document.getElementById('subsc-detail-title').textContent = `サブスク詳細 — ${id}`;
  document.getElementById('subsc-detail-body').innerHTML = `
    <div style="margin-bottom:14px;">
      <div style="margin-bottom:6px;"><span style="color:var(--text-muted);font-size: 13px;">企業：</span><strong>${d.company}</strong></div>
      <div style="margin-bottom:6px;"><span style="color:var(--text-muted);font-size: 13px;">プラン：</span><strong>${d.plan}</strong></div>
      <div><span style="color:var(--text-muted);font-size: 13px;">月額：</span><strong class="cid-c">¥${d.monthly.toLocaleString()}</strong>
        <span style="margin-left:12px;color:var(--text-muted);font-size: 13px;">原価：</span><strong>¥${d.cost.toLocaleString()}</strong></div>
    </div>
    <div class="section-title">更新履歴タイムライン</div>
    <div class="timeline">${timelineHtml}</div>`;
  openModal('subsc-detail-modal');
}

// ===== サブスク更新モーダル =====
let renewalCurrentId = '';
let renewalNewSuffix = '';

function openSubscRenewal(currentId, newSuffix) {
  renewalCurrentId = currentId;
  renewalNewSuffix = newSuffix;
  const d = subscData[currentId];

  const parentId = currentId.replace(/C\d+$/, '');
  const newId = parentId + newSuffix;

  document.getElementById('renewal-current-id').textContent = currentId;
  document.getElementById('renewal-new-id').textContent = newId;

  if (d) {
    document.getElementById('renewal-price').value = '¥' + d.monthly.toLocaleString();
    document.getElementById('renewal-cost').value  = '¥' + d.cost.toLocaleString();
  }

  document.getElementById('subsc-renewal-title').textContent = `更新登録 — ${currentId} → ${newId}`;
  openModal('subsc-renewal-modal');
}

function confirmRenewal() {
  const parentId = renewalCurrentId.replace(/C\d+$/, '');
  const newId = parentId + renewalNewSuffix;
  alert(`✓ ${newId} を発行して更新登録が完了しました（モック）`);
  closeModal('subsc-renewal-modal');
}

// ===== 入金登録 =====
function registerPayment() {
  const id = document.getElementById('pay-select-id').value;
  const dateVal = document.getElementById('pay-date').value;
  if (!dateVal) { alert('入金日を入力してください'); return; }

  const parts = dateVal.split('-');
  const formatted = parts[1] + '/' + parts[2];

  const dateEl = document.getElementById('paid-date-' + id);
  const statusEl = document.getElementById('paid-status-' + id);
  if (dateEl) dateEl.textContent = formatted;
  if (statusEl) statusEl.innerHTML = '<span class="badge badge-green">入金済</span>';

  alert(`✓ 入金登録が完了しました（モック）\n${formatted} 入金済に更新`);
  closeModal('payment-modal');
}

// ===== モーダル共通 =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// オーバーレイクリックで閉じる
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
});

// ESCキーで閉じる
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

// =========================================================
// 認証システム
// =========================================================
const MEMBERS_DB = [
  { email: 'admin@m2m-datas.co.jp',   password: 'axis0120', name: '管理者 太郎',   phone: '052-000-0001', company: 'M2M-Datas株式会社',  role: 'admin', isInitialPw: true },
  { email: 'hanako@m2m-datas.co.jp',  password: 'axis0120', name: '営業 花子',     phone: '052-000-0002', company: 'M2M-Datas株式会社',  role: 'user',  isInitialPw: true },
  { email: 'jiro@m2m-datas.co.jp',    password: 'axis0120', name: '工事 次郎',     phone: '052-000-0003', company: 'M2M-Datas株式会社',  role: 'user',  isInitialPw: true },
  { email: 'saburo@axis-cloud.co.jp', password: 'axis0120', name: 'システム 三郎', phone: '03-0000-0001', company: 'Axis Cloud株式会社', role: 'user',  isInitialPw: true }
];

let currentUser = null;
let pwInitTargetEmail = '';


// パスワード再設定処理（app.js内のモックは削除。index.htmlのSupabase版を使用）

// ログイン完了処理
function completeLogin() {
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('reset-screen').classList.remove('active');

  // サイドバーにユーザー表示
  const label = document.getElementById('sidebar-user-label');
  if (label) {
    label.textContent = currentUser.name + (currentUser.role === 'admin' ? '（管理者）' : '');
  }

  // PW初期化依頼通知バナーを更新
  updatePwResetNotification();
}

// ログアウト
async function doLogout() {
  const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await _sb.auth.signOut();
  sessionStorage.clear();
  localStorage.clear();
  window.location.replace('index.html');
}

// =========================================================
// 設定ドロップダウン
// =========================================================
function toggleSettings() {
  const dd = document.getElementById('settings-dropdown');
  const ch = document.getElementById('settings-chevron');
  const isOpen = dd.classList.toggle('open');
  ch.style.transform = isOpen ? 'rotate(180deg)' : '';
}

function closeSettingsDropdown() {
  document.getElementById('settings-dropdown').classList.remove('open');
  document.getElementById('settings-chevron').style.transform = '';
}

// 外側クリックで閉じる
document.addEventListener('click', e => {
  const footer = document.querySelector('.sidebar-footer');
  if (footer && !footer.contains(e.target)) {
    closeSettingsDropdown();
  }
});

// =========================================================
// メンバー管理画面
// =========================================================
function openMembersScreen() {
  closeSettingsDropdown();
  const screen = document.getElementById('members-screen');
  screen.classList.add('active');

  const userInfo = document.getElementById('members-user-info');
  if (currentUser) {
    userInfo.textContent = 'ログイン中: ' + currentUser.name;
  }

  if (currentUser && currentUser.role === 'admin') {
    document.getElementById('members-admin-view').style.display = 'block';
    document.getElementById('members-denied-view').style.display = 'none';
    // 検索フィールドをリセットしてテーブルを描画
    const searchEl = document.getElementById('member-search');
    if (searchEl) searchEl.value = '';
    renderMembersTable('');
  } else {
    document.getElementById('members-admin-view').style.display = 'none';
    document.getElementById('members-denied-view').style.display = 'block';
  }
}

function closeMembersScreen() {
  document.getElementById('members-screen').classList.remove('active');
}

// パスワード初期化確認
function confirmPasswordInit(email, name) {
  pwInitTargetEmail = email;
  document.getElementById('pw-init-target-msg').textContent =
    name + '（' + email + '）のパスワードを初期化しますか？';
  openModal('pw-init-modal');
}

function executePasswordInit() {
  const member = MEMBERS_DB.find(m => m.email === pwInitTargetEmail);
  if (member) {
    member.password = 'axis0120';
    member.isInitialPw = false; // 管理者が対応済み → 依頼フラグをクリア（次回ログイン時はpasswordチェックで強制変更）
  }
  closeModal('pw-init-modal');
  alert('✓ パスワードを初期化しました。\n次回ログイン時にパスワードの再設定が求められます。');
  // メンバー一覧を再描画（ボタン表示をオレンジに更新）
  renderMembersTable();
  // PW初期化依頼通知バナーを更新（isInitialPwが増えた可能性）
  updatePwResetNotification();
}

// =========================================================
// メンバーテーブル描画 (renderMembersTable / filterMembers)
// =========================================================
let _memberFilter = '';

function renderMembersTable(filter) {
  filter = (filter !== undefined ? filter : _memberFilter).toLowerCase();
  _memberFilter = filter;
  const tbody = document.getElementById('members-tbody');
  if (!tbody) return;

  const filtered = MEMBERS_DB.filter(m =>
    m.name.toLowerCase().includes(filter) ||
    m.email.toLowerCase().includes(filter)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px;">該当メンバーが見つかりません</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(m => {
    const roleBadge = m.role === 'admin'
      ? '<span class="badge badge-blue">管理者</span>'
      : '<span class="badge badge-gray">一般</span>';
    const phone = m.phone || '—';
    const isCurrentUser = currentUser && currentUser.email === m.email;
    const deleteBtn = isCurrentUser
      ? `<button class="btn btn-sm btn-danger" style="opacity:0.4;cursor:not-allowed;" disabled title="自分自身は削除できません"><i class="ti ti-trash"></i> 削除</button>`
      : `<button class="btn btn-sm btn-danger" onclick="openDeleteMember('${m.email}')"><i class="ti ti-trash"></i> 削除</button>`;
    const pwBtn = m.isInitialPw
      ? `<button onclick="confirmPasswordInit('${m.email}', '${m.name}')" style="background:#f97316; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size: 13px; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:4px;">&#128276; PW初期化待ち</button>`
      : `<button class="btn btn-sm btn-secondary" onclick="confirmPasswordInit('${m.email}', '${m.name}')"><i class="ti ti-key"></i> パスワード変更</button>`;
    return `<tr>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px;" title="${m.company}">${m.company}</td>
      <td class="fw-700" style="white-space:nowrap;">${m.name}</td>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;" title="${m.email}">${m.email}</td>
      <td style="white-space:nowrap;">${phone}</td>
      <td>${roleBadge}</td>
      <td style="white-space:nowrap;">
        <div style="display:inline-flex;gap:6px;align-items:center;flex-wrap:nowrap;">
          ${pwBtn}
          <button class="btn btn-sm btn-secondary" onclick="openEditMember('${m.email}')"><i class="ti ti-edit"></i> 編集</button>
          ${deleteBtn}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filterMembers() {
  const q = document.getElementById('member-search') ? document.getElementById('member-search').value : '';
  renderMembersTable(q);
}

// =========================================================
// メンバー編集
// =========================================================
let _editTargetEmail = '';

function openEditMember(email) {
  const m = MEMBERS_DB.find(x => x.email === email);
  if (!m) return;
  _editTargetEmail = email;
  document.getElementById('edit-member-email-orig').value = email;
  document.getElementById('edit-member-company').value = m.company || '';
  document.getElementById('edit-member-name').value = m.name || '';
  document.getElementById('edit-member-email').value = m.email || '';
  document.getElementById('edit-member-phone').value = m.phone || '';
  document.getElementById('edit-member-role').value = m.role || 'user';
  openModal('member-edit-modal');
}

function saveMemberEdit() {
  const origEmail = document.getElementById('edit-member-email-orig').value;
  const m = MEMBERS_DB.find(x => x.email === origEmail);
  if (!m) return;

  const newEmail = document.getElementById('edit-member-email').value.trim();
  const newName = document.getElementById('edit-member-name').value.trim();
  const newCompany = document.getElementById('edit-member-company').value.trim();
  const newPhone = document.getElementById('edit-member-phone').value.trim();
  const newRole = document.getElementById('edit-member-role').value;

  if (!newEmail || !newName) {
    alert('氏名とメールアドレスは必須です。');
    return;
  }

  m.email = newEmail;
  m.name = newName;
  m.company = newCompany;
  m.phone = newPhone;
  m.role = newRole;

  // 現在ログイン中のユーザーが自分自身を編集した場合は currentUser も更新
  if (currentUser && currentUser.email === origEmail) {
    currentUser = m;
    const label = document.getElementById('sidebar-user-label');
    if (label) label.textContent = currentUser.name + (currentUser.role === 'admin' ? '（管理者）' : '');
  }

  closeModal('member-edit-modal');
  renderMembersTable();
}

// =========================================================
// メンバー削除
// =========================================================
let _deleteTargetEmail = '';

function openDeleteMember(email) {
  const m = MEMBERS_DB.find(x => x.email === email);
  if (!m) return;
  _deleteTargetEmail = email;

  const errEl = document.getElementById('delete-member-error');
  errEl.style.display = 'none';
  errEl.textContent = '';

  document.getElementById('delete-member-msg').textContent =
    `${m.name}（${m.email}）を削除しますか？この操作は元に戻せません。`;

  // 自分自身の場合はエラーを表示して削除ボタンを無効化
  if (currentUser && currentUser.email === email) {
    errEl.textContent = '現在ログイン中のユーザー自身は削除できません。';
    errEl.style.display = 'block';
    document.getElementById('delete-member-btn').disabled = true;
    document.getElementById('delete-member-btn').style.opacity = '0.4';
  } else {
    document.getElementById('delete-member-btn').disabled = false;
    document.getElementById('delete-member-btn').style.opacity = '';
  }

  openModal('member-delete-modal');
}

function executeDeleteMember() {
  if (currentUser && currentUser.email === _deleteTargetEmail) {
    const errEl = document.getElementById('delete-member-error');
    errEl.textContent = '現在ログイン中のユーザー自身は削除できません。';
    errEl.style.display = 'block';
    return;
  }
  const idx = MEMBERS_DB.findIndex(x => x.email === _deleteTargetEmail);
  if (idx !== -1) MEMBERS_DB.splice(idx, 1);
  closeModal('member-delete-modal');
  renderMembersTable();
}

// =========================================================
// メンバー追加モーダル
// =========================================================
function openAddMemberModal() {
  document.getElementById('add-member-name').value = '';
  document.getElementById('add-member-email').value = '';
  document.getElementById('add-member-company').value = '';
  document.getElementById('add-member-phone').value = '';
  document.getElementById('add-member-role').value = 'user';
  const errEl = document.getElementById('add-member-error');
  errEl.style.display = 'none';
  errEl.textContent = '';
  openModal('modal-add-member');
}

function submitAddMember() {
  const name    = document.getElementById('add-member-name').value.trim();
  const email   = document.getElementById('add-member-email').value.trim();
  const company = document.getElementById('add-member-company').value.trim();
  const phone   = document.getElementById('add-member-phone').value.trim();
  const role    = document.getElementById('add-member-role').value;
  const errEl   = document.getElementById('add-member-error');

  // 必須チェック
  if (!name || !email || !company || !phone) {
    errEl.textContent = 'すべての項目を入力してください。';
    errEl.style.display = 'block';
    return;
  }

  // メールアドレス重複チェック
  const dup = MEMBERS_DB.find(m => m.email === email);
  if (dup) {
    errEl.textContent = 'このメールアドレスはすでに登録されています。';
    errEl.style.display = 'block';
    return;
  }

  // DB に追加
  MEMBERS_DB.push({
    name:        name,
    email:       email,
    company:     company,
    phone:       phone,
    role:        role,
    password:    'axis0120',
    isInitialPw: true
  });

  closeModal('modal-add-member');
  renderMembersTable();
}

// =========================================================
// パスワード初期化依頼モーダル
// =========================================================
function openPasswordResetModal() {
  document.getElementById('pw-reset-req-email').value = '';
  const errEl = document.getElementById('pw-reset-req-error');
  const sucEl = document.getElementById('pw-reset-req-success');
  errEl.style.display = 'none';
  errEl.textContent = '';
  sucEl.style.display = 'none';
  sucEl.textContent = '';
  openModal('modal-password-reset-request');
}

function submitPasswordResetRequest() {
  const email = document.getElementById('pw-reset-req-email').value.trim();
  const errEl = document.getElementById('pw-reset-req-error');
  const sucEl = document.getElementById('pw-reset-req-success');

  errEl.style.display = 'none';
  sucEl.style.display = 'none';

  if (!email) {
    errEl.textContent = 'メールアドレスを入力してください。';
    errEl.style.display = 'block';
    return;
  }

  const member = MEMBERS_DB.find(m => m.email === email);
  if (!member) {
    errEl.textContent = 'このメールアドレスは登録されていません。';
    errEl.style.display = 'block';
    return;
  }

  // パスワードを初期値にリセット
  member.isInitialPw = true;
  member.password = 'axis0120';

  sucEl.textContent = '初期化依頼を受け付けました。管理者がリセットするまでしばらくお待ちください。';
  sucEl.style.display = 'block';

  // PW初期化依頼通知バナーを更新（管理者がログイン中の場合に即時反映）
  updatePwResetNotification();

  setTimeout(() => closeModal('modal-password-reset-request'), 2500);
}

// =========================================================
// PW初期化依頼通知バナー更新
// =========================================================
function updatePwResetNotification() {
  const notification = document.getElementById('pw-reset-notification');
  if (!notification) return;

  // 管理者以外は常に非表示
  if (!currentUser || currentUser.role !== 'admin') {
    notification.style.display = 'none';
    return;
  }

  // isInitialPw === true のメンバーをカウント（自分自身は除く）
  const count = MEMBERS_DB.filter(m => m.isInitialPw === true && m.email !== currentUser.email).length;

  if (count === 0) {
    notification.style.display = 'none';
  } else {
    notification.style.display = 'flex';
    document.getElementById('pw-reset-count-label').textContent = count + '件の依頼があります';
  }
}

/* =============================================

   サービス管理（C） JS
   ============================================= */

/* --- モーダル開閉 --- */
function openServiceNewModal() {
  openModal('service-new-modal');
  document.getElementById('svc-billing-today').textContent = '2026/06/15';
  // オムロン行リセット
  document.getElementById('svc-new-omron-rows').innerHTML =
    '<div style="color:var(--text-muted);font-size: 13px;">契約台数を入力後に自動生成されます</div>';
}

// --- グローバル変数で状態保持 ---
var currentService = {};

function openServiceDetail(id) {
  document.getElementById('svc-detail-title').textContent = 'サービス詳細：' + id;
  openModal('service-detail-modal');
  switchSvcTab('basic');
  
  // サンプルデータの初期化（初回のみ）
  if (!currentService.id || currentService.id !== id) {
    currentService = {
      id: id,
      plan: 'LTEソラモニ4G',
      cycle: '12ヵ月',
      unitPrice: 900,
      unitCount: 2,
      monthlyTotal: 1800,
      initCount: 2,
      initPrice: 2000,
      initTotal: 4000,
      applyDate: '2026-02-15',
      freeStart: '2026-02-15',
      freeEnd: '2026-08-31',
      fractionStart: '2026-09-01',
      fractionEnd: '2027-03-31',
      cycleStart: '2027-04-01',
      cycleEnd: '2028-03-31',
      invoiceDate: '2026-02-28',
      paymentMethod: 'クレジットカード',
      paymentDue: '2026-03-31',
      risonaId: '215421',
      monthlyCost: 400,
      initCost: 500,
      paidTotal: 25600, // 初期4000 + 12ヶ月*1800(21600) = 25600円と仮定
      paidInit: true,
      paidMonthly: true,
      omronRows: [
        { num: 1, omronId: 'OM-20260215-001', initId: 'admin1', initPw: 'pass001' },
        { num: 2, omronId: 'OM-20260215-002', initId: 'admin2', initPw: 'pass002' }
      ]
    };
  }

  refreshServiceDetail();
}

function refreshServiceDetail() {
  renderSvcDetailBasic(currentService);
  renderSvcBilling(currentService);
  renderOmronTable(currentService.omronRows);
}

function openServiceEdit(id) {
  var d = currentService;
  document.getElementById('svc-edit-paid-init').checked = d.paidInit;
  document.getElementById('svc-edit-paid-monthly').checked = d.paidMonthly;
  document.getElementById('svc-edit-plan').value = d.plan;
  document.getElementById('svc-edit-cycle').value = d.cycle;
  document.getElementById('svc-edit-unit-price').value = d.unitPrice;
  document.getElementById('svc-edit-unit-count').value = d.unitCount;
  document.getElementById('svc-edit-init-count').value = d.initCount;
  document.getElementById('svc-edit-init-price').value = d.initPrice;
  document.getElementById('svc-edit-apply-date').value = d.applyDate;
  document.getElementById('svc-edit-free-start').value = d.freeStart;
  document.getElementById('svc-edit-free-end').value = d.freeEnd;
  document.getElementById('svc-edit-fraction-start').value = d.fractionStart;
  document.getElementById('svc-edit-fraction-end').value = d.fractionEnd;
  document.getElementById('svc-edit-cycle-start').value = d.cycleStart;
  document.getElementById('svc-edit-cycle-end').value = d.cycleEnd;
  document.getElementById('svc-edit-invoice-date').value = d.invoiceDate;
  document.getElementById('svc-edit-payment-method').value = d.paymentMethod;
  document.getElementById('svc-edit-payment-due').value = d.paymentDue;
  document.getElementById('svc-edit-risona-id').value = d.risonaId || '';
  document.getElementById('svc-edit-monthly-cost').value = d.monthlyCost;
  document.getElementById('svc-edit-init-cost').value = d.initCost;
  
  document.getElementById('svc-edit-risona-group').style.display = (d.paymentMethod === 'クレジットカード') ? '' : 'none';

  calcServiceEditMonthly();
  calcServiceEditInit();
  
  // オムロン行の展開
  var html = '';
  for (var i = 0; i < d.unitCount; i++) {
    var row = d.omronRows[i] || { omronId:'', initId:'', initPw:'' };
    html += '<div style="display:grid;grid-template-columns:80px 1fr 1fr 1fr;gap:8px;align-items:center;margin-bottom:8px;">';
    html += '<div style="font-weight:600;text-align:center;">' + (i+1) + '台目</div>';
    html += '<input type="text" class="form-control edit-omron-id" placeholder="オムロンID" value="' + row.omronId + '">';
    html += '<input type="text" class="form-control edit-init-id" placeholder="初期ID" value="' + row.initId + '">';
    html += '<input type="text" class="form-control edit-init-pw" placeholder="初期Password" value="' + row.initPw + '">';
    html += '</div>';
  }
  document.getElementById('svc-edit-omron-rows').innerHTML = html;

  openModal('service-edit-modal');
}

function openServiceEditFromDetail() {
  closeModal('service-detail-modal');
  openServiceEdit(currentService.id);
}

function saveServiceEdit() {
  var d = currentService;
  d.paidInit = document.getElementById('svc-edit-paid-init').checked;
  d.paidMonthly = document.getElementById('svc-edit-paid-monthly').checked;
  d.plan = document.getElementById('svc-edit-plan').value;
  d.cycle = document.getElementById('svc-edit-cycle').value;
  d.unitPrice = parseFloat(document.getElementById('svc-edit-unit-price').value) || 0;
  d.unitCount = parseFloat(document.getElementById('svc-edit-unit-count').value) || 0;
  d.initCount = parseFloat(document.getElementById('svc-edit-init-count').value) || 0;
  d.initPrice = parseFloat(document.getElementById('svc-edit-init-price').value) || 0;
  d.monthlyTotal = d.unitPrice * d.unitCount;
  d.initTotal = d.initPrice * d.initCount;

  d.applyDate = document.getElementById('svc-edit-apply-date').value;
  d.freeStart = document.getElementById('svc-edit-free-start').value;
  d.freeEnd = document.getElementById('svc-edit-free-end').value;
  d.fractionStart = document.getElementById('svc-edit-fraction-start').value;
  d.fractionEnd = document.getElementById('svc-edit-fraction-end').value;
  d.cycleStart = document.getElementById('svc-edit-cycle-start').value;
  d.cycleEnd = document.getElementById('svc-edit-cycle-end').value;
  d.invoiceDate = document.getElementById('svc-edit-invoice-date').value;
  d.paymentMethod = document.getElementById('svc-edit-payment-method').value;
  d.paymentDue = document.getElementById('svc-edit-payment-due').value;
  d.risonaId = document.getElementById('svc-edit-risona-id').value;
  d.monthlyCost = parseFloat(document.getElementById('svc-edit-monthly-cost').value) || 0;
  d.initCost = parseFloat(document.getElementById('svc-edit-init-cost').value) || 0;

  // オムロン行の保存
  d.omronRows = [];
  var ids = document.querySelectorAll('.edit-omron-id');
  var inits = document.querySelectorAll('.edit-init-id');
  var pws = document.querySelectorAll('.edit-init-pw');
  for (var i = 0; i < d.unitCount; i++) {
    d.omronRows.push({
      num: i + 1,
      omronId: ids[i] ? ids[i].value : '',
      initId: inits[i] ? inits[i].value : '',
      initPw: pws[i] ? pws[i].value : ''
    });
  }

  // 入金総額の再計算
  d.paidTotal = 0;
  if (d.paidInit) d.paidTotal += d.initTotal;
  if (d.paidMonthly) {
     var months = parseInt(d.cycle) || 12; // 12ヵ月等から数字抽出
     d.paidTotal += d.monthlyTotal * months;
  }

  closeModal('service-edit-modal');
  refreshServiceDetail();
  openModal('service-detail-modal');
}

/* --- タブ切替 --- */
function switchSvcTab(tab) {
  ['basic','omron','billing','refund'].forEach(function(t) {
    document.getElementById('svc-panel-' + t).style.display = (t === tab) ? '' : 'none';
    var btn = document.getElementById('svc-tab-' + t);
    if (t === tab) {
      btn.style.color = 'var(--accent)';
      btn.style.fontWeight = '600';
      btn.style.borderBottom = '2px solid var(--accent)';
    } else {
      btn.style.color = 'var(--text-secondary)';
      btn.style.fontWeight = '500';
      btn.style.borderBottom = '2px solid transparent';
    }
  });
}

/* --- 自動計算 --- */
function calcServiceMonthly() {
  var price = parseFloat(document.getElementById('svc-new-unit-price').value) || 0;
  var count = parseFloat(document.getElementById('svc-new-unit-count').value) || 0;
  document.getElementById('svc-new-monthly-total').value = '¥' + (price * count).toLocaleString();
}
function calcServiceInit() {
  var price = parseFloat(document.getElementById('svc-new-init-price').value) || 0;
  var count = parseFloat(document.getElementById('svc-new-init-count').value) || 0;
  document.getElementById('svc-new-init-total').value = '¥' + (price * count).toLocaleString();
}

function calcServiceEditMonthly() {
  var price = parseFloat(document.getElementById('svc-edit-unit-price').value) || 0;
  var count = parseFloat(document.getElementById('svc-edit-unit-count').value) || 0;
  document.getElementById('svc-edit-monthly-total').value = '¥' + (price * count).toLocaleString();
}
function calcServiceEditInit() {
  var price = parseFloat(document.getElementById('svc-edit-init-price').value) || 0;
  var count = parseFloat(document.getElementById('svc-edit-init-count').value) || 0;
  document.getElementById('svc-edit-init-total').value = '¥' + (price * count).toLocaleString();
}

/* --- りそなID表示切替 --- */
function toggleRisonaField() {
  var method = document.getElementById('svc-new-payment-method').value;
  document.getElementById('svc-risona-group').style.display = (method === 'credit') ? '' : 'none';
}

/* --- オムロン行生成 --- */
function generateOmronRows() {
  var count = parseInt(document.getElementById('svc-new-unit-count').value) || 0;
  if (count < 1) { alert('先に契約台数を入力してください'); return; }
  var html = '';
  for (var i = 1; i <= count; i++) {
    html += '<div style="display:grid;grid-template-columns:80px 1fr 1fr 1fr;gap:8px;align-items:center;margin-bottom:8px;">';
    html += '<div style="font-weight:600;text-align:center;">' + i + '台目</div>';
    html += '<input type="text" class="form-control" placeholder="オムロンID" id="omron-id-' + i + '">';
    html += '<input type="text" class="form-control" placeholder="初期ID" id="omron-init-id-' + i + '">';
    html += '<input type="text" class="form-control" placeholder="初期Password" id="omron-init-pw-' + i + '">';
    html += '</div>';
  }
  document.getElementById('svc-new-omron-rows').innerHTML = html;
}

function generateEditOmronRows() {
  var count = parseInt(document.getElementById('svc-edit-unit-count').value) || 0;
  if (count < 1) { alert('先に契約台数を入力してください'); return; }
  var html = '';
  for (var i = 1; i <= count; i++) {
    html += '<div style="display:grid;grid-template-columns:80px 1fr 1fr 1fr;gap:8px;align-items:center;margin-bottom:8px;">';
    html += '<div style="font-weight:600;text-align:center;">' + i + '台目</div>';
    html += '<input type="text" class="form-control edit-omron-id" placeholder="オムロンID">';
    html += '<input type="text" class="form-control edit-init-id" placeholder="初期ID">';
    html += '<input type="text" class="form-control edit-init-pw" placeholder="初期Password">';
    html += '</div>';
  }
  document.getElementById('svc-edit-omron-rows').innerHTML = html;
}

/* --- 詳細：基本情報描画 --- */
function renderSvcDetailBasic(d) {
  var rows = [
    ['枝番ID', d.id],
    ['プラン', d.plan],
    ['契約サイクル', d.cycle],
    ['月額単価', '¥' + d.unitPrice.toLocaleString() + '/台'],
    ['契約台数', d.unitCount + '台'],
    ['月額合計', '¥' + d.monthlyTotal.toLocaleString()],
    ['初期登録台数', d.initCount + '台'],
    ['初期単価', '¥' + d.initPrice.toLocaleString() + '/台'],
    ['初期登録手数料', '¥' + d.initTotal.toLocaleString()],
    ['申込日', d.applyDate],
    ['無料開始日', d.freeStart],
    ['無料終了日', d.freeEnd],
    ['端数課金開始日', d.fractionStart],
    ['端数課金終了日', d.fractionEnd],
    ['サイクル課金開始日', d.cycleStart],
    ['サイクル課金終了日', d.cycleEnd],
    ['請求書発行日', d.invoiceDate],
    ['決済方法', d.paymentMethod],
    ['入金期日', d.paymentDue],
    ['クレジットりそなID', d.risonaId || '—'],
    ['月額原価/台', '¥' + d.monthlyCost.toLocaleString()],
    ['初期原価/台', '¥' + d.initCost.toLocaleString()],
    ['初期入金ステータス', d.paidInit ? '<span style="color:#2D9C3C;">入金済</span>' : '<span style="color:#E03131;">未入金</span>'],
    ['月額入金ステータス', d.paidMonthly ? '<span style="color:#2D9C3C;">入金済</span>' : '<span style="color:#E03131;">未入金</span>']
  ];
  var html = '';
  rows.forEach(function(r) {
    html += '<div style="background:var(--bg);border-radius:6px;padding:8px 10px;">'
          + '<div style="font-size: 13px;color:var(--text-muted);margin-bottom:2px;">' + r[0] + '</div>'
          + '<div style="font-weight:600;">' + r[1] + '</div></div>';
  });
  document.getElementById('svc-detail-basic-body').innerHTML = html;
}

/* --- 詳細：課金・前受け計算 --- */
function renderSvcBilling(d) {
  // 現在日：2026/06/15
  var today = new Date('2026-06-15');
  // 消化月数計算（サイクル課金開始日〜today まで、1日に消化確定）
  var consumed = 0;
  var cur = new Date(d.cycleStart);
  while (cur <= today) {
    consumed++;
    cur.setMonth(cur.getMonth() + 1);
  }
  // 月額売上消化
  var monthlyConsumed = consumed * d.monthlyTotal;
  // 前受け残 = 入金総額 - 消化済売上 - 初期手数料
  var deferred = d.paidTotal - monthlyConsumed - d.initTotal;
  if (deferred < 0) deferred = 0;

  document.getElementById('svc-billing-paid-total').textContent = '¥' + d.paidTotal.toLocaleString();
  document.getElementById('svc-billing-consumed').textContent = '¥' + monthlyConsumed.toLocaleString();
  document.getElementById('svc-billing-deferred').textContent = '¥' + deferred.toLocaleString();

  // 粗利計算
  var initSales = d.initTotal;
  var initCostTotal = d.initCost * d.initCount;
  var initProfit = initSales - initCostTotal;
  var initRate = initSales > 0 ? Math.round(initProfit / initSales * 1000) / 10 : 0;

  var monthlySales = monthlyConsumed;
  var monthlyCostTotal = d.monthlyCost * d.unitCount * consumed;
  var monthlyProfit = monthlySales - monthlyCostTotal;
  var monthlyRate = monthlySales > 0 ? Math.round(monthlyProfit / monthlySales * 1000) / 10 : 0;

  document.getElementById('svc-gp-init-sales').textContent = '¥' + initSales.toLocaleString();
  document.getElementById('svc-gp-init-cost').textContent = '¥' + initCostTotal.toLocaleString();
  document.getElementById('svc-gp-init-profit').textContent = '¥' + initProfit.toLocaleString();
  document.getElementById('svc-gp-init-rate').textContent = initRate + '%';
  document.getElementById('svc-gp-monthly-sales').textContent = '¥' + monthlySales.toLocaleString();
  document.getElementById('svc-gp-monthly-cost').textContent = '¥' + monthlyCostTotal.toLocaleString();
  document.getElementById('svc-gp-monthly-profit').textContent = '¥' + monthlyProfit.toLocaleString();
  document.getElementById('svc-gp-monthly-rate').textContent = monthlyRate + '%';
}

/* --- 詳細：オムロンID描画 --- */
function renderOmronTable(rows) {
  var html = '';
  rows.forEach(function(r) {
    html += '<tr>'
          + '<td style="padding:8px;border-bottom:1px solid var(--border);">' + r.num + '台目</td>'
          + '<td style="padding:8px;border-bottom:1px solid var(--border);">' + r.omronId + '</td>'
          + '<td style="padding:8px;border-bottom:1px solid var(--border);">' + r.initId + '</td>'
          + '<td style="padding:8px;border-bottom:1px solid var(--border);">' + r.initPw + '</td>'
          + '</tr>';
  });
  document.getElementById('svc-omron-tbody').innerHTML = html;
}

/* --- 返金登録 --- */
function openRefundEntry() {
  openModal('service-refund-modal');
}
function saveRefund() {
  var date = document.getElementById('refund-date').value;
  var months = document.getElementById('refund-months').value;
  var amount = document.getElementById('refund-amount').value;
  var reason = document.getElementById('refund-reason').value;
  if (!date || !amount || !reason) { alert('必須項目を入力してください'); return; }
  var tbody = document.getElementById('svc-refund-tbody');
  // 「履歴なし」行を除去
  if (tbody.rows.length === 1 && tbody.rows[0].cells.length === 1) tbody.innerHTML = '';
  var tr = tbody.insertRow();
  tr.innerHTML = '<td style="padding:8px;border-bottom:1px solid var(--border);">' + date + '</td>'
               + '<td style="padding:8px;border-bottom:1px solid var(--border);">' + (months || '—') + 'ヵ月</td>'
               + '<td style="padding:8px;border-bottom:1px solid var(--border);">¥' + parseInt(amount).toLocaleString() + '</td>'
               + '<td style="padding:8px;border-bottom:1px solid var(--border);">' + reason + '</td>';
  closeModal('service-refund-modal');
}

/* --- 新規登録保存（モック） --- */
function saveServiceNew() {
  alert('登録しました（モック）');
  closeModal('service-new-modal');
}

/* --- 一覧フィルター（モック） --- */
function filterServiceList() {
  // 実装：必要に応じてフィルタリングロジックを追加
}