
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

(function() {
  const canvas = document.getElementById('python-snake-canvas');
  const hero = document.getElementById('hero');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let W = 0, H = 0, dpr = 1, time = 0;
  let snake = null;
  let bugs = [];
  let targetBug = null;
  let bugsEaten = 0;
  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  function resize() {
    const rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    resetSnake();
    seedBugs();
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function bugCountTarget() {
    const base = W < 720 ? 9 : 15;
    return Math.min(base + Math.floor(bugsEaten / 3), W < 720 ? 16 : 28);
  }

  function resetSnake() {
    const startX = W * (W < 720 ? .18 : .12);
    const startY = H * (W < 720 ? .78 : .72);
    snake = {
      x: startX,
      y: startY,
      angle: 0,
      trail: [],
      pulse: 0
    };
    const trailCount = W < 720 ? 26 : 36;
    const spacing = segmentSpacing();
    for (let i = 0; i < trailCount; i++) {
      snake.trail.push({ x: startX - i * spacing, y: startY });
    }
  }

  function makeBug(edgeOnly = false) {
    const margin = 46;
    const fromEdge = edgeOnly || Math.random() > .35;
    let x = rand(margin, Math.max(margin + 1, W - margin));
    let y = rand(H * .18, Math.max(H * .2, H * .82));

    if (fromEdge) {
      const edge = Math.floor(rand(0, 4));
      if (edge === 0) x = -margin;
      if (edge === 1) x = W + margin;
      if (edge === 2) y = H * .14;
      if (edge === 3) y = H * .86;
    }

    return {
      x,
      y,
      vx: rand(-.7, .7),
      vy: rand(-.55, .55),
      size: rand(5.5, 9.5),
      phase: rand(0, Math.PI * 2),
      wobble: rand(.018, .04),
      eaten: false,
      pop: 0,
      type: Math.random() > .45 ? 'cyan' : 'orange'
    };
  }

  function seedBugs() {
    const goal = bugCountTarget();
    bugs = bugs.filter(bug => bug.x > -80 && bug.x < W + 80 && bug.y > -80 && bug.y < H + 80);
    while (bugs.length < goal) bugs.push(makeBug());
  }

  function segmentSpacing() {
    return Math.max(11, Math.min(18, W / 82));
  }

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function findTarget() {
    const sight = W < 720 ? 150 : 230;
    let best = null;
    let bestDistance = Infinity;
    bugs.forEach(bug => {
      if (bug.eaten) return;
      const d = dist(snake, bug);
      if (d < sight && d < bestDistance) {
        best = bug;
        bestDistance = d;
      }
    });
    return best;
  }

  function updateBugs(speedFactor) {
    bugs.forEach(bug => {
      if (bug.eaten) {
        bug.pop += .08;
        return;
      }

      bug.phase += bug.wobble * (reduceMotion.matches ? .45 : 1);
      bug.x += (bug.vx + Math.sin(bug.phase) * .34) * speedFactor;
      bug.y += (bug.vy + Math.cos(bug.phase * 1.3) * .26) * speedFactor;

      const margin = 70;
      if (bug.x < -margin || bug.x > W + margin) bug.vx *= -1;
      if (bug.y < H * .12 || bug.y > H * .9) bug.vy *= -1;
    });

    bugs = bugs.filter(bug => !bug.eaten || bug.pop < 1);
    seedBugs();
  }

  function updateSnake() {
    targetBug = findTarget();
    const speedFactor = reduceMotion.matches ? .42 : 1;
    const patrolX = W * (.48 + Math.sin(time * .012) * .34);
    const patrolY = H * (W < 720 ? .78 : .68) + Math.sin(time * .02) * 34;
    const target = targetBug || { x: patrolX, y: patrolY };
    const dx = target.x - snake.x;
    const dy = target.y - snake.y;
    const desired = Math.atan2(dy, dx);
    let turn = desired - snake.angle;

    while (turn > Math.PI) turn -= Math.PI * 2;
    while (turn < -Math.PI) turn += Math.PI * 2;

    snake.angle += Math.max(-.055, Math.min(.055, turn));
    const speed = (targetBug ? 2.35 : 1.45) * speedFactor;
    snake.x += Math.cos(snake.angle) * speed;
    snake.y += Math.sin(snake.angle) * speed + Math.sin(time * .08) * .2;

    const pad = 28;
    snake.x = Math.max(pad, Math.min(W - pad, snake.x));
    snake.y = Math.max(H * .16, Math.min(H * .9, snake.y));

    snake.trail.unshift({ x: snake.x, y: snake.y });
    const maxTrail = W < 720 ? 30 : 42;
    if (snake.trail.length > maxTrail) snake.trail.length = maxTrail;

    if (targetBug && dist(snake, targetBug) < targetBug.size + 18) {
      targetBug.eaten = true;
      bugsEaten += 1;
      snake.pulse = 1;
    }

    snake.pulse *= .9;
  }

  function drawSegment(p, radius, index, count) {
    const tailFade = 1 - index / count;
    const dark = isDark();
    const fill = index < 5
      ? (dark ? 'rgba(0,212,255,.86)' : 'rgba(0,120,160,.68)')
      : (dark ? 'rgba(0,255,136,.62)' : 'rgba(0,132,92,.46)');
    const rim = dark ? 'rgba(255,107,0,.42)' : 'rgba(255,107,0,.28)';

    ctx.save();
    ctx.globalAlpha = .38 + tailFade * .48;
    ctx.shadowBlur = 18;
    ctx.shadowColor = index < 5 ? 'rgba(0,212,255,.42)' : 'rgba(0,255,136,.28)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
    ctx.strokeStyle = rim;
    ctx.stroke();
    ctx.restore();
  }

  function drawHead(head, neck) {
    const angle = Math.atan2(head.y - neck.y, head.x - neck.x);
    const dark = isDark();
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(angle);
    ctx.shadowBlur = 24;
    ctx.shadowColor = dark ? 'rgba(0,212,255,.48)' : 'rgba(0,120,160,.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 15, 0, 0, Math.PI * 2);
    ctx.fillStyle = dark ? 'rgba(0,212,255,.9)' : 'rgba(0,120,160,.72)';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = 'rgba(255,107,0,.52)';
    ctx.stroke();

    ctx.fillStyle = dark ? '#030810' : '#f7fbff';
    ctx.beginPath();
    ctx.arc(7, -6, 2.4, 0, Math.PI * 2);
    ctx.arc(7, 6, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,107,0,.88)';
    ctx.beginPath();
    ctx.arc(16, -3, 1.7 + snake.pulse * 1.3, 0, Math.PI * 2);
    ctx.arc(16, 3, 1.7 + snake.pulse * 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,107,0,.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(28, 0);
    ctx.lineTo(34, -4);
    ctx.moveTo(28, 0);
    ctx.lineTo(34, 4);
    ctx.stroke();
    ctx.restore();
  }

  function drawBug(bug) {
    const dark = isDark();
    const popScale = bug.eaten ? 1 + bug.pop * 1.2 : 1;
    const alpha = bug.eaten ? 1 - bug.pop : 1;
    const fill = bug.type === 'orange'
      ? (dark ? 'rgba(255,107,0,.9)' : 'rgba(205,76,0,.78)')
      : (dark ? 'rgba(0,255,136,.9)' : 'rgba(0,132,92,.72)');
    const wing = dark ? 'rgba(0,212,255,.34)' : 'rgba(0,120,160,.22)';

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(bug.x, bug.y);
    ctx.rotate(Math.sin(bug.phase) * .45);
    ctx.scale(popScale, popScale);
    ctx.shadowBlur = 16;
    ctx.shadowColor = bug.type === 'orange' ? 'rgba(255,107,0,.35)' : 'rgba(0,255,136,.28)';

    ctx.fillStyle = wing;
    ctx.beginPath();
    ctx.ellipse(-bug.size * .75, -bug.size * .22, bug.size * .7, bug.size * .4, -.45, 0, Math.PI * 2);
    ctx.ellipse(bug.size * .75, -bug.size * .22, bug.size * .7, bug.size * .4, .45, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(0, 0, bug.size * .55, bug.size, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = dark ? 'rgba(232,244,255,.42)' : 'rgba(5,21,37,.42)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-bug.size * .28, bug.size * .95);
    ctx.lineTo(-bug.size * .8, bug.size * 1.42);
    ctx.moveTo(bug.size * .28, bug.size * .95);
    ctx.lineTo(bug.size * .8, bug.size * 1.42);
    ctx.moveTo(0, -bug.size * .95);
    ctx.lineTo(-bug.size * .55, -bug.size * 1.42);
    ctx.moveTo(0, -bug.size * .95);
    ctx.lineTo(bug.size * .55, -bug.size * 1.42);
    ctx.stroke();

    ctx.restore();
  }

  function drawSightLine() {
    if (!targetBug) return;
    ctx.save();
    ctx.setLineDash([5, 8]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = isDark() ? 'rgba(255,107,0,.34)' : 'rgba(205,76,0,.22)';
    ctx.beginPath();
    ctx.moveTo(snake.x, snake.y);
    ctx.lineTo(targetBug.x, targetBug.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = isDark() ? 'rgba(255,107,0,.12)' : 'rgba(205,76,0,.08)';
    ctx.beginPath();
    ctx.arc(targetBug.x, targetBug.y, targetBug.size + 12 + Math.sin(time * .16) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHud() {
    const dark = isDark();
    const label = `BUG HUNTING QA: ${bugsEaten} defects caught`;
    ctx.save();
    ctx.font = '600 11px JetBrains Mono, monospace';
    const width = ctx.measureText(label).width + 24;
    const x = W < 720 ? 18 : 28;
    const y = W < 720 ? H - 88 : H - 64;

    ctx.fillStyle = dark ? 'rgba(3,8,16,.58)' : 'rgba(247,251,255,.62)';
    ctx.strokeStyle = dark ? 'rgba(0,255,136,.24)' : 'rgba(0,132,92,.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, width, 30, 7);
    } else {
      ctx.rect(x, y, width, 30);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = dark ? 'rgba(0,255,136,.92)' : 'rgba(0,98,68,.82)';
    ctx.fillText(label, x + 12, y + 20);
    ctx.restore();
  }

  function drawSnake() {
    const points = snake.trail;
    const count = points.length;
    for (let i = count - 1; i >= 0; i--) {
      const radius = Math.max(4.5, 13 - i * .2) + (i < 4 ? snake.pulse * 1.8 : 0);
      drawSegment(points[i], radius, i, count);
    }
    drawHead(points[0], points[1] || points[0]);
  }

  function drawScene() {
    ctx.clearRect(0, 0, W, H);
    bugs.forEach(drawBug);
    drawSightLine();
    drawSnake();
    drawHud();
  }

  function animate() {
    time += 1;
    const speedFactor = reduceMotion.matches ? .55 : 1;
    updateBugs(speedFactor);
    updateSnake();
    drawScene();
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  animate();
})();

