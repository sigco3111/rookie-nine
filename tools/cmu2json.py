# CMU mocap (ASF/AMC) -> compact joint-position JSON (facing +z, y up, meters, ~30fps)
import sys, json, re, numpy as np
def rx(a): c,s=np.cos(a),np.sin(a); return np.array([[1,0,0],[0,c,-s],[0,s,c]])
def ry(a): c,s=np.cos(a),np.sin(a); return np.array([[c,0,s],[0,1,0],[-s,0,c]])
def rz(a): c,s=np.cos(a),np.sin(a); return np.array([[c,-s,0],[s,c,0],[0,0,1]])
R={'x':rx,'y':ry,'z':rz}
def euler(vals, order):  # first listed axis applied first
    M=np.eye(3)
    for ax,v in zip(order,vals): M=R[ax](np.radians(v))@M
    return M
def parse_asf(fn):
    t=open(fn).read(); bones={}
    for blk in re.findall(r'begin(.*?)end',t.split(':hierarchy')[0].split(':bonedata')[1],re.S):
        b={}; 
        b['name']=re.search(r'name (\S+)',blk).group(1)
        b['dir']=np.array(list(map(float,re.search(r'direction ([^\n]+)',blk).group(1).split())))
        b['len']=float(re.search(r'length (\S+)',blk).group(1))
        a=re.search(r'axis ([^\n]+)',blk).group(1).split(); b['axis']=list(map(float,a[:3])); b['aorder']=a[3].lower()
        d=re.search(r'dof ([^\n]+)',blk); b['dof']=[x[1] for x in d.group(1).split()] if d else []
        bones[b['name']]=b
    par={}
    h=t.split(':hierarchy')[1]
    for line in re.findall(r'begin(.*?)end',h,re.S)[0].strip().split('\n'):
        p=line.split(); 
        for c in p[1:]: par[c]=p[0]
    return bones,par
def parse_amc(fn):
    frames=[];cur=None
    for l in open(fn):
        l=l.strip()
        if not l or l[0] in '#:': continue
        p=l.split()
        if len(p)==1 and p[0].isdigit(): cur={}; frames.append(cur)
        elif cur is not None: cur[p[0]]=list(map(float,p[1:]))
    return frames
def run(asf,amc,step=4,scale=2.54/100/0.45):
    bones,par=parse_asf(asf); frames=parse_amc(amc)
    order=[];  # topological
    def depth(n): return 0 if n=='root' else 1+depth(par[n])
    names=sorted(bones,key=depth)
    out=[]
    for fr in frames[::step]:
        G={};E={};S={}
        rt=fr['root']; G['root']=euler(rt[3:6],'xyz'); S['root']=np.array(rt[:3])*scale; E['root']=S['root']
        for n in names:
            b=bones[n]; p=par[n]; Cm=euler(b['axis'],b['aorder'])
            M=euler(fr.get(n,[])[:len(b['dof'])],b['dof']) if b['dof'] else np.eye(3)
            G[n]=G[p]@(Cm@M@Cm.T); S[n]=E[p]; E[n]=S[n]+G[n]@b['dir']*b['len']*scale
        out.append({'S':S,'E':E})
    return out
J={'hips':('root','S'),'chest':('thorax','S'),'neck':('upperneck','S'),'head':('head','E'),
 'shL':('lhumerus','S'),'elL':('lradius','S'),'wrL':('lwrist','S'),'shR':('rhumerus','S'),'elR':('rradius','S'),'wrR':('rwrist','S'),
 'hpL':('lfemur','S'),'knL':('ltibia','S'),'anL':('lfoot','S'),'hpR':('rfemur','S'),'knR':('rtibia','S'),'anR':('rfoot','S'),'toL':('ltoes','E'),'toR':('rtoes','E')}
if __name__=='__main__':
    asf,amc,outf=sys.argv[1:4]; start=int(sys.argv[4]) if len(sys.argv)>4 else 0; end=int(sys.argv[5]) if len(sys.argv)>5 else 10**9
    fr=run(asf,amc)[start:end]
    # CMU: y up. facing from first frame: hip line (lfemur->rfemur) cross up
    f0=fr[0]; pl=f0['S']['lfemur']; pr=f0['S']['rfemur']
    right=(pr-pl); right[1]=0; right/=np.linalg.norm(right)   # subject's right
    fwd=np.cross(right,[0,1,0])*-1  # subject forward = up x right ... check below
    fwd=np.cross([0,1,0],right)
    # want: subject forward -> +z, subject left -> +x (three.js right-handed, y up: left = up x fwd)
    Rm=np.array([np.cross([0,1,0],fwd),[0,1,0],fwd])  # rows: new x (left), y, z
    root0=f0['S']['root']*1
    res=[]
    for f in fr:
        d={}
        for k,(bn,w) in J.items():
            v=Rm@(f[w][bn]-np.array([root0[0],0,root0[2]]))
            d[k]=[round(float(x),3) for x in v]
        res.append(d)
    json.dump({'fps':30,'frames':res},open(outf,'w'),separators=(',',':'))
    h=res[0]; print(len(res),'frames; hips y',h['hips'][1],'head y',h['head'][1],'wrist L',h['wrL'],'R',h['wrR'])
