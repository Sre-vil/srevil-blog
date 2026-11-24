---
title: "클로드 코드 advisor 정리: Claude Code /advisor 원리와 켜는 법"
date: 2026-11-24 08:13:00 +0900
tags: [Claude Code, advisor, 슬래시 명령어, 기록]
description: 클로드 코드 advisor는 Claude가 작업 중 더 강한 모델에게 조언을 구하는 실험적 기능입니다. /advisor 원리, 켜는 법, 직접 실행한 로그 기반 비용 분배, opusplan 차이를 정리했습니다.
permalink: /posts/claude-code-advisor/
lang: ko
i18n_id: claude-code-advisor
advisor_anim: true
---

Claude Code를 쓰다 보면 모델 고르는 일이 은근히 피곤합니다. 비싼 모델을 계속 쓰자니 부담이고, 빠른 모델로 가자니 계획이 허술해질 것 같습니다. 그런 고민 끝에 공식 문서에서 클로드 코드 advisor, 즉 Claude Code `/advisor` 항목을 읽고 정리했고, 직접 한 번 실행해 로그도 확인했습니다.

이 글은 **공식 문서 내용**과 **맥북에서 직접 실행한 기록**으로 구성했습니다. 작성 기준은 **Claude Code 2.1.330, 실험적 기능**이고, 공식 문서도 이 기능의 동작과 요금, 제공 범위가 바뀔 수 있다고 적어 두었습니다. 직접 실행은 비대화형 `-p` 모드로 한 번 돌린 것이라, 대화형 터미널의 `Advising` 표시 같은 화면 동작은 문서 기준으로만 정리했고 그 경계는 해당 절에 표시해 두었습니다.

## 클로드 코드 advisor란 무엇인가

공식 문서 제목은 "Escalate hard decisions with the advisor tool"입니다. 풀어 쓰면 어려운 판단은 한 단계 위로 올리라는 뜻이고, 메인 모델에 더 강한 advisor 모델을 짝지어 두면 Claude가 작업 중 핵심 시점에 그 모델에게 자문한다는 기능입니다.

제 식으로 비유하면 이렇습니다. 평소엔 주니어 개발자가 코드를 짜다가, 설계 방향을 정할 때나 같은 에러에 계속 막힐 때만 시니어에게 화면을 통째로 보여 주고 의견을 듣는 모습입니다. 시니어가 옆에 앉아 있는 것이 아니라, 필요한 순간에만 부릅니다.

역할은 이렇게 나뉩니다.

- 사용자는 **어떤 모델을 advisor로 쓸지**를 정합니다.
- Claude가 **언제 부를지**를 정합니다.

Claude Code 슬래시 명령어로는 `/advisor`가 이 기능의 입구입니다. 인자 없이 치면 모델 선택기가 뜨고, `/advisor opus`처럼 바로 지정할 수도 있습니다.

## 동작 원리

공식 문서가 설명하는 흐름은 단순합니다.

1. 메인 모델이 작업을 진행합니다.
2. 접근 방식을 확정하기 전, 반복되는 오류에 막혔을 때, 작업 완료를 선언하기 전 같은 시점에 Claude가 advisor를 부릅니다.
3. advisor는 모든 도구 호출과 결과를 포함한 **전체 대화**를 받습니다.
4. advisor가 지침을 돌려주면 Claude가 그것을 반영해 작업을 이어 갑니다.

