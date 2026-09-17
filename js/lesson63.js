import { classCounts } from "./data.js";
import { treemap } from "./charts.js";
export function init63() {
  const s = d3.select("#demo63"),
    counts = classCounts(),
    ratio = (counts[0].value / counts[3].value).toFixed(2);
  s.html(
    `<div class="toolbar"><button data-layout="equal" aria-pressed="true">Equal Grid</button><span>⇄</span><button data-layout="treemap" aria-pressed="false">Data Layout</button><span class="spacer"></span><span class="layout-state">面积相同，人数不同</span></div><div class="treemap-experiment"><div id="area-tree"></div><div class="area-proof"><span>软件工程1班 / 数字媒体1班：<b>${ratio} 倍</b></span><span>颜色保持不变，追踪同一个班级。</span></div></div><div class="readout area-readout">Equal Grid：每个班级占25%的布局空间。</div>`,
  );
  const tree = treemap("#area-tree", { mode: "equal" });
  s.selectAll("[data-layout]").on("click", function () {
    const mode = this.dataset.layout;
    s.selectAll("[data-layout]").attr("aria-pressed", function () {
      return this.dataset.layout === mode;
    });
    tree.update({ mode });
    s.select(".layout-state").text(
      mode === "equal" ? "面积相同，人数不同" : "面积 ∝ 班级人数",
    );
    s.select(".area-readout").text(
      mode === "equal"
        ? "Equal Grid：每个班级占25%的布局空间。"
        : "Data Layout：" +
            counts
              .map((d) => `${d.name} ${((d.value / 80) * 100).toFixed(1)}%`)
              .join(" / "),
    );
  });
}
