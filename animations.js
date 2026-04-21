/* ============================================
   WILD BUGS — animations.js
   Premium animation layer: Lenis + GSAP + custom effects
   ============================================ */

"use strict";

/* ─────────────────────────────────────────────
   1. PAGE LOADER
───────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('loaded');
      setTimeout(() => {
        if (loader.parentNode) loader.remove();
      }, 800);
    }, 600);
  });
})();


/* ─────────────────────────────────────────────
   2. LENIS SMOOTH SCROLL
   NOTE: Only ONE RAF source drives Lenis updates.
   If GSAP is present, gsap.ticker owns the RAF.
   Otherwise, a manual RAF loop runs.
───────────────────────────────────────────── */
let lenisInstance = null;
(function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenisInstance = new Lenis({
    duration: 1.1,                                        // snappier (was 1.3)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 1.5,
    wheelMultiplier: 1,
    infinite: false,
  });

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // GSAP ticker is the single RAF source — no extra requestAnimationFrame
    lenisInstance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);  // prevent GSAP from skipping frames
  } else {
    // Fallback: standalone RAF loop (no GSAP)
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
})();



/* ─────────────────────────────────────────────
   3. CURSOR LABEL — "View" on project cards
───────────────────────────────────────────── */
(function initCursorLabel() {
  const ring  = document.getElementById('cursorRing');
  const label = document.getElementById('cursorLabel');
  if (!ring || !label) return;

  // Track cursor position for label
  document.addEventListener('mousemove', (e) => {
    label.style.left = e.clientX + 'px';
    label.style.top  = e.clientY + 'px';
  });

  // Project cards → "View"
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      ring.classList.add('cursor-view');
      label.textContent = 'View';
      label.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      ring.classList.remove('cursor-view');
      label.style.opacity = '0';
    });
  });

  // Team cards → "✦"
  document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      ring.classList.add('cursor-open');
      label.textContent = '✦';
      label.style.opacity = '1';
    });
    card.addEventListener('mouseleave', () => {
      ring.classList.remove('cursor-open');
      label.style.opacity = '0';
    });
  });
})();


/* ─────────────────────────────────────────────
   4. HERO TITLE — word-split stagger animation
───────────────────────────────────────────── */
(function initHeroSplit() {
  const title = document.querySelector('.hero-title');
  if (!title) return;

  // Walk through child nodes, wrap text-node words in spans
  function wrapTextNode(node, parent) {
    const words = node.textContent.split(/( +)/);
    words.forEach(part => {
      if (/^ +$/.test(part)) {
        parent.insertBefore(document.createTextNode(part), node);
      } else if (part.length > 0) {
        const wrap  = document.createElement('span');
        wrap.className = 'word-wrap';
        const inner = document.createElement('span');
        inner.className = 'word-inner';
        inner.textContent = part;
        wrap.appendChild(inner);
        parent.insertBefore(wrap, node);
      }
    });
    parent.removeChild(node);
  }

  function processNode(el) {
    const childNodes = [...el.childNodes];
    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        wrapTextNode(node, el);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        processNode(node);
      }
    });
  }

  processNode(title);

  // Stagger the inners
  const inners = title.querySelectorAll('.word-inner');
  inners.forEach((el, i) => {
    el.style.animationDelay = (0.25 + i * 0.08) + 's';
    el.classList.add('word-animate');
  });
})();


