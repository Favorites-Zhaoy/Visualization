import { renderPreview } from './preview-renderers.js?v=atlas1';
import { state, text, watchLanguage, reduced } from './atlas-state.js?v=atlas1';

const stages = [
  ['fragments', 'FRAGMENTS', '教材中的知识，成为 15 件各不相同的可视化作品。', 'Ideas from the book become 15 distinct visual artifacts.'],
  ['chaos', 'CONTENT', '内容已经存在，但还没有形成一张好读的页面。', 'The content exists. A readable page does not—yet.'],
  ['structure', 'STRUCTURE', '先按五个主题分组，让相邻关系表达内容关系。', 'Group five themes. Proximity begins to communicate relationships.'],
  ['align', 'ALIGN', '吸附到网格：共同的边界，让视线有路可循。', 'Snap to a grid. Shared edges give the eye a path.'],
  ['compose', 'COMPOSE', '重要作品获得更多空间，页面开始拥有主次。', 'Give important artifacts more space. A hierarchy emerges.'],
  ['focus', 'FOCUS', '故事线成为焦点，其余作品仍在视野之中。', 'Storyline becomes the focus. The other artifacts stay in context.'],
  ['reflow', 'REFLOW', '屏幕变窄，内容按教学顺序重新排列。', 'A narrower screen invites a new, lesson-by-lesson reading order.']
];

export function initOpening(modules, datasets) {
  const host = document.querySelector('#opening-artifacts');
  if (!host) return () => {};
  const book = document.querySelector('.book-display .book');
  const play = document.querySelector('#opening-play');
  const skip = document.querySelector('#opening-skip');
  const word = document.querySelector('#opening-word');
  const count = document.querySelector('#opening-count');
  const caption = document.querySelector('#opening-caption');
  let index = -1, running = false, played = false, token = 0;
  const timers = new Set();
  const cards = d3.select(host).selectAll('.opening-artifact').data([...modules].sort((a,b) => a.mobile_order-b.mobile_order), d => d.id)
    .join(enter => {
      const card=enter.append('div').attr('class','opening-artifact');
      card.append('div').attr('class','opening-glyph');
      card.append('span').attr('class','opening-artifact-label');
      return card;
    }).attr('data-id',d=>d.id).attr('data-theme',d=>d.theme).attr('data-lesson',d=>d.lesson)
    .classed('opening-featured',d=>d.priority===3).classed('opening-storyline',d=>d.preview_type==='storyline')
    .style('--artifact-tilt',(_,i)=>`${((i*17)%13)-6}deg`)
    .style('--artifact-shift',(_,i)=>`${((i*19)%31)-15}px`);
  host.dataset.stage='rest';
  function translate() {
    cards.each(function(d) {
      renderPreview(this.querySelector('.opening-glyph'),d,datasets,{detail:'compact',lang:state.lang});
      this.querySelector('.opening-artifact-label').textContent=`${String(d.mobile_order).padStart(2,'0')} / ${d[`title_${state.lang}`]}`;
    });
    if(word) word.textContent=index<0?'FROM VISUALIZATION TO PAGE':stages[index][1];
    if(count) count.textContent=text('15 件作品 / 5 个主题 / 1 张页面','15 ARTIFACTS / 5 THEMES / ONE PAGE');
    if(caption) caption.textContent=index<0?text('翻开教材，看不同的可视化如何组成一张页面。','Open the book. See different visualizations become one coherent page.'):text(stages[index][2],stages[index][3]);
    if(play) play.textContent=running?text('从头播放 ↺','Restart ↺'):played?text('重播开场 ↺','Replay opening ↺'):text('翻开这一章 →','Open this chapter →');
    if(skip) skip.textContent=text('开始探索 ↓','Explore the lessons ↓');
    host.setAttribute('aria-label',text('十五件可视化作品的页面布局演变','Page layout transformations of fifteen visual artifacts'));
  }
  function cancel() {
    token++;
    timers.forEach(clearTimeout); timers.clear();
    cards.nodes().forEach(node=>node.getAnimations().forEach(animation=>animation.cancel()));
    running=false;
  }
  function show(next, animate=true) {
    const before=new Map(cards.nodes().map(node=>[node.dataset.id,node.getBoundingClientRect()]));
    index=next; host.dataset.stage=stages[next][0];
    book?.classList.add('is-open');
    cards.sort((a,b)=>next===5 ? (a.preview_type==='storyline'?-1:b.preview_type==='storyline'?1:a.mobile_order-b.mobile_order) : a.mobile_order-b.mobile_order);
    if(animate&&!reduced()) cards.each(function(d) {
      const old=before.get(d.id), now=this.getBoundingClientRect();
      if(!old||!now.width||!now.height) return;
      this.animate([{transform:`translate(${old.left-now.left}px,${old.top-now.top}px) scale(${old.width/now.width},${old.height/now.height})`},{transform:'none'}],{duration:650,easing:'cubic-bezier(.22,.65,.2,1)'});
    });
    translate();
  }
  function schedule(fn, delay) {
    const current=token;
    const timer=setTimeout(()=>{timers.delete(timer);if(current===token)fn();},delay);
    timers.add(timer);
  }
  function start() {
    cancel(); played=true;
    if(reduced()) {show(6,false);return;}
    running=true; show(0);
    for(let n=1;n<stages.length;n++) schedule(()=>show(n),n*1350);
    schedule(()=>{running=false;translate();},stages.length*1350);
  }
  function finish() {
    cancel();played=true;show(6,false);
    document.querySelector('#chapter-map')?.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});
  }
  play?.addEventListener('click',start);
  skip?.addEventListener('click',finish);
  const stopLanguage=watchLanguage(translate);
  const dispose=()=>{cancel();stopLanguage();play?.removeEventListener('click',start);skip?.removeEventListener('click',finish);};
  window.addEventListener('pagehide',event=>{if(!event.persisted)dispose();},{once:true});
  return dispose;
}
