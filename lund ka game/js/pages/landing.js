// ============================================
//  CODECLASH — Landing Page Logic
// ============================================

export function initLanding(app) {
  const title = document.getElementById('glitch-title');
  const words = document.querySelectorAll('.tagline .word');
  const ctaBtn = document.getElementById('enter-arena-btn');

  // Glitch text effect
  if (title) {
    setInterval(() => {
      title.classList.add('glitching');
      setTimeout(() => title.classList.remove('glitching'), 200);
    }, 3000);
  }

  // Word-by-word tagline animation
  if (words.length && typeof gsap !== 'undefined') {
    gsap.fromTo(words, 
      { opacity: 0, y: 20, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.15, delay: 0.5, ease: 'power2.out' }
    );
  }

  // CTA button
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      app.audio.init();
      app.audio.select();
      app.navigate('lobby');
    });
  }

  // Animate hero content entrance
  const heroContent = document.querySelector('.landing-content');
  if (heroContent && typeof gsap !== 'undefined') {
    gsap.fromTo(heroContent,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }
    );
  }
}

export function destroyLanding() {
  // Cleanup if needed
}
