---
title: "Loops & Graphs: Approve Only the Last Hard Step"
date: 2026-11-23 00:38:00 +0900
tags: [agents, Claude Code, notes]
description: Notes from reading Hanako's “Loops and Graphs,” down to the checks, the graph, and the approval point.
permalink: /en/posts/loops-and-graphs/
lg_guide: true
lang: en
i18n_id: loops-and-graphs
---

You don't need to watch every step an agent takes. <mark>A person only needs to approve the one step that is hardest to undo and has the largest blast radius.</mark> Quality in the middle comes from checks that can fail (the Loop) and from how the work is structured (the Graph).

I wrote this after reading Hanako (@hanakoxbt)'s “Loops and Graphs.” These are my notes, not a translation, and I unpacked the original into blocks you can paste into a coding agent.

Three points stand out.

- Write a check a program can pass or fail, and write it before the work starts.
- Connect two steps only when the output of one actually feeds the input of the next. Otherwise run them side by side.
- Step in where the blast radius is large. Leave the model's confidence score out of it.

## Write the passing condition first

A **Loop** is produce, check, fix, and repeat until the check goes green. The check has to be able to fail, and a program has to be able to decide pass or fail. That is why the check gets written before the work.

{::nomarkdown}
<div class="lg-guide" id="lgGuide">
  <figure class="lg-figure lg-reveal">
    <div class="lg-stage">
      <svg id="loopSvg" viewBox="0 0 520 440" role="img" aria-label="A loop of produce, check, fix, repeat. The first check is red; after a fix, the second check is green">
        <defs><linearGradient id="lg1" x1="0" x2="1"><stop offset="0" stop-color="#7fb2ef"/><stop offset="1" stop-color="#b794f4"/></linearGradient></defs>
        <circle class="lg-ring" cx="260" cy="220" r="160"/>
        <circle class="lg-ringP" id="ringP" cx="260" cy="220" r="160" stroke-dasharray="0 1006" transform="rotate(-90 260 220)"/>
        <g class="lg-st" id="stP" transform="translate(260 60)"><circle r="44"/><text class="lg-n-txt" y="0" style="fill:#f3f1ec">Produce</text></g>
        <g class="lg-st" id="stC" transform="translate(420 220)"><circle r="44"/><text class="lg-n-txt" y="0" style="fill:#f3f1ec">Check</text></g>
        <g class="lg-st" id="stF" transform="translate(260 380)"><circle r="44"/><text class="lg-n-txt" y="0" style="fill:#f3f1ec">Fix</text></g>
        <g class="lg-st" id="stR" transform="translate(100 220)"><circle r="44"/><text class="lg-n-txt" y="0" style="fill:#f3f1ec">Repeat</text></g>
        <text class="lg-center" x="260" y="205" font-size="14" fill="#a9a7b0">Current check</text>
        <text class="lg-center" id="loopCenter" x="260" y="235" font-size="26" font-weight="700">Waiting</text>
        <circle id="loopDot" r="8" cx="260" cy="60"/>
      </svg>
    </div>
    <figcaption class="lg-note"><span class="lg-status-pill" id="loopStatus">$ npm test → waiting</span></figcaption>
  </figure>
</div>
{:/nomarkdown}

The diagram runs one cycle: a failed check, a fix, then a pass. The center state flips from red to green.

Here is what counts as a check and what does not.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-grid lg-grid-2">
    <div class="lg-card is-ok">
      <p class="lg-k">GREEN</p>
      <p class="lg-h">A program can decide</p>
      <ul>
        <li>The test suite exits 0</li>
        <li>Every claim has a source (file:line)</li>
        <li>The diff touches only the files in the plan</li>
      </ul>
    </div>
    <div class="lg-card is-no">
      <p class="lg-k">NOT A CHECK</p>
      <p class="lg-h">This is a feeling</p>
      <ul>
        <li>“The result looks fine”</li>
        <li>“The model sounds sure”</li>
        <li>“There were no errors.” A clean run is not the same as a correct one</li>
        <li>Only asking another model to “review this.” That is two optimists agreeing</li>
      </ul>
    </div>
  </div>
