// Dashboard view renderer — pure HTML strings; main.js wires the events.
// Only the dashboard lives in the first load: the other six routes live in
// views-pages.js and are fetched with import() when the household opens one,
// so the first load stays small (see the dossier Totals line).
import { fmtVND, esc, monthLabel, monthStats, byCategory, monthsList, catLabel, catColor } from './store.js';

function donutSVG(parts, size = 180) {
  const total = parts.reduce((a, p) => a + p.amount, 0) || 1;
  const r = 70, cx = 90, cy = 90, circ = 2 * Math.PI * r;
  let offset = 0;
  const circles = parts.map(p => {
    const frac = p.amount / total;
    const dash = frac * circ;
    const s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${catColor(p.category)}" stroke-width="30" stroke-dasharray="${dash.toFixed(1)} ${Math.max(circ - dash, 0.5).toFixed(1)}" stroke-dashoffset="${(-offset).toFixed(1)}" />`;
    offset += dash;
    return s;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 180 180" role="img" aria-label="Biểu đồ chi tiêu theo hạng mục">
    <circle cx="90" cy="90" r="70" fill="none" stroke="#eef0f3" stroke-width="30" />
    <g transform="rotate(-90 90 90)">${circles}</g>
    <text x="90" y="86" text-anchor="middle" font-size="15" font-weight="700" fill="#1a2233">${fmtVND(total)}</text>
    <text x="90" y="104" text-anchor="middle" font-size="11" fill="#667085">đã chi trong tháng</text>
  </svg>`;
}

export function txRow(t, fmt, showActions) {
  const sign = t.type === 'income' ? '+' : '−';
  const cls = t.type === 'income' ? 'pos' : 'neg';
  const initial = esc(t.description.trim().charAt(0).toUpperCase() || '•');
  return `<div class="txrow">
    <div class="avatar" style="background:${catColor(t.category)}">${initial}</div>
    <div class="grow"><div class="desc">${esc(t.description)}</div>
      <div class="date">${esc(t.date)} · ${esc(catLabel(t.category))}</div></div>
    <div class="money ${cls}">${sign}${fmtVND(t.amount, fmt)}</div>
    ${showActions ? `<button class="btn small" data-edit-tx="${t.id}">Sửa</button>
    <button class="btn small danger" data-del-tx="${t.id}">Xóa</button>` : ''}
  </div>`;
}

export function renderDashboard(state, ctx) {
  const month = ctx.month;
  const st = monthStats(state, month);
  const cats = byCategory(state, month);
  const totalBudget = state.budgets.reduce((a, b) => a + b.limit, 0);
  const unpaid = state.bills.filter(b => !b.paid).sort((a, b) => a.dueDay - b.dueDay);
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  const prev = monthStats(state, prevMonth(month));
  const spentDelta = prev.spent ? Math.round((st.spent - prev.spent) / prev.spent * 100) : 0;
  const fmt = state.settings.currencyFormat;

  const budgetRows = state.budgets.map(b => {
    const spent = cats.find(c => c.category === b.category)?.amount || 0;
    const pct = b.limit ? Math.round(spent / b.limit * 100) : 0;
    const cls = pct > 100 ? 'over' : pct >= 85 ? 'warn' : '';
    return `<div style="margin-bottom:12px"><div class="brow"><span>${esc(catLabel(b.category))}</span>
      <span><b>${fmtVND(spent, fmt)}</b> / ${fmtVND(b.limit, fmt)} · ${pct}%</span></div>
      <div class="bar"><i class="${cls}" style="width:${Math.min(pct, 100)}%"></i></div></div>`;
  }).join('');

  return `
  <div class="page-head"><div><h1>Tổng quan — ${monthLabel(month)}</h1>
  <p class="muted">Thu nhập 2 lương + làm thêm · chi tiêu thực tế của gia đình 4 người.</p></div>
  <select id="monthPick" aria-label="Chọn tháng">${monthsList(state).map(m => `<option value="${m}" ${m === month ? 'selected' : ''}>${monthLabel(m)}</option>`).join('')}</select></div>

  <div class="grid g4" style="margin-bottom:14px">
    <div class="card stat"><div class="label">Thu nhập</div><div class="value pos">+${fmtVND(st.income, fmt)}</div>
      <div class="delta muted">${st.txs.filter(t => t.type === 'income').length} khoản thu</div></div>
    <div class="card stat"><div class="label">Chi tiêu</div><div class="value neg">−${fmtVND(st.spent, fmt)}</div>
      <div class="delta ${spentDelta <= 0 ? 'pos' : 'neg'}">${spentDelta <= 0 ? 'Giảm' : 'Tăng'} ${Math.abs(spentDelta)}% so với tháng trước</div></div>
    <div class="card stat hero"><div class="label">Còn lại</div><div class="value">${fmtVND(st.remaining, fmt)}</div>
      <div class="delta muted">trên tổng ngân sách ${fmtVND(totalBudget, fmt)}</div></div>
    <div class="card stat"><div class="label">Tỉ lệ tiết kiệm</div><div class="value" style="color:#15803d">${Math.round(st.rate * 100)}%</div>
      <div class="delta muted">mục tiêu gia đình: 25%</div></div>
  </div>

  <div class="grid g2">
    <div class="card"><h2>Chi tiêu theo hạng mục</h2>
      <div class="chart-wrap">${donutSVG(cats)}
        <div style="flex:1;min-width:180px">${cats.slice(0, 6).map(c => `
          <div class="brow" style="padding:4px 0"><span><i class="dot" style="background:${catColor(c.category)}"></i>${esc(catLabel(c.category))}</span>
          <b>${fmtVND(c.amount, fmt)}</b></div>`).join('')}
          <div class="muted" style="margin-top:8px">Nhà ở chiếm tỉ trọng lớn nhất — tiền thuê 7,5 tr/tháng.</div></div></div>
    </div>
    <div class="card"><h2>Tiến độ ngân sách tháng</h2>${budgetRows}
      <a href="#/budgets">Điều chỉnh hạn mức →</a></div>
  </div>

  <div class="grid g2" style="margin-top:14px">
    <div class="card"><h2>Hóa đơn sắp tới</h2>
      ${unpaid.length ? unpaid.map(b => `
        <div class="txrow"><div class="avatar" style="background:${catColor(b.category)}">!</div>
        <div class="grow"><div class="desc">${esc(b.name)}</div>
        <div class="date">Hạn ngày ${b.dueDay}/11 · ${esc(b.note || '')}</div></div>
        <div class="money">${fmtVND(b.amount, fmt)}</div>
        <button class="btn small primary" data-pay-bill="${b.id}">Đã trả</button></div>`).join('')
      : '<p class="muted">Đã thanh toán hết hóa đơn tháng này. 🎉</p>'}
      <div style="margin-top:10px"><a href="#/bills">Xem tất cả hóa đơn →</a></div></div>
    <div class="card"><h2>Giao dịch gần đây</h2>
      ${recent.map(t => txRow(t, fmt, false)).join('')}
      <div style="margin-top:10px"><a href="#/transactions">Xem tất cả giao dịch →</a></div></div>
  </div>`;
}

function prevMonth(m) {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 2, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
