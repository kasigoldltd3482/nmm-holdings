(async () => {
  const host = document.querySelector('.hero-mark');
  if (!host || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-mark-3d';
  canvas.setAttribute('aria-hidden', 'true');
  host.append(canvas);
  let renderer;
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js');
    const { SVGLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/loaders/SVGLoader.js');
    const source = await fetch(new URL('nmm-mark-3d.svg', import.meta.url));
    if (!source.ok) throw new Error('NMM logo shape unavailable');
    const svg = new SVGLoader().parse(await source.text());
    const shapes = svg.paths.flatMap(path => SVGLoader.createShapes(path));
    const geometry = new THREE.ExtrudeGeometry(shapes, { depth: 18, bevelEnabled: true, bevelSegments: 3, bevelSize: 2, bevelThickness: 2, curveSegments: 8 });
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    geometry.translate(-(box.min.x + box.max.x) / 2, -(box.min.y + box.max.y) / 2, -(box.min.z + box.max.z) / 2);
    geometry.scale(0.00265, -0.00265, 0.00265);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, .1, 30);
    camera.position.set(0, 0, 4.9);
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xd7b35f, metalness: .76, roughness: .24 })),
      new THREE.Mesh(geometry.clone().scale(.997, .997, .8), new THREE.MeshStandardMaterial({ color: 0xf4d992, metalness: .83, roughness: .3, side: THREE.BackSide })));
    scene.add(group, new THREE.HemisphereLight(0xffe8b2, 0x18120a, 1.8));
    const key = new THREE.DirectionalLight(0xffdf93, 3.4); key.position.set(-3, 4, 6); scene.add(key);
    const rim = new THREE.PointLight(0xb8792d, 22, 9); rim.position.set(3, -1, 3); scene.add(rim);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.15 : 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    const resize = () => { const w=host.clientWidth,h=host.clientHeight; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); };
    addEventListener('resize', resize, { passive:true });
    const observer = new IntersectionObserver(([entry]) => { active=entry.isIntersecting; if(active) requestAnimationFrame(draw); });
    let active=false, frame=0, pointerX=0, pointerY=0;
    observer.observe(host);
    host.addEventListener('pointermove', e => { const r=host.getBoundingClientRect(); pointerX=((e.clientX-r.left)/r.width-.5)*.48; pointerY=((e.clientY-r.top)/r.height-.5)*.2; }, { passive:true });
    host.addEventListener('pointerleave', () => { pointerX=0; pointerY=0; }, { passive:true });
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden && active) requestAnimationFrame(draw); });
    host.classList.add('webgl-ready');
    function draw(now) {
      if (!active || document.hidden) return;
      const progress=Math.min(1, Math.max(0, -host.getBoundingClientRect().top / Math.max(innerHeight,1)));
      group.rotation.y += ((pointerX + .14 + progress * .55) - group.rotation.y) * .045;
      group.rotation.x += ((pointerY - .045) - group.rotation.x) * .045;
      group.rotation.z += (Math.sin(now*.00055)*.018 - group.rotation.z) * .025;
      renderer.render(scene,camera);
      frame=requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    canvas.addEventListener('webglcontextlost', () => { host.classList.remove('webgl-ready'); active=false; cancelAnimationFrame(frame); }, { once:true });
  } catch (error) {
    if (renderer) renderer.dispose();
    canvas.remove();
    console.warn('NMM 3D mark fell back to the original transparent logo.', error);
  }
})();
