// ============================================================
// ---------- EDIT NAMES & HINGLISH COMPLIMENTS HERE ----------
// ============================================================
const AVATAR_NAMES = {
  girl: "My Sunshine", // <-- Change Girl's forehead name here
  boy:  "Your Hero"    // <-- Change Boy's forehead name here
};

const HINGLISH_COMPLIMENTS = [
  "Tum aaj bhi utni hi cute lag rahi ho jitni pehle din thi 💛",
  "Yaar, tumhari smile dekh ke mera pura din ban jaata hai ✨",
  "Is pure Minecraft world se bhi zyada sundar toh tum ho 🌻",
  "Haath pakad ke chalna ho toh bas tumhare saath, forever 🤝💖",
  "Tumhare saath har chhoti walk bhi ek dreamy date lagti hai 🌙",
  "Chalo Date Restaurant mein cake khate hain, par tumse meetha kuch nahi 🍰",
  "Thak gayi ho toh Cozy House ke bed pe rest kar lein? 🛏️💛",
  "Ferris wheel ki lights bhi tumhari aankhon jitni chamak nahi sakti 🎡✨",
  "Sach bolun? Tum meri favorite person ho aur hamesha rahogi 💕",
  "Aise hi haath thame rakhna, bas yahi meri sabse badi wish hai 💛"
];
// ============================================================

