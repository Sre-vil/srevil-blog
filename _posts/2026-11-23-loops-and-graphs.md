---
title: "Loops & Graphs: 마지막 한 단계만 승인하기"
date: 2026-11-23 00:38:00 +0900
tags: [에이전트, Claude Code, 기록]
description: 사람은 에이전트 작업의 모든 단계를 지켜볼 필요가 없습니다. 되돌리기 어렵고 영향이 큰 한 단계만 승인하면 됩니다. Hanako의 “Loops and Graphs”를 읽고 정리했습니다.
permalink: /posts/loops-and-graphs/
lg_guide: true
lang: ko
i18n_id: loops-and-graphs
---

사람 승인 자리는 되돌리기 어렵고, 잘못됐을 때 영향이 큰 한 단계면 됩니다. 중간 과정을 줄줄이 들여다보는 일은, 그 자리를 미리 정해 두지 않아서 생깁니다.

이 글은 Hanako(@hanakoxbt)의 “Loops and Graphs”를 읽고 제 말로 정리한 기록입니다. 읽으면서 남긴 골자는 셋입니다.

- 체크는 프로그램이 판정할 수 있게, 작업보다 먼저 적는다.
- 일은 실제로 입출력이 이어질 때만 잇고, 아니면 나란히 돌린다.
- 사람이 들어가는 기준은 영향 범위다. 모델이 얼마나 확신하는지는 잘 보이지 않는다.

## 통과 조건을 먼저 적는다

에이전트에게 일을 맡기고도 저는 화면 앞에 오래 앉아 있습니다. 출력이 떨어지는 동안 스크롤을 따라갑니다. 중간 결과가 조금 이상해 보이면 바로 손을 댑니다.

원문은 그 감시를 Loop와 Graph로 나눠 봅니다. Loop는 생성하고, 검사하고, 고치고, 검사가 통과할 때까지 반복하는 순환입니다. 검사 기준이 사람 취향이면 루프는 멈추지 않습니다. 프로그램이 통과와 실패를 가릴 수 있어야 합니다. 그 기준을 작업보다 먼저 적어 두면, 에이전트는 그 조건을 돌 수 있습니다. 저는 그 과정을 줄지어 읽지 않아도 됩니다.

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

그림은 한 바퀴를 돌며 한 번은 실패하고, 고친 뒤 통과하는 순환입니다. 가운데 상태가 빨강에서 초록으로 바뀝니다. “괜찮아 보인다”나 “모델이 자신 있어 한다”는 이 자리에 들어가지 않습니다.

## 이어지는 일만 잇는다

Graph는 그런 루프를 어떻게 붙일지 그리는 방식입니다. 일을 한 덩어리로 맡기지 않습니다. 쪼개고, 각자 돌리고, 코드로 합칩니다. 원문은 이 역할을 나누는 노드 이름을 적어두었습니다. 이름을 외우기보다, 저는 한 단계가 실패했을 때 영향이 어디까지 닿는지를 먼저 떠올리게 되었습니다.

한 단계의 출력이 다음 입력으로 실제로 들어갈 때만 둘 사이에 선이 있습니다. 넘어가는 값을 이름으로 대지 못하면, 둘을 이어서 돌릴 이유가 없습니다. 아래 그림은 같은 일을 차례로 붙인 상태와, 필요 없는 선을 걷어 내고 나란히 돌리는 상태를 이어서 보여 줍니다.

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

에이전트가 빠르다고 모든 단계를 한꺼번에 밀어붙이면, 나중에 손을 대기 어려워집니다. 순서를 지켜야 하는 일과 나란히 둘 수 있는 일을 나눕니다. 한 갈래의 실패가 전체로 번지지 않게 경계를 둡니다.

## 영향이 큰 자리에만 들어간다

원문에서 오래 남은 문장이 있습니다. 개입 지점은 영향 범위로 고른다. 모델이 얼마나 확신하는지는 잘 보이지 않습니다. 한 번 잘못 들어가면 되돌리기 어려운 자리, 다른 사람이나 저장소에 흔적이 남는 자리는 비교적 분명합니다. 그런 자리에 게이트를 둡니다. 나머지는 루프가 통과하거나 다시 시도하게 둡니다.

다음번에 에이전트에게 일을 맡길 때는, 화면을 보기 전에 두 줄을 먼저 적으려 합니다. 무엇을 통과 조건으로 둘지. 내가 마지막에 볼 단계는 어디인지. 읽은 그대로 제 작업에 적용해 본 기록은 아직 아닙니다.

## 출처

- **원문**: Hanako(@hanakoxbt), “Loops and Graphs” — [https://x.com/hanakoxbt/status/2091515787366306154](https://x.com/hanakoxbt/status/2091515787366306154)
- **이 글의 성격**: 원문을 읽고 제 말로 정리한 블로그 글입니다. 원문 전체의 번역이 아니며, 정리 과정에서 생긴 오류는 이쪽의 몫입니다.
- **작성자**: 우빈(Srevil)
- **작성 도구**: Claude와 함께 작성했습니다.
- **다이어그램**: 우빈이 예전에 만든 HTML 가이드(`Loops-and-Graphs.html`)에서, 설명을 돕는 Loop·Graph 애니메이션만 가져와 이 글에 맞게 다듬었습니다.
