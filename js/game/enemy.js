// js/game/enemy.js
class Enemy {
  constructor(ctx) {
    this.ctx = ctx;
    
    this.x = CONFIG.WIDTH + 300;
    this.y = CONFIG.HEIGHT - 128;
    
    this.w = 96;
    this.h = 96;
    
    this.typeId = 1;
    
    this.idleSheet = null;
    
    this.frame = 0;
    this.timer = 0;
    
    this.hasHit = false;
    this.slidingBehind = false;
    this.slideTargetX = 0;
  }
  
  getHitbox() {
    return {
      x: this.x + 30,
      y: this.y + 30,
      w: this.w - 70,
      h: this.h - 60
    };
  }
  
  update(dt, player) {
    if (!CONFIG.GAME_STARTED) return;
    if (CONFIG.GAME_OVER) return;
    
    // Slide behind player after beat
    if (this.slidingBehind) {
      this.x += (this.slideTargetX - this.x) * 0.18;
      if (Math.abs(this.x - this.slideTargetX) < 0.5) {
        this.x = this.slideTargetX;
        this.slidingBehind = false;
      }
      return;
    }
    
    // Freeze during cutscene
    if (Cutscene.active) return;
    
    // Move enemy
    this.x -= CONFIG.SPEED * (dt / 16.66);
    
    // Collision
    const A = this.getHitbox();
    const B = player.getHitbox();
    
    const overlap =
      A.x < B.x + B.w &&
      A.x + A.w > B.x &&
      A.y < B.y + B.h &&
      A.y + A.h > B.y;
    
    if (overlap && !this.hasHit) {
  this.hasHit = true;
  
  player.hit();
  
  if (player.justHit || player.pendingDeath) {
    // 🔊 BEAT SOUND (ALWAYS)
    Assets.playSound("hit");
    
    const beatSheet =
      this.typeId === 3 ?
      Assets.sheets["beat_beat2"] :
      Assets.sheets["beat_beat1"];
    
    Cutscene.start(CONFIG.STUN_TIME, beatSheet);
    
    player.justHit = false;
  }
  
  return;
}
    
    // Idle animation
    if (this.idleSheet && this.idleSheet.frames) {
      this.timer += dt;
      if (this.timer >= 120) {
        this.timer = 0;
        this.frame = (this.frame + 1) % this.idleSheet.frames.length;
      }
    }
  }
  
  draw() {
    if (Cutscene.active) return;
    if (!this.idleSheet) return;
    
    const frames = this.idleSheet.frames;
    if (!frames || !frames[this.frame]) return;
    
    const f = frames[this.frame];
    
    this.ctx.save();
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(
      this.idleSheet.image,
      f.x, f.y, f.w, f.h,
      -this.x - this.w,
      this.y,
      this.w,
      this.h
    );
    this.ctx.restore();
  }
}