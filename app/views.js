// View renderers — pure HTML strings; main.js wires the events.
import { fmtVND, esc, monthLabel, monthStats, byCategory, monthsList, catLabel, catColor, CATEGORIES } from './store.js';

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

function barChartSVG(rows, height = 220) {
  // rows: [{label, income, spent}]
  const max = Math.max(...rows.map(r => Math.max(r.income, r.spent)), 1);
  const W = 640, H = height, padB = 26, padT = 12, bw = 22, gap = 14;
  const slot = (W - 20) / rows.length;
  let bars = '', labels = '';
  rows.forEach((r, i) => {
    const x = 10 + i * slot + (slot - bw * 2 - 6) / 2;
    const hi = (r.income / max) * (H - padB - padT);
    const hs = (r.spent / max) * (H - padB - padT);
    bars += `<rect x="${x.toFixed(1)}" y="${(H - padB - hi).toFixed(1)}" width="${bw}" height="${hi.toFixed(1)}" rx="3" fill="#16a34a"><title>Thu ${fmtVND(r.income, 'full')}</title></rect>`;
    bars += `<rect x="${(x + bw + 6).toFixed(1)}" y="${(H - padB - hs).toFixed(1)}" width="${bw}" height="${hs.toFixed(1)}" rx="3" fill="#dc2626"><title>Chi ${fmtVND(r.spent, 'full')}</title></rect>`;
    labels += `<text x="${(10 + i * slot + slot / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#667085">${r.label}</text>`;
  });
  return `<svg width="100%" viewBox="0 0 ${W} ${H}" role="img" aria-label="Thu chi 12 tháng">
    <line x1="0" y1="${H - padB}" x2="${W}" y2="${H - padB}" stroke="#e4e7ec" />${bars}${labels}</svg>
  <div class="legend"><span><i class="dot" style="background:#16a34a"></i>Thu nhập</span><span><i class="dot" style="background:#dc2626"></i>Chi tiêu</span></div>`;
}

