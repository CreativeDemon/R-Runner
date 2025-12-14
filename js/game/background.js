// js/game/background.js
class Background {
  constructor(ctx) {
    this.ctx = ctx;
    this.w = CONFIG.WIDTH;
    this.h = CONFIG.HEIGHT;
    this.x1 = 0; this.x2 = 0; this.x3 = 0;
    this.s1 = 0.4; this.s2 = 1.0; this.s3 = 2.0;
  }

  update(dt) {
  if (!CONFIG.GAME_STARTED || Cutscene.active) return;
  
  const speed = CONFIG.SPEED * CONFIG.WORLD_SPEED * (dt / 16.66);
  
  // All speeds now relative to tiles
  this.x1 -= speed * 0.6; // far background (slight parallax)
  this.x2 -= speed * 0.8; // mid background
  this.x3 -= speed * 1.0; // near background → EXACT match to tiles
  
  if (this.x1 <= -this.w) this.x1 += this.w;
  if (this.x2 <= -this.w) this.x2 += this.w;
  if (this.x3 <= -this.w) this.x3 += this.w;
}

  draw() {
    const ctx = this.ctx;
    const far = Assets.images.bg_far;
    const mid = Assets.images.bg_mid;
    const near = Assets.images.bg_near;
    if (!far || !mid || !near) {
      ctx.fillStyle = "#071028"; ctx.fillRect(0, 0, this.w, this.h); return;
    }
    ctx.drawImage(far, this.x1, 0, this.w, this.h);
    ctx.drawImage(far, this.x1 + this.w, 0, this.w, this.h);
    ctx.drawImage(mid, this.x2, 0, this.w, this.h);
    ctx.drawImage(mid, this.x2 + this.w, 0, this.w, this.h);
    ctx.drawImage(near, this.x3, 0, this.w, this.h);
    ctx.drawImage(near, this.x3 + this.w, 0, this.w, this.h);
  }
}