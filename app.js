window.addEventListener('DOMContentLoaded', () => {
  initBackgroundAnimation();
  initFormHandler();
  // initProductCarousel();  // Disabled - using grid layout instead
  initCatalogEditor();
  initScrollAnimations();
  initCounterAnimations();
  initHeaderAnimation();
  initTextRevealAnimations();
  initButtonAnimations();
  initSectionAnimations();
  initFormInputAnimations();
  initFooterAnimation();
  initSmoothLinkAnimations();
  initIconAnimations();
  initPageLoadAnimation();
  initTooltipAnimations();
  lucide.createIcons();
});

// ─── 2D Canvas Particle Network Animation with 3D Effects ──────────────────────────────────────
function initBackgroundAnimation() {
  const canvas = document.querySelector('#webgl-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // ── Sizing ──────────────────────────────────────────────────────────────────
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); });

  // ── 3D Perspective Background with Modern Gradient ────────────────────────────────────────────
  function draw3DBackground(t) {
    const w = canvas.width;
    const h = canvas.height;

    // Create beautiful dark blue gradient background
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, '#0a1628');
    grd.addColorStop(0.3, '#0f2a47');
    grd.addColorStop(0.6, '#1a3f5c');
    grd.addColorStop(1, '#0d1f35');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // Draw 3D perspective lines
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 1.5;

    // Vanishing point effect - horizontal diagonal lines
    const vanishPointX = w * 0.65;
    const vanishPointY = h * 0.5;

    // Draw perspective grid
    for (let i = 0; i < 15; i++) {
      const offset = i * (w / 15);
      const t1 = i * 0.1;

      // Left to vanish point lines
      ctx.beginPath();
      ctx.moveTo(offset, -10);
      ctx.lineTo(vanishPointX + Math.sin(t * 0.3 + t1) * 20, vanishPointY);
      ctx.stroke();

      // Diagonal perspective lines
      ctx.beginPath();
      ctx.moveTo(offset - 100 * Math.sin(t * 0.2), h);
      ctx.lineTo(vanishPointX + Math.sin(t * 0.3 + t1) * 20, vanishPointY);
      ctx.stroke();
    }

    // Horizontal perspective lines
    for (let i = 0; i < 12; i++) {
      const yOffset = i * (h / 12);
      const t1 = i * 0.15;

      ctx.beginPath();
      ctx.moveTo(-50 + Math.sin(t * 0.2 + t1) * 30, yOffset);
      ctx.lineTo(w + 50 + Math.cos(t * 0.2 + t1) * 30, yOffset);
      ctx.stroke();
    }

    ctx.restore();

    // Add subtle animated glow areas
    const glowGradient = ctx.createRadialGradient(
      vanishPointX, vanishPointY, 0,
      vanishPointX, vanishPointY, 300
    );
    glowGradient.addColorStop(0, `rgba(100, 200, 255, ${0.08 + 0.04 * Math.sin(t * 0.5)})`);
    glowGradient.addColorStop(1, `rgba(100, 200, 255, 0)`);

    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, w, h);
  }

  // ── Config ───────────────────────────────────────────────────────────────────
  const PARTICLE_COUNT = 90;
  const MAX_DIST = 160;   // connection distance (px)
  const SPEED = 0.45;
  const PARTICLE_RADIUS = 2.2;
  const COLOR_DOT = '91, 33, 182';   // --accent-primary RGB
  const COLOR_LINE = '91, 33, 182';   // --accent-primary RGB
  const MOUSE_REPEL_DIST = 120;
  const MOUSE_REPEL_STR = 0.06;

  // ── Mouse tracking ───────────────────────────────────────────────────────────
  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // ── Particle factory ─────────────────────────────────────────────────────────
  class Particle {
    constructor() { this.reset(true); }

    reset(randomY = false) {
      this.x = Math.random() * canvas.width;
      this.y = randomY ? Math.random() * canvas.height : -PARTICLE_RADIUS;
      this.vx = (Math.random() - 0.5) * SPEED;
      this.vy = (Math.random() - 0.5) * SPEED;
      this.r = PARTICLE_RADIUS * (0.6 + Math.random() * 0.8);
      this.alpha = 0.25 + Math.random() * 0.55;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(t) {
      // Gentle mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_REPEL_DIST && dist > 0) {
        const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST;
        this.vx += (dx / dist) * force * MOUSE_REPEL_STR;
        this.vy += (dy / dist) * force * MOUSE_REPEL_STR;
      }

      // Speed cap
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > SPEED * 2.5) {
        this.vx = (this.vx / speed) * SPEED * 2.5;
        this.vy = (this.vy / speed) * SPEED * 2.5;
      }

      // Damping
      this.vx *= 0.995;
      this.vy *= 0.995;

      this.x += this.vx;
      this.y += this.vy;

      // Wrap edges
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;

      // Subtle pulsing alpha
      this.currentAlpha = this.alpha * (0.75 + 0.25 * Math.sin(t * 1.2 + this.pulseOffset));
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR_DOT}, ${this.currentAlpha})`;
      ctx.fill();
    }
  }

  // ── Spawn particles ───────────────────────────────────────────────────────────
  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

  // ── Draw connections ──────────────────────────────────────────────────────────
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DIST) {
          const lineAlpha = (1 - dist / MAX_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${COLOR_LINE}, ${lineAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  // ── Draw mouse highlight ring ─────────────────────────────────────────────────
  function drawMouseRing() {
    if (mouse.x === -9999) return;
    const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_REPEL_DIST);
    grad.addColorStop(0, `rgba(${COLOR_DOT}, 0.06)`);
    grad.addColorStop(1, `rgba(${COLOR_DOT}, 0)`);
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, MOUSE_REPEL_DIST, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // ── Animation loop ────────────────────────────────────────────────────────────
  let startTime = null;
  function animate(ts) {
    if (!startTime) startTime = ts;
    const t = (ts - startTime) / 1000;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw 3D animated background
    draw3DBackground(t);

    drawMouseRing();
    drawConnections();
    particles.forEach(p => { p.update(t); p.draw(); });

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// ─── GSAP Scroll Fade-in Animations ───────────────────────────────────────────
function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  const textTriggers = [
    { selector: '.specs-content > *', trigger: '#specs' },
    { selector: '.spec-card', trigger: '#specs', stagger: 0.12 },
    { selector: '#products .section-header > *', trigger: '#products' },
    { selector: '.product-card', trigger: '#products', stagger: 0.12 },
    { selector: '.metrics-content > *', trigger: '#metrics' },
    { selector: '.metric-row', trigger: '#metrics', stagger: 0.15 },
    { selector: '.inquiry-container > *', trigger: '#inquiry' },
  ];

  textTriggers.forEach(({ selector, trigger, stagger }) => {
    gsap.from(selector, {
      scrollTrigger: {
        trigger,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 32,
      duration: 0.75,
      ease: 'power2.out',
      stagger: stagger || 0,
    });
  });

  // Add rotation animation to spec cards on hover
  document.querySelectorAll('.spec-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
      gsap.to(this, {
        rotationX: 5,
        rotationY: 5,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', function () {
      gsap.to(this, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
  });

  // Animate product card on scroll and hover
  document.querySelectorAll('.product-card').forEach((card, index) => {
    card.addEventListener('mouseenter', function () {
      gsap.to(this, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', function () {
      gsap.to(this, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
}

// ─── Counter Animation Function ───────────────────────────────────────────────
function initCounterAnimations() {
  const counters = document.querySelectorAll('.metric-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        const finalValue = parseInt(entry.target.textContent.replace(/,/g, ''));
        const element = entry.target;

        gsap.to({ value: 0 }, {
          value: finalValue,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            element.textContent = Math.floor(this.targets()[0].value).toLocaleString();
          }
        });
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
}

// ─── Floating Header Animation ───────────────────────────────────────────────
function initHeaderAnimation() {
  gsap.to('header', {
    duration: 0.6,
    opacity: 1,
    ease: 'power2.out',
    onComplete: () => {
      gsap.to('header', {
        duration: 4,
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  });
}

// ─── Text Reveal Animation (Letter by Letter) ───────────────────────────────
function initTextRevealAnimations() {
  const titleElements = document.querySelectorAll('.hero-title, .section-title');

  titleElements.forEach(titleElement => {
    const text = titleElement.textContent;
    titleElement.innerHTML = text.split('').map(char =>
      `<span style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');

    const spans = titleElement.querySelectorAll('span');
    gsap.staggerTo(spans, 0.05, {
      opacity: 1,
      ease: 'back.out',
    }, 0.02);
  });
}

