# AxisCRM Phase 9 修正指示書（Claude Code用）

## 共通ルール

- 各 №（タスク）を上から順に実装してください
- 各 № 完了ごとに `git commit -m "Phase9-№N: 概要"` でコミット
- 全 № 完了後に `git push` で本番反映
- すべての確認ダイアログは **Yes/Allow**
- ファイル構成：
  - `index.html`（ログイン・パスワード再設定）
  - `app.html`（メインアプリ）
  - `css/style.css`
  - `js/config.js`
  - `js/app.js`
  - `supabase/functions/<name>/index.ts`（Edge Functions）
- Supabase client：`window._sb`
- 現在ユーザー：`window.currentUser = {uid, displayName, name, email, role}`
- ローカル確認：`serve.bat` 起動 → http://[::1]:3000/index.html

---

## 【最優先】№0：モックHTML対比チェック（事前調査）

### 目的
Phase 3-③ のファイル分割時に消えた機能を洗い出す。

### 手順
1. `git log --all --oneline | head -50` で Phase 3-③ 前後のコミット特定
2. Phase 3-③ 直前のコミットの `index.html`（当時はモノリシック）を取得：
   ```bash
   git show <commit-hash>:index.html > /tmp/mock_original.html
   ```
3. 現在の `index.html` + `app.html` を結合した内容と比較：
   ```bash
   cat index.html app.html > /tmp/current_combined.html
   diff /tmp/mock_original.html /tmp/current_combined.html > /tmp/missing_features.txt
   ```
4. `/tmp/missing_features.txt` の中から、**機能（ボタン・モーダル・関数）が削除されている箇所**を抽出し、`PHASE9_MISSING.md` ファイルに以下フォーマットで列挙：
   ```
   ## 消失機能リスト
   - [画面名] 機能名（行番号）
   - 例: [企業詳細] 「拠点を追加」ボタン（mock L1234-L1245）
   ```
5. ファイルを git commit して push、細谷さんの確認待ち

### 完了条件
`PHASE9_MISSING.md` がリポジトリにコミットされ、消失機能が一覧化されている。

---

## 【高優先】№1：パスワードリセット依頼 401エラー修正

### 症状
index.html の「パスワードが不明な方はこちら」→メール入力→送信で `エラー: 401`。

### 原因調査
1. Supabase Dashboard → Edge Functions → `request-password-reset` → Logs 確認
2. `supabase/functions/request-password-reset/index.ts` の中身確認
3. `supabase/config.toml` で `verify_jwt` 設定確認

### 修正内容

**A. Edge Function 設定**

`supabase/functions/request-password-reset/index.ts` の冒頭に以下が無い場合は追加：
```typescript
// CORS対応 + JWT検証スキップ（公開エンドポイントのため）
export const config = {
  verify_jwt: false
};
```

または `supabase/config.toml` に：
```toml
[functions.request-password-reset]
verify_jwt = false
```

**B. フロント側ヘッダー確認**

`index.html` 内の `submitPasswordResetRequest()` の fetch 部分が以下になっているか確認、なっていなければ修正：
```javascript
const res = await fetch(
  'https://ejtaqzwqadkcdbvxocfw.supabase.co/functions/v1/request-password-reset',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`  // ← これが必要
    },
    body: JSON.stringify({ email })
  }
);
```

### デプロイ
```bash
supabase functions deploy request-password-reset
```

### 確認方法
1. `serve.bat` 起動
2. http://[::1]:3000/index.html → こちらリンク
3. tests@axis.co.jp 入力→送信
4. 「初期化依頼を受け付けました」が表示されればOK

---

## 【高優先】№2：Chrome戻るボタン対応

### 症状
app.html 内でブラウザの戻るボタンを押すと一画面前ではなくログイン画面まで戻る。

### 修正内容

**A. 画面切替関数の改修**

`app.html` または `js/app.js` 内の画面切替関数（おそらく `showScreen()` `navigateTo()` 等）を特定し、以下を追加：

```javascript
function showScreen(screenName, pushHistory = true) {
  // 既存の画面切替ロジック
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById(`screen-${screenName}`).classList.add('active');
  
  // ★追加：ブラウザ履歴に追加
  if (pushHistory) {
    history.pushState({ screen: screenName }, '', `#${screenName}`);
  }
}
```

**B. popstate イベントリスナー追加**

app.html の DOMContentLoaded 内（または app.js の初期化部）に追加：
```javascript
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.screen) {
    showScreen(e.state.screen, false);  // pushHistory=false で履歴を二重登録しない
  } else {
    // ハッシュから画面復元
    const hash = window.location.hash.replace('#', '');
    if (hash) showScreen(hash, false);
  }
});

