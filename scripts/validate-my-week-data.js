/* Standalone CommonJS validator: node scripts/validate-my-week-data.js */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');

try {
  const root = path.resolve(__dirname, '..');
  // Use the same bundled CSV parser as the browser, with no npm install.
  const context = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'vendor/d3.v7.min.js'), 'utf8'), context);
  const raw = fs.readFileSync(path.join(root, 'data/my_week_schedule_public.csv'), 'utf8');
  const parsedCsv = context.d3.csvParse(raw.replace(/^\uFEFF/, ''));
  const rows = Array.from(parsedCsv);
  const meta = JSON.parse(fs.readFileSync(path.join(root, 'data/my_week_meta.json'), 'utf8'));
  const fields = ['session_id', 'date', 'weekday_index', 'weekday_zh', 'weekday_en', 'period_start', 'period_end', 'period_label', 'course_id', 'course_zh', 'course_en', 'location', 'source'];
  assert.deepEqual(Array.from(parsedCsv.columns), fields, 'CSV field names or order differ');
  assert.equal(rows.length, 11, 'Expected 11 sessions');
  assert.equal(new Set(rows.map(d => d.session_id)).size, rows.length, 'Session IDs must be unique');
  assert.equal(meta.week_start, '2026-09-13');
  assert.equal(meta.week_end, '2026-09-19');
  assert.equal(meta.default_focus_date, '2026-09-17');
  assert.equal(meta.periods_per_day, 11);
  const weekdaysZh = ['日', '一', '二', '三', '四', '五', '六'];
  const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const expectedSessions = [
    ['S001', '2026-09-14', 1, 2, 'OS', '西廊'],
    ['S002', '2026-09-14', 8, 9, 'NET', '南教'],
    ['S003', '2026-09-15', 1, 2, 'CI', '南教'],
    ['S004', '2026-09-16', 1, 2, 'OS', '西廊'],
    ['S005', '2026-09-16', 6, 7, 'VIS', '南教'],
    ['S006', '2026-09-16', 8, 9, 'NET', '南教'],
    ['S007', '2026-09-17', 1, 2, 'CI', '南教'],
    ['S008', '2026-09-17', 3, 4, 'VIS', '南教'],
    ['S009', '2026-09-17', 6, 7, 'CV', '南教'],
    ['S010', '2026-09-18', 1, 2, 'CI', '微'],
    ['S011', '2026-09-18', 3, 5, 'VIS', '微']
  ];
  const names = {
    OS: ['操作系统', 'Operating Systems'],
    CI: ['计算智能', 'Computational Intelligence'],
    VIS: ['可视化导论', 'Introduction to Visualization'],
    NET: ['计算机网络原理', 'Principles of Computer Networks'],
    CV: ['计算机视觉', 'Computer Vision']
  };
  const dayTotals = Object.fromEntries(Array.from({ length: 7 }, (_, i) => [`2026-09-${13 + i}`, 0]));
  const courseTotals = {};
  const occupied = new Set();
  for (const row of rows) {
    fields.forEach(field => assert.ok(row[field], `${row.session_id}: missing ${field}`));
    const parsed = new Date(`${row.date}T00:00:00Z`);
    assert.ok(Number.isFinite(+parsed) && parsed.toISOString().slice(0, 10) === row.date, 'Invalid calendar date');
    assert.ok(row.date >= meta.week_start && row.date <= meta.week_end, 'Session outside week');
    assert.equal(+row.weekday_index, parsed.getUTCDay(), 'Weekday index differs');
    assert.equal(row.weekday_zh, weekdaysZh[parsed.getUTCDay()]);
    assert.equal(row.weekday_en, weekdaysEn[parsed.getUTCDay()]);
    const start = +row.period_start;
    const end = +row.period_end;
    assert.ok(Number.isInteger(start) && Number.isInteger(end) && start >= 1 && end <= 11 && start <= end, 'Invalid period range');
    assert.equal(row.period_label, `第${start}-${end}节`);
    assert.ok(names[row.course_id], 'Unknown course');
    assert.deepEqual([row.course_zh, row.course_en], names[row.course_id], 'Course translation differs');
    assert.ok(['西廊', '南教', '微'].includes(row.location) && !/\d/.test(row.location), 'Public data must not contain room numbers');
    assert.equal(row.source, 'user_timetable_image_public');
    for (let period = start; period <= end; period++) {
      const key = `${row.date}:${period}`;
      assert.ok(!occupied.has(key), `Overlapping class at ${key}`);
      occupied.add(key);
    }
    dayTotals[row.date] += end - start + 1;
    courseTotals[row.course_id] = (courseTotals[row.course_id] || 0) + end - start + 1;
  }
  assert.deepEqual(rows.map(d => [d.session_id, d.date, +d.period_start, +d.period_end, d.course_id, d.location]).sort((a, b) => a[0].localeCompare(b[0])), expectedSessions);
  assert.deepEqual(dayTotals, { '2026-09-13': 0, '2026-09-14': 4, '2026-09-15': 2, '2026-09-16': 6, '2026-09-17': 6, '2026-09-18': 5, '2026-09-19': 0 });
  assert.deepEqual(courseTotals, { OS: 4, NET: 4, CI: 6, VIS: 7, CV: 2 });
  assert.equal(Object.keys(courseTotals).length, 5);
  assert.equal(Object.values(dayTotals).filter(Boolean).length, 5);
  assert.equal(Object.values(dayTotals).reduce((sum, n) => sum + n, 0), 23);
  assert.equal(meta.session_count_expected, rows.length);
  assert.equal(meta.course_count_expected, Object.keys(courseTotals).length);
  assert.equal(meta.period_count_expected, occupied.size);
  console.log('All MY WEEK timetable checks passed.');
} catch (error) {
  console.error(`MY WEEK validation failed: ${error.message}`);
  process.exitCode = 1;
}