function txRow(t, fmt, showActions) {
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
    <div class="card stat"><div class="label">Còn lại</div><div class="value">${fmtVND(st.remaining, fmt)}</div>
      <div class="delta muted">trên tổng ngân sách ${fmtVND(totalBudget, fmt)}</div></div>
    <div class="card stat"><div class="label">Tỉ lệ tiết kiệm</div><div class="value" style="color:#2563eb">${Math.round(st.rate * 100)}%</div>
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

export function renderTransactions(state, ctx) {
  const fmt = state.settings.currencyFormat;
  const f = ctx.txFilter;
  const cats = CATEGORIES.filter(c => c.type === 'expense');
  const months = monthsList(state);
  let list = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date));
  if (f.month) list = list.filter(t => t.date.slice(0, 7) === f.month);
  if (f.type) list = list.filter(t => t.type === f.type);
  if (f.category) list = list.filter(t => t.category === f.category);
  if (f.q) list = list.filter(t => t.description.toLowerCase().includes(f.q.toLowerCase()));
  const income = list.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const spent = list.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const editing = ctx.editingTx;

  return `
  <div class="page-head"><div><h1>Giao dịch</h1>
  <p class="muted">${list.length} giao dịch · thu <b class="pos">+${fmtVND(income, fmt)}</b> · chi <b class="neg">−${fmtVND(spent, fmt)}</b></p></div>
  <button class="btn primary" id="btnNewTx">+ Thêm giao dịch</button></div>

  <div class="card" style="margin-bottom:14px">
    <form id="txForm" class="${editing || ctx.showTxForm ? '' : 'hidden'}">
      <h2>${editing ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}</h2>
      <div class="form-grid">
        <div class="field"><label for="f-date">Ngày</label><input id="f-date" type="date" required value="${editing ? editing.date : '2026-11-26'}"></div>
        <div class="field"><label for="f-amount">Số tiền (VNĐ)</label><input id="f-amount" type="number" min="1000" step="1000" required value="${editing ? editing.amount : ''}" placeholder="VD: 250000"></div>
        <div class="field"><label for="f-type">Loại</label><select id="f-type">
          <option value="expense" ${editing?.type === 'expense' ? 'selected' : ''}>Chi tiêu</option>
          <option value="income" ${editing?.type === 'income' ? 'selected' : ''}>Thu nhập</option></select></div>
        <div class="field"><label for="f-cat">Hạng mục</label><select id="f-cat">${CATEGORIES.map(c => `<option value="${c.id}" ${editing?.category === c.id ? 'selected' : ''}>${esc(c.label)} (${c.type === 'income' ? 'thu' : 'chi'})</option>`).join('')}</select></div>
        <div class="field" style="grid-column:1/-1"><label for="f-desc">Mô tả</label><input id="f-desc" type="text" required maxlength="80" value="${editing ? esc(editing.description) : ''}" placeholder="VD: Đi chợ Bến Thành"></div>
      </div>
      <button class="btn primary" type="submit">${editing ? 'Lưu thay đổi' : 'Thêm giao dịch'}</button>
      <button class="btn" type="button" id="txFormCancel">Hủy</button>
    </form>
    <div class="toolbar">
      <input id="q" type="search" placeholder="Tìm mô tả…" value="${esc(f.q)}" aria-label="Tìm kiếm">
      <select id="f-month" aria-label="Lọc theo tháng"><option value="">Tất cả tháng</option>${months.map(m => `<option ${f.month === m ? 'selected' : ''} value="${m}">${monthLabel(m)}</option>`).join('')}</select>
      <select id="flt-type" aria-label="Lọc theo loại"><option value="">Thu + chi</option>
        <option value="income" ${f.type === 'income' ? 'selected' : ''}>Chỉ thu nhập</option>
        <option value="expense" ${f.type === 'expense' ? 'selected' : ''}>Chỉ chi tiêu</option></select>
      <select id="flt-cat" aria-label="Lọc theo hạng mục"><option value="">Mọi hạng mục</option>${cats.map(c => `<option value="${c.id}" ${f.category === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select>
    </div>
    ${list.length ? list.map(t => txRow(t, fmt, true)).join('') : '<p class="muted">Không có giao dịch nào khớp bộ lọc. Thử bỏ bớt điều kiện lọc.</p>'}
  </div>`;
}

export function renderBudgets(state, ctx) {
  const fmt = state.settings.currencyFormat;
  const month = ctx.month;
  const cats = byCategory(state, month);
  const rows = state.budgets.map(b => {
    const spent = cats.find(c => c.category === b.category)?.amount || 0;
    const pct = b.limit ? Math.round(spent / b.limit * 100) : 0;
    const left = b.limit - spent;
    const status = pct > 100 ? '<span class="pill red">Vượt ' + fmtVND(-left, fmt) + '</span>'
      : pct >= 85 ? '<span class="pill amber">Sắp hết</span>' : '<span class="pill green">Còn ' + fmtVND(left, fmt) + '</span>';
    const cls = pct > 100 ? 'over' : pct >= 85 ? 'warn' : '';
    return `<tr><td><i class="dot" style="background:${catColor(b.category)}"></i><b>${esc(catLabel(b.category))}</b></td>
      <td class="num">${fmtVND(spent, fmt)}</td><td class="num">${fmtVND(b.limit, fmt)}</td>
      <td style="min-width:160px"><div class="bar"><i class="${cls}" style="width:${Math.min(pct, 100)}%"></i></div><span class="muted">${pct}%</span></td>
      <td>${status}</td>
      <td><button class="btn small" data-edit-budget="${b.category}">Đổi hạn mức</button></td></tr>`;
  }).join('');
  const totalSpent = cats.reduce((a, c) => a + c.amount, 0);
  const totalLimit = state.budgets.reduce((a, b) => a + b.limit, 0);
  return `
  <div class="page-head"><div><h1>Ngân sách — ${monthLabel(month)}</h1>
  <p class="muted">Đã chi <b>${fmtVND(totalSpent, fmt)}</b> trên tổng hạn mức <b>${fmtVND(totalLimit, fmt)}</b> (${Math.round(totalSpent / totalLimit * 100)}%). Hạn mức lưu theo tháng, chỉnh sửa có hiệu lực ngay.</p></div></div>
  ${ctx.editBudget ? `<div class="card" style="margin-bottom:14px"><form id="budgetForm"><h2>Đổi hạn mức: ${esc(catLabel(ctx.editBudget))}</h2>
    <div class="field"><label for="b-limit">Hạn mức mới (VNĐ)</label><input id="b-limit" type="number" min="0" step="50000" required value="${state.budgets.find(b => b.category === ctx.editBudget)?.limit || ''}"></div>
    <button class="btn primary" type="submit">Lưu hạn mức</button> <button class="btn" type="button" id="budgetCancel">Hủy</button></form></div>` : ''}
  <div class="card"><table class="responsive"><thead><tr><th>Hạng mục</th><th class="num">Đã chi</th><th class="num">Hạn mức</th><th>Tiến độ</th><th>Trạng thái</th><th></th></tr></thead>
  <tbody>${rows}</tbody></table></div>
  <div class="notice" style="margin-top:14px">💡 Mẹo: hạng mục <b>Đi chợ &amp; siêu thị</b> thường chạm 90% hạn mức vào tuần cuối tháng — gia đình đang thử đi chợ 2 lần/tuần thay vì 3 để tiết kiệm khoảng 400.000 ₫/tháng.</div>`;
}

export function renderBills(state, ctx) {
  const fmt = state.settings.currencyFormat;
  const today = new Date(2026, 10, 26); // 26/11/2026 — "hôm nay" theo dữ liệu
  const row = b => {
    const due = new Date(2026, 10, b.dueDay);
    const diff = Math.round((due - today) / 86400000);
    const when = b.paid ? `<span class="pill green">Đã trả ${esc(b.paidDate || '')}</span>`
      : diff < 0 ? `<span class="pill red">Quá hạn ${-diff} ngày</span>`
      : diff === 0 ? `<span class="pill amber">Hạn hôm nay</span>`
      : `<span class="pill amber">Còn ${diff} ngày</span>`;
    return `<tr><td><b>${esc(b.name)}</b><div class="muted">${esc(b.note || '')}</div></td>
      <td>${esc(catLabel(b.category))}</td><td class="num money">${fmtVND(b.amount, fmt)}</td>
      <td>Ngày ${b.dueDay}/11</td><td>${when}</td>
      <td>${b.paid ? `<button class="btn small" data-unpay-bill="${b.id}">Chưa trả</button>` : `<button class="btn small primary" data-pay-bill="${b.id}">Đánh dấu đã trả</button>`}</td></tr>`;
  };
  const unpaid = state.bills.filter(b => !b.paid);
  const unpaidTotal = unpaid.reduce((a, b) => a + b.amount, 0);
  return `
  <div class="page-head"><div><h1>Hóa đơn &amp; chi định kỳ — tháng 11/2026</h1>
  <p class="muted">Còn <b>${unpaid.length} hóa đơn chưa trả</b>, tổng <b>${fmtVND(unpaidTotal, fmt)}</b>. Đánh dấu đã trả sẽ ghi nhận vào giao dịch tháng.</p></div></div>
  <div class="card"><table class="responsive"><thead><tr><th>Hóa đơn</th><th>Hạng mục</th><th class="num">Số tiền</th><th>Hạn</th><th>Trạng thái</th><th></th></tr></thead>
  <tbody>${state.bills.map(row).join('')}</tbody></table></div>
  <div class="grid g2" style="margin-top:14px">
    <div class="card"><h2>Chi định kỳ hàng tháng</h2>
      <div class="brow"><span>Tiền thuê nhà</span><b>7,5 tr ₫</b></div>
      <div class="brow"><span>Điện + nước + mạng</span><b>~1,24 tr ₫</b></div>
      <div class="brow"><span>Học phí bé An</span><b>1,8 tr ₫</b></div>
      <div class="brow"><span>Giải trí (Netflix + Spotify)</span><b>279 nghìn ₫</b></div>
      <p class="muted" style="margin-top:10px">Tổng chi cố định khoảng <b>11,6 tr ₫/tháng</b>, chiếm ~35% thu nhập — phần còn lại chia cho chợ búa, ăn uống và tiết kiệm.</p></div>
    <div class="card"><h2>Nhắc nhở</h2>
      <p>🔔 <b>27/11:</b> Netflix + Spotify tự động trừ thẻ (279.000 ₫).</p>
      <p>🔔 <b>28/11:</b> Bảo hiểm xe máy hết hạn — gia hạn online trước ngày này (66.000 ₫).</p>
      <p>🔔 <b>30/11:</b> Phí chung cư 485.000 ₫ — đóng tại ban quản lý.</p></div>
  </div>`;
}

export function renderGoals(state, ctx) {
  const fmt = state.settings.currencyFormat;
  const totalCurrent = state.goals.reduce((a, g) => a + g.current, 0);
  const totalTarget = state.goals.reduce((a, g) => a + g.target, 0);
  return `
  <div class="page-head"><div><h1>Mục tiêu tiết kiệm</h1>
  <p class="muted">Đã tiết kiệm <b>${fmtVND(totalCurrent, fmt)}</b> trên tổng mục tiêu <b>${fmtVND(totalTarget, fmt)}</b> (${Math.round(totalCurrent / totalTarget * 100)}%).</p></div>
  <button class="btn primary" id="btnNewGoal">+ Thêm mục tiêu</button></div>
  ${ctx.showGoalForm ? `<div class="card" style="margin-bottom:14px"><form id="goalForm"><h2>Mục tiêu mới</h2>
    <div class="form-grid">
      <div class="field"><label for="g-name">Tên mục tiêu</label><input id="g-name" required maxlength="60" placeholder="VD: Mua tủ lạnh mới"></div>
      <div class="field"><label for="g-target">Mục tiêu (VNĐ)</label><input id="g-target" type="number" min="100000" step="100000" required placeholder="VD: 10000000"></div>
      <div class="field" style="grid-column:1/-1"><label for="g-note">Ghi chú</label><input id="g-note" maxlength="100" placeholder="VD: Mua trước Tết"></div>
    </div>
    <button class="btn primary" type="submit">Tạo mục tiêu</button> <button class="btn" type="button" id="goalCancel">Hủy</button></form></div>` : ''}
  <div class="grid g2">
  ${state.goals.map(g => {
    const pct = Math.round(g.current / g.target * 100);
    const left = g.target - g.current;
    return `<div class="card"><h2>${esc(g.name)}</h2>
      <p class="muted">${esc(g.note || '')}</p>
      <div class="brow"><span><b>${fmtVND(g.current, fmt)}</b> / ${fmtVND(g.target, fmt)}</span><span>${pct}%</span></div>
      <div class="bar"><i style="width:${Math.min(pct, 100)}%"></i></div>
      <p class="muted">${left > 0 ? 'Còn thiếu ' + fmtVND(left, fmt) : '🎉 Đã đạt mục tiêu!'}</p>
      <form class="add-funds" data-goal="${g.id}" style="display:flex;gap:8px;flex-wrap:wrap">
        <input type="number" min="10000" step="10000" required placeholder="Số tiền góp thêm" style="flex:1;min-width:140px" aria-label="Số tiền góp thêm cho ${esc(g.name)}">
        <button class="btn primary" type="submit">Góp thêm</button>
      </form></div>`;
  }).join('')}
  </div>`;
}

export function renderReports(state, ctx) {
  const fmt = state.settings.currencyFormat;
  const months = monthsList(state).slice(0, 12).reverse();
  const rows = months.map(m => {
    const st = monthStats(state, m);
    return { label: m.slice(5) + '/' + m.slice(2, 4), income: st.income, spent: st.spent };
  });
  const totals = rows.reduce((a, r) => ({ income: a.income + r.income, spent: a.spent + r.spent }), { income: 0, spent: 0 });
  const avgSpent = rows.length ? totals.spent / rows.length : 0;
  const cats = byCategory(state, ctx.month);
  const maxCat = cats[0]?.amount || 1;
  return `
  <div class="page-head"><div><h1>Báo cáo</h1>
  <p class="muted">Tổng thu ${fmtVND(totals.income, fmt)} · tổng chi ${fmtVND(totals.spent, fmt)} · chi trung bình ${fmtVND(avgSpent, fmt)}/tháng (3 tháng gần nhất).</p></div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button class="btn" id="btnExportCSV">⬇ Tải CSV</button>
    <button class="btn" id="btnExportJSON">⬇ Tải JSON</button>
  </div></div>
  <div class="card" style="margin-bottom:14px"><h2>Thu nhập vs chi tiêu — 3 tháng gần nhất</h2>
    ${barChartSVG(rows)}
    <table><thead><tr><th>Tháng</th><th class="num">Thu nhập</th><th class="num">Chi tiêu</th><th class="num">Còn lại</th><th class="num">Tỉ lệ tiết kiệm</th></tr></thead>
    <tbody>${rows.map(r => {
      const m = '20' + r.label.slice(3) + '-' + r.label.slice(0, 2);
      const st = monthStats(state, m);
      return `<tr><td>${monthLabel(m)}</td><td class="num pos">+${fmtVND(r.income, fmt)}</td><td class="num neg">−${fmtVND(r.spent, fmt)}</td>
      <td class="num">${fmtVND(st.remaining, fmt)}</td><td class="num">${Math.round(st.rate * 100)}%</td></tr>`;
    }).join('')}</tbody></table></div>
  <div class="grid g2">
    <div class="card"><h2>Chi tiêu tháng ${ctx.month.slice(5)}/${ctx.month.slice(0, 4)} theo hạng mục</h2>
      ${cats.map(c => `<div style="margin-bottom:10px"><div class="brow"><span>${esc(catLabel(c.category))}</span><b>${fmtVND(c.amount, fmt)}</b></div>
      <div class="bar"><i style="width:${Math.round(c.amount / maxCat * 100)}%;background:${catColor(c.category)}"></i></div></div>`).join('')}
    </div>
    <div class="card"><h2>Nhận xét</h2>
      <p>📈 <b>Tháng 11</b> là tháng tiết kiệm tốt nhất: tỉ lệ tiết kiệm ${Math.round(monthStats(state, '2026-11').rate * 100)}%, nhờ thu nhập làm thêm 1,8 tr ₫ và chưa phát sinh chi mua sắm lớn.</p>
      <p>🛒 <b>Đi chợ &amp; siêu thị</b> luôn là khoản chi biến động lớn nhất (${fmtVND(cats.find(c => c.category === 'groceries')?.amount || 0, fmt)} trong tháng 11).</p>
      <p>🏠 Chi cố định (nhà ở + điện nước + học phí) chiếm khoảng ${Math.round((7500000 + 1244000 + 1800000) / monthStats(state, '2026-11').spent * 100)}% tổng chi tháng 11 — phần này khó cắt giảm, nên gia đình tập trung vào ăn ngoài và mua sắm.</p>
      <p>💰 Nếu giữ nhịp hiện tại, <b>quỹ dự phòng 6 tháng</b> sẽ đủ vào khoảng tháng 4/2027.</p></div>
  </div>`;
}

export function renderSettings(state, ctx) {
  return `
  <div class="page-head"><div><h1>Cài đặt</h1><p class="muted">Dữ liệu chỉ lưu trên trình duyệt này — xuất sao lưu trước khi đổi máy.</p></div></div>
  <div class="grid g2">
    <div class="card"><h2>Hiển thị tiền tệ</h2>
      <form id="settingsForm">
        <div class="field"><label for="s-fmt">Định dạng số tiền</label><select id="s-fmt">
          <option value="short" ${state.settings.currencyFormat === 'short' ? 'selected' : ''}>Rút gọn — 1,2 tr ₫</option>
          <option value="full" ${state.settings.currencyFormat === 'full' ? 'selected' : ''}>Đầy đủ — 1.200.000 ₫</option></select></div>
        <button class="btn primary" type="submit">Lưu cài đặt</button>
      </form></div>
    <div class="card"><h2>Sao lưu &amp; khôi phục</h2>
      <p class="muted">Tải toàn bộ dữ liệu (giao dịch, ngân sách, hóa đơn, mục tiêu) ra file JSON để sao lưu, rồi nhập lại khi cần.</p>
      <p><button class="btn" id="btnBackup">⬇ Tải bản sao lưu JSON</button></p>
      <div class="field"><label for="importFile">Nhập bản sao lưu (.json)</label>
      <input id="importFile" type="file" accept=".json,application/json"></div>
      <p class="muted" id="importMsg"></p></div>
    <div class="card"><h2>Đặt lại dữ liệu mẫu</h2>
      <p class="muted">Xóa mọi thay đổi và khôi phục dữ liệu mẫu ban đầu của gia đình Minh &amp; Lan (71 giao dịch tháng 9–11/2026, ngân sách, hóa đơn, mục tiêu).</p>
      <button class="btn danger" id="btnReset">Đặt lại về dữ liệu mẫu</button></div>
    <div class="card"><h2>Về trang này</h2>
      <p class="muted">Ngân sách Gia đình — ứng dụng web tĩnh, chạy hoàn toàn offline, không cần tài khoản, không gửi dữ liệu đi đâu. Mọi số liệu trên trang là dữ liệu mẫu minh họa cho một hộ gia đình 4 người tại TP. Hồ Chí Minh.</p></div>
  </div>`;
}
