/* =====================================================================
   Sangeeta & Syam Sundar — Wedding Invitation
   ===================================================================== */
(function () {
  'use strict';

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------
     Wedding date — single source of truth
  ------------------------------------------------------------- */
  // 19 Dec 2026, 8:00 AM IST — pinned to the offset so the countdown and the
  // calendar file are correct for guests in any timezone, not just India.
  var WEDDING = new Date('2026-12-19T08:00:00+05:30');

  /* -------------------------------------------------------------
     1. Loader
  ------------------------------------------------------------- */
  var loader = $('#loader');

  function dismissLoader() {
    if (!loader || loader.classList.contains('done')) return;
    loader.classList.add('done');
    window.setTimeout(function () { loader.remove(); }, 900);
  }

  // Hide as soon as the page is usable; never hang if `load` is slow.
  var loaderTimer = window.setTimeout(dismissLoader, 2600);
  window.addEventListener('load', function () {
    window.clearTimeout(loaderTimer);
    window.setTimeout(dismissLoader, reduceMotion ? 0 : 700);
  });

  /* -------------------------------------------------------------
     2. Cover → invitation
  ------------------------------------------------------------- */
  var cover   = $('#cover');
  var openBtn = $('#openBtn');
  var opened  = false;

  function openInvitation() {
    if (opened) return;
    opened = true;

    openBtn.disabled = true;
    cover.classList.add('opened');
    document.body.classList.remove('is-locked');
    $('#progress').classList.add('on');
    musicBtn.classList.add('ready');

    // Music is a user-gesture-initiated play, so it is allowed here.
    playMusic();

    window.setTimeout(function () {
      cover.setAttribute('hidden', '');
      $('#invite').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      // Move focus into the page so keyboard users follow along.
      var h = $('#invite-h');
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 900);
  }

  openBtn.addEventListener('click', openInvitation);

  /* -------------------------------------------------------------
     3. Music
  ------------------------------------------------------------- */
  var music    = $('#music');
  var musicBtn = $('#musicBtn');

  function syncMusicBtn() {
    var on = !music.paused;
    musicBtn.classList.toggle('playing', on);
    musicBtn.setAttribute('aria-pressed', String(on));
    musicBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
  }

  function playMusic() {
    var p = music.play();
    if (p && typeof p.catch === 'function') p.catch(function () { /* blocked — the button still works */ });
  }

  musicBtn.addEventListener('click', function () {
    if (music.paused) playMusic(); else music.pause();
  });

  music.addEventListener('play',  syncMusicBtn);
  music.addEventListener('pause', syncMusicBtn);
  syncMusicBtn();

  /* -------------------------------------------------------------
     4. Countdown
  ------------------------------------------------------------- */
  var out = { d: $('#d'), h: $('#h'), m: $('#m'), s: $('#s') };
  var timerEl = $('#timer');
  var doneEl  = $('#timerDone');
  var tick;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function updateCountdown() {
    var gap = WEDDING.getTime() - Date.now();

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
     5. Scroll reveal
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
     6. Scroll progress
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
     7. Falling petals
  ------------------------------------------------------------- */
  var canvas = $('#petals');

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
          color: COLORS[(Math.random() * COLORS.length) | 0]
        };
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

          p.y += p.vy;
          p.phase += 0.011;
          p.x += Math.sin(p.phase) * p.sway * 0.32;
          p.rot += p.spin;

          if (p.y > h + 24) petals[i] = make(false);
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
    })();
  }

  /* -------------------------------------------------------------
     8. Add to calendar (.ics)
  ------------------------------------------------------------- */
  (function () {
    var link = $('#calBtn');
    if (!link) return;

    function utc(date) {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }

    var end = new Date(WEDDING.getTime() + 3 * 60 * 60 * 1000);

    var ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//syam-weds-sangeeta//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:wedding-sangeeta-syam-20261219@syam-weds-sangeeta.lokaai.in',
      'DTSTAMP:' + utc(new Date()),
      'DTSTART:' + utc(WEDDING),
      'DTEND:' + utc(end),
      'SUMMARY:Wedding of Sangeeta & Syam Sundar',
      'LOCATION:Guruvayur Temple\\, East Nada\\, Guruvayur\\, Thrissur\\, Kerala',
      'DESCRIPTION:Tulasi garland exchange at Guruvayur Temple.\\n' +
        'Reception: 20 December 2026\\, 5-9 PM\\, NH 544\\, Pudukad\\, Thrissur.',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Sangeeta & Syam Sundar are getting married tomorrow',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    link.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  })();

  /* -------------------------------------------------------------
     9. Share
  ------------------------------------------------------------- */
  (function () {
    var btn = $('#shareBtn');
    if (!btn || !navigator.share) return;

    btn.hidden = false;
    btn.addEventListener('click', function () {
      navigator.share({
        title: 'Sangeeta & Syam Sundar — Wedding Invitation',
        text: 'Together with their families — 19 December 2026, Guruvayur Temple, Kerala.',
        url: window.location.href
      }).catch(function () { /* dismissed */ });
    });
  })();

}());
