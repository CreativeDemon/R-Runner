window.restartGame = function() {
  
  Assets.playSound("restart");
  
  CONFIG.GAME_OVER = false;
  CONFIG.GAME_STARTED = false;
  
  score = 0;
  
  player = new Player(ctx);
  
  enemies = [];
  for (let i = 0; i < 2; i++) {
    const e = new Enemy(ctx);
    configureEnemy(e, (i % 3) + 1);
    e.x = CONFIG.WIDTH + 300 + (i * 200);
    enemies.push(e);
  }
  
  spawnTimer = 0;
  window.protectionTimer = 0;
};