{::nomarkdown}
<figure class="adv-fig adv-flow" id="advFlow">
<div class="adv-fig-head"><span class="adv-fig-k"><b>그림 1</b> · advisor를 부르는 흐름</span><button class="adv-replay" type="button">다시 재생 ↻</button></div>
<svg viewBox="0 0 560 330" role="img" aria-label="메인 모델 Sonnet이 작업하는 선 위에 세 개의 결정 시점이 있고, 각 시점에서 전체 대화가 위쪽의 advisor Opus로 올라갔다가 지침이 되어 돌아오는 그림">
<rect class="abox" x="170" y="14" width="220" height="70" rx="16"/>
<text x="280" y="43" text-anchor="middle" class="mono muted" font-size="15">advisor</text>
<text x="280" y="70" text-anchor="middle" font-size="22" font-weight="800">Opus</text>
<text class="st ok" x="280" y="114" text-anchor="middle">작업 완료 · 호출 3번</text>
<path class="wire" d="M170 236 Q170 110 280 84"/>
<path class="wire" d="M320 236 Q320 110 280 84"/>
<path class="wire" d="M470 236 Q470 110 280 84"/>
<text x="30" y="214" font-size="20" font-weight="700" style="fill:#8a97ff">메인 · Sonnet</text>
<line class="track" x1="30" y1="250" x2="530" y2="250"/>
<line class="prog" x1="30" y1="250" x2="530" y2="250"/>
<rect class="cp done" x="161" y="241" width="18" height="18" transform="rotate(45 170 250)"/>
<rect class="cp done" x="311" y="241" width="18" height="18" transform="rotate(45 320 250)"/>
<rect class="cp done" x="461" y="241" width="18" height="18" transform="rotate(45 470 250)"/>
<text x="170" y="292" text-anchor="middle" font-size="19">접근 방식</text><text x="170" y="316" text-anchor="middle" font-size="19">확정 전</text>
<text x="320" y="292" text-anchor="middle" font-size="19">같은 오류에</text><text x="320" y="316" text-anchor="middle" font-size="19">막힐 때</text>
<text x="470" y="292" text-anchor="middle" font-size="19">완료</text><text x="470" y="316" text-anchor="middle" font-size="19">선언 전</text>
<circle class="runner" cx="530" cy="250" r="10"/>
<g class="pk pk-up" opacity="0"><rect x="-40" y="-16" width="80" height="32"/><text y="5" text-anchor="middle">전체 대화</text></g>
<g class="pk pk-dn" opacity="0"><rect x="-30" y="-16" width="60" height="32"/><text y="5" text-anchor="middle">지침</text></g>
</svg>
<figcaption class="adv-cap-live">세 시점은 규칙이 아니라 Claude가 부르는 <b>경향</b>입니다. 호출 횟수를 제한하거나 강제하는 설정은 없고, 사용자가 정하는 것은 <b>어떤 모델을 advisor로 쓸지</b>뿐입니다.</figcaption>
</figure>
{:/nomarkdown}

몇 가지는 처음 읽을 때 놓치기 쉬워서 따로 적어 둡니다.

**호출 시점은 규칙이 아니라 모델의 판단입니다.** 문서도 위의 세 시점을 부르는 "경향"이라고 설명하고, 호출 횟수를 제한하거나 강제하는 설정은 없다고 합니다. 더 자주 부르게 하고 싶으면 프롬프트에 `consult the advisor before you continue` 같은 문장을 쓰면 된다고 안내합니다.

**조언을 무조건 따르지는 않습니다.** Claude는 대체로 advisor의 지침을 따르지만, 추천받은 단계가 실패하거나 파일 내용이 조언과 모순되는 식으로 자기가 확인한 증거와 충돌하면 그대로 따르지 않고 충돌을 드러냅니다. 조언이 틀릴 수도 있다는 전제가 들어 있는 셈이라, 저는 이 부분이 마음에 들었습니다.

**서버 쪽에서 돌아갑니다.** Anthropic 인프라에서 실행되는 server-side 도구입니다. 서브에이전트도 설정된 advisor를 물려받고, 자기 모델에 대해 같은 조합 검사를 받습니다.