(function () {
  const W = window.MCWorld;
  const { WX, WY, WZ, CHUNK, B, PROPS, PLACES } = W;

  const canvas = document.getElementById('glCanvas');
  const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
  if (!gl) {
    alert('WebGL is required to view this 3D Minecraft world.');
    return;
  }

  // ---------- Shaders ----------
  const WORLD_VS = `
    attribute vec3 aPos;
    attribute vec2 aUv;
    attribute float aShade;
    attribute float aSky;
    attribute float aBlk;
    uniform mat4 uProj;
    uniform mat4 uView;
    varying vec2 vUv;
    varying float vShade;
    varying float vSky;
    varying float vBlk;
    varying float vDist;
    void main() {
      vec4 mv = uView * vec4(aPos, 1.0);
      vDist = length(mv.xyz);
      vUv = aUv; vShade = aShade; vSky = aSky; vBlk = aBlk;
      gl_Position = uProj * mv;
    }
  `;
  const WORLD_FS = `
    precision mediump float;
    uniform sampler2D uAtlas;
    uniform vec3 uSunLight;
    uniform float uSkyLevel;
    uniform vec3 uFogColor;
    uniform float uAlpha;
    varying vec2 vUv;
    varying float vShade;
    varying float vSky;
    varying float vBlk;
    varying float vDist;
    void main() {
      vec4 tex = texture2D(uAtlas, vUv);
      if (tex.a < 0.12) discard;
      vec3 skyTerm = uSunLight * vSky * uSkyLevel;
      vec3 torchTerm = vec3(1.0, 0.72, 0.34) * pow(vBlk, 1.4) * 1.15;
      vec3 ambient = vec3(0.12, 0.13, 0.18);
      vec3 light = max(ambient, vShade * (skyTerm + torchTerm));
      vec3 col = tex.rgb * min(light, vec3(1.25));
      float fog = smoothstep(50.0, 114.0, vDist);
      col = mix(col, uFogColor, fog);
      gl_FragColor = vec4(col, tex.a * uAlpha);
    }
  `;

  const COLOR_VS = `
    attribute vec3 aPos;
    attribute vec3 aNormal;
    uniform mat4 uProj;
    uniform mat4 uView;
    uniform mat4 uModel;
    varying vec3 vNorm;
    varying float vDist;
    void main() {
      vec4 mv = uView * (uModel * vec4(aPos, 1.0));
      vDist = length(mv.xyz);
      vNorm = mat3(uModel) * aNormal;
      gl_Position = uProj * mv;
    }
  `;
  const COLOR_FS = `
    precision mediump float;
    uniform vec4 uColor;
    uniform float uLit;
    uniform vec3 uFogColor;
    uniform vec3 uSunLight;
    uniform float uSkyLevel;
    varying vec3 vNorm;
    varying float vDist;
    void main() {
      vec3 n = normalize(vNorm);
      float diff = max(0.42, dot(n, normalize(vec3(0.45, 0.85, 0.35))));
      vec3 shade = mix(vec3(1.0), diff * (uSunLight * max(0.42, uSkyLevel) + vec3(0.24)), uLit);
      vec3 col = uColor.rgb * shade;
      float fog = smoothstep(58.0, 130.0, vDist);
      col = mix(col, uFogColor, fog * uLit);
      gl_FragColor = vec4(col, uColor.a);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function createProgram(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }

  const worldProg = createProgram(WORLD_VS, WORLD_FS);
  const colorProg = createProgram(COLOR_VS, COLOR_FS);

  // Texture Atlas
  const atlasTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, atlasTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, W.atlasCanvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const UNIT_CUBE = new Float32Array([
    -0.5, 0.5, 0.5, 0,1,0,  0.5, 0.5, 0.5, 0,1,0,  0.5, 0.5,-0.5, 0,1,0,
    -0.5, 0.5, 0.5, 0,1,0,  0.5, 0.5,-0.5, 0,1,0, -0.5, 0.5,-0.5, 0,1,0,
    -0.5,-0.5,-0.5, 0,-1,0, 0.5,-0.5,-0.5, 0,-1,0, 0.5,-0.5, 0.5, 0,-1,0,
    -0.5,-0.5,-0.5, 0,-1,0, 0.5,-0.5, 0.5, 0,-1,0,-0.5,-0.5, 0.5, 0,-1,0,
    -0.5,-0.5, 0.5, 0,0,1,  0.5,-0.5, 0.5, 0,0,1,  0.5, 0.5, 0.5, 0,0,1,
    -0.5,-0.5, 0.5, 0,0,1,  0.5, 0.5, 0.5, 0,0,1, -0.5, 0.5, 0.5, 0,0,1,
     0.5,-0.5,-0.5, 0,0,-1,-0.5,-0.5,-0.5, 0,0,-1,-0.5, 0.5,-0.5, 0,0,-1,
     0.5,-0.5,-0.5, 0,0,-1,-0.5, 0.5,-0.5, 0,0,-1, 0.5, 0.5,-0.5, 0,0,-1,
     0.5,-0.5, 0.5, 1,0,0,  0.5,-0.5,-0.5, 1,0,0,  0.5, 0.5,-0.5, 1,0,0,
     0.5,-0.5, 0.5, 1,0,0,  0.5, 0.5,-0.5, 1,0,0,  0.5, 0.5, 0.5, 1,0,0,
    -0.5,-0.5,-0.5,-1,0,0, -0.5,-0.5, 0.5,-1,0,0, -0.5, 0.5, 0.5,-1,0,0,
    -0.5,-0.5,-0.5,-1,0,0, -0.5, 0.5, 0.5,-1,0,0, -0.5, 0.5,-0.5,-1,0,0
  ]);
  const cubeVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVbo);
  gl.bufferData(gl.ARRAY_BUFFER, UNIT_CUBE, gl.STATIC_DRAW);

  // ---------- Matrix Math ----------
  function mat4Multiply(a, b) {
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        out[c * 4 + r] =
          a[0 * 4 + r] * b[c * 4 + 0] +
          a[1 * 4 + r] * b[c * 4 + 1] +
          a[2 * 4 + r] * b[c * 4 + 2] +
          a[3 * 4 + r] * b[c * 4 + 3];
      }
    }
    return out;
  }
  function mat4Perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }
  function mat4LookAt(eye, target) {
    let fx = target[0] - eye[0], fy = target[1] - eye[1], fz = target[2] - eye[2];
    let fl = Math.hypot(fx, fy, fz) || 1;
    fx /= fl; fy /= fl; fz /= fl;
    let sx = -fz, sy = 0, sz = fx;
    let sl = Math.hypot(sx, sy, sz) || 1;
    sx /= sl; sy /= sl; sz /= sl;
    const ux = sy * fz - sz * fy, uy = sz * fx - sx * fz, uz = sx * fy - sy * fx;
    return new Float32Array([
      sx, ux, -fx, 0,
      sy, uy, -fy, 0,
      sz, uz, -fz, 0,
      -(sx * eye[0] + sy * eye[1] + sz * eye[2]),
      -(ux * eye[0] + uy * eye[1] + uz * eye[2]),
      (fx * eye[0] + fy * eye[1] + fz * eye[2]),
      1
    ]);
  }
  // T * Ry * Rx * Rz * S
  function mat4TRS(tx, ty, tz, rx, ry, rz, sx, sy, sz) {
    const cy = Math.cos(ry), syr = Math.sin(ry);
    const cx = Math.cos(rx), sxr = Math.sin(rx);
    const cz = Math.cos(rz), szr = Math.sin(rz);
    const r00 = cy * cz + syr * sxr * szr;
    const r01 = -cy * szr + syr * sxr * cz;
    const r02 = syr * cx;
    const r10 = cx * szr;
    const r11 = cx * cz;
    const r12 = -sxr;
    const r20 = -syr * cz + cy * sxr * szr;
    const r21 = syr * szr + cy * sxr * cz;
    const r22 = cy * cx;
    return new Float32Array([
      r00 * sx, r10 * sx, r20 * sx, 0,
      r01 * sy, r11 * sy, r21 * sy, 0,
      r02 * sz, r12 * sz, r22 * sz, 0,
      tx, ty, tz, 1
    ]);
  }

  // ---------- Build Static World Chunks ----------
  W.buildWorld();
  const CX = Math.ceil(WX / CHUNK), CZ = Math.ceil(WZ / CHUNK);
  const chunks = [];
  for (let cz = 0; cz < CZ; cz++) {
    for (let cx = 0; cx < CX; cx++) {
      const mesh = W.buildChunkMesh(cx, cz);
      const opqVbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, opqVbo);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.opaque, gl.STATIC_DRAW);
      const trnVbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, trnVbo);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.translucent, gl.STATIC_DRAW);
      chunks.push({ opqVbo, opqCnt: mesh.opaque.length / 8, trnVbo, trnCnt: mesh.translucent.length / 8 });
    }
  }

  // ---------- Audio ----------
  let audioCtx = null;
  let soundEnabled = true;
  const bgMusic = document.getElementById('bgMusic');
  function playChime(notes) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      (notes || [523, 659, 784, 1046]).forEach((f, i) => {
        const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime + i * 0.08);
        g.gain.setValueAtTime(0.06, audioCtx.currentTime + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.08 + 0.25);
        osc.connect(g); g.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.08);
        osc.stop(audioCtx.currentTime + i * 0.08 + 0.26);
      });
    } catch (_) {}
  }

  // ---------- Sky Modes, Clouds, Stars & Particles ----------
  const SKY_MODES = [
    { name: '☀️ Day', sky: [0.55, 0.82, 0.99], sun: [1.0, 0.99, 0.94], level: 1.0, stars: false },
    { name: '🌅 Sunset', sky: [0.95, 0.63, 0.56], sun: [1.0, 0.80, 0.62], level: 0.72, stars: false },
    { name: '🌙 Date Night', sky: [0.06, 0.09, 0.19], sun: [0.34, 0.44, 0.70], level: 0.26, stars: true }
  ];
  let skyIdx = 1;

  const clouds = Array.from({ length: 18 }, (_, i) => ({
    x: (i * 19) % 120 - 12, y: 29 + (i % 3) * 1.5, z: ((i * 31) % 120) - 12,
    w: 7 + (i % 4) * 2.5, d: 5 + (i % 3) * 2
  }));
  const stars = Array.from({ length: 110 }, (_, i) => {
    const a = (i * 2.39996) % (Math.PI * 2), r = 42 + (i % 7) * 8;
    return [48 + Math.cos(a) * r, 34 + (i % 5) * 3, 48 + Math.sin(a) * r];
  });

  const particles = [];
  function spawnHearts(x, y, z, count) {
    for (let i = 0; i < (count || 12); i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 0.9,
        y: y + Math.random() * 0.6,
        z: z + (Math.random() - 0.5) * 0.9,
        vx: (Math.random() - 0.5) * 1.4,
        vy: 1.4 + Math.random() * 1.5,
        vz: (Math.random() - 0.5) * 1.4,
        life: 1.1 + Math.random() * 0.6,
        size: 0.16,
        color: i % 2 === 0 ? [1.0, 0.40, 0.62] : [1.0, 0.85, 0.32]
      });
    }
  }

  // ---------- 3D Character Skins ----------
  const SKINS = {
    flower_girl: {
      skin: [0.96, 0.80, 0.69], hair: [0.43, 0.27, 0.20], eyes: [0.46, 0.67, 0.39],
      top: [0.76, 0.58, 0.72], skirt: [0.85, 0.62, 0.76], legs: [0.83, 0.64, 0.76],
      shoes: [0.92, 0.90, 0.85], crown: true, bow: false, glasses: false, starShirt: false
    },
    red_girl: {
      skin: [0.98, 0.82, 0.73], hair: [0.68, 0.12, 0.14], eyes: [0.24, 0.14, 0.10],
      top: [0.97, 0.96, 0.96], skirt: [0.78, 0.15, 0.22], legs: [0.96, 0.94, 0.95],
      shoes: [0.80, 0.16, 0.24], crown: false, bow: true, glasses: false, starShirt: false
    },
    star_boy: {
      skin: [0.68, 0.42, 0.24], hair: [0.10, 0.09, 0.10], eyes: [0.15, 0.12, 0.10],
      top: [0.11, 0.11, 0.13], skirt: [0.14, 0.14, 0.17], legs: [0.15, 0.15, 0.18],
      shoes: [0.93, 0.93, 0.95], crown: false, bow: false, glasses: true, starShirt: true
    }
  };

  function drawColoredBox(modelMat, color, lit) {
    gl.uniformMatrix4fv(gl.getUniformLocation(colorProg, 'uModel'), false, modelMat);
    gl.uniform4f(gl.getUniformLocation(colorProg, 'uColor'), color[0], color[1], color[2], color[3] ?? 1);
    gl.uniform1f(gl.getUniformLocation(colorProg, 'uLit'), lit ?? 1);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }

  // pose: 'walk' | 'sit' | 'lie', handSide: 'right' (girl holds right arm out) | 'left' (boy holds left arm out) | null
  function drawCharacter(skinKey, px, py, pz, yaw, walkPhase, pose, handSide) {
    const s = SKINS[skinKey] || SKINS.flower_girl;
    const isLying = pose === 'lie';
    const isSitting = pose === 'sit';
    // When lying down on bed, tilt -90deg backwards around X and raise slightly to sit neatly on top of mattress
    const base = isLying
      ? mat4TRS(px, py + 0.18, pz, -Math.PI / 2, -yaw, 0, 1, 1, 1)
      : mat4TRS(px, py, pz, 0, -yaw, 0, 1, 1, 1);

    function part(lx, ly, lz, rx, rz, sx, sy, sz, col, pivotY) {
      let m = mat4TRS(lx, ly, lz, rx, 0, rz, 1, 1, 1);
      if (pivotY) m = mat4Multiply(m, mat4TRS(0, pivotY, 0, 0, 0, 0, sx, sy, sz));
      else m = mat4TRS(lx, ly, lz, rx, 0, rz, sx, sy, sz);
      drawColoredBox(mat4Multiply(base, m), col, 1);
    }

    const legAng = isSitting ? -Math.PI * 0.44 : (isLying ? 0 : Math.sin(walkPhase) * 0.62);
    const leftArmX = isSitting ? -0.25 : (isLying ? 0.05 : -Math.sin(walkPhase) * 0.56);
    const rightArmX = isSitting ? -0.25 : (isLying ? 0.05 : Math.sin(walkPhase) * 0.56);
    const yOff = isSitting ? -0.32 : 0;

    // Holding hands inner arm angle!
    const lArmRx = handSide === 'left' ? -0.22 : leftArmX;
    const rArmRx = handSide === 'right' ? -0.22 : rightArmX;
    const lArmRz = handSide === 'left' ? -0.22 : 0;
    const rArmRz = handSide === 'right' ? 0.22 : 0;

    // Legs
    part(-0.13, 0.72 + yOff, 0, legAng, 0, 0.23, 0.72, 0.24, s.legs, -0.36);
    part( 0.13, 0.72 + yOff, 0, isSitting ? -Math.PI * 0.44 : -legAng, 0, 0.23, 0.72, 0.24, s.legs, -0.36);
    if (!isSitting) {
      part(-0.13, 0.72, 0, legAng, 0, 0.24, 0.14, 0.26, s.shoes, -0.65);
      part( 0.13, 0.72, 0, -legAng, 0, 0.24, 0.14, 0.26, s.shoes, -0.65);
    }

    // Torso
    part(0, 1.08 + yOff, 0, 0, 0, 0.50, 0.72, 0.26, s.top);
    part(0, 0.80 + yOff, 0, 0, 0, 0.52, 0.18, 0.28, s.skirt);
    if (s.starShirt) {
      part(0, 1.12 + yOff, -0.14, 0, 0, 0.16, 0.16, 0.03, [0.95, 0.95, 0.98]);
      part(0, 1.12 + yOff, -0.145, 0, 0, 0.24, 0.07, 0.03, [0.95, 0.95, 0.98]);
    }
    if (s.bow) {
      part(0, 1.24 + yOff, -0.14, 0, 0, 0.18, 0.08, 0.04, [0.82, 0.14, 0.22]);
      part(0, 1.18 + yOff, -0.14, 0, 0, 0.07, 0.10, 0.04, [0.82, 0.14, 0.22]);
    }

    // Arms
    part(-0.35, 1.38 + yOff, 0, lArmRx, lArmRz, 0.19, 0.68, 0.21, s.top, -0.31);
    part( 0.35, 1.38 + yOff, 0, rArmRx, rArmRz, 0.19, 0.68, 0.21, s.top, -0.31);

    // Head
    const hy = 1.69 + yOff;
    part(0, hy, 0, 0, 0, 0.48, 0.48, 0.48, s.skin);
    part(0, hy + 0.21, 0.01, 0, 0, 0.51, 0.12, 0.51, s.hair);
    part(0, hy + 0.02, 0.21, 0, 0, 0.51, 0.46, 0.12, s.hair);
    part(-0.23, hy + 0.05, 0.04, 0, 0, 0.07, 0.42, 0.44, s.hair);
    part( 0.23, hy + 0.05, 0.04, 0, 0, 0.07, 0.42, 0.44, s.hair);
    if (!s.glasses) {
      part(-0.20, hy - 0.18, -0.18, 0, 0, 0.10, 0.52, 0.10, s.hair);
      part( 0.20, hy - 0.18, -0.18, 0, 0, 0.10, 0.52, 0.10, s.hair);
    }
    part(-0.12, hy - 0.02, -0.245, 0, 0, 0.09, 0.08, 0.02, [0.98, 0.98, 1.0]);
    part( 0.12, hy - 0.02, -0.245, 0, 0, 0.09, 0.08, 0.02, [0.98, 0.98, 1.0]);
    part(-0.11, hy - 0.02, -0.25,  0, 0, 0.05, 0.07, 0.02, s.eyes);
    part( 0.11, hy - 0.02, -0.25,  0, 0, 0.05, 0.07, 0.02, s.eyes);
    if (s.glasses) {
      part(-0.12, hy - 0.02, -0.26, 0, 0, 0.14, 0.11, 0.02, [0.12, 0.12, 0.15, 0.65]);
      part( 0.12, hy - 0.02, -0.26, 0, 0, 0.14, 0.11, 0.02, [0.12, 0.12, 0.15, 0.65]);
      part( 0,    hy,        -0.26, 0, 0, 0.06, 0.03, 0.02, [0.12, 0.12, 0.15]);
    }
    if (s.crown) {
      part(0.25, hy + 0.12, -0.05, 0, 0, 0.06, 0.12, 0.12, [0.98, 0.96, 0.99]);
      part(0.25, hy + 0.02,  0.07, 0, 0, 0.06, 0.11, 0.11, [0.93, 0.65, 0.78]);
      part(0.24, hy + 0.07,  0.01, 0, 0, 0.05, 0.16, 0.16, [0.46, 0.68, 0.34]);
    }
  }

  // ---------- Animated Amusement Park Rides (3D) ----------
  const FERRIS = { cx: 48.5, cy: 21.0, cz: 14.0, r: 8.2, gondolas: 8 };
  const CAROUSEL = { cx: 32.0, cy: 10.1, cz: 20.0, r: 3.7, horses: 6 };

  function getFerrisGondolaPos(timeSec, idx) {
    const a = timeSec * 0.42 + (idx * Math.PI * 2) / FERRIS.gondolas;
    return [FERRIS.cx, FERRIS.cy + Math.sin(a) * FERRIS.r, FERRIS.cz + Math.cos(a) * FERRIS.r];
  }

  function drawAmusementRides(timeSec) {
    // 1. Ferris Wheel Spokes, Rim & Pastel Gondolas
    const a0 = timeSec * 0.42;
    const gColors = [
      [0.95, 0.65, 0.76], [0.52, 0.85, 0.88], [0.97, 0.84, 0.42], [0.76, 0.64, 0.92]
    ];
    for (let i = 0; i < FERRIS.gondolas; i++) {
      const a = a0 + (i * Math.PI * 2) / FERRIS.gondolas;
      const gy = FERRIS.cy + Math.sin(a) * FERRIS.r;
      const gz = FERRIS.cz + Math.cos(a) * FERRIS.r;
      // Two radial spokes (left & right wheel rims)
      const midY = (FERRIS.cy + gy) / 2, midZ = (FERRIS.cz + gz) / 2;
      drawColoredBox(mat4TRS(FERRIS.cx - 1.3, midY, midZ, -a, 0, 0, 0.18, 0.18, FERRIS.r), [0.96, 0.88, 0.65], 1);
      drawColoredBox(mat4TRS(FERRIS.cx + 1.3, midY, midZ, -a, 0, 0, 0.18, 0.18, FERRIS.r), [0.96, 0.88, 0.65], 1);
      // Gondola cabin (always upright!)
      const col = gColors[i % gColors.length];
      drawColoredBox(mat4TRS(FERRIS.cx, gy - 0.55, gz, 0, 0, 0, 1.8, 0.25, 1.4), col, 1);
      drawColoredBox(mat4TRS(FERRIS.cx, gy - 0.1, gz - 0.6, 0, 0, 0, 1.8, 0.7, 0.18), col, 1);
      drawColoredBox(mat4TRS(FERRIS.cx, gy - 0.1, gz + 0.6, 0, 0, 0, 1.8, 0.7, 0.18), col, 1);
      drawColoredBox(mat4TRS(FERRIS.cx, gy + 0.65, gz, 0, 0, 0, 1.9, 0.18, 1.5), [1.0, 0.92, 0.65], 0.3);
    }

    // 2. Carousel Spinning Canopy & Bobbing Horses
    const ca = timeSec * 0.9;
    for (let i = 0; i < CAROUSEL.horses; i++) {
      const a = ca + (i * Math.PI * 2) / CAROUSEL.horses;
      const hx = CAROUSEL.cx + Math.cos(a) * CAROUSEL.r;
      const hz = CAROUSEL.cz + Math.sin(a) * CAROUSEL.r;
      const bob = Math.sin(timeSec * 2.8 + i) * 0.28;
      // Brass pole
      drawColoredBox(mat4TRS(hx, 12.6, hz, 0, 0, 0, 0.12, 4.4, 0.12), [0.96, 0.82, 0.36], 1);
      // Cute blocky carousel horse
      const hCol = gColors[i % gColors.length];
      drawColoredBox(mat4TRS(hx, 11.0 + bob, hz, 0, -a, 0, 0.55, 0.45, 0.95), hCol, 1);
      drawColoredBox(mat4TRS(hx - Math.sin(a) * 0.35, 11.4 + bob, hz + Math.cos(a) * 0.35, 0, -a, 0, 0.34, 0.45, 0.38), [0.98, 0.96, 0.92], 1);
      // Canopy beam
      const mx = CAROUSEL.cx + Math.cos(a) * (CAROUSEL.r * 0.52);
      const mz = CAROUSEL.cz + Math.sin(a) * (CAROUSEL.r * 0.52);
      drawColoredBox(mat4TRS(mx, 14.8, mz, 0, -a, 0, CAROUSEL.r * 1.1, 0.35, 1.15), hCol, 1);
    }
  }

  // ---------- Couple State & 360° Camera ----------
  const couple = {
    x: 48.5, y: 9.05, z: 50.5,
    vx: 0, vy: 0, vz: 0,
    yaw: 0, walkPhase: 0, onGround: false,
    girlSkin: 'flower_girl', boySkin: 'star_boy',
    holdingHands: true,
    mode: null, // null | 'sit' | 'rest' | 'ferris' | 'carousel'
    modeData: null
  };
  let camYaw = 0, camPitch = -0.22, camDist = 4.6;
  const boyFollower = { x: 49.6, y: 9.05, z: 51.2, yaw: 0 };

  function isSolid(bx, by, bz) {
    const id = W.getBlock(bx, by, bz);
    return PROPS[id] ? PROPS[id].solid : false;
  }
  function collides(px, py, pz, hw) {
    const h = 1.75;
    for (let y = Math.floor(py + 0.02); y <= Math.floor(py + h); y++)
      for (let z = Math.floor(pz - hw); z <= Math.floor(pz + hw); z++)
        for (let x = Math.floor(px - hw); x <= Math.floor(px + hw); x++)
          if (isSolid(x, y, z)) return true;
    return false;
  }
  function rayDistToSolid(ox, oy, oz, dx, dy, dz, maxDist) {
    for (let d = 0.4; d <= maxDist; d += 0.25) {
      if (isSolid(Math.floor(ox + dx * d), Math.floor(oy + dy * d), Math.floor(oz + dz * d))) {
        return Math.max(1.1, d - 0.35);
      }
    }
    return maxDist;
  }

  function getCameraTransform() {
    const target = [couple.x, couple.y + (couple.mode ? 0.95 : 1.38), couple.z];
    const cp = Math.cos(camPitch);
    const back = [-Math.sin(camYaw) * cp, -Math.sin(camPitch), Math.cos(camYaw) * cp];
    const safeDist = couple.mode === 'ferris' ? camDist : rayDistToSolid(target[0], target[1], target[2], back[0], back[1], back[2], camDist);
    const eye = [target[0] + back[0] * safeDist, target[1] + back[1] * safeDist, target[2] + back[2] * safeDist];
    return { eye, target };
  }

  // ---------- Hinglish Compliments & Interactions ----------
  let compIdx = 0;
  let lastAutoComp = performance.now();
  function showDialogue(msg) {
    const el = document.getElementById('dialogueToast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add('hidden'), 4800);
  }
  function sayHinglishCompliment(customMsg) {
    const line = customMsg || HINGLISH_COMPLIMENTS[compIdx % HINGLISH_COMPLIMENTS.length];
    if (!customMsg) compIdx++;
    showDialogue(`${AVATAR_NAMES.boy}: "${line}"`);
    spawnHearts(couple.x, couple.y + 1.8, couple.z, 10);
    playChime([523, 659, 784]);
    lastAutoComp = performance.now();
  }

  function findNearestInteract() {
    let best = null, bestD = 3.6;
    for (const it of W.interactables) {
      const d = Math.hypot(couple.x - (it.x + 0.5), couple.y + 0.9 - (it.y + 0.5), couple.z - (it.z + 0.5));
      if (d < bestD) { bestD = d; best = it; }
    }
    return best;
  }

  function exitSpecialMode() {
    if (!couple.mode) return;
    if (couple.mode === 'ferris') { couple.x = 48.5; couple.y = 10.2; couple.z = 18.5; }
    else if (couple.mode === 'carousel') { couple.x = 32; couple.y = 10.2; couple.z = 25; }
    else { couple.y += 0.35; }
    couple.mode = null; couple.modeData = null;
  }

  function doInteract() {
    if (couple.mode) {
      exitSpecialMode();
      return;
    }
    const near = findNearestInteract();
    if (!near) { sayHinglishCompliment(); return; }
    if (near.type === 'rest') {
      couple.mode = 'rest';
      couple.x = near.bedX; couple.y = near.bedY; couple.z = near.bedZ;
      couple.yaw = near.faceYaw || 0;
      sayHinglishCompliment('Aaram kar lo meri jaan, main yahin hoon tumhare paas 🛏️💛');
    } else if (near.type === 'sit') {
      couple.mode = 'sit';
      couple.x = near.x + 0.5; couple.y = near.sitY; couple.z = near.z + 0.5;
      couple.yaw = near.faceYaw || 0;
      sayHinglishCompliment('Tumhare saath baith kar time kaise udd jaata hai pata hi nahi chalta ☕💛');
    } else if (near.type === 'eat') {
      sayHinglishCompliment(near.msg);
    } else if (near.type === 'ferris') {
      couple.mode = 'ferris'; couple.modeData = 0;
      sayHinglishCompliment('Upar se pura world dekho, par meri nazar toh sirf tum par hai 🎡💖');
    } else if (near.type === 'carousel') {
      couple.mode = 'carousel';
      sayHinglishCompliment('Carousel ride tumhare saath bilkul fairytale lag rahi hai 🎠✨');
    } else if (near.type === 'datenight') {
      skyIdx = 2; updateSkyButton();
      spawnHearts(48.5, 11.4, 80.5, 22);
      sayHinglishCompliment('Happy Date Night! Yeh taare aur lanterns sab tumhare liye hain 🕯️🌙💖');
    }
  }

  function warpTo(place) {
    couple.mode = null; couple.modeData = null;
    couple.x = place.x; couple.y = place.y; couple.z = place.z;
    couple.vx = couple.vy = couple.vz = 0;
    couple.yaw = place.yaw || 0;
    camYaw = couple.yaw;
    boyFollower.x = place.x + 1.1; boyFollower.y = place.y; boyFollower.z = place.z + 0.5;
    if (place.id === 'gazebo') { skyIdx = 2; updateSkyButton(); }
    showDialogue(`📍 Arrived at ${place.name} with ${AVATAR_NAMES.boy} & ${AVATAR_NAMES.girl} 💛`);
    playChime([440, 554, 659]);
  }

  // ---------- Top-Right Live Mini-Map ----------
  const miniCanvas = document.getElementById('minimapCanvas');
  const mctx = miniCanvas.getContext('2d');
  const mapBg = document.createElement('canvas');
  mapBg.width = 184; mapBg.height = 184;
  (function paintMiniMapBg() {
    const g = mapBg.getContext('2d');
    const sc = 184 / WX;
    for (let z = 0; z < WZ; z++) {
      for (let x = 0; x < WX; x++) {
        const id = W.getBlock(x, 8, z);
        const topId = W.getBlock(x, 9, z);
        let col = '#69ae4b';
        if (x <= 34 && z >= 62) col = '#dceaff';
        if (id === B.COBBLE || id === B.MOSSY_COBBLE || id === B.STONE_BRICK) col = '#9da4ad';
        if (W.getBlock(x, 7, z) === B.WATER) col = '#4aa3e8';
        if (topId === B.OAK_PLANKS || id === B.OAK_PLANKS) col = '#c29258';
        g.fillStyle = col;
        g.fillRect(x * sc, z * sc, Math.ceil(sc), Math.ceil(sc));
      }
    }
    // Zone badges
    g.font = 'bold 10px Fredoka, sans-serif';
    g.textAlign = 'center';
    for (const p of PLACES) {
      const mx = p.mapPos[0] * sc, my = p.mapPos[1] * sc;
      g.fillStyle = 'rgba(18, 26, 38, 0.78)';
      g.beginPath(); g.arc(mx, my, 9, 0, Math.PI * 2); g.fill();
      g.strokeStyle = p.color; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#fff';
      g.fillText(p.short, mx, my + 18);
    }
  })();

  function renderMiniMap() {
    const sc = 184 / WX;
    mctx.clearRect(0, 0, 184, 184);
    mctx.drawImage(mapBg, 0, 0);
    const px = couple.x * sc, pz = couple.z * sc;
    // Camera direction cone
    mctx.fillStyle = 'rgba(255, 232, 102, 0.34)';
    mctx.beginPath();
    mctx.moveTo(px, pz);
    mctx.arc(px, pz, 16, camYaw - Math.PI / 2 - 0.4, camYaw - Math.PI / 2 + 0.4);
    mctx.closePath(); mctx.fill();
    // Couple dot
    mctx.fillStyle = '#ff6b9e';
    mctx.beginPath(); mctx.arc(px, pz, 5, 0, Math.PI * 2); mctx.fill();
    mctx.strokeStyle = '#fff'; mctx.lineWidth = 1.8; mctx.stroke();
  }

  miniCanvas.addEventListener('click', e => {
    const r = miniCanvas.getBoundingClientRect();
    const wx = ((e.clientX - r.left) / r.width) * WX;
    const wz = ((e.clientY - r.top) / r.height) * WZ;
    let best = PLACES[0], bestD = 999;
    for (const p of PLACES) {
      const d = Math.hypot(wx - p.mapPos[0], wz - p.mapPos[1]);
      if (d < bestD) { bestD = d; best = p; }
    }
    warpTo(best);
  });

  // ---------- 3D Forehead Pointer Name Tags ----------
  const labelGirl = document.getElementById('labelGirl');
  const labelBoy = document.getElementById('labelBoy');
  labelGirl.querySelector('.tag-text').textContent = AVATAR_NAMES.girl;
  labelBoy.querySelector('.tag-text').textContent = AVATAR_NAMES.boy;

  function updateForeheadLabel(el, wx, wy, wz, vp) {
    const cx = vp[0] * wx + vp[4] * wy + vp[8] * wz + vp[12];
    const cy = vp[1] * wx + vp[5] * wy + vp[9] * wz + vp[13];
    const cw = vp[3] * wx + vp[7] * wy + vp[11] * wz + vp[15];
    if (cw <= 0.15) { el.style.opacity = '0'; return; }
    const sx = (cx / cw * 0.5 + 0.5) * window.innerWidth;
    const sy = (-cy / cw * 0.5 + 0.5) * window.innerHeight;
    el.style.opacity = '1';
    el.style.left = `${sx}px`;
    el.style.top = `${sy}px`;
  }

  // ---------- UI & Controls ----------
  const startModal = document.getElementById('startModal');
  const welcomeVideo = document.getElementById('welcomeVideo');
  const welcomeSoundBtn = document.getElementById('welcomeSoundBtn');
  let modalOpen = true;
  if (welcomeSoundBtn && welcomeVideo) {
    welcomeSoundBtn.addEventListener('click', () => {
      welcomeVideo.muted = !welcomeVideo.muted;
      if (!welcomeVideo.muted) welcomeVideo.play().catch(() => {});
      welcomeSoundBtn.textContent = welcomeVideo.muted ? '🔇 Unmute Piano' : '🔊 Piano ON';
    });
  }
  document.querySelectorAll('.skin-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.skin-option').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      couple.girlSkin = btn.dataset.girlSkin;
    });
  });
  document.getElementById('playWorldBtn').addEventListener('click', () => {
    startModal.classList.add('hidden');
    modalOpen = false;
    if (welcomeVideo) welcomeVideo.pause();
    bgMusic.play().catch(() => {});
    sayHinglishCompliment();
  });
  document.getElementById('openSkinBtn').addEventListener('click', () => {
    startModal.classList.remove('hidden'); modalOpen = true;
    if (welcomeVideo) welcomeVideo.play().catch(() => {});
  });

  const timeBtn = document.getElementById('timeBtn');
  function updateSkyButton() { timeBtn.textContent = SKY_MODES[skyIdx].name; }
  updateSkyButton();
  timeBtn.addEventListener('click', () => { skyIdx = (skyIdx + 1) % SKY_MODES.length; updateSkyButton(); });

  const holdHandsBtn = document.getElementById('holdHandsBtn');
  function toggleHoldHands() {
    couple.holdingHands = !couple.holdingHands;
    holdHandsBtn.textContent = couple.holdingHands ? '🤝 Holding Hands: ON' : '🤝 Hold Hands: OFF';
    holdHandsBtn.classList.toggle('active', couple.holdingHands);
    if (couple.holdingHands) sayHinglishCompliment('Haath pakad ke chalna sabse best feeling hai 🤝💛');
  }
  holdHandsBtn.addEventListener('click', toggleHoldHands);

  document.getElementById('complimentBtn').addEventListener('click', () => sayHinglishCompliment());
  document.getElementById('useBtn').addEventListener('click', doInteract);

  const soundBtn = document.getElementById('soundBtn');
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (bgMusic.paused && soundEnabled) bgMusic.play().catch(() => {});
    else if (!soundEnabled) bgMusic.pause();
    soundBtn.textContent = soundEnabled ? '🎵' : '🔇';
  });

  const keys = {};
  window.addEventListener('keydown', e => {
    if (modalOpen) return;
    keys[e.code] = true;
    if (e.code === 'KeyT') { skyIdx = (skyIdx + 1) % SKY_MODES.length; updateSkyButton(); }
    if (e.code === 'KeyH') toggleHoldHands();
    if (e.code === 'KeyC') sayHinglishCompliment();
    if (e.code === 'KeyE') doInteract();
    if (e.code === 'Space' && couple.mode) exitSpecialMode();
  });
  window.addEventListener('keyup', e => { keys[e.code] = false; });

  // 360° Drag Look + Scroll Zoom
  let dragging = false, lx = 0, ly = 0;
  canvas.addEventListener('mousedown', e => { if (!modalOpen) { dragging = true; lx = e.clientX; ly = e.clientY; } });
  window.addEventListener('mouseup', () => { dragging = false; });
  window.addEventListener('mousemove', e => {
    if (!dragging || modalOpen) return;
    camYaw += (e.clientX - lx) * 0.0065;
    camPitch = Math.max(-1.18, Math.min(0.65, camPitch - (e.clientY - ly) * 0.0055));
    lx = e.clientX; ly = e.clientY;
  });
  window.addEventListener('wheel', e => {
    if (!modalOpen) camDist = Math.max(2.2, Math.min(8.5, camDist + e.deltaY * 0.004));
  }, { passive: true });

  // Mobile touch
  document.querySelectorAll('.dpad .tbtn').forEach(btn => {
    const k = btn.dataset.key;
    btn.addEventListener('touchstart', e => { e.preventDefault(); keys[k] = true; }, { passive: false });
    btn.addEventListener('touchend', e => { e.preventDefault(); keys[k] = false; }, { passive: false });
  });
  document.getElementById('tJump').addEventListener('touchstart', e => { e.preventDefault(); keys.Space = true; }, { passive: false });
  document.getElementById('tJump').addEventListener('touchend', e => { e.preventDefault(); keys.Space = false; }, { passive: false });
  document.getElementById('tInteract').addEventListener('click', doInteract);

  let touchId = null, tlx = 0, tly = 0;
  canvas.addEventListener('touchstart', e => {
    if (modalOpen) return;
    const t = e.changedTouches[0]; touchId = t.identifier; tlx = t.clientX; tly = t.clientY;
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (t.identifier === touchId) {
        camYaw += (t.clientX - tlx) * 0.007;
        camPitch = Math.max(-1.15, Math.min(0.65, camPitch - (t.clientY - tly) * 0.006));
        tlx = t.clientX; tly = t.clientY;
      }
    }
  }, { passive: true });

  // ---------- Main Update & Render Loop ----------
  let lastT = performance.now(), lastZone = '';
  const zoneEl = document.getElementById('zoneBanner');
  const promptEl = document.getElementById('interactPrompt');
  const useBtn = document.getElementById('useBtn');

  function update(dt, now) {
    const timeSec = now * 0.001;

    if (!modalOpen) {
      if (couple.mode === 'ferris') {
        const gp = getFerrisGondolaPos(timeSec, couple.modeData || 0);
        couple.x = gp[0]; couple.y = gp[1] - 0.45; couple.z = gp[2];
      } else if (couple.mode === 'carousel') {
        const a = timeSec * 0.9;
        couple.x = CAROUSEL.cx + Math.cos(a) * CAROUSEL.r;
        couple.z = CAROUSEL.cz + Math.sin(a) * CAROUSEL.r;
        couple.y = 11.1 + Math.sin(timeSec * 2.8) * 0.28;
        couple.yaw = -a;
      } else if (!couple.mode) {
        let f = 0, s = 0;
        if (keys.KeyW || keys.ArrowUp) f += 1;
        if (keys.KeyS || keys.ArrowDown) f -= 1;
        if (keys.KeyD || keys.ArrowRight) s += 1;
        if (keys.KeyA || keys.ArrowLeft) s -= 1;

        const sin = Math.sin(camYaw), cos = Math.cos(camYaw);
        let mx = sin * f + cos * s, mz = -cos * f + sin * s;
        const ml = Math.hypot(mx, mz);
        if (ml > 0) {
          mx /= ml; mz /= ml;
          const targetYaw = Math.atan2(mx, -mz);
          let diff = targetYaw - couple.yaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          couple.yaw += diff * Math.min(1, dt * 11);
          couple.walkPhase += dt * (keys.ShiftLeft ? 12 : 8.5);
        }

        const speed = keys.ShiftLeft ? 7.4 : 4.8;
        couple.vx = mx * speed; couple.vz = mz * speed;
        couple.vy -= 22.0 * dt;
        if (keys.Space && couple.onGround) {
          couple.vy = 8.4; couple.onGround = false;
        }

        const hw = couple.holdingHands ? 0.50 : 0.28;
        const nx = Math.max(1.5, Math.min(WX - 1.5, couple.x + couple.vx * dt));
        if (!collides(nx, couple.y, couple.z, hw)) couple.x = nx;
        else if (couple.onGround && !collides(nx, couple.y + 1.05, couple.z, hw)) { couple.x = nx; couple.y += 1.02; }

        const nz = Math.max(1.5, Math.min(WZ - 1.5, couple.z + couple.vz * dt));
        if (!collides(couple.x, couple.y, nz, hw)) couple.z = nz;
        else if (couple.onGround && !collides(couple.x, couple.y + 1.05, nz, hw)) { couple.z = nz; couple.y += 1.02; }

        const ny = Math.max(1.0, Math.min(WY + 4, couple.y + couple.vy * dt));
        if (!collides(couple.x, ny, couple.z, hw)) { couple.y = ny; couple.onGround = false; }
        else { if (couple.vy < 0) couple.onGround = true; couple.vy = 0; }

        if (!couple.holdingHands) {
          const tx = couple.x - Math.sin(couple.yaw) * 1.1 + Math.cos(couple.yaw) * 0.8;
          const tz = couple.z + Math.cos(couple.yaw) * 1.1 + Math.sin(couple.yaw) * 0.8;
          boyFollower.x += (tx - boyFollower.x) * Math.min(1, dt * 4);
          boyFollower.z += (tz - boyFollower.z) * Math.min(1, dt * 4);
          boyFollower.y += (couple.y - boyFollower.y) * Math.min(1, dt * 8);
          boyFollower.yaw = couple.yaw;
        }
      }

      // Automatic gentle Hinglish compliment every ~14s while exploring
      if (now - lastAutoComp > 14000) {
        sayHinglishCompliment();
      }
    }

    for (const c of clouds) { c.x += dt * 0.85; if (c.x > 110) c.x = -18; }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    }

    const zone = W.detectPlace(couple.x, couple.z);
    if (zone !== lastZone) {
      lastZone = zone;
      zoneEl.textContent = `📍 ${zone}`;
    }

    if (couple.mode) {
      promptEl.textContent = 'Press E or Space to stand up / get off';
      promptEl.classList.remove('hidden');
      useBtn.textContent = '🚶 Stand Up (E)';
      useBtn.classList.remove('hidden');
    } else {
      const near = findNearestInteract();
      if (near) {
        promptEl.textContent = near.label;
        promptEl.classList.remove('hidden');
        useBtn.textContent = near.label.replace('Press E to ', '✨ ');
        useBtn.classList.remove('hidden');
      } else {
        promptEl.classList.add('hidden');
        useBtn.classList.add('hidden');
      }
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(window.innerWidth * dpr), h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function bindWorldBuffers(vbo) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const stride = 8 * 4;
    const pLoc = gl.getAttribLocation(worldProg, 'aPos');
    const uLoc = gl.getAttribLocation(worldProg, 'aUv');
    const sLoc = gl.getAttribLocation(worldProg, 'aShade');
    const kLoc = gl.getAttribLocation(worldProg, 'aSky');
    const bLoc = gl.getAttribLocation(worldProg, 'aBlk');
    gl.enableVertexAttribArray(pLoc); gl.vertexAttribPointer(pLoc, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(uLoc); gl.vertexAttribPointer(uLoc, 2, gl.FLOAT, false, stride, 12);
    gl.enableVertexAttribArray(sLoc); gl.vertexAttribPointer(sLoc, 1, gl.FLOAT, false, stride, 20);
    gl.enableVertexAttribArray(kLoc); gl.vertexAttribPointer(kLoc, 1, gl.FLOAT, false, stride, 24);
    gl.enableVertexAttribArray(bLoc); gl.vertexAttribPointer(bLoc, 1, gl.FLOAT, false, stride, 28);
  }

  function render(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    resize();
    update(dt, now);

    const mode = SKY_MODES[skyIdx];
    gl.clearColor(mode.sky[0], mode.sky[1], mode.sky[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const proj = mat4Perspective(64 * Math.PI / 180, canvas.width / Math.max(1, canvas.height), 0.1, 185);
    const cam = getCameraTransform();
    const view = mat4LookAt(cam.eye, cam.target);
    const vp = mat4Multiply(proj, view);

    // 1. Sky Clouds & Stars
    gl.useProgram(colorProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVbo);
    const cpLoc = gl.getAttribLocation(colorProg, 'aPos');
    const cnLoc = gl.getAttribLocation(colorProg, 'aNormal');
    gl.enableVertexAttribArray(cpLoc); gl.vertexAttribPointer(cpLoc, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(cnLoc); gl.vertexAttribPointer(cnLoc, 3, gl.FLOAT, false, 24, 12);
    gl.uniformMatrix4fv(gl.getUniformLocation(colorProg, 'uProj'), false, proj);
    gl.uniformMatrix4fv(gl.getUniformLocation(colorProg, 'uView'), false, view);
    gl.uniform3fv(gl.getUniformLocation(colorProg, 'uFogColor'), mode.sky);
    gl.uniform3fv(gl.getUniformLocation(colorProg, 'uSunLight'), mode.sun);
    gl.uniform1f(gl.getUniformLocation(colorProg, 'uSkyLevel'), mode.level);

    gl.disable(gl.CULL_FACE);
    for (const c of clouds) {
      const col = mode.stars ? [0.16, 0.20, 0.34, 0.7] : (skyIdx === 1 ? [1.0, 0.88, 0.80, 0.88] : [1.0, 1.0, 1.0, 0.9]);
      drawColoredBox(mat4TRS(c.x, c.y, c.z, 0, 0, 0, c.w, 1.1, c.d), col, 0);
    }
    if (mode.stars) {
      for (const st of stars) drawColoredBox(mat4TRS(st[0], st[1], st[2], 0, 0, 0, 0.25, 0.25, 0.25), [1.0, 0.96, 0.78, 0.95], 0);
      drawColoredBox(mat4TRS(82, 34, 88, 0, 0, 0, 4.0, 4.0, 0.5), [0.98, 0.96, 0.85, 1], 0);
    } else {
      drawColoredBox(mat4TRS(84, skyIdx === 1 ? 22 : 34, 14, 0, 0, 0, 4.2, 4.2, 0.6), [1.0, 0.93, 0.55, 1], 0);
    }

    // 2. Opaque World Chunks
    gl.useProgram(worldProg);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.disable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.uniform1i(gl.getUniformLocation(worldProg, 'uAtlas'), 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(worldProg, 'uProj'), false, proj);
    gl.uniformMatrix4fv(gl.getUniformLocation(worldProg, 'uView'), false, view);
    gl.uniform3fv(gl.getUniformLocation(worldProg, 'uSunLight'), mode.sun);
    gl.uniform1f(gl.getUniformLocation(worldProg, 'uSkyLevel'), mode.level);
    gl.uniform3fv(gl.getUniformLocation(worldProg, 'uFogColor'), mode.sky);
    gl.uniform1f(gl.getUniformLocation(worldProg, 'uAlpha'), 1.0);

    for (const c of chunks) {
      if (c.opqCnt === 0) continue;
      bindWorldBuffers(c.opqVbo);
      gl.drawArrays(gl.TRIANGLES, 0, c.opqCnt);
    }

    // 3. Dynamic Amusement Rides + Couple Holding Hands + Heart Particles
    gl.useProgram(colorProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVbo);
    gl.enableVertexAttribArray(cpLoc); gl.vertexAttribPointer(cpLoc, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(cnLoc); gl.vertexAttribPointer(cnLoc, 3, gl.FLOAT, false, 24, 12);

    drawAmusementRides(now * 0.001);

    const pose = couple.mode === 'rest' ? 'lie' : ((couple.mode === 'sit' || couple.mode === 'ferris' || couple.mode === 'carousel') ? 'sit' : 'walk');
    const rx = Math.cos(couple.yaw), rz = Math.sin(couple.yaw);
    let gx, gy, gz, gyaw, bx, by, bz, byaw;
    if (couple.holdingHands || couple.mode) {
      const sep = pose === 'lie' ? 0.36 : 0.38;
      gx = couple.x - rx * sep; gy = couple.y; gz = couple.z - rz * sep; gyaw = couple.yaw;
      bx = couple.x + rx * sep; by = couple.y; bz = couple.z + rz * sep; byaw = couple.yaw;
      drawCharacter(couple.girlSkin, gx, gy, gz, gyaw, couple.walkPhase, pose, couple.holdingHands && !couple.mode ? 'right' : null);
      drawCharacter(couple.boySkin, bx, by, bz, byaw, couple.walkPhase, pose, couple.holdingHands && !couple.mode ? 'left' : null);
      if (couple.holdingHands && !couple.mode) {
        // Warm hand-clasp bridge between both avatars!
        drawColoredBox(mat4TRS(couple.x, couple.y + 0.84, couple.z, 0, -couple.yaw, 0, 0.22, 0.14, 0.14), [0.90, 0.72, 0.60], 1);
      }
    } else {
      gx = couple.x; gy = couple.y; gz = couple.z; gyaw = couple.yaw;
      bx = boyFollower.x; by = boyFollower.y; bz = boyFollower.z; byaw = boyFollower.yaw;
      drawCharacter(couple.girlSkin, gx, gy, gz, gyaw, couple.walkPhase, 'walk', null);
      drawCharacter(couple.boySkin, bx, by, bz, byaw, couple.walkPhase * 0.9, 'walk', null);
    }

    for (const p of particles) {
      drawColoredBox(mat4TRS(p.x, p.y, p.z, now * 0.004, now * 0.005, 0, p.size, p.size, p.size), [...p.color, 1], 0.2);
    }

    // 4. Translucent World Chunks (Water & Glass)
    gl.useProgram(worldProg);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.uniform1f(gl.getUniformLocation(worldProg, 'uAlpha'), 0.82);
    for (const c of chunks) {
      if (c.trnCnt === 0) continue;
      bindWorldBuffers(c.trnVbo);
      gl.drawArrays(gl.TRIANGLES, 0, c.trnCnt);
    }
    gl.depthMask(true);
    gl.disable(gl.BLEND);

    // 5. Update Forehead Pointer Name Tags & Top-Right Mini-Map
    const labelYOff = pose === 'lie' ? 0.85 : (pose === 'sit' ? 1.72 : 2.08);
    updateForeheadLabel(labelGirl, gx, gy + labelYOff, gz, vp);
    updateForeheadLabel(labelBoy, bx, by + labelYOff, bz, vp);
    renderMiniMap();

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