/* ─────────────────────────────────────────────
   5. GSAP + ScrollTrigger ANIMATIONS
───────────────────────────────────────────── */
(function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Helper: add .visible and clear inline props after GSAP finishes
  function onDone(targets) {
    gsap.utils.toArray(targets).forEach(el => {
      el.classList.add('visible');
    });
  }

  // Section titles
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.fromTo(el,
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        clearProps: 'transform',
        onComplete: () => onDone(el),
        scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none none' }
      }
    );
  });

  // Section labels
  gsap.utils.toArray('.section-label').forEach(el => {
    gsap.fromTo(el,
      { x: -24, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
        clearProps: 'transform',
        onComplete: () => onDone(el),
        scrollTrigger: { trigger: el, start: 'top 88%' }
      }
    );
  });

  // Section subtitles
  gsap.utils.toArray('.section-subtitle').forEach(el => {
    gsap.fromTo(el,
      { y: 24, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
        clearProps: 'transform',
        onComplete: () => onDone(el),
        scrollTrigger: { trigger: el, start: 'top 88%' }
      }
    );
  });

  // Project cards — staggered cascade
  document.querySelectorAll('.projects-grid').forEach(grid => {
    const cards = grid.querySelectorAll('.project-card');
    gsap.fromTo(cards,
      { y: 70, opacity: 0, scale: 0.97 },
      {
        y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'power3.out', stagger: 0.12,
        clearProps: 'transform,scale',
        onComplete: () => onDone(cards),
        scrollTrigger: { trigger: grid, start: 'top 80%' }
      }
    );
  });

  // Team cards — staggered pop
  const teamCards = gsap.utils.toArray('.team-card');
  if (teamCards.length) {
    gsap.fromTo(teamCards,
      { y: 50, opacity: 0, scale: 0.94 },
      {
        y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.2)', stagger: 0.1,
        clearProps: 'transform,scale',
        onComplete: () => onDone(teamCards),
        scrollTrigger: {
          trigger: teamCards[0].closest('.team-grid') || teamCards[0],
          start: 'top 82%'
        }
      }
    );
  }

  // Skill circles — spring pop
  gsap.utils.toArray('.skill-circle-item').forEach((item, i) => {
    gsap.fromTo(item,
      { scale: 0.6, opacity: 0, y: 20 },
      {
        scale: 1, opacity: 1, y: 0, duration: 0.55, ease: 'back.out(1.6)', delay: i * 0.04,
        clearProps: 'transform,scale',
        onComplete: () => onDone(item),
        scrollTrigger: { trigger: item, start: 'top 90%' }
      }
    );
  });

  // Process steps — alternating sides
  gsap.utils.toArray('.process-step').forEach((step, i) => {
    gsap.fromTo(step,
      { x: i % 2 === 0 ? -50 : 50, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        clearProps: 'transform',
        onComplete: () => onDone(step),
        scrollTrigger: { trigger: step, start: 'top 84%' }
      }
    );
  });

  // Contact fields
  gsap.utils.toArray('#contact .form-group, #contact .contact-info-block').forEach((el, i) => {
    gsap.fromTo(el,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.65, ease: 'power2.out', delay: i * 0.06,
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 87%' }
      }
    );
  });

  // Footer
  gsap.fromTo('footer',
    { opacity: 0, y: 20 },
    {
      opacity: 1, y: 0, duration: 1, ease: 'power2.out',
      clearProps: 'transform',
      scrollTrigger: { trigger: 'footer', start: 'top 92%' }
    }
  );

  // Hero parallax — bg dots drift up
  gsap.to('.hero-bg-dots', {
    y: -60, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
  });

  // Hero blobs parallax
  gsap.to('.hero-blob-1', {
    y: -100, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2 }
  });
  gsap.to('.hero-blob-2', {
    y: -60, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2.5 }
  });

  // Bug mascot scroll parallax
  gsap.to('.bug-stage', {
    y: -30, ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2 }
  });

  // Section dividers — wipe in
  gsap.utils.toArray('.section-divider').forEach(div => {
    gsap.fromTo(div,
      { scaleX: 0, opacity: 0 },
      {
        scaleX: 1, opacity: 0.3, duration: 1.2, ease: 'power2.out',
        transformOrigin: 'left center',
        scrollTrigger: { trigger: div, start: 'top 90%' }
      }
    );
  });

  // Marquee — velocity speed boost
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    const baseDur = parseFloat(getComputedStyle(marqueeTrack).animationDuration) || 30;
    ScrollTrigger.create({
      trigger: '.marquee-section',
      start: 'top bottom', end: 'bottom top',
      onUpdate: self => {
        const vel = Math.abs(self.getVelocity()) / 500;
        marqueeTrack.style.animationDuration = Math.max(8, baseDur - vel * 12) + 's';
      }
    });
  }

})();






/* ─────────────────────────────────────────────
   6. PROJECT CARD — 3D tilt on mousemove
───────────────────────────────────────────── */
(function initCardTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    const imgEl = card.querySelector('.project-img-placeholder, .project-img-wrap, img');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width  - 0.5;
      const ny = (e.clientY - rect.top)  / rect.height - 0.5;

      card.style.transform = `perspective(1000px) rotateX(${ny * -7}deg) rotateY(${nx * 7}deg) translateZ(14px)`;
      card.style.transition = 'transform 0.08s ease';

      if (imgEl) {
        imgEl.style.transform = `translateX(${nx * 8}px) translateY(${ny * 8}px) scale(1.06)`;
        imgEl.style.transition = 'transform 0.08s ease';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
      if (imgEl) {
        imgEl.style.transform = '';
        imgEl.style.transition = 'transform 0.6s ease';
      }
    });
  });
})();


