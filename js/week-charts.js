/* Shared, keyed timetable and supporting views. D3 owns chart coordinates only. */
const palette = { OS: '#0072B2', CI: '#E69F00', VIS: '#009E73', NET: '#CC79A7', CV: '#D55E00' };
const shortZh = { OS: '操作系统', CI: '计算智能', VIS: '可视化导论', NET: '网络原理', CV: '计算机视觉' };
const shortEn = { OS: 'Systems', CI: 'Intelligence', VIS: 'Visualize', NET: 'Networks', CV: 'Vision' };
const periodCount = d => +d.period_end - +d.period_start + 1;
const isEnglish = options => options.lang === 'en';
const dateLabel = (d, en) => `${en ? d.weekday_en : `周${d.weekday_zh}`} ${Number(d.date.slice(5, 7))}.${Number(d.date.slice(8))}`;
const periodLabel = (d, en) => en ? `Periods ${d.period_start}–${d.period_end}` : `第 ${d.period_start}–${d.period_end} 节`;
function keyboardActivate(event, action) {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); action(); }
}
function dayRows(data) {
  return data.days.map(day => typeof day === 'string'
    ? { date: day, weekday_en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(`${day}T12:00:00Z`).getUTCDay()], weekday_zh: ['日', '一', '二', '三', '四', '五', '六'][new Date(`${day}T12:00:00Z`).getUTCDay()] }
    : day);
}

