/*
 * AxisCRM — ダミーデータ & ロジック
 *
 * ID採番ルール:
 *   アクシスID   : YYYYMMDD + 3桁連番  例: 20260614001
 *   枝番A  : アクシスID + "A" + 2桁連番  例: 20260614001A01
 *   枝番B  : アクシスID + "B" + 2桁連番  例: 20260614001B01
 *   枝番C  : アクシスID + "C" + 2桁連番  例: 20260614001C01
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

// 案件管理データ（Supabase連携）
window.ordersData = [];
window.salesAData = [];
window.salesADataByKey = {};
window.salesBData = {};
window.subscData = {};

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
// pushHistory=true のとき history.pushState でブラウザ履歴に積む（Chrome戻る対応）。
// popstate からの呼び出しでは pushHistory=false にして二重登録を防ぐ。
function navigate(page, pushHistory = true) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));

  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  const navItem = document.querySelector(`[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  if (pushHistory) {
    history.pushState({ screen: page }, '', '#' + page);
  }
}

// 各ページのデータ読み込み（サイドバークリックと popstate の両方から呼ぶ）
function loadPageData(page) {
  if (page === 'companies') {
    companyCurrentPage = 1;
    loadCompanies();
    applyCompanyFilter();
  } else if (page === 'contacts') {
    loadContacts().then(() => {
      initContactFilter();
      applyContactFilter();
    });
  } else if (page === 'agencies') {
    renderAgencyTable();
  } else if (page === 'products') {
    renderProductTable();
  } else if (page === 'orders') {
    loadOrders().then(() => {
      initOrderFilter();
      applyOrderFilter();
    });
  } else if (page === 'temp-products') {
    renderTempProductTable();
  } else if (page === 'payments') {
    loadUnpaidPayments();
  } else if (page === 'sales-a') {
    // 機器販売（A）は loadOrders が salesAData を投入するため、
    // 最新データを取得してから描画する
    loadOrders().then(() => renderSalesATable());
  } else if (page === 'sales-b') {
    loadOrders().then(() => { if (typeof renderSalesBTable === 'function') renderSalesBTable(); });
  } else if (page === 'sales-c') {
    renderServiceCList();
  }
}

// サイドバーメニュー初期化
document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
  item.addEventListener('click', () => {
    navigate(item.dataset.page);
    loadPageData(item.dataset.page);
  });
});

// ブラウザの戻る／進むボタン対応：履歴状態またはURLハッシュから画面を復元
window.addEventListener('popstate', (e) => {
  let page = (e.state && e.state.screen) ? e.state.screen
           : (window.location.hash || '').replace('#', '');
  if (!page) page = 'dashboard';
  navigate(page, false);   // 履歴は積まずに画面のみ復元
  loadPageData(page);
});

// 初回ロード時の初期化
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  loadCompanies();   // 初回から企業の「アクシスID数／担当者数」を集計して表示
  applyCompanyFilter();
  initContactFilter();
  applyContactFilter();
  renderAgencyTable();
  renderProductTable();
  renderTempProductTable();
  renderSalesATable();
  initOrderFilter();
  applyOrderFilter();
  initPdfDropZone();

  // Chrome戻る対応：初回ロード時のベースライン履歴を確立し、
  // URLハッシュがあればその画面を復元する
  const initialHash = (window.location.hash || '').replace('#', '');
  const initialPage = initialHash || 'dashboard';
  history.replaceState({ screen: initialPage }, '', '#' + initialPage);
  if (initialHash) {
    navigate(initialHash, false);
    loadPageData(initialHash);
  }
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

  // axis_ids テーブルから「アクシスID数」を集計（アクシスID＝アクシスIDの件数）
  // 旧コードは branches（枝番）を数えていたため、列見出し「アクシスID数」と
  // 意味がずれ、枝番未登録の企業が常に 0 件になっていた。
  const { data: axisIds, error: axErr } = await sb
    .from('axis_ids')
    .select('axis_id, company_id');
  if (axErr) { console.error('axis_ids取得エラー:', axErr); return; }

  // contacts テーブルから集計
  const { data: contacts, error: ctErr } = await sb
    .from('contacts')
    .select('id, company_id');
  if (ctErr) { console.error('contacts取得エラー:', ctErr); return; }

  // 企業ごとに件数を集計してマージ（表示用カラム名に変換）
  companiesData = companies.map(c => {
    const axisIdCount = axisIds ? axisIds.filter(a => a.company_id === c.id).length : 0;
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
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteCompany('${company.id}', '${(company.name || '').replace(/'/g, "\\'")}')">
          <i class="ti ti-trash"></i> 削除
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 企業削除（紐づく axis_ids・子テーブル・contacts・branches をカスケード削除）
async function deleteCompany(companyId, companyName) {
  const sb = window._sb;
  if (!sb) { alert('システム初期化中です。'); return; }

  // 紐づくデータの件数確認
  const { data: branches }  = await sb.from('branches').select('id').eq('company_id', companyId);
  const { data: contacts }  = await sb.from('contacts').select('id').eq('company_id', companyId);
  const { data: axisRows }  = await sb.from('axis_ids').select('axis_id').eq('company_id', companyId);

  const counts = [];
  if (branches?.length) counts.push(`拠点 ${branches.length}件`);
  if (contacts?.length) counts.push(`担当者 ${contacts.length}件`);
  if (axisRows?.length) counts.push(`アクシスID ${axisRows.length}件`);

  let confirmMsg = `「${companyName}」を削除しますか？`;
  if (counts.length > 0) {
    confirmMsg += `\n\n⚠️ この企業には以下のデータが紐づいています：\n${counts.join('\n')}\n\nすべて連動して削除されます。本当に削除しますか？`;
  }
  if (!confirm(confirmMsg)) return;

  // カスケード削除：アクシスID配下の子テーブル → axis_ids → contacts → branches → companies
  const axisIds = (axisRows || []).map(a => a.axis_id);
  if (axisIds.length > 0) {
    for (const table of ['sales_a', 'construction_b', 'service_c']) {
      const { error } = await sb.from(table).delete().in('axis_id', axisIds);
      if (error) { alert(`${table} の削除に失敗: ` + error.message); return; }
    }
    const { error: axErr } = await sb.from('axis_ids').delete().eq('company_id', companyId);
    if (axErr) { alert('axis_ids の削除に失敗: ' + axErr.message); return; }
  }
  if (contacts?.length) {
    const { error } = await sb.from('contacts').delete().eq('company_id', companyId);
    if (error) { alert('contacts の削除に失敗: ' + error.message); return; }
  }
  if (branches?.length) {
    const { error } = await sb.from('branches').delete().eq('company_id', companyId);
    if (error) { alert('branches の削除に失敗: ' + error.message); return; }
  }

  const { error } = await sb.from('companies').delete().eq('id', companyId);
  if (error) { alert('削除に失敗しました: ' + error.message); return; }

  alert('削除しました');
  await loadCompanies();   // 一覧再読み込み（集計含む）
}

function jumpToAxisList(companyName) {
  navigate('orders');
  initOrderFilter();

  const subtitle = document.getElementById('orders-subtitle');
  const clearBtn = document.getElementById('orders-clear-filter');
  if (subtitle) subtitle.textContent = companyName + ' の案件（アクシスID）一覧';
  if (clearBtn) clearBtn.style.display = 'inline-flex';

  // 企業フィルタはプルダウンを廃止し、選択中企業をグローバル変数で保持する
  selectedOrderCompany = companyName;
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

  // 担当者一覧が空になる場合、まず Supabase で contacts の中身を確認:
  //   -- SELECT id, company_id, last_name, first_name FROM contacts;
  // 旧コードは companies ( name ) を埋め込んでいたが、companies の実カラムは
  // company_name のため埋め込みクエリ全体がエラーになり、contactsData が空になっていた。
  // branches ( name ) も列名未確認のため埋め込みを外し、クエリの依存を最小化する。
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
      companies ( company_name )
    `)
    .order('last_name', { ascending: true });

  if (error) {
    console.error('担当者データの取得に失敗しました:', error);
    return;
  }

  // 各担当者に紐づくアクシスID数を axis_ids.contact_id から集計
  const { data: axisRows } = await sb.from('axis_ids').select('axis_id, contact_id');
  const axisCountByContact = {};
  (axisRows || []).forEach(a => {
    if (a.contact_id != null) {
      axisCountByContact[a.contact_id] = (axisCountByContact[a.contact_id] || 0) + 1;
    }
  });

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
    companyName:  c.companies?.company_name ?? '—',
    branchName:   '—',
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
    axisIdCount:  axisCountByContact[c.id] || 0,
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
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteContact('${contact.id}', '${(contact.name || '').replace(/'/g, "\\'")}')">
          <i class="ti ti-trash"></i> 削除
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 担当者削除（紐づくアクシスID件数を確認のうえ削除）
async function deleteContact(contactId, name) {
  const sb = window._sb;
  if (!sb) { alert('システム初期化中です。'); return; }

  const { count } = await sb
    .from('axis_ids')
    .select('axis_id', { count: 'exact', head: true })
    .eq('contact_id', contactId);

  let msg = `「${name}」を削除しますか？`;
  if (count && count > 0) {
    msg += `\n\n⚠️ ${count}件のアクシスID（案件）に紐づいています。担当者を削除すると案件側の担当者参照が外れます。続行しますか？`;
  }
  if (!confirm(msg)) return;

  const { error } = await sb.from('contacts').delete().eq('id', contactId);
  if (error) { alert('削除失敗: ' + error.message); return; }

  alert('削除しました');
  await loadContacts();
  applyContactFilter();
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
// ===== 案件管理 Supabase連携 =====
async function loadOrders() {
  const sb = window._sb;
  if (!sb) return;

  // 1. axis_ids（アクシスID一覧）を取得
  const { data: axisRows, error: axisErr } = await sb
    .from('axis_ids')
    .select(`
      axis_id,
      apply_date,
      status,
      notes,
      companies ( company_name ),
      contacts ( last_name, first_name )
    `)
    .order('apply_date', { ascending: false });

  if (axisErr) {
    console.error('axis_ids取得エラー:', axisErr);
  }

  // 2. sales_a（機器販売）を取得
  const { data: salesARows, error: salesAErr } = await sb
    .from('sales_a')
    .select(`
      id,
      branch_id,
      axis_id,
      quantity,
      unit_price,
      cost_price,
      status,
      billing_status,
      delivery_date,
      notes,
      products ( product_name, product_code )
    `);

  if (salesAErr) {
    console.error('sales_a取得エラー:', salesAErr);
  }

  // 3. construction_b（工事管理）を取得
  const { data: salesBRows, error: salesBErr } = await sb
    .from('construction_b')
    .select(`
      id,
      branch_id,
      axis_id,
      work_name,
      unit_price,
      cost_price,
      status,
      billing_status,
      scheduled_date,
      completed_date,
      notes
    `);

  if (salesBErr) {
    console.error('construction_b取得エラー:', salesBErr);
  }

  // 4. service_c（サービス管理）を取得
  const { data: subscRows, error: subscErr } = await sb
    .from('service_c')
    .select(`
      id,
      branch_id,
      axis_id,
      unit_price,
      cost_price,
      status,
      billing_status,
      contract_start,
      contract_end,
      renewal_count,
      parent_branch_id,
      notes,
      products ( product_name )
    `);

  if (subscErr) {
    console.error('service_c取得エラー:', subscErr);
  }

  // 5. sales_a を window.salesAData 形式に変換
  // branch_idでグループ化（同一axis_idの複数商品を items[] にまとめる）
  const salesAMap = {};
  (salesARows || []).forEach(row => {
    const key = row.branch_id;
    if (!salesAMap[key]) {
      salesAMap[key] = {
        id: row.id,
        axisId: row.branch_id,
        company: '',  // ordersDataから後で補完
        status: row.status || '受注',
        items: [],
        deliveryDate: row.delivery_date || null,
        delivery: row.delivery_date ? row.delivery_date.replace(/-/g, '/') : '未設定',
        billingStatus: row.billing_status || '未請求',
        invoice: row.billing_status || '未請求',
        attachments: []
      };
    }
    salesAMap[key].items.push({
      name: row.products ? row.products.product_name : '（商品未設定）',
      code: row.products ? row.products.product_code || '' : '',
      qty: String(row.quantity || 1) + '台',
      unit: row.unit_price || 0,
      sub: (row.unit_price || 0) * (row.quantity || 1),
      cost: row.cost_price || 0
    });
  });
  window.salesAData = Object.values(salesAMap);
  window.salesADataByKey = {};
  window.salesAData.forEach(d => { window.salesADataByKey[d.axisId] = d; });

  // 6. construction_b を window.salesBData 形式に変換
  window.salesBData = {};
  (salesBRows || []).forEach(row => {
    window.salesBData[row.branch_id] = {
      company: '',  // ordersDataから後で補完
      name: row.work_name || '（工事名未設定）',
      status: row.status || '受注',
      items: [{
        name: row.work_name || '（工事名未設定）',
        desc: row.notes || '',
        qty: '1式',
        sell: row.unit_price || 0,
        cost: row.cost_price || 0
      }]
    };
  });

  // 7. service_c を window.subscData 形式に変換
  window.subscData = {};
  (subscRows || []).forEach(row => {
    window.subscData[row.branch_id] = {
      company: '',  // ordersDataから後で補完
      plan: row.products ? row.products.product_name : '（プラン未設定）',
      monthly: row.unit_price || 0,
      cost: row.cost_price || 0,
      timeline: [{
        id: row.branch_id ? row.branch_id.slice(-3) : 'C01',
        period: (row.contract_start || '?') + '〜' + (row.contract_end || '?'),
        status: row.status === '契約中' ? 'current' : 'ended'
      }]
    };
  });

  // 8. axis_ids を window.ordersData 形式に変換
  window.ordersData = (axisRows || []).map(row => {
    const axisId = row.axis_id;
    const companyName = row.companies ? row.companies.company_name : '（企業未設定）';
    const branchName = '';
    const contactName = row.contacts
      ? (row.contacts.last_name + ' ' + row.contacts.first_name)
      : '（担当者未設定）';

    // この axis_id に紐づく枝番を収集
    const children = [];
    const types = [];

    // A枝番
    const aItems = (salesARows || []).filter(r => r.axis_id === axisId);
    if (aItems.length > 0) {
      types.push('A');
      // branch_idでユニーク化
      const branchIds = [...new Set(aItems.map(r => r.branch_id))];
      branchIds.forEach(bid => {
        const items = aItems.filter(r => r.branch_id === bid);
        const total = items.reduce((s, r) => s + (r.unit_price || 0) * (r.quantity || 1), 0);
        children.push({
          cid: bid,
          tag: 'a',
          desc: '機器販売　' + items.length + '品 / ¥' + total.toLocaleString(),
          target: 'sales-a'
        });
        // company名を補完
        if (window.salesADataByKey[bid]) {
          window.salesADataByKey[bid].company = companyName;
        }
      });
    }

    // B枝番
    const bItems = (salesBRows || []).filter(r => r.axis_id === axisId);
    if (bItems.length > 0) {
      types.push('B');
      bItems.forEach(row => {
        children.push({
          cid: row.branch_id,
          tag: 'b',
          desc: '工事　' + (row.work_name || '工事') + ' ¥' + (row.unit_price || 0).toLocaleString(),
          target: 'sales-b'
        });
        if (window.salesBData[row.branch_id]) {
          window.salesBData[row.branch_id].company = companyName;
        }
      });
    }

    // C枝番
    const cItems = (subscRows || []).filter(r => r.axis_id === axisId);
    if (cItems.length > 0) {
      types.push('C');
      cItems.forEach(row => {
        const planName = row.products ? row.products.product_name : 'サービス';
        children.push({
          cid: row.branch_id,
          tag: 'c',
          desc: 'サブスク　' + planName + ' ¥' + (row.unit_price || 0).toLocaleString() + '/月',
          target: 'sales-c'
        });
        if (window.subscData[row.branch_id]) {
          window.subscData[row.branch_id].company = companyName;
        }
      });
    }

    const dateStr = row.apply_date
      ? row.apply_date.replace(/-/g, '/')
      : '';

    return {
      pid: axisId,
      company: companyName,
      branch: branchName,
      contact: contactName,
      date: dateStr,
      types: types,
      branchCountText: children.length + '件',
      children: children
    };
  });

  // 9. KPI集計を実データで更新（一覧と数字を一致させる）
  loadOrderStats();

  // 10. 案件一覧画面が表示中なら再描画
  const section = document.getElementById('page-orders') || document.getElementById('section-orders');
  if (section && section.classList.contains('active')) {
    renderOrderTable(window.ordersData);
  }
}

// 案件管理KPI（今月の申込書・発行済み枝番・累計）を window.ordersData から集計。
// ハードコードされた固定値（6件/8件/89件）を実データで上書きする。
function loadOrderStats() {
  const orders = window.ordersData || [];

  // 累計申込書 = アクシスID（親）の総数
  const total = orders.length;

  // 今月の申込書（date は "YYYY/MM/DD" 形式）
  const now = new Date();
  const ym = now.getFullYear() + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/';
  const monthCount = orders.filter(o => (o.date || '').startsWith(ym)).length;

  // 発行済み枝番（A/B/C 別）
  let a = 0, b = 0, c = 0;
  orders.forEach(o => {
    (o.children || []).forEach(ch => {
      if (ch.tag === 'a') a++;
      else if (ch.tag === 'b') b++;
      else if (ch.tag === 'c') c++;
    });
  });
  const branchTotal = a + b + c;

  const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
  set('orders-kpi-month',    monthCount + '件');
  set('orders-kpi-total',    total + '件');
  set('orders-kpi-branches', branchTotal + '件');
  set('orders-kpi-sub',      `A:${a} B:${b} C:${c}（現行）`);
}

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
      <td><button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); openAxisDetailModal('${order.pid}')"><i class="ti ti-eye"></i> 詳細</button></td>
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

// 案件一覧で選択中の企業名（企業一覧からの遷移時にセット）。
// 企業名プルダウンは廃止し、この変数だけで絞り込みを行う。
let selectedOrderCompany = '';

// =========================================================
// アクシスID詳細モーダル（詳細ボタン）／ 管理者向け削除
// =========================================================
function openAxisDetailModal(pid) {
  const order = (window.ordersData || []).find(o => o.pid === pid);
  if (!order) { alert('アクシスIDが見つかりません: ' + pid); return; }

  const isAdmin = !!(window.currentUser && window.currentUser.role === 'admin');

  const childrenHtml = (order.children || []).map(c => {
    const delBtn = isAdmin
      ? `<button onclick="deleteAxisBranch('${order.pid}','${c.cid}','${c.tag}')"
           style="padding:3px 10px;background:#ef4444;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:12px;">枝番削除</button>`
      : '';
    return `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;"><span class="cid-${c.tag}">${c.cid}</span></td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;">${c.desc}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${delBtn}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="3" style="padding:10px;color:#888;">枝番はありません</td></tr>';

  const adminDeleteAxis = isAdmin
    ? `<button onclick="deleteAxisId('${order.pid}')"
         style="padding:8px 16px;background:#b91c1c;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;">
         <i class="ti ti-trash"></i> アクシスID削除（枝番含む）</button>`
    : '';

  // 既存のオーバーレイがあれば除去
  const existing = document.getElementById('axis-detail-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'axis-detail-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10002;display:flex;align-items:center;justify-content:center;';
  overlay.onclick = (e) => { if (e.target === overlay) closeAxisDetailModal(); };
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:14px;padding:28px;width:100%;max-width:640px;max-height:85vh;overflow:auto;box-shadow:0 8px 32px rgba(0,0,0,0.2);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div style="font-size:18px;font-weight:700;">アクシスID詳細：${order.pid}</div>
        <button onclick="closeAxisDetailModal()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#888;">×</button>
      </div>
      <div style="font-size:13px;line-height:1.9;margin-bottom:16px;">
        <div><b>企業名：</b>${order.company || '—'}</div>
        <div><b>担当者：</b>${order.contact || '—'}</div>
        <div><b>申込日：</b>${order.date || '—'}</div>
        <div><b>取引種別：</b>${(order.types || []).join('・') || '—'}</div>
      </div>
      <div style="font-weight:700;margin-bottom:8px;">枝番一覧（${(order.children || []).length}件）</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px;">
        <thead><tr style="background:#f5f5f5;">
          <th style="padding:6px 8px;text-align:left;">枝番ID</th>
          <th style="padding:6px 8px;text-align:left;">内容</th>
          <th style="padding:6px 8px;text-align:center;width:90px;">操作</th>
        </tr></thead>
        <tbody>${childrenHtml}</tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        ${adminDeleteAxis}
        <button onclick="closeAxisDetailModal()" style="padding:8px 16px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;font-size:13px;">閉じる</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function closeAxisDetailModal() {
  const overlay = document.getElementById('axis-detail-overlay');
  if (overlay) overlay.remove();
}

// 枝番タグ → 子テーブル名のマッピング
const _branchTableByTag = { a: 'sales_a', b: 'construction_b', c: 'service_c' };

// 枝番を1件削除（管理者のみ）
async function deleteAxisBranch(pid, cid, tag) {
  if (!window.currentUser || window.currentUser.role !== 'admin') { alert('権限がありません。'); return; }
  if (!confirm(`枝番「${cid}」を削除します。よろしいですか？`)) return;
  const sb = window._sb;
  if (!sb) return;
  const table = _branchTableByTag[tag];
  if (!table) { alert('不明な枝番種別: ' + tag); return; }
  const { error } = await sb.from(table).delete().eq('branch_id', cid);
  if (error) { alert('枝番削除エラー: ' + error.message); return; }
  await loadOrders();
  applyOrderFilter();
  openAxisDetailModal(pid); // 残りの枝番で再描画
}

// アクシスID（親）と紐づく全枝番を削除（管理者のみ）
async function deleteAxisId(pid) {
  if (!window.currentUser || window.currentUser.role !== 'admin') { alert('権限がありません。'); return; }
  if (!confirm(`アクシスID「${pid}」と紐づく全枝番（機器販売A・工事B・サービスC）を削除します。\nこの操作は元に戻せません。よろしいですか？`)) return;
  const sb = window._sb;
  if (!sb) return;

  // 子テーブル → 親（axis_ids）の順に削除
  const childTables = ['sales_a', 'construction_b', 'service_c'];
  for (const table of childTables) {
    const { error } = await sb.from(table).delete().eq('axis_id', pid);
    if (error) { alert(`${table} の削除エラー: ` + error.message); return; }
  }
  const { error: axErr } = await sb.from('axis_ids').delete().eq('axis_id', pid);
  if (axErr) { alert('axis_ids の削除エラー: ' + axErr.message); return; }

  closeAxisDetailModal();
  await loadOrders();
  applyOrderFilter();
  alert(`アクシスID「${pid}」を削除しました。`);
}

let orderFilterInitialized = false;
function initOrderFilter() {
  // 企業名プルダウンは廃止したため、ここでの初期化処理は不要。
  orderFilterInitialized = true;
}

function applyOrderFilter() {
  const q = document.getElementById('order-search-input')?.value.trim().toLowerCase() || '';
  const companyFilter = selectedOrderCompany || '';

  const filtered = (window.ordersData || []).filter(o => {
    const matchQ = o.pid.includes(q) || o.company.toLowerCase().includes(q) || o.contact.toLowerCase().includes(q) || (o.children && o.children.some(c => c.cid.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)));
    const matchCompany = companyFilter === '' || o.company === companyFilter;
    return matchQ && matchCompany;
  });

  renderOrderTable(filtered);
}

function clearOrderFilter() {
  const searchInput = document.getElementById('order-search-input');
  if (searchInput) searchInput.value = '';
  selectedOrderCompany = '';

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
    const safeName = (a.agency_name || '').replace(/'/g, "\\'");
    return `<tr>
      <td>${a.agency_name || ''}</td>
      <td>${a.agency_name_kana || ''}</td>
      <td>${a.phone || ''}</td>
      <td>—</td>
      <td>${a.address || ''}</td>
      <td>${a.notes || ''}</td>
      <td>—</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openAgencyEditModal('${a.id}')">編集</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAgency('${a.id}', '${safeName}')">削除</button>
      </td>
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

async function openAgencyEditModal(agencyId) {
  const sb = window._sb;
  if (!sb) { alert('システム初期化中です。'); return; }

  // Supabase から対象の代理店を取得（旧コードは未同期の agenciesData を参照して失敗していた）
  const { data: agency, error } = await sb
    .from('agencies')
    .select('*')
    .eq('id', agencyId)
    .single();
  if (error || !agency) { alert('代理店の取得に失敗しました: ' + (error?.message || '該当なし')); return; }

  document.getElementById('agency-modal-title').textContent = '代理店 編集';
  document.getElementById('agency-edit-id').value = agency.id;
  document.getElementById('agency-name').value = agency.agency_name || '';
  document.getElementById('agency-furigana').value = agency.agency_name_kana || '';
  document.getElementById('agency-tel').value = agency.phone || '';
  document.getElementById('agency-email').value = '';
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

async function saveAgency() {
  const editId = document.getElementById('agency-edit-id').value;
  const name = document.getElementById('agency-name').value.trim();
  if (!name) { alert('代理店名を入力してください'); return; }
  const furigana = document.getElementById('agency-furigana').value.trim();
  const tel = document.getElementById('agency-tel').value.trim();
  const email = document.getElementById('agency-email').value.trim();
  const address = document.getElementById('agency-address').value.trim();
  // 複数企業名を配列で取得（「＋追加」で増えた入力欄もすべて拾う）
  const linkedCompanies = Array.from(
    document.querySelectorAll('.agency-company-input')
  ).map(input => input.value.trim()).filter(v => v !== '');
  const linkedAxisIds = Array.from(document.querySelectorAll('.agency-axis-id-input')).map(input => input.value.trim()).filter(v => v !== '');

  const sb = window._sb;
  if (!sb) { alert('システム初期化中です。もう一度お試しください。'); return; }

  // 紐づく企業・アクシスIDは専用カラム／中間テーブルが未確定のため、
  // 当面は notes に集約して保存する（情報が失われないようにする暫定対応）。
  const noteParts = [];
  if (email) noteParts.push('Email: ' + email);
  if (linkedCompanies.length) noteParts.push('紐づく企業: ' + linkedCompanies.join('、'));
  if (linkedAxisIds.length) noteParts.push('紐づくアクシスID: ' + linkedAxisIds.join('、'));
  const notes = noteParts.join(' / ');

  const record = {
    agency_name:      name,
    agency_name_kana: furigana,
    phone:            tel,
    address:          address,
    notes:            notes
  };

  let error;
  if (editId) {
    ({ error } = await sb.from('agencies').update(record).eq('id', editId));
  } else {
    ({ error } = await sb.from('agencies').insert([record]));
  }

  if (error) {
    alert('代理店の保存に失敗しました: ' + error.message);
    return;
  }

  closeModal('agency-modal');
  await renderAgencyTable();
}

async function deleteAgency(id, name) {
  if (!confirm(`代理店「${name || ''}」を削除してもよろしいですか？`)) return;
  const sb = window._sb;
  if (!sb) { alert('システム初期化中です。'); return; }
  const { error } = await sb.from('agencies').delete().eq('id', id);
  if (error) { alert('削除失敗: ' + error.message); return; }
  alert('削除しました');
  await renderAgencyTable();
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

// ===== 臨時商品マスタ：Supabaseデータ（temp_products） =====
let tempProductsData = [];

// temp_products から読み込み（表示用フィールドへ正規化）
async function loadTempProducts() {
  const sb = window._sb;
  if (!sb) return [];
  const { data, error } = await sb
    .from('temp_products')
    .select('id, product_name, unit, unit_price, cost_price, notes, created_at')
    .order('created_at', { ascending: true });
  if (error) { console.error('temp_products取得エラー:', error); return []; }
  tempProductsData = (data || []).map((r, i) => ({
    id:    r.id,
    code:  'TEMP-' + String(i + 1).padStart(3, '0'),
    name:  r.product_name || '',
    price: r.unit_price != null ? r.unit_price : 0,
    cost:  r.cost_price != null ? r.cost_price : 0,
    unit:  r.unit || '',
    note:  r.notes || ''
  }));
  return tempProductsData;
}

// ===== 臨時商品マスタ：テーブル描画 =====
async function renderTempProductTable() {
  const tbody = document.querySelector('#temp-product-table tbody');
  if (!tbody) return;
  await loadTempProducts();
  tbody.innerHTML = '';
  if (tempProductsData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="padding:16px;text-align:center;color:#9ca3af;">臨時商品はまだ登録されていません</td></tr>';
    return;
  }
  tempProductsData.forEach(product => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product.code}</td>
      <td>${product.name}</td>
      <td style="text-align:right;">¥${product.price.toLocaleString()}</td>
      <td style="text-align:right;">¥${product.cost.toLocaleString()}</td>
      <td style="text-align:center;">${product.unit}</td>
      <td style="color:#6b7280;font-size:12px;">${product.note || '—'}</td>
      <td style="text-align:center;color:#9ca3af;">—</td>
      <td style="text-align:center;color:#9ca3af;">—</td>
      <td>
        <button class="btn-edit"
          onclick="openTempProductEditModal('${product.id}')"
          style="padding:4px 10px;background:#2563eb;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px;">
          編集
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== 臨時商品マスタ：新規登録（temp_productsへINSERT） =====
let editingTempProductId = null;

function openNewTempProductModal() {
  editingTempProductId = null; // 新規モード
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  setVal('edit-temp-product-code', '（保存時に自動採番）');
  setVal('edit-temp-product-name', '');
  setVal('edit-temp-product-price', '');
  setVal('edit-temp-product-cost', '');
  setVal('edit-temp-product-unit', '');
  setVal('edit-temp-product-note', '');
  const hist = document.getElementById('temp-product-price-history-body');
  if (hist) hist.innerHTML = '<tr><td colspan="3" style="padding:8px;text-align:center;color:#9ca3af;">履歴なし</td></tr>';
  document.getElementById('temp-product-edit-modal').style.display = 'flex';
}

function openTempProductEditModal(productId) {
  const product = tempProductsData.find(p => String(p.id) === String(productId));
  if (!product) return;
  editingTempProductId = productId; // 既存モード（uuid）

  document.getElementById('edit-temp-product-code').value  = product.code  || '';
  document.getElementById('edit-temp-product-name').value  = product.name  || '';
  document.getElementById('edit-temp-product-price').value = product.price || '';
  document.getElementById('edit-temp-product-cost').value  = product.cost  || '';
  document.getElementById('edit-temp-product-unit').value  = product.unit  || '';
  document.getElementById('edit-temp-product-note').value  = product.note  || '';

  const tbody = document.getElementById('temp-product-price-history-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="3" style="padding:8px;text-align:center;color:#9ca3af;">履歴なし</td></tr>';

  document.getElementById('temp-product-edit-modal').style.display = 'flex';
}

function closeTempProductEditModal() {
  document.getElementById('temp-product-edit-modal').style.display = 'none';
  editingTempProductId = null;
}

async function saveTempProductEdit() {
  const sb = window._sb;
  const name  = document.getElementById('edit-temp-product-name').value.trim();
  const price = parseInt(document.getElementById('edit-temp-product-price').value) || 0;
  const cost  = parseInt(document.getElementById('edit-temp-product-cost').value)  || 0;
  const unit  = document.getElementById('edit-temp-product-unit').value.trim();
  const note  = document.getElementById('edit-temp-product-note').value.trim();

  if (!name) { alert('商品名を入力してください'); return; }

  try {
    if (editingTempProductId == null) {
      // 新規登録 → temp_products へ INSERT
      const { error } = await sb.from('temp_products').insert({
        product_name: name,
        unit:         unit || null,
        unit_price:   price,
        cost_price:   cost,
        notes:        note || null
      });
      if (error) throw error;
      alert(`臨時商品「${name}」を登録しました`);
    } else {
      // 既存更新 → temp_products を UPDATE
      const { error } = await sb.from('temp_products').update({
        product_name: name,
        unit:         unit || null,
        unit_price:   price,
        cost_price:   cost,
        notes:        note || null
      }).eq('id', editingTempProductId);
      if (error) throw error;
      alert(`臨時商品「${name}」を更新しました`);
    }
    closeTempProductEditModal();
    await renderTempProductTable();
  } catch (err) {
    console.error('saveTempProductEdit error:', err);
    alert('臨時商品の保存に失敗しました: ' + (err.message || err));
  }
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
    // №8: Step3に入ったら、メイン担当者カードをPDF抽出（Step1入力）の担当者で更新
    if (currentWizardStep === 3) syncStep3MainContact();
  }
}

// №8: 申込書PDFから抽出した担当者を Step3 の★メイン担当者カードに反映する。
// ハードコードのサンプル（山田健太）を、実際の発注者担当者で上書きする。
function syncStep3MainContact() {
  const card = document.getElementById('contact-0');
  if (!card) return;
  const get = (id) => (document.getElementById(id)?.value || '').trim();
  const name = get('s1-name');
  if (!name) return;   // 抽出できていない場合は既存表示を維持

  const dept  = get('s1-dept');
  const tel   = get('s1-tel');
  const fax   = get('s1-mobile');
  const email = get('s1-email');

  const nameEl = card.querySelector('.contact-card-name');
  if (nameEl) nameEl.textContent = name;

  // フォーム入力欄（順序：氏名/役職/部署/電話/FAX/携帯/メール）
  const inputs = card.querySelectorAll('.contact-card-form .form-control');
  // [0]氏名 [1]役職 [2]部署 [3]電話 [4]FAX [5]携帯 [6]メール
  if (inputs[0]) inputs[0].value = name;
  if (inputs[1]) inputs[1].value = '';      // 役職はPDFに無いことが多いのでクリア
  if (inputs[2]) inputs[2].value = dept;
  if (inputs[3]) inputs[3].value = tel;
  if (inputs[4]) inputs[4].value = fax;
  if (inputs[5]) inputs[5].value = '';      // 携帯
  if (inputs[6]) inputs[6].value = email;
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

// ドロップゾーンのクリック → 隠しファイル入力を起動
function handleFileUpload() {
  const input = document.getElementById('pdf-file-input');
  if (input) input.click();
}

// ドラッグ&ドロップでPDFを受け付ける初期化
// 注: 実IDは file-dropzone / pdf-file-input。クリックは既存の inline onclick
//     (handleFileUpload) が担うため、ここでは click リスナーは追加しない（二重起動防止）。
function initPdfDropZone() {
  const dropZone = document.getElementById('file-dropzone');
  const fileInput = document.getElementById('pdf-file-input');
  if (!dropZone || !fileInput) return;

  // ドラッグオーバー（必須：これがないとdropが発火しない）
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
  });

  // ドロップ
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      fileInput.files = files;
      // 既存のファイル選択ハンドラ(onPdfFileSelected)を呼び出し
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

// PDF選択時：base64化 → Edge FunctionでAI解析 → Step1/Step2に反映
async function onPdfFileSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (file.type !== 'application/pdf') {
    alert('PDFファイルを選択してください');
    event.target.value = '';
    return;
  }

  const dz = document.getElementById('file-dropzone');
  if (dz) {
    dz.style.borderColor = 'var(--accent)';
    dz.style.backgroundColor = '#EEF4FB';
    dz.innerHTML = '<i class="ti ti-loader"></i><div style="font-size:14px;font-weight:600;margin-bottom:4px;color:var(--accent);">アップロード中...</div>';
  }

  try {
    const base64 = await fileToBase64(file);
    fileUploaded = true;
    if (dz) {
      dz.innerHTML = '<i class="ti ti-file-type-pdf" style="color:var(--accent);"></i>'
        + '<div style="font-size:14px;font-weight:600;margin-bottom:4px;color:var(--accent);">'
        + escapeHtml(file.name) + ' をアップロードしました</div>';
    }
    document.getElementById('step1-form-container').style.display = 'block';
    validateStep1();
    await analyzePdf(base64);
  } catch (e) {
    console.error('PDF読み込みエラー:', e);
    if (dz) dz.innerHTML = '<div style="color:red;font-size:14px;">PDFの読み込みに失敗しました</div>';
  }
}

// FileをDataURL経由でbase64（dataプレフィックス無し）に変換
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error('read error'));
    reader.readAsDataURL(file);
  });
}

// Edge Function「extract-pdf」を呼び出してAI解析
async function analyzePdf(base64) {
  const sb = window._sb;
  const tbody = document.getElementById('step2-extract-tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="4" style="padding:14px;text-align:center;color:var(--text-muted);">AIが申込書を解析中...</td></tr>';
  }
  try {
    if (!sb || !sb.functions) throw new Error('Supabaseクライアントが利用できません');
    const { data, error } = await sb.functions.invoke('extract-pdf', {
      body: { pdfBase64: base64 }
    });
    if (error) throw error;
    if (!data || !data.extraction) {
      throw new Error((data && data.error) || '抽出結果が取得できませんでした');
    }
    // №7: 既存企業マッチング結果を保持（Step2の候補表示に利用可能）
    window._companyMatches = Array.isArray(data.company_matches) ? data.company_matches : [];
    if (window._companyMatches.length > 0) {
      console.log('[企業マッチング候補]', window._companyMatches);
    }
    renderCompanyMatches(window._companyMatches);
    applyExtraction(data.extraction);
  } catch (e) {
    console.error('PDF解析エラー:', e);
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="4" style="padding:14px;text-align:center;color:red;">解析に失敗しました: '
        + escapeHtml(e.message || String(e)) + '</td></tr>';
    }
  }
}

// 抽出結果をStep1フォーム（手修正用）とStep2読み取り結果テーブルに反映
function applyExtraction(ex) {
  const fld = (k) => (ex && ex[k] && typeof ex[k] === 'object') ? ex[k] : { value: '', confidence: 0 };
  const setVal = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };

  setVal('s1-company',      fld('company_name').value);
  setVal('s1-company-kana', fld('company_name_kana').value);
  setVal('s1-name',         fld('contact_name').value);
  setVal('s1-tel',          fld('tel').value);
  setVal('s1-mobile',       fld('fax').value);   // FAX欄
  setVal('s1-address',      fld('address').value);
  setVal('s1-email',        fld('email').value);
  setVal('s1-dept',         fld('department').value);
  // D-3: お申込日（YYYY-MM-DD）／ D-2: 備考・特記事項
  setVal('s1-date',         fld('apply_date').value);
  setVal('s1-notes',        fld('notes').value);

  // D-6: サブスク記載が無い（subscription === null）場合は C 項目セクションを非表示にする
  applySubscriptionVisibility(ex ? ex.subscription : undefined);

  validateStep1();

  renderExtractionTable(ex);
}

// subscription が null（サブスク記載なし）の場合に C 項目セクションを隠す。
// subscription オブジェクトがある場合は表示し、可能なら月額・台数を反映する。
function applySubscriptionVisibility(subscription) {
  const cSection = document.getElementById('step4-c-section');
  const includeC = document.getElementById('include-c');
  if (subscription === null) {
    if (cSection) cSection.style.display = 'none';
    if (includeC) includeC.checked = false;
    return;
  }
  if (cSection) cSection.style.display = '';
  if (includeC) includeC.checked = true;
  if (subscription && typeof subscription === 'object') {
    const priceEl = document.getElementById('step4-subsc-price');
    const qtyEl   = document.getElementById('step4-subsc-qty');
    if (priceEl && subscription.monthly_unit_price) priceEl.value = subscription.monthly_unit_price;
    if (qtyEl   && subscription.unit_count)         qtyEl.value   = subscription.unit_count;
  }
}

// Step2「申込書読み取り結果」テーブルを実APIレスポンスで描画
function renderExtractionTable(ex) {
  const tbody = document.getElementById('step2-extract-tbody');
  if (!tbody) return;
  const rows = [
    ['会社名', 'company_name'],
    ['フリガナ', 'company_name_kana'],
    ['担当者名', 'contact_name'],
    ['部署名', 'department'],
    ['TEL', 'tel'],
    ['FAX', 'fax'],
    ['住所', 'address'],
    ['E-mail', 'email'],
  ];
  tbody.innerHTML = rows.map(([label, key]) => {
    const f = (ex && ex[key] && typeof ex[key] === 'object') ? ex[key] : { value: '', confidence: 0 };
    const conf = Math.max(0, Math.min(100, parseInt(f.confidence, 10) || 0));
    const cls = conf >= 85 ? 'high' : (conf >= 60 ? 'mid' : '');
    const pctStyle = conf >= 85 ? '' : ' style="color:#854F0B;"';
    const valDisp = f.value ? escapeHtml(f.value) : '<span class="text-muted">—</span>';
    return '<tr>'
      + '<td>' + label + '</td>'
      + '<td class="fw-700">' + valDisp + '</td>'
      + '<td><span class="src-pdf">PDF</span></td>'
      + '<td><div class="confidence-bar-wrap"><div class="confidence-bar"><div class="confidence-fill ' + cls + '" style="width:' + conf + '%"></div></div>'
      + '<span class="confidence-pct"' + pctStyle + '>' + conf + '%</span></div></td>'
      + '</tr>';
  }).join('');
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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

// 郵便番号検索（モック）は廃止しました（Phase5で削除）。

// ===== ウィザード：企業候補検索（Supabase） =====
async function searchCompanyCandidates() {
  const companyName = document.getElementById('s1-company')?.value?.trim() || '';
  const container = document.getElementById('company-candidates-container');
  if (!container) return;

  if (!companyName) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">企業名を入力してください。</p>';
    document.getElementById('step2-next')?.classList.add('btn-disabled');
    return;
  }

  container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">検索中...</p>';

  const sb = window._sb;
  const { data, error } = await sb
    .from('companies')
    .select('id, company_name, company_name_kana, phone, postal_code, address')
    .ilike('company_name', `%${companyName}%`)
    .limit(5);

  if (error) {
    container.innerHTML = `<p style="color:red;font-size:13px;">検索エラー：${error.message}</p>`;
    return;
  }

  window._wizardCandidates = data || [];
  renderCompanyCandidates(companyName);
}

// №7: AIによる既存企業マッチング候補をStep2にスコアバー付きで表示。
// matches: [{company_id, company_name, score, reason}]
function getScoreColor(score) {
  if (score >= 90) return '#22c55e';  // 緑
  if (score >= 70) return '#eab308';  // 黄
  return '#f97316';                   // 橙
}

function renderCompanyMatches(matches) {
  const container = document.getElementById('company-candidates-container');
  if (!container) return;
  if (!Array.isArray(matches) || matches.length === 0) return;

  // 選択できるよう _wizardCandidates にも反映（id と company_name を保持）
  window._wizardCandidates = matches.map(m => ({
    id: m.company_id,
    company_name: m.company_name
  }));

  let html = '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">AIが既存企業との類似度を判定しました。該当があれば選択してください。</div>';
  matches.forEach((m, i) => {
    const score = Math.max(0, Math.min(100, parseInt(m.score, 10) || 0));
    html += `
      <div class="candidate-card" id="cand-db-${i}" onclick="selectCompanyCandidate('db', ${i})">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <div style="flex:1;height:8px;background:#eee;border-radius:4px;overflow:hidden;">
            <div style="width:${score}%;height:100%;background:${getScoreColor(score)};"></div>
          </div>
          <span style="font-size:12px;font-weight:700;color:${getScoreColor(score)};">${score}%</span>
        </div>
        <div class="candidate-name">${m.company_name || ''}</div>
        <div class="candidate-detail">${m.reason || ''}</div>
      </div>`;
  });
  html += `
    <div class="candidate-card new" id="cand-new" onclick="selectCompanyCandidate('new', -1)">
      <div class="candidate-match" style="color:var(--text-muted);">○ 新規企業として登録</div>
      <div class="candidate-detail">候補に該当が無ければ新規登録します</div>
    </div>`;

  container.innerHTML = html;
  document.getElementById('step2-next')?.classList.add('btn-disabled');
  selectedCandidate = null;
}

function renderCompanyCandidates(inputName) {
  const container = document.getElementById('company-candidates-container');
  const candidates = window._wizardCandidates || [];

  let html = '';

  // DBヒット候補
  candidates.forEach((c, i) => {
    html += `
      <div class="candidate-card" id="cand-db-${i}" onclick="selectCompanyCandidate('db', ${i})">
        <div class="candidate-match high">● 既存企業</div>
        <div class="candidate-name">${c.company_name}</div>
        <div class="candidate-detail">${c.phone || '電話なし'} / ${c.address || '住所なし'}</div>
      </div>`;
  });

  // 新規登録選択肢
  html += `
    <div class="candidate-card new" id="cand-new" onclick="selectCompanyCandidate('new', -1)">
      <div class="candidate-match" style="color:var(--text-muted);">○ 新規企業として登録</div>
      <div class="candidate-name" style="color:var(--text-muted);">${inputName}</div>
      <div class="candidate-detail">新規企業として登録します</div>
    </div>`;

  container.innerHTML = html;
  document.getElementById('step2-next')?.classList.add('btn-disabled');
  selectedCandidate = null;
}

function selectCompanyCandidate(type, idx) {
  // 選択状態のリセット
  document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('selected'));

  if (type === 'db') {
    document.getElementById('cand-db-' + idx)?.classList.add('selected');
    window._selectedCompany = window._wizardCandidates[idx];
    window._selectedCompanyIsNew = false;
  } else {
    document.getElementById('cand-new')?.classList.add('selected');
    window._selectedCompany = null;
    window._selectedCompanyIsNew = true;
  }
  selectedCandidate = type === 'db' ? idx : 'new';
  document.getElementById('step2-next')?.classList.remove('btn-disabled');
}

// ===== ウィザード：担当者検索（Supabase） =====
async function searchContactCandidates() {
  const keyword = document.getElementById('contact-search-input')?.value?.trim() || '';
  const resultEl = document.getElementById('contact-search-result');
  if (!resultEl) return;

  if (!keyword) {
    resultEl.innerHTML = '';
    return;
  }

  resultEl.innerHTML = '<option value="">検索中...</option>';

  const sb = window._sb;
  const { data, error } = await sb
    .from('contacts')
    .select('id, last_name, first_name, role, phone, email, company_id')
    .or(`last_name.ilike.%${keyword}%,first_name.ilike.%${keyword}%`)
    .limit(10);

  if (error) {
    resultEl.innerHTML = `<option value="">エラー：${error.message}</option>`;
    return;
  }

  if (!data || data.length === 0) {
    resultEl.innerHTML = '<option value="">該当なし</option>';
    return;
  }

  resultEl.innerHTML = '<option value="">— 選択してください —</option>' +
    data.map(c => {
      const fullName = `${c.last_name || ''} ${c.first_name || ''}`.trim();
      return `<option value="${c.id}" data-name="${fullName}" data-title="${c.role || ''}" data-phone="${c.phone || ''}" data-email="${c.email || ''}">${fullName}（${c.role || '役割なし'}）</option>`;
    }).join('');
}

function addContactFromSearch() {
  const sel = document.getElementById('contact-search-result');
  if (!sel || !sel.value) return;
  const opt = sel.options[sel.selectedIndex];
  addMockContact(
    opt.dataset.name,
    opt.dataset.title,
    opt.dataset.phone,
    opt.dataset.email
  );
  sel.value = '';
  document.getElementById('contact-search-input').value = '';
  document.getElementById('contact-search-result').innerHTML = '';
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

function addMockContact(nameStr, titleStr, phoneStr, emailStr) {
  const container = document.getElementById('contact-cards-container');
  const idx = contactCardCount;
  const div = document.createElement('div');
  div.className = 'contact-card';
  div.id = 'contact-' + idx;
  const displayName = nameStr.split(' (')[0] || nameStr;
  const dept = nameStr.match(/\((.*?)\)/)?.[1] || '';
  div.innerHTML = `
    <button class="contact-card-remove" onclick="removeContactCard(${idx})"><i class="ti ti-x"></i></button>
    <div class="contact-card-header">
      <div>
        <div class="contact-card-name">${displayName}</div>
        <span class="badge badge-gray" style="margin-top:4px;">サブ担当者</span>
        <span class="src-auto" style="margin-left:6px;background:#E3F2FD;color:#1976D2;">DB検索</span>
      </div>
      <button class="btn btn-sm btn-secondary" onclick="setMainContact(${idx})">★ メインに設定</button>
    </div>
    <div class="contact-card-form">
      <div class="form-group"><label class="form-label">氏名</label><input class="form-control" value="${displayName}"></div>
      <div class="form-group"><label class="form-label">役職</label><input class="form-control" value="${titleStr || ''}"></div>
      <div class="form-group"><label class="form-label">部署</label><input class="form-control" value="${dept}"></div>
      <div class="form-group"><label class="form-label">電話番号</label><input class="form-control" value="${phoneStr || ''}"></div>
      <div class="form-group"><label class="form-label">FAX</label><input class="form-control" value=""></div>
      <div class="form-group"><label class="form-label">携帯電話</label><input class="form-control" value=""></div>
      <div class="form-group" style="grid-column:1/-1;"><label class="form-label">メールアドレス</label><input class="form-control" value="${emailStr || ''}"></div>
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
  (window.salesAData || []).forEach(item => {
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
  const item = (window.salesAData || []).find(d => d.id === itemId);
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
  const item = (window.salesAData || []).find(d => d.id === editingSalesAId);
  if (!item) return;

  const status       = document.querySelector('input[name="sales-a-status"]:checked')?.value  || '処理中';
  const billing      = document.querySelector('input[name="sales-a-billing"]:checked')?.value || '未請求';
  const deliveryDate = document.getElementById('sales-a-delivery-date').value;

  item.status        = status;
  item.billingStatus = billing;
  item.deliveryDate  = deliveryDate || null;

  // salesADataByKey も同期
  if (window.salesADataByKey && window.salesADataByKey[item.axisId]) {
    window.salesADataByKey[item.axisId].status   = status;
    window.salesADataByKey[item.axisId].delivery = deliveryDate || '未設定';
    window.salesADataByKey[item.axisId].invoice  = billing;
  }

  closeSalesAStatusModal();
  renderSalesATable();
}

// ===== 機器販売（A）：詳細モーダル（添付エリア付き） =====
let currentSalesADetailId = null;

function openSalesADetailModal(itemId) {
  currentSalesADetailId = itemId;
  const item = (window.salesAData || []).find(d => d.id === itemId);
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
  const item = (window.salesAData || []).find(d => d.axisId === id);
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
  const item = (window.salesAData || []).find(d => d.id === currentSalesADetailId);
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
  const d = (window.salesBData || {})[id];
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

// ===== サブスク更新モーダル =====
let renewalCurrentId = '';
let renewalNewSuffix = '';

// service_c の id（uuid）から更新元を取得してモーダルへセット
async function openSubscRenewal(serviceId) {
  const sb = window._sb;
  const { data: rec, error } = await sb
    .from('service_c')
    .select('id, branch_id, axis_id, unit_price, cost_price, renewal_count, contract_end')
    .eq('id', serviceId)
    .single();
  if (error || !rec) { alert('サービス情報の取得に失敗しました'); return; }

  const oldBranchId = rec.branch_id;                       // 例: 20260614002C01
  const parentId    = oldBranchId.replace(/C\d+$/, '');
  const m           = oldBranchId.match(/C(\d+)$/);
  const nextNum     = (m ? parseInt(m[1], 10) : 0) + 1;
  const newSuffix   = 'C' + String(nextNum).padStart(2, '0');
  const newId       = parentId + newSuffix;

  // confirmRenewal が参照するグローバルをセット
  renewalCurrentId = oldBranchId;
  renewalNewSuffix = newSuffix;

  document.getElementById('renewal-current-id').textContent = oldBranchId;
  document.getElementById('renewal-new-id').textContent     = newId;
  document.getElementById('renewal-price').value = '¥' + (rec.unit_price != null ? rec.unit_price : 0).toLocaleString();
  document.getElementById('renewal-cost').value  = '¥' + (rec.cost_price != null ? rec.cost_price : 0).toLocaleString();
  document.getElementById('subsc-renewal-title').textContent = `更新登録 — ${oldBranchId} → ${newId}`;
  openModal('subsc-renewal-modal');
}

async function confirmRenewal() {
  const sb = window._sb;
  try {
    const oldBranchId = renewalCurrentId;                  // 例: "20260614001C01"
    const parentId    = oldBranchId.replace(/C\d+$/, '');  // 例: "20260614001"
    const newBranchId = parentId + renewalNewSuffix;       // 例: "20260614001C02"

    // 1. 更新元レコードを branch_id で取得
    const { data: orig, error: fErr } = await sb
      .from('service_c')
      .select('*')
      .eq('branch_id', oldBranchId)
      .single();
    if (fErr) throw new Error('更新元レコードの取得に失敗しました: ' + fErr.message);

    // 2. 契約期間を計算（旧終了日の翌日から1年。無ければ本日起算）
    const fmt = d => d.toISOString().split('T')[0];
    let newStart;
    if (orig.contract_end) {
      newStart = new Date(orig.contract_end);
      newStart.setDate(newStart.getDate() + 1);
    } else {
      newStart = new Date();
    }
    const newEnd = new Date(newStart);
    newEnd.setFullYear(newEnd.getFullYear() + 1);
    newEnd.setDate(newEnd.getDate() - 1);

    // 3. service_c に更新レコードを INSERT（axis_idはアクシスIDのまま、枝番Cをインクリメント）
    const { data: rec, error: iErr } = await sb.from('service_c').insert({
      axis_id:          orig.axis_id,
      branch_id:        newBranchId,
      product_id:       orig.product_id,
      temp_product_id:  orig.temp_product_id,
      unit_price:       orig.unit_price,
      cost_price:       orig.cost_price,
      status:           '処理中',
      billing_status:   '未請求',
      contract_start:   fmt(newStart),
      contract_end:     fmt(newEnd),
      renewal_count:    (orig.renewal_count || 0) + 1,
      parent_branch_id: orig.id
    }).select('branch_id').single();
    if (iErr) throw new Error('service_c INSERT失敗: ' + iErr.message);

    // 4. 旧レコードを「更新済」に
    const { error: uErr } = await sb
      .from('service_c')
      .update({ status: '更新済' })
      .eq('id', orig.id);
    if (uErr) throw new Error('旧レコードの更新に失敗しました: ' + uErr.message);

    // 5. UI 更新
    alert(`✓ ${newBranchId} を発行して更新登録が完了しました\n契約期間: ${fmt(newStart)} 〜 ${fmt(newEnd)}`);
    closeModal('subsc-renewal-modal');
    if (typeof loadOrders === 'function') await loadOrders();

  } catch (err) {
    console.error('confirmRenewal error:', err);
    alert('更新登録に失敗しました: ' + (err.message || err));
  }
}

// ===== サービスC一覧（Supabase） =====
async function renderServiceCList() {
  const sb = window._sb;
  const tbody = document.getElementById('svc-tbody');
  if (!sb || !tbody) return;
  const { data, error } = await sb
    .from('service_c')
    .select('id, branch_id, axis_id, unit_price, cost_price, status, billing_status, contract_start, contract_end, renewal_count, axis_ids(companies(company_name))')
    .order('branch_id', { ascending: true });
  if (error) { console.error('service_c取得エラー:', error); return; }
  window._serviceCList = data || [];
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="13" style="padding:16px;text-align:center;color:var(--text-muted);">サービス契約はまだありません</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(r => {
    const company = (r.axis_ids && r.axis_ids.companies && r.axis_ids.companies.company_name) || '—';
    const price   = (r.unit_price != null ? r.unit_price : 0).toLocaleString();
    const paid    = r.billing_status === '入金済'
      ? '<span class="badge badge-green">入金済</span>'
      : '<span class="badge badge-yellow">' + (r.billing_status || '未請求') + '</span>';
    return `<tr>
      <td><span class="cid-c">${r.branch_id}</span></td>
      <td>${company}</td>
      <td>—</td>
      <td>—</td>
      <td>¥${price}</td>
      <td>¥${price}</td>
      <td>${r.contract_start || '—'}</td>
      <td>${r.contract_start || '—'}</td>
      <td>${r.contract_end || '—'}</td>
      <td>—</td>
      <td>${paid}</td>
      <td><span class="badge badge-blue">${r.status || '—'}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openServiceDetailReal('${r.id}')" style="margin-right:4px;"><i class="ti ti-eye"></i> 詳細</button>
        <button class="btn btn-sm btn-primary" onclick="openSubscRenewal('${r.id}')"><i class="ti ti-refresh"></i> 更新</button>
      </td>
    </tr>`;
  }).join('');
}

// 実データ詳細（返金コンテキストをdatasetに保持）
function openServiceDetailReal(serviceId) {
  const r = (window._serviceCList || []).find(x => String(x.id) === String(serviceId));
  if (!r) return;
  const company = (r.axis_ids && r.axis_ids.companies && r.axis_ids.companies.company_name) || '—';

  // 返金モーダルに対象サービスのキーを保持
  const refundModal = document.getElementById('service-refund-modal');
  if (refundModal) {
    refundModal.dataset.serviceCId = r.id;
    refundModal.dataset.branchId   = r.branch_id;
    refundModal.dataset.axisId     = r.axis_id;
  }

  const titleEl = document.getElementById('svc-detail-title');
  if (titleEl) titleEl.textContent = `サービス詳細 — ${r.branch_id}`;
  const body = document.getElementById('svc-detail-basic-body');
  if (body) {
    body.innerHTML = `
      <div><span style="color:var(--text-muted);">企業：</span><strong>${company}</strong></div>
      <div><span style="color:var(--text-muted);">枝番ID：</span><strong>${r.branch_id}</strong></div>
      <div><span style="color:var(--text-muted);">月額単価：</span><strong>¥${(r.unit_price||0).toLocaleString()}</strong></div>
      <div><span style="color:var(--text-muted);">原価：</span><strong>¥${(r.cost_price||0).toLocaleString()}</strong></div>
      <div><span style="color:var(--text-muted);">ステータス：</span><strong>${r.status||'—'}</strong></div>
      <div><span style="color:var(--text-muted);">入金：</span><strong>${r.billing_status||'—'}</strong></div>
      <div><span style="color:var(--text-muted);">契約期間：</span><strong>${r.contract_start||'—'} 〜 ${r.contract_end||'—'}</strong></div>
      <div><span style="color:var(--text-muted);">更新回数：</span><strong>${r.renewal_count||0}</strong></div>`;
  }
  loadRefundHistory(r.branch_id);
  openModal('service-detail-modal');
}

// 返金履歴をDBから読み込み
async function loadRefundHistory(branchId) {
  const sb = window._sb;
  const tbody = document.getElementById('svc-refund-tbody');
  if (!sb || !tbody) return;
  const { data, error } = await sb
    .from('refunds')
    .select('refund_date, amount, reason, notes')
    .eq('branch_id', branchId)
    .order('refund_date', { ascending: false });
  if (error || !data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="padding:16px;text-align:center;color:var(--text-muted);">返金履歴なし</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(x => `<tr>
    <td style="padding:8px;border-bottom:1px solid var(--border);">${x.refund_date || '—'}</td>
    <td style="padding:8px;border-bottom:1px solid var(--border);">${x.notes || '—'}</td>
    <td style="padding:8px;border-bottom:1px solid var(--border);">¥${(x.amount||0).toLocaleString()}</td>
    <td style="padding:8px;border-bottom:1px solid var(--border);">${x.reason || ''}</td>
  </tr>`).join('');
}

// ===== 入金登録（Supabase） =====
// 未請求の枝番を3テーブルから取得して入金登録selectに反映
async function loadUnpaidPayments() {
  const sb = window._sb;
  const sel = document.getElementById('pay-select-id');
  if (!sb || !sel) return;

  const tables = [
    ['sales_a',        'A 機器販売'],
    ['construction_b', 'B 工事管理'],
    ['service_c',      'C サービス']
  ];
  const opts = [];
  for (const [t, label] of tables) {
    const { data, error } = await sb
      .from(t)
      .select('branch_id, unit_price, billing_status')
      .eq('billing_status', '未請求')
      .order('branch_id', { ascending: true });
    if (error) { console.error(t + ' 未請求取得エラー:', error); continue; }
    (data || []).forEach(r => {
      const price = (r.unit_price != null ? r.unit_price : 0).toLocaleString();
      opts.push(`<option value="${t}::${r.branch_id}">${r.branch_id} — ${label} ¥${price}</option>`);
    });
  }
  sel.innerHTML = opts.length
    ? opts.join('')
    : '<option value="">未入金（未請求）の枝番はありません</option>';
}

// 入金登録モーダルを開く（最新の未請求一覧をロードしてから表示）
async function openPaymentModal() {
  await loadUnpaidPayments();
  openModal('payment-modal');
}

async function registerPayment() {
  const sb = window._sb;
  const sel = document.getElementById('pay-select-id');
  const val = sel ? sel.value : '';
  const dateVal = document.getElementById('pay-date')?.value;

  if (!val) { alert('入金対象の枝番を選択してください'); return; }
  if (!dateVal) { alert('入金日を入力してください'); return; }

  const [table, branchId] = val.split('::');
  if (!table || !branchId) { alert('対象の形式が不正です'); return; }

  try {
    const { error } = await sb
      .from(table)
      .update({ billing_status: '入金済' })
      .eq('branch_id', branchId);
    if (error) throw error;

    alert(`✓ 入金登録が完了しました\n${branchId} を「入金済」に更新（入金日 ${dateVal}）`);
    closeModal('payment-modal');

    if (typeof loadOrders === 'function') await loadOrders();
    await loadUnpaidPayments();

  } catch (err) {
    console.error('registerPayment error:', err);
    alert('入金登録に失敗しました: ' + (err.message || err));
  }
}

// ===== モーダル共通 =====
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
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
// Supabase同期用のキャッシュ（renderMembersTable実行時に同期される）
const MEMBERS_DB = [];

// currentUser は app.html(<head>) が window.currentUser に設定する（一本化）
let pwInitTargetEmail = '';


// パスワード再設定処理（app.js内のモックは削除。index.htmlのSupabase版を使用）

// ログイン完了処理
function completeLogin() {
  // サイドバーにユーザー表示（window.currentUserを参照）
  const label = document.getElementById('sidebar-user-label');
  const cu = window.currentUser;
  if (label && cu) {
    label.textContent = cu.name + (cu.role === 'admin' ? '（管理者）' : '');
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

  // window.currentUserが未設定なら最大3秒ポーリングして待つ
  if (!window.currentUser) {
    let waited = 0;
    const timer = setInterval(() => {
      waited += 100;
      if (window.currentUser) {
        clearInterval(timer);
        _renderMembersView();
      } else if (waited >= 3000) {
        clearInterval(timer);
        // タイムアウト：denied表示
        document.getElementById('members-admin-view').style.display = 'none';
        document.getElementById('members-denied-view').style.display = 'block';
      }
    }, 100);
    return;
  }
  _renderMembersView();
}

function _renderMembersView() {
  const cu = window.currentUser;
  const userInfo = document.getElementById('members-user-info');
  if (userInfo) userInfo.textContent = 'ログイン中: ' + cu.name;

  if (cu.role === 'admin') {
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

async function executePasswordInit() {
  const email = pwInitTargetEmail;
  if (!email) return;

  const sb = window._sb;
  if (!sb) return;

  try {
    // Edge Function でAuthパスワードをaxis0120にリセット＋is_initial_pw=trueに更新
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      alert('セッションが切れています。再ログインしてください。');
      return;
    }
    const res = await fetch(
      'https://ejtaqzwqadkcdbvxocfw.supabase.co/functions/v1/reset-member-password',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
          // 注: SUPABASE_ANON_KEY は config.js のトップレベル const のため
          //     window.SUPABASE_ANON_KEY ではなくグローバル束縛を直接参照する
          'apikey': (typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : (window.SUPABASE_ANON_KEY || ''))
        },
        body: JSON.stringify({ email })
      }
    );

    const result = await res.json();
    if (!res.ok) {
      alert('初期化エラー: ' + (result.error || res.status));
      return;
    }

    closeModal('pw-init-modal');
    alert('パスワードを axis0120 にリセットしました。\n対象ユーザーは次回ログイン時にパスワード変更が求められます。');

    await renderMembersTable('');
    updatePwResetNotification();

  } catch (e) {
    alert('通信エラー: ' + e.message);
  }
}

// =========================================================
// メンバーテーブル描画 (renderMembersTable / filterMembers)
// =========================================================
let _memberFilter = '';

async function renderMembersTable(filter) {
  filter = (filter !== undefined ? filter : _memberFilter).toLowerCase();
  _memberFilter = filter;
  const tbody = document.getElementById('members-tbody');
  if (!tbody) return;

  // Supabaseからメンバー一覧を取得
  const sb = window._sb;
  if (!sb) return;
  const { data: rows, error } = await sb
    .from('members')
    .select('last_name, first_name, email, role, is_initial_pw, phone, company')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('members取得エラー:', error);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">データ取得エラー</td></tr>';
    return;
  }

  // MEMBERS_DBをSupabaseデータで同期（既存の編集・削除関数との互換）
  MEMBERS_DB.length = 0;
  rows.forEach(r => {
    MEMBERS_DB.push({
      email:       r.email         || '',
      lastName:    r.last_name     || '',
      firstName:   r.first_name    || '',
      name:        ((r.last_name || '') + ' ' + (r.first_name || '')).trim(),
      role:        r.role          || 'user',
      isInitialPw: r.is_initial_pw || false,
      phone:       r.phone         || '',
      company:     r.company       || ''
    });
  });

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
    const phone   = m.phone   || '—';
    const company = m.company || '—';
    const isCurrentUser = window.currentUser && window.currentUser.email === m.email;
    const deleteBtn = isCurrentUser
      ? `<button class="btn btn-sm btn-danger" style="opacity:0.4;cursor:not-allowed;" disabled title="自分自身は削除できません"><i class="ti ti-trash"></i> 削除</button>`
      : `<button class="btn btn-sm btn-danger" onclick="openDeleteMember('${m.email}')"><i class="ti ti-trash"></i> 削除</button>`;
    const pwBtn = m.isInitialPw
      ? `<button onclick="confirmPasswordInit('${m.email}', '${m.name}')" style="background:#f97316; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size: 13px; cursor:pointer; font-weight:600; display:inline-flex; align-items:center; gap:4px;">&#128276; PW初期化待ち</button>`
      : `<button class="btn btn-sm btn-secondary" onclick="confirmPasswordInit('${m.email}', '${m.name}')"><i class="ti ti-key"></i> パスワード変更</button>`;
    return `<tr>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px;" title="${company}">${company}</td>
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
  // 姓・名・会社・電話を個別フィールドにセット
  const lastNameEl  = document.getElementById('edit-member-last-name');
  const firstNameEl = document.getElementById('edit-member-first-name');
  const companyEl   = document.getElementById('edit-member-company');
  const phoneEl     = document.getElementById('edit-member-phone');
  if (lastNameEl)  lastNameEl.value  = m.lastName  || '';
  if (firstNameEl) firstNameEl.value = m.firstName || '';
  if (companyEl)   companyEl.value   = m.company   || '';
  if (phoneEl)     phoneEl.value     = m.phone     || '';
  document.getElementById('edit-member-email').value = m.email || '';
  document.getElementById('edit-member-role').value = m.role || 'user';
  openModal('member-edit-modal');
}

async function saveMemberEdit() {
  // 姓・名・会社・電話を個別フィールドから取得してSupabaseへ保存
  const origEmail = document.getElementById('edit-member-email-orig')
    ? document.getElementById('edit-member-email-orig').value
    : '';
  const lastName  = (document.getElementById('edit-member-last-name')  || {}).value?.trim() || '';
  const firstName = (document.getElementById('edit-member-first-name') || {}).value?.trim() || '';
  const company   = (document.getElementById('edit-member-company')    || {}).value?.trim() || '';
  const phone     = (document.getElementById('edit-member-phone')      || {}).value?.trim() || '';
  const newRole   = document.getElementById('edit-member-role').value;

  const sb = window._sb;
  if (!sb) return;

  const { error } = await sb
    .from('members')
    .update({
      last_name:  lastName,
      first_name: firstName,
      company:    company,
      phone:      phone,
      role:       newRole
    })
    .eq('email', origEmail);

  if (error) {
    alert('更新エラー: ' + error.message);
    return;
  }

  // 自分自身を編集した場合はwindow.currentUserも更新
  if (window.currentUser && window.currentUser.email === origEmail) {
    window.currentUser.role = newRole;
    window.currentUser.name = (lastName + ' ' + firstName).trim();
    const label = document.getElementById('sidebar-user-label');
    if (label) label.textContent = window.currentUser.name + (window.currentUser.role === 'admin' ? '（管理者）' : '');
  }

  // モーダルを閉じてテーブル再描画（実モーダルIDは member-edit-modal）
  closeModal('member-edit-modal');
  await renderMembersTable('');
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
  if (window.currentUser && window.currentUser.email === email) {
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

async function executeDeleteMember() {
  const email = _deleteTargetEmail;
  if (!email) return;

  // 自分自身は削除不可（openDeleteMemberでボタンも無効化済みだが二重ガード）
  if (window.currentUser && window.currentUser.email === email) {
    const errEl = document.getElementById('delete-member-error');
    errEl.textContent = '現在ログイン中のユーザー自身は削除できません。';
    errEl.style.display = 'block';
    return;
  }

  const sb = window._sb;
  if (!sb) return;

  // TODO: Edge Function「delete-member」の実装・デプロイが必要。
  //       本来は service_role 権限で auth.users と members を一括削除すべき。
  //       現状は members テーブルのみ削除し、Auth ユーザーは残る（暫定対応）。
  //       Edge Function 実装後は以下の fetch を有効化し、members の直接削除を置き換える:
  //   await fetch(SUPABASE_URL + '/functions/v1/delete-member', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY,
  //                'Authorization': 'Bearer ' + (await sb.auth.getSession()).data.session.access_token },
  //     body: JSON.stringify({ email })
  //   });
  const { error } = await sb
    .from('members')
    .delete()
    .eq('email', email);

  if (error) {
    alert('削除エラー: ' + error.message);
    return;
  }

  console.warn(
    `[delete-member] members から「${email}」を削除しましたが、auth.users のアカウントは残っています。` +
    ' Auth ユーザーを完全削除するには Edge Function「delete-member」（service_role）の実装・デプロイが必要です。'
  );

  closeModal('member-delete-modal');
  await renderMembersTable('');
}

// =========================================================
// メンバー追加モーダル
// =========================================================
function openAddMemberModal() {
  ['add-member-last-name','add-member-first-name','add-member-email','add-member-company','add-member-phone']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('add-member-role').value = 'user';
  const errEl = document.getElementById('add-member-error');
  errEl.style.display = 'none';
  errEl.textContent = '';
  openModal('modal-add-member');
}

async function submitAddMember() {
  // 姓・名・会社・電話を個別フィールドから取得してSupabaseへ保存
  const lastName  = (document.getElementById('add-member-last-name')  || {}).value?.trim() || '';
  const firstName = (document.getElementById('add-member-first-name') || {}).value?.trim() || '';
  const company   = (document.getElementById('add-member-company')    || {}).value?.trim() || '';
  const phone     = (document.getElementById('add-member-phone')      || {}).value?.trim() || '';
  const email     = (document.getElementById('add-member-email')      || {}).value?.trim() || '';
  const role      = document.getElementById('add-member-role').value;
  const errEl     = document.getElementById('add-member-error');

  if (!lastName) {
    if (errEl) { errEl.textContent = '姓を入力してください'; errEl.style.display = 'block'; }
    return;
  }
  if (!email) {
    if (errEl) { errEl.textContent = 'メールアドレスを入力してください'; errEl.style.display = 'block'; }
    return;
  }

  const sb = window._sb;
  if (!sb) return;

  // 管理者の現在セッションを退避（signUpはクライアント側でセッションを
  // 新規ユーザーに差し替えるため、後で元に戻す）
  const { data: { session: adminSession } } = await sb.auth.getSession();

  // ① Supabase Auth にユーザー作成（初期パスワード axis0120）
  const { data: signUpData, error: signUpErr } = await sb.auth.signUp({
    email:    email,
    password: 'axis0120',
    options:  { emailRedirectTo: null }
  });

  if (signUpErr) {
    if (errEl) { errEl.textContent = '認証ユーザー作成エラー: ' + signUpErr.message; errEl.style.display = 'block'; }
    return;
  }

  const authUid = signUpData?.user?.id || null;

  // 管理者セッションを復元（signUpで差し替わっている場合に元へ戻す）
  if (adminSession) {
    await sb.auth.setSession({
      access_token:  adminSession.access_token,
      refresh_token: adminSession.refresh_token
    });
  }

  // ② membersテーブルに保存
  const { error: insertErr } = await sb
    .from('members')
    .insert({
      auth_uid:      authUid,
      last_name:     lastName,
      first_name:    firstName,
      company:       company,
      phone:         phone,
      email:         email,
      role:          role,
      is_initial_pw: true,
      is_active:     true
    });

  if (insertErr) {
    if (errEl) { errEl.textContent = 'メンバー登録エラー: ' + insertErr.message; errEl.style.display = 'block'; }
    return;
  }

  closeModal('modal-add-member');
  await renderMembersTable('');
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

async function submitPasswordResetRequest() {
  // 注: 実フォームのIDは pw-reset-req-* （指示書の reset-request-* ではない）
  const emailEl = document.getElementById('pw-reset-req-email');
  if (!emailEl) return;
  const email = emailEl.value.trim();
  const errEl = document.getElementById('pw-reset-req-error');
  const msgEl = document.getElementById('pw-reset-req-success');
  if (errEl) errEl.style.display = 'none';
  if (msgEl) msgEl.style.display = 'none';

  if (!email) {
    if (errEl) { errEl.textContent = 'メールアドレスを入力してください'; errEl.style.display = 'block'; }
    return;
  }

  const sb = window.supabaseClient || window._sb;
  if (!sb) return;

  // members から該当ユーザーを探す
  const { data: member, error: selErr } = await sb
    .from('members')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  if (selErr) {
    if (errEl) { errEl.textContent = 'エラー: ' + selErr.message; errEl.style.display = 'block'; }
    return;
  }

  if (!member) {
    if (errEl) { errEl.textContent = '登録されていないメールアドレスです'; errEl.style.display = 'block'; }
    return;
  }

  // is_initial_pw = true に更新（管理者の対応待ち）
  const { error: upErr } = await sb
    .from('members')
    .update({ is_initial_pw: true })
    .eq('email', email);

  if (upErr) {
    if (errEl) { errEl.textContent = 'リクエストエラー: ' + upErr.message; errEl.style.display = 'block'; }
    return;
  }

  if (msgEl) {
    msgEl.textContent = '初期化依頼を受け付けました。管理者がリセットするまでしばらくお待ちください。';
    msgEl.style.display = 'block';
  }

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
  if (!window.currentUser || window.currentUser.role !== 'admin') {
    notification.style.display = 'none';
    return;
  }

  // isInitialPw === true のメンバーをカウント（自分自身は除く）
  const count = MEMBERS_DB.filter(m => m.isInitialPw === true && m.email !== window.currentUser.email).length;

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

/* --- 詳細：オムロンID描画（インライン編集対応） --- */
var _omronCellStyle = 'padding:6px;border-bottom:1px solid var(--border);';
var _omronInputStyle = 'width:100%;padding:5px 6px;border:1px solid #d1d5db;border-radius:5px;font-size:13px;box-sizing:border-box;';

