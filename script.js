'use strict';

// ── PAGE ROUTING ──
let currentPage = 'home';
const PAGE_ORDER = ['home', 'about', 'shows', 'annonces', 'contact'];

function navigateTo(pageName) {
  if (pageName === currentPage) return;
  const oldPage = document.getElementById('page-' + currentPage);
  const newPage = document.getElementById('page-' + pageName);
  if (!newPage) return;

  const oldIdx = PAGE_ORDER.indexOf(currentPage);
  const newIdx = PAGE_ORDER.indexOf(pageName);
  const forward = newIdx > oldIdx;

  // ── Cinematic curtain sweep ──
  const curtain = document.createElement('div');
  curtain.className = 'page-curtain';
  document.body.appendChild(curtain);
  setTimeout(() => curtain.remove(), 560);

  // Prépare la nouvelle page hors-écran avant de la rendre visible
  newPage.classList.add(forward ? 'enter-right' : 'enter-left');
  void newPage.offsetWidth; // force reflow

  // Sort l'ancienne page
  oldPage.classList.remove('active');
  oldPage.classList.add(forward ? 'exit-left' : 'exit-right');

  // Entre la nouvelle page (légèrement décalé pour coïncider avec la fin du rideau)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      newPage.classList.add('active');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          newPage.classList.remove('enter-right', 'enter-left');
        });
      });
    });
  });

  setTimeout(() => {
    oldPage.classList.remove('exit-left', 'exit-right');
    currentPage = pageName;
    updateNavButtons(pageName);
    if (pageName === 'home') { initAnimation(); typewriterHeadline(); }
    else stopAnimation();
  }, 500);
}

function updateNavButtons(pageName) {
  document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageName);
  });
  document.querySelectorAll('.dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.page === pageName);
  });
}

// ────────────────────────────────────────────────
// ── RICH BACKGROUND ANIMATION ──
// ────────────────────────────────────────────────
let animFrame = null;

// ── DATA ──
const TIKTOK_COMMENTS = [
  { user: '@kalimement',   text: "Ah donc c'était toi qui volait le lait à la maison 😂😂😂", likes: '14k',  color: '#ff2d55' },
  { user: '@cendrillion',  text: "T'es trop hardcore mec 😂😂🔥",                              likes: '8.2k', color: '#00f2ea' },
  { user: '@irkumso',      text: "Je vous invite à nos events, venez ! 🎤",                   likes: '21k',  color: '#ff2d55' },
  { user: '@legende',      text: "Limbisa nga mais... 😂😂😂",                               likes: '5.7k', color: '#00f2ea' },
  { user: '@propheteEden', text: "Frère j'ai failli tomber de mon siège 💀💀",               likes: '33k',  color: '#ff2d55' },
  { user: '@massay',       text: "Yo mwana mobali... 😂😂😂🤣🤣",                            likes: '9.1k', color: '#00f2ea' },
  { user: '@elisee',       text: "Ce qu'il dit est tellement vrai c'est choquant 😆💯",       likes: '17k',  color: '#ff2d55' },
  { user: '@promedi',      text: "Mdrr j'ai partagé à toute la famille 😭😭",                 likes: '42k',  color: '#00f2ea' },
  { user: '@willermine',   text: "Mais pourquoi c'est si vrai 😂😂 hahahaha",                 likes: '11k',  color: '#ff2d55' },
];

// Cycle comments in order (no repeats)
let _commentIdx = 0;
function nextComment() {
  const c = TIKTOK_COMMENTS[_commentIdx % TIKTOK_COMMENTS.length];
  _commentIdx++;
  return c;
}

const BIG_STICKERS  = ['😂','🤣','😆','💀','🔥','🎭','😭','💯','👏','🤩','🥲','🫡'];
const HA_BURSTS     = ['Ha!','Haha!','HaHaHa!','Kalime','MDR','Hahahaha!','💀💀'];

// ── NEURAL NODES ──
let neurons = [];
const isMobile = window.innerWidth <= 1199;
const NEURON_COUNT = isMobile ? 16 : 34;

