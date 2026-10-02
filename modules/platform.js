// platform.js — Haram al-Sharif platform, retaining walls, gates, porticos, stairs
import * as THREE from 'three';
import { archFrameGeo, pointedArchPath } from './geo.js';

// --- W1 stone: apate-pattern relief (POM walls+pavement, SPOM trim, displaced hero-only=none).
// Cost table (mirrors apate README logic): full height-march only on large flat
// stone (retaining walls 12+5, pavement 8+4); thin reveals/parapets/gates use
// single-step SPOM (2+4); true vertex displacement reserved for a future
// Western-Wall hero closeup (relief here <=7cm << block size, silhouette safe).
// World-space ashlar (no UV dependence, merge-safe): courses keyed to world Y
// with per-row drift + block-width variation; mortar = height-field groove with
// AO + marched self-shadow; normals from height gradient (bump-scale clamped).
const STONE_COMMON = `#include <common>
varying vec3 vStoneWP;
varying vec3 vStoneWN;
uniform vec3 uSunW;
uniform float uPomScale;
uniform float uMortar;
uniform vec2 uCourse;
uniform float uBoss;
uniform float uToneVar;
uniform float uStagger;
vec2 gPf; float gHf; vec3 gNwP;
float shash1(float n){ return fract(sin(n)*43758.5453123); }
float shash2(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
float ashlarH(vec2 p, vec2 course, float mortar, float boss, float stag, out vec2 bUV, out vec2 bId){
  float ch = course.x; float bw = course.y;
  float row = floor(p.y / ch);
  float bwv = bw * (0.72 + 0.56*shash1(row*3.17+7.3));
  float drift = shash1(row*1.37+0.31) * bwv * stag;
  float xu = p.x + drift;
  float blk = floor(xu / bwv);
  bId = vec2(blk, row);
  vec2 f = vec2(fract(xu / bwv), fract(p.y / ch));
  bUV = f;
  float mx = min(f.x, 1.0-f.x)*bwv;
  float my = min(f.y, 1.0-f.y)*ch;
  float md = min(mx, my);
  float mortarM = 1.0 - smoothstep(mortar*0.5, mortar*1.6, md);
  float j = (shash2(bId+0.37)-0.5)*0.14;
  vec2 c = f-0.5;
  float bossM = smoothstep(0.55, 0.12, length(c*vec2(1.0,1.4)));
  float h = (0.70 + 0.30*mix(1.0, bossM, boss)) + j;
  return mix(h, 0.0, mortarM);
}`;

