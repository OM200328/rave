// ---------- EDIT THESE ----------
const REASONS = [
  "Your smile 🌻", "The way you calm my storms 🌧️➡️🌈", "Your kindness 💛",
  "The way you listen 👂", "Your late night talks 🌙", "Because you're you, and that's enough ☁️"
];
const RUNNER_EMOJI = "🐭";
const QUIZ = [
  {
    q: "Our first date in a movie world. What happens?", o: [
      ["I show up with a boombox and a dramatic speech 🎶", "noah"], ["We steal a boat and sail into the sunset 🚢", "jack"],
      ["I get you to a wedding, accidentally 💃", "raj"], ["We go to a swamp. Romantic, trust me 🧅", "shrek"]]
  },
  {
    q: "Who ends up paying for the snacks?", o: [
      ["Me, but you eat 90% 🍿", "raj"], ["You. I sketch you in return 🎨", "jack"],
      ["Whoever loses the staring contest 👀", "shrek"], ["I write you a letter instead 💌", "noah"]]
  },
  {
    q: "Our couple fight looks like…", o: [
      ["Rain, shouting, then a big kiss ☔", "noah"], ["10 minutes of silence, then pizza 🍕", "shrek"],
      ["Running across a train platform 🚂", "raj"], ["You say 'door had space for both' 🚪", "jack"]]
  },
  {
    q: "Pick our movie theme song vibe", o: [
      ["Slow, soft, tears guaranteed 😭", "jack"], ["Rom-com banger 🎤", "raj"],
      ["Funny but secretly sweet 🎸", "shrek"], ["Old-school piano 🎹", "noah"]]
  },
  {
    q: "How would you describe me in the movie?", o: [
      ["Total hero, slightly clueless 🦸", "raj"], ["The funny sidekick who wins the girl 😎", "shrek"],
      ["Hopeless romantic 🌹", "noah"], ["Artist with zero money 🎨", "jack"]]
  }
];
const RESULTS = {
  jack: ["Jack & Rose 🚢", "Dramatic, deep and a little tragic. Please don't let go. There's room on the door."],
  raj: ["Raj & Simran 🚂", "Run to the train, hold the hand, go full filmy. Mustard fields included."],
  noah: ["Noah & Allie 🌧️", "Letters, rain and a forever kind of love. Keep tissues nearby."],
  shrek: ["Shrek & Fiona 🧅", "Messy, funny, loyal. Not perfect, just perfect for each other."]
};
// --------------------------------

const song = document.getElementById("song");
const welcome = document.getElementById("welcome");
const openBtn = document.getElementById("openBtn");
const lightBurst = document.getElementById("lightBurst");
const heroEnvelope = document.getElementById("heroEnvelope");
const heroCardWrap = document.getElementById("heroCardWrap");
const dustCanvas = document.getElementById("cinematicDustCanvas");

// ---------- CINEMATIC HERO AUDIO CHIME ----------
let cinemaAudioCtx = null;
function playCinematicOpenChord() {
  try {
    if (!cinemaAudioCtx) cinemaAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (cinemaAudioCtx.state === "suspended") cinemaAudioCtx.resume();
    // Warm, magical harp-like chord: D5, F#5, A5, D6
    const chordNotes = [587.33, 739.99, 880.00, 1174.66];
    chordNotes.forEach((freq, idx) => {
      const startTime = cinemaAudioCtx.currentTime + idx * 0.09;
      const osc = cinemaAudioCtx.createOscillator();
      const gain = cinemaAudioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      // Gentle shimmer vibrato
      osc.frequency.exponentialRampToValueAtTime(freq * 1.006, startTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.8);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.065, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4);

      osc.connect(gain);
      gain.connect(cinemaAudioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + 1.45);
    });
  } catch (_) { }
}

