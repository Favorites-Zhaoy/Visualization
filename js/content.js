import { cleanupWith } from "./lifecycle.js?v=3";
export const lessons = [
  {
    id: "lesson61",
    no: "6.1",
    short: "页面骨架",
    title: "页面不是一堆 <div>",
    subtitle: "从散乱元素到清晰的信息层级",
    tags: ["Visual Hierarchy", "Box Model", "Flexbox"],
    question: "80 人、年龄图、学生列表都放上去了，为什么还是看不懂？",
    before: "每个元素都在争夺注意力，眼睛找不到起点。",
    after: "先看标题和总量，再看整体，最后进入细节。",
    summary: "网页布局不是把元素“摆进去”，而是建立信息的视觉层级。",
    intro:
      "想象你第一次打开 CampusScope：大号的“52.5%”挤在学生列表旁边，“80 人”却藏在角落。数据并没有错，错的是页面没有告诉你先看什么。我们先把问题按阅读顺序分成三层：这是什么？整体怎样？具体是谁？",
    concepts: [
      [
        "视觉层级：先给眼睛一个入口",
        "标题回答“2026 级新生”；KPI 回答“80 人、4 个班”；主图回答“班级规模有何不同”。字号、位置和面积共同决定先后，而不是给每一块都加粗。",
      ],
      [
        "邻近与分组：距离也是语义",
        "把“18.3”与“平均年龄 / 岁”放在同一卡片，比把数字和标签分开放更容易理解。卡片内部距离小，卡片之间留出 gap，观众便知道谁属于谁。",
      ],
      [
        "盒模型：留白需要占空间",
        "若区域内容宽 240px，左右 padding 各 24px，边框各 1px，默认总宽是 290px。使用 border-box 后，设定的宽度包含 padding 和 border；文字仍需要内部留白。",
      ],
      [
        "从平面到层级：看见网页的叠放顺序",
        "Normal 呈现阅读顺序，X-Ray 显示真实盒子；Exploded 3D 把网格、区域、图形、标签与浮层沿 z 轴分开。3D 用来解释层级，不用来编码人数。",
      ],
    ],
    challenge:
      "先在 X-Ray 选择 Main 并调节内边距；再打开 Exploded 3D，用拖动或旋转按钮分辨网格、区域、图形、标签与浮层。",
    code: `// X-Ray 读取真实盒子，坐标相对视口
const box = element.getBoundingClientRect();
const padding = getComputedStyle(element).padding;

// D3 绑定五层；CSS 负责空间叠放
const layers = [0, 40, 80, 120, 160];
d3.select(".exploded-stack").selectAll(".exploded-layer")
  .data(layers).join("div").attr("class", "exploded-layer")
  .style("--z", d => d + "px");
// 拖动和方向按钮共用旋转函数，限制视角
rx = Math.max(-25, Math.min(25, rx));
ry = Math.max(-35, Math.min(35, ry));
stack.style("transform", "rotateX(" + rx + "deg) rotateY(" + ry + "deg)");

/* CSS：盒模型与层级各司其职 */
* { box-sizing: border-box; }
.exploded-scene { perspective: 1200px; }
.exploded-stack { transform-style: preserve-3d; }
.exploded-layer { transform: translateZ(var(--z)); }`,
    note: "X-Ray 测量当前平面布局；Exploded 是五层结构示意，不是浏览器真实 z 坐标。鼠标拖动与方向按钮共用有限旋转，Reset View 可回到初始视角。",
  },
  {
    id: "lesson62",
    no: "6.2",
    short: "网格布局",
    title: "网格不是为了整齐",
    subtitle: "为什么“对齐”比“装饰”更重要",
    tags: ["12 Columns", "Alignment", "Data Join"],
    question: "同样五张 KPI 卡片，为什么一种布局要找半天，另一种一眼就能扫完？",
    before: "位置随意，卡片边缘不齐，每次阅读都要重新寻找。",
    after: "共享列线和间距，重要信息获得合适的跨度。",
    summary: "网格真正解决的不是“整齐”，而是建立稳定的阅读秩序。",
    intro:
      "我们把上一节的 KPI 拿出来，做一个小实验：在“10 秒阅读实验”里，两次寻找“平均年龄”，记录你在 Random 和 Grid 中的个人用时。内容完全相同，寻找路径和个人用时可能不同。图表内部的位置帮助读数，图表外部的位置帮助组织阅读。",
    concepts: [
      [
        "随机与居中：整齐不一定高效",
        "Random 打乱视觉路径；Center 虽然对称，却让五张卡片竖成一长列。读完“总人数”还要不断向下找。空间利用率和阅读任务要一起考虑。",
      ],
      [
        "等宽卡片：每个问题同等重要吗？",
        "Equal Cards 每张占 1/5。短标签“省份”与长标签“平均年龄”得到相同空间。这是合理基线，但不一定适合后续加入趋势或说明的卡片。",
      ],
      [
        "12 列：给布局一把公共尺子",
        "默认跨度3+2+3+2+2=12，正好一行。把平均年龄改为 span 6，总跨度变成15，后面的卡片会换行；背景列线仍是12列，gap 不算额外一列。",
      ],
      [
        "Data Join：让卡片跟着数据生长",
        "用 label 作 key，四种布局共享同一批 article。切换时先记录旧位置，让 CSS 完成新布局，再用 D3 把位移归零；你能一路认出“平均年龄”，而不是看到一套新卡片。",
      ],
    ],
    challenge:
      "在四种布局间切换，追踪同一张“平均年龄”。把 gap 从8调到40，再把它的跨度从3改到6：哪些卡片换了行？",
    code: `const cards = d3.select(".kpi-grid").selectAll(".kpi")
  .data(kpis, d => d.label).join("article")
  .attr("class", "kpi").style("--span", d => d.span);
// 控件改变 CSS；同一批卡片保持不变
stage.style("--grid-gap", gap + "px"); // 8–40
cards.filter(d => d.label === "平均年龄")
  .style("--span", span); // 2、3、4、6

// FLIP：旧位置 → 新布局 → 位移归零（核心片段）
const before = card.getBoundingClientRect();
changeLayout();
const after = card.getBoundingClientRect();
d3.select(card)
  .style("transform", "translate(" + (before.x-after.x) + "px," +
    (before.y-after.y) + "px)")
  .transition().duration(600).style("transform", "translate(0px,0px)");

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--grid-gap, 16px);
}
.kpi { grid-column: span var(--span); }`,
    note: "完整演示的 FLIP 同时插值位移和缩放。gap 与 span 都交给 CSS；D3 只保持卡片身份并解释变化。开启减少动态效果时跳过过渡。",
  },
  {
    id: "lesson63",
    no: "6.3",
    short: "数据驱动布局",
    title: "空间为什么一定要平均分？",
    subtitle: "从 Equal Grid 到 Treemap",
    tags: ["d3.hierarchy", "d3.treemap", "Transition"],
    question: "26 人的班与 14 人的班，为什么要占据相同的页面面积？",
    before: "四个班各占25%的空间，人数差异只能靠逐个读数字。",
    after: "矩形面积编码人数，标签提供准确人数和百分比。",
    summary: "布局本身也可以成为一种视觉编码。",
    intro:
      "在等宽网格中，软件工程1班与数字媒体1班一样大，观众容易误以为规模接近。把班级人数送入 Treemap，前者的面积变成后者约 1.86 倍。现在，即使先不读标签，也能发现规模差异。",
    concepts: [
      [
        "从表到树：先计算，后布局",
        "80 行 CSV 按 class_name 聚合为4个班，再放到一个 students 根节点下面。d3.hierarchy 建立“全体→班级”的层级，sum 把人数变成每个节点的权重。",
      ],
      [
        "面积编码：比较的是宽×高",
        "软件工程1班26人，占80人的32.5%；数字媒体1班14人，占17.5%。Treemap 同时改变宽和高，不能只比较边长。图中保留精确标签帮助判断。",
      ],
      [
        "连续变形：别让读者丢掉目标",
        "将滑块停在50%，观察同一班级的四条边如何移动。t=0 是等分，t=1 是人数布局；中间状态只解释变化过程，不应当作人数比例读取。People 模式把80名学生显示为80个点。",
      ],
      [
        "何时不用 Treemap？",
        "如果任务是精确比较22人与18人的差别，共用基线的条形图通常更直接。Treemap 适合紧凑地看部分与整体；普通网页区域也不必都按数据面积分配。",
      ],
    ],
    challenge:
      "将滑块停在0%、50%、100%，再打开 People。点的总数是否变化？用右侧共同基线的条形图核对26人与14人的差距。",
    code: `const counts = d3.rollups(students, rows => rows.length,
  d => d.class_name).map(([name, value]) => ({name, value}));
const root = d3.hierarchy({children: counts}).sum(d => d.value || 0);
d3.treemap().size([width, height]).paddingInner(3)(root);

// t 来自0–1滑块；equal 与 target 保存同一班的两套坐标
const frame = {
  x: d3.interpolateNumber(equal.x, target.x0)(t),
  y: d3.interpolateNumber(equal.y, target.y0)(t),
  w: d3.interpolateNumber(equal.w, target.x1-target.x0)(t),
  h: d3.interpolateNumber(equal.h, target.y1-target.y0)(t)
};
cell.attr("transform", "translate(" + frame.x + "," + frame.y + ")");
cell.select("rect").attr("width", frame.w).attr("height", frame.h);

// People 模式：仍是原来的80行，按班级放入对应矩形
const dots = svg.selectAll("circle").data(students, d => d.student_id)
  .join("circle");
dots.attr("cx", d => pointPositions.get(d.student_id).x)
  .attr("cy", d => pointPositions.get(d.student_id).y)
  .attr("opacity", people ? 1 : 0);`,
    note: "3px 间隙让可见面积成为近似比例，精确人数请看标签和基准条。滑块中间状态不是新的数据；People 模式始终绑定原80行，不生成新学生。",
  },
  {
    id: "lesson64",
    no: "6.4",
    short: "多视图布局",
    title: "一个屏幕，看整体也看局部",
    subtitle: "Overview + Detail",
    tags: ["Linked Views", "d3.dispatch", "Focus + Context"],
    question: "选中数据科学1班后，怎样既看清这个班，又不忘它在全体中的位置？",
    before: "图表各自为政，选了班级，右侧数字却没有变化。",
    after: "选择班级，再框选年龄；详情与列表同步缩小，总览仍保留全体。",
    summary: "多个视图共享一个状态，才能共同回答问题。",
    intro:
      "现在你想知道：数据科学1班有多少人？年龄集中在哪？兴趣是否都相同？左边的 Treemap 保留全体4个班，右边用同一份筛选结果回答这些局部问题。它们之间的“联动”比图表数量更重要。",
    concepts: [
      [
        "Overview + Detail：空间分工",
        "左侧告诉你选中的班在哪里、有多大；右侧告诉你它由哪些学生组成。点击软件工程1班，右侧人数应立即变成26，列表也应有26条，而不是只更换标题。",
      ],
      [
        "共享状态：一个选择，多个订阅者",
        "selectedClass 保存班级，ageRange 保存年龄区间。选择软件工程1班后，再框选18–19岁：详情显示筛选人数 / 26人，性别、兴趣和列表共享这份结果。清除年龄后恢复26人。",
      ],
      [
        "Focus + Context：放大但不消失",
        "切到关注模式后，选中班级获得更大空间，其他三个班依然保留并弱化。此时面积表示注意力分配，已不再表示人数；页面必须明确提示这个语义变化。",
      ],
      [
        "比较要公平：保持共同坐标",
        "年龄图始终展示当前班级的全部学生，纵轴按全体峰值固定。刷选18–19岁只改变详情和高亮，不重新缩放年龄图；否则“筛选之后的分布”会失去比较背景。",
      ],
    ],
    challenge:
      "选择软件工程1班，再框选或输入18–19岁。核对详情、性别与列表人数；年龄柱之和仍为26。清除年龄后切关注模式，其余班级还可选吗？",
    code: `const state = { selectedClass: null, ageRange: null };
const dispatch = d3.dispatch("selectClass", "ageRange");
const classRows = () => students.filter(d =>
  !state.selectedClass || d.class_name === state.selectedClass);
const selectedRows = () => classRows().filter(d => !state.ageRange ||
  (d.age >= state.ageRange[0] && d.age <= state.ageRange[1]));
dispatch.on("selectClass.state", name => { state.selectedClass = name; });
dispatch.on("ageRange.state", range => { state.ageRange = range; });
function update() {
  updateAgeChart(classRows()); // 留住当前班级的分布背景
  updateDetail(selectedRows()); // 统计、兴趣、列表共用筛选结果
}
dispatch.on("selectClass.detail", update).on("ageRange.detail", update);

const brush = d3.brushX().on("end", event => {
  if (!event.sourceEvent) return; // 忽略 resize 后 brush.move 的同步事件
  const range = event.selection ? event.selection.map(x.invert) : null;
  dispatch.call("ageRange", null, range); // 实际界面将端点吸附到整数年龄
});
clearButton.on("click", () => dispatch.call("ageRange", null, null));`,
    note: "先注册状态监听器，再注册视图更新。年龄图用 classRows()，详情用 selectedRows()；零结果显示空状态，不能计算0/0。程序调用 brush.move 时不再次广播，避免循环。",
  },
  {
    id: "lesson65",
    no: "6.5",
    short: "响应式叙事",
    title: "Responsive 不是缩小页面",
    subtitle: "Responsive Visual Story",
    tags: ["ResizeObserver", "Sticky", "Scrollytelling"],
    question: "从1440px桌面到390px手机，应该把一切缩小，还是重新组织阅读顺序？",
    before: "整个桌面按比例缩小，图表和文字在手机上无法读。",
    after: "KPI换行、整体与细节上下排列，故事按阅读进度展开。",
    summary: "响应式设计不是缩放，而是重新组织信息。",
    intro:
      "把桌面观察站塞进手机，四个指标和两栏图表会同时争夺390px。我们不缩小字体，而是改变阅读顺序：先总量，再整体，再详情。接着，用滚动把同一份数据变成四步故事。",
    concepts: [
      [
        "响应式：重新组织，不是缩小截图",
        "Studio 中，宽容器同行显示4个KPI，图表并排；内容宽度不超过980px时改为2列KPI、图表上下排；不超过640px时KPI单列。断点响应可用空间，不响应设备名称。",
      ],
      [
        "容器宽度：比设备名称更可靠",
        "切换 Portrait 390×844 与 Landscape 844×390，CURRENT RULE 读取真实内容宽度和计算后的列数。容器内边距也占空间，所以滑块数字不一定等于触发断点的内容宽度。",
      ],
      [
        "viewBox：坐标系与显示尺寸分离",
        "viewBox 定义SVG内部坐标，width:100%让它填满容器。仅设置viewBox仍可能让标签随图一起缩小，因此观察尺寸变化后重新布局，保持可读字号。",
      ],
      [
        "滚动叙事：让视觉跟着问题走",
        "同一份数据依次成为80个点、班级面积、年龄焦点和班级详情。每次滚动都检查全部四步的位置，选离阅读线最近的一步；反向滚动或快速跳跃，也能回到正确画面。",
      ],
    ],
    challenge:
      "将宽度从1440拖到390，核对 CURRENT RULE 与实际列数；再切换横竖屏。向下、向上滚动四步故事，或使用步骤按钮，检查画面是否对应问题。",
    code: `// CSS 响应实际容器，而非假装改变浏览器宽度
#responsive-dashboard { container: studio / inline-size; }
.dashboard-kpis { grid-template-columns: repeat(4, minmax(0, 1fr)); }
@container studio (max-width: 980px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .dashboard-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container studio (max-width: 640px) {
  .dashboard-kpis { grid-template-columns: 1fr; }
}

const observer = new ResizeObserver(() => {
  const width = container.clientWidth;
  if (width > 0) render(width); // 重排 SVG 坐标，保留字号
  const columns = getComputedStyle(kpiGrid).gridTemplateColumns;
  showCurrentRule(width, columns); // 实测结果，不猜设备
});
observer.observe(container);

// 回调每次检查全部步骤，不把本批 entries 当成完整状态
function readStep() {
  const line = innerHeight * 0.48;
  const distances = steps.map(el => {
    const r = el.getBoundingClientRect();
    return r.top <= line && r.bottom >= line ? 0 :
      Math.min(Math.abs(r.top-line), Math.abs(r.bottom-line));
  });
  renderStory(d3.minIndex(distances)); // 相同步骤直接返回
}
const storyObserver = new IntersectionObserver(scheduleReadStep);
steps.forEach(el => storyObserver.observe(el));
window.addEventListener("scroll", scheduleReadStep, {passive: true});
// scheduleReadStep 用 requestAnimationFrame 合并滚动；销毁时解绑与 disconnect。`,
    note: "Studio 保持真实像素宽度，超出窗口可以滚动；4步故事使用独立阅读状态，不改动产品筛选。Observer、滚动监听与动画帧在组件销毁时清理。",
  },
];

