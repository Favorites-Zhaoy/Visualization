(() => {
  'use strict';

  if (!window.d3) {
    document.querySelector('#demoPanel')?.setAttribute('data-d3-error', 'D3 failed to load');
    return;
  }

  const state = { treeChoice: null, treeStage: 'start', cqTarget: 'main' };
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

  const treeData = {
    id: 'root', zh: '需要二维对齐？', en: 'Two-axis alignment?', children: [
      { id: 'grid', zh: 'CSS Grid', en: 'CSS Grid' },
      { id: 'q2', zh: '主要沿一个方向？', en: 'Mainly one direction?', children: [
        { id: 'flex', zh: 'Flexbox', en: 'Flexbox' },
        { id: 'flow', zh: 'Normal Flow', en: 'Normal Flow' }
      ] }
    ]
  };
  const treeText = {
    grid: ['CSS Grid', '需要同时对齐行与列，这是二维关系。', 'Rows and columns must align together, so this is a two-dimensional relationship.'],
    flex: ['Flexbox', '元素主要沿一条轴协作，使用一维布局模型。', 'The elements cooperate mainly along one axis, so use a one-dimensional model.'],
    flow: ['Normal Flow', '不需要额外坐标关系，让文档自然顺序完成布局。', 'No extra coordinate relationship is needed; let document order perform the layout.']
  };
  const treeSvg = d3.select('.decision-tree').insert('svg', '.tree-result')
    .attr('class', 'decision-map')
    .attr('viewBox', '0 0 560 210')
    .attr('role', 'img')
    .attr('aria-label', 'Layout decision tree');

  function renderTree() {
    const root = d3.hierarchy(treeData);
    d3.tree().size([170, 430])(root);
    const active = new Set(['root']);
    if (state.treeStage === 'second' || state.treeChoice === 'flex' || state.treeChoice === 'flow') active.add('q2');
    if (state.treeChoice) active.add(state.treeChoice);

    treeSvg.selectAll('path.tree-link')
      .data(root.links(), d => d.target.data.id)
      .join('path')
      .attr('class', d => `tree-link${active.has(d.target.data.id) ? ' active' : ''}`)
      .attr('d', d3.linkHorizontal().x(d => d.y + 60).y(d => d.x + 18));

    const nodes = treeSvg.selectAll('g.tree-map-node')
      .data(root.descendants(), d => d.data.id)
      .join(enter => {
        const group = enter.append('g').attr('class', 'tree-map-node');
        group.append('circle').attr('r', 7);
        group.append('text').attr('x', 13).attr('dy', '0.35em');
        return group;
      })
      .attr('class', d => `tree-map-node${active.has(d.data.id) ? ' active' : ''}`)
      .attr('transform', d => `translate(${d.y + 60},${d.x + 18})`);
    nodes.select('text').text(d => isEnglish() ? d.data.en : d.data.zh);
  }

  function showTreeResult(key) {
    state.treeChoice = key;
    state.treeStage = key === 'grid' ? 'start' : 'second';
    if (key === 'grid') d3.select('#treeStep2').classed('hidden', true);
    const data = treeText[key];
    d3.select('#treeResult strong').text(data[0]);
    d3.select('#treeResult p').text(isEnglish() ? data[2] : data[1]);
    renderTree();
  }
  d3.selectAll('[data-tree]').on('click.d3-lab', function () {
    const action = this.dataset.tree;
    if (action === 'next') {
      state.treeStage = 'second';
      state.treeChoice = null;
      d3.select('#treeStep2').classed('hidden', false);
      d3.select('#treeResult strong').text('—');
      d3.select('#treeResult p').text(t('继续回答第二个问题。', 'Continue with the second question.'));
      renderTree();
    } else showTreeResult(action);
  });
  d3.select('#treeReset').on('click.d3-lab', () => {
    state.treeStage = 'start';
    state.treeChoice = null;
    d3.select('#treeStep2').classed('hidden', true);
    d3.select('#treeResult strong').text('—');
    d3.select('#treeResult p').text(t('从第一个问题开始。', 'Begin with the first question.'));
    renderTree();
  });

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
    renderTree();
    if (state.treeChoice) showTreeResult(state.treeChoice);
    else if (state.treeStage === 'second') d3.select('#treeResult p').text(t('继续回答第二个问题。', 'Continue with the second question.'));
    updateContainerQuery();
  }

  window.addEventListener('course:language', refreshLanguage);
  new ResizeObserver(updateContainerState).observe(document.querySelector('#cqMain'));
  new ResizeObserver(updateContainerState).observe(document.querySelector('#cqSide'));
  updateFlex();
  updateGrid();
  renderTree();
  setCompare(50);
  updateContainerQuery();
})();
