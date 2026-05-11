// ============================================
//  CODECLASH — Winner Scene (Three.js)
//  Spinning 3D Trophy
// ============================================

export class WinnerScene {
  constructor(renderer) {
    this.renderer = renderer;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 20);
    this.trophy = null;
    this.clock = new THREE.Clock();
    this.active = false;
    this.spotIntensity = 0;
    this._onResize = this._onResize.bind(this);
  }

  init() {
    this.active = true;
    this._createTrophy();
    this._createLighting();
    this._createParticles();
    window.addEventListener('resize', this._onResize);
  }

  _createTrophy() {
    this.trophy = new THREE.Group();

    // Base - cylinder
    const baseGeo = new THREE.CylinderGeometry(2.5, 3, 1.5, 8);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xffa500,
      emissiveIntensity: 0.3
    });
    const base = new THREE.Mesh(baseGeo, goldMat);
    base.position.y = -4;
    this.trophy.add(base);

    // Stem - thin cylinder
    const stemGeo = new THREE.CylinderGeometry(0.6, 0.8, 3, 8);
    const stem = new THREE.Mesh(stemGeo, goldMat);
    stem.position.y = -2;
    this.trophy.add(stem);

    // Cup - octahedron (top half)
    const cupGeo = new THREE.OctahedronGeometry(3, 1);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xffa500,
      emissiveIntensity: 0.4
    });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.y = 1.5;
    cup.scale.set(1, 1.3, 1);
    this.trophy.add(cup);

    // Star on top
    const starGeo = new THREE.OctahedronGeometry(1, 0);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffd700,
      emissiveIntensity: 0.8,
      metalness: 0.5,
      roughness: 0.2
    });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.y = 5.5;
    star.rotation.y = Math.PI / 4;
    this.trophy.add(star);

    // Handles (two torus halves)
    const handleGeo = new THREE.TorusGeometry(2, 0.3, 8, 16, Math.PI);
    const leftHandle = new THREE.Mesh(handleGeo, goldMat);
    leftHandle.position.set(-3, 1.5, 0);
    leftHandle.rotation.z = Math.PI / 2;
    this.trophy.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeo, goldMat.clone());
    rightHandle.position.set(3, 1.5, 0);
    rightHandle.rotation.z = -Math.PI / 2;
    this.trophy.add(rightHandle);

    this.trophy.position.y = -1;
    this.scene.add(this.trophy);
  }

  _createLighting() {
    const ambient = new THREE.AmbientLight(0x111122, 0.3);
    this.scene.add(ambient);

    this.spotlight = new THREE.SpotLight(0xffd700, 0, 50, Math.PI / 4, 0.5, 1);
    this.spotlight.position.set(0, 15, 10);
    this.spotlight.target.position.set(0, 0, 0);
    this.scene.add(this.spotlight);
    this.scene.add(this.spotlight.target);

    const rim1 = new THREE.PointLight(0x00d4ff, 0.5, 30);
    rim1.position.set(-10, 5, 5);
    this.scene.add(rim1);

    const rim2 = new THREE.PointLight(0x9b59ff, 0.5, 30);
    rim2.position.set(10, 5, 5);
    this.scene.add(rim2);
  }

  _createParticles() {
    const count = 300;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.84;
      colors[i * 3 + 2] = 0;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.starField = new THREE.Points(geo, mat);
    this.scene.add(this.starField);
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update() {
    if (!this.active) return;
    const t = this.clock.getElapsedTime();

    // Fade in spotlight
    this.spotIntensity = Math.min(this.spotIntensity + 0.01, 2);
    if (this.spotlight) this.spotlight.intensity = this.spotIntensity;

    if (this.trophy) {
      this.trophy.rotation.y = t * 0.5;
      this.trophy.position.y = -1 + Math.sin(t * 0.8) * 0.5;
    }

    if (this.starField) {
      this.starField.rotation.y = t * 0.02;
      const pos = this.starField.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += 0.02;
        if (pos[i + 1] > 25) pos[i + 1] = -25;
      }
      this.starField.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.active = false;
    window.removeEventListener('resize', this._onResize);
    if (this.trophy) {
      this.trophy.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    if (this.starField) {
      this.starField.geometry.dispose();
      this.starField.material.dispose();
    }
  }
}
