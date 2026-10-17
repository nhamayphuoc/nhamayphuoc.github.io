(() => {
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
$('#yr').textContent = new Date().getFullYear();

if (!window.gsap) { document.body.classList.remove('lock'); return; }
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize:true }); /* thanh địa chỉ điện thoại co giãn không làm nhảy trang */

/* ---------- Cuộn mượt ---------- */
let lenis = null;
if (window.Lenis && !reduce) {
  lenis = new Lenis({ lerp: .09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollToEl = el => lenis ? lenis.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });

/* ---------- Menu mobile ---------- */
const burger = $('#burger');
const setMenu = open => {
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  if (lenis) open ? lenis.stop() : lenis.start();
};
burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2) { return; }
  const el = $(id); if (!el) return;
  e.preventDefault();
  const wasOpen = document.body.classList.contains('menu-open');
  setMenu(false);
  setTimeout(() => scrollToEl(el), wasOpen ? 60 : 0);
});

/* ---------- Thanh điều hướng ẩn/hiện ---------- */
const nav = $('#nav');
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => {
  nav.classList.toggle('hide', s.direction === 1 && s.scroll() > 240 && !document.body.classList.contains('menu-open'));
}});

/* ---------- Thanh chương bên trái ---------- */
const railLabel = $('#railLabel'), railFill = $('#railFill');
ScrollTrigger.create({ trigger: document.body, start: 0, end: 'max', onUpdate: s => { railFill.style.height = (s.progress * 100) + '%'; } });
$$('[data-chapter]').forEach(sec => {
  ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%',
    onToggle: s => { if (s.isActive) railLabel.textContent = sec.dataset.no + ' — ' + sec.dataset.chapter; } });
});
ScrollTrigger.create({ trigger: '#top', start: 'top top', end: 'bottom 50%', onToggle: s => { if (s.isActive) railLabel.textContent = 'Nhà May Phước'; } });

/* ---------- Con trỏ ---------- */
if (finePointer) {
  const cur = $('#cur'), curT = $('#curT');
  const xTo = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3' });
  const yTo = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3' });
  addEventListener('pointermove', e => { xTo(e.clientX); yTo(e.clientY); });
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('[data-cursor]');
    if (t) { curT.textContent = t.dataset.cursor; cur.classList.add('big'); }
    else cur.classList.remove('big');
  });
}

/* ============================================================
   VẢI PROCEDURAL (vẽ bằng canvas, không dùng gradient)
   ============================================================ */
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const SWATCHES = [
  { id:'tweed',   name:'Tweed hồng điểm nút màu', desc:'Nền hồng phấn, lưới chỉ và nút màu li ti — vui tươi mà vẫn lịch sự. Hợp tiệc cưới, sự kiện, những ngày muốn nổi bật nhẹ nhàng.' },
  { id:'black',   name:'Đen than',                desc:'Nghiêm trang, kín đáo, mặc dịp nào cũng đúng. Lựa chọn bền bỉ cho bộ veston đầu tiên.' },
  { id:'herring', name:'Xám xương cá',            desc:'Họa tiết xương cá cổ điển, nhìn xa phẳng lặng, nhìn gần mới thấy chiều sâu. Dành cho công sở.' },
  { id:'navy',    name:'Xanh navy kẻ sọc',        desc:'Sọc nhỏ mảnh trên nền xanh đậm — dáng vẻ của người đúng giờ và chỉn chu.' },
  { id:'linen',   name:'Lanh màu kem',            desc:'Thoáng, nhẹ, có vân vải tự nhiên. Hợp những ngày nắng miền Tây và các buổi lễ ngoài trời.' }
];
function fabricCanvas(type){
  const S=1024, c=document.createElement('canvas'); c.width=c.height=S; const g=c.getContext('2d'); const r=rng(type.length*97+13);
  const fill=col=>{g.fillStyle=col;g.fillRect(0,0,S,S)};
  const speck=(n,a)=>{for(let i=0;i<n;i++){g.fillStyle=r()>.5?`rgba(255,255,255,${a})`:`rgba(0,0,0,${a})`;g.fillRect(r()*S,r()*S,1.6,1.6)}};
  if(type==='tweed'){
    fill('#EDBDC5');
    g.lineWidth=1; g.strokeStyle='rgba(255,255,255,.18)';
    for(let y=0;y<S;y+=4){g.beginPath();g.moveTo(0,y);g.lineTo(S,y);g.stroke()}
    g.strokeStyle='rgba(120,60,70,.06)';
    for(let x=0;x<S;x+=4){g.beginPath();g.moveTo(x,0);g.lineTo(x,S);g.stroke()}
    const pal=['#2B3A8C','#C2453F','#F4F1E8','#5F9E6B','#E2A03A','#8A5CAE','#4C86C6'], cell=128, pick=()=>pal[Math.floor(r()*pal.length)];
    g.lineWidth=2.2; g.setLineDash([10,7]);
    for(let i=0;i<=S/cell;i++){const p=i*cell;
      g.strokeStyle=pick();g.beginPath();g.moveTo(p,0);g.lineTo(p,S);g.stroke();
      g.strokeStyle=pick();g.beginPath();g.moveTo(0,p);g.lineTo(S,p);g.stroke();}
    g.setLineDash([]);
    for(let i=0;i<=S/cell;i++)for(let j=0;j<=S/cell;j++){
      g.fillStyle=pick();g.beginPath();g.arc(i*cell,j*cell,6,0,7);g.fill();
      for(let k=1;k<4;k++){
        g.fillStyle=pick();g.beginPath();g.arc(i*cell+k*32,j*cell,3.2,0,7);g.fill();
        g.fillStyle=pick();g.beginPath();g.arc(i*cell,j*cell+k*32,3.2,0,7);g.fill();}
    }
    speck(2500,.12);
  } else if(type==='black'){
    fill('#1d1b1a'); g.lineWidth=2;
    for(let i=-S;i<S;i+=6){g.strokeStyle='rgba(255,255,255,.05)';g.beginPath();g.moveTo(i,0);g.lineTo(i+S,S);g.stroke()}
    speck(5000,.07);
  } else if(type==='herring'){
    fill('#3b3b3e');
    for(let row=0;row<S/24;row++)for(let x=0;x<S;x+=12){
      const a=row%2===0; g.lineWidth=3; g.strokeStyle='rgba(255,255,255,.1)';
      g.beginPath();g.moveTo(x,row*24+(a?0:24));g.lineTo(x+12,row*24+(a?24:0));g.stroke();
      g.strokeStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(x+6,row*24+(a?0:24));g.lineTo(x+18,row*24+(a?24:0));g.stroke();
    }
    speck(3000,.06);
  } else if(type==='navy'){
    fill('#1b2548'); g.lineWidth=2;
    for(let i=-S;i<S;i+=6){g.strokeStyle='rgba(255,255,255,.04)';g.beginPath();g.moveTo(i,0);g.lineTo(i+S,S);g.stroke()}
    g.lineWidth=1.6; g.strokeStyle='rgba(222,214,192,.85)';
    for(let x=20;x<S;x+=40){g.beginPath();g.moveTo(x,0);g.lineTo(x,S);g.stroke()}
    speck(3000,.07);
  } else { /* linen */
    fill('#E6DCC4');
    g.lineWidth=1;
    for(let i=0;i<3200;i++){const x=r()*S,y=r()*S,l=10+r()*36,h=r()>.5;g.strokeStyle=`rgba(120,100,70,${.06+r()*.1})`;g.beginPath();g.moveTo(x,y);g.lineTo(h?x+l:x,h?y:y+l);g.stroke()}
    g.strokeStyle='rgba(0,0,0,.03)';
    for(let i=0;i<S;i+=3){g.beginPath();g.moveTo(0,i);g.lineTo(S,i);g.stroke();g.beginPath();g.moveTo(i,0);g.lineTo(i,S);g.stroke()}
    speck(2500,.08);
  }
  return c;
}
const canvases = {}; SWATCHES.forEach(s => canvases[s.id] = fabricCanvas(s.id));
const thumb = id => { const t=document.createElement('canvas'); t.width=t.height=96; t.getContext('2d').drawImage(canvases[id],0,0,300,300,0,0,96,96); return t.toDataURL('image/jpeg',.8); };

/* ============================================================
   THREE.JS — tiện ích chung
   ============================================================ */