function renderOmronTable(rows) {
  var html = '';
  (rows || []).forEach(function(r, i) {
    html += '<tr>'
          + '<td style="' + _omronCellStyle + '">' + (r.num || (i + 1)) + '台目</td>'
          + '<td style="' + _omronCellStyle + '"><input style="' + _omronInputStyle + '" value="' + (r.omronId || '') + '" oninput="updateOmronRow(' + i + ',\'omronId\',this.value)"></td>'
          + '<td style="' + _omronCellStyle + '"><input style="' + _omronInputStyle + '" value="' + (r.initId || '') + '" oninput="updateOmronRow(' + i + ',\'initId\',this.value)"></td>'
          + '<td style="' + _omronCellStyle + '"><input style="' + _omronInputStyle + '" value="' + (r.initPw || '') + '" oninput="updateOmronRow(' + i + ',\'initPw\',this.value)"></td>'
          + '<td style="' + _omronCellStyle + 'text-align:center;"><button onclick="deleteOmronRow(' + i + ')" style="padding:4px 8px;background:#ef4444;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:12px;">✕</button></td>'
          + '</tr>';
  });
  document.getElementById('svc-omron-tbody').innerHTML = html;
}

function updateOmronRow(index, field, value) {
  if (!currentService.omronRows || !currentService.omronRows[index]) return;
  currentService.omronRows[index][field] = value;
}

