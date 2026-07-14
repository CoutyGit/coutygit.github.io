/**
 * ANTIGRAVITY SKILLS — Efeitos Interativos para Couty
 * Includes: cursor follower, scroll reveal, 3D tilt, magnetic buttons,
 * particles background, typewriter, counters, parallax, spotlight
 *
 * Uso: <script src="antigravity.js" defer></script>
 */

(function () {
  'use strict';

  /* ===========================================================
     CONFIG
  =========================================================== */

  const CONFIG = {
    cursor: {
      enabled: true,
      dotSize: 8,
      ringSize: 40,
      ringSizeHover: 60,
    },
    particles: {
      enabled: true,
      count: 40,
      colors: ['rgba(201,151,58,0.3)', 'rgba(245,240,232,0.2)'],
      maxRadius: 3,
      speed: 0.3,
    },
    scrollReveal: {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    },
    tilt: {
      maxTilt: 8,
      perspective: 1000,
      scale: 1.02,
    },
    magnetic: {
      strength: 0.3,
    },
    typewriter: {
      speed: 60,
      deleteSpeed: 40,
      pauseEnd: 2000,
      pauseStart: 500,
    },
  };

  /* ===========================================================
     1. CURSOR FOLLOWER
  =========================================================== */

  class CursorFollower {
    constructor() {
      if (!CONFIG.cursor.enabled || window.innerWidth < 768) return;

      this.dot = null;
      this.ring = null;
      this.mouseX = -100;
      this.mouseY = -100;
      this.ringX = -100;
      this.ringY = -100;
      this.init();
    }

    init() {
      this.dot = document.createElement('div');
      this.dot.className = 'ag-cursor-dot';
      this.dot.style.display = 'none';
      document.body.appendChild(this.dot);

      this.ring = document.createElement('div');
      this.ring.className = 'ag-cursor-ring';
      this.ring.style.display = 'none';
      document.body.appendChild(this.ring);

      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.dot.style.transform = `translate(${this.mouseX}px, ${this.mouseY}px)`;
      });

      document.addEventListener('mouseenter', () => {
        this.dot.style.display = 'block';
        this.ring.style.display = 'block';
      });

      document.addEventListener('mouseleave', () => {
        this.dot.style.display = 'none';
        this.ring.style.display = 'none';
      });

      const hoverTargets = 'a, button, .btn-primary, .btn-outline, .product-card, .filtro-pill, .ag-tilt-card';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
          this.ring.classList.add('hover');
        }
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
          this.ring.classList.remove('hover');
        }
      });

      const animate = () => {
        this.ringX += (this.mouseX - this.ringX) * 0.12;
        this.ringY += (this.mouseY - this.ringY) * 0.12;
        this.ring.style.transform = `translate(${this.ringX}px, ${this.ringY}px)`;
        requestAnimationFrame(animate);
      };
      animate();
    }
  }

  /* ===========================================================
     2. SCROLL REVEAL
  =========================================================== */

  class ScrollReveal {
    constructor() {
      this.observer = null;
      this.init();
    }

    init() {
      const elements = document.querySelectorAll('.ag-reveal, .ag-reveal-left, .ag-reveal-right, .ag-reveal-scale');
      if (!elements.length) return;

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer.unobserve(entry.target);
          }
        });
      }, CONFIG.scrollReveal);

      elements.forEach((el) => this.observer.observe(el));
    }

    observe(element) {
      if (this.observer && element) {
        this.observer.observe(element);
      }
    }
  }

  /* ===========================================================
     3. PRODUCT CARD ENHANCEMENTS (MUST RUN BEFORE TILT)
  =========================================================== */

  class ProductCardEnhancer {
    constructor() {
      this.init();
    }

    init() {
      document.querySelectorAll('.product-card').forEach((card) => {
        if (!card.classList.contains('ag-tilt-card')) {
          card.classList.add('ag-tilt-card');
        }
      });

      document.querySelectorAll('.product-card').forEach((el) => {
        if (!el.classList.contains('ag-reveal') &&
            !el.classList.contains('ag-reveal-left') &&
            !el.classList.contains('ag-reveal-right') &&
            !el.classList.contains('ag-reveal-scale')) {
          el.classList.add('ag-reveal');
        }
      });
    }
  }

  /* ===========================================================
     4. 3D TILT CARDS
  =========================================================== */

  class TiltCards {
    constructor() {
      this.init();
    }

    init() {
      const cards = document.querySelectorAll('.ag-tilt-card');
      if (!cards.length) return;

      cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -CONFIG.tilt.maxTilt;
          const rotateY = ((x - centerX) / centerX) * CONFIG.tilt.maxTilt;

          card.style.transform = `perspective(${CONFIG.tilt.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${CONFIG.tilt.scale}, ${CONFIG.tilt.scale}, ${CONFIG.tilt.scale})`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = `perspective(${CONFIG.tilt.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
      });
    }
  }

  /* ===========================================================
     5. MAGNETIC BUTTONS
  =========================================================== */

  class MagneticButtons {
    constructor() {
      this.init();
    }

    init() {
      const buttons = document.querySelectorAll('.ag-magnetic');
      if (!buttons.length) return;

      buttons.forEach((btn) => {
        const inner = btn.querySelector('.ag-magnetic-inner') || btn;
        const strength = CONFIG.magnetic.strength;

        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          inner.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });

        btn.addEventListener('mouseleave', () => {
          inner.style.transform = 'translate(0, 0)';
        });
      });
    }
  }

  /* ===========================================================
     6. PARTICLES BACKGROUND
  =========================================================== */

  class ParticlesBackground {
    constructor() {
      if (!CONFIG.particles.enabled) return;
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.rafId = null;
      this.init();
    }

    init() {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'ag-particles-canvas';
      document.body.prepend(this.canvas);
      this.ctx = this.canvas.getContext('2d');

      this.resize();
      this.createParticles();
      this.animate();

      window.addEventListener('resize', () => {
        this.resize();
        // Reposiciona partículas dentro dos novos limites
        this.particles.forEach((p) => {
          p.x = Math.min(p.x, this.canvas.width);
          p.y = Math.min(p.y, this.canvas.height);
        });
      });
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    createParticles() {
      this.particles = [];
      for (let i = 0; i < CONFIG.particles.count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * CONFIG.particles.speed,
          vy: (Math.random() - 0.5) * CONFIG.particles.speed,
          radius: Math.random() * CONFIG.particles.maxRadius + 1,
          color: CONFIG.particles.colors[Math.floor(Math.random() * CONFIG.particles.colors.length)],
        });
      }
    }

    animate() {
      if (!this.ctx || !this.canvas) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.radius) p.x = this.canvas.width + p.radius;
        if (p.x > this.canvas.width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = this.canvas.height + p.radius;
        if (p.y > this.canvas.height + p.radius) p.y = -p.radius;

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      });

      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.strokeStyle = `rgba(201, 151, 58, ${0.08 * (1 - dist / 150)})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
          }
        }
      }

      this.rafId = requestAnimationFrame(() => this.animate());
    }
  }

  /* ===========================================================
     7. TYPEWRITER EFFECT
  =========================================================== */

  class Typewriter {
    constructor(element, texts, options = {}) {
      this.element = element;
      this.texts = texts;
      this.options = { ...CONFIG.typewriter, ...options };
      this.currentIndex = 0;
      this.charIndex = 0;
      this.isDeleting = false;
      this.cursor = null;
      this.init();
    }

    init() {
      if (!this.element || !this.texts.length) return;

      this.cursor = document.createElement('span');
      this.cursor.className = 'ag-typewriter-cursor';
      this.element.after(this.cursor);

      this.type();
    }

    type() {
      const currentText = this.texts[this.currentIndex];

      if (this.isDeleting) {
        this.element.textContent = currentText.substring(0, this.charIndex - 1);
        this.charIndex--;
      } else {
        this.element.textContent = currentText.substring(0, this.charIndex + 1);
        this.charIndex++;
      }

      let delay = this.options.speed;

      if (!this.isDeleting && this.charIndex === currentText.length) {
        delay = this.options.pauseEnd;
        this.isDeleting = true;
      } else if (this.isDeleting && this.charIndex === 0) {
        this.isDeleting = false;
        this.currentIndex = (this.currentIndex + 1) % this.texts.length;
        delay = this.options.pauseStart;
      }

      setTimeout(() => this.type(), delay);
    }
  }

  /* ===========================================================
     8. COUNTER ANIMATION
  =========================================================== */

  class CounterAnimation {
    constructor(element, target, options = {}) {
      this.element = element;
      this.target = target;
      this.suffix = element.dataset.agSuffix || '';
      this.options = { duration: 2000, ...options };
      this.current = 0;
      this.startTime = null;
      this.observer = null;
      this.animated = false;
      this.init();
    }

    init() {
      if (!this.element) return;

      this.observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !this.animated) {
          this.animated = true;
          this.start();
          this.observer.unobserve(this.element);
        }
      }, { threshold: 0.5 });

      this.observer.observe(this.element);
    }

    start() {
      this.startTime = performance.now();
      const animate = (time) => {
        const elapsed = time - this.startTime;
        const progress = Math.min(elapsed / this.options.duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);
        this.current = Math.floor(eased * this.target);
        this.element.textContent = this.current.toLocaleString('pt-BR') + this.suffix;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.element.textContent = this.target.toLocaleString('pt-BR') + this.suffix;
        }
      };
      requestAnimationFrame(animate);
    }
  }

  /* ===========================================================
     9. SPOTLIGHT EFFECT
  =========================================================== */

  class SpotlightEffect {
    constructor() {
      this.init();
    }

    init() {
      const elements = document.querySelectorAll('.ag-spotlight');
      if (!elements.length) return;

      elements.forEach((el) => {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          el.style.setProperty('--ag-mouse-x', `${x}%`);
          el.style.setProperty('--ag-mouse-y', `${y}%`);
        });
      });
    }
  }

  /* ===========================================================
     10. PARALLAX ON SCROLL
  =========================================================== */

  class ParallaxScroll {
    constructor() {
      this.init();
    }

    init() {
      const layers = document.querySelectorAll('.ag-parallax-layer');
      if (!layers.length) return;

      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            layers.forEach((layer) => {
              const speed = parseFloat(layer.dataset.speed || 0.3);
              const rect = layer.parentElement?.getBoundingClientRect();
              if (!rect) return;
              const offset = rect.top * speed;
              layer.style.transform = `translateY(${offset}px)`;
            });
            ticking = false;
          });
          ticking = true;
        }
      });
    }
  }

  /* ===========================================================
     BOOTSTRAP
  =========================================================== */

  function init() {
    // 1. Cursor personalizado
    new CursorFollower();

    // 2. Partículas
    new ParticlesBackground();

    // 3. Scroll Reveal
    const reveal = new ScrollReveal();

    // 4. Product Card enhancements (deve rodar ANTES do TiltCards)
    new ProductCardEnhancer();

    // 5. 3D Tilt Cards — agora os cards já têm a classe ag-tilt-card
    new TiltCards();

    // 6. Magnetic Buttons
    new MagneticButtons();

    // 7. Spotlight
    new SpotlightEffect();

    // 8. Parallax
    new ParallaxScroll();

    // 9. Typewriter no hero
    const typewriterEl = document.querySelector('[data-ag-typewriter]');
    if (typewriterEl) {
      try {
        const texts = JSON.parse(typewriterEl.dataset.agTypewriter || '[]');
        if (texts.length) {
          new Typewriter(typewriterEl, texts);
        }
      } catch (e) {
        console.warn('Typewriter parse error:', e);
      }
    }

    // 10. Counter animations
    document.querySelectorAll('[data-ag-counter]').forEach((el) => {
      const target = parseInt(el.dataset.agCounter, 10);
      if (!isNaN(target)) {
        new CounterAnimation(el, target);
      }
    });

    // 11. MutationObserver para re-aplicar efeitos quando filtros mudarem
    const observer = new MutationObserver(() => {
      const newCards = document.querySelectorAll('.product-card:not(.ag-tilt-card)');
      newCards.forEach((card) => {
        card.classList.add('ag-tilt-card');
      });
      if (newCards.length > 0) {
        new TiltCards();
      }
    });

    const grid = document.querySelector('.product-grid');
    if (grid) {
      observer.observe(grid, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
