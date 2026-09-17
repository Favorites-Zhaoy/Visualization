import { cleanupWith } from './lifecycle.js?v=2';
export function initChapterMap(){
  const palette=['#315f55','#a6ae67','#7d9190','#c5c6c3','#e8ed8b'];
  const cards=d3.selectAll('.knowledge-card');
  cards.each(function(d,i){
    const card=d3.select(this),svg=card.select('.card-art').append('svg').attr('viewBox','0 0 280 130').attr('role','img').attr('aria-label',d.short+'的布局变化预览');
    let played=false;
    const start=[
      [[30,35,220,65],[30,35,220,65],[30,35,220,65],[30,35,220,65]],
      [[8,35,40,55],[60,10,46,42],[120,50,50,48],[190,24,60,65]],
      [[10,10,125,50],[145,10,125,50],[10,70,125,50],[145,70,125,50]],
      [[10,10,140,110],[165,10,105,27],[165,50,25,70],[205,75,25,45]],
      [[10,12,260,18],[10,42,165,77],[185,42,85,34],[185,85,85,34]]
    ][i];
    const end=[
      [[40,65,200,50],[35,47,200,50],[30,29,200,50],[25,11,200,50]],
      [[10,25,55,80],[78,25,55,80],[146,25,55,80],[214,25,55,80]],
      [[10,10,147,60],[10,76,147,44],[163,10,107,68],[163,84,107,36]],
      [[10,10,140,110],[165,10,105,27],[165,40,25,80],[205,55,25,65]],
      [[88,5,104,17],[88,29,104,25],[88,61,104,28],[88,96,104,28]]
    ][i];
    const rects=svg.selectAll('rect').data(start).join('rect').attr('rx',2).attr('fill',(_,j)=>palette[j]).attr('stroke','#f7f7f2').attr('stroke-width',2);
    function set(selection,coords){selection.attr('x',(_,j)=>coords[j][0]).attr('y',(_,j)=>coords[j][1]).attr('width',(_,j)=>coords[j][2]).attr('height',(_,j)=>coords[j][3]);}
    set(rects,start);
    function play(){played=true;rects.interrupt();set(rects,start);set(rects.transition().duration(matchMedia('(prefers-reduced-motion: reduce)').matches?0:750).ease(d3.easeCubicInOut),end);}
    card.select('.card-preview').on('click.preview',play);
    card.on('pointerenter.preview',e=>{if(e.pointerType==='mouse'&&!played)play();});
  });
  cleanupWith(()=>{cards.on('.preview',null).selectAll('*').interrupt();cards.select('.card-preview').on('.preview',null);});
}
