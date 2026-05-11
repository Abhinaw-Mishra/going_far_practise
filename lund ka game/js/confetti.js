// ============================================
//  CODECLASH — Canvas Confetti Cannon
// ============================================

const COLORS = ['#00d4ff', '#9b59ff', '#ff2d9b', '#00ff88', '#ffd700', '#ff4444', '#ffffff'];

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 20;
    this.vy = Math.random() * -18 - 5;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.size = Math.random() * 8 + 3;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 15;
    this.gravity = 0.4;
    this.drag = 0.98;
    this.opacity = 1;
    this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
    this.width = this.size * (0.5 + Math.random());
    this.height = this.size * (0.3 + Math.random() * 0.7);
  }

  update() {
    this.vy += this.gravity;
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.opacity -= 0.005;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    if (this.shape === 'rect') {
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class ConfettiCannon {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.resize();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(count = 250) {
    this.resize();
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height * 0.4;
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(cx + (Math.random() - 0.5) * 200, cy));
    }
    if (!this.animating) {
      this.animating = true;
      this._animate();
    }
  }

  _animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => {
      p.update();
      p.draw(this.ctx);
    });
    this.particles = this.particles.filter(p => p.opacity > 0 && p.y < this.canvas.height + 50);
    if (this.particles.length > 0) {
      requestAnimationFrame(() => this._animate());
    } else {
      this.animating = false;
    }
  }

  clear() {
    this.particles = [];
    this.animating = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
