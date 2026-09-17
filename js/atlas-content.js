// One curriculum, two languages. All five lessons use the same exhibition.
export const lessons = [
  {
    id: '61', word: 'STRUCTURE',
    title: { zh: '先组织意义，再安排位置', en: 'Organize meaning before position' },
    question: { zh: '15 件作品都在，为什么还不像一张好读的网页？', en: 'All 15 artifacts are here. Why is the page still hard to read?' },
    intro: { zh: '先让读者知道“我在哪里、什么最重要、接下来读什么”。语义区域、分组和留白，先于任何像素坐标。', en: 'First help readers understand where they are, what matters, and what comes next. Semantic regions, grouping, and whitespace come before pixel coordinates.' },
    examples: [
      { title: { zh: '同样 15 件，两个入口', en: 'The same 15 artifacts, two ways in' }, text: { zh: '平铺时，故事线和色觉检查都在争夺第一眼。建立结构后，标题说明展览主题，精选区介绍故事线，主题索引再把读者带入五组作品。作品没有增加，入口却清楚了。', en: 'In a flat arrangement, Storyline and CVD Check compete for the first glance. Add structure: a header introduces the exhibition, a featured region presents Storyline, and a theme index leads into five groups. No artifacts were added, but the entrance is now clear.' } },
      { title: { zh: '留白也在说明关系', en: 'Whitespace explains relationships' }, text: { zh: '把颜色空间、科研配色和色觉检查放近，并与时间主题拉开距离。读者不必逐字读标签，就能感到它们属于同一组。这是接近原则，不是给每张卡再画一个边框。', en: 'Bring Color Space, Scientific Colormap, and CVD Check closer together, with a larger gap before the Time group. Readers can recognize the family before reading every label. This is proximity at work; another border around each card would not explain the relationship as clearly.' } },
      { title: { zh: '把页面拆成五层', en: 'Separate the page into five layers' }, text: { zh: '切到 X-Ray 看区域边界，再展开 3D：页面、语义区域、网格、作品、标签逐层分开。故事线属于内容层，列线属于辅助层；二者重叠，却承担不同职责。立体距离只是教学解释，真实网页仍按文档流排版。', en: 'Use X-Ray to reveal region boundaries, then explode the page into its page, regions, grid, artifacts, and labels. Storyline belongs to the content layer; column guides belong to the overlay. They overlap but serve different purposes. Depth explains the construction; the actual page still uses document flow.' } }
    ],
    takeaway: { zh: '好的布局先建立信息结构，再讨论元素坐标。', en: 'Good layout establishes information structure before element coordinates.' },
    code: `// A stable identity connects content to its element.
const groups = d3.group(modules, d => d.lesson);
const cards = d3.select(".artifact-gallery")
  .selectAll("article")
  .data(modules, d => d.id)
  .join("article")
  .attr("class", "artifact-card")
  .attr("data-lesson", d => d.lesson);

cards.selectAll("h3")
  .data(d => [d])
  .join("h3")
  .text(d => d["title_" + lang]);`,
    codeNotes: { zh: 'd3.group 表达分组关系；稳定的 id 让一件作品对应同一个元素。header、nav、section、footer 负责表达区域含义，CSS 再安排位置。', en: 'd3.group expresses membership, while a stable id connects each artifact to the same element. Semantic header, nav, section, and footer elements express the regions; CSS then arranges them.' },
    experiment: { zh: '依次切换平铺、结构、X-Ray 和 3D。观察：作品不变，哪些线索让“这是一个展厅”变得明确？', en: 'Switch through Flat, Structured, X-Ray, and 3D. The artifacts stay the same: which cues make this feel like an exhibition?' }
  },
  {
    id: '62', word: 'ALIGN',
    title: { zh: '让位置成为阅读语言', en: 'Make position a reading language' },
    question: { zh: '内容已经分组，为什么眼睛仍然不知道往哪里走？', en: 'The content is grouped. Why does the eye still wander?' },
    intro: { zh: '图表用位置帮助比较，网页也用对齐减少寻找。12 列不是必须填满的格子，而是一套可共享的边界。', en: 'Charts use position to support comparison; pages use alignment to reduce searching. Twelve columns are shared boundaries, not twelve boxes that must all be filled.' },
    examples: [
      { title: { zh: '从逐张寻找，到沿线扫描', en: 'From hunting to scanning' }, text: { zh: '散落状态下，找到树布局后，还得重新寻找旁边的科研配色。切到等宽网格，卡片左边缘与标题基线重复出现；眼睛可以沿着一行扫描，而不必为每件作品重新定位。', en: 'In the scattered arrangement, finding Tree Layout does not help you locate Scientific Colormap nearby. Switch to an equal grid: repeated left edges and title baselines give the eye a route along the row instead of a fresh search for every artifact.' } },
      { title: { zh: '改间距，不改作品', en: 'Change spacing, keep the artifacts' }, text: { zh: '把间距从 8px 拉到 40px：前者使相邻图形容易连成一片，后者让分隔更明显，却挤压了预览空间。回到约 20px，再打开列线，观察卡片边界怎样共享同一套节奏。', en: 'Move the gap from 8px to 40px. At the small end, neighboring graphics can run together; at the large end, separation is clear but previews lose room. Return to around 20px and reveal the columns to see how card edges share one rhythm.' } },
      { title: { zh: '运动解释“它去了哪里”', en: 'Motion explains where it went' }, text: { zh: '盯住故事线，再切换布局。FLIP 先记录旧位置，让浏览器完成新网格排版，再从旧位置过渡到新位置。作品身份与内容都没变，连续运动把两次排版连接起来；减少动态效果时则直接展示结果。', en: 'Keep your eye on Storyline while switching layouts. FLIP records the old position, lets the browser lay out the new grid, then animates from the old position to the new one. Identity and content stay intact; motion connects the arrangements. With reduced motion enabled, show the result immediately.' } }
    ],
    takeaway: { zh: '网格不是装饰，它把位置变成稳定的阅读语言。', en: 'A grid turns position into a consistent reading language.' },
    code: `/* CSS owns the final positions. */
.artifact-gallery {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--gallery-gap, 20px);
}

// Record before changing the layout.
const before = new Map(cards.nodes().map(node => [
  node.dataset.id, node.getBoundingClientRect()
]));
gallery.classed("editorial", true);
requestAnimationFrame(() => {
  cards.each(function(d) {
    const first = before.get(d.id);
    const last = this.getBoundingClientRect();
    d3.select(this)
      .style("transform", "translate(" +
        (first.left - last.left) + "px," +
        (first.top - last.top) + "px)")
      .transition().duration(650)
      .style("transform", null);
  });
});`,
    codeNotes: { zh: 'CSS 段定义真实网格，JS 段演示 FLIP 的位置过渡。生产实现还需在减少动态效果时跳过动画，并处理连续切换时未结束的过渡。', en: 'The CSS defines the actual grid; the JavaScript demonstrates the position part of FLIP. A production implementation also skips animation for reduced motion and handles interrupted transitions.' },
    experiment: { zh: '从散落切到等宽和模块网格，打开列线与基线，再改变间距。始终追踪同一件故事线作品。', en: 'Move from Scatter to Equal and Modular Grid, reveal columns and baselines, then adjust the gap. Keep tracking the same Storyline artifact.' }
  },
  {
    id: '63', word: 'COMPOSE',
    title: { zh: '把空间交给值得展开的内容', en: 'Give content the room it needs' },
    question: { zh: '故事线、树布局与配色样例，真的应该永远一样大吗？', en: 'Should Storyline, Tree Layout, and a colormap always be the same size?' },
    intro: { zh: '编辑式构图把重要度、纵横比与信息密度转化为空间选择。这里的面积表达展示需求，不是数据数量的比例。', en: 'Editorial composition translates priority, aspect ratio, and information density into spatial choices. Area expresses presentation needs here, not a proportional data quantity.' },
    examples: [
      { title: { zh: '给故事线一条展开的跑道', en: 'Give Storyline room to unfold' }, text: { zh: '等宽模式里，每件作品都占 3 列，故事线的时间方向被压短。编辑模式让高优先级、横向的故事线占 8 列，线条的交会更容易分辨。它不是“数据量变成了更多”，而是获得了更合适的展示空间。', en: 'In Equal mode, every artifact occupies three columns, compressing Storyline’s time direction. Editorial mode gives a high-priority, wide Storyline eight columns, making its crossings easier to distinguish. Its data has not grown; its presentation space now suits its shape.' } },
      { title: { zh: '树需要分支，色带需要方向', en: 'Branches need room; color needs direction' }, text: { zh: '树布局的节点与文字需要留出分支间距；科研配色则需要让连续色带保持可读。即使两者优先级相同，也要观察纵横比和密度：列跨度解决横向空间，卡片高度与预览细节解决拥挤。', en: 'Tree Layout needs separation between branches and labels, while Scientific Colormap needs a readable color progression. Even at the same priority, aspect ratio and density matter: column span provides horizontal space, while card height and preview detail address crowding.' } },
      { title: { zh: '一次编辑，整页回应', en: 'One editorial decision changes the page' }, text: { zh: '选中故事线，把重要度从高降到低：它从 8 列退回 3 列，邻近作品补入空间。再升回高，观察全页如何重排。优先级是策展决定，不是作品质量分数；同一件作品可以服务不同的阅读重点。', en: 'Select Storyline and lower its priority from High to Low: it moves from eight columns to three, and neighboring artifacts fill the space. Raise it again and watch the page recompose. Priority is a curatorial decision, not a quality score; the same artifact can serve different reading goals.' } }
    ],
    takeaway: { zh: '页面布局不仅安排位置，也通过空间大小表达内容层级。', en: 'Layout communicates hierarchy through space as well as position.' },
    code: `const spanScale = d3.scaleOrdinal()
  .domain([1, 2, 3]).range([3, 4, 6]);

function getSpan(artifact) {
  if (artifact.priority === 3 && artifact.aspect === "wide") {
    return 8;
  }
  return spanScale(artifact.priority);
}

cards
  .style("grid-column", d => "span " + getSpan(d))
  .attr("data-density", d => d.density);

/* Density controls breathing room, not a data value. */
.artifact-card[data-density="high"] {
  --preview-height: 240px;
}`,
    codeNotes: { zh: '这段是桌面构图规则：priority 决定基础跨度，wide 的高优先级作品扩到 8 列，density 提供预览高度线索。实际窄屏跨度会在 6.5 中重新制定。', en: 'These are desktop rules: priority sets the base span, wide high-priority artifacts expand to eight columns, and density informs preview height. Narrower containers need the revised spans introduced in 6.5.' },
    experiment: { zh: '比较等宽与编辑构图，选中故事线，试一次低 → 高的重要度切换。观察它和邻居，而不只看数字。', en: 'Compare Equal and Editorial composition, select Storyline, and change its priority from Low to High. Watch both the artifact and its neighbors, not just the number.' }
  },
  {
    id: '64', word: 'FOCUS',
    title: { zh: '放大焦点，留住来路', en: 'Enlarge the focus, retain the context' },
    question: { zh: '想看清故事线时，其他 14 件作品应该去哪里？', en: 'When Storyline needs a closer look, where should the other 14 artifacts go?' },
    intro: { zh: '详情不一定意味着离开页面。把当前作品变成焦点，其余作品变成可达的上下文，读者既能深入，也知道自己从哪里来。', en: 'Detail does not have to mean leaving the page. Let the selected artifact become the focus and keep the others reachable as context, so readers can explore without losing their bearings.' },
    examples: [
      { title: { zh: '从浏览到阅读，只重分配空间', en: 'From browsing to reading by reallocating space' }, text: { zh: '点故事线：桌面中它获得 8 列，其他作品进入 4 列上下文区域。展开的解释和大预览帮助阅读交会关系；旁边的树布局与配色仍可点击，不必返回首页才能继续探索。', en: 'Select Storyline: on desktop it takes eight columns, while the other artifacts occupy a four-column context area. An expanded explanation and larger preview support close reading; Tree Layout and Scientific Colormap remain available beside it, without a trip back to the home page.' } },
      { title: { zh: '同一张卡，信息分层出现', en: 'The same card reveals another layer' }, text: { zh: '浏览时，短标题和缩略图足以帮助选择；聚焦后再显示更长解释、来源章节和相关概念。这样故事线能讲清连接与时间，周围卡片也不会被长段文字淹没。这叫渐进披露。', en: 'While browsing, a short title and thumbnail are enough to choose an artifact. Focus reveals a longer explanation, its source lesson, and related concepts. Storyline can explain connection and time without surrounding cards becoming walls of text. This is progressive disclosure.' } },
      { title: { zh: '身份不变，位置才有连续性', en: 'Stable identity makes movement legible' }, text: { zh: '从故事线切到树布局，原来的故事线退回上下文，树布局进入焦点。以 id 绑定的 DOM 元素继续存在，而不是销毁后重画；FLIP 让变化可追踪。再次选择焦点或关闭聚焦，整组作品恢复浏览状态。', en: 'Switch from Storyline to Tree Layout: Storyline returns to context and Tree Layout becomes the focus. DOM elements keyed by id remain the same instead of being destroyed and redrawn; FLIP makes the change traceable. Select the focus again or clear it to return to browsing.' } }
    ],
    takeaway: { zh: '交互不仅改变图表状态，也可以重新分配页面空间。', en: 'Interaction can reallocate page space, not just change a chart.' },
    code: `const state = { focusedId: null };
const cards = gallery.selectAll("article")
  .data(modules, d => d.id)
  .join("article");

// Bind the action to a native button for keyboard support.
cards.select("button").on("click", (_, d) => {
  state.focusedId = state.focusedId === d.id ? null : d.id;
  gallery.classed("focus-mode", Boolean(state.focusedId));
  cards
    .classed("is-focus", d => d.id === state.focusedId)
    .classed("is-context", d => Boolean(state.focusedId)
      && d.id !== state.focusedId);
  renderFocusLayout();
});`,
    codeNotes: { zh: 'focusedId 只记录当前焦点，keyed join 保留元素身份。原生按钮支持键盘操作；布局函数负责测量、切换区域与过渡，不必重建整张展厅。', en: 'focusedId records the current focus, and the keyed join retains element identity. Native buttons support keyboard activation; the layout function handles measurement, regions, and transitions without rebuilding the exhibition.' },
    experiment: { zh: '聚焦故事线，再从上下文切到树布局，最后关闭聚焦。留意每次变化后，你是否仍能找到刚才看的作品。', en: 'Focus Storyline, choose Tree Layout from the context, then clear the focus. After each change, check whether you can still find the artifact you were just reading.' }
  },
  {
    id: '65', word: 'REFLOW',
    title: { zh: '重排阅读路径，而不只是缩小', en: 'Reflow the reading path, not just the boxes' },
    question: { zh: '宽屏里的编辑式展厅，到了 390px 手机应该怎样读？', en: 'How should a wide-screen editorial exhibition read on a 390px phone?' },
    intro: { zh: '容器变窄时，列数、跨度、顺序和信息密度一起改变。响应式设计保护的是阅读意图，不是桌面截图的外形。', en: 'As the container narrows, columns, spans, order, and information density change together. Responsive design preserves the reading intent rather than the shape of a desktop screenshot.' },
    examples: [
      { title: { zh: '宽度来自展厅，不来自设备名字', en: 'Respond to the exhibition width' }, text: { zh: '在工作台把容器从 1200px 缩到 900px，再到 390px：12 列变为 8 列，再变为 4 列中的单列卡片。即使浏览器窗口很宽，嵌入的展厅也可能很窄，因此判断依据是容器实际宽度。', en: 'In the studio, reduce the container from 1200px to 900px, then to 390px: twelve columns become eight, then a four-column grid with cards spanning the full width. An embedded exhibition can be narrow even in a wide browser, so the container’s measured width matters.' } },
      { title: { zh: '少画一些，保留可辨认的形状', en: 'Draw less, keep the recognizable idea' }, text: { zh: '手机上，把日历预览概括成 12 个块，把树布局收成两层，把故事线简化为五条线的示意。并非把同一张密图缩小：每个预览仍能告诉你“这是什么”，详细解释留给聚焦状态。', en: 'On mobile, summarize the calendar in twelve blocks, reduce the tree to two levels, and show Storyline as a simplified five-line schematic. This is not the same dense graphic scaled down: each preview still tells you what it represents, with fuller explanations available in focus.' } },
      { title: { zh: '视觉顺序与实际阅读顺序一起变', en: 'Make visual order and reading order agree' }, text: { zh: '桌面可以先看精选故事线，再浏览相关作品；手机回到 Lesson 1 → 5 的教学顺序，已有焦点则先读焦点。打开顺序标记并用键盘检查：只改 CSS order 不会同步改变 DOM 顺序，数据排序后的 join.order() 才能让两者一致。', en: 'Desktop can lead with a featured Storyline and then related artifacts. Mobile returns to the Lesson 1–5 teaching sequence, with an active focus first. Reveal the reading-order labels and check with the keyboard: CSS order alone does not update DOM order; sorting the data and calling join.order() keeps them aligned.' } }
    ],
    takeaway: { zh: '响应式重排的不只是盒子，也是阅读路径与信息密度。', en: 'Responsive design reorganizes the reading path and information density as well as boxes.' },
    code: `/* CSS reacts to the actual container. */
.atlas-shell { container-type: inline-size; }
@container (max-width: 1099px) {
  .artifact-gallery { grid-template-columns: repeat(8, 1fr); }
}
@container (max-width: 679px) {
  .artifact-gallery { grid-template-columns: repeat(4, 1fr); }
}

const observer = new ResizeObserver(([entry]) => {
  const width = entry.contentRect.width;
  const detail = width >= 1100 ? "full"
    : width >= 680 ? "medium" : "compact";
  const order = width < 680 ? "mobile_order" : "desktop_order";
  const sorted = [...modules].sort((a, b) => a[order] - b[order]);
  gallery.selectAll("article")
    .data(sorted, d => d.id).join("article").order();
  updatePreviewDetail(detail);
});
observer.observe(atlasShell);`,
    codeNotes: { zh: 'CSS 负责列数；ResizeObserver 负责读取宽度、选择预览细节并同步 DOM 顺序。示例展示无焦点时的排序；有焦点时应先放焦点，再按当前顺序排列上下文。', en: 'CSS controls the columns; ResizeObserver reads width, chooses preview detail, and synchronizes DOM order. This example shows ordering without a focus; with an active focus, put it first and then order the context for the current width.' },
    experiment: { zh: '依次试 1200、900、390px，打开阅读顺序标记。比较故事线、日历和树的预览，再聚焦一件作品，观察它在手机中移到哪里。', en: 'Try 1200, 900, and 390px with reading-order labels enabled. Compare Storyline, Calendar, and Tree previews, then focus an artifact and see where it moves on mobile.' }
  }
];