// ---------- CINEMATIC DUST & BOKEH PARTICLES ----------
let dustAnimId = null;
let dustActive = true;
if (dustCanvas) {
  const ctx = dustCanvas.getContext("2d");
  let width = (dustCanvas.width = window.innerWidth);
  let height = (dustCanvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    if (!dustActive) return;
    width = dustCanvas.width = window.innerWidth;
    height = dustCanvas.height = window.innerHeight;
  });

  const DUST_COUNT = 38;
  const particles = [];
  for (let i = 0; i < DUST_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 4.5 + 1.2,
      baseAlpha: Math.random() * 0.55 + 0.25,
      phase: Math.random() * Math.PI * 2,
      vy: -(Math.random() * 0.35 + 0.15),
      vx: (Math.random() - 0.5) * 0.2,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
      hue: Math.random() > 0.4 ? "255, 230, 150" : "255, 255, 255" // golden vs white
    });
  }

  let mouseX = width / 2;
  let mouseY = height / 2;
  let mouseVelX = 0, mouseVelY = 0;
  let lastMTime = performance.now();

  window.addEventListener("mousemove", (e) => {
    const now = performance.now();
    const dt = Math.max(1, now - lastMTime);
    mouseVelX = (e.clientX - mouseX) / dt;
    mouseVelY = (e.clientY - mouseY) / dt;
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastMTime = now;
  }, { passive: true });

  function renderDust(time) {
    if (!dustActive) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.phase += p.wobbleSpeed;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.phase) * 0.3;

      // Mouse stir interaction
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < 120 && dist > 1) {
        const force = (120 - dist) / 120;
        p.x += (dx / dist) * force * 1.8;
        p.y += (dy / dist) * force * 1.8;
      }

      // Wrap around edges
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      // Draw soft bokeh circle
      const alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.phase * 1.5));
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
      grad.addColorStop(0, `rgba(${p.hue}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${p.hue}, ${alpha * 0.45})`);
      grad.addColorStop(1, `rgba(${p.hue}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    dustAnimId = requestAnimationFrame(renderDust);
  }
  dustAnimId = requestAnimationFrame(renderDust);
}

// ---------- CINEMATIC 3D MULTI-PLANE PARALLAX ----------
let targetNormX = 0, targetNormY = 0;
let currNormX = 0, currNormY = 0;
let isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

window.addEventListener("mousemove", (e) => {
  targetNormX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetNormY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

function updateParallax(time) {
  if (!dustActive) return;

  if (isTouchDevice) {
    // Gentle cinematic breathing sway on mobile
    targetNormX = Math.sin(time * 0.001) * 0.5;
    targetNormY = Math.cos(time * 0.0014) * 0.4;
  }

  currNormX += (targetNormX - currNormX) * 0.06;
  currNormY += (targetNormY - currNormY) * 0.06;

  // Move parallax layers
  const layers = document.querySelectorAll("#welcome .parallax-layer");
  layers.forEach((el) => {
    const depth = parseFloat(el.dataset.depth || "0.04");
    const moveX = currNormX * depth * 350;
    const moveY = currNormY * depth * 220;
    el.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`;
  });

  // 3D Card tilt on center envelope
  if (heroEnvelope) {
    const rotY = currNormX * 12;
    const rotX = -currNormY * 9;
    heroEnvelope.style.transform = `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;
  }

  requestAnimationFrame(updateParallax);
}
requestAnimationFrame(updateParallax);

// ---------- CINEMATIC OPENING SEQUENCE ----------
if (openBtn && welcome) {
  openBtn.addEventListener("click", () => {
    // 1. Play emotional cinematic chime chord
    playCinematicOpenChord();

    // 2. Slide in cinematic widescreen letterbox bars
    welcome.classList.add("cinematic-letterbox");

    // 3. Trigger glowing golden-pink lens burst overlay
    if (lightBurst) lightBurst.classList.add("active");

    // 4. Burst sparkling romance particles from envelope
    const envRect = (heroEnvelope || openBtn).getBoundingClientRect();
    const cx = envRect.left + envRect.width / 2;
    const cy = envRect.top + envRect.height / 2;
    burstCinematicOpenParticles(cx, cy);

    // 5. Camera pushes forward through clouds
    setTimeout(() => {
      welcome.classList.add("cinematic-opening");
    }, 280);

    // 6. Smooth music fade-in
    if (song) {
      song.volume = 0;
      song.play().catch(() => { });
      let vol = 0;
      const volInterval = setInterval(() => {
        vol = Math.min(1, vol + 0.08);
        song.volume = vol;
        if (vol >= 1) clearInterval(volInterval);
      }, 80);
    }

    // 7. Complete reveal of hero garden
    setTimeout(() => {
      welcome.classList.add("hidden");
      dustActive = false;
      if (dustAnimId) cancelAnimationFrame(dustAnimId);
    }, 1150);
  });
}

function burstCinematicOpenParticles(startX, startY) {
  const container = document.getElementById("hugsOverlay") || document.body;
  const items = ["✨", "💛", "🌸", "💖", "⭐", "🌼", "✨", "💕"];
  const count = 22;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "hug-particle";
    p.textContent = items[i % items.length];
    p.style.left = `${startX}px`;
    p.style.top = `${startY}px`;

    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const dist1 = 50 + Math.random() * 80;
    const dist2 = 140 + Math.random() * 220;

    const dx1 = Math.cos(angle) * dist1;
    const dy1 = Math.sin(angle) * dist1;
    const dx2 = Math.cos(angle) * dist2;
    const dy2 = Math.sin(angle) * dist2 - 60; // float slightly upwards

    p.style.setProperty("--dx1", `${dx1}px`);
    p.style.setProperty("--dy1", `${dy1}px`);
    p.style.setProperty("--dx2", `${dx2}px`);
    p.style.setProperty("--dy2", `${dy2}px`);
    p.style.setProperty("--dur", `${2.2 + Math.random() * 0.8}s`);
    p.style.setProperty("--start-scale", "0.4");
    p.style.setProperty("--mid-scale", "1.3");
    p.style.setProperty("--end-scale", "0.6");
    p.style.setProperty("--rot0", `${(Math.random() - 0.5) * 40}deg`);
    p.style.setProperty("--rot1", `${(Math.random() - 0.5) * 80}deg`);
    p.style.setProperty("--rot2", `${(Math.random() - 0.5) * 120}deg`);

    container.appendChild(p);
    setTimeout(() => p.remove(), 3000);
  }
}

const musicToggle = document.getElementById("musicToggle");
if (musicToggle && song) {
  musicToggle.addEventListener("click", () => { song.paused ? song.play() : song.pause(); });
}

const sendHugsBtn = document.getElementById("sendHugsBtn");
let hugCount = 0;
let hugAudioCtx = null;

function playHugChime() {
  try {
    if (!hugAudioCtx) hugAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (hugAudioCtx.state === "suspended") hugAudioCtx.resume();
    const notes = [587.33, 880]; // D5, A5 bright gentle chime
    notes.forEach((freq, idx) => {
      const osc = hugAudioCtx.createOscillator();
      const gain = hugAudioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, hugAudioCtx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.045, hugAudioCtx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, hugAudioCtx.currentTime + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(hugAudioCtx.destination);
      osc.start(hugAudioCtx.currentTime + idx * 0.08);
      osc.stop(hugAudioCtx.currentTime + idx * 0.08 + 0.36);
    });
  } catch (_) { }
}

function showHugToast() {
  const container = document.getElementById("hugsOverlay") || document.body;
  const existing = document.querySelector(".hug-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "hug-toast";
  const messages = [
    "Warm hug sent to my sunshine! 🤗💖",
    "Sending you the biggest hug forever! 💕✨",
    "A million hugs delivered straight to you! 🌸💛",
    "Tightest cuddle incoming! 🥰🧸",
    "Never letting you go! 🫂💛"
  ];
  toast.textContent = messages[hugCount % messages.length];
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function burstHugsFromButton(btn) {
  const container = document.getElementById("hugsOverlay") || document.body;
  const rect = btn.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  const emojis = ["❤️", "🤗", "💖", "🥰", "✨", "💛", "🧸", "🌸", "🫂"];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "hug-particle";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;

    // Radial sweep outward and downward, then ascending
    const angle = (Math.PI * 0.15) + Math.random() * (Math.PI * 0.7);
    const dist1 = 45 + Math.random() * 85;
    const dx1 = Math.cos(angle) * dist1 * (Math.random() < 0.65 ? -1 : 1);
    const dy1 = Math.sin(angle) * (dist1 * 0.6) - 15;

    const dx2 = dx1 + (Math.random() - 0.5) * 120;
    const dy2 = dy1 - (180 + Math.random() * 200);

    const dur = (2.2 + Math.random() * 1.3) + "s";
    const startScale = (0.5 + Math.random() * 0.3).toFixed(2);
    const midScale = (1.15 + Math.random() * 0.55).toFixed(2);
    const endScale = (0.7 + Math.random() * 0.4).toFixed(2);
    const rot1 = `${(Math.random() - 0.5) * 50}deg`;
    const rot2 = `${(Math.random() - 0.5) * 90}deg`;

    el.style.fontSize = `${1.3 + Math.random() * 1.3}rem`;
    el.style.setProperty("--dur", dur);
    el.style.setProperty("--start-scale", startScale);
    el.style.setProperty("--mid-scale", midScale);
    el.style.setProperty("--end-scale", endScale);
    el.style.setProperty("--dx1", `${dx1}px`);
    el.style.setProperty("--dy1", `${dy1}px`);
    el.style.setProperty("--dx2", `${dx2}px`);
    el.style.setProperty("--dy2", `${dy2}px`);
    el.style.setProperty("--rot1", rot1);
    el.style.setProperty("--rot2", rot2);

    setTimeout(() => {
      container.appendChild(el);
      setTimeout(() => el.remove(), 3800);
    }, i * 45);
  }

  // Screen-wide floaters rising from bottom
  for (let j = 0; j < 8; j++) {
    setTimeout(() => {
      const bottomEl = document.createElement("div");
      bottomEl.className = "hug-particle";
      bottomEl.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      bottomEl.style.left = `${Math.random() * 88 + 6}vw`;
      bottomEl.style.top = `95vh`;
      bottomEl.style.fontSize = `${1.5 + Math.random() * 1.4}rem`;
      bottomEl.style.setProperty("--dur", `${3.5 + Math.random() * 1.5}s`);
      bottomEl.style.setProperty("--dx1", `${(Math.random() - 0.5) * 60}px`);
      bottomEl.style.setProperty("--dy1", `-40vh`);
      bottomEl.style.setProperty("--dx2", `${(Math.random() - 0.5) * 120}px`);
      bottomEl.style.setProperty("--dy2", `-105vh`);
      container.appendChild(bottomEl);
      setTimeout(() => bottomEl.remove(), 5200);
    }, j * 85);
  }
}

if (sendHugsBtn) {
  sendHugsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    hugCount++;
    sendHugsBtn.classList.add("hug-popping");
    setTimeout(() => sendHugsBtn.classList.remove("hug-popping"), 200);

    playHugChime();
    showHugToast();
    burstHugsFromButton(sendHugsBtn);
  });
}

// Sky: clouds + sunbirds
const sky = document.getElementById("sky");
for (let i = 0; i < 7; i++) {
  const c = document.createElement("div");
  c.className = "cloud";
  c.style.top = 4 + Math.random() * 55 + "vh";
  c.style.transform = `scale(${0.6 + Math.random() * 0.9})`;
  c.style.animationDuration = 60 + Math.random() * 60 + "s";
  c.style.animationDelay = -Math.random() * 90 + "s";
  sky.appendChild(c);
}
for (let i = 0; i < 3; i++) {
  const b = document.createElement("div");
  b.className = "bird"; b.textContent = "🐦";
  b.style.top = 8 + Math.random() * 35 + "vh";
  b.style.animationDuration = `${25 + i * 9}s, 1s`;
  b.style.animationDelay = `${-i * 8}s, 0s`;
  sky.appendChild(b);
}

// Sunflower SVG (layered petals, seed pattern)
function sunflowerSVG(size) {
  let p = "";
  for (let layer = 0; layer < 2; layer++)
    for (let i = 0; i < 18; i++) {
      const a = i * 20 + layer * 10;
      p += `<ellipse cx="50" cy="${layer ? 20 : 15}" rx="${layer ? 7 : 8}" ry="${layer ? 15 : 18}" fill="${layer ? "#ffd84d" : "#ffb300"}" stroke="#e08a00" stroke-width=".6" transform="rotate(${a} 50 50)"/>`;
    }
  let seeds = "";
  for (let k = 1; k < 60; k++) {
    const r = 3.3 * Math.sqrt(k), t = k * 2.4;
    seeds += `<circle cx="${50 + r * Math.cos(t)}" cy="${50 + r * Math.sin(t)}" r="1.3" fill="#9b6a3a"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">${p}<circle cx="50" cy="50" r="22" fill="#5b3a1e"/>${seeds}</svg>`;
}
const garden = document.getElementById("garden");
const n = Math.max(8, Math.floor(window.innerWidth / 110));
for (let i = 0; i < n; i++) {
  const size = 50 + Math.random() * 50, h = 40 + Math.random() * 90;
  const f = document.createElement("div");
  f.className = "sf";
  f.style.left = (i / n) * 100 + Math.random() * 4 + "%";
  f.style.width = size + "px";
  f.style.height = h + size + "px";
  f.style.animationDelay = -Math.random() * 4 + "s";
  f.innerHTML = `<div class="stem" style="height:${h + size / 2}px"></div>` + sunflowerSVG(size);
  garden.appendChild(f);
  if (i % 3 === 1) { const d = document.createElement("div"); d.className = "heart"; d.style.cssText = `left:${(i / n) * 100 + 3}%;bottom:20px;animation:none;font-size:1.6rem`; d.textContent = "🌼"; garden.appendChild(d); }
}