export function renderSchedule(host, data, options = {}) {
  const en = isEnglish(options), list = options.mode === 'list';
  const context = Boolean(options.context) && !list;
  const days = dayRows(data), schedule = data.schedule;
  const svg = d3.select(host).selectAll('svg.week-schedule-svg').data([null]).join('svg')
    .attr('class', `week-schedule-svg${context ? ' context-schedule' : ''}`).attr('viewBox', `0 0 ${context ? 360 : 760} 520`).attr('role', 'img')
    .attr('aria-label', en ? 'Weekly timetable. Select a day or course. Horizontal position: weekday; vertical position: period.' : '一周课表。可选择日期或课程。横向为星期，纵向为节次。');
  svg.selectAll('title.chart-title').data([null]).join('title').attr('class', 'chart-title')
    .text(en ? 'The same class sessions, arranged by list or time' : '同一组课程：列表与时间网格');
  // #region snippet:time-grid
  const x = d3.scaleBand().domain(days.map(d => d.date)).range(context ? [30, 352] : [54, 750]).paddingInner(0.06);
  const y = d3.scaleBand().domain(d3.range(1, 12)).range([72, 498]).paddingInner(0.03);
  const sessions = svg.selectAll('g.session').data(schedule, d => d.session_id).join(enter => {
    const g = enter.append('g').attr('class', 'session');
    g.append('rect').attr('class', 'session-block').attr('rx', 5);
    g.append('text').attr('class', 'session-code');
    g.append('text').attr('class', 'session-name');
    g.append('text').attr('class', 'session-period');
    g.append('text').attr('class', 'session-list-date');
    g.append('title');
    return g;
  });
  const position = (d, i) => list ? [54, 58 + i * 39] : [x(d.date), y(+d.period_start)];
  const blockWidth = list ? 696 : x.bandwidth();
  const blockHeight = d => list ? 34 : periodCount(d) * y.step() - (y.step() - y.bandwidth());
  // #endregion
  let scaffold = svg.selectAll('g.schedule-scaffold').data([null]).join('g').attr('class', 'schedule-scaffold');
  scaffold.lower();
  scaffold.selectAll('rect.day-column').data(days, d => d.date).join('rect').attr('class', 'day-column')
    .attr('x', d => x(d.date)).attr('y', 70).attr('width', x.bandwidth()).attr('height', 430)
    .attr('fill', (_, i) => i === 0 || i === 6 ? '#eceee9' : '#f5f6f1').attr('opacity', list ? 0 : 1);
  scaffold.selectAll('line.period-line').data(d3.range(1, 12)).join('line').attr('class', 'period-line')
    .attr('x1', context ? 27 : 50).attr('x2', context ? 352 : 750).attr('y1', d => y(d)).attr('y2', d => y(d))
    .attr('stroke', '#547367').attr('stroke-dasharray', '3 4').attr('opacity', !list && options.showVizGrid ? 0.4 : 0);
  scaffold.selectAll('text.period-label').data(d3.range(1, 12)).join('text').attr('class', 'period-label')
    .attr('x', context ? 20 : 37).attr('y', d => y(d) + 23).attr('text-anchor', 'end').attr('opacity', list ? 0 : 1).text(d => d);
  scaffold.selectAll('text.axis-title').data([null]).join('text').attr('class', 'axis-title')
    .attr('x', context ? 6 : 9).attr('y', 51).attr('opacity', list ? 0 : 1).text(context ? (en ? 'P' : '节') : (en ? 'Period' : '节次'));
  const headers = scaffold.selectAll('g.day-header').data(days, d => d.date).join(enter => {
    const g = enter.append('g').attr('class', 'day-header'); g.append('rect').attr('rx', 5); g.append('text'); return g;
  }).attr('transform', d => `translate(${x(d.date)},16)`).attr('role', 'button')
    .attr('tabindex', list ? -1 : 0).attr('aria-hidden', list ? 'true' : null).attr('opacity', list ? 0 : 1)
    .attr('aria-label', d => `${en ? 'Focus on' : '聚焦'} ${dateLabel(d, en)}`)
    .attr('aria-pressed', d => String(options.focusMode === 'day' && d.date === options.selectedDate))
    .on('click', (_, d) => options.onDate?.(d.date)).on('keydown', (event, d) => keyboardActivate(event, () => options.onDate?.(d.date)));
  headers.select('rect').attr('width', x.bandwidth()).attr('height', 44)
    .attr('fill', d => options.focusMode === 'day' && d.date === options.selectedDate ? '#d6e875' : 'transparent');
  headers.select('text').attr('x', x.bandwidth() / 2).attr('y', 28).attr('text-anchor', 'middle')
    .text(d => context ? (en ? d.weekday_en : `周${d.weekday_zh}`) : dateLabel(d, en));
  // #region snippet:focus-state
  const hasFocus = options.focusMode === 'course' ? Boolean(options.selectedCourse)
    : options.focusMode === 'day' ? Boolean(options.selectedDate) : false;
  const matches = d => options.focusMode === 'course' ? d.course_id === options.selectedCourse : d.date === options.selectedDate;
  sessions.classed('is-focus', d => hasFocus && matches(d))
    .classed('is-context', d => hasFocus && !matches(d))
    .attr('opacity', d => hasFocus && !matches(d) ? 0.22 : 1);
  // Every session remains in the same keyed group and in the same time position.
  // #endregion
  sessions.attr('role', 'button').attr('tabindex', 0).attr('data-session-id', d => d.session_id).attr('data-course', d => d.course_id)
    .attr('aria-pressed', d => String(hasFocus && matches(d)))
    .attr('aria-label', d => `${en ? d.course_en : d.course_zh}, ${dateLabel(d, en)}, ${periodLabel(d, en)}. ${en ? 'Highlight this course' : '高亮这门课程'}`)
    .on('click', (_, d) => options.onCourse?.(d.course_id))
    .on('keydown', (event, d) => keyboardActivate(event, () => options.onCourse?.(d.course_id)));
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  sessions.interrupt('layout');
  const motion = reduce ? sessions : sessions.transition('layout').duration(380);
  motion.attr('transform', (d, i) => `translate(${position(d, i).join(',')})`);
  sessions.select('rect.session-block').interrupt('layout').attr('fill', d => palette[d.course_id] || '#0072B2');
  const rectangles = reduce ? sessions.select('rect.session-block') : sessions.select('rect.session-block').transition('layout').duration(380);
  rectangles.attr('width', blockWidth).attr('height', blockHeight);
  sessions.select('.session-code').attr('x', context ? 3 : 9).attr('y', 23).text(d => d.course_id);
  sessions.select('.session-name').attr('x', list ? 78 : 9).attr('y', list ? 23 : 43)
    .attr('display', !list && (context || options.detail === 'compact' || options.detail === 'medium') ? 'none' : null)
    .text(d => list ? (en ? d.course_en : d.course_zh) : (en ? shortEn[d.course_id] : shortZh[d.course_id]));
  sessions.select('.session-period').attr('x', list ? 560 : context ? 3 : 9)
    .attr('y', list ? 23 : context || options.detail === 'compact' || options.detail === 'medium' ? 45 : 63)
    .text(d => list ? periodLabel(d, en) : context ? `${d.period_start}–${d.period_end}` : en ? `P ${d.period_start}–${d.period_end}` : `${d.period_start}–${d.period_end} 节`);
  sessions.select('.session-list-date').attr('x', 440).attr('y', 23).attr('display', list ? null : 'none').text(d => dateLabel(d, en));
  sessions.select('title').text(d => `${en ? d.course_en : d.course_zh}\n${dateLabel(d, en)} · ${periodLabel(d, en)}\n${d.location}`);
  return svg.node();
}

