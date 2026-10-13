// Playwright snippet (run with the Playwright MCP tool `browser_run_code_unsafe`, filename = this file).
// It is not a Node script: the file is a single function expression that receives a Playwright `page`.
//
// Renders every demo page (with ?cf_preview=1 so nothing is tracked) EXACTLY the way the heatmap preview does: in an
// iframe at the layout width (desktop: window width minus a 15px scrollbar; mobile: full width, overlay scrollbars) and
// the page's full height, so nothing scrolls and sticky elements sit where the preview shows them. Per page and width it
// records viewport/layout size, page height and every clickable element with a few sample points where the browser
// itself reports that element under the point (so a seeded click's `target` is exactly what tracker.js would send).
// The result is left in `window.__seedLayout` of the tool's page; read it with `browser_evaluate` and save it to
// scripts/seed-layout.json. Re-run after any demo store layout change.
/* eslint-disable @typescript-eslint/no-unused-expressions -- snippet file: one function expression, executed by the Playwright tool */
async (page) => {
  const ORIGIN = "http://localhost:3000";
  const PAGES = { home: "/demo", products: "/demo/products.html", product: "/demo/product.html", checkout: "/demo/checkout.html" };
  const WIDTHS = [
    { width: 1536, height: 776, mobile: false },
    { width: 1366, height: 657, mobile: false },
    { width: 1280, height: 720, mobile: false },
    { width: 390, height: 844, mobile: true },
    { width: 375, height: 812, mobile: true },
  ];

  // Runs inside the demo page.
  const capture = () => {
    const SEL = "a,button,input,select,textarea,label,[data-cf]";
    // Same logic as tracker.js labelText() / fieldKind() / fieldName() / describeTarget().
    const labelText = (label) => {
      let text = "";
      const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const parent = walker.currentNode.parentNode;
        if (!parent?.closest?.("select,textarea")) text += " " + walker.currentNode.nodeValue;
      }
      return text.replace(/\s+/g, " ").trim().replace(/\s*:$/, "");
    };
    const fieldKind = (f) => {
      const tag = f.tagName.toLowerCase();
      const type = (f.getAttribute("type") || "text").toLowerCase();
      if (tag === "select") return "Dropdown";
      if (tag === "textarea") return "Text area";
      if (type === "checkbox") return "Checkbox";
      if (type === "radio") return "Radio";
      if (/^(submit|button|reset|image|hidden|file|range|color)$/.test(type)) return null;
      if (type === "search" || f.closest('[role="search"]')) return "Search box";
      return "Text box";
    };
    const fieldName = (f) => {
      for (const label of f.labels || []) {
        const t = labelText(label);
        if (t) return t;
      }
      return (f.getAttribute("aria-label") || f.getAttribute("placeholder") || "").replace(/\s+/g, " ").trim();
    };
    const describe = (el) => {
      const hit = el && el.closest ? el.closest(SEL) : null;
      let node = hit || el;
      if (!node || !node.tagName) return undefined;
      const field = hit && (/^(INPUT|SELECT|TEXTAREA)$/.test(hit.tagName) ? hit : hit.tagName === "LABEL" ? hit.control : null);
      const kind = field && fieldKind(field);
      if (kind) {
        const name = fieldName(field).slice(0, 60);
        if (name) return (kind + ": " + name).slice(0, 140);
        node = field;
      }
      const tag = node.tagName.toLowerCase();
      const cls = typeof node.className === "string" ? node.className.trim().split(/\s+/)[0] : "";
      let desc = tag + (node.id ? "#" + node.id : cls ? "." + cls : "");
      if (hit && !/^(input|select|textarea)$/.test(tag)) {
        let text = "";
        if (node.querySelector("input,select,textarea")) {
          for (const c of node.childNodes) if (c.nodeType === 3) text += c.nodeValue;
        } else {
          text = node.innerText || "";
        }
        text = text.replace(/\s+/g, " ").trim().slice(0, 60);
        if (text) desc += ' "' + text + '"';
      }
      return desc.slice(0, 140);
    };
    const pageOf = (href) => {
      try {
        const u = new URL(href, location.href);
        if (u.origin !== location.origin) return null;
        const p = u.pathname.replace(/\/+$/, "");
        if (p === "/demo" || p === "/demo/index.html") return u.hash && p === location.pathname.replace(/\/+$/, "") ? null : "home";
        if (p.endsWith("/products.html")) return "products";
        if (p.endsWith("/product.html")) return "product";
        if (p.endsWith("/checkout.html")) return "checkout";
      } catch {
        // not a URL
      }
      return null;
    };
    const kindOf = (el) => {
      if (el.closest("article.product, .row, .quad")) return "product";
      if (el.matches("input,select,textarea,label")) return "input";
      if (el.matches("button, a.btn")) return "button";
      if (el.closest("header, nav, .co-head")) return "nav";
      return "link";
    };

    const elements = [];
    for (const el of document.querySelectorAll(SEL)) {
      const r0 = el.getBoundingClientRect();
      if (r0.width < 4 || r0.height < 4 || !el.checkVisibility()) continue;
      // No scrolling: the iframe is as tall as the page, so every element is already in view. Items hidden in
      // sideways-scrolling strips (category nav, best sellers) fail the elementFromPoint check and are skipped.
      const r = r0;
      const target = describe(el);
      const points = [];
      const cols = r.width > 40 ? 3 : 1;
      const rows = r.height > 24 ? 2 : 1;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const vx = r.left + (r.width * (i + 1)) / (cols + 1);
          const vy = r.top + (r.height * (j + 1)) / (rows + 1);
          // Keep the point only if it AND its ±3px neighbourhood all hit this element, so the seed's ±2px jitter
          // can never cross into a neighbouring element (e.g. from a label's text onto the input inside it).
          const same = (x, y) => {
            if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
            const hit = document.elementFromPoint(x, y);
            return !!hit && describe(hit) === target && (hit.closest(SEL) ?? hit) === (el.closest(SEL) ?? el);
          };
          const around = [[0, 0], [-3, -3], [3, -3], [-3, 3], [3, 3], [0, -3], [0, 3], [-3, 0], [3, 0]];
          if (around.every(([dx, dy]) => same(vx + dx, vy + dy))) {
            points.push([Math.round(vx + scrollX), Math.round(vy + scrollY)]);
          }
        }
      }
      if (points.length === 0) continue;
      let to = null;
      if (el.tagName === "A") to = pageOf(el.getAttribute("href") || "");
      else if (el.matches("button[type=submit]") && el.form && el.form.getAttribute("action")) to = pageOf(el.form.getAttribute("action"));
      elements.push({ kind: kindOf(el), target, to, points });
    }
    return { layout_w: document.documentElement.clientWidth, page_h: document.documentElement.scrollHeight, elements };
  };

  const SCROLLBAR = 15; // classic (Windows) scrollbar; real 1536px visits report layout_w 1521
  const layout = { generatedAt: new Date().toISOString(), pages: {} };
  for (const [key, path] of Object.entries(PAGES)) {
    layout.pages[key] = { path, widths: {} };
    for (const w of WIDTHS) {
      const layoutW = w.mobile ? w.width : w.width - SCROLLBAR;
      await page.setViewportSize({ width: layoutW + 40, height: 900 });
      // Parent document on the demo's origin (a static file), so the iframe loads like the dashboard preview does.
      await page.goto(`${ORIGIN}/demo/img/CREDITS.md`);
      // Start very tall so the iframe never shows a scrollbar, measure the real content height, then size the iframe to
      // it, like the heatmap's full-height preview (width = layout width, height = page height, no inner scrollbar).
      await page.setContent(
        `<body style="margin:0"><iframe id="f" src="${ORIGIN}${path}?cf_preview=1" style="display:block;border:0;width:${layoutW}px;height:30000px"></iframe></body>`,
        { waitUntil: "networkidle" },
      );
      // Poll until the iframe's demo document has loaded (frame found by URL, readyState complete, real content).
      let frame;
      for (let i = 0; i < 100; i++) {
        frame = page.frames().find((f) => f.url().includes("cf_preview=1"));
        const ready = frame && (await frame.evaluate(() => document.readyState === "complete" && document.body.childElementCount > 2));
        if (ready) break;
        await page.waitForTimeout(100);
      }
      if (!frame) throw new Error(`${path} @${w.width}: iframe did not load`);
      const height = await frame.evaluate(() => Math.ceil(document.documentElement.getBoundingClientRect().height));
      await page.evaluate((px) => {
        document.getElementById("f").style.height = `${px}px`;
      }, height);
      await page.waitForTimeout(300);
      const data = await frame.evaluate(capture);
      if (data.layout_w !== layoutW || data.page_h !== height) {
        throw new Error(`${path} @${w.width}: layout ${data.layout_w}/${layoutW}, height ${data.page_h}/${height} (inner scrollbar?)`);
      }
      layout.pages[key].widths[w.width] = { viewport_w: w.width, viewport_h: w.height, ...data };
    }
  }

  await page.goto("about:blank");
  await page.evaluate((data) => {
    window.__seedLayout = data;
  }, layout);
  const summary = Object.fromEntries(
    Object.entries(layout.pages).map(([k, v]) => [
      k,
      Object.fromEntries(Object.entries(v.widths).map(([w, d]) => [w, `${d.elements.length} el, layout ${d.layout_w}, h ${d.page_h}`])),
    ]),
  );
  return JSON.stringify(summary, null, 1);
}
