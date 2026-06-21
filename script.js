/* =====================================================
   script.js — Portfolio Interactions & Particle System
   ===================================================== */

// ===== PARTICLE NETWORK =====
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;
  const PARTICLE_COUNT = 70;
  const MAX_DIST = 120;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      vx: randomBetween(-0.3, 0.3),
      vy: randomBetween(-0.3, 0.3),
      r: randomBetween(1.5, 3.5),
      alpha: randomBetween(0.3, 0.8),
      hue: Math.random() < 0.5 ? 160 : 200, // emerald green or bright blue (data theme)
      bin: Math.random() > 0.5 ? '1' : '0',
    };
  }

  function spawnParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function drawParticle(p) {
    ctx.font = `${p.r * 4}px 'Courier New', monospace`;
    ctx.fillStyle = `hsla(${p.hue}, 85%, 45%, ${p.alpha})`;
    ctx.fillText(p.bin, p.x, p.y);
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * 0.35;
          const hue = particles[i].hue;
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${hue}, 85%, 45%, ${opacity})`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  // Mouse interaction
  let mouse = { x: null, y: null, radius: 120 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function updateParticle(p) {
    // Mouse repel
    if (mouse.x !== null) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        p.vx += force * dx / dist * 0.04;
        p.vy += force * dy / dist * 0.04;
      }
    }

    // Speed limit
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 1.2) {
      p.vx = (p.vx / speed) * 1.2;
      p.vy = (p.vy / speed) * 1.2;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Wrap around
    if (p.x < -10) p.x = W + 10;
    if (p.x > W + 10) p.x = -10;
    if (p.y < -10) p.y = H + 10;
    if (p.y > H + 10) p.y = -10;
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      updateParticle(p);
      drawParticle(p);
    }
    drawConnections();
    // Floating data glyphs
    drawDataGlyphs();
    animId = requestAnimationFrame(loop);
  }

  // Floating data glyphs
  const glyphs = [
    { text: 'SELECT', x: 0.08, y: 0.15, speed: 0.0002, hue: 191, size: 11 },
    { text: 'FROM', x: 0.18, y: 0.7, speed: 0.00015, hue: 262, size: 10 },
    { text: 'SUM()', x: 0.85, y: 0.2, speed: 0.00025, hue: 191, size: 11 },
    { text: 'GROUP BY', x: 0.75, y: 0.8, speed: 0.0002, hue: 262, size: 10 },
    { text: 'KPI', x: 0.5, y: 0.05, speed: 0.0003, hue: 191, size: 14 },
    { text: 'DAX', x: 0.92, y: 0.5, speed: 0.00018, hue: 262, size: 12 },
    { text: 'JOIN', x: 0.03, y: 0.5, speed: 0.0002, hue: 191, size: 10 },
    { text: 'FILTER', x: 0.55, y: 0.93, speed: 0.00022, hue: 262, size: 10 },
  ];

  function drawDataGlyphs() {
    const t = Date.now();
    ctx.font = `600 11px 'JetBrains Mono', monospace`;
    for (const g of glyphs) {
      const sy = Math.sin(t * g.speed * 1000) * 8;
      const alpha = 0.12 + Math.abs(Math.sin(t * g.speed * 500)) * 0.1;
      ctx.fillStyle = `hsla(${g.hue}, 85%, 45%, ${alpha})`;
      ctx.font = `600 ${g.size}px 'JetBrains Mono', monospace`;
      ctx.fillText(g.text, g.x * W, g.y * H + sy);
    }
  }

  window.addEventListener('resize', () => { resize(); spawnParticles(); });
  resize();
  spawnParticles();
  loop();
})();


// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
let lastScrollY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 30);
  lastScrollY = y;
  // Highlight active nav link
  updateActiveNav();
});


// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
function updateActiveNav() {
  const scrollPos = window.scrollY + 100;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.id;
    const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
    if (navLink) {
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        navLink.classList.add('active');
      }
    }
  });
}


// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});


// ===== TYPING ANIMATION =====
const roles = [
  'Data Analyst Intern @ LocalSM',
  'SQL & Power BI Specialist',
  'Dashboard Developer',
  'Aspiring Data Engineer',
  'Python Data Processor',
];

let roleIdx = 0;
let charIdx = 0;
let deleting = false;
const typingEl = document.getElementById('typingText');

function typeNext() {
  const current = roles[roleIdx];
  if (!deleting) {
    typingEl.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeNext, 2000);
      return;
    }
    setTimeout(typeNext, 60);
  } else {
    typingEl.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      setTimeout(typeNext, 400);
      return;
    }
    setTimeout(typeNext, 35);
  }
}

setTimeout(typeNext, 800);


// ===== SCROLL ANIMATIONS =====
const animEls = document.querySelectorAll('.animate-on-scroll');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
        // Trigger skill bars if inside a skills section
        const fills = entry.target.querySelectorAll('.skill-fill');
        fills.forEach(fill => fill.classList.add('animated'));
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

animEls.forEach(el => observer.observe(el));

// Observe skill fills globally
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(fill => fill.classList.add('animated'));
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skills-category').forEach(el => skillObserver.observe(el));


// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const text = el.textContent;
    const num = parseFloat(text);
    if (isNaN(num)) return;
    const isDecimal = text.includes('.');
    const suffix = text.replace(/[\d.]/g, '');
    let start = 0;
    const duration = 1500;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = ease * num;
      el.textContent = (isDecimal ? val.toFixed(1) : Math.floor(val)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// Trigger counters on hero load
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { animateCounters(); heroObserver.disconnect(); }
  });
}, { threshold: 0.5 });
heroObserver.observe(document.getElementById('hero'));


// ===== MODAL LOGIC =====
const modal = document.getElementById('inquiryModal');

function openInquiryModal() {
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeInquiryModal() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

window.onclick = function(event) {
  if (event.target == modal) {
    closeInquiryModal();
  }
}

// ===== CONTACT & FREELANCE FORM SUBMISSION (Web3Forms AJAX) =====
function buildContactEmailBody(form) {
  const data = new FormData(form);
  const type = data.get('contactType') || 'General';
  const name = data.get('name') || '';
  const email = data.get('email') || '';
  const userMessage = (data.get('message') || '').trim();

  return [
    `Inquiry Type: ${type}`,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    'Message:',
    userMessage || '(No message provided)',
  ].join('\n');
}

function buildFreelanceEmailBody(form) {
  const data = new FormData(form);
  const name = data.get('name') || '';
  const email = data.get('email') || '';
  const contactDetail = data.get('contactDetail') || '';
  const countryCode = data.get('countryCode') || '';
  const projectType = data.get('projectType') || '';
  const projectDesc = (data.get('projectDesc') || '').trim();
  const timeline = data.get('timeline') || '';
  const budget = data.get('budget') || '';

  return [
    'Inquiry Type: Freelance Project',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Preferred Contact: ${countryCode === 'Email only' ? contactDetail : `${countryCode} ${contactDetail}`.trim()}`,
    `Project Type: ${projectType}`,
    `Expected Timeline: ${timeline}`,
    `Estimated Budget: ${budget}`,
    '',
    'Project Details:',
    projectDesc || '(No details provided)',
  ].join('\n');
}

