/* =====================================================================
   Sangeeta & Syam Sundar — Wedding Invitation
   ===================================================================== */
(function () {
  'use strict';

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------
     0. Configuration — the only things you should need to edit
  ------------------------------------------------------------- */

  // WhatsApp number that receives RSVPs, international format, digits only
  // (e.g. '919876543210' for +91 98765 43210). Leave '' and the RSVP button
  // falls back to copying the reply to the clipboard instead.
  var RSVP_WHATSAPP = '';

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
      venue: 'NH 544, near Pudukad Centre, Thrissur, Kerala 680301' }
  ];

  // The countdown runs to the first function.
  var FIRST = new Date(EVENTS[0].start);

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

    var flapMs = reduceMotion ? 0 : 620;
    var liftMs = reduceMotion ? 0 : 1180;

    // The flap finishes opening, then the whole envelope lifts away.
    window.setTimeout(function () { envSection.classList.add('opening'); }, flapMs);

    window.setTimeout(function () {
      envSection.classList.add('gone');
      document.body.classList.remove('is-locked');
      $('#progress').classList.add('on');
      musicBtn.classList.add('ready');

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
      'X-WR-CALNAME:Sangeeta & Syam Sundar — Wedding'
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
        'SUMMARY:' + esc(ev.name + ' — Sangeeta & Syam Sundar'),
        'LOCATION:' + esc(ev.venue),
        'DESCRIPTION:' + esc('Wedding celebrations of Sangeeta Khyonshali and Syam Sundar.'),
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
        title: 'Sangeeta & Syam Sundar — Wedding Invitation',
        text: 'With the blessings of both families — December 2026, Ramnagar & Guruvayur.',
        url: window.location.href
      }).catch(function () { /* dismissed */ });
    });
  }());

  /* -------------------------------------------------------------
     11. RSVP
  ------------------------------------------------------------- */
  (function () {
    var form = $('#rsvpForm');
    if (!form) return;

    var nameEl  = $('#rsvpName');
    var guestEl = $('#rsvpGuests');
    var msgEl   = $('#rsvpMsg');
    var errEl   = $('#rsvpError');
    var doneEl  = $('#rsvpDone');
    var copyBtn = $('#rsvpCopy');

    function fail(message, field) {
      errEl.textContent = message;
      errEl.hidden = false;
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.focus();
      }
      return null;
    }

    function clearErrors() {
      errEl.hidden = true;
      [nameEl, guestEl].forEach(function (el) { el.removeAttribute('aria-invalid'); });
    }

    // Returns the composed reply, or null when the form isn't valid yet.
    function compose() {
      clearErrors();

      var name = nameEl.value.trim();
      if (!name) return fail('Please add your name so we know who to expect.', nameEl);

      var guests = parseInt(guestEl.value, 10);
      if (!guests || guests < 1) return fail('How many of you are coming?', guestEl);

      var picked = $$('input[name="fn"]:checked', form).map(function (el) { return el.value; });
      if (!picked.length) return fail('Please choose at least one function you can join.');

      var note = msgEl.value.trim();

      var text = 'RSVP — Sangeeta & Syam Sundar\n' +
        'Name: ' + name + '\n' +
        'Guests: ' + guests + '\n' +
        'Attending: ' + picked.join(', ');
      if (note) text += '\nMessage: ' + note;

      return text;
    }

    function copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      // Older Safari / non-secure contexts
      return new Promise(function (resolve, reject) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        document.body.removeChild(ta);
        ok ? resolve() : reject();
      });
    }

    function finish(message) {
      doneEl.textContent = message;
      doneEl.hidden = false;
      form.hidden = true;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = compose();
      if (text === null) return;

      if (RSVP_WHATSAPP) {
        window.open('https://wa.me/' + RSVP_WHATSAPP + '?text=' + encodeURIComponent(text),
                    '_blank', 'noopener');
        finish('Thank you — we can’t wait to see you there.');
      } else {
        // No number configured yet: hand the guest their reply to send on.
        copyText(text).then(function () {
          finish('Your RSVP is copied — please send it to the family on WhatsApp.');
        }).catch(function () {
          errEl.textContent = 'Couldn’t copy automatically. Please message the family directly.';
          errEl.hidden = false;
        });
      }
    });

    copyBtn.addEventListener('click', function () {
      var text = compose();
      if (text === null) return;
      copyText(text).then(function () {
        copyBtn.querySelector('span').textContent = 'Copied';
        window.setTimeout(function () {
          copyBtn.querySelector('span').textContent = 'Copy instead';
        }, 2200);
      }).catch(function () {
        errEl.textContent = 'Couldn’t copy automatically — please select the text manually.';
        errEl.hidden = false;
      });
    });
  }());

}());
