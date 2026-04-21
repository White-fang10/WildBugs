/* ============================================
   WILD BUGS — script.js
   All interactivity, animations & GSAP-style effects
   ============================================ */

"use strict";

/* ─────────────────────────────────────────────
   1. CUSTOM CURSOR
───────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  function tick() {
    // Smooth follow for ring
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    rafId = requestAnimationFrame(tick);
  }
  tick();

  // Scale up on interactive elements
  const interactiveEls = document.querySelectorAll('a, button, .project-card, .team-card, .skill-circle-item, .btn');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform = 'translate(-50%, -50%) scale(2)';
      ring.style.borderColor = 'rgba(76,175,80,0.8)';
      dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform = 'translate(-50%, -50%) scale(1)';
      ring.style.borderColor = 'rgba(76,175,80,0.5)';
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
})();


/* ─────────────────────────────────────────────
   2. NAVBAR — scroll behaviour + active links
───────────────────────────────────────────── */
(function initNavbar() {
  const nav  = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = [];

  links.forEach(link => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) sections.push({ section, link });
  });

  function onScroll() {
    // Scrolled class
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active link tracking
    const scrollPos = window.scrollY + 120;
    sections.forEach(({ section, link }) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollPos >= top && scrollPos < bottom) {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─────────────────────────────────────────────
   3. MOBILE HAMBURGER
───────────────────────────────────────────── */
(function initMobileNav() {
  const btn    = document.getElementById('hamburger');
  const mobNav = document.getElementById('mobileNav');
  if (!btn || !mobNav) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    mobNav.classList.toggle('open');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.querySelectorAll('[data-close-nav]').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      mobNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();


/* ─────────────────────────────────────────────
   4. BACK TO TOP
───────────────────────────────────────────── */
(function initBackTop() {
  const btn = document.getElementById('back-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ─────────────────────────────────────────────
   5. SCROLL REVEAL
   CSS-based reveal for non-GSAP elements.
   GSAP-handled elements are skipped at intersection time
   (not setup time) since animations.js loads after this file.
───────────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const GSAP_CLASSES = [
    '.section-title', '.section-label', '.section-subtitle',
    '.project-card', '.team-card', '.skill-circle-item', '.process-step'
  ];
  const gsapSelector = GSAP_CLASSES.join(',');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        // At scroll time, GSAP is loaded — skip elements it handles
        if (typeof gsap !== 'undefined' && entry.target.matches(gsapSelector)) {
          observer.unobserve(entry.target);
          return;
        }
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();



/* ─────────────────────────────────────────────
   6. ANIMATED COUNTERS (Hero stats)
───────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const end = parseInt(el.getAttribute('data-count'), 10);
        const dur = 1800;
        const start = performance.now();

        const suffix = el.nextElementSibling && el.nextElementSibling.textContent.includes('%') ? '' :
                       el.textContent.includes('%') ? '%' : '';

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / dur, 1);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * end);
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => observer.observe(c));
})();


/* ─────────────────────────────────────────────
   7. SKILL BARS — animate on scroll
───────────────────────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill[data-width]');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        const width = bar.getAttribute('data-width');
        // Small delay for stagger
        setTimeout(() => {
          bar.style.width = width + '%';
        }, 100);
        observer.unobserve(bar);
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach((bar, i) => {
    bar.style.transitionDelay = (i * 0.1) + 's';
    observer.observe(bar);
  });
})();


/* ─────────────────────────────────────────────
   8. CIRCULAR PROGRESS — SVG stroke animation
───────────────────────────────────────────── */
(function initCircles() {
  const circles = document.querySelectorAll('.circle-fill[data-pct]');
  if (!circles.length) return;

  const circumference = 226; // 2 * PI * 36

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const circle = entry.target;
        const pct = parseInt(circle.getAttribute('data-pct'), 10);
        const offset = circumference - (pct / 100) * circumference;
        setTimeout(() => {
          circle.style.strokeDashoffset = offset;
        }, 200);
        observer.unobserve(circle);
      });
    },
    { threshold: 0.4 }
  );

  circles.forEach(c => observer.observe(c));
})();


/* ─────────────────────────────────────────────
   9. BUG MASCOT — Eyes follow cursor (updated for new SVG 240x280)
───────────────────────────────────────────── */
(function initBugEyes() {
  const mascot = document.getElementById('bugMascot');
  const pupils = document.querySelectorAll('.eye-pupil');
  if (!mascot || !pupils.length) return;

  // Eye centers in NEW 3D mascot SVG coordinates (viewBox 260x300)
  const eyeCenters = [
    { cx: 106, cy: 89, pupilEl: pupils[0] },
    { cx: 154, cy: 89, pupilEl: pupils[1] }
  ];

  let rafId;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function updateEyes() {
    const rect = mascot.getBoundingClientRect();
    if (rect.width === 0) { rafId = requestAnimationFrame(updateEyes); return; }

    eyeCenters.forEach(({ cx, cy, pupilEl }) => {
      const scaleX = rect.width  / 260;
      const scaleY = rect.height / 300;
      const eyeScreenX = rect.left + cx * scaleX;
      const eyeScreenY = rect.top  + cy * scaleY;

      const dx = mouseX - eyeScreenX;
      const dy = mouseY - eyeScreenY;
      const angle = Math.atan2(dy, dx);
      const dist  = Math.min(Math.sqrt(dx * dx + dy * dy), 140);
      const move  = dist < 90 ? dist * 0.03 : 4.5;

      pupilEl.setAttribute('cx', cx + Math.cos(angle) * move);
      pupilEl.setAttribute('cy', cy + Math.sin(angle) * move);
    });

    rafId = requestAnimationFrame(updateEyes);
  }
  updateEyes();
})();


/* ─────────────────────────────────────────────
   10. ANTENNAE WIGGLE on idle
───────────────────────────────────────────── */
(function initAntennaeWiggle() {
  const antL = document.getElementById('antenna-left');
  const antR = document.getElementById('antenna-right');
  if (!antL || !antR) return;

  let t = 0;
  function wiggle() {
    t += 0.035;
    const angle = Math.sin(t) * 7;
    // 3D mascot: left antenna base at (100,47), right at (160,47)
    antL.style.transformOrigin = '100px 47px';
    antL.style.transform = `rotate(${-angle}deg)`;
    antR.style.transformOrigin = '160px 47px';
    antR.style.transform = `rotate(${angle}deg)`;
    requestAnimationFrame(wiggle);
  }
  wiggle();
})();


/* ─────────────────────────────────────────────
   11. CONTACT FORM — playful bug send
───────────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const btn     = document.getElementById('sendBtn');
  const success = document.getElementById('formSuccess');
  if (!form || !btn || !success) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Animate bug running across
    btn.classList.add('sending');
    btn.disabled = true;

    setTimeout(() => {
      form.style.display = 'none';
      success.classList.add('show');
    }, 1400);
  });
})();


/* ─────────────────────────────────────────────
   12. GSAP-STYLE PARALLAX on hero blob
───────────────────────────────────────────── */
(function initParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    hero.style.setProperty('--px', dx);
    hero.style.setProperty('--py', dy);
  }, { passive: true });
})();


