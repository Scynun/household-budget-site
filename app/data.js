// Seed data for a Vietnamese household — "Gia đình Minh & Lan", Ho Chi Minh City.
// All amounts in VND. Months: Sep–Nov 2026. Currency is VND throughout.

export const CATEGORIES = [
  { id: 'salary',    label: 'Lương',        color: '#16a34a', type: 'income' },
  { id: 'bonus',     label: 'Thưởng / thêm', color: '#65a30d', type: 'income' },
  { id: 'groceries', label: 'Đi chợ & siêu thị', color: '#2563eb', type: 'expense' },
  { id: 'rent',      label: 'Nhà ở',        color: '#7c3aed', type: 'expense' },
  { id: 'utilities', label: 'Điện nước & mạng', color: '#0891b2', type: 'expense' },
  { id: 'transport', label: 'Di chuyển',    color: '#ea580c', type: 'expense' },
  { id: 'dining',    label: 'Ăn ngoài',     color: '#db2777', type: 'expense' },
  { id: 'shopping',  label: 'Mua sắm',      color: '#9333ea', type: 'expense' },
  { id: 'health',    label: 'Sức khỏe',     color: '#dc2626', type: 'expense' },
  { id: 'education', label: 'Học hành',     color: '#ca8a04', type: 'expense' },
  { id: 'entertain', label: 'Giải trí',     color: '#059669', type: 'expense' },
  { id: 'other',     label: 'Khác',         color: '#64748b', type: 'expense' },
];

export const catLabel = id => (CATEGORIES.find(c => c.id === id) || {}).label || id;
export const catColor = id => (CATEGORIES.find(c => c.id === id) || {}).color || '#64748b';