function stoneFace(out, isPOM, STEPS, SSTEPS, SHSTR, COURSEVAR) {
  return `
{
vec3 Vw = normalize(cameraPosition - vStoneWP);
vec3 Nw = normalize(vStoneWN);
vec3 T; vec3 B; vec2 p0;
if (abs(Nw.x) > 0.5) { T=vec3(0.,0.,1.); B=vec3(0.,1.,0.); p0=vec2(vStoneWP.z,vStoneWP.y); }
else if (abs(Nw.z) > 0.5) { T=vec3(1.,0.,0.); B=vec3(0.,1.,0.); p0=vec2(vStoneWP.x,vStoneWP.y); }
else { T=vec3(1.,0.,0.); B=vec3(0.,0.,1.); p0=vec2(vStoneWP.x,vStoneWP.z); }
vec2 course = uCourse;
${COURSEVAR ? 'if (vStoneWP.y < -2.0) course = vec2(1.15, 2.8);' : ''}
vec3 Vt = vec3(dot(Vw,T), dot(Vw,B), dot(Vw,Nw));
vec2 mdir = Vt.xy / max(abs(Vt.z), 0.12);
vec2 fUV; vec2 fId; float hf;
${isPOM ? `
vec2 dUV = mdir * (uPomScale / float(${STEPS}));
vec2 p = p0;
float lay = 0.0; float dl = 1.0/float(${STEPS});
vec2 tUV; vec2 tId;
float h = ashlarH(p, course, uMortar, uBoss, uStagger, tUV, tId);
vec2 pp = p; float hp = h;
for (int i=0;i<${STEPS};i++){
  if (lay >= 1.0-h) break;
  pp = p; hp = h;
  p -= dUV; lay += dl;
  h = ashlarH(p, course, uMortar, uBoss, uStagger, tUV, tId);
}
float dA = lay-(1.0-h);
float dB = (1.0-hp)-(lay-dl);
float ww = clamp(dA/max(dA+dB,1e-4),0.0,1.0);
vec2 pf = mix(p, pp, ww);
hf = ashlarH(pf, course, uMortar, uBoss, uStagger, fUV, fId);`
: `
float h0 = ashlarH(p0, course, uMortar, uBoss, uStagger, fUV, fId);
vec2 pf = p0 - mdir * (uPomScale * h0);
hf = ashlarH(pf, course, uMortar, uBoss, uStagger, fUV, fId);`}
vec3 Lw = normalize(uSunW);
vec3 Lt = vec3(dot(Lw,T), dot(Lw,B), dot(Lw,Nw));
float sh = 1.0;
if (Lt.z > 0.05) {
  vec2 sUV = Lt.xy / max(Lt.z, 0.15) * (uPomScale / float(${SSTEPS}));
  vec2 sp = pf; float rh = hf; float occ = 0.0;
  for (int i=0;i<${SSTEPS};i++){
    sp += sUV; rh += (1.0-hf)/float(${SSTEPS});
    vec2 a; vec2 b;
    float bh = ashlarH(sp, course, uMortar, uBoss, uStagger, a, b);
    occ = max(occ, (bh-rh)*(1.0-float(i)/float(${SSTEPS})));
  }
  sh = clamp(1.0-occ*float(${SHSTR}), 0.0, 1.0);
}
float tone = (1.0-uToneVar*0.5) + uToneVar*shash2(fId+3.7);
float ao = mix(0.52, 1.0, smoothstep(0.0, 0.38, hf));
float grain = 0.965 + 0.07*shash2(floor(pf*9.0));
float dCam = length(cameraPosition - vStoneWP);
float det = 1.0 - smoothstep(90.0, 320.0, dCam);
diffuseColor.rgb *= mix(1.0, tone*ao*grain*mix(1.0, sh, 0.85), det);
float ee = 0.04;
vec2 e1; vec2 e2;
float hx1 = ashlarH(pf+vec2(ee,0.0), course, uMortar, uBoss, uStagger, e1, e2);
float hx0 = ashlarH(pf-vec2(ee,0.0), course, uMortar, uBoss, uStagger, e1, e2);
float hy1 = ashlarH(pf+vec2(0.0,ee), course, uMortar, uBoss, uStagger, e1, e2);
float hy0 = ashlarH(pf-vec2(0.0,ee), course, uMortar, uBoss, uStagger, e1, e2);
vec2 slope = vec2(hx1-hx0, hy1-hy0)/(2.0*ee)*uPomScale*det;
float sl = length(slope);
if (sl > 2.0) slope *= 2.0/sl;
gNwP = normalize(Nw - (T*slope.x + B*slope.y));
}`;
}

// Local clones only (never mutate shared M.*): POM walls+pavement, SPOM trim.
function stonePOM(mat, o) {
  const sunU = o.sunU;
  mat.map = null;
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uSunW = sunU;
    sh.uniforms.uPomScale = { value: o.scale };
    sh.uniforms.uMortar = { value: o.mortar };
    sh.uniforms.uCourse = { value: new THREE.Vector2(o.course[0], o.course[1]) };
    sh.uniforms.uBoss = { value: o.boss };
    sh.uniforms.uToneVar = { value: o.toneVar };
    sh.uniforms.uStagger = { value: o.stagger };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vStoneWP;\nvarying vec3 vStoneWN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvStoneWP=(modelMatrix*vec4(transformed,1.0)).xyz;\nvStoneWN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', STONE_COMMON)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + stoneFace(0, o.pom, o.steps, o.ssteps, o.shstr, o.courseVar))
      .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\nnormal = normalize((viewMatrix * vec4(gNwP, 0.0)).xyz);');
  };
  mat.customProgramCacheKey = () => o.key;
  return mat;
}

