
(function() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], lines = [];
  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - .5) * .4;
      this.vy = (Math.random() - .5) * .4;
      this.r  = Math.random() * 1.8 + .6;
      this.alpha = Math.random() * .5 + .2;
      this.type = Math.random() > .7 ? 'orange' : 'cyan';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      const col = this.type === 'orange' ? '255,107,0' : '0,212,255';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          const alpha = (1 - d/110) * (isDark() ? .22 : .1);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = .5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    if (!isDark()) {
      ctx.globalAlpha = .4;
    } else {
      ctx.globalAlpha = 1;
    }
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
})();


const LANG_COLORS = { 'JavaScript':'#f1e05a','TypeScript':'#3178c6','Python':'#3572A5','HTML':'#e34c26','CSS':'#563d7c','C++':'#f34b7d','C':'#555555','default':'#8b949e' };
function buildRepoCard(r) {
  const lang = r.language||'Unknown';
  const col = LANG_COLORS[lang]||LANG_COLORS.default;
  const desc = (r.description||'No description.').slice(0,100);
  const updated = new Date(r.updated_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
  return `<div class="repo-card">
    <div class="repo-header"><span class="repo-icon">📁</span><h3 class="repo-name">${r.name}</h3></div>
    <p class="repo-desc">${desc}</p>
    <div class="repo-footer">
      <span class="repo-lang"><span style="width:9px;height:9px;border-radius:50%;background:${col};display:inline-block;"></span>${lang}</span>
      ${r.stargazers_count?`<span class="repo-stars">⭐ ${r.stargazers_count}</span>`:''}
      <a href="${r.html_url}" target="_blank" rel="noopener" class="repo-link">View ↗</a>
    </div>
    <div style="margin-top:6px;font-family:var(--font-mono);font-size:9.5px;color:var(--text-muted);opacity:.45;">Updated ${updated}</div>
  </div>`;
}
async function loadGitHubRepos(username) {
  const grid=document.getElementById('reposGrid'), demo=document.getElementById('demoRepos');
  const loading=document.getElementById('githubLoading'), error=document.getElementById('githubError');
  grid.innerHTML=''; if(demo)demo.classList.add('hidden');
  loading.classList.remove('hidden'); error.classList.add('hidden');
  try {
    const r = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12&type=public`,{headers:{'Accept':'application/vnd.github.v3+json'}});
    if(r.status===404) throw new Error(`User "${username}" not found.`);
    if(r.status===403) throw new Error('GitHub rate limit reached. Try again later.');
    if(!r.ok) throw new Error(`API error: ${r.status}`);
    const repos = await r.json();
    loading.classList.add('hidden');
    if(!repos.length){grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px;">No public repositories found.</div>`;return;}
    grid.innerHTML = repos.map(buildRepoCard).join('');
    grid.querySelectorAll('.repo-card').forEach((c,i)=>{c.style.opacity='0';c.style.transform='translateY(20px)';setTimeout(()=>{c.style.transition='all .4s ease';c.style.opacity='1';c.style.transform='translateY(0)';},i*55);});
  } catch(e) {
    loading.classList.add('hidden');
    document.getElementById('githubErrorMsg').textContent=e.message;
    error.classList.remove('hidden');
    if(demo)demo.classList.remove('hidden');
  }
}