function buildNeurons(W, H) {
  neurons = [];
  for (let i = 0; i < NEURON_COUNT; i++) {
    neurons.push({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r:  Math.random() * 3.5 + 2,
      pulse: Math.random() * Math.PI * 2,
      // repulsion accumulators
      rx: 0, ry: 0,
    });
  }
}

function drawNeurons(ctx, W, H, mouse) {
  const LINK = 160;
  // update positions
  for (const n of neurons) {
    n.rx = 0; n.ry = 0;
    if (mouse.x !== null) {
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < 180 && d > 0) {
        const f = ((180 - d) / 180) * 1.8;
        n.rx = (dx/d)*f;
        n.ry = (dy/d)*f;
      }
    }
    n.vx = n.vx * 0.98 + n.rx * 0.06;
    n.vy = n.vy * 0.98 + n.ry * 0.06;
    const spd = Math.sqrt(n.vx*n.vx + n.vy*n.vy);
    if (spd > 2.2) { n.vx = n.vx/spd*2.2; n.vy = n.vy/spd*2.2; }
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
    n.pulse += 0.025;
  }
  // draw links — mostly green, occasional red accent
  for (let i = 0; i < neurons.length; i++) {
    for (let j = i+1; j < neurons.length; j++) {
      const dx = neurons[i].x - neurons[j].x;
      const dy = neurons[i].y - neurons[j].y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < LINK) {
        const op = (1 - d/LINK) * 0.2;
        const useRed = (i + j) % 5 === 0;
        ctx.beginPath();
        ctx.strokeStyle = useRed
          ? `rgba(255,45,85,${op})`
          : `rgba(0,201,177,${op})`;
        ctx.lineWidth = 1;
        ctx.moveTo(neurons[i].x, neurons[i].y);
        ctx.lineTo(neurons[j].x, neurons[j].y);
        ctx.stroke();
      }
    }
  }
  // draw nodes — mostly green, ~1 in 4 red
  for (let ni = 0; ni < neurons.length; ni++) {
    const n = neurons[ni];
    const pulse = 0.7 + 0.3 * Math.sin(n.pulse);
    const r = n.r * pulse;
    const isRed = ni % 4 === 0;
    const col = isRed ? '255,45,85' : '0,201,177';
    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r*4);
    g.addColorStop(0, `rgba(${col},${0.28 * pulse})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.beginPath();
    ctx.arc(n.x, n.y, r*4, 0, Math.PI*2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${col},${0.7 * pulse})`;
    ctx.fill();
  }
}

// ── FLOATING ITEMS ──
let floaters = [];

function makeFloater(canvas, forcedType) {
  const W = canvas.width, H = canvas.height;
  const types = ['comment','sticker','sticker','ha','ha'];
  const type  = forcedType || types[Math.floor(Math.random() * types.length)];
  const base  = {
    x: Math.random() * W,
    y: H + 80,
    vx: 0, vy: 0,
    vy_base: -(Math.random() * 1.1 + 0.75),
    angle: (Math.random() - 0.5) * 0.15,
    dAngle: (Math.random() - 0.5) * 0.003,
    life: 0,
    maxLife: Math.random() * 600 + 600,
    scale: Math.random() * 0.45 + 0.78,
  };

  if (type === 'comment') {
    return { ...base, type, ...nextComment() };
  }
  if (type === 'sticker') {
    return { ...base, type,
      emoji: BIG_STICKERS[Math.floor(Math.random() * BIG_STICKERS.length)],
      size:  Math.floor(Math.random() * 38 + 44),   // 44-82px
    };
  }
  // ha burst
  return { ...base, type: 'ha',
    text: HA_BURSTS[Math.floor(Math.random() * HA_BURSTS.length)],
    size: Math.floor(Math.random() * 18 + 20),
  };
}

