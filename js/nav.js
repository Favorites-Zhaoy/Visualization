export function initNav() {
  const sections = [
      ...document.querySelectorAll(".lesson"),
      document.querySelector("#final"),
    ],
    links = [
      ...document.querySelectorAll(".topbar nav a,.journey a,#rail-links a"),
    ];
  let waiting = false;
  function update() {
    let active = null;
    const line = Math.min(230, innerHeight * 0.3);
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= line) active = s.id;
    }
    for (const a of links) {
      const yes = a.hash === "#" + active;
      a.classList.toggle("active", yes);
      if (yes) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    }
    waiting = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!waiting) {
        waiting = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", update);
  update();
}