// Floating petals/hearts
const heartsBox = document.getElementById("hearts");
const HEARTS = ["🌻", "💛", "🌼", "💙", "☁️", "🐝"];
function spawnHeart() {
  const h = document.createElement("div");
  h.className = "heart";
  h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 16 + Math.random() * 24 + "px";
  h.style.animationDuration = 5 + Math.random() * 6 + "s";
  heartsBox.appendChild(h);
  setTimeout(() => h.remove(), 12000);
}
setInterval(spawnHeart, 700);

// Reasons
let reasonIndex = 0;
document.getElementById("reasonBtn").addEventListener("click", () => {
  document.getElementById("reasonCard").textContent = REASONS[reasonIndex % REASONS.length];
  reasonIndex++;
});

// NO button runs away
const noBtn = document.getElementById("noBtn");
const hint = document.getElementById("hint");
const msgs = ["Nope 😜", "Too slow! 🏃", "Try again 😏", "You can't catch me 💨", "Just say yes 🥺"];
let dodges = 0;
function moveNo() {
  noBtn.style.position = "fixed";
  const pad = 10;
  noBtn.style.left = Math.max(pad, Math.random() * (window.innerWidth - noBtn.offsetWidth - pad)) + "px";
  noBtn.style.top = Math.max(pad, Math.random() * (window.innerHeight - noBtn.offsetHeight - pad)) + "px";
  hint.textContent = msgs[dodges % msgs.length];
  dodges++;
}
["mouseover", "pointerenter", "pointerdown", "touchstart", "focus"].forEach(evt =>
  noBtn.addEventListener(evt, e => { e.preventDefault(); moveNo(); }, { passive: false }));
