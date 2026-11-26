// Router + event wiring for the household budget SPA (hash routing, no build step).
// Only the dashboard renderer loads up front (views.js). The other six routes
// live in views-pages.js and are fetched with import() on first navigation,
// so they stay out of the first load (see the dossier Totals line).
import { loadState, saveState, resetState, latestMonth } from './store.js';
import { renderDashboard } from './views.js';

// Cached promise for the lazily loaded routes module.
let pagesPromise = null;
function loadPages() {
  if (!pagesPromise) pagesPromise = import('./views-pages.js');
  return pagesPromise;
}
// Monotonic render counter: a slow import() must not overwrite a newer route.
let renderSeq = 0;

let state = loadState();

// UI context kept across re-renders (not persisted).
const ctx = {
  month: latestMonth(state),
  txFilter: { month: '', type: '', category: '', q: '' },
  showTxForm: false,
  editingTx: null,
  editBudget: null,
  showGoalForm: false,
};

const app = document.getElementById('app');
const nav = document.getElementById('nav');

function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  return hash.split('/')[0] || '';
}

async function render() {
  const seq = ++renderSeq;
  const r = route();
  nav.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.dataset.route === r));
  let html = '';
  if (r === 'transactions' || r === 'budgets' || r === 'bills' || r === 'goals' || r === 'reports' || r === 'settings') {
    const pages = await loadPages();
    if (seq !== renderSeq) return; // a newer navigation happened meanwhile
    if (r === 'transactions') html = pages.renderTransactions(state, ctx);
    else if (r === 'budgets') html = pages.renderBudgets(state, ctx);
    else if (r === 'bills') html = pages.renderBills(state, ctx);
    else if (r === 'goals') html = pages.renderGoals(state, ctx);
    else if (r === 'reports') html = pages.renderReports(state, ctx);
    else if (r === 'settings') html = pages.renderSettings(state, ctx);
  } else html = renderDashboard(state, ctx);
  if (seq !== renderSeq) return;
  app.innerHTML = html;
  wire();
}

