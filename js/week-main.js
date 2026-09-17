import {state,text,translated,watchLanguage,label,setLanguage,element,button} from './week-state.js?v=week2';
import {loadWeekData} from './week-data.js?v=week2';
import {WeekView} from './week-views.js?v=week2';
import {lessons} from './week-content.js?v=week2';
import {initOpening} from './week-opening.js?v=week2';

function choiceBar(host, choices, value, onChange) {
  const group = element('div','segmented',host);
  const buttons = choices.map(([key,zh,en]) => { const b = button(group,zh,en,() => { select(key); onChange(key); }); b.dataset.value=key; return b; });
  function select(key) { buttons.forEach(b => b.setAttribute('aria-pressed',String(b.dataset.value === key))); }
  select(value); return {group,select};
}
function toggle(host,zh,en,callback) {
  const l = element('label','check-control',host), i = element('input','',l); i.type = 'checkbox'; label(element('span','',l),zh,en); i.onchange = () => callback(i.checked); return i;
}
function range(host,zh,en,min,max,value,callback) {
  const l = element('label','range-control',host); label(element('span','',l),zh,en);
  const input = element('input','',l); input.type='range'; input.min=min; input.max=max; input.value=value;
  const output = element('output','',l); output.textContent=value;
  input.oninput=()=> { output.textContent=input.value; callback(+input.value); }; return input;
}

function buildLesson(lesson,data,snippets) {
  const section=element('section','lesson-section section-wrap',document.querySelector('#lessons')); section.id=`lesson${lesson.id}`;
  const heading=element('header','lesson-heading',section);
  element('span','lesson-number',heading).textContent=`6.${lesson.id[1]}`;
  const titleWrap=element('div','lesson-title',heading); element('span','eyebrow',titleWrap).textContent=lesson.word;
  const title=element('h2','',titleWrap),intro=element('p','',heading);watchLanguage(()=>{title.textContent=translated(lesson.title);intro.textContent=translated(lesson.intro);});
  const question=element('p','lesson-question',section);watchLanguage(()=>question.textContent=translated(lesson.question));
  const tabs=element('div','lesson-tabs',section);tabs.setAttribute('role','tablist');watchLanguage(()=>tabs.setAttribute('aria-label',translated(lesson.title)));
  const panels=[]; const tabButtons=[];
  [['explain','讲解','Explanation'],['code','关键代码','Key code'],['demo','Demo','Demo']].forEach(([key,zh,en],i)=>{
    const b=button(tabs,zh,en,()=>activate(i));b.id=`tab-${lesson.id}-${key}`;b.setAttribute('role','tab');b.setAttribute('aria-controls',`panel-${lesson.id}-${key}`);tabButtons.push(b);
    const panel=element('div',`lesson-panel ${key}-panel`,section);panel.id=`panel-${lesson.id}-${key}`;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',b.id);panels.push(panel);
    b.onkeydown=e=>{let index=i;if(e.key==='ArrowRight')index=(i+1)%3;else if(e.key==='ArrowLeft')index=(i+2)%3;else if(e.key==='Home')index=0;else if(e.key==='End')index=2;else return;e.preventDefault();activate(index);tabButtons[index].focus();};
  });
  function activate(index){tabButtons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});}
  activate(2);
  const examples=element('div','example-grid',panels[0]);
  lesson.examples.forEach((ex,i)=>{const article=element('article','example',examples);element('span','eyebrow',article).textContent=`0${i+1}`;const h=element('h3','',article),p=element('p','',article);watchLanguage(()=>{h.textContent=translated(ex.title);p.textContent=translated(ex.text);});});
  const codeToolbar=element('div','code-toolbar',panels[1]);label(element('span','',codeToolbar),'D3 决策 → CSS 排版','D3 decisions → CSS layout');
  const copy=button(codeToolbar,'复制代码','Copy code',async()=>{try{await navigator.clipboard.writeText(snippets[lesson.id]);copy.textContent=text('已复制','Copied');}catch{copy.textContent=text('请选择下方代码复制','Select the code below to copy');}});
  element('code','',element('pre','',panels[1])).textContent=snippets[lesson.id];
  const sourceLink=element('a','source-link',panels[1]);sourceLink.href=lesson.snippet.file;label(sourceLink,'查看正在运行的源文件 ↗','View the running source file ↗');
  const notes=element('p','code-note',panels[1]);watchLanguage(()=>notes.textContent=translated(lesson.codeNotes));
  const exp=element('p','experiment-note',panels[2]);watchLanguage(()=>exp.textContent=translated(lesson.experiment));
  const controls=element('div','lab-controls',panels[2]);
  const demo=element('div',`lab-demo lab-${lesson.id}`,panels[2]);
  if(lesson.id==='61') buildStructure(controls,demo,data);
  if(lesson.id==='62'){
    const view=new WeekView(demo,data);
    choiceBar(controls,[['list','课程列表','List'],['grid','时间网格','Time grid']],'grid',mode=>view.update({chartMode:mode}));
    toggle(controls,'可视化网格（7 天 × 11 节）','Visualization grid (7 days × 11 periods)',checked=>view.update({showVizGrid:checked}));
    toggle(controls,'页面网格（CSS 列）','Page grid (CSS columns)',checked=>view.update({showPageGrid:checked}));
  }
  if(lesson.id==='63'){
    const prompt=element('p','question-prompt',controls);label(prompt,'你现在想知道什么？','What do you want to know?');
    const view=new WeekView(demo,data,{onChange:s=>choices.select(s.questionMode)});
    const choices=choiceBar(controls,[['week','这周整体怎么安排？','The whole week'],['day','周四上什么？','What is on Thursday?'],['course','可视化导论在哪几天？','When is Visualization?']],'week',mode=>view.question(mode));
  }
  if(lesson.id==='64'){
    const view=new WeekView(demo,data);
    button(controls,'选择周四','Select Thursday',()=>view.question('day'));
    button(controls,'选择可视化导论','Select Visualization',()=>view.question('course'));
    button(controls,'返回整周 · Esc','Full week · Esc',()=>view.dispatch.call('clearFocus'));
    label(element('span','control-hint',controls),'也可以点击图中的日期或课程。','Or select a day or course in the views.');
  }
  if(lesson.id==='65'){
    const viewport=element('div','studio-viewport',demo),canvas=element('div','week-studio-canvas',viewport);canvas.style.width='1440px';
    const view=new WeekView(canvas,data,{questionMode:'day',balanced:true});
    const slider=range(controls,'画布宽度','Canvas width',320,1440,1440,value=>{canvas.style.width=`${value}px`;presets.select(String(value));});
    const setWidth=value=>{slider.value=value;slider.dispatchEvent(new Event('input'));};
    const presets=choiceBar(controls,[['1440','桌面 1440','Desktop 1440'],['768','平板 768','Tablet 768'],['390','手机 390','Mobile 390']],'1440',key=>setWidth(+key));
    button(controls,'横竖屏 ↻','Rotate ↻',()=>setWidth(+slider.value<680?844:390));
    toggle(controls,'阅读顺序','Reading order',checked=>view.shell.classList.toggle('show-reading',checked));
    label(element('p','reading-path',controls),'窄屏先看选中日与当日课程；整周仍可展开并局部横向滚动。','Narrow screens start with the selected day and its classes. Expand the full week to scroll it locally.');
  }
  const takeaway=element('div','takeaway',section);element('span','',takeaway).textContent='↳';const p=element('p','',takeaway);watchLanguage(()=>p.textContent=translated(lesson.takeaway));
}

