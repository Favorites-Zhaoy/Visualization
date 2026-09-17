import { state } from './data.js?v=2';
import { dashboard } from './charts.js?v=2';
import { initStory } from './story.js?v=2';
import { cleanupWith } from './lifecycle.js?v=2';

export function init65() {
  const s = d3.select('#demo65');
  s.html(`<div class="responsive-studio"><div class="studio-heading"><span class="eyebrow">RESPONSIVE STUDIO</span><h3>改变空间，保留信息。</h3></div><div class="viewport-toolbar" aria-label="设备尺寸">${[['Desktop',1440],['Tablet',768],['Mobile',390]].map(([label,width])=>`<button data-width="${width}" aria-pressed="false">${label} ${width}</button>`).join('')}<span class="orientation-label">方向</span><button data-orientation="portrait" aria-pressed="false">Portrait 390 × 844</button><button data-orientation="landscape" aria-pressed="false">Landscape 844 × 390</button></div><label class="viewport-slider"><span>390</span><input type="range" min="390" max="1440" step="1" value="1440" aria-label="模拟视口宽度"><span>1440</span><output>1440 px</output></label><div class="current-rule"><span>CURRENT RULE</span><code></code><small></small></div><div class="viewport-window"><div class="viewport-chrome"><span>CAMPUSSCOPE / LIVE PREVIEW</span><span class="viewport-measure"></span></div><div class="viewport-scroll" tabindex="0" aria-label="真实尺寸预览，可横向和纵向滚动"><div class="viewport-page"><div id="responsive-dashboard"></div></div></div></div><p class="viewport-hint">画布保持真实像素宽度。超出窗口时横向滚动；布局随容器重排。</p></div><div id="layout-story"></div>`);
  const product = dashboard('#responsive-dashboard', {compact:true,xray:false});
  const page = s.select('.viewport-page'), scroll = s.select('.viewport-scroll');
  let currentHeight = null, frame = 0;
  const countTracks = node => getComputedStyle(node).gridTemplateColumns.split(/\s+/).filter(Boolean).length;
  function measure() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(()=>{
      const el = s.select('#responsive-dashboard').node();
      if (!el.clientWidth) return;
      const kpi = el.querySelector('.dashboard-kpis'), grid = el.querySelector('.dashboard-grid');
      const columns = countTracks(kpi), views = countTracks(grid);
      const rule = getComputedStyle(kpi).getPropertyValue('--studio-rule').trim().replaceAll('"','');
      s.select('.current-rule code').text(rule);
      s.select('.current-rule small').text(`实测内容宽 ${Math.round(el.clientWidth)} px · KPI ${columns} 列 · ${views === 1 ? '视图上下排列' : '视图并排'}`);
      s.select('.viewport-measure').text(`${Math.round(page.node().getBoundingClientRect().width)} × ${currentHeight || 'auto'} px`);
    });
  }
  function widthChange(value,height=null,orientation=null) {
    const width = Math.max(390,Math.min(1440,+value));
    state.viewportWidth=width;
    state.orientation=orientation || (width >= 768 ? 'landscape':'portrait');
    currentHeight=height;
    page.style('width',`${width}px`).style('height',height?`${height}px`:null).style('overflow-y',height?'auto':null);
    scroll.style('max-height',height?`${Math.min(height+24,650)}px`:null);
    s.select('input').property('value',width);
    s.select('output').text(`${width} px`);
    s.selectAll('[data-width]').attr('aria-pressed',function(){return !orientation && +this.dataset.width===width});
    s.selectAll('[data-orientation]').attr('aria-pressed',function(){return this.dataset.orientation===orientation});
    measure();
  }
  s.selectAll('[data-width]').on('click.studio',function(){widthChange(this.dataset.width)});
  s.selectAll('[data-orientation]').on('click.studio',function(){const portrait=this.dataset.orientation==='portrait';widthChange(portrait?390:844,portrait?844:390,this.dataset.orientation)});
  s.select('input').on('input.studio',function(){widthChange(this.value)});
  const ro = new ResizeObserver(measure);
  ro.observe(s.select('#responsive-dashboard').node());
  ro.observe(s.select('.dashboard-kpis').node());
  widthChange(1440);
  const story = initStory('#layout-story');
  return {destroy:cleanupWith(()=>{ro.disconnect();cancelAnimationFrame(frame);s.selectAll('button,input').on('.studio',null);product.destroy?.();story.destroy();})};
}
