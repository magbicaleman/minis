# Eleven50 card studies

Three working holographic card concepts based on the
[Eleven50 Cigar Pick (Green)](https://woodnwaters.com/products/eleven50-cigar-pick-green).
These are independent design studies. No discount, commercial offer, limited run,
or official collectible issuance is claimed.

## Preview

Use the repository's running static server and open:

- `holographic-marble/eleven50/?edition=forest` — Forest foil
- `holographic-marble/eleven50/?edition=ivory` — The invitation
- `holographic-marble/eleven50/?edition=nocturne` — Nocturne

The design links update the query string and support browser back/forward.
An unknown edition falls back to Forest foil. These client studies are accessible
by direct URL only, with no link from the main boot screen or original marble study.

## Interaction

Drag or hover to move the light. Touch gestures that start on the card belong to
the card; the surrounding page remains scrollable. Keyboard arrows move the light;
Enter or Space turns the card over, and Escape returns to the front.
The separate turn button offers the same action. Hidden faces are inert and excluded
from the accessibility tree.

Foil intensity starts at 35%. Idle movement can be paused and respects reduced-motion
preferences. Rendering stops when the page is hidden.

Forest foil and Nocturne can be saved to, or removed from, a collection in this
browser's local storage. This does not create an account, mint a token, or issue a
brand entitlement. The invitation copies `WW-PREVIEW`, explicitly labeled as a
preview code without redemption value. Product links open the real product page.

## Design contracts

| Direction | Composition and hypothesis | Tradeoff |
| --- | --- | --- |
| Forest foil | Centered product, circular framing, evergreen and champagne contour foil. A restrained collector-card treatment. | The effect is deliberately subtle. |
| The invitation | Left-aligned identity, diagonally offset object, warm paper and gold. Reverse-side space for a future campaign. | A real coupon requires approved terms and redemption integration. |
| Nocturne | Oversized model lettering, outlined monogram, large diffraction field on obsidian. A more expressive holographic finish. | More surface activity competes with the product. |

All three share product identity, 35% default foil, card proportions, and controls.
Mobile changes the page from two columns to a single column and condenses the
edition chooser. Each card keeps its own composition.

## Evidence and artwork

- **Observed:** the supplied product photo shows the green rectangular closed accessory,
  its recessed slider track, and silver thumb wheel.
- **Source claim:** the product page describes a spring-loaded ejecting prong and magnetic hold.
- **Hypothesis:** the three compositions communicate different kinds of collectible value.
  No audience-preference or conversion claims have been tested.
- **Implementation:** generated product artwork is composited with a CSS silhouette mask.
  The foil, grain, contours, lighting, layouts, and typography are code-native.
- **Asset:** `assets/eleven50-green.png`, generated with the built-in image_gen tool
  from the original product photo. It is an edited visual study, not a replacement
  for the brand's catalog photography. Full prompts and selection notes are in `PROMPTS.md`.

No framework, build step, remote fonts, or external runtime assets are required.

## Verification

Inspected all fronts and reverses in the in-app browser, including matched 320px-wide
iframe viewports. Verified edition switching, coupon-code copying, collection save,
reload persistence, and removal. These are browser checks, not user preference tests.
The 320px pass exposed a missing space when the desktop line break was hidden; corrected.
