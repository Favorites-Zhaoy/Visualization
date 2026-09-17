/* Synthetic teaching data. Not real measurements, people, or institutions. */
const fs = require('node:fs');
const path = require('node:path');
const target = path.resolve(__dirname, '../data');
fs.mkdirSync(target, { recursive: true });
const SEED = 20260917;
let seed = SEED >>> 0;
// Same integer recurrence as d3.randomLcg; deterministic across Node versions.
const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
const integer = (lo, hi) => lo + Math.floor(random() * (hi - lo + 1));
const round = n => Number(n.toFixed(6));
const writeJSON = (name, value) => fs.writeFileSync(path.join(target, name), JSON.stringify(value, null, 2) + '\n');
const writeCSV = (name, fields, rows) => fs.writeFileSync(path.join(target, name), [fields.join(','), ...rows.map(row => fields.map(key => row[key]).join(','))].join('\n') + '\n');

// id, zh/en title, priority, aspect, density, desktop order, zh/en summary,
// zh/en extended explanation, bilingual concept lists.
const definitions = [
 ['dikw','DIKW 层级','DIKW Ladder',1,'tall','low',11,'同一批数值，如何逐层变成可行动的认识？','How can raw values become actionable understanding?', '从观测值出发，经分类与比较形成信息，再解释关系形成知识，最后结合情境作出判断。四层不能只靠改变颜色来区分，位置与分组共同提示抽象层级。','Observations become information through classification and comparison, then knowledge through explanation, and judgment through context. Position and grouping distinguish the four levels of abstraction.', ['数据','信息','知识','判断'],['Data','Information','Knowledge','Judgment']],
 ['channels','视觉通道','Visual Channels',2,'square','low',7,'用位置、大小与颜色，给同一数值不同的视觉编码。','Encode one value through position, size, and color.', '比较两组数据时，共同基线上的位置更便于精确比较；面积适合概括量级，颜色适合区分类别。页面也使用相同原则：尺寸传达优先级，色彩连接同类作品。','Position on a common baseline supports precise comparison; area suggests magnitude and color distinguishes categories. A page uses the same principle: size signals priority and color connects related artifacts.', ['位置','大小','颜色'],['Position','Size','Color']],
 ['data-join','数据连接','Data Join',3,'wide','high',3,'进入、更新、退出：数据变动时，哪些图形需要保留？','Enter, update, exit: which marks survive a data change?', '30 个对象分为 8 个进入、14 个更新、8 个退出。用稳定 id 连接数据与图形，使更新对象保持身份。展厅重排也保留同一张卡片，让视线可以跟随它移动。','Thirty objects include 8 entering, 14 updating, and 8 exiting records. Stable IDs preserve the identity of updated marks. Gallery reflow similarly keeps each card intact so the eye can follow its movement.', ['键值连接','对象恒常性','过渡'],['Keyed join','Object constancy','Transition']],
 ['pipeline','可视化流程','Visualization Pipeline',1,'wide','low',12,'从数据到视图，展示一次表达选择的完整路径。','Trace the decisions that turn data into a view.', '数据整理、映射和呈现不是三个孤立步骤。改变分类规则会影响颜色与分组；改变阅读任务会影响最终视图。页面结构将相关步骤放在同一阅读路径上。','Preparation, mapping, and rendering are connected decisions. A changed grouping rule affects color and organization; a changed reading task affects the final view. Page structure places these steps along one reading path.', ['整理','映射','呈现'],['Prepare','Map','Render']],
 ['hierarchy','层次结构','Hierarchy',2,'tall','medium',8,'一个根、五个组、十五个叶子，先理解包含关系。','Read containment in one root, five groups, and fifteen leaves.', '嵌套分组先回答“谁属于谁”，不要求读者逐条追踪连线。相同的包含关系也适用于网页：展厅包含主题，主题包含作品，作品包含预览与说明。','Nested groups answer what belongs where without requiring readers to trace every edge. The same containment organizes a page: an exhibition contains themes, themes contain artifacts, and artifacts contain previews and captions.', ['包含','分组','语义区域'],['Containment','Grouping','Semantic regions']],
 ['tree','树布局','Tree Layout',3,'square','high',4,'把同一层次数据展开，读出父子关系与分支。','Unfold the hierarchy to reveal parent–child relationships.', '同一份 21 节点数据可以用包含关系或节点连线表达。树布局让分支路径更清楚，但需要横向空间；窄屏预览只保留前两层，详细结构留给聚焦视图。','The same 21 nodes can use containment or node–link encoding. A tree makes branching paths explicit but needs room. Compact previews retain two levels, while focused views provide more detail.', ['父子关系','节点连线','细节层级'],['Parent–child','Node–link','Detail level']],
 ['color-space','颜色空间','Color Space',1,'square','medium',13,'在连续色域中观察明度、色相与饱和度的差异。','Compare lightness, hue, and saturation in a continuous space.', '色相变化不一定意味着明度变化。用连续样本比较相邻颜色，能看出哪些差异容易分辨。页面的主题色只承担类别提示，文字与背景仍需要足够的明暗对比。','A change in hue is not necessarily a change in lightness. Continuous samples reveal which differences are perceptually distinct. Theme colors signal categories while text and background still need clear contrast.', ['色相','明度','饱和度'],['Hue','Lightness','Saturation']],
 ['colormap','科研配色','Scientific Colormap',3,'wide','medium',5,'用连续明度呈现数值顺序，避免制造虚假的边界。','Use ordered lightness to show values without false boundaries.', '30 个标量从低到高映射到连续色带。平滑的颜色变化便于判断趋势，突兀的色带分界可能被误读为数据中的结构。比较时应保留相同数值域与图例。','Thirty scalars map from low to high onto a continuous scale. Smooth color changes support trend reading; abrupt boundaries may suggest structure absent from the data. Comparisons should share the same domain and legend.', ['连续色带','顺序','感知均匀'],['Sequential scale','Order','Perceptual uniformity']],
 ['cvd','色觉缺陷检查','CVD Check',2,'square','low',9,'如果颜色变得难以区分，形状与标签还能帮助识别吗？','When colors become hard to distinguish, do shapes and labels help?', '把相同数据以红绿发散配色与 Cividis 配色并置比较，这不是色觉缺陷模拟。数值同时使用颜色与大小编码，避免把可读性完全寄托在色相差异上。','Compare the same values using a red–green diverging palette and Cividis. This is a palette comparison, not a color-vision-deficiency simulation. Color and size provide redundant value cues.', ['冗余编码','可访问性','对比'],['Redundant encoding','Accessibility','Contrast']],
 ['coordinates','坐标变换','Coordinate Transform',2,'square','medium',10,'同一组点换一种坐标，哪些模式会更清楚？','Which patterns become clearer when the same points change coordinates?', '平移、缩放与旋转改变图形位置，却不改变记录本身。比较前后视图时保留点的身份，才能判断变化来自坐标系统，而非新增或删除数据。','Translation, scaling, and rotation change mark positions, not the underlying records. Preserving point identity across views clarifies that differences come from the coordinate system rather than changed data.', ['坐标','变换','身份保持'],['Coordinates','Transform','Identity']],
 ['curve','曲线拟合','Curve Fitting',2,'wide','medium',6,'透过散点噪声，看见一条近似的整体趋势。','See an approximate overall trend through noisy points.', '60 个虚构观测围绕已知二次模型分布。预览叠加的是生成数据时使用的模型曲线，并非对散点重新拟合的结果；散点保留噪声与偏离程度，帮助理解模型与观测的区别。','Sixty synthetic observations vary around a known quadratic model. The overlaid curve is the model used to generate the data, not a new fit to these points. The scatter retains noise and deviations to distinguish the model from observations.', ['趋势','噪声','模型'],['Trend','Noise','Model']],
 ['contour','等值线','Contour',1,'square','high',14,'把离散点的聚集转成连续的密度层次。','Turn discrete point clusters into continuous density levels.', '密度轮廓概括哪里点更多，而不逐个强调对象。平滑程度影响轮廓形状，因此等值线是估计的结构。与散点并置，可以检查概括是否掩盖了局部细节。','Density contours summarize where points gather rather than emphasizing individuals. Smoothing affects contour shape, so the contours are estimates. Comparing them with points reveals whether the summary hides local detail.', ['密度','平滑','概括'],['Density','Smoothing','Summary']],
 ['calendar','日历热图','Calendar Heatmap',2,'square','medium',2,'把连续时间按月份组织，比较季节性重复。','Organize time by month to compare seasonal repetition.', '四年的月度数据排成对齐的时间网格，颜色表示数值。相同月份处在相同列，季节性因此更易比较；紧凑模式汇总为 12 个月份块，并明确它是汇总视图。','Four years of monthly values form an aligned time grid with color encoding magnitude. The same months share columns, revealing seasonality. Compact mode uses a clearly identified twelve-month summary.', ['时间网格','季节性','汇总'],['Time grid','Seasonality','Aggregation']],
 ['spiral','螺旋时间','Spiral Time',1,'tall','low',15,'用一圈表示一年，同时观察周期与长期变化。','Use one turn per year to compare cycles and longer-term change.', '月份控制角度，年份推进半径，数值通过视觉标记呈现。周期位置对齐便于比较不同年份的同一季节，但精确读值仍需要图例或详细视图。','Month controls angle and year advances radius, while marks encode values. Aligned cyclic positions help compare the same season across years; exact readings still require a legend or a detailed view.', ['周期','径向布局','时间'],['Cycles','Radial layout','Time']],
 ['storyline','故事线','Storyline',3,'wide','high',1,'让时间中的关系变化形成可跟随的视觉叙事。','Make changing relationships over time visually traceable.', '示意曲线沿时间推进，接近与分离表达关系变化。此处用虚构时间序列构造教学预览，不代表真实人物共现。宽卡提供连续阅读空间，聚焦后再展开说明与细节。','Illustrative paths progress through time; proximity and separation suggest changing relationships. This teaching preview is constructed from synthetic series, not real co-occurrence records. A wide card supports continuous reading before focus reveals more detail.', ['叙事','连接','焦点与上下文'],['Narrative','Connection','Focus + context']]
];
const themes = ['data','process','color','low-dimensional','time'];
const refs = ['lesson1-entities.csv','lesson2-hierarchy.json','lesson3-scalars.csv','lesson4-points.csv','lesson5-timeline.csv'];
const modules = definitions.map((d, index) => ({
 id:d[0], lesson:Math.floor(index/3)+1, theme:themes[Math.floor(index/3)], title_zh:d[1], title_en:d[2],
 summary_zh:d[7], summary_en:d[8], detail_zh:d[9], detail_en:d[10], priority:d[3], aspect:d[4], density:d[5],
 desktop_order:d[6], mobile_order:index+1, preview_type:d[0], data_ref:refs[Math.floor(index/3)],
 tags:d[12], tags_zh:d[11], tags_en:d[12], synthetic:true
}));
writeJSON('visual-modules.json', modules);
const entities = Array.from({length:30}, (_, i) => ({id:`entity-${String(i+1).padStart(2,'0')}`,category:'ABC'[Math.floor(i/10)],value:integer(10,100),previous_value:integer(10,100),state:i<8?'enter':i<22?'update':'exit'}));
writeCSV('lesson1-entities.csv',['id','category','value','previous_value','state'],entities);
writeJSON('lesson2-hierarchy.json',{name:'Synthetic Atlas',children:Array.from({length:5},(_,i)=>({name:`Group ${i+1}`,children:Array.from({length:3},(_,j)=>({name:`Leaf ${i+1}.${j+1}`,value:integer(1,10)}))}))});
const scalars = Array.from({length:30},(_,i)=>({id:`scalar-${String(i+1).padStart(2,'0')}`,value:round((i+random()*.5)/29.5),group:['low','medium','high'][Math.floor(i/10)]}));
writeCSV('lesson3-scalars.csv',['id','value','group'],scalars);
const points = Array.from({length:60},(_,i)=>{const x=round(random()*10);return {id:`point-${String(i+1).padStart(2,'0')}`,x,y:round(.35*x*x-2.6*x+8+(random()*2.4-1.2)),class:i<30?'A':'B'};});
writeCSV('lesson4-points.csv',['id','x','y','class'],points);
const timeline=[];
for(let month=0;month<48;month++) for(let series=0;series<3;series++) timeline.push({date:`${2023+Math.floor(month/12)}-${String(month%12+1).padStart(2,'0')}`,series:'ABC'[series],value:round(48+series*4+month*.25+20*Math.sin(month*Math.PI/6+series*2*Math.PI/3)+(random()-.5)*3)});
writeCSV('lesson5-timeline.csv',['date','series','value'],timeline);
console.log(`Generated VISUAL ATLAS synthetic teaching data with seed ${SEED}.`);