// [date, description, category, amount, type]
const T = [
  // ---- September 2026 ----
  ['2026-09-01', 'Lương tháng 8 — anh Minh (kỹ sư phần mềm)', 'salary', 18500000, 'income'],
  ['2026-09-01', 'Lương tháng 8 — chị Lan (kế toán)', 'salary', 13200000, 'income'],
  ['2026-09-01', 'Tiền thuê nhà tháng 9', 'rent', 7500000, 'expense'],
  ['2026-09-02', 'Đi chợ Bến Thành', 'groceries', 486000, 'expense'],
  ['2026-09-03', 'Tiền điện tháng 8', 'utilities', 742000, 'expense'],
  ['2026-09-03', 'Tiền nước tháng 8', 'utilities', 186000, 'expense'],
  ['2026-09-04', 'Xăng xe máy (2 xe)', 'transport', 220000, 'expense'],
  ['2026-09-05', 'Siêu thị Co.opmart — tuần 1', 'groceries', 1245000, 'expense'],
  ['2026-09-06', 'Ăn tối gia đình — quán cơm gà', 'dining', 385000, 'expense'],
  ['2026-09-07', 'Học phí tiếng Anh bé An (tháng 9)', 'education', 1800000, 'expense'],
  ['2026-09-09', 'Internet + truyền hình cáp', 'utilities', 329000, 'expense'],
  ['2026-09-10', 'Grab đi làm (tuần)', 'transport', 312000, 'expense'],
  ['2026-09-11', 'Đi chợ đầu mối Bình Điền', 'groceries', 658000, 'expense'],
  ['2026-09-13', 'Khám răng định kỳ — bé An', 'health', 450000, 'expense'],
  ['2026-09-14', 'Siêu thị — tuần 2', 'groceries', 1132000, 'expense'],
  ['2026-09-15', 'Lương làm thêm cuối tuần — anh Minh', 'bonus', 2500000, 'income'],
  ['2026-09-16', 'Mua giày thể thao cho bé An', 'shopping', 890000, 'expense'],
  ['2026-09-18', 'Cà phê sáng với đồng nghiệp', 'dining', 145000, 'expense'],
  ['2026-09-20', 'Siêu thị — tuần 3', 'groceries', 1087000, 'expense'],
  ['2026-09-21', 'Bảo hiểm y tế gia đình (quý 3)', 'health', 1260000, 'expense'],
  ['2026-09-23', 'Xem phim cuối tuần (4 vé + bắp)', 'entertain', 520000, 'expense'],
  ['2026-09-25', 'Đi chợ — tuần 4', 'groceries', 594000, 'expense'],
  ['2026-09-27', 'Sách giáo khoa + dụng cụ học tập', 'education', 736000, 'expense'],
  ['2026-09-28', 'Ăn tối sinh nhật chị Lan', 'dining', 1250000, 'expense'],
  ['2026-09-30', 'Thuốc cảm + vitamin', 'health', 238000, 'expense'],
  // ---- October 2026 ----
  ['2026-10-01', 'Lương tháng 9 — anh Minh', 'salary', 18500000, 'income'],
  ['2026-10-01', 'Lương tháng 9 — chị Lan', 'salary', 13200000, 'income'],
  ['2026-10-01', 'Tiền thuê nhà tháng 10', 'rent', 7500000, 'expense'],
  ['2026-10-02', 'Đi chợ Bến Thành', 'groceries', 512000, 'expense'],
  ['2026-10-03', 'Tiền điện tháng 9', 'utilities', 698000, 'expense'],
  ['2026-10-03', 'Tiền nước tháng 9', 'utilities', 174000, 'expense'],
  ['2026-10-05', 'Siêu thị Co.opmart — tuần 1', 'groceries', 1318000, 'expense'],
  ['2026-10-06', 'Xăng xe máy', 'transport', 210000, 'expense'],
  ['2026-10-08', 'Học phí tiếng Anh bé An (tháng 10)', 'education', 1800000, 'expense'],
  ['2026-10-09', 'Internet + truyền hình cáp', 'utilities', 329000, 'expense'],
  ['2026-10-10', 'Ăn trưa cuối tuần — phở gia đình', 'dining', 296000, 'expense'],
  ['2026-10-12', 'Đi chợ đầu mối Bình Điền', 'groceries', 702000, 'expense'],
  ['2026-10-14', 'Mua áo khoác mùa mưa', 'shopping', 1150000, 'expense'],
  ['2026-10-15', 'Thưởng quý 3 — chị Lan', 'bonus', 3200000, 'income'],
  ['2026-10-16', 'Siêu thị — tuần 2', 'groceries', 1196000, 'expense'],
  ['2026-10-18', 'Khám sức khỏe định kỳ — anh Minh', 'health', 890000, 'expense'],
  ['2026-10-20', 'Grab đi làm (tuần)', 'transport', 298000, 'expense'],
  ['2026-10-22', 'Đi chợ — tuần 3', 'groceries', 641000, 'expense'],
  ['2026-10-24', 'Siêu thị — tuần 4', 'groceries', 1074000, 'expense'],
  ['2026-10-25', 'Tiệc 20/10 — hoa + quà cho chị Lan', 'shopping', 650000, 'expense'],
  ['2026-10-26', 'Netflix + Spotify (tháng 10)', 'entertain', 279000, 'expense'],
  ['2026-10-28', 'Ăn tối với bạn bè', 'dining', 742000, 'expense'],
  ['2026-10-30', 'Sửa xe máy — thay nhớt + phanh', 'transport', 480000, 'expense'],
  // ---- November 2026 (to Nov 26) ----
  ['2026-11-01', 'Lương tháng 10 — anh Minh', 'salary', 18500000, 'income'],
  ['2026-11-01', 'Lương tháng 10 — chị Lan', 'salary', 13200000, 'income'],
  ['2026-11-01', 'Tiền thuê nhà tháng 11', 'rent', 7500000, 'expense'],
  ['2026-11-02', 'Đi chợ Bến Thành', 'groceries', 468000, 'expense'],
  ['2026-11-03', 'Tiền điện tháng 10', 'utilities', 723000, 'expense'],
  ['2026-11-03', 'Tiền nước tháng 10', 'utilities', 192000, 'expense'],
  ['2026-11-05', 'Siêu thị Co.opmart — tuần 1', 'groceries', 1289000, 'expense'],
  ['2026-11-06', 'Xăng xe máy', 'transport', 230000, 'expense'],
  ['2026-11-07', 'Học phí tiếng Anh bé An (tháng 11)', 'education', 1800000, 'expense'],
  ['2026-11-08', 'Ăn sáng cuối tuần — bánh mì + cà phê', 'dining', 168000, 'expense'],
  ['2026-11-09', 'Internet + truyền hình cáp', 'utilities', 329000, 'expense'],
  ['2026-11-10', 'Grab đi làm (tuần)', 'transport', 305000, 'expense'],
  ['2026-11-12', 'Đi chợ đầu mối Bình Điền', 'groceries', 684000, 'expense'],
  ['2026-11-14', 'Siêu thị — tuần 2', 'groceries', 1156000, 'expense'],
  ['2026-11-15', 'Thu nhập làm thêm — dạy kèm cuối tuần', 'bonus', 1800000, 'income'],
  ['2026-11-16', 'Mua nồi cơm điện mới', 'shopping', 1490000, 'expense'],
  ['2026-11-18', 'Khám mắt — bé An', 'health', 320000, 'expense'],
  ['2026-11-20', 'Đi chợ — tuần 3', 'groceries', 597000, 'expense'],
  ['2026-11-21', 'Ăn tối gia đình — lẩu', 'dining', 856000, 'expense'],
  ['2026-11-23', 'Siêu thị — tuần 4', 'groceries', 1098000, 'expense'],
  ['2026-11-24', 'Sách + truyện cho bé An', 'education', 412000, 'expense'],
  ['2026-11-25', 'Cà phê + bánh ngọt cuối tuần', 'dining', 214000, 'expense'],
  ['2026-11-26', 'Đi chợ — cuối tháng', 'groceries', 523000, 'expense'],
];

