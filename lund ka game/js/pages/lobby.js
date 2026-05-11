// ============================================
//  CODECLASH — Lobby Page Logic
// ============================================

let countdownInterval = null;

export function initLobby(app) {
  const p1Card = document.getElementById('p1-lobby-card');
  const p2Card = document.getElementById('p2-lobby-card');
  const p1Name = document.getElementById('p1-name');
  const chips = document.querySelectorAll('.chip');
  const startBtn = document.getElementById('start-match-btn');
  const overlay = document.getElementById('countdown-overlay');
  const countdownNum = document.getElementById('countdown-number');

  // Reset states
  if (p1Card) p1Card.classList.remove('ready');
  if (p2Card) p2Card.classList.remove('ready');
  if (overlay) { overlay.classList.remove('active'); overlay.style.display = 'none'; }

  // Player 1 ready on name input
  if (p1Name) {
    p1Name.value = app.state.p1Name || '';
    p1Name.addEventListener('input', () => {
      app.state.p1Name = p1Name.value || 'Player 1';
      if (p1Name.value.length > 0) {
        p1Card.classList.add('ready');
      } else {
        p1Card.classList.remove('ready');
      }
    });
    // Auto-ready P1 after brief delay
    setTimeout(() => {
      if (!p1Name.value) {
        p1Name.value = 'Player 1';
        app.state.p1Name = 'Player 1';
      }
      p1Card.classList.add('ready');
      if (app.lobbyScene) app.lobbyScene.pulse();
      app.audio.select();
    }, 800);
  }

  // Simulate P2 joining
  setTimeout(() => {
    if (p2Card) {
      p2Card.classList.add('ready');
      if (app.lobbyScene) app.lobbyScene.pulse();
      app.audio.select();
    }
  }, 2500);

  // Category chips
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      app.state.category = chip.dataset.category;
      app.audio.select();
    });
  });

  // Start Match
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      app.audio.init();
      startBtn.style.display = 'none';
      _startCountdown(app, overlay, countdownNum);
    });
  }

  // GSAP entrance
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('.lobby-content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
    gsap.fromTo('.player-card', { opacity: 0, x: (i) => i === 0 ? -60 : 60 }, 
      { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, delay: 0.3, ease: 'back.out(1.5)' });
    gsap.fromTo('.vs-section', { opacity: 0, scale: 0 }, 
      { opacity: 1, scale: 1, duration: 0.5, delay: 0.6, ease: 'elastic.out(1, 0.5)' });
  }
}

function _startCountdown(app, overlay, countdownNum) {
  let count = 3;
  overlay.style.display = 'flex';
  overlay.classList.add('active');
  countdownNum.textContent = count;
  countdownNum.className = 'countdown-number';

  // Shockwave
  const shockwave = document.getElementById('shockwave');

  countdownInterval = setInterval(() => {
    count--;
    app.audio.countdownBeep();
    
    if (shockwave) {
      shockwave.classList.remove('pulse');
      void shockwave.offsetWidth;
      shockwave.classList.add('pulse');
    }

    if (count > 0) {
      countdownNum.textContent = count;
      countdownNum.classList.add('pop');
      setTimeout(() => countdownNum.classList.remove('pop'), 300);
    } else if (count === 0) {
      countdownNum.textContent = 'FIGHT!';
      countdownNum.classList.add('fight');
      app.audio.countdownFinal();
    } else {
      clearInterval(countdownInterval);
      countdownInterval = null;
      app.navigate('battle');
    }
  }, 1000);
}

export function destroyLobby() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}