// ─── Enhanced Button Animations ───────────────────────────────────────────────
function initButtonAnimations() {
  const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-btn');

  buttons.forEach(button => {
    button.addEventListener('mouseenter', function () {
      gsap.to(this, {
        scale: 1.08,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    button.addEventListener('mouseleave', function () {
      gsap.to(this, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    button.addEventListener('click', function () {
      gsap.to(this, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    });
  });
}

// ─── Section Entry Animations ──────────────────────────────────────────────────
function initSectionAnimations() {
  const sections = document.querySelectorAll('section');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        gsap.from(entry.target, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: 'power2.out'
        });
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => sectionObserver.observe(section));
}

// ─── Form Input Animations ───────────────────────────────────────────────────
function initFormInputAnimations() {
  const formInputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');

  formInputs.forEach((input, index) => {
    const label = input.previousElementSibling;

    input.addEventListener('focus', function () {
      gsap.to(label, {
        color: '#00d4ff',
        duration: 0.2,
        textShadow: '0 0 10px rgba(0, 212, 255, 0.5)'
      });

      gsap.to(this, {
        scale: 1.02,
        duration: 0.2,
        ease: 'back.out'
      });
    });

    input.addEventListener('blur', function () {
      if (!this.value) {
        gsap.to(label, {
          color: 'var(--text-primary)',
          duration: 0.2,
          textShadow: 'none'
        });
      }

      gsap.to(this, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    input.addEventListener('input', function () {
      if (this.value) {
        gsap.to(label, {
          color: '#00d4ff',
          duration: 0.2
        });
      }
    });
  });
}

// ─── Footer Animation ──────────────────────────────────────────────────────
function initFooterAnimation() {
  const footer = document.querySelector('footer');
  const footerCols = document.querySelectorAll('.footer-col');

  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        gsap.staggerFrom(footerCols, 0.5, {
          opacity: 0,
          y: 30,
          ease: 'power2.out'
        }, 0.1);
      }
    });
  }, { threshold: 0.3 });

  if (footer) footerObserver.observe(footer);
}

// ─── Smooth Link Animations ────────────────────────────────────────────────
function initSmoothLinkAnimations() {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();
        gsap.to(window, {
          duration: 0.8,
          scrollTo: {
            y: target,
            offsetY: 80,
            autoKill: false
          },
          ease: 'power2.inOut'
        });
      }
    });
  });
}

// ─── Icon Animations ──────────────────────────────────────────────────────
function initIconAnimations() {
  const icons = document.querySelectorAll('[data-lucide]');

  icons.forEach(icon => {
    const parent = icon.closest('.spec-icon-wrapper, .footer-col, .product-card, .inquiry-container');

    if (parent) {
      parent.addEventListener('mouseenter', function () {
        gsap.to(icon, {
          rotation: 360,
          duration: 0.6,
          ease: 'back.out'
        });
      });
    }
  });
}

// ─── Page Load Animations ──────────────────────────────────────────────────
function initPageLoadAnimation() {
  // Fade in the whole UI container
  gsap.from('.ui-container', {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out'
  });
}

// ─── Tooltip Animations ────────────────────────────────────────────────────
function initTooltipAnimations() {
  const elementsWithTitle = document.querySelectorAll('[title]');

  elementsWithTitle.forEach(element => {
    element.addEventListener('mouseenter', function () {
      const tooltip = document.createElement('div');
      tooltip.textContent = this.getAttribute('title');
      tooltip.style.cssText = `
        position: fixed;
        background: rgba(0, 212, 255, 0.9);
        color: #000;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.8rem;
        pointer-events: none;
        z-index: 1000;
      `;

      document.body.appendChild(tooltip);

      const rect = this.getBoundingClientRect();
      tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
      tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

      gsap.from(tooltip, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        ease: 'back.out'
      });

      element.addEventListener('mouseleave', function () {
        gsap.to(tooltip, {
          opacity: 0,
          y: -10,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => tooltip.remove()
        });
      }, { once: true });
    });
  });
}


const canvas = document.querySelector('#webgl-canvas');
if (!canvas) return;

// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0f1520, 0.06);

// Camera setup
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 7.5);

// Renderer setup with local clipping enabled for the printing effect
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.localClippingEnabled = true; // CRITICAL for printer layer rendering

// Main container group for centering and tilting
const coreGroup = new THREE.Group();
scene.add(coreGroup);

// Colors (softer, less saturated)
const COLOR_CYAN = 0x06b6d4;  // --accent-secondary
const COLOR_AMBER = 0x5b21b6;  // --accent-primary
const COLOR_DARK = 0x151d2e;

// 1. Printer Bounding Box Cage (Build Volume Grid)
const cageWidth = 3.6;
const cageHeight = 4.0;
const cageDepth = 3.6;

const cageGeo = new THREE.BoxGeometry(cageWidth, cageHeight, cageDepth);
const cageHelper = new THREE.BoxHelper(new THREE.Mesh(cageGeo), 0x2a3550);
cageHelper.material.transparent = true;
cageHelper.material.opacity = 0.2;
coreGroup.add(cageHelper);

// Cage corner rails (to look like steel supports)
const railGeo = new THREE.BoxGeometry(0.1, cageHeight, 0.1);
const railMat = new THREE.MeshStandardMaterial({
  color: 0x2a3550,
  metalness: 0.7,
  roughness: 0.4
});

const railPositions = [
  [-cageWidth / 2, 0, -cageDepth / 2],
  [cageWidth / 2, 0, -cageDepth / 2],
  [-cageWidth / 2, 0, cageDepth / 2],
  [cageWidth / 2, 0, cageDepth / 2]
];

railPositions.forEach(pos => {
  const rail = new THREE.Mesh(railGeo, railMat);
  rail.position.set(pos[0], pos[1], pos[2]);
  coreGroup.add(rail);
});

