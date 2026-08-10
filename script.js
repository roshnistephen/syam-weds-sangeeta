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

// Track scroll for parallax effect with higher sensitivity
window.addEventListener('scroll', () => {
  scrollOffset = window.scrollY * 0.5; // Increased parallax speed factor
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

// Create petals with different layers and parallax depths
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
    layer: layerDepth, // Parallax depth: 0.3 (far), 0.6 (mid), 1.0 (close)
  };
}

// Create petals in 3 layers for depth effect
for (let i = 0; i < 15; i++) {
  const p = createPetal(0.3); // Far layer - moves slow
  p.y = Math.random() * canvas.height;
  petals.push(p);
}

for (let i = 0; i < 15; i++) {
  const p = createPetal(0.6); // Mid layer - moves medium
  p.y = Math.random() * canvas.height;
  petals.push(p);
}

for (let i = 0; i < 15; i++) {
  const p = createPetal(1.0); // Close layer - moves fast
  p.y = Math.random() * canvas.height;
  petals.push(p);
}

function drawPetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  petals.forEach(p => {
    // Apply different parallax offset based on layer depth
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
        // Stagger within the same parent
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
   SCRATCH-OFF DATE REVEAL
========================================= */
const scratchCard = document.getElementById('scratchCard');
const scratchCanvas = document.getElementById('scratchCanvas');
const ctx2 = scratchCanvas.getContext('2d');

if (scratchCard && scratchCanvas) {
  function initScratchCanvas() {
    const rect = scratchCard.getBoundingClientRect();
    scratchCanvas.width = scratchCard.offsetWidth;
    scratchCanvas.height = scratchCard.offsetHeight;

    // Create gradient background
    const gradient = ctx2.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
    gradient.addColorStop(0, '#d4af85');
    gradient.addColorStop(0.5, '#e8c166');
    gradient.addColorStop(1, '#d4af85');
    
    ctx2.fillStyle = gradient;
    ctx2.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

    // Add decorative border
    ctx2.strokeStyle = '#c9a961';
    ctx2.lineWidth = 1.5;
    ctx2.strokeRect(1, 1, scratchCanvas.width - 2, scratchCanvas.height - 2);

    // Add shiny texture spots
    ctx2.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * scratchCanvas.width;
      const y = Math.random() * scratchCanvas.height;
      const size = Math.random() * 2 + 0.5;
      ctx2.beginPath();
      ctx2.arc(x, y, size, 0, Math.PI * 2);
      ctx2.fill();
    }

    // Add decorative line at top
    ctx2.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx2.lineWidth = 1;
    ctx2.beginPath();
    ctx2.moveTo(20, 8);
    ctx2.lineTo(scratchCanvas.width - 20, 8);
    ctx2.stroke();

    // Add decorative elements (stars/sparkles)
    ctx2.fillStyle = 'rgba(255,255,255,0.4)';
    ctx2.font = 'bold 16px Arial';
    ctx2.textAlign = 'center';
    ctx2.fillText('✨', 15, 15);
    ctx2.fillText('✨', scratchCanvas.width - 15, 15);

    // Add main text - larger and more visible
    ctx2.font = 'bold 14px "Cormorant Garamond", serif';
    ctx2.fillStyle = '#ffffff';
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    ctx2.shadowColor = 'rgba(0,0,0,0.3)';
    ctx2.shadowBlur = 3;
    ctx2.shadowOffsetX = 1;
    ctx2.shadowOffsetY = 1;
    
    ctx2.fillText('Scratch to Reveal', scratchCanvas.width / 2, scratchCanvas.height / 2 - 3);
    
    // Reset shadow
    ctx2.shadowColor = 'transparent';
  }

  initScratchCanvas();

  let isScratching = false;
  const revealThreshold = 0.5; // Reveal after scratching 50% of the overlay
  let revealedPercentage = 0;

  function getMousePos(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function getTouchPos(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  function scratch(pos) {
    ctx2.clearRect(pos.x - 15, pos.y - 15, 30, 30);
  }

  function checkRevealPercentage() {
    const imageData = ctx2.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    const data = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) {
        transparentPixels++;
      }
    }

    revealedPercentage = transparentPixels / (data.length / 4);

    if (revealedPercentage > revealThreshold) {
      fullyReveal();
    }
  }

  function fullyReveal() {
    ctx2.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
    scratchCanvas.style.pointerEvents = 'none';
    scratchCard.style.cursor = 'default';
    
    // Add reveal animation
    scratchCanvas.style.transition = 'opacity 0.6s ease';
    scratchCanvas.style.opacity = '0';
  }

  scratchCanvas.addEventListener('mousedown', () => {
    isScratching = true;
  });

  scratchCanvas.addEventListener('mousemove', (e) => {
    if (!isScratching) return;
    const pos = getMousePos(e);
    scratch(pos);
    checkRevealPercentage();
  });

  scratchCanvas.addEventListener('mouseup', () => {
    isScratching = false;
  });

  scratchCanvas.addEventListener('mouseleave', () => {
    isScratching = false;
  });

  // Touch support
  scratchCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isScratching = true;
  });

  scratchCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isScratching) return;
    const pos = getTouchPos(e);
    scratch(pos);
    checkRevealPercentage();
  });

  scratchCanvas.addEventListener('touchend', () => {
    isScratching = false;
  });

  // Resize canvas on window resize
  window.addEventListener('resize', () => {
    initScratchCanvas();
  });
}


/* =========================================
   PARALLAX ON HERO
========================================= */
const hero    = document.getElementById('hero');
const heroArt = hero ? hero.querySelector('.hero-art') : null;

if (heroArt) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight * 1.5) {
      heroArt.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
  }, { passive: true });
}
