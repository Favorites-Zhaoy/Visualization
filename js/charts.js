import {
  state,
  classCounts,
  color,
  duration,
  selectedRows,
  kpis,
  classNames,
  dispatch,
} from "./data.js";

export function drawKpis(host, rows = state.students) {
  const sel = d3
    .select(host)
    .selectAll("article.kpi")
    .data(kpis(rows), (d) => d.label)
    .join("article")
    .attr("class", "kpi")
    .style("--span", (d) => d.span);
  sel.html(
    (d) =>
      `<span class="kpi-label">${d.label}</span><div><b>${d.value}</b><small>${d.unit}</small></div>`,
  );
}

export function treemap(host, options = {}) {
  const el = typeof host === "string" ? document.querySelector(host) : host;
  const svg = d3
    .select(el)
    .selectAll("svg.treemap")
    .data([0])
    .join("svg")
    .attr("class", "treemap")
    .attr("role", options.onSelect ? "group" : "img")
    .attr("aria-label", "四个班级的人数面积图");
  let mode = options.mode || "treemap",
    focus = false,
    selection = null,
    width = 0;
  function render(animate = true) {
    const w = el.getBoundingClientRect().width;
    if (w < 1) return;
    width = w;
    const h =
      (typeof options.height === "function"
        ? options.height(w)
        : options.height) || (w < 420 ? 320 : 300);
    svg.attr("viewBox", `0 0 ${w} ${h}`);
    const counts = classCounts(),
      root = d3
        .hierarchy({
          children: counts.map((d) => ({
            ...d,
            weight: focus && selection === d.name ? d.value * 3 : d.value,
          })),
        })
        .sum((d) => d.weight || 0);
    d3.treemap().size([w, h]).paddingInner(0)(root);
    const cells = root
      .leaves()
      .map((d, i) => ({
        ...d,
        ...(mode === "equal"
          ? {
              x0: ((i % 2) * w) / 2,
              y0: (Math.floor(i / 2) * h) / 2,
              x1: (((i % 2) + 1) * w) / 2,
              y1: ((Math.floor(i / 2) + 1) * h) / 2,
            }
          : {}),
      }));
    const gs = svg
      .selectAll("g.cell")
      .data(cells, (d) => d.data.name)
      .join((enter) => {
        const g = enter.append("g").attr("class", "cell");
        g.append("rect");
        g.append("text").attr("class", "cell-name");
        g.append("text").attr("class", "cell-count");
        g.append("text").attr("class", "cell-share");
        g.append("title");
        return g;
      });
    gs.attr("role", options.onSelect ? "button" : null)
      .attr("tabindex", options.onSelect ? 0 : null)
      .attr("aria-pressed", (d) => selection === d.data.name)
      .attr(
        "aria-label",
        (d) =>
          `${d.data.name}，${d.data.value}人，占${d3.format(".1%")(d.data.value / state.students.length)}${selection === d.data.name ? "，已选择" : ""}`,
      )
      .on("click", (e, d) => options.onSelect?.(d.data.name))
      .on("keydown", (e, d) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          options.onSelect?.(d.data.name);
        }
      })
      .on("mouseenter", (e, d) => options.onHover?.(d.data))
      .on("focus", (e, d) => options.onHover?.(d.data));
    const t = d3
      .transition()
      .duration(animate ? duration() : 0)
      .ease(d3.easeCubicInOut);
    gs.transition(t)
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      .style("opacity", 1);
    gs.select("rect")
      .attr("fill", (d) =>
        selection && selection !== d.data.name
          ? d3.interpolateRgb(color(d.data.name), "#ffffff")(0.67)
          : color(d.data.name),
      )
      .attr("stroke", (d) => (selection === d.data.name ? "#1e1b4b" : "white"))
      .attr("stroke-width", (d) => (selection === d.data.name ? 4 : 2))
      .transition(t)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0);
    gs.select(".cell-name")
      .attr("x", 14)
      .attr("y", (d) => (d.y1 - d.y0 < 95 ? 20 : 27))
      .style("font-size", (d) => (d.x1 - d.x0 < 135 ? "11" : "14") + "px")
      .text((d) => (selection === d.data.name ? "✓ " : "") + d.data.name);
    gs.select(".cell-count")
      .attr("x", 14)
      .attr("y", (d) => (d.y1 - d.y0 < 95 ? 43 : 65))
      .style("font-size", (d) => (d.y1 - d.y0 < 95 ? "15px" : "30px"))
      .text((d) =>
        d.y1 - d.y0 < 95
          ? d.data.value +
            "人 · " +
            d3.format(".1%")(d.data.value / state.students.length)
          : d.data.value + " 人",
      );
    gs.select(".cell-share")
      .style("display", (d) => (d.y1 - d.y0 < 95 ? "none" : null))
      .attr("x", 14)
      .attr("y", (d) => Math.min(89, d.y1 - d.y0 - 12))
      .style("font-size", "12px")
      .text((d) => d3.format(".1%")(d.data.value / state.students.length));
    gs.selectAll("text").style("fill", (d) =>
      selection && selection !== d.data.name ? "#374151" : "#ffffff",
    );
    gs.select("title").text(
      (d) =>
        `${d.data.name}：${d.data.value}人（${d3.format(".1%")(d.data.value / state.students.length)}）`,
    );
  }
  const ro = new ResizeObserver(() => render(false));
  ro.observe(el);
  render(false);
  return {
    update(o = {}) {
      mode = o.mode ?? mode;
      focus = o.focus ?? focus;
      selection = o.selected === undefined ? selection : o.selected;
      render(o.animate !== false);
    },
    resize: () => render(false),
    get width() {
      return width;
    },
    destroy() {
      ro.disconnect();
    },
  };
}

