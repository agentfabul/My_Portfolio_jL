/* JLF.os — portfolio interactions */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme ---------- */
  const root = document.documentElement;
  try { const saved = localStorage.getItem('jlf-theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  $('#themeToggle')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('jlf-theme', next); } catch (e) {}
  });

  /* ---------- nav ---------- */
  const nav = $('#navbar'), toTop = $('#backToTop');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    toTop.hidden = y < 600;
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const menuBtn = $('#menuToggle'), menu = $('#mobileMenu');
  menuBtn?.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    menuBtn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }));

  // active section highlight
  const links = $$('.nav-links a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });

  /* ---------- typed role ---------- */
  const roles = ['Full-Stack Developer', 'Node.js · TypeScript · React', 'PostgreSQL & REST APIs', 'Billing & reporting automation', 'Playwright QA Automation'];
  const typed = $('#typed');
  if (typed) {
    if (reduce) typed.textContent = roles[0];
    else {
      let r = 0, c = 0, del = false;
      (function tick() {
        const w = roles[r];
        typed.textContent = w.slice(0, c);
        if (!del && c === w.length) { del = true; return setTimeout(tick, 1800); }
        if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
        c += del ? -1 : 1;
        setTimeout(tick, del ? 35 : 70);
      })();
    }
  }

  /* ---------- boot terminal ---------- */
  const boot = $('#bootLog');
  const lines = [
    ['<span class="cy">$</span> ./jlf.os --boot', 0],
    ['<span class="ok">[ OK ]</span> <span class="key">role</span> ........ Full-Stack Developer', 1],
    ['<span class="ok">[ OK ]</span> <span class="key">runtime</span> ..... Node · TS · React · Postgres', 1],
    ['<span class="ok">[ OK ]</span> <span class="key">qa</span> .......... Playwright · API · UAT', 1],
    ['<span class="ok">[ OK ]</span> <span class="key">location</span> .... Batangas, PH 🇵🇭', 1],
    ['<span class="ok">[ OK ]</span> <span class="key">task</span> ........ scaffold-rental platform', 1],
    ['<span class="hl">&gt;</span> all systems nominal — ready to ship_', 0],
  ];
  if (boot) {
    if (reduce) boot.innerHTML = lines.map(l => l[0]).join('\n');
    else {
      let i = 0;
      const next = () => {
        if (i >= lines.length) return;
        boot.innerHTML += (i ? '\n' : '') + lines[i][0];
        i++; setTimeout(next, i === 1 ? 600 : 380);
      };
      setTimeout(next, 400);
    }
  }

  /* ---------- counters ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
      countIO.unobserve(el);
      if (reduce) { el.textContent = end + suf; return; }
      const t0 = performance.now();
      const step = t => { const p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- project filter ---------- */
  const items = $$('.proj, .spotlight');
  $$('.filter').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter').forEach(b => b.classList.toggle('active', b === btn));
    const f = btn.dataset.filter;
    items.forEach(it => {
      const show = f === 'all' || (it.dataset.cat || '').split(' ').includes(f);
      it.classList.toggle('hide', !show);
      if (show) it.classList.add('in');
    });
  }));

  /* ---------- image modal ---------- */
  const modal = $('#imageModal'), mImg = $('#modalImg'), mTitle = $('#modalTitle');
  const closeModal = () => { modal.hidden = true; document.body.style.overflow = ''; };
  $$('[data-zoom]').forEach(b => b.addEventListener('click', () => {
    mImg.src = b.dataset.zoom; mImg.alt = b.dataset.title; mTitle.textContent = b.dataset.title;
    modal.hidden = false; document.body.style.overflow = 'hidden';
  }));
  $$('[data-close]', modal).forEach(b => b.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  /* ---------- GitHub repos ---------- */
  const LANG = { JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', PHP: '#4F5D95', Blade: '#f7523f', 'C++': '#f34b7d', C: '#555555', Shell: '#89e051' };
  const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  const fallback = [
    { name: 'scaffolding-management-pro', description: 'Scaffold-rental platform: inventory, tagging, deliveries and billing.', language: 'TypeScript' },
    { name: 'scaffold_report_tool', description: 'Monthly billing Summary Report, Tag Summary and Dashboard generator.', language: 'Python' },
    { name: 'map', description: 'Interactive 3D map from a PDF site plot plan.', language: 'HTML' },
    { name: 'civil_calculator', description: 'Calculator for common civil-engineering computations.', language: 'Java' },
    { name: 'ojt-tracker', description: 'OJT / Internship Monitoring and Time Tracking System.', language: 'Blade' },
    { name: 'AutoQA', description: 'Web-based QA workflow and results dashboard.', language: 'JavaScript' },
  ].map(r => ({ ...r, html_url: 'https://github.com/agentfabul/' + r.name }));

  const DESC = Object.fromEntries(fallback.map(r => [r.name.toLowerCase(), r.description]));
  Object.assign(DESC, {
    'canteen-system': 'San Ignacio canteen management: menu, orders and admin monitoring.',
    'my_portfolio_jl': 'This portfolio — vanilla HTML, CSS and JS, deployed on Vercel.',
    'billing_report': 'Monthly scaffolding billing report workbooks and automation.',
  });
  const card = r => {
    r = { ...r, description: r.description || DESC[r.name.toLowerCase()] };
    const lang = r.language || 'Code';
    const updated = r.pushed_at ? new Date(r.pushed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    return `<a class="repo reveal in" href="${esc(r.html_url)}" target="_blank" rel="noopener">
      <h3>▸ ${esc(r.name)}</h3>
      <p>${esc(r.description || 'No description yet.')}</p>
      <div class="repo-meta">
        <span><i class="lang-dot" style="background:${LANG[lang] || '#8b949e'}"></i>${esc(lang)}</span>
        ${r.stargazers_count ? `<span>★ ${r.stargazers_count}</span>` : ''}
        ${updated ? `<span>${updated}</span>` : ''}
      </div></a>`;
  };
  const grid = $('#reposGrid');
  if (grid) {
    fetch('https://api.github.com/users/agentfabul/repos?sort=pushed&per_page=30', { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(list => {
        const repos = list.filter(r => !r.fork && r.name.toLowerCase() !== 'agentfabul').slice(0, 9);
        grid.innerHTML = (repos.length ? repos : fallback).map(card).join('');
      })
      .catch(() => { grid.innerHTML = fallback.map(card).join(''); });
  }

  /* ---------- contact form ---------- */
  const form = $('#contactForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('#formError'), btn = $('#sendBtn');
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad); if (bad) ok = false;
    });
    if (!ok) return;
    err.hidden = true; btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      if (!res.ok) throw new Error();
      form.hidden = true; $('#formSuccess').hidden = false;
    } catch {
      err.hidden = false; btn.disabled = false; btn.textContent = 'Send message →';
    }
  });

  /* ---------- assistant ---------- */
  const faq = [
    { kw: ['skill', 'stack', 'tech', 'know'], ans: "Full-stack: React, TypeScript, JavaScript, Node.js, REST APIs, PostgreSQL, Supabase, SQL and Laravel. Plus QA automation (Playwright, API testing, UAT/SIT), Python and Excel/Sheets data work, Figma, and Arduino/IoT." },
    { kw: ['project', 'built', 'made', 'work', 'portfolio'], ans: "Highlights: Scaffolding Management Pro (React + Supabase/PostgreSQL), a Python billing report tool, an interactive 3D plot plan, Civil Calculator (Java), OJT Tracker (Laravel), San Ignacio Canteen System, Auto-QA, a Playwright QA lab, and three Arduino systems." },
    { kw: ['hire', 'job', 'intern', 'opportun', 'available', 'role'], ans: "John is open to full-stack / web developer roles, QA automation work, freelance projects and collaborations. Use the contact form or email fabuljohnloyd27@gmail.com." },
    { kw: ['contact', 'email', 'phone', 'reach', 'linkedin'], ans: "Email: fabuljohnloyd27@gmail.com · Phone: 0919 762 6160 · LinkedIn: linkedin.com/in/john-loyd-fabul-99a758410 · GitHub: github.com/agentfabul" },
    { kw: ['qa', 'test', 'playwright', 'bug'], ans: "QA background: manual testing, Playwright automation, API checks, UAT/SIT, Chrome DevTools, test reports in Google Sheets and user manuals in Figma." },
    { kw: ['school', 'universit', 'bsu', 'batangas', 'educat', 'graduat'], ans: "Batangas State University — The National Engineering University. BIT Computer Technology, Dean's Lister 2023–2024, graduated Cum Laude in 2026." },
    { kw: ['lead', 'president', 'class', 'organi', 'techlink'], ans: "Class President, Organization Officer, CPET Director of TECHLINK (2024–2025) and 4th Year Representative for Computer Technology." },
    { kw: ['who', 'name', 'about', 'yourself'], ans: "John Loyd F. Fabul is a full-stack developer from Batangas, Philippines who builds operations, billing and reporting tools — with a QA automation background that keeps his work reliable." },
  ];
  const fab = $('#aiChatButton'), box = $('#aiChatContainer'), msgs = $('#aiMessages'), inp = $('#aiInput');
  const add = (who, t) => { const d = document.createElement('div'); d.className = 'msg ' + who; d.textContent = t; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; };
  const answer = text => {
    if (!text.trim()) return;
    add('user', text);
    const q = text.toLowerCase();
    const hit = faq.find(f => f.kw.some(k => q.includes(k)));
    setTimeout(() => add('bot', hit ? hit.ans : "I can tell you about John's skills, projects, education, availability or contact details. What would you like to know?"), 250);
  };
  const greet = () => add('bot', "Hi! I'm John's portfolio assistant. Ask about his full-stack skills, projects, QA background, or how to hire him.");
  if (fab) {
    greet();
    fab.addEventListener('click', () => { box.hidden = !box.hidden; if (!box.hidden) inp.focus(); });
    $('#aiCloseBtn').addEventListener('click', () => { box.hidden = true; });
    $('#aiClearBtn').addEventListener('click', () => { msgs.innerHTML = ''; greet(); });
    $('#aiSendBtn').addEventListener('click', () => { const v = inp.value; inp.value = ''; answer(v); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#aiSendBtn').click(); } });
    $$('.chat-quick button').forEach(b => b.addEventListener('click', () => answer(b.textContent)));
  }
})();
