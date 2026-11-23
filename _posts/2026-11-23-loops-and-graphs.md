---
title: "Loops & Graphs: 마지막 한 단계만 승인하기"
date: 2026-11-23 00:38:00 +0900
tags: [에이전트, Claude Code, 기록]
description: Hanako의 “Loops and Graphs”를 읽고, 체크와 그래프, 승인 지점까지 실무에 가깝게 정리했습니다.
permalink: /posts/loops-and-graphs/
lg_guide: true
lang: ko
i18n_id: loops-and-graphs
---

<mark>사람 승인 자리는 되돌리기 어렵고, 잘못됐을 때 영향이 큰 한 단계면 됩니다.</mark> 중간 과정을 줄줄이 들여다보는 일은, 그 자리를 미리 정해 두지 않아서 생깁니다.

이 글은 Hanako(@hanakoxbt)의 “Loops and Graphs”를 읽고 제 말로 정리한 기록입니다. 원문의 골자를, 바로 붙여 쓸 수 있는 단위까지 풀어 적습니다.

골자는 셋입니다.

- 체크는 프로그램이 판정할 수 있게, **작업보다 먼저** 적는다.
- 일은 실제로 **입출력이 이어질 때만** 잇고, 아니면 나란히 돌린다.
- 사람이 들어가는 기준은 **영향 범위**다. 모델이 얼마나 확신하는지는 잘 보이지 않는다.

## 통과 조건을 먼저 적는다

에이전트에게 일을 맡긴 뒤에도 화면을 따라가며, 중간마다 손을 대고 싶어집니다. 검사 기준이 사람 취향이면 그 루프는 멈추지 않습니다.

원문은 그 감시를 Loop와 Graph로 나눠 봅니다. **Loop**는 생성하고, 검사하고, 고치고, 검사가 통과할 때까지 반복하는 순환입니다. 프로그램이 통과와 실패를 가릴 수 있어야 합니다. 그 기준을 작업보다 먼저 적어 두면, 에이전트는 그 조건을 혼자 돌 수 있습니다.

{::nomarkdown}
<div class="lg-guide" id="lgGuide">
  <figure class="lg-figure lg-reveal">
    <div class="lg-stage">
      <svg id="loopSvg" viewBox="0 0 520 440" role="img" aria-label="생성, 체크, 수정, 반복으로 이어지는 루프. 첫 체크는 빨강, 수정 후 두 번째 체크는 초록">
        <defs><linearGradient id="lg1" x1="0" x2="1"><stop offset="0" stop-color="#7fb2ef"/><stop offset="1" stop-color="#b794f4"/></linearGradient></defs>
        <circle class="lg-ring" cx="260" cy="220" r="160"/>
        <circle class="lg-ringP" id="ringP" cx="260" cy="220" r="160" stroke-dasharray="0 1006" transform="rotate(-90 260 220)"/>
        <g class="lg-st" id="stP" transform="translate(260 60)"><circle r="44"/><text class="lg-n-txt" y="-6" style="fill:#f3f1ec">생성</text><text class="lg-n-sub" y="14">produce</text></g>
        <g class="lg-st" id="stC" transform="translate(420 220)"><circle r="44"/><text class="lg-n-txt" y="-6" style="fill:#f3f1ec">체크</text><text class="lg-n-sub" y="14">check</text></g>
        <g class="lg-st" id="stF" transform="translate(260 380)"><circle r="44"/><text class="lg-n-txt" y="-6" style="fill:#f3f1ec">수정</text><text class="lg-n-sub" y="14">correct</text></g>
        <g class="lg-st" id="stR" transform="translate(100 220)"><circle r="44"/><text class="lg-n-txt" y="-6" style="fill:#f3f1ec">반복</text><text class="lg-n-sub" y="14">repeat</text></g>
        <text class="lg-center" x="260" y="205" font-size="14" fill="#a9a7b0">현재 체크</text>
        <text class="lg-center" id="loopCenter" x="260" y="235" font-size="26" font-weight="700">대기</text>
        <circle id="loopDot" r="8" cx="260" cy="60"/>
      </svg>
    </div>
    <figcaption class="lg-note"><span class="lg-status-pill" id="loopStatus">$ npm test → 대기</span></figcaption>
  </figure>
</div>
{:/nomarkdown}

