# Holographic Marble

A standalone recreation of the supplied Holographic Marble Card motion capture.
Open it from the Minis Hub with `holographic-marble`, or visit its folder directly.

## Run

From the repository root, reuse the existing static server or start one:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open <http://127.0.0.1:4173/holographic-marble/>. No installation or build is needed.
All artwork, styles, and scripts are local; the demo makes no external requests.

## Interaction

- Move a pointer over the card, or drag on a touch screen, to tilt it and change the light.
- Focus the card with Tab and use the arrow keys to move the light.
- Home or Escape centers the light. Space pauses or resumes the idle animation.
- The intensity slider changes the added holographic effect from 0–100%. It starts
  at 35%. The underlying marble retains its original color at 0%.
- Reduced-motion preferences disable idle animation and card rotation. Lighting
  and intensity remain interactive. Rendering pauses when the page is hidden.

## Implementation and reference

`marble.js` renders the original texture using a small WebGL shader. Refraction
follows the colorful veins while preserving the silver stone. A CSS texture and
lighting fallback remains available without WebGL or during context loss.

The original marble image and visual styling came from the rendered
[reference site](https://holographic-marble-card.mayrazor.chatgpt.site/), identified
in the user-supplied ZIP. The recording overlay in the capture is excluded from
the artwork. The shader, input handling, and gentle idle motion were rebuilt;
their exact original implementation and timing were not available in the ZIP.