// ── TikTok comment card ──
function drawComment(ctx, item, alpha) {
  const s     = item.scale;
  const W     = 230 * s, H = 64 * s;
  const r     = 16 * s;
  const avatarR = 18 * s;
  const pad   = 10 * s;

  ctx.save();
  ctx.globalAlpha = alpha * 0.82;

  // card background
  const x = -W/2, y = -H/2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + W - r, y);
  ctx.quadraticCurveTo(x+W, y, x+W, y+r);
  ctx.lineTo(x+W, y+H-r);
  ctx.quadraticCurveTo(x+W, y+H, x+W-r, y+H);
  ctx.lineTo(x+r, y+H);
  ctx.quadraticCurveTo(x, y+H, x, y+H-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
  ctx.fillStyle = 'rgba(20,22,35,0.78)';
  ctx.fill();
  ctx.strokeStyle = item.color + '55';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // avatar circle
  const ax = x + pad + avatarR, ay = 0;
  ctx.beginPath();
  ctx.arc(ax, ay, avatarR, 0, Math.PI*2);
  ctx.fillStyle = item.color + 'cc';
  ctx.fill();
  // initial
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${12*s}px 'Sora',sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.user[1].toUpperCase(), ax, ay);

  // username
  const tx = ax + avatarR + pad*0.8;
  ctx.textAlign = 'left';
  ctx.fillStyle = item.color;
  ctx.font = `bold ${10*s}px 'Sora',sans-serif`;
  ctx.fillText(item.user, tx, y + H*0.28);

  // comment text
  ctx.fillStyle = '#eef0f4';
  ctx.font = `${10.5*s}px 'Poppins',sans-serif`;
  ctx.fillText(item.text, tx, y + H*0.62);

  // heart + likes
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = `${9*s}px 'Poppins',sans-serif`;
  ctx.fillText('❤ ' + item.likes, x + W - pad, y + H*0.5);

  ctx.restore();
}

// ── Big sticker ──
function drawSticker(ctx, item, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.75;
  ctx.font = `${item.size * item.scale}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.emoji, 0, 0);
  ctx.restore();
}

// ── Ha! burst ──
function drawHaBurst(ctx, item, alpha) {
  const s = item.scale, sz = item.size * s;
  ctx.save();
  ctx.globalAlpha = alpha * 0.55;
  ctx.font = `bold ${sz}px 'Sora',sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#c8d0da';
  ctx.fillText(item.text, 0, 0);
  ctx.restore();
}

// ── MAIN INIT ──
function stopAnimation() {
  cancelAnimationFrame(animFrame);
  animFrame = null;
}

function initAnimation() {
  stopAnimation();
  floaters = [];

  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    buildNeurons(canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Mouse
  let mouse = { x: null, y: null, vx: 0, vy: 0, _px: null, _py: null };
  const onMove = e => {
    const rect = canvas.getBoundingClientRect();
    const nx = e.clientX - rect.left, ny = e.clientY - rect.top;
    mouse.vx = mouse._px !== null ? nx - mouse._px : 0;
    mouse.vy = mouse._py !== null ? ny - mouse._py : 0;
    mouse._px = mouse.x; mouse._py = mouse.y;
    mouse.x = nx; mouse.y = ny;
  };
  const onLeave = () => { mouse.x = null; mouse.y = null; };
  canvas.addEventListener('mousemove', onMove, { passive: true });
  canvas.addEventListener('mouseleave', onLeave);

  // Seed initial floaters spread across screen
  const seedCount = isMobile ? 6 : 16;
  const seedTypes = ['comment','comment','sticker','sticker','sticker','ha','ha','ha','ha'];
  for (let i = 0; i < seedCount; i++) {
    const t = seedTypes[i % seedTypes.length];
    const f = makeFloater(canvas, t);
    f.y    = Math.random() * canvas.height;
    f.life = Math.random() * f.maxLife * 0.7;
    floaters.push(f);
  }

  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Decay mouse velocity
    mouse.vx *= 0.82; mouse.vy *= 0.82;

    // ── Layer 1: Neural network ──
    drawNeurons(ctx, W, H, mouse);

    // ── Layer 2: Floating items ──
    // Spawn
    const maxFloaters = isMobile ? 8 : 20;
    if (floaters.length < maxFloaters && Math.random() < 0.045) {
      floaters.push(makeFloater(canvas, null));
    }

    const REPULSE = 170;
    floaters = floaters.filter(item => {
      item.life++;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = item.x - mouse.x, dy = item.y - mouse.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < REPULSE && d > 0) {
          const f = ((REPULSE - d) / REPULSE) * 2.8;
          item.vx += (dx/d) * f + mouse.vx * 0.1;
          item.vy += (dy/d) * f + mouse.vy * 0.1;
          item.angle += (Math.random() - 0.5) * 0.25 * f;
        }
      }
      item.vx *= 0.93; item.vy *= 0.93;
      item.x  += item.vx + Math.sin(item.life * 0.018 + item.angle) * 0.55;
      item.y  += item.vy + item.vy_base;
      item.angle += item.dAngle;

      // Alpha envelope: fade in → hold → fade out
      const p = item.life / item.maxLife;
      const alpha = p < 0.12 ? p/0.12 : p > 0.78 ? (1-p)/0.22 : 1;

      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.angle);

      if      (item.type === 'comment') drawComment(ctx, item, alpha);
      else if (item.type === 'sticker') drawSticker(ctx, item, alpha);
      else                              drawHaBurst(ctx, item, alpha);

      ctx.restore();

      return item.life < item.maxLife && item.y > -200;
    });

    animFrame = requestAnimationFrame(draw);
  }

  draw();
}