</div>
{:/nomarkdown}

## Connect only what actually connects

A **Graph** decides which units of work exist and how they connect. A node is a bounded task with one input and one output. Two nodes get an edge only when the output of one actually becomes the input of the other. “And then” is not an edge.

Ask this of every arrow: does the next step actually read the previous output? If you cannot name the variable that crosses it, there is no edge, and the two steps can run in parallel.

In the diagram below, utils, handlers, and adapters start out in a chain. The two arrows with no variable crossing turn red and disappear, and three workers running together take one time unit instead of three.

{::nomarkdown}
<div class="lg-guide">
  <figure class="lg-figure lg-reveal">
    <div class="lg-stage lg-stage-col">
      <svg id="dagSvg" viewBox="0 0 780 320" role="img" aria-label="A diagram that turns a serial chain into a parallel graph by removing fake edges"></svg>
      <div class="lg-timebar">
        <div class="lg-row"><span>Time</span><div class="lg-bar" id="timeBar" style="width:100%"></div></div>
        <div class="lg-row"><span></span><small id="timeTxt">3 workers in sequence: 3 time units</small></div>
      </div>
    </div>
  </figure>
</div>
{:/nomarkdown}

## Draw the pipeline with four node types

The original draws every pipeline with four node types.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-grid lg-grid-4">
    <div class="lg-card">
      <p class="lg-k">Splitter</p>
      <p class="lg-h">Split</p>
      <p>Cut the work at the front. This is the most important decision. Cut by blast radius, not by folder.</p>
    </div>
    <div class="lg-card">
      <p class="lg-k">Worker</p>
      <p class="lg-h">Worker</p>
      <p>One unit, one point of view, its own context. Shared context makes the results converge. You pay four times and get one opinion.</p>
    </div>
    <div class="lg-card">
      <p class="lg-k">Code node</p>
      <p class="lg-h">Code</p>
      <p>Merges, sorts, dedupes, and before/after comparisons have one right answer. Code should do them, not the model.</p>
    </div>
    <div class="lg-card">
      <p class="lg-k">Gate</p>
      <p class="lg-h">Gate</p>
      <p>Pass the result, or send it back to the step that made it. Open the gate by blast radius, not by a confidence score.</p>
    </div>
  </div>
</div>
{:/nomarkdown}

{::nomarkdown}
<div class="lg-guide"><div class="lg-hint"><p>If you can describe the step without words like “judge, decide, evaluate, or summarize,” make it code, not a model.</p></div></div>
{:/nomarkdown}

Give each worker its own context. Do not run subtasks in the same conversation; launch a subagent for each.

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

## The Loop lives inside a node. The Graph lives between nodes.

Each node runs alone until its own check goes green. Nodes connect only through output that actually crosses.

{::nomarkdown}
<div class="lg-guide">
  <figure class="lg-figure lg-reveal">
    <div class="lg-stage">
      <svg viewBox="0 0 760 230" role="img" aria-label="A small loop inside each of three nodes, with graph edges between the nodes" style="max-width:760px">
        <defs>
          <marker id="lgArrBEn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7fb2ef"/></marker>
        </defs>
        <path d="M232 120H290" fill="none" stroke="#7fb2ef" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#lgArrBEn)"/>
        <path d="M472 120H530" fill="none" stroke="#7fb2ef" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#lgArrBEn)"/>
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
    <p class="lg-cap">The green arc is the loop inside a node. The dashed line is a graph edge between nodes.</p>
  </figure>
</div>
{:/nomarkdown}

## There are two ways back

Most setups only build the short path. You need the long path too, or the same mistake shows up on the next run.

