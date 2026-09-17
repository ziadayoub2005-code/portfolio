/* ═══════════════════════════════════════════════════
   PORTFOLIO JAVASCRIPT — Zeyad Mohamed
   Fully Reactive Gallery, Lightbox, Navigation & Effects
   ═══════════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. NAVBAR SCROLL & ACTIVE STATE ─────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }
  }, { passive: true });

  // ── 2. MOBILE HAMBURGER MENU ────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── 3. SMOOTH ANCHOR SCROLL ─────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const topPos = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: topPos, behavior: 'smooth' });
    });
  });

  // ── 4. PROJECT GALLERIES (THUMBNAILS & ARROWS) ───────

  // Switch image in card gallery
  function switchCardImage(galleryId, newSrc, newAlt) {
    const mainContainer = document.getElementById(`gallery-${galleryId}-main`);
    if (!mainContainer) return;

    const mainImg = mainContainer.querySelector('.gallery-main-img');
    if (!mainImg) return;

    // Apply fade effect
    mainImg.style.transition = 'opacity 0.15s ease';
    mainImg.style.opacity = '0.3';

    setTimeout(() => {
      mainImg.src = newSrc;
      if (newAlt) mainImg.alt = newAlt;
      mainImg.style.opacity = '1';
    }, 150);

    // Update thumbnail highlights
    const thumbs = document.querySelectorAll(`.thumb[data-gallery="${galleryId}"]`);
    thumbs.forEach(t => {
      const match = t.getAttribute('data-src') === newSrc;
      t.classList.toggle('active', match);
      if (match) {
        // Ensure thumbnail is visible in scroll view
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  // Step card gallery by delta (-1 for prev, +1 for next)
  function stepCardGallery(galleryId, delta) {
    const thumbs = Array.from(document.querySelectorAll(`.thumb[data-gallery="${galleryId}"]`));
    if (!thumbs.length) return;

    let currentIndex = thumbs.findIndex(t => t.classList.contains('active'));
    if (currentIndex < 0) currentIndex = 0;

    const nextIndex = (currentIndex + delta + thumbs.length) % thumbs.length;
    const nextThumb = thumbs[nextIndex];
    const src = nextThumb.getAttribute('data-src') || nextThumb.src;
    switchCardImage(galleryId, src, nextThumb.alt);
  }

  // Event listener for thumbnails
  document.querySelectorAll('.thumb').forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      const galleryId = thumb.getAttribute('data-gallery');
      const src = thumb.getAttribute('data-src') || thumb.src;
      switchCardImage(galleryId, src, thumb.alt);
    });
  });

  // Event listener for card Prev/Next arrows
  document.querySelectorAll('.gallery-arrow').forEach(arrow => {
    arrow.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const galleryId = arrow.getAttribute('data-gallery');
      const isNext = arrow.classList.contains('gallery-next');
      stepCardGallery(galleryId, isNext ? 1 : -1);
    });
  });

  // ── 5. LIGHTBOX MODAL ───────────────────────────────
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');

  let currentLbGallery = '1';
  let currentLbIndex = 0;

  function openLightbox(galleryId, initialSrc) {
    if (!lightbox || !lbImg) return;

    currentLbGallery = galleryId;
    const thumbs = Array.from(document.querySelectorAll(`.thumb[data-gallery="${galleryId}"]`));
    if (!thumbs.length) return;

    currentLbIndex = thumbs.findIndex(t => {
      const tSrc = t.getAttribute('data-src') || t.src;
      return tSrc === initialSrc || (initialSrc && initialSrc.endsWith(t.getAttribute('data-src')));
    });

    if (currentLbIndex < 0) currentLbIndex = 0;

    updateLightboxView();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function updateLightboxView() {
    const thumbs = Array.from(document.querySelectorAll(`.thumb[data-gallery="${currentLbGallery}"]`));
    if (!thumbs.length) return;

    const currentThumb = thumbs[currentLbIndex];
    const src = currentThumb.getAttribute('data-src') || currentThumb.src;

    lbImg.style.transition = 'opacity 0.15s ease';
    lbImg.style.opacity = '0.3';

    setTimeout(() => {
      lbImg.src = src;
      lbImg.alt = currentThumb.alt || 'Project screenshot';
      lbImg.style.opacity = '1';
    }, 120);

    // Synchronize the card gallery as well
    switchCardImage(currentLbGallery, src, currentThumb.alt);
  }

  function stepLightbox(delta) {
    const thumbs = Array.from(document.querySelectorAll(`.thumb[data-gallery="${currentLbGallery}"]`));
    if (!thumbs.length) return;

    currentLbIndex = (currentLbIndex + delta + thumbs.length) % thumbs.length;
    updateLightboxView();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (lbImg) lbImg.src = '';
  }

  // Open lightbox when clicking on gallery main image (excluding arrow buttons)
  document.querySelectorAll('.gallery-main').forEach(mainEl => {
    mainEl.addEventListener('click', (e) => {
      if (e.target.closest('.gallery-arrow')) return;

      const mainImg = mainEl.querySelector('.gallery-main-img');
      const galleryId = mainEl.getAttribute('data-gallery') || mainEl.id.replace('gallery-', '').replace('-main', '');
      const currentSrc = mainImg ? (mainImg.getAttribute('src') || mainImg.src) : '';
      openLightbox(galleryId, currentSrc);
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) {
    lbPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      stepLightbox(-1);
    });
  }
  if (lbNext) {
    lbNext.addEventListener('click', (e) => {
      e.stopPropagation();
      stepLightbox(1);
    });
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation for Lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  // ── 6. SCROLL REVEAL ANIMATIONS ─────────────────────
  const revealTargets = [
    '.project-card',
    '.skill-category',
    '.timeline-item',
    '.contact-card',
    '.about-image-col',
    '.about-text-col',
    '.highlight-item',
    '.hero-text',
    '.hero-visual',
    '.academic-card',
    '.section-header',
    '.contact-cta-panel',
  ];

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, i * 60);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    });
  } else {
    // Fallback if IntersectionObserver is unsupported
    revealTargets.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.classList.add('visible');
      });
    });
  }

  // ── 7. ACTIVE NAV LINKS ON SCROLL ───────────────────
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navItems.forEach(a => {
            const isMatch = a.getAttribute('href') === `#${id}`;
            a.classList.toggle('active-link', isMatch);
          });
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => sectionObserver.observe(s));
  }

  // ── 8. TYPING EFFECT IN HERO ────────────────────────
  const titleEl = document.querySelector('.hero-title');
  if (titleEl) {
    const rawText = titleEl.textContent.trim();
    if (rawText) {
      titleEl.textContent = '';
      const cursor = document.createElement('span');
      cursor.className = 'type-cursor';
      cursor.textContent = '|';
      cursor.style.cssText = 'color:var(--clr-accent);margin-left:4px;animation:typeBlink 0.75s infinite;';
      titleEl.appendChild(cursor);

      // Inject blinking keyframe if needed
      if (!document.getElementById('cursor-style')) {
        const style = document.createElement('style');
        style.id = 'cursor-style';
        style.textContent = '@keyframes typeBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }';
        document.head.appendChild(style);
      }

      let charIndex = 0;
      const typeSpeed = 50;
      const typeTimer = setInterval(() => {
        if (charIndex < rawText.length) {
          titleEl.insertBefore(document.createTextNode(rawText[charIndex]), cursor);
          charIndex++;
        } else {
          clearInterval(typeTimer);
          setTimeout(() => {
            if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
          }, 3500);
        }
      }, typeSpeed);
    }
  }

});