그림은 한 바퀴를 돌며 한 번은 실패하고, 고친 뒤 통과하는 순환입니다. 가운데 상태가 빨강에서 초록으로 바뀝니다.

체크에 들어갈 수 있는 것과, 들어가면 안 되는 것이 갈립니다.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-grid lg-grid-2">
    <div class="lg-card is-ok">
      <p class="lg-k">GREEN</p>
      <p class="lg-h">프로그램이 판정합니다</p>
      <ul>
        <li>테스트 스위트가 exit 0으로 끝난다</li>
        <li>모든 주장에 출처(파일:라인)가 붙어 있다</li>
        <li>diff가 계획에 적힌 파일만 건드린다</li>
      </ul>
    </div>
    <div class="lg-card is-no">
      <p class="lg-k">NOT A CHECK</p>
      <p class="lg-h">느낌에 가깝습니다</p>
      <ul>
        <li>“결과가 괜찮아 보인다”</li>
        <li>“모델이 자신 있다고 한다”</li>
        <li>“에러가 안 났다.” 에러가 없다고 정답은 아닙니다</li>
        <li>다른 모델에게 “검토해줘”만 시키기. 낙관적인 쪽끼리 동의하는 일에 가깝습니다</li>
      </ul>
    </div>
  </div>
</div>
{:/nomarkdown}

## 이어지는 일만 잇는다

**Graph**는 그런 루프를 어떻게 붙일지 그리는 방식입니다. 노드는 입력 하나, 출력 하나인 제한된 작업입니다. 한 단계의 출력이 다음 입력으로 **실제로 들어갈 때만** 둘 사이에 선이 있습니다.

화살표마다 물으면 됩니다. 넘어가는 값의 이름을 댈 수 있나요. 다음 단계가 이전 단계의 출력을 실제로 읽나요. 이름을 대지 못하면 둘을 이어서 돌릴 이유가 없습니다. 그 둘은 나란히 두면 됩니다.

아래 그림은 같은 일을 차례로 붙인 상태와, 필요 없는 선을 걷어 내고 나란히 돌리는 상태를 이어서 보여 줍니다.

{::nomarkdown}
<div class="lg-guide">
  <figure class="lg-figure lg-reveal">
    <div class="lg-stage lg-stage-col">
      <svg id="dagSvg" viewBox="0 0 780 320" role="img" aria-label="직렬 체인에서 가짜 엣지를 제거하면 병렬 그래프가 되는 다이어그램"></svg>
      <div class="lg-timebar">
        <div class="lg-row"><span>소요 시간</span><div class="lg-bar" id="timeBar" style="width:100%"></div></div>
        <div class="lg-row"><span></span><small id="timeTxt">워커 3개가 차례로 돌아요: 3 단위 시간</small></div>
      </div>
    </div>
  </figure>
</div>
{:/nomarkdown}

## 네 가지 노드로 그린다

원문은 파이프라인을 네 가지 역할로 그립니다. 이름을 외우기보다, 한 단계가 실패했을 때 영향이 어디까지 닿는지를 먼저 보면 됩니다.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-grid lg-grid-4">
    <div class="lg-card">
      <p class="lg-k">Splitter</p>
      <p class="lg-h">분할</p>
      <p>맨 앞에서 작업을 자릅니다. 가장 먼저 정해야 하는 결정입니다. 폴더가 아니라 영향 범위(blast radius)를 기준으로 자릅니다.</p>
    </div>
    <div class="lg-card">
      <p class="lg-k">Worker</p>
      <p class="lg-h">작업자</p>
      <p>단위 하나, 관점 하나, 독립된 컨텍스트입니다. 컨텍스트를 공유하면 결과가 한쪽으로 몰립니다. 네 번 비용을 내고 의견 하나를 얻게 됩니다.</p>
    </div>
    <div class="lg-card">
      <p class="lg-k">Code node</p>
      <p class="lg-h">코드</p>
      <p>병합, 정렬, 중복 제거, 전후 비교처럼 정답이 하나인 변환은 모델이 아니라 코드가 합니다.</p>
    </div>
    <div class="lg-card">
      <p class="lg-k">Gate</p>
      <p class="lg-h">관문</p>
      <p>결과를 통과시키거나, 만든 단계로 되돌립니다. 여는 기준은 확신 점수가 아니라 영향 범위입니다.</p>
    </div>
  </div>
</div>
{:/nomarkdown}

