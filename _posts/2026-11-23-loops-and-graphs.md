---
title: "Loops & Graphs: 마지막 한 단계만 승인하기"
date: 2026-11-23 00:38:00 +0900
tags: [에이전트, Claude Code, 기록]
description: 에이전트 작업을 Loop와 Graph로 짜고, 사람은 되돌리기 가장 어렵고 영향이 큰 한 단계만 승인하자는 실무 가이드. 애니메이션과 복사용 템플릿, 체크리스트까지 한 글에 담았습니다.
permalink: /posts/loops-and-graphs/
lg_guide: true
---

Claude Code 같은 에이전트에게 일을 맡기면 결국 화면 앞에서 계속 지켜보게 됩니다. 이 글의 가이드는 반대로 말합니다. 감시를 줄이고, **사람은 마지막 한 단계만 승인하자**는 것입니다.

Hanako(@hanakoxbt)의 “Loops and Graphs”를 읽고 한국어 실무용으로 요약·재구성한 가이드이고, 아래에 전체 내용을 그대로 담았습니다. 스크롤하면 Loop와 Graph가 움직이는 다이어그램이 나오고, 중간의 템플릿은 복사 버튼으로 가져갈 수 있고, 체크리스트의 체크 상태는 이 브라우저에만 저장됩니다. 원문 링크와 제작 과정은 글 끝의 출처에 정리했습니다.

{::nomarkdown}
<div class="lg-guide" id="lgGuide">
<nav class="lg-subnav" aria-label="가이드 목차"><div class="lg-subnav-in"><a class="lg-subbrand" href="#lg-hero">Loops &amp; Graphs</a><div class="lg-secnav" id="lgNav"><a href="#lg-loop">Loop</a><a href="#lg-graph">Graph</a><a href="#lg-nodes">노드 4종</a><a href="#lg-nested">중첩</a><a href="#lg-returns">되돌림</a><a href="#lg-unit">단위 반환</a><a href="#lg-gate">게이트</a><a href="#lg-toolkit">실무 키트</a><a href="#lg-build">적용 순서</a></div></div><div class="lg-progress" id="lgProgress"></div></nav>
<section class="lg-sec lg-hero" id="lg-hero">
  <div class="lg-wrap">
    <span class="lg-pill lg-reveal">Hanako · “Loops and Graphs” 실무 가이드</span>
    <h2 class="lg-hero-title lg-reveal lg-d1">에이전트 감시는 그만.<br><span class="lg-grad">마지막 한 단계만</span><br>승인한다.</h2>
    <p class="lg-lead lg-reveal lg-d2">중간 결과를 사람이 하나하나 검토하지 않아요. 품질은 <b style="color:#f3f1ec">실패할 수 있는 체크(Loop)</b>와 <b style="color:#f3f1ec">작업 구조(Graph)</b>가 맡고, 사람은 되돌리기 가장 어렵고 영향이 가장 큰 한 단계에만 들어가요.</p>
    <div class="lg-cta lg-reveal lg-d3">
      <a class="lg-btn" href="#lg-toolkit">실무 키트 바로 가기</a>
      <a class="lg-btn lg-ghost" href="#lg-loop">처음부터 읽기</a>
    </div>
    <div class="lg-scroll-hint">↓ 스크롤</div>
  </div>