// 2. Print Bed Platform (Bottom Plate)
const bedGeo = new THREE.BoxGeometry(cageWidth + 0.2, 0.1, cageDepth + 0.2);
const bedMat = new THREE.MeshStandardMaterial({
  color: 0x0f172a,
  metalness: 0.85,
  roughness: 0.4,
  emissive: 0x0f172a
});
const printBed = new THREE.Mesh(bedGeo, bedMat);
printBed.position.y = -cageHeight / 2; // bottom
coreGroup.add(printBed);

// Glowing heating elements on bed (grid lines)
const bedGrid = new THREE.GridHelper(cageWidth, 10, COLOR_AMBER, 0x2d1b4e);
bedGrid.position.y = -cageHeight / 2 + 0.06;
bedGrid.material.transparent = true;
bedGrid.material.opacity = 0.15;
coreGroup.add(bedGrid);

// 3. Print Head Assembly (Nozzle & Extruder Carriage)
const printHead = new THREE.Group();
coreGroup.add(printHead);

// Extruder Block
const blockGeo = new THREE.BoxGeometry(0.5, 0.3, 0.5);
const blockMat = new THREE.MeshStandardMaterial({
  color: 0x334155,
  metalness: 0.9,
  roughness: 0.1
});
const block = new THREE.Mesh(blockGeo, blockMat);
printHead.add(block);

// Brass Nozzle
const nozzleGeo = new THREE.ConeGeometry(0.12, 0.2, 8);
const nozzleMat = new THREE.MeshStandardMaterial({
  color: COLOR_AMBER,
  metalness: 0.95,
  roughness: 0.1
});
const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
nozzle.rotation.x = Math.PI; // point down
nozzle.position.y = -0.25;
printHead.add(nozzle);

// Glowing indicator light on print head
const headIndicator = new THREE.PointLight(COLOR_CYAN, 2, 2.5);
headIndicator.position.set(0, -0.3, 0);
printHead.add(headIndicator);

// 4. The 3D Object Being Built (Extruded Torus Knot)
// Clipping Plane: hides anything above the printY level
const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);

const objectGeo = new THREE.TorusKnotGeometry(0.9, 0.28, 120, 16);
const objectMat = new THREE.MeshStandardMaterial({
  color: COLOR_CYAN,
  wireframe: true,
  transparent: true,
  opacity: 0.45,
  emissive: COLOR_CYAN,
  emissiveIntensity: 0.2,
  clippingPlanes: [clipPlane]
});

const printedMesh = new THREE.Mesh(objectGeo, objectMat);
printedMesh.position.y = -0.4; // Center inside build volume
coreGroup.add(printedMesh);

// Inner solid mesh glowing to show melting process (slightly smaller)
const solidObjectGeo = new THREE.TorusKnotGeometry(0.88, 0.26, 120, 16);
const solidObjectMat = new THREE.MeshBasicMaterial({
  color: COLOR_CYAN,
  transparent: true,
  opacity: 0.06,
  clippingPlanes: [clipPlane]
});
const printedSolidMesh = new THREE.Mesh(solidObjectGeo, solidObjectMat);
printedSolidMesh.position.y = -0.4;
coreGroup.add(printedSolidMesh);

// 5. Filament Particle Spray (Stream from nozzle tip to object surface)
const particleCount = 80;
const particleGeo = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleSpeeds = new Float32Array(particleCount);

// Initialize particles at the bed level
for (let i = 0; i < particleCount * 3; i += 3) {
  particlePositions[i] = 0;
  particlePositions[i + 1] = -2.0;
  particlePositions[i + 2] = 0;
  particleSpeeds[i / 3] = 0.05 + Math.random() * 0.05;
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
  grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.2)');
  grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  return new THREE.CanvasTexture(canvas);
}