{::nomarkdown}
<div class="lg-guide"><div class="lg-hint"><p>그 단계를 “판단, 결정, 평가, 요약” 같은 말 없이 설명할 수 있으면, 모델이 아니라 코드로 만드는 편이 맞습니다.</p></div></div>
{:/nomarkdown}

워커는 같은 대화 안에서 서브태스크로 돌리지 않습니다. 서브에이전트를 각각 띄우고, 컨텍스트를 나눕니다.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-ctx">
    <div class="lg-ctx-item">Worker A<small>ctx A</small></div>
    <div class="lg-ctx-item">Worker B<small>ctx B</small></div>
    <div class="lg-ctx-item">Worker C<small>ctx C</small></div>
    <div class="lg-ctx-item">Worker D<small>ctx D</small></div>
  </div>
</div>
{:/nomarkdown}

## Loop는 노드 안에, Graph는 노드 사이에

각 노드는 안에서 자기 체크가 통과할 때까지 혼자 돕니다. 노드끼리는 실제로 넘어가는 출력으로만 이어집니다.

{::nomarkdown}
<div class="lg-guide">
  <figure class="lg-figure lg-reveal">
    <div class="lg-stage">
      <svg viewBox="0 0 760 230" role="img" aria-label="세 노드 각각 안에서 작은 루프가 돌고, 노드 사이를 그래프 엣지가 잇는 그림" style="max-width:760px">
        <defs>
          <marker id="lgArrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7fb2ef"/></marker>
        </defs>
        <path d="M232 120H290" fill="none" stroke="#7fb2ef" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#lgArrB)"/>
        <path d="M472 120H530" fill="none" stroke="#7fb2ef" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#lgArrB)"/>
        <g transform="translate(120 120)">
          <circle cx="0" cy="0" r="58" fill="none" stroke="#30d158" stroke-width="2.5" stroke-dasharray="12 7" transform="rotate(-20)"/>
          <rect x="-70" y="-28" width="140" height="56" rx="14" fill="#14131a" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>
          <text text-anchor="middle" y="-2" fill="#f3f1ec" font-size="15" font-weight="600">Worker A</text>
          <text text-anchor="middle" y="16" fill="#a9a7b0" font-size="11">loop</text>
        </g>
        <g transform="translate(380 120)">
          <circle cx="0" cy="0" r="58" fill="none" stroke="#30d158" stroke-width="2.5" stroke-dasharray="12 7" transform="rotate(15)"/>
          <rect x="-70" y="-28" width="140" height="56" rx="14" fill="#14131a" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>
          <text text-anchor="middle" y="-2" fill="#f3f1ec" font-size="15" font-weight="600">Merge (code)</text>
          <text text-anchor="middle" y="16" fill="#a9a7b0" font-size="11">loop</text>
        </g>
        <g transform="translate(640 120)">
          <circle cx="0" cy="0" r="58" fill="none" stroke="#30d158" stroke-width="2.5" stroke-dasharray="12 7" transform="rotate(-8)"/>
          <rect x="-70" y="-28" width="140" height="56" rx="14" fill="#14131a" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>
          <text text-anchor="middle" y="-2" fill="#f3f1ec" font-size="15" font-weight="600">Gate</text>
          <text text-anchor="middle" y="16" fill="#a9a7b0" font-size="11">loop</text>
        </g>
      </svg>
    </div>
    <p class="lg-cap">초록 호는 노드 안의 loop입니다. 파란 점선은 노드 사이의 graph 엣지입니다.</p>
  </figure>
</div>
{:/nomarkdown}

## 되돌아가는 길은 두 개다

대부분은 짧은 길만 만듭니다. 긴 길이 있어야 같은 실수가 다음 실행에서 다시 나오지 않습니다.

짧은 길은 수정 엣지입니다. 게이트가 실패한 단위를, 그 단위를 만든 단계로 돌려보냅니다. 이번 실행을 고칩니다.

긴 길은 학습 엣지입니다. 통과된 결과에서 제약 조건을 뽑아 분할 단계의 브리프에 넣습니다. 이후 실행을 고칩니다. 이 길을 빼먹기 쉽습니다.

