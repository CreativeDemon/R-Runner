// cutscene.js
class CutsceneClass {
  constructor() {
    this.active = false;
    this.wasActive = false;
    this.justEnded = false;
    this.justStarted = false;
    
    this.timer = 0;
    
    this.sheet = null;
    this.frame = 0;
    this.frameTimer = 0;
  }
  
  start(duration, sheet) {
    if (!sheet || !sheet.frames || sheet.frames.length === 0) {
      console.warn("Cutscene.start called with invalid sheet:", sheet);
      return;
    }
    
    this.active = true;
    this.justStarted = true; // prevent immediate cancel
    this.justEnded = false;
    
    this.timer = duration || 500;
    this.sheet = sheet;
    
    this.frame = 0;
    this.frameTimer = 0;
    
    console.log("Cutscene.start() duration:", this.timer, "frames:", sheet.frames.length);
  }
  
  update(dt) {
    this.justEnded = false;
    
    // Protect first frame after starting
    if (this.justStarted) {
      this.justStarted = false;
      this.wasActive = true;
      return;
    }
    
    if (!this.active) {
      this.wasActive = false;
      return;
    }
    
    this.timer -= dt;
    
    // Update animation frame
    if (this.sheet && this.sheet.frames) {
      this.frameTimer += dt;
      if (this.frameTimer >= 120) {
        this.frameTimer = 0;
        this.frame = (this.frame + 1) % this.sheet.frames.length;
      }
    }
    
    if (this.timer <= 0) {
      this.active = false;
    }
    
    // Detect the moment cutscene ends
    if (!this.active && this.wasActive) {
      this.justEnded = true;
    }
    
    this.wasActive = this.active;
  }
  
  draw(ctx, player) {
  if (!this.active || !this.sheet || !player) return;
  
  const f = this.sheet.frames[this.frame];
  if (!f) return;
  
  // Always draw beat on the platform level
  const GROUND_Y = CONFIG.HEIGHT - 40; // ← FIXED Y VALUE OF PLATFORM
  
  const px = player.x + (player.w * 0.2);
  const py = GROUND_Y - (f.h * 2) + 10;
  //      ↑ shift upward a bit so feet touch ground nicely
  
  ctx.save();
  ctx.globalAlpha = 1.0;
  
  ctx.drawImage(
    this.sheet.image,
    f.x, f.y, f.w, f.h,
    px,
    py,
    f.w * 2,
    f.h * 2
  );
  
  ctx.restore();
}
}

window.Cutscene = new CutsceneClass();