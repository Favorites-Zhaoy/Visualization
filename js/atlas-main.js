import { state, text, translated, watchLanguage, label, setLanguage, element, button } from './atlas-state.js?v=atlas1';
import { lessons } from './atlas-content.js?v=atlas1';
import { AtlasGallery, getSpan, themes } from './atlas-gallery.js?v=atlas1';
import { initOpening } from './atlas-opening.js?v=atlas1';

watchLanguage(() => {
  document.querySelectorAll('[data-zh]').forEach(n => n.textContent = n.dataset[state.lang]);
  document.querySelectorAll('.language-switch button').forEach(b => b.setAttribute('aria-pressed',String(b.id === `lang-${state.lang}`)));
  document.querySelector('.chapter-nav').setAttribute('aria-label',text('课程章节','Course chapters'));
});
document.querySelector('#lang-zh').onclick = () => setLanguage('zh');
document.querySelector('#lang-en').onclick = () => setLanguage('en');

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

try {
  const modules = await d3.json('data/visual-modules.json');
  const refs = [...new Set(modules.map(d => d.data_ref))];
  const entries = await Promise.all(refs.map(async ref => [ref,await (ref.endsWith('.json') ? d3.json(`data/${ref}`) : d3.csv(`data/${ref}`,row => { const date=row.date; const typed=d3.autoType(row); if(date)typed.date=date; return typed; }))]));
  const datasets = Object.fromEntries(entries);
  initOpening(modules,datasets);
  const nav = document.querySelector('.chapter-nav');
  lessons.forEach((lesson,i) => {
    const link = element('a','',nav); link.href=`#lesson${lesson.id}`; label(link,['结构','网格','构图','聚焦','重排'][i],lesson.word);
    const card = element('a','map-card',document.querySelector('#map-cards')); card.href=link.href;
    element('span','map-number',card).textContent=`0${i+1} / ${lesson.word}`;
    const title=element('h3','',card); watchLanguage(()=>title.textContent=translated(lesson.title));
    element('span','map-arrow',card).textContent='↗';
    buildLesson(lesson,modules,datasets);
  });
  const finalLink=element('a','',nav); finalLink.href='#final'; finalLink.textContent='ATLAS';
  const progress = new IntersectionObserver(entries => {
    for (const entry of entries) if(entry.isIntersecting) nav.querySelectorAll('a').forEach(a => { const active = a.hash === `#${entry.target.id}`; a.classList.toggle('active',active); if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current'); });
  },{rootMargin:'-10% 0px -65% 0px'});
  document.querySelectorAll('.lesson-section,#final').forEach(n=>progress.observe(n));
  const final = new AtlasGallery(document.querySelector('#final-gallery'),modules,datasets);
  const controls=document.querySelector('#final-controls');
  choiceBar(controls,[['all','全部','All'],...themes],'all',theme=>final.filter(theme));
  toggle(controls,'揭示布局骨架','Reveal layout anatomy',checked=>document.querySelector('#final').classList.toggle('show-anatomy',checked));
  for(const name of ['visual-modules.json',...refs]) {const a=element('a','',document.querySelector('#data-links'));a.href=`data/${name}`;a.download=name;a.textContent=name+' ↗';}
  window.addEventListener('pagehide',e=>{if(!e.persisted)progress.disconnect();});
} catch (error) {
  console.error(error);
  document.querySelector('#load-status').textContent = text('页面加载失败，请通过 HTTP 服务打开并刷新。','Loading failed. Please open through an HTTP server and refresh.');
}

function buildLesson(lesson,modules,datasets) {
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
  const copy=button(codeToolbar,'复制代码','Copy code',async()=>{try{await navigator.clipboard.writeText(lesson.code);copy.textContent=text('已复制','Copied');}catch{copy.textContent=text('请选择下方代码复制','Select the code below to copy');}});
  element('code','',element('pre','',panels[1])).textContent=lesson.code;
  const notes=element('p','code-note',panels[1]);watchLanguage(()=>notes.textContent=translated(lesson.codeNotes));
  const exp=element('p','experiment-note',panels[2]);watchLanguage(()=>exp.textContent=translated(lesson.experiment));
  const controls=element('div','lab-controls',panels[2]);
  const demo=element('div',`lab-demo lab-${lesson.id}`,panels[2]);
  if(lesson.id==='61') buildStructure(controls,demo,modules,datasets);
  if(lesson.id==='62') {
    const gallery=new AtlasGallery(demo,modules,datasets,{mode:'equal'});
    choiceBar(controls,[['scatter','散落','Scatter'],['loose','松散对齐','Loose'],['equal','等宽网格','Equal'],['editorial','12 列模块网格','12-column']],'equal',mode=>gallery.setMode(mode));
    toggle(controls,'列辅助线','Columns',checked=>gallery.shell.classList.toggle('show-columns',checked));
    toggle(controls,'基线','Baseline',checked=>gallery.shell.classList.toggle('show-baseline',checked));
    range(controls,'间距','Gap',8,40,16,value=>{gallery.shell.style.setProperty('--gallery-gap',`${value}px`);gallery.render();});
  }
  if(lesson.id==='63') {
    const inspector=element('div','priority-inspector',demo);const inspectTitle=element('strong','',inspector),inspectMeta=element('span','',inspector);
    const gallery=new AtlasGallery(demo,modules,datasets,{interaction:'inspect',onSelect:()=>update()});
    choiceBar(controls,[['equal','等宽布局','Equal grid'],['editorial','编辑式构图','Editorial']],'editorial',mode=>{gallery.setMode(mode);update();});
    const priority=choiceBar(inspector,[['1','低优先级','Low'],['2','中优先级','Medium'],['3','高优先级','High']],'3',key=>{gallery.priorities.set(gallery.selectedId,+key);gallery.render();update();});
    function update(){const d=modules.find(d=>d.id===gallery.selectedId),p=gallery.priorities.get(d.id)||d.priority;inspectTitle.textContent=d[`title_${state.lang}`];inspectMeta.textContent=text(`优先级 ${p} · ${ {wide:'横向',square:'方形',tall:'纵向'}[d.aspect]} · ${ {low:'低',medium:'中',high:'高'}[d.density]}密度 → ${gallery.mode==='equal'?3:getSpan(d,p)} 列（桌面）`,`Priority ${p} · ${d.aspect} · ${d.density} density → ${gallery.mode==='equal'?3:getSpan(d,p)} columns (desktop)`);priority.select(String(p));}
    watchLanguage(update);
  }
  if(lesson.id==='64') {
    const gallery=new AtlasGallery(demo,modules,datasets);
    button(controls,'聚焦 Storyline ↗','Focus Storyline ↗',()=>{gallery.focusedId='storyline';gallery.render();});
    button(controls,'恢复完整展厅','Restore gallery',()=>{gallery.focusedId=null;gallery.render();});
    label(element('span','control-hint',controls),'点击任一作品；再次点击即可返回。','Click any artifact; click it again to return.');
  }
  if(lesson.id==='65') {
    const viewport=element('div','studio-viewport',demo),canvas=element('div','studio-canvas',viewport);canvas.style.width='1200px';
    const gallery=new AtlasGallery(canvas,modules,datasets);
    const width=range(controls,'画布宽度','Canvas width',390,1440,1200,value=>{canvas.style.width=`${value}px`;presets.select(String(value));});
    function setWidth(value){width.value=value;width.dispatchEvent(new Event('input'));}
    const presets=choiceBar(controls,[['390','手机 390','Phone 390'],['820','平板 820','Tablet 820'],['1200','桌面 1200','Desktop 1200']],'1200',key=>setWidth(+key));
    button(controls,'切换横竖屏 ↻','Rotate device ↻',()=>setWidth(+width.value<680?844:390));
    toggle(controls,'阅读顺序','Reading order',checked=>gallery.shell.classList.toggle('show-reading',checked));
    button(controls,'聚焦 / 全览','Focus / overview',()=>{gallery.focusedId=gallery.focusedId?null:'storyline';gallery.render();});
    const path=element('p','reading-path',controls);watchLanguage(()=>path.textContent=text('桌面：精选 → 高优先级 → 关联内容 → 归档　/　手机：第 1 课 → 第 5 课','Desktop: featured → priority → context → archive / Mobile: Lesson 1 → Lesson 5'));
  }
  const takeaway=element('div','takeaway',section);element('span','',takeaway).textContent='↳';const p=element('p','',takeaway);watchLanguage(()=>p.textContent=translated(lesson.takeaway));
}

function buildStructure(controls,host,modules,datasets) {
  const diagram=element('div','structure-diagram',host);diagram.hidden=true;
  const stack=element('div','structure-stack',diagram);
  const layers=[['PAGE','页面底板',0],['SEMANTIC REGIONS','语义区域',40],['GRID','网格',80],['VISUAL ARTIFACTS','可视化作品',120],['LABELS / OVERLAY','标签与交互',160]];
  layers.forEach(([en,zh,z],i)=>{const layer=element('div',`structure-layer layer-${i}`,stack);layer.style.setProperty('--z',`${z}px`);label(element('span','layer-label',layer),`${zh} · z${z}`,`${en} · z${z}`);const interior=element('div','layer-interior',layer);for(let j=0;j<(i===1?5:15);j++)element('i','',interior).textContent=i===4?String(j+1).padStart(2,'0'):'';});
  const legend=element('div','structure-legend',diagram);label(element('p','',legend),'拖动分层模型，观察内容、网格与语义区域的关系。层间距离只用于解释，不是页面的真实深度。','Drag the layers to inspect content, grid and semantic regions. Separation explains the model; it is not physical page depth.');
  d3.select(stack).call(d3.drag().on('start',function(){this.classList.add('dragging');}).on('drag',function(event){const x=Math.max(-30,Math.min(30,(this._rx||0)+event.dx*.2));const y=Math.max(25,Math.min(65,(this._ry||48)-event.dy*.2));this._rx=x;this._ry=y;this.style.setProperty('--rotate-z',`${x}deg`);this.style.setProperty('--rotate-x',`${y}deg`);}).on('end',function(){this.classList.remove('dragging');}));
  range(legend,'旋转视角','Rotate layers',-30,30,0,v=>stack.style.setProperty('--rotate-z',`${v}deg`));
  const display=element('div','structure-page',host);
  const header=element('header','structure-region structure-mini-header',display);header.dataset.region='HEADER';label(header,'VISUAL ATLAS / 15 件作品','VISUAL ATLAS / 15 ARTIFACTS');
  const index=element('nav','structure-region structure-mini-index',display);index.dataset.region='THEME INDEX';label(index,'数据 / 流程 / 色彩 / 低维图形 / 时间','DATA / PROCESS / COLOR / LOW-DIMENSIONAL / TIME');
  const featured=element('div','structure-region structure-mini-featured',display);featured.dataset.region='FEATURED';label(featured,'本期精选：从图表到页面，注意力如何被组织？','FEATURED: From charts to pages — how is attention organized?');
  const container=element('div','structure-region',display);container.dataset.region='GALLERY';const gallery = new AtlasGallery(container,modules,datasets,{mode:'equal'});gallery.grouped=true;gallery.render(false);
  const footer=element('footer','structure-region structure-mini-footer',display);footer.dataset.region='FOOTER';label(footer,'合成教学数据 · 5 个主题','SYNTHETIC TEACHING DATA · 5 THEMES');
  choiceBar(controls,[['flat','平铺','Flat'],['structured','结构化','Structured'],['xray','透视','X-Ray'],['exploded','3D 分层','Exploded 3D']],'structured',mode=>{display.className=`structure-page ${mode}`;diagram.hidden=mode!=='exploded';display.hidden=mode==='exploded';gallery.grouped=mode!=='flat';gallery.focusedId=null;gallery.render();});
}
