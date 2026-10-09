"""Proposed construction-paper grain: two seamless masks (lighter fibers, darker fibers + inclusions).
Each sheet fills them with a lighter and darker shade of its own color, so fibers keep the sheet's hue."""
import math, random, numpy as np
from PIL import Image, ImageDraw
PX=3; PT=160; n=PT*PX
def wrap_blur(a,s):
    h,w=a.shape; fy=np.fft.fftfreq(h)[:,None]; fx=np.fft.fftfreq(w)[None,:]
    return np.real(np.fft.ifft2(np.fft.fft2(a)*np.exp(-2*(np.pi*s)**2*(fx**2+fy**2)))).astype(np.float32)
def strands(seed,count,lr,wr,sr,dark_share,k=2):
    L=Image.new('L',(n*k,n*k)); D=Image.new('L',(n*k,n*k)); dl,dd=ImageDraw.Draw(L),ImageDraw.Draw(D)
    p=random.Random(seed)
    for _ in range(count):
        x,y=p.uniform(0,PT),p.uniform(0,PT); ln=p.uniform(*lr); a=p.uniform(0,math.pi); b=p.uniform(-.6,.6)
        pts=[(x+math.cos(a+b*(t/5-.5)*2)*(t/5-.5)*ln, y+math.sin(a+b*(t/5-.5)*2)*(t/5-.5)*ln) for t in range(6)]
        d=dd if p.random()<dark_share else dl; w=max(1,round(p.uniform(*wr)*PX*k)); s=round(255*p.uniform(*sr))
        for ox in (-PT,0,PT):
            for oy in (-PT,0,PT):
                d.line([((u+ox)*PX*k,(v+oy)*PX*k) for u,v in pts],fill=s,width=w,joint='curve')
    return np.asarray(L.reduce(k),np.float32)/255, np.asarray(D.reduce(k),np.float32)/255
rng=np.random.default_rng(3)
tooth=wrap_blur(rng.normal(size=(n,n)).astype(np.float32),0.6); tooth/=tooth.std()
floc=wrap_blur(rng.normal(size=(n,n)).astype(np.float32),PX*1.2); floc/=floc.std()
fl,fd=strands(5,3400,(1.0,3.0),(0.15,0.22),(0.3,0.8),0.4)
fl=wrap_blur(fl,0.5); fd=wrap_blur(fd,0.5)
_,inc=strands(9,5,(0.8,1.8),(0.28,0.34),(0.75,0.9),1.0)
light=0.025*np.clip(tooth,0,None)+0.018*np.clip(floc,0,None)+0.07*fl
dark=0.025*np.clip(-tooth,0,None)+0.018*np.clip(-floc,0,None)+0.05*fd+0.28*inc
KL,KD=0.12,0.30   # strength at full mask; per-sheet shades below scale these
for name,arr,k in [('fibers-light',light,KL),('fibers-dark',dark,KD)]:
    a=np.clip(arr/k,0,1)
    Image.merge('LA',(Image.new('L',(n,n),255),Image.fromarray((a*255+.5).astype(np.uint8)))).save(f'{name}.png',optimize=True)
