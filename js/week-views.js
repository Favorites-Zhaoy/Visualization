import {state as language, text, watchLanguage, element, reduced} from './week-state.js?v=week2';
import {renderSchedule,renderDailyLoad,renderCourseSummary} from './week-charts.js?v=week2';
import {periodsOf} from './week-data.js?v=week2';

let sequence=0;
export function applyPageComposition(page,blocks,mode,detail) {
  // #region snippet:composition
  const order = detail === 'compact'
    ? ['focus','header','overview','load','courses','source']
    : mode === 'week'
      ? ['header','overview','focus','load','courses','source']
      : ['header','focus','overview','load','courses','source'];
  page.dataset.question = mode;
  // Reorder the existing nodes, preserving chart and keyboard identity.
  order.forEach((key,index) => {
    if(page.children[index] !== blocks[key]) page.insertBefore(blocks[key],page.children[index] || null);
  });
  // CSS Grid assigns widths; the reading task determines the composition.
  // #endregion
}

export class WeekView {
  constructor(host,data,options={}) {
    this.data=data;this.options=options;this.id=`week-${++sequence}`;
    this.state={questionMode:options.questionMode||'week',selectedDate:data.meta.default_focus_date,selectedCourse:null,detailLevel:'full',containerWidth:1200,chartMode:'grid',showVizGrid:false,showPageGrid:false};
    this.shell=element('div','week-shell',host);
    this.page=element('div',`week-page ${options.balanced?'balanced':''}`,this.shell);
    this.blocks={};
    // #region snippet:structure
    const regions = [
      ['header','header','WEEK HEADER'],
      ['focus','section','FOCUS DAY'],
      ['overview','section','WEEK OVERVIEW'],
      ['load','section','LOAD BY DAY'],
      ['courses','section','COURSE SUMMARY'],
      ['source','footer','SOURCE']
    ];
    for (const [key,tag,name] of regions) {
      const region = element(tag,`week-region week-${key}`,this.page);
      region.dataset.layoutBlock=key;
      region.dataset.anatomy=name;
      this.blocks[key]=region;
    }
    // #endregion
    this.build();
    this.overlay=element('div','week-column-overlay',this.shell);this.overlay.setAttribute('aria-hidden','true');
    for(let i=0;i<12;i++)element('i','',this.overlay);
    this.dispatch=d3.dispatch('selectDate','selectCourse','clearFocus');
    this.dispatch.on('selectDate.views',date=>this.update({selectedDate:date,selectedCourse:null,questionMode:'day'}));
    this.dispatch.on('selectCourse.views',id=>this.update({selectedCourse:id,questionMode:'course'}));
    this.dispatch.on('clearFocus.views',()=>this.update({selectedCourse:null,questionMode:'week'}));
    this.keyTarget=host.closest('.demo-panel')||this.shell;
    this.onEscape=e=>{if(e.key==='Escape'){e.preventDefault();this.dispatch.call('clearFocus');}};
    this.keyTarget.addEventListener('keydown',this.onEscape);
    this.stopLanguage=watchLanguage(()=>this.render(false));
    // #region snippet:responsive
    this.observer=new ResizeObserver(entries=>{
      const width=entries[0].contentRect.width;
      if(!width)return;
      const detail=width<680?'compact':width<1100?'medium':'full';
      const changed=detail!==this.state.detailLevel;
      this.state.containerWidth=width;
      this.state.detailLevel=detail;
      if(changed)this.render(false);else this.updateReadout();
    });
    this.observer.observe(this.shell);
    // #endregion
    window.addEventListener('pagehide',e=>{if(!e.persisted){this.observer.disconnect();this.stopLanguage();this.keyTarget.removeEventListener('keydown',this.onEscape);}});
  }
  build() {
    const b=this.blocks;
    this.weekMeta=element('p','week-meta',b.header);this.weekTotals=element('p','week-totals',b.header);
    this.focusEyebrow=element('p','eyebrow',b.focus);
    this.focusTitle=element('h3','focus-title',b.focus);this.focusTitle.id=`${this.id}-focus-title`;b.focus.setAttribute('aria-labelledby',this.focusTitle.id);
    this.focusSub=element('p','focus-subtitle',b.focus);
    this.dayPicker=element('div','day-picker',b.focus);
    d3.select(this.dayPicker).selectAll('button').data(this.data.days,d=>d.date).join('button').attr('type','button').attr('data-date',d=>d.date).on('click',(_,d)=>this.dispatch.call('selectDate',null,d.date));
    this.focusSessions=element('div','focus-sessions',b.focus);
    this.focusStatus=element('p','focus-status',b.focus);this.focusStatus.setAttribute('aria-live','polite');this.focusStatus.setAttribute('role','status');
    this.clear=element('button','clear-focus',b.focus);this.clear.type='button';this.clear.onclick=()=>this.dispatch.call('clearFocus');
    this.overviewHeading=element('div','region-heading',b.overview);this.overviewTitle=element('h3','',this.overviewHeading);this.overviewTitle.id=`this-${this.id}-overview`;b.overview.setAttribute('aria-labelledby',this.overviewTitle.id);
    this.overviewHint=element('span','',this.overviewHeading);
    this.expand=element('button','show-whole-week',b.overview);this.expand.type='button';this.expand.setAttribute('aria-expanded','false');this.expand.onclick=()=>{const open=this.expand.getAttribute('aria-expanded')!=='true';this.expand.setAttribute('aria-expanded',String(open));this.shell.classList.toggle('week-expanded',open);};
    this.chartScroll=element('div','schedule-scroll',b.overview);this.chartScroll.tabIndex=0;this.chartHost=element('div','schedule-host',this.chartScroll);this.expand.setAttribute('aria-controls',`${this.id}-chart`);this.chartScroll.id=`${this.id}-chart`;
    this.legend=element('div','course-legend',b.overview);
    d3.select(this.legend).selectAll('button').data(this.data.courses,d=>d.id).join('button').attr('type','button').attr('data-course',d=>d.id).style('--course-color',d=>d.color).on('click',(_,d)=>this.dispatch.call('selectCourse',null,d.id));
    this.loadTitle=element('h3','',b.load);this.loadHost=element('div','load-host',b.load);
    this.courseTitle=element('h3','',b.courses);this.courseHost=element('div','course-host',b.courses);
    this.source=element('p','',b.source);
    if(!this.options.product){this.readout=element('p','layout-readout',this.shell.parentElement);}
  }
  update(patch,animate=true) {Object.assign(this.state,patch);this.render(animate);this.options.onChange?.(this.state);}
  question(mode) {this.update({questionMode:mode,selectedDate:this.data.meta.default_focus_date,selectedCourse:mode==='course'?'VIS':null});}
  updateReadout() {
    if(!this.readout)return;
    const s=this.state,cols=s.detailLevel==='full'?12:s.detailLevel==='medium'?8:4;
    this.readout.textContent=text(`${Math.round(s.containerWidth)}px 实际容器 · ${cols} 列 · ${s.detailLevel==='compact'?'选中日优先':s.questionMode==='week'?'整周优先':'焦点优先'} · ${ {full:'完整',medium:'适中',compact:'精简'}[s.detailLevel]}细节`,`${Math.round(s.containerWidth)}px container · ${cols} columns · ${s.detailLevel==='compact'?'selected day first':s.questionMode==='week'?'week first':'focus first'} · ${s.detailLevel} detail`);
  }
  render(animate=true) {
    const active=document.activeElement,hadFocus=this.shell.contains(active);
    const s=this.state,d=this.data,lang=language.lang;
    const before=new Map(Object.values(this.blocks).map(n=>[n.dataset.layoutBlock,n.getBoundingClientRect()]));
    applyPageComposition(this.page,this.blocks,s.questionMode,s.detailLevel);
    this.shell.dataset.detail=s.detailLevel;
    this.shell.classList.toggle('show-page-grid',s.showPageGrid);
    this.weekMeta.textContent=text(`${d.meta.academic_year} 秋季 · 第 ${d.meta.week_number} 周`,`${d.meta.academic_year} Fall · Week ${d.meta.week_number}`);
    this.weekTotals.textContent=text(`${d.totals.sessions} 次上课 / ${d.totals.courses} 门课程 / ${d.totals.periods} 节课 / ${d.totals.activeDays} 个有课日`,`${d.totals.sessions} sessions / ${d.totals.courses} courses / ${d.totals.periods} periods / ${d.totals.activeDays} class days`);
    const day=d.days.find(day=>day.date===s.selectedDate)||d.days[0];
    const course=d.courses.find(c=>c.id===s.selectedCourse);
    const isCourse=s.questionMode==='course'&&course;
    const selected=d.schedule.filter(row=>isCourse?row.course_id===course.id:row.date===day.date).sort((a,b)=>a.date.localeCompare(b.date)||a.period_start-b.period_start);
    this.focusEyebrow.textContent=isCourse?text('正在关注的课程','COURSE IN FOCUS'):text('选中的一天','SELECTED DAY');
    this.focusTitle.textContent=isCourse?course[lang==='zh'?'zh':'en']:text(`周${day.weekday_zh}`,day.weekday_en);
    this.focusSub.textContent=isCourse?`${selected.length} ${text('次上课','sessions')} · ${d3.sum(selected,periodsOf)} ${text('节','periods')}`:`${day.date.slice(5).replace('-',' / ')} · ${selected.length} ${text('次上课','sessions')} · ${d3.sum(selected,periodsOf)} ${text('节','periods')}`;
    d3.select(this.dayPicker).selectAll('button').text(day=>lang==='zh'?day.weekday_zh:day.weekday_en).attr('aria-label',day=>text(`选择周${day.weekday_zh} ${day.date}`,`Select ${day.weekday_en} ${day.date}`)).attr('aria-pressed',day=>String(s.questionMode==='day'&&day.date===s.selectedDate));
    const rows=d3.select(this.focusSessions).selectAll('button.focus-session').data(selected,row=>row.session_id).join(enter=>{const b=enter.append('button').attr('type','button').attr('class','focus-session');b.append('span').attr('class','session-period');b.append('span').attr('class','session-name');b.append('span').attr('class','session-location');b.append('span').attr('class','session-id');return b;});
    rows.order().attr('data-session-id',row=>row.session_id).style('--course-color',row=>d.courses.find(c=>c.id===row.course_id).color).on('click',(_,row)=>this.dispatch.call('selectCourse',null,row.course_id));
    rows.select('.session-period').text(row=>text(`${isCourse?'周'+row.weekday_zh+' · ':''}第 ${row.period_start}–${row.period_end} 节`,`${isCourse?row.weekday_en+' · ':''}P${row.period_start}–${row.period_end}`));
    rows.select('.session-name').text(row=>row[`course_${lang}`]);
    rows.select('.session-location').text(row=>row.location);
    rows.select('.session-id').text(row=>row.course_id+' ↗');
    this.focusStatus.textContent=selected.length?text(s.questionMode==='week'?'整周位置保留。点一天或一门课，换一种阅读方式。':`已聚焦 ${selected.length} 次课；其他课程仍留在整周位置。`,s.questionMode==='week'?'The full week stays visible. Choose a day or a course to change your reading task.':`${selected.length} sessions in focus; the rest stay in their weekly positions.`):text('当天没有课表记录。这里不推断其他活动。','No classes recorded for this day. Other activities are not inferred.');
    this.clear.textContent=text('返回整周 ↙','Back to full week ↙');this.clear.hidden=s.questionMode==='week';
    this.overviewTitle.textContent=text('一周的位置','The week at a glance');
    this.overviewHint.textContent=text('星期 × 第 1–11 节','WEEKDAY × PERIOD 1–11');
    this.expand.textContent=text('查看整周 →','Show full week →');
    this.chartScroll.setAttribute('aria-label',text('整周课表，可局部横向滚动','Full timetable; scroll horizontally within this region'));
    const context=s.detailLevel==='full'&&s.questionMode!=='week'&&!this.options.balanced&&s.chartMode!=='list';
    this.blocks.overview.classList.toggle('context-overview',context);
    const options={lang,context,selectedDate:s.selectedDate,selectedCourse:s.selectedCourse,focusMode:s.questionMode,mode:s.chartMode,showVizGrid:s.showVizGrid,detail:s.detailLevel,onDate:date=>this.dispatch.call('selectDate',null,date),onCourse:id=>this.dispatch.call('selectCourse',null,id)};
    renderSchedule(this.chartHost,d,options);
    d3.select(this.legend).selectAll('button').text(course=>`${course.id} · ${course[lang==='zh'?'zh':'en']}`).attr('aria-pressed',course=>String(isCourse&&course.id===s.selectedCourse));
    this.loadTitle.textContent=text('每天的课量','Periods by day');renderDailyLoad(this.loadHost,d,options);
    this.courseTitle.textContent=text('课程在这一周','Courses across the week');renderCourseSummary(this.courseHost,d,options);
    this.source.textContent=d.meta[`source_note_${lang}`];
    [...this.page.children].forEach((block,i)=>{block.dataset.reading=String(i+1);});
    if(animate&&!reduced())Object.values(this.blocks).forEach(node=>{const old=before.get(node.dataset.layoutBlock),now=node.getBoundingClientRect();if(!old||!old.width||!now.width)return;node.getAnimations().forEach(a=>a.cancel());node.animate([{transform:`translate(${old.x-now.x}px,${old.y-now.y}px)`},{transform:'translate(0,0)'}],{duration:600,easing:'cubic-bezier(.2,.7,.2,1)'});});
    this.updateReadout();
    if(hadFocus){
      if(active.isConnected&&!active.hidden&&active.getClientRects().length) active.focus({preventScroll:true});
      else this.dayPicker.querySelector(`[data-date="${s.selectedDate}"]`)?.focus({preventScroll:true});
    }
  }
}