</section>
<!-- 2 LOOP -->
<section class="lg-sec lg-dark" id="lg-loop">
  <div class="lg-wrap">
    <p class="lg-eyebrow lg-b lg-reveal">01 · Loop</p>
    <h2 class="lg-reveal">Loop는<br>실패할 수 있는 체크예요.</h2>
    <p class="lg-lead lg-reveal">생성하고, 체크하고, 고치고, 체크가 GREEN이 될 때까지 반복해요. 핵심은 <b style="color:#f3f1ec">체크를 작업보다 먼저 쓰는 것</b>이에요. 프로그램이 판정할 수 있어야 해요.</p>
    <div class="lg-stage lg-reveal">
      <svg id="loopSvg" viewBox="0 0 520 440" role="img" aria-label="생성, 체크, 수정, 반복으로 이어지는 루프. 첫 체크는 빨강, 수정 후 두 번째 체크는 초록">
        <defs><linearGradient id="lg1" x1="0" x2="1"><stop offset="0" stop-color="#7fb2ef"/><stop offset="1" stop-color="#b794f4"/></linearGradient></defs>
        <circle class="lg-ring" cx="260" cy="220" r="160"/>
        <circle class="lg-ringP" id="ringP" cx="260" cy="220" r="160" stroke-dasharray="0 1006" transform="rotate(-90 260 220)"/>
        <g class="lg-st" id="stP" transform="translate(260 60)"><circle r="44"/><text class="lg-n-txt" y="-6" style="fill:#f3f1ec">생성</text><text class="lg-n-sub" y="14">produce</text></g>
        <g class="lg-st" id="stC" transform="translate(420 220)"><circle r="44"/><text class="lg-n-txt" y="-6" style="fill:#f3f1ec">체크</text><text class="lg-n-sub" y="14">check</text></g>
        <g class="lg-st" id="stF" transform="translate(260 380)"><circle r="44"/><text class="lg-n-txt" y="-6" style="fill:#f3f1ec">수정</text><text class="lg-n-sub" y="14">correct</text></g>
        <g class="lg-st" id="stR" transform="translate(100 220)"><circle r="44"/><text class="lg-n-txt" y="-6" style="fill:#f3f1ec">반복</text><text class="lg-n-sub" y="14">repeat</text></g>
        <text class="lg-center" x="260" y="205" font-size="14" fill="#a9a7b0" style="fill:#a9a7b0">현재 체크</text>
        <text class="lg-center" id="loopCenter" x="260" y="235" font-size="26" font-weight="700">대기</text>
        <circle id="loopDot" r="8" cx="260" cy="60"/>
      </svg>
    </div>
    <p class="lg-note lg-reveal"><span class="lg-status-pill" id="loopStatus">$ npm test → 대기</span></p>
    <div class="lg-spacer"></div>
    <div class="lg-grid lg-g2">
      <div class="lg-card lg-reveal">
        <span class="lg-tag lg-g">GREEN · 체크다</span>
        <h3>프로그램이 판정해요</h3>
        <ul>
          <li><span class="lg-ok">✓</span><span>테스트 스위트가 <code>exit 0</code></span></li>
          <li><span class="lg-ok">✓</span><span>모든 주장에 출처(<code>파일:라인</code>)가 붙어 있음</span></li>
          <li><span class="lg-ok">✓</span><span>diff가 계획에 적힌 파일만 건드림</span></li>
        </ul>
      </div>
      <div class="lg-card lg-reveal lg-d1">
        <span class="lg-tag lg-r">NOT A CHECK · 체크가 아니다</span>
        <h3>느낌이에요</h3>
        <ul>
          <li><span class="lg-no">✕</span><span>“결과가 괜찮아 보인다”</span></li>
          <li><span class="lg-no">✕</span><span>“모델이 자신 있다고 한다”</span></li>
          <li><span class="lg-no">✕</span><span>“에러가 안 났다”: 에러가 없다고 정답은 아니에요</span></li>
          <li><span class="lg-no">✕</span><span>다른 모델에게 “검토해줘”만 시키기: 낙관론자 둘의 합의일 뿐이에요</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>
<!-- 3 GRAPH -->
<section class="lg-sec lg-alt" id="lg-graph">
  <div class="lg-wrap">
    <p class="lg-eyebrow lg-p lg-reveal">02 · Graph</p>
    <h2 class="lg-reveal">“그리고 나서”는<br>엣지가 아니에요.</h2>
    <p class="lg-lead lg-reveal">Graph는 어떤 작업 단위가 있고 어떻게 연결되는지를 정해요. 노드는 입력 하나, 출력 하나인 제한된 작업이에요. 엣지는 이 노드의 출력이 저 노드의 입력으로 <b style="color:var(--lg-fg)">실제로 들어갈 때만</b> 있어요.</p>
    <div class="lg-stage lg-reveal" style="flex-direction:column;align-items:center">
      <svg id="dagSvg" viewBox="0 0 780 320" role="img" aria-label="직렬 체인에서 가짜 엣지를 제거하면 병렬 그래프가 되는 다이어그램"></svg>
      <div class="lg-dag-ctl">
        <div class="lg-seg" role="tablist" aria-label="그래프 단계">
          <button class="on" data-dag="0">① 직렬</button>
          <button data-dag="1">② 가짜 엣지</button>
          <button data-dag="2">③ 병렬화</button>
        </div>
      </div>
      <div class="lg-timebar">
        <div class="lg-row"><span>소요 시간</span><div class="lg-bar" id="timeBar" style="width:100%"></div></div>
        <div class="lg-row"><span></span><small id="timeTxt">워커 3개가 차례로 돌아요: 3 단위 시간</small></div>
      </div>
    </div>
    <div class="lg-test-box lg-reveal">
      <div class="lg-q">“넘어가는 변수의 이름을<br>댈 수 있나요?”</div>
      <p>화살표마다 물어보세요. 다음 단계가 이전 단계의 출력을 실제로 읽나요?<br>넘어가는 변수를 이름으로 댈 수 없으면 엣지가 없는 거예요. 그 둘은 병렬로 돌리면 돼요.</p>
    </div>
  </div>
