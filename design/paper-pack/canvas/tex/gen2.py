"""Construction-paper grain v2: real paper fibers are 1-3 mm long (about 6-18 pt on a phone) and
hair thin, so on top of a faint felt we draw sparse, long, wavy hairline strands. Two seamless masks:
lighter fibers, darker fibers + a few dark inclusions. Each sheet fills them with shades of its own color."""
import math, random, numpy as np
from PIL import Image, ImageDraw
PX=3; PT=160; n=PT*PX; K=4
def wrap_blur(a,s):
    h,w=a.shape; fy=np.fft.fftfreq(h)[:,None]; fx=np.fft.fftfreq(w)[None,:]
    return np.real(np.fft.ifft2(np.fft.fft2(a)*np.exp(-2*(np.pi*s)**2*(fx**2+fy**2)))).astype(np.float32)
def strands(seed,count,lr,wr,sr,dark_share,wav=0.0,steps=6):
    L=Image.new('L',(n*K,n*K)); D=Image.new('L',(n*K,n*K)); dl,dd=ImageDraw.Draw(L),ImageDraw.Draw(D)
    p=random.Random(seed)
    for _ in range(count):
        x,y=p.uniform(0,PT),p.uniform(0,PT); ln=p.uniform(*lr); a=p.uniform(0,2*math.pi)
        turn=p.uniform(-.3,.3)/max(ln,1); seg=ln/steps; pts=[(x,y)]
        for _ in range(steps):
            a+=turn*seg+p.gauss(0,wav); x+=math.cos(a)*seg; y+=math.sin(a)*seg; pts.append((x,y))
        d=dd if p.random()<dark_share else dl; w=max(1,round(p.uniform(*wr)*PX*K)); s=p.uniform(*sr)
        # fibers fade at both ends: draw as short pieces with a tapering strength
        for i in range(len(pts)-1):
            u=(i+.5)/(len(pts)-1); f=round(255*s*min(1,math.sin(math.pi*u)*1.6))
            for ox in (-PT,0,PT):
                for oy in (-PT,0,PT):
                    d.line([((pts[i][0]+ox)*PX*K,(pts[i][1]+oy)*PX*K),((pts[i+1][0]+ox)*PX*K,(pts[i+1][1]+oy)*PX*K)],fill=f,width=w)
    return np.asarray(L.reduce(K),np.float32)/255, np.asarray(D.reduce(K),np.float32)/255
rng=np.random.default_rng(3)
tooth=wrap_blur(rng.normal(size=(n,n)).astype(np.float32),0.6); tooth/=tooth.std()
# faint felt: many short fibers
fl0,fd0=strands(5,2600,(1.0,2.6),(0.15,0.2),(0.25,0.6),0.4,wav=0.15)
fl0=wrap_blur(fl0,0.4); fd0=wrap_blur(fd0,0.4)
# visible strands: long, hair thin, wavy, mostly paler than the sheet
fl1,fd1=strands(21,460,(3,10),(0.15,0.22),(0.6,1.0),0.45,wav=0.07,steps=12)
_,inc=strands(9,7,(0.6,1.6),(0.28,0.36),(0.75,0.95),1.0)
light=0.02*np.clip(tooth,0,None)+0.05*fl0+0.2*fl1
dark=0.02*np.clip(-tooth,0,None)+0.035*fd0+0.16*fd1+0.28*inc
KL,KD=0.2,0.30
for name,arr,k in [('fibers-light',light,KL),('fibers-dark',dark,KD)]:
    a=np.clip(arr/k,0,1)
    Image.merge('LA',(Image.new('L',(n,n),255),Image.fromarray((a*255+.5).astype(np.uint8)))).save(f'{name}.png',optimize=True)
print('max light',light.max(),'max dark',dark.max())
