---
title: "Loops & Graphs: 마지막 한 단계만 승인하기"
date: 2026-11-23 00:38:00 +0900
tags: [에이전트, Claude Code, 기록]
description: Hanako의 “Loops and Graphs”를 읽고, 에이전트 일을 Loop와 Graph로 짜고 사람은 영향이 큰 한 단계만 승인하자는 이야기를 제 말로 정리했습니다.
permalink: /posts/loops-and-graphs/
lg_guide: true
---

에이전트에게 일을 맡기고도, 저는 결국 화면 앞에서 오래 머물게 됩니다. 출력이 떨어지는 동안 스크롤을 따라가고, 중간 결과가 조금 이상해 보이면 바로 개입합니다. 일을 맡긴 것 같은데, 실제로는 내내 감시하고 있는 기분입니다.

그런 버릇을 떠올리며 Hanako(@hanakoxbt)의 “Loops and Graphs”를 읽었습니다. 원문은 에이전트 작업을 Loop와 Graph로 보고, 사람은 되돌리기 가장 어렵고 영향이 큰 한 단계에만 들어가자고 합니다. 번역을 옮기려는 글은 아니고, 읽으면서 남긴 메모를 조금 다듬어 여기에 적습니다.

## 감시 대신 구조

원문의 출발점은 단순합니다. 품질을 사람이 중간중간 눈으로 확인해서 만드는 대신, 실패할 수 있는 체크와 작업의 구조에 맡기자는 것입니다. 그 체크가 Loop이고, 그 구조가 Graph입니다.

Loop는 생성하고, 검사하고, 고치고, 검사가 통과할 때까지 반복하는 순환입니다. 중요한 것은 그 검사가 사람 취향이 아니라 프로그램이 판정할 수 있어야 한다는 점입니다. 체크를 작업보다 먼저 적어 두면, 에이전트는 그 기준을 돌 수 있고 저는 그 과정을 줄지어 읽지 않아도 됩니다.

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

그림은 생성에서 시작해 체크를 지나고, 한 번은 실패했다가 수정한 뒤 다시 통과하는 순환입니다. 가운데 상태가 빨강에서 초록으로 바뀌는 것이, 원문이 말하는 체크의 느낌에 가깝습니다. “괜찮아 보인다”나 “모델이 자신 있어 한다”는 이 자리에 들어오지 않습니다.

Graph는 그런 루프들이 어떻게 붙는지를 그려 보는 방식입니다. 일을 한 덩어리로 맡기지 않고, 쪼개고, 각자 돌려 보고, 코드로 합치고, 정말 사람 판단이 필요한 지점에서만 멈춥니다. 원문에서는 이 역할을 나누는 노드 이름을 적어 두지만, 저는 이름을 외우는 쪽보다 “이 단계가 실패하면 어디까지 영향이 닿는가”를 먼저 떠올리게 되었습니다.

한 단계의 출력이 다음 단계의 입력으로 실제로 들어갈 때만 둘 사이에 선이 있습니다. 넘어가는 값을 이름으로 댈 수 없으면, 그 둘은 굳이 이어서 돌릴 일이 아닙니다. 아래 그림은 같은 일을 차례로 붙였을 때와, 필요 없는 선을 걷어 내고 나란히 돌릴 때를 이어서 보여 줍니다.

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

에이전트가 빠르다고 해서 모든 단계를 한꺼번에 밀어붙이면, 나중에 손을 대기 어려워집니다. 병렬로 둘 수 있는 일과 순서를 지켜야 하는 일을 나누고, 한 갈래의 실패가 전체로 번지지 않게 경계를 두는 그림이었습니다.

## 사람이 들어갈 자리

원문에서 가장 오래 남은 문장은, 사람이 자신감이 아니라 영향 범위로 개입 지점을 고르라는 말이었습니다. 모델이 얼마나 확신하는지는 잘 보이지 않습니다. 대신 한 번 잘못 들어가면 되돌리기 어려운 자리, 다른 사람이나 저장소에 흔적이 남는 자리는 비교적 분명합니다. 그런 자리에 게이트를 두고, 나머지는 루프가 스스로 통과하거나 다시 시도하게 두자는 이야기입니다.

그래서 제목처럼 정리하면 이렇습니다. 저는 모든 단계를 승인하는 사람이 아니라, 마지막에 남은 한 단계를 승인하는 쪽에 서는 것이 맞겠다는 생각이 들었습니다. 중간 과정을 덜 들여다보려면, 먼저 체크와 구조를 더 분명하게 적어 두어야 합니다. 감시가 줄어드는 것은 손을 놓는 일이 아니라, 들어갈 자리를 미리 정해 두는 일에 가깝습니다.

읽은 그대로 제 작업 방식에 적용해 본 기록은 아직 아닙니다. 다만 다음번에 에이전트에게 일을 맡길 때는, 화면을 보기 전에 “무엇을 통과 조건으로 둘지”와 “내가 마지막에 볼 단계는 어디인지”를 먼저 적어 보려고 합니다.

## 출처

- **원문**: Hanako(@hanakoxbt), “Loops and Graphs” — [https://x.com/hanakoxbt/status/2091515787366306154](https://x.com/hanakoxbt/status/2091515787366306154)
- **이 글의 성격**: 원문을 읽고 제 말로 정리한 블로그 글입니다. 원문 전체의 번역이 아니며, 정리 과정에서 생긴 오류는 이쪽의 몫입니다.
- **작성자**: 우빈(Srevil)
- **작성 도구**: Claude와 함께 작성했습니다.
- **다이어그램**: 우빈이 예전에 만든 HTML 가이드(`Loops-and-Graphs.html`)에서, 설명을 돕는 Loop·Graph 애니메이션만 가져와 이 글에 맞게 다듬었습니다.