noBtn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); moveNo(); });
noBtn.tabIndex = -1;
document.addEventListener("mousemove", e => {
  const r = noBtn.getBoundingClientRect();
  if (Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 90) moveNo();
});

// YES -> celebration + quiz
const celebrate = document.getElementById("celebrate");
const quizCard = document.getElementById("quizCard");
const stage = document.getElementById("quizStage");
const thankYouStage = document.getElementById("thankYouStage");
let runnersStarted = false;

document.getElementById("yesBtn").addEventListener("click", () => {
  celebrate.classList.remove("hidden");
  noBtn.style.display = "none";
  for (let i = 0; i < 60; i++) setTimeout(spawnHeart, i * 40);
  startRunners();
});
function startRunners() {
  if (runnersStarted) return;
  runnersStarted = true;
  const box = document.getElementById("runners");
  box.style.zIndex = 200;
  setInterval(() => {
    const r = document.createElement("div");
    r.className = "runner"; r.textContent = RUNNER_EMOJI;
    r.style.top = Math.random() * 85 + "vh";
    r.style.animationDuration = 3 + Math.random() * 3 + "s";
    box.appendChild(r);
    setTimeout(() => r.remove(), 6500);
  }, 900);
}

// Quiz + Final Thank You Sticker Page
const CARD_TOP_STICKERS = [
  ["sunflower-bouquet.png", "Sunflower bouquet", -10, "card-sticker pos-tl"],
  ["disco-ball.png", "Disco ball with red stars", 8, "card-sticker pos-tr"],
  ["kitten-cake.png", "Kitten with cake and tulips", -6, "card-sticker pos-ml"],
  ["ghosts.png", "Cute little ghosts holding hands", 7, "card-sticker pos-mr"]
];
const FRAME_STICKERS = [
  ["i-love-you.png", "I love you note", -7, "frame-sticker pos-pl"],
  ["red-bow.png", "Red satin bow", 11, "frame-sticker pos-pr"],
  ["sunshine-note.png", "You are my sunshine", -3, "frame-sticker pos-pb"]
];
const CARD_BOTTOM_STICKERS = [
  ["heart-balloons.png", "Red heart balloons", -7, "card-sticker pos-bl"],
  ["panda-balloon.png", "Panda with pink heart balloon", -5, "card-sticker pos-pm"],
  ["hugging-kittens.png", "Two kittens hugging", 6, "card-sticker pos-br"]
];
const SCRAPBOOK_STICKERS = [
  ["you-make-me-happy.png", "You make me happy in a way no one else can", -3, "sz-note"],
  ["laughing-cats.png", "Silly laughing cats", 5, "sz-lg"],
  ["my-girl-heart.png", "My girl red heart", -6, "sz-md"],
  ["pink-butterfly.png", "Pink butterfly", 8, "sz-md"],
  ["love-you-moon.png", "Love you to the moon and back", -4, "sz-note"],
  ["heart-envelope.png", "Heart sealed love letter", 6, "sz-md"],
  ["sun-moon-stars.png", "You are my sun, my moon, and all of my stars", -5, "sz-tall"],
  ["pink-tulips.png", "Pink tulips bunch", 4, "sz-md"],
  ["favorite-person.png", "Favorite Person arrow", -6, "sz-note"],
  ["holding-hands.png", "Holding hands sketch", 3, "sz-md"],
  ["my-heart-yours.png", "My heart is, and always will be, yours", 4, "sz-note"],
  ["red-hibiscus.png", "Red hibiscus flower", -7, "sz-md"],
  ["heart-stamp.png", "Pink heart postage stamp", 5, "sz-md"],
  ["evil-eye.png", "Protective blue evil eye", -4, "sz-sm"],
  ["my-dearest.png", "My dearest note", 6, "sz-tall"],
  ["open-book-flowers.png", "Open book with flowers", -5, "sz-lg"],
  ["gingham-bow.png", "Red gingham bow", 7, "sz-md"],
  ["heart-bandaid.png", "Heart band-aid", -6, "sz-note"],
  ["pink-tulip-frame.png", "Framed pink tulip", 4, "sz-md"],
  ["red-lips-1.png", "Red lipstick kiss", -8, "sz-sm"],
  ["lucky-to-have-you.png", "Lucky is to have you note", 5, "sz-tall"],
  ["pressed-yellow-flower.png", "Pressed yellow flower", -4, "sz-lg"],
  ["my-man.png", "My man sticker", 7, "sz-tall"],
  ["pink-floral-collage.png", "Pink floral collage", -6, "sz-lg"],
  ["fingerprint-heart.png", "Red fingerprint heart", 5, "sz-sm"],
  ["red-tulips-bouquet.png", "Red tulips bouquet", -5, "sz-md"],
  ["silver-star-lg.png", "Large silver star balloon", 8, "sz-md"],
  ["silver-star-sm.png", "Small silver star balloon", -9, "sz-sm"],
  ["love-newspaper-scrap.png", "Love typography scrap", -4, "sz-lg"],
  ["floral-page-scrap.png", "Vintage floral page scrap", 5, "sz-lg"]
];