// 初回ロード時：URL hashがあればその画面を表示
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    showScreen(hash, false);
  } else {
    showScreen('dashboard', false);  // デフォルト画面名は実装に合わせて
  }
});
```

### 確認方法
1. ダッシュボード → 企業管理 → 担当者管理 と遷移
2. Chrome戻るボタン → 企業管理に戻ること
3. もう一度戻る → ダッシュボードに戻ること
4. ログアウトボタンでのみログイン画面に戻ること

---

## 【高優先】№3：企業削除機能追加

### 症状
企業管理画面で企業自体を削除できない。

### 修正内容

**A. 企業一覧テーブルに削除ボタン追加**

`app.html` の企業一覧表示部（`renderCompanyList()` または同等関数）の操作カラムに：
```javascript
<button class="btn btn-sm btn-danger" onclick="deleteCompany('${company.id}', '${company.name}')">
  <i class="ti ti-trash"></i> 削除
</button>
```

**B. 削除関数の実装**

```javascript
async function deleteCompany(companyId, companyName) {
  // 紐づくデータの確認
  const { data: branches } = await window._sb
    .from('branches')
    .select('id')
    .eq('company_id', companyId);
  
  const { data: contacts } = await window._sb
    .from('contacts')
    .select('id')
    .eq('company_id', companyId);
  
  const { data: cases } = await window._sb
    .from('cases')
    .select('id')
    .eq('company_id', companyId);
  
  const counts = [];
  if (branches?.length) counts.push(`拠点 ${branches.length}件`);
  if (contacts?.length) counts.push(`担当者 ${contacts.length}件`);
  if (cases?.length) counts.push(`案件 ${cases.length}件`);
  
  let confirmMsg = `「${companyName}」を削除しますか？`;
  if (counts.length > 0) {
    confirmMsg += `\n\n⚠️ この企業には以下のデータが紐づいています：\n${counts.join('\n')}\n\nすべて連動して削除されます。本当に削除しますか？`;
  }
  
  if (!confirm(confirmMsg)) return;
  
  // カスケード削除（cases → contacts → branches → companies の順）
  if (cases?.length) {
    await window._sb.from('cases').delete().eq('company_id', companyId);
  }
  if (contacts?.length) {
    await window._sb.from('contacts').delete().eq('company_id', companyId);
  }
  if (branches?.length) {
    await window._sb.from('branches').delete().eq('company_id', companyId);
  }
  
  const { error } = await window._sb.from('companies').delete().eq('id', companyId);
  
  if (error) {
    alert('削除に失敗しました: ' + error.message);
    return;
  }
  
  alert('削除しました');
  await loadCompanyList();  // 一覧再読み込み（関数名は実装に合わせる）
}
```

### 確認方法
1. 企業管理 → ウツノミヤ電気管理事務所の「削除」ボタン
2. 確認ダイアログ → OK
3. 一覧から消えていることを確認

---

## 【高優先】№4：案件管理 集計修正＋枝番ゼロ問題

### 症状
- 集計（今月6件・累計89件・枝番8件）と一覧表示が一致しない
- 一覧の「枝番数 0件」表示が存在する

### 修正内容

**A. SQL：枝番ゼロを1にリナンバー（Supabase SQL Editor で実行）**

```sql
-- 現状確認
SELECT axis_id, branch_id FROM branches WHERE branch_id LIKE '%0' ORDER BY axis_id;

