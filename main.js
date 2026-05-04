/* ════════════════════════════════════════════════════════
   main.js — Portfolio Interactions & Animations
   ════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. THEME TOGGLE ──────────────────────────────────── */
  const html = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  themeBtn?.addEventListener('click', () => {
    const curr = html.getAttribute('data-theme');
    const next = curr === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });

  /* ── 2. NAVBAR SCROLL ─────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ── 3. MOBILE MENU ───────────────────────────────────── */
  const menuBtn = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  menuBtn?.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu?.classList.toggle('hidden', !menuOpen);
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu?.classList.add('hidden');
    });
  });

  /* ── 4. TYPING ANIMATION ──────────────────────────────── */
  const typingEl = document.querySelector('.typing-text');
  const phrases = [
    'Junior Data Analyst',
    'QA Automation Engineer',
    'AI Workflow Builder',
    'Software Testing Specialist',
    'Data Validation Expert',
    'AI-Powered Automation Dev'
  ];
  let phraseIdx = 0, charIdx = 0, deleting = false;
  const TYPE_SPEED = 65, DELETE_SPEED = 35, PAUSE = 1800;

  function typeLoop() {
    if (!typingEl) return;
    const phrase = phrases[phraseIdx];

    if (!deleting) {
      typingEl.textContent = phrase.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(typeLoop, PAUSE);
        return;
      }
      setTimeout(typeLoop, TYPE_SPEED);
    } else {
      typingEl.textContent = phrase.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(typeLoop, 400);
        return;
      }
      setTimeout(typeLoop, DELETE_SPEED);
    }
  }
  typeLoop();

  /* ── 5. INTERSECTION OBSERVER (reveal animations) ──────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal-section').forEach(el => revealObserver.observe(el));

  const itemObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-item').forEach(el => itemObserver.observe(el));

  /* ── 6. SKILL TABS ────────────────────────────────────── */
  const tabs = document.querySelectorAll('.skill-tab');
  const panels = document.querySelectorAll('.skill-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.skill-panel[data-panel="${target}"]`)?.classList.add('active');
    });
  });

  /* ── 7. PROJECT FILTERS ───────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'fade-in 0.4s ease';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ── 8. FILE UPLOAD PORTAL ────────────────────────────── */
  function setupUploadZone(inputId, previewId, labelFn) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;

    const zone = input.closest('.upload-zone');

    // Drag events
    zone?.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('dragover');
    });
    zone?.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone?.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('dragover');
      handleFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', () => handleFiles(input.files));

    function handleFiles(files) {
      if (!files || files.length === 0) return;
      preview.innerHTML = '';
      Array.from(files).forEach(file => {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `${labelFn(file)} ✓`;
        preview.appendChild(item);
      });
      showUploadStatus(`${files.length} file(s) ready to upload`);
    }
  }

  setupUploadZone('screenshotInput', 'screenshotPreview', f => `🖼️ ${f.name.slice(0, 20)}`);
  setupUploadZone('pdfInput', 'pdfPreview', f => `📄 ${f.name.slice(0, 20)}`);
  setupUploadZone('videoInput', 'videoPreview', f => `🎥 ${f.name.slice(0, 20)}`);
  setupUploadZone('dataInput', 'dataPreview', f => `🗃️ ${f.name.slice(0, 20)}`);

  function showUploadStatus(msg) {
    const status = document.getElementById('uploadStatus');
    const text = status?.querySelector('.status-text');
    if (!status || !text) return;
    text.textContent = msg;
    status.classList.remove('hidden');
    setTimeout(() => status.classList.add('hidden'), 4000);
  }

  /* ── 9. CONTACT FORM ─────────────────────────────────── */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

    // Simulate submission delay
    setTimeout(() => {
      form.style.display = 'none';
      formSuccess?.classList.remove('hidden');
    }, 1200);
  });

  /* ── 10. BACK TO TOP ─────────────────────────────────── */
  const backBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backBtn?.classList.remove('hidden');
      backBtn?.classList.add('show');
    } else {
      backBtn?.classList.add('hidden');
      backBtn?.classList.remove('show');
    }
  }, { passive: true });

  backBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── 11. SMOOTH ACTIVE NAV LINK ──────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active-nav',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(s => navObserver.observe(s));

  /* ── 12. HERO BADGE STAGGER ──────────────────────────── */
  const badges = document.querySelectorAll('.tech-badges .badge');
  badges.forEach((badge, i) => {
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(12px)';
    setTimeout(() => {
      badge.style.transition = 'all 0.5s ease';
      badge.style.opacity = '1';
      badge.style.transform = 'translateY(0)';
    }, 800 + i * 80);
  });

  /* ── 13. STATS COUNTER ANIMATION ─────────────────────── */
  function animateCounter(el, end, suffix = '') {
    let start = 0;
    const step = end / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { el.textContent = end + suffix; clearInterval(timer); return; }
      el.textContent = Math.floor(start) + suffix;
    }, 35);
  }

  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const nums = entry.target.querySelectorAll('.stat-num');
        nums.forEach(n => {
          const raw = n.textContent;
          const num = parseInt(raw);
          const suf = raw.replace(/\d/g, '');
          animateCounter(n, num, suf);
        });
        statsObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsRow = document.querySelector('.stats-row');
  if (statsRow) statsObs.observe(statsRow);

  /* ── 14. SMOOTH SCROLL FOR ALL ANCHOR LINKS ──────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 15. CURSOR GLOW (desktop only) ──────────────────── */
  if (window.innerWidth > 1024) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9999;
      width: 300px; height: 300px; border-radius: 50%;
      background: radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: left 0.15s ease, top 0.15s ease;
    `;
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  /* ── 16. SKILL CARD TILT (subtle) ───────────────────── */
  document.querySelectorAll('.skill-card, .project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  console.log('%c Alex Rivera Portfolio 🚀', 'color:#2563EB;font-size:18px;font-weight:bold;');
  console.log('%c Built with precision and automation.', 'color:#22C55E;font-size:12px;');
});
