/* Loops & Graphs 가이드 — 글 본문 전용 스크립트. #lgGuide 안에서만 동작. 원본: Loops-and-Graphs.html */
(function(){
'use strict';
var root = document.getElementById('lgGuide');
if (!root) return;
root.classList.add('lg-js');
var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var $ = function(s,r){return (r||root).querySelector(s);};
var $$ = function(s,r){return Array.prototype.slice.call((r||root).querySelectorAll(s));};
var SVGNS = 'http://www.w3.org/2000/svg';

/* ---------- reveal ---------- */
setTimeout(function(){ if ($('.lg-reveal.in')) return; $$('.lg-reveal, .lg-lane, #prio').forEach(function(e){ e.classList.add('in','in-view'); }); }, 2500);
var revealEls = $$('.lg-reveal, .lg-lane, #prio');
if ('IntersectionObserver' in window && !RM){
  var ro = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (e.isIntersecting){
        e.target.classList.add('in');
        if (e.target.classList.contains('lg-lane')) e.target.classList.add('in-view');
        ro.unobserve(e.target);
      }
    });
  },{threshold:.15, rootMargin:'0px 0px -40px 0px'});
  revealEls.forEach(function(el){ro.observe(el);});
} else {
  revealEls.forEach(function(el){el.classList.add('in','in-view');});
}

/* ---------- nav active + progress ---------- */
var navLinks = $$('#lgNav a');
var sections = navLinks.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));});
var prog = $('#lgProgress');
function onScroll(){
  var rr = root.getBoundingClientRect();
  var max = rr.height - window.innerHeight;
  prog.style.width = (max>0 ? Math.min(100, Math.max(0, -rr.top/max*100)) : 0) + '%';
  var y = window.innerHeight*0.35, cur = -1;
  sections.forEach(function(s,i){ if (s && s.getBoundingClientRect().top <= y) cur = i; });
  navLinks.forEach(function(a,i){
    var on = i===cur;
    if (on !== a.classList.contains('active')){
      a.classList.toggle('active', on);
      if (on && a.scrollIntoView){
        var nav = a.parentNode;
        nav.scrollTo({left: a.offsetLeft - nav.clientWidth/2 + a.clientWidth/2, behavior: RM?'auto':'smooth'});
      }
    }
  });
}
window.addEventListener('scroll', onScroll, {passive:true});
window.addEventListener('resize', onScroll);
onScroll();

function whenVisible(el, onIn, onOut){
  if (!('IntersectionObserver' in window)){ onIn(); return; }
  new IntersectionObserver(function(es){
    es.forEach(function(e){ e.isIntersecting ? onIn() : (onOut && onOut()); });
  },{threshold:.25}).observe(el);
}

