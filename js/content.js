export const lessons = [
  {
    id: "lesson61",
    no: "6.1",
    short: "页面骨架",
    title: "网页不是一堆 <div>",
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
        "Flexbox：把一组信息排成一队",
        "KPI 行使用 display:flex、gap 和 flex-wrap。空间不足时让卡片换行，而不是让五个数字越挤越小。Flex 适合一维排列；下一节再处理跨行跨列。",
      ],
    ],
    challenge:
      "打开 X-Ray，点击 Main View，再调节内边距。观察内容区域缩小了，外部宽度为什么可以保持不变？",
    code: `// 数据生成内容，CSS 决定区域排版
const summary = [
  { label: "总人数", value: students.length },
  { label: "平均年龄", value: d3.mean(students, d => d.age) }
];
d3.select(".skeleton-kpis").selectAll("article")
  .data(summary, d => d.label).join("article")
  .text(d => d.label + "：" + d.value);

// 点击区域时测量实际布局（相对视口）
const box = element.getBoundingClientRect();
const padding = getComputedStyle(element).padding;
console.log(box.x, box.y, box.width, box.height, padding);

/* CSS：让浏览器完成盒模型与排版 */
* { box-sizing: border-box; }
.skeleton-kpis { display: flex; gap: 12px; flex-wrap: wrap; }
.skeleton-kpis article { flex: 1 1 100px; padding: 16px; }`,
    note: "getBoundingClientRect() 的 x/y 相对当前视口，滚动后会改变。padding 来自计算样式，不能从矩形宽度猜测。D3 负责生成卡片内容，CSS 负责它们的大小与换行。",
  },
  {
    id: "lesson62",
    no: "6.2",
    short: "网格布局",
    title: "网格建立阅读秩序",
    subtitle: "为什么“对齐”比“装饰”更重要",
    tags: ["12 Columns", "Alignment", "Data Join"],
    question: "同样五张 KPI 卡片，为什么一种布局要找半天，另一种一眼就能扫完？",
    before: "位置随意，卡片边缘不齐，每次阅读都要重新寻找。",
    after: "共享列线和间距，重要信息获得合适的跨度。",
    summary: "网格真正解决的不是“整齐”，而是建立稳定的阅读秩序。",
    intro:
      "我们把上一节的 KPI 拿出来，做一个小实验：在 Random 模式里找“平均年龄”，再在 12-column Grid 模式里找一次。内容完全相同，寻找的路径却变短了。图表内部的位置帮助读数，图表外部的位置帮助组织阅读。",
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
        "跨度 3 + 2 + 3 + 2 + 2 = 12。总人数和平均年龄各占3列，其他各占2列。所有卡片对齐同一套列线；gap 是卡片间距，不是第13列。",
      ],
      [
        "Data Join：让卡片跟着数据生长",
        "把五个指标存成数组，D3 的 join 为每个对象生成 article。用 label 作 key，更新时就能识别“平均年龄”仍然是同一张卡，避免无意义重建。",
      ],
    ],
    challenge:
      "依次切换四种布局。再改变 gap：空隙增加时，卡片会变窄，但 12 列总宽仍然固定。",
    code: `const kpis = [
  { label: "总人数", value: students.length, span: 3 },
  { label: "班级数", value: new Set(students.map(d => d.class_name)).size, span: 2 },
  { label: "平均年龄", value: d3.mean(students, d => d.age).toFixed(1), span: 3 },
  { label: "男生比例", value: d3.format(".1%")(
      students.filter(d => d.gender === "男").length / students.length), span: 2 },
  { label: "省份", value: new Set(students.map(d => d.province)).size, span: 2 }
];
d3.select(".kpi-grid").selectAll(".kpi")
  .data(kpis, d => d.label).join("article")
  .attr("class", "kpi")
  .style("--span", d => d.span)
  .text(d => d.label + "：" + d.value);

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
}
.kpi { grid-column: span var(--span); }`,
    note: "minmax(0, 1fr) 允许网格列缩到内容固有宽度以下，避免长文本撑破容器。span 是布局元数据；具体坐标交给 CSS Grid，不用 D3 手工计算整个网页的位置。",
  },
  {
    id: "lesson63",
    no: "6.3",
    short: "数据驱动布局",
    title: "数据也可以决定页面面积",
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
        "切换前后保留班级颜色与 key，用800ms过渡展示同一个矩形如何移动和变形。动画说明对应关系，不是为了让页面一直动。",
      ],
      [
        "何时不用 Treemap？",
        "如果任务是精确比较22人与18人的差别，共用基线的条形图通常更直接。Treemap 适合紧凑地看部分与整体；普通网页区域也不必都按数据面积分配。",
      ],
    ],
    challenge:
      "先猜最大的班占多少，再切到 Data Layout。观察26人区域与14人区域；比较它们的面积，而不只是宽度。",
    code: `const classCounts = d3.rollups(students,
  rows => rows.length, d => d.class_name);
const root = d3.hierarchy({
  name: "students",
  children: classCounts.map(([name, value]) => ({ name, value }))
}).sum(d => d.value || 0);

d3.treemap().size([width, height]).paddingInner(0)(root);

const cells = svg.selectAll("g.cell")
  .data(root.leaves(), d => d.data.name).join("g")
  .attr("class", "cell");
cells.transition().duration(800).ease(d3.easeCubicInOut)
  .attr("transform", d => 
    "translate(" + d.x0 + "," + d.y0 + ")");
cells.selectAll("rect").data(d => [d]).join("rect")
  .transition().duration(800)
  .attr("width", d => d.x1 - d.x0)
  .attr("height", d => d.y1 - d.y0);`,
    note: "本实验使用无间隙的布局矩形，细描边只帮助区分边界。若使用 paddingInner(6)，可见色块面积就只是近似比例。尊重 prefers-reduced-motion 时，将过渡时长设为0。",
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
    after: "一次选择，同步更新年龄、性别、兴趣与学生列表。",
    summary: "多视图共享状态、共同回答问题，才真正形成 Coordinated Views。",
    intro:
      "现在你想知道：数据科学1班有多少人？年龄集中在哪？兴趣是否都相同？左边的 Treemap 保留全体4个班，右边用同一份筛选结果回答这些局部问题。它们之间的“联动”比图表数量更重要。",
    concepts: [
      [
        "Overview + Detail：空间分工",
        "左侧告诉你选中的班在哪里、有多大；右侧告诉你它由哪些学生组成。点击软件工程1班，右侧人数应立即变成26，列表也应有26条，而不是只更换标题。",
      ],
      [
        "共享状态：一个选择，多个订阅者",
        "selectedClass 保存当前班级。d3.dispatch 广播 selectClass 事件；统计、年龄图、兴趣图和列表都监听它。这样不需要各个图互相调用，避免更新遗漏。",
      ],
      [
        "Focus + Context：放大但不消失",
        "切到关注模式后，选中班级获得更大空间，其他三个班依然保留并弱化。此时面积表示注意力分配，已不再表示人数；页面必须明确提示这个语义变化。",
      ],
      [
        "比较要公平：保持共同坐标",
        "年龄图使用17、18、19、20四个整数中心的箱子，纵轴上限固定为全体峰值。切换班级时，同样高的柱子仍然代表同样多的人，避免自动缩放带来错觉。",
      ],
    ],
    challenge:
      "选中任一班级，核对人数、性别总数、年龄柱之和与列表条数。再切 Focus + Context：其余班级仍能被点击吗？",
    code: `const state = { selectedClass: null };
const dispatch = d3.dispatch("selectClass");
const selectedRows = () => students.filter(d =>
  !state.selectedClass || d.class_name === state.selectedClass);

dispatch.on("selectClass.state", name => {
  state.selectedClass = name;
});
dispatch.on("selectClass.detail", () => updateDetail(selectedRows()));
dispatch.on("selectClass.age", () => updateAgeChart(selectedRows()));
dispatch.on("selectClass.gender", () => updateGenderChart(selectedRows()));
dispatch.on("selectClass.list", () => updateStudentList(selectedRows()));

cells.on("click", (event, d) => {
  dispatch.call("selectClass", null, d.data.name);
});
// 列表与图形可订阅同一个事件，重置广播 null
resetButton.on("click", () => dispatch.call("selectClass", null));`,
    note: "dispatch 按注册顺序调用监听器，所以先更新状态，再重绘视图。所有数字从 selectedRows() 计算，不把26/22/18/14写死到详情中。关注模式的放大权重与真实人数应分开保存。",
  },
  {
    id: "lesson65",
    no: "6.5",
    short: "响应式叙事",
    title: "页面会适应，也会讲故事",
    subtitle: "Responsive Visual Story",
    tags: ["ResizeObserver", "Sticky", "Scrollytelling"],
    question: "从1440px桌面到390px手机，应该把一切缩小，还是重新组织阅读顺序？",
    before: "整个桌面按比例缩小，图表和文字在手机上无法读。",
    after: "KPI换行、整体与细节上下排列，故事按阅读进度展开。",
    summary: "好的页面不仅适应屏幕，还能够控制信息出现的顺序。",
    intro:
      "把桌面观察站塞进手机，五个指标和两栏图表会同时争夺390px。我们不缩小字体，而是改变信息的排队方式：先总量，再整体，再详情。接着，用滚动把同一个观察站变成四步数据故事。",
    concepts: [
      [
        "响应式：重新组织，不是缩小截图",
        "Desktop 同行显示5个KPI，整体与详情并排；Tablet 的KPI排两列，图表上下排；Mobile 每行一个KPI。阅读层级保留，空间结构改变。",
      ],
      [
        "容器宽度：比设备名称更可靠",
        "Viewport Machine 改变的是内部容器的宽度。CSS container query 按容器宽度切换列数，ResizeObserver 用实际可用宽度重新计算 SVG 的布局。",
      ],
      [
        "viewBox：坐标系与显示尺寸分离",
        "viewBox 定义SVG内部坐标，width:100%让它填满容器。仅设置viewBox仍可能让标签随图一起缩小，因此观察尺寸变化后重新布局，保持可读字号。",
      ],
      [
        "滚动叙事：让视觉跟着问题走",
        "视觉区sticky，文字按“整体→班级差异→年龄集中→进入班级”前进。IntersectionObserver 切换状态；反向滚动时也要回到对应步骤，不能只向前播放。",
      ],
    ],
    challenge:
      "把模拟宽度从1440拖到390，注意KPI与详情的重排。继续向下滚动，或点四个故事按钮，观察同一张图怎样逐步回答不同问题。",
    code: `// CSS 响应实际容器，而非假装改变浏览器宽度
.viewport-page { container-type: inline-size; }
@container (max-width: 900px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .dashboard-kpis { grid-template-columns: repeat(2, 1fr); }
}
@container (max-width: 520px) {
  .dashboard-kpis { grid-template-columns: 1fr; }
}

const observer = new ResizeObserver(entries => {
  const width = entries[0].contentRect.width;
  if (width > 0) render(width); // 重新计算坐标，保留字号
});
observer.observe(container);
svg.attr("viewBox", [0, 0, width, height]);

const storyObserver = new IntersectionObserver(entries => {
  entries.filter(e => e.isIntersecting).forEach(entry => {
    renderStory(+entry.target.dataset.step);
  });
}, { rootMargin: "-25% 0px -35% 0px", threshold: 0 });
document.querySelectorAll(".story-step").forEach(el => storyObserver.observe(el));`,
    note: "本页大宽度预览使用可横向滚动的画布，显示真实1440px布局；不会把桌面画面缩小冒充手机。窄屏上故事图缩成适合视口的sticky区域，仍可用步骤按钮操作。",
  },
];

