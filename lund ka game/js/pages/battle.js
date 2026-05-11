// ============================================
//  CODECLASH — Battle Page Logic (THE MONEY SHOT)
// ============================================

import { getQuestions } from '../questions.js';

let timerInterval = null;
let opponentTimeout = null;
let currentQuestions = [];
let currentIndex = 0;
let timeLeft = 15;
let p1Score = 0, p2Score = 0;
let p1Answered = 0, p2Answered = 0;
let p1Streak = 0, p2Streak = 0;
let answered = false;
const TOTAL = 10;
const TIME_PER_Q = 15;

export function initBattle(app) {
  // Reset state
  currentIndex = 0;
  p1Score = 0; p2Score = 0;
  p1Answered = 0; p2Answered = 0;
  p1Streak = 0; p2Streak = 0;
  answered = false;

  currentQuestions = getQuestions(app.state.category || 'mixed', TOTAL);

  // Set names
  _setText('p1-battle-name', app.state.p1Name || 'Player 1');
  _setText('p2-battle-name', 'CyberBot');
  _setText('score-bar-p1-name', app.state.p1Name || 'Player 1');
  _setText('score-bar-p2-name', 'CyberBot');

  // Set avatar initials
  const p1Initial = (app.state.p1Name || 'P1').charAt(0).toUpperCase();
  const p1Avatar = document.querySelector('#p1-panel .avatar-circle');
  if (p1Avatar) p1Avatar.textContent = p1Initial;

  _updateScores();
  _loadQuestion(app);

  // GSAP entrance
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('#p1-panel', { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    gsap.fromTo('#p2-panel', { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    gsap.fromTo('.question-panel', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: 'power3.out' });
    gsap.fromTo('.score-bar', { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
  }
}

function _loadQuestion(app) {
  if (currentIndex >= TOTAL || currentIndex >= currentQuestions.length) {
    _endGame(app);
    return;
  }

  answered = false;
  timeLeft = TIME_PER_Q;
  const q = currentQuestions[currentIndex];

  _setText('question-number', `Question ${currentIndex + 1}/${TOTAL}`);
  _setText('question-category', (q.category || 'MIXED').toUpperCase());
  _setText('question-text', q.text);

  // Set options
  const grid = document.getElementById('options-grid');
  if (grid) {
    grid.innerHTML = '';
    const labels = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.dataset.index = i;
      btn.innerHTML = `<span class="option-label">${labels[i]}</span><span class="option-text">${opt}</span>`;
      btn.addEventListener('click', () => _handleAnswer(app, i));
      grid.appendChild(btn);
    });
  }

  // Reset timer UI
  _updateTimerUI();
  _startTimer(app);

  // Simulate opponent
  _simulateOpponent(app);

  // Question entrance animation
  const card = document.getElementById('question-card');
  if (card && typeof gsap !== 'undefined') {
    gsap.fromTo(card, { scale: 0.95, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
  }
}

function _startTimer(app) {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    timeLeft--;
    _updateTimerUI();

    if (timeLeft <= 5 && timeLeft > 0) {
      app.audio.timerUrgent();
      const timerText = document.getElementById('timer-text');
      if (timerText) {
        timerText.classList.add('urgent-pulse');
        setTimeout(() => timerText.classList.remove('urgent-pulse'), 200);
      }
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      if (!answered) {
        _handleTimeout(app);
      }
    }
  }, 1000);
}

function _updateTimerUI() {
  const progress = document.getElementById('timer-progress');
  const text = document.getElementById('timer-text');
  if (text) text.textContent = Math.max(0, timeLeft);

  if (progress) {
    const circumference = 2 * Math.PI * 45;
    const pct = timeLeft / TIME_PER_Q;
    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = circumference * (1 - pct);

    // Color transition
    if (pct > 0.5) {
      progress.style.stroke = '#00ff88';
    } else if (pct > 0.25) {
      progress.style.stroke = '#ffaa00';
    } else {
      progress.style.stroke = '#ff4444';
    }
  }
}

function _handleAnswer(app, selectedIndex) {
  if (answered) return;
  answered = true;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }

  const q = currentQuestions[currentIndex];
  const isCorrect = selectedIndex === q.correct;
  const buttons = document.querySelectorAll('.option-btn');

  buttons.forEach((btn, i) => {
    btn.style.pointerEvents = 'none';
    if (i === q.correct) btn.classList.add('correct');
    if (i === selectedIndex && !isCorrect) btn.classList.add('wrong');
  });

  if (isCorrect) {
    p1Score += 10 + Math.max(0, timeLeft);
    p1Streak++;
    app.audio.correct();
    _showBurstEffect(true);
    _animateScoreFlip('p1-score');

    if (p1Streak >= 3) {
      const streakEl = document.getElementById('p1-streak');
      if (streakEl) streakEl.classList.add('on-fire');
    }
  } else {
    p1Streak = 0;
    app.audio.wrong();
    _shakeScreen();
    const streakEl = document.getElementById('p1-streak');
    if (streakEl) streakEl.classList.remove('on-fire');
  }

  p1Answered++;
  _updateScores();
  _updateProgress('p1', p1Answered);
  _updateStreak('p1', p1Streak);

  // Next question after delay
  setTimeout(() => {
    currentIndex++;
    _loadQuestion(app);
  }, 1500);
}

function _handleTimeout(app) {
  answered = true;
  app.audio.wrong();
  p1Streak = 0;
  p1Answered++;

  const buttons = document.querySelectorAll('.option-btn');
  const q = currentQuestions[currentIndex];
  buttons.forEach((btn, i) => {
    btn.style.pointerEvents = 'none';
    if (i === q.correct) btn.classList.add('correct');
  });

  _shakeScreen();
  _updateScores();
  _updateProgress('p1', p1Answered);
  _updateStreak('p1', p1Streak);

  setTimeout(() => {
    currentIndex++;
    _loadQuestion(app);
  }, 1500);
}

function _simulateOpponent(app) {
  if (opponentTimeout) clearTimeout(opponentTimeout);

  const delay = 1000 + Math.random() * 3000;
  const panel = document.getElementById('p2-panel');

  // Show thinking flicker
  if (panel) panel.classList.add('thinking');

  opponentTimeout = setTimeout(() => {
    if (panel) panel.classList.remove('thinking');

    const correct = Math.random() < 0.6;
    if (correct) {
      p2Score += 10 + Math.max(0, Math.floor(TIME_PER_Q - delay / 1000));
      p2Streak++;
    } else {
      p2Streak = 0;
    }
    p2Answered++;

    _animateScoreFlip('p2-score');
    _updateScores();
    _updateProgress('p2', p2Answered);
    _updateStreak('p2', p2Streak);
  }, delay);
}

function _updateScores() {
  _setText('p1-score', p1Score);
  _setText('p2-score', p2Score);
  _setText('score-bar-p1-score', p1Score);
  _setText('score-bar-p2-score', p2Score);

  // Tug-of-war bar
  const total = p1Score + p2Score || 1;
  const p1Pct = Math.max(15, (p1Score / total) * 100);
  const p2Pct = 100 - p1Pct;
  const bar1 = document.getElementById('score-bar-p1');
  const bar2 = document.getElementById('score-bar-p2');
  if (bar1) bar1.style.width = p1Pct + '%';
  if (bar2) bar2.style.width = p2Pct + '%';

  // Glow on leading side
  if (bar1 && bar2) {
    bar1.classList.toggle('leading', p1Score > p2Score);
    bar2.classList.toggle('leading', p2Score > p1Score);
  }
}

function _updateProgress(player, count) {
  const fill = document.getElementById(`${player}-progress`);
  const text = document.getElementById(`${player}-progress-text`);
  if (fill) fill.style.width = (count / TOTAL * 100) + '%';
  if (text) text.textContent = `${count}/${TOTAL}`;
}

function _updateStreak(player, streak) {
  const el = document.getElementById(`${player}-streak`);
  if (el) {
    const countEl = el.querySelector('.streak-count');
    if (countEl) countEl.textContent = streak;
    if (streak >= 3) {
      el.classList.add('on-fire');
    } else {
      el.classList.remove('on-fire');
    }
  }
}

function _animateScoreFlip(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('flip');
    setTimeout(() => el.classList.remove('flip'), 400);
  }
}

function _showBurstEffect(isCorrect) {
  const canvas = document.getElementById('burst-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const particles = [];
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const color = isCorrect ? '#00ff88' : '#ff4444';

  for (let i = 0; i < 40; i++) {
    const angle = (Math.PI * 2 * i) / 40;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      opacity: 1,
      color
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.opacity -= 0.025;
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    frame++;
    if (frame < 40) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

function _shakeScreen() {
  const battle = document.getElementById('battle');
  if (battle) {
    battle.classList.add('shake');
    setTimeout(() => battle.classList.remove('shake'), 400);
  }
}

function _endGame(app) {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (opponentTimeout) { clearTimeout(opponentTimeout); opponentTimeout = null; }

  app.state.p1Score = p1Score;
  app.state.p2Score = p2Score;
  app.state.winner = p1Score >= p2Score ? 'p1' : 'p2';

  setTimeout(() => app.navigate('winner'), 1000);
}

function _setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function destroyBattle() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (opponentTimeout) { clearTimeout(opponentTimeout); opponentTimeout = null; }
}