function addOmronId() {
  if (!currentService.omronRows) currentService.omronRows = [];
  var nextNum = currentService.omronRows.length + 1;
  currentService.omronRows.push({ num: nextNum, omronId: '', initId: '', initPw: '' });
  renderOmronTable(currentService.omronRows);
}

function deleteOmronRow(index) {
  if (!currentService.omronRows) return;
  currentService.omronRows.splice(index, 1);
  // 台番を振り直す
  currentService.omronRows.forEach(function(r, i) { r.num = i + 1; });
  renderOmronTable(currentService.omronRows);
}

// オムロンIDを omron_ids テーブルへ保存。
// テーブルが未作成の場合は sql/create_omron_ids.sql を実行してください。
async function saveOmronIds() {
  var sb = window._sb;
  if (!sb) { alert('システム初期化中です。もう一度お試しください。'); return; }
  var serviceKey = currentService.id || '';
  var rows = (currentService.omronRows || []).filter(function(r) { return (r.omronId || '').trim() !== ''; });

  try {
    // 当該サービス分を一旦削除して入れ直す（簡易な全置換）
    await sb.from('omron_ids').delete().eq('service_id', serviceKey);
    if (rows.length > 0) {
      var payload = rows.map(function(r) {
        return {
          service_id: serviceKey,
          unit_no:    r.num,
          omron_id:   r.omronId,
          initial_id: r.initId,
          initial_pw: r.initPw
        };
      });
      var res = await sb.from('omron_ids').insert(payload);
      if (res.error) throw res.error;
    }
    alert('オムロンIDを保存しました（' + rows.length + '件）。');
  } catch (e) {
    // テーブル未作成などのケース。画面上のデータは保持される。
    console.warn('[omron_ids] 保存に失敗しました。テーブル未作成の可能性があります（sql/create_omron_ids.sql を実行してください）:', e);
    alert('オムロンIDの保存に失敗しました。omron_ids テーブルが未作成の可能性があります。\n詳細はコンソールを確認してください。');
  }
}

