// Brand layer behaviour: a soft lantern light follows the pointer (see body::before in brand.css).
(function () {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let raf = 0, x = 0, y = 0;
  document.addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      document.body.style.setProperty("--mx", x + "px");
      document.body.style.setProperty("--my", y + "px");
    });
  }, { passive: true });
})();