const hasGL = (() => { try { const c=document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl')||c.getContext('experimental-webgl'))); } catch(e){ return false; } })();
function makeRenderer(host){
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  host.appendChild(renderer.domElement);
  return renderer;
}
function texFrom(id, repX, repY){
  const t = new THREE.CanvasTexture(canvases[id]);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repX, repY);
  t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.needsUpdate = true; return t;
}
function watchVisible(el, cb){ const io = new IntersectionObserver(es => cb(es[0].isIntersecting), { rootMargin:'100px' }); io.observe(el); }

/* ---------- HERO: tấm vải tweed lay động ---------- */
/* ---------- HERO: ma-nơ-canh thợ may (kéo xoay · ghim kim · thước dây · đổi vải) ---------- */
function initHero(){
  const host = $('#heroCanvas'), arch = $('.arch');
  const renderer = makeRenderer(host);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 3/4, .1, 100); camera.position.set(0, 0, 14.5);
  scene.add(new THREE.AmbientLight(0xffffff, .8));
  const key = new THREE.DirectionalLight(0xfff1de, 1.0); key.position.set(3, 5, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe2c0, .35); rim.position.set(-5, 2, -4); scene.add(rim);

  const model = new THREE.Group(); model.position.y = .85; scene.add(model);
  const ZS = .72; /* thân dẹt hơn theo chiều sâu */

  /* ----- dáng thân: bán kính theo chiều cao, nội suy Hermite mượt ----- */
  const CP = [[-2.0,1.30],[-1.8,1.40],[-1.45,1.46],[-0.9,1.22],[-0.38,1.10],[0.2,1.30],[0.8,1.50],[1.3,1.52],[1.7,1.50],[1.98,1.30],[2.2,.80],[2.36,.42],[2.5,.34]];
  const slope = i => { const a = CP[Math.max(i-1,0)], b = CP[Math.min(i+1,CP.length-1)]; return (b[1]-a[1])/(b[0]-a[0]); };
  const prof = y => {
    y = Math.min(CP[CP.length-1][0], Math.max(CP[0][0], y));
    let i = 0; while (i < CP.length-2 && y > CP[i+1][0]) i++;
    const [y0,r0] = CP[i], [y1,r1] = CP[i+1], h = y1-y0, t = (y-y0)/h, m0 = slope(i)*h, m1 = slope(i+1)*h, t2 = t*t, t3 = t2*t;
    return (2*t3-3*t2+1)*r0 + (t3-2*t2+t)*m0 + (-2*t3+3*t2)*r1 + (t3-t2)*m1;
  };
  let cur = 'tweed';
  const mat = new THREE.MeshStandardMaterial({ map: texFrom('tweed', 2, 1.3), roughness:.95, metalness:0, side:THREE.DoubleSide });
  const lp = []; for (let k = 0; k <= 80; k++) { const y = -2.0 + 4.5*k/80; lp.push(new THREE.Vector2(Math.max(.001, prof(y)), y)); }
  const torso = new THREE.Mesh(new THREE.LatheGeometry(lp, 72), mat); torso.scale.z = ZS; model.add(torso);

  /* ----- phần gỗ, đồng, chân đế ----- */
  const wood  = new THREE.MeshStandardMaterial({ color:0x9C6B35, roughness:.55, metalness:.1 });
  const brass = new THREE.MeshStandardMaterial({ color:0xA9854F, metalness:.75, roughness:.3 });
  const dark  = new THREE.MeshStandardMaterial({ color:0x2a241e, metalness:.4, roughness:.45 });
  const add = (geo, m, x, y, z, sz) => { const o = new THREE.Mesh(geo, m); o.position.set(x,y,z); if (sz) o.scale.z = sz; model.add(o); return o; };
  add(new THREE.CylinderGeometry(.37,.37,.08,48), wood, 0, 2.52, 0, ZS);
  add(new THREE.CylinderGeometry(.06,.06,.42,16), wood, 0, 2.78, 0);
  add(new THREE.SphereGeometry(.17,24,20), wood, 0, 3.02, 0);
  add(new THREE.CylinderGeometry(1.36,1.36,.08,64), wood, 0, -2.03, 0, ZS);
  add(new THREE.CylinderGeometry(.07,.07,2.35,16), dark, 0, -3.25, 0);
  add(new THREE.SphereGeometry(.15,20,16), brass, 0, -4.4, 0);
  const limb = (a, b, r, m) => {
    const d = new THREE.Vector3().subVectors(b, a), L = d.length();
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 10), m);
    c.position.copy(a).addScaledVector(d, .5);
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), d.normalize()); model.add(c);
  };
  for (let k = 0; k < 3; k++) {
    const th = k*Math.PI*2/3 + Math.PI/6, end = new THREE.Vector3(Math.cos(th)*1.45, -4.8, Math.sin(th)*1.3);
    limb(new THREE.Vector3(0,-4.4,0), end, .05, dark);
    const f = new THREE.Mesh(new THREE.SphereGeometry(.09,14,12), brass); f.position.copy(end); model.add(f);
  }
  const sh = new THREE.Mesh(new THREE.CircleGeometry(1.9,48), new THREE.MeshBasicMaterial({ color:0x16120E, transparent:true, opacity:.12 }));
  sh.rotation.x = -Math.PI/2; sh.position.y = -4.84; model.add(sh);

  /* ----- thước dây quấn quanh người (có đuôi rủ xuống) ----- */
  const TW = .2, N = 120, TJ = 12;
  const mkTex = c => { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const tc = document.createElement('canvas'); tc.width = 1600; tc.height = 96;
  (() => {
    const g = tc.getContext('2d'); g.fillStyle = '#E2D5B2'; g.fillRect(0,0,1600,96); g.strokeStyle = 'rgba(22,18,14,.7)';
    for (let i = 0; i < 100; i++) {
      const x = i*16, len = i%10===0 ? 34 : i%5===0 ? 24 : 14; g.lineWidth = i%10===0 ? 2 : 1.2;
      g.beginPath(); g.moveTo(x+.5,0); g.lineTo(x+.5,len); g.stroke();
      if (i%10===0 && i>0) { g.font = '500 22px sans-serif'; g.fillStyle = '#16120E'; g.fillText(String(i), x+5, 60); }
    }
    g.fillStyle = '#7A1E27'; g.font = 'italic 600 20px serif'; for (let k = 0; k < 5; k++) g.fillText('Nhà May Phước', k*320+60, 86);
  })();
  const tl2 = document.createElement('canvas'); tl2.width = 96; tl2.height = 640;
  (() => {
    const g = tl2.getContext('2d'); g.fillStyle = '#E2D5B2'; g.fillRect(0,0,96,640); g.strokeStyle = 'rgba(22,18,14,.7)';
    for (let i = 0; i < 40; i++) {
      const y = i*16, len = i%10===0 ? 34 : i%5===0 ? 24 : 14; g.lineWidth = i%10===0 ? 2 : 1.2;
      g.beginPath(); g.moveTo(0,y+.5); g.lineTo(len,y+.5); g.stroke();
      if (i%10===0 && i>0) { g.font = '500 20px sans-serif'; g.fillStyle = '#16120E'; g.fillText(String(i), 42, y+7); }
    }
  })();
  const tGeo = new THREE.BufferGeometry(), tPos = new Float32Array((N+1)*6), tUv = new Float32Array((N+1)*4), tIdx = [];
  for (let i = 0; i <= N; i++) tUv.set([i/N,1, i/N,0], i*4);
  for (let i = 0; i < N; i++) { const a = i*2; tIdx.push(a,a+1,a+2, a+1,a+3,a+2); }
  tGeo.setAttribute('position', new THREE.BufferAttribute(tPos,3)); tGeo.setAttribute('uv', new THREE.BufferAttribute(tUv,2)); tGeo.setIndex(tIdx);
  const tape = new THREE.Mesh(tGeo, new THREE.MeshStandardMaterial({ map:mkTex(tc), roughness:.8, side:THREE.DoubleSide })); tape.frustumCulled = false; model.add(tape);
  const aGeo = new THREE.BufferGeometry(), aPos = new Float32Array((TJ+1)*6), aUv = new Float32Array((TJ+1)*4), aIdx = [];
  for (let j = 0; j < TJ; j++) { const a = j*2; aIdx.push(a,a+1,a+2, a+1,a+3,a+2); }
  aGeo.setAttribute('position', new THREE.BufferAttribute(aPos,3)); aGeo.setAttribute('uv', new THREE.BufferAttribute(aUv,2)); aGeo.setIndex(aIdx);
  const tail = new THREE.Mesh(aGeo, new THREE.MeshStandardMaterial({ map:mkTex(tl2), roughness:.8, side:THREE.DoubleSide })); tail.frustumCulled = false; model.add(tail);

  function updateTape(y){
    for (let i = 0; i <= N; i++) {
      const ph = i/N*Math.PI*2, s = Math.sin(ph), c = Math.cos(ph);
      for (let r = 0; r < 2; r++) {
        const yy = y + (r ? -TW/2 : TW/2), R = prof(yy), k = (i*2+r)*3;
        tPos[k] = s*(R+.03); tPos[k+1] = yy; tPos[k+2] = c*(R*ZS+.03);
      }
    }
    tGeo.attributes.position.needsUpdate = true; tGeo.computeVertexNormals();
    const L = Math.max(.15, Math.min(1.3, y - TW/2 + 1.95));
    for (let j = 0; j <= TJ; j++) {
      const yy = y - TW/2 - (j/TJ)*L, z = prof(yy)*ZS + .045, k = j*6, v = 1 - (j/TJ)*(L/1.3);
      aPos[k] = -TW/2; aPos[k+1] = yy; aPos[k+2] = z; aPos[k+3] = TW/2; aPos[k+4] = yy; aPos[k+5] = z;
      aUv[j*4] = 0; aUv[j*4+1] = v; aUv[j*4+2] = 1; aUv[j*4+3] = v;
    }
    aGeo.attributes.position.needsUpdate = true; aGeo.attributes.uv.needsUpdate = true; aGeo.computeVertexNormals();
  }
  const T = { y:-.38 }; updateTape(T.y);
  const SPOTS = [.8, -.38, -1.45];
  const S = { rot:0, extra:0, scroll:0 };
  const moveTape = i => {
    gsap.to(T, { y:SPOTS[i], duration: reduce ? 0 : 1.1, ease:'power3.inOut', onUpdate: () => updateTape(T.y) });
    gsap.to(S, { rot: Math.round(S.rot/(Math.PI*2))*Math.PI*2, duration: reduce ? 0 : 1.1, ease:'power3.inOut' });
  };

  /* ----- kim ghim ----- */
  const pinsG = new THREE.Group(); model.add(pinsG); const pins = [];
  const steel = new THREE.MeshStandardMaterial({ color:0xDADADA, metalness:.8, roughness:.25 });
  const shaftGeo = new THREE.CylinderGeometry(.012,.012,.7,6); shaftGeo.translate(0,.35,0);
  const headGeo = new THREE.SphereGeometry(.06,14,12), HC = [0xA9854F,0x7A1E27,0xF4EEE0,0x1C2B6B]; let pc = 0;
  function addPin(p, n){
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
    inner.add(new THREE.Mesh(shaftGeo, steel));
    const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color:HC[pc++ % HC.length], roughness:.4, metalness:.3 })); head.position.y = .72; inner.add(head);
    const dir = n.clone().add(new THREE.Vector3((Math.random()-.5)*.7,(Math.random()-.5)*.7,(Math.random()-.5)*.7)).normalize();
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
    g.position.copy(p).addScaledVector(dir, -.12);
    pinsG.add(g); pins.push({ g, inner });
    if (pins.length > 36) { const o = pins.shift(); pinsG.remove(o.g); }
    gsap.fromTo(inner.position, { y:.9 }, { y:0, duration: reduce ? 0 : .5, ease:'back.out(1.6)' });
  }
  function clearPins(){
    pins.splice(0).forEach(p => gsap.to(p.inner.position, { y:1.2, duration:.4, ease:'power2.in', onComplete: () => pinsG.remove(p.g) }));
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function tryPin(e){
    const r = arch.getBoundingClientRect();
    ndc.set(((e.clientX-r.left)/r.width)*2-1, -(((e.clientY-r.top)/r.height)*2-1)); ray.setFromCamera(ndc, camera);
    model.updateMatrixWorld(true);
    const hit = ray.intersectObject(torso, false)[0]; if (!hit) return;
    const p = model.worldToLocal(hit.point.clone());
    const nw = hit.face.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(torso.matrixWorld)).normalize();
    const nl = nw.transformDirection(new THREE.Matrix4().copy(model.matrixWorld).invert());
    if (nl.dot(new THREE.Vector3(p.x,0,p.z).normalize()) < 0) nl.negate();
    addPin(p, nl);
  }

  /* ----- đổi vải: ma-nơ-canh xoay một vòng rồi "thay áo" ----- */
  const apply = id => { const old = mat.map; mat.map = texFrom(id, 2, 1.3); mat.needsUpdate = true; if (old) old.dispose(); };
  const chips = $('.hero-chips'), cap = $('#heroCap');
  const DEF = 'Kéo để xoay · chạm vào ma-nơ-canh để ghim kim · chọn vải bên dưới.';
  const CAPS = ['Vòng ngực — đo ở chỗ đầy nhất, chừa độ thoải mái khi cử động.', 'Vòng eo — chỗ làm nên khác biệt giữa áo may đo và áo may sẵn.', 'Vòng hông — để vạt áo, chân váy rơi đúng dáng.'];
  cap.textContent = DEF;
  SWATCHES.forEach(s => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'hchip'; b.title = s.name; b.setAttribute('aria-label', s.name);
    b.setAttribute('aria-pressed', s.id === cur); b.innerHTML = `<i style="background-image:url(${thumb(s.id)})"></i>`;
    b.addEventListener('click', () => {
      if (s.id === cur) return; cur = s.id;
      $$('.hchip', chips).forEach(x => x.setAttribute('aria-pressed', x === b)); cap.textContent = s.name;
      if (reduce) { apply(s.id); return; }
      gsap.to(S, { extra: S.extra + Math.PI*2, duration:1.3, ease:'power3.inOut' }); gsap.delayedCall(.55, () => apply(s.id));
    });
    chips.appendChild(b);
  });
  const btns = $$('.hero-btns button');
  btns.forEach(b => b.addEventListener('click', () => {
    if (b.dataset.m === 'clear') { clearPins(); return; }
    const i = +b.dataset.m; btns.forEach(x => x.setAttribute('aria-pressed', x === b)); moveTape(i); cap.textContent = CAPS[i];
  }));

  /* ----- điều khiển: kéo xoay, chạm để ghim ----- */
  let dragging = false, lastX = 0, vel = 0, idleT = 0, down = null, vis = true, t = 0;
  arch.addEventListener('pointerdown', e => { down = { x:e.clientX, y:e.clientY, t:performance.now() }; lastX = e.clientX; dragging = true; vel = 0; idleT = 0; arch.setPointerCapture(e.pointerId); });
  arch.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; S.rot += dx*.012; vel = dx*.012; idleT = 0; });
  arch.addEventListener('pointerup', e => {
    dragging = false;
    if (down && Math.hypot(e.clientX-down.x, e.clientY-down.y) < 6 && performance.now()-down.t < 450) tryPin(e);
    down = null;
  });
  arch.addEventListener('pointercancel', () => { dragging = false; down = null; });
  ScrollTrigger.create({ trigger:'#top', start:'top top', end:'bottom top', scrub:true, onUpdate: s => S.scroll = s.progress*Math.PI*1.1 });

  const resize = () => { const w = arch.clientWidth, h = arch.clientHeight; renderer.setSize(w, h); camera.aspect = w/h; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(arch); resize();
  watchVisible(arch, v => vis = v);

  gsap.ticker.add((_, dt) => {
    if (!vis) return;
    const d = (dt || 16)/1000; t += d;
    if (!dragging) { S.rot += vel; vel *= .94; idleT += d; }
    const idle = Math.min(1, Math.max(0, (idleT-1.5)/1.5));
    const sway = reduce ? 0 : Math.sin(t*.55)*.45*idle;
    model.rotation.y = S.rot + sway + S.extra + S.scroll;
    model.position.y = .85 + (reduce ? 0 : Math.sin(t*1.2)*.02);
    renderer.render(scene, camera);
  });
}

