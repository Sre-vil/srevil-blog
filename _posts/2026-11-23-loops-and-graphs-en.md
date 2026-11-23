---
title: "Loops & Graphs: Approve Only the Last Hard Step"
date: 2026-11-23 00:38:00 +0900
tags: [agents, Claude Code, notes]
description: Notes from reading Hanako's “Loops and Graphs.” The useful place for a human is the step that's hard to undo.
permalink: /en/posts/loops-and-graphs/
lg_guide: true
lang: en
i18n_id: loops-and-graphs
---

You don't need to watch every step an agent takes. The useful place for a human is the step that's hard to undo, and expensive if it goes wrong. Watching the middle of the run usually means that place was never chosen in advance.

I wrote this after reading Hanako (@hanakoxbt)'s “Loops and Graphs.” These are my notes, not a translation. Three points stuck.

- Write a check a program can pass or fail, and write it before the work starts.
- Connect two steps only when output actually feeds the next input. Otherwise run them side by side.
- Step in where the blast radius is large. A model's confidence is hard to see, and a poor guide.

## Write the passing condition first

Even after I hand work to an agent, I stay in front of the screen. I follow the scroll while tokens come out. If an intermediate result looks off, I jump in.

The essay splits that habit into a Loop and a Graph. A Loop is produce, check, fix, and repeat until the check goes green. If the check is a matter of taste, the loop never settles. It has to be something a program can decide. Write that condition first, and the agent can run against it. I don't have to read every turn.

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

The diagram runs one cycle: a failed check, a fix, then a pass. The center state flips from red to green. “Looks fine” and “the model sounds sure” don't belong there.

## Connect only what actually connects

A Graph is how those loops attach. Don't hand over the job as one blob. Split it, run the pieces, join them in code. The original names a few node types. I found myself thinking less about the names, and more about how far a failure would spread.

There's an edge between two steps only when the output of one actually becomes the input of the next. If you can't name the value that crosses the boundary, they don't need to run in sequence. The diagram below shows the same work first as a chain, then with the extra lines removed so the workers can run together.

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

If everything is pushed through at once because the agent is fast, the mess is harder to unwind later. Separate the work that must stay in order from the work that can run in parallel. Put a boundary around a branch so one failure doesn't take the rest with it.

## Step in where the blast radius is large

The line that stayed with me is this: pick the intervention point by blast radius. I can't see how confident the model really is. I can usually see the step that's hard to undo, or that leaves a mark in a repo other people use. That's where a gate belongs. The rest can pass or retry on its own.

Next time I give an agent a task, I want to write two lines before I watch the screen: what counts as a pass, and which step I'll look at last. I haven't run my own work this way yet. These are notes from reading, not a field report.

## Sources

- **Original**: Hanako (@hanakoxbt), “Loops and Graphs” — [https://x.com/hanakoxbt/status/2091515787366306154](https://x.com/hanakoxbt/status/2091515787366306154)
- **About this post**: A blog post written in my own words after reading the original. It is not a full translation. Any mistakes in the retelling are mine.
- **Author**: Woobin (Srevil)
- **Written with**: Claude
- **Diagrams**: The Loop and Graph animations are adapted from an earlier HTML guide of mine (`Loops-and-Graphs.html`), trimmed to what helps this post.
