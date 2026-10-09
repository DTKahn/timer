def rgb(h): h=h.lstrip('#'); return [int(h[i:i+2],16) for i in (0,2,4)]
def hx(c): return '#'+''.join(f'{round(max(0,min(255,v))):02X}' for v in c)
def lum(h):
    def ch(v):
        v/=255; return v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    r,g,b=map(ch,rgb(h)); return 0.2126*r+0.7152*g+0.0722*b
def shades(h, KL=0.12, KD=0.30):
    L=lum(h)
    fd=1 if L<=0.35 else max(0.3, 1-(L-0.35)/0.5*0.7)      # light sheets: gentler dark fibers
    fl=1 if L>=0.15 else 0.35+0.65*L/0.15                  # dark sheets: gentler light fibers
    c=rgb(h)
    lighter=[v+(255-v)*KL*fl for v in c]; darker=[v*(1-KD*fd) for v in c]
    return hx(lighter), hx(darker)
