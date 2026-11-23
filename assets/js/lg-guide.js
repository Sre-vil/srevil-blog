/* Loops & Graphs 글 전용. .lg-guide가 있을 때만 동작. Loop/Graph 다이어그램과 스크롤 리빌만 남김. */
(function(){
  var guides = document.querySelectorAll('.lg-guide');
  if (!guides.length) return;
  guides.forEach(function(el){ el.classList.add('lg-js'); });
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, el){ return (el || document).querySelector(s); }
  function $$(s, el){ return Array.prototype.slice.call((el || document).querySelectorAll(s)); }

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
    var pts = { P:[C,Y-R], C:[C+R,Y], F:[C,Y+R], R:[C-R,Y] };
    var ring = $('#ringP'), dot = $('#loopDot'), center = $('#loopCenter'), status = $('#loopStatus');
    var st = { P:$('#stP'), C:$('#stC'), F:$('#stF'), R:$('#stR') };
    var circ = 2 * Math.PI * R;
    var raf = null, t0 = null, playing = false;

    function ease(x){ return x < .5 ? 2*x*x : 1 - Math.pow(-2*x+2, 2)/2; }
    function setCheck(c){
      ['P','C','F','R'].forEach(function(k){ st[k].classList.remove('on','red','green'); });
      if (c === 'red'){ st.C.classList.add('red'); if (center) center.textContent = '실패'; if (status){ status.textContent = '$ npm test → 실패'; status.className = 'lg-status-pill red'; } }
      else if (c === 'green'){ st.C.classList.add('green'); if (center) center.textContent = '통과'; if (status){ status.textContent = '$ npm test → 통과'; status.className = 'lg-status-pill green'; } }
      else { if (center) center.textContent = '대기'; if (status){ status.textContent = '$ npm test → 대기'; status.className = 'lg-status-pill'; } }
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
      // one slow orbit: produce → fail check → fix → produce → pass check, then hold
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

  /* ---------- Graph (DAG) ---------- */
  (function(){
    var svg = $('#dagSvg'); if (!svg) return;
    var NS = 'http://www.w3.org/2000/svg';
    var nodes = [
      { id:'U', l:'utils', c:'#7fb2ef', x:70, y:160 },
      { id:'H', l:'handlers', c:'#b794f4', x:230, y:160 },
      { id:'A', l:'adapters', c:'#f0b45a', x:390, y:160 },
      { id:'W1', l:'worker 1', c:'#30d158', x:560, y:70 },
      { id:'W2', l:'worker 2', c:'#30d158', x:560, y:160 },
      { id:'W3', l:'worker 3', c:'#30d158', x:560, y:250 }
    ];
    var nMap = {}; nodes.forEach(function(n){ nMap[n.id] = n; });
    var lin = { U:[70,160], H:[230,160], A:[390,160], W1:[560,70], W2:[560,160], W3:[560,250] };
    var par = { U:[90,80], H:[90,160], A:[90,240], W1:[420,80], W2:[420,160], W3:[420,240] };
    var pos = JSON.parse(JSON.stringify(lin));
    var edges = [['U','H'],['H','A'],['A','W1'],['A','W2'],['A','W3'],['U','W1'],['H','W2']];
    var vis = {
      0: { UH:1, HA:1, AW1:1, AW2:1, AW3:1 },
      1: { UH:1, HA:1, AW1:1, AW2:1, AW3:1 },
      2: { UW1:1, HW2:1, AW3:1 }
    };
    var state = 0, anim = null;

    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<marker id="dArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8b8a93"></path></marker><marker id="dArrR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ff453a"></path></marker>';
    svg.appendChild(defs);

    var eEls = {}, lEls = {}, vEls = {}, nEls = {};
    edges.forEach(function(e){
      var k = e[0]+e[1];
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('class', 'lg-edge');
      p.setAttribute('marker-end', 'url(#dArr)');
      svg.appendChild(p); eEls[k] = p;
      var lb = document.createElementNS(NS, 'text');
      lb.setAttribute('class', 'lg-elabel'); lb.textContent = '가짜 엣지'; lb.style.opacity = 0;
      svg.appendChild(lb); lEls[k] = lb;
      var vl = document.createElementNS(NS, 'text');
      vl.setAttribute('class', 'lg-vlabel'); vl.style.opacity = 0;
      svg.appendChild(vl); vEls[k] = vl;
    });
    nodes.forEach(function(n){
      var g = document.createElementNS(NS, 'g');
      var W = n.id[0]==='W' ? 128 : 120, H = 44;
      g.innerHTML = '<rect class="lg-n-rect" x="'+(-W/2)+'" y="'+(-H/2)+'" width="'+W+'" height="'+H+'" rx="14" style="stroke:'+n.c+';stroke-width:2"></rect>'+
        '<text class="lg-n-txt" y="1" style="fill:#f3f1ec">'+n.l+'</text>';
      svg.appendChild(g); nEls[n.id] = g;
    });

    function render(){
      nodes.forEach(function(n){
        var p = pos[n.id];
        nEls[n.id].setAttribute('transform', 'translate('+p[0]+' '+p[1]+')');
      });
      edges.forEach(function(e){
        var k = e[0]+e[1], a = pos[e[0]], b = pos[e[1]];
        var dx = b[0]-a[0], dy = b[1]-a[1], len = Math.sqrt(dx*dx+dy*dy) || 1;
        var ux = dx/len, uy = dy/len, pad = 28;
        var x1 = a[0]+ux*pad, y1 = a[1]+uy*pad, x2 = b[0]-ux*pad, y2 = b[1]-uy*pad;
        eEls[k].setAttribute('d', 'M'+x1+' '+y1+' L'+x2+' '+y2);
        if (lEls[k]){ lEls[k].setAttribute('x', (x1+x2)/2); lEls[k].setAttribute('y', (y1+y2)/2 - 8); }
        if (vEls[k]){ vEls[k].setAttribute('x', (x1+x2)/2); vEls[k].setAttribute('y', (y1+y2)/2 + 14); }
      });
    }
    function applyStyles(){
      edges.forEach(function(e){
        var k = e[0]+e[1], on = !!(vis[state] && vis[state][k]), fake = state===1 && (k==='UH' || k==='HA');
        eEls[k].style.opacity = on ? 1 : 0;
        eEls[k].classList.toggle('fake', fake);
        eEls[k].setAttribute('marker-end', fake ? 'url(#dArrR)' : 'url(#dArr)');
        if (lEls[k]) lEls[k].style.opacity = fake ? 1 : 0;
        if (vEls[k]) vEls[k].style.opacity = (on && state>=1) ? 1 : 0;
      });
      var tb = $('#timeBar'), tt = $('#timeTxt');
      if (state===2){ if (tb) tb.style.width = '38%'; if (tt) tt.textContent = '워커 3개가 동시에 돌아요: 1 단위 시간'; }
      else if (state===1){ if (tb) tb.style.width = '100%'; if (tt) tt.textContent = 'utils → handlers, handlers → adapters 사이로 넘어가는 변수가 없어요'; }
      else { if (tb) tb.style.width = '100%'; if (tt) tt.textContent = '워커 3개가 차례로 돌아요: 3 단위 시간'; }
    }
    function go(s){
      state = s; applyStyles();
      var target = s===2 ? par : lin, from = JSON.parse(JSON.stringify(pos));
      if (anim) cancelAnimationFrame(anim);
      if (RM){ pos = JSON.parse(JSON.stringify(target)); render(); return; }
      var t0 = null, D = 900;
      function f(ts){
        if (t0===null) t0 = ts; var k = Math.min(1, (ts-t0)/D); k = 1-Math.pow(1-k,3);
        Object.keys(pos).forEach(function(n){
          pos[n] = [from[n][0]+(target[n][0]-from[n][0])*k, from[n][1]+(target[n][1]-from[n][1])*k];
        });
        render(); if (k<1) anim = requestAnimationFrame(f);
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
})();
