import { state, dispatch, selectedRows, classCounts } from "./data.js";
import { dashboard, treemap, histogram } from "./charts.js";
export function init65() {
  const s = d3.select("#demo65");
  s.html(
    `<div class="viewport-toolbar"><button data-width="1440" aria-pressed="true">Desktop 1440</button><button data-width="768" aria-pressed="false">Tablet 768</button><button data-width="390" aria-pressed="false">Mobile 390</button></div><label class="viewport-slider"><span>390</span><input type="range" min="390" max="1440" step="1" value="1440" aria-label="模拟视口宽度"><span>1440</span><output>1440 px</output></label><div class="viewport-window"><div class="viewport-chrome"><span>VIEWPORT MACHINE / CampusScope</span><span class="viewport-measure">1440px · 5列 / 双视图</span></div><div class="viewport-scroll" tabindex="0" aria-label="模拟设备画布，可横向滚动"><div class="viewport-page"><div id="responsive-dashboard"></div></div></div></div><p class="viewport-hint">画布保持真实像素宽度；若超出窗口，可横向滚动。缩窄后观察布局重排，而非整页缩小。</p><div class="story-heading"><p class="eyebrow">SCROLL TO DISCOVER</p><h3>让阅读顺序，成为故事的一部分</h3><p>向下滚动四段文字，或点击步骤按钮。视觉区会停留在视口中。</p></div><div class="story-layout"><div class="story-visual"><div class="story-controls" aria-label="故事步骤">${[1, 2, 3, 4].map((n, i) => `<button data-story="${i}" aria-pressed="${i === 0}" aria-label="故事第${n}步">0${n}</button>`).join("")}</div><p class="story-status">01 / 先看整体</p><div class="story-chart"><div class="story-tree"></div><div class="age-chart" hidden></div><div class="story-detail" hidden></div></div></div><div class="story-text"><article class="story-step active" data-step="0"><span>01 / OVERVIEW</span><h4>先认识这80名新生。</h4><p>这是2026级的<b>80条虚构学生记录</b>。先用四个相同的区域标出四个班级，建立总体印象；此时面积还没有编码人数。</p></article><article class="story-step" data-step="1"><span>02 / SCALE</span><h4>四个班，并不是一样大。</h4><p>软件工程1班<b>26人</b>，数字媒体1班<b>14人</b>。等宽网格变成 Treemap，人数差异终于出现在空间中。颜色和班级身份始终保持不变。</p></article><article class="story-step" data-step="2"><span>03 / DISTRIBUTION</span><h4>大多数人，集中在18–19岁。</h4><p><b>67人，占83.75%</b>。把注意力转向年龄分布：18岁是主峰，19岁次之；17岁与20岁的人数较少。布局不再只回答“哪个班大”。</p></article><article class="story-step" data-step="3"><span>04 / DETAIL</span><h4>现在，走进一个班级。</h4><p>选择<b>数据科学1班</b>。左侧保留其他班级作为背景，下方出现18名学生的局部摘要。你既知道“他们是谁”，也没有丢失“他们在全体中的位置”。</p></article></div></div>`,
  );
  dashboard("#responsive-dashboard", { compact: true, xray: false });
  function widthChange(value) {
    state.viewportWidth = +value;
    s.select(".viewport-page").style("width", value + "px");
    s.select("input").property("value", value);
    s.select("output").text(value + " px");
    s.selectAll("[data-width]").attr("aria-pressed", function () {
      return +this.dataset.width === +value;
    });
    s.select(".viewport-measure").text(
      value +
        "px · " +
        (value <= 564
          ? "1列 / 上下视图"
          : value <= 944
            ? "2列 / 上下视图"
            : "5列 / 双视图"),
    );
  }
  s.selectAll("[data-width]").on("click", function () {
    widthChange(+this.dataset.width);
  });
  s.select("input").on("input", function () {
    widthChange(+this.value);
  });
  const tree = treemap(s.select(".story-tree").node(), {
    mode: "equal",
    height: (w) => (w < 350 ? 180 : 240),
    onSelect: (name) => {
      if (state.storyStep === 3) dispatch.call("selectClass", null, name);
    },
  });
  const titles = [
    "01 / 先看整体",
    "02 / 面积揭示班级规模",
    "03 / 18–19岁是主体",
    "04 / 整体中查看局部",
  ];
  function detail() {
    const rows = selectedRows(),
      ints = d3
        .rollups(
          rows,
          (v) => v.length,
          (d) => d.interest,
        )
        .sort((a, b) => b[1] - a[1]);
    s.select(".story-detail").text(
      `${state.selectedClass || "全体新生"}：${rows.length}人；平均年龄${d3.mean(rows, (d) => d.age)?.toFixed(1)}岁；男${rows.filter((d) => d.gender === "男").length}人、女${rows.filter((d) => d.gender === "女").length}人。兴趣最多的是${ints[0]?.[0]}（${ints[0]?.[1]}人）。点击色块可继续探索。`,
    );
    if (state.storyStep === 3) tree.update({ selected: state.selectedClass });
  }
  function step(index) {
    state.storyStep = index;
    s.selectAll("[data-story]").attr("aria-pressed", function () {
      return +this.dataset.story === index;
    });
    s.selectAll(".story-step").classed("active", function () {
      return +this.dataset.step === index;
    });
    s.select(".story-status").text(titles[index]);
    s.select(".story-tree").attr("hidden", index === 2 ? true : null);
    s.select(".story-chart>.age-chart").attr(
      "hidden",
      index === 2 ? null : true,
    );
    s.select(".story-detail").attr("hidden", index === 3 ? null : true);
    tree.update({
      mode: index === 0 ? "equal" : "treemap",
      selected: index === 3 ? "数据科学1班" : null,
    });
    if (index === 2)
      histogram(
        s.select(".story-chart>.age-chart").node(),
        state.students,
        true,
      );
    if (index === 3) {
      dispatch.call("selectClass", null, "数据科学1班");
      detail();
    }
  }
  s.selectAll("[data-story]").on("click", function () {
    step(+this.dataset.story);
  });
  const observer = new IntersectionObserver(
    (entries) => {
      const candidates = entries.filter((e) => e.isIntersecting);
      if (candidates.length && s.node().getBoundingClientRect().width) {
        const closest = candidates.sort(
          (a, b) =>
            Math.abs(a.boundingClientRect.top - innerHeight * 0.35) -
            Math.abs(b.boundingClientRect.top - innerHeight * 0.35),
        )[0];
        step(+closest.target.dataset.step);
      }
    },
    { rootMargin: "-25% 0px -35% 0px", threshold: 0 },
  );
  s.selectAll(".story-step").each(function () {
    observer.observe(this);
  });
  dispatch.on("selectClass.story", detail);
  const ro = new ResizeObserver(() => {
    if (state.storyStep === 2)
      histogram(
        s.select(".story-chart>.age-chart").node(),
        state.students,
        true,
      );
  });
  ro.observe(s.select(".story-visual").node());
}