function renderBarRows(host, rows, options, kind) {
  const en = isEnglish(options), course = kind === 'course';
  const max = d3.max(rows, d => d.periods) || 1;
  const width = d3.scaleLinear().domain([0, max]).range([0, 100]);
  const list = d3.select(host).selectAll(`div.week-bars-${kind}`).data([null]).join('div')
    .attr('class', `week-bars week-bars-${kind}`).attr('role', 'group')
    .attr('aria-label', en ? (course ? 'Periods by course' : 'Periods by day') : (course ? '课程总节数' : '每日课量'));
  const bars = list.selectAll('button.week-bar').data(rows, d => course ? d.id : d.date).join(enter => {
    const button = enter.append('button').attr('type', 'button').attr('class', 'week-bar');
    button.append('span').attr('class', 'week-bar-label');
    button.append('span').attr('class', 'week-bar-track').attr('aria-hidden', 'true').append('span').attr('class', 'week-bar-fill');
    button.append('span').attr('class', 'week-bar-value'); return button;
  }).order();
  const chosen = d => course ? options.focusMode === 'course' && options.selectedCourse === d.id : options.focusMode === 'day' && options.selectedDate === d.date;
  const label = d => course ? `${d.id} · ${en ? d.en : d.zh}` : dateLabel(d, en);
  bars.attr('aria-pressed', d => String(chosen(d))).classed('is-selected', chosen)
    .attr('aria-label', d => `${label(d)}, ${d.periods} ${en ? 'periods' : '节'}, ${d.sessions} ${en ? 'sessions' : '次课'}`)
    .on('click', (_, d) => course ? options.onCourse?.(d.id) : options.onDate?.(d.date));
  bars.select('.week-bar-label').text(label);
  bars.select('.week-bar-fill').style('width', d => `${width(d.periods)}%`).style('background-color', d => course ? (d.color || palette[d.id]) : '#365c4b');
  bars.select('.week-bar-value').text(d => `${d.periods} ${en ? 'p' : '节'}`);
  return list.node();
}

export function renderDailyLoad(host, data, options = {}) {
  const rows = data.daily || dayRows(data).map(day => {
    const sessions = data.schedule.filter(d => d.date === day.date);
    return { ...day, sessions: sessions.length, periods: d3.sum(sessions, periodCount) };
  });
  return renderBarRows(host, rows, options, 'day');
}

export function renderCourseSummary(host, data, options = {}) {
  const rows = data.courseTotals || d3.rollups(data.schedule, sessions => ({
    zh: sessions[0].course_zh, en: sessions[0].course_en,
    periods: d3.sum(sessions, periodCount), sessions: sessions.length
  }), d => d.course_id).map(([id, value]) => ({ id, ...value })).sort((a, b) => b.periods - a.periods);
  return renderBarRows(host, rows, options, 'course');
}