The short path is a correction edge. The gate returns the failed unit to the step that made it. That fixes this run.

The long path is a learning edge. You extract constraints from accepted results and put them in the splitter's brief. That fixes every later run. Most setups skip this path.

{::nomarkdown}
<div class="lg-guide">
  <figure class="lg-figure lg-reveal">
    <div class="lg-stage">
      <svg viewBox="0 0 760 250" role="img" aria-label="Two return paths: a correction edge and a learning edge" style="max-width:760px">
        <defs>
          <marker id="lgArrFEn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#a9a7b0"/></marker>
          <marker id="lgArrCEn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#d97757"/></marker>
          <marker id="lgArrLEn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7fb2ef"/></marker>
        </defs>
        <g font-size="13" font-weight="600" text-anchor="middle">
          <rect x="20" y="88" width="140" height="54" rx="12" fill="#14131a" stroke="rgba(255,255,255,.16)"/>
          <text x="90" y="112" fill="#f3f1ec">Splitter</text>
          <text x="90" y="128" fill="#a9a7b0" font-size="11" font-weight="400">brief</text>
          <rect x="210" y="88" width="140" height="54" rx="12" fill="#14131a" stroke="rgba(255,255,255,.16)"/>
          <text x="280" y="112" fill="#f3f1ec">Worker</text>
          <text x="280" y="128" fill="#a9a7b0" font-size="11" font-weight="400">produce a unit</text>
          <rect x="400" y="88" width="140" height="54" rx="12" fill="#14131a" stroke="rgba(255,255,255,.16)"/>
          <text x="470" y="112" fill="#f3f1ec">Gate</text>
          <text x="470" y="128" fill="#a9a7b0" font-size="11" font-weight="400">pass / reject</text>
          <rect x="590" y="88" width="150" height="54" rx="12" fill="#14131a" stroke="rgba(48,209,88,.45)"/>
          <text x="665" y="112" fill="#f3f1ec">Accepted</text>
          <text x="665" y="128" fill="#a9a7b0" font-size="11" font-weight="400">accepted result</text>
        </g>
        <path d="M160 115H210" fill="none" stroke="#a9a7b0" stroke-width="1.6" marker-end="url(#lgArrFEn)"/>
        <path d="M350 115H400" fill="none" stroke="#a9a7b0" stroke-width="1.6" marker-end="url(#lgArrFEn)"/>
        <path d="M540 115H590" fill="none" stroke="#a9a7b0" stroke-width="1.6" marker-end="url(#lgArrFEn)"/>
        <path d="M430 142C430 190 330 190 330 142" fill="none" stroke="#d97757" stroke-width="1.8" marker-end="url(#lgArrCEn)"/>
        <text x="380" y="208" text-anchor="middle" fill="#d97757" font-size="11">correction edge · fixes this run</text>
        <path d="M665 88C665 28 90 28 90 88" fill="none" stroke="#7fb2ef" stroke-width="1.8" marker-end="url(#lgArrLEn)"/>
        <text x="380" y="22" text-anchor="middle" fill="#7fb2ef" font-size="11">learning edge · fixes later runs</text>
      </svg>
    </div>
  </figure>
</div>
{:/nomarkdown}

Say the utils slice ports and goes green on the first pass. From that you derive a constraint, that adapters must preserve keyword args exactly, and it goes into the splitter's brief for every later slice.

```
ACCEPTED   utils slice ported, green on first pass
DERIVED    adapters preserve keyword args exactly
LANDS IN   the splitter's brief for every later slice
```

In Claude Code, you can append the DERIVED line to the “Learned constraints” section of CLAUDE.md.

## Return only the failed unit

