# AGENTS.md - Music Theory & Synthesis Module for Strudel

This guide is designed to act as a Music Theory & Synthesis Module for AI agents.
It bridges abstract electronic music concepts to executable Strudel code.

## Continuous learning protocol
- Treat Strudel workshop/docs as canonical reference and user examples as style targets.
- On each substantial music request:
  1. identify target vibe/genre constraints,
  2. map to executable Strudel primitives,
  3. map each musical layer to a visual reaction channel.
- When user provides a good example track, extract and store:
  - rhythm grammar (kick/snare/hat logic),
  - harmonic grammar (chord or scale strategy),
  - modulation grammar (filter, delay, random/probability),
  - arrangement grammar (masking, section movement).
- Prefer small composable building blocks over one monolithic pattern.

## Upstream docs map (cloned locally)
Upstream clone location:
- `strudel-upstream/` (repo root relative)

Primary docs to consult first:
- `strudel-upstream/website/src/pages/workshop/getting-started.mdx`
- `strudel-upstream/website/src/pages/learn/mini-notation.mdx`
- `strudel-upstream/website/src/pages/understand/cycles.mdx`
- `strudel-upstream/website/src/pages/learn/synths.mdx`
- `strudel-upstream/website/src/pages/recipes/recipes.mdx`
- `strudel-upstream/website/src/pages/technical-manual/repl.mdx`
- `strudel-upstream/website/src/pages/technical-manual/internals.mdx`

Docs-first extraction checklist:
- Validate tempo API variants (`setcps`, `setcpm`, `.cpm`, `cps`) against actual runtime.
- Prefer idioms shown in workshop/recipes before inventing custom syntax.
- For event-reactive visuals, use pattern/runtime trigger semantics from technical-manual.
- If example snippets use unavailable functions in current runtime, provide compatibility fallback.

## Core framing
- Respect genre constraints and timbre choices.
- Treat Strudel music as continuous time functions, not static clips.
- Build songs as layered loops with independent musical roles.

## Runtime compatibility notes
- Strudel APIs can differ by runtime/version. Always verify availability before using.
- Tempo helpers:
  - prefer `.cpm(...)` on patterns for stable compatibility,
  - if using global tempo controls, check whether `setcps` or `cps` exists first.
- Audio startup in browsers:
  - audio must be unlocked on direct user gesture,
  - avoid blocking startup on potentially hanging init helpers.

## Part 1: Terminology

| Term | Definition | Strudel Equivalent |
| :--- | :--- | :--- |
| BPM | Beats Per Minute. Track speed. | `.cpm(120)` |
| Four-on-the-Floor | Kick on every beat (1,2,3,4). | `s("bd*4")` |
| Breakbeat | Syncopated, non-straight drum pattern. | `s("bd sd ~ bd")` |
| Euclidean Rhythm | Evenly distribute hits over steps. | `s("bd(3,8)")` |
| Filter | Remove frequency ranges (LPF/HPF). | `.lpf(500)`, `.hpf(1000)` |
| ADSR | Envelope shape of note onset/release. | `.attack(0.1).release(0.5)` |

## Part 2: Mini-Notation
- `"bd sd"` = bass drum then snare
- `"bd sd hh cp"` = four equally spaced events
- `"bd ~"` = drum then rest
- `"[bd sd] hh"` = grouped hit then hat
- `"<bd sd>"` = alternate each cycle

## Part 3: Genre recipes

### House (The Jack)
- Vibe: groovy, soulful, danceable
- Rules: 120-128 BPM, 4-on-the-floor, offbeat hats

```javascript
stack(
  s("bd*4").bank("RolandTR909"),
  s("~ oh").bank("RolandTR909"),
  s("~ cp").bank("RolandTR909"),
  note("c3m7 f3m7").s("superpiano").lpf(1500).room(1)
).cpm(124)
```

### Techno (The Rumble)
- Vibe: industrial, repetitive, hypnotic
- Rules: 130-145 BPM, timbre/texture focus

```javascript
stack(
  s("bd*4").shape(0.8).lpf(800),
  s("hh*16").gain(range(.2, .8, sine.slow(4))),
  note("c2(3,8) dis2(5,16)").s("sawtooth").lpf(sine.range(100, 3000).slow(8)).resonance(10)
).cpm(135)
```

### Drum & Bass / Jungle (The Break)
- Vibe: fast, energetic, syncopated
- Rules: 170-175 BPM, chopped breaks, deep bass

```javascript
stack(
  s("amen").chop(8).slow(2),
  note("c1 ~ ~ <f1 g1>").s("sawtooth").lpf(400).distort(0.5).gain(1.2)
).cpm(174)
```

### Ambient / IDM (The Texture)
- Vibe: spacey, generative, non-linear
- Rules: long release, heavy reverb, slow motion

```javascript
note("0 1 2 3 4".scramble(8))
  .scale("C:minorPentatonic")
  .s("triangle")
  .slow(4)
  .room(3)
  .delay(0.8)
  .lpf(sine.range(200, 1000).slow(10))
```

## Part 4: Make it feel good
- Humanization: avoid static gain
  - better: `.gain(range(0.6, 0.9, rand))`
- Polymeter: layer different pattern lengths
  - `stack(s("bd*4"), s("hh*5"))`
- Conditional variation: probabilistic events
  - use optional/sometimes patterns

## Master template
```javascript
let bpm = 128;

stack(
  s("bd(3,8) [~ sd]").bank("RolandTR808").shape(0.5),
  note("c1(3,8) . <c1 f1>").s("sawtooth").lpf(500),
  note("c3 m7").arp("updown").s("square").delay(0.5)
).cpm(bpm)
```

## Visual mapping policy for this project
- drums -> impact/pulse/rotation
- bass -> mass/scale/depth movement
- lead/chords -> color and ornament motion
- fx/noise/swoosh -> transitions, sweeps, flashes, overlays

Do not collapse all tracks into one visual trigger unless explicitly requested.

## Example intake template (when user shares a track)
- `Reference name`:
- `Source URL`:
- `What sounds good`:
- `Genre guess + tempo range`:
- `Core layers detected`:
- `Strudel techniques detected`:
- `Visual mapping ideas`:
- `What to prototype first`:
