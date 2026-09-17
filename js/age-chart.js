import { state, dispatch } from './data.js?v=3';
import { cleanupWith } from './lifecycle.js?v=3';

// The distribution always uses class rows; the brush only filters the linked details.
export function ageChart(host) {
  const root = d3.select(host);
  const svg = root.append('svg').attr('class', 'brushed-histogram').attr('role', 'img');
  const controls = root.append('div').attr('class', 'age-controls');
  controls.html('<label>最小年龄 <input class="age-min" type="number" required min="17" max="20" step="1" value="17"></label><span>—</span><label>最大年龄 <input class="age-max" type="number" required min="17" max="20" step="1" value="20"></label><button type="button" class="age-apply">应用</button><button type="button" class="age-clear">清除年龄</button>');
  const status = root.append('p').attr('class', 'age-status').attr('role', 'status');
  let rows = [], x, moving = false;
  const yMax = Math.max(1, d3.max(d3.rollups(state.students, v => v.length, d => d.age), d => d[1]));
  const brush = d3.brushX().on('end', event => {
    if (moving || !event.sourceEvent) return;
    if (!event.selection) { dispatch.call('ageRange', null, null); return; }
    const [a,b] = event.selection.map(x.invert);
    const lo = Math.max(17, Math.min(20, Math.ceil(a))), hi = Math.max(17, Math.min(20, Math.floor(b)));
    const range = lo <= hi ? [lo, hi] : [Math.max(17,Math.min(20,Math.round((a+b)/2))), Math.max(17,Math.min(20,Math.round((a+b)/2)))];
    dispatch.call('ageRange', null, range);
  });
  function render() {
    const w = host.clientWidth;
    if (!w) return;
    const h = 180, bottom = h-30;
    x = d3.scaleLinear().domain([16.5,20.5]).range([32,w-12]);
    const y = d3.scaleLinear().domain([0,yMax]).nice().range([bottom,22]);
    const bins = d3.range(17,21).map(age => ({age, n:rows.filter(d=>d.age===age).length}));
    svg.attr('viewBox',`0 0 ${w} ${h}`).attr('aria-label', '年龄分布，'+bins.map(d=>`${d.age}岁${d.n}人`).join('，')+'。可使用下方数字输入筛选。');
    svg.selectAll('.axis-y').data([0]).join('g').attr('class','axis-y').attr('transform','translate(32,0)').call(d3.axisLeft(y).ticks(3).tickSize(-(w-44))).call(g=>g.select('.domain').remove());
    svg.selectAll('.axis-x').data([0]).join('g').attr('class','axis-x').attr('transform',`translate(0,${bottom})`).call(d3.axisBottom(x).tickValues([17,18,19,20]).tickFormat(d=>d+'岁').tickSize(0)).call(g=>g.select('.domain').remove());
    svg.selectAll('.bar').data(bins,d=>d.age).join('rect').attr('class','bar').attr('x',d=>x(d.age-.32)).attr('width',Math.max(1,x(17.64)-x(17))).attr('y',d=>y(d.n)).attr('height',d=>bottom-y(d.n)).attr('fill',d=>!state.ageRange || (d.age>=state.ageRange[0] && d.age<=state.ageRange[1])?'#315f55':'#cbd2bd');
    svg.selectAll('.bar-label').data(bins,d=>d.age).join('text').attr('class','bar-label').attr('x',d=>x(d.age)).attr('y',d=>y(d.n)-6).attr('text-anchor','middle').text(d=>d.n);
    brush.extent([[32,20],[w-12,bottom]]);
    const bg = svg.selectAll('.age-brush').data([0]).join('g').attr('class','age-brush').call(brush);
    moving=true;
    bg.call(brush.move,state.ageRange ? [x(state.ageRange[0]-.45),x(state.ageRange[1]+.45)] : null);
    moving=false;
    controls.select('.age-min').property('value',state.ageRange?.[0] ?? 17);
    controls.select('.age-max').property('value',state.ageRange?.[1] ?? 20);
    status.text(state.ageRange ? `${state.ageRange[0]}–${state.ageRange[1]} 岁 · 分布保留当前班级全部 ${rows.length} 人` : `全部年龄 · 当前班级 ${rows.length} 人`);
    controls.select('.age-clear').property('disabled',!state.ageRange);
  }
  controls.select('.age-apply').on('click',()=>{
    const low=controls.select('.age-min').node(), high=controls.select('.age-max').node();
    if (!low.reportValidity() || !high.reportValidity()) return;
    dispatch.call('ageRange',null,[Math.min(+low.value,+high.value),Math.max(+low.value,+high.value)]);
  });
  controls.selectAll('input').on('keydown',event=>{ if(event.key==='Enter') controls.select('.age-apply').node().click(); });
  controls.select('.age-clear').on('click',()=>dispatch.call('ageRange',null,null));
  const ro=new ResizeObserver(render);ro.observe(host);
  const destroy=cleanupWith(()=>{ro.disconnect();svg.selectAll('*').interrupt();controls.selectAll('*').on('click',null).on('keydown',null);brush.on('end',null);});
  return {update(nextRows){rows=nextRows;render();},destroy};
}
