/* =========================================
   LOADER
========================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    setTimeout(() => { loader.style.display = 'none'; }, 800);
  }, 1800);
});


/* =========================================
   ENVELOPE OPENING (3D ANIMATION)
========================================= */
const openBtn    = document.getElementById('openInvitation');
const opening    = document.getElementById('opening');
const envBody    = document.querySelector('.envelope-body');
const music      = document.getElementById('music');

openBtn.addEventListener('click', () => {
  openBtn.disabled = true;
  // Trigger 3D envelope opening
  envBody.classList.add('opening');

  // After animation completes, fade out the section
  setTimeout(() => {
    opening.style.transition = 'opacity 0.8s ease';
    opening.style.opacity    = '0';
    setTimeout(() => {
      opening.style.display = 'none';
      // Scroll hero into view smoothly
      document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
    }, 800);
  }, 1400);

  // Start music
  music.play().catch(() => {});
});


/* =========================================
   MUSIC BUTTON
========================================= */
const musicBtn  = document.getElementById('musicBtn');
const musicIcon = musicBtn.querySelector('.music-icon');

musicBtn.addEventListener('click', () => {
  if (music.paused) {
    music.play().catch(() => {});
    musicIcon.textContent = '♫';
    musicBtn.setAttribute('aria-label', 'Pause music');
  } else {
    music.pause();
    musicIcon.textContent = '▶';
    musicBtn.setAttribute('aria-label', 'Play music');
  }
});


/* =========================================
   COUNTDOWN
========================================= */
const weddingDate = new Date('December 19, 2026 08:00:00').getTime();

function updateCountdown() {
  const now = Date.now();
  const gap = Math.max(0, weddingDate - now);

  const days    = Math.floor(gap / 864e5);
  const hours   = Math.floor((gap % 864e5) / 36e5);
  const minutes = Math.floor((gap % 36e5)  / 6e4);
  const seconds = Math.floor((gap % 6e4)   / 1e3);

  const pad = n => String(n).padStart(2, '0');

  document.getElementById('days').textContent    = pad(days);
  document.getElementById('hours').textContent   = pad(hours);
  document.getElementById('minutes').textContent = pad(minutes);
  document.getElementById('seconds').textContent = pad(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* =========================================
   FALLING PETALS (Canvas) - Multi-layer Parallax
========================================= */
const canvas = document.getElementById('petals');
const ctx    = canvas.getContext('2d');

let petals = [];
let scrollOffset = 0;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Track scroll for parallax effect
window.addEventListener('scroll', () => {
  scrollOffset = window.scrollY * 0.5;
}, { passive: true });

// Petal colour palette – soft pastels
const petalColors = [
  'rgba(245,184,184,0.75)',
  'rgba(249,192,160,0.70)',
  'rgba(245,208,176,0.70)',
  'rgba(212,200,240,0.65)',
  'rgba(180,220,200,0.60)',
  'rgba(255,200,210,0.70)',
];

function createPetal(layerDepth = 1) {
  return {
    x:     Math.random() * canvas.width,
    y:     Math.random() * -canvas.height,
    rx:    Math.random() * 7 + 4,
    ry:    Math.random() * 4 + 2,
    rot:   Math.random() * Math.PI * 2,
    rotV:  (Math.random() - 0.5) * 0.04,
    speed: Math.random() * 1.2 + 0.6,
    swing: Math.random() * 2.5 + 0.5,
    color: petalColors[Math.floor(Math.random() * petalColors.length)],
    phase: Math.random() * Math.PI * 2,
    layer: layerDepth,
  };
}

// Create petals in 3 layers for depth effect
for (let i = 0; i < 15; i++) {
  const p = createPetal(0.3);
  p.y = Math.random() * canvas.height;
  petals.push(p);
}

for (let i = 0; i < 15; i++) {
  const p = createPetal(0.6);
  p.y = Math.random() * canvas.height;
  petals.push(p);
}

for (let i = 0; i < 15; i++) {
  const p = createPetal(1.0);
  p.y = Math.random() * canvas.height;
  petals.push(p);
}

function drawPetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  petals.forEach(p => {
    const layerOffset = scrollOffset * p.layer;

    ctx.save();
    ctx.translate(p.x, p.y - layerOffset);
    ctx.rotate(p.rot);
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    p.y   += p.speed;
    p.x   += Math.sin(p.phase + p.y * 0.012) * p.swing * 0.5;
    p.rot += p.rotV;
    p.phase += 0.012;

    if (p.y > canvas.height + 20) {
      Object.assign(p, createPetal(p.layer));
    }
  });

  requestAnimationFrame(drawPetals);
}

drawPetals();


/* =========================================
   SCROLL REVEAL (IntersectionObserver)
========================================= */
const revealItems = document.querySelectorAll('.reveal-fade');

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal-fade')];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 0.12}s`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealItems.forEach(el => revealObserver.observe(el));


/* =========================================
   PARALLAX ON HERO WATERCOLOR
========================================= */
const hero        = document.getElementById('hero');
const heroWC      = hero ? hero.querySelector('.hero-watercolor') : null;

if (heroWC) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight * 1.5) {
      heroWC.style.transform = `scale(1.05) translateY(${scrollY * 0.18}px)`;
    }
  }, { passive: true });
}
