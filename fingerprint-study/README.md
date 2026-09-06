# One button, six attempts

A static case study comparing six source-blind GPT-6 Astra reconstructions of @unrootdesign’s fingerprint button from the same capture bundle. Open `index.html` through any static server, or navigate here from the tiiny-stuff hub.

Original design: https://x.com/unrootdesign/status/2095546630313304351

## Contents

- `variants/`: the six final HTML artifacts, copied byte for byte. Do not silently fix these; they are the experimental outputs.
- `reference/`: supplied capture stills, storyboard and detail contact sheets. There is **no original video** in this export. The page links to the original post and labels stills explicitly.
- `review/`: screenshots made after the original runs, at matched desktop/mobile viewports. These are separated from original-run test claims.
- `study-data.json`: sanitized provenance, first-turn durations, artifact hashes, public progress excerpts, editorial process summaries and limitations. No raw session files, private reasoning, system instructions or local absolute paths are published.

The pair comparison and six-card gallery use sandboxed previews at fixed CSS viewports: 1048 × 880 or 390 × 844. Scaling fits the preview container; it does not normalize button size. The original artifact files remain unchanged. `playback.js` adds an adapter only to embedded copies: it starts them at rest before showing them and invokes their existing controls on Play all / Play both. Commands are sent after every selected preview is ready. Reset remounts them at rest. Each retains its own replay timing, reduced-motion handling, controls, and direct pressing. Medium and Max have no true pause, so the shared reset returns all previews to rest instead of claiming to pause them. Full-size links and downloads open the unchanged originals, including their original startup behavior.

## Method and limits

One run per effort. Light maps to recorded `low`; all six recorded model `gpt-6-astra`. Elapsed time covers the first implementation turn, including tools and waits. Light’s later acknowledgment is excluded. Ultra used two parallel subagents; their time is already inside the parent wall time, not added to it. Token usage is reported from the recorded cumulative counters; no USD estimate is inferred.

The source-access finding is an audit of recorded actions, including Ultra’s subagents: no external source visit or cross-run access found. This is not a packet capture. The bundle itself exposes source images and attribution. Light received a mid-run browser reminder; the other five received it in their initial prompts. Browser access failures and different recovery paths affect the comparison.

No alternative-input baseline or no-bundle control was run, so the case study does not establish how much the supplied evidence improved the reconstructions. Visual judgments are qualitative; source-video motion was not available for continuous-frame scoring. Existing controls, textures, timings and imperfections are intentionally preserved.

## Verification

The review rendered and interacted with all six artifacts in Chrome at 1048 × 880 and 390 × 844 (DPR 1), with remote requests blocked. No uncaught JavaScript errors or horizontal overflow were observed in those checks. Static screenshot comparisons do not certify animation timing. See each run’s card for its original verification, including blocked previews and retries.

To repeat locally, use an available Python installation to serve the tiiny-stuff root, then open `/fingerprint-study/`. No npm dependencies or build step are required. Hosting/publishing is separate from adding this study to the project.

## Token accounting

`usage-data.json` records first-implementation token deltas for all six runs, including Ultra’s two subagents (three child turns). The main run and each child are counted once. Every nonduplicate cumulative increment equals the latest usage in its own session; parent counters do not include child model calls. Three repeated snapshots are ignored. Light’s later acknowledgment and this review are excluded. Cached input is a subset of input; reasoning output is a subset of output. Total is input + output. Counts are cumulative across model requests, including repeated context, and are not a dollar-cost estimate.

The same usage is included in `study-data.json`. Exact breakdowns appear under the elapsed-time chart; compact counts appear on the demo cards and run summaries. Original artifact files remain unchanged.

## Data sources

Reference images and motion measurements come from the shared capture bundle. Timings, token counts and process notes come from the recorded model runs. The interface assessments and comparison screenshots were made afterward for this study. The public dataset describes the supplied evidence without identifying the capture tool or its implementation.

## Contact-variation finding

The Findings section compares unchanged reference pixels at capture times 1.917s, 2.500s, 3.083s and 6.500s, with matching 420 × 192 source-pixel windows. The bundle visibly preserves differences in coverage and contrast. Random stamp resizing, pressure-sensitive input and exact opacity are not established by these stills. The assessment that all six miss the full contact variation is qualitative; a code review explicitly acknowledges opacity/reveal variation and Max’s repeating size factors. `study-data.json` includes the evidence paths, original dimensions, display windows, image hashes, interpretation limits and per-variant implementation notes.

## Sharing review

The default pair is High and Ultra. Compact view shows cropped, noninteractive replays using the same source-coordinate window for every variant at a given viewport: mobile [0, 260, 390, 260], desktop [220, 260, 608, 300] (x, y, width, height). Each iframe still lays out at 390 × 844 or 1048 × 880; the wrapper crops and scales the view without equalizing individual button sizes. Full controls restores the complete interfaces and direct pointer/keyboard interaction. Gallery labels precede the previews.

The visual preference for High and the central crack observed in Ultra are qualitative editorial judgments, separate from the original-run verification notes. Original variant files remain unchanged.

The share card uses existing review screenshots of High and Ultra, not new benchmark outputs. Canonical and social metadata target the study path on the existing project website.
