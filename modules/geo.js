// geo.js — pure helpers, zero imports (except three passed in where needed is avoided; uses THREE global via import)
import * as THREE from 'three';

export function canvasTex(size, draw, repeat=[1,1]){
  const c=document.createElement('canvas'); c.width=c.height=size;
  const g=c.getContext('2d'); draw(g,size);
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(repeat[0],repeat[1]);
  t.anisotropy=8; t.colorSpace=THREE.SRGBColorSpace;
  return t;
}

export function pointedArchPath(w,h){
  const s=new THREE.Shape();
  const hw=w/2, spring=h-w*0.42, apex=h;
  s.moveTo(-hw,0); s.lineTo(-hw,spring);
  s.quadraticCurveTo(-hw*0.55,spring+w*0.28,0,apex);
  s.quadraticCurveTo(hw*0.55,spring+w*0.28,hw,spring);
  s.lineTo(hw,0); s.closePath();
  return s;
}

let _archCache={};
export function archFrameGeo(w,h,depth,thick=0.45){
  const key=`${w}|${h}|${depth}|${thick}`;
  if(_archCache[key]) return _archCache[key];
  const outer=pointedArchPath(w,h);
  const inner=pointedArchPath(w-thick*2,h-thick*1.4);
  // shift inner up so sill stays at bottom
  const hole=new THREE.Path(inner.getPoints(24).map(p=>new THREE.Vector2(p.x,p.y+0.22)));
  outer.holes.push(hole);
  const g=new THREE.ExtrudeGeometry(outer,{depth,bevelEnabled:false,curveSegments:10});
  g.translate(0,0,-depth/2);
  _archCache[key]=g;
  return g;
}

// Hemisphere dome profile: Ottoman lead-grey near-hemisphere, riseK .8-.9; golden Dome of Rock ~1.0
export function domeGeo(R,riseK=0.88,seg=48){
  const pts=[];
  for(let i=0;i<=26;i++){ const a=i/26*Math.PI/2;
    let r=Math.cos(a)*R; if(i/26>0.82) r*=0.96;
    pts.push(new THREE.Vector2(Math.max(r,0.02),Math.sin(a)*R*riseK));
  }
  return new THREE.LatheGeometry(pts,seg);
}

export function ribGeo(R,riseK,tube=0.05){
  const g=new THREE.TorusGeometry(R*1.012,tube,6,42,Math.PI/2);
  g.scale(1,riseK,1);
  return g;
}

// True semi-dome fused into mass
export function semiDomeGeo(R){
  const g=new THREE.SphereGeometry(R,40,18,0,Math.PI*2,0,Math.PI/2);
  g.rotateX(Math.PI/2);
  return g;
}

export function muqarnas(r,h=1.1,tiers=4){
  const grp=new THREE.Group();
  for(let i=0;i<tiers;i++){
    const rr=r*(1-i*0.14);
    const m=new THREE.Mesh(new THREE.CylinderGeometry(rr,rr*0.92,h/tiers,8),null);
    m.position.y=i*(h/tiers); m.rotation.y=i*Math.PI/8;
    m.userData.muq=true; grp.add(m);
  }
  return grp;
}

export function lerp(a,b,t){return a+(b-a)*t;}
export function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
export function ease(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