-- A0, B0 を A1, B1 にリナンバー（ただし同axis_id内でA1が既に存在しないことを確認してから実行）
UPDATE branches 
SET branch_id = REPLACE(branch_id, '0', '1')
WHERE branch_id IN ('A0', 'B0')
  AND NOT EXISTS (
    SELECT 1 FROM branches b2 
    WHERE b2.axis_id = branches.axis_id 
    AND b2.branch_id = REPLACE(branches.branch_id, '0', '1')
  );

-- 残った重複する0番台は手動確認 → axis_idごとに連番振り直し
```

**B. 集計クエリ修正**

`app.js` の案件管理初期化部（おそらく `loadCaseManagement()` または `initCasePage()` 等）：

```javascript
async function loadCaseStats() {
  // 今月の申込書数
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  const { count: thisMonthCount } = await window._sb
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthStart.toISOString());
  
  // 累計申込書数
  const { count: totalCount } = await window._sb
    .from('cases')
    .select('*', { count: 'exact', head: true });
  
  // 発行済み枝番数（A/B/C別）
  const { data: branches } = await window._sb
    .from('branches')
    .select('branch_id');
  
  const aCount = branches.filter(b => b.branch_id?.startsWith('A')).length;
  const bCount = branches.filter(b => b.branch_id?.startsWith('B')).length;
  const cCount = branches.filter(b => b.branch_id?.startsWith('C')).length;
  
  document.getElementById('stat-this-month').textContent = `${thisMonthCount}件`;
  document.getElementById('stat-total').textContent = `${totalCount}件`;
  document.getElementById('stat-branches').textContent = `${aCount + bCount + cCount}件`;
  document.getElementById('stat-branches-detail').textContent = `A:${aCount} B:${bCount} C:${cCount}（現行）`;
}
```

**C. 枝番付番ロジック修正**

`app.js` で新規枝番発行する関数（`createBranch()` 等）：
- 取引種別Aの場合：既存のA枝番をCOUNT → 次の番号で `A${count+1}` を発行（最低1から）
- 同様にB、C も最低1から開始

具体的には、現在のロジックに `if (count === 0) count = 1` のような0スキップ処理を追加。

**D. 一覧の枝番数表示修正**

各案件行の「枝番数」カラムが0と表示される問題：
```javascript
// 各caseに対して紐づくbranches件数を取得
const { count } = await window._sb
  .from('branches')
  .select('*', { count: 'exact', head: true })
  .eq('axis_id', caseRow.axis_id);
```
0件のケースについては、データの整合性を確認（branchesテーブルにレコードが無いケースが本当に正しいか）。

### 確認方法
- 案件管理画面でカード3つの数字が一覧の実数と一致
- 枝番0表示が消えている

---

## 【高優先】№5：Cサブスクサービス追加機能（致命的）

### 症状
申込ウィザード Step4 に「+ 工事B（工事管理）を追加」ボタンはあるが、Cサブスク追加ボタンが無い。

### 修正内容

**A. Step4 にボタン追加**

`app.html` の Step4 部分、「+ 工事B（工事管理）を追加」ボタンの隣に：
```html
<button class="btn btn-secondary" onclick="addSubscriptionSection()">
  <i class="ti ti-plus"></i> サブスクC（サブスクサービス）を追加
