/* Page transition: a short loading screen when a page opens, and a fade before leaving it.
   Add <script src="transition.js"></script> in the <head> of every page. */
(function () {
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MIN_SHOW = reduce ? 0 : 750;   // shortest time the loading screen stays up (ms)
  var started = Date.now();

  var css = document.createElement("style");
  css.textContent =
    "#tx{position:fixed;inset:0;z-index:9999;background:#060b24;display:grid;place-content:center;justify-items:center;gap:16px;opacity:1;transition:opacity .35s ease}" +
    "#tx.out{opacity:0;pointer-events:none}" +
    "#tx b{font:800 1.15rem 'Bricolage Grotesque','Segoe UI',system-ui,sans-serif;color:#e8eeff;letter-spacing:-.01em}" +
    "#tx i{display:block;position:relative;width:140px;height:4px;border-radius:4px;background:#22317d;overflow:hidden}" +
    "#tx i::after{content:'';position:absolute;top:0;left:0;height:100%;width:40%;border-radius:4px;background:#5cd6ff;animation:txb 1s ease-in-out infinite}" +
    "@keyframes txb{from{transform:translateX(-100%)}to{transform:translateX(350%)}}" +
    "@media (prefers-reduced-motion:reduce){#tx{transition:none}#tx i::after{animation:none;width:100%}}";
  document.documentElement.appendChild(css);

  var tx = document.createElement("div");
  tx.id = "tx";
  tx.setAttribute("role", "status");
  tx.setAttribute("aria-label", "Loading");
  tx.innerHTML = "<b>Loading...</b><i></i>";
  document.documentElement.appendChild(tx);

  function reveal() {
    var wait = Math.max(0, MIN_SHOW - (Date.now() - started));
    setTimeout(function () { tx.classList.add("out"); }, wait);
  }
  if (document.readyState === "complete") reveal();
  else addEventListener("load", reveal);
  setTimeout(reveal, 4000);  // safety: never leave the screen up

  // Coming back with the browser's Back button: show the page, not the loader
  addEventListener("pageshow", function (e) {
    if (e.persisted) tx.classList.add("out");
  });

  // Fade the loading screen in before leaving for another page of this site
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;                                   // external links
    if (url.pathname === location.pathname && url.search === location.search) return;  // same-page anchors
    e.preventDefault();
    tx.classList.remove("out");
    setTimeout(function () { location.href = url.href; }, reduce ? 0 : 320);
  });
})();
