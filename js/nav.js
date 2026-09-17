import { cleanupWith } from './lifecycle.js?v=2';
export function initNav() {
  const nav=document.querySelector('#chapter-nav'), links=[...nav.querySelectorAll('a')];
  const sections=links.map(a=>document.querySelector(a.hash));
  const toggle=document.querySelector('.mobile-progress');
  let frame=0;
  function update(){
    frame=0;let index=-1;
    sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<=Math.min(230,innerHeight*.3))index=i;});
    links.forEach((a,i)=>{a.classList.toggle('active',i===index);if(i===index)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    nav.querySelector('.nav-line>span').style.width=Math.max(0,index/(links.length-1)*100)+'%';
    toggle.querySelector('b').textContent=index<0?'06 / LESSON':index===5?'FINAL / CAMPUSSCOPE':`6.${index+1} / LESSON`;
    toggle.querySelector('small').textContent=index<0?'网页页面布局':links[index].textContent;
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  function close(){nav.classList.remove('expanded');toggle.setAttribute('aria-expanded','false');toggle.querySelector('.menu-sign').textContent='＋';}
  function expand(){const on=toggle.getAttribute('aria-expanded')!=='true';nav.classList.toggle('expanded',on);toggle.setAttribute('aria-expanded',on);toggle.querySelector('.menu-sign').textContent=on?'−':'＋';}
  toggle.addEventListener('click',expand);nav.addEventListener('click',close);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);update();
  cleanupWith(()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);toggle.removeEventListener('click',expand);nav.removeEventListener('click',close);});
}