</button>
```

**B. サブスクセクション追加関数**

```javascript
function addSubscriptionSection() {
  const container = document.getElementById('wizard-subscriptions-container');
  const idx = container.children.length;
  
  const html = `
    <div class="wizard-section subscription-section" data-section-type="C" data-idx="${idx}">
      <div class="section-header">
        <h3>サブスクC #${idx + 1}</h3>
        <button class="btn-icon" onclick="removeSubscriptionSection(${idx})"><i class="ti ti-x"></i></button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>商品（サブスク）</label>
          <select class="form-control sub-product" required>
            <option value="">選択してください</option>
            <!-- products テーブルから category='subscription' を動的ロード -->
          </select>
        </div>
        <div class="form-group">
          <label>契約開始日</label>
          <input type="date" class="form-control sub-start-date" required>
        </div>
        <div class="form-group">
          <label>月額（税抜）</label>
          <input type="number" class="form-control sub-monthly-price" required>
        </div>
        <div class="form-group">
          <label>契約期間（月）</label>
          <input type="number" class="form-control sub-duration" value="12" required>
        </div>
      </div>
      <div class="form-group">
        <label>備考</label>
        <textarea class="form-control sub-notes" rows="2"></textarea>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', html);
  
  // サブスク商品ロード
  loadSubscriptionProducts(container.lastElementChild.querySelector('.sub-product'));
}

async function loadSubscriptionProducts(selectEl) {
  const { data: products } = await window._sb
    .from('products')
    .select('id, name, monthly_price')
    .eq('category', 'subscription');  // products テーブルの category 列名は実装に合わせて
  
  products?.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name}（¥${p.monthly_price?.toLocaleString() || 0}/月）`;
    opt.dataset.monthlyPrice = p.monthly_price;
    selectEl.appendChild(opt);
  });
}
```

**C. 確定時のINSERT処理**

`finalizeWizard()` または同等の確定関数内、A/B同様にCもINSERT：
```javascript
// サブスクセクションを取得して services + branches に登録
const subSections = document.querySelectorAll('.subscription-section');
for (const section of subSections) {
  // C枝番発行（年次インクリメント、年内既存件数+1）
  const year = new Date().getFullYear();
  const { count } = await window._sb
    .from('branches')
    .select('*', { count: 'exact', head: true })
    .like('branch_id', 'C%')
    .gte('created_at', `${year}-01-01`)
    .lt('created_at', `${year + 1}-01-01`);
  
  const newBranchId = `C${String((count || 0) + 1).padStart(2, '0')}`;  // C01, C02, ...
  
  // branches INSERT
  const { data: branchData, error: brErr } = await window._sb.from('branches').insert({
    axis_id: newAxisId,  // ウィザードで発行済みの親ID
    branch_id: newBranchId,
    company_id: selectedCompanyId,
    contact_id: mainContactId,
    transaction_type: 'C'
  }).select().single();
  
  // services INSERT
  await window._sb.from('services').insert({
    branch_id: branchData.id,
    product_id: section.querySelector('.sub-product').value,
    start_date: section.querySelector('.sub-start-date').value,
    monthly_price: parseInt(section.querySelector('.sub-monthly-price').value),
    duration_months: parseInt(section.querySelector('.sub-duration').value),
    notes: section.querySelector('.sub-notes').value,
    status: '契約中'
  });
}
```

### 確認方法
1. 新規申込書受付 → ウィザード進行 → Step4
2. 「+ サブスクCを追加」ボタンが表示される
3. 入力 → 確定 → branches と services に登録される
4. 案件詳細を開くと C枝番として表示される

---

## 【中優先】№6：発注書AI解析の精度向上

### 症状
ご発注書.pdf の実合計 ¥48,700 → システム表示 ¥62,700（数量0行も加算されている）。

### 修正内容

**A. Edge Function `extract-pdf` のプロンプト改善**

`supabase/functions/extract-pdf/index.ts` 内、Claude Haiku に投げるプロンプト部分を以下のように改修：

```typescript
const prompt = `
あなたは発注書PDFを解析するAIです。以下のルールを厳守してください。

【商品明細抽出ルール】
1. 「数量」欄が空欄、0、または「ー」「-」「—」の行は完全に無視してください
2. 数量に正の整数が記載されている行のみを抽出してください
3. 各行について以下を返してください：
   - product_code（商品コード）
   - product_name（商品名）
   - quantity（数量、整数）
   - unit_price（単価、整数）
   - subtotal（小計 = quantity × unit_price）

【合計金額ルール】
1. PDFに「合計（税別）」「合計」「Total」等の記載があれば、その値を pdf_total として返してください
2. 上記で抽出した商品行の subtotal を合算した値を calculated_total として返してください
3. pdf_total と calculated_total が一致しない場合、warnings 配列に "金額不一致: PDF合計=X, 計算合計=Y" を追加してください

【発注者情報】
... (既存のプロンプト維持)

出力は以下のJSON形式で：
{
  "company": { ... },
  "main_contact": { ... },
  "products": [
    { "product_code": "...", "product_name": "...", "quantity": 1, "unit_price": 48700, "subtotal": 48700 }
  ],
  "pdf_total": 48700,
  "calculated_total": 48700,
  "warnings": []
}
`;
```

**B. フロント側で数量0行を非表示**

`app.html` の Step4 商品明細表示部分：
```javascript
function renderProductsFromPdf(products) {
  const tbody = document.getElementById('wizard-products-tbody');
  tbody.innerHTML = '';
  
  // 数量0の行は表示しない（または薄く表示）
  products.filter(p => p.quantity > 0).forEach(p => {
    // 行を生成
  });
}
```

**C. 合計金額の検証表示**

Step4 の合計欄に、PDF記載合計と計算合計の比較を表示：
```html
<div class="total-summary">
  <div>計算合計：¥<span id="calc-total">0</span></div>
  <div id="pdf-total-warning" style="display:none; color:red;">
    ⚠️ PDF記載合計（¥<span id="pdf-total"></span>）と一致しません
  </div>
