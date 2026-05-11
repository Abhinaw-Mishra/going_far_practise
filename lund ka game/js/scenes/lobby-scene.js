// ============================================
//  CODECLASH — Lobby Scene (Three.js)
//  Rotating Wireframe Sphere
// ============================================

export class LobbyScene {
  constructor(renderer) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 40;
    this.sphere = null;
    this.innerSphere = null;
    this.particles = null;
    this.clock = new THREE.Clock();
    this.active = false;
    this.pulseScale = 1;
    this._onResize = this._onResize.bind(this);
  }

  init() {
    this.active = true;
    this._createSphere();
    this._createParticles();
    window.addEventListener('resize', this._onResize);
  }

  _createSphere() {
    const geo = new THREE.IcosahedronGeometry(15, 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x9b59ff,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    this.sphere = new THREE.Mesh(geo, mat);
    this.scene.add(this.sphere);

    const innerGeo = new THREE.IcosahedronGeometry(10, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    this.innerSphere = new THREE.Mesh(innerGeo, innerMat);
    this.scene.add(this.innerSphere);
  }

  _createParticles() {
    const count = 500;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.8,
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  pulse() {
    this.pulseScale = 1.3;
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update() {
    if (!this.active) return;
    const t = this.clock.getElapsedTime();

    if (this.sphere) {
      this.sphere.rotation.x = t * 0.05;
      this.sphere.rotation.y = t * 0.08;
      this.pulseScale += (1 - this.pulseScale) * 0.02;
      this.sphere.scale.setScalar(this.pulseScale);
    }
    if (this.innerSphere) {
      this.innerSphere.rotation.x = -t * 0.07;
      this.innerSphere.rotation.y = -t * 0.04;
      this.innerSphere.scale.setScalar(this.pulseScale * 0.95);
    }
    if (this.particles) {
      this.particles.rotation.y = t * 0.01;
    }
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.active = false;
    window.removeEventListener('resize', this._onResize);
    [this.sphere, this.innerSphere, this.particles].forEach(obj => {
      if (obj) {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    });
  }
}
