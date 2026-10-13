/* CausalFunnel tracker: page_view + click. Plain ES2017, no dependencies. Never throws on the host page. */
(function () {
  var w = window, d = document, script, endpoint, debug = false, memSession = null, lastPath = null;
  var KEY = "cf_session", TTL = 30 * 60 * 1000;

  function log(a, b) {
    if (debug) try { console.debug("[cf]", a, b === undefined ? "" : b); } catch (e) {}
  }

  function guard(fn) {
    return function () {
      try { return fn.apply(this, arguments); } catch (e) { log("error", e); }
    };
  }

  function uuid() {
    if (w.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 3) | 8).toString(16);
    });
  }

  // { id, lastSeen } in localStorage; falls back to memory when storage throws (private mode).
  function sessionId() {
    var now = Date.now(), s = null;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = memSession; }
    if (!s || !s.id || now - s.lastSeen > TTL) s = { id: uuid(), lastSeen: now };
    s.lastSeen = now;
    memSession = s;
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    return s.id;
  }

  // text/plain keeps the request CORS-simple (no preflight).
  function send(evt) {
    var body = JSON.stringify(evt), sent = false;
    log(evt.event_type, evt);
    try { sent = !!(navigator.sendBeacon && navigator.sendBeacon(endpoint, new Blob([body], { type: "text/plain" }))); } catch (e) {}
    if (!sent && w.fetch) {
      fetch(endpoint, { method: "POST", keepalive: true, headers: { "Content-Type": "text/plain" }, body: body })
        .catch(function (e) { log("send failed", e); });
    }
  }

  function base(type) {
    return { session_id: sessionId(), event_type: type, page_url: location.href, timestamp: new Date().toISOString() };
  }

  // Only when the path changes, so SPA replaceState/pushState of query or hash doesn't double-count.
  var pageView = guard(function () {
    if (location.pathname === lastPath) return;
    lastPath = location.pathname;
    var evt = base("page_view");
    if (d.referrer) evt.referrer = d.referrer;
    send(evt);
  });

  // Short description of what was clicked: nearest a/button/input/select/textarea/label/[data-cf] (else the element
  // itself), as tag + #id or .firstClass, plus up to 60 chars of visible text. Never text or values of form fields.
  function describeTarget(el) {
    var hit = el && el.closest ? el.closest("a,button,input,select,textarea,label,[data-cf]") : null;
    var node = hit || el;
    if (!node || !node.tagName) return undefined;
    var tag = node.tagName.toLowerCase();
    var cls = typeof node.className === "string" ? node.className.trim().split(/\s+/)[0] : "";
    var desc = tag + (node.id ? "#" + node.id : cls ? "." + cls : "");
    if (hit && !/^(input|select|textarea)$/.test(tag)) {
      var text = "";
      if (node.querySelector("input,select,textarea")) {
        // Wraps a form field (e.g. <label>State <select>): own text nodes only, so no selected option or value leaks.
        for (var i = 0; i < node.childNodes.length; i++) if (node.childNodes[i].nodeType === 3) text += node.childNodes[i].nodeValue;
      } else {
        text = node.innerText || "";
      }
      text = text.replace(/\s+/g, " ").trim().slice(0, 60);
      if (text) desc += ' "' + text + '"';
    }
    return desc.slice(0, 140);
  }

  var onClick = guard(function (e) {
    var evt = base("click"), r = Math.round;
    evt.x = r(e.pageX);
    evt.y = r(e.pageY);
    evt.viewport_w = r(w.innerWidth);
    evt.layout_w = r(d.documentElement.clientWidth); // innerWidth minus the scrollbar: the width the page laid out at
    evt.viewport_h = r(w.innerHeight);
    evt.page_h = Math.max(1, r(d.documentElement.scrollHeight));
    evt.target = describeTarget(e.target);
    send(evt);
  });

  function wrap(name) {
    var orig = history[name];
    if (typeof orig !== "function") return;
    history[name] = function () {
      var result = orig.apply(this, arguments);
      pageView();
      return result;
    };
  }

  guard(function () {
    if (w.CausalFunnel) return; // already loaded: don't double-count
    if (new URLSearchParams(location.search).get("cf_preview") === "1") return; // dashboard heatmap preview
    w.CausalFunnel = { sessionId: function () { return memSession && memSession.id; } }; // read-only: doesn't extend the session

    script = d.currentScript || d.querySelector('script[src*="tracker.js"]');
    debug = !!(script && script.hasAttribute("data-debug"));
    endpoint = (script && script.getAttribute("data-endpoint")) ||
      new URL("/api/events", script && script.src ? script.src : location.href).href;

    wrap("pushState");
    wrap("replaceState");
    w.addEventListener("popstate", pageView);
    d.addEventListener("click", onClick, true); // capture: host stopPropagation can't block us
    pageView();
  })();
})();