**advisor는 메인 모델과 같거나 더 높은 등급이어야 합니다.** 문서에 모델별 허용 조합 표가 있는데, 예를 들어 메인이 Sonnet 5.5라면 advisor는 Fable, Opus 5 이상, Sonnet 5.5가 됩니다. 메인보다 낮은 등급을 고르면 Claude Code가 advisor를 붙이지 않고, `/advisor` 출력과 알림으로 알려 줍니다. Haiku 4.5는 advisor를 호출할 수는 있어도 advisor 역할은 맡지 못합니다. 전체 표는 공식 문서에 있으니 그쪽을 보는 편이 정확합니다.

## 켜는 법

방법은 세 가지입니다.

| 방법 | 적용 범위 | 예시 |
| --- | --- | --- |
| `/advisor` 명령 | 세션 중 설정, 기본값으로 저장 | `/advisor opus` |
| `advisorModel` 설정 | 설정 파일에 지속 저장 | `{ "advisorModel": "opus" }` |
| `--advisor` 플래그 | 그 세션에만 적용 | `claude --advisor opus` |

공식 문서 기준으로 정리하면 이렇습니다.

- `/advisor`를 인자 없이 실행하면 쓸 수 있는 advisor 모델 선택기가 열립니다. 선택은 user settings의 `advisorModel`에 저장되어 다음 세션에도 유지됩니다.
- `--advisor` 플래그는 그 세션에서 저장된 `advisorModel` 대신 쓰이고, `claude --help`에는 표시되지 않습니다.
- 켜지면 `Advisor Tool (experimental) is on and may use more tokens · /advisor` 알림이 뜹니다.
- `-p` 비대화형 모드, Agent SDK, 데스크톱 앱, Remote Control처럼 터미널 선택기가 없는 환경에서도 `/advisor`가 동작하는데, 이때는 Claude Code v2.1.260 이상이 필요하다고 합니다.

끄는 방법도 둘로 나뉩니다.

- 그 순간만 끄기: `/advisor off`, 또는 선택기에서 **No advisor** 선택
- 도구 자체를 막기: 환경변수 `CLAUDE_CODE_DISABLE_ADVISOR_TOOL=1`. 이러면 `/advisor` 명령을 쓸 수 없고 저장된 `advisorModel`도 무시됩니다.

### 쓸 수 없는 환경

문서의 요구사항 절에서 걸리는 부분만 추렸습니다.

- Anthropic API, Claude Platform on AWS, Claude Models on Google Cloud(Anthropic managed)에서만 됩니다. 뒤의 둘은 v2.1.300 이상이 필요합니다.
- Amazon Bedrock, Google Cloud의 Agent Platform, Microsoft Foundry에서는 쓸 수 없습니다.
- 메인 모델은 Fable, Opus 4.6 이상, Sonnet 4.6 이상, Haiku 4.5, Haiku 5.5 중 하나여야 합니다.
- Claude Platform on AWS와 Google Cloud(Anthropic managed)가 아닌 경우에는 Anthropic에서 가져오는 feature flag가 필요해서, `DISABLE_TELEMETRY`처럼 이 조회를 끄는 변수가 있으면 동작하지 않을 수 있습니다.
- Fable은 Fable 접근 권한이 필요하고, 일부 플랜에서는 usage credits 청구에 대한 동의 절차가 있습니다.

## 실전 예시

공식 문서만 읽으면 감이 안 와서, 2.1.330에서 `-p` 비대화형 모드로 한 번 실행하고 스트림 로그를 확인했습니다. `claude --version`은 `2.1.330 (Claude Code)`로 나왔습니다.

### 실행한 명령

```bash
claude -p --model sonnet --advisor opus --output-format stream-json --verbose \
  "Please consult the advisor before you continue. For a static GitHub Pages blog where drafts are written locally by Claude Code and tracked in Notion, should we store the full markdown body in Notion or keep markdown files in git and store only metadata/links in Notion? Answer concisely in Korean (3-5 bullet points)."
```

메인은 `sonnet`(로그상 `claude-sonnet-5-5`), advisor는 `--advisor opus`(`claude-opus-5-5`)입니다. 프롬프트 첫 문장은 문서가 알려 준 `consult the advisor before you continue` 유도 문구를 응용했습니다. 질문은 정적 GitHub Pages 블로그 초안을 Notion에 통째로 둘지, git에 두고 Notion에는 메타데이터와 링크만 둘지였습니다.