const particleMat = new THREE.PointsMaterial({
  color: COLOR_CYAN,
  size: 0.1,
  transparent: true,
  opacity: 0.5,
  map: createParticleTexture(),
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particleSystem = new THREE.Points(particleGeo, particleMat);
coreGroup.add(particleSystem);

// 6. Global Ambient Particle Fog (Fills printing chamber)
const chamberFogCount = 120;
const fogGeo = new THREE.BufferGeometry();
const fogPositions = new Float32Array(chamberFogCount * 3);

for (let i = 0; i < chamberFogCount * 3; i += 3) {
  fogPositions[i] = (Math.random() - 0.5) * cageWidth;
  fogPositions[i + 1] = (Math.random() - 0.5) * cageHeight;
  fogPositions[i + 2] = (Math.random() - 0.5) * cageDepth;
}
fogGeo.setAttribute('position', new THREE.BufferAttribute(fogPositions, 3));

const fogMat = new THREE.PointsMaterial({
  color: COLOR_CYAN,
  size: 0.04,
  transparent: true,
  opacity: 0.12,
  blending: THREE.AdditiveBlending
});
const fogParticles = new THREE.Points(fogGeo, fogMat);
coreGroup.add(fogParticles);

// Lighting
const ambientLight = new THREE.AmbientLight(0x151d2e, 1.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(COLOR_AMBER, 0.8);
keyLight.position.set(5, 8, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x1e1b4b, 0.5);
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);

// Dynamic laser line tracing on the active layer
const laserGeo = new THREE.BufferGeometry();
const laserPositions = new Float32Array(6); // 2 points (nozzle to mesh)
laserGeo.setAttribute('position', new THREE.BufferAttribute(laserPositions, 3));
const laserMat = new THREE.LineBasicMaterial({
  color: COLOR_CYAN,
  linewidth: 1,
  transparent: true,
  opacity: 0.5
});
const laserLine = new THREE.Line(laserGeo, laserMat);
coreGroup.add(laserLine);

// Interactive Mouse Tilt
let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Responsive Resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// GSAP + ScrollTrigger Page Transitions
gsap.registerPlugin(ScrollTrigger);

// Section 1 (Hero) -> Section 2 (Specs)
// Move printer slightly to the right
gsap.timeline({
  scrollTrigger: {
    trigger: "#specs",
    start: "top bottom",
    end: "top top",
    scrub: 1,
    immediateRender: false
  }
})
  .to(coreGroup.position, { x: 2.2, y: 0.3, z: 0.5, ease: "power1.inOut" })
  .to(coreGroup.rotation, { y: Math.PI / 4, ease: "power1.inOut" }, 0);

// Section 2 (Specs) -> Section 2.5 (Products)
// Move printer to the left and rotate slightly
gsap.timeline({
  scrollTrigger: {
    trigger: "#products",
    start: "top bottom",
    end: "top top",
    scrub: 1,
    immediateRender: false
  }
})
  .to(coreGroup.position, { x: -2.3, y: 0.0, z: 0.8, ease: "power1.inOut" })
  .to(coreGroup.rotation, { y: -Math.PI / 3, ease: "power1.inOut" }, 0);

// Section 2.5 (Products) -> Section 3 (Metrics)
// Shift printer down and tilt camera to inspect the build bed perspective
gsap.timeline({
  scrollTrigger: {
    trigger: "#metrics",
    start: "top bottom",
    end: "top top",
    scrub: 1,
    immediateRender: false
  }
})
  .to(coreGroup.position, { x: 2.2, y: -0.5, z: 0.3, ease: "power1.inOut" })
  .to(coreGroup.rotation, { x: Math.PI / 5, y: Math.PI / 6, ease: "power1.inOut" }, 0);

// Section 3 (Metrics) -> Section 4 (Inquiry)
// Bring printer back to center background and scale it down
gsap.timeline({
  scrollTrigger: {
    trigger: "#inquiry",
    start: "top bottom",
    end: "top top",
    scrub: 1,
    immediateRender: false
  }
})
  .to(coreGroup.position, { x: 0, y: 0.2, z: -3.2, ease: "power1.inOut" })
  .to(coreGroup.rotation, { x: 0, y: Math.PI / 2, ease: "power1.inOut" }, 0)
  .to(headIndicator, { intensity: 10, distance: 8, ease: "power1.inOut" }, 0);

// GSAP Fade reveals for text containers
const textTriggers = [
  { selector: ".specs-content > *", trigger: "#specs" },
  { selector: ".spec-card", trigger: "#specs", stagger: 0.12 },
  { selector: "#products .section-header > *", trigger: "#products" },
  { selector: ".product-card", trigger: "#products", stagger: 0.15 },
  { selector: ".metrics-content > *", trigger: "#metrics" },
  { selector: ".metric-row", trigger: "#metrics", stagger: 0.15 },
  { selector: ".inquiry-container > *", trigger: "#inquiry" }
];

textTriggers.forEach(({ selector, trigger, stagger }) => {
  gsap.from(selector, {
    scrollTrigger: {
      trigger: trigger,
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    opacity: 0,
    y: 40,
    duration: 0.8,
    ease: "power2.out",
    stagger: stagger || 0
  });
});

// Clock for autonomous loop
const clock = new THREE.Clock();

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  // 1. Calculate build printing layers (clipping height)
  // Loop height slowly from -2.0 (bed) up to +1.2 (top of mesh), then reset
  const printDuration = 16.0; // seconds per build loop
  const printProgress = (elapsedTime / printDuration) % 1.0;
  const printY = -2.0 + (printProgress * 3.2);

  // 2. Animate Print Head Nozzle
  // Fast orbital pattern in X/Z to simulate extruding details on current layer Y
  const headSpeed = 12.0;
  const pathX = Math.cos(elapsedTime * headSpeed) * (0.8 + Math.sin(elapsedTime * 2.0) * 0.2);
  const pathZ = Math.sin(elapsedTime * headSpeed) * (0.8 + Math.sin(elapsedTime * 2.0) * 0.2);

  // Set nozzle coordinates
  printHead.position.set(pathX, printY + 0.25, pathZ);

  // Update clipping plane constant (reveals mesh up to nozzle height)
  // Since printedMesh is placed at y = -0.4, the relative plane coordinate matches nozzle coordinate
  clipPlane.constant = -(printY + 0.4);

  // Rotate printed object slowly to showcase 3D perspective
  printedMesh.rotation.y = elapsedTime * 0.15;
  printedSolidMesh.rotation.y = elapsedTime * 0.15;

  // 3. Extrusion Laser line connection
  const laserPosArr = laserLine.geometry.attributes.position.array;
  laserPosArr[0] = pathX;
  laserPosArr[1] = printY;
  laserPosArr[2] = pathZ;
  // Connect to printed mesh surface (approximate offset)
  laserPosArr[3] = pathX * 0.95;
  laserPosArr[4] = printY - 0.05;
  laserPosArr[5] = pathZ * 0.95;
  laserLine.geometry.attributes.position.needsUpdate = true;

  // Flicker laser intensity
  laserMat.opacity = 0.5 + Math.random() * 0.5;

  // 4. Update Particle Spray (streams down from print nozzle to bed)
  const particlePositionsArr = particleSystem.geometry.attributes.position.array;

  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;

    // If particle falls below bed or is randomly reset
    if (particlePositionsArr[idx + 1] < -2.0 || Math.random() < 0.02) {
      // Reset to print head nozzle location
      particlePositionsArr[idx] = pathX + (Math.random() - 0.5) * 0.08;
      particlePositionsArr[idx + 1] = printY;
      particlePositionsArr[idx + 2] = pathZ + (Math.random() - 0.5) * 0.08;

      particleSpeeds[i] = 0.04 + Math.random() * 0.06;
    } else {
      // Fall down with gravity drift
      particlePositionsArr[idx + 1] -= particleSpeeds[i];
      particlePositionsArr[idx] += (Math.random() - 0.5) * 0.01;
      particlePositionsArr[idx + 2] += (Math.random() - 0.5) * 0.01;
    }
  }
  particleSystem.geometry.attributes.position.needsUpdate = true;

  // 5. Ambient fog drift inside build volume
  const fogPositionsArr = fogParticles.geometry.attributes.position.array;
  for (let i = 0; i < chamberFogCount; i++) {
    const idx = i * 3;
    fogPositionsArr[idx + 1] -= 0.002; // slow fall
    if (fogPositionsArr[idx + 1] < -2.0) {
      fogPositionsArr[idx + 1] = 2.0; // reset to top
    }
  }
  fogParticles.geometry.attributes.position.needsUpdate = true;

  // 6. Smooth Mouse Tilt Ease
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  coreGroup.rotation.z = mouse.x * 0.12;
  coreGroup.rotation.x = -mouse.y * 0.12;

  renderer.render(scene, camera);
}

animate();

// Inquiry Form Interactivity
function initFormHandler() {
  const form = document.querySelector('#contact-form');
  const successContainer = document.querySelector('#success-message');
  const successTxHash = document.querySelector('#success-tx-hash');
  const dynamicTradesCount = document.querySelector('#dynamic-trades-count');

  if (!form || !successContainer) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="pulse"></span> CONNECTING...`;
    submitBtn.style.boxShadow = "0 4px 12px rgba(91, 33, 182, 0.3)";
    submitBtn.style.borderColor = "var(--accent-primary)";
    submitBtn.style.color = "white";

    // Prepare data
    const formData = {
      name: document.querySelector('#name').value,
      company: document.querySelector('#company').value,
      category: document.querySelector('#category').value,
      message: document.querySelector('#message').value
    };

    // Send AJAX POST request to PHP script
    fetch('index.php?action=submit_spec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response failure');
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 'success') {
          // Set dynamic hash returned by server
          if (successTxHash) {
            successTxHash.textContent = data.hash;
          }

          // Update trades counter if visible
          if (dynamicTradesCount) {
            const currentCount = parseInt(dynamicTradesCount.textContent, 10) || 0;
            dynamicTradesCount.textContent = currentCount + 1;
          }

          // Hide form elements with clean transition
          gsap.to(form, {
            opacity: 0,
            y: -20,
            duration: 0.6,
            onComplete: () => {
              form.style.display = 'none';
              successContainer.style.display = 'block';
              gsap.fromTo(successContainer,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
              );
            }
          });
        } else {
          alert(data.message || 'Error executing protocol.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `Submit Spec Protocol <i data-lucide="send"></i>`;
          lucide.createIcons();
        }
      })
      .catch(error => {
        console.error('Submission error:', error);
        alert('Failed to connect to CENTRICORE trade registry.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Submit Spec Protocol <i data-lucide="send"></i>`;
        lucide.createIcons();
      });
  });
}

