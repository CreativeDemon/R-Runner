// js/game/tiles.js
class Tiles {
  constructor(ctx) {
    this.ctx = ctx;
    this.tileSize = CONFIG.TILE || 32;
    this.scrollX = 0;
    this.groundY = CONFIG.HEIGHT - 32;
  }
  
  update(dt) {
    // ONLY MOVE when world is NOT frozen
    if (!window.isWorldFrozen()) {
      this.scrollX -= CONFIG.SPEED;
      if (this.scrollX <= -this.tileSize) {
        this.scrollX += this.tileSize;
      }
    }
  }
  
  draw() {
    const ctx = this.ctx;
    const grass = Assets.images.green_grass;
    const dirt = Assets.images.dirt;
    
    if (!grass || !dirt) {
      // fallback
      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(0, this.groundY, CONFIG.WIDTH, CONFIG.HEIGHT);
      return;
    }
    
    for (let x = this.scrollX - this.tileSize; x < CONFIG.WIDTH + this.tileSize; x += this.tileSize) {
      ctx.drawImage(grass, x, this.groundY - this.tileSize, this.tileSize, this.tileSize);
      ctx.drawImage(dirt, x, this.groundY, this.tileSize, this.tileSize);
    }
  }
}