</div>
```

### デプロイ
```bash
supabase functions deploy extract-pdf
```

### 確認方法
1. `ご発注書.pdf` をウィザード Step1 でアップロード
2. Step4 で合計が ¥48,700 になっていることを確認
3. 数量0の行が非表示になっていることを確認

---

## 【中優先】№7：既存企業マッチングAI判定

### 修正内容

**A. Edge Function `extract-pdf` 内で既存企業との類似度判定追加**

`supabase/functions/extract-pdf/index.ts` のPDF解析後、別のClaude呼び出しを追加：

```typescript
// PDF解析で得た会社名
const extractedCompanyName = result.company.name;

// 既存企業リスト取得（Supabase admin client で）
const { data: existingCompanies } = await supabaseAdmin
  .from('companies')
  .select('id, name, address');

// Haikuに類似度判定を依頼
const matchPrompt = `
以下の抽出企業名と、既存DBの企業名リストを比較し、類似度をスコア化してください。

抽出企業名: "${extractedCompanyName}"
抽出住所: "${result.company.address || ''}"

既存企業リスト:
${existingCompanies.map((c, i) => `${i+1}. ${c.name} (住所: ${c.address || '未登録'})`).join('\n')}

以下のJSON形式で、類似度スコア50%以上の候補のみ返してください：
{
  "matches": [
    { "company_id": "...", "company_name": "...", "score": 95, "reason": "企業名完全一致" }
  ]
}

判定基準：
- 100%: 完全一致
- 80-99%: 表記揺れ（株式会社の有無、空白差）
- 50-79%: 部分一致または住所一致
- 50%未満: 候補から除外
`;

const matchResp = await callClaude(matchPrompt);
result.company_matches = JSON.parse(matchResp).matches;
```

**B. フロント側で類似度スコア表示**

Step2 の既存企業チェック部分を改修：
```html
<div class="match-candidate" data-company-id="${match.company_id}">
  <div class="match-score-bar">
    <div class="match-score-fill" style="width:${match.score}%; background:${getScoreColor(match.score)};"></div>
  </div>
  <div class="match-score-label">マッチング度: ${match.score}%</div>
  <div class="match-company-name">${match.company_name}</div>
  <div class="match-reason">${match.reason}</div>