</section>
<!-- 4 NODE TYPES -->
<section class="lg-sec" id="lg-nodes">
  <div class="lg-wrap">
    <p class="lg-eyebrow lg-reveal">03 · 노드 4종</p>
    <h2 class="lg-reveal">모든 파이프라인은<br>네 가지 노드로 그려요.</h2>
    <div class="lg-spacer"></div>
    <div class="lg-grid lg-g4">
      <div class="lg-card lg-reveal" style="background:var(--lg-bg2)">
        <div class="lg-icon lg-i1"><svg viewBox="0 0 24 24"><path d="M12 3v6M12 9l-6 6M12 9l6 6M12 9v12"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg></div>
        <div class="lg-k">Splitter</div><h3>분할</h3>
        <p>맨 앞에서 작업을 잘라요. 가장 중요한 결정이에요. 폴더 기준이 아니라 <b style="color:var(--lg-fg)">영향 범위(blast radius)</b> 기준으로 잘라요.</p>
      </div>
      <div class="lg-card lg-reveal lg-d1" style="background:var(--lg-bg2)">
        <div class="lg-icon lg-i2"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 12h6M12 9v6"/></svg></div>
        <div class="lg-k">Worker</div><h3>작업자</h3>
        <p>단위 하나, 관점 하나, <b style="color:var(--lg-fg)">독립된 컨텍스트</b>. 컨텍스트를 공유시키면 결과가 한쪽으로 수렴해서 4번 비용을 내고 의견 1개를 얻어요.</p>
      </div>
      <div class="lg-card lg-reveal lg-d2" style="background:var(--lg-bg2)">
        <div class="lg-icon lg-i3"><svg viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></svg></div>
        <div class="lg-k">Code node</div><h3>코드</h3>
        <p>병합, 정렬, 중복 제거, 전후 비교처럼 정답이 하나인 변환은 모델이 아니라 코드가 해요.</p>
      </div>
      <div class="lg-card lg-reveal lg-d3" style="background:var(--lg-bg2)">
        <div class="lg-icon lg-i4"><svg viewBox="0 0 24 24"><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-7h6v7"/></svg></div>
        <div class="lg-k">Gate</div><h3>관문</h3>
        <p>결과를 통과시키거나 만든 단계로 되돌려요. 여는 기준은 자신감이 아니라 영향 범위예요.</p>
      </div>
    </div>
    <div class="lg-callout lg-reveal" style="background:var(--lg-bg2)">
      <div class="lg-emoji">🧪</div>
      <div><b>코드 노드 판별법</b><p class="lg-muted" style="margin-top:6px;font-size:17px">그 단계를 <b style="color:var(--lg-fg)">“판단 / 결정 / 평가 / 요약”</b> 같은 단어 없이 설명할 수 있으면, 모델이 아니라 코드로 만들어요.</p></div>
    </div>
    <div class="lg-reveal" style="margin-top:56px;text-align:center">
      <h3>워커마다 컨텍스트를 따로 줘요</h3>
      <p class="lg-muted">같은 대화 안에서 서브태스크를 돌리지 말고, 서브에이전트를 각각 띄우세요.</p>
      <div class="lg-ctx-demo">
        <div class="lg-ctx"><div><b>Worker A</b>ctx A</div></div>
        <div class="lg-ctx"><div><b>Worker B</b>ctx B</div></div>
        <div class="lg-ctx"><div><b>Worker C</b>ctx C</div></div>
        <div class="lg-ctx"><div><b>Worker D</b>ctx D</div></div>
      </div>
    </div>
  </div>
</section>
<!-- 5 NESTED -->
<section class="lg-sec lg-dark" id="lg-nested">
  <div class="lg-wrap" style="text-align:center">
    <p class="lg-eyebrow lg-g lg-reveal">04 · 원칙</p>
    <h2 class="lg-reveal">Loop는 노드 안에.<br><span class="lg-grad-g">Graph는 노드 사이에.</span></h2>
    <p class="lg-lead lg-reveal" style="margin:0 auto">각 노드는 안에서 자기 체크가 GREEN이 될 때까지 혼자 돌아요. 노드끼리는 실제로 넘어가는 출력으로만 이어져요.</p>
    <div class="lg-stage lg-reveal">
      <svg id="nestSvg" viewBox="0 0 760 260" role="img" aria-label="세 개의 노드 각각 안에서 작은 루프가 돌고, 노드 사이를 그래프 엣지가 잇는 다이어그램">
        <defs><marker id="arrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7fb2ef"/></marker></defs>
        <path class="lg-gedge" d="M215 130H285" marker-end="url(#arrB)"/>
        <path class="lg-gedge" d="M475 130H545" marker-end="url(#arrB)"/>
        <g transform="translate(120 130)">
          <rect x="-95" y="-95" width="190" height="190" rx="32" fill="#14131a" stroke="rgba(255,255,255,.14)"/>
          <circle r="42" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="2"/>
          <g class="lg-mini"><circle r="42" fill="none" stroke="#30d158" stroke-width="3" stroke-dasharray="40 224" stroke-linecap="round"/></g>
          <text class="lg-n-txt" y="0" style="fill:#f3f1ec;font-size:13px">loop</text>
          <text class="lg-n-txt" y="70" style="fill:#f3f1ec">Worker A</text>
        </g>
        <g transform="translate(380 130)">
          <rect x="-95" y="-95" width="190" height="190" rx="32" fill="#14131a" stroke="rgba(255,255,255,.14)"/>
          <circle r="42" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="2"/>
          <g class="lg-mini" style="animation-duration:1.8s"><circle r="42" fill="none" stroke="#30d158" stroke-width="3" stroke-dasharray="40 224" stroke-linecap="round"/></g>
          <text class="lg-n-txt" y="0" style="fill:#f3f1ec;font-size:13px">loop</text>
          <text class="lg-n-txt" y="70" style="fill:#f3f1ec">Merge (code)</text>
        </g>
        <g transform="translate(640 130)">
          <rect x="-95" y="-95" width="190" height="190" rx="32" fill="#14131a" stroke="rgba(255,255,255,.14)"/>
          <circle r="42" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="2"/>
          <g class="lg-mini" style="animation-duration:3s"><circle r="42" fill="none" stroke="#30d158" stroke-width="3" stroke-dasharray="40 224" stroke-linecap="round"/></g>
          <text class="lg-n-txt" y="0" style="fill:#f3f1ec;font-size:13px">loop</text>
          <text class="lg-n-txt" y="70" style="fill:#f3f1ec">Gate</text>
        </g>
      </svg>
    </div>
    <p class="lg-note lg-reveal">초록 호 = 노드 안의 loop · 파란 점선 = 노드 사이의 graph 엣지</p>
  </div>
