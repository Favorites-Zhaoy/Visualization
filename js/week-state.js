export const state = { lang: 'zh' };
const listeners = new Set();
export const text = (zh, en) => state.lang === 'zh' ? zh : en;
export const translated = value => typeof value === 'string' ? value : value[state.lang];
export function watchLanguage(fn) { listeners.add(fn); fn(); return () => listeners.delete(fn); }
export function label(node, zh, en) { return watchLanguage(() => { node.textContent = text(zh, en); }); }
export function setLanguage(lang) {
  const sections = [...document.querySelectorAll('.hero,.chapter-map,.lesson-section,.final-week')];
  const current = sections.find(n => {const r=n.getBoundingClientRect();return r.top<=130 && r.bottom>130;});
  const offset = current?.getBoundingClientRect().top;
  state.lang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = text('MY WEEK · 网页页面布局', 'MY WEEK · Web Page Layout');
  listeners.forEach(fn => fn());
  if(current) window.scrollBy({top:current.getBoundingClientRect().top-offset,behavior:'instant'});
}
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export function element(tag, className, parent) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (parent) parent.append(node);
  return node;
}
export function button(parent, zh, en, handler, className = '') {
  const b = element('button', className, parent); b.type = 'button'; label(b, zh, en);
  b.addEventListener('click', handler); return b;
}