/* --- 返金登録 --- */
function openRefundEntry() {
  openModal('service-refund-modal');
}
async function saveRefund() {
  const sb = window._sb;
  const modal = document.getElementById('service-refund-modal');
  const branchId = modal ? modal.dataset.branchId : '';
  const axisId   = modal ? modal.dataset.axisId : '';

  const date   = document.getElementById('refund-date').value;
  const months = document.getElementById('refund-months').value;
  const amount = parseInt(document.getElementById('refund-amount').value) || 0;
  const reason = document.getElementById('refund-reason').value.trim();

  if (!date || !amount || !reason) { alert('必須項目を入力してください'); return; }
  if (!branchId) { alert('対象サービスが特定できません。一覧の「詳細」から開いてください。'); return; }

  try {
    const { error } = await sb.from('refunds').insert({
      branch_id:   branchId,
      axis_id:     axisId || null,
      refund_date: date,
      amount:      amount,
      reason:      reason,
      notes:       months ? (months + 'ヵ月分') : null,
      status:      '処理中'
    });
    if (error) throw error;

    alert('✓ 返金を登録しました');
    closeModal('service-refund-modal');
    // 入力をクリア
    document.getElementById('refund-date').value = '';
    document.getElementById('refund-months').value = '';
    document.getElementById('refund-amount').value = '';
    document.getElementById('refund-reason').value = '';
    // 履歴を再読み込み
    await loadRefundHistory(branchId);
  } catch (err) {
    console.error('saveRefund error:', err);
    alert('返金登録に失敗しました: ' + (err.message || err));
  }
}