const SPARKLE_ICONS = ["💛", "🌻", "✨", "💖", "🌼"];
function spawnSparkles(el) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < 6; i++) {
    const s = document.createElement("span");
    s.className = "sparkle-pop";
    s.textContent = SPARKLE_ICONS[i % SPARKLE_ICONS.length];
    const angle = (Math.PI * 2 * i) / 6 + (Math.random() * 0.5 - 0.25);
    const dist = 36 + Math.random() * 34;
    s.style.left = cx - 10 + "px";
    s.style.top = cy - 10 + "px";
    s.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
    s.style.setProperty("--ty", `${Math.sin(angle) * dist - 22}px`);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
}

function createStickerEl([file, label, rot, extraClass]) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `sticker ${extraClass}`;
  btn.title = label;
  btn.setAttribute("aria-label", label);
  btn.style.setProperty("--rot", `${rot}deg`);
  const img = document.createElement("img");
  img.src = `images/stickers/${file}`;
  img.alt = label;
  img.loading = "lazy";
  btn.appendChild(img);
  btn.addEventListener("click", () => {
    btn.classList.remove("pop");
    void btn.offsetWidth;
    btn.classList.add("pop");
    spawnSparkles(btn);
  });
  return btn;
}

function appendStickers(container, items) {
  items.forEach(item => container.appendChild(createStickerEl(item)));
}

