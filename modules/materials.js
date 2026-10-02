// materials.js — PBR procedural canvas textures + env-safe metals
import * as THREE from 'three';
import { canvasTex } from './geo.js';

export function buildMaterials(){
  const stoneTex = canvasTex(512,(g,s)=>{
    g.fillStyle='#cbbfa5'; g.fillRect(0,0,s,s);
    for(let y=0;y<8;y++)for(let x=0;x<8;x++){
      const off=(y%2)*32;
      const v=200+Math.random()*22|0;
      g.fillStyle=`rgb(${v},${v-12},${v-38})`;
      g.fillRect(x*64+off+1,y*64+1,62,62);
      g.fillStyle='rgba(90,70,50,.25)'; g.fillRect(x*64+off+1,y*64+61,62,2);
    }
    for(let i=0;i<900;i++){ g.fillStyle=`rgba(80,60,40,${Math.random()*0.08})`; g.fillRect(Math.random()*s,Math.random()*s,2,2); }
  },[10,10]);

  const plazaTex = canvasTex(512,(g,s)=>{
    g.fillStyle='#cfc6b2'; g.fillRect(0,0,s,s);
    g.strokeStyle='rgba(100,85,60,.5)'; g.lineWidth=2;
    for(let i=0;i<=8;i++){ g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,s);g.stroke();g.beginPath();g.moveTo(0,i*64);g.lineTo(s,i*64);g.stroke(); }
    for(let i=0;i<1400;i++){ g.fillStyle=`rgba(90,75,55,${Math.random()*0.1})`; g.fillRect(Math.random()*s,Math.random()*s,2,2); }
  },[60,40]);

  const tileTex = canvasTex(512,(g,s)=>{
    // Dome of the Rock Ottoman tiles: deep blue + turquoise + white arabesque
    const grad=g.createLinearGradient(0,0,0,s); grad.addColorStop(0,'#123a7d'); grad.addColorStop(1,'#0d2a5e');
    g.fillStyle=grad; g.fillRect(0,0,s,s);
    for(let y=0;y<8;y++)for(let x=0;x<8;x++){
      const cx=x*64+32, cy=y*64+32;
      g.strokeStyle=x%2? '#3fc1c9':'#e8d27a'; g.lineWidth=2.5;
      g.beginPath(); g.arc(cx,cy,20,0,Math.PI*2); g.stroke();
      g.beginPath(); g.moveTo(cx-20,cy); g.lineTo(cx+20,cy); g.moveTo(cx,cy-20); g.lineTo(cx,cy+20); g.stroke();
      g.fillStyle='rgba(255,255,255,.9)'; g.font='11px serif'; g.textAlign='center';
      g.fillText('✦',cx,cy+4);
    }
  },[6,1]);

  const marbleTex = canvasTex(512,(g,s)=>{
    g.fillStyle='#e9e4d8'; g.fillRect(0,0,s,s);
    for(let i=0;i<26;i++){ g.strokeStyle=`rgba(150,140,120,${0.12+Math.random()*0.2})`; g.lineWidth=1+Math.random()*3;
      g.beginPath(); let x=Math.random()*s,y=0; g.moveTo(x,y);
      for(let k=0;k<6;k++){ x+=(Math.random()-0.5)*90; y+=s/6; g.lineTo(x,y);} g.stroke(); }
  },[3,1]);

  const carpetTex = canvasTex(512,(g,s)=>{
    g.fillStyle='#7a1f1f'; g.fillRect(0,0,s,s);
    g.fillStyle='#a02828'; for(let y=0;y<4;y++)for(let x=0;x<4;x++) g.fillRect(x*128+8,y*128+8,112,112);
    g.strokeStyle='#e8c26a'; g.lineWidth=3;
    for(let y=0;y<4;y++)for(let x=0;x<4;x++){ g.strokeRect(x*128+12,y*128+12,104,104);
      g.beginPath(); g.arc(x*128+64,y*128+64,26,0,Math.PI*2); g.stroke(); }
    g.fillStyle='rgba(0,0,0,.18)'; for(let i=0;i<800;i++) g.fillRect(Math.random()*s,Math.random()*s,2,1);
  },[10,14]);

  const domeGoldTex = canvasTex(512,(g,s)=>{
    const gr=g.createLinearGradient(0,0,s,0); gr.addColorStop(0,'#8a5a12'); gr.addColorStop(.5,'#f3c860'); gr.addColorStop(1,'#8a5a12');
    g.fillStyle=gr; g.fillRect(0,0,s,s);
    g.fillStyle='rgba(120,70,10,.35)'; for(let i=0;i<32;i++) g.fillRect(i*16,0,2,s);
  },[4,1]);

  // Leaded-lattice stained glass (shared drop-in for aqsaMosque qGlass):
  // dark lead cames + amber/teal/cobalt panes. Day read stays dark via the
  // 0x2a2018 color multiplier (emissive-fix day-0 rule); night reads warm
  // through emissiveMap following the glassWarm tween (owner wires 1-line
  // ticker — see docs/w8-glass.md; same pattern as qGlass today).
  const stainedTex = canvasTex(256,(g,s)=>{
    const panes=['#d88f2a','#2a7f8f','#d88f2a','#24447a','#c9762a','#2a7f8f'];
    const cell=32;
    for(let y=0;y<s/cell;y++)for(let x=0;x<s/cell;x++){
      g.fillStyle=panes[(x+y*3)%panes.length];
      g.fillRect(x*cell,y*cell,cell,cell);
      g.fillStyle=`rgba(255,240,210,${Math.random()*0.18})`;
      g.fillRect(x*cell+4,y*cell+4,cell-8,cell-8);
    }
    g.strokeStyle='#16382b'; g.lineWidth=7;
    for(let i=0;i<=s/cell;i++){
      g.beginPath();g.moveTo(i*cell,0);g.lineTo(i*cell,s);g.stroke();
      g.beginPath();g.moveTo(0,i*cell);g.lineTo(s,i*cell);g.stroke();
    }
  },[1,1]);

  const M = {
    stone: new THREE.MeshStandardMaterial({map:stoneTex,color:0xe8dcc4,roughness:.85,metalness:.02,envMapIntensity:.22}),
    stoneLight: new THREE.MeshStandardMaterial({map:stoneTex,color:0xeadfc2,roughness:.8,envMapIntensity:.22}),
    marble: new THREE.MeshStandardMaterial({map:marbleTex,color:0xd9cfba,roughness:.45,metalness:.05,envMapIntensity:.35}),
    plaza: new THREE.MeshStandardMaterial({map:plazaTex,color:0xbfae90,roughness:.92,envMapIntensity:.2}),
    lead: new THREE.MeshStandardMaterial({color:0x9aa7b8,roughness:.48,metalness:.55,envMapIntensity:1.0}),
    leadDark: new THREE.MeshStandardMaterial({color:0x6b7686,roughness:.55,metalness:.5,envMapIntensity:.8}),
    gold: new THREE.MeshStandardMaterial({map:domeGoldTex,color:0xffffff,roughness:.28,metalness:1.0,envMapIntensity:1.25}),
    goldTrim: new THREE.MeshStandardMaterial({color:0xd9a441,roughness:.3,metalness:1.0,envMapIntensity:1.2,emissive:0x3a2405,emissiveIntensity:0.0}),
    tile: new THREE.MeshStandardMaterial({map:tileTex,roughness:.35,metalness:.08,envMapIntensity:.7}),
    white: new THREE.MeshStandardMaterial({color:0xf4efe2,roughness:.8,envMapIntensity:.3}),
    darkWood: new THREE.MeshStandardMaterial({color:0x4a2f18,roughness:.7}),
    carpet: new THREE.MeshStandardMaterial({map:carpetTex,roughness:.95}),
    glassWarm: new THREE.MeshPhysicalMaterial({color:0x3a2a18,roughness:.18,metalness:0.0,clearcoat:.8,clearcoatRoughness:.12,ior:1.5,thickness:.35,attenuationColor:new THREE.Color(0xc97a2e),attenuationDistance:1.2,envMapIntensity:.85,specularIntensity:1.0,emissive:0xffca7a,emissiveIntensity:0.0}),
    glassBlue: new THREE.MeshPhysicalMaterial({color:0x16294a,roughness:.14,metalness:0.0,clearcoat:.8,clearcoatRoughness:.1,ior:1.5,thickness:.5,attenuationColor:new THREE.Color(0x2a6f8f),attenuationDistance:1.0,envMapIntensity:.7,specularIntensity:1.0,emissive:0x6fb7ff,emissiveIntensity:0.0}),
    // drinking-glass clarity for lamp globes / chandelier bulbs (OPT-IN, transparent):
    // keep M.glassWarm on window planes (opaque, merge-stable); lamp owners adopt
    // this for globes + wire ticker gain 0.5x glassWarm (spec docs/w8-glass.md §3).
    glassClear: new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.06,metalness:0.0,transparent:true,opacity:.22,clearcoat:1.0,clearcoatRoughness:.05,ior:1.52,envMapIntensity:1.6,specularIntensity:1.0,emissive:0xffca7a,emissiveIntensity:0.0,depthWrite:false}),
    // leaded-lattice stained glass (OPT-IN drop-in for qibli qGlass; opaque):
    // same pane palette + color multiplier as aqsaMosque glassTex so day reads
    // identical-dark; night follows glassWarm via owner ticker (base stays 0.0).
    glassStained: new THREE.MeshPhysicalMaterial({map:stainedTex,emissiveMap:stainedTex,emissive:0xffca7a,emissiveIntensity:0.0,color:0x2a2018,roughness:.24,metalness:0.0,clearcoat:.6,clearcoatRoughness:.2,envMapIntensity:.9}),
    oliveLeaf: new THREE.MeshStandardMaterial({color:0x5a7048,roughness:.9,side:THREE.DoubleSide}),
    trunk: new THREE.MeshStandardMaterial({color:0x5a4632,roughness:.95}),
    cypress: new THREE.MeshStandardMaterial({color:0x2e4a2e,roughness:.92}),
    interiorWall: new THREE.MeshStandardMaterial({color:0xe8dcc2,roughness:.85}),
    bronze: new THREE.MeshStandardMaterial({color:0x8a6a2a,roughness:.4,metalness:.9,envMapIntensity:1.0}),
  };
  // fix muqarnas placeholder material
  M.stoneLight.side=THREE.DoubleSide;
  return M;
}