{::nomarkdown}
<div class="lg-guide">
  <figure class="lg-figure lg-reveal">
    <div class="lg-stage">
      <svg viewBox="0 0 760 250" role="img" aria-label="수정 엣지와 학습 엣지, 두 갈래의 되돌림 경로" style="max-width:760px">
        <defs>
          <marker id="lgArrF" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#a9a7b0"/></marker>
          <marker id="lgArrC" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#d97757"/></marker>
          <marker id="lgArrL" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7fb2ef"/></marker>
        </defs>
        <g font-size="13" font-weight="600" text-anchor="middle">
          <rect x="20" y="88" width="140" height="54" rx="12" fill="#14131a" stroke="rgba(255,255,255,.16)"/>
          <text x="90" y="112" fill="#f3f1ec">Splitter</text>
          <text x="90" y="128" fill="#a9a7b0" font-size="11" font-weight="400">브리프</text>
          <rect x="210" y="88" width="140" height="54" rx="12" fill="#14131a" stroke="rgba(255,255,255,.16)"/>
          <text x="280" y="112" fill="#f3f1ec">Worker</text>
          <text x="280" y="128" fill="#a9a7b0" font-size="11" font-weight="400">단위 생성</text>
          <rect x="400" y="88" width="140" height="54" rx="12" fill="#14131a" stroke="rgba(255,255,255,.16)"/>
          <text x="470" y="112" fill="#f3f1ec">Gate</text>
          <text x="470" y="128" fill="#a9a7b0" font-size="11" font-weight="400">통과 / 반려</text>
          <rect x="590" y="88" width="150" height="54" rx="12" fill="#14131a" stroke="rgba(48,209,88,.45)"/>
          <text x="665" y="112" fill="#f3f1ec">Accepted</text>
          <text x="665" y="128" fill="#a9a7b0" font-size="11" font-weight="400">통과 결과</text>
        </g>
        <path d="M160 115H210" fill="none" stroke="#a9a7b0" stroke-width="1.6" marker-end="url(#lgArrF)"/>
        <path d="M350 115H400" fill="none" stroke="#a9a7b0" stroke-width="1.6" marker-end="url(#lgArrF)"/>
        <path d="M540 115H590" fill="none" stroke="#a9a7b0" stroke-width="1.6" marker-end="url(#lgArrF)"/>
        <path d="M430 142C430 190 330 190 330 142" fill="none" stroke="#d97757" stroke-width="1.8" marker-end="url(#lgArrC)"/>
        <text x="380" y="208" text-anchor="middle" fill="#d97757" font-size="11">수정 엣지 · 이번 실행을 고칩니다</text>
        <path d="M665 88C665 28 90 28 90 88" fill="none" stroke="#7fb2ef" stroke-width="1.8" marker-end="url(#lgArrL)"/>
        <text x="380" y="22" text-anchor="middle" fill="#7fb2ef" font-size="11">학습 엣지 · 이후 실행을 고칩니다</text>
      </svg>
    </div>
  </figure>
</div>
{:/nomarkdown}

원문에 나온 예는 이렇습니다. utils 슬라이스가 첫 시도에 통과했을 때, “adapters는 keyword args를 정확히 보존한다”는 제약을 뽑아 다음 분할 브리프에 넣습니다. Claude Code에서는 그 한 줄을 CLAUDE.md의 Learned constraints에 쌓으면 됩니다.

실패한 단위만 돌려보냅니다. 넷 중 하나가 실패했으면 그 하나만 다시 합니다. 전체를 다시 쓰면, 이미 통과한 셋이 다르게 다시 쓰이고 결과가 모이지 않습니다.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-slices">
    <div class="lg-slice"><span>utils slice 1</span><span>→ </span></div>
    <div class="lg-slice is-back"><span>handlers slice 2</span><span>GATE <small>재시도 0 / 3</small></span></div>
    <div class="lg-slice"><span>adapters slice 3</span><span>→ </span></div>
    <div class="lg-slice"><span>models slice 4</span><span>→ </span></div>
  </div>
  <p class="lg-cap">실패한 handlers만 게이트로 돌아갑니다. 나머지 셋은 그대로 둡니다.</p>
</div>
{:/nomarkdown}

돌려보낼 때는 다섯 줄을 같이 보냅니다.

```
UNIT      handlers slice
VERDICT   red
REASON    test_auth_redirect failed
EVIDENCE  expected 302, got 200, handlers/auth.py:88
SCOPE     fix this file only, do not touch other slices
```

SCOPE가 없으면 수정 범위가 번집니다. 결국 아무도 리뷰하지 않은 큰 diff가 됩니다.