/* ---------- XƯỞNG VẢI: tấm vải treo trên thanh đồng ---------- */
let currentFabric = SWATCHES[0].id;
let setFabric = () => {};
function initLab(){
  const host = $('#labCanvas'), stage = $('#labStage');
  const renderer = makeRenderer(host);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100); camera.position.set(0, 0, 13);
  scene.add(new THREE.AmbientLight(0xffffff, .85));
  const dl = new THREE.DirectionalLight(0xfff0dc, 1.05); dl.position.set(3, 4, 6); scene.add(dl);
  const fill = new THREE.DirectionalLight(0xbcc6ff, .25); fill.position.set(-4, 0, 3); scene.add(fill);

  const group = new THREE.Group(); group.position.y = 2.35; scene.add(group);
  const brass = new THREE.MeshStandardMaterial({ color:0xA9854F, metalness:.7, roughness:.32 });
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 4.7, 24), brass); rod.rotation.z = Math.PI/2; group.add(rod);
  [-2.35, 2.35].forEach(x => { const b = new THREE.Mesh(new THREE.SphereGeometry(.17, 20, 20), brass); b.position.x = x; group.add(b); });

const CW = 4, CH = 5.1, SX = innerWidth < 700 ? 36 : 56, SY = innerWidth < 700 ? 46 : 70;
  const geo = new THREE.PlaneGeometry(CW, CH, SX, SY); geo.translate(0, -CH/2 - .06, 0);
  const base = Float32Array.from(geo.attributes.position.array);
  const mat = new THREE.MeshStandardMaterial({ map: texFrom(currentFabric, 1, 1.25), roughness:.95, side:THREE.DoubleSide });
  const cloth = new THREE.Mesh(geo, mat); group.add(cloth);
  const pos = geo.attributes.position;

  let vis = true, t = 0, rotY = 0, tRotY = 0, tRotX = 0, rotX = 0, dragging = false, lastX = 0, px = 0, py = 0, tpx = 0, tpy = 0, hover = 0, hoverT = 0;
  const resize = () => { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); camera.position.z = w / h < .95 ? 14.5 : 13; };
  new ResizeObserver(resize).observe(stage); resize();
  watchVisible(stage, v => vis = v);

  stage.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointerup', () => dragging = false);
  stage.addEventListener('pointercancel', () => dragging = false);
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
    tpx = nx * 2.9; tpy = -2.5 + ny * 3.2; hoverT = 1; tRotX = -ny * .1;
    if (dragging) { tRotY = Math.max(-1.1, Math.min(1.1, tRotY + (e.clientX - lastX) * .008)); lastX = e.clientX; }
  });
  stage.addEventListener('pointerleave', () => { hoverT = 0; tRotX = 0; });

  setFabric = id => {
    currentFabric = id;
    const old = mat.map; mat.map = texFrom(id, 1, 1.25); mat.needsUpdate = true; if (old) old.dispose();
    if (!reduce) gsap.fromTo(cloth.scale, { y:.02 }, { y:1, duration:1.1, ease:'power3.out' });
  };

  gsap.ticker.add((_, dt) => {
    if (!vis) return;
    t += (dt || 16) / 1000;
    if (!dragging) tRotY *= .965;
    rotY += (tRotY - rotY) * .1; rotX += (tRotX - rotX) * .08;
    group.rotation.y = rotY; group.rotation.x = rotX;
    px += (tpx - px) * .12; py += (tpy - py) * .12; hover += (hoverT - hover) * .08;
    const a = reduce ? 0 : 1;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i*3], y = base[i*3+1];
      const k = Math.min(1, Math.max(0, -y / CH));
      let z = (Math.sin(x*2.3 + t*1.2)*.10 + Math.sin(x*5.1 - t*.8)*.04 + Math.sin(y*1.4 + t*.9)*.02) * k * a;
      z += Math.sin(x*7) * .03 * k;
      const dx = x - px, dy = y - py;
      z += Math.exp(-(dx*dx + dy*dy) / .9) * .5 * hover * k;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true; geo.computeVertexNormals();
    renderer.render(scene, camera);
  });
}

