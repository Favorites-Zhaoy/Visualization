const COURSE_IDS = ['OS', 'CI', 'VIS', 'NET', 'CV'];
const COLORS = ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#D55E00'];
const WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Course colours encode categories; they are independent of the UI accent.
export const courseColor = d3.scaleOrdinal().domain(COURSE_IDS).range(COLORS);

export function periodsOf(session) {
  return session.period_end - session.period_start + 1;
}

export function summarizeSchedule(schedule, days) {
  // #region snippet:day-rollup
  const byDay = d3.rollup(
    schedule,
    rows => ({ periods: d3.sum(rows, periodsOf), sessions: rows.length }),
    d => d.date
  );
  // Start from the calendar so days without classes remain visible.
  const daily = days.map(day => ({
    ...day,
    periods: byDay.get(day.date)?.periods ?? 0,
    sessions: byDay.get(day.date)?.sessions ?? 0
  }));
  // #endregion

  // #region snippet:course-rollup
  const courseTotals = d3.rollups(
    schedule,
    rows => ({
      zh: rows[0].course_zh,
      en: rows[0].course_en,
      periods: d3.sum(rows, periodsOf),
      sessions: rows.length
    }),
    d => d.course_id
  ).map(([id, values]) => ({ id, ...values, color: courseColor(id) }))
    .sort((a, b) => b.periods - a.periods || COURSE_IDS.indexOf(a.id) - COURSE_IDS.indexOf(b.id));
  // #endregion

  const courses = courseTotals.map(({ id, zh, en, color }) => ({ id, zh, en, color }))
    .sort((a, b) => COURSE_IDS.indexOf(a.id) - COURSE_IDS.indexOf(b.id));
  const totals = {
    sessions: schedule.length,
    courses: courses.length,
    periods: d3.sum(schedule, periodsOf),
    activeDays: byDay.size
  };
  return { daily, courses, courseTotals, totals };
}

let weekDataPromise;
export function loadWeekData() {
  if (!weekDataPromise) weekDataPromise = readWeekData();
  return weekDataPromise;
}

async function readWeekData() {
  // #region snippet:load-week
  const [schedule, meta] = await Promise.all([
    d3.csv(new URL('../data/my_week_schedule_public.csv', import.meta.url), d => ({
      ...d,
      weekday_index: +d.weekday_index,
      period_start: +d.period_start,
      period_end: +d.period_end
    })),
    d3.json(new URL('../data/my_week_meta.json', import.meta.url))
  ]);
  // #endregion

  // UTC prevents local daylight-saving rules from shifting dates or weekdays.
  const start = d3.utcParse('%Y-%m-%d')(meta.week_start);
  const end = d3.utcParse('%Y-%m-%d')(meta.week_end);
  const days = d3.utcDay.range(start, d3.utcDay.offset(end, 1)).map((date, index) => ({
    date: d3.utcFormat('%Y-%m-%d')(date),
    weekday_zh: WEEKDAYS_ZH[date.getUTCDay()],
    weekday_en: WEEKDAYS_EN[date.getUTCDay()],
    index
  }));
  return { schedule, meta, days, ...summarizeSchedule(schedule, days) };
}