### 스트림 로그에서 확인한 순서

로그는 다음 순서로 이어졌습니다.

1. `message`: Sonnet이 advisor 호출을 결정합니다.
2. `server_tool_use`: 이름이 `advisor`이고 `input`은 비어 있습니다. 호출 쪽이 대화를 따로 넘기지 않고 서버가 전체 대화를 읽는 구조와 맞아 보입니다.
3. `advisor_tool_result`: 내용 타입이 `advisor_redacted_result`이고 본문은 암호화된 `encrypted_content`로만 옵니다. 이 로그로는 advisor가 쓴 조언 원문을 읽을 수 없습니다.
4. `message`: Sonnet이 조언을 반영해 한국어 5개 항목으로 최종 답을 냅니다.

결과 이벤트는 `num_turns: 1`, `stop_reason: end_turn`, `terminal_reason: completed`였습니다. 한 번의 턴 안에서 advisor 호출이 끼어든 셈입니다.

### 답변 요지

아래는 advisor 조언 자체가 아니라, 이를 반영한 Sonnet의 최종 답변 요약입니다.

- **결론:** 본문 마크다운은 git에만 두고, Notion에는 메타데이터와 링크만 둡니다.
- **빌드 소스:** GitHub Pages는 repo에서 바로 빌드하고 Claude Code도 로컬 파일로 글을 씁니다. 본문을 Notion에 두면 발행 때마다 마크다운으로 내보내야 하고, 코드 블록, front matter, 중첩 목록이 깨질 수 있으며 Notion 호스팅 이미지 URL은 만료됩니다.
- **이력 관리:** git은 diff, 커밋 이력, PR 리뷰, 롤백을 줍니다.
- **Notion에 넣을 것:** 글마다 DB 행을 하나 만들고 제목, slug, 상태, 태그, 목표 일자, 파일 경로나 GitHub 링크, 발행 URL을 적습니다.
- **이중 보관 금지:** 원본은 git 한 곳으로 정하고, 필요하면 git에서 Notion으로 가는 읽기 전용 단방향 동기화만 씁니다.

### 소요 시간과 토큰·비용 분배

`duration_ms`는 약 16.6초(`duration_api_ms` 약 16.4초), 첫 토큰까지는 약 1.5초였습니다. 로그의 이벤트 시각상 advisor 호출부터 결과가 돌아오기까지 약 15초였으니, 전체 시간 대부분이 advisor 구간이었습니다.

결과 이벤트의 `iterations`는 호출이 세 단계로 나뉘었음을 보여 줍니다.

| 단계 | 모델 | 입력 | 출력 | 캐시 |
| --- | --- | --- | --- | --- |
| `message` (advisor 호출 결정) | claude-sonnet-5-5 | 2 | 26 | 읽기 11,842 / 생성 9,737 |
| `advisor_message` | claude-opus-5-5 | 23,161 | 936 | 없음 |
| `message` (최종 답변) | claude-sonnet-5-5 | 2 | 575 | 읽기 21,579 / 생성 541 |

- advisor인 Opus는 입력 약 2.3만 토큰을 캐시 없이 새로 처리했습니다. 문서가 말한 "advisor가 대화를 읽는 부분은 캐시되지 않는다"와 일치합니다.
- `modelUsage` 기준 비용은 Sonnet이 약 $0.050, Opus가 약 $0.111, 합계 약 $0.161입니다. 호출은 한 번뿐이었는데도 비용의 약 69%가 advisor 쪽이었습니다.