/* ─────────────────────────────────────────────
   13. SMOOTH SECTION LINK SCROLL
───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─────────────────────────────────────────────
   14. PROJECT CARDS — smooth 3D tilt (RAF-throttled)
───────────────────────────────────────────── */
(function initCardTilt() {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    // Add will-change hint once, not on every frame
    card.style.willChange = 'transform';
    card.style.transformStyle = 'preserve-3d';

    let targetRotX = 0, targetRotY = 0;
    let currentRotX = 0, currentRotY = 0;
    let rafId = null;
    let isHovered = false;

    function animate() {
      // Smooth lerp — 0.08 gives buttery glide
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      const tX = Math.abs(currentRotX);
      const tY = Math.abs(currentRotY);

      if (isHovered) {
        card.style.transform = `translateY(-8px) scale(1.01) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
      } else {
        card.style.transform = `translateY(${-8 * (tX + tY) / 12}px) scale(${1 + (tX + tY) * 0.0005}) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
      }

      // Stop RAF when values settle
      if (!isHovered && tX < 0.05 && tY < 0.05) {
        card.style.transform = '';
        cancelAnimationFrame(rafId);
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(animate);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetRotX = ((y - rect.height / 2) / rect.height) * -10;
      targetRotY = ((x - rect.width  / 2) / rect.width)  *  10;
      if (!rafId) rafId = requestAnimationFrame(animate);
    });

    card.addEventListener('mouseenter', () => {
      isHovered = true;
      card.style.transition = 'box-shadow var(--transition), border-color var(--transition)';
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetRotX = 0;
      targetRotY = 0;
      card.style.transition = 'box-shadow var(--transition), border-color var(--transition)';
      if (!rafId) rafId = requestAnimationFrame(animate);
    });
  });
})();