let qi = 0, tally = {};
function bindQuizStart() {
  const btn = document.getElementById("startQuiz");
  if (btn) btn.addEventListener("click", showQ);
}
bindQuizStart();

function resetQuizState(startImmediately) {
  qi = 0; tally = {};
  celebrate.classList.remove("thankyou-mode");
  thankYouStage.classList.add("hidden");
  thankYouStage.innerHTML = "";
  quizCard.classList.remove("hidden");
  if (startImmediately) {
    showQ();
  } else {
    stage.innerHTML = `<h1 class="script">She said YES! 🎉</h1>
      <p>Quick movie-world game before we celebrate 🎬</p>
      <button class="btn" id="startQuiz">Play 🎮</button>`;
    bindQuizStart();
  }
}

function showQ() {
  const q = QUIZ[qi];
  stage.innerHTML = `<div class="bar"><i style="width:${(qi / QUIZ.length) * 100}%"></i></div>
    <h1 class="script">Question ${qi + 1}/${QUIZ.length}</h1><p>${q.q}</p><div class="opts"></div>`;
  const box = stage.querySelector(".opts");
  q.o.forEach(([text, key]) => {
    const b = document.createElement("button");
    b.className = "opt"; b.textContent = text;
    b.onclick = () => { tally[key] = (tally[key] || 0) + 1; qi++; qi < QUIZ.length ? showQ() : showResult(); };
    box.appendChild(b);
  });
}

