/* =====================================================================
   Syam Sundar & Sangeeta — Wedding Invitation
   ===================================================================== */
(function () {
  'use strict';

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------
     0. Configuration — the only things you should need to edit
  ------------------------------------------------------------- */

  // Every function, pinned to IST so the countdown and the calendar file are
  // right for guests in any timezone. NOTE: the Sangeet and Bhaarath dates are
  // the working assumption of 11 Dec 2026 — change them here if that moves.
  var EVENTS = [
    { key: 'mehndi',    name: 'Mehndi',                   start: '2026-12-10T19:00:00+05:30', hours: 3,
      venue: 'Khyonshali Nivas, Royal Enclave Colony, Chorpani, Ramnagar, Nainital, Uttarakhand' },
    { key: 'haldi',     name: 'Haldi',                    start: '2026-12-11T09:00:00+05:30', hours: 3,
      venue: 'Khyonshali Nivas, Royal Enclave Colony, Chorpani, Ramnagar, Nainital, Uttarakhand' },
    { key: 'sangeet',   name: 'Sangeet',                  start: '2026-12-11T14:00:00+05:30', hours: 4,
      venue: 'Khyonshali Nivas, Royal Enclave Colony, Chorpani, Ramnagar, Nainital, Uttarakhand' },
    { key: 'bhaarath',  name: 'Bhaarath (Wedding)',       start: '2026-12-11T20:00:00+05:30', hours: 4,
      venue: 'Khyonshali Nivas, Royal Enclave Colony, Chorpani, Ramnagar, Nainital, Uttarakhand' },
    { key: 'tulasi',    name: 'Tulasi Garland Exchange',  start: '2026-12-19T08:00:00+05:30', hours: 3,
      venue: 'Guruvayur Temple, East Nada, Guruvayur, Kerala 680101' },
    { key: 'reception', name: 'Reception',                start: '2026-12-20T17:00:00+05:30', hours: 4,
      venue: 'The Theatre by CG, NH 544, Pudukad, Thrissur, Kerala 680301' }
  ];

  // The countdown runs to the first function.
  var FIRST = new Date(EVENTS[0].start);

  /* -------------------------------------------------------------
     1. Loader
  ------------------------------------------------------------- */
  var loader = $('#loader');

  // The curtain sequence — toran in, monogram in, rangoli open — needs about
  // this long to land. On a fast connection `load` fires well before that, and
  // drawing the curtains mid-animation looks like a glitch rather than a
  // flourish, so the reveal never happens earlier than this.
  var LOADER_MIN_MS  = reduceMotion ? 0 : 1750;
  var LOADER_MAX_MS  = 3200;   // never hang, however slow the network is
  var CURTAIN_OUT_MS = 1150;   // matches the .curtain transition in style.css

  var loaderStart = Date.now();

  function dismissLoader() {
    if (!loader || loader.classList.contains('done')) return;
    loader.classList.add('done');
    window.setTimeout(function () { loader.remove(); }, reduceMotion ? 0 : CURTAIN_OUT_MS);
  }

  function dismissWhenReady() {
    var waited = Date.now() - loaderStart;
    window.setTimeout(dismissLoader, Math.max(0, LOADER_MIN_MS - waited));
  }

  // Draw back as soon as the page is usable; never hang if `load` is slow.
  var loaderTimer = window.setTimeout(dismissLoader, LOADER_MAX_MS);
  window.addEventListener('load', function () {
    window.clearTimeout(loaderTimer);
    dismissWhenReady();
  });

  /* -------------------------------------------------------------
     2. Envelope → invitation
  ------------------------------------------------------------- */
  var envSection = $('#envelope');
  var env        = $('#env');
  var sealBtn    = $('#sealBtn');
  var envHint    = $('#envHint');
  var opened     = false;

  function openInvitation() {
    if (opened) return;
    opened = true;

    sealBtn.disabled = true;
    env.classList.add('is-open');
    envHint.classList.add('hide');

    // Music is a user-gesture-initiated play, so it is allowed here.
    playMusic();

    // A shower of petals off the seal (§8).
    window.setTimeout(burstPetals, reduceMotion ? 0 : 180);

    var flapMs = reduceMotion ? 0 : 620;
    var liftMs = reduceMotion ? 0 : 1180;

    // The flap finishes opening, then the whole envelope lifts away.
    window.setTimeout(function () { envSection.classList.add('opening'); }, flapMs);

    window.setTimeout(function () {
      envSection.classList.add('gone');
      document.body.classList.remove('is-locked');
      $('#progress').classList.add('on');
      musicBtn.classList.add('ready');

      // The envelope is fading out over the invitation now; let it clear,
      // then raise the mandapam (§6c) and arm the illustrated scene (§6a).
      window.setTimeout(playMandap, reduceMotion ? 0 : 240);
      window.setTimeout(armScene, reduceMotion ? 0 : 260);
      window.setTimeout(showScrollCue, reduceMotion ? 0 : 1400);

      window.setTimeout(function () {
        envSection.setAttribute('hidden', '');
        window.scrollTo({ top: 0, behavior: 'auto' });
        // Move focus into the page so keyboard users follow along.
        var h = $('#blessing-h');
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 900);
    }, liftMs);
  }

  sealBtn.addEventListener('click', openInvitation);

  /* -------------------------------------------------------------
     3. Music
  ------------------------------------------------------------- */
  var music    = $('#music');
  var musicBtn = $('#musicBtn');

  // Background level, not foreground. Full volume on a phone speaker the
  // moment the envelope opens is startling rather than soothing.
  var MUSIC_VOLUME = 0.42;
  var FADE_IN_MS   = 2600;
  var FADE_OUT_MS  = 600;

  var fadeTimer = null;

  function fadeTo(target, ms, done) {
    window.clearInterval(fadeTimer);
    var from = music.volume;
    var delta = target - from;
    var t0 = Date.now();

    if (ms <= 0 || reduceMotion) {
      music.volume = target;
      if (done) done();
      return;
    }

    fadeTimer = window.setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / ms);
      // ease-out so the last part of the fade is slow and unobtrusive
      music.volume = Math.max(0, Math.min(1, from + delta * (1 - Math.pow(1 - p, 2))));
      if (p >= 1) {
        window.clearInterval(fadeTimer);
        fadeTimer = null;
        if (done) done();
      }
    }, 40);
  }

  function syncMusicBtn() {
    var on = !music.paused;
    musicBtn.classList.toggle('playing', on);
    musicBtn.setAttribute('aria-pressed', String(on));
    musicBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
  }

  function playMusic() {
    music.volume = 0;
    var p = music.play();
    if (p && typeof p.catch === 'function') p.catch(function () { /* blocked — the button still works */ });
    fadeTo(MUSIC_VOLUME, FADE_IN_MS);
  }

  function pauseMusic() {
    fadeTo(0, FADE_OUT_MS, function () { music.pause(); });
  }

  musicBtn.addEventListener('click', function () {
    if (music.paused) playMusic(); else pauseMusic();
  });

  music.addEventListener('play',  syncMusicBtn);
  music.addEventListener('pause', syncMusicBtn);
  syncMusicBtn();

  /* -------------------------------------------------------------
     4. Countdown to the first function
  ------------------------------------------------------------- */
  var out = { d: $('#d'), h: $('#h'), m: $('#m'), s: $('#s') };
  var timerEl = $('#timer');
  var doneEl  = $('#timerDone');
  var tick;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function updateCountdown() {
    var gap = FIRST.getTime() - Date.now();

    if (gap <= 0) {
      timerEl.hidden = true;
      doneEl.hidden  = false;
      window.clearInterval(tick);
      return;
    }

    var sec = Math.floor(gap / 1000);
    out.d.textContent = String(Math.floor(sec / 86400));
    out.h.textContent = pad(Math.floor(sec / 3600) % 24);
    out.m.textContent = pad(Math.floor(sec / 60) % 60);
    out.s.textContent = pad(sec % 60);
  }

  updateCountdown();
  tick = window.setInterval(updateCountdown, 1000);

  /* -------------------------------------------------------------
     5. Scratch to reveal
  ------------------------------------------------------------- */
  (function () {
    var card   = $('#scratchCard');
    var canvas = $('#scratchCanvas');
    var hint   = $('#scratchHint');
    var revealBtn = $('#scratchReveal');
    if (!card || !canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cleared = false;
    var drawing = false;
    var last = null;
    var checkQueued = false;

    function paintFoil() {
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;

      // A brushed-gold foil with a soft diagonal sheen
      var g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0,    '#c9a252');
      g.addColorStop(0.32, '#e2c383');
      g.addColorStop(0.5,  '#f0d9a8');
      g.addColorStop(0.68, '#d9b46e');
      g.addColorStop(1,    '#b98f42');

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Faint speckle so it reads as foil rather than flat paint
      ctx.fillStyle = 'rgba(255,255,255,.16)';
      for (var i = 0; i < 220; i++) {
        var x = Math.random() * w;
        var y = Math.random() * h;
        ctx.fillRect(x, y, 1.4, 1.4);
      }
      ctx.strokeStyle = 'rgba(140,100,36,.28)';
      ctx.lineWidth = 1;
      ctx.strokeRect(.5, .5, w - 1, h - 1);
    }

    function size() {
      var r = card.getBoundingClientRect();
      if (!r.width || !r.height) return;
      canvas.width  = Math.round(r.width  * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!cleared) paintFoil();
    }

    function pointFor(e) {
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function scratchTo(p) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 42;

      ctx.beginPath();
      if (last) {
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.arc(p.x, p.y, 21, 0, Math.PI * 2);
      ctx.fill();

      last = p;
      queueCheck();
    }

    // Sampling every pixel on every move is wasteful; step through the buffer.
    function queueCheck() {
      if (checkQueued || cleared) return;
      checkQueued = true;
      window.setTimeout(function () {
        checkQueued = false;
        if (cleared) return;

        var data;
        try {
          data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        } catch (err) {
          return; // tainted canvas — shouldn't happen, we never draw an image
        }

        var clear = 0, total = 0;
        for (var i = 3; i < data.length; i += 4 * 24) {
          total++;
          if (data[i] < 24) clear++;
        }
        if (total && clear / total > 0.52) revealAll();
      }, 220);
    }

    function revealAll() {
      if (cleared) return;
      cleared = true;
      canvas.classList.add('cleared');
      hint.classList.add('hide');
      if (revealBtn) revealBtn.hidden = true;
    }

    canvas.addEventListener('pointerdown', function (e) {
      if (cleared) return;
      drawing = true;
      last = null;
      hint.classList.add('hide');
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      }
      scratchTo(pointFor(e));
      e.preventDefault();
    });

    canvas.addEventListener('pointermove', function (e) {
      if (!drawing || cleared) return;
      scratchTo(pointFor(e));
      e.preventDefault();
    });

    function endStroke() { drawing = false; last = null; }
    canvas.addEventListener('pointerup', endStroke);
    canvas.addEventListener('pointercancel', endStroke);
    canvas.addEventListener('pointerleave', endStroke);

    if (revealBtn) revealBtn.addEventListener('click', revealAll);

    size();
    // Fonts and images settling can change the card's height slightly.
    window.addEventListener('load', size);

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(size, 200);
    }, { passive: true });
  }());

  /* -------------------------------------------------------------
     6. Scroll reveal
  ------------------------------------------------------------- */
  var revealables = $$('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // Stagger siblings within the same group for a gentle cascade.
        var group = Array.prototype.filter.call(el.parentElement.children, function (n) {
          return n.classList.contains('reveal');
        });
        el.style.transitionDelay = Math.min(group.indexOf(el), 5) * 0.09 + 's';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------------------
     6a. Hero scene — the staggered assemble

     The scene is drawn as separate layers (see the <figure id="heroScene">
     markup). Rather than fading in as one block, each layer is handed a
     start time through a `--d` custom property and the CSS in §11a of
     style.css does the rest — one timeline, all in one place, no library.

     It runs once the envelope is out of the way AND the scene is actually
     on screen, so nobody misses it by opening the invitation on a phone
     where the artwork sits below the fold.
  ------------------------------------------------------------- */
  var scene = $('#heroScene');

  // Layers that land at a fixed moment, in seconds.
  var SCENE_CUES = [
    ['.sc-sky',    0.00],
    ['.sc-hills',  0.12],
    ['.sc-ground', 0.20],
    ['.sc-couple', 0.20],
    ['.sc-arch',   0.30]
  ];

  // Groups that cascade left to right: selector, first delay, step, window.
  // The step shrinks if a group grows, so a group always finishes inside
  // its window and the whole sequence stays under two seconds.
  var SCENE_GROUPS = [
    ['.sc-figure', 0.50, 0.08, 0.52],
    ['.sc-deco',   0.62, 0.08, 0.58]
  ];

  var SCENE_CAPTION = 1.24;  // names and date, after the picture settles
  var SCENE_TOTAL   = 1900;  // ms — past the end of the last animation

  var scenePlayed = false;

  if (scene && !reduceMotion) {
    // Parked at its start pose from the first paint. The scene sits behind
    // the envelope, so nothing flashes even if this lands a frame late.
    scene.classList.add('assemble');
  }

  function playScene() {
    if (!scene || scenePlayed || reduceMotion) return;
    scenePlayed = true;

    function cue(el, seconds) {
      if (el) el.style.setProperty('--d', seconds.toFixed(3) + 's');
    }

    SCENE_CUES.forEach(function (c) { cue($(c[0], scene), c[1]); });

    SCENE_GROUPS.forEach(function (g) {
      var els = $$(g[0], scene);
      if (!els.length) return;

      // Sorted by position, not by markup order, so the wave always
      // sweeps left to right however the artwork is authored.
      els.sort(function (a, b) {
        return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
      });

      var step = els.length > 1 ? Math.min(g[2], g[3] / (els.length - 1)) : 0;
      els.forEach(function (el, i) { cue(el, g[1] + i * step); });
    });

    cue($('.scene-caption', scene), SCENE_CAPTION);

    scene.classList.add('play');

    // Once it has run, drop the animation state so nothing keeps holding a
    // compositor layer for the rest of the visit.
    window.setTimeout(function () {
      scene.classList.remove('assemble', 'play');
    }, SCENE_TOTAL);
  }

  // Called by the envelope once the invitation is on show (see §2).
  var armScene = function () {};

  (function () {
    if (!scene || reduceMotion) return;

    var armed = false;  // the envelope has lifted away
    var seen  = false;  // the artwork is on screen

    function maybePlay() { if (armed && seen) playScene(); }

    armScene = function () { armed = true; maybePlay(); };

    if (!('IntersectionObserver' in window)) {
      seen = true;
      return;
    }

    var sceneIO = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      seen = true;
      sceneIO.disconnect();
      maybePlay();
    }, { threshold: 0.25 });

    sceneIO.observe(scene);
  }());

  /* -------------------------------------------------------------
     6c. The mandapam — the landing section raising itself

     The first thing behind the envelope. The canopy opens from the centre
     outwards, then the pillars and the two families arrive from their own
     sides and meet in the middle. Runs once, right after the card opens.
  ------------------------------------------------------------- */
  var mandap = $('.mandap');

  var MANDAP_CUES = [
    ['.mandap-canopy',   0.00],
    ['.mandap-pillar.l', 0.22],
    ['.mandap-pillar.r', 0.22],
    ['.from-left',       0.50],
    ['.from-right',      0.50],
    ['.pop-in',          0.78]
  ];
  var MANDAP_TOTAL = 1750;  // ms, past the end of the last animation

  if (mandap && !reduceMotion) mandap.classList.add('assemble');

  function playMandap() {
    if (!mandap || reduceMotion || mandap.classList.contains('play')) return;

    MANDAP_CUES.forEach(function (cue) {
      $$(cue[0], mandap).forEach(function (el) {
        el.style.setProperty('--d', cue[1].toFixed(2) + 's');
      });
    });

    mandap.classList.add('play');

    window.setTimeout(function () {
      mandap.classList.remove('assemble', 'play');
    }, MANDAP_TOTAL);
  }

  /* -------------------------------------------------------------
     6b. Scroll cue

     On a phone the invitation opens to a screenful of header with no
     obvious "there is more below", so point the way — and get out of the
     way the moment the guest starts scrolling.
  ------------------------------------------------------------- */
  var scrollCue = $('#scrollCue');

  // Called by the envelope once the invitation is on show (see §2).
  var showScrollCue = function () {};

  (function () {
    if (!scrollCue) return;

    var dismissed = false;

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      scrollCue.classList.add('gone');
      window.removeEventListener('scroll', onFirstScroll);
      window.setTimeout(function () { scrollCue.hidden = true; }, 600);
    }

    function onFirstScroll() {
      if (window.scrollY > 40) dismiss();
    }

    scrollCue.addEventListener('click', function () {
      var target = $('#couple') || $('#blessing');
      if (target) {
        target.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      }
      dismiss();
    });

    window.addEventListener('scroll', onFirstScroll, { passive: true });

    showScrollCue = function () {
      if (dismissed) return;
      scrollCue.classList.add('ready');
      // Never let it linger if the guest is simply reading.
      window.setTimeout(dismiss, 9000);
    };
  }());

  /* -------------------------------------------------------------
     7. Scroll progress
  ------------------------------------------------------------- */
  var progress = $('#progress');
  var queued = false;

  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () {
      queued = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? window.scrollY / max : 0;
      progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, pct)) + ')';
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* -------------------------------------------------------------
     8. Falling petals
  ------------------------------------------------------------- */
  var canvas = $('#petals');

  // Called by the envelope the moment the seal is broken (see §2).
  var burstPetals = function () {};

  if (!reduceMotion && canvas.getContext) {
    (function () {
      var ctx = canvas.getContext('2d');
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = 0, h = 0, petals = [], raf = null;

      var COLORS = [
        'rgba(224,168,74,.55)',   // marigold
        'rgba(200,120,72,.45)',   // terracotta
        'rgba(196,148,86,.42)',   // antique gold
        'rgba(180,132,146,.38)',  // dusty rose
        'rgba(122,148,120,.32)'   // sage
      ];

      function size() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width  = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width  = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function make(seeded) {
        return {
          x: Math.random() * w,
          y: seeded ? Math.random() * h : -20 - Math.random() * h * 0.4,
          rx: 3.5 + Math.random() * 4.5,
          ry: 1.8 + Math.random() * 2.6,
          rot: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.02,
          vy: 0.28 + Math.random() * 0.55,
          sway: 0.4 + Math.random() * 1.1,
          phase: Math.random() * Math.PI * 2,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          // kick: an outward shove that dies away, leaving the petal to
          // drift down like all the others. Only burst petals get one.
          kx: 0,
          ky: 0,
          extra: false
        };
      }

      // A shower thrown from the middle of the screen — the envelope opening
      // is the one moment on the page that deserves confetti.
      function burst() {
        var n = Math.round(Math.min(34, Math.max(16, w / 26)));
        var cx = w / 2;
        var cy = h * 0.42;

        for (var i = 0; i < n; i++) {
          var p = make(true);
          var angle = Math.random() * Math.PI * 2;
          var speed = 3.2 + Math.random() * 6.5;

          p.x = cx + Math.cos(angle) * 12;
          p.y = cy + Math.sin(angle) * 12;
          p.kx = Math.cos(angle) * speed;
          p.ky = Math.sin(angle) * speed * 0.72;
          p.spin = (Math.random() - 0.5) * 0.12;
          p.rx *= 1.15;
          p.extra = true;   // retired once it falls off the bottom
          petals.push(p);
        }
        start();
      }

      function populate() {
        // Fewer particles on small screens, and scale with viewport area.
        var target = Math.round(Math.min(34, Math.max(12, (w * h) / 46000)));
        petals = [];
        for (var i = 0; i < target; i++) petals.push(make(true));
      }

      function frame() {
        ctx.clearRect(0, 0, w, h);

        for (var i = 0; i < petals.length; i++) {
          var p = petals[i];

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          p.y += p.vy + p.ky;
          p.phase += 0.011;
          p.x += Math.sin(p.phase) * p.sway * 0.32 + p.kx;
          p.rot += p.spin;

          // the shove fades over roughly a second
          if (p.kx || p.ky) {
            p.kx *= 0.94;
            p.ky *= 0.94;
            if (Math.abs(p.kx) < 0.02) p.kx = 0;
            if (Math.abs(p.ky) < 0.02) p.ky = 0;
          }

          if (p.y > h + 24) {
            if (p.extra) { petals.splice(i, 1); i--; continue; }
            petals[i] = make(false);
          }
          if (p.x < -30) p.x = w + 25;
          else if (p.x > w + 30) p.x = -25;
        }

        raf = window.requestAnimationFrame(frame);
      }

      function start() { if (raf === null) raf = window.requestAnimationFrame(frame); }
      function stop()  { if (raf !== null) { window.cancelAnimationFrame(raf); raf = null; } }

      size();
      populate();
      start();

      var resizeTimer;
      window.addEventListener('resize', function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () { size(); populate(); }, 180);
      }, { passive: true });

      // Don't burn battery in a background tab.
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else start();
      });

      burstPetals = burst;
    }());
  }

  /* -------------------------------------------------------------
     9. Add to calendar — every function in one .ics
  ------------------------------------------------------------- */
  (function () {
    var link = $('#calBtn');
    if (!link) return;

    function utc(date) {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }
    function esc(s) { return String(s).replace(/([,;\\])/g, '\\$1'); }

    var stamp = utc(new Date());
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//syam-weds-sangeeta//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Syam Sundar & Sangeeta — Wedding'
    ];

    EVENTS.forEach(function (ev) {
      var start = new Date(ev.start);
      var end   = new Date(start.getTime() + ev.hours * 3600 * 1000);

      lines.push(
        'BEGIN:VEVENT',
        'UID:' + ev.key + '-sangeeta-syam@syam-weds-sangeeta.lokaai.in',
        'DTSTAMP:' + stamp,
        'DTSTART:' + utc(start),
        'DTEND:' + utc(end),
        'SUMMARY:' + esc(ev.name + ' — Syam Sundar & Sangeeta'),
        'LOCATION:' + esc(ev.venue),
        'DESCRIPTION:' + esc('Wedding celebrations of Syam Sundar and Sangeeta Khyonshali.'),
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:' + esc(ev.name + ' is tomorrow'),
        'END:VALARM',
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');

    link.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'));
  }());

  /* -------------------------------------------------------------
     10. Share
  ------------------------------------------------------------- */
  (function () {
    var btn = $('#shareBtn');
    if (!btn || !navigator.share) return;

    btn.hidden = false;
    btn.addEventListener('click', function () {
      navigator.share({
        title: 'Syam Sundar & Sangeeta — Wedding Invitation',
        text: 'With the blessings of both families — December 2026, Ramnagar & Guruvayur.',
        url: window.location.href
      }).catch(function () { /* dismissed */ });
    });
  }());


}());