</div>
```

```javascript
function getScoreColor(score) {
  if (score >= 90) return '#22c55e';  // 緑
  if (score >= 70) return '#eab308';  // 黄
  return '#f97316';  // 橙
}
```

### 確認方法
ご発注書.pdf（ウツノミヤ電気管理事務所）アップロード→Step2で類似度スコア表示される

---

## 【中優先】№8：担当者登録の改善

### 修正内容

**A. PDF抽出担当者を★メインに自動設定**

`app.html` の Step3 描画関数：
```javascript
function renderContactsStep(extractedContact, existingContactsForCompany) {
  const container = document.getElementById('contacts-step-container');
  container.innerHTML = '';
  
  // PDF抽出担当者を★メインで先頭表示
  container.insertAdjacentHTML('beforeend', renderContactCard(extractedContact, {
    isMain: true,
    fromPdf: true
  }));
  
  // 既存企業の他の担当者を候補として表示
  existingContactsForCompany.forEach(c => {
    container.insertAdjacentHTML('beforeend', renderContactCard(c, {
      isMain: false,
      fromExisting: true
    }));
  });
}

function renderContactCard(contact, opts) {
  const mainBadge = opts.isMain 
    ? '<span class="badge badge-main">★ メイン担当者</span>'
    : '<span class="badge badge-sub">サブ担当者</span>';
  const sourceBadge = opts.fromPdf 
    ? '<span class="badge badge-pdf">PDF記載</span>'
    : opts.fromExisting 
    ? '<span class="badge badge-existing">既存登録</span>'
    : '';
  const setMainBtn = opts.isMain 
    ? '' 
    : `<button class="btn-link" onclick="setAsMain(this)">★ メインに設定</button>`;
  
  return `
    <div class="contact-card" data-contact-id="${contact.id || ''}" data-is-main="${opts.isMain}">
      <div class="contact-header">
        <strong>${contact.last_name} ${contact.first_name}</strong>
        ${mainBadge} ${sourceBadge} ${setMainBtn}
      </div>
      <!-- 既存フィールド（役職・部署・電話等） -->
    </div>
  `;
}
```

**B. 既存担当者ロード処理**

Step2で企業が確定したら、その企業の既存担当者を取得：
```javascript
async function onCompanyConfirmed(companyId) {
  const { data: existingContacts } = await window._sb
    .from('contacts')
    .select('*')
    .eq('company_id', companyId);
  
  // Step3表示時に渡す
  renderContactsStep(pdfExtractedContact, existingContacts || []);
}
```

**C. ★メイン切替処理**

```javascript
function setAsMain(btn) {
  const card = btn.closest('.contact-card');
  
  // 既存のメインから外す
  document.querySelectorAll('.contact-card[data-is-main="true"]').forEach(c => {
    c.dataset.isMain = 'false';
    c.querySelector('.badge-main')?.replaceWith(
      Object.assign(document.createElement('span'), {
        className: 'badge badge-sub',
        textContent: 'サブ担当者'
      })
    );
  });
  
  // このカードをメインに
  card.dataset.isMain = 'true';
  card.querySelector('.badge-sub').replaceWith(
    Object.assign(document.createElement('span'), {
      className: 'badge badge-main',
      textContent: '★ メイン担当者'
    })
  );
  btn.remove();
}
```

### 確認方法
ご発注書.pdf解析→Step3で発注書記載担当者が★メイン、企業所属の他担当者が候補表示

---

## 【低優先】№9：担当者管理 アクシスID数＋削除ボタン

### 修正内容

**A. アクシスID数集計クエリ**

`app.js` の担当者管理ロード関数：
```javascript
async function loadContactsList() {
  // 全担当者取得
  const { data: contacts } = await window._sb
    .from('contacts')
    .select(`
      *,
      companies(name)
    `);
  
  // 各担当者の紐づくbranches数（contact_id で集計）
  for (const contact of contacts) {
    const { count } = await window._sb
      .from('branches')
      .select('*', { count: 'exact', head: true })
      .eq('contact_id', contact.id);
    contact.axis_count = count || 0;
  }
  
  renderContactsList(contacts);
}
```

※ もし contact_id が branches に無く、cases にある場合は cases テーブルでカウント。実テーブル構造に合わせる。

**B. 一覧に削除ボタン追加**

```javascript
function renderContactsList(contacts) {
  const tbody = document.getElementById('contacts-tbody');
  tbody.innerHTML = contacts.map(c => `
    <tr>
      <td>${c.last_name} ${c.first_name}</td>
      <td>${c.furigana || ''}</td>
      <td>${c.companies?.name || ''}</td>
      <td>${c.department || ''}</td>
      <td>${c.role || ''}</td>
      <td>${c.phone || ''}</td>
      <td>${c.fax || '—'}</td>
      <td><a href="mailto:${c.email}">${c.email}</a></td>
      <td>${c.axis_count}件</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editContact('${c.id}')">編集</button>
        <button class="btn btn-sm btn-danger" onclick="deleteContact('${c.id}', '${c.last_name} ${c.first_name}')">削除</button>
      </td>
    </tr>
  `).join('');
}