export function histogram(host, rows = state.students, highlight = false) {
  const el = typeof host === "string" ? document.querySelector(host) : host,
    w = el.getBoundingClientRect().width || 320,
    h = 175;
  const bins = d3
    .bin()
    .value((d) => d.age)
    .domain([16.5, 20.5])
    .thresholds([17.5, 18.5, 19.5])(rows);
  const all = d3
    .bin()
    .value((d) => d.age)
    .domain([16.5, 20.5])
    .thresholds([17.5, 18.5, 19.5])(state.students);
  const max = d3.max(all, (d) => d.length);
  const svg = d3
    .select(el)
    .selectAll("svg")
    .data([0])
    .join("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("role", "img")
    .attr(
      "aria-label",
      "年龄直方图：" +
        bins.map((b) => `${(b.x0 + b.x1) / 2}岁${b.length}人`).join("，"),
    );
  const x = d3
      .scaleBand()
      .domain([17, 18, 19, 20])
      .range([32, w - 10])
      .padding(0.28),
    y = d3
      .scaleLinear()
      .domain([0, max])
      .range([h - 28, 23]);
  svg
    .selectAll("g.axis-y")
    .data([0])
    .join("g")
    .attr("class", "axis-y")
    .attr("transform", "translate(32,0)")
    .call(
      d3
        .axisLeft(y)
        .tickValues([0, 15, 30, 45])
        .tickSize(-(w - 42)),
    )
    .call((g) => g.select(".domain").remove());
  svg
    .selectAll("g.axis-x")
    .data([0])
    .join("g")
    .attr("class", "axis-x")
    .attr("transform", `translate(0,${h - 28})`)
    .call(
      d3
        .axisBottom(x)
        .tickFormat((d) => d + "岁")
        .tickSize(0),
    )
    .call((g) => g.select(".domain").remove());
  svg
    .selectAll("rect.bar")
    .data(bins)
    .join("rect")
    .attr("class", "bar")
    .attr("x", (d) => x((d.x0 + d.x1) / 2))
    .attr("width", x.bandwidth())
    .attr("rx", 3)
    .attr("fill", (d) =>
      highlight && ![18, 19].includes((d.x0 + d.x1) / 2)
        ? "#d8dbe5"
        : "#6366d7",
    )
    .transition()
    .duration(duration() / 2)
    .attr("y", (d) => y(d.length))
    .attr("height", (d) => h - 28 - y(d.length));
  svg
    .selectAll("text.bar-label")
    .data(bins)
    .join("text")
    .attr("class", "bar-label")
    .attr("x", (d) => x((d.x0 + d.x1) / 2) + x.bandwidth() / 2)
    .attr("y", (d) => y(d.length) - 6)
    .attr("text-anchor", "middle")
    .text((d) => d.length);
}

let instance = 0;
export function dashboard(host, { compact = false, xray = true } = {}) {
  const el = typeof host === "string" ? document.querySelector(host) : host,
    id = "dash" + ++instance,
    s = d3.select(el);
  s.classed("dashboard", true).html(
    `<div class="dashboard-head" data-region="Header"><div><span class="eyebrow">CAMPUSSCOPE / 2026</span><h3>新生数据观察站</h3></div><span class="synthetic">虚构数据 · 教学专用</span></div><div class="dashboard-controls"><label>查看班级 <select aria-label="查看班级"><option value="">全部班级</option>${classNames.map((n) => `<option>${n}</option>`).join("")}</select></label><div class="mode-switch"><button data-mode="overview-detail" aria-pressed="true">Overview + Detail</button><button data-mode="focus-context" aria-pressed="false">Focus + Context</button></div><button class="reset">重置</button>${xray ? '<button class="xray-toggle" aria-pressed="false">Layout X-Ray</button>' : ""}</div><div class="dashboard-kpis" data-region="KPI Area"></div><div class="dashboard-grid"><div class="overview panel" data-region="Main View"><div class="panel-heading"><h4>班级规模 <span>OVERVIEW</span></h4><span class="total-badge">80 人</span></div><p class="mode-note">面积代表人数 · 点击班级查看详情</p><div class="overview-treemap"></div><div class="chart-tooltip" role="status" aria-live="polite">选择任一班级，右侧联动更新。</div><div class="class-legend"></div></div><div class="detail panel" data-region="Detail View"><div class="panel-heading"><h4 class="selected-title">全体新生</h4><span>DETAIL</span></div><div class="detail-stats"></div><div class="gender"></div><h4 class="chart-title">年龄分布 <span>人数 · 固定纵轴</span></h4><div class="age-chart"></div><h4 class="chart-title">兴趣分布</h4><div class="interest-chart"></div></div></div>${compact ? "" : `<div class="student-panel panel" data-region="Supporting View"><div class="panel-heading"><h4>学生记录 <span>STUDENT RECORDS</span></h4><span class="list-count"></span></div><div class="table-scroll" tabindex="0" aria-label="学生列表，可滚动查看全部记录"><table><thead><tr><th scope="col">编号</th><th scope="col">班级</th><th scope="col">性别</th><th scope="col">年龄</th><th scope="col">省份</th><th scope="col">模拟录取分数</th><th scope="col">兴趣</th></tr></thead><tbody></tbody></table></div><p class="table-note">分数为模拟值，仅用于布局演示，不用于跨省教育评价。</p></div>`}<div class="xray-readout readout" hidden>点击带轮廓的区域查看实时尺寸。</div>`,
  );
  const tree = treemap(s.select(".overview-treemap").node(), {
    onSelect: (name) => dispatch.call("selectClass", null, name),
    onHover: (d) =>
      s
        .select(".chart-tooltip")
        .text(
          `${d.name} · ${d.value}人 · 占全体${d3.format(".1%")(d.value / state.students.length)}；点击或按 Enter 查看。`,
        ),
  });
  s.select(".class-legend")
    .selectAll("span")
    .data(classCounts())
    .join("span")
    .html((d) => `<i style="background:${color(d.name)}"></i>${d.name}`);
  function update() {
    const rows = selectedRows(),
      n = rows.length,
      m = rows.filter((d) => d.gender === "男").length,
      mean = d3.mean(rows, (d) => d.admission_score);
    s.select("select").property("value", state.selectedClass || "");
    s.selectAll("[data-mode]").attr("aria-pressed", function () {
      return this.dataset.mode === state.viewMode;
    });
    drawKpis(s.select(".dashboard-kpis").node());
    s.select(".selected-title").text(state.selectedClass || "全体新生");
    s.select(".total-badge").text(state.students.length + " 人");
    s.select(".detail-stats").html(
      `<div><b>${n}<small> 人</small></b><span>当前人数</span></div><div><b>${mean?.toFixed(1) || "—"}</b><span>平均模拟录取分数</span></div>`,
    );
    s.select(".gender").html(
      `<div class="gender-label"><span>男 ${m} 人 · ${d3.format(".1%")(m / n)}</span><span>女 ${n - m} 人 · ${d3.format(".1%")((n - m) / n)}</span></div><div class="gender-track" role="img" aria-label="男${m}人，女${n - m}人"><span style="width:${(m / n) * 100}%"></span></div>`,
    );
    histogram(s.select(".age-chart").node(), rows);
    const ints = ["前端开发", "数据分析", "人工智能", "视觉设计"].map(
      (name) => ({
        name,
        count: rows.filter((d) => d.interest === name).length,
      }),
    );
    s.select(".interest-chart")
      .selectAll(".interest-row")
      .data(ints, (d) => d.name)
      .join("div")
      .attr("class", "interest-row")
      .html(
        (d) =>
          `<span>${d.name}</span><div><i style="width:${(d.count / n) * 100}%"></i></div><b>${d.count}</b>`,
      );
    s.select("tbody")
      .selectAll("tr")
      .data(rows, (d) => d.student_id)
      .join("tr")
      .selectAll("td")
      .data((d) => [
        d.student_id,
        d.class_name,
        d.gender,
        d.age,
        d.province,
        d.admission_score,
        d.interest,
      ])
      .join("td")
      .text((d) => d);
    s.select(".list-count").text(`${n} 条记录 / ${state.students.length} 人`);
    const focused = state.viewMode === "focus-context";
    s.select(".mode-note").text(
      focused
        ? "关注模式：面积不再代表人数；其他班级保留为背景。"
        : "面积代表人数 · 点击班级查看详情",
    );
    s.select(".chart-tooltip").text(
      state.selectedClass
        ? `已选择 ${state.selectedClass} · ${n} 人；详情、图表和列表已同步。`
        : "当前查看全体新生；点击班级进入详情。",
    );
    tree.update({ focus: focused, selected: state.selectedClass });
  }
  s.select("select").on("change", function () {
    dispatch.call("selectClass", null, this.value || null);
  });
  s.selectAll("[data-mode]").on("click", function () {
    dispatch.call("viewMode", null, this.dataset.mode);
  });
  s.select(".reset").on("click", () => {
    dispatch.call("viewMode", null, "overview-detail");
    dispatch.call("selectClass", null, null);
  });
  dispatch.on("selectClass." + id, update).on("viewMode." + id, update);
  if (xray)
    setupXray(
      el,
      s.select(".xray-toggle").node(),
      s.select(".xray-readout").node(),
    );
  const ro = new ResizeObserver(() => {
    if (el.getBoundingClientRect().width > 0)
      histogram(s.select(".age-chart").node(), selectedRows());
  });
  ro.observe(el);
  update();
  return { update, tree, el };
}

export function setupXray(root, button, readout) {
  let active = false,
    current = null;
  function measure() {
    if (!active || !current) return;
    const b = current.getBoundingClientRect(),
      p = getComputedStyle(current).padding;
    readout.textContent = `${current.dataset.region} | x: ${b.x.toFixed(0)} · y: ${b.y.toFixed(0)} · width: ${b.width.toFixed(0)} · height: ${b.height.toFixed(0)} · padding: ${p}（px，相对视口）`;
  }
  button.addEventListener("click", () => {
    active = !active;
    root.classList.toggle("xray-on", active);
    button.setAttribute("aria-pressed", active);
    readout.hidden = !active;
    root
      .querySelectorAll("[data-region]")
      .forEach((e) => (e.tabIndex = active ? 0 : -1));
    measure();
  });
  root.querySelectorAll("[data-region]").forEach((e) => {
    for (const name of ["pointerenter", "click", "focus"])
      e.addEventListener(name, () => {
        current = e;
        measure();
      });
  });
  const ro = new ResizeObserver(measure);
  ro.observe(root);
  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", measure);
  return { measure };
}

export function diagram(svg, type, after = true) {
  svg.attr("viewBox", "0 0 300 100").attr("role", "img");
  const palette = ["#9c99e4", "#76acb6", "#d4b27d", "#d89aac"];
  let rects = [];
  if (type === 1) {
    rects = after
      ? [
          [4, 3, 292, 15, 0],
          [4, 25, 65, 18, 1],
          [78, 25, 65, 18, 1],
          [153, 25, 65, 18, 1],
          [228, 25, 68, 18, 1],
          [4, 52, 190, 43, 0],
          [203, 52, 93, 43, 3],
        ]
      : [
          [12, 12, 85, 30, 0],
          [112, 6, 60, 16, 1],
          [200, 21, 82, 28, 3],
          [72, 63, 82, 30, 2],
          [171, 58, 119, 18, 0],
        ];
  }
  if (type === 2) {
    rects = after
      ? [
          [4, 10, 72, 73, 0],
          [84, 10, 45, 73, 1],
          [137, 10, 72, 73, 2],
          [217, 10, 34, 73, 3],
          [259, 10, 37, 73, 0],
        ]
      : [
          [4, 38, 57, 42, 0],
          [68, 5, 55, 52, 1],
          [133, 33, 48, 48, 2],
          [194, 11, 52, 52, 3],
          [254, 46, 42, 44, 0],
        ];
  }
  if (type === 3) {
    rects = after
      ? [
          [4, 4, 167, 51, 0],
          [4, 57, 167, 39, 1],
          [173, 4, 123, 55, 2],
          [173, 61, 123, 35, 3],
        ]
      : [
          [4, 4, 144, 44, 0],
          [152, 4, 144, 44, 1],
          [4, 52, 144, 44, 2],
          [152, 52, 144, 44, 3],
        ];
  }
  if (type === 4) {
    rects = [
      [4, 4, after ? 165 : 135, 92, 0],
      [after ? 178 : 154, 4, 118, 22, 1],
      [after ? 178 : 154, 34, 25, 62, 0],
      [after ? 211 : 187, 53, 25, 43, 2],
      [after ? 244 : 220, 69, 25, 27, 3],
    ];
  }
  if (type === 5) {
    rects = after
      ? [
          [15, 4, 145, 92, 0],
          [174, 4, 54, 92, 1],
          [242, 4, 42, 92, 3],
        ]
      : [[30, 5, 240, 90, 0]];
  }
  svg
    .selectAll("rect.shape")
    .data(rects)
    .join("rect")
    .attr("class", "shape")
    .attr("x", (d) => d[0])
    .attr("y", (d) => d[1])
    .attr("width", (d) => d[2])
    .attr("height", (d) => d[3])
    .attr("fill", (d) => palette[d[4]])
    .attr("rx", 3);
  if (type === 5) {
    svg
      .selectAll("rect.inner")
      .data(
        after
          ? [
              [22, 12, 131, 12],
              [22, 31, 78, 57],
              [107, 31, 46, 57],
              [181, 12, 40, 18],
              [181, 37, 40, 51],
              [249, 12, 28, 15],
              [249, 34, 28, 23],
              [249, 65, 28, 23],
            ]
          : [
              [40, 16, 220, 10],
              [40, 35, 129, 47],
              [180, 35, 80, 47],
            ],
      )
      .join("rect")
      .attr("class", "inner")
      .attr("x", (d) => d[0])
      .attr("y", (d) => d[1])
      .attr("width", (d) => d[2])
      .attr("height", (d) => d[3])
      .attr("fill", "#fff")
      .attr("opacity", 0.75)
      .attr("rx", 2);
  }
}