export function buildPlatform(ctx){
  const {scene,M}=ctx; const G=new THREE.Group(); G.name='platform'; scene.add(G);
  const W=300, D=450; // main esplanade ~ realistic ratio
  const add=(m,cast=true,recv=true)=>{m.castShadow=cast;m.receiveShadow=recv;G.add(m);return m;};

  // W1: live sun dir for POM self-shadow (lighting builds after platform; lazy-bind, no new lights)
  const sunU = { value: new THREE.Vector3(-0.9, 0.35, 0.2).normalize() };
  let _sunObj = null;
  const _sv = new THREE.Vector3();
  ctx.D.tickers.push(() => {
    if (!_sunObj) _sunObj = scene.getObjectByProperty('isDirectionalLight', true) || null;
    if (_sunObj) {
      _sv.copy(_sunObj.position);
      if (_sunObj.target) _sv.sub(_sunObj.target.position);
      if (_sv.lengthSq() > 1e-6) sunU.value.copy(_sv.normalize());
    }
  });
  // W1 local stone clones: honey retaining ashlar (POM), pale pavement (POM), trim/reveals (SPOM)
  const wallMat = stonePOM(new THREE.MeshStandardMaterial({color:0xd6c092,roughness:.9,metalness:.02,envMapIntensity:.2}),
    {sunU, pom:true, steps:12, ssteps:5, shstr:6, scale:.07, mortar:.035, course:[.75,1.9], courseVar:1, stagger:1, boss:1, toneVar:.10, key:'w1-wall-pom'});
  const paveMat = stonePOM(new THREE.MeshStandardMaterial({color:0xcfc2a6,roughness:.94,metalness:0,envMapIntensity:.18}),
    {sunU, pom:true, steps:8, ssteps:4, shstr:6, scale:.03, mortar:.02, course:[1.8,1.8], courseVar:0, stagger:0, boss:.15, toneVar:.06, key:'w1-pave-pom'});
  const trimMat = stonePOM(new THREE.MeshStandardMaterial({color:0xdcc9a0,roughness:.85,envMapIntensity:.2}),
    {sunU, pom:false, steps:0, ssteps:4, shstr:5, scale:.05, mortar:.03, course:[.55,1.1], courseVar:0, stagger:1, boss:.5, toneVar:.08, key:'w1-trim-spom'});

  // --- ground base (Kidron/Silwan tone, refs aerial/aerial-silwan-kidron.jpg) ---
  const base=new THREE.Mesh(new THREE.BoxGeometry(900,18,1100), new THREE.MeshStandardMaterial({color:0xa79b7c,roughness:1}));
  base.position.y=-12; base.receiveShadow=true; G.add(base);
  // city hint blocks around
  const cityMat=new THREE.MeshStandardMaterial({color:0xc9bfa8,roughness:.95});
  const cityMat2=new THREE.MeshStandardMaterial({color:0xbfae8e,roughness:.95});
  for(let i=0;i<70;i++){
    const w=14+Math.random()*22,h=8+Math.random()*16,d=14+Math.random()*22;
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),Math.random()>0.5?cityMat:cityMat2);
    const side=Math.random()>0.5?1:-1;
    m.position.set(side*(200+Math.random()*260),h/2-4,(Math.random()-0.5)*900);
    if(Math.abs(m.position.z)<260&&Math.abs(m.position.x)<220){m.position.x+=side*140;}
    m.castShadow=false;m.receiveShadow=true;G.add(m);
    // tiny dome on some
    if(Math.random()>0.85){const dm=new THREE.Mesh(new THREE.SphereGeometry(3,14,10,0,Math.PI*2,0,Math.PI/2),ctx.M.lead);dm.position.set(m.position.x,m.position.y+h/2,m.position.z);G.add(dm);}
  }
  // Mount of Olives ridge east
  const ridge=new THREE.Mesh(new THREE.BoxGeometry(180,70,900),new THREE.MeshStandardMaterial({color:0x7c7f5e,roughness:1}));
  ridge.position.set(420,8,0); G.add(ridge);

  // --- Haram platform slab + retaining walls (ashlar) ---
  const slab=add(new THREE.Mesh(new THREE.BoxGeometry(W,6,D),M.plaza)); slab.position.y=-1;
  // pavement top thin (POM slabs)
  const pave=add(new THREE.Mesh(new THREE.PlaneGeometry(W-4,D-4),paveMat)); pave.rotation.x=-Math.PI/2; pave.position.y=2.06; pave.receiveShadow=true;
  // retaining walls with Herodian boss texture feel (scale)
  const wallH=22;
  const mkWall=(w,h,d,x,y,z)=>{const m=add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wallMat));m.position.set(x,y,z);return m;};
  mkWall(W,wallH,6, 0,-8, D/2); mkWall(W,wallH,6, 0,-8,-D/2);
  mkWall(6,wallH,D, W/2,-8,0); mkWall(6,wallH,D, -W/2,-8,0);
  // parapet + balustrade (SPOM reveals/edges)
  const par=add(new THREE.Mesh(new THREE.BoxGeometry(W+2,1.4,2),trimMat)); par.position.set(0,2.8,D/2);
  const par2=par.clone(); par2.position.z=-D/2; G.add(par2);
  const par3=add(new THREE.Mesh(new THREE.BoxGeometry(2,1.4,D),trimMat)); par3.position.set(W/2,2.8,0);
  const par4=par3.clone(); par4.position.x=-W/2; G.add(par4);

  // --- Western Wall plaza (Buraq) lower terrace ---
  const low=add(new THREE.Mesh(new THREE.BoxGeometry(60,2,180),paveMat)); low.position.set(-W/2-34, -14, 40);
  const wWall=add(new THREE.Mesh(new THREE.BoxGeometry(4,26,190),wallMat)); wWall.position.set(-W/2-2,-4,40);

  // --- raised central terrace for Dome of the Rock (photo-accurate: octagonal platform with stairs on 4 sides) ---
  const terrH=3.2;
  const terr=add(new THREE.Mesh(new THREE.BoxGeometry(110,terrH,110),M.marble)); terr.position.set(0,2+terrH/2,-70);
  const terrTop=add(new THREE.Mesh(new THREE.PlaneGeometry(110,110),M.plaza)); terrTop.rotation.x=-Math.PI/2; terrTop.position.set(0,2+terrH+0.02,-70);
  // 8-sided arcade parapet (small arches) around central terrace.
  // Stair fix: NO arch on the stair axis — 6 per side at ±(9.5,25,40.5),
  // clear opening ±8.2 vs 14m-wide stair lane (±7). Was 28 with t=0 blocking.
  const archG=archFrameGeo(2.6,3.4,0.6,0.35);
  const archM=M.stoneLight.clone(); archM.side=THREE.DoubleSide;
  const count=24;
  const inst=new THREE.InstancedMesh(archG,archM,count);
  const dummy=new THREE.Object3D(); let idx=0;
  const offs=[-40.5,-25,-9.5,9.5,25,40.5];
  for(let s=0;s<4;s++){
    for(const t of offs){
      let x=0,z=0,ry=0;
      if(s===0){x=t;z=-70+55;ry=0;} if(s===1){x=t;z=-70-55;ry=Math.PI;}
      if(s===2){x=55;z=-70+t;ry=Math.PI/2;} if(s===3){x=-55;z=-70+t;ry=-Math.PI/2;}
      dummy.position.set(x,2+terrH,z); dummy.rotation.set(0,ry,0); dummy.updateMatrix();
      inst.setMatrixAt(idx++,dummy.matrix);
    }
  }
  inst.castShadow=true; G.add(inst);

  // stairs 4 sides
  const stairMat=M.marble;
  for(let s=0;s<4;s++){
    for(let k=0;k<7;k++){
      const st=add(new THREE.Mesh(new THREE.BoxGeometry(s<2?14:2.4,0.5, s<2?2.4:14),stairMat));
      if(s===0) st.position.set(0,2+terrH-0.25-k*0.45,-70+55+2+k*1.6);
      if(s===1) st.position.set(0,2+terrH-0.25-k*0.45,-70-55-2-k*1.6);
      if(s===2) st.position.set(55+2+k*1.6,2+terrH-0.25-k*0.45,-70);
      if(s===3) st.position.set(-55-2-k*1.6,2+terrH-0.25-k*0.45,-70);
    }
    // Mawazin arcade crowning the axis (photo: columns + 3-4 arches, OPEN —
    // the climb passes through the middle bay). Replaces the old solid gable
    // box, which crossed the lane 1.1-1.5m above the steps. 4 piers (3 bays),
    // lintel soffit 7.4 = landing 5.2 + 2.2 head clearance; central bay ±1.78
    // stays void floor-to-lintel along the whole climb path.
    {
      const NS=s<2;
      const colG=new THREE.CylinderGeometry(0.22,0.26,5.4,8);
      const az = s===0?-14 : s===1?-126 : -70;      // arcade line across the lane
      const ax = s===2?56 : s===3?-56 : 0;
      for(const off of [-5.5,-2,2,5.5]){
        const c=add(new THREE.Mesh(colG,trimMat));
        if(NS) c.position.set(off,2+2.7,az); else c.position.set(ax,2+2.7,az+off);
      }
      const lin=add(new THREE.Mesh(new THREE.BoxGeometry(NS?12:1.5,1,NS?1.5:12),trimMat));
      if(NS) lin.position.set(0,7.9,az); else lin.position.set(ax,7.9,az);
    }
    // sloped balustrade cheek-walls flanking the stair (photo: open run between
    // cheeks). Inner face at ±7.25 vs lane ±7 — nothing in the lane. Slope
    // 0.274 rad matches the steps (2.7 drop / 9.6 run).
    for(const side of [-1,1]){
      const NS=s<2;
      const cheek=add(new THREE.Mesh(new THREE.BoxGeometry(NS?0.5:12.5,1.1,NS?12.5:0.5),trimMat));
      if(s===0){cheek.position.set(side*7.5,3.95,-8.2);cheek.rotation.x=0.274;}
      if(s===1){cheek.position.set(side*7.5,3.95,-131.8);cheek.rotation.x=-0.274;}
      if(s===2){cheek.position.set(61.8,3.95,-70+side*7.5);cheek.rotation.z=-0.274;}
      if(s===3){cheek.position.set(-61.8,3.95,-70+side*7.5);cheek.rotation.z=0.274;}
    }
  }

  // --- Southern Qibli terrace ---
  const qterr=add(new THREE.Mesh(new THREE.BoxGeometry(150,1.2,60),M.marble)); qterr.position.set(0,2.6,150);

  // --- Portico along west + north (Mamluk portico bays) ---
  buildPortico(G,ctx,-W/2+8, 0, 26, 'z');
  buildPortico(G,ctx, 0, -D/2+8, 30, 'x');

  // --- Gates (8 named) as markers with stone portals ---
  // P4e: Maghariba sits on the WEST wall near the SW corner (wilson: Bab al
  // Magharibe Passage, W of mosque west end); Rahma/Golden Gate on the EAST
  // wall north section (plan-1890 I,J,K). along=1 → opening faces ±x.
  const gates=[
    ['Bab al-Maghariba', -W/2, 100, 1],['Bab al-Silsila', -W/2, 60, 1],['Bab al-Qattanin', -W/2, 10, 1],
    ['Bab al-Ghawanima', -W/2, -140, 1],['Bab al-Asbat', 60, -D/2, 0],['Bab al-Rahma', W/2, -140, 1],
    ['Bab al-Nazir', -W/2, -40, 1],['Bab al-Hadid', -W/2, -90, 1],
  ];
  ctx.D.gates=[];
  for(const [n,x,z,along] of gates){
    const p=add(new THREE.Mesh(new THREE.BoxGeometry(along?6:14,9,along?14:6),trimMat));
    p.position.set(x,6.5,z); ctx.D.gates.push({name:n,pos:p.position.clone()});
    const hole=add(new THREE.Mesh(new THREE.BoxGeometry(along?3:6,6,along?6:3),new THREE.MeshStandardMaterial({color:0x1a140e})));hole.position.set(x,5,z);
  }
  return G;
}

