// js/ui/ui.js

window.UI_STATE = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  CREDITS: "CREDITS",
  GAME_OVER: "GAME_OVER"
};

window.UI = {
  state: UI_STATE.MENU,
  muted: false,
  buttons: [],
  deathSoundPlayed: false,
  fontReady: false,
  
  /* =======================
     FONT FIX (CRITICAL)
  ======================= */
  ensureFont() {
    if (this.fontReady) return;
    
    // Force font load once
    document.fonts.load("16px GameFont").then(() => {
      this.fontReady = true;
      console.log("✅ GameFont loaded");
    });
  },
  
  /* =======================
     UTILS
  ======================= */
  resetButtons() {
    this.buttons.length = 0;
  },
  
  drawButton(ctx, text, x, y, action) {
    const w = 160; // ✅ FIXED WIDTH
    const h = 44;
    
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(x, y, w, h);
    
    ctx.fillStyle = "#000";
    ctx.font = "18px GameFont";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);
    
    this.buttons.push({ x, y, w, h, action });
  },
  
  handleClick(mx, my) {
    for (const b of this.buttons) {
      if (
        mx >= b.x && mx <= b.x + b.w &&
        my >= b.y && my <= b.y + b.h
      ) {
        b.action();
        return true;
      }
    }
    return false;
  },
  
  toggleMute() {
    this.muted = !this.muted;
    Object.values(Assets.sounds).forEach(s => {
      if (s) s.muted = this.muted;
    });
  },
  
  /* =======================
     TOP ICON
  ======================= */
  drawPauseIcon(ctx) {
    if (this.state !== UI_STATE.PLAYING) return;
    
    const img = Assets.images.pause;
    if (!img) return;
    
    const size = 28;
    ctx.drawImage(img, CONFIG.WIDTH - size - 12, 10, size, size);
  },
  
  checkPauseClick(mx, my) {
    if (this.state !== UI_STATE.PLAYING) return false;
    
    const size = 28;
    const x = CONFIG.WIDTH - size - 12;
    const y = 10;
    
    if (mx >= x && mx <= x + size && my >= y && my <= y + size) {
      this.state = UI_STATE.PAUSED;
      return true;
    }
    return false;
  },
  
  /* =======================
     SCREENS
  ======================= */
  drawMenu(ctx) {
    if (this.state !== UI_STATE.MENU) return;
    
    this.ensureFont();
    
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    
    ctx.font = "36px GameFont";
    ctx.fillText("R-RUNNER", CONFIG.WIDTH / 2, 120);
    
    this.drawButton(ctx, "PLAY", CONFIG.WIDTH / 2 - 80, 190, () => {
      this.state = UI_STATE.PLAYING;
      CONFIG.GAME_STARTED = true;
      if (!this.muted) Assets.loopSound("bgm");
    });
    
    this.drawButton(
      ctx,
      this.muted ? "SOUND: OFF" : "SOUND: ON",
      CONFIG.WIDTH / 2 - 80,
      250,
      () => this.toggleMute()
    );
    
    this.drawButton(ctx, "CREDITS", CONFIG.WIDTH / 2 - 80, 310, () => {
      this.state = UI_STATE.CREDITS;
    });
  },
  
  drawCredits(ctx) {
    if (this.state !== UI_STATE.CREDITS) return;
    
    this.ensureFont();
    
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    
    ctx.font = "28px GameFont";
    ctx.fillText("CREDITS", CONFIG.WIDTH / 2, 120);
    
    ctx.font = "16px GameFont";
    ctx.fillText("Game Design & Code", CONFIG.WIDTH / 2, 180);
    ctx.fillText("Creative Demon", CONFIG.WIDTH / 2, 210);
    
    this.drawButton(ctx, "BACK", CONFIG.WIDTH / 2 - 80, 300, () => {
      this.state = UI_STATE.MENU;
    });
  },
  
  drawPauseMenu(ctx) {
    if (this.state !== UI_STATE.PAUSED) return;
    
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "30px GameFont";
    ctx.fillText("PAUSED", CONFIG.WIDTH / 2, 130);
    
    this.drawButton(ctx, "RESUME", CONFIG.WIDTH / 2 - 80, 200, () => {
      this.state = UI_STATE.PLAYING;
    });
    
    this.drawButton(
      ctx,
      this.muted ? "SOUND: OFF" : "SOUND: ON",
      CONFIG.WIDTH / 2 - 80,
      260,
      () => this.toggleMute()
    );
    
    this.drawButton(ctx, "EXIT", CONFIG.WIDTH / 2 - 80, 320, () => {
      Assets.playSound("restart");
      setTimeout(() => location.reload(), 300);
    });
  },
  
  drawGameOver(ctx) {
    if (this.state !== UI_STATE.GAME_OVER) return;
    
    if (!this.deathSoundPlayed) {
      Assets.playSound("death");
      this.deathSoundPlayed = true;
    }
    
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    
    ctx.font = "32px GameFont";
    ctx.fillText("GAME OVER", CONFIG.WIDTH / 2, 120);
    
    ctx.font = "18px GameFont";
    ctx.fillText("SCORE: " + Math.floor(score), CONFIG.WIDTH / 2, 170);
    ctx.fillText("BEST: " + bestScore, CONFIG.WIDTH / 2, 200);
    
    this.drawButton(ctx, "RESTART", CONFIG.WIDTH / 2 - 80, 260, () => {
      Assets.playSound("restart");
      restartGame();
    });
  },
  
  draw(ctx) {
    this.resetButtons();
    this.drawMenu(ctx);
    this.drawCredits(ctx);
    this.drawPauseMenu(ctx);
    this.drawGameOver(ctx);
  }
};