document.addEventListener('DOMContentLoaded', () => {

  
  const html = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const setTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    themeBtn?.setAttribute('aria-pressed', String(theme === 'dark'));
    themeBtn?.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  };
  setTheme(localStorage.getItem('portfolio-theme') || 'dark');
  themeBtn?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('portfolio-theme', next);
  });

  
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
  }, {passive:true});

  
  const menuBtn = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;
  menuBtn?.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu?.classList.toggle('hidden', !menuOpen);
  });
  document.querySelectorAll('.mobile-nav-link').forEach(l => {
    l.addEventListener('click', () => { menuOpen=false; mobileMenu?.classList.add('hidden'); });
  });

  
  const typingEl = document.querySelector('.typing-text');
  const phrases = ['AI QA Engineer','Playwright Automation Tester','Python QA Validation','API Testing Analyst','AI Data Quality Analyst','Defect Evidence Builder'];
  let pIdx=0, cIdx=0, del=false;
  function typeLoop() {
    if (!typingEl) return;
    const p = phrases[pIdx];
    if (!del) {
      typingEl.textContent = p.slice(0, cIdx+1); cIdx++;
      if (cIdx === p.length) { del=true; setTimeout(typeLoop, 1800); return; }
      setTimeout(typeLoop, 65);
    } else {
      typingEl.textContent = p.slice(0, cIdx-1); cIdx--;
      if (cIdx === 0) { del=false; pIdx=(pIdx+1)%phrases.length; setTimeout(typeLoop, 400); return; }
      setTimeout(typeLoop, 35);
    }
  }
  typeLoop();

  
  const revObs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }), {threshold:.1});
  document.querySelectorAll('.reveal-section').forEach(el => revObs.observe(el));
  const itemObs = new IntersectionObserver(entries => entries.forEach((e,i) => { if(e.isIntersecting) setTimeout(()=>e.target.classList.add('visible'),i*90); }), {threshold:.1});
  document.querySelectorAll('.reveal-item').forEach(el => itemObs.observe(el));

  
  const tabs = document.querySelectorAll('.skill-tab');
  const panels = document.querySelectorAll('.skill-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const t = tab.dataset.tab;
      tabs.forEach(x=>x.classList.remove('active'));
      panels.forEach(x=>x.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.skill-panel[data-panel="${t}"]`)?.classList.add('active');
    });
  });

  
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      projectCards.forEach(card => {
        const categories = (card.dataset.category || '').split(/\s+/);
        const show = f==='all' || categories.includes(f);
        card.classList.toggle('hidden', !show);
        if(show) card.style.animation='fade-in .4s ease';
      });
    });
  });

  
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    if(btn){btn.textContent='Sending…';btn.disabled=true;}
    setTimeout(()=>{ form.style.display='none'; formSuccess?.classList.remove('hidden'); }, 1200);
  });

  
  const backBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backBtn?.classList.toggle('hidden', window.scrollY <= 400);
    backBtn?.classList.toggle('show', window.scrollY > 400);
  }, {passive:true});
  backBtn?.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

  
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const navObs = new IntersectionObserver(entries => entries.forEach(e => {
    if(e.isIntersecting) navLinks.forEach(l => l.classList.toggle('active-nav', l.getAttribute('href')==='#'+e.target.id));
  }), {rootMargin:'-50% 0px -50% 0px'});
  sections.forEach(s => navObs.observe(s));

  
  document.querySelectorAll('.tech-badges .tech-badge,.tech-badge').forEach((b,i) => {
    b.style.opacity='0'; b.style.transform='translateY(14px)';
    setTimeout(()=>{ b.style.transition='all .5s ease'; b.style.opacity='1'; b.style.transform='translateY(0)'; }, 900+i*80);
  });

  
  function animateCounter(el, end, suf='') {
    let s=0; const step=end/45;
    const t=setInterval(()=>{s+=step;if(s>=end){el.textContent=end+suf;clearInterval(t);return;}el.textContent=Math.floor(s)+suf;},30);
  }
  const statsObs = new IntersectionObserver(entries => entries.forEach(e => {
    if(e.isIntersecting){ e.target.querySelectorAll('.stat-num').forEach(n=>{ const raw=n.textContent; animateCounter(n,parseInt(raw),raw.replace(/\d/g,'')); }); statsObs.unobserve(e.target); }
  }), {threshold:.5});
  const sr = document.querySelector('.stats-row');
  if(sr) statsObs.observe(sr);

  
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if(t){e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'});}
    });
  });

  
  if(window.innerWidth > 1024) {
    const glow = document.createElement('div');
    glow.style.cssText='position:fixed;pointer-events:none;z-index:9999;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,0.05) 0%,transparent 70%);transform:translate(-50%,-50%);transition:left .12s ease,top .12s ease;';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => { glow.style.left=e.clientX+'px'; glow.style.top=e.clientY+'px'; });
  }

  
  document.querySelectorAll('.skill-card,.project-card,.repo-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`translateY(-5px) rotateX(${-y*5}deg) rotateY(${x*5}deg)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform=''; });
  });

  
  document.querySelectorAll('.project-visual img').forEach(img => {
    img.addEventListener('load', () => {
      img.style.display='block';
      const fb = img.nextElementSibling;
      if(fb&&fb.classList.contains('project-visual-fallback')) fb.style.display='none';
    });
    if(img.complete && img.naturalWidth>0) {
      img.style.display='block';
      const fb = img.nextElementSibling;
      if(fb&&fb.classList.contains('project-visual-fallback')) fb.style.display='none';
    }
  });

  
  const lb=document.getElementById('loadReposBtn'), gi=document.getElementById('githubUsername');
  lb?.addEventListener('click',()=>{ const u=gi.value.trim(); if(u) loadGitHubRepos(u); });
  gi?.addEventListener('keydown',e=>{ if(e.key==='Enter'){ const u=gi.value.trim(); if(u) loadGitHubRepos(u); } });

  console.log('%c [JLF] John Loyd Fabul · AI QA Engineer', 'color:#00D4FF;font-size:16px;font-weight:bold;font-family:monospace;');
  console.log('%c Playwright · Python · AI Data Quality · Cum Laude 2026', 'color:#FF6B00;font-size:12px;font-family:monospace;');
});