export function seedTransactions() {
  return T.map(([date, description, category, amount, type], i) => ({
    id: 'tx-' + (i + 1), date, description, category, amount, type,
  }));
}

export function seedBudgets() {
  return [
    { category: 'groceries', limit: 5200000 },
    { category: 'rent', limit: 7500000 },
    { category: 'utilities', limit: 1450000 },
    { category: 'transport', limit: 1200000 },
    { category: 'dining', limit: 2000000 },
    { category: 'shopping', limit: 2000000 },
    { category: 'health', limit: 1500000 },
    { category: 'education', limit: 2500000 },
    { category: 'entertain', limit: 800000 },
    { category: 'other', limit: 500000 },
  ];
}

export function seedBills() {
  return [
    { id: 'bill-1', name: 'Tiền thuê nhà', amount: 7500000, dueDay: 1, category: 'rent', paid: true, paidDate: '2026-11-01', note: 'Chuyển khoản cho chủ nhà' },
    { id: 'bill-2', name: 'Tiền điện', amount: 723000, dueDay: 5, category: 'utilities', paid: true, paidDate: '2026-11-03', note: 'EVN — thanh toán qua app ngân hàng' },
    { id: 'bill-3', name: 'Tiền nước', amount: 192000, dueDay: 5, category: 'utilities', paid: true, paidDate: '2026-11-03', note: 'SAWACO' },
    { id: 'bill-4', name: 'Internet + truyền hình cáp', amount: 329000, dueDay: 10, category: 'utilities', paid: true, paidDate: '2026-11-09', note: 'Viettel' },
    { id: 'bill-5', name: 'Học phí tiếng Anh — bé An', amount: 1800000, dueDay: 8, category: 'education', paid: true, paidDate: '2026-11-07', note: 'Trung tâm Anh ngữ' },
    { id: 'bill-6', name: 'Bảo hiểm xe máy (năm)', amount: 66000, dueDay: 28, category: 'transport', paid: false, paidDate: null, note: 'Hết hạn 28/11 — gia hạn online' },
    { id: 'bill-7', name: 'Netflix + Spotify', amount: 279000, dueDay: 27, category: 'entertain', paid: false, paidDate: null, note: 'Tự động trừ thẻ ngày 27/11' },
    { id: 'bill-8', name: 'Phí chung cư (quản lý + giữ xe)', amount: 485000, dueDay: 30, category: 'rent', paid: false, paidDate: null, note: 'Đóng tại ban quản lý' },
  ];
}

export function seedGoals() {
  return [
    { id: 'goal-1', name: 'Quỹ dự phòng 6 tháng', target: 120000000, current: 68400000, note: 'Đủ sống 6 tháng nếu mất thu nhập' },
    { id: 'goal-2', name: 'Du lịch Đà Lạt Tết 2027', target: 15000000, current: 9200000, note: 'Cả nhà 4 ngày 3 đêm' },
    { id: 'goal-3', name: 'Đổi xe máy mới', target: 45000000, current: 18300000, note: 'Honda Wave / Vision' },
    { id: 'goal-4', name: 'Học phí năm học bé An', target: 24000000, current: 21600000, note: 'Đóng theo học kỳ' },
  ];
}

export function seedState() {
  return {
    transactions: seedTransactions(),
    budgets: seedBudgets(),
    bills: seedBills(),
    goals: seedGoals(),
    settings: { currencyFormat: 'short' }, // 'short' = 1,2 tr ₫ ; 'full' = 1.200.000 ₫
  };
}
