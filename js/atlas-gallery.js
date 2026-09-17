import { state, text, element, label, button, watchLanguage, reduced } from './atlas-state.js?v=atlas1';
import { renderPreview } from './preview-renderers.js?v=atlas1';

export const themes = [['data','数据','Data'],['process','流程','Process'],['color','色彩','Color'],['low-dimensional','低维图形','Low-dimensional'],['time','时间','Time']];
const spanScale = d3.scaleOrdinal([1,2,3],[3,4,6]);
export function getSpan(d, priority = d.priority) { return priority === 3 && d.aspect === 'wide' ? 8 : spanScale(priority); }
export class AtlasGallery {
  constructor(host, modules, datasets, options = {}) {
    this.modules = modules; this.datasets = datasets;
    this.mode = options.mode || 'editorial'; this.focusedId = null; this.theme = 'all';
    this.priorities = new Map(); this.selectedId = 'storyline'; this.detail = 'full'; this.width = 1200;
    this.onSelect = options.onSelect; this.interaction = options.interaction || 'focus';
    this.shell = element('div','atlas-shell',host);
    this.gallery = element('div','artifact-gallery',this.shell);
    this.gallery.setAttribute('role','list');
    const overlay = element('div','column-overlay',this.shell); overlay.setAttribute('aria-hidden','true');
    for(let i=0;i<12;i++) element('i','',overlay);
    this.readout = element('p','layout-readout',host);
    this.observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      if(!width) return;
      const detail = width >= 1100 ? 'full' : width >= 680 ? 'medium' : 'compact';
      const changed = this.detail !== detail; this.width = width; this.detail = detail;
      if (changed) this.render(false); else this.updateReadout();
    });
    this.observer.observe(this.shell);
    window.addEventListener('pagehide',event => { if(!event.persisted) this.observer.disconnect(); });
    watchLanguage(() => this.render(false));
  }
  updateReadout() {
    const cols = getComputedStyle(this.gallery).gridTemplateColumns.split(' ').length;
    this.readout.textContent = text(`${Math.round(this.width)}px 容器 · ${cols} 列 · ${ {full:'完整',medium:'适中',compact:'精简'}[this.detail]}预览 · ${this.detail === 'compact' ? '教学顺序' : '编辑顺序'}`,
      `${Math.round(this.width)}px container · ${cols} columns · ${this.detail} previews · ${this.detail === 'compact' ? 'lesson order' : 'editorial order'}`);
    this.gallery.setAttribute('aria-label', text('可视化作品画廊','Visualization artifact gallery'));
  }
  render(animate = true) {
    const active = document.activeElement;
    const focusReturn = active?.closest('.artifact-expanded')?.parentElement.dataset.id;
    const before = new Map([...this.gallery.children].map(n => [n.dataset.id,n.getBoundingClientRect()]));
    let data = this.modules.filter(d => this.theme === 'all' || d.theme === this.theme);
    const field = this.detail === 'compact' || this.grouped ? 'mobile_order' : 'desktop_order';
    data.sort((a,b) => (a.id === this.focusedId ? -1 : b.id === this.focusedId ? 1 : a[field]-b[field]));
    if (!data.some(d => d.id === this.focusedId)) this.focusedId = null;
    this.gallery.className = `artifact-gallery ${this.mode} ${this.focusedId ? 'focus-mode' : ''}`;
    const cards = d3.select(this.gallery).selectAll('article.artifact-card').data(data,d => d.id).join(enter => {
      const a = enter.append('article').attr('class','artifact-card').attr('role','listitem');
      a.append('span').attr('class','reading-number');
      const b = a.append('button').attr('class','artifact-open').attr('type','button');
      const head = b.append('span').attr('class','artifact-meta'); head.append('span').attr('class','artifact-number'); head.append('span').attr('class','artifact-arrow').text('↗');
      b.append('span').attr('class','artifact-preview');
      const foot = b.append('span').attr('class','artifact-caption'); foot.append('span').attr('class','artifact-title'); foot.append('span').attr('class','artifact-summary');
      a.append('div').attr('class','artifact-expanded');
      return a;
    });
    cards.order().attr('data-id',d => d.id).attr('data-lesson',d => d.lesson)
      .attr('data-aspect',d => d.aspect).attr('data-density',d => d.density)
      .classed('is-focus',d => d.id === this.focusedId)
      .classed('is-context',d => Boolean(this.focusedId && d.id !== this.focusedId))
      .classed('is-selected',d => this.interaction === 'inspect' && d.id === this.selectedId)
      .style('--span',d => this.mode === 'equal' ? 3 : getSpan(d,this.priorities.get(d.id) || d.priority))
      .style('--tilt',(_,i) => `${(i%3-1)*4}deg`).style('--offset',(_,i) => `${i%2*18}px`);
    cards.select('.reading-number').text((d,i) => `${i+1} · L${d.lesson}`);
    cards.select('.artifact-number').text(d => `${String(d.mobile_order).padStart(2,'0')} / ${themes.find(t => t[0] === d.theme)[state.lang === 'zh' ? 1 : 2].toUpperCase()}`);
    cards.select('.artifact-title').text(d => d[`title_${state.lang}`]);
    cards.select('.artifact-summary').text(d => d[`summary_${state.lang}`]);
    cards.select('.artifact-open').attr('aria-label',d => `${d[`title_${state.lang}`]} · ${text(this.interaction === 'inspect' ? '检查空间分配' : '切换聚焦',this.interaction === 'inspect' ? 'inspect layout' : 'toggle focus')}`)
      .attr('aria-pressed',d => String(this.interaction === 'inspect' ? d.id === this.selectedId : d.id === this.focusedId))
      .on('click',(_,d) => {
        if (this.interaction === 'inspect') { this.selectedId = d.id; this.onSelect?.(d); }
        else this.focusedId = this.focusedId === d.id ? null : d.id;
        this.render();
      });
    cards.each((d,i,nodes) => {
      const node = nodes[i], focused = d.id === this.focusedId;
      const detail = this.focusedId && !focused ? 'compact' : this.detail;
      const preview = node.querySelector('.artifact-preview'), key = `${detail}:${state.lang}:${focused}`;
      if (preview.dataset.renderKey !== key) { renderPreview(preview,d,this.datasets,{detail,lang:state.lang}); preview.dataset.renderKey = key; }
      const extra = node.querySelector('.artifact-expanded'); extra.replaceChildren();
      if (focused) {
        element('span','eyebrow',extra).textContent = text(`来自第 ${d.lesson} 课 · 焦点视图`,`FROM LESSON ${d.lesson} · FOCUS VIEW`);
        element('p','',extra).textContent = d[`detail_${state.lang}`] || d[`summary_${state.lang}`];
        element('p','related',extra).textContent = text('相关概念：','Related concepts: ') + (d[`tags_${state.lang}`] || d.tags).join(' / ');
        const back = element('button','',extra); back.type = 'button'; back.textContent = text('返回展厅 ↙','Back to gallery ↙');
        back.onclick = () => { this.focusedId = null; this.render(); node.querySelector('.artifact-open').focus({preventScroll:true}); };
      }
    });
    this.gallery.style.setProperty('--context-count',Math.max(1,data.length-1));
    const groups = this.grouped && !this.focusedId ? [...d3.group(data,d=>d.lesson)] : [];
    d3.select(this.gallery).selectAll('.theme-group-label').data(groups,d=>d[0]).join('h4')
      .attr('class','theme-group-label').text(([lesson,items])=>`L${lesson} / ${themes.find(t=>t[0]===items[0].theme)[state.lang==='zh'?1:2]}`)
      .each((group,i,nodes)=>this.gallery.insertBefore(nodes[i],this.gallery.querySelector(`[data-id="${group[1][0].id}"]`)));
    this.gallery.classList.toggle('grouped',Boolean(this.grouped && !this.focusedId));
    if (animate && !reduced()) {
      cards.each(function(d) {
        const old = before.get(d.id), next = this.getBoundingClientRect();
        if (old) { this.getAnimations().forEach(a => a.cancel()); this.animate([{transform:`translate(${old.left-next.left}px,${old.top-next.top}px)`},{transform:'translate(0,0)'}],{duration:580,easing:'cubic-bezier(.2,.7,.2,1)'}); }
      });
    }
    this.updateReadout();
    if(focusReturn) this.gallery.querySelector(`[data-id="${focusReturn}"] .artifact-expanded button`)?.focus({preventScroll:true});
  }
  setMode(mode) { this.mode = mode; this.focusedId = null; this.render(); }
  filter(theme) { this.theme = theme; this.focusedId = null; this.render(); }
}