// ─── Product Carousel ──────────────────────────────────────────────────────────
function initProductCarousel() {
  const window_ = document.querySelector('.carousel-window');
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const dots = document.querySelectorAll('.carousel-indicators .dot');

  if (!window_ || !track) {
    console.warn('Carousel elements not found');
    return;
  }

  const cards = Array.from(track.children);
  const TOTAL = cards.length;
  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let startTranslate = 0;
  let currentTranslate = 0;
  let animationId = null;

  // ── Responsive: how many cards are visible at once ──────────────────────────
  function getVisibleCount() {
    const w = window_.offsetWidth;
    if (w < 640) return 1;
    if (w < 1100) return 2;
    return 3;
  }

  // ── Calculate card width including gap ─────────────────────────────────────
  function getCardWidth() {
    const card = cards[0];
    if (!card) return 0;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 32;
    return card.offsetWidth + gap;
  }

  // ── Clamp index within valid range ─────────────────────────────────────────
  function clampIndex(idx) {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, TOTAL - visible);
    return Math.max(0, Math.min(idx, maxIndex));
  }

  // ── Move carousel to a given index ─────────────────────────────────────────
  function goToIndex(idx, animate = true) {
    currentIndex = clampIndex(idx);
    currentTranslate = -currentIndex * getCardWidth();

    if (animate) {
      track.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
      track.style.transition = 'none';
    }
    setTrackPosition(currentTranslate);
    updateDots();
  }

  function setTrackPosition(x) {
    track.style.transform = `translateX(${x}px)`;
  }

  // ── Update indicator dots ───────────────────────────────────────────────────
  function updateDots() {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // ── Button click events - with explicit handling ─────────────────────────────
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      goToIndex(currentIndex - 1);
    });
  } else {
    console.warn('Previous button not found');
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      goToIndex(currentIndex + 1);
    });
  } else {
    console.warn('Next button not found');
  }

  // ── Dot click events ────────────────────────────────────────────────────────
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      goToIndex(idx);
    });
  });

  // ── Event delegation for carousel buttons as fallback ─────────────────────────
  const container = document.querySelector('.carousel-container');
  if (container) {
    container.addEventListener('click', (e) => {
      const clickedBtn = e.target.closest('.carousel-btn');
      if (!clickedBtn) return;

      e.preventDefault();
      e.stopPropagation();

      if (clickedBtn.classList.contains('prev-btn')) {
        goToIndex(currentIndex - 1);
      } else if (clickedBtn.classList.contains('next-btn')) {
        goToIndex(currentIndex + 1);
      }
    });
  }

  // ── Mouse Drag ─────────────────────────────────────────────────────────────
  window_.addEventListener('mousedown', e => {
    if (document.body.classList.contains('edit-mode-active')) return;
    isDragging = true;
    startX = e.clientX;
    startTranslate = currentTranslate;
    track.style.transition = 'none';
    cancelAnimationFrame(animationId);
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    const proposed = startTranslate + delta;

    // Rubberbanding at the edges
    const maxTranslate = 0;
    const minTranslate = -(TOTAL - getVisibleCount()) * getCardWidth();
    let clamped = proposed;
    if (proposed > maxTranslate) {
      clamped = maxTranslate + (proposed - maxTranslate) * 0.25;
    } else if (proposed < minTranslate) {
      clamped = minTranslate + (proposed - minTranslate) * 0.25;
    }
    setTrackPosition(clamped);
  });

  window.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const delta = e.clientX - startX;
    const threshold = getCardWidth() * 0.25;

    if (delta < -threshold) {
      goToIndex(currentIndex + 1);
    } else if (delta > threshold) {
      goToIndex(currentIndex - 1);
    } else {
      goToIndex(currentIndex); // snap back
    }
  });

  // Prevent click through after drag
  window_.addEventListener('dragstart', e => e.preventDefault());

  // ── Touch Swipe ────────────────────────────────────────────────────────────
  let touchStartX = 0;
  let touchStartTranslate = 0;

  window_.addEventListener('touchstart', e => {
    if (document.body.classList.contains('edit-mode-active')) return;
    touchStartX = e.touches[0].clientX;
    touchStartTranslate = currentTranslate;
    track.style.transition = 'none';
  }, { passive: true });

  window_.addEventListener('touchmove', e => {
    const delta = e.touches[0].clientX - touchStartX;
    const proposed = touchStartTranslate + delta;

    const maxTranslate = 0;
    const minTranslate = -(TOTAL - getVisibleCount()) * getCardWidth();
    let clamped = proposed;
    if (proposed > maxTranslate) {
      clamped = maxTranslate + (proposed - maxTranslate) * 0.3;
    } else if (proposed < minTranslate) {
      clamped = minTranslate + (proposed - minTranslate) * 0.3;
    }
    setTrackPosition(clamped);
  }, { passive: true });

  window_.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    const threshold = getCardWidth() * 0.2;

    if (delta < -threshold) {
      goToIndex(currentIndex + 1);
    } else if (delta > threshold) {
      goToIndex(currentIndex - 1);
    } else {
      goToIndex(currentIndex);
    }
  });

  // ── Responsive resize ──────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    // Snap to a valid position after resize without animation
    goToIndex(clampIndex(currentIndex), false);
  });

  // ── Initialize position ────────────────────────────────────────────────────
  goToIndex(0, false);
}