/* --- 新規登録保存（Supabase：axis_ids採番 → service_c INSERT） --- */
async function saveServiceNew() {
  const sb = window._sb;
  const gv = id => { const el = document.getElementById(id); return el ? el.value : ''; };

  const unitPrice   = parseInt(gv('svc-new-unit-price')) || 0;
  const monthlyCost = parseInt(gv('svc-new-monthly-cost')) || 0;
  const applyDate   = gv('svc-new-apply-date') || new Date().toISOString().slice(0, 10);
  const cycleStart  = gv('svc-new-cycle-start') || null;
  const cycleEnd    = gv('svc-new-cycle-end') || null;

  if (unitPrice <= 0) { alert('月額単価を入力してください'); return; }

  try {
    // 1. axis_ids を申込日ベースで採番（YYYYMMDD + 3桁連番）
    const ymd = applyDate.replace(/-/g, '');
    const { data: existing } = await sb
      .from('axis_ids')
      .select('axis_id')
      .like('axis_id', `${ymd}%`)
      .order('axis_id', { ascending: false })
      .limit(1);
    let seq = 1;
    if (existing && existing.length > 0) {
      seq = (parseInt(existing[0].axis_id.slice(8, 11)) || 0) + 1;
    }
    const parentId = ymd + String(seq).padStart(3, '0');

    // 2. axis_ids に親レコードをINSERT
    const { error: aErr } = await sb.from('axis_ids').insert({
      axis_id:    parentId,
      apply_date: applyDate,
      status:     '処理中'
    });
    if (aErr) throw new Error('axis_ids採番失敗: ' + aErr.message);

    // 3. service_c に枝番C01をINSERT
    const branchId = parentId + 'C01';
    const { error: cErr } = await sb.from('service_c').insert({
      axis_id:        parentId,
      branch_id:      branchId,
      unit_price:     unitPrice,
      cost_price:     monthlyCost,
      status:         '処理中',
      billing_status: '未請求',
      contract_start: cycleStart,
      contract_end:   cycleEnd,
      renewal_count:  0
    });
    if (cErr) throw new Error('service_c INSERT失敗: ' + cErr.message);

    alert(`✓ サービスを登録しました\nアクシスID: ${parentId} / 枝番: ${branchId}`);
    closeModal('service-new-modal');
    await renderServiceCList();
    if (typeof loadOrders === 'function') await loadOrders();
  } catch (err) {
    console.error('saveServiceNew error:', err);
    alert('サービス登録に失敗しました: ' + (err.message || err));
  }
}