/* ─────────────────────────────────────────────
   7. BUG MASCOT — parallax follows cursor
───────────────────────────────────────────── */
(function initMascotParallax() {
  const mascot = document.querySelector('.bug-mascot');
  const hero   = document.getElementById('hero');
  if (!mascot || !hero) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left - r.width  / 2) * 0.018;
    ty = (e.clientY - r.top  - r.height / 2) * 0.018;
  });

  hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

  (function loop() {
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    // Only apply when not being controlled by GSAP scroll
    if (window.scrollY < 40) {
      mascot.style.transform = `translate(calc(-50% + ${cx}px), calc(-58% + ${cy}px))`;
    }
    requestAnimationFrame(loop);
  })();
})();


/* ─────────────────────────────────────────────
   8. NAVBAR — smart hide on scroll down
   Uses Lenis scroll event when available (stays in sync
   with virtual scroll position, prevents jank)
───────────────────────────────────────────── */
(function initNavHide() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  let lastY = 0;
  let hidden = false;
  const THRESHOLD = 5;

  function handleScroll(y) {
    if (y < 80) {
      if (hidden) {
        nav.style.transform = 'translateY(0)';
        hidden = false;
      }
      return;
    }
    if (y > lastY + THRESHOLD && !hidden) {
      nav.style.transform = 'translateY(-110%)';
      nav.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
      hidden = true;
    } else if (y < lastY - THRESHOLD && hidden) {
      nav.style.transform = 'translateY(0)';
      nav.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
      hidden = false;
    }
    lastY = y;
  }

  // Prefer Lenis scroll event (fires in RAF sync with smooth scroll)
  if (lenisInstance) {
    lenisInstance.on('scroll', ({ scroll }) => handleScroll(scroll));
  } else {
    window.addEventListener('scroll', () => handleScroll(window.scrollY), { passive: true });
  }
})();



/* ─────────────────────────────────────────────
   9. PROJECT CARDS — hover label overlay
      (inject if not already in HTML)
───────────────────────────────────────────── */
(function injectProjectHoverLabel() {
  document.querySelectorAll('.project-card').forEach(card => {
    // Find the image container
    const imgWrap = card.querySelector('.project-img-wrap, .project-img-placeholder');
    if (!imgWrap) return;
    // Only inject once
    if (imgWrap.querySelector('.project-hover-label')) return;
    const label = document.createElement('div');
    label.className = 'project-hover-label';
    label.innerHTML = '<span>View Project →</span>';
    // Need relative positioning on imgWrap
    imgWrap.style.position = 'relative';
    imgWrap.style.overflow = 'hidden';
    imgWrap.appendChild(label);
  });
})();


/* ─────────────────────────────────────────────
   10. REVEAL OBSERVER for new classes
───────────────────────────────────────────── */
(function initEnhancedReveal() {
  const els = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-scale, .section-divider');
  if (!els.length) return;

  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  els.forEach(el => obs.observe(el));
})();


/* ─────────────────────────────────────────────
   11. PROCESS STEPS REVEAL (fallback without GSAP)
───────────────────────────────────────────── */
(function initProcessReveal() {
  if (typeof gsap !== 'undefined') return; // GSAP handles it
  const steps = document.querySelectorAll('.process-step');
  if (!steps.length) return;

  const obs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    }),
    { threshold: 0.15 }
  );
  steps.forEach(s => obs.observe(s));
})();


/* ─────────────────────────────────────────────
   12. SMOOTH ANCHOR SCROLLING via Lenis
───────────────────────────────────────────── */
(function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      if (lenisInstance) {
        lenisInstance.scrollTo(target, { offset: -72, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


/* ─────────────────────────────────────────────
   13. ORBIT BUGS — speed up on hover
───────────────────────────────────────────── */
(function initOrbitHover() {
  document.querySelectorAll('.orbit-bug').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.animationPlayState = 'paused';
    });
    el.addEventListener('mouseleave', () => {
      el.style.animationPlayState = 'running';
    });
  });
})();


/* ─────────────────────────────────────────────
   14. SECTION DIVIDERS — inject between sections
───────────────────────────────────────────── */
(function injectDividers() {
  const sections = document.querySelectorAll('section.section');
  sections.forEach((sec, i) => {
    if (i === 0) return;
    const div = document.createElement('div');
    div.className = 'section-divider reveal';
    sec.parentNode.insertBefore(div, sec);
  });
})();
