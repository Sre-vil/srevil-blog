/* Loops & Graphs 글 전용. .lg-guide가 있을 때만 동작. */
(function(){
  var guides = document.querySelectorAll('.lg-guide');
  if (!guides.length) return;
  guides.forEach(function(el){ el.classList.add('lg-js'); });
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, el){ return (el || document).querySelector(s); }
  function $$(s, el){ return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  var LANG = ((document.documentElement.lang || '') + '').toLowerCase().indexOf('en') === 0 ? 'en' : 'ko';
  var I18N = {
    ko: {
      fail: '실패', pass: '통과', wait: '대기',
      stFail: '$ npm test → 실패',
      stPass: '$ npm test → 통과',
      stWait: '$ npm test → 대기',
      fakeEdge: '가짜 엣지',
      timePar: '워커 3개가 동시에 돌아갑니다: 1 단위 시간',
      timeFake: 'utils → handlers, handlers → adapters 사이로 넘어가는 변수가 없습니다',
      timeSer: '워커 3개가 차례로 돌아갑니다: 3 단위 시간',
      nSplitSub: '분할', nGateSub: '관문',
      copied: '복사됨',
      copy: '복사'
    },
    en: {
      fail: 'Fail', pass: 'Pass', wait: 'Waiting',
      stFail: '$ npm test → fail',
      stPass: '$ npm test → pass',
      stWait: '$ npm test → waiting',
      fakeEdge: 'fake edge',
      timePar: '3 workers in parallel: 1 time unit',
      timeFake: 'no variable passes from utils → handlers, or handlers → adapters',
      timeSer: '3 workers in sequence: 3 time units',
      nSplitSub: 'by blast radius', nGateSub: 'pass / reject',
      copied: 'Copied',
      copy: 'Copy'
    }
  };
  var T = I18N[LANG];

  /* ---------- reveal ---------- */
  setTimeout(function(){
    if ($('.lg-reveal.in')) return;
    $$('.lg-guide .lg-reveal').forEach(function(e){ e.classList.add('in'); });
  }, 2500);
  var revealEls = $$('.lg-guide .lg-reveal');
  if ('IntersectionObserver' in window && !RM){
    var ro = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting){
          e.target.classList.add('in');
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function(el){ ro.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  function whenVisible(el, onIn){
    if (!el) return;
    if (!('IntersectionObserver' in window) || RM){ onIn(); return; }
    var once = false;
    new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting && !once){ once = true; onIn(); }
      });
    }, { threshold: 0.25 }).observe(el);
  }

  /* ---------- Loop ---------- */
  (function(){
    var svg = $('#loopSvg'); if (!svg) return;
    var C = 260, Y = 220, R = 160;
    var ring = $('#ringP'), dot = $('#loopDot'), center = $('#loopCenter'), status = $('#loopStatus');
    var st = { P:$('#stP'), C:$('#stC'), F:$('#stF'), R:$('#stR') };
    var circ = 2 * Math.PI * R;
    var raf = null, t0 = null, playing = false;

    function ease(x){ return x < .5 ? 2*x*x : 1 - Math.pow(-2*x+2, 2)/2; }
    function setCheck(c){
      ['P','C','F','R'].forEach(function(k){ st[k].classList.remove('on','red','green'); });
      if (c === 'red'){ st.C.classList.add('red'); if (center) center.textContent = T.fail; if (status){ status.textContent = T.stFail; status.className = 'lg-status-pill red'; } }
      else if (c === 'green'){ st.C.classList.add('green'); if (center) center.textContent = T.pass; if (status){ status.textContent = T.stPass; status.className = 'lg-status-pill green'; } }
      else { if (center) center.textContent = T.wait; if (status){ status.textContent = T.stWait; status.className = 'lg-status-pill'; } }
    }
    function draw(a){
      var m = (a % 360 + 360) % 360;
      var rad = (m - 90) * Math.PI / 180;
      if (dot){ dot.setAttribute('cx', C + R * Math.cos(rad)); dot.setAttribute('cy', Y + R * Math.sin(rad)); }
      if (ring){ ring.setAttribute('stroke-dasharray', (m/360*circ) + ' ' + circ); }
      function near(x){ var d = Math.abs(m-x); return Math.min(d, 360-d) < 14; }
      st.P.classList.toggle('on', near(0));
      st.C.classList.toggle('on', near(90) && !st.C.classList.contains('red') && !st.C.classList.contains('green'));
      st.F.classList.toggle('on', near(180));
      st.R.classList.toggle('on', near(270));
    }
    function frame(ts){
      if (t0 === null) t0 = ts;
      var t = (ts - t0) / 1000;
      var a;
      if (t < 2.2){ a = 90 * ease(t/2.2); setCheck(''); }
      else if (t < 3.2){ a = 90; setCheck('red'); }
      else if (t < 6.2){ a = 90 + 270 * ease((t-3.2)/3); setCheck(''); }
      else if (t < 8.4){ a = 360 + 90 * ease((t-6.2)/2.2); setCheck(''); }
      else { a = 450; setCheck('green'); draw(a); playing = false; raf = null; return; }
      draw(a);
      raf = requestAnimationFrame(frame);
    }
    function start(){
      if (RM){ setCheck('green'); draw(450); return; }
      if (playing) return;
      playing = true; t0 = null;
      raf = requestAnimationFrame(frame);
    }
    whenVisible(svg, start);
  })();

  /* ---------- Graph (DAG): Splitter -> 3 workers -> Merge (code) -> Gate ---------- */
  (function(){
    var svg = $('#dagSvg'); if (!svg) return;
    var NS = 'http://www.w3.org/2000/svg';
    var W = 96, H = 58;
    var nodes = {
      S: { t:'Splitter', s:T.nSplitSub, c:'#f0b45a' },
      U: { t:'utils',    s:'Worker',    c:'#7fb2ef' },
      H: { t:'handlers', s:'Worker',    c:'#7fb2ef' },
      A: { t:'adapters', s:'Worker',    c:'#7fb2ef' },
      M: { t:'Merge',    s:'Code',      c:'#30d158' },
      G: { t:'Gate',     s:T.nGateSub,  c:'#b794f4' }
    };
    var lin = { S:[60,160], U:[192,160], H:[324,160], A:[456,160], M:[588,160], G:[720,160] };
    var par = { S:[70,160], U:[300,60],  H:[300,160], A:[300,260], M:[540,160], G:[710,160] };
    var edges = [
      ['S','U','slice'], ['U','H',''], ['H','A',''], ['A','M','diff'], ['M','G','merged'],
      ['S','H','slice'], ['S','A','slice'], ['U','M','diff'], ['H','M','diff']
    ];
    var vis = [
      { SU:1, UH:1, HA:1, AM:1, MG:1 },
      { SU:1, UH:1, HA:1, AM:1, MG:1 },
      { SU:1, SH:1, SA:1, UM:1, HM:1, AM:1, MG:1 }
    ];
    var state = 0, anim = null;
    var pos = JSON.parse(JSON.stringify(lin));

    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<marker id="dArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8b8a93"></path></marker><marker id="dArrR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ff453a"></path></marker>';
    svg.appendChild(defs);

    var eEls = {}, lEls = {}, vEls = {}, nEls = {};
    edges.forEach(function(e){
      var k = e[0] + e[1];
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('class', 'lg-edge');
      p.setAttribute('marker-end', 'url(#dArr)');
      svg.appendChild(p); eEls[k] = p;
      if (k === 'UH' || k === 'HA'){
        var lb = document.createElementNS(NS, 'text');
        lb.setAttribute('class', 'lg-elabel'); lb.textContent = T.fakeEdge; lb.style.opacity = 0;
        svg.appendChild(lb); lEls[k] = lb;
      }
      if (e[2]){
        var vl = document.createElementNS(NS, 'text');
        vl.setAttribute('class', 'lg-vlabel'); vl.textContent = e[2]; vl.style.opacity = 0;
        svg.appendChild(vl); vEls[k] = vl;
      }
    });
    Object.keys(nodes).forEach(function(k){
      var n = nodes[k], g = document.createElementNS(NS, 'g');
      g.innerHTML = '<rect class="lg-n-rect" x="'+(-W/2)+'" y="'+(-H/2)+'" width="'+W+'" height="'+H+'" rx="14" style="stroke:'+n.c+';stroke-width:2"></rect>' +
        '<text class="lg-n-txt" y="-7" style="font-size:14px;fill:#f3f1ec">'+n.t+'</text>' +
        '<text class="lg-n-sub" y="13" style="fill:'+n.c+'">'+n.s+'</text>';
      svg.appendChild(g); nEls[k] = g;
    });

    function render(){
      Object.keys(nEls).forEach(function(k){
        nEls[k].setAttribute('transform', 'translate('+pos[k][0]+' '+pos[k][1]+')');
      });
      edges.forEach(function(e){
        var k = e[0] + e[1], a = pos[e[0]], b = pos[e[1]];
        var x1 = a[0] + W/2, y1 = a[1], x2 = b[0] - W/2 - 4, y2 = b[1], mx = (x1 + x2) / 2;
        eEls[k].setAttribute('d', 'M'+x1+' '+y1+' C'+mx+' '+y1+' '+mx+' '+y2+' '+x2+' '+y2);
        if (lEls[k]){ lEls[k].setAttribute('x', (x1 + x2) / 2); lEls[k].setAttribute('y', y1 - 40); }
        if (vEls[k]){
          var vx = (x1 + x2) / 2, vy = (y1 + y2) / 2 - 8;
          if (state === 2 && (k === 'SU' || k === 'SA' || k === 'UM' || k === 'AM')){
            vy = (y1 + y2) / 2 + ((y2 < y1) === (k === 'SU' || k === 'AM') ? -14 : 18);
          }
          vEls[k].setAttribute('x', vx); vEls[k].setAttribute('y', vy);
        }
      });
    }
    function applyStyles(){
      edges.forEach(function(e){
        var k = e[0] + e[1], on = !!vis[state][k], fake = state === 1 && (k === 'UH' || k === 'HA');
        eEls[k].style.opacity = on ? 1 : 0;
        eEls[k].classList.toggle('fake', fake);
        eEls[k].setAttribute('marker-end', fake ? 'url(#dArrR)' : 'url(#dArr)');
        if (lEls[k]) lEls[k].style.opacity = fake ? 1 : 0;
        if (vEls[k]) vEls[k].style.opacity = (on && state >= 1) ? 1 : 0;
      });
      var tb = $('#timeBar'), tt = $('#timeTxt');
      if (state === 2){ if (tb) tb.style.width = '38%'; if (tt) tt.textContent = T.timePar; }
      else if (state === 1){ if (tb) tb.style.width = '100%'; if (tt) tt.textContent = T.timeFake; }
      else { if (tb) tb.style.width = '100%'; if (tt) tt.textContent = T.timeSer; }
    }
    function go(s){
      state = s; applyStyles();
      var target = s === 2 ? par : lin, from = JSON.parse(JSON.stringify(pos));
      if (anim) cancelAnimationFrame(anim);
      if (RM){ pos = JSON.parse(JSON.stringify(target)); render(); return; }
      var t0 = null, D = 900;
      function f(ts){
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / D); k = 1 - Math.pow(1 - k, 3);
        Object.keys(pos).forEach(function(n){
          pos[n] = [from[n][0] + (target[n][0] - from[n][0]) * k, from[n][1] + (target[n][1] - from[n][1]) * k];
        });
        render(); if (k < 1) anim = requestAnimationFrame(f);
      }
      anim = requestAnimationFrame(f);
    }
    render(); applyStyles();
    var played = false;
    whenVisible(svg, function(){
      if (played) return; played = true;
      if (RM){ go(2); return; }
      setTimeout(function(){ go(1); }, 1400);
      setTimeout(function(){ go(2); }, 3600);
    });
  })();

  /* ---------- copy buttons ---------- */
  $$('.lg-copy[data-copy]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var el = document.getElementById(btn.getAttribute('data-copy'));
      if (!el) return;
      var text = el.textContent;
      function done(){
        var prev = btn.textContent;
        btn.textContent = T.copied;
        setTimeout(function(){ btn.textContent = prev; }, 1400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done).catch(function(){ fallback(); });
      } else { fallback(); }
      function fallback(){
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  });

  /* ---------- checklist ---------- */
  (function(){
    var ul = $('[data-lg-checklist]'); if (!ul) return;
    var boxes = $$('input[type="checkbox"]', ul);
    var bar = $('[data-cl-bar]');
    var count = $('[data-cl-count]');
    var reset = $('[data-cl-reset]');
    var KEY = 'srevil.lg.checklist.v1.' + LANG;
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
    boxes.forEach(function(b, i){ if (saved[i]) b.checked = true; });
    function upd(){
      var n = 0;
      boxes.forEach(function(b){ if (b.checked) n++; });
      if (bar) bar.style.width = (boxes.length ? (n / boxes.length * 100) : 0) + '%';
      if (count) count.textContent = n + ' / ' + boxes.length;
    }
    ul.addEventListener('change', function(){
      var next = {};
      boxes.forEach(function(b, i){ if (b.checked) next[i] = true; });
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
      upd();
    });
    if (reset) reset.addEventListener('click', function(){
      boxes.forEach(function(b){ b.checked = false; });
      try { localStorage.removeItem(KEY); } catch (e) {}
      upd();
    });
    upd();
  })();
})();
