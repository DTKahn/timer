#!/bin/sh
# Screenshots a board previewed by build.py. Needs the paper-pack folder served on port 8091.
# usage (from canvas/): check/render.sh <Board> <width> <height>
cd "$(dirname "$0")/../.." && node tools/cdp-shot.mjs "{\"shots\":[{\"url\":\"/canvas/check/$1.html\",\"out\":\"canvas/check/$1.png\",\"w\":$2,\"h\":$3,\"wait\":2500}]}"
