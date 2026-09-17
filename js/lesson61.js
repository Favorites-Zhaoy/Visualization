import { state } from './data.js?v=3';
import { drawKpis, treemap } from './charts.js?v=3';
import { cleanupWith } from './lifecycle.js?v=3';
export function init61() {
 const host=d3.select('#demo61');
 host.html(`<div class="toolbar layer-modes"><button data-layer-mode="normal" aria-pressed="true">Normal</button><button data-layer-mode="xray" aria-pressed="false">X-Ray</button><button data-layer-mode="exploded" aria-pressed="false">Exploded 3D</button><label class="slider-label">区域内边距 <input id="padding-slider" type="range" min="8" max="32" value="16" aria-label="区域内边距"><output>16px</output></label></div><div id="skeleton-root"><div class="skeleton"><header class="skeleton-header" data-region="Header"><b>CampusScope / 2026</b><span>新生观察站</span></header><div class="skeleton-kpis" data-region="KPI"></div><div class="skeleton-middle"><div class="skeleton-main" data-region="Main"><h4>班级规模 / 整体</h4><div id="skeleton-tree"></div></div><div class="skeleton-detail" data-region="Detail"><h4>学生详情 / 局部</h4><strong>${state.students.length}</strong><p>名新生，${new Set(state.students.map(d=>d.province)).size} 个省份。<br>从整体，进入具体班级。</p></div></div><div class="skeleton-support" data-region="Supporting"><span>年龄分布</span><div></div></div></div><div class="readout" id="skeleton-readout" role="status" aria-live="polite" hidden>选择区域查看真实尺寸。</div></div><div class="exploded-lab" hidden><label class="param-toggle"><input type="checkbox" id="show-layer-params"> 显示结构参数</label><div class="exploded-scene" aria-label="网页五个视觉层级，可使用下方按钮旋转"><div class="exploded-stack"></div></div><div class="toolbar rotation-controls"><button data-rotate="left" aria-label="向左旋转五度">← 左旋</button><button data-rotate="right" aria-label="向右旋转五度">右旋 →</button><button data-rotate="up" aria-label="向上旋转五度">↑ 上旋</button><button data-rotate="down" aria-label="向下旋转五度">↓ 下旋</button><button data-rotate="reset">Reset View</button><output class="rotation-value">X −18° / Y −24°</output></div><p class="lab-caption">拖动展开的页面，观察：网格 → 区域 → 图形 → 标签 → 浮层。</p></div>`);
 drawKpis(host.select('.skeleton-kpis').node());
 const tree=treemap('#skeleton-tree',{height:180});
 const bins=d3.rollups(state.students,r=>r.length,d=>d.age).sort((a,b)=>a[0]-b[0]);
 host.select('.skeleton-support>div').selectAll('i').data(bins).join('i').style('height',d=>d[1]/d3.max(bins,x=>x[1])*100+'%').attr('title',d=>`${d[0]}岁：${d[1]}人`);
 const layers=[{z:0,label:'PAGE',body:'<div class="layer-grid"></div>'},{z:40,label:'REGIONS',body:'<div class="layer-regions"><i></i><i></i><i></i><i></i></div>'},{z:80,label:'VISUALIZATION',body:'<div class="layer-viz"><i></i><i></i><i></i><i></i></div>'},{z:120,label:'LABELS',body:'<div class="layer-labels"><b>CampusScope</b><span>80 位新生</span><span>班级规模 ↗</span></div>'},{z:160,label:'OVERLAY',body:'<div class="layer-tooltip">软件工程1班<br><b>26 人</b></div>'}];
 host.select('.exploded-stack').selectAll('.exploded-layer').data(layers,d=>d.z).join('div').attr('class','exploded-layer').style('--z',d=>d.z+'px').html(d=>`<span class="layer-name">${d.label} <small>z=${d.z}</small></span>${d.body}`);
 let mode='normal',current=null,rx=-18,ry=-24;
 const root=host.select('#skeleton-root'),readout=host.select('#skeleton-readout');
 const duties={Header:'建立页面身份与入口。',KPI:'先了解整体规模。',Main:'承担整体观察。',Detail:'承接局部细节。',Supporting:'补充年龄分布。'};
 let flashTimer=0;
 host.append('p').attr('class','probe-explanation').attr('role','status');
 function measure(){
  if(mode!=='xray'||!current)return;
  const bounds=current.getBoundingClientRect(),style=getComputedStyle(current);
  if(readout.select('strong').empty())readout.html('<strong></strong><span class="region-size"></span><p class="region-duty"></p><details><summary>查看视口坐标</summary><span class="region-coordinates"></span></details>');
  readout.select('strong').text(current.dataset.region.toUpperCase()+' VIEW');
  readout.select('.region-size').text(`${Math.round(bounds.width)} × ${Math.round(bounds.height)} · padding ${style.padding}`);
  readout.select('.region-duty').text(duties[current.dataset.region]);
  readout.select('.region-coordinates').text(`x ${Math.round(bounds.x)} · y ${Math.round(bounds.y)} · width ${Math.round(bounds.width)} · height ${Math.round(bounds.height)}（px）`);

 }
 function setMode(value){
  mode=value;
  host.selectAll('[data-layer-mode]').attr('aria-pressed',function(){return this.dataset.layerMode===mode});
  root.property('hidden',mode==='exploded').classed('xray-on',mode==='xray');
  readout.property('hidden',mode!=='xray');
  host.select('.exploded-lab').property('hidden',mode!=='exploded');
  host.selectAll('[data-region]').attr('tabindex',mode==='xray'?0:null);
  current||=host.select('[data-region="Main"]').node();
  measure();
 }
 function handleProbe(event){
  if(event.detail?.lesson!=='61')return;
  const layers=event.detail.probe==='layers';
  if(!layers&&event.detail.probe!=='bounds')return;
  if(!layers)current=host.select('[data-region="Main"]').node();
  setMode(layers?'exploded':'xray');
  host.select('.probe-explanation').text(layers?'translateZ() 将网页的五层结构沿深度分开，内容身份不变。':'getBoundingClientRect() 读取当前区域的真实尺寸；调整内边距，再观察主视图。');
  clearTimeout(flashTimer);
  host.selectAll('.probe-flash').classed('probe-flash',false);
  const target=host.select(layers?'.exploded-stack':'.skeleton-main');
  void target.node().offsetWidth;
  target.classed('probe-flash',true);
  flashTimer=setTimeout(()=>target.classed('probe-flash',false),800);
 }
 window.addEventListener('lesson-probe',handleProbe);
 host.select('#show-layer-params').on('change.layer',function(){host.classed('show-layer-params',this.checked)});
 host.selectAll('[data-region]').on('click.layer focus.layer',function(){current=this;measure()});
 host.selectAll('[data-layer-mode]').on('click.layer',function(){setMode(this.dataset.layerMode)});
 host.select('#padding-slider').on('input.layer',function(){host.select('.skeleton').style('--region-pad',this.value+'px');host.select('.slider-label output').text(this.value+'px');measure()});
 function rotate(){rx=Math.max(-25,Math.min(25,rx));ry=Math.max(-35,Math.min(35,ry));host.select('.exploded-stack').style('transform',`rotateX(${rx}deg) rotateY(${ry}deg)`);host.select('.rotation-value').text(`X ${Math.round(rx)}° / Y ${Math.round(ry)}°`)}
 host.select('.exploded-scene').call(d3.drag().on('drag.layer',e=>{rx-=e.dy*.22;ry+=e.dx*.22;rotate()}));
 host.selectAll('[data-rotate]').on('click.layer',function(){const action=this.dataset.rotate;if(action==='reset'){rx=-18;ry=-24}else if(action==='left')ry-=5;else if(action==='right')ry+=5;else if(action==='up')rx-=5;else rx+=5;rotate()});rotate();
 const ro=new ResizeObserver(measure);ro.observe(root.node());window.addEventListener('scroll',measure,{passive:true});
 return cleanupWith(()=>{ro.disconnect();clearTimeout(flashTimer);window.removeEventListener('lesson-probe',handleProbe);window.removeEventListener('scroll',measure);tree.destroy();host.selectAll('*').on('.layer',null);host.select('.exploded-scene').on('.drag',null)});
}
