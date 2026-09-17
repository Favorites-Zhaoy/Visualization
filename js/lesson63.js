import { classCounts, state, color, duration } from './data.js?v=2';
import { cleanupWith } from './lifecycle.js?v=2';
export function init63(){
 const s=d3.select('#demo63'),counts=classCounts(),total=d3.sum(counts,d=>d.value);
 s.html(`<div class="toolbar morph-controls"><button data-endpoint="0" aria-pressed="true">Equal Grid</button><label class="morph-slider">空间重组 <input type="range" min="0" max="1" step="0.01" value="0" aria-label="等分网格到人数矩形树图的变形进度"><output>0%</output></label><button data-endpoint="1" aria-pressed="false">Treemap</button><span class="spacer"></span><button data-display="area" aria-pressed="true">Area</button><button data-display="people" aria-pressed="false">People · ${total}</button></div><div class="morph-layout"><div class="morph-tree"></div><div class="morph-benchmark"><span class="lab-eyebrow">人数基准 / PEOPLE</span></div></div><p class="morph-readout" role="status" aria-live="polite">每个班级获得 25% 的空间，但人数并不相同。</p>`);
 const svg=s.select('.morph-tree').append('svg').attr('role','img').attr('aria-label','四个班级从等分网格连续变形为按人数分配面积的矩形树图');
 const cells=svg.append('g').selectAll('g').data(counts,d=>d.name).join('g').attr('class','morph-cell');cells.append('rect').attr('fill',d=>color(d.name));cells.append('text').attr('class','morph-class').attr('fill','white').text(d=>d.name);cells.append('text').attr('class','morph-count').attr('fill','white').text(d=>`${d.value} 人 · ${(100*d.value/total).toFixed(1)}%`);
 const dots=svg.append('g').attr('class','morph-people').selectAll('circle').data(state.students,d=>d.student_id).join('circle').attr('fill','#fff').attr('stroke','#17352f').attr('stroke-width',.5);
 const bars=s.select('.morph-benchmark').selectAll('.benchmark-row').data(counts,d=>d.name).join('div').attr('class','benchmark-row');bars.append('div').html(d=>`<span>${d.name}</span><b>${d.value} <small>人</small></b>`);bars.append('i').append('span').style('width',d=>100*d.value/d3.max(counts,x=>x.value)+'%').style('background',d=>color(d.name));bars.append('small').text(d=>(100*d.value/total).toFixed(1)+'% of 80');
 let t=0,people=false,width=0,height=0;
 const groups=d3.group(state.students,d=>d.class_name),positions=new Map();
 function render(){width=s.select('.morph-tree').node().clientWidth;if(!width)return;height=width<420?360:350;svg.attr('viewBox',`0 0 ${width} ${height}`);
 const root=d3.hierarchy({children:counts}).sum(d=>d.value||0);d3.treemap().size([width,height]).paddingInner(3).round(false)(root);
 const targets=new Map(root.leaves().map(d=>[d.data.name,d]));positions.clear();
 counts.forEach((d,i)=>{const x=(i%2)*(width/2+1.5),y=Math.floor(i/2)*(height/2+1.5),target=targets.get(d.name);positions.set(d.name,{x:d3.interpolateNumber(x,target.x0)(t),y:d3.interpolateNumber(y,target.y0)(t),w:d3.interpolateNumber(width/2-1.5,target.x1-target.x0)(t),h:d3.interpolateNumber(height/2-1.5,target.y1-target.y0)(t)})});
 cells.attr('transform',d=>{const p=positions.get(d.name);return `translate(${p.x},${p.y})`});cells.select('rect').attr('width',d=>positions.get(d.name).w).attr('height',d=>positions.get(d.name).h).attr('fill-opacity',people?.72:1);
 cells.select('.morph-class').attr('x',10).attr('y',23).attr('font-size',width<420?12:14);cells.select('.morph-count').attr('x',10).attr('y',44).attr('font-size',width<420?11:13);
 const pointPos=new Map();groups.forEach((rows,name)=>{const p=positions.get(name),availW=Math.max(10,p.w-20),availH=Math.max(10,p.h-66),cols=Math.max(1,Math.ceil(Math.sqrt(rows.length*availW/availH))),lines=Math.ceil(rows.length/cols),stepX=availW/cols,stepY=availH/lines;rows.forEach((row,i)=>pointPos.set(row.student_id,{x:p.x+10+stepX*(i%cols+.5),y:p.y+58+stepY*(Math.floor(i/cols)+.5),r:Math.min(4.5,stepX*.3,stepY*.3)}))});
 dots.attr('cx',d=>pointPos.get(d.student_id).x).attr('cy',d=>pointPos.get(d.student_id).y).attr('r',d=>pointPos.get(d.student_id).r).attr('opacity',people?1:0);
 s.select('input').property('value',t);s.select('output').text(Math.round(t*100)+'%');s.selectAll('[data-endpoint]').attr('aria-pressed',function(){return Math.abs(+this.dataset.endpoint-t)<.001});
 s.select('.morph-readout').text(t===0?'Equal Grid：每个班级获得 25% 的空间，但人数并不相同。':t===1?'Treemap：面积与人数成正比。26 / 22 / 18 / 14 人，来自同一份数据。':`变形 ${Math.round(t*100)}%：颜色和人数不变，四个班级正在重新分配空间。`);
 }
 s.select('input').on('input.morph',function(){svg.interrupt();t=+this.value;render()});
 s.selectAll('[data-endpoint]').on('click.morph',function(){const target=+this.dataset.endpoint;svg.interrupt();if(!duration()){t=target;render();return}const from=t;svg.transition().duration(800).ease(d3.easeCubicInOut).tween('layout',()=>p=>{t=d3.interpolateNumber(from,target)(p);render()})});
 s.selectAll('[data-display]').on('click.morph',function(){people=this.dataset.display==='people';s.selectAll('[data-display]').attr('aria-pressed',function(){return (this.dataset.display==='people')===people});render()});
 const ro=new ResizeObserver(render);ro.observe(s.select('.morph-tree').node());render();
 return cleanupWith(()=>{ro.disconnect();svg.interrupt();s.selectAll('*').on('.morph',null)});
}
