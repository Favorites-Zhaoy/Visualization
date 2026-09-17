/* Original, deterministic micro-visualizations. CSS owns the surrounding page. */
const P = { ink: '#244d43', lime: '#d7ed61', orange: '#e88959', gray: '#d6ded6', paper: '#f0f2e9', muted: '#789187' };
const colors = [P.ink, P.orange, '#8ca85b', '#98b8b0', '#b29178'];
const tr = (lang, zh, en) => lang === 'en' ? en : zh;
const numeric = rows => (Array.isArray(rows) ? rows : []).map(d => ({ ...d, value: +d.value, x: +d.x, y: +d.y }));
function label(g, text, x, y, size = 12, fill = P.ink, anchor = 'start') {
  return g.append('text').attr('x', x).attr('y', y).attr('font-size', size).attr('fill', fill).attr('text-anchor', anchor).text(text);
}
function line(g, x1, y1, x2, y2, stroke = P.gray, width = 1) {
  return g.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', stroke).attr('stroke-width', width);
}
function axes(g, compact = false) {
  [45, 95, 145, 195].forEach(y => line(g, 36, y, 374, y));
  if (!compact) { label(g, '0', 29, 211, 10); label(g, '10', 366, 211, 10); }
}

function renderDIKW(g, rows, { lang }) {
  const levels = [tr(lang, '数据', 'DATA'), tr(lang, '信息', 'INFORMATION'), tr(lang, '知识', 'KNOWLEDGE'), tr(lang, '智慧', 'WISDOM')];
  levels.forEach((title, i) => {
    const y = 186 - i * 47, w = 320 - i * 63;
    g.append('path').attr('d', `M${200-w/2},${y+34}L${200+w/2},${y+34}L${200+w/2-22},${y}L${200-w/2+22},${y}Z`).attr('fill', [P.gray, '#a8c0ae', P.ink, P.lime][i]);
    label(g, title, 200, y + 23, 13, i === 2 ? '#fff' : P.ink, 'middle');
  });
  label(g, `${rows.length || 30} → 3 → 1`, 382, 21, 11, P.muted, 'end');
}
function renderChannels(g, rows, { lang, detail }) {
  const values = rows.slice(0, detail === 'compact' ? 6 : 9);
  const size = d3.scaleSqrt().domain([10, 100]).range([4, 15]);
  [tr(lang, '位置', 'POSITION'), tr(lang, '大小', 'SIZE'), tr(lang, '色彩', 'COLOR')].forEach((s, i) => label(g, s, 26, 37 + i * 76, 10));
  values.forEach((d, i) => {
    const x = 110 + i * 29;
    g.append('circle').attr('cx', 105 + d.value * 2.3).attr('cy', 23 + i * 4).attr('r', 3).attr('fill', P.ink);
    g.append('circle').attr('cx', x).attr('cy', 103).attr('r', size(d.value)).attr('fill', P.orange).attr('opacity', .82);
    g.append('rect').attr('x', x - 12).attr('y', 162).attr('width', 25).attr('height', 30).attr('fill', d3.interpolateRgb(P.gray, P.ink)(d.value / 100));
  });
}
function renderDataJoin(g, rows, { lang, detail }) {
  const groups = ['enter', 'update', 'exit'];
  groups.forEach((state, k) => {
    const subset = rows.filter(d => d.state === state), x = 17 + k * 129;
    g.append('rect').attr('x', x).attr('y', 36).attr('width', 111).attr('height', 149).attr('rx', 54).attr('fill', [P.lime, P.gray, '#efdfd2'][k]);
    subset.forEach((d, i) => g.append('circle').attr('cx', x + 29 + i % 3 * 26).attr('cy', 70 + Math.floor(i / 3) * 22).attr('r', 4 + d.value / 28).attr('fill', k === 2 ? 'none' : P.ink).attr('stroke', P.ink).attr('stroke-dasharray', k === 2 ? '2 2' : null));
    label(g, tr(lang, ['进入', '更新', '退出'][k], state.toUpperCase()), x + 55, 210, 12, P.ink, 'middle');
    if (detail !== 'compact') label(g, subset.length, x + 55, 26, 11, P.muted, 'middle');
  });
}
function renderPipeline(g, rows, { lang, detail }) {
  const names = lang === 'en' ? ['DATA', 'FILTER', 'ENCODE', 'VIEW'] : ['数据', '筛选', '编码', '视图'];
  names.forEach((name, i) => {
    const x = 22 + i * 97, y = 90;
    g.append('rect').attr('x', x).attr('y', y).attr('width', 64).attr('height', 65).attr('fill', i === 3 ? P.lime : i === 0 ? P.gray : P.ink);
    if (i < 3) { line(g, x + 69, 121, x + 92, 121, P.ink, 2); g.append('path').attr('d', `M${x+86},116l6,5l-6,5`).attr('fill', 'none').attr('stroke', P.ink); }
    [0, 1, 2].forEach(j => line(g, x + 15, y + 20 + j * 12, x + 49 - j * (i + 1) * 3, y + 20 + j * 12, i === 1 || i === 2 ? P.lime : P.ink, 3));
    label(g, name, x + 32, 180, 10, P.ink, 'middle');
    if (detail === 'full') label(g, `0${i+1}`, x, 72, 11, P.muted);
  });
}
function rootData(data) { return d3.hierarchy(data && !Array.isArray(data) ? data : { name: 'Atlas', children: [] }).sum(d => +d.value || 0); }
function renderHierarchy(g, data, { detail }) {
  const root = rootData(data); d3.pack().size([310, 210]).padding(7)(root);
  const nodes = detail === 'compact' ? root.descendants().filter(d => d.depth < 2) : root.descendants();
  const group = g.append('g').attr('transform', 'translate(45,15)');
  group.selectAll('circle').data(nodes).join('circle').attr('cx', d => d.x).attr('cy', d => d.y).attr('r', d => d.r).attr('fill', d => [P.gray, '#9db7a0', P.ink][d.depth]).attr('stroke', P.paper).attr('stroke-width', 2);
  if (detail !== 'compact') group.selectAll('text').data(root.leaves()).join('text').attr('x', d => d.x).attr('y', d => d.y + 4).attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#fff').text(d => d.value);
}
function renderTree(g, data, { detail }) {
  const root = rootData(data); if (detail === 'compact') root.children?.forEach(d => { d.children = null; });
  d3.tree().size([190, 300])(root);
  const tree = g.append('g').attr('transform', 'translate(42,25)');
  tree.selectAll('path').data(root.links()).join('path').attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x)).attr('fill', 'none').attr('stroke', '#9bb4a7').attr('stroke-width', detail === 'compact' ? 3 : 1.5);
  tree.selectAll('circle').data(root.descendants()).join('circle').attr('cx', d => d.y).attr('cy', d => d.x).attr('r', d => d.depth === 0 ? 12 : d.depth === 1 ? 8 : 4).attr('fill', d => d.depth === 0 ? P.orange : d.depth === 1 ? P.ink : '#8ba666');
}
function renderColorSpace(g, rows, { detail }) {
  const n = detail === 'compact' ? 12 : 30, points = rows.slice(0, n);
  [42, 70, 97].forEach(r => g.append('circle').attr('cx', 200).attr('cy', 119).attr('r', r).attr('fill', 'none').attr('stroke', P.gray));
  points.forEach((d, i) => {
    const a = i / points.length * Math.PI * 2, r = 28 + d.value * 67;
    g.append('circle').attr('cx', 200 + Math.cos(a) * r).attr('cy', 119 + Math.sin(a) * r).attr('r', detail === 'compact' ? 13 : 9).attr('fill', d3.hcl(i / points.length * 360, 43, 63).formatHex());
  });
  label(g, 'H', 313, 125, 12); label(g, 'C', 195, 15, 12); label(g, 'L', 200, 125, 14, P.ink, 'middle');
}
function renderColormap(g, rows, { lang, detail }) {
  const sorted = [...rows].sort((a,b) => a.value-b.value), w = 338 / Math.max(1, sorted.length);
  const scales = [d3.interpolateViridis, d3.interpolateCividis, d3.interpolateRgb(P.gray, P.ink)];
  scales.forEach((scale, k) => {
    sorted.forEach((d, i) => g.append('rect').attr('x', 31 + i * w).attr('y', 42 + k * 58).attr('width', w + .5).attr('height', 32).attr('fill', scale(d.value)));
    if (detail !== 'compact') label(g, ['VIRIDIS', 'CIVIDIS', tr(lang,'单色序列','SEQUENTIAL')][k], 31, 35+k*58, 9, P.muted);
  });
  label(g, '0', 31, 220, 11); label(g, '1', 369, 220, 11, P.ink, 'end');
}
function renderCVD(g, rows, { lang, detail }) {
  const sorted = [...rows].sort((a,b) => a.value-b.value).filter((_, i) => i%3===0), w = 330/Math.max(1,sorted.length);
  [0,1].forEach(k => sorted.forEach((d,i) => {
    g.append('rect').attr('x',35+i*w).attr('y',62+k*84).attr('width',w-3).attr('height',40).attr('fill', k ? d3.interpolateCividis(d.value) : d3.interpolateRdYlGn(d.value));
    g.append('circle').attr('cx',35+i*w+(w-3)/2).attr('cy',82+k*84).attr('r',3+d.value*6).attr('fill','none').attr('stroke',k ? '#fff' : P.ink).attr('stroke-width',1.5);
  }));
  label(g, tr(lang,'色彩 + 大小：保留双重线索','COLOR + SIZE: TWO CUES'),35,30,11);
  if(detail !== 'compact') label(g,tr(lang,'比较两种配色，不代表临床模拟','Palette comparison · not a clinical simulation'),35,220,10,P.muted);
}
function renderCoordinates(g, rows, { lang, detail }) {
  const points=rows.filter((_,i)=>i%(detail==='compact'?6:3)===0);
  line(g,28,188,176,188,P.ink); line(g,35,200,35,45,P.ink);
  g.append('circle').attr('cx',292).attr('cy',122).attr('r',76).attr('fill','none').attr('stroke',P.gray);
  g.append('circle').attr('cx',292).attr('cy',122).attr('r',40).attr('fill','none').attr('stroke',P.gray);
  points.forEach(d=> {
    g.append('circle').attr('cx',40+d.x*12).attr('cy',183-d.y*8).attr('r',4).attr('fill',P.ink);
    const a=d.x/10*Math.PI*2,r=28+d.y*3;
    g.append('circle').attr('cx',292+Math.cos(a)*r).attr('cy',122+Math.sin(a)*r).attr('r',4).attr('fill',P.orange);
  });
  label(g,'→',199,127,22,P.ink,'middle');
  label(g,tr(lang,'直角坐标','CARTESIAN'),98,228,10,P.ink,'middle'); label(g,tr(lang,'极坐标','POLAR'),292,228,10,P.ink,'middle');
}
function renderCurve(g, rows, { detail }) {
  const x=d3.scaleLinear().domain([0,10]).range([36,374]), y=d3.scaleLinear().domain([0,18]).range([195,30]); axes(g,detail==='compact');
  g.selectAll('circle').data(rows.filter((_,i)=>detail!=='compact'||i%3===0)).join('circle').attr('cx',d=>x(d.x)).attr('cy',d=>y(d.y)).attr('r',3).attr('fill',d=>d.class==='A'?P.ink:P.orange).attr('opacity',.65);
  g.append('path').datum(d3.range(0,10.01,.1)).attr('d',d3.line().x(d=>x(d)).y(d=>y(.35*d*d-2.6*d+8))).attr('fill','none').attr('stroke',P.ink).attr('stroke-width',3);
}
function renderContour(g, rows, { detail }) {
  const x=d3.scaleLinear().domain([0,10]).range([50,350]), y=d3.scaleLinear().domain([0,18]).range([195,35]);
  const contours=d3.contourDensity().x(d=>x(d.x)).y(d=>y(d.y)).size([400,240]).bandwidth(detail==='compact'?27:21).thresholds(detail==='compact'?4:7)(rows);
  const color=d3.scaleSequential(d3.interpolateRgb(P.gray,P.ink)).domain([0,d3.max(contours,d=>d.value)||1]);
  g.selectAll('path').data(contours).join('path').attr('d',d3.geoPath()).attr('fill',d=>color(d.value)).attr('stroke',P.paper).attr('stroke-width',1);
  if(detail==='full') g.selectAll('circle').data(rows).join('circle').attr('cx',d=>x(d.x)).attr('cy',d=>y(d.y)).attr('r',1.6).attr('fill',P.orange);
}
function monthly(rows) { return d3.rollups(rows,v=>d3.mean(v,d=>d.value),d=>d.date).sort((a,b)=>d3.ascending(a[0],b[0])); }
function renderCalendar(g, rows, { lang, detail }) {
  const months=monthly(rows.filter(d=>d.series==='A')), compact=detail==='compact';
  const cells=compact?d3.range(12).map(m=>({value:d3.mean(months.filter(([date])=>+date.slice(5,7)===m+1),d=>d[1]),col:m%6,row:Math.floor(m/6)})):months.map(([date,value],i)=>({value,col:i%12,row:Math.floor(i/12)}));
  const cols=compact?6:12,w=330/cols,h=compact?59:34,color=d3.scaleSequential(d3.interpolateRgb(P.lime,P.ink)).domain([20,100]);
  g.selectAll('rect').data(cells).join('rect').attr('x',d=>44+d.col*w).attr('y',d=>49+d.row*(h+5)).attr('width',w-5).attr('height',h).attr('rx',2).attr('fill',d=>color(d.value));
  if(!compact) [2023,2024,2025,2026].forEach((year,i)=>label(g,year,37,70+i*39,9,P.muted,'end'));
  label(g,compact?tr(lang,'序列 A · 12 月份跨年均值','SERIES A · 12 MONTH-OF-YEAR MEANS'):tr(lang,'序列 A · 48 个月','SERIES A · 48 MONTHS'),44,225,10,P.muted);
}
function renderSpiral(g, rows, { detail }) {
  const points=monthly(rows), center=[200,122], max=points.length-1;
  const coord=(i,value)=> { const a=i/12*Math.PI*2-Math.PI/2,r=22+i/max*75; return [center[0]+Math.cos(a)*r,center[1]+Math.sin(a)*r,value]; };
  const positions=points.map((d,i)=>coord(i,d[1]));
  g.append('path').datum(positions).attr('d',d3.line().curve(d3.curveCatmullRom)).attr('fill','none').attr('stroke',P.gray).attr('stroke-width',2);
  g.selectAll('circle').data(positions.filter((_,i)=>detail!=='compact'||i%2===0)).join('circle').attr('cx',d=>d[0]).attr('cy',d=>d[1]).attr('r',d=>3+d[2]/24).attr('fill',d=>d3.interpolateRgb(P.lime,P.ink)(d[2]/100)).attr('stroke',P.paper).attr('stroke-width',1);
  if(detail==='full') {label(g,'2023',200,126,9,P.ink,'middle');label(g,'2026',303,210,10,P.muted);}
}
function renderStoryline(g, rows, { lang, detail }) {
  // A/B/C plus two derived tracks form a five-line composition study.
  const series=d3.group(rows,d=>d.series), dates=monthly(rows).map(d=>d[0]);
  const seriesMaps=['A','B','C'].map(key=>new Map((series.get(key)||[]).map(d=>[d.date,d.value])));
  const tracks=d3.range(5).map(k=>dates.map((date,i)=> {
    const values=seriesMaps.map(map=>map.get(date)||50);
    const value=k<3?values[k]:k===3?d3.mean(values):d3.max(values)-d3.min(values)+35;
    return {x:28+i/Math.max(1,dates.length-1)*339,y:121+(value-55)*1.9+(k-2)*6};
  }).filter((_,i)=>detail!=='compact'||i%4===0||i===dates.length-1));
  [28,112,196,280,367].forEach(x=>line(g,x,30,x,198,P.gray));
  g.selectAll('path').data(tracks).join('path').attr('d',d3.line().x(d=>d.x).y(d=>d.y).curve(d3.curveMonotoneX)).attr('fill','none').attr('stroke',(_,i)=>colors[i]).attr('stroke-width',detail==='compact'?4:3).attr('stroke-linecap','round');
  if(detail!=='compact') { label(g,'2023',28,220,10,P.muted);label(g,'2026',367,220,10,P.muted,'end'); }
  if(detail==='full') label(g,tr(lang,'A / B / C + 均值与极差 · 构图示意','A / B / C + MEAN & RANGE · COMPOSITION STUDY'),28,18,9,P.muted);
}