/* ---------- Danh sách vải + thông tin ---------- */
(function buildSwatches(){
  const ul = $('#swatches'), info = $('#swInfo'), fSel = $('#fFab');
  fSel.innerHTML = '<option value="Chưa chọn — tư vấn tại tiệm">Chưa chọn — tư vấn tại tiệm</option>' + SWATCHES.map(s => `<option>${s.name}</option>`).join('');
  const show = id => {
    const s = SWATCHES.find(x => x.id === id);
    $$('.sw', ul).forEach(b => b.setAttribute('aria-pressed', b.dataset.id === id));
    info.querySelector('h3').textContent = s.name; info.querySelector('p').textContent = s.desc;
    if (!reduce) gsap.fromTo(info, { opacity:0, y:12 }, { opacity:1, y:0, duration:.6, ease:'power3.out' });
    setFabric(id);
  };
  SWATCHES.forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = `<button class="sw" type="button" data-id="${s.id}" aria-label="${s.name}" aria-pressed="false"><i style="background-image:url(${thumb(s.id)})"></i></button>`;
    ul.appendChild(li);
  });
  ul.addEventListener('click', e => { const b = e.target.closest('.sw'); if (b) show(b.dataset.id); });
  info.querySelector('h3').textContent = SWATCHES[0].name; info.querySelector('p').textContent = SWATCHES[0].desc;
  $$('.sw', ul)[0].setAttribute('aria-pressed', 'true');
  $('#useFabric').addEventListener('click', () => {
    const s = SWATCHES.find(x => x.id === currentFabric); fSel.value = s.name; scrollToEl($('#dat-may'));
  });
})();

/* ---------- Khởi tạo 3D (có dự phòng) ---------- */
if (hasGL && window.THREE) {
  try { initHero(); } catch (e) { console.warn(e); document.documentElement.classList.add('no-webgl'); }
  try { initLab(); } catch (e) { console.warn(e); }
} else {
  document.documentElement.classList.add('no-webgl');
  $('#labStage').style.background = '#1d1813';
}

/* ============================================================
   SỐ ĐO: bản vẽ tương tác
   ============================================================ */
(function measure(){
  const NS = 'http://www.w3.org/2000/svg';
  const M = [
    { n:'Vòng cổ',  x:200, y:66,  l:[170,58,230,58],   t:'Đo quanh chân cổ để ve áo ôm gọn sau gáy, không cấn cổ, không hở.' },
    { n:'Ngang vai', x:72,  y:96,  l:[72,84,328,84],    t:'Vai quyết định dáng áo. Đo từ đỉnh vai bên này sang bên kia, xem thêm tư thế đứng — vai xuôi hay vai ngang cần xử lý khác nhau.' },
    { n:'Vòng ngực', x:104, y:214, l:[104,214,296,214], t:'Đo ở chỗ đầy nhất của ngực, chừa độ thoải mái vừa đủ để cử động mà áo vẫn phẳng.' },
    { n:'Vòng eo',  x:106, y:320, l:[106,320,294,320], t:'Eo áo ôm vừa phải để tạo dáng, không bó. Chỗ này làm nên khác biệt giữa áo may đo và áo may sẵn.' },
    { n:'Dài tay',  x:342, y:234, l:[328,96,356,372],  t:'Tính từ đầu vai tới cổ tay, chừa để lộ một chút măng-séc sơ mi — chi tiết nhỏ, nhìn rất sang.' },
    { n:'Dài áo',   x:200, y:470, l:[200,58,200,470],  t:'Dài áo cân đối với tầm vóc: người cao, người thấp, người đầy đặn mỗi người một độ dài khác nhau.' }
  ];
  const hot = $('#mHot'), line = $('#mLine'), lab = $('#mLab'), list = $('#mList'), info = $('#mInfo');
  const nodes = [];
  M.forEach((m, i) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'hot'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', m.n);
    g.innerHTML = `<circle class="ring" cx="${m.x}" cy="${m.y}" r="9"/><circle class="dot" cx="${m.x}" cy="${m.y}" r="5.5"/><circle cx="${m.x}" cy="${m.y}" r="18" fill="transparent"/>`;
    g.addEventListener('click', () => pick(i));
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } });
    hot.appendChild(g); nodes.push(g);
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" aria-pressed="false">${m.n}</button>`;
    li.firstChild.addEventListener('click', () => pick(i)); list.appendChild(li);
  });
  function pick(i){
    const m = M[i], [x1,y1,x2,y2] = m.l, len = Math.hypot(x2-x1, y2-y1);
    nodes.forEach((n, k) => n.classList.toggle('on', k === i));
    $$('button', list).forEach((b, k) => b.setAttribute('aria-pressed', k === i));
    line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    const vertical = Math.abs(x2-x1) < Math.abs(y2-y1);
    lab.textContent = m.n;
    lab.setAttribute('text-anchor', vertical ? 'start' : 'middle');
    lab.setAttribute('x', vertical ? Math.max(x1,x2) + 10 : (x1+x2)/2);
    lab.setAttribute('y', vertical ? (y1+y2)/2 : y1 - 10);
    info.querySelector('h3').textContent = m.n; info.querySelector('p').textContent = m.t;
    gsap.fromTo(line, { strokeDasharray:len, strokeDashoffset:len }, { strokeDashoffset:0, duration:.8, ease:'power2.out' });
    gsap.fromTo(lab, { opacity:0 }, { opacity:1, duration:.5, delay:.4 });
    gsap.fromTo(info, { opacity:0, y:10 }, { opacity:1, y:0, duration:.5 });
  }
  /* vẽ nét bản vẽ khi cuộn tới */
  const paths = $$('#jacket .draw');
  paths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  gsap.set(['#jacket .btnc', '#mHot'], { opacity:0 });
  ScrollTrigger.create({ trigger:'#so-do', start:'top 65%', once:true, onEnter: () => {
    gsap.to(paths, { strokeDashoffset:0, duration:1.8, ease:'power2.inOut', stagger:.12 });
    gsap.to(['#jacket .btnc', '#mHot'], { opacity:1, duration:.8, delay:1.4 });
    setTimeout(() => pick(1), 1500);
  }});
  if (reduce) { paths.forEach(p => p.style.strokeDashoffset = 0); gsap.set(['#jacket .btnc','#mHot'], { opacity:1 }); pick(1); }
  info.querySelector('h3').textContent = 'Chọn một điểm đo'; info.querySelector('p').textContent = 'Chạm vào điểm tròn trên bản vẽ, hoặc chọn tên bên trên.';
})();

/* ============================================================
   TÁC PHẨM: kính lúp + cuộn ngang
   ============================================================ */
$$('.zoom').forEach(z => {
  const img = $('img', z), lens = $('.lens', z), Z = 2.6;
  z.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const r = z.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    lens.style.left = x + 'px'; lens.style.top = y + 'px';
    lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    lens.style.backgroundSize = `${r.width * Z}px ${r.height * Z}px`;
    lens.style.backgroundPosition = `${-(x * Z - 75)}px ${-(y * Z - 75)}px`;
  });
});

const mm = gsap.matchMedia();
mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
  const lb = $('.lb'), track = $('#lbTrack'), bar = $('#lbBar');
  lb.classList.add('pinned');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  const tween = gsap.to(track, { x: () => -dist(), ease:'none',
    scrollTrigger:{ trigger: lb, start:'top top', end: () => '+=' + (dist() + innerHeight * .2), pin:true, scrub:.7, anticipatePin:1, invalidateOnRefresh:true,
      onUpdate: s => bar.style.transform = `scaleX(${s.progress})` } });
  return () => { lb.classList.remove('pinned'); gsap.set(track, { clearProps:'transform' }); bar.style.transform = ''; };
});

/* ============================================================
   CHUYÊN MAY: accordion
   ============================================================ */
(function accordion(){
  const panels = $$('#acc .acc-p');
  const open = p => panels.forEach(x => x.classList.toggle('is-open', x === p));
  panels.forEach(p => {
    p.addEventListener('click', () => open(p));
    p.addEventListener('focus', () => open(p));
    if (finePointer) p.addEventListener('mouseenter', () => { if (matchMedia('(min-width:900px)').matches) open(p); });
  });
  $$('[data-pick]').forEach(a => a.addEventListener('click', () => { $('#fItem').value = a.dataset.pick; }));
})();

/* ============================================================
   QUY TRÌNH: sân khấu dính + đổi ảnh
   ============================================================ */
(function process(){
  const imgs = $$('.stage-img'), steps = $$('.step'), num = $('#stageNum');
  const set = i => {
    imgs.forEach((im, k) => im.classList.toggle('on', k === i));
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    num.textContent = String(i + 1).padStart(2, '0');
  };
  steps.forEach((s, i) => ScrollTrigger.create({ trigger:s, start:'top 58%', end:'bottom 58%', onToggle: self => { if (self.isActive) set(i); } }));
})();