function showResult() {
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
  const [name, line] = RESULTS[top];
  const pct = 93 + Math.floor(Math.random() * 7); // always high, obviously 😄

  quizCard.classList.add("hidden");
  celebrate.classList.add("thankyou-mode");
  thankYouStage.classList.remove("hidden");
  celebrate.scrollTop = 0;

  thankYouStage.innerHTML = `
    <div class="thankyou-card">
      <div class="card-stickers-top"></div>
      <h1 class="script">Thank You, My Sunshine! 🌻</h1>
      <p class="thankyou-sub">You just made me the happiest person ever 💛</p>
      <div class="thankyou-photo-wrap">
        <img class="thankyou-img" src="images/thank-you.jpg" onerror="this.onerror=null;this.src='images/thank-you.jpg.jpeg';" alt="Cute kittens hugging with sunflowers saying Thank You!" />
      </div>
      <div class="result-pill">
        <div class="result-match">Our Movie Match: <b>${name}</b></div>
        <p class="result-line">${line}</p>
        <div>She loves me this much:</div>
        <div class="pct" id="pct">0%</div>
        <div class="meter"><i id="fill"></i></div>
        <p class="small">Accuracy verified by 100% real sunflowers 🌻☁️</p>
      </div>
      <div class="card-stickers-bottom"></div>
    </div>
    <div class="scrapbook-board">
      <h2 class="script scrapbook-title">Our Little Love Scrapbook ✨</h2>
      <p class="scrapbook-hint">Every sticker picked just for you — tap any sticker for sparkles 💛</p>
      <div class="sticker-collage" id="stickerCollage"></div>
    </div>
    <div class="mc-portal-card">
      <div class="mc-badge">NEXT ADVENTURE UNLOCKED ⛏️✨</div>
      <h2 class="script">Our Minecraft Date Night World</h2>
      <p class="mc-portal-sub">Hop on our flower boat ride &amp; step into our 3D Minecraft world — walk hand-in-hand through the Amusement Park, Date Restaurant, Cozy Beds House &amp; Starry Gazebo!</p>
      <div class="mc-portal-media">
        <div class="mc-boat-preview">
          <video class="mc-portal-video" src="videos/take-to-world.mp4" autoplay loop muted playsinline></video>
          <span class="mc-boat-cap">Our Boat Ride to the World ⛵💐</span>
        </div>
        <div class="mc-preview-strip">
          <div class="mc-preview-item"><img src="images/minecraft/couple-skins.jpg" alt="Our Minecraft characters" /><span>Our Characters</span></div>
          <div class="mc-preview-item"><img src="images/minecraft/pastel-village.jpg" alt="Amusement park village" /><span>Amusement Park</span></div>
          <div class="mc-preview-item"><img src="images/minecraft/restaurant-kitchen.jpg" alt="Date restaurant" /><span>Date Restaurant</span></div>
          <div class="mc-preview-item"><img src="images/minecraft/winter-fireplace.jpg" alt="Cozy house rooms" /><span>Cozy Rooms</span></div>
          <div class="mc-preview-item"><img src="images/minecraft/date-gazebo.jpg" alt="Starry date night gazebo" /><span>Date Night</span></div>
        </div>
      </div>
      <button type="button" class="btn mc-enter-btn" id="enterMcBtn">Sail to Our Minecraft World ⛵🎮</button>
    </div>
    <div id="portalTransition" class="mc-video-overlay hidden">
      <div class="mc-video-shell">
        <div class="mc-video-pill">Taking You to Our Minecraft World... ⛵💐</div>
        <div class="mc-video-frame">
          <video id="portalVideo" src="videos/take-to-world.mp4" playsinline></video>
        </div>
        <div class="mc-video-progress"><i id="portalProgressBar"></i></div>
        <div class="mc-video-controls">
          <button type="button" class="btn soft" id="portalMuteBtn">🔊 Sound ON</button>
          <button type="button" class="btn mc-enter-btn" id="skipPortalBtn">Enter Minecraft World Now →</button>
        </div>
      </div>
    </div>
    <div class="thankyou-actions">
      <button class="btn" id="replayQuizBtn">Play Quiz Again 🎬</button>
      <button class="btn soft" id="backGardenBtn">Back to Our Garden 🌻</button>
    </div>`;

  appendStickers(thankYouStage.querySelector(".card-stickers-top"), CARD_TOP_STICKERS);
  appendStickers(thankYouStage.querySelector(".thankyou-photo-wrap"), FRAME_STICKERS);
  appendStickers(thankYouStage.querySelector(".card-stickers-bottom"), CARD_BOTTOM_STICKERS);
  appendStickers(document.getElementById("stickerCollage"), SCRAPBOOK_STICKERS);

  const portalOverlay = document.getElementById("portalTransition");
  const portalVideo = document.getElementById("portalVideo");
  const portalBar = document.getElementById("portalProgressBar");
  const portalMuteBtn = document.getElementById("portalMuteBtn");
  const goToWorld = () => { window.location.href = "minecraft.html"; };

  document.getElementById("enterMcBtn").addEventListener("click", () => {
    if (song && !song.paused) song.pause();
    portalOverlay.classList.remove("hidden");
    portalVideo.currentTime = 0;
    portalVideo.muted = false;
    portalVideo.play().catch(() => {
      portalVideo.muted = true;
      portalMuteBtn.textContent = "🔇 Unmute";
      portalVideo.play().catch(goToWorld);
    });
  });
  portalMuteBtn.addEventListener("click", () => {
    portalVideo.muted = !portalVideo.muted;
    portalMuteBtn.textContent = portalVideo.muted ? "🔇 Unmute" : "🔊 Sound ON";
  });
  portalVideo.addEventListener("timeupdate", () => {
    if (portalVideo.duration) portalBar.style.width = `${(portalVideo.currentTime / portalVideo.duration) * 100}%`;
  });
  portalVideo.addEventListener("ended", goToWorld);
  document.getElementById("skipPortalBtn").addEventListener("click", goToWorld);

  document.getElementById("replayQuizBtn").addEventListener("click", () => resetQuizState(true));
  document.getElementById("backGardenBtn").addEventListener("click", () => {
    celebrate.classList.add("hidden");
    resetQuizState(false);
  });

  setTimeout(() => { const fill = document.getElementById("fill"); if (fill) fill.style.width = pct + "%"; }, 50);
  let c = 0;
  const t = setInterval(() => { c++; const el = document.getElementById("pct"); if (!el) return clearInterval(t); el.textContent = c + "%"; if (c >= pct) clearInterval(t); }, 22);
  for (let i = 0; i < 45; i++) setTimeout(spawnHeart, i * 50);
}