// ── MOBILE BOTTOM NAV ──
function injectBottomNav() {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <button class="bottom-nav-btn active" data-page="home" onclick="navigateTo('home')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      Accueil
    </button>
    <button class="bottom-nav-btn" data-page="about" onclick="navigateTo('about')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      À propos
    </button>
    <button class="bottom-nav-btn" data-page="shows" onclick="navigateTo('shows')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      Spectacles
    </button>
    <button class="bottom-nav-btn" data-page="annonces" onclick="navigateTo('annonces')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      Annonces
    </button>
    <button class="bottom-nav-btn" data-page="contact" onclick="navigateTo('contact')">
      <svg viewBox="-1 -1 26 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
      Contact
    </button>
  `;
  document.body.appendChild(nav);
}

// ── TYPEWRITER HEADLINE ──
function typewriterHeadline() {
  const el = document.getElementById('home-headline');
  if (!el) return;

  // Line 1: name (white), Line 2: title (green accent)
  const segments = [
    { text: "Seigneur\u00a0De\u2019Zimour", br: true },
    { text: 'Humouriste',                   accent: true }
  ];

  el.innerHTML = '';
  el.style.opacity = '1';

  let si = 0, ci = 0, node = null;

  function tick() {
    if (si >= segments.length) {
      const cur = document.createElement('span');
      cur.className = 'type-cursor';
      cur.textContent = '|';
      el.appendChild(cur);
      setTimeout(() => {
        cur.style.transition = 'opacity 0.6s';
        cur.style.opacity = '0';
        setTimeout(() => cur.remove(), 700);
      }, 2500);
      return;
    }

    const seg = segments[si];

    if (ci === 0) {
      if (seg.accent) {
        node = document.createElement('span');
        node.className = 'text-accent';
        el.appendChild(node);
      } else {
        node = document.createTextNode('');
        el.appendChild(node);
      }
    }

    if (ci < seg.text.length) {
      if (seg.accent) node.textContent += seg.text[ci];
      else            node.nodeValue   += seg.text[ci];
      ci++;
      setTimeout(tick, seg.accent ? 55 : 38);
    } else {
      if (seg.br) el.appendChild(document.createElement('br'));
      si++; ci = 0; node = null;
      setTimeout(tick, seg.br ? 200 : 38);
    }
  }

  const delay = window.innerWidth <= 1199 ? 2150 : 350;
  setTimeout(tick, delay);
}

// ── SWIPE MOBILE ──
function initSwipe() {
  let startX = null, startY = null;
  const THRESHOLD = 55;

  document.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < THRESHOLD || Math.abs(dy) > Math.abs(dx) * 1.2) return;
    const idx = PAGE_ORDER.indexOf(currentPage);
    if (dx < 0 && idx < PAGE_ORDER.length - 1) navigateTo(PAGE_ORDER[idx + 1]);
    else if (dx > 0 && idx > 0)               navigateTo(PAGE_ORDER[idx - 1]);
    startX = null; startY = null;
  }, { passive: true });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  injectBottomNav();
  initAnimation();
  typewriterHeadline();
  initSwipe();
  document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => navigateTo(dot.dataset.page));
  });
});
