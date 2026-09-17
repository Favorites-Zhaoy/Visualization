import { state, classCounts, color, duration } from './data.js?v=3';
import { cleanupWith } from './lifecycle.js?v=3';

export function initOpening(){
 const root=d3.select('#opening'),host=document.querySelector('#opening-morph');
 const svg=d3.select(host).append('svg').attr('role','img').attr('aria-label','同一份80名新生数据，从散乱到响应式布局');
 const regions=svg.append('g').attr('class','morph-regions');
 const nodes=svg.append('g').selectAll('circle').data(state.students,d=>d.student_id).join('circle').attr('fill',d=>color(d.class_name));
 const stages=[['CHAOS','没有布局，信息只是散落。'],['HIERARCHY','划分区域，建立信息层级。'],['GRID','对齐，让阅读有了秩序。'],['DATA-DRIVEN LAYOUT','班级人数，决定所占空间。'],['COORDINATED VIEWS','看清整体，也看清局部。'],['RESPONSIVE','可用空间改变，阅读顺序依然清晰。']];
 const random=d3.randomLcg(20260917),scatter=state.students.map(()=>[random(),random()]);
 let stage=0,run=0,playing=false,finished=false;const pending=new Map();
 function pause(ms){return new Promise(resolve=>{const id=setTimeout(()=>{pending.delete(id);resolve()},ms);pending.set(id,resolve)})}
 function cancel(){run++;playing=false;for(const[id,resolve]of pending){clearTimeout(id);resolve()}pending.clear();svg.selectAll('*').interrupt();}
 function positions(s,w,h){let boxes=[],points=[];const pad=20,available=w-pad*2;
  if(s===0)points=scatter.map(([x,y])=>[pad+x*available,20+y*(h-40)]);
  if(s===1){boxes=[{name:'HEADER',x:pad,y:7,w:available,h:30,n:8},{name:'KPI',x:pad,y:46,w:available,h:35,n:16},{name:'MAIN',x:pad,y:90,w:available*.61,h:h-140,n:32},{name:'DETAIL',x:pad+available*.65,y:90,w:available*.35,h:h-140,n:16},{name:'SUPPORTING',x:pad,y:h-40,w:available,h:32,n:8}];for(const b of boxes){const cols=Math.max(2,Math.ceil(Math.sqrt(b.n*b.w/Math.max(20,b.h-12))));for(let i=0;i<b.n;i++)points.push([b.x+12+(i%cols+.5)*(b.w-24)/cols,b.y+15+(Math.floor(i/cols)+.5)*(b.h-19)/Math.ceil(b.n/cols)])}}
  if(s===2){const cols=w<500?10:16,rows=80/cols;points=state.students.map((_,i)=>[pad+(i%cols+.5)*available/cols,20+(Math.floor(i/cols)+.5)*(h-40)/rows]);}
  if(s===3){const tree=d3.hierarchy({children:classCounts()}).sum(d=>d.value||0);d3.treemap().size([available,h-14]).paddingInner(4)(tree);const byId=new Map();boxes=tree.leaves().map(d=>({name:d.data.name+' '+d.data.value,x:d.x0+pad,y:d.y0+7,w:d.x1-d.x0,h:d.y1-d.y0}));tree.leaves().forEach((d,j)=>{const list=state.students.filter(p=>p.class_name===d.data.name),b=boxes[j],cols=Math.max(2,Math.ceil(Math.sqrt(list.length*b.w/(b.h-30))));list.forEach((p,i)=>byId.set(p.student_id,[b.x+8+(i%cols+.5)*(b.w-16)/cols,b.y+26+(Math.floor(i/cols)+.5)*(b.h-32)/Math.ceil(list.length/cols)]))});points=state.students.map(d=>byId.get(d.student_id));}
  if(s===4){boxes=[{name:'OVERVIEW',x:pad,y:10,w:available*.61,h:h-20},{name:'DETAIL',x:pad+available*.65,y:10,w:available*.35,h:h-20}];points=state.students.map((_,i)=>{const detail=i>=60,b=boxes[detail?1:0],j=detail?i-60:i,cols=detail?4:10;return[b.x+10+(j%cols+.5)*(b.w-20)/cols,b.y+35+(Math.floor(j/cols)+.5)*(b.h-45)/(detail?5:6)]});}
  if(s===5){const bw=Math.min(available,280),x=(w-bw)/2;boxes=[{name:'CAMPUSSCOPE',x,y:4,w:bw,h:h-8}];points=state.students.map((_,i)=>[x+13+(i%10+.5)*(bw-26)/10,29+(Math.floor(i/10)+.5)*(h-44)/8]);}
  return{boxes,points};
 }
 function render(s,animate=true){stage=s;const w=host.clientWidth||600,h=host.clientHeight||280;svg.attr('viewBox',`0 0 ${w} ${h}`);const{boxes,points}=positions(s,w,h),time=animate?Math.min(750,duration()):0;
  const g=regions.selectAll('g').data(boxes,d=>d.name).join(enter=>{const x=enter.append('g');x.append('rect');x.append('text');return x},update=>update,exit=>exit.remove());
  g.select('rect').interrupt().transition().duration(time).attr('x',d=>d.x).attr('y',d=>d.y).attr('width',d=>d.w).attr('height',d=>d.h).attr('rx',3);
  g.select('text').attr('x',d=>d.x+8).attr('y',d=>d.y+15).style('font-size',w<400?'9px':'11px').text(d=>d.name);
  nodes.interrupt().attr('opacity',1).transition().duration(time).ease(d3.easeCubicInOut).attr('cx',(_,i)=>points[i][0]).attr('cy',(_,i)=>points[i][1]).attr('r',w<450?2.5:3.6);
  root.select('.stage-en').text(stages[s][0]);root.select('.stage-zh').text(stages[s][1]);root.attr('data-opening-stage',s);
 }
 function emergeFromBook() {
  render(0, false);
  const br = document.querySelector('#course-book').getBoundingClientRect();
  const mr = host.getBoundingClientRect();
  const origin = [br.left + br.width * .58 - mr.left, br.top + br.height * .52 - mr.top];
  const seeded = d3.randomLcg(20260917);
  const birth = state.students.map(() => {
   const angle = seeded() * Math.PI * 2, radius = 8 + seeded() * 55;
   return [origin[0] + Math.cos(angle) * radius, origin[1] + Math.sin(angle) * radius];
  });
  const chaos = positions(0, host.clientWidth, host.clientHeight).points;
  nodes.interrupt().attr('cx', (_,i) => birth[i][0]).attr('cy', (_,i) => birth[i][1]).attr('r', 1.8).attr('opacity', .15);
  root.classed('is-morphing', true);
  nodes.transition().duration(700).delay((_,i) => i * 4).ease(d3.easeCubicOut)
   .attr('cx', (_,i) => chaos[i][0]).attr('cy', (_,i) => chaos[i][1])
   .attr('r', host.clientWidth < 450 ? 2.5 : 3.6).attr('opacity', 1);
 }
 function finish(){cancel();finished=true;root.classed('is-open',true).classed('is-morphing',true).classed('is-finished',true);render(5,false);root.select('.stage-en').text('ONE DATASET · FIVE TRANSFORMATIONS');root.select('.stage-zh').text('80 个个体，最终成为一个有序的页面。');root.select('#open-book').attr('hidden',true);root.select('#explore-chapter').attr('hidden',null);root.select('#replay-opening').attr('hidden',null);root.select('#skip-opening').attr('hidden',true);}
 async function start(){cancel();finished=false;playing=true;const token=run;root.classed('is-finished',false).classed('is-morphing',false).classed('is-open',false);root.select('#open-book').attr('hidden',true);root.select('#explore-chapter').attr('hidden',true);root.select('#replay-opening').attr('hidden',true);root.select('#skip-opening').attr('hidden',null);
  if(!duration()){finish();return}root.select('.opening-visual').node().scrollIntoView({behavior:'smooth',block:'start'});await pause(80);if(token!==run)return;root.classed('is-open',true);await pause(900);if(token!==run)return;emergeFromBook();await pause(1150);
  for(let s=1;s<=5;s++){if(token!==run)return;render(s);await pause(1050)}if(token===run)finish();
 }
 root.select('#open-book').on('click',start);root.select('#replay-opening').on('click',start);root.select('#skip-opening').on('click',finish);
 root.select('.book-scene').on('pointermove',function(event){if(playing||finished||!duration()||event.pointerType!=='mouse')return;const b=this.getBoundingClientRect(),x=(event.clientX-b.left)/b.width-.5,y=(event.clientY-b.top)/b.height-.5;root.select('.book').style('transform',`rotateX(${4-y*4}deg) rotateY(${-8+x*6}deg)`)}).on('pointerleave',()=>root.select('.book').style('transform',null));
 const ro=new ResizeObserver(()=>{if(playing||finished)render(stage,false)});ro.observe(host);const media=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{if(media.matches)finish()};media.addEventListener('change',change);if(media.matches)finish();
 cleanupWith(()=>{cancel();ro.disconnect();media.removeEventListener('change',change);root.selectAll('button').on('click',null);root.select('.book-scene').on('pointermove',null).on('pointerleave',null)});
}