</section>
<!-- 6 RETURN PATHS -->
<section class="lg-sec" id="lg-returns">
  <div class="lg-wrap">
    <p class="lg-eyebrow lg-r lg-reveal">05 · 되돌림 경로</p>
    <h2 class="lg-reveal">되돌아가는 길은<br>두 개예요.</h2>
    <p class="lg-lead lg-reveal">대부분은 짧은 길만 만들어요. 긴 길이 있어야 같은 실수가 다음 실행에서 다시 안 나와요.</p>
    <div class="lg-stage lg-reveal">
      <svg id="retSvg" viewBox="0 0 800 300" role="img" aria-label="게이트에서 워커로 가는 짧은 correction edge와, 통과된 결과에서 splitter로 가는 긴 learning edge">
        <defs>
          <marker id="aG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#30d158"/></marker>
          <marker id="aR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ff453a"/></marker>
          <marker id="aM" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8b8a93"/></marker>
        </defs>
        <path class="lg-fwd" d="M155 150H245" marker-end="url(#aM)"/>
        <path class="lg-fwd" d="M355 150H445" marker-end="url(#aM)"/>
        <path class="lg-fwd" d="M555 150H645" marker-end="url(#aM)"/>
        <path class="lg-flow lg-corr" d="M500 190 C 480 250, 320 250, 300 192" marker-end="url(#aR)"/>
        <path class="lg-flow lg-learn" d="M700 110 C 680 10, 120 10, 100 108" marker-end="url(#aG)"/>
        <g transform="translate(100 150)"><rect class="lg-n-rect" x="-55" y="-38" width="110" height="76" rx="18"/><text class="lg-n-txt" y="-6">Splitter</text><text class="lg-n-sub" y="14">브리프</text></g>
        <g transform="translate(300 150)"><rect class="lg-n-rect" x="-55" y="-38" width="110" height="76" rx="18"/><text class="lg-n-txt" y="-6">Worker</text><text class="lg-n-sub" y="14">단위 생성</text></g>
        <g transform="translate(500 150)"><rect class="lg-n-rect" x="-55" y="-38" width="110" height="76" rx="18"/><text class="lg-n-txt" y="-6">Gate</text><text class="lg-n-sub" y="14">통과/반려</text></g>
        <g transform="translate(700 150)"><rect class="lg-n-rect" x="-55" y="-38" width="110" height="76" rx="18"/><text class="lg-n-txt" y="-6">Accepted</text><text class="lg-n-sub" y="14">통과 결과</text></g>
        <text x="400" y="272" text-anchor="middle" font-size="13" font-weight="600" fill="#ff453a" font-family="-apple-system,sans-serif">correction edge · 이번 실행을 고침</text>
        <text x="400" y="66" text-anchor="middle" font-size="13" font-weight="600" fill="#30d158" font-family="-apple-system,sans-serif">learning edge · 이후 모든 실행을 고침</text>
      </svg>
    </div>
    <div class="lg-grid lg-g2">
      <div class="lg-card lg-reveal" style="background:var(--lg-bg2)">
        <span class="lg-tag lg-r">짧은 길 · Correction edge</span>
        <h3>실패한 단위를 만든 단계로</h3>
        <p>게이트가 실패한 단위를 그 단위를 만든 단계로 돌려보내요. <b style="color:var(--lg-fg)">이번 실행</b>을 고쳐요.</p>
      </div>
      <div class="lg-card lg-reveal lg-d1" style="background:var(--lg-bg2)">
        <span class="lg-tag lg-g">긴 길 · Learning edge</span>
        <h3>통과 결과에서 뽑은 제약을 splitter로</h3>
        <p>통과된 결과에서 <b style="color:var(--lg-fg)">제약 조건</b>을 뽑아 splitter의 브리프에 넣어요. <b style="color:var(--lg-fg)">이후 모든 실행</b>을 고쳐요. 대부분 이걸 빼먹어요.</p>
      </div>
    </div>
    <div class="lg-reveal" style="margin-top:28px">
      <div class="lg-mono-block"><span class="lg-k2">ACCEPTED</span>   utils slice ported, green on first pass
