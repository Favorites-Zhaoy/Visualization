import { WeekView } from './week-views.js?v=week2';
import { text, watchLanguage, reduced } from './week-state.js?v=week2';

const stages = [
  ['raw', 'RAW TIMETABLE', '星期 × 节次：它擅长回答“这一节上什么课”。', 'Weekday × period: a direct answer to “What class is in this period?”'],
  ['structure', 'STRUCTURE', '同一份课表，组成标题、当天详情、周视图和课量统计。', 'The same timetable becomes a header, day detail, week view, and load summaries.'],
  ['position', 'POSITION', '图内用位置编码时间，图外用网格组织阅读。', 'Inside the chart, position encodes time. Outside it, a grid organizes reading.'],
  ['hierarchy', 'HIERARCHY', '现在问“周四上什么”：当天详情成为主角。', 'Now ask “What is on Thursday?” Day detail becomes the lead.'],
  ['focus', 'FOCUS', '聚焦可视化导论，周三、周四、周五的三次课一起突出。', 'Focus on Visualization: its Wednesday, Thursday, and Friday sessions stand out together.'],
  ['reflow', 'REFLOW', '来到 390px：先读选中日，再展开整周。', 'At 390px, read the selected day first, then explore the full week.']
];

export function initOpening(data) {
  const host = document.querySelector('#opening-preview');
  if (!host) return () => {};
  const book = document.querySelector('.book');
  const play = document.querySelector('#opening-play');
  const skip = document.querySelector('#opening-skip');
  const word = document.querySelector('#opening-word');
  const caption = document.querySelector('#opening-caption');
  const frame = document.createElement('div');
  frame.className = 'opening-mini-frame';
  frame.inert = true;
  frame.setAttribute('aria-hidden', 'true');
  host.append(frame);
  const view = new WeekView(frame, data, { product: true });
  let index = -1, running = false, played = false, token = 0, disposed = false;
  const timers = new Set();
  host.dataset.stage = 'rest';
  host.setAttribute('role', 'img');

  function fit() {
    if (disposed) return;
    const mobile = index === 5;
    const width = mobile ? 390 : 1140;
    frame.style.width = `${width}px`;
    const availableWidth = Math.max(1, host.clientWidth - 24);
    const availableHeight = Math.max(1, host.clientHeight - 24);
    // The desktop miniature fits its entire page. Mobile keeps legible detail
    // and crops to a genuine phone viewport, rather than shrinking a long page.
    const nativeHeight = mobile ? 710 : Math.max(400, view.page.scrollHeight + 32);
    const scale = Math.min(availableWidth / width, availableHeight / nativeHeight, 1);
    frame.style.height = mobile ? '710px' : 'auto';
    frame.style.transform = `scale(${scale})`;
    frame.style.left = `${(host.clientWidth - width * scale) / 2}px`;
    frame.style.top = `${Math.max(12, (host.clientHeight - nativeHeight * scale) / 2)}px`;
  }
  function translate() {
    if (word) word.textContent = index < 0 ? 'FROM TIMETABLE TO INFORMATION PAGE' : stages[index][1];
    if (caption) caption.textContent = index < 0
      ? text('翻开这一章，看同一份课表如何回应不同的问题。', 'Open this chapter. See one timetable answer different questions.')
      : text(stages[index][2], stages[index][3]);
    if (play) play.textContent = running ? text('从头播放 ↺', 'Restart ↺') : played ? text('重播开场 ↺', 'Replay opening ↺') : text('翻开这一章 →', 'Open this chapter →');
    if (skip) skip.textContent = text('开始探索 ↓', 'Explore the lessons ↓');
    host.setAttribute('aria-label', index < 0 ? text('课表布局开场预览', 'Timetable layout opening preview') : `${stages[index][1]}: ${text(stages[index][2], stages[index][3])}`);
    requestAnimationFrame(fit);
  }
  function cancel() {
    token++;
    timers.forEach(clearTimeout);
    timers.clear();
    frame.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
    running = false;
  }
  function schedule(fn, delay) {
    const current = token;
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!disposed && current === token) fn();
    }, delay);
    timers.add(timer);
  }
  function show(next, animate = true) {
    index = next;
    host.dataset.stage = stages[next][0];
    frame.style.width = next === 5 ? '390px' : '1140px';
    book?.classList.add('is-open');
    view.update({
      questionMode: next === 4 ? 'course' : next >= 3 ? 'day' : 'week',
      selectedDate: data.meta.default_focus_date,
      selectedCourse: next === 4 ? 'VIS' : null,
      showPageGrid: next === 2,
      showVizGrid: next === 0 || next === 2
    }, animate && !reduced());
    translate();
    schedule(fit, 90);
  }
  function start() {
    cancel();
    played = true;
    book?.classList.remove('is-open');
    host.dataset.stage = 'rest';
    index = -1;
    frame.scrollTop = 0;
    if (reduced()) { show(5, false); return; }
    running = true;
    translate();
    // Let the closed cover commit before replaying its transform.
    schedule(() => {
      book?.classList.add('is-open');
      show(0);
      for (let n = 1; n < stages.length; n++) schedule(() => show(n), n * 1250);
      schedule(() => { running = false; translate(); }, 7500);
    }, 180);
  }
  function finish() {
    cancel();
    played = true;
    show(5, false);
    document.querySelector('#chapter-map')?.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'start' });
  }
  const observer = new ResizeObserver(fit);
  observer.observe(host);
  observer.observe(view.page);
  play?.addEventListener('click', start);
  skip?.addEventListener('click', finish);
  const stopLanguage = watchLanguage(translate);
  function dispose() {
    disposed = true;
    cancel();
    observer.disconnect();
    view.observer?.disconnect();
    view.stopLanguage?.();
    stopLanguage();
    play?.removeEventListener('click', start);
    skip?.removeEventListener('click', finish);
  }
  window.addEventListener('pagehide', event => { if (!event.persisted) dispose(); }, { once: true });
  return dispose;
}
