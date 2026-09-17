import { state } from "./data.js";
import { drawKpis, treemap, setupXray } from "./charts.js";
export function init61() {
  const host = d3.select("#demo61");
  host.html(
    `<div class="toolbar"><button id="skeleton-order" aria-pressed="true">有序骨架 ✓</button><button id="skeleton-xray" aria-pressed="false">Layout X-Ray OFF</button><label class="slider-label">区域内边距 <input id="padding-slider" type="range" min="8" max="32" value="16" aria-label="区域内边距"><output id="padding-value">16px</output></label></div><div id="skeleton-root"><div class="skeleton"><header class="skeleton-header" data-region="Header"><b>CampusScope / 2026 新生</b><span>先确认：我在看什么？</span></header><div class="skeleton-kpis" data-region="KPI Area"></div><div class="skeleton-middle"><div class="skeleton-main" data-region="Main View"><h4>班级规模 / 整体</h4><div id="skeleton-tree"></div></div><div class="skeleton-detail" data-region="Detail View"><h4>学生详情 / 局部</h4><strong>${state.students.length}</strong><p>名新生，来自12个省份。<br>先读整体，再进入具体班级。</p></div></div><div class="skeleton-support" data-region="Supporting View"><span>辅助信息 / 年龄分布</span><div></div></div></div><div id="skeleton-readout" class="readout" role="status" aria-live="polite" hidden>点击任一区域，查看布局的真实尺寸。</div></div>`,
  );
  drawKpis(host.select(".skeleton-kpis").node());
  treemap("#skeleton-tree", { height: 180 });
  const bins = d3
    .rollups(
      state.students,
      (r) => r.length,
      (d) => d.age,
    )
    .sort((a, b) => a[0] - b[0]);
  host
    .select(".skeleton-support>div")
    .selectAll("i")
    .data(bins)
    .join("i")
    .style("height", (d) => (d[1] / d3.max(bins, (x) => x[1])) * 100 + "%")
    .attr("title", (d) => d[0] + "岁：" + d[1] + "人");
  const x = setupXray(
    document.querySelector("#skeleton-root"),
    document.querySelector("#skeleton-xray"),
    document.querySelector("#skeleton-readout"),
  );
  host.select("#skeleton-xray").on("click.label", function () {
    this.textContent =
      this.getAttribute("aria-pressed") === "true"
        ? "Layout X-Ray ON"
        : "Layout X-Ray OFF";
  });
  host.select("#skeleton-order").on("click", function () {
    const ordered = this.getAttribute("aria-pressed") !== "true";
    this.setAttribute("aria-pressed", ordered);
    this.textContent = ordered ? "有序骨架 ✓" : "散乱堆放 · 点击整理";
    host.select(".skeleton").classed("disorder", !ordered);
  });
  host.select("#padding-slider").on("input", function () {
    host.select(".skeleton").style("--region-pad", this.value + "px");
    host.select("#padding-value").text(this.value + "px");
    x.measure();
  });
}