/* ─────────────────────────────────────────────
   15. PAGE LOAD — stagger reveal
───────────────────────────────────────────── */
(function initPageLoad() {
  document.body.style.opacity = '0';
  window.addEventListener('load', () => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  });
})();


/* ─────────────────────────────────────────────
   16. MARQUEE — pause on hover (already done via CSS)
       But also add dynamic duplication check
───────────────────────────────────────────── */
(function initMarquee() {
  // Already handled by CSS animation. JS adds dynamic resize safety.
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  // Ensure overflow is hidden on parent
  track.parentElement.style.overflow = 'hidden';
})();


/* ─────────────────────────────────────────────
   17. KEYBOARD NAVIGATION — escape closes mobile nav
───────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const btn = document.getElementById('hamburger');
    const nav = document.getElementById('mobileNav');
    if (btn && btn.classList.contains('open')) {
      btn.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
});


/* ─────────────────────────────────────────────
   18. TEAM CARDS — sparkle on hover
───────────────────────────────────────────── */
(function initTeamSparkle() {
  const cards = document.querySelectorAll('.team-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const sparkle = document.createElement('div');
      sparkle.textContent = '✨';
      sparkle.style.cssText = `
        position: absolute;
        top: ${Math.random() * 60 + 5}%;
        left: ${Math.random() * 80 + 10}%;
        font-size: 14px;
        pointer-events: none;
        animation: sparkle-float 0.8s ease forwards;
        z-index: 10;
      `;
      card.style.position = 'relative';
      card.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 800);
    });
  });

  // Inject keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes sparkle-float {
      0%   { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-30px) scale(0.5); }
    }
  `;
  document.head.appendChild(style);
})();


/* ─────────────────────────────────────────────
   19. SKILLS SECTION — number counting in circles
───────────────────────────────────────────── */
(function initCircleNumbers() {
  // The SVG text already shows the number. Animate it counting up.
  const circleTexts = document.querySelectorAll('.circle-text');
  const circles     = document.querySelectorAll('.circle-fill[data-pct]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      const circle = entry.target;
      const pct    = parseInt(circle.getAttribute('data-pct'), 10);
      // Find paired text (sibling-ish)
      const svg    = circle.closest('svg');
      const text   = svg ? svg.querySelector('.circle-text') : null;
      if (!text) return;

      let current = 0;
      const dur = 1400;
      const start = performance.now();
      function update(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        current = Math.round(eased * pct);
        text.textContent = current + '%';
        if (p < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(circle);
    });
  }, { threshold: 0.4 });

  circles.forEach(c => observer.observe(c));
})();


/* ─────────────────────────────────────────────
   20. SECTION ACTIVE HIGHLIGHTING in mobile nav
───────────────────────────────────────────── */
(function initMobileNavActive() {
  window.addEventListener('scroll', () => {
    const mobileLinks = document.querySelectorAll('.mobile-nav .nav-link');
    const scrollPos = window.scrollY + 120;
    mobileLinks.forEach(link => {
      const id = link.getAttribute('href').slice(1);
      const sec = document.getElementById(id);
      if (!sec) return;
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        mobileLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { passive: true });
})();


/* ─────────────────────────────────────────────
   21. SCROLL PROGRESS BAR
───────────────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();


/* ─────────────────────────────────────────────
   22. HERO LOGO — MOUSE PARALLAX TILT
───────────────────────────────────────────── */
(function initLogoParallax() {
  const wrap = document.getElementById('heroLogoWrap');
  if (!wrap) return;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;   // -1 to 1
    const dy = (e.clientY - cy) / cy;
    const rotX =  dy * -12; // tilt up/down
    const rotY =  dx *  12; // tilt left/right
    wrap.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(0px)`;
    wrap.style.transition = 'transform 0.15s ease';
  }, { passive: true });

  // Reset on mouse leave
  document.addEventListener('mouseleave', () => {
    wrap.style.transform = '';
    wrap.style.transition = 'transform 0.5s ease';
  });
})();