If one of four units fails, send back that one. Send the whole batch back, and the three that already passed get rewritten differently, so the results stop converging.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-slices">
    <div class="lg-slice"><span>utils slice 1</span><span>→ </span></div>
    <div class="lg-slice is-back"><span>handlers slice 2</span><span>GATE <small>retry 0 / 3</small></span></div>
    <div class="lg-slice"><span>adapters slice 3</span><span>→ </span></div>
    <div class="lg-slice"><span>models slice 4</span><span>→ </span></div>
  </div>
  <p class="lg-cap">The gate sends only the failed handlers unit back to the step that made it. The other three stay as they are.</p>
</div>
{:/nomarkdown}

When you send it back, send five lines with it.

```
UNIT      handlers slice
VERDICT   red
REASON    test_auth_redirect failed
EVIDENCE  expected 302, got 200, handlers/auth.py:88
SCOPE     fix this file only, do not touch other slices
```

Without SCOPE, the fix spreads. You end up with a large diff nobody reviewed.

Retry at most three times. If a unit fails three times, the unit is not the problem; the split is. That is a planning problem, so escalate it to a human.

## Step in only where the blast radius is large

Pick the intervention point by blast radius. Even if the model's score is high, do not auto-pass work that is hard to undo.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-grid lg-grid-3">
    <div class="lg-card is-ok">
      <p class="lg-k">OPEN</p>
      <p class="lg-h">Easy to undo, and local</p>
      <p>These can pass automatically.</p>
      <p class="lg-ex">Copy changes, tests, a covered independent function</p>
    </div>
    <div class="lg-card ">
      <p class="lg-k">GATED</p>
      <p class="lg-h">Easy to undo, but wide</p>
      <p>Pass only after a deterministic check and a clean run history.</p>
      <p class="lg-ex">Shared utils, a new schema, code with many call sites</p>
    </div>
    <div class="lg-card is-closed">
      <p class="lg-k">CLOSED</p>
      <p class="lg-h">Hard to undo</p>
      <p>A human approves these, regardless of score.</p>
      <p class="lg-ex">Migrations, deletions, production data, money movement</p>
    </div>
  </div>
</div>
{:/nomarkdown}

This is the order of evidence a gate should trust.

{::nomarkdown}
<div class="lg-guide">
  <p class="lg-cap" style="text-align:left;margin-bottom:10px">What a gate should trust, in order</p>
  <div class="lg-prio">
    <div class="lg-pr"><b>1</b><span>Deterministic results (tests, and the like)</span></div>
    <div class="lg-pr"><b>2</b><span>The path of this run</span></div>
    <div class="lg-pr"><b>3</b><span>How often this node has been rolled back</span></div>
    <div class="lg-pr"><b>4</b><span>The model's self-evaluation (last)</span></div>
  </div>
</div>
{:/nomarkdown}

## Blocks you can paste today

These are reconstructed from the examples in the original, so you can paste them into a coding agent.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-tk">
    <div class="lg-tk-head"><div><p class="lg-h">CLAUDE.md rules block</p><p>Paste this into the project-root CLAUDE.md, or into ~/.claude/CLAUDE.md.</p></div><button type="button" class="lg-copy" data-copy="tpl-claude">Copy</button></div>
    <pre class="lg-pre" id="tpl-claude">## Agent working rules (Loop + Graph)
Goal: I do not review intermediate results. I approve only the step that is hardest to undo and has the largest blast radius.

1. Write the check first
   - Before work starts, show a GREEN list a program can pass or fail.
     e.g. tests exit 0 / every claim has a file:line citation / the diff touches only the planned files
   - &quot;Looks fine&quot;, &quot;the model is confident&quot;, &quot;no errors&quot;, &quot;another model reviewed it&quot; are not checks.
   - Produce, check, and fix until GREEN.

2. Edges are real data flow only
   - For every arrow, name the variable that crosses it.
   - If you cannot name it, it is not an edge → run the steps in parallel.
   - Parallel work runs as subagents, each in its own context.

3. Do deterministic work in code
   - Merging, sorting, deduping, and before/after diffs are scripts, not the model.
   - If you can describe the step without &quot;judge / decide / evaluate / summarize&quot;, it is code.