{::nomarkdown}
<figure class="adv-fig adv-run" id="advRun">
<div class="adv-fig-head"><span class="adv-fig-k"><b>그림 2</b> · 실행 한 번을 다시 재생</span><button class="adv-replay" type="button">다시 재생 ↻</button></div>
<div class="adv-clock"><span>경과</span><b data-clock>16.6</b><span>초 / 16.6초</span></div>
<div class="adv-timebar" aria-hidden="true">
<div class="seg" style="left:0;width:6%" data-s="0" data-e="1"><i></i></div>
<div class="seg a" style="left:6%;width:90.4%" data-s="1" data-e="16"><i></i><span>advisor · Opus ≈ 15초</span></div>
<div class="seg" style="left:96.4%;width:3.6%" data-s="16" data-e="16.6"><i></i></div>
</div>
<div class="adv-ticks" aria-hidden="true"><span>0초</span><span>16.6초</span></div>
<ol class="adv-log">
<li data-at="0.3"><span class="t">Sonnet</span><code>message</code><span class="d">advisor를 부르기로 결정 (출력 26토큰)</span></li>
<li class="a" data-at="1" data-busy="16"><span class="t">서버</span><code>server_tool_use</code><span class="d">name은 advisor, input은 비어 있음</span></li>
<li class="a" data-at="16"><span class="t">Opus</span><code>advisor_tool_result</code><span class="d">advisor_redacted_result <span class="lock">암호화된 본문</span></span></li>
<li data-at="16.6"><span class="t">Sonnet</span><code>message</code><span class="d">조언을 반영해 한국어 5개 항목으로 최종 답 (출력 575토큰)</span></li>
</ol>
<div class="adv-cost">
<div class="adv-cost-k"><span>비용 분배 · API 정가 환산</span><span>합계 ≈ $0.161</span></div>
<div class="adv-costbar"><i class="cm">Sonnet $0.050</i><i class="cs">Opus $0.111 · 69%</i></div>
</div>
<figcaption>위 로그를 시간 순서대로 다시 그렸습니다. 16.6초 중 약 15초가 advisor 구간이었고, Opus는 입력 23,161토큰을 캐시 없이 새로 처리했습니다. 앞뒤 Sonnet 구간(합계 약 1.6초)의 나눔은 대략으로 그렸고, 달러는 구독 요금제의 실제 청구액이 아닙니다.</figcaption>
</figure>
{:/nomarkdown}

주의할 점은 `modelUsage`의 각 항목에 붙은 `costBasis: "list"`입니다. 이는 실제 청구액이 아니라 **API 정가 기준으로 환산한 값**입니다. 구독 요금제에서는 이 금액이 청구되지 않고, 비용 절에서 인용한 대로 사용량이 플랜 한도에 합산됩니다. 그러니 이 숫자는 메인과 advisor의 상대적 무게를 보는 용도로 읽는 게 맞습니다.

짧은 실행 한 번이고 메인의 컨텍스트에 시스템 프롬프트와 도구 정의가 이미 약 2만 토큰 들어 있던 환경이라, 이 비율을 일반화하기는 어렵습니다. 대화가 길어질수록 advisor 한 번의 입력 비용이 커진다는 방향 정도만 읽어 두었습니다.

### 대화형 터미널 문서 기준 표시 방식

아래는 제가 `-p`로 확인한 내용이 아니라 **대화형 터미널을 기준으로 한 공식 문서의 설명**입니다. 비대화형 로그에서는 이런 줄 없이 위의 이벤트로만 보였습니다.

- Claude가 advisor를 부르면 transcript에 advisor 모델명과 함께 `Advising` 줄이 나타납니다.
- 결과가 돌아오면 그 줄이 세 가지 중 하나로 바뀝니다.
  - **Reviewed**: advisor가 대화를 검토했습니다. 읽을 수 있는 지침이 있으면 `Ctrl+O`로 봅니다.
  - **Declined**: `Advisor declined to advise on this request`가 표시됩니다. 이유를 밝혔다면 `Ctrl+O`로 읽습니다.
  - **Unavailable**: 호출이 실패한 경우이고 `Advisor unavailable (<error_code>)`가 표시됩니다.

