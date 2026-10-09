# Paper Pack: design sources

Everything behind the construction-paper exploration, kept with the branch so
it can be picked up again. The finished pages live on claude.ai (private to
the owner until shared):

- **Paper Pack design canvas** — https://claude.ai/artifact/X213WDjCwVJ47b3TooyeCz
  Neutral sheets and timer colors (now vs new), references, cut and torn
  edges, layering (glued / raised / lifted), the torn edge in detail, and
  option A vs option C side by side in light and dark mode.
- **A/B/C comparison page** — https://claude.ai/artifact/Nqg53739hZ8V7Fvm8tMGSV
  The first round: SVG (A), Skia (B) and pre-drawn images (C) in the app,
  plus the grain study.

Status (2026-10-09): option A is applied to the app on this branch
(`paper-collage`). The owner's verdict: the concept is right, but the result
still reads too flat and untextured — it should look like real paper. The
approach may need rethinking (real paper catches light: surface relief, fibers
that cast tiny shadows, slight unevenness, not just color variation).

## What's here

| Folder | What it is |
| --- | --- |
| `canvas/` | `gen.js` builds every board of the design canvas into `canvas/project/` (git-ignored). It uses `colors.json` (the paper and timer colors), `js/outline.js` (the app's outline code, compiled) and `js/torn-fibers.js` (the fiber torn edge). |
| `canvas/tex/` | The fiber grain: `gen2.py` makes the current texture (`fibers-light/dark.png`); `gen.py` and the `v1-` files are the earlier version; `grain-current.png` is the grain before this round; `shades.py` holds the per-sheet shade math. |
| `canvas/c2/` | Option C rebuilt with option A's learnings: `gen_torn.py` (one torn sheet), `gen_cut.py` (one rectangle and three circles), `gen_kits.py` (the final kit: edge pictures in several lengths so nothing is stretched more than 20%). `kit/` holds all 176 kit pictures; `orig/` is C's original torn sheet from the first round. The `*blobs.json` files map each picture to its upload on the canvas. |
| `canvas/check/` | Local preview: `build.py` swaps the canvas's uploaded files for these local copies; `render.sh` screenshots a board. |
| `references/` | Real construction-paper photos used for colors, fibers and edges. See `CREDITS.md`. |
| `comparison-page/` | The A/B/C comparison page and its screenshots. |
| `tools/cdp-shot.mjs` | Headless Chrome screenshots at phone size (light/dark, taps by accessibility label). |

## Rebuilding and previewing

```sh
cd design/paper-pack/canvas
node gen.js                          # writes project/*.dc.html and project/canvas.json
python3 check/build.py Main Edges    # local copies in check/ for the boards you name
cd .. && python3 -m http.server 8091 # then open http://localhost:8091/canvas/check/Main.html
canvas/check/render.sh Main 1440 1000   # from canvas/, with the server running
```

Python scripts need `numpy` and `Pillow`; the screenshot tool needs Google Chrome.
To publish changes back to the canvas, send the regenerated `project/` files
to the canvas artifact above.