4. Split by blast radius
   - Cut the work by blast radius, not by folder.

5. Return only the failed unit
   - Do not rewrite the whole batch. Retry the failed unit in this form:
     UNIT / VERDICT / REASON / EVIDENCE / SCOPE
   - Do not touch files outside SCOPE.
   - Maximum 3 attempts. After 3 failures, stop, propose a new split, and report to me.

6. Open gates by blast radius
   - Easy to undo and local (copy, tests, a covered independent function) → proceed automatically
   - Easy to undo but wide (shared utils, a new schema, code with many call sites) → only after a deterministic check and a clean run history
   - Hard to undo (migrations, deletions, production data, money movement) → stop and ask for approval, regardless of score
   - Evidence order: deterministic results → this run&#x27;s path → past rollback rate → self-evaluation (last)

7. Keep what you learned
   - Add each confirmed constraint from accepted results to &quot;Learned constraints&quot; below, and use them in later splits.

## Learned constraints
- (example) adapters must preserve keyword args exactly</pre>
  </div>
  <div class="lg-tk">
    <div class="lg-tk-head"><div><p class="lg-h">Start-of-task prompt</p><p>Send this as the first message on a new task, so the agent draws GREEN conditions and the graph first.</p></div><button type="button" class="lg-copy" data-copy="tpl-start">Copy</button></div>
    <pre class="lg-pre" id="tpl-start">Task: &lt;what to do&gt;

Before writing code, show me these five things. Start only after I confirm.

1. GREEN conditions
   3–5 completion checks a program can decide.
   (e.g. `npm test` exit 0 / the diff changes only the file list below / every claim has a file:line citation)
   Do not write &quot;looks fine&quot; or &quot;no errors&quot;.

2. Split (Splitter)
   The list of work units. Split by blast radius, not by folder,
   and mark each unit [local / wide / hard to undo].

3. Edges
   For every arrow between units, the variable name that crosses it.
   If there is no name, mark it &quot;parallel&quot; and run it as a separate subagent.

4. Code nodes
   Steps a script should handle, such as merge, sort, dedupe, or compare.

5. Approval point
   The single step I must approve (the one that is hardest to undo and has the largest blast radius).
   If any other step is GREEN, continue without asking.</pre>
  </div>
  <div class="lg-tk">
    <div class="lg-tk-head"><div><p class="lg-h">Reject / retry template</p><p>Fill this in when a result fails. Use the same form with a subagent.</p></div><button type="button" class="lg-copy" data-copy="tpl-return">Copy</button></div>
    <pre class="lg-pre" id="tpl-return">UNIT      &lt;one failed unit. e.g. handlers slice&gt;
VERDICT   red
REASON    &lt;the check that failed. e.g. test_auth_redirect failed&gt;
EVIDENCE  &lt;expected vs actual, file:line. e.g. expected 302, got 200, handlers/auth.py:88&gt;
SCOPE     Fix this file only. Do not touch other units.
ATTEMPT   &lt;n&gt; / 3