<span class="lg-k1">DERIVED </span>   adapters preserve keyword args exactly
<span class="lg-k3">LANDS IN</span>   the splitter's brief for every later slice</div>
      <p class="lg-note">Claude Code에서는 이 DERIVED 한 줄을 CLAUDE.md의 “Learned constraints”에 쌓으면 돼요.</p>
    </div>
  </div>
</section>
<!-- 7 UNIT -->
<section class="lg-sec lg-alt" id="lg-unit">
  <div class="lg-wrap">
    <p class="lg-eyebrow lg-o lg-reveal" style="color:var(--lg-orange)">06 · 단위 반환</p>
    <h2 class="lg-reveal">배치 말고,<br>실패한 단위만 돌려보내요.</h2>
    <p class="lg-lead lg-reveal">4개 중 1개가 실패했으면 그 1개만 돌려보내요. 전체를 돌려보내면 멀쩡했던 3개가 “다르게” 다시 써지고, 결과가 수렴하지 않아요.</p>
    <div class="lg-slices lg-reveal" id="slices" aria-label="4개 단위 중 handlers만 빨강으로 반려되어 돌아갔다가 다시 통과하는 애니메이션">
      <div class="lg-slice-row"><div class="lg-slice" data-i="0">utils <small>slice 1</small></div><div class="lg-gate-col">→</div><div class="lg-slice-dest"></div></div>
      <div class="lg-slice-row"><div class="lg-slice" data-i="1">handlers <small>slice 2</small></div><div class="lg-gate-col" id="gateMid">GATE</div><div class="lg-slice-dest"></div></div>
      <div class="lg-slice-row"><div class="lg-slice" data-i="2">adapters <small>slice 3</small></div><div class="lg-gate-col">→</div><div class="lg-slice-dest"></div></div>
      <div class="lg-slice-row"><div class="lg-slice" data-i="3">models <small>slice 4</small></div><div class="lg-gate-col">→</div><div class="lg-slice-dest"></div></div>
    </div>
    <div class="lg-attempts" id="attempts">handlers 재시도 <i></i><i></i><i></i> <span id="attTxt">0 / 3</span></div>
    <div class="lg-spacer"></div>
    <div class="lg-tk lg-reveal">
      <div class="lg-tk-head"><h3>돌려보낼 때는 다섯 줄을 같이 보내요</h3><button class="lg-copy" data-copy="tpl-return-mini">복사</button></div>
<pre class="lg-code" id="tpl-return-mini">UNIT      handlers slice
VERDICT   red
REASON    test_auth_redirect failed
EVIDENCE  expected 302, got 200, handlers/auth.py:88
SCOPE     fix this file only, do not touch other slices</pre>
    </div>
    <div class="lg-grid lg-g2" style="margin-top:20px">
      <div class="lg-card lg-reveal"><span class="lg-tag lg-o">SCOPE가 없으면</span><h3>수정 범위가 번져요</h3><p>결국 아무도 리뷰하지 않은 거대한 diff가 돼요.</p></div>
      <div class="lg-card lg-reveal lg-d1"><span class="lg-tag lg-r">최대 3회</span><h3>세 번 실패하면 계획 문제예요</h3><p>단위 문제가 아니라 분할(splitter)이 잘못된 거예요. 사람에게 올려요.</p></div>
    </div>
  </div>
