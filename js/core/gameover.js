window.GameOverUI = {
  draw(ctx, score, best) {
    ctx.save();
    
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    
    ctx.font = "32px GameFont";
    ctx.fillText("GAME OVER", CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 40);
    
    ctx.font = "22px GameFont";
    ctx.fillText("Score: " + Math.floor(score), CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);
    ctx.fillText("Best: " + Math.floor(best), CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 30);
    
    // Restart button
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(CONFIG.WIDTH / 2 - 70, CONFIG.HEIGHT / 2 + 60, 140, 40);
    
    ctx.fillStyle = "#000";
    ctx.font = "20px GameFont";
    ctx.fillText("RESTART", CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 + 88);
    
    ctx.restore();
  }
};