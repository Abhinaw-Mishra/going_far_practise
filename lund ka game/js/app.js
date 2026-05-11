// ============================================
//  CODECLASH — App Router & State Management
// ============================================

import { audio } from './audio.js';
import { LandingScene } from './scenes/landing-scene.js';
import { LobbyScene } from './scenes/lobby-scene.js';
import { WinnerScene } from './scenes/winner-scene.js';
import { initLanding, destroyLanding } from './pages/landing.js';
import { initLobby, destroyLobby } from './pages/lobby.js';
import { initBattle, destroyBattle } from './pages/battle.js';
import { initWinner, destroyWinner } from './pages/winner.js';

class App {
  constructor() {
    this.currentPage = null;
    this.currentScene = null;
    this.renderer = null;
    this.animFrameId = null;
    this.audio = audio;
    this.lobbyScene = null;
    this.state = {
      p1Name: 'Player 1',
      p2Name: 'CyberBot',
      category: 'mixed',
      p1Score: 0, p2Score: 0, winner: null
    };
    this.pages = {
      landing: { init: initLanding, destroy: destroyLanding, scene: 'landing' },
      lobby: { init: initLobby, destroy: destroyLobby, scene: 'lobby' },
      battle: { init: initBattle, destroy: destroyBattle, scene: null },
      winner: { init: initWinner, destroy: destroyWinner, scene: 'winner' }
    };
  }

  init() {
    this._initRenderer();
    this._initNavigation();
    const hash = window.location.hash.slice(1) || 'landing';
    this.navigate(hash);
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.slice(1) || 'landing';
      if (h !== this.currentPage) this.navigate(h);
    });
    this._animate();
  }

  _initRenderer() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || typeof THREE === 'undefined') return;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    window.addEventListener('resize', () => {
      if (this.renderer) this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  _initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page) { this.audio.init(); this.audio.select(); this.navigate(page); }
      });
    });
  }

  navigate(page) {
    if (!this.pages[page]) return;
    // Destroy current
    if (this.currentPage && this.pages[this.currentPage]) {
      this.pages[this.currentPage].destroy();
    }
    if (this.currentScene) {
      this.currentScene.destroy();
      this.currentScene = null;
      this.lobbyScene = null;
      if (this.renderer) { this.renderer.setClearColor(0x000000, 0); this.renderer.clear(); }
    }
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });
    // Show target
    this.currentPage = page;
    window.location.hash = page;
    const pageEl = document.getElementById(page);
    if (pageEl) {
      pageEl.style.display = 'flex';
      void pageEl.offsetHeight;
      requestAnimationFrame(() => pageEl.classList.add('active'));
    }
    // Nav active state
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === page);
    });
    // Init scene
    const sceneType = this.pages[page].scene;
    if (sceneType && this.renderer) {
      switch (sceneType) {
        case 'landing': this.currentScene = new LandingScene(this.renderer); break;
        case 'lobby': this.currentScene = new LobbyScene(this.renderer); this.lobbyScene = this.currentScene; break;
        case 'winner': this.currentScene = new WinnerScene(this.renderer); break;
      }
      if (this.currentScene) this.currentScene.init();
    }
    // Init page logic
    this.pages[page].init(this);
  }

  _animate() {
    this.animFrameId = requestAnimationFrame(() => this._animate());
    if (this.currentScene) this.currentScene.update();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  window.__app = app;
});
