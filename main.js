/* ============================================================
   TSHEDZA SYSTEMS — main.js  v4
   Fixes: mobile scroll shift (no parallax on touch),
          nav overlay blur, EmailJS form to Gmail
   ============================================================ */

'use strict';

/* ── EMAILJS INIT ──────────────────────────────────────────── */
// Replace YOUR_PUBLIC_KEY with your EmailJS public key
// Sign up free at emailjs.com, create a service + template
const EMAILJS_PUBLIC_KEY  = 'pA4DXCU6zOaT-0Eyi';   // ← replace
const EMAILJS_SERVICE_ID  = 'service_gl2wl5n';   // ← replace
const EMAILJS_TEMPLATE_ID = 'template_n68a3sk';  // ← replace

window.addEventListener('load', () => {
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
});

/* ── FAST CURSOR (desktop only) ────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursorFollower');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  const LERP = 0.14;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  (function tick() {
    rx += (mx - rx) * LERP;
    ry += (my - ry) * LERP;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a, button, .service-card, .project-card, .monthly-card, .portfolio-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width = ring.style.width = ''; // let CSS handle via hover state
      dot.style.width  = '14px'; dot.style.height  = '14px';
      ring.style.width = '48px'; ring.style.height = '48px';
      ring.style.borderColor = 'rgba(0,212,170,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width  = '9px';  dot.style.height  = '9px';
      ring.style.width = '32px'; ring.style.height = '32px';
      ring.style.borderColor = 'rgba(0,212,170,0.5)';
    });
  });
})();

/* ── NAVBAR SCROLL ─────────────────────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const check = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* ── HAMBURGER + OVERLAY ────────────────────────────────────── */
(function initHamburger() {
  const btn     = document.getElementById('hamburger');
  const links   = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');
  if (!btn || !links) return;

  function open() {
    btn.classList.add('open');
    links.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (overlay) overlay.classList.add('active');
  }
  function close() {
    btn.classList.remove('open');
    links.classList.remove('open');
    document.body.style.overflow = '';
    if (overlay) overlay.classList.remove('active');
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    links.classList.contains('open') ? close() : open();
  });

  links.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', close));

  // Click overlay OR outside drawer to close
  if (overlay) overlay.addEventListener('click', close);
  document.addEventListener('click', e => {
    if (links.classList.contains('open') && !links.contains(e.target) && !btn.contains(e.target)) close();
  });

  // Swipe right on drawer to close (mobile)
  let startX = 0;
  links.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  links.addEventListener('touchend',   e => { if (e.changedTouches[0].clientX - startX > 60) close(); }, { passive: true });
})();

/* ── PARTICLES (desktop only) ───────────────────────────────── */
(function initParticles() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on mobile
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let raf;

  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COUNT = 100;
  const particles = Array.from({ length: COUNT }, () => mkP());
  function mkP() {
    return {
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: .5 + Math.random() * 1.8, vx: (Math.random() - .5) * .16,
      vy: -.06 - Math.random() * .22, a: .15 + Math.random() * .6,
      ph: Math.random() * Math.PI * 2, ps: .012 + Math.random() * .022,
      col: Math.random() > .5 ? '0,212,170' : '0,180,216',
    };
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.ph += p.ps;
      const a = p.a * (.7 + .3 * Math.sin(p.ph));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col},${a})`; ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.y < -6) { p.y = canvas.height + 6; p.x = Math.random() * canvas.width; }
      if (p.x < -6) p.x = canvas.width + 6;
      if (p.x > canvas.width + 6) p.x = -6;
    });
    raf = requestAnimationFrame(draw);
  }
  draw();
  document.addEventListener('visibilitychange', () => document.hidden ? cancelAnimationFrame(raf) : draw());
})();

/* ── PARALLAX HERO (desktop only — KEY mobile fix) ──────────── */
(function initParallax() {
  // SKIP on touch devices — this was causing the scroll shift on mobile
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const img = document.getElementById('heroBgImg');
  if (!img) return;

  // Apply initial desktop scale
  img.style.transform = 'scale(1.08)';

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        img.style.transform = `scale(1.08) translateY(${window.scrollY * 0.18}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ── SCROLL REVEAL ─────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right,.reveal-fade');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('revealed')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('revealed'), parseInt(e.target.dataset.delay || '0', 10));
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ── ACTIVE NAV ────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 110;
    sections.forEach(s => {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight)
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + s.id));
    });
  }, { passive: true });
})();

/* ── CARD TILT (desktop only) ──────────────────────────────── */
(function initTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.service-card,.project-card,.monthly-card,.why-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top)  / r.height - .5) * -7;
      const ry = ((e.clientX - r.left) / r.width  - .5) *  7;
      card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.38s ease';
    });
  });
})();

