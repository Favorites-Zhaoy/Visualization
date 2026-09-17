import { drawKpis } from "./charts.js";
export function init62() {
  const s = d3.select("#demo62");
  s.html(
    `<div class="toolbar grid-buttons"><button data-mode="random" aria-pressed="false">A · Random</button><button data-mode="center" aria-pressed="false">B · Center</button><button data-mode="equal" aria-pressed="false">C · Equal Cards</button><button data-mode="grid" aria-pressed="true">D · 12-column Grid</button></div><div class="toolbar"><label class="slider-label">Gap <input type="range" min="4" max="24" value="16" aria-label="网格间距"><output>16px</output></label></div><div class="grid-stage"><div class="grid-lines" aria-label="12条网格列线"></div><div class="kpi-grid" data-mode="grid"></div></div><p class="grid-mode-explain"></p>`,
  );
  s.select(".grid-lines")
    .selectAll("span")
    .data(d3.range(1, 13))
    .join("span")
    .text((d) => d);
  drawKpis(s.select(".kpi-grid").node());
  const notes = {
    random:
      "A / 随意放置：数字没有共同基线，视线需要来回跳转。先找“平均年龄”，你看了几个位置？",
    center:
      "B / 全部居中：对称不等于高效。五张卡片排成长队，占据较多纵向空间。",
    equal:
      "C / 等宽卡片：建立共同基线，每张卡片获得同样空间。窄屏下换行，保持文字可读。",
    grid: "D / 12列网格：3 + 2 + 3 + 2 + 2 = 12。较长内容获得更多空间；容器小于520px时重排为两列。",
  };
  s.select(".grid-mode-explain").text(notes.grid);
  s.selectAll(".grid-buttons button").on("click", function () {
    const mode = this.dataset.mode;
    s.selectAll(".grid-buttons button").attr("aria-pressed", function () {
      return this.dataset.mode === mode;
    });
    s.select(".kpi-grid").attr("data-mode", mode);
    s.select(".grid-lines").style("opacity", mode === "grid" ? 1 : 0.25);
    s.select(".grid-mode-explain").text(notes[mode]);
  });
  s.select("input").on("input", function () {
    s.select(".grid-stage").style("--grid-gap", this.value + "px");
    s.select("output").text(this.value + "px");
  });
}