function buildStructure(controls,host,data){
  const normal=element('div','structure-example',host),view=new WeekView(normal,data);
  const diagram=element('div','structure-diagram',host);diagram.hidden=true;
  const stack=element('div','structure-stack',diagram);
  const layers=[['PAGE','页面'],['SEMANTIC REGIONS','语义区域'],['PAGE GRID','页面网格'],['VISUALIZATIONS','可视化内容'],['LABELS / INTERACTION','标签与交互']];
  layers.forEach(([en,zh],i)=>{const layer=element('div',`structure-layer layer-${i}`,stack);layer.style.setProperty('--z',`${i*40}px`);const name=element('span','layer-label',layer);label(name,zh,en);element('small','layer-parameter',layer).textContent=`z = ${i*40}`;const interior=element('div','layer-interior',layer);['HEADER','FOCUS','WEEK','LOAD','COURSES'].forEach(key=>element('i','',interior).textContent=i===4?key:'');});
  const legend=element('div','structure-legend',diagram);label(element('p','',legend),'先分清页面、区域、网格、图表与交互层。拖动模型，观察它们如何叠合。','Separate page, regions, grid, charts and interactions. Drag the model to inspect how they fit together.');
  toggle(legend,'显示结构参数','Show structure parameters',checked=>diagram.classList.toggle('show-parameters',checked));
  range(legend,'旋转','Rotation',-30,30,0,value=>stack.style.setProperty('--rotate-z',`${value}deg`));
  d3.select(stack).call(d3.drag().on('drag',function(e){this._angle=Math.max(-30,Math.min(30,(this._angle||0)+e.dx*.2));this.style.setProperty('--rotate-z',`${this._angle}deg`);}));
  choiceBar(controls,[['raw','传统课表','Raw timetable'],['page','信息页面','Information page'],['xray','透视','X-Ray'],['exploded','3D 分层','Exploded 3D']],'page',mode=>{normal.hidden=mode==='exploded';diagram.hidden=mode!=='exploded';view.shell.classList.toggle('raw-timetable',mode==='raw');view.shell.classList.toggle('show-anatomy',mode==='xray');view.render();});
}

watchLanguage(()=>{
  document.querySelectorAll('[data-zh]').forEach(n=>n.textContent=n.dataset[state.lang]);
  document.querySelectorAll('.language-switch button').forEach(b=>b.setAttribute('aria-pressed',String(b.id===`lang-${state.lang}`)));
  document.querySelector('.chapter-nav').setAttribute('aria-label',text('课程章节','Course chapters'));
});
document.querySelector('#lang-zh').onclick=()=>setLanguage('zh');
document.querySelector('#lang-en').onclick=()=>setLanguage('en');

