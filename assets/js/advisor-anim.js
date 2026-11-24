/* advisor 글 전용 애니메이션 (front matter: advisor_anim: true)
   - HTML은 완료 상태로 그려 두고, JS가 초기화한 뒤 화면에 들어올 때 한 번 재생한다.
   - prefers-reduced-motion이면 아무것도 하지 않아 완료 상태가 그대로 남는다. */
(function () {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window) || !window.Promise) return;

  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function wait(ms, tok) {
    return new Promise(function (res, rej) { setTimeout(function () { tok.dead ? rej(0) : res(); }, ms); });
  }
  function tween(ms, fn, tok, linear) {
    return new Promise(function (res, rej) {
      var t0 = null;
      function f(ts) {
        if (tok.dead) return rej(0);
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / ms);
        fn(linear ? p : ease(p));
        p < 1 ? requestAnimationFrame(f) : res();
      }
      requestAnimationFrame(f);
    });
  }
  function setup(fig, reset, run) {
    if (!fig) return;
    var tok = null;
    function play() {
      if (tok) tok.dead = true;
      var t = tok = { dead: false };
      reset();
      run(t).catch(function () {});
    }
    fig.classList.add("js");
    reset();
    var btn = fig.querySelector(".adv-replay");
    if (btn) btn.addEventListener("click", play);
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); play(); }
    }, { threshold: .45 });
    io.observe(fig);
  }
  function $(root, s) { return root.querySelector(s); }
  function $$(root, s) { return Array.prototype.slice.call(root.querySelectorAll(s)); }

  /* ---------- 그림 1: 호출 흐름 ---------- */
  (function () {
    var fig = document.getElementById("advFlow");
    if (!fig) return;
    var box = $(fig, ".abox"), st = $(fig, ".st"), prog = $(fig, ".prog"), runner = $(fig, ".runner");
    var wires = $$(fig, ".wire"), cps = $$(fig, ".cp"), up = $(fig, ".pk-up"), dn = $(fig, ".pk-dn");
    var upRect = $(up, "rect"), cap = $(fig, "figcaption");
    var finalCap = cap.innerHTML;
    var X0 = 30, X1 = 530, CX = [170, 320, 470], AX = 280, AY = 84, TY = 236;
    var W = [80, 104, 128];
    var CAP = [
      "메인 모델(Sonnet)이 평소처럼 작업합니다. <b>대부분의 턴은 advisor 없이</b> 지나갑니다.",
      "<b>접근 방식을 확정하기 전</b>, Claude가 스스로 판단해 advisor를 부릅니다. advisor는 도구 호출과 결과를 포함한 <b>전체 대화</b>를 받습니다.",
      "<b>같은 오류에 막혔을 때</b> 다시 자문합니다. 그사이 대화가 길어져 advisor가 읽을 양도 늘었습니다.",
      "<b>완료를 선언하기 전</b> 마지막으로 검토를 받습니다. 조언이 직접 확인한 증거와 충돌하면 그대로 따르지 않고 충돌을 드러냅니다."
    ];
    function setStatus(text, cls) { st.textContent = text; st.setAttribute("class", "st " + (cls || "")); }
    function moveRunner(x) { runner.setAttribute("cx", x); prog.setAttribute("x2", x); }
    function bez(cx, p) { // (cx,TY) → 제어점 (cx,110) → (AX,AY)
      var q = 1 - p;
      return [q * q * cx + 2 * q * p * cx + p * p * AX, q * q * TY + 2 * q * p * 110 + p * p * AY];
    }
    function place(g, pt) { g.setAttribute("transform", "translate(" + pt[0].toFixed(1) + " " + pt[1].toFixed(1) + ")"); }
    function reset() {
      moveRunner(X0);
      box.classList.remove("on");
      wires.forEach(function (w) { w.classList.remove("on"); });
      cps.forEach(function (c) { c.classList.remove("on", "done"); });
      up.setAttribute("opacity", 0); dn.setAttribute("opacity", 0);
      setStatus("대기 중", "muted");
      cap.innerHTML = CAP[0];
    }
    function run(tok) {
      var x = X0, i = 0;
      function step() {
        if (i >= CX.length) {
          return tween(900, function (p) { moveRunner(CX[2] + (X1 - CX[2]) * p); }, tok).then(function () {
            setStatus("작업 완료 · 호출 3번", "ok");
            cap.innerHTML = finalCap;
          });
        }
        var cx = CX[i], from = x;
        return tween((cx - from) * 7, function (p) { moveRunner(from + (cx - from) * p); }, tok)
          .then(function () {
            x = cx;
            cps[i].classList.add("on"); wires[i].classList.add("on");
            cap.innerHTML = CAP[i + 1];
            upRect.setAttribute("width", W[i]); upRect.setAttribute("x", -W[i] / 2);
            up.setAttribute("opacity", 1);
            setStatus("Claude가 호출을 결정", "adv");
            return tween(1000, function (p) { place(up, bez(cx, p)); }, tok);
          })
          .then(function () {
            up.setAttribute("opacity", 0);
            box.classList.add("on");
            setStatus("Advising… 전체 대화를 읽는 중", "adv");
            return wait(1300, tok);
          })
          .then(function () {
            box.classList.remove("on");
            setStatus("Reviewed · 지침 반환", "ok");
            dn.setAttribute("opacity", 1);
            return tween(900, function (p) { place(dn, bez(cx, 1 - p)); }, tok);
          })
          .then(function () {
            dn.setAttribute("opacity", 0);
            wires[i].classList.remove("on");
            cps[i].classList.remove("on"); cps[i].classList.add("done");
            setStatus("메인 모델이 작업을 이어 감", "muted");
            i++;
            return wait(900, tok).then(step);
          });
      }
      return wait(600, tok).then(step);
    }
    setup(fig, reset, run);
  })();

  /* ---------- 그림 2: 실행 로그 ---------- */
  (function () {
    var fig = document.getElementById("advRun");
    if (!fig) return;
    var clock = $(fig, "[data-clock]"), segs = $$(fig, ".seg"), rows = $$(fig, ".adv-log li"), cost = $(fig, ".adv-cost");
    var TOTAL = 16.6, ANIM = 7500;
    function paint(t) {
      clock.textContent = t.toFixed(1);
      segs.forEach(function (s) {
        var a = +s.getAttribute("data-s"), b = +s.getAttribute("data-e");
        var p = Math.max(0, Math.min(1, (t - a) / (b - a)));
        s.firstElementChild.style.transform = "scaleX(" + p + ")";
      });
      rows.forEach(function (r) {
        var at = +r.getAttribute("data-at");
        r.classList.toggle("hide", t < at);
        var until = r.getAttribute("data-busy");
        r.classList.toggle("busy", until !== null && t >= at && t < +until);
      });
    }
    function reset() { paint(0); cost.classList.add("hide"); }
    function run(tok) {
      return wait(400, tok)
        .then(function () { return tween(ANIM, function (p) { paint(p * TOTAL); }, tok, true); })
        .then(function () { return wait(500, tok); })
        .then(function () { cost.classList.remove("hide"); });
    }
    setup(fig, reset, run);
  })();

  /* ---------- 그림 3: advisor는 매번 처음부터 읽는다 ---------- */
  (function () {
    var fig = document.getElementById("advCache");
    if (!fig) return;
    var blocks = $$(fig, ".adv-blocks i"), calls = $$(fig, ".adv-calls > div");
    function reset() {
      blocks.forEach(function (b) { b.className = "off"; });
      calls.forEach(function (c) { c.classList.add("off"); });
    }
    function run(tok) {
      var k = 0, call = 0;
      function turn() {
        if (k >= blocks.length) return Promise.resolve();
        if (k > 0) blocks[k - 1].className = "";
        blocks[k].className = "new";
        k++;
        var p = wait(520, tok);
        if (k % 3 === 0) {
          p = p.then(function () {
            var n = k, j = 0;
            function sweep() {
              if (j >= n) return wait(250, tok);
              blocks[j++].className = "read";
              return wait(70, tok).then(sweep);
            }
            return sweep().then(function () {
              calls[call++].classList.remove("off");
              return wait(900, tok);
            }).then(function () {
              for (var m = 0; m < n; m++) blocks[m].className = "";
              blocks[n - 1].className = "new";
              return wait(300, tok);
            });
          });
        }
        return p.then(turn);
      }
      return wait(500, tok).then(turn);
    }
    setup(fig, reset, run);
  })();

  /* ---------- 그림 4: 강한 모델이 언제 도는가 ---------- */
  (function () {
    var fig = document.getElementById("advCmp");
    if (!fig) return;
    var rows = $$(fig, ".adv-cells").map(function (r) { return $$(r, "i"); });
    var cols = rows[0].length;
    function reset() { rows.forEach(function (r) { r.forEach(function (c) { c.classList.add("dim"); }); }); }
    function run(tok) {
      var c = 0;
      function col() {
        if (c >= cols) return Promise.resolve();
        rows.forEach(function (r) { r[c].classList.remove("dim"); });
        c++;
        return wait(260, tok).then(col);
      }
      return wait(400, tok).then(col);
    }
    setup(fig, reset, run);
  })();
})();