/* ---------- 1. Loop ---------- */
(function(){
  var svg = $('#loopSvg'); if (!svg) return;
  var dot = $('#loopDot'), ring = $('#ringP'), center = $('#loopCenter'), status = $('#loopStatus');
  var st = {P:$('#stP'), C:$('#stC'), F:$('#stF'), R:$('#stR')};
  var CX=260, CY=220, R=160, LEN=2*Math.PI*R;
  var phases = [
    {d:1300, a0:0,   a1:90,  check:null},
    {d:1300, a0:90,  a1:90,  check:'red'},
    {d:3600, a0:90,  a1:450, check:null},
    {d:2200, a0:450, a1:450, check:'green'}
  ];
  var total = phases.reduce(function(s,p){return s+p.d;},0);
  var raf=null, t0=null, lastCheck='';
  function ease(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;}
  function setCheck(c){
    if (c===lastCheck) return; lastCheck=c;
    st.C.classList.remove('red','green');
    status.classList.remove('red','green');
    if (c==='red'){ st.C.classList.add('red'); status.classList.add('red'); center.textContent='RED'; center.style.fill='#ff453a'; status.textContent='$ npm test → exit 1 · 1 failed'; }
    else if (c==='green'){ st.C.classList.add('green'); status.classList.add('green'); center.textContent='GREEN'; center.style.fill='#30d158'; status.textContent='$ npm test → exit 0 · all passed'; }
    else if (c==='fix'){ center.textContent='수정 중'; center.style.fill='#f3f1ec'; status.textContent='$ 실패한 테스트만 고치는 중…'; st.C.classList.add('red'); }
    else { center.textContent='생성 중'; center.style.fill='#f3f1ec'; status.textContent='$ npm test → 대기'; }
  }
  function draw(a){
    var rad = a*Math.PI/180;
    dot.setAttribute('cx', CX + R*Math.sin(rad));
    dot.setAttribute('cy', CY - R*Math.cos(rad));
    var frac = a<=360 ? a/360 : 1;
    ring.setAttribute('stroke-dasharray', (LEN*frac)+' '+LEN);
    var m = ((a%360)+360)%360;
    function near(x){var d=Math.abs(m-x); return Math.min(d,360-d)<14;}
    st.P.classList.toggle('on', near(0)); st.C.classList.toggle('on', near(90));
    st.F.classList.toggle('on', near(180)); st.R.classList.toggle('on', near(270));
  }
  function frame(ts){
    if (t0===null) t0=ts;
    var t=(ts-t0)%total, acc=0, i=0;
    while (i<phases.length && t>acc+phases[i].d){acc+=phases[i].d;i++;}
    var p=phases[Math.min(i,phases.length-1)], k=ease(Math.min(1,(t-acc)/p.d));
    var a = p.a0+(p.a1-p.a0)*k;
    draw(a);
    if (p.check) setCheck(p.check);
    else if (i===2) setCheck('fix');
    else setCheck('');
    raf=requestAnimationFrame(frame);
  }
  if (RM){ draw(90); setCheck('green'); return; }
  draw(0);
  whenVisible(svg, function(){ if(!raf){ t0=null; raf=requestAnimationFrame(frame);} },
                   function(){ if(raf){ cancelAnimationFrame(raf); raf=null; } });
})();

