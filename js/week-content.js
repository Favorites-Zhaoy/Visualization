// One real timetable, five reading questions, two languages.
export const lessons = [
  {
    id: '61', word: 'STRUCTURE',
    title: { zh: '先分清问题，再组织信息', en: 'Organize information around questions' },
    question: { zh: '课表已经很整齐，为什么还需要信息结构？', en: 'The timetable is already orderly. Why add information structure?' },
    intro: { zh: '查“周四第 3–4 节上什么”，在课表里找到交叉位置就够了。要看整周节奏、一天详情和课程课量，就需要让不同问题各有一个清楚的区域。', en: 'To find Thursday’s Periods 3–4, a timetable cell is enough. To understand the week’s rhythm, inspect a day, and compare course loads, give each question a clear region.' },
    examples: [
      { title: { zh: '一个格子，回答一个问题', en: 'One cell answers one question' }, text: { zh: '在传统课表中，沿周四向下找到第 3–4 节，就能读到“可视化导论”。但“哪天课量最多”需要跨列计数；增加每日课量区，就能比较出周三和周四各有 6 节。', en: 'In the raw timetable, follow Thursday down to Periods 3–4 to find Introduction to Visualization. Finding the busiest days requires counting across columns. A daily-load region makes Wednesday and Thursday’s six periods directly comparable.' } },
      { title: { zh: '把周四的三次课放在一起', en: 'Keep Thursday’s three sessions together' }, text: { zh: '周四详情将计算智能 1–2 节、可视化导论 3–4 节、计算机视觉 6–7 节放在同一区域。共同标题与相邻位置告诉读者：这些内容都在回答“周四上什么”。', en: 'Thursday detail groups Computational Intelligence in Periods 1–2, Introduction to Visualization in 3–4, and Computer Vision in 6–7. A shared heading and proximity tell readers that these items answer the same question.' } },
      { title: { zh: '看边界，再看职责', en: 'Reveal boundaries, then responsibilities' }, text: { zh: 'X-Ray 显示标题、聚焦日、周课表与统计区域；3D 展开再把页面、语义区域、网格、图表和标签分层。层与层之间的距离用于解释构造，真实页面仍由正常文档流与 CSS 网格排版。', en: 'X-Ray reveals the header, focused day, week schedule, and summary regions. The exploded view separates the page, semantic regions, grid, charts, and labels. Depth explains construction; normal document flow and CSS Grid still arrange the real page.' } }
    ],
    takeaway: { zh: '布局先决定哪些信息属于一起，再决定它们放在哪里。', en: 'Layout starts with what belongs together, then decides where it goes.' },
    codeNotes: { zh: '这段代码来自正在运行的页面。观察各区域如何拥有明确身份与标题，再由同一份课表填入内容；区域含义与视觉坐标是两个层面的决定。', en: 'This is the code used by the running page. Notice how regions receive distinct identities and headings before the same timetable fills them. Meaning and coordinates are separate decisions.' },
    experiment: { zh: '依次切换原始课表、信息页面、X-Ray、3D。每次都寻找周四的三次课：数据相同，哪些分组线索让查找更直接？', en: 'Switch through Raw Timetable, Information Page, X-Ray, and 3D. Find Thursday’s three sessions each time. With the data unchanged, which grouping cues make the answer easier to locate?' },
    snippet: { file: 'js/week-views.js', region: 'structure' }
  },
  {
    id: '62', word: 'POSITION',
    title: { zh: '图内编码时间，图外组织阅读', en: 'Encode time inside; guide reading outside' },
    question: { zh: '课表的 7×11 网格，与网页的 12 列是一回事吗？', en: 'Is the timetable’s 7×11 grid the same as the page’s 12 columns?' },
    intro: { zh: '课表内部，横向位置表示日期，纵向位置表示节次。网页外部，列宽安排周课表与详情的相对位置；前者表达数据，后者安排阅读。', en: 'Inside the timetable, horizontal position represents dates and vertical position represents periods. Outside it, page columns arrange the schedule and detail. One encodes data; the other organizes reading.' },
    examples: [
      { title: { zh: '同一门课，三个时间位置', en: 'One course, three positions in time' }, text: { zh: '列表能逐条读出可视化导论的三次课。切到时间网格，周三 6–7 节、周四 3–4 节、周五 3–5 节同时落在各自位置，重复上课的模式便一眼可见。', en: 'A list names the three Visualization sessions one by one. In the time grid, Wednesday 6–7, Thursday 3–4, and Friday 3–5 occupy their date and period positions together, revealing the pattern across the week.' } },
      { title: { zh: '周五这一块为什么更高？', en: 'Why is Friday’s block taller?' }, text: { zh: '周五可视化导论占第 3、4、5 节，共 3 节；周四只占第 3、4 节，共 2 节。高度来自连续节数，课程简称与节次则让读者不用仅凭颜色辨认课程。', en: 'Friday’s Visualization session occupies Periods 3, 4, and 5; Thursday’s occupies only 3 and 4. Block height follows the number of consecutive periods. Course labels and period labels identify the session without relying on color alone.' } },
      { title: { zh: '打开两种辅助线', en: 'Reveal both sets of guides' }, text: { zh: '图表网格沿星期与第 1–11 节展开；页面网格横跨详情和周视图的共同容器。详情区域变宽，不代表周四发生在另一个日期；课程块的位置仍须服从时间比例尺。', en: 'Visualization guides follow the seven dates and Periods 1–11. Page guides span the shared container around detail and overview. Giving detail more room does not move Thursday to a different date: session positions still follow the time scales.' } }
    ],
    takeaway: { zh: 'D3 的坐标回答“什么时候”，CSS 的网格回答“先看什么”。', en: 'D3 coordinates answer “when”; the CSS page grid answers “what comes first”.' },
    codeNotes: { zh: '查看真实的 scaleBand 与课程块坐标：日期确定横向位置，开始节次确定纵向位置，连续节数确定高度。session_id 让同一次课在更新时保持元素身份。', en: 'Inspect the running scaleBand and session-position code: date determines x, the first period determines y, and duration determines height. session_id preserves each session’s element identity during updates.' },
    experiment: { zh: '在列表与时间网格间切换，找到周五可视化导论；再分别打开图表网格和页面网格，说出每一组线在组织什么。', en: 'Switch between list and time grid and locate Friday’s Visualization session. Then reveal the visualization grid and page grid separately, identifying what each set of lines organizes.' },
    snippet: { file: 'js/week-charts.js', region: 'time-grid' }
  },
  {
    id: '63', word: 'HIERARCHY',
    title: { zh: '问题变了，页面重点也要变', en: 'Change the question, change the emphasis' },
    question: { zh: '同样 11 次课，为什么需要三种构图？', en: 'Why do the same 11 sessions need three compositions?' },
    intro: { zh: '阅读任务决定谁应该先被看到。整周、周四和可视化导论使用同一份 CSV，却需要不同的主角；大小和顺序是设计选择，不是新增的数据。', en: 'The reading task determines what deserves the first glance. The whole week, Thursday, and Visualization use the same CSV but need different focal regions. Size and order are design choices, not new data.' },
    examples: [
      { title: { zh: '问整周：先看分布', en: 'Ask about the week: show the pattern' }, text: { zh: '选择“这周整体怎么安排”，周课表成为主要区域。周三、周四各有 6 节，周二有 2 节；整周分布与每日课量一起帮助读者理解这一周的节奏。', en: 'Choose the whole-week question and the timetable becomes the main region. Wednesday and Thursday each have six periods; Tuesday has two. The schedule and daily load together explain the week’s rhythm.' } },
      { title: { zh: '问周四：把当天详情推到前面', en: 'Ask about Thursday: lead with the day' }, text: { zh: '切换到周四，先读到计算智能 1–2 节、可视化导论 3–4 节、计算机视觉 6–7 节。详情获得更多空间，周课表留作背景参照；三次课本身没有改变。', en: 'Switch to Thursday and lead with Computational Intelligence 1–2, Visualization 3–4, and Computer Vision 6–7. Detail gains room while the week remains a reference. The three sessions themselves have not changed.' } },
      { title: { zh: '问一门课：从一天转向三天', en: 'Ask about a course: connect three days' }, text: { zh: '选择可视化导论，重点变为周三 6–7、周四 3–4、周五 3–5：3 次课，共 7 节。观察区域连续移动，能看出这是同一页换了重点，而不是跳到另一份课表。', en: 'Choose Visualization and the focus shifts to Wednesday 6–7, Thursday 3–4, and Friday 3–5: three sessions totaling seven periods. Continuous movement shows the same page changing its emphasis, rather than opening a different timetable.' } }
    ],
    takeaway: { zh: '数据决定周四有什么课，问题决定周四是否应该成为主角。', en: 'Data determines Thursday’s classes; the question determines whether Thursday takes center stage.' },
    codeNotes: { zh: '这段实际构图代码把问题状态转换为区域顺序与跨度。先记录旧位置，再让浏览器完成新排版，用 FLIP 连接前后位置；课程数据无需重建。', en: 'The running composition code turns question state into region order and spans. It records old bounds, lets the browser perform the new layout, and uses FLIP to connect the positions. The session data does not need rebuilding.' },
    experiment: { zh: '连续选择整周、周四、可视化导论。盯住周课表区域，观察它何时成为主角、何时退到背景，并解释每次变化对应哪个问题。', en: 'Choose Week, Thursday, and Visualization in turn. Follow the week-schedule region as it becomes the lead or supporting view, and connect each change to the question being asked.' },
    snippet: { file: 'js/week-views.js', region: 'composition' }
  },
  {
    id: '64', word: 'FOCUS',
    title: { zh: '看清局部，也保留整周位置', en: 'Inspect the detail; keep its place in the week' },
    question: { zh: '选中周四以后，其他日期应该消失吗？', en: 'Should the other days disappear when Thursday is selected?' },
    intro: { zh: '聚焦让当前对象更容易读，上下文保留它与其他信息的关系。把其余课程完全删掉，会同时失去前后日期和课程重复出现的位置。', en: 'Focus makes the selected item easier to read; context preserves its relationships. Removing the remaining sessions also removes neighboring dates and the places where a course repeats.' },
    examples: [
      { title: { zh: '选一天，保留前后关系', en: 'Select a day, retain its neighbors' }, text: { zh: '点击周四，它的三次课突出显示。周三与周五的课程仍留在原位，让读者看到周四处于一周中段，也能继续比较相邻日期的安排。', en: 'Select Thursday and its three sessions stand out. Wednesday’s and Friday’s sessions stay in place, showing Thursday within the week and preserving comparison with neighboring days.' } },
      { title: { zh: '选一门课，连接重复出现的位置', en: 'Select a course, connect its occurrences' }, text: { zh: '点击可视化导论，周三 6–7、周四 3–4、周五 3–5 同时突出。其他课程降低视觉重量，却不挪动位置；轮廓与文字状态共同说明选中了什么。', en: 'Select Visualization and Wednesday 6–7, Thursday 3–4, and Friday 3–5 stand out together. Other courses recede without moving. Outlines and a text status make the selection clear as well as color.' } },
      { title: { zh: '返回整周，不丢失方向', en: 'Return to the week without losing orientation' }, text: { zh: '点击“返回整周”或按 Esc，所有课程恢复正常显示。同一个课程块始终对应同一次课；清除选择恢复的是视觉重点，而不是重新生成一周。', en: 'Use Back to full week or press Esc to restore all sessions. Each block continues to represent the same session. Clearing selection restores visual emphasis rather than generating another week.' } }
    ],
    takeaway: { zh: 'Focus 帮你看清“这一项”，Context 说明“它在整周的哪里”。', en: 'Focus clarifies the selected item; context shows where it belongs in the week.' },
    codeNotes: { zh: '真实代码用日期或课程选择判断哪些课程块是焦点。稳定的 session_id 与保留在原位的元素维持对象连续性；状态变化同步影响详情与其他视图。', en: 'The running code identifies focused sessions from the selected date or course. Stable session_id keys and elements that remain in place preserve object constancy. Selection state also updates detail and the supporting views.' },
    experiment: { zh: '先选周四，再选可视化导论。检查未选课程是否还在原位，最后用键盘 Esc 返回整周。', en: 'Select Thursday, then Visualization. Check that unselected sessions remain in place, then use Escape to return to the whole week.' },
    snippet: { file: 'js/week-charts.js', region: 'focus-state' }
  },
  {
    id: '65', word: 'REFLOW',
    title: { zh: '空间变窄，重新安排阅读顺序', en: 'Less space calls for a new reading order' },
    question: { zh: '手机只有 390px，第一眼应该看到什么？', en: 'At 390px, what should the reader see first?' },
    intro: { zh: '桌面能并排放下详情和整周，手机需要先回答当前问题。重排同时改变区域顺序、列数与细节，让周四的课程仍然清楚可读。', en: 'Desktop can place detail beside the full week. Mobile should answer the current question first. Reflow changes region order, columns, and detail together so Thursday’s sessions remain readable.' },
    examples: [
      { title: { zh: '宽屏并排，窄屏先看当天', en: 'Side by side on desktop; day first on mobile' }, text: { zh: '在宽屏中比较周四与整周；切到 390px，先读周四及其三次课，再读一周概览、周课表和统计。阅读顺序也应进入实际文档顺序，键盘与屏幕阅读器才能得到相同线索。', en: 'On a wide screen, compare Thursday with the full week. At 390px, read Thursday and its three sessions first, followed by the week summary, timetable, and supporting charts. The actual document order should follow that reading path for keyboard and screen-reader users too.' } },
      { title: { zh: '整周保留，但不把字压小', en: 'Keep the week without shrinking its labels' }, text: { zh: '手机先给出可读的选中日内容，需要比较时再查看整周。整周课表可在自己的区域内横向滚动；页面标题、正文与按钮无需跟着左右移动。', en: 'Mobile presents readable selected-day content first, with the full week available for comparison. The timetable can scroll horizontally within its own region while headings, prose, and controls remain within the page width.' } },
      { title: { zh: '规则跟着容器，而不是设备名称', en: 'Rules follow the container, not a device name' }, text: { zh: '拖动画布经过 1100px 和 680px，观察列数、细节与顺序一起变化。即使浏览器很宽，嵌在窄区域内的 MY WEEK 也需要紧凑布局；当前规则应报告实际容器宽度。', en: 'Drag the canvas across 1100px and 680px and observe columns, detail, and order changing together. Even in a wide browser, MY WEEK needs a compact layout when its own container is narrow. The rule readout should report that actual container width.' } }
    ],
    takeaway: { zh: '响应式布局在有限空间里重排重点，让当前问题先得到回答。', en: 'Responsive layout reorganizes emphasis so the current question is answered first.' },
    codeNotes: { zh: '这段运行中的响应式代码读取容器宽度，决定细节级别与区域顺序；CSS Container Query 同步处理列数。数值变化应能在演示中的真实排版里得到验证。', en: 'This running responsive code reads container width to decide detail level and region order, while CSS container queries handle columns. Changes in the reported values should match the actual layout in the demo.' },
    experiment: { zh: '依次选择 1440、768、390，再打开阅读顺序标记。确认手机先展示选中日，并尝试只在周课表内部横向滚动。', en: 'Choose 1440, 768, and 390, then reveal reading-order markers. Confirm that mobile starts with the selected day and that horizontal scrolling stays inside the week timetable.' },
    snippet: { file: 'js/week-views.js', region: 'responsive' }
  }
];