/* ============================================================
   HIỆU ỨNG CUỘN CHUNG
   ============================================================ */
/* chữ hiện dần theo cuộn */
$$('.reveal-words').forEach(el => {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
  if (reduce) return;
  gsap.to($$('.w', el), { opacity:1, ease:'none', stagger:.06,
    scrollTrigger:{ trigger:el, start:'top 82%', end:'bottom 52%', scrub:true } });
});
/* ảnh mở như kéo rèm */
$$('[data-clip]').forEach(c => {
  const img = $('img', c);
  if (reduce) return;
  gsap.fromTo(c, { clipPath:'inset(100% 0 0 0)' }, { clipPath:'inset(0% 0 0 0)', duration:1.5, ease:'expo.out', scrollTrigger:{ trigger:c, start:'top 85%', once:true } });
  gsap.from(img, { scale:1.3, duration:2, ease:'expo.out', scrollTrigger:{ trigger:c, start:'top 85%', once:true } });
});
/* parallax nhẹ */
if (!reduce) $$('[data-parallax]').forEach(el => {
  gsap.to(el, { yPercent:+el.dataset.parallax, ease:'none', scrollTrigger:{ trigger:el, start:'top bottom', end:'bottom top', scrub:true } });
});
/* nâng nhẹ khi vào khung nhìn */
if (!reduce) ScrollTrigger.batch('[data-rise]', { start:'top 88%', once:true,
  onEnter: els => gsap.fromTo(els, { opacity:0, y:36 }, { opacity:1, y:0, duration:1.1, ease:'power3.out', stagger:.12 }) });
/* dải chữ chạy theo tốc độ cuộn */
$$('.strip-in').forEach(el => {
  const dir = +el.dataset.dir || 1;
  const spans = $$('span', el);
  const tw = gsap.fromTo(el, { xPercent: dir === 1 ? 0 : -50 }, { xPercent: dir === 1 ? -50 : 0, repeat:-1, duration:26, ease:'none' });
  if (reduce) { tw.pause(); return; }
  ScrollTrigger.create({ start:0, end:'max', onUpdate: s => {
    const boost = 1 + Math.min(Math.abs(s.getVelocity()) / 350, 6);
    tw.timeScale(s.direction * boost);
    gsap.to(tw, { timeScale: s.direction, duration:1.1, overwrite:true });
  }});
});
/* hero: tên tiệm trồi lên sau khi mở màn */
function heroIn(){
  const tl = gsap.timeline({ defaults:{ ease:'expo.out' } });
  tl.from('.hero h1 .rise', { yPercent:115, duration:1.5, stagger:.14 })
    .to('.hero .rise-fade', { opacity:1, y:0, duration:1.1, stagger:.1 }, '-=1.0')
    .from('#archWrap', { clipPath:'inset(100% 0 0 0)', duration:1.8 }, '-=1.4')
    .from('.badge', { scale:.4, rotation:-90, opacity:0, duration:1.4 }, '-=1.0');
  gsap.set('.hero .rise-fade', { y:20 });
}

/* ============================================================
   ĐẶT LỊCH
   ============================================================ */
(function booking(){
  const form = $('#bookForm'), msg = $('#formMsg'), date = $('#fDate');
  date.min = new Date().toISOString().slice(0, 10);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim() || !d.phone.trim()) { msg.textContent = 'Xin cho tiệm biết tên và số điện thoại để liên hệ lại.'; (d.name.trim() ? $('#fPhone') : $('#fName')).focus(); return; }
    const text = `Chào Nhà May Phước, mình là ${d.name.trim()} (${d.phone.trim()}). Mình muốn may ${d.item}` +
      (d.occasion ? `, dịp: ${d.occasion}` : '') + `. Vải quan tâm: ${d.fabric}.` +
      (d.date ? ` Ngày hẹn dự kiến: ${d.date.split('-').reverse().join('/')}.` : '') +
      (d.note.trim() ? ` Ghi chú: ${d.note.trim()}` : '');
    const done = () => { msg.textContent = 'Đã sao chép nội dung lịch hẹn. Zalo sẽ mở ra — chỉ cần dán và gửi cho tiệm.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => { msg.textContent = 'Zalo sẽ mở ra — bạn nhắn nội dung: ' + text; });
    else msg.textContent = 'Zalo sẽ mở ra — bạn nhắn nội dung: ' + text;
    window.open('https://zalo.me/0918779061', '_blank', 'noopener');
  });
})();

/* ============================================================
   THỬ ÁO ẢO — ma-nơ-canh co giãn theo số đo + áo veston dựng theo cấu hình
   (dán vào TRƯỚC khối PRELOADER, trong IIFE chính)
   ============================================================ */
