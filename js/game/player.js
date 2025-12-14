// js/game/player.js
class Player {
  constructor(ctx) {
    this.ctx = ctx;
    this.reset();
  }
  
  reset() {
    this.x = 120;
    this.y = CONFIG.HEIGHT - 128;
    
    this.w = 96;
    this.h = 96;
    
    this.vy = 0;
    this.jumpCount = 0;
    
    this.lives = CONFIG.LIFE || 3;
    this.justHit = false;
    
    
    this.anim = {
      idle: Assets.sheets["player_idle"],
      run: Assets.sheets["player_run"],
      jump: Assets.sheets["player_jump"],
      death: Assets.sheets["player_death"]
    };
    
    this.state = "idle";
    this.frame = 0;
    this.timer = 0;
  }
  
  getHitbox() {
    return {
      x: this.x + 30,
      y: this.y + 30,
      w: this.w - 70,
      h: this.h - 60
    };
  }
  
  lockToGround() {
  this.vy = 0;
  this.jumpCount = 0;
  this.y = CONFIG.HEIGHT - 128; // exact ground position
}

  hit() {
  if (this.lives <= 0) return;
  
  this.lives--;
  
  // Mark hit happened (used by enemy)
  this.justHit = true;
  
  // If still alive → normal hit sound
  if (this.lives > 0) {
    Assets.playSound("hit");
    return;
  }
  
  // === LAST LIFE HIT ===
  // Do NOT die yet, wait for beat animation
  this.pendingDeath = true;
}
  
  update(dt) {
    if (!CONFIG.GAME_STARTED) return;
    
    if (CONFIG.GAME_OVER) return;
    
    if (Cutscene.active) return;
    
    if (Input.jump) {
      Input.jump = false;
      
      if (this.jumpCount === 0) {
        this.vy = CONFIG.JUMP_FORCE;
        this.jumpCount = 1;
      } else if (this.jumpCount === 1) {
        this.vy = CONFIG.JUMP_FORCE * 0.7;
        this.jumpCount = 2;
      }
      
      Assets.playSound("jump");
    }
    
    this.vy += CONFIG.GRAVITY;
    this.y += this.vy;
    
    if (this.y > CONFIG.HEIGHT - 128) {
      this.y = CONFIG.HEIGHT - 128;
      this.vy = 0;
      this.jumpCount = 0;
    }
    
    this.state = this.vy !== 0 ? "jump" : "run";
  }
  
  draw() {
    if (Cutscene.active) return;
    
    const sheet =
      CONFIG.GAME_OVER ? this.anim.death : this.anim[this.state];
    
    if (!sheet || !sheet.frames) return;
    
    const frames = sheet.frames;
    if (!frames[this.frame]) this.frame = 0;
    
    const f = frames[this.frame];
    
    this.timer += 16;
    if (this.timer >= 120) {
      this.timer = 0;
      if (CONFIG.GAME_OVER) {
        if (this.frame < frames.length - 1) this.frame++;
      } else {
        this.frame = (this.frame + 1) % frames.length;
      }
    }
    
    this.ctx.drawImage(
      sheet.image,
      f.x, f.y, f.w, f.h,
      this.x, this.y,
      this.w, this.h
    );
  }
}