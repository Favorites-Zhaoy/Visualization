import {state,color,duration} from './data.js?v=2';
import {treemap,histogram} from './charts.js?v=2';
import {cleanupWith} from './lifecycle.js?v=2';

export function initStory(host) {
  const s=d3.select(host), total=state.students.length;
  const counts=d3.rollups(state.students,v=>v.length,d=>d.class_name).sort((a,b)=>b[1]-a[1]);
  const middle=state.students.filter(d=>d.age===18||d.age===19).length;
  s.html(`<div class="story-heading"><p class="eyebrow">THE SAME DATA. A NEW READING ORDER.</p><h3>让布局带着你，读懂这份数据。</h3></div><div class="story-layout"><div class="story-text"><article class="story-step active" data-step="0"><span>01 / PEOPLE</span><h4>${total} 名新生。<br>从整体开始。</h4><p>每个点是一名学生。先看见人，再组织信息。</p></article><article class="story-step" data-step="1"><span>02 / SCALE</span><h4>班级大小，<br>成为空间大小。</h4><p>${counts[0][0]} ${counts[0][1]} 人，${counts.at(-1)[0]} ${counts.at(-1)[1]} 人。相同颜色保留身份，面积揭示规模。</p></article><article class="story-step" data-step="2"><span>03 / ATTENTION</span><h4>保留整体，<br>把年龄带到眼前。</h4><p>18–19 岁共 ${middle} 人，占 ${d3.format('.1%')(middle/total)}。总览仍在；阅读重心转向分布。</p></article><article class="story-step" data-step="3"><span>04 / DETAIL</span><h4>走进一个班级，<br>不丢失全局。</h4><p>选中班级的详情展开，其他班级仍留在图中。点击色块，继续探索。</p><a class="primary story-final" href="#final">进入 CampusScope →</a></article></div><div class="story-visual"><div class="story-controls" aria-label="故事步骤">${[0,1,2,3].map(i=>`<button data-story="${i}" aria-label="跳到故事第 ${i+1} 步" aria-pressed="${i===0}">0${i+1}</button>`).join('')}</div><p class="story-status" aria-live="polite"></p><div class="story-chart"><div class="story-points"></div><div class="story-tree" hidden></div><div class="story-age" hidden><span class="story-subtitle">年龄分布 / 全体 ${total} 人</span><div class="age-chart"></div></div><div class="story-detail" hidden></div></div></div></div>`);
  let index=-1, selected='数据科学1班', frame=0, alive=true;
  const points=d3.select(s.select('.story-points').node()).append('svg').attr('role','img').attr('aria-label',`${total} 个点代表 ${total} 名新生`);
  points.selectAll('circle').data(state.students,d=>d.student_id).join('circle').attr('fill',d=>color(d.class_name)).append('title').text(d=>`${d.student_id} · ${d.class_name}`);
  const tree=treemap(s.select('.story-tree').node(),{height:w=>w<420?145:210,onSelect:name=>{if(index===3){selected=name;renderDetail();}}});
  function renderPoints(){const w=s.select('.story-points').node().clientWidth;if(!w)return;const cols=w<330?10:16,rows=Math.ceil(total/cols),h=w<420?145:210;points.attr('viewBox',`0 0 ${w} ${h}`);points.selectAll('circle').attr('cx',(_,i)=>22+(i%cols)*(w-44)/(cols-1)).attr('cy',(_,i)=>25+Math.floor(i/cols)*(h-50)/(rows-1)).attr('r',Math.min(7,(w-44)/cols*.27));}
  function renderDetail(){const rows=state.students.filter(d=>d.class_name===selected);s.select('.story-detail').html(`<span class="eyebrow">${selected}</span><strong>${rows.length}<small> 人</small></strong><p>平均年龄 ${d3.mean(rows,d=>d.age)?.toFixed(1)||'—'} 岁 · 来自 ${new Set(rows.map(d=>d.province)).size} 个省份</p>`);tree.update({selected,focus:true});}
  const titles=['01 / 80 个点，80 名新生','02 / 用面积呈现人数','03 / 年龄成为阅读焦点','04 / 在整体中查看局部'];
  function step(next){if(next===index||!alive)return;index=next;state.storyStep=next;s.attr('data-story-step',next);s.selectAll('[data-story]').attr('aria-pressed',function(){return +this.dataset.story===next});s.selectAll('.story-step').classed('active',function(){return +this.dataset.step===next});s.select('.story-status').text(titles[next]);s.select('.story-points').attr('hidden',next===0?null:true);s.select('.story-tree').attr('hidden',next===0?true:null);s.select('.story-age').attr('hidden',next===2?null:true);s.select('.story-detail').attr('hidden',next===3?null:true);s.select('.story-visual').attr('data-stage',next);if(next===0)renderPoints();else tree.update({mode:'treemap',selected:next===3?selected:null,focus:next===3});if(next===2)histogram(s.select('.age-chart').node(),state.students,true);if(next===3)renderDetail();}
  const steps=s.selectAll('.story-step').nodes();
  function fromScroll(){frame=0;if(!s.node().getBoundingClientRect().width)return;const rect=s.node().getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)return;const focus=innerHeight*.48;let closest=0,distance=Infinity;steps.forEach((el,i)=>{const r=el.getBoundingClientRect();const d=r.top<=focus&&r.bottom>=focus?0:Math.min(Math.abs(r.top-focus),Math.abs(r.bottom-focus));if(d<distance){distance=d;closest=i;}});step(closest);}
  function schedule(){if(!frame)frame=requestAnimationFrame(fromScroll);}
  const observer=new IntersectionObserver(schedule,{rootMargin:'-20% 0px -20% 0px',threshold:[0,.25,.5,.75,1]});steps.forEach(el=>observer.observe(el));
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
  s.selectAll('[data-story]').on('click.story',function(){const next=+this.dataset.story;step(next);steps[next].scrollIntoView({behavior:duration()?'smooth':'auto',block:'center'});});
  const ro=new ResizeObserver(()=>{renderPoints();if(index===2)histogram(s.select('.age-chart').node(),state.students,true);schedule();});ro.observe(s.select('.story-visual').node());
  step(0);
  return {destroy:cleanupWith(()=>{alive=false;observer.disconnect();ro.disconnect();tree.destroy();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);s.selectAll('button').on('.story',null);points.selectAll('*').interrupt();})};
}