function openImageModal(src, title) {
  const modal=document.getElementById('imageModal'), img=document.getElementById('imageModalImg'), t=document.getElementById('imageModalTitle');
  img.src=src; t.textContent=title; modal.classList.remove('hidden'); document.body.style.overflow='hidden';
}
function closeImageModal() { document.getElementById('imageModal').classList.add('hidden'); document.body.style.overflow=''; }
document.addEventListener('keydown', e => { if(e.key==='Escape') closeImageModal(); });


(function(){
  const faq=[
    {kw:['who','name','you'],ans:"I'm John Loyd F. Fabul — I am a BIT Computer Technology student passionate about building Arduino-based systems and IoT solutions, turning ideas into real working prototypes—from smart bins to automated vending machines—that solve real-world problems. Alongside hardware development, I am developing as a Junior Data Analyst with skills in Excel, Google Sheets, SQL, Python, basic Power BI, data validation, and data cleaning to transform raw data into meaningful insights. I also work as a Software Quality Assurance Analyst, experienced in manual testing, Playwright automation testing, API testing, user acceptance testing, system integration testing, using Chrome DevTools, and creating test reports in Google Sheets. After testing, I create clear and user-friendly system manuals using Figma. In the field of AI and automation, I design agentic workflows for data validation, build Chrome extensions for automation, develop web applications, and plan efficient workflows using tools such as ChatGPT, Claude, Gemini, Google AI Studio, Manus AI, and Codex. Additionally, I bring customer service experience through handling customer calls, ensuring clear communication, problem resolution, and professional support."},
    {kw:['skills','what do','technology','tech'],ans:"Key skills: Playwright automation, Python QA utilities, AI data quality review, API testing, manual testing, bug reporting, test documentation, Arduino/IoT systems, leadership, and communication."},
    {kw:['project','built','made','work'],ans:"3 major projects: Smartbin Automated System, Rice Vending Machine, and Smoke Alarm & CCTV Monitoring System — all Arduino-based."},
    {kw:['contact','email','phone','reach'],ans:"Email: fabuljohnloyd27@gmail.com · Phone: 0919 762 6160 · LinkedIn: linkedin.com/in/john-loyd-fabul-016160326"},
    {kw:['hire','internship','job','opportunity'],ans:"John is open to internships, entry-level positions, and collaborations — especially AI QA, software QA, test automation, data validation, and technical roles."},
    {kw:['school','university','bsu','batangas'],ans:"Studying at Batangas State University — BIT major in Computer Technology, Dean's Lister 2023–2024, Cum Laude grad 2026."},
    {kw:['leader','president','class','organization'],ans:"John is Class President (2022–present), Org Officer, CPET Director of TECHLINK (2024–2025), and 4th Year Representative."},
  ];
  const btn=document.getElementById('aiChatButton'), cont=document.getElementById('aiChatContainer');
  const closeB=document.getElementById('aiCloseBtn'), clearB=document.getElementById('aiClearBtn');
  const sendB=document.getElementById('aiSendBtn'), inp=document.getElementById('aiInput'), msgs=document.getElementById('aiMessages');
  if(!btn)return;

  function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);}
  function addMsg(who,txt){
    const d=document.createElement('div');
    d.style.cssText=`display:flex;${who==='user'?'justify-content:flex-end':''}`;
    const bubble=document.createElement('div');
    bubble.style.cssText=`max-width:85%;padding:8px 12px;border-radius:10px;font-family:var(--font-mono);font-size:12px;line-height:1.55;`
      +(who==='user'?'background:var(--cyan);color:#000;':'background:var(--card-bg);border:1px solid var(--border);color:var(--text);');
    bubble.textContent=txt; d.appendChild(bubble); msgs.appendChild(d);
    msgs.scrollTop=msgs.scrollHeight;
  }
  function handle(text){
    if(!text.trim())return;
    addMsg('user',text);
    const q=text.toLowerCase();
    if(/^[\d+\-*/(). ^]+$/.test(text)){try{addMsg('bot',String(Function('"use strict";return('+text.replace(/\^/g,'**')+')')()));}catch{addMsg('bot','Math error.');}return;}
    for(const item of faq){if(item.kw.some(k=>q.includes(k))){addMsg('bot',item.ans);return;}}
    addMsg('bot',"I can answer questions about John's skills, projects, education, or contact info. What would you like to know?");
  }
  btn.addEventListener('click',()=>{cont.classList.toggle('hidden');if(!cont.classList.contains('hidden'))inp.focus();});
  closeB?.addEventListener('click',()=>cont.classList.add('hidden'));
  clearB?.addEventListener('click',()=>{msgs.innerHTML='';addMsg('bot','Chat cleared. Ask me about John!');inp.focus();});
  sendB?.addEventListener('click',()=>{const v=inp.value.trim();if(!v)return;inp.value='';handle(v);});
  inp?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();sendB.click();}});
  addMsg('bot','Hi! I\'m John\'s portfolio assistant. Ask me about his AI QA skills, Playwright/Python testing, projects, leadership, or how to hire him.');
})();
