/* Srevil intro 시퀀스 (intro-demo.html 기반). ?intro=0 건너뛰기, ?intro=1 강제 재생 */
(function () {
  var q = location.search;
  var root = document.documentElement;
  var intro = document.getElementById("intro");
  var TITLE = intro ? (intro.getAttribute("data-title") || "Srevil Blog") : "";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = [];

  function starfield(canvas, density, speed, alphaBase) {
    var ctx = canvas.getContext("2d"), stars = [], id;
    function size() {
      var dpr = window.devicePixelRatio || 1;
      canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.round(innerWidth * innerHeight / density) }, function () {
        return { x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.2 + .2, s: (Math.random() * .3 + .05) * speed, p: Math.random() * 6.28 };
      });
    }
    function draw(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i]; s.y -= s.s; if (s.y < 0) s.y = innerHeight;
        ctx.globalAlpha = alphaBase + alphaBase * Math.sin(t / 700 + s.p);
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
      }
      id = requestAnimationFrame(draw);
    }
    return { start: function () { cancelAnimationFrame(id); size(); id = requestAnimationFrame(draw); }, stop: function () { cancelAnimationFrame(id); }, resize: size };
  }

  var bg = document.getElementById("bgstars");
  if (bg) {
    var bgField = starfield(bg, 9000, .4, .3);
    bgField.start(); addEventListener("resize", bgField.resize);
    if (reduce) bgField.stop();
  }

  if (!intro) return;
  var typed = document.getElementById("typed"), tagline = document.getElementById("tagline");
  var field = starfield(document.getElementById("stars"), 6000, 1, .35);
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function finish() {
    timers.forEach(clearTimeout); timers = [];
    intro.classList.add("leave");
    document.dispatchEvent(new Event("intro:leave"));
    later(function () { intro.classList.add("gone"); field.stop(); document.dispatchEvent(new Event("intro:done")); }, 900);
    try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
  }

  function play() {
    root.classList.remove("intro-skip");
    intro.classList.remove("leave", "gone");
    try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
    intro.querySelectorAll(".icon, .spark, .ring, .x, .gb-body, .gb-eyes, .boot span").forEach(function (el) {
      el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
    });
    typed.textContent = ""; tagline.classList.remove("show");
    field.start();
    if (reduce) { typed.textContent = TITLE; tagline.classList.add("show"); later(finish, 1500); return; }
    var start = 2100;
    for (var i = 1; i <= TITLE.length; i++) (function (n) { later(function () { typed.textContent = TITLE.slice(0, n); }, start + n * 70); })(i);
    var end = start + TITLE.length * 70;
    later(function () { tagline.classList.add("show"); }, end + 150);
    later(finish, end + 1300);
  }

  document.getElementById("skip").addEventListener("click", finish);
  intro.addEventListener("click", function (e) { if (e.target.id !== "skip") finish(); });
  document.addEventListener("keydown", function () { if (!intro.classList.contains("gone") && !root.classList.contains("intro-skip")) finish(); });

  if (root.classList.contains("intro-skip")) { intro.classList.add("gone"); field.stop(); return; }
  play();
})();

/* 글 읽기 진행바 */
(function () {
  var pg = document.getElementById("pg");
  if (!pg) return;
  addEventListener("scroll", function () {
    var h = document.documentElement;
    pg.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + "%";
  }, { passive: true });
})();
