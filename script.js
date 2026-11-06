// ---------- EDIT THESE ----------
const REASONS = [
  "Your smile 😊",
  "The way you calm my storms 🌧️➡️🌈",
  "Your kindness 💗",
  "The way you listen 👂",
  "Your late night talks 🌙",
  "Because you're you, and that's enough 💖"
];
const RUNNER_EMOJI = "🐭";
// --------------------------------

const song = document.getElementById("song");
const welcome = document.getElementById("welcome");

// Open screen + start music
document.getElementById("openBtn").addEventListener("click", () => {
  welcome.classList.add("hidden");
  song.play().catch(() => {});
});

// Music on/off button
document.getElementById("musicToggle").addEventListener("click", () => {
  song.paused ? song.play() : song.pause();
});

// Flying hearts
const heartsBox = document.getElementById("hearts");
const HEARTS = ["💖", "💗", "💕", "💘", "❤️", "🌸"];

function spawnHeart() {
  const h = document.createElement("div");
  h.className = "heart";
  h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 16 + Math.random() * 28 + "px";
  h.style.animationDuration = 5 + Math.random() * 6 + "s";
  heartsBox.appendChild(h);
  setTimeout(() => h.remove(), 12000);
}
setInterval(spawnHeart, 500);

// Reasons
let reasonIndex = 0;
document.getElementById("reasonBtn").addEventListener("click", () => {
  document.getElementById("reasonCard").textContent = REASONS[reasonIndex % REASONS.length];
  reasonIndex++;
});

// ---------- NO button runs away ----------
const noBtn = document.getElementById("noBtn");
const hint = document.getElementById("hint");
const msgs = ["Nope 😜", "Too slow! 🏃", "Try again 😏", "You can't catch me 💨", "Just say yes 🥺"];
let dodges = 0;

function moveNo() {
  noBtn.style.position = "fixed";
  const pad = 10;
  const maxX = window.innerWidth - noBtn.offsetWidth - pad;
  const maxY = window.innerHeight - noBtn.offsetHeight - pad;
  noBtn.style.left = Math.max(pad, Math.random() * maxX) + "px";
  noBtn.style.top = Math.max(pad, Math.random() * maxY) + "px";
  hint.textContent = msgs[dodges % msgs.length];
  dodges++;
}

["mouseover", "pointerenter", "pointerdown", "touchstart", "focus"].forEach(evt =>
  noBtn.addEventListener(evt, e => { e.preventDefault(); moveNo(); }, { passive: false })
);
noBtn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); moveNo(); });
noBtn.tabIndex = -1;

// Dodge when the pointer gets close, before it even touches
document.addEventListener("mousemove", e => {
  const r = noBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  if (Math.hypot(e.clientX - cx, e.clientY - cy) < 90) moveNo();
});

// ---------- YES button ----------
document.getElementById("yesBtn").addEventListener("click", () => {
  document.getElementById("celebrate").classList.remove("hidden");
  noBtn.style.display = "none";
  burstHearts();
  startRunners();
});

function burstHearts() {
  for (let i = 0; i < 80; i++) setTimeout(spawnHeart, i * 40);
}

// Little mice running across the screen
function startRunners() {
  const box = document.getElementById("runners");
  box.style.zIndex = 200;
  function run() {
    const r = document.createElement("div");
    r.className = "runner";
    r.textContent = RUNNER_EMOJI;
    r.style.top = Math.random() * 85 + "vh";
    r.style.animationDuration = 3 + Math.random() * 3 + "s";
    box.appendChild(r);
    setTimeout(() => r.remove(), 6500);
  }
  setInterval(run, 600);
}