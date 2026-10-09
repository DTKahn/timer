"""Copies boards into check/ with uploaded file urls mapped to the local copies, for previewing.

Run from canvas/:  python3 check/build.py Main Edges ...
Then serve the paper-pack folder (python3 -m http.server 8091) and open /canvas/check/<Board>.html.
"""
import json
import sys

m = json.load(open('check/blobs.json'))
for f in sys.argv[1:]:
    s = open(f'project/{f}.dc.html').read()
    for k, v in m.items():
        s = s.replace(k, v)
    open(f'check/{f}.html', 'w').write(s.replace('<script src="./support.js"></script>', ''))