const shifts = {
 "6.1": ["元素散落，各自争夺注意力", "划分区域，建立阅读层级"],
 "6.2": ["寻找数字，需要来回扫视", "对齐列线，建立稳定路径"],
 "6.3": ["Equal space · 每班一样大", "Data-driven space · 人数决定面积"],
 "6.4": ["每张图各自回答问题", "一次选择，多个视图同步"],
 "6.5": ["把桌面挤进手机", "重排空间，也重排阅读路径"]
};
const probes = {
 "6.1": [["bounds", "看真实区域尺寸 →"], ["layers", "看 translateZ 层级 →"]],
 "6.2": [["columns", "看 12 列 →"], ["gap", "看 gap 的留白 →"], ["span", "看 span 如何换行 →"]],
 "6.3": [["hierarchy", "看 hierarchy 的分组 →"], ["treemap", "看人数如何分配面积 →"], ["interpolate", "看坐标插值 →"]],
 "6.4": [["dispatch", "看 dispatch 同步选择 →"], ["brush", "看 brushX 筛选 →"]],
 "6.5": [["container", "看容器如何重排 →"], ["resize", "看 ResizeObserver 实测 →"]]
};
const purposes = {
 "6.1": {JavaScript:"测量真实区域并控制空间层级", CSS:"为页面区域建立留白与层次"},
 "6.2": {JavaScript:"保持卡片身份并执行 FLIP", CSS:"决定 12 列、间距与卡片跨度"},
 "6.3": {JavaScript:"把班级人数转成空间，并连接两种布局"},
 "6.4": {JavaScript:"广播筛选状态，让多个视图一起更新"},
 "6.5": {CSS:"按可用空间调整阅读结构", JavaScript:"测量容器并跟随阅读进度更新视觉"}
};
export function buildCourse() {
  const cards = d3
    .select("#knowledge-cards")
    .selectAll("article")
    .data(lessons)
    .join("article")
    .attr("class", "knowledge-card");
  const verbs = ["EXPLODE", "SNAP", "MORPH", "LINK", "REFLOW"];
  cards.html((d, i) => `<div class="card-art" data-art="${d.no}"></div><div class="card-body"><div class="card-topline"><span class="card-number">${d.no}</span><span class="card-verb">${verbs[i]}</span></div><h3>${d.short}</h3><p>${d.subtitle}</p><button class="card-preview" aria-label="预览${d.short}布局变化">播放变化 ↻</button><a class="card-link" href="#${d.id}">进入实验<span>↗</span></a></div>`);
  const sections = d3
    .select("#lessons")
    .selectAll("section")
    .data(lessons)
    .join("section")
    .attr("id", (d) => d.id)
    .attr("class", "lesson");
  sections.each(function (d) {
    const s = d3.select(this);
    let probeFrame = 0;
    s.html(
      `<div class="lesson-header"><div class="lesson-kicker"><b>0${d.no.slice(-1)}</b><span>${d.short}</span></div><h2></h2><p class="lesson-question">${d.question}</p><div class="problem-shift" aria-label="本节布局变化"><span>${shifts[d.no][0]}</span><span aria-hidden="true">→</span><strong>${shifts[d.no][1]}</strong></div></div><div class="tabs" role="tablist" aria-label="${d.no}学习内容">${["📖 讲解", "⌨ 关键代码", "▷ Demo"].map((t, i) => `<button role="tab" id="${d.id}-tab${i}" aria-controls="${d.id}-panel${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${i}">${t}</button>`).join("")}</div><div class="tab-panel explanation" id="${d.id}-panel0" role="tabpanel" aria-labelledby="${d.id}-tab0"><p>${d.intro}</p><div class="concept-pairs">${d.concepts.map(([h, p]) => `<div class="concept"><h4>${h}</h4><p>${p}</p></div>`).join("")}</div><button class="open-demo text-link">进入实验 →</button></div><div class="tab-panel code-panel" id="${d.id}-panel1" role="tabpanel" aria-labelledby="${d.id}-tab1" hidden><div class="code-heading"><span>关键片段 · ${d.no} / D3.js + CSS</span><button class="copy-code">复制代码</button></div><pre><code></code></pre><div class="code-note"><b>为什么这样写 / 易错点</b><br>${d.note}</div></div><div class="tab-panel demo-panel" id="${d.id}-panel2" role="tabpanel" aria-labelledby="${d.id}-tab2" hidden><p class="demo-guide">${d.challenge}</p><div id="demo${d.no.replace(".", "")}"></div></div><div class="lesson-summary"><span>TAKEAWAY</span>${d.summary}</div>`,
    );
    s.select(".lesson-header h2").text(d.title);
    const blocks = splitCode(d).map(block => ({...block, purpose: purposes[d.no][block.language]}));
    const panel = s.select(".code-panel");
    panel.html("");
    blocks.forEach((block) => {
      const h = panel.append("div").attr("class", "code-heading");
      h.append("span").text(block.language + " · " + block.purpose);
      h.append("button")
        .attr("class", "copy-code")
        .text("复制 " + block.language)
        .on("click", async function () {
          try {
            await navigator.clipboard.writeText(block.code);
            this.textContent = "已复制 ✓";
          } catch {
            this.textContent = "请选择下方代码复制";
          }
        });
      panel.append("pre").append("code").text(block.code);
    });
    panel.append("div").attr("class", "code-probes").attr("aria-label", "代码对应的视觉效果")
      .selectAll("button").data(probes[d.no]).join("button").attr("type", "button")
      .attr("class", "code-probe").attr("data-demo", d.no.replace(".", ""))
      .attr("data-probe", p => p[0]).text(p => p[1])
      .on("click", (_, p) => {
        selectTab(2, true);
        cancelAnimationFrame(probeFrame);
        probeFrame = requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("lesson-probe", {
          detail: {lesson: d.no.replace(".", ""), probe: p[0]}
        })));
      });
    panel
      .append("div")
      .attr("class", "code-note")
      .html("<b>为什么这样写 / 易错点</b><br>" + d.note);
    function selectTab(index, focus = false) {
      s.selectAll("[role=tab]")
        .attr("aria-selected", function () {
          return +this.dataset.tab === index;
        })
        .attr("tabindex", function () {
          return +this.dataset.tab === index ? 0 : -1;
        });
      s.selectAll("[role=tabpanel]").attr("hidden", (_, i) =>
        i === index ? null : true,
      );
      if (focus) s.select(`[data-tab="${index}"]`).node().focus();
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new CustomEvent("lesson-tab-change", {detail:{lesson:d.no.replace(".",""),tab:index}}));
    }
    s.selectAll("[role=tab]")
      .on("click", function () {
        selectTab(+this.dataset.tab);
      })
      .on("keydown", function (e) {
        let n = +this.dataset.tab;
        if (e.key === "ArrowRight") n = (n + 1) % 3;
        else if (e.key === "ArrowLeft") n = (n + 2) % 3;
        else if (e.key === "Home") n = 0;
        else if (e.key === "End") n = 2;
        else return;
        e.preventDefault();
        selectTab(n, true);
      });
    s.select(".open-demo").on("click", () => selectTab(2, true));
    cleanupWith(() => {cancelAnimationFrame(probeFrame);s.selectAll(".code-probe,.copy-code,.open-demo,[role=tab]").on("click",null).on("keydown",null);});
  });
}

function splitCode(d) {
  if (d.no === "6.1") {
    const at = d.code.indexOf("/* CSS");
    return [
      { language: "JavaScript", code: d.code.slice(0, at).trim() },
      { language: "CSS", code: d.code.slice(at).trim() },
    ];
  }
  if (d.no === "6.2") {
    const at = d.code.indexOf(".kpi-grid {");
    return [
      { language: "JavaScript", code: d.code.slice(0, at).trim() },
      { language: "CSS", code: d.code.slice(at).trim() },
    ];
  }
  if (d.no === "6.5") {
    const at = d.code.indexOf("const observer");
    return [
      {
        language: "CSS",
        code: d.code
          .slice(0, at)
          .replace(
            "// CSS 响应实际容器，而非假装改变浏览器宽度",
            "/* CSS 响应实际容器，而非假装改变浏览器宽度 */",
          )
          .trim(),
      },
      { language: "JavaScript", code: d.code.slice(at).trim() },
    ];
  }
  return [{ language: "JavaScript", code: d.code }];
}