문서에 나오는 프롬프트 예시는 이 한 줄입니다.

```text
consult the advisor before you continue
```

## 비용

요금은 말을 바꾸지 않고 공식 문서 문장을 그대로 인용하겠습니다.

> When Claude calls the advisor, the advisor model reads the conversation, so each call consumes tokens at the advisor model's rates in addition to your main model's usage.

> **API billing**: you pay the advisor model's input and output rates for advisor tokens

> **Subscription plans**: advisor usage counts toward your plan's usage limits, except that a Fable advisor bills to usage credits on plans where Fable usage does

> Claude calls the advisor at decision points rather than on every turn, so pairing a faster main model with a stronger advisor typically costs less than running the stronger model throughout.

> Advisor usage counts toward the session totals shown by `/usage`.

읽고 이해한 대로 덧붙이면, advisor를 부를 때마다 advisor 모델 단가의 토큰이 메인 모델 사용량에 **추가로** 듭니다. 싸지는 이유는 매 턴이 아니라 결정 시점에만 부르기 때문입니다. 그렇다고 공짜는 아니라서, 켜면 토큰이 더 쓰일 수 있다는 알림이 뜨는 겁니다.

프롬프트 캐시에 관해서는 문서에 두 가지가 적혀 있습니다.

- 세션 중에 advisor를 켜고 꺼도 메인 모델의 prompt cache는 무효화되지 않습니다. 모델을 바꾸는 것과 다른 점입니다.
- 반대로 advisor 모델이 대화를 읽는 부분은 캐시되지 않고, 호출할 때마다 전체 트랜스크립트를 새로 처리합니다. 대화가 길수록 한 번의 호출이 무거워진다는 뜻으로 읽었습니다.

{::nomarkdown}
<figure class="adv-fig adv-cache" id="advCache">
<div class="adv-fig-head"><span class="adv-fig-k"><b>그림 3</b> · advisor는 부를 때마다 처음부터 읽는다 (개념도)</span><button class="adv-replay" type="button">다시 재생 ↻</button></div>
<div class="row"><span class="rk">대화<br>턴 9개</span><div class="adv-blocks"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i class="new"></i></div></div>
<div class="row"><span class="rk">advisor<br>입력량</span><div class="adv-calls">
<div><div class="bar"><i style="--w:.3333"></i></div><span>1번째 · 3턴</span></div>
<div><div class="bar"><i style="--w:.6667"></i></div><span>2번째 · 6턴</span></div>
<div><div class="bar"><i style="--w:1"></i></div><span>3번째 · 9턴</span></div>
</div></div>
<div class="adv-legend"><span><i class="lc"></i>메인: 캐시로 재사용</span><span><i class="lm"></i>메인: 새로 처리</span><span><i class="ls"></i>advisor가 읽는 범위</span></div>
<figcaption>메인 모델은 앞부분을 prompt cache로 재사용하고 새 턴만 처리하지만, advisor는 호출할 때마다 <b>전체 트랜스크립트</b>를 새로 처리합니다. 그래서 같은 한 번의 호출이라도 대화가 길어질수록 입력이 커집니다. 블록 수는 설명용이며 실제 토큰 수가 아닙니다.</figcaption>
</figure>
{:/nomarkdown}

Fable advisor는 플랜에 따라 usage credits로 청구되는 점도 기억해 두면 좋습니다. 앞 절 실행 로그의 달러 금액은 API 정가 환산치(`costBasis: "list"`)이니, 구독에서의 실제 부담과는 구분해서 보세요.

## 쓸 때와 안 써도 될 때

문서가 말하는 기준은 이렇습니다.

**잘 맞는 경우**는 대부분의 턴이 단순 작업이지만 계획의 질이 결과를 좌우하는, 길고 여러 단계로 된 작업입니다. 문서가 든 예는 대규모 리팩터링, 오류가 반복되는 디버깅, Claude가 끝났다고 하기 전에 독립적으로 검증받고 싶은 작업입니다.