/* ─────────────────────────────────────────────
   23. MAGNETIC BUTTONS
───────────────────────────────────────────── */
(function initMagneticButtons() {
  const btns = document.querySelectorAll('.btn-primary, .btn-outline');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.3;
      const dy = (e.clientY - cy) * 0.3;
      btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
      btn.style.transition = 'transform 0.1s ease';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
    });
  });
})();


/* ─────────────────────────────────────────────
   24. CONFETTI BURST on button clicks
───────────────────────────────────────────── */
(function initConfetti() {
  const colors = ['#4CAF50','#81C784','#00e676','#388E3C','#A5D6A7','#FFD700','#FF6B6B','#74b9ff'];

  function burst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'confetti-dot';
      const angle = (i / count) * 360;
      const dist  = 50 + Math.random() * 60;
      const tx = Math.cos(angle * Math.PI / 180) * dist;
      const ty = Math.sin(angle * Math.PI / 180) * dist - 40;
      dot.style.cssText = `
        left: ${x}px; top: ${y}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${6 + Math.random() * 6}px;
        height: ${6 + Math.random() * 6}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        --tx: translateX(${tx}px);
        --ty: ${ty}px;
        --rot: ${Math.random() * 720 - 360}deg;
      `;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 900);
    }
  }

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      burst(e.clientX, e.clientY, 16);
    });
  });

  // Also burst when scroll hint is clicked
  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    scrollHint.addEventListener('click', (e) => {
      burst(e.clientX, e.clientY, 8);
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    });
  }
})();


/* ─────────────────────────────────────────────
   25. TEAM NAME SCRAMBLER on hover
───────────────────────────────────────────── */
(function initNameScrambler() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  const nameEls = document.querySelectorAll('.team-name');

  nameEls.forEach(el => {
    const original = el.textContent;
    let interval = null;
    let iteration = 0;

    el.addEventListener('mouseenter', () => {
      clearInterval(interval);
      iteration = 0;
      interval = setInterval(() => {
        el.textContent = original
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (i < iteration) return original[i];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
        iteration += 0.5;
        if (iteration >= original.length) {
          el.textContent = original;
          clearInterval(interval);
        }
      }, 40);
    });

    el.addEventListener('mouseleave', () => {
      clearInterval(interval);
      el.textContent = original;
    });
  });
})();


/* ─────────────────────────────────────────────
   26. RIPPLE CLICK EFFECT (anywhere on page)
───────────────────────────────────────────── */
(function initRipple() {
  document.addEventListener('click', (e) => {
    // Skip if clicking a link or button (confetti handles those)
    if (e.target.closest('a') || e.target.closest('button')) return;
    const ring = document.createElement('div');
    ring.className = 'ripple-ring';
    const size = 60;
    ring.style.cssText = `left:${e.clientX}px; top:${e.clientY}px; width:${size}px; height:${size}px;`;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 800);
  });
})();


/* ─────────────────────────────────────────────
   27. SCROLL-TRIGGERED COUNTER for scroll-hint
       (bounce the scroll-hint arrow on idle)
───────────────────────────────────────────── */
(function initScrollHintFade() {
  const hint = document.querySelector('.scroll-hint');
  if (!hint) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      hint.style.opacity = '0';
      hint.style.transform = 'translateX(-50%) translateY(20px)';
    } else {
      hint.style.opacity = '1';
      hint.style.transform = 'translateX(-50%) translateY(0)';
    }
    hint.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  }, { passive: true });
})();
