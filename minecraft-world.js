// ============================================================
// Cozy Minecraft Date World Builder & Mesher
// Includes: Amusement Park, Date Restaurant, Cozy House (Beds),
// Date Night Gazebo, Snowy Fireplace Cabin, Garden Swing
// ============================================================
(function (global) {
  const WX = 96, WY = 40, WZ = 96, CHUNK = 16;
  const GROUND_Y = 8;

  const B = {
    AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, COBBLE: 4, MOSSY_COBBLE: 5,
    SAND: 6, WATER: 7, OAK_LOG: 8, OAK_PLANKS: 9, SPRUCE_PLANKS: 10,
    DARK_OAK: 11, LEAVES: 12, FLOWER_LEAVES: 13, GLASS: 14, LANTERN: 15,
    FIRE: 16, BOOKSHELF: 17, CRAFTING: 18, FURNACE: 19, CHEST: 20,
    QUARTZ: 21, TERRACOTTA: 22, ROOF_CYAN: 23, ROOF_PINK: 24, ROOF_LAVENDER: 25,
    ROOF_YELLOW: 26, WHITE_WOOL: 27, BED_RED: 28, BED_GREEN: 29, MOSS_CARPET: 30,
    STOOL_MOSS: 31, FENCE: 32, CHAIN: 33, VINE_GLOW: 34, FLOWER_RED: 35,
    FLOWER_YELLOW: 36, SNOW_GRASS: 37, CAKE: 38, STONE_BRICK: 39, TABLE_OAK: 40
  };

  const T = {
    GRASS_TOP: 0, GRASS_SIDE: 1, DIRT: 2, STONE: 3, COBBLE: 4, MOSSY_COBBLE: 5,
    SAND: 6, WATER: 7, OAK_LOG_SIDE: 8, OAK_LOG_TOP: 9, OAK_PLANKS: 10, SPRUCE_PLANKS: 11,
    DARK_OAK: 12, LEAVES: 13, FLOWER_LEAVES: 14, GLASS: 15, LANTERN: 16, FIRE: 17,
    BOOKSHELF: 18, CRAFTING_TOP: 19, CRAFTING_SIDE: 20, FURNACE: 21, CHEST: 22, QUARTZ: 23,
    TERRACOTTA: 24, ROOF_CYAN: 25, ROOF_PINK: 26, ROOF_LAVENDER: 27, ROOF_YELLOW: 28,
    WHITE_WOOL: 29, BED_RED: 30, BED_GREEN: 31, MOSS_CARPET: 32, CHAIN: 33, VINE_GLOW: 34,
    FLOWER_RED: 35, FLOWER_YELLOW: 36, SNOW_TOP: 37, SNOW_SIDE: 38, CAKE_TOP: 39,
    CAKE_SIDE: 40, STONE_BRICK: 41, SPRUCE_LOG: 42
  };

  const PROPS = {};
  function def(id, name, shape, opaque, solid, light, tiles) {
    const t = Array.isArray(tiles) ? tiles : [tiles, tiles, tiles];
    PROPS[id] = { id, name, shape, opaque, solid, light, tiles: t };
  }

  def(B.AIR, 'Air', 'none', false, false, 0, 0);
  def(B.GRASS, 'Grass', 'cube', true, true, 0, [T.GRASS_TOP, T.GRASS_SIDE, T.DIRT]);
  def(B.DIRT, 'Dirt', 'cube', true, true, 0, T.DIRT);
  def(B.STONE, 'Stone', 'cube', true, true, 0, T.STONE);
  def(B.COBBLE, 'Cobblestone', 'cube', true, true, 0, T.COBBLE);
  def(B.MOSSY_COBBLE, 'Mossy Stone', 'cube', true, true, 0, T.MOSSY_COBBLE);
  def(B.SAND, 'Sand', 'cube', true, true, 0, T.SAND);
  def(B.WATER, 'Water', 'water', false, false, 0, T.WATER);
  def(B.OAK_LOG, 'Oak Log', 'cube', true, true, 0, [T.OAK_LOG_TOP, T.OAK_LOG_SIDE, T.OAK_LOG_TOP]);
  def(B.OAK_PLANKS, 'Oak Planks', 'cube', true, true, 0, T.OAK_PLANKS);
  def(B.SPRUCE_PLANKS, 'Spruce Wood', 'cube', true, true, 0, T.SPRUCE_PLANKS);
  def(B.DARK_OAK, 'Dark Oak', 'cube', true, true, 0, T.DARK_OAK);
  def(B.LEAVES, 'Oak Leaves', 'cube', true, true, 0, T.LEAVES);
  def(B.FLOWER_LEAVES, 'Blossom Leaves', 'cube', true, true, 0, T.FLOWER_LEAVES);
  def(B.GLASS, 'Glass Window', 'glass', false, true, 0, T.GLASS);
  def(B.LANTERN, 'Warm Lantern', 'lantern', false, false, 15, T.LANTERN);
  def(B.FIRE, 'Cozy Fire', 'cross', false, false, 15, T.FIRE);
  def(B.BOOKSHELF, 'Bookshelf', 'cube', true, true, 0, [T.OAK_PLANKS, T.BOOKSHELF, T.OAK_PLANKS]);
  def(B.CRAFTING, 'Crafting Table', 'cube', true, true, 0, [T.CRAFTING_TOP, T.CRAFTING_SIDE, T.OAK_PLANKS]);
  def(B.FURNACE, 'Stone Furnace', 'cube', true, true, 6, [T.STONE, T.FURNACE, T.STONE]);
  def(B.CHEST, 'Chest', 'cube', true, true, 0, [T.OAK_PLANKS, T.CHEST, T.OAK_PLANKS]);
  def(B.QUARTZ, 'Marble Quartz', 'cube', true, true, 0, T.QUARTZ);
  def(B.TERRACOTTA, 'Villa Plaster', 'cube', true, true, 0, T.TERRACOTTA);
  def(B.ROOF_CYAN, 'Pastel Cyan', 'cube', true, true, 0, T.ROOF_CYAN);
  def(B.ROOF_PINK, 'Pastel Pink', 'cube', true, true, 0, T.ROOF_PINK);
  def(B.ROOF_LAVENDER, 'Lavender', 'cube', true, true, 0, T.ROOF_LAVENDER);
  def(B.ROOF_YELLOW, 'Sunny Yellow', 'cube', true, true, 0, T.ROOF_YELLOW);
  def(B.WHITE_WOOL, 'Fluffy Rug', 'cube', true, true, 0, T.WHITE_WOOL);
  def(B.BED_RED, 'Cozy Red Bed', 'slab', false, true, 0, [T.BED_RED, T.OAK_PLANKS, T.OAK_PLANKS]);
  def(B.BED_GREEN, 'Garden Swing Bed', 'slab', false, true, 0, [T.BED_GREEN, T.OAK_PLANKS, T.OAK_PLANKS]);
  def(B.MOSS_CARPET, 'Moss Block', 'cube', true, true, 0, T.MOSS_CARPET);
  def(B.STOOL_MOSS, 'Moss Stool', 'slab', false, true, 0, [T.MOSS_CARPET, T.OAK_PLANKS, T.OAK_PLANKS]);
  def(B.FENCE, 'Oak Post', 'post', false, true, 0, T.OAK_PLANKS);
  def(B.CHAIN, 'Iron Chain', 'thin', false, false, 0, T.CHAIN);
  def(B.VINE_GLOW, 'Glow Vines', 'cross', false, false, 11, T.VINE_GLOW);
  def(B.FLOWER_RED, 'Red Tulip', 'cross', false, false, 0, T.FLOWER_RED);
  def(B.FLOWER_YELLOW, 'Sunflower', 'cross', false, false, 0, T.FLOWER_YELLOW);
  def(B.SNOW_GRASS, 'Snowy Turf', 'cube', true, true, 0, [T.SNOW_TOP, T.SNOW_SIDE, T.DIRT]);
  def(B.CAKE, 'Date Cake', 'cake', false, true, 0, [T.CAKE_TOP, T.CAKE_SIDE, T.OAK_PLANKS]);
  def(B.STONE_BRICK, 'Stone Bricks', 'cube', true, true, 0, T.STONE_BRICK);
  def(B.TABLE_OAK, 'Oak Table', 'slab', false, true, 0, [T.OAK_PLANKS, T.SPRUCE_PLANKS, T.SPRUCE_PLANKS]);

  function hash(x, y, z) {
    let n = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967295;
  }

  const ATLAS_CELLS = 8;
  const TILE_PX = 16;
  function buildTextureAtlas() {
    const canvas = document.createElement('canvas');
    canvas.width = ATLAS_CELLS * TILE_PX;
    canvas.height = ATLAS_CELLS * TILE_PX;
    const ctx = canvas.getContext('2d');

    function paintTile(tileIdx, fn) {
      const tx = (tileIdx % ATLAS_CELLS) * TILE_PX;
      const ty = Math.floor(tileIdx / ATLAS_CELLS) * TILE_PX;
      for (let py = 0; py < TILE_PX; py++) {
        for (let px = 0; px < TILE_PX; px++) {
          ctx.fillStyle = fn(px, py, hash(tileIdx, px, py));
          ctx.fillRect(tx + px, ty + py, 1, 1);
        }
      }
    }
    function shade(hex, delta) {
      const n = parseInt(hex.slice(1), 16);
      const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + delta));
      const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + delta));
      const b = Math.max(0, Math.min(255, (n & 255) + delta));
      return `rgb(${r},${g},${b})`;
    }
    const noiseHex = (base, range) => (px, py, r) => shade(base, Math.round((r - 0.5) * range));

    paintTile(T.GRASS_TOP, noiseHex('#63b043', 32));
    paintTile(T.DIRT, noiseHex('#8b5b34', 28));
    paintTile(T.GRASS_SIDE, (px, py, r) => py < 3 + ((px * 7) % 3) ? shade('#63b043', (r - 0.5) * 28) : shade('#8b5b34', (r - 0.5) * 26));
    paintTile(T.SNOW_TOP, noiseHex('#f2f7ff', 14));
    paintTile(T.SNOW_SIDE, (px, py, r) => py < 4 + ((px * 5) % 2) ? shade('#f2f7ff', (r - 0.5) * 12) : shade('#8b5b34', (r - 0.5) * 26));
    paintTile(T.STONE, noiseHex('#878d96', 24));
    paintTile(T.COBBLE, (px, py, r) => ((px % 5 === 0) || (py % 4 === 0)) ? '#5e636b' : shade('#848a92', (r - 0.5) * 28));
    paintTile(T.MOSSY_COBBLE, (px, py, r) => ((px + py * 3) % 7 < 2) ? shade('#5a8f43', (r - 0.5) * 24) : ((px % 5 === 0 || py % 4 === 0) ? '#5a6068' : shade('#818790', (r - 0.5) * 24)));
    paintTile(T.STONE_BRICK, (px, py, r) => (py === 0 || py === 8 || (px === 0 && py < 8) || (px === 8 && py >= 8)) ? '#585d66' : shade('#868c96', (r - 0.5) * 20));
    paintTile(T.SAND, noiseHex('#e9d9a4', 20));
    paintTile(T.WATER, (px, py) => ((px + py) % 6 === 0) ? '#5bb6f2' : '#3690d8');
    paintTile(T.OAK_LOG_SIDE, (px, py, r) => (px % 4 === 1) ? '#4f351e' : shade('#6b4b2d', (r - 0.5) * 18));
    paintTile(T.OAK_LOG_TOP, (px, py) => {
      const d = Math.max(Math.abs(px - 7.5), Math.abs(py - 7.5));
      if (d > 6) return '#5c3f24';
      return d % 2 < 1 ? '#b88f59' : '#9c7444';
    });
    paintTile(T.OAK_PLANKS, (px, py, r) => (py % 4 === 0 || ((px === 0 && py < 8) || (px === 8 && py >= 8))) ? '#8c6334' : shade('#c79658', (r - 0.5) * 18));
    paintTile(T.SPRUCE_PLANKS, (px, py, r) => (py % 4 === 0) ? '#4f331c' : shade('#7a5130', (r - 0.5) * 16));
    paintTile(T.DARK_OAK, (px, py, r) => (py % 4 === 0) ? '#311f12' : shade('#4f331e', (r - 0.5) * 14));
    paintTile(T.LEAVES, (px, py, r) => r < 0.16 ? '#2d5c24' : shade('#4b8f39', (r - 0.5) * 34));
    paintTile(T.FLOWER_LEAVES, (px, py, r) => r < 0.14 ? '#f29bc0' : (r < 0.22 ? '#f7eaf1' : shade('#559642', (r - 0.5) * 30)));
    paintTile(T.GLASS, (px, py) => (px === 0 || px === 15 || py === 0 || py === 15) ? '#99d1ed' : ((px + py === 8 || px + py === 9) && px < 7 ? 'rgba(255,255,255,0.65)' : 'rgba(195,236,255,0.28)'));
    paintTile(T.LANTERN, (px, py) => {
      if (py <= 1 || py >= 14 || px <= 2 || px >= 13) return '#2d333b';
      if (px === 3 || px === 12 || py === 2 || py === 13) return '#3b424d';
      return (px >= 5 && px <= 10 && py >= 5 && py <= 10) ? '#fff5b8' : '#ffb938';
    });
    paintTile(T.FIRE, (px, py, r) => {
      const dx = Math.abs(px - 7.5);
      if (py < 3 || dx > (16 - py) * 0.62) return 'rgba(0,0,0,0)';
      if (py > 11 && dx < 3.5) return '#fff8b3';
      return r > 0.4 ? '#ff8b1f' : '#ff5514';
    });
    paintTile(T.BOOKSHELF, (px, py, r) => {
      if (py <= 1 || py >= 14 || py === 7 || py === 8) return shade('#b88549', (r - 0.5) * 14);
      const cols = ['#d64545', '#4287f5', '#f0b840', '#50b86c', '#9c5ad4', '#e3774b'];
      return (px % 3 === 0) ? '#362314' : cols[(Math.floor(px / 3) + (py > 8 ? 3 : 0)) % cols.length];
    });
    paintTile(T.CRAFTING_TOP, (px, py, r) => (px % 5 === 0 || py % 5 === 0) ? '#5e3d1e' : shade('#b8844c', (r - 0.5) * 16));
    paintTile(T.CRAFTING_SIDE, (px, py) => py < 3 ? '#966534' : ((px >= 4 && px <= 11 && py >= 5 && py <= 11) ? '#6e7680' : '#b8844c'));
    paintTile(T.FURNACE, (px, py, r) => (px >= 4 && px <= 11 && py >= 9 && py <= 13) ? (py > 10 ? '#ff9929' : '#282c33') : shade('#7b8088', (r - 0.5) * 20));
    paintTile(T.CHEST, (px, py) => (px === 0 || px === 15 || py === 0 || py === 15 || py === 6) ? '#6b451a' : ((px >= 7 && px <= 8 && py >= 5 && py <= 8) ? '#e8e8ec' : '#c28836'));
    paintTile(T.QUARTZ, noiseHex('#f2eee6', 10));
    paintTile(T.TERRACOTTA, noiseHex('#f0dfcc', 14));
    paintTile(T.ROOF_CYAN, noiseHex('#80d9e0', 18));
    paintTile(T.ROOF_PINK, noiseHex('#f2a5bf', 18));
    paintTile(T.ROOF_LAVENDER, noiseHex('#bfa2eb', 18));
    paintTile(T.ROOF_YELLOW, noiseHex('#f5d569', 18));
    paintTile(T.WHITE_WOOL, noiseHex('#f7f5ef', 12));
    paintTile(T.BED_RED, (px, py, r) => px < 4 ? shade('#f8f8fa', (r - 0.5) * 10) : (((Math.floor(px / 2) + Math.floor(py / 2)) % 2 === 0) ? '#d94848' : '#f2dede'));
    paintTile(T.BED_GREEN, (px, py, r) => px < 4 ? shade('#f8f8fa', (r - 0.5) * 10) : (px < 7 ? '#d94b4b' : shade('#4f9449', (r - 0.5) * 18)));
    paintTile(T.MOSS_CARPET, noiseHex('#66a840', 26));
    paintTile(T.CHAIN, (px, py) => (px >= 6 && px <= 9 && (py % 4 !== 0 || px === 7 || px === 8)) ? '#48505a' : 'rgba(0,0,0,0)');
    paintTile(T.VINE_GLOW, (px, py) => {
      if (px === 7 || px === 8 || ((px === 5 || px === 10) && py % 3 === 1)) {
        return (py === 12 && (px === 7 || px === 8)) || (py === 6 && px === 5) ? '#ffe86b' : '#589c3b';
      }
      return 'rgba(0,0,0,0)';
    });
    paintTile(T.FLOWER_RED, (px, py) => {
      if (py >= 7 && (px === 7 || px === 8)) return '#428734';
      if (py >= 10 && (px === 5 || px === 10)) return '#428734';
      if (py >= 2 && py <= 6 && px >= 5 && px <= 10) return (py === 2 && (px === 6 || px === 9)) ? '#ff7085' : '#e63950';
      return 'rgba(0,0,0,0)';
    });
    paintTile(T.FLOWER_YELLOW, (px, py) => {
      if (py >= 8 && (px === 7 || px === 8)) return '#428734';
      const d = Math.hypot(px - 7.5, py - 5);
      if (d < 2.1) return '#59371b';
      if (d < 4.5) return '#ffd22e';
      return 'rgba(0,0,0,0)';
    });
    paintTile(T.CAKE_TOP, (px, py) => ((px === 4 && py === 5) || (px === 10 && py === 4) || (px === 7 && py === 10) || (px === 11 && py === 11)) ? '#e63950' : '#fff7eb');
    paintTile(T.CAKE_SIDE, (px, py) => py < 6 ? '#fff7eb' : (py === 6 ? '#e63950' : '#d6995c'));

    return canvas;
  }

  const atlasCanvas = buildTextureAtlas();

  const data = new Uint8Array(WX * WY * WZ);
  const skyLight = new Uint8Array(WX * WY * WZ);
  const blockLight = new Uint8Array(WX * WY * WZ);
  const idx = (x, y, z) => (y * WZ + z) * WX + x;
  const inBounds = (x, y, z) => x >= 0 && x < WX && y >= 0 && y < WY && z >= 0 && z < WZ;

  function getBlock(x, y, z) { return inBounds(x, y, z) ? data[idx(x, y, z)] : B.AIR; }
  function setBlock(x, y, z, id) { if (inBounds(x, y, z)) data[idx(x, y, z)] = id; }
  function fill(x1, y1, z1, x2, y2, z2, id) {
    for (let y = y1; y <= y2; y++)
      for (let z = z1; z <= z2; z++)
        for (let x = x1; x <= x2; x++) setBlock(x, y, z, id);
  }
  function hollowBox(x1, y1, z1, x2, y2, z2, wall, floor, roof) {
    for (let y = y1; y <= y2; y++) {
      for (let z = z1; z <= z2; z++) {
        for (let x = x1; x <= x2; x++) {
          if (y === y1 && floor !== undefined) setBlock(x, y, z, floor);
          else if (y === y2 && roof !== undefined) setBlock(x, y, z, roof);
          else if (x === x1 || x === x2 || z === z1 || z === z2) setBlock(x, y, z, wall);
          else setBlock(x, y, z, B.AIR);
        }
      }
    }
  }

  const interactables = [];
  function addInteract(x, y, z, type, label, extra) {
    interactables.push({ x, y, z, type, label, ...extra });
  }

  function buildTree(tx, ty, tz, height, leafBlock) {
    for (let y = 0; y < height; y++) setBlock(tx, ty + y, tz, B.OAK_LOG);
    const top = ty + height;
    for (let dy = -2; dy <= 1; dy++) {
      const r = dy === 1 ? 1 : 2;
      for (let dz = -r; dz <= r; dz++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) === r && Math.abs(dz) === r && dy !== -1) continue;
          if (dx === 0 && dz === 0 && dy < 0) continue;
          if (getBlock(tx + dx, top + dy, tz + dz) === B.AIR) setBlock(tx + dx, top + dy, tz + dz, leafBlock || B.LEAVES);
        }
      }
    }
  }

  function buildWorld() {
    data.fill(B.AIR);
    interactables.length = 0;

    // 1. Base terrain (y=0..8)
    fill(0, 0, 0, WX - 1, 4, WZ - 1, B.STONE);
    fill(0, 5, 0, WX - 1, 7, WZ - 1, B.DIRT);
    for (let z = 0; z < WZ; z++) {
      for (let x = 0; x < WX; x++) {
        const isSnow = x <= 34 && z >= 62;
        setBlock(x, GROUND_Y, z, isSnow ? B.SNOW_GRASS : B.GRASS);
      }
    }

    // 2. Central Flower Spawn Plaza (x:41..55, z:41..55)
    for (let z = 41; z <= 55; z++) {
      for (let x = 41; x <= 55; x++) {
        if (Math.hypot(x - 48, z - 48) <= 7.2) {
          setBlock(x, GROUND_Y, z, (x + z) % 3 === 0 ? B.MOSSY_COBBLE : B.COBBLE);
        }
      }
    }
    for (const [lx, lz] of [[43, 43], [53, 43], [43, 53], [53, 53]]) {
      setBlock(lx, 9, lz, B.FENCE); setBlock(lx, 10, lz, B.FENCE); setBlock(lx, 11, lz, B.LANTERN);
    }
    for (const [fx, fz] of [[45, 45], [51, 45], [45, 51], [51, 51], [48, 43], [43, 48], [53, 48]]) {
      setBlock(fx, 9, fz, (fx + fz) % 2 === 0 ? B.FLOWER_YELLOW : B.FLOWER_RED);
    }

    // Wide cobblestone walkways connecting every zone
    fill(46, GROUND_Y, 34, 50, GROUND_Y, 41, B.COBBLE); // North -> Amusement Park
    fill(32, GROUND_Y, 46, 41, GROUND_Y, 50, B.COBBLE); // West -> Date Restaurant
    fill(55, GROUND_Y, 46, 65, GROUND_Y, 50, B.COBBLE); // East -> Cozy House
    fill(46, GROUND_Y, 55, 50, GROUND_Y, 68, B.COBBLE); // South -> Date Gazebo
    fill(28, GROUND_Y, 61, 46, GROUND_Y, 63, B.COBBLE);
    fill(22, GROUND_Y, 63, 25, GROUND_Y, 68, B.COBBLE);
    fill(50, GROUND_Y, 61, 74, GROUND_Y, 63, B.COBBLE);
    fill(72, GROUND_Y, 63, 75, GROUND_Y, 68, B.COBBLE);

    // 3. NORTH: AMUSEMENT PARK (x: 24..72, z: 5..35)
    for (let z = 6; z <= 34; z++) {
      for (let x = 25; x <= 71; x++) {
        const pal = [B.QUARTZ, B.COBBLE, B.ROOF_PINK, B.ROOF_CYAN];
        const border = (x === 25 || x === 71 || z === 6 || z === 34);
        setBlock(x, GROUND_Y, z, border ? B.STONE_BRICK : ((x + z) % 7 === 0 ? pal[(x + z) % 4] : B.COBBLE));
      }
    }
    // Amusement Park Entrance Arch
    fill(44, 9, 34, 44, 14, 34, B.ROOF_PINK);
    fill(52, 9, 34, 52, 14, 34, B.ROOF_PINK);
    fill(44, 15, 34, 52, 15, 34, B.ROOF_YELLOW);
    fill(46, 16, 34, 50, 16, 34, B.ROOF_PINK);
    setBlock(44, 16, 34, B.LANTERN); setBlock(52, 16, 34, B.LANTERN);
    setBlock(48, 17, 34, B.LANTERN);

    // Ferris Wheel Support A-Frames & Boarding Platform (center at x=48.5, y=21, z=14)
    fill(44, 9, 17, 53, 9, 20, B.OAK_PLANKS);
    for (let x = 44; x <= 53; x++) { if (x < 47 || x > 50) setBlock(x, 10, 20, B.FENCE); }
    setBlock(44, 11, 20, B.LANTERN); setBlock(53, 11, 20, B.LANTERN);
    for (let y = 9; y <= 21; y++) {
      const dx = Math.round((21 - y) * 0.25);
      setBlock(44, y, 14 - dx, B.STONE_BRICK);
      setBlock(44, y, 14 + dx, B.STONE_BRICK);
      setBlock(53, y, 14 - dx, B.STONE_BRICK);
      setBlock(53, y, 14 + dx, B.STONE_BRICK);
    }
    fill(44, 21, 14, 53, 21, 14, B.DARK_OAK);
    addInteract(48, 10, 18, 'ferris', 'Press E to Ride the Ferris Wheel together 🎡', {});

    // Carousel Platform (West side: center x=32, z=20)
    for (let dz = -5; dz <= 5; dz++) {
      for (let dx = -5; dx <= 5; dx++) {
        if (dx * dx + dz * dz <= 26) {
          setBlock(32 + dx, 9, 20 + dz, (Math.abs(dx) + Math.abs(dz)) % 2 === 0 ? B.ROOF_LAVENDER : B.QUARTZ);
        }
      }
    }
    for (let y = 10; y <= 15; y++) setBlock(32, y, 20, B.ROOF_YELLOW);
    setBlock(32, 16, 20, B.LANTERN);
    addInteract(32, 10, 24, 'carousel', 'Press E to Ride the Carousel together 🎠', {});

    // Cotton Candy & Cake Stall (East side: x: 61..68, z: 18..24)
    fill(62, 9, 19, 67, 9, 23, B.OAK_PLANKS);
    for (const [cx, cz] of [[62, 19], [67, 19], [62, 23], [67, 23]]) fill(cx, 10, cz, cx, 13, cz, B.FENCE);
    for (let x = 61; x <= 68; x++) {
      for (let z = 18; z <= 24; z++) setBlock(x, 14, z, (x + z) % 2 === 0 ? B.ROOF_PINK : B.WHITE_WOOL);
    }
    fill(62, 10, 21, 62, 10, 22, B.TABLE_OAK);
    setBlock(62, 11, 21, B.CAKE); setBlock(62, 11, 22, B.LANTERN);
    addInteract(62, 11, 21, 'eat', 'Press E to enjoy Carnival Cake together 🍭', { msg: 'Carnival sweets! Yeh cake toh sweet hai par tumse zyada nahi 🍭💛' });

    for (const [px, pz] of [[28, 10], [28, 30], [68, 10], [68, 30], [42, 28], [55, 28]]) {
      setBlock(px, 9, pz, B.FENCE); setBlock(px, 10, pz, B.FENCE); setBlock(px, 11, pz, B.LANTERN);
      setBlock(px + 1, 9, pz, B.FLOWER_RED); setBlock(px - 1, 9, pz, B.FLOWER_YELLOW);
    }

    // 4. WEST: DATE RESTAURANT & MOSS KITCHEN (x: 2..34, z: 36..58)
    for (let z = 34; z <= 60; z++) {
      for (let x = 2; x <= 7; x++) {
        const h = 16 + Math.floor(hash(x, 1, z) * 7) - Math.max(0, x - 3) * 2;
        for (let y = 9; y <= h; y++) setBlock(x, y, z, (x + y + z) % 4 === 0 ? B.MOSSY_COBBLE : B.STONE);
        setBlock(x, h + 1, z, B.LEAVES);
        if (x === 7 && z % 3 === 0) for (let vy = h - 4; vy <= h; vy++) setBlock(8, vy, z, B.VINE_GLOW);
      }
    }
    hollowBox(10, 8, 38, 29, 16, 56, B.STONE_BRICK, B.MOSS_CARPET, B.OAK_PLANKS);
    for (let z = 39; z <= 55; z++) {
      for (let x = 11; x <= 28; x++) {
        setBlock(x, 8, z, ((Math.floor(x / 2) + Math.floor(z / 2)) % 2 === 0) ? B.QUARTZ : B.MOSS_CARPET);
      }
    }
    fill(10, 13, 38, 29, 15, 38, B.TERRACOTTA);
    fill(10, 13, 56, 29, 15, 56, B.TERRACOTTA);
    fill(29, 13, 38, 29, 15, 56, B.TERRACOTTA);
    for (let step = 0; step < 5; step++) fill(9 + step, 17 + step, 37 + step, 30 - step, 17 + step, 57 - step, B.ROOF_PINK);
    fill(29, 9, 46, 29, 12, 49, B.AIR);
    fill(30, 8, 40, 33, 8, 54, B.MOSSY_COBBLE);
    setBlock(31, 9, 42, B.TABLE_OAK); setBlock(31, 10, 42, B.FLOWER_RED);
    setBlock(31, 9, 52, B.TABLE_OAK); setBlock(31, 10, 52, B.CAKE);
    fill(29, 10, 40, 29, 12, 43, B.GLASS); fill(29, 10, 51, 29, 12, 54, B.GLASS);
    fill(15, 10, 38, 23, 12, 38, B.GLASS); fill(15, 10, 56, 23, 12, 56, B.GLASS);
    fill(18, 9, 43, 20, 9, 51, B.QUARTZ);
    setBlock(19, 10, 45, B.CAKE); setBlock(19, 10, 49, B.CAKE); setBlock(19, 10, 47, B.FLOWER_YELLOW);
    addInteract(19, 10, 45, 'eat', 'Press E to share Date Night Cake 🍰', { msg: 'Special Date Cake! Tumhare saath har bite magic lagti hai 🍰💛' });
    addInteract(19, 10, 49, 'eat', 'Press E to share Date Night Cake 🍰', { msg: 'Aaj ka dinner date ekdum dreamy hai na? 💛✨' });
    for (let sz = 43; sz <= 51; sz += 2) {
      setBlock(22, 9, sz, B.STOOL_MOSS);
      addInteract(22, 9, sz, 'sit', 'Press E to sit together at the Restaurant Bar 🍽️', { sitY: 9.65, faceYaw: -Math.PI / 2 });
    }
    for (let lz = 44; lz <= 50; lz += 3) {
      setBlock(19, 15, lz, B.CHAIN); setBlock(19, 14, lz, B.CHAIN); setBlock(19, 13, lz, B.LANTERN);
    }
    fill(11, 9, 42, 12, 10, 45, B.FURNACE);
    fill(11, 9, 47, 12, 10, 52, B.CHEST);
    setBlock(11, 11, 43, B.LANTERN); setBlock(11, 11, 50, B.LANTERN);

    // 5. EAST: COZY HOUSE TO REST ON BED (x: 65..86, z: 38..56)
    hollowBox(65, 8, 38, 86, 20, 56, B.OAK_PLANKS, B.SPRUCE_PLANKS, B.DARK_OAK);
    for (let z = 38; z <= 56; z++) {
      for (let x = 65; x <= 86; x++) {
        if (x === 65 || x === 86 || z === 38 || z === 56) setBlock(x, 9, z, B.MOSSY_COBBLE);
      }
    }
    for (const cx of [65, 86]) for (const cz of [38, 56]) fill(cx, 9, cz, cx, 20, cz, B.OAK_LOG);
    for (let step = 0; step <= 4; step++) fill(64 + step, 21 + step, 37, 87 - step, 21 + step, 57, B.SPRUCE_PLANKS);
    fill(65, 9, 45, 65, 12, 48, B.AIR);
    fill(65, 10, 40, 65, 12, 43, B.GLASS); fill(65, 10, 51, 65, 12, 54, B.GLASS);
    fill(70, 10, 38, 76, 12, 38, B.GLASS); fill(70, 15, 56, 78, 17, 56, B.GLASS);
    fill(74, 14, 39, 85, 14, 55, B.OAK_PLANKS);
    for (let s = 0; s < 6; s++) fill(69 + s, 9, 40, 69 + s, 9 + s, 42, B.OAK_PLANKS);
    for (let z = 43; z <= 55; z++) setBlock(74, 15, z, B.FENCE);
    setBlock(74, 16, 44, B.LANTERN); setBlock(74, 16, 53, B.LANTERN);
    for (const [vx, vz, len] of [[68, 45, 5], [70, 52, 6], [72, 48, 5], [67, 51, 4]]) {
      for (let vy = 19; vy >= 19 - len; vy--) setBlock(vx, vy, vz, B.VINE_GLOW);
    }
    // Ground-floor Cozy Double Bed
    fill(75, 9, 50, 79, 9, 53, B.WHITE_WOOL);
    fill(76, 9, 51, 78, 9, 52, B.BED_RED);
    setBlock(75, 9, 51, B.TABLE_OAK); setBlock(75, 10, 51, B.LANTERN);
    addInteract(77, 9, 51, 'rest', 'Press E to Rest on the Bed together 🛏️💛', { bedX: 77.2, bedY: 9.65, bedZ: 51.8, faceYaw: 0 });
    // Crafting + Loft Bed
    setBlock(83, 9, 53, B.CRAFTING); setBlock(84, 9, 53, B.FURNACE); setBlock(82, 9, 53, B.CHEST);
    setBlock(82, 15, 48, B.BED_RED); setBlock(83, 15, 48, B.BED_RED);
    setBlock(82, 15, 49, B.BED_RED); setBlock(83, 15, 49, B.BED_RED);
    addInteract(82, 15, 48, 'rest', 'Press E to Rest on the Loft Bed together 🛏️💛', { bedX: 82.8, bedY: 15.65, bedZ: 48.8, faceYaw: Math.PI });
    fill(84, 15, 41, 84, 17, 43, B.BOOKSHELF);
    setBlock(84, 15, 52, B.TABLE_OAK); setBlock(84, 16, 52, B.LANTERN);

    // 6. SOUTH-WEST: SNOWY WINTER FIREPLACE CABIN
    for (const [px, pz, ph] of [[5, 72, 6], [6, 82, 7], [15, 90, 6], [26, 91, 5], [7, 65, 5]]) {
      for (let y = 9; y < 9 + ph; y++) setBlock(px, y, pz, B.OAK_LOG);
      for (let dy = 0; dy <= 3; dy++) {
        const r = Math.max(1, 3 - Math.floor(dy * 0.7));
        for (let dz = -r; dz <= r; dz++)
          for (let dx = -r; dx <= r; dx++)
            if (Math.abs(dx) + Math.abs(dz) <= r + 1)
              setBlock(px + dx, 9 + ph - 2 + dy, pz + dz, dy === 3 ? B.SNOW_GRASS : B.LEAVES);
      }
      setBlock(px, 9 + ph + 2, pz, B.SNOW_GRASS);
    }
    hollowBox(11, 8, 68, 30, 17, 86, B.OAK_PLANKS, B.SPRUCE_PLANKS, B.DARK_OAK);
    for (let step = 0; step <= 4; step++) fill(10 + step, 18 + step, 67, 31 - step, 18 + step, 87, B.SNOW_GRASS);
    fill(22, 9, 68, 24, 12, 68, B.AIR);
    fill(11, 10, 71, 11, 15, 83, B.GLASS); fill(14, 10, 86, 26, 15, 86, B.GLASS);
    fill(27, 9, 75, 29, 19, 79, B.COBBLE); fill(27, 9, 76, 28, 11, 78, B.AIR);
    setBlock(27, 9, 77, B.FIRE); setBlock(28, 9, 77, B.FIRE);
    fill(18, 9, 75, 23, 9, 79, B.WHITE_WOOL);
    setBlock(21, 10, 77, B.TABLE_OAK); setBlock(21, 11, 77, B.LANTERN);
    setBlock(17, 10, 76, B.OAK_PLANKS); setBlock(17, 10, 78, B.OAK_PLANKS);
    addInteract(17, 10, 76, 'sit', 'Press E to sit by the Fireplace 🔥', { sitY: 10.65, faceYaw: Math.PI / 2 });
    addInteract(17, 10, 78, 'sit', 'Press E to sit by the Fireplace 🔥', { sitY: 10.65, faceYaw: Math.PI / 2 });

    // 7. SOUTH-EAST: HANGING GARDEN SWING BED & CAMPFIRE
    fill(67, GROUND_Y, 68, 86, GROUND_Y, 86, B.MOSS_CARPET);
    fill(70, 9, 71, 71, 18, 72, B.OAK_LOG);
    fill(71, 17, 75, 81, 17, 75, B.OAK_LOG);
    for (let dz = -7; dz <= 7; dz++) {
      for (let dx = -7; dx <= 8; dx++) {
        if (dx * dx + dz * dz <= 58) {
          setBlock(76 + dx, 18, 75 + dz, (dx + dz) % 4 === 0 ? B.FLOWER_LEAVES : B.LEAVES);
          if (dx * dx + dz * dz <= 32) setBlock(76 + dx, 19, 75 + dz, B.LEAVES);
        }
      }
    }
    for (const [cx, cz] of [[75, 74], [78, 74], [75, 76], [78, 76]]) {
      for (let cy = 11; cy <= 16; cy++) setBlock(cx, cy, cz, B.CHAIN);
    }
    fill(75, 10, 74, 78, 10, 76, B.BED_GREEN);
    addInteract(76, 10, 75, 'rest', 'Press E to Swing on the Garden Bed together 🌿', { bedX: 76.5, bedY: 10.68, bedZ: 75.5, faceYaw: 0 });
    for (const [lx, lz] of [[73, 73], [80, 73], [79, 79]]) { setBlock(lx, 17, lz, B.CHAIN); setBlock(lx, 16, lz, B.LANTERN); }
    fill(81, 9, 80, 83, 9, 82, B.COBBLE); setBlock(82, 9, 81, B.FIRE);

    // 8. SOUTH CENTER: STARRY DATE NIGHT GAZEBO OVER THE LAKE
    fill(37, 4, 68, 59, 4, 92, B.SAND);
    fill(37, 5, 68, 59, 7, 92, B.WATER);
    for (let z = 68; z <= 92; z++) {
      setBlock(36, 8, z, B.MOSSY_COBBLE); setBlock(60, 8, z, B.MOSSY_COBBLE);
      if (z % 3 === 0) { setBlock(36, 9, z, B.FLOWER_RED); setBlock(60, 9, z, B.FLOWER_YELLOW); }
    }
    fill(46, 8, 67, 50, 8, 74, B.OAK_PLANKS);
    for (let z = 68; z <= 73; z++) { setBlock(46, 9, z, B.FENCE); setBlock(50, 9, z, B.FENCE); }
    setBlock(46, 10, 69, B.LANTERN); setBlock(50, 10, 69, B.LANTERN);

    fill(42, 9, 74, 54, 9, 86, B.OAK_PLANKS);
    for (const px of [42, 54]) for (const pz of [74, 86]) fill(px, 5, pz, px, 15, pz, B.OAK_LOG);
    for (const [px, pz] of [[46, 74], [50, 74], [46, 86], [50, 86], [42, 78], [42, 82], [54, 78], [54, 82]]) {
      fill(px, 10, pz, px, 14, pz, B.OAK_LOG);
    }
    for (let x = 42; x <= 54; x++) {
      if (x < 47 || x > 49) setBlock(x, 10, 74, B.FENCE);
      setBlock(x, 10, 86, B.FENCE);
    }
    for (let z = 74; z <= 86; z++) { setBlock(42, 10, z, B.FENCE); setBlock(54, 10, z, B.FENCE); }
    fill(41, 15, 73, 55, 15, 87, B.SPRUCE_PLANKS);
    fill(43, 16, 75, 53, 16, 85, B.OAK_PLANKS);
    fill(45, 17, 77, 51, 17, 83, B.SPRUCE_PLANKS);
    fill(47, 18, 79, 49, 18, 81, B.OAK_PLANKS);
    setBlock(48, 19, 80, B.LANTERN);
    for (const [lx, lz] of [[42, 74], [54, 74], [42, 86], [54, 86], [48, 74], [48, 86], [42, 80], [54, 80]]) setBlock(lx, 14, lz, B.LANTERN);
    for (const [vx, vz] of [[44, 75], [52, 75], [44, 85], [52, 85]]) { setBlock(vx, 14, vz, B.VINE_GLOW); setBlock(vx, 13, vz, B.VINE_GLOW); }
    setBlock(48, 10, 80, B.TABLE_OAK); setBlock(48, 11, 80, B.CAKE);
    setBlock(47, 10, 80, B.STOOL_MOSS); setBlock(49, 10, 80, B.STOOL_MOSS);
    addInteract(48, 11, 80, 'datenight', 'Press E to Celebrate Starry Date Night ✨💖', {});

    // Meadow trees & flowers
    for (const [tx, tz, lf] of [
      [15, 16, B.FLOWER_LEAVES], [16, 28, B.LEAVES], [80, 16, B.FLOWER_LEAVES],
      [81, 28, B.LEAVES], [36, 58, B.FLOWER_LEAVES], [60, 58, B.LEAVES], [89, 60, B.FLOWER_LEAVES]
    ]) buildTree(tx, 9, tz, 4, lf);

    for (let z = 10; z < 88; z += 5) {
      for (let x = 10; x < 88; x += 6) {
        if (getBlock(x, 8, z) === B.GRASS && getBlock(x, 9, z) === B.AIR && hash(x, 99, z) > 0.62) {
          setBlock(x, 9, z, hash(z, 33, x) > 0.5 ? B.FLOWER_YELLOW : B.FLOWER_RED);
        }
      }
    }

    recomputeLights();
  }

  function recomputeLights() {
    skyLight.fill(0);
    blockLight.fill(0);
    const skyQ = [], blkQ = [];
    for (let z = 0; z < WZ; z++) {
      for (let x = 0; x < WX; x++) {
        let blocked = false;
        for (let y = WY - 1; y >= 0; y--) {
          const i = idx(x, y, z);
          const p = PROPS[data[i]];
          if (p.light > 0) { blockLight[i] = p.light; blkQ.push(i); }
          if (!blocked) {
            if (p.opaque) blocked = true;
            else { skyLight[i] = 15; skyQ.push(i); }
          }
        }
      }
    }
    const dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    function spread(arr, q) {
      let head = 0;
      while (head < q.length) {
        const cur = q[head++], val = arr[cur];
        if (val <= 1) continue;
        const x = cur % WX, tmp = (cur - x) / WX, z = tmp % WZ, y = (tmp - z) / WZ;
        for (let d = 0; d < 6; d++) {
          const nx = x + dirs[d][0], ny = y + dirs[d][1], nz = z + dirs[d][2];
          if (!inBounds(nx, ny, nz)) continue;
          const ni = idx(nx, ny, nz);
          if (PROPS[data[ni]].opaque) continue;
          const next = val - (data[ni] === B.WATER ? 2 : 1);
          if (next > arr[ni]) { arr[ni] = next; q.push(ni); }
        }
      }
    }
    spread(skyLight, skyQ);
    spread(blockLight, blkQ);
  }

  function buildChunkMesh(cx, cz) {
    const opq = [], trn = [];
    const x0 = cx * CHUNK, z0 = cz * CHUNK;
    const x1 = Math.min(WX, x0 + CHUNK), z1 = Math.min(WZ, z0 + CHUNK);
    const eps = 0.002;

    function lightAt(x, y, z) {
      if (!inBounds(x, y, z)) return [15, 0];
      const i = idx(x, y, z);
      return [skyLight[i], blockLight[i]];
    }
    function pushQuad(arr, v0, v1, v2, v3, tileIdx, shade, skyL, blkL) {
      const tx = (tileIdx % ATLAS_CELLS) / ATLAS_CELLS, ty = Math.floor(tileIdx / ATLAS_CELLS) / ATLAS_CELLS;
      const cell = 1 / ATLAS_CELLS;
      const u0 = tx + eps, u1 = tx + cell - eps, tv0 = ty + eps, tv1 = ty + cell - eps;
      const sk = skyL / 15, bl = blkL / 15;
      arr.push(
        v0[0], v0[1], v0[2], u0, tv1, shade, sk, bl,
        v1[0], v1[1], v1[2], u1, tv1, shade, sk, bl,
        v2[0], v2[1], v2[2], u1, tv0, shade, sk, bl,
        v0[0], v0[1], v0[2], u0, tv1, shade, sk, bl,
        v2[0], v2[1], v2[2], u1, tv0, shade, sk, bl,
        v3[0], v3[1], v3[2], u0, tv0, shade, sk, bl
      );
    }
    function addBox(arr, x, y, z, w0, h0, d0, w1, h1, d1, tiles, skyL, blkL, cullNeighbors, selfId) {
      const xA = x + w0, xB = x + w1, yA = y + h0, yB = y + h1, zA = z + d0, zB = z + d1;
      const faces = [
        { dir: [0, 1, 0], tile: tiles[0], sh: 1.0, pts: [[xA,yB,zB],[xB,yB,zB],[xB,yB,zA],[xA,yB,zA]] },
        { dir: [0,-1, 0], tile: tiles[2], sh: 0.62, pts: [[xA,yA,zA],[xB,yA,zA],[xB,yA,zB],[xA,yA,zB]] },
        { dir: [0, 0, 1], tile: tiles[1], sh: 0.88, pts: [[xA,yA,zB],[xB,yA,zB],[xB,yB,zB],[xA,yB,zB]] },
        { dir: [0, 0,-1], tile: tiles[1], sh: 0.88, pts: [[xB,yA,zA],[xA,yA,zA],[xA,yB,zA],[xB,yB,zA]] },
        { dir: [1, 0, 0], tile: tiles[1], sh: 0.78, pts: [[xB,yA,zB],[xB,yA,zA],[xB,yB,zA],[xB,yB,zB]] },
        { dir: [-1,0, 0], tile: tiles[1], sh: 0.78, pts: [[xA,yA,zA],[xA,yA,zB],[xA,yB,zB],[xA,yB,zA]] }
      ];
      for (const f of faces) {
        const nx = x + f.dir[0], ny = y + f.dir[1], nz = z + f.dir[2];
        let sk = skyL, bl = blkL;
        if (cullNeighbors) {
          const nb = getBlock(nx, ny, nz);
          if (PROPS[nb].opaque) continue;
          if (selfId === B.WATER && nb === B.WATER) continue;
          if (selfId === B.GLASS && nb === B.GLASS) continue;
          const [nsk, nbl] = lightAt(nx, ny, nz);
          sk = Math.max(sk, nsk); bl = Math.max(bl, nbl);
        }
        pushQuad(arr, f.pts[0], f.pts[1], f.pts[2], f.pts[3], f.tile, f.sh, sk, bl);
      }
    }

    for (let y = 0; y < WY; y++) {
      for (let z = z0; z < z1; z++) {
        for (let x = x0; x < x1; x++) {
          const id = getBlock(x, y, z);
          if (id === B.AIR) continue;
          const p = PROPS[id];
          const [sk, bl] = lightAt(x, y, z);
          if (p.shape === 'cube') addBox(opq, x, y, z, 0, 0, 0, 1, 1, 1, p.tiles, sk, bl, true, id);
          else if (p.shape === 'glass') addBox(trn, x, y, z, 0, 0, 0, 1, 1, 1, p.tiles, sk, bl, true, id);
          else if (p.shape === 'water') addBox(trn, x, y, z, 0, 0, 0, 1, 0.86, 1, p.tiles, sk, bl, true, id);
          else if (p.shape === 'slab') addBox(opq, x, y, z, 0.04, 0, 0.04, 0.96, 0.56, 0.96, p.tiles, sk, bl, false, id);
          else if (p.shape === 'cake') addBox(opq, x, y, z, 0.12, 0, 0.12, 0.88, 0.5, 0.88, p.tiles, sk, bl, false, id);
          else if (p.shape === 'post') addBox(opq, x, y, z, 0.36, 0, 0.36, 0.64, 1, 0.64, p.tiles, sk, bl, false, id);
          else if (p.shape === 'thin') addBox(opq, x, y, z, 0.43, 0, 0.43, 0.57, 1, 0.57, p.tiles, sk, bl, false, id);
          else if (p.shape === 'lantern') {
            addBox(opq, x, y, z, 0.28, 0.05, 0.28, 0.72, 0.65, 0.72, p.tiles, sk, 15, false, id);
            addBox(opq, x, y, z, 0.44, 0.65, 0.44, 0.56, 1.0, 0.56, [T.CHAIN, T.CHAIN, T.CHAIN], sk, 15, false, id);
          } else if (p.shape === 'cross') {
            const cbl = Math.max(bl, p.light);
            pushQuad(opq, [x+0.15,y,z+0.15], [x+0.85,y,z+0.85], [x+0.85,y+0.95,z+0.85], [x+0.15,y+0.95,z+0.15], p.tiles[0], 0.96, sk, cbl);
            pushQuad(opq, [x+0.85,y,z+0.85], [x+0.15,y,z+0.15], [x+0.15,y+0.95,z+0.15], [x+0.85,y+0.95,z+0.85], p.tiles[0], 0.96, sk, cbl);
            pushQuad(opq, [x+0.15,y,z+0.85], [x+0.85,y,z+0.15], [x+0.85,y+0.95,z+0.15], [x+0.15,y+0.95,z+0.85], p.tiles[0], 0.96, sk, cbl);
            pushQuad(opq, [x+0.85,y,z+0.15], [x+0.15,y,z+0.85], [x+0.15,y+0.95,z+0.85], [x+0.85,y+0.95,z+0.15], p.tiles[0], 0.96, sk, cbl);
          }
        }
      }
    }
    return { opaque: new Float32Array(opq), translucent: new Float32Array(trn) };
  }

  const PLACES = [
    { id: 'park', name: 'Amusement Park', short: '🎡 Park', color: '#ff85b3', x: 48.5, y: 9.05, z: 30, yaw: 0, bounds: [24, 5, 72, 35], mapPos: [48, 20] },
    { id: 'restaurant', name: 'Date Restaurant', short: '🍽️ Restaurant', color: '#ffa94d', x: 26, y: 9.05, z: 48, yaw: -Math.PI / 2, bounds: [6, 36, 34, 58], mapPos: [20, 47] },
    { id: 'plaza', name: 'Flower Plaza', short: '🌻 Plaza', color: '#ffe066', x: 48.5, y: 9.05, z: 50.5, yaw: 0, bounds: [41, 41, 55, 55], mapPos: [48, 48] },
    { id: 'house', name: 'Cozy House (Beds)', short: '🛏️ House', color: '#8be86f', x: 68, y: 9.05, z: 47, yaw: Math.PI / 2, bounds: [64, 36, 88, 58], mapPos: [76, 47] },
    { id: 'cabin', name: 'Snowy Cabin', short: '🔥 Cabin', color: '#a5d8ff', x: 23, y: 9.05, z: 71, yaw: Math.PI * 0.85, bounds: [4, 64, 34, 92], mapPos: [20, 77] },
    { id: 'gazebo', name: 'Date Night Gazebo', short: '🕯️ Gazebo', color: '#d0bfff', x: 48.5, y: 10.05, z: 76, yaw: Math.PI, bounds: [36, 66, 60, 93], mapPos: [48, 80] },
    { id: 'swing', name: 'Garden Swing', short: '🌿 Swing', color: '#63e6be', x: 73, y: 9.05, z: 78, yaw: Math.PI / 4, bounds: [65, 65, 89, 89], mapPos: [76, 76] }
  ];

  function detectPlace(px, pz) {
    for (const p of PLACES) {
      const [x1, z1, x2, z2] = p.bounds;
      if (px >= x1 && px <= x2 && pz >= z1 && pz <= z2) return p.name;
    }
    return 'Sunny Meadow';
  }

  global.MCWorld = {
    WX, WY, WZ, CHUNK, B, T, PROPS, PLACES,
    atlasCanvas, interactables,
    buildWorld, getBlock, setBlock, recomputeLights, buildChunkMesh, detectPlace
  };
})(window);
