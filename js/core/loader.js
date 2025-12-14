// js/core/loader.js
// Generic loader that builds Assets.sheets keyed for usage in code.
// Provides: Assets.loadJSON, Assets.loadImage, Assets.loadSound, Assets.buildSheetsFromAnimationsJSON

window.Assets = {
  images: {},
  sounds: {},
  sheets: {},

  loadJSON(path) {
    return fetch(path).then(r => {
      if (!r.ok) throw new Error("Failed to load JSON: " + path);
      return r.json();
    });
  },

  loadImage(name, path) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        this.images[name] = img;
        resolve();
      };
      img.onerror = () => {
        console.warn("Image failed to load:", path);
        this.images[name] = null;
        resolve();
      };
    });
  },

  loadSound(name, path) {
    try {
      const audio = new Audio();
      audio.src = path;
      audio.preload = "auto";
      audio.onerror = () => console.warn("Sound not supported or missing:", path);
      this.sounds[name] = audio;
    } catch (e) {
      console.warn("Sound load failed:", path, e);
      this.sounds[name] = null;
    }
  },

  playSound(name) {
  const s = this.sounds[name];
  if (!s) {
    console.warn("Sound missing:", name);
    return;
  }
  
  try {
    s.pause();
    s.currentTime = 0;
    
    const p = s.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {
    console.warn("Sound play failed:", name, e);
  }
},

  loopSound(name) {
    const s = this.sounds[name];
    if (!s) return;
    s.loop = true;
    try { s.play().catch(()=>{}); } catch(e) {}
  },

  // Build sheets from animations.json object (not URL). This creates keys:
  // player_idle, player_run, player_jump, player_death
  // enemy_type1, enemy_type2, enemy_type3
  // beat_beat1, beat_beat2
  buildSheetsFromAnimationsObject(json) {
    // players
    if (json.player) {
      Object.keys(json.player).forEach(k => {
        const e = json.player[k];
        const key = `player_${k}`; // player_run, player_jump...
        const frameW = Math.floor(e.w / e.frames);
        const frames = [];
        for (let i = 0; i < e.frames; i++) frames.push({ x: i * frameW, y: 0, w: frameW, h: e.h });
        const img = new Image();
        img.src = e.path;
        img.onload = () => {};
        img.onerror = () => console.warn("Failed to load player sheet:", e.path);
        this.sheets[key] = { image: img, frames: frames, meta: e };
      });
    }

    // enemies
    if (json.enemies) {
      Object.keys(json.enemies).forEach(k => {
        const e = json.enemies[k];
        const key = `enemy_${k}`; // enemy_type1
        const frameW = Math.floor(e.w / e.frames);
        const frames = [];
        for (let i = 0; i < e.frames; i++) frames.push({ x: i * frameW, y: 0, w: frameW, h: e.h });
        const img = new Image();
        img.src = e.path;
        img.onload = () => {};
        img.onerror = () => console.warn("Failed to load enemy sheet:", e.path);
        this.sheets[key] = { image: img, frames: frames, meta: e };
      });
    }

    // beats
    if (json.beats) {
      Object.keys(json.beats).forEach(k => {
        const e = json.beats[k];
        const key = `beat_${k}`; // beat_beat1
        const frameW = Math.floor(e.w / e.frames);
        const frames = [];
        for (let i = 0; i < e.frames; i++) frames.push({ x: i * frameW, y: 0, w: frameW, h: e.h });
        const img = new Image();
        img.src = e.path;
        img.onload = () => {};
        img.onerror = () => console.warn("Failed to load beat sheet:", e.path);
        this.sheets[key] = { image: img, frames: frames, meta: e };
      });
    }
  }
};