try{
  const data=await loadWeekData();
  const sourceCache=new Map();
  const snippets=Object.fromEntries(await Promise.all(lessons.map(async lesson=>{
    const {file,region}=lesson.snippet;
    if(!sourceCache.has(file))sourceCache.set(file,fetch(`${file}?v=week2`).then(r=>{if(!r.ok)throw new Error(`Source ${r.status}: ${file}`);return r.text();}));
    const source=await sourceCache.get(file),start=source.indexOf(`// #region snippet:${region}`);
    if(start<0)throw new Error(`Missing snippet ${region}`);
    const body=source.slice(source.indexOf('\n',start)+1,source.indexOf('// #endregion',start));
    const lines=body.trimEnd().split('\n'),indent=Math.min(...lines.filter(l=>l.trim()).map(l=>l.match(/^\s*/)[0].length));
    return[lesson.id,lines.map(l=>l.slice(indent)).join('\n')];
  })));
  const final=new WeekView(document.querySelector('#final-app'),data,{product:true,questionMode:'day',balanced:true});
  document.querySelector('#anatomy-toggle').onclick=e=>{const on=!final.shell.classList.contains('show-anatomy');final.shell.classList.toggle('show-anatomy',on);e.currentTarget.setAttribute('aria-pressed',String(on));};
  initOpening(data);
  const nav=document.querySelector('.chapter-nav');
  lessons.forEach((lesson,i)=>{
    const a=element('a','',nav);a.href=`#lesson${lesson.id}`;element('i','',a);label(element('span','',a),['结构','位置','层级','聚焦','重排'][i],lesson.word);
    const card=element('a','map-card',document.querySelector('#map-cards'));card.href=a.href;
    const art=element('div','map-art',card),svg=d3.select(art).append('svg').attr('viewBox','0 0 210 120').attr('aria-hidden','true');
    if(i===4){svg.append('rect').attr('x',75).attr('y',5).attr('width',60).attr('height',108).attr('rx',7).attr('fill','#fff').attr('stroke','#315f55');[20,48,69,89].forEach((y,j)=>svg.append('rect').attr('x',83).attr('y',y).attr('width',44).attr('height',j?13:20).attr('fill',j?'#d4dfcc':'#315f55'));}
    else{svg.append('rect').attr('x',10).attr('y',10).attr('width',190).attr('height',100).attr('fill','#fff').attr('stroke','#acbaab');
      if(i===1){for(let x=0;x<7;x++)for(let y=0;y<5;y++)svg.append('rect').attr('x',18+x*25).attr('y',18+y*17).attr('width',21).attr('height',13).attr('fill',(x+y)%4===0?'#315f55':'#e5ebdd');}
      else {const items=i===0?[[18,18,174,14],[18,39,54,62],[79,39,113,34],[79,80,53,21],[139,80,53,21]]:i===2?[[18,18,112,83],[137,18,55,37],[137,62,55,39]]:[[18,18,174,15],[18,41,54,60],[79,41,113,60]];
        svg.selectAll('rect.region').data(items).join('rect').attr('class','region').attr('x',d=>d[0]).attr('y',d=>d[1]).attr('width',d=>d[2]).attr('height',d=>d[3]).attr('fill',(_,j)=>j===0?'#315f55':j===1?'#d7ed61':'#dfe6d7');}}
    element('span','map-number',card).textContent=`6.${i+1} / ${lesson.word}`;
    const h=element('h3','',card);watchLanguage(()=>h.textContent=translated(lesson.title));element('span','map-arrow',card).textContent='↗';
    buildLesson(lesson,data,snippets);
  });
  const finalLink=element('a','',nav);finalLink.href='#final';element('i','',finalLink);element('span','',finalLink).textContent='MY WEEK';
  watchLanguage(()=>{
    document.querySelector('#hero-facts').textContent=text(`${data.totals.sessions} 次上课 · ${data.totals.courses} 门课程 · ${data.totals.periods} 节课`,`${data.totals.sessions} CLASS SESSIONS · ${data.totals.courses} COURSES · ${data.totals.periods} PERIODS`);
    document.querySelector('#final-dates').textContent=text(`${data.meta.academic_year} 秋季 · 第 ${data.meta.week_number} 周`,`${data.meta.academic_year} Fall · Week ${data.meta.week_number}`);
    document.querySelector('#source-note').textContent=data.meta[`source_note_${state.lang}`];
  });
  const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)nav.querySelectorAll('a').forEach(a=>{const active=a.hash===`#${e.target.id}`;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-10% 0px -65% 0px'});
  document.querySelectorAll('.lesson-section,#final').forEach(n=>observer.observe(n));
  document.querySelector('#load-status').textContent='';
  window.addEventListener('pagehide',e=>{if(!e.persisted)observer.disconnect();});
}catch(error){console.error(error);document.querySelector('#load-status').textContent=text('加载失败，请通过 HTTP 服务打开后刷新。','Loading failed. Please open through an HTTP server and refresh.');}