function buildPortico(G,ctx,ox,oz,n,axis){
  const colG=new THREE.CylinderGeometry(0.5,0.6,5.2,10);
  const cols=new THREE.InstancedMesh(colG,ctx.M.marble,n);
  const dummy=new THREE.Object3D();
  for(let i=0;i<n;i++){
    const t=(i-(n-1)/2)*6.4;
    dummy.position.set(axis==='x'?ox+t:ox, 4.6, axis==='z'?oz+t:oz);
    dummy.updateMatrix(); cols.setMatrixAt(i,dummy.matrix);
  }
  cols.castShadow=true; G.add(cols);
  const len=n*6.4;
  const roof=new THREE.Mesh(new THREE.BoxGeometry(axis==='x'?len:8,1.2,axis==='z'?len:8),ctx.M.lead);
  roof.position.set(ox,7.8,oz); roof.castShadow=true; G.add(roof);
  // small domes row, no finials
  const dg=new THREE.SphereGeometry(2.1,18,12,0,Math.PI*2,0,Math.PI/2);
  const domes=new THREE.InstancedMesh(dg,ctx.M.lead,n);
  for(let i=0;i<n;i++){ const t=(i-(n-1)/2)*6.4;
    dummy.position.set(axis==='x'?ox+t:ox,8.4,axis==='z'?oz+t:oz);dummy.rotation.set(0,0,0);dummy.updateMatrix();domes.setMatrixAt(i,dummy.matrix);}
  G.add(domes);
}