</section>
<!-- 8 GATE -->
<section class="lg-sec lg-dark" id="lg-gate">
  <div class="lg-wrap">
    <p class="lg-eyebrow lg-b lg-reveal">07 · 게이트</p>
    <h2 class="lg-reveal">게이트는 자신감이 아니라<br>영향 범위로 열어요.</h2>
    <p class="lg-lead lg-reveal">모델 점수가 아무리 높아도, 되돌리기 어려운 작업은 자동으로 통과시키지 않아요.</p>
    <div class="lg-spacer"></div>
    <div class="lg-grid lg-g3">
      <div class="lg-lane lg-open lg-reveal">
        <div class="lg-gate-vis"><div class="lg-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="lg-tok"></div></div>
        <span class="lg-tag lg-g">OPEN</span>
        <h3>되돌리기 쉽고 국소적</h3>
        <p>자동 통과해도 돼요.</p>
        <p class="lg-ex">문구 변경 · 테스트 · 커버리지 있는 독립 함수</p>
      </div>
      <div class="lg-lane lg-cond lg-reveal lg-d1">
        <div class="lg-gate-vis"><div class="lg-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="lg-tok"></div></div>
        <span class="lg-tag lg-o">GATED</span>
        <h3>되돌리기 쉽지만 넓음</h3>
        <p>결정적 체크 통과와 깔끔한 실행 이력이 있을 때만 통과해요.</p>
        <p class="lg-ex">공용 유틸 · 스키마 추가 · 호출처 많은 코드</p>
      </div>
      <div class="lg-lane lg-closed lg-reveal lg-d2">
        <div class="lg-gate-vis"><div class="lg-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="lg-tok"></div><span class="lg-lock">🔒</span></div>
        <span class="lg-tag lg-r">CLOSED</span>
        <h3>되돌리기 어려움</h3>
        <p>절대 자동 통과하지 않아요. 점수와 상관없이 사람이 승인해요.</p>
        <p class="lg-ex">마이그레이션 · 삭제 · 프로덕션 데이터 · 돈 이동</p>
      </div>
    </div>
    <div class="lg-prio lg-reveal" id="prio">
      <h3 style="text-align:center;margin-bottom:24px">게이트가 믿는 근거, 우선순위 순</h3>
      <div class="lg-p-row"><span class="lg-num">1</span><div class="lg-pbar" style="--lg-w:100%;background:linear-gradient(90deg,#30d158,#6aa4f0)">결정적 결과 (테스트 등)</div></div>
      <div class="lg-p-row"><span class="lg-num">2</span><div class="lg-pbar" style="--lg-w:78%;background:linear-gradient(90deg,#6aa4f0,#8a86ee)">이번 실행 경로</div></div>
      <div class="lg-p-row"><span class="lg-num">3</span><div class="lg-pbar" style="--lg-w:56%;background:linear-gradient(90deg,#8a86ee,#b794f4)">이 노드의 과거 롤백 빈도</div></div>
      <div class="lg-p-row"><span class="lg-num">4</span><div class="lg-pbar" style="--lg-w:34%;background:linear-gradient(90deg,#55545c,#3d3c44)">모델 자기평가 (마지막)</div></div>
    </div>
  </div>
</section>
<!-- 9 TOOLKIT -->
<section class="lg-sec" id="lg-toolkit">
  <div class="lg-wrap">
    <p class="lg-eyebrow lg-g lg-reveal">08 · 실무 키트</p>
    <h2 class="lg-reveal">복사해서<br>바로 쓰세요.</h2>
    <p class="lg-lead lg-reveal">Claude Code 같은 코딩 에이전트에 그대로 붙여 넣는 블록 3개와, 지금 돌리는 파이프라인을 점검하는 체크리스트예요.</p>
    <div class="lg-tabs lg-reveal" role="tablist">
      <button class="on" data-tab="p1">A · CLAUDE.md 규칙</button>
      <button data-tab="p2">B · 작업 시작 프롬프트</button>
      <button data-tab="p3">C · 반려/재시도</button>
      <button data-tab="p4">D · 파이프라인 점검</button>
    </div>
    <div class="lg-panel on lg-tk" id="p1">
      <div class="lg-tk-head"><div><h3>CLAUDE.md 규칙 블록</h3><p class="lg-muted" style="font-size:15px">프로젝트 루트 <code>CLAUDE.md</code>나 <code>~/.claude/CLAUDE.md</code>에 붙여 넣어요.</p></div><button class="lg-copy" data-copy="tpl-claude">복사</button></div>
<pre class="lg-code" id="tpl-claude">## 에이전트 작업 규칙 (Loop + Graph)
목표: 나는 중간 결과를 검토하지 않는다. 되돌리기 가장 어렵고 영향이 가장 큰 한 단계만 승인한다.
1. 체크 먼저
   - 작업 시작 전, 프로그램이 판정할 수 있는 완료 조건(GREEN 목록)을 먼저 써서 보여줄 것.
     예) 테스트 exit 0 / 모든 주장에 파일:라인 출처 / diff가 계획에 적힌 파일만 변경
   - "괜찮아 보임", "자신 있음", "에러 없음", "다른 모델이 검토함"은 체크가 아니다.
   - GREEN이 될 때까지 생성 → 체크 → 수정을 반복한다.
2. 엣지는 실제 데이터 흐름만
   - 단계 사이 화살표마다 "넘어가는 변수"의 이름을 댈 수 있는지 확인한다.
   - 이름을 댈 수 없으면 엣지가 아니다 → 병렬로 실행한다.
   - 병렬 작업은 서브에이전트로, 각자 독립된 컨텍스트에서 돌린다.
