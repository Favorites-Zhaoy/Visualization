import { drawKpis } from './charts.js?v=3';
import { duration } from './data.js?v=3';
import { cleanupWith } from './lifecycle.js?v=3';
export function init62(){
 const s=d3.select('#demo62');
 s.html(`<div class="layout-lab"><aside class="layout-controls"><span class="lab-eyebrow">LAYOUT LAB</span><div class="grid-buttons"><button data-mode="random" aria-pressed="false">Random</button><button data-mode="center" aria-pressed="false">Center</button><button data-mode="equal" aria-pressed="false">Equal Cards</button><button data-mode="grid" aria-pressed="true">12-column Grid</button></div><label class="overlay-label"><input type="checkbox" id="grid-overlay" checked> 显示 12 列网格</label><label class="lab-field">Gap <input id="lab-gap" type="range" min="8" max="40" value="16" aria-label="网格间距"><output>16px</output></label><label class="lab-field">平均年龄占列 <select id="lab-span" aria-label="平均年龄卡片占列数"><option value="2">span 2</option><option value="3" selected>span 3</option><option value="4">span 4</option><option value="6">span 6</option></select></label><button class="start-reading-test">10 秒阅读实验</button><code class="live-grid-code" aria-live="polite"></code></aside><div class="layout-canvas"><p class="scroll-hint">← 横向滑动查看完整 12 列 →</p><section class="reading-test" hidden aria-label="两轮阅读成本体验"><p class="reading-test-prompt" role="status"></p><div class="reading-result" aria-live="polite"></div><button class="cancel-reading-test">取消实验</button><small>每轮最多 10 秒。仅用于课堂体验，不作为正式实验数据；第二轮也可能受到记忆影响。</small></section><div class="grid-stage"><div class="grid-lines" aria-label="12列网格参考线"></div><div class="kpi-grid" data-mode="grid"></div></div><p class="grid-mode-explain"></p></div></div>`);
 s.select('.grid-lines').selectAll('span').data(d3.range(1,13)).join('span').text(d=>String(d).padStart(2,'0'));
 drawKpis(s.select('.kpi-grid').node());
 const cards=s.selectAll('.kpi'),grid=s.select('.kpi-grid');
 let mode='grid',gap=16,span=3;
 let timeout=0,flashTimer=0,generation=0,readingTrial=null,running=false;
 const readingTimes={random:null,grid:null};
 const panel=s.node().closest('[role="tabpanel"]');
 const targetLabel='平均年龄';
 // Keep the same article and bound datum throughout FLIP. Native buttons provide keyboard activation.
 cards.each(function(d){
   const button=document.createElement('button');
   button.type='button';button.className='reading-card';
   button.setAttribute('aria-label',`${d.label} ${d.value} ${d.unit}`);
   while(this.firstChild)button.append(this.firstChild);
   this.append(button);
 });
 // A stable seed makes Random reproducible; no dataset is regenerated.
 const random=d3.randomLcg(20260917);
 cards.style('--random-offset',()=>`${Math.round(random()*34)}px`);
 const notes={random:'指标分散排列。试着寻找同一项指标，观察自己的阅读路径。',center:'全部居中形成纵向队列，可以沿一条轴线逐项阅读。',equal:'等宽卡片建立共同基线，五项指标占据相同空间。',grid:'12 列划分空间。扩大“平均年龄”，观察后面的卡片如何换行；窄屏可横向移动画布。'};
 s.append('p').attr('class','probe-explanation').attr('role','status');
 function code(){
   const rules=mode==='grid'?`grid-template-columns:\n  repeat(12, minmax(0, 1fr));\n.age { grid-column: span ${span}; }`:mode==='equal'?'grid-template-columns:\n  repeat(5, minmax(0, 1fr));':mode==='center'?'grid-template-columns: 1fr;\nmax-width: 240px;':'grid-template-columns:\n  repeat(6, minmax(0, 1fr));';
   s.select('.live-grid-code').text(`gap: ${gap}px;\n${rules}`);
   s.select('.grid-mode-explain').text(notes[mode]);
   s.select('#lab-span').property('disabled',running||mode!=='grid');
 }
 async function change(mutate,animate=true){
   cards.interrupt().style('transform',null);
   const before=new Map();
   cards.each(function(d){before.set(d.label,this.getBoundingClientRect())});
   mutate();code();
   const transitions=[];
   cards.each(function(d){
     const a=before.get(d.label),b=this.getBoundingClientRect();
     if(!animate||!duration()||!b.width||!b.height)return;
     const t=d3.select(this).style('transform-origin','0 0')
       .style('transform',`translate(${a.x-b.x}px,${a.y-b.y}px) scale(${a.width/b.width},${a.height/b.height})`)
       .transition().duration(600).ease(d3.easeCubicOut)
       .styleTween('transform',function(){return d3.interpolateString(this.style.transform,'translate(0px,0px) scale(1,1)')})
       .on('end',function(){this.style.removeProperty('transform')});
     transitions.push(t.end());
   });
   await Promise.allSettled(transitions);
 }
 function setMode(value){
   return change(()=>{
     mode=value;grid.attr('data-mode',mode);
     s.selectAll('button[data-mode]').attr('aria-pressed',function(){return this.dataset.mode===mode});
   });
 }
 function controlsDisabled(disabled){
   s.selectAll('button[data-mode],#lab-gap,#lab-span,#grid-overlay').property('disabled',disabled);
   code();
 }
 function cancelTrial(message='实验已取消，可以重新开始。'){
   ++generation;clearTimeout(timeout);timeout=0;readingTrial=null;running=false;
   controlsDisabled(false);
   s.select('.cancel-reading-test').property('hidden',true);
   if(!s.select('.reading-test').property('hidden'))s.select('.start-reading-test').text('重新进行阅读实验');
   if(message)s.select('.reading-test-prompt').text(message);
 }
 function showResults(){
   running=false;controlsDisabled(false);
   s.select('.cancel-reading-test').property('hidden',true);
   s.select('.reading-test-prompt').text('两轮已结束，比较你自己的寻找时间。');
   s.select('.reading-result').html(['random','grid'].map(key=>`<div><span>${key==='random'?'Random':'Grid'}</span><strong>${readingTimes[key]===null?'10 秒内未完成':(readingTimes[key]/1000).toFixed(2)+' s'}</strong></div>`).join('')+'<p>内容没有改变，阅读路径改变了。两次个人记录不能证明某一种布局总是更快。</p>');
 }
 function recordTrial(timedOut=false){
   if(!readingTrial)return;
   const trial=readingTrial;readingTrial=null;
   clearTimeout(timeout);timeout=0;
   readingTimes[trial.mode]=timedOut?null:Math.min(10000,performance.now()-trial.startedAt);
   if(trial.mode==='random')startRound('grid',generation);else showResults();
 }
 async function startRound(value,token){
   s.select('.reading-test-prompt').text(`第 ${value==='random'?1:2} 轮：正在排列卡片…`);
   await setMode(value);
   if(token!==generation||!running||panel?.hidden||document.hidden)return;
   // FLIP transitions have finished before the clock begins.
   readingTrial={mode:value,startedAt:performance.now()};
   s.select('.reading-test-prompt').text(`第 ${value==='random'?1:2} 轮 · ${value==='random'?'Random':'Grid'}：请尽快找到并点击“${targetLabel}”（最多 10 秒）`);
   timeout=setTimeout(()=>recordTrial(true),10000);
 }
 function startTrial(){
   cancelTrial('');running=true;
   gap=16;span=3;
   s.select('#lab-gap').property('value',gap);s.select('#lab-span').property('value',span);
   s.select('.grid-stage').style('--grid-gap',gap+'px');
   s.select('.lab-field output').text(gap+'px');
   cards.filter(d=>d.label===targetLabel).style('--span',span);
   readingTimes.random=null;readingTimes.grid=null;
   s.select('.reading-test').property('hidden',false);
   s.select('.reading-result').text('');
   s.select('.cancel-reading-test').property('hidden',false);
   controlsDisabled(true);
   s.select('.layout-canvas').node().scrollLeft=0;
   s.select('.reading-test').node().scrollIntoView({behavior:'instant',block:'start'});
   startRound('random',generation);
 }
 s.select('.start-reading-test').on('click.lab',startTrial);
 s.select('.cancel-reading-test').on('click.lab',()=>cancelTrial());
 cards.select('button').on('click.lab',function(event,d){
   if(!readingTrial)return;
   if(d.label===targetLabel)recordTrial(performance.now()-readingTrial.startedAt>=10000);
   else s.select('.reading-test-prompt').text(`继续寻找“${targetLabel}”，计时仍在进行。`);
 });
 s.selectAll('button[data-mode]').on('click.lab',function(){setMode(this.dataset.mode)});
 s.select('#lab-gap').on('input.lab',function(){gap=+this.value;change(()=>{s.select('.grid-stage').style('--grid-gap',gap+'px');s.select('.lab-field output').text(gap+'px')},false)});
 s.select('#lab-span').on('change.lab',function(){span=+this.value;change(()=>cards.filter(d=>d.label===targetLabel).style('--span',span))});
 function updateOverlay(){s.select('.grid-lines').style('visibility',s.select('#grid-overlay').property('checked')?'visible':'hidden')}
 s.select('#grid-overlay').on('change.lab',updateOverlay);
 async function handleProbe(event){
   if(event.detail?.lesson!=='62'||!['columns','gap','span'].includes(event.detail.probe))return;
   cancelTrial('');
   const token=generation,probe=event.detail.probe;
   await setMode('grid');
   if(token!==generation)return;
   if(probe==='gap') {gap=32;s.select('#lab-gap').property('value',gap);await change(()=>{s.select('.grid-stage').style('--grid-gap',gap+'px');s.select('.lab-field output').text(gap+'px')});}
   if(probe==='span') {span=6;s.select('#lab-span').property('value',span);await change(()=>cards.filter(d=>d.label===targetLabel).style('--span',span));}
   if(token!==generation)return;
   s.select('#grid-overlay').property('checked',true);updateOverlay();
   const messages={columns:'repeat(12, …) 将可用宽度平分为 12 列，卡片跨越这些列。',gap:`gap 在相邻列之间留出 ${gap}px，间距也占据可用宽度。`,span:`平均年龄跨越 ${span} 列；改变 span，会重新安排后续卡片的位置。`};
   s.select('.probe-explanation').text(messages[probe]);
   clearTimeout(flashTimer);s.selectAll('.probe-flash').classed('probe-flash',false);
   const visual=probe==='span'?cards.filter(d=>d.label===targetLabel):s.select('.grid-lines');
   void visual.node().offsetWidth;visual.classed('probe-flash',true);
   flashTimer=setTimeout(()=>visual.classed('probe-flash',false),800);
 }
 function visibilityChanged(){if(document.hidden&&running)cancelTrial('离开页面，实验已取消。')}
 const observer=new MutationObserver(()=>{if(panel.hidden&&running)cancelTrial('离开 Demo，实验已取消。')});
 if(panel)observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('visibilitychange',visibilityChanged);
 window.addEventListener('lesson-probe',handleProbe);
 code();
 return cleanupWith(()=>{
   cancelTrial('');clearTimeout(flashTimer);cards.interrupt();observer.disconnect();
   document.removeEventListener('visibilitychange',visibilityChanged);
   window.removeEventListener('lesson-probe',handleProbe);
   s.selectAll('*').on('.lab',null);
 });
}