Rule: if the third attempt also fails, stop fixing.
Instead, report what is wrong in the split.
If it passes, extract one confirmed constraint from this fix and add it to CLAUDE.md &quot;Learned constraints&quot;.</pre>
  </div>
  <div class="lg-tk">
    <div class="lg-tk-head"><div><p class="lg-h">Pipeline checklist</p><p>Checks are stored only in this browser.</p></div>
      <button type="button" class="lg-linkbtn" data-cl-reset>Reset</button>
    </div>
    <div class="lg-cl-meta"><div class="lg-cl-bar"><i data-cl-bar></i></div><span data-cl-count></span></div>
    <ul class="lg-check" data-lg-checklist>
      <li><label><input type="checkbox"><span>Every step has a GREEN condition a program can decide<small>Exclude “looks fine / feels confident / no errors”</small></span></label></li>
      <li><label><input type="checkbox"><span>No check that is only “ask another model to review”<small>Agreement between two optimists is not a check</small></span></label></li>
      <li><label><input type="checkbox"><span>The check is written before the work starts</span></label></li>
      <li><label><input type="checkbox"><span>Every arrow has a named variable that crosses it<small>If you cannot name it, drop the edge and run in parallel</small></span></label></li>
      <li><label><input type="checkbox"><span>Workers do not share context<small>Each subagent gets its own context</small></span></label></li>
      <li><label><input type="checkbox"><span>Deterministic transforms (merge, sort, dedupe, diff) are done in code<small>If you can describe it without “judge, decide, evaluate, summarize”, it is code</small></span></label></li>
      <li><label><input type="checkbox"><span>The splitter cuts by blast radius, not by folder</span></label></li>
      <li><label><input type="checkbox"><span>On failure, only the failed unit is returned, not the whole batch</span></label></li>
      <li><label><input type="checkbox"><span>Return messages include UNIT / VERDICT / REASON / EVIDENCE / SCOPE<small>Without SCOPE, the diff spreads</small></span></label></li>
      <li><label><input type="checkbox"><span>There is a retry cap (3) and a path to a human after that<small>3 failures means a planning problem</small></span></label></li>
      <li><label><input type="checkbox"><span>Hard-to-undo work (migrations, deletions, production data, money) needs human approval, regardless of score</span></label></li>
      <li><label><input type="checkbox"><span>Gate evidence goes: deterministic result → run path → rollback history → self-evaluation</span></label></li>
      <li><label><input type="checkbox"><span>A learning edge extracts constraints from accepted results into the splitter brief<small>CLAUDE.md “Learned constraints”</small></span></label></li>
      <li><label><input type="checkbox"><span>A human looks at exactly one point<small>Approve the merge, or choose which fix to ship</small></span></label></li>
    </ul>
  </div>
</div>
{:/nomarkdown}

## Start in this order

Pick one recurring task. Draw a splitter, the lanes, a merge, one gate, and one return edge. Then build them in this order.

{::nomarkdown}
<div class="lg-guide">
  <div class="lg-steps">
    <div class="lg-step"><div class="lg-dot">1</div><div><p class="lg-h">The gate first</p><p>Decide what counts as GREEN, which lanes can pass on their own, and which ones a person sees.</p></div></div>
    <div class="lg-step"><div class="lg-dot">2</div><div><p class="lg-h">Split the lanes</p><p>Cut by blast radius. If no value crosses between two steps, put them in parallel lanes.</p></div></div>
    <div class="lg-step"><div class="lg-dot">3</div><div><p class="lg-h">The learning edge last</p><p>You need accepted results before you can extract constraints. When you have them, put them in the splitter brief (CLAUDE.md).</p></div></div>
    <div class="lg-step"><div class="lg-dot">4</div><div><p class="lg-h">A human at one point only</p><p>Approve the merge, or choose which fix to ship. That is the one job.</p></div></div>
  </div>
</div>
{:/nomarkdown}

Next time I give an agent a task, I want to write two lines before I watch the screen.

<aside class="takeaway">
<p>What counts as a pass, and which step I'll look at last.</p>
</aside>

I haven't run my own work this way yet. These are notes from reading, not a field report.

## Sources

- Original: Hanako (@hanakoxbt), “Loops and Graphs,” [https://x.com/hanakoxbt/status/2091515787366306154](https://x.com/hanakoxbt/status/2091515787366306154)
- About this post: written in my own words after reading the original. It is not a full translation, and any mistakes in the retelling are mine.
- Author: Woobin (Srevil)
- Written with: Claude
- Diagrams: the Loop and Graph animations, plus the extra figures and templates, are adapted from an earlier HTML guide of mine (`Loops-and-Graphs.html`), trimmed to what helps this post.