같은 단위가 세 번 실패하면, 단위 문제가 아니라 분할이 잘못된 쪽에 가깝습니다. 그때는 사람에게 올립니다.

## 영향이 큰 자리에만 들어간다

개입 지점은 영향 범위로 고릅니다. 모델 점수가 높아도, 되돌리기 어려운 작업은 자동으로 통과시키지 않습니다.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-grid lg-grid-3">
    <div class="lg-card is-ok">
      <p class="lg-k">OPEN</p>
      <p class="lg-h">되돌리기 쉽고 국소적</p>
      <p>자동으로 통과해도 됩니다.</p>
      <p class="lg-ex">문구 변경, 테스트, 커버리지가 있는 독립 함수</p>
    </div>
    <div class="lg-card ">
      <p class="lg-k">GATED</p>
      <p class="lg-h">되돌리기 쉽지만 넓음</p>
      <p>결정적 체크를 통과하고, 실행 이력이 깔끔할 때만 통과시킵니다.</p>
      <p class="lg-ex">공용 유틸, 스키마 추가, 호출처가 많은 코드</p>
    </div>
    <div class="lg-card is-closed">
      <p class="lg-k">CLOSED</p>
      <p class="lg-h">되돌리기 어려움</p>
      <p>점수와 상관없이 사람이 승인합니다.</p>
      <p class="lg-ex">마이그레이션, 삭제, 프로덕션 데이터, 돈 이동</p>
    </div>
  </div>
</div>
{:/nomarkdown}

게이트가 믿는 근거는 이 순서입니다.

{::nomarkdown}
<div class="lg-guide">
  <p class="lg-cap" style="text-align:left;margin-bottom:10px">게이트가 믿는 근거, 우선순위 순</p>
  <div class="lg-prio">
    <div class="lg-pr"><b>1</b><span>결정적 결과 (테스트 등)</span></div>
    <div class="lg-pr"><b>2</b><span>이번 실행 경로</span></div>
    <div class="lg-pr"><b>3</b><span>이 노드의 과거 롤백 빈도</span></div>
    <div class="lg-pr"><b>4</b><span>모델 자기평가 (마지막)</span></div>
  </div>
</div>
{:/nomarkdown}

## 바로 붙여 쓸 수 있는 것

아래는 원문 예시를 바탕으로, 코딩 에이전트에 붙여 넣을 수 있게 재구성한 블록입니다.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-tk">
    <div class="lg-tk-head"><div><p class="lg-h">CLAUDE.md 규칙 블록</p><p>프로젝트 루트 CLAUDE.md나 ~/.claude/CLAUDE.md에 붙여 넣습니다.</p></div><button type="button" class="lg-copy" data-copy="tpl-claude">복사</button></div>
    <pre class="lg-pre" id="tpl-claude">## 에이전트 작업 규칙 (Loop + Graph)
목표: 나는 중간 결과를 검토하지 않는다. 되돌리기 가장 어렵고 영향이 가장 큰 한 단계만 승인한다.

1. 체크 먼저
   - 작업 시작 전, 프로그램이 판정할 수 있는 완료 조건(GREEN 목록)을 먼저 써서 보여줄 것.
     예) 테스트 exit 0 / 모든 주장에 파일:라인 출처 / diff가 계획에 적힌 파일만 변경
   - &quot;괜찮아 보임&quot;, &quot;자신 있음&quot;, &quot;에러 없음&quot;, &quot;다른 모델이 검토함&quot;은 체크가 아니다.
   - GREEN이 될 때까지 생성 → 체크 → 수정을 반복한다.

2. 엣지는 실제 데이터 흐름만
   - 단계 사이 화살표마다 &quot;넘어가는 변수&quot;의 이름을 댈 수 있는지 확인한다.
   - 이름을 댈 수 없으면 엣지가 아니다 → 병렬로 실행한다.
   - 병렬 작업은 서브에이전트로, 각자 독립된 컨텍스트에서 돌린다.

3. 코드로 할 일은 코드로
   - 병합, 정렬, 중복 제거, 전후 비교처럼 정답이 하나인 변환은 모델 대신 스크립트로 처리한다.
   - &quot;판단/결정/평가/요약&quot; 없이 설명되는 단계는 코드다.

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
   - 통과된 결과에서 확정된 제약은 아래 &quot;Learned constraints&quot;에 한 줄씩 추가하고, 이후 작업 분할 시 반드시 반영한다.

