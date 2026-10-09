import sys, numpy as np
from PIL import Image
sys.path.insert(0,'.')
from shades import shades, rgb
def render(color, pre, KL, size=360):
    lt,dk=shades(color,KL=KL)
    a1=np.asarray(Image.open(pre+'fibers-light.png'))[:size,:size,1:2]/255.
    a2=np.asarray(Image.open(pre+'fibers-dark.png'))[:size,:size,1:2]/255.
    base=np.ones((size,size,3))*rgb(color)
    base=base*(1-a1)+np.array(rgb(lt))*a1
    base=base*(1-a2)+np.array(rgb(dk))*a2
    return Image.fromarray(base.clip(0,255).astype(np.uint8))
cols=sys.argv[1].split(',')
W=360; out=Image.new('RGB',(len(cols)*(W+10),2*(W+10)),'#444')
for i,c in enumerate(cols):
    out.paste(render('#'+c,'v1-',0.12),(i*(W+10),0))
    out.paste(render('#'+c,'',0.2),(i*(W+10),W+10))
out.save(sys.argv[2])