export function buildCourse() {
  const cards = d3
    .select("#knowledge-cards")
    .selectAll("a")
    .data(lessons)
    .join("a")
    .attr("class", "knowledge-card")
    .attr("href", (d) => "#" + d.id);
  cards.html(
    (d) =>
      `<div class="card-art" data-art="${d.no}"></div><div class="card-body"><span class="card-number">${d.no} / KNOWLEDGE ${d.no.slice(-1)}</span><h3>${d.short}</h3><p>${d.subtitle}</p><div class="card-tags">${d.tags.map((t) => `<span>${t}</span>`).join("")}</div><div class="card-link">进入实验<span>↗</span></div></div>`,
  );
  d3.select("#rail-links")
    .selectAll("a")
    .data(lessons)
    .join("a")
    .attr("href", (d) => "#" + d.id)
    .text((d) => d.no + " " + d.short);
  const sections = d3
    .select("#lessons")
    .selectAll("section")
    .data(lessons)
    .join("section")
    .attr("id", (d) => d.id)
    .attr("class", "lesson");
  sections.each(function (d) {
    const s = d3.select(this);
    s.html(
      `<div class="lesson-header"><div class="lesson-kicker"><b>${d.no}</b><span>TRANSFORMATION 0${d.no.slice(-1)} / ${d.subtitle}</span></div><h2></h2><p class="lesson-question">${d.question}</p></div><div class="compare"><div class="compare-item before"><div class="compare-label">BEFORE / 改变之前</div><svg aria-label="${d.short}改进前示意"></svg><p>${d.before}</p></div><div class="compare-item after"><div class="compare-label">AFTER / 改变之后</div><svg aria-label="${d.short}改进后示意"></svg><p>${d.after}</p></div></div><div class="tabs" role="tablist" aria-label="${d.no}学习内容">${["📖 讲解", "⌨ 关键代码", "▷ Demo"].map((t, i) => `<button role="tab" id="${d.id}-tab${i}" aria-controls="${d.id}-panel${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${i}">${t}</button>`).join("")}</div><div class="tab-panel explanation" id="${d.id}-panel0" role="tabpanel" aria-labelledby="${d.id}-tab0"><h3>从一个真实的阅读问题出发</h3><p>${d.intro}</p><div class="concept-pairs">${d.concepts.map(([h, p]) => `<div class="concept"><h4>${h}</h4><p>${p}</p></div>`).join("")}</div><div class="try-box"><p><b>动手验证</b><br>${d.challenge}</p><button class="open-demo">打开本节 Demo →</button></div></div><div class="tab-panel code-panel" id="${d.id}-panel1" role="tabpanel" aria-labelledby="${d.id}-tab1" hidden><div class="code-heading"><span>关键片段 · ${d.no} / D3.js + CSS</span><button class="copy-code">复制代码</button></div><pre><code></code></pre><div class="code-note"><b>为什么这样写 / 易错点</b><br>${d.note}</div></div><div class="tab-panel demo-panel" id="${d.id}-panel2" role="tabpanel" aria-labelledby="${d.id}-tab2" hidden><p class="demo-guide">${d.challenge}</p><div id="demo${d.no.replace(".", "")}"></div></div><div class="lesson-summary"><span>本节带走</span>${d.summary}</div>`,
    );
    s.select(".lesson-header h2").text(d.title);
    const blocks = splitCode(d);
    const panel = s.select(".code-panel");
    panel.html("");
    blocks.forEach((block) => {
      const h = panel.append("div").attr("class", "code-heading");
      h.append("span").text(d.no + " / " + block.language + " · 关键片段");
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