async function handleAjaxSubmit(e, btnId, successMsg) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById(btnId) || form.querySelector('button[type="submit"]');
  const originalBtnContent = btn.innerHTML;
  
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Sending...`;
  btn.style.opacity = '0.8';

  const formData = new FormData(form);
  const object = Object.fromEntries(formData);

  if (form.id === 'contactForm') {
    object.message = buildContactEmailBody(form);
    object.inquiry_type = formData.get('contactType') || 'General';
  } else if (form.id === 'freelanceForm') {
    object.message = buildFreelanceEmailBody(form);
    object.inquiry_type = 'Freelance';
  }

  const json = JSON.stringify(object);

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: json
    });
    
    const result = await response.json();
    if (response.status == 200) {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Sent!`;
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      showToast('✅ ' + successMsg);
      form.reset();
      
      if (form.id === 'freelanceForm') {
        setTimeout(closeInquiryModal, 2000);
      }
      
      setTimeout(() => {
        btn.innerHTML = originalBtnContent;
        btn.style.background = '';
        btn.style.opacity = '1';
      }, 3000);
    } else {
      console.log(response);
      showToast('❌ Error: ' + result.message);
      btn.innerHTML = originalBtnContent;
      btn.style.opacity = '1';
    }
  } catch (error) {
    console.log(error);
    showToast('❌ Something went wrong!');
    btn.innerHTML = originalBtnContent;
    btn.style.opacity = '1';
  }
}

const contactType = document.getElementById('contactType');
const contactSubject = document.querySelector('#contactForm input[name="subject"]');

function updateContactSubject() {
  if (!contactType || !contactSubject) return;
  const type = contactType.value;
  const subjectMap = {
    Recruiter: 'Recruiter Inquiry',
    Freelancer: 'Freelancer Inquiry',
    'Student / Other': 'General Inquiry',
  };
  contactSubject.value = subjectMap[type] || 'Contact Inquiry';
}

if (contactType) {
  contactType.addEventListener('change', updateContactSubject);
  updateContactSubject();
}

document.getElementById('contactForm').addEventListener('submit', function(e) {
  updateContactSubject();
  handleAjaxSubmit(e, 'form-submit-btn', 'Message sent successfully!');
});

document.getElementById('freelanceForm').addEventListener('submit', function(e) {
  handleAjaxSubmit(e, null, 'Inquiry sent successfully!');
});

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.4s'; setTimeout(() => t.remove(), 400); }, 3000);
}


// ===== CURSOR TRAIL EFFECT (subtle) =====
const trail = [];
const TRAIL_LEN = 6;

document.addEventListener('mousemove', (e) => {
  trail.push({ x: e.clientX, y: e.clientY });
  if (trail.length > TRAIL_LEN) trail.shift();
});


// ===== SMOOTH SCROLL for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ===== PROJECT CARD → GITHUB =====
const GITHUB_PROFILE = 'https://github.com/keerthivasan089';

document.querySelectorAll('.project-card[data-github]').forEach(card => {
  const url = card.getAttribute('data-github') || GITHUB_PROFILE;
  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  });
});

// ===== CARD TILT EFFECT (subtle, desktop only) =====
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.project-card, .cert-card, .service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -4;
      const rotY = ((x - cx) / cx) * 4;
      card.style.transform = `translateY(-4px) perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ===== GLOW CURSOR =====
(function glowCursor() {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: left 0.15s ease, top 0.15s ease;
    will-change: left, top;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
})();

console.log('%c👋 Keerthi Vasan P | Data Analyst Portfolio', 'font-size:16px;color:#06b6d4;font-weight:bold;');
console.log('%c📧 vasankeerthi089@gmail.com', 'font-size:12px;color:#8b5cf6;');
console.log('%c🔗 linkedin.com/in/keerthi-vasan-p-788955249', 'font-size:12px;color:#94a3b8;');