**효과가 작은 경우**는 계획할 것이 거의 없는 짧은 작업이나, 모든 턴에 가장 강한 모델이 필요한 작업입니다. 이럴 때는 메인 모델을 바꾸거나 `opusplan`, 서브에이전트를 쓰라고 안내합니다.

### opusplan 차이

검색해 보면 가장 헷갈리는 부분이 이것이라, 문서의 비교 표를 그대로 옮겨 정리합니다.

| 방식 | 강한 모델이 도는 때 | 시작하는 방법 |
| --- | --- | --- |
| advisor | 작업 중 결정 시점 | Claude가 조언이 필요할 때 호출 |
| `opusplan` | plan 모드 동안(`availableModels`가 허용할 때), 이후 실행은 Sonnet | 사용자가 plan 모드에 진입 |
| 모델을 지정한 서브에이전트 | 맡긴 하위 작업 전체 | Claude가 위임하거나 사용자가 호출 |
| `/model` | 다음 요청부터 | 사용자가 모델 전환 |

차이를 한 줄로 줄이면, `opusplan`은 **내가 plan 모드에 들어가면** 강한 모델이 계획을 맡고, advisor는 **Claude가 필요하다고 판단할 때** 강한 모델에게 묻는 방식입니다. 시작 버튼을 누르는 쪽이 다릅니다.

{::nomarkdown}
<figure class="adv-fig adv-cmp" id="advCmp">
<div class="adv-fig-head"><span class="adv-fig-k"><b>그림 4</b> · 강한 모델은 언제 도는가</span><button class="adv-replay" type="button">다시 재생 ↻</button></div>
<div class="row"><div class="rn">advisor<small>결정 시점에만 잠깐</small><span class="who c">Claude가 호출</span></div><div class="adv-cells"><i></i><i></i><i class="k"></i><i></i><i></i><i></i><i class="k"></i><i></i><i></i><i></i><i></i><i class="k"></i></div></div>
<div class="row"><div class="rn">opusplan<small>plan 모드 동안</small><span class="who">사용자가 진입</span></div><div class="adv-cells"><i class="s"></i><i class="s"></i><i class="s"></i><i class="s"></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
<div class="row"><div class="rn">서브에이전트<small>맡긴 하위 작업 전체</small><span class="who c">Claude·사용자</span></div><div class="adv-cells"><i></i><i></i><i></i><i></i><i></i><i class="s"></i><i class="s"></i><i class="s"></i><i class="s"></i><i></i><i></i><i></i></div></div>
<div class="row"><div class="rn">/model<small>다음 요청부터 계속</small><span class="who">사용자가 전환</span></div><div class="adv-cells"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i class="s"></i><i class="s"></i><i class="s"></i><i class="s"></i><i class="s"></i></div></div>
<div class="axis" aria-hidden="true"><span></span><span><span>작업 시작</span><span>시간(턴) →</span></span></div>
<div class="adv-legend"><span><i class="lm"></i>메인(빠른) 모델</span><span><i class="ls"></i>강한 모델</span><span><i class="lk"></i>advisor 호출</span></div>
<figcaption>한 칸이 한 턴입니다. advisor만 <b>Claude가 필요하다고 판단한 순간</b>에 강한 모델이 잠깐 끼어들고, 나머지는 사용자의 조작이나 위임으로 강한 모델이 도는 구간이 정해집니다. 칸의 위치와 길이는 예시이고, <code>/model</code>은 강한 모델로 바꿨다고 가정했습니다.</figcaption>
</figure>
{:/nomarkdown}

문서가 소개하는 대표 조합도 적어 둡니다.