(function fitting(){
  const stage = $('#fitStage'); if (!stage) return;
  const NUM = [['h','Chiều cao',150,195],['ch','Vòng ngực',76,125],['wa','Vòng eo',60,120],['hi','Vòng hông',80,125],['sh','Ngang vai',34,54]];
  const PRE = [['Gọn nhỏ',{h:160,ch:86,wa:72,hi:92,sh:40}],['Cân đối',{h:171,ch:95,wa:81,hi:97,sh:43}],['Cao lớn',{h:182,ch:106,wa:94,hi:104,sh:47}],['Nữ · đồng hồ cát',{h:162,ch:88,wa:68,hi:95,sh:37}]];
  const LAPEL = { notch:['Cổ bẻ','Ve cổ bẻ (notch): cổ điển, dùng được mọi dịp — lựa chọn thanh lịch và an toàn.'], peak:['Ve nhọn','Ve nhọn (peak): đầu ve vút lên, trang trọng, làm vai nhìn rộng và mạnh hơn.'], shawl:['Ve khăn','Ve khăn (shawl): đường ve tròn liền mạch, mặt bóng — dành cho lễ phục, tiệc tối.'] };
  const BTN = { 1:['1 cúc','Một cúc: gọn, hiện đại, ve áo dài và thanh.'], 2:['2 cúc','Hai cúc: chuẩn mực cho công sở và cưới hỏi, chỉ cài cúc trên.'], 3:['3 cúc','Ba cúc: cổ điển, ve áo cuộn nhẹ, dáng nhìn cao hơn.'] };
  const POCKET = { flap:['Túi nắp','Túi nắp: có nắp phủ, trang trọng vừa phải, dùng hằng ngày.'], welt:['Túi viền','Túi viền: chỉ một đường viền mảnh, gọn và thanh nhất, hợp lễ phục.'], patch:['Túi ốp','Túi ốp: túi may nổi bên ngoài, phóng khoáng, hợp vải lanh và dáng blazer.'] };
  const FIT = { om:['Ôm','Ôm: bám sát dáng, đường eo rõ.'], vua:['Vừa','Vừa: thoải mái mà vẫn gọn, hợp đa số người mặc.'], rong:['Rộng','Rộng: dễ cử động, áo đổ mềm, dáng thư thả.'] };
  const cfg = { h:171, ch:95, wa:81, hi:97, sh:43, fab:'tweed', lapel:'notch', btn:2, pocket:'flap', fit:'vua', sq:false };
  const C = { h:158, ch:84, wa:70, hi:88, sh:38 };            /* bắt đầu hơi nhỏ rồi "lớn" ra đúng số đo */
  if (reduce) NUM.forEach(([k]) => C[k] = cfg[k]);
  const g3 = {};                                               /* cầu nối UI → 3D */
  const fabName = () => SWATCHES.find(s => s.id === cfg.fab).name;
 
  /* ---------- tóm tắt & phiếu ---------- */
  const info = () => {
    const d = cfg.ch - cfg.wa, sz = cfg.ch < 88 ? 'S' : cfg.ch < 96 ? 'M' : cfg.ch < 104 ? 'L' : cfg.ch < 112 ? 'XL' : 'XXL';
    const shape = d >= 20 ? 'dáng chữ V' : d >= 10 ? 'dáng cân đối' : 'dáng chữ nhật';
    return { sz, shape, d };
  };
  const hash = s => { let h = 5381; for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return 'P' + (h >>> 0).toString(36).toUpperCase().slice(0, 5); };
  const code = () => hash(JSON.stringify(cfg));
  const lines = () => [
    ['Cao', cfg.h + ' cm'], ['Ngực / Eo / Hông', `${cfg.ch} / ${cfg.wa} / ${cfg.hi} cm`], ['Ngang vai', cfg.sh + ' cm'],
    ['Vải', fabName()], ['Ve áo', LAPEL[cfg.lapel][0]], ['Số cúc', BTN[cfg.btn][0]], ['Kiểu túi', POCKET[cfg.pocket][0]], ['Độ ôm', FIT[cfg.fit][0]]
  ].concat(cfg.sq ? [['Phụ kiện', 'Khăn cài túi ngực']] : []);
  function refresh(){
    const i = info();
    $('#fitRead').textContent = `Cỡ tham khảo ${i.sz} · ${i.shape} (ngực hơn eo ${i.d} cm).`;
    $('#fitTicket').innerHTML = `<div class="tk-h"><span>Phiếu may đo</span><b>${code()}</b></div>` +
      lines().map(r => `<div class="tk-r"><span>${r[0]}</span><i></i><b>${r[1]}</b></div>`).join('') +
      `<p class="tk-f">Cỡ tham khảo ${i.sz} · ${i.shape}</p>`;
    $('#fitTag').textContent = code();
  }
 
  /* ---------- điều khiển ---------- */
  const nums = $('#fitNums');
  NUM.forEach(([k, n, mn, mx]) => {
    const d = document.createElement('div'); d.className = 'sl';
    d.innerHTML = `<label for="fs_${k}">${n}</label><output id="fo_${k}">${cfg[k]} cm</output><input id="fs_${k}" type="range" min="${mn}" max="${mx}" step="1" value="${cfg[k]}">`;
    const inp = $('input', d);
    inp.addEventListener('input', () => { cfg[k] = +inp.value; $('#fo_' + k).textContent = cfg[k] + ' cm'; $$('#fitPresets button').forEach(b => b.setAttribute('aria-pressed', 'false')); g3.ring && g3.ring(k); refresh(); });
    inp.addEventListener('focus', () => g3.ring && g3.ring(k));
    inp.addEventListener('pointerdown', () => g3.ring && g3.ring(k));
    nums.appendChild(d);
  });
  const setNums = p => NUM.forEach(([k]) => { cfg[k] = p[k]; $('#fs_' + k).value = p[k]; $('#fo_' + k).textContent = p[k] + ' cm'; });
  PRE.forEach(([n, p], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = n; b.setAttribute('aria-pressed', i === 1);
    b.addEventListener('click', () => { setNums(p); $$('#fitPresets button').forEach(x => x.setAttribute('aria-pressed', x === b)); refresh(); });
    $('#fitPresets').appendChild(b);
  });
  function seg(id, map, key, note){
    const el = $(id), nt = $(note);
    Object.entries(map).forEach(([v, [t]]) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.setAttribute('aria-pressed', String(cfg[key]) === v);
      b.addEventListener('click', () => { cfg[key] = isNaN(v) ? v : +v; $$('button', el).forEach(x => x.setAttribute('aria-pressed', x === b)); nt.textContent = map[v][1]; g3.style && g3.style(); refresh(); });
      el.appendChild(b);
    });
    nt.textContent = map[cfg[key]][1];
  }
  seg('#sgLapel', LAPEL, 'lapel', '#ntLapel'); seg('#sgBtn', BTN, 'btn', '#ntBtn'); seg('#sgPocket', POCKET, 'pocket', '#ntPocket'); seg('#sgFit', FIT, 'fit', '#ntFit');
  $('#fitSq').addEventListener('change', e => { cfg.sq = e.target.checked; g3.style && g3.style(); refresh(); });
  SWATCHES.forEach(s => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'fchip'; b.title = s.name; b.setAttribute('aria-label', s.name);
    b.setAttribute('aria-pressed', s.id === cfg.fab); b.innerHTML = `<i style="background-image:url(${thumb(s.id)})"></i>`;
    b.addEventListener('click', () => { if (s.id === cfg.fab) return; cfg.fab = s.id; $$('.fchip').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#fabNote').textContent = s.name + ' — ' + s.desc; g3.fab && g3.fab(s.id); refresh(); });
    $('#fitFab').appendChild(b);
  });
  $('#fabNote').textContent = SWATCHES[0].name + ' — ' + SWATCHES[0].desc;
 
  /* ---------- gửi Zalo / điền form / lưu ảnh ---------- */
  const msg = $('#fitMsg');
  const summary = () => `Chào Nhà May Phước! Mình vừa thử áo ảo trên web, phiếu ${code()}:\n` + lines().map(r => `- ${r[0]}: ${r[1]}`).join('\n') + `\nMình muốn hẹn đo và may bộ này.`;
  $('#fitSend').addEventListener('click', () => {
    const t = summary();
    const done = () => { msg.textContent = 'Đã sao chép phiếu may. Zalo đang mở, chỉ cần dán và gửi cho tiệm.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => { msg.textContent = 'Zalo đang mở. Bạn nhắn giúp nội dung: ' + t.replace(/\n/g, ' '); });
    else msg.textContent = 'Zalo đang mở. Bạn nhắn giúp nội dung: ' + t.replace(/\n/g, ' ');
    window.open('https://zalo.me/0918779061', '_blank', 'noopener');
  });
  $('#fitForm').addEventListener('click', () => {
    $('#fItem').value = 'Veston'; $('#fFab').value = fabName();
    $('#fNote').value = `Phiếu ${code()}: ` + lines().map(r => `${r[0]} ${r[1]}`).join('; ');
    msg.textContent = 'Đã điền cấu hình vào form đặt lịch.'; scrollToEl($('#dat-may'));
  });
  $('#fitSnap').addEventListener('click', () => g3.snap ? g3.snap() : (msg.textContent = 'Thiết bị này chưa hỗ trợ dựng 3D để lưu ảnh.'));
  refresh();
 
  if (!(hasGL && window.THREE)) { $('.hint', stage).textContent = 'Thiết bị chưa hỗ trợ 3D — bạn vẫn có thể chọn cấu hình và gửi phiếu.'; return; }
  try { init3D(); } catch (e) { console.warn(e); $('.hint', stage).textContent = 'Không dựng được 3D — bạn vẫn có thể chọn cấu hình và gửi phiếu.'; }
 
  /* ============================================================
     3D
     ============================================================ */
  function init3D(){
    const ZS = .72, U = 7.4/175, K = 5.475, TX = 28;           /* ZS: độ dẹt · U: đơn vị/cm · K: chu vi → bán kính · TX: cm của 1 ô vải */
    const lerp = (a, b, t) => a + (b - a) * t;
    const renderer = makeRenderer($('#fitCanvas'));
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 4/5, .1, 100);
    scene.add(new THREE.AmbientLight(0xffffff, .8));
    const key = new THREE.DirectionalLight(0xfff1de, 1.05); key.position.set(3, 5, 8); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe2c0, .4); rim.position.set(-6, 3, -5); scene.add(rim);
    const pivot = new THREE.Group(); scene.add(pivot);
    const fig = new THREE.Group(); fig.scale.setScalar(U); fig.position.y = -4.5; pivot.add(fig);
    const dyn = new THREE.Group(); fig.add(dyn);
 
    const tcache = {};
    const tex = id => tcache[id] || (tcache[id] = Object.assign(new THREE.CanvasTexture(canvases[id]), { wrapS:THREE.RepeatWrapping, wrapT:THREE.RepeatWrapping, encoding:THREE.sRGBEncoding, anisotropy:8 }));
    const DS = THREE.DoubleSide, std = (o) => new THREE.MeshStandardMaterial(o);
    let shown = cfg.fab;
    const fabM = std({ map:tex(shown), roughness:.95, side:DS }), lapM = std({ map:tex(shown), roughness:.9, side:DS });
    const bodyM = std({ color:0xD9CBAE, roughness:.9 }), woodM = std({ color:0x9C6B35, roughness:.55, metalness:.1 }), steelM = std({ color:0x2a241e, metalness:.4, roughness:.45 });
    const shirtM = std({ color:0xF6F1E6, roughness:.9, side:DS }), sqM = std({ color:0x7A1E27, roughness:.8, side:DS }), sq2M = std({ color:0xEFE6D2, roughness:.8, side:DS });
    const brassM = std({ color:0xA9854F, metalness:.75, roughness:.3 }), hornM = std({ color:0x2b211a, roughness:.35 });
    const dk = o => new THREE.MeshBasicMaterial({ color:0x16120E, transparent:true, opacity:o, side:DS });
    const outM = dk(.5), hemM = dk(.22), seamM = dk(.45), slitM = new THREE.MeshBasicMaterial({ color:0x0d0a08, side:DS });
    const ringM = new THREE.MeshBasicMaterial({ color:0xE2A03A, transparent:true, opacity:0, depthTest:false });
 
    const M = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); dyn.add(o); return o; };
    const uvs = (g, su, sv) => { const a = g.attributes.uv; for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i)*su, a.getY(i)*sv); return g; };
    const lathe = (f, y0, y1, n) => { const p = []; for (let i = 0; i <= n; i++) { const y = lerp(y0, y1, i/n); p.push(new THREE.Vector2(Math.max(.01, f(y)), y)); } return p; };
 
    /* vòng đo hiện khi kéo thanh trượt */
    const ring = new THREE.Mesh((() => { const g = new THREE.TorusGeometry(1, .02, 8, 72); g.rotateX(Math.PI/2); return g; })(), ringM); ring.renderOrder = 9; fig.add(ring);
    let RA = {}, ringKey = null, ringT = 0;
    const placeRing = () => { if (!ringKey || !RA[ringKey]) return; const [y, a] = RA[ringKey]; ring.position.y = y; ring.scale.set(a, a, a*ZS); };
    g3.ring = k => { ringKey = k; ringT = 1.8; placeRing(); };
 
    let jr = () => 0;
    /* lưới bám theo mặt áo: dùng cho ve, túi, khăn, sơ mi */
    function grid(f, ny, nx, off, mat){
      const pos = [], uv = [], idx = [];
      for (let i = 0; i <= ny; i++){ const r = f(i/ny); for (let j = 0; j <= nx; j++){
        const x = lerp(r.xa, r.xb, j/nx), a = jr(r.y), z = ZS*Math.sqrt(Math.max(0, a*a - x*x)) + off;
        pos.push(x, r.y, z); uv.push(x/TX, r.y/TX);
      } }
      for (let i = 0; i < ny; i++) for (let j = 0; j < nx; j++){ const a = i*(nx+1)+j, b = a+1, c = a+nx+1, d = c+1; idx.push(a, c, b, b, c, d); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
      const m = new THREE.Mesh(g, mat); dyn.add(m); return m;
    }
 
    function build(){
      while (dyn.children.length){ const o = dyn.children.pop(); o.traverse(m => m.geometry && m.geometry.dispose()); }
      const { h:H, ch, wa, hi, sh } = C, A = c => c/K, ach = A(ch), awa = A(wa), ahi = A(hi);
      /* thân ma-nơ-canh: bán kính theo chiều cao, nội suy Hermite */
      const pts = [[.42,ahi*.92],[.51,ahi],[.565,lerp(ahi,awa,.55)],[.615,awa],[.665,lerp(awa,ach,.6)],[.715,ach],[.76,ach+(sh/2-ach)*.28],[.795,sh/2*.93],[.822,sh/2*.62],[.848,8.4],[.88,6],[.9,4.6]].map(p => [p[0]*H, p[1]]);
      const sl = i => { const a = pts[Math.max(i-1,0)], b = pts[Math.min(i+1,pts.length-1)]; return (b[1]-a[1])/(b[0]-a[0]); };
      const prof = y => { y = Math.min(pts[pts.length-1][0], Math.max(pts[0][0], y)); let i = 0; while (i < pts.length-2 && y > pts[i+1][0]) i++;
        const [y0,r0] = pts[i], [y1,r1] = pts[i+1], d = y1-y0, t = (y-y0)/d, m0 = sl(i)*d, m1 = sl(i+1)*d, t2 = t*t, t3 = t2*t;
        return (2*t3-3*t2+1)*r0 + (t3-2*t2+t)*m0 + (-2*t3+3*t2)*r1 + (t3-t2)*m1; };
      M(new THREE.LatheGeometry(lathe(prof, .42*H, .9*H, 48), 48), bodyM).scale.z = ZS;
      const cap = M(new THREE.CircleGeometry(4.6, 24), bodyM, 0, .9*H, 0); cap.rotation.x = -Math.PI/2; cap.scale.y = ZS;
      M(new THREE.CylinderGeometry(1.6,1.6,.04*H,16), woodM, 0, .92*H, 0); M(new THREE.SphereGeometry(2.6,20,16), woodM, 0, .955*H, 0);
      M(new THREE.CylinderGeometry(.8,.8,.42*H,12), steelM, 0, .21*H, 0); M(new THREE.CylinderGeometry(26,28,2.4,40), woodM, 0, 1.2, 0);
      const sd = M(new THREE.CircleGeometry(46,40), dk(.18), 0, .1, 0); sd.rotation.x = -Math.PI/2;
 
      /* áo */
      const E = { om:1.5, vua:2.8, rong:4.2 }[cfg.fit];
      const ease = y => E*Math.min(1, Math.max(.35, (.9 - y/H)/.15));
      jr = y => prof(y) + ease(y) + (y < .47*H ? (.47*H - y)/(.03*H)*.7 : 0);
      const yH = .44*H, yT = .856*H, wy = .615*H, yTop = .846*H;
      lapM.color.setHex(cfg.lapel === 'shawl' ? 0x8a8a8a : 0xffffff); lapM.roughness = cfg.lapel === 'shawl' ? .35 : .9;
      M(uvs(new THREE.LatheGeometry(lathe(jr, yH, yT, 56), 64), 3.9, (yT-yH)/TX), fabM).scale.z = ZS;
      RA = { h:[.93*H, 9], ch:[.715*H, ach+ease(.715*H)+.7], wa:[.615*H, awa+ease(.615*H)+.7], hi:[.51*H, ahi+ease(.51*H)+.7], sh:[.795*H, sh/2*.93+ease(.795*H)+.7] }; placeRing();
      /* tay áo + vai */
      const rt = ach*.3 + E*.35, rb = 4.2 + E*.3, Ls = .335*H, sy = .795*H - 2;
      [-1, 1].forEach(s => {
        const sx = s*(sh/2*.94 + rt*.5), ang = .14, d = new THREE.Vector3(s*Math.sin(ang), -Math.cos(ang), 0);
        const m = M(uvs(new THREE.CylinderGeometry(rt, rb, Ls, 28, 1, true), 2*Math.PI*rt/TX, Ls/TX), fabM, sx + d.x*Ls/2, sy + d.y*Ls/2, 0);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), d.clone().negate());
        M(uvs(new THREE.SphereGeometry(rt, 20, 16), 2*Math.PI*rt/TX, Math.PI*rt/TX), fabM, sx, sy, 0);
      });
      /* cổ áo */
      const gap = 1.25, tg = new THREE.TorusGeometry(jr(yT) - .5, 1.35, 10, 36, 2*Math.PI - gap); tg.rotateZ(-Math.PI/2 + gap/2); tg.rotateX(-Math.PI/2);
      M(uvs(tg, 2*Math.PI*9/TX, 1), lapM, 0, yT + .3, 0).scale.z = ZS + .1;
 
      /* nút, ve áo, sơ mi */
      const B = { 1:[wy+1], 2:[wy+2, wy-8.5], 3:[wy+8, wy, wy-8] }[cfg.btn];
      const yEnd = cfg.btn === 3 ? B[0] - 2 : B[0];
      const c = t => lerp(4.2, .8, Math.pow(t, .8));
      grid(t => ({ y:lerp(.856*H, yEnd, t), xa:-(c(t) + .8), xb:c(t) + .8 }), 20, 4, .15, shirtM);
      const st = cfg.lapel, yTL = yTop + (st === 'peak' ? 2.5 : 0);
      const wf = t => st === 'notch' ? 7.4*(1 - .22*t) - 2.6*Math.exp(-Math.pow((t - .13)/.045, 2))
                    : st === 'peak' ? 9.4*(1 - .5*t) + 2.2*Math.exp(-Math.pow((t - .1)/.1, 2)) : 8.4*(1 - .4*t);
      [-1, 1].forEach(s => grid(t => { const y = lerp(yTL, yEnd, t); return { y, xa:s*c(t), xb:s*Math.min(c(t) + wf(t), .88*jr(y)) }; }, 28, 5, .45, lapM));
      grid(t => ({ y:lerp(yEnd, yH, t), xa:-.12, xb:.12 }), 8, 1, .3, seamM);
      const bm = shown === 'tweed' ? brassM : hornM;
      B.forEach(y => { const g = new THREE.CylinderGeometry(1.15, 1.15, .5, 20); g.rotateX(Math.PI/2); M(g, bm, 0, y, ZS*jr(y) + .45); });
 
      /* túi */
      const pY = .545*H;
      [-1, 1].forEach(s => {
        const xc = s*jr(pY)*.56, P = (y0, y1, w, off, m) => grid(t => ({ y:lerp(y0, y1, t), xa:xc - w, xb:xc + w }), 2, 6, off, m);
        if (cfg.pocket === 'flap'){ P(pY+3, pY-3.2, 7.8, .18, outM); P(pY+2.6, pY-2.6, 7.4, .5, fabM); P(pY-2.6, pY-3.5, 7.4, .3, outM); }
        else if (cfg.pocket === 'welt'){ P(pY+1.9, pY-1.9, 7.2, .18, outM); P(pY+.45, pY-.45, 6.6, .25, slitM); P(pY+1.7, pY+.45, 6.6, .5, fabM); P(pY-.45, pY-1.7, 6.6, .5, fabM); }
        else { P(pY+2.2, pY-12.4, 7.6, .18, outM); P(pY+2, pY-12, 7.2, .5, fabM); P(pY+2, pY+.6, 7.2, .52, hemM); }
      });
      const yB = .745*H, xb0 = jr(yB)*.5, Q = (y0, y1, w, off, m) => grid(t => ({ y:lerp(y0, y1, t), xa:xb0 - w, xb:xb0 + w }), 2, 5, off, m);
      Q(yB+1.4, yB-1.4, 5.6, .18, outM); Q(yB+.35, yB-.35, 5, .25, slitM); Q(yB+1.2, yB+.35, 5, .5, fabM); Q(yB-.35, yB-1.2, 5, .5, fabM);
      if (cfg.sq){
        grid(t => ({ y:lerp(yB+3, yB+.3, t), xa:xb0 + 1.2 - 3.4*t, xb:xb0 + 1.2 + 3.4*t }), 6, 4, .7, sq2M);
        grid(t => ({ y:lerp(yB+3.6, yB+.3, t), xa:xb0 - 1 - 4*t, xb:xb0 - 1 + 4*t }), 6, 4, .9, sqM);
      }
    }
 
    /* ---------- điều khiển ---------- */
    const S = { rot:0, extra:0 }, L = { z:19, y:-.4 };
    let dirty = true, vis = true, t = 0, drag = false, lastX = 0, vel = 0, idle = 0, zoomed = false;
    stage.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; drag = true; lastX = e.clientX; vel = 0; idle = 0; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - lastX; lastX = e.clientX; S.rot += dx*.012; vel = dx*.012; idle = 0; });
    ['pointerup','pointercancel'].forEach(n => stage.addEventListener(n, () => drag = false));
    const views = $$('.fit-views [data-v]');
    views.forEach(b => b.addEventListener('click', () => {
      views.forEach(x => x.setAttribute('aria-pressed', x === b));
      const goal = [0, -.7, Math.PI][+b.dataset.v]; vel = 0; idle = 0;
      gsap.to(S, { rot: Math.round((S.rot - goal)/(Math.PI*2))*Math.PI*2 + goal, duration: reduce ? 0 : 1.1, ease:'power3.inOut' });
    }));
    $('#fitZoom').addEventListener('click', e => {
      zoomed = !zoomed; e.currentTarget.setAttribute('aria-pressed', zoomed);
      gsap.to(L, { z: zoomed ? 9.5 : 19, y: zoomed ? .9 : -.4, duration: reduce ? 0 : 1.2, ease:'power3.inOut' });
    });
    g3.style = () => { dirty = true; if (!reduce) gsap.fromTo(dyn.scale, { x:.985, z:.985 }, { x:1, z:1, duration:.55, ease:'back.out(3)' }); };
    const applyFab = id => { shown = id; fabM.map = lapM.map = tex(id); fabM.needsUpdate = lapM.needsUpdate = true; dirty = true; };
    g3.fab = id => { if (reduce) return applyFab(id); gsap.to(S, { extra:S.extra + Math.PI*2, duration:1.3, ease:'power3.inOut' }); gsap.delayedCall(.55, () => applyFab(id)); };
    g3.snap = () => {
      renderer.render(scene, camera);
      const src = renderer.domElement, c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
      const g = c.getContext('2d'); g.fillStyle = '#F4EEE0'; g.fillRect(0, 0, c.width, c.height); g.drawImage(src, 0, 0);
      g.fillStyle = '#7A1E27'; g.font = `italic ${Math.round(c.width*.06)}px "Cormorant Garamond",serif`; g.fillText('Nhà May Phước', c.width*.05, c.height*.94);
      g.font = `${Math.round(c.width*.028)}px "Be Vietnam Pro",sans-serif`; g.fillStyle = '#16120E'; g.fillText('Phiếu ' + code(), c.width*.05, c.height*.975);
      const a = document.createElement('a'); a.download = 'ao-cua-toi-' + code() + '.png'; a.href = c.toDataURL('image/png'); a.click();
      msg.textContent = 'Đã lưu ảnh. Gửi kèm khi nhắn Zalo để tiệm hình dung nhanh hơn.';
    };
 
    const resize = () => { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h); camera.aspect = w/h; camera.updateProjectionMatrix(); };
    new ResizeObserver(resize).observe(stage); resize();
    watchVisible(stage, v => vis = v);
    build();
 
    gsap.ticker.add((_, dt) => {
      if (!vis) return;
      const d = (dt || 16)/1000; t += d;
      let ch = false;
      NUM.forEach(([k]) => { const df = cfg[k] - C[k]; if (Math.abs(df) > .02){ C[k] += df*(reduce ? 1 : .14); ch = true; } else if (df){ C[k] = cfg[k]; ch = true; } });
      if (ch || dirty){ build(); dirty = false; }
      if (!drag){ S.rot += vel; vel *= .94; idle += d; }
      const sway = reduce ? 0 : Math.sin(t*.55)*.35*Math.min(1, Math.max(0, (idle - 1.5)/1.5));
      pivot.rotation.y = S.rot + sway + S.extra;
      ringT = Math.max(0, ringT - d); ringM.opacity += ((ringT > 0 ? .95 : 0) - ringM.opacity)*.12;
      camera.position.set(0, L.y, L.z); camera.lookAt(0, L.y, 0);
      renderer.render(scene, camera);
    });
  }
})();