function download(filename, text, mime = 'application/octet-stream') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCSV() {
  const header = 'date,description,category,type,amount_vnd';
  const rows = [...state.transactions].sort((a, b) => a.date.localeCompare(b.date))
    .map(t => [t.date, '"' + t.description.replace(/"/g, '""') + '"', t.category, t.type, t.amount].join(','));
  download('giao-dich.csv', '\uFEFF' + [header, ...rows].join('\n'), 'text/csv;charset=utf-8');
}

function wire() {
  // Month picker on dashboard
  const mp = document.getElementById('monthPick');
  if (mp) mp.addEventListener('change', () => { ctx.month = mp.value; render(); });

  // --- Transactions ---
  const btnNew = document.getElementById('btnNewTx');
  if (btnNew) btnNew.addEventListener('click', () => { ctx.editingTx = null; ctx.showTxForm = true; render(); });
  const txForm = document.getElementById('txForm');
  if (txForm) {
    txForm.addEventListener('submit', e => {
      e.preventDefault();
      const tx = {
        id: ctx.editingTx ? ctx.editingTx.id : 'tx-' + Date.now(),
        date: document.getElementById('f-date').value,
        amount: Math.round(Number(document.getElementById('f-amount').value)),
        type: document.getElementById('f-type').value,
        category: document.getElementById('f-cat').value,
        description: document.getElementById('f-desc').value.trim(),
      };
      if (!tx.date || !tx.amount || tx.amount <= 0 || !tx.description) return;
      if (ctx.editingTx) {
        const i = state.transactions.findIndex(t => t.id === tx.id);
        if (i >= 0) state.transactions[i] = tx;
      } else state.transactions.push(tx);
      saveState(state);
      ctx.editingTx = null; ctx.showTxForm = false;
      render();
    });
    document.getElementById('txFormCancel').addEventListener('click', () => { ctx.editingTx = null; ctx.showTxForm = false; render(); });
  }
  const q = document.getElementById('q');
  if (q) q.addEventListener('input', () => { ctx.txFilter.q = q.value; render(); q.focus(); q.setSelectionRange(q.value.length, q.value.length); });
  const fm = document.getElementById('f-month');
  if (fm) fm.addEventListener('change', () => { ctx.txFilter.month = fm.value; render(); });
  const ft = document.getElementById('flt-type');
  if (ft) ft.addEventListener('change', () => { ctx.txFilter.type = ft.value; render(); });
  const fc = document.getElementById('flt-cat');
  if (fc) fc.addEventListener('change', () => { ctx.txFilter.category = fc.value; render(); });

  app.querySelectorAll('[data-edit-tx]').forEach(b => b.addEventListener('click', () => {
    ctx.editingTx = state.transactions.find(t => t.id === b.dataset.editTx) || null;
    ctx.showTxForm = true; render();
  }));
  app.querySelectorAll('[data-del-tx]').forEach(b => b.addEventListener('click', () => {
    const t = state.transactions.find(x => x.id === b.dataset.delTx);
    if (t && confirm('Xóa giao dịch "' + t.description + '"?')) {
      state.transactions = state.transactions.filter(x => x.id !== t.id);
      saveState(state); render();
    }
  }));

  // --- Budgets ---
  app.querySelectorAll('[data-edit-budget]').forEach(b => b.addEventListener('click', () => { ctx.editBudget = b.dataset.editBudget; render(); }));
  const bf = document.getElementById('budgetForm');
  if (bf) {
    bf.addEventListener('submit', e => {
      e.preventDefault();
      const b = state.budgets.find(x => x.category === ctx.editBudget);
      if (b) { b.limit = Math.round(Number(document.getElementById('b-limit').value)); saveState(state); }
      ctx.editBudget = null; render();
    });
    document.getElementById('budgetCancel').addEventListener('click', () => { ctx.editBudget = null; render(); });
  }

  // --- Bills ---
  app.querySelectorAll('[data-pay-bill]').forEach(b => b.addEventListener('click', () => {
    const bill = state.bills.find(x => x.id === b.dataset.payBill);
    if (!bill) return;
    bill.paid = true; bill.paidDate = '2026-11-26';
    state.transactions.push({ id: 'tx-' + Date.now(), date: '2026-11-26', description: bill.name, category: bill.category, amount: bill.amount, type: 'expense' });
    saveState(state); render();
  }));
  app.querySelectorAll('[data-unpay-bill]').forEach(b => b.addEventListener('click', () => {
    const bill = state.bills.find(x => x.id === b.dataset.unpayBill);
    if (!bill) return;
    bill.paid = false; bill.paidDate = null; saveState(state); render();
  }));

  // --- Goals ---
  const btnGoal = document.getElementById('btnNewGoal');
  if (btnGoal) btnGoal.addEventListener('click', () => { ctx.showGoalForm = true; render(); });
  const gf = document.getElementById('goalForm');
  if (gf) {
    gf.addEventListener('submit', e => {
      e.preventDefault();
      state.goals.push({
        id: 'goal-' + Date.now(),
        name: document.getElementById('g-name').value.trim(),
        target: Math.round(Number(document.getElementById('g-target').value)),
        current: 0, note: document.getElementById('g-note').value.trim(),
      });
      saveState(state); ctx.showGoalForm = false; render();
    });
    document.getElementById('goalCancel').addEventListener('click', () => { ctx.showGoalForm = false; render(); });
  }
  app.querySelectorAll('.add-funds').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const amt = Math.round(Number(f.querySelector('input').value));
    const g = state.goals.find(x => x.id === f.dataset.goal);
    if (g && amt > 0) { g.current += amt; saveState(state); render(); }
  }));

  // --- Reports ---
  const csv = document.getElementById('btnExportCSV');
  if (csv) csv.addEventListener('click', exportCSV);
  const jsn = document.getElementById('btnExportJSON');
  if (jsn) jsn.addEventListener('click', () => download('ngan-sach-gia-dinh.json', JSON.stringify(state, null, 2), 'application/json'));

  // --- Settings ---
  const sf = document.getElementById('settingsForm');
  if (sf) sf.addEventListener('submit', e => {
    e.preventDefault();
    state.settings.currencyFormat = document.getElementById('s-fmt').value;
    saveState(state); render();
  });
  const bb = document.getElementById('btnBackup');
  if (bb) bb.addEventListener('click', () => download('ngan-sach-gia-dinh-backup.json', JSON.stringify(state, null, 2), 'application/json'));
  const imp = document.getElementById('importFile');
  if (imp) imp.addEventListener('change', () => {
    const file = imp.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const msg = document.getElementById('importMsg');
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.transactions) || !Array.isArray(data.budgets) || !Array.isArray(data.bills) || !Array.isArray(data.goals)) throw new Error('bad file');
        state = data;
        if (!state.settings) state.settings = { currencyFormat: 'short' };
        saveState(state);
        ctx.month = latestMonth(state);
        render();
        const msg2 = document.getElementById('importMsg');
        if (msg2) msg2.textContent = 'Đã nhập ' + data.transactions.length + ' giao dịch, ' + data.goals.length + ' mục tiêu. Dữ liệu đã được khôi phục.';
      } catch (e) {
        msg.textContent = 'File không hợp lệ — đây không phải bản sao lưu của Ngân sách Gia đình.';
      }
    };
    reader.onerror = () => { msg.textContent = 'Không đọc được file — hãy thử lại.'; };
    reader.readAsText(file);
  });
  const br = document.getElementById('btnReset');
  if (br) br.addEventListener('click', () => {
    if (confirm('Đặt lại toàn bộ dữ liệu về dữ liệu mẫu ban đầu? Mọi thay đổi của bạn sẽ mất.')) {
      state = resetState();
      ctx.month = latestMonth(state);
      ctx.txFilter = { month: '', type: '', category: '', q: '' };
      location.hash = '#/';
      render();
    }
  });
}

window.addEventListener('hashchange', () => { ctx.editingTx = null; ctx.showTxForm = false; ctx.editBudget = null; ctx.showGoalForm = false; render(); });
render();
