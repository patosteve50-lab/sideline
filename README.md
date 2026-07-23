# Sideline

The tool that tells independent musicians when NOT to spend.

## The Problem

Independent artists waste limited money on moves that don't work at their stage. A bedroom artist with 200 monthly listeners books a $400 music video shoot. A rising artist with 2,000 listeners hires a publicist before they have a story worth pitching. An established artist with 15,000 listeners runs paid ads with no way to capture the audience they're buying.

Every existing AI tool helps them do MORE. ChatGPT will enthusiastically write you a treatment for that $400 video. Claude will draft the publicist pitch. None of them tell you to stop. General chat assistants are trained to be agreeable — they'll help you make an expensive mistake with confidence and a smile.

This is the gap Sideline fills. It's the first creative decision partner built to refuse.

## What Sideline Does Differently

Sideline operates in three steps:

**ASSESS** — Evaluate the planned move against the artist's stage (monthly listeners, budget, audience capture status). The rule engine checks 14 encoded patterns across budget allocation, release strategy, and promotional tactics.

**BLOCK** — If the move matches a known failure pattern, Sideline blocks it and shows the arithmetic. Not vague advice — explicit numbers. "At 250 monthly listeners, the hard budget cap is $150 per release. Your planned spend of $300 exceeds this by $150. To break even on the extra $150 at typical per-stream value (~$0.01), you'd need 15,000 new listeners — a 6,000% audience increase." The math makes the refusal undeniable.

**REDIRECT** — Then Sideline generates the creative approach that works at that stage. Not a lecture, not a link to a blog post — the actual creative work. A shot-by-shot treatment for a $75 smartphone video. A 3-month PR strategy with realistic placement expectations. A budget breakdown that prioritizes audience capture over vanity metrics.

The product thesis is subtraction, not generation. Sideline expands what an artist can execute by removing the moves that would bankrupt them, then building the better alternative.

## Architecture

Sideline separates decision logic from generation across three layers:

**Rule Engine** — 14 rules encoded as inspectable code, each with a trigger condition, block reason, and redirect specification. The rules are deterministic: given the same inputs, they always produce the same verdict. No prompts, no LLM judgment calls. The decision logic is code you can read, test, and trust. 71 passing tests validate the engine's behavior.

**Stage Model** — Four stages (Bedroom, Rising, Established, Breakout) determined by monthly-listener thresholds: 0-500, 500-5K, 5K-25K, 25K+. Each stage has different budget caps, risk tolerances, and strategic priorities. The stage calculation is a pure function of listener count.

**Generation Layer** — IBM Granite 3.3-8B (via Replicate API) generates the creative redirect and explains blocks in natural language. Granite NEVER decides whether to block — the engine does that. Granite only explains and creates. It takes the rule's redirect specification (prompt, output format, constraints) and produces the creative work: treatments, shot lists, budget breakdowns, release timelines.

The flow: artist inputs profile and planned move → engine evaluates against rules → verdict + arithmetic (instant, deterministic) → Granite streams the creative alternative (async, generative). The refusal is code. The redirect is AI.

## How IBM Bob Was Used

Bob Shell (the Bob CLI) was the primary development tool for the entire build. Architecture planning happened in Plan mode, where Bob helped structure the rule engine's separation of concerns and the three-layer design. The rule engine itself — 14 rules with trigger/block/redirect structure, the stage calculator, the evaluator — was built through Bob's Code mode, with Bob writing the tests alongside the implementation. The Granite client integration, including async prediction polling and mock fallback, was Bob-assisted. The Express server and the web UI (HTML/CSS/JS with progressive reveal and streaming generation) were built through Bob's iterative code/test cycle.

Bob wrote git provenance notes on commits, documenting the reasoning behind architectural decisions. The tool's ability to switch between Ask (research), Plan (design), and Code (implementation) modes made it possible to build a complete working prototype in a compressed timeline without sacrificing code quality or test coverage.

## On the Rules

The thresholds and heuristics encoded in Sideline's rules are a starting point drawn from documented creator-economy patterns and independent-artist experience, not clinical data. The arithmetic in each block is computed from the artist's own inputs — their listener count, their planned budget, typical per-stream value (~$0.01). The math is real. The thresholds (e.g., $150 cap for Bedroom stage, 3-month minimum for PR retainers) are informed estimates, not gospel.

This is a strength, not a weakness. The rules are code. They can be inspected, debated, and updated as better data emerges. The system is designed to be wrong in a useful way: it blocks moves that are statistically unlikely to work, then generates the alternative that has a better shot. An artist can override the block if they have information the system doesn't. But they can't ignore the arithmetic.

## Challenge Fit

The IBM AI Builders Challenge asks: how can AI be a creative partner in the creative industries? Sideline answers by reframing the question. Most AI tools in music are content generators — write lyrics, produce beats, master tracks. Sideline is a creative partner that expands what an artist can actually execute by removing the moves that would bankrupt them.

The creative constraint is the budget. The creative opportunity is what you can do within it. Sideline doesn't just tell you what not to do — it generates the creative work that fits your real constraints. A bedroom artist doesn't need a $400 video. They need a shot list for a $75 smartphone shoot that turns their constraints into an aesthetic. That's the redirect. That's the partnership.

AI as a creative partner means knowing when to say no, then building the yes that works.

## Running It

### Setup

```bash
git clone <repository-url>
cd sideline
npm install
```

### Environment

Set your Replicate API token (optional — the system falls back to mock generation if not set):

```bash
export REPLICATE_API_TOKEN=your_token_here
```

### Web Interface

Start the server (runs on port 3000):

```bash
npm start
```

Open `http://localhost:3000` in your browser. The interface is prefilled with a demo scenario (bedroom artist, $300 video at 250 listeners). Click "Assess Move" to see the three-step sequence: verdict → block reason with arithmetic → creative redirect.

### CLI Demos

Run individual scenarios from the command line:

```bash
npm run demo:bedroom-video    # Bedroom artist with expensive video
npm run demo:local-video      # Rising artist with expensive video  
npm run demo:regional-pr      # Established artist with short PR retainer
npm run demo:breaking-high    # Breakout artist with high budget
```

Add `--mock` flag to force mock generation (ignore API token):

```bash
npm run assess bedroom-video -- --mock
```

### Tests

Run the test suite (71 tests across rule engine, stage calculator, and evaluator):

```bash
npm test
```

## Technical Stack

- **Engine**: Node.js, pure functions, deterministic rule evaluation
- **Generation**: IBM Granite 3.3-8B via Replicate API
- **Web**: Express server, vanilla HTML/CSS/JS (no framework)
- **Tests**: Jest with 71 passing tests

## License

MIT
