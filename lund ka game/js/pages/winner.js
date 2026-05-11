// ============================================
//  CODECLASH — Winner Page Logic
// ============================================

import { ConfettiCannon } from '../confetti.js';

let confetti = null;
let rainAnimFrame = null;

export function initWinner(app) {
  const winnerName = document.getElementById('winner-name');
  const winnerScore = document.getElementById('winner-score');
  const winnerSubtitle = document.getElementById('winner-subtitle');
  const loserName = document.getElementById('loser-name');
  const loserScore = document.getElementById('loser-score');
  const replayBtn = document.getElementById('replay-btn');
  const shareBtn = document.getElementById('share-btn');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const rainCanvas = document.getElementById('rain-canvas');
  const spotlight = document.getElementById('winner-spotlight');
  const loserSection = document.getElementById('loser-section');

  const isP1Winner = app.state.winner === 'p1';
  const wName = isP1Winner ? (app.state.p1Name || 'Player 1') : 'CyberBot';
  const lName = isP1Winner ? 'CyberBot' : (app.state.p1Name || 'Player 1');
  const wScore = isP1Winner ? app.state.p1Score : app.state.p2Score;
  const lScore = isP1Winner ? app.state.p2Score : app.state.p1Score;

  // Set data
  if (winnerName) { winnerName.textContent = wName; winnerName.dataset.text = wName; }
  if (winnerScore) winnerScore.textContent = wScore;
  if (loserName) loserName.textContent = lName;
  if (loserScore) loserScore.textContent = lScore;

  // Initial state - everything hidden
  if (spotlight) spotlight.style.opacity = '0';
  if (loserSection) loserSection.style.opacity = '0';

  // Dramatic reveal sequence
  setTimeout(() => {
    // Spotlight fade in
    if (spotlight && typeof gsap !== 'undefined') {
      gsap.to(spotlight, { opacity: 1, duration: 1.5, ease: 'power2.out' });
    }

    // Play fanfare
    app.audio.fanfare();

    // Confetti cannon after spotlight
    setTimeout(() => {
      if (confettiCanvas) {
        confetti = new ConfettiCannon(confettiCanvas);
        confetti.fire(300);
        // Second burst
        setTimeout(() => confetti && confetti.fire(200), 800);
        setTimeout(() => confetti && confetti.fire(150), 1600);
      }
    }, 800);

    // Typewriter subtitle
    setTimeout(() => {
      _typeWriter(winnerSubtitle, 'CHAMPION OF THE ARENA', 60);
    }, 1200);

    // Show loser section with rain
    setTimeout(() => {
      if (loserSection && typeof gsap !== 'undefined') {
        gsap.to(loserSection, { opacity: 1, duration: 1, ease: 'power2.out' });
      }
      if (rainCanvas) _startRain(rainCanvas);
    }, 2500);

  }, 500);

  // Winner name glitch gold animation
  if (winnerName) {
    winnerName.classList.add('gold', 'glitching');
    setInterval(() => {
      winnerName.classList.add('glitching');
      setTimeout(() => winnerName.classList.remove('glitching'), 200);
    }, 2500);
  }

  // Crown bounce
  const crown = document.querySelector('.crown-animation');
  if (crown && typeof gsap !== 'undefined') {
    gsap.fromTo(crown, 
      { y: -80, opacity: 0, scale: 2, rotation: -30 },
      { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 1, delay: 1, ease: 'bounce.out' }
    );
  }

  // Replay button
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      app.audio.select();
      app.navigate('lobby');
    });
  }

  // Share button
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const text = `⚡ CodeClash Result!\n🏆 ${wName}: ${wScore} pts\n💀 ${lName}: ${lScore} pts\n\nThink you can beat them? Enter the arena!`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          shareBtn.querySelector('span').textContent = 'COPIED!';
          setTimeout(() => shareBtn.querySelector('span').textContent = 'SHARE SCORE', 2000);
        });
      }
      app.audio.select();
    });
  }
}

function _typeWriter(el, text, speed = 50) {
  if (!el) return;
  el.textContent = '';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, speed);
}

function _startRain(canvas) {
  canvas.width = canvas.offsetWidth || window.innerWidth;
  canvas.height = canvas.offsetHeight || window.innerHeight;
  const ctx = canvas.getContext('2d');
  
  const drops = [];
  for (let i = 0; i < 150; i++) {
    drops.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 2 + Math.random() * 4,
      length: 10 + Math.random() * 20,
      opacity: 0.1 + Math.random() * 0.3
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drops.forEach(d => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + 0.5, d.y + d.length);
      ctx.strokeStyle = `rgba(100, 150, 255, ${d.opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      d.y += d.speed;
      if (d.y > canvas.height) {
        d.y = -d.length;
        d.x = Math.random() * canvas.width;
      }
    });
    rainAnimFrame = requestAnimationFrame(animate);
  }
  animate();
}

export function destroyWinner() {
  if (confetti) { confetti.clear(); confetti = null; }
  if (rainAnimFrame) { cancelAnimationFrame(rainAnimFrame); rainAnimFrame = null; }
}