/* ── CONTACT FORM → EMAILJS ─────────────────────────────────── */
/*
  HOW TO SET THIS UP (free):
  1. Go to https://www.emailjs.com and create a free account
  2. Add a Gmail service → connect your tshedzatshipuke5@gmail.com
  3. Create an email template with these variables:
     {{from_name}}, {{from_email}}, {{service}}, {{message}}
     Set "To email" to: tshedzatshipuke5@gmail.com
  4. Copy your Public Key, Service ID, Template ID
  5. Replace the 3 constants at the top of this file
*/
(function initForm() {
  const btn      = document.getElementById('formSubmit');
  const btnText  = document.getElementById('formBtnText');
  const statusEl = document.getElementById('formStatus');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const name    = (document.getElementById('formName')?.value    || '').trim();
    const email   = (document.getElementById('formEmail')?.value   || '').trim();
    const service = (document.getElementById('formService')?.value || '').trim();
    const msg     = (document.getElementById('formMsg')?.value     || '').trim();

    // Validate
    if (!name || !email) {
      shake(btn);
      showStatus('Please fill in your name and email.', 'error');
      return;
    }
    if (!email.includes('@')) {
      shake(btn);
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Loading state
    btn.disabled = true;
    btnText.textContent = 'Sending…';

    try {
      if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        // ── Real EmailJS send ──
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name:  name,
          from_email: email,
          service:    service || 'Not specified',
          message:    msg    || '(no message)',
          to_email:   'tshedzatshipuke5@gmail.com',
          reply_to:   email,
        });
        showStatus('✓ Message sent! We\'ll reply within 24 hours.', 'success');
        clearForm();
      } else {
        // ── Fallback: open mailto (works without EmailJS setup) ──
        const subject = encodeURIComponent(`New Enquiry${service ? ' – ' + service : ''} from ${name}`);
        const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}${service ? '\nService: ' + service : ''}${msg ? '\n\nMessage:\n' + msg : ''}`);
        window.location.href = `mailto:tshedzatshipuke5@gmail.com?subject=${subject}&body=${body}`;
        showStatus('Opening your email client…', 'success');
        clearForm();
      }
    } catch (err) {
      console.error('EmailJS error:', err);
      showStatus('Something went wrong. Please email us directly at info@techdzasystems.co.za', 'error');
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Send Message';
    }
  });

  function clearForm() {
    ['formName','formEmail','formService','formMsg'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className   = 'form-status ' + type;
    statusEl.style.display = 'block';
    setTimeout(() => { statusEl.style.display = 'none'; }, 5000);
  }

  function shake(el) {
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = 'shake .38s ease';
    el.addEventListener('animationend', () => { el.style.animation = ''; }, { once: true });
  }
})();

/* ── SMOOTH SCROLL ─────────────────────────────────────────── */
(function initScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' });
    });
  });
})();

/* ── INJECT KEYFRAMES ──────────────────────────────────────── */
(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-7px)}
      40%{transform:translateX(7px)}
      60%{transform:translateX(-4px)}
      80%{transform:translateX(4px)}
    }
  `;
  document.head.appendChild(s);
})();

/* ── PAGE FADE IN ──────────────────────────────────────────── */
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.45s ease';
window.addEventListener('load', () => { document.body.style.opacity = '1'; });


// CONTACT FORM EMAILJS

const formSubmit = document.getElementById("formSubmit");
const formStatus = document.getElementById("formStatus");
const formBtnText = document.getElementById("formBtnText");

formSubmit.addEventListener("click", function (e) {
  e.preventDefault();

  // Get form values
  const name = document.getElementById("formName").value;
  const email = document.getElementById("formEmail").value;
  const service = document.getElementById("formService").value;
  const message = document.getElementById("formMsg").value;

  // Validation
  if (!name || !email || !service || !message) {
    formStatus.style.display = "block";
    formStatus.style.color = "#ff4d4d";
    formStatus.innerHTML = "Please fill in all fields.";
    return;
  }

  // Loading state
  formBtnText.innerHTML = "Sending...";
  formSubmit.disabled = true;

  // EmailJS send
  emailjs.send("service_gl2wl5n", "template_n68a3sk", {
    from_name: name,
    from_email: email,
    service: service,
    message: message,
  })
  .then(function () {

    formStatus.style.display = "block";
    formStatus.style.color = "#00d4aa";
    formStatus.innerHTML = "Message sent successfully!";

    // Reset form
    document.getElementById("formName").value = "";
    document.getElementById("formEmail").value = "";
    document.getElementById("formService").value = "";
    document.getElementById("formMsg").value = "";

  })
  .catch(function (error) {

    console.error("EmailJS Error:", error);

    formStatus.style.display = "block";
    formStatus.style.color = "#ff4d4d";
    formStatus.innerHTML = "Failed to send message.";

  })
  .finally(function () {

    formBtnText.innerHTML = "Send Message";
    formSubmit.disabled = false;

  });

});