export const previewRenderers = {
  dikw:renderDIKW, channels:renderChannels, 'data-join':renderDataJoin,
  pipeline:renderPipeline, hierarchy:renderHierarchy, tree:renderTree,
  'color-space':renderColorSpace, colormap:renderColormap, cvd:renderCVD,
  coordinates:renderCoordinates, curve:renderCurve, contour:renderContour,
  calendar:renderCalendar, spiral:renderSpiral, storyline:renderStoryline
};

export function renderPreview(container, module, datasets, { detail='full', lang='zh' }={}) {
  const svg=d3.select(container).selectAll('svg.atlas-preview').data([module],d=>d.id).join('svg')
    .attr('class','atlas-preview').attr('viewBox','0 0 400 240').attr('preserveAspectRatio','xMidYMid meet')
    .attr('role','img').attr('aria-label',module[`title_${lang}`] || module.title_en)
    .attr('data-detail',detail).attr('data-preview',module.preview_type)
    .style('display','block').style('width','100%').style('height','100%').style('overflow','hidden')
    .attr('font-family','Arial, "Microsoft YaHei", sans-serif');
  svg.selectAll('*').remove();
  svg.append('title').text(module[`title_${lang}`] || module.title_en);
  const key=module.data_ref;
  const raw=datasets[key] ?? datasets[key.replace(/\.(csv|json)$/,'')] ?? datasets[`${key}.csv`] ?? datasets[`${key}.json`] ?? [];
  const data=Array.isArray(raw)?numeric(raw):raw;
  const renderer=previewRenderers[module.preview_type];
  if(renderer) renderer(svg.append('g'),data,{detail,lang,module});
  return svg.node();
}