## Learned constraints
- (예) adapters는 keyword args를 정확히 보존한다</pre>
  </div>
  <div class="lg-tk">
    <div class="lg-tk-head"><div><p class="lg-h">작업 시작 프롬프트</p><p>새 작업을 맡길 때 첫 메시지로 보냅니다. 에이전트가 GREEN 조건과 그래프부터 그리게 합니다.</p></div><button type="button" class="lg-copy" data-copy="tpl-start">복사</button></div>
    <pre class="lg-pre" id="tpl-start">작업: &lt;여기에 할 일&gt;

코드를 쓰기 전에 아래 5가지를 먼저 보여줘. 내가 확인하면 시작해.

1. GREEN 조건
   프로그램이 판정할 수 있는 완료 조건 3~5개.
   (예: `npm test` exit 0 / diff가 아래 파일 목록만 변경 / 모든 주장에 파일:라인 출처)
   &quot;괜찮아 보임&quot;, &quot;에러 없음&quot; 같은 건 쓰지 마.

2. 분할 (Splitter)
   작업 단위 목록. 폴더가 아니라 blast radius 기준으로 나누고,
   각 단위에 [국소 / 넓음 / 되돌리기 어려움] 표시.

3. 엣지
   단위 사이 화살표마다 넘어가는 변수 이름.
   이름이 없으면 &quot;병렬&quot;로 표시하고 서브에이전트로 따로 돌릴 것.

4. 코드 노드
   병합, 정렬, 중복 제거, 비교처럼 스크립트로 처리할 단계.

5. 승인 지점
   내가 승인해야 하는 단 하나의 단계 (되돌리기 가장 어렵고 영향이 가장 큰 것).
   그 외 단계는 GREEN이면 묻지 말고 진행.</pre>
  </div>
  <div class="lg-tk">
    <div class="lg-tk-head"><div><p class="lg-h">반려 / 재시도 템플릿</p><p>결과가 실패했을 때 채워서 보냅니다. 서브에이전트에게 지시할 때도 같습니다.</p></div><button type="button" class="lg-copy" data-copy="tpl-return">복사</button></div>
    <pre class="lg-pre" id="tpl-return">UNIT      &lt;실패한 단위 하나. 예: handlers slice&gt;
VERDICT   red
REASON    &lt;실패한 체크. 예: test_auth_redirect failed&gt;
EVIDENCE  &lt;기대값 vs 실제값, 파일:라인. 예: expected 302, got 200, handlers/auth.py:88&gt;
SCOPE     이 파일만 수정할 것. 다른 단위는 건드리지 말 것.
ATTEMPT   &lt;n&gt; / 3