/* ============================================================
   PRELOADER → mở màn
   ============================================================ */
(function preloader(){
  const pre = $('#pre');
  const finish = () => { document.body.classList.remove('lock'); if (pre) pre.style.display = 'none'; ScrollTrigger.refresh(); };
  if (!pre) { finish(); return; }
  if (reduce) { heroIn(); gsap.set('.hero .rise-fade', { opacity:1, y:0 }); finish(); return; }

  const NS = 'http://www.w3.org/2000/svg';
  const W = innerWidth, H = innerHeight;
  const $n = $('#preN'), clipR = $('#preClipR'), needle = $('#preNeedle'), tape = $('.pre-tape'),
        mark = $('#preMark'), slit = $('#preSlit'), sc = $('#preSc'), ticks = $('#preTicks'), draft = $('#preDraft');

  /* đường phấn trên giấy rập */
  draft.setAttribute('viewBox', `0 0 ${W} ${H}`);
  draft.innerHTML = [
    `M0 ${H*.3} H${W}`, `M0 ${H*.72} H${W}`, `M${W*.14} 0 V${H}`, `M${W*.86} 0 V${H}`,
    `M${W*.06} ${H} C ${W*.22} ${H*.55}, ${W*.42} ${H*.3}, ${W*.94} 0`,
    `M0 ${H*.84} Q ${W*.5} ${H*.5} ${W} ${H*.9}`
  ].map(d => `<path class="d" d="${d}" pathLength="1"/>`).join('');
  const lines = $$('.d', draft);
  gsap.set(lines, { strokeDasharray:1, strokeDashoffset:1 });

  /* vạch chia trên thước dây: 100 cm trải hết chiều ngang */
  const per = W / 100; let t = '';
  for (let i = 0; i <= 100; i++) {
    const x = i * per, big = i % 10 === 0, len = big ? 24 : i % 5 === 0 ? 16 : 9;
    t += `<line x1="${x}" y1="0" x2="${x}" y2="${len}" stroke="#16120E" stroke-opacity=".65" stroke-width="${big ? 1.4 : 1}"/>`;
    if (big && i > 0 && i < 100) t += `<text x="${x + 4}" y="44" font-size="11" fill="#16120E" font-family="Be Vietnam Pro,sans-serif">${i}</text>`;
  }
  ticks.setAttribute('width', W); ticks.innerHTML = t;

  gsap.set('.pre-name,.pre-sub', { opacity:0, y:14 });
  gsap.set(sc, { x:-90 });

  const run = () => {
    const stitch = $('.pre-stitch');
    let bb; try { bb = stitch.getBBox(); } catch (e) { bb = { x:120, width:560 }; }
    if (!bb.width) bb = { x:120, width:560 };
    const x0 = bb.x - 14, x1 = bb.x + bb.width + 14;
    const st = { p:0 };

    const render = () => {
      const p = st.p, edge = x0 + p * (x1 - x0);
      clipR.setAttribute('width', edge);
      needle.setAttribute('transform', `translate(${edge} ${140 + Math.sin(p * 70) * 30})`); /* kim lên xuống như đang may */
      tape.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
      mark.style.left = Math.min(Math.max(p * W, 36), W - 36) + 'px';
      $n.textContent = Math.round(p * 100);
    };
    render();

    /* kéo chạy: hai lưỡi khép mở */
    const chat = gsap.timeline({ paused:true, repeat:-1, yoyo:true })
      .to('.b1', { rotation:-10, svgOrigin:'24 16', duration:.1 }, 0)
      .to('.b2', { rotation: 10, svgOrigin:'24 16', duration:.1 }, 0);

    const tl = gsap.timeline({ onComplete: finish });
    tl.to(lines, { strokeDashoffset:0, duration:1.4, ease:'power2.inOut', stagger:.15 }, 0)
      .to('.pre-name', { opacity:1, y:0, duration:.9, ease:'power3.out' }, .2)
      .to(st, { p:1, duration:2, ease:'power1.inOut', onUpdate:render }, .35)          /* may tên + kéo thước */
      .to('.pre-sub', { opacity:1, y:0, duration:.8, ease:'power3.out' }, 1.6)
      .to(needle, { opacity:0, duration:.3 }, 2.35)
      .to('.pre-fill', { opacity:1, duration:.7 }, 2.35)                                /* chữ được "thêu" xong */
      .to('.pre-stitch', { opacity:.35, duration:.7 }, 2.35)
      .to('.pre-stage,.pre-tape,.pre-mark,.pre-draft,.pre-skip', { opacity:0, duration:.5, ease:'power2.in' }, 3.15)
      .add(() => pre.classList.add('cut'), 3.2)                                         /* hiện đường may giữa */
      .add(() => chat.play(), 3.5)
      .to(sc, { x:W + 10, duration:.9, ease:'power1.inOut',
        onUpdate: () => { slit.style.width = Math.max(0, gsap.getProperty(sc, 'x') + 56) + 'px'; } }, 3.5)  /* kéo cắt dọc đường may */
      .add(() => chat.pause(), 4.4)
      .add(heroIn, 4.7)
      .to('.pre-half.t', { yPercent:-100, duration:1.2, ease:'expo.inOut' }, 4.5)       /* tấm vải tách đôi */
      .to('.pre-half.b', { yPercent: 100, duration:1.2, ease:'expo.inOut' }, 4.5)
      .to([slit, sc], { opacity:0, duration:.3 }, 4.5);

    pre.addEventListener('pointerdown', () => tl.timeScale(3.5));                       /* chạm để bỏ qua */
  };

  const fontsReady = (document.fonts && document.fonts.ready)
    ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))])
    : Promise.resolve();
  fontsReady.then(() => { try { run(); } catch (e) { console.warn(e); heroIn(); finish(); } });
  setTimeout(finish, 9000); /* chốt an toàn: lỡ lỗi thì trang vẫn mở */
})();

addEventListener('orientationchange', () => setTimeout(() => ScrollTrigger.refresh(), 350));

addEventListener('load', () => ScrollTrigger.refresh());
})();