/* --- 一覧フィルター（モック） --- */
function filterServiceList() {
  // 実装：必要に応じてフィルタリングロジックを追加
}

// =========================================================
// ウィザード登録処理（Supabase INSERT）
// =========================================================
async function submitWizard() {
  const sb = window._sb;
  const btn = document.getElementById('wizard-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = '登録中...'; }

  try {
    // ── 1. カスタムIDを生成（先頭8桁は申込日 YYYYMMDD） ──
    const today = new Date();
    const applyDate = document.getElementById('s1-date')?.value || today.toISOString().slice(0, 10);
    const ymd = applyDate.replace(/-/g, '');

    // 申込日の最大連番を取得
    const { data: existing } = await sb
      .from('axis_ids')
      .select('axis_id')
      .like('axis_id', `${ymd}%`)
      .order('axis_id', { ascending: false })
      .limit(1);

    let seq = 1;
    if (existing && existing.length > 0) {
      const lastId = existing[0].axis_id;
      const lastSeq = parseInt(lastId.slice(8, 11)) || 0;
      seq = lastSeq + 1;
    }
    const parentId = ymd + String(seq).padStart(3, '0');

    // ── 2. 企業IDを取得（新規ならcompaniesにINSERT） ──
    let companyId = null;
    let contactId = null;

    if (!window._selectedCompanyIsNew && window._selectedCompany) {
      companyId = window._selectedCompany.id;
    } else {
      // ステップ1のフォーム内容で新規企業を登録
      const { data: newCo, error: coErr } = await sb.from('companies').insert({
        company_name:      document.getElementById('s1-company')?.value?.trim() || '（無名企業）',
        company_name_kana: document.getElementById('s1-company-kana')?.value?.trim() || null,
        postal_code:       document.getElementById('s1-zip')?.value?.trim() || null,
        address:           document.getElementById('s1-address')?.value?.trim() || null,
        phone:             document.getElementById('s1-tel')?.value?.trim() || null,
        fax:               document.getElementById('s1-mobile')?.value?.trim() || null
      }).select('id').single();
      if (coErr) throw new Error('companies INSERT失敗: ' + coErr.message);
      companyId = newCo.id;
    }

    // ── 担当者を取得（メイン担当者カードをcontactsにINSERT） ──
    const mainCard = document.getElementById('contact-' + mainContactIdx)
                  || document.getElementById('contact-0');
    if (mainCard && companyId) {
      const cInputs = mainCard.querySelectorAll('.contact-card-form input');
      // 入力順: 氏名, 役職, 部署, 電話番号, FAX, 携帯電話, メールアドレス
      const nameStr  = cInputs[0]?.value?.trim() || '';
      const roleStr  = cInputs[1]?.value?.trim() || '';
      const phoneStr = cInputs[3]?.value?.trim() || '';
      const emailStr = cInputs[6]?.value?.trim() || '';
      if (nameStr) {
        const parts     = nameStr.split(/\s+/);
        const lastName  = parts[0] || nameStr;
        const firstName = parts.slice(1).join(' ') || '';
        const { data: newCt, error: ctErr } = await sb.from('contacts').insert({
          company_id: companyId,
          last_name:  lastName,
          first_name: firstName,
          role:       roleStr || null,
          phone:      phoneStr || null,
          email:      emailStr || null,
          is_main:    true
        }).select('id').single();
        if (ctErr) throw new Error('contacts INSERT失敗: ' + ctErr.message);
        contactId = newCt.id;
      }
    }

    // ── 3. axis_ids にINSERT ──
    const { error: axisErr } = await sb.from('axis_ids').insert({
      axis_id:    parentId,
      apply_date: applyDate,
      company_id: companyId,
      contact_id: contactId,
      status:     '処理中'
    });
    if (axisErr) throw new Error('axis_ids INSERT失敗: ' + axisErr.message);

    const insertedIds = { parent: parentId, a: null, b: null, c: null };

    // ── 4. A 機器販売 INSERT ──
    const includeA = document.getElementById('include-a')?.checked;
    if (includeA) {
      const branchId = parentId + 'A01';
      const rows = document.querySelectorAll('#step4-product-tbody .step4-prd-row');
      let firstProductId = null;
      let totalQty = 0;
      let unitPrice = 0;
      let costPrice = 0;

      rows.forEach(tr => {
        const qty = parseInt(tr.querySelector('.prd-qty')?.value) || 0;
        if (qty > 0) {
          totalQty += qty;
          unitPrice = parseInt(tr.querySelector('.prd-price')?.value) || 0;
          if (!firstProductId) firstProductId = tr.querySelector('.prd-name')?.value || null;
        }
      });

      if (totalQty > 0) {
        const { error: aErr } = await sb.from('sales_a').insert({
          branch_id:     branchId,
          axis_id:       parentId,
          product_id:    null,
          quantity:      totalQty,
          unit_price:    unitPrice,
          cost_price:    costPrice,
          status:        '処理中',
          billing_status:'未請求'
        });
        if (aErr) throw new Error('sales_a INSERT失敗: ' + aErr.message);
        insertedIds.a = branchId;
      }
    }

    // ── 5. B 工事管理 INSERT ──
    const includeB = document.getElementById('include-b')?.checked;
    if (includeB) {
      const bRows = document.querySelectorAll('#sales-b-tbody tr');
      let bSeq = 1;
      for (const tr of bRows) {
        const workName = tr.querySelector('input[type="text"]')?.value?.trim() || '';
        const qty      = parseInt(tr.querySelectorAll('input[type="number"]')[0]?.value) || 0;
        const price    = parseInt(tr.querySelectorAll('input[type="number"]')[1]?.value) || 0;
        if (!workName) continue;
        const branchId = parentId + 'B' + String(bSeq).padStart(2, '0');
        const { error: bErr } = await sb.from('construction_b').insert({
          branch_id:      branchId,
          axis_id:        parentId,
          work_name:      workName,
          unit_price:     price,
          cost_price:     0,
          status:         '処理中',
          billing_status: '未請求'
        });
        if (bErr) throw new Error('construction_b INSERT失敗: ' + bErr.message);
        insertedIds.b = branchId;
        bSeq++;
      }
    }

    // ── 6. C サービス INSERT ──
    const includeC = document.getElementById('include-c')?.checked;
    const subscQty = parseInt(document.getElementById('step4-subsc-qty')?.value) || 0;
    if (includeC && subscQty > 0) {
      const branchId = parentId + 'C01';
      const unitPrice = parseInt(document.getElementById('step4-subsc-price')?.value) || 0;
      // 契約日・プラン・サイクルもフォームから取得して保存する
      const planName    = document.getElementById('step4-subsc-plan')?.value || '';
      const cycle       = document.getElementById('step4-subsc-cycle')?.value || '';
      const contractStart = document.getElementById('step4-subsc-start')?.value || null;
      const contractEnd   = document.getElementById('step4-subsc-end')?.value || null;
      const cNote = [planName, cycle].filter(Boolean).join(' / ');
      const { error: cErr } = await sb.from('service_c').insert({
        branch_id:      branchId,
        axis_id:        parentId,
        product_id:     null,
        unit_price:     unitPrice,
        cost_price:     0,
        status:         '処理中',
        billing_status: '未請求',
        contract_start: contractStart,
        contract_end:   contractEnd,
        renewal_count:  0,
        notes:          cNote
      });
      if (cErr) throw new Error('service_c INSERT失敗: ' + cErr.message);
      insertedIds.c = branchId;
    }

    // ── 7. 完了画面を更新 ──
    updateWizardComplete(insertedIds);

    // ── 8. ステップ5へ遷移 ──
    currentWizardStep = 5;
    updateWizardUI();

    // ── 9. 案件一覧を再読み込み ──
    if (typeof loadOrders === 'function') await loadOrders();

  } catch (e) {
    alert('登録エラー：' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = '確定してアクシスID発行'; }
  }
}

function updateWizardComplete(ids) {
  const box = document.getElementById('id-result-box');
  if (!box) return;
  let html = `
    <div class="id-result-row">
      <span class="id-result-label">アクシスID（申込書）</span>
      <span class="id-result-val pid">${ids.parent}</span>
    </div>`;
  if (ids.a) html += `
    <div class="id-result-row">
      <span class="id-result-label">枝番 A 機器販売</span>
      <span class="id-result-val cid-a">${ids.a}</span>
    </div>`;
  if (ids.b) html += `
    <div class="id-result-row">
      <span class="id-result-label">枝番 B 工事管理</span>
      <span class="id-result-val cid-b">${ids.b}</span>
    </div>`;
  if (ids.c) html += `
    <div class="id-result-row">
      <span class="id-result-label">枝番 C サービス</span>
      <span class="id-result-val cid-c">${ids.c}</span>
    </div>`;
  box.innerHTML = html;
}