규칙: 3회째도 실패하면 더 고치지 말고 멈춰.
대신 분할 계획의 어디가 잘못됐는지 정리해서 보고해줘.
통과하면 이번 수정에서 확정된 제약을 한 줄로 뽑아서 CLAUDE.md &quot;Learned constraints&quot;에 추가해줘.</pre>
  </div>
  <div class="lg-tk">
    <div class="lg-tk-head"><div><p class="lg-h">지금 파이프라인 점검</p><p>체크 상태는 이 브라우저에만 저장됩니다.</p></div>
      <button type="button" class="lg-linkbtn" data-cl-reset>초기화</button>
    </div>
    <div class="lg-cl-meta"><div class="lg-cl-bar"><i data-cl-bar></i></div><span data-cl-count></span></div>
    <ul class="lg-check" data-lg-checklist>
      <li><label><input type="checkbox"><span>모든 단계에 프로그램이 판정하는 GREEN 조건이 있다<small>“괜찮아 보임 / 자신 있음 / 에러 없음”은 제외</small></span></label></li>
      <li><label><input type="checkbox"><span>“다른 모델에게 검토 요청”만으로 된 체크가 없다<small>낙관적인 쪽끼리 동의하는 일은 체크가 아닙니다</small></span></label></li>
      <li><label><input type="checkbox"><span>체크가 작업보다 먼저 쓰여 있다</span></label></li>
      <li><label><input type="checkbox"><span>모든 화살표에 넘어가는 변수 이름을 댈 수 있다<small>못 대면 그 엣지를 지우고 나란히 둡니다</small></span></label></li>
      <li><label><input type="checkbox"><span>워커들이 컨텍스트를 공유하지 않는다<small>서브에이전트마다 독립된 컨텍스트</small></span></label></li>
      <li><label><input type="checkbox"><span>정답이 하나인 변환(병합, 정렬, 중복 제거, diff)은 코드가 한다<small>“판단, 결정, 평가, 요약” 없이 설명되면 코드입니다</small></span></label></li>
      <li><label><input type="checkbox"><span>splitter가 폴더가 아니라 blast radius 기준으로 자른다</span></label></li>
      <li><label><input type="checkbox"><span>실패하면 배치 전체가 아니라 실패한 단위만 되돌린다</span></label></li>
      <li><label><input type="checkbox"><span>되돌림 메시지에 UNIT / VERDICT / REASON / EVIDENCE / SCOPE가 다 있다<small>SCOPE가 없으면 diff가 번집니다</small></span></label></li>
      <li><label><input type="checkbox"><span>재시도 상한(3회)과, 넘으면 사람에게 올리는 경로가 있다<small>3회 실패는 계획 문제입니다</small></span></label></li>
      <li><label><input type="checkbox"><span>되돌리기 어려운 작업(마이그레이션, 삭제, 프로덕션 데이터, 돈)은 점수와 무관하게 사람 승인이다</span></label></li>
      <li><label><input type="checkbox"><span>게이트 근거 순서가 결정적 결과 → 실행 경로 → 롤백 이력 → 자기평가다</span></label></li>
      <li><label><input type="checkbox"><span>통과 결과에서 제약을 뽑아 splitter 브리프에 넣는 learning edge가 있다<small>CLAUDE.md “Learned constraints”</small></span></label></li>
      <li><label><input type="checkbox"><span>사람이 보는 지점은 딱 하나다<small>병합 승인, 또는 배포할 수정 선택</small></span></label></li>
    </ul>
  </div>
</div>
{:/nomarkdown}

## 이 순서로 시작하기

반복하는 작업 하나를 고릅니다. 분할, 레인, 병합, 게이트 하나, 되돌림 엣지 하나를 그립니다. 그다음 이 순서로 만듭니다.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-steps">
    <div class="lg-step"><div class="lg-dot">1</div><div><p class="lg-h">게이트 먼저</p><p>무엇이 통과인지, 어떤 레인은 자동이고 어떤 레인은 사람이 보는지부터 정합니다.</p></div></div>
    <div class="lg-step"><div class="lg-dot">2</div><div><p class="lg-h">레인 나누기</p><p>영향 범위 기준으로 자르고, 넘어가는 값이 없는 단계는 나란히 둡니다.</p></div></div>
    <div class="lg-step"><div class="lg-dot">3</div><div><p class="lg-h">학습 엣지는 마지막</p><p>통과된 결과가 쌓여야 제약을 뽑을 수 있습니다. 쌓이면 분할 브리프, 곧 CLAUDE.md에 넣습니다.</p></div></div>
    <div class="lg-step"><div class="lg-dot">4</div><div><p class="lg-h">사람은 한 지점에만</p><p>병합을 승인하거나, 어떤 수정을 배포할지 고르는 일. 그 하나만 합니다.</p></div></div>
  </div>
</div>
{:/nomarkdown}

다음번에 에이전트에게 일을 맡길 때는, 화면을 보기 전에 두 줄을 먼저 적으려 합니다.

<aside class="takeaway">
<p>무엇을 통과 조건으로 둘지. 내가 마지막에 볼 단계는 어디인지.</p>
</aside>

읽은 그대로 제 작업에 적용해 본 기록은 아직 아닙니다.

## 출처

- **원문**: Hanako(@hanakoxbt), “Loops and Graphs” — [https://x.com/hanakoxbt/status/2091515787366306154](https://x.com/hanakoxbt/status/2091515787366306154)
- **이 글의 성격**: 원문을 읽고 제 말로 정리한 블로그 글입니다. 원문 전체의 번역이 아니며, 정리 과정에서 생긴 오류는 이쪽의 몫입니다.
- **작성자**: 우빈(Srevil)
- **작성 도구**: Claude와 함께 작성했습니다.
- **다이어그램**: 우빈이 예전에 만든 HTML 가이드(`Loops-and-Graphs.html`)에서 Loop·Graph 애니메이션과, 설명을 돕는 도해·템플릿을 가져와 이 글에 맞게 다듬었습니다.
