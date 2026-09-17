/* Run with Node; no dependencies or build step required. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../data');
let failures = 0;
function check(condition, message) { if (!condition) { console.error(`FAIL: ${message}`); failures++; } }
function json(file) { return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }
function csv(file, fields) {
 const lines = fs.readFileSync(path.join(root,file),'utf8').trim().split(/\r?\n/);
 const header = lines.shift().split(',');
 check(header.join(',')===fields.join(','),`${file}: required CSV columns`);
 return lines.map((line,i)=>{const values=line.split(',');check(values.length===fields.length&&values.every(value=>value.trim()!==''),`${file}: complete row ${i+1}`);return Object.fromEntries(header.map((key,j)=>[key,values[j]]));});
}
function distribution(rows, key, expected) {
 const actual = rows.reduce((all,row)=>(all[row[key]]=(all[row[key]]||0)+1,all),{});
 check(Object.keys(actual).length===Object.keys(expected).length&&Object.entries(expected).every(([value,count])=>actual[value]===count),`${key} distribution ${JSON.stringify(expected)}`);
}
const unique = (rows,key) => new Set(rows.map(row=>row[key])).size===rows.length;
const between = (value,min,max) => Number.isFinite(Number(value))&&Number(value)>=min&&Number(value)<=max;
function validate() {
 const modules=json('visual-modules.json');
 check(Array.isArray(modules)&&modules.length===15,'15 artifacts');
 const fields=['id','lesson','theme','title_zh','title_en','summary_zh','summary_en','priority','aspect','density','desktop_order','mobile_order','preview_type','data_ref','tags'];
 check(modules.every(row=>fields.every(key=>row[key]!==undefined&&row[key]!==null&&String(row[key]).trim()!=='')),'all required module fields are nonempty');
 check(unique(modules,'id'),'unique artifact IDs');
 distribution(modules,'lesson',{'1':3,'2':3,'3':3,'4':3,'5':3});
 distribution(modules,'priority',{'1':5,'2':6,'3':4});
 distribution(modules,'aspect',{wide:5,square:7,tall:3});
 distribution(modules,'density',{low:5,medium:6,high:4});
 const previews=['dikw','channels','data-join','pipeline','hierarchy','tree','color-space','colormap','cvd','coordinates','curve','contour','calendar','spiral','storyline'];
 check(modules.every(row=>row.id===row.preview_type)&&previews.every(type=>modules.some(row=>row.preview_type===type)),'all 15 expected preview types');
 const themes=['data','process','color','low-dimensional','time'];
 const refs=['lesson1-entities.csv','lesson2-hierarchy.json','lesson3-scalars.csv','lesson4-points.csv','lesson5-timeline.csv'];
 check(modules.every(row=>Number.isInteger(row.lesson)&&row.theme===themes[row.lesson-1]&&row.data_ref===refs[row.lesson-1]),'lesson/theme/data reference agreement');
 for(const key of ['desktop_order','mobile_order']) check(unique(modules,key)&&modules.every(row=>Number.isInteger(row[key])&&between(row[key],1,15)),`${key}: unique integers 1–15`);
 check(modules.every(row=>path.dirname(row.data_ref)==='.'&&fs.existsSync(path.join(root,row.data_ref))),'all data references exist locally');
 check(modules.every(row=>Array.isArray(row.tags)&&row.tags.length>0&&row.tags.every(tag=>typeof tag==='string'&&tag.trim())),'nonempty concept tags');
 check(modules.every(row=>/[\u3400-\u9fff]/.test(row.title_zh)&&/[a-zA-Z]/.test(row.title_en)&&/[\u3400-\u9fff]/.test(row.summary_zh)&&/[a-zA-Z]/.test(row.summary_en)),'bilingual titles and summaries');
 check(modules.every(row=>row.synthetic===true),'all artifacts explicitly marked synthetic');
 const entities=csv(refs[0],['id','category','value','previous_value','state']);
 check(entities.length===30&&unique(entities,'id'),'30 unique entities');
 distribution(entities,'category',{A:10,B:10,C:10});
 distribution(entities,'state',{enter:8,update:14,exit:8});
 check(entities.every(row=>between(row.value,10,100)&&between(row.previous_value,10,100)),'entity values in 10–100');
 const hierarchy=json(refs[1]);
 let nodes=0;
 function walk(node){nodes++;check(typeof node.name==='string'&&node.name.trim()!=='','hierarchy nonempty names');if(node.children)node.children.forEach(walk);else check(Number.isInteger(node.value)&&between(node.value,1,10),'leaf integer value in 1–10');}
 walk(hierarchy);
 check(nodes===21&&hierarchy.children?.length===5&&hierarchy.children.every(group=>group.children?.length===3&&group.children.every(leaf=>!leaf.children)),'hierarchy: root + 5 groups × 3 leaves = 21 nodes');
 const scalars=csv(refs[2],['id','value','group']);
 check(scalars.length===30&&unique(scalars,'id'),'30 unique scalars');
 distribution(scalars,'group',{low:10,medium:10,high:10});
 check(scalars.every(row=>between(row.value,0,1))&&scalars.filter(row=>+row.value<.1).length>=2&&scalars.filter(row=>+row.value>.9).length>=2,'scalar range and both endpoint samples');
 const points=csv(refs[3],['id','x','y','class']);
 check(points.length===60&&unique(points,'id'),'60 unique points');
 distribution(points,'class',{A:30,B:30});
 check(points.every(row=>between(row.x,0,10)&&Number.isFinite(+row.y)&&Math.abs(+row.y-(.35*row.x*row.x-2.6*row.x+8))<=1.200001),'points obey quadratic model with bounded noise');
 const timeline=csv(refs[4],['date','series','value']);
 check(timeline.length===144,'144 timeline observations');
 distribution(timeline,'series',{A:48,B:48,C:48});
 const months=Array.from({length:48},(_,i)=>`${2023+Math.floor(i/12)}-${String(i%12+1).padStart(2,'0')}`);
 check(months.every(date=>'ABC'.split('').every(series=>timeline.filter(row=>row.date===date&&row.series===series).length===1)),'every month 2023-01–2026-12 has exactly A/B/C');
 check(timeline.every(row=>between(row.value,20,100)),'timeline values in 20–100');
 for(let series=0;series<3;series++) {
  const rows=timeline.filter(row=>row.series==='ABC'[series]).sort((a,b)=>a.date.localeCompare(b.date));
  const average=items=>items.reduce((sum,row)=>sum+Number(row.value),0)/items.length;
  check(average(rows.slice(36))>average(rows.slice(0,12)),'timeline positive long-term trend');
  check(rows.every((row,month)=>Math.abs(+row.value-(48+series*4+month*.25+20*Math.sin(month*Math.PI/6+series*2*Math.PI/3)))<=1.500001),'timeline seasonal signal with phase offset');
 }
}
try { validate(); } catch(error) { console.error(`FAIL: ${error.message}`); failures++; }
if(failures) process.exitCode=1;
else console.log('All VISUAL ATLAS data checks passed.');