3. 코드로 할 일은 코드로
   - 병합·정렬·중복 제거·전후 비교처럼 정답이 하나인 변환은 모델 대신 스크립트로 처리한다.
   - "판단/결정/평가/요약" 없이 설명되는 단계는 코드다.
4. 분할은 blast radius 기준
   - 폴더가 아니라 영향 범위 기준으로 작업을 자른다.
5. 실패한 단위만 되돌린다
   - 배치 전체를 다시 쓰지 말고, 실패한 단위만 아래 형식으로 재시도한다.
     UNIT / VERDICT / REASON / EVIDENCE / SCOPE
   - SCOPE 밖의 파일은 건드리지 않는다.
   - 최대 3회. 3번 실패하면 멈추고 분할 계획을 다시 제안한 뒤 나에게 보고한다.
6. 게이트는 영향 범위로
   - 되돌리기 쉽고 국소적 (문구, 테스트, 커버리지 있는 독립 함수) → 자동 진행
   - 되돌리기 쉽지만 넓음 (공용 유틸, 스키마 추가, 호출처 많은 코드) → 결정적 체크 통과 + 깔끔한 실행 이력일 때만
   - 되돌리기 어려움 (마이그레이션, 삭제, 프로덕션 데이터, 돈 이동) → 점수와 무관하게 실행 전 멈추고 승인 요청
   - 판단 근거 우선순위: 결정적 결과 → 이번 실행 경로 → 과거 롤백 빈도 → 자기평가(마지막)
7. 배운 것은 남긴다
   - 통과된 결과에서 확정된 제약은 아래 "Learned constraints"에 한 줄씩 추가하고, 이후 작업 분할 시 반드시 반영한다.
## Learned constraints
- (예) adapters는 keyword args를 정확히 보존한다
</pre>
    </div>
    <div class="lg-panel lg-tk" id="p2">
      <div class="lg-tk-head"><div><h3>작업 시작 프롬프트</h3><p class="lg-muted" style="font-size:15px">새 작업을 맡길 때 첫 메시지로 보내요. 에이전트가 GREEN 조건과 그래프부터 그리게 해요.</p></div><button class="lg-copy" data-copy="tpl-start">복사</button></div>
<pre class="lg-code" id="tpl-start">작업: &lt;여기에 할 일&gt;
코드를 쓰기 전에 아래 5가지를 먼저 보여줘. 내가 확인하면 시작해.
1. GREEN 조건
   프로그램이 판정할 수 있는 완료 조건 3~5개.
   (예: `npm test` exit 0 / diff가 아래 파일 목록만 변경 / 모든 주장에 파일:라인 출처)
   "괜찮아 보임", "에러 없음" 같은 건 쓰지 마.
2. 분할 (Splitter)
   작업 단위 목록. 폴더가 아니라 blast radius 기준으로 나누고,
   각 단위에 [국소 / 넓음 / 되돌리기 어려움] 표시.
3. 엣지
   단위 사이 화살표마다 넘어가는 변수 이름.
   이름이 없으면 "병렬"로 표시하고 서브에이전트로 따로 돌릴 것.
4. 코드 노드
   병합·정렬·중복 제거·비교처럼 스크립트로 처리할 단계.
5. 승인 지점
   내가 승인해야 하는 단 하나의 단계 (되돌리기 가장 어렵고 영향이 가장 큰 것).
   그 외 단계는 GREEN이면 묻지 말고 진행.
</pre>
    </div>
    <div class="lg-panel lg-tk" id="p3">
      <div class="lg-tk-head"><div><h3>반려 / 재시도 템플릿</h3><p class="lg-muted" style="font-size:15px">에이전트 결과가 실패했을 때 그대로 채워서 보내요. 서브에이전트에게 지시할 때도 같아요.</p></div><button class="lg-copy" data-copy="tpl-return">복사</button></div>
<pre class="lg-code" id="tpl-return">UNIT      &lt;실패한 단위 하나. 예: handlers slice&gt;
VERDICT   red
REASON    &lt;실패한 체크. 예: test_auth_redirect failed&gt;
EVIDENCE  &lt;기대값 vs 실제값, 파일:라인. 예: expected 302, got 200, handlers/auth.py:88&gt;
SCOPE     이 파일만 수정할 것. 다른 단위는 건드리지 말 것.
ATTEMPT   &lt;n&gt; / 3
규칙: 3회째도 실패하면 더 고치지 말고 멈춰.
대신 분할 계획의 어디가 잘못됐는지 정리해서 보고해줘.
통과하면 이번 수정에서 확정된 제약을 한 줄로 뽑아서 CLAUDE.md "Learned constraints"에 추가해줘.
</pre>
    </div>
    <div class="lg-panel lg-tk" id="p4">
      <div class="lg-tk-head"><div><h3>지금 파이프라인 점검</h3><p class="lg-muted" style="font-size:15px">체크 상태는 이 브라우저에 저장돼요.</p></div><button class="lg-copy" data-copy="cl-md">마크다운 복사</button></div>
      <div class="lg-cl-meta"><div class="lg-cl-bar"><i id="clBar"></i></div><span id="clCount" class="lg-muted" style="font-size:14px">0 / 0</span><button class="lg-linkbtn" id="clReset">초기화</button></div>
      <ul class="lg-check-list" id="checklist"></ul>
      <pre id="cl-md" hidden></pre>
    </div>
  </div>