// ─── Catalog Editor Mode ───────────────────────────────────────────────────
function initCatalogEditor() {
  const toggleBtn = document.querySelector('#edit-catalog-toggle');
  const actionBar = document.querySelector('#editor-action-bar');
  const saveBtn = document.querySelector('#btn-save-catalog');
  const cancelBtn = document.querySelector('#btn-cancel-catalog');

  if (!toggleBtn || !actionBar || !saveBtn || !cancelBtn) return;

  let isEditMode = false;
  let originalData = null;

  // Capture current state of the DOM products
  function getCatalogDataFromDOM() {
    const cards = document.querySelectorAll('.product-card');
    const data = [];
    cards.forEach(card => {
      const id = card.dataset.productId;
      const badge = card.querySelector('.editable-badge').textContent.trim();
      const name = card.querySelector('.editable-name').textContent.trim();
      const description = card.querySelector('.editable-desc').textContent.trim();
      const image = card.querySelector('.product-image').getAttribute('src');

      const specs = {};
      const specItems = card.querySelectorAll('.product-specs-list li');
      specItems.forEach(item => {
        const label = item.querySelector('.editable-spec-label').textContent.trim();
        const value = item.querySelector('.editable-spec-value').textContent.trim();
        if (label) {
          specs[label] = value;
        }
      });

      data.push({ id, badge, name, description, image, specs });
    });
    return data;
  }

  function setEditableState(editable) {
    const fields = document.querySelectorAll('.editable-badge, .editable-name, .editable-desc, .editable-spec-label, .editable-spec-value');
    fields.forEach(field => {
      field.setAttribute('contenteditable', editable ? 'true' : 'false');
    });

    if (editable) {
      document.body.classList.add('edit-mode-active');
      toggleBtn.innerHTML = `<i data-lucide="unlock"></i> <span>Lock Catalog</span>`;
      toggleBtn.style.borderColor = "var(--accent-secondary)";
      toggleBtn.style.color = "var(--accent-secondary)";
      toggleBtn.style.background = "var(--accent-secondary)";
      toggleBtn.style.color = "white";
    } else {
      document.body.classList.remove('edit-mode-active');
      toggleBtn.innerHTML = `<i data-lucide="lock"></i> <span>Edit Catalog</span>`;
      toggleBtn.style.borderColor = "var(--accent-primary)";
      toggleBtn.style.color = "var(--accent-primary)";
      toggleBtn.style.background = "transparent";
      actionBar.classList.remove('visible');
    }
    lucide.createIcons();
  }

  toggleBtn.addEventListener('click', () => {
    isEditMode = !isEditMode;
    if (isEditMode) {
      originalData = JSON.stringify(getCatalogDataFromDOM());
      setEditableState(true);
    } else {
      const currentData = JSON.stringify(getCatalogDataFromDOM());
      if (currentData !== originalData) {
        if (confirm("You have unsaved changes. Discard them?")) {
          window.location.reload();
        } else {
          isEditMode = true;
          return;
        }
      }
      setEditableState(false);
    }
  });

  // Listen for inputs to show the save bar
  const track = document.querySelector('.carousel-track');
  if (track) {
    track.addEventListener('input', () => {
      if (!isEditMode) return;
      const currentData = JSON.stringify(getCatalogDataFromDOM());
      if (currentData !== originalData) {
        actionBar.classList.add('visible');
      } else {
        actionBar.classList.remove('visible');
      }
    });
  }

  // Cancel button
  cancelBtn.addEventListener('click', () => {
    if (confirm("Discard all catalog changes?")) {
      window.location.reload();
    }
  });

  // Save button
  saveBtn.addEventListener('click', () => {
    const dataToSave = getCatalogDataFromDOM();

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    fetch('index.php?action=save_products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSave)
    })
      .then(res => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(data => {
        if (data.status === 'success') {
          saveBtn.disabled = false;
          saveBtn.textContent = "Save Changes";
          actionBar.classList.remove('visible');
          originalData = JSON.stringify(dataToSave);
          isEditMode = false;
          setEditableState(false);

          toggleBtn.innerHTML = `<i data-lucide="check"></i> <span>Saved!</span>`;
          toggleBtn.style.borderColor = "#22c55e";
          toggleBtn.style.color = "#22c55e";
          lucide.createIcons();

          setTimeout(() => {
            toggleBtn.style.borderColor = "";
            toggleBtn.style.color = "";
            toggleBtn.innerHTML = `<i data-lucide="lock"></i> <span>Edit Catalog</span>`;
            lucide.createIcons();

            window.location.reload();
          }, 1500);
        } else {
          alert("Failed to save changes: " + (data.message || "Unknown error"));
          saveBtn.disabled = false;
          saveBtn.textContent = "Save Changes";
        }
      })
      .catch(err => {
        console.error(err);
        alert("Failed to connect to CENTRICORE database to save changes.");
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes";
      });
  });
}
