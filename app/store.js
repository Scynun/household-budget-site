// State store: localStorage persistence + formatting + aggregates.
import { seedState, CATEGORIES, catLabel, catColor } from './data.js';

const KEY = 'hhbudget.v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && Array.isArray(s.transactions) && Array.isArray(s.budgets)) return s;
    }
  } catch (e) { /* corrupted storage -> reseed below */ }
  const s = seedState();
  saveState(s);
  return s;
}

export function saveState(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage full/blocked */ }
}

export function resetState() {
  const s = seedState();
  saveState(s);
  return s;
}

export function fmtVND(n, format = 'short') {
  const v = Math.round(n);
  if (format === 'full') return v.toLocaleString('vi-VN') + ' ₫';
  const abs = Math.abs(v);
  if (abs >= 1e9) return (v / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỉ ₫';
  if (abs >= 1e6) return (v / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tr ₫';
  if (abs >= 1e3) return (v / 1e3).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' nghìn ₫';
  return v.toLocaleString('vi-VN') + ' ₫';
}

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const monthOf = d => d.slice(0, 7); // '2026-11'
export const monthLabel = m => {
  const [y, mo] = m.split('-').map(Number);
  return 'Tháng ' + mo + '/' + y;
};
export function latestMonth(state) {
  return state.transactions.reduce((a, t) => (t.date.slice(0, 7) > a ? t.date.slice(0, 7) : a), '2026-11');
}
export function monthStats(state, month) {
  const txs = state.transactions.filter(t => monthOf(t.date) === month);
  const income = txs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const spent = txs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  return { txs, income, spent, remaining: income - spent, rate: income > 0 ? (income - spent) / income : 0 };
}
export function byCategory(state, month) {
  const out = {};
  state.transactions.filter(t => t.type === 'expense' && monthOf(t.date) === month)
    .forEach(t => { out[t.category] = (out[t.category] || 0) + t.amount; });
  return Object.entries(out).map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}
export function monthsList(state) {
  const set = new Set(state.transactions.map(t => monthOf(t.date)));
  return [...set].sort().reverse();
}
export { CATEGORIES, catLabel, catColor };
