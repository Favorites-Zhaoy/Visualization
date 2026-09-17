import { dashboard } from "./charts.js?v=3";
import { cleanupWith } from "./lifecycle.js?v=3";

export function initFinal() {
  const product = dashboard("#final-dashboard", { xray: false });
  const root = d3.select(product.el);
  const button = root.select(".dashboard-controls").append("button")
    .attr("class", "anatomy-toggle")
    .attr("aria-pressed", "false")
    .text("Reveal Layout Anatomy");
  button.on("click.anatomy", function () {
    const on = this.getAttribute("aria-pressed") !== "true";
    root.classed("anatomy-on", on);
    button.attr("aria-pressed", String(on))
      .text(on ? "Hide Layout Anatomy" : "Reveal Layout Anatomy");
    root.selectAll(".anatomy-label").property("hidden", !on);
  });
  // Labels take part in document flow, so no controls or chart marks are covered.
  root.selectAll("[data-anatomy]").each(function () {
    d3.select(this).insert("span", ":first-child")
      .attr("class", "anatomy-label").property("hidden", true)
      .text(this.dataset.anatomy);
  });
  return { ...product, destroy: cleanupWith(() => {
    button.on(".anatomy", null);
    product.destroy();
  }) };
}