| 조합 | 쓰임새 (문서 설명 요약) |
| --- | --- |
| Sonnet 메인 + Opus advisor | 일상 작업은 Sonnet, 계획과 애매한 실패, 완료 확인은 Opus |
| Haiku 메인 + Opus advisor | 가장 저렴한 메인 모델에 강한 계획. Haiku 단독보다는 비싸지만 메인을 Sonnet이나 Opus로 바꾸는 것보다는 저렴 |
| Opus 메인 + Opus advisor | 두 번째 Opus가 첫 번째를 검토. 비용보다 독립 검증이 중요한 작업 |
| Sonnet 메인 + Sonnet advisor | 일상적인 놓침을 잡는 저렴한 두 번째 의견 |

Fable 조합도 문서에 있지만 Fable 접근 권한이 있어야 해서 생략했습니다.

## FAQ

**Q. `/advisor`는 공식 기능인가요?**
네, 공식 문서가 있는 기능입니다. 다만 experimental로 표시돼 있고 동작, 요금, 제공 범위가 바뀔 수 있습니다. 공식 이름은 advisor tool이고 명령어는 `/advisor`입니다.

**Q. advisor를 부르는 횟수를 정할 수 있나요?**
호출 횟수를 제한하거나 강제하는 설정은 없습니다. 지시문에 쓰는 방식으로 더 자주 또는 덜 자주 부르도록 유도할 수는 있다고 합니다.

**Q. `/advisor`와 `opusplan`은 같은 건가요?**
다릅니다. `opusplan`은 plan 모드에서 Opus, 실행은 Sonnet이 맡습니다. advisor는 메인 모델이 일하는 도중 Claude가 필요할 때 강한 모델에게 조언을 구합니다. 위 비교 표를 참고하세요.

**Q. 메인 모델보다 약한 모델을 advisor로 골라도 되나요?**
안 됩니다. advisor는 메인 모델과 같거나 높은 등급이어야 하고, 낮으면 Claude Code가 붙이지 않고 알림을 보여 줍니다.

**Q. 구독 계정에서도 쓸 수 있나요?**
구독 계정과 API 과금 계정 모두 쓸 수 있습니다. 구독이면 advisor 사용량이 플랜 한도에 포함되고, Fable advisor는 usage credits로 청구되는 플랜이 있습니다. 로그에 찍히는 달러 금액은 API 정가 환산치입니다.

**Q. Bedrock에서 쓸 수 있나요?**
Amazon Bedrock, Google Cloud의 Agent Platform, Microsoft Foundry에서는 쓸 수 없다고 문서에 나와 있습니다.

**Q. 끄려면 어떻게 하나요?**
`/advisor off`로 끄고, 도구 자체를 막으려면 `CLAUDE_CODE_DISABLE_ADVISOR_TOOL=1`을 설정합니다.

**Q. advisor 조언 내용은 어디서 보나요?**
대화형 터미널 문서 기준으로는 transcript에 `Advising` 줄이 나타나고, 결과가 Reviewed나 Declined이면 `Ctrl+O`로 읽을 수 있습니다. 제가 돌린 `-p` 스트림 로그에서는 조언 원문이 암호화(`advisor_redacted_result`)되어 읽을 수 없었습니다.

## 마치며

정리하고 보니 advisor의 핵심은 "비싼 모델을 덜 쓰는 요령"보다 **판단이 중요한 순간에만 두 번째 의견을 붙이는 구조**에 가깝다고 느꼈습니다. 직접 돌려 보니 호출은 한 번이었는데도 시간과 비용 대부분이 advisor 쪽에 몰렸고, 그래서 짧고 단순한 작업에는 효과가 작다는 문서의 설명이 실감 났습니다. 길고 여러 단계로 된 작업에서 계획의 질이 중요할 때 꺼내 쓰기 좋아 보입니다. 실행 결과는 `-p` 모드로 한 번 돌린 기록이라, 대화형 화면 동작은 문서를 기준으로 읽어 주세요. 실험적 기능이라 내용이 바뀌면 이 글도 고치겠습니다.

참고: [Escalate hard decisions with the advisor tool (공식 문서)](https://code.claude.com/docs/en/advisor)