</section>
<!-- 10 BUILD ORDER -->
<section class="lg-sec lg-alt" id="lg-build">
  <div class="lg-wrap">
    <p class="lg-eyebrow lg-p lg-reveal">09 · 적용 순서</p>
    <h2 class="lg-reveal">내일 아침,<br>이 순서로 시작하세요.</h2>
    <p class="lg-lead lg-reveal">반복하는 작업 하나를 골라 splitter, 레인, merge, 게이트 하나, 되돌림 엣지 하나를 그려요. 그다음 이 순서로 만들어요.</p>
    <div class="lg-steps">
      <div class="lg-step lg-reveal"><div class="lg-dot">1</div><div><h3>게이트 먼저</h3><p>무엇이 GREEN인지, 어떤 레인은 자동이고 어떤 레인은 사람이 보는지부터 정해요.</p></div></div>
      <div class="lg-step lg-reveal"><div class="lg-dot">2</div><div><h3>레인 나누기</h3><p>blast radius 기준으로 자르고, 넘어가는 변수가 없는 단계는 병렬 레인으로 분리해요.</p></div></div>
      <div class="lg-step lg-reveal"><div class="lg-dot">3</div><div><h3>learning edge는 마지막</h3><p>통과된 결과가 쌓여야 제약을 뽑을 수 있어요. 쌓이면 splitter 브리프(CLAUDE.md)에 넣어요.</p></div></div>
      <div class="lg-step lg-reveal"><div class="lg-dot">4</div><div><h3>사람은 한 지점에만</h3><p>merge 승인, 또는 어떤 수정을 배포할지 고르는 것. 그거 하나만 해요.</p></div></div>
    </div>
    <div class="lg-closing">
      <p class="lg-reveal">체크를 먼저 쓰세요.</p>
      <p class="lg-reveal lg-d1">넘어가는 변수가 없으면, 엣지도 없어요.</p>
      <p class="lg-reveal lg-d2"><span class="lg-grad">사람은 마지막 한 단계만.</span></p>
    </div>
  </div>
</section>
<div class="lg-toast" id="lgToast" role="status" aria-live="polite">복사했어요</div>
</div>

{:/nomarkdown}

## 출처

- **원문**: Hanako(@hanakoxbt), “Loops and Graphs” — <https://x.com/hanakoxbt/status/2091515787366306154>
- **이 글의 성격**: 원문을 실무용으로 한국어로 요약·재구성한 것이며, 템플릿은 원문의 예시를 바탕으로 만들었습니다. 원문 전체를 옮긴 번역이 아닙니다. 개념의 출처는 원문에 있고, 정리와 구성 과정에서 생긴 오류는 이쪽의 몫입니다.
- **작성자**: 우빈(Srevil)
- **제작 도구**: 우빈이 Claude와 함께 만든 단독 HTML 파일입니다. 어떤 Claude 환경에서 만들었는지에 대한 세션 기록은 남아 있지 않습니다.
- **원본 파일**: `Loops-and-Graphs.html`(2026-11-23 저장). 같은 내용이 HTML 갤러리의 `public/loops-and-graphs-agent-guide.html`로 올라가 있고, <https://html.srevil.com/public/loops-and-graphs-agent-guide.html> 에서도 볼 수 있습니다. 두 파일은 바이트 단위로 동일합니다.
- **이 블로그에 옮긴 방식**: 별도 페이지를 iframe으로 끼워 넣지 않고, 원본 가이드의 본문(문단, 목록, 템플릿 블록, 체크리스트 항목)과 스크롤 리빌·다이어그램 애니메이션·복사 버튼·체크리스트 동작을 이 글 페이지에 직접 옮겼습니다. 색과 배치는 Night Log 다크 톤에 맞게 조정했고, 모션과 동작은 원본을 따랐습니다.
- **기술 사항**: 원본은 외부 라이브러리, 웹폰트 CDN, 이미지를 쓰지 않고 CSS와 JS를 파일 안에 인라인으로 담았습니다. 이 글에서도 가이드 부분은 외부 라이브러리 없이 이 사이트의 자체 CSS/JS 파일(`lg-guide`)만 사용합니다. 체크리스트는 localStorage 키 `loopsGraphs.checklist.v1`만 사용합니다.