async function deleteContact(contactId, name) {
  // 紐づく案件確認
  const { count } = await window._sb
    .from('branches')
    .select('*', { count: 'exact', head: true })
    .eq('contact_id', contactId);
  
  let msg = `「${name}」を削除しますか？`;
  if (count > 0) {
    msg += `\n\n⚠️ ${count}件の案件に紐づいています。担当者を削除すると案件側の担当者参照が外れます。続行しますか？`;
  }
  
  if (!confirm(msg)) return;
  
  const { error } = await window._sb.from('contacts').delete().eq('id', contactId);
  if (error) {
    alert('削除失敗: ' + error.message);
    return;
  }
  alert('削除しました');
  await loadContactsList();
}
```

### 確認方法
担当者管理一覧でアクシスID数が0以外で表示される、削除ボタンで削除できる

---

## 【低優先】№10：代理店編集機能追加

### 修正内容

**A. 一覧に編集・削除ボタン追加**

`app.js` の代理店一覧描画関数：
```javascript
function renderAgenciesList(agencies) {
  const tbody = document.getElementById('agencies-tbody');
  tbody.innerHTML = agencies.map(a => `
    <tr>
      <td>${a.name}</td>
      <td>${a.furigana || ''}</td>
      <td>${a.phone || ''}</td>
      <td>${a.email || ''}</td>
      <td>${a.address || ''}</td>
      <td>${a.linked_company_name || ''}</td>
      <td>${a.linked_axis_id || ''}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openAgencyEditModal('${a.id}')">編集</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAgency('${a.id}', '${a.name}')">削除</button>
      </td>
    </tr>
  `).join('');
}
```

**B. 編集モーダル**

`app.html` に代理店編集モーダルを追加（既存の新規登録モーダルがあるなら流用）：
```html
<div id="agency-edit-modal" class="modal" style="display:none;">
  <div class="modal-content">
    <h3>代理店編集</h3>
    <input type="hidden" id="agency-edit-id">
    <div class="form-group">
      <label>代理店名</label>
      <input type="text" id="agency-edit-name" class="form-control">
    </div>
    <div class="form-group">
      <label>フリガナ</label>
      <input type="text" id="agency-edit-furigana" class="form-control">
    </div>
    <div class="form-group">
      <label>電話番号</label>
      <input type="text" id="agency-edit-phone" class="form-control">
    </div>
    <div class="form-group">
      <label>メールアドレス</label>
      <input type="email" id="agency-edit-email" class="form-control">
    </div>
    <div class="form-group">
      <label>住所</label>
      <input type="text" id="agency-edit-address" class="form-control">
    </div>
    <div class="form-group">
      <label>紐づく企業</label>
      <select id="agency-edit-company" class="form-control"></select>
    </div>
    <div class="modal-footer">
      <button onclick="closeAgencyEditModal()">キャンセル</button>
      <button class="btn btn-primary" onclick="saveAgencyEdit()">保存</button>
    </div>
  </div>
