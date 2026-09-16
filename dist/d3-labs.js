(() => {
  'use strict';

  if (!window.d3) {
    document.querySelector('#demoPanel')?.setAttribute('data-d3-error', 'D3 failed to load');
    return;
  }

  const state = { cqTarget: 'main', xray: false };
  const isEnglish = () => document.documentElement.lang === 'en';
  const t = (zh, en) => isEnglish() ? en : zh;

  d3.select('.lab-head')
    .append('span')
    .attr('class', 'd3-badge')
    .attr('title', 'D3 selections, data joins, hierarchy and drag')
    .text(`D3.js v${d3.version} · DATA-DRIVEN`);

  const flexItems = [
    { id: 'brand', zh: 'CampusHub', en: 'CampusHub' },
    { id: 'discover', zh: '发现活动', en: 'Discover events' },
    { id: 'clubs', zh: '浏览社团', en: 'Browse clubs' },
    { id: 'profile', zh: '个人中心', en: 'Profile' }
  ];
  const flexControls = d3.selectAll('#flexDirection,#flexJustify,#flexAlign,#flexWrap,#flexWidth');

  function updateFlex() {
    const direction = d3.select('#flexDirection').property('value');
    const justify = d3.select('#flexJustify').property('value');
    const align = d3.select('#flexAlign').property('value');
    const wrap = d3.select('#flexWrap').property('value');
    const width = +d3.select('#flexWidth').property('value');

    d3.select('#flexPlayground')
      .style('flex-direction', direction)
      .style('justify-content', justify)
      .style('align-items', align)
      .style('flex-wrap', wrap)
      .style('width', `${width}px`)
      .selectAll('article')
      .data(flexItems, (d, index) => d?.id ?? flexItems[index]?.id)
      .join('article')
      .text(d => isEnglish() ? d.en : d.zh);

    d3.select('#flexWidthValue').text(`${width} px`);
    d3.select('.axes-stage').classed('column-mode', direction === 'column');
    d3.select('#mainAxis').text(direction === 'column' ? 'MAIN AXIS ↓' : 'MAIN AXIS →');
    d3.select('#crossAxis').text(direction === 'column' ? 'CROSS AXIS →' : 'CROSS AXIS ↓');
    d3.select('#flexCode').text(`flex-direction: ${direction}; justify-content: ${justify}; align-items: ${align}; flex-wrap: ${wrap};`);
    d3.select('#flexInsight').text(direction === 'column'
      ? t('主轴现在是纵向；justify-content 控制上下分配。', 'The main axis is vertical; justify-content controls vertical distribution.')
      : t('主轴现在是横向；justify-content 控制左右分配。', 'The main axis is horizontal; justify-content controls horizontal distribution.'));
  }
  flexControls.on('input.d3-lab change.d3-lab', updateFlex);

  const gridItems = [
    ['01', '设计之夜', 'Design Night'], ['02', '开放舞台', 'Open Stage'],
    ['03', '绿色市集', 'Green Market'], ['04', '电影放映', 'Film Screening'],
    ['05', '晨间跑步', 'Morning Run'], ['06', '创客工作坊', 'Maker Workshop']
  ].map(([id, zh, en]) => ({ id, zh, en }));
  const cardColor = d3.scaleOrdinal().domain(gridItems.map(d => d.id)).range(['#dff7ef', '#e9efff', '#fff1d5']);

  function updateGrid() {
    const columns = +d3.select('#gridColumns').property('value');
    const minimum = +d3.select('#gridMin').property('value');
    const gap = +d3.select('#gridGap').property('value');
    const automatic = d3.select('#gridAuto').property('checked');
    const template = automatic
      ? `repeat(auto-fit, minmax(min(100%, ${minimum}px), 1fr))`
      : `repeat(${columns}, minmax(0, 1fr))`;

    d3.select('#gridColumnsValue').text(columns);
    d3.select('#gridMinValue').text(`${minimum} px`);
    d3.select('#gridGapValue').text(`${gap} px`);
    d3.select('#gridPlayground')
      .style('gap', `${gap}px`)
      .style('grid-template-columns', template)
      .selectAll('article')
      .data(gridItems, (d, index) => d?.id ?? gridItems[index]?.id)
      .join('article')
      .style('background-color', d => cardColor(d.id))
      .html(d => `${d.id}<br><b>${isEnglish() ? d.en : d.zh}</b>`);

    d3.select('#gridCode').text(`grid-template-columns: ${template}; gap: ${gap}px;`);
    d3.select('#gridInsight').text(automatic
      ? t('列数现在由容器宽度和卡片最小宽度共同决定。', 'Container width and the card minimum now decide the column count together.')
      : t('固定列数会保持明确轨道，即使每张卡片变窄。', 'A fixed column count preserves explicit tracks even as cards narrow.'));
  }
  d3.selectAll('#gridColumns,#gridMin,#gridGap,#gridAuto').on('input.d3-lab change.d3-lab', updateGrid);

  function updateResponsive() {
    const requested = +d3.select('#responsiveWidth').property('value');
    const mode = d3.select('#responsiveMode').property('value');
    const effective = mode === 'fixed' ? 920 : requested;
    const compact = effective < 720;
    const cardColumns = effective < 520 ? 1 : effective < 850 ? 2 : 3;
    const browser = d3.select('#responsiveBrowser')
      .style('width', `${effective}px`)
      .classed('xray', state.xray);
    browser.select('.main-layout').style('grid-template-columns', compact ? '1fr' : 'minmax(0, 1fr) 180px');
    browser.select('.cards').style('grid-template-columns', `repeat(${cardColumns}, minmax(0, 1fr))`);
    d3.select('#responsiveWidthValue').text(`${requested} px`);
    d3.select('#responsiveState').text(compact
      ? t('单列 · 侧栏下移', 'Single column · sidebar below')
      : t('主内容 + 侧栏', 'Main + Sidebar'));
    d3.select('#responsiveMeasure').text(`${state.xray ? '12-column X-Ray · ' : ''}${cardColumns} ${t('列卡片', 'card columns')} · gap 18px`);
    d3.select('#responsiveCode').text(compact
      ? '@media (max-width: 45rem) { grid-template-columns: 1fr; }'
      : 'grid-template-columns: minmax(0, 1fr) 180px;');
    d3.select('#xrayToggle').attr('aria-pressed', state.xray).classed('active', state.xray);
  }
  d3.selectAll('#responsiveWidth,#responsiveMode').on('input.d3-lab change.d3-lab', updateResponsive);
  d3.select('#xrayToggle').on('click.d3-lab', () => { state.xray = !state.xray; updateResponsive(); });

  const compareScale = d3.scaleLinear().domain([0, 100]);
  function setCompare(value) {
    const bounded = Math.max(0, Math.min(100, value));
    d3.select('#compareWrap').style('--split', `${bounded}%`);
    d3.select('#compareRange').property('value', bounded);
    d3.select('.compare-handle').attr('aria-valuenow', Math.round(bounded));
  }
  d3.select('#compareRange').on('input.d3-lab', function () { setCompare(+this.value); });
  d3.select('.compare-handle')
    .attr('role', 'slider')
    .attr('aria-valuemin', 0)
    .attr('aria-valuemax', 100)
    .attr('aria-valuenow', 50)
    .call(d3.drag().container(() => document.querySelector('#compareWrap')).on('drag', event => {
      const width = document.querySelector('#compareWrap').clientWidth;
      setCompare(compareScale.range([0, width]).invert(event.x));
    }));

  function updateContainerState() {
    const host = document.querySelector(state.cqTarget === 'main' ? '#cqMain' : '#cqSide');
    const styles = getComputedStyle(host);
    const contentWidth = host.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    const threshold = 32 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const wide = contentWidth >= threshold;
    d3.select('#cqState').text(wide
      ? t('实际容器 ≥ 32rem：横向卡片', 'Actual container ≥ 32rem: horizontal card')
      : t('实际容器 < 32rem：纵向卡片', 'Actual container < 32rem: vertical card'));
  }
  function updateContainerQuery() {
    const target = state.cqTarget === 'main' ? '#cqMain' : '#cqSide';
    const card = d3.select('#cqCard');
    const targetNode = d3.select(target).node();
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    card.interrupt();
    if (card.node().parentElement !== targetNode) targetNode.appendChild(card.node());
    card.style('opacity', reducedMotion ? 1 : 0);
    if (reducedMotion) card.style('opacity', 1);
    else card.transition().duration(180).style('opacity', 1);
    updateContainerState();
    d3.selectAll('[data-cq-target]')
      .classed('active', function () { return this.dataset.cqTarget === state.cqTarget; })
      .attr('aria-pressed', function () { return this.dataset.cqTarget === state.cqTarget; });
  }
  d3.selectAll('[data-cq-target]').on('click.d3-lab', function () {
    state.cqTarget = this.dataset.cqTarget;
    updateContainerQuery();
  });

  function refreshLanguage() {
    updateFlex();
    updateGrid();
    d3.select('#responsiveTitle').text(t('响应式视口：让内容决定断点', 'Responsive viewport: let content determine the breakpoint'));
    d3.select('#responsiveIntro').text(t('拖动视口，观察卡片列数、主内容与侧栏关系何时失效。开启透视后可查看 12 列网格、容器边界、gap 和对齐线。', 'Drag the viewport to find where card columns and the main–sidebar relationship fail. X-Ray reveals the 12-column grid, boundaries, gaps, and alignment lines.'));
    d3.select('#xrayLabel').text(t('布局透视', 'Layout X-Ray'));
    updateResponsive();
    updateContainerQuery();
  }

  window.addEventListener('course:language', refreshLanguage);
  new ResizeObserver(updateContainerState).observe(document.querySelector('#cqMain'));
  new ResizeObserver(updateContainerState).observe(document.querySelector('#cqSide'));
  updateFlex();
  updateGrid();
  refreshLanguage();
  setCompare(50);
  updateContainerQuery();
})();
