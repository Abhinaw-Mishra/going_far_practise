// ============================================
//  CODECLASH — Landing Scene (Three.js)
//  Particles + Floating Geometries
// ============================================

export class LandingScene {
  constructor(renderer) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 30;
    this.particles = null;
    this.geometries = [];
    this.mouse = { x: 0, y: 0 };
    this.clock = new THREE.Clock();
    this.active = false;
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onResize = this._onResize.bind(this);
  }

  init() {
    this.active = true;
    this._createParticles();
    this._createGeometries();
    this._createLights();
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('resize', this._onResize);
  }

  _createParticles() {
    const count = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);

    const palette = [
      [0, 0.83, 1],
      [0.61, 0.35, 1],
      [1, 0.18, 0.61],
      [0, 1, 0.53]
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c[0];
      colors[i * 3 + 1] = c[1];
      colors[i * 3 + 2] = c[2];
      sizes[i] = Math.random() * 2 + 0.5;
      speeds[i] = Math.random() * 0.5 + 0.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.particleSpeeds = speeds;
    this.scene.add(this.particles);
  }

  _createGeometries() {
    const configs = [
      { geo: new THREE.IcosahedronGeometry(3, 0), color: 0x00d4ff, pos: [-12, 5, -5] },
      { geo: new THREE.IcosahedronGeometry(2, 1), color: 0x9b59ff, pos: [14, -4, -8] },
      { geo: new THREE.TorusGeometry(2.5, 0.6, 8, 24), color: 0xff2d9b, pos: [-8, -8, -3] },
      { geo: new THREE.TorusGeometry(3, 0.5, 8, 32), color: 0x00d4ff, pos: [10, 8, -10] },
      { geo: new THREE.OctahedronGeometry(2, 0), color: 0x00ff88, pos: [0, -12, -6] },
      { geo: new THREE.IcosahedronGeometry(1.5, 0), color: 0xff2d9b, pos: [18, 0, -12] },
      { geo: new THREE.TetrahedronGeometry(2, 0), color: 0x9b59ff, pos: [-16, 10, -8] }
    ];

    configs.forEach((cfg, i) => {
      const material = new THREE.MeshBasicMaterial({
        color: cfg.color,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      const mesh = new THREE.Mesh(cfg.geo, material);
      mesh.position.set(...cfg.pos);
      mesh.userData = {
        basePos: [...cfg.pos],
        rotSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02 },
        floatSpeed: 0.3 + Math.random() * 0.5,
        floatAmp: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      };
      this.scene.add(mesh);
      this.geometries.push(mesh);
    });
  }

  _createLights() {
    const ambient = new THREE.AmbientLight(0x111122, 0.5);
    this.scene.add(ambient);
  }

  _onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update() {
    if (!this.active) return;
    const t = this.clock.getElapsedTime();

    // Animate particles flowing
    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] -= this.particleSpeeds[i / 3] * 0.15;
        if (pos[i + 1] < -40) pos[i + 1] = 40;
        pos[i] += Math.sin(t + i) * 0.005;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.rotation.y = t * 0.02;
    }

    // Animate geometries
    this.geometries.forEach(mesh => {
      const d = mesh.userData;
      mesh.rotation.x += d.rotSpeed.x;
      mesh.rotation.y += d.rotSpeed.y;
      mesh.position.y = d.basePos[1] + Math.sin(t * d.floatSpeed + d.phase) * d.floatAmp;
      // React to mouse
      mesh.position.x = d.basePos[0] + this.mouse.x * 2;
      mesh.position.z = d.basePos[2] + this.mouse.y * 1.5;
    });

    this.camera.position.x += (this.mouse.x * 3 - this.camera.position.x) * 0.02;
    this.camera.position.y += (this.mouse.y * 2 - this.camera.position.y) * 0.02;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.active = false;
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('resize', this._onResize);
    this.geometries.forEach(m => {
      m.geometry.dispose();
      m.material.dispose();
    });
    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }
    this.geometries = [];
  }
}