</div>
```

**C. 編集モーダル制御関数**

```javascript
async function openAgencyEditModal(agencyId) {
  const { data: agency } = await window._sb
    .from('agencies')  // テーブル名は実装に合わせて
    .select('*')
    .eq('id', agencyId)
    .single();
  
  document.getElementById('agency-edit-id').value = agency.id;
  document.getElementById('agency-edit-name').value = agency.name || '';
  document.getElementById('agency-edit-furigana').value = agency.furigana || '';
  document.getElementById('agency-edit-phone').value = agency.phone || '';
  document.getElementById('agency-edit-email').value = agency.email || '';
  document.getElementById('agency-edit-address').value = agency.address || '';
  
  // 企業セレクトボックスをロード
  const { data: companies } = await window._sb.from('companies').select('id, name');
  const select = document.getElementById('agency-edit-company');
  select.innerHTML = '<option value="">選択してください</option>' + 
    companies.map(c => `<option value="${c.id}" ${c.id === agency.company_id ? 'selected' : ''}>${c.name}</option>`).join('');
  
  document.getElementById('agency-edit-modal').style.display = 'flex';
}

function closeAgencyEditModal() {
  document.getElementById('agency-edit-modal').style.display = 'none';
}

async function saveAgencyEdit() {
  const id = document.getElementById('agency-edit-id').value;
  const updates = {
    name: document.getElementById('agency-edit-name').value,
    furigana: document.getElementById('agency-edit-furigana').value,
    phone: document.getElementById('agency-edit-phone').value,
    email: document.getElementById('agency-edit-email').value,
    address: document.getElementById('agency-edit-address').value,
    company_id: document.getElementById('agency-edit-company').value || null,
    updated_at: new Date().toISOString()
  };
  
  const { error } = await window._sb.from('agencies').update(updates).eq('id', id);
  if (error) {
    alert('保存失敗: ' + error.message);
    return;
  }
  alert('保存しました');
  closeAgencyEditModal();
  await loadAgenciesList();
}

async function deleteAgency(agencyId, name) {
  if (!confirm(`代理店「${name}」を削除しますか？`)) return;
  const { error } = await window._sb.from('agencies').delete().eq('id', agencyId);
  if (error) {
    alert('削除失敗: ' + error.message);
    return;
  }
  alert('削除しました');
  await loadAgenciesList();
}
```

### 確認方法
代理店管理 → 「あるフあ」の編集ボタン → モーダル表示 → 保存できる

---

## 【最終】№11：消失機能の復活作業

### 手順
1. №0 で作成した `PHASE9_MISSING.md` を細谷さんと確認
2. 復活させる機能の優先度を細谷さんに確認
3. 優先順に1つずつ復活させ、機能ごとに git commit
4. 完了したら `PHASE9_MISSING.md` の該当項目に ✅ をつけてコミット

---

## 完了報告フォーマット

全 № 完了後、以下を細谷さんに報告：

```
Phase 9 完了報告

✅ №0: モックHTML対比チェック → PHASE9_MISSING.md 作成
✅ №1: パスワードリセット401修正
✅ №2: Chrome戻るボタン対応
✅ №3: 企業削除機能追加
✅ №4: 案件管理集計修正＋枝番ゼロ修正
✅ №5: Cサブスクサービス追加機能
✅ №6: 発注書AI解析精度向上
✅ №7: 既存企業マッチングAI判定
✅ №8: 担当者登録改善
✅ №9: 担当者管理アクシスID数＋削除ボタン
✅ №10: 代理店編集機能追加
✅ №11: 消失機能復活（X件）

最新commit: <hash>
本番反映済み: https://hosoya-version.github.io/axis-M2Mcrm/index.html

確認お願いします。
```

---

## 不明点があった場合

- テーブル列名・テーブル名が指示書と異なる場合：実テーブルに合わせて読み替える
- 関数名・ID名が指示書と異なる場合：実コードを grep して特定
- どうしても判断できない場合は、その № をスキップして次へ進み、最後にまとめて報告
