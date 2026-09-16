(() => {
  'use strict';

  const modules = [
    {
      slug: 'DIAGNOSE',
      nav: ['6.1 诊断布局', '6.1 Diagnose'],
      title: ['先发现问题，再选择工具', 'Find the problem before choosing a tool'],
      question: ['CampusHub 看似“什么都有”，为什么仍然难用？', 'CampusHub seems to have everything. Why is it still hard to use?'],
      concept: ['布局是信息结构的可视化', 'Layout visualizes information structure'],
      body: [
        ['页面布局的第一步不是写代码，而是识别信息的主次、分组与阅读顺序。页面即使没有溢出，也可能因为层级弱、对齐随机、间距无规律而难以理解。', 'The first step is not writing CSS. It is identifying hierarchy, grouping, and reading order. A page can fit the viewport and still be hard to understand when hierarchy is weak, alignment is arbitrary, and spacing has no pattern.'],
        ['用“现象 → 问题 → 原理 → 决策 → 结果”诊断页面。布局健康度只是一种教学启发，不是正式 Web 标准。', 'Diagnose the page through “symptom → problem → principle → decision → result.” Layout health is a teaching heuristic, not a formal Web standard.']
      ],
      points: [[['层级 Hierarchy','用户先看到最重要的任务'],['Hierarchy','The primary task should be seen first']],[['邻近 Proximity','相关内容在空间上形成组'],['Proximity','Related content forms a spatial group']],[['对齐 Alignment','共享边界建立秩序'],['Alignment','Shared edges create order']],[['留白 Whitespace','让信息关系可被看见'],['Whitespace','Makes relationships perceptible']]],
      code: `.page {\n  max-width: 72rem;\n  margin-inline: auto;\n  padding-inline: clamp(1rem, 4vw, 3rem);\n}`,
      notes: [[['max-width','控制舒适阅读宽度'],['max-width','Controls a comfortable reading width']],[['margin-inline','让容器居中'],['margin-inline','Centers the container']],[['clamp()','让边距随空间流动'],['clamp()','Lets padding respond continuously']]]
    },
    {
      slug: 'FLOW', nav: ['6.2 正常流','6.2 Normal Flow'], title: ['先相信文档，再打破文档','Trust the document before breaking it'],
      question: ['没有任何布局代码时，浏览器已经做了什么？','What is the browser already doing before layout code is added?'], concept: ['Normal Flow 是默认的布局算法','Normal Flow is the default layout algorithm'],
      body: [[ '块级内容自然向下排列，行内内容在可用空间中换行。这不是“没有布局”，而是一套能适应内容长度、字体和视口变化的稳健算法。','Blocks stack vertically and inline content wraps within available space. This is not “no layout”; it is a robust algorithm that adapts to content length, type size, and viewport changes.'],['只有当视觉关系无法由自然顺序表达时，才引入 Flexbox、Grid 或定位。绝对定位会让元素脱离正常流，不应承担主要页面结构。','Introduce Flexbox, Grid, or positioning only when natural order cannot express the relationship. Absolute positioning removes elements from normal flow and should not carry the main page structure.']],
      points: [[['源顺序 Source order','HTML 顺序表达含义'],['Source order','HTML order expresses meaning']],[['阅读顺序 Reading order','视觉路径与内容逻辑一致'],['Reading order','The visual path matches content logic']],[['内容增长 Content growth','文字变长时页面仍成立'],['Content growth','The page survives longer text']],[['渐进增强 Enhancement','在可靠基础上增加布局'],['Enhancement','Add layout over a reliable base']]],
      code: `<main>\n  <h1>Campus events</h1>\n  <section>Featured events</section>\n  <aside>Popular clubs</aside>\n</main>\n\nmain > * + * { margin-block-start: 1.5rem; }`,
      notes: [[['语义顺序','先写合理的 HTML 阅读顺序'],['Semantic order','Start with meaningful HTML order']],[['相邻选择器','用关系定义垂直节奏'],['Adjacent selector','Defines vertical rhythm relationally']],[['渐进增强','窄屏无需重置结构'],['Progressive enhancement','Small screens need no structural reset']]]
    },
    {
      slug: 'FLEXBOX', nav: ['6.3 Flexbox','6.3 Flexbox'], title: ['一维问题，用一维模型解决','Solve one-dimensional problems with a one-dimensional model'],
      question: ['导航栏为什么适合 Flexbox，而活动列表未必适合？','Why does Flexbox suit navigation, but not every card collection?'], concept: ['Flexbox 管理一条轴上的分配与对齐','Flexbox manages distribution and alignment on one axis'],
      body: [['CampusHub 顶部导航只需横向排列、分配剩余空间并保持纵向对齐，因此是典型的一维问题。关键不是背属性，而是先确认主轴和交叉轴。','CampusHub navigation needs horizontal arrangement, leftover-space distribution, and vertical alignment. The key is identifying the main and cross axes, not memorizing properties.'],['gap 把间距定义为容器规则；margin 属于单个元素。把重复关系交给容器，组件更容易复用。','gap defines spacing as a container rule; margin belongs to an individual item. Giving repeated relationships to the container makes components easier to reuse.']],
      points: [[['主轴 Main axis','排列与剩余空间分配'],['Main axis','Arrangement and free-space distribution']],[['交叉轴 Cross axis','项目在另一方向对齐'],['Cross axis','Alignment in the other direction']],[['弹性 Flexibility','项目可以增长或收缩'],['Flexibility','Items may grow or shrink']],[['换行 Wrapping','每一行仍是一维计算'],['Wrapping','Each line is still calculated in one dimension']]],
      code: `.site-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 1.5rem;\n}\n\n.nav { margin-inline-start: auto; }`,
      notes: [[['display: flex','建立一维布局上下文'],['display: flex','Creates a one-dimensional context']],[['align-items','控制交叉轴关系'],['align-items','Controls cross-axis alignment']],[['justify-content','分配主轴剩余空间'],['justify-content','Distributes main-axis free space']],[['gap','把间距定义成系统规则'],['gap','Makes spacing a system rule']]]
    },
    {
      slug: 'GRID', nav: ['6.4 CSS Grid','6.4 CSS Grid'], title: ['二维关系，需要共同坐标系','Two-dimensional relationships need shared coordinates'],
      question: ['卡片和侧栏同时需要行列对齐，该选什么？','Cards and a sidebar need row and column alignment. What should we choose?'], concept: ['Grid 将二维结构显式化','Grid makes two-dimensional structure explicit'],
      body: [['活动卡片区既要列宽一致，又要让多行内容保持对齐；主内容与侧栏也需要明确的列关系。这类二维问题适合 Grid。','The card area needs consistent columns across rows; main content and sidebar also need an explicit column relationship. These are two-dimensional problems.'],['fr 表示剩余空间的比例，minmax(0, 1fr) 允许内容列真正收缩；auto-fit 与 minmax 让内容需求决定布局，而不是枚举设备。','fr represents a share of remaining space, while minmax(0, 1fr) lets a content column truly shrink. auto-fit with minmax lets content needs drive the layout.']],
      points: [[['轨道 Tracks','列与行构成共享坐标系'],['Tracks','Rows and columns create coordinates']],[['区域 Areas','用名称表达页面结构'],['Areas','Names communicate page structure']],[['最小约束 Minimum','保护内容可读下限'],['Minimum','Protects the readable lower bound']],[['剩余空间 Fraction','按关系分配可用空间'],['Fraction','Distributes available space relationally']]],
      code: `.main-layout {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) 18rem;\n  gap: 2rem;\n}\n.event-grid {\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n}`,
      notes: [[['minmax(0, 1fr)','主列可收缩并占据剩余空间'],['minmax(0, 1fr)','Lets the main track shrink and fill free space']],[['18rem','侧栏以内容需求为约束'],['18rem','Constrains the sidebar by content needs']],[['auto-fit','按可用空间决定列数'],['auto-fit','Lets available space decide column count']]]
    },
    {
      slug: 'SYSTEM', nav: ['6.5 间距系统','6.5 Spacing System'], title: ['让空间表达关系，而非填补空白','Use space to express relationships, not fill emptiness'],
      question: ['为什么“差不多的间距”仍会让页面显得凌乱？','Why does roughly similar spacing still feel disorderly?'], concept: ['Alignment、Proximity 与 Rhythm 共同构建秩序','Alignment, Proximity, and Rhythm create order together'],
      body: [['间距不是装饰。组内距离应小于组间距离，稳定尺度让用户无需边框也能理解分组；对齐线让不同模块共享视觉骨架。','Spacing is not decoration. Distances within a group should be smaller than distances between groups. Alignment gives separate modules a common visual skeleton.'],['使用少量 spacing tokens，而不是每次凭感觉输入新数值。这样既提高一致性，也让响应式调整更可控。','Use a small set of spacing tokens instead of inventing a new value each time. Consistency improves and responsive adjustments become easier to control.']],
      points: [[['4 / 8','图标与紧密元素'],['4 / 8','Icons and tightly related items']],[['16','同组内容'],['16','Content within a group']],[['24 / 32','模块之间'],['24 / 32','Between modules']],[['48 / 64','页面章节'],['48 / 64','Between page sections']]],
      code: `:root {\n  --space-1: .25rem;\n  --space-2: .5rem;\n  --space-4: 1rem;\n  --space-8: 2rem;\n}\n.card { padding: var(--space-4); }\n.card-list { gap: var(--space-8); }`,
      notes: [[['Token','有限选择带来一致节奏'],['Token','Limited choices create consistent rhythm']],[['组内 < 组间','距离本身传达关系'],['Within < between','Distance itself communicates relationships']],[['共享边界','对齐减少视觉噪声'],['Shared edges','Alignment reduces visual noise']]]
    },
    {
      slug: 'RESPONSIVE', nav: ['6.6 响应式','6.6 Responsive'], title: ['让内容决定断点','Let content determine the breakpoint'],
      question: ['响应式是适配几种设备，还是管理连续变化？','Is responsiveness about a few devices, or continuous change?'], concept: ['Responsive Design 是关系的连续适应','Responsive Design continuously adapts relationships'],
      body: [['固定布局假设内容和屏幕不变；流动容器承认空间是连续变量。断点应出现在内容开始拥挤、层级或可读性受损的位置。','A fixed layout assumes content and screens never change; a fluid container accepts that space is continuous. A breakpoint belongs where content becomes crowded or readability suffers.'],['现代组件还能根据自身容器而非整个视口响应。同一张活动卡片在侧栏与主区域可以自动选择纵向或横向形态。','Modern components can respond to their own container rather than the viewport. The same card can become vertical in a sidebar and horizontal in the main region.']],
      points: [[['Fluid','百分比、fr 与 clamp() 连续变化'],['Fluid','Percentages, fr, and clamp() change continuously']],[['Intrinsic','内容最小/最大需求参与决策'],['Intrinsic','Content minima and maxima guide decisions']],[['Breakpoint','关系失效时改变结构'],['Breakpoint','Structure changes when a relationship fails']],[['Container','组件根据可用容器响应'],['Container','A component responds to its own space']]],
      code: `.shell { width: min(72rem, 100% - 2rem); }\n\n@media (max-width: 45rem) {\n  .main-layout { grid-template-columns: 1fr; }\n}\n\n.card-wrap { container-type: inline-size; }\n@container (min-width: 32rem) {\n  .event-card { grid-template-columns: 10rem 1fr; }\n}`,
      notes: [[['min()','上限与流动宽度同时成立'],['min()','Combines a maximum with fluid width']],[['45rem','内容关系破裂时切换'],['45rem','Changes structure where content fails']],[['@container','组件响应自己的空间'],['@container','Lets a component respond to its own space']]]
    }
  ];

  let active = 0;
  const isEnglish = () => document.documentElement.lang === 'en';
  const pick = pair => pair[isEnglish() ? 1 : 0];

  function render() {
    const lesson = modules[active];
    d3.select('#theoryCourseTitle').text(isEnglish() ? 'Complete page-layout learning path' : '页面布局完整学习路径');
    d3.select('#accessibilityNoteTitle').text(isEnglish() ? 'Layout acceptance baseline' : '布局验收底线');
    d3.select('#accessibilityNoteBody').text(isEnglish()
      ? 'DOM source order, visual reading order, and keyboard focus order should remain consistent; the layout must stay readable and operable under zoom, longer text, and content growth.'
      : 'DOM 源顺序、视觉阅读顺序与键盘焦点顺序应保持一致；缩放、长文本和内容增长时，布局仍应可读、可操作。');
    d3.select('#theoryProgress').text(`${String(active + 1).padStart(2, '0')} / 06`);
    d3.select('#theoryModuleNav').selectAll('button')
      .data(modules, d => d.slug)
      .join('button')
      .attr('type', 'button')
      .attr('class', (d, index) => index === active ? 'active' : null)
      .attr('aria-pressed', (d, index) => index === active)
      .html((d, index) => `<span>${String(index + 1).padStart(2, '0')}</span><b>${pick(d.nav).replace(/^6\.\d\s*/, '')}</b>`)
      .on('click', (_, d) => { active = modules.indexOf(d); render(); });

    d3.select('#theoryLessonContent').html(`
      <header><div><small>CASE ${String(active + 1).padStart(2, '0')} · ${lesson.slug}</small><h4>${pick(lesson.title)}</h4></div><b>${pick(lesson.concept)}</b></header>
      <h5>${pick(lesson.question)}</h5>
      ${lesson.body.map(item => `<p>${pick(item)}</p>`).join('')}
      <div class="theory-points">${lesson.points.map(item => { const point = pick(item); return `<div><b>${point[0]}</b><span>${point[1]}</span></div>`; }).join('')}</div>`);

    d3.select('#codeLessonTitle').text(pick(lesson.nav));
    d3.select('#lessonCode').text(lesson.code);
    d3.select('#lessonNotes').selectAll('article')
      .data(lesson.notes)
      .join('article')
      .html(item => { const note = pick(item); return `<code>${note[0]}</code><p>${note[1]}</p>`; });
  }

  window.addEventListener('course:language', render);
  window.layoutCourse = { select(index) { active = Math.max(0, Math.min(modules.length - 1, index)); render(); } };
  render();
})();
