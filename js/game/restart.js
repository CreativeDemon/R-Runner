// js/game/restart.js

window.restartGame = function() {
  
  // 🔊 play restart sound first
  Assets.playSound("restart");
  
  // delay reset slightly so sound can start
  setTimeout(() => {
    
    // reset flags
    CONFIG.GAME_OVER = false;
    CONFIG.GAME_STARTED = true;
    
    // reset score
    score = 0;
    
    // reset UI
    UI.state = UI_STATE.PLAYING;
    UI.deathSoundPlayed = false;
    
    // reset player fully
    player.reset();
    
    // reset enemies
    enemies.length = 0;
    for (let i = 0; i < 2; i++) {
      const e = new Enemy(ctx);
      configureEnemy(e, (i % 3) + 1);
      e.x = CONFIG.WIDTH + 300 + i * 240;
      enemies.push(e);
    }
    
    // reset timers
    window.protectionTimer = 2000;
    Cutscene.reset();
    
    // restart bgm
    if (Assets.sounds.bgm && !UI.muted) {
      Assets.sounds.bgm.currentTime = 0;
      Assets.sounds.bgm.play().catch(() => {});
    }
    
  }, 200);
};