/* ---------- 2. DAG ---------- */
(function(){
  var svg = $('#dagSvg'); if (!svg) return;
  var W=96, H=58;
  var nodes = {
    S:{t:'Splitter', s:'분할', c:'#f0b45a'},
    U:{t:'utils', s:'Worker', c:'#7fb2ef'},
    H:{t:'handlers', s:'Worker', c:'#7fb2ef'},
    A:{t:'adapters', s:'Worker', c:'#7fb2ef'},
    M:{t:'Merge', s:'Code', c:'#30d158'},
    G:{t:'Gate', s:'관문', c:'#b794f4'}
  };
  var lin = {S:[60,160],U:[192,160],H:[324,160],A:[456,160],M:[588,160],G:[720,160]};
  var par = {S:[70,160],U:[300,60],H:[300,160],A:[300,260],M:[540,160],G:[710,160]};
  var edges = [
    ['S','U','slice'],['U','H',''],['H','A',''],['A','M','diff'],['M','G','merged'],
    ['S','H','slice'],['S','A','slice'],['U','M','diff'],['H','M','diff']
  ];
  var vis = [
    {SU:1,UH:1,HA:1,AM:1,MG:1},
    {SU:1,UH:1,HA:1,AM:1,MG:1},
    {SU:1,SH:1,SA:1,UM:1,HM:1,AM:1,MG:1}
  ];
  var defs = document.createElementNS(SVGNS,'defs');
  defs.innerHTML = '<marker id="dArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8b8a93"/></marker>'+
                   '<marker id="dArrR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ff453a"/></marker>';
  svg.appendChild(defs);
  var eEls = {}, lEls = {}, vEls = {};
  edges.forEach(function(e){
    var k=e[0]+e[1];
    var p=document.createElementNS(SVGNS,'path'); p.setAttribute('class','lg-edge'); p.setAttribute('marker-end','url(#dArr)');
    svg.appendChild(p); eEls[k]=p;
    if (k==='UH'||k==='HA'){
      var l=document.createElementNS(SVGNS,'text'); l.setAttribute('class','lg-elabel'); l.textContent='그리고 나서?'; l.style.opacity=0;
      svg.appendChild(l); lEls[k]=l;
    }
    if (e[2]){
      var v=document.createElementNS(SVGNS,'text'); v.setAttribute('class','lg-vlabel'); v.textContent=e[2]; v.style.opacity=0;
      svg.appendChild(v); vEls[k]=v;
    }
  });
  var nEls = {};
  Object.keys(nodes).forEach(function(k){
    var n=nodes[k], g=document.createElementNS(SVGNS,'g');
    g.innerHTML='<rect class="lg-n-rect" x="'+(-W/2)+'" y="'+(-H/2)+'" width="'+W+'" height="'+H+'" rx="14" style="stroke:'+n.c+';stroke-width:2"></rect>'+
      '<text class="lg-n-txt" y="-7" style="font-size:14px">'+n.t+'</text><text class="lg-n-sub" y="13" style="fill:'+n.c+'">'+n.s+'</text>';
    svg.appendChild(g); nEls[k]=g;
  });
  var pos = JSON.parse(JSON.stringify(lin)), state=0, anim=null;
  function render(){
    Object.keys(nEls).forEach(function(k){ nEls[k].setAttribute('transform','translate('+pos[k][0]+' '+pos[k][1]+')'); });
    edges.forEach(function(e){
      var k=e[0]+e[1], a=pos[e[0]], b=pos[e[1]];
      var x1=a[0]+W/2, y1=a[1], x2=b[0]-W/2-4, y2=b[1], mx=(x1+x2)/2;
      eEls[k].setAttribute('d','M'+x1+' '+y1+' C'+mx+' '+y1+' '+mx+' '+y2+' '+x2+' '+y2);
      if (lEls[k]){ lEls[k].setAttribute('x',(x1+x2)/2); lEls[k].setAttribute('y',y1-40); }
      if (vEls[k]){
        var vx=(x1+x2)/2, vy=(y1+y2)/2 - 8;
        if (state===2 && (k==='SU'||k==='SA'||k==='UM'||k==='AM')) vy = (y1+y2)/2 + ((y2<y1)===(k==='SU'||k==='AM') ? -14 : 18);
        vEls[k].setAttribute('x',vx); vEls[k].setAttribute('y',vy);
      }
    });
  }
  function applyStyles(){
    edges.forEach(function(e){
      var k=e[0]+e[1], on=!!vis[state][k], fake=state===1&&(k==='UH'||k==='HA');
      eEls[k].style.opacity = on?1:0;
      eEls[k].classList.toggle('fake', fake);
      eEls[k].setAttribute('marker-end', fake?'url(#dArrR)':'url(#dArr)');
      if (lEls[k]) lEls[k].style.opacity = fake?1:0;
      if (vEls[k]) vEls[k].style.opacity = (on && state>=1) ? 1 : 0;
    });
    var tb=$('#timeBar'), tt=$('#timeTxt');
    if (state===2){ tb.style.width='38%'; tt.textContent='워커 3개가 동시에 돌아요: 1 단위 시간'; }
    else if (state===1){ tb.style.width='100%'; tt.textContent='utils → handlers, handlers → adapters 사이로 넘어가는 변수가 없어요'; }
    else { tb.style.width='100%'; tt.textContent='워커 3개가 차례로 돌아요: 3 단위 시간'; }
  }
  function go(s){
    state=s; applyStyles();
    var target = s===2?par:lin, from=JSON.parse(JSON.stringify(pos));
    if (anim) cancelAnimationFrame(anim);
    if (RM){ pos=JSON.parse(JSON.stringify(target)); render(); return; }
    var t0=null, D=900;
    function f(ts){
      if(t0===null)t0=ts; var k=Math.min(1,(ts-t0)/D); k=1-Math.pow(1-k,3);
      Object.keys(pos).forEach(function(n){ pos[n]=[from[n][0]+(target[n][0]-from[n][0])*k, from[n][1]+(target[n][1]-from[n][1])*k]; });
      render(); if(k<1) anim=requestAnimationFrame(f);
    }
    anim=requestAnimationFrame(f);
  }
  render(); applyStyles();
  var btns=$$('[data-dag]');
  btns.forEach(function(b){ b.addEventListener('click',function(){
    btns.forEach(function(x){x.classList.toggle('on',x===b);});
    go(+b.getAttribute('data-dag')); auto=false;
  });});
  // auto-advance once when first seen
  var auto=true, played=false;
  whenVisible(svg,function(){
    if (played||RM) return; played=true;
    setTimeout(function(){ if(auto){ btns[1].click(); auto=true; } },1400);
    setTimeout(function(){ if(auto){ btns[2].click(); } },3600);
  });
})();

/* ---------- 3. slices ---------- */
(function(){
  var box=$('#slices'); if(!box) return;
  var sl=$$('.lg-slice',box), dots=$$('#attempts i'), txt=$('#attTxt');
  var timers=[], running=false;
  function at(ms,fn){timers.push(setTimeout(fn,ms));}
  function reset(){ sl.forEach(function(s){s.classList.remove('go','red','green');}); dots.forEach(function(d){d.classList.remove('on');}); txt.textContent='0 / 3'; }
  function cycle(){
    reset();
    at(600,function(){ sl.forEach(function(s){s.classList.add('go');}); });
    at(1800,function(){ sl.forEach(function(s,i){ s.classList.add(i===1?'red':'green'); }); });
    at(3000,function(){ sl[1].classList.remove('go'); });
    at(3900,function(){ dots[0].classList.add('on'); txt.textContent='1 / 3'; sl[1].classList.remove('red'); });
    at(4700,function(){ sl[1].classList.add('go'); });
    at(5800,function(){ sl[1].classList.add('green'); });
    at(8500,function(){ if(running) cycle(); });
  }
  if (RM){ sl.forEach(function(s,i){s.classList.add('go','green');}); dots[0].classList.add('on'); txt.textContent='1 / 3 · handlers만 재시도 후 통과'; return; }
  whenVisible(box,function(){ if(!running){running=true;cycle();} },function(){ running=false; timers.forEach(clearTimeout); timers=[]; reset(); });
})();

/* ---------- tabs ---------- */
var tabs=$$('[data-tab]');
tabs.forEach(function(b){ b.addEventListener('click',function(){
  tabs.forEach(function(x){x.classList.toggle('on',x===b);});
  $$('.lg-panel').forEach(function(p){p.classList.toggle('on',p.id===b.getAttribute('data-tab'));});
});});

/* ---------- checklist ---------- */
var ITEMS=[
  ['모든 단계에 프로그램이 판정하는 GREEN 조건이 있다','“괜찮아 보임 / 자신 있음 / 에러 없음”은 제외'],
  ['“다른 모델에게 검토 요청”만으로 된 체크가 없다','낙관론자 둘의 합의는 체크가 아니에요'],
  ['체크가 작업보다 먼저 쓰여 있다',''],
  ['모든 화살표에 넘어가는 변수 이름을 댈 수 있다','못 대면 그 엣지를 지우고 병렬로'],
  ['워커들이 컨텍스트를 공유하지 않는다','서브에이전트마다 독립 컨텍스트'],
  ['정답이 하나인 변환(병합·정렬·중복 제거·diff)은 코드가 한다','“판단/결정/평가/요약” 없이 설명되면 코드'],
  ['splitter가 폴더가 아니라 blast radius 기준으로 자른다',''],
  ['실패하면 배치 전체가 아니라 실패한 단위만 되돌린다',''],
  ['되돌림 메시지에 UNIT / VERDICT / REASON / EVIDENCE / SCOPE가 다 있다','SCOPE가 없으면 diff가 번져요'],
  ['재시도 상한(3회)과, 넘으면 사람에게 올리는 경로가 있다','3회 실패 = 계획 문제'],
  ['되돌리기 어려운 작업(마이그레이션·삭제·프로덕션 데이터·돈)은 점수와 무관하게 사람 승인이다',''],
  ['게이트 근거 순서가 결정적 결과 → 실행 경로 → 롤백 이력 → 자기평가다',''],
  ['통과 결과에서 제약을 뽑아 splitter 브리프에 넣는 learning edge가 있다','CLAUDE.md “Learned constraints”'],
  ['사람이 보는 지점은 딱 하나다','merge 승인 또는 배포할 수정 선택']
];
var KEY='loopsGraphs.checklist.v1', saved={};
try{ saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}; }catch(e){ saved={}; }
var ul=$('#checklist');
ITEMS.forEach(function(it,i){
  var li=document.createElement('li');
  li.innerHTML='<label><input type="checkbox" data-i="'+i+'"'+(saved[i]?' checked':'')+'><span>'+it[0]+(it[1]?'<small>'+it[1]+'</small>':'')+'</span></label>';
  ul.appendChild(li);
});
function updCl(){
  var boxes=$$('input',ul), n=0, md=['## 파이프라인 점검 (Loops & Graphs)'];
  boxes.forEach(function(b,i){ if(b.checked)n++; md.push('- ['+(b.checked?'x':' ')+'] '+ITEMS[i][0]); });
  $('#clBar').style.width=(n/boxes.length*100)+'%';
  $('#clCount').textContent=n+' / '+boxes.length+(n===boxes.length?' · 완벽해요':'');
  $('#cl-md').textContent=md.join('\n');
}
ul.addEventListener('change',function(e){
  var i=e.target.getAttribute('data-i'); if(i===null)return;
  saved[i]=e.target.checked; try{localStorage.setItem(KEY,JSON.stringify(saved));}catch(err){}
  updCl();
});
$('#clReset').addEventListener('click',function(){
  saved={}; try{localStorage.removeItem(KEY);}catch(e){}
  $$('input',ul).forEach(function(b){b.checked=false;}); updCl();
});
updCl();

/* ---------- copy ---------- */
var toast=$('#lgToast'), tt;
function showToast(m){ toast.textContent=m; toast.classList.add('show'); clearTimeout(tt); tt=setTimeout(function(){toast.classList.remove('show');},1600); }
function fallbackCopy(text){
  var ta=document.createElement('textarea'); ta.value=text; ta.setAttribute('readonly','');
  ta.style.position='fixed'; ta.style.top='-1000px'; document.body.appendChild(ta);
  ta.select(); ta.setSelectionRange(0, text.length);
  var ok=false; try{ ok=document.execCommand('copy'); }catch(e){}
  document.body.removeChild(ta); return ok;
}
$$('[data-copy]').forEach(function(b){
  b.addEventListener('click',function(){
    var el=document.getElementById(b.getAttribute('data-copy')); if(!el)return;
    var text=el.textContent.replace(/\s+$/,'')+'\n';
    function done(ok){
      if(!ok){ showToast('복사가 안 됐어요. 길게 눌러 선택해 주세요'); return; }
      var o=b.textContent; b.textContent='복사됨 ✓'; b.classList.add('done'); showToast('클립보드에 복사했어요');
      setTimeout(function(){ b.textContent=o; b.classList.remove('done'); },1600);
    }
    if (navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(text).then(function(){done(true);},function(){done(fallbackCopy(text));});
    } else done(fallbackCopy(text));
  });
});
})();
