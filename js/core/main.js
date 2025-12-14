(function () {
  /* =========================
     CANVAS + LANDSCAPE LOCK
  ========================= */
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  window.ctx = ctx;

  function setupCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // 🔒 LANDSCAPE LOCK
    if (h > w) {
      canvas.style.display = "none";
      showRotateOverlay();
      return;
    } else {
      hideRotateOverlay();
      canvas.style.display = "block";
    }

    // REAL WORLD SIZE (NO ZOOM)
    canvas.width = w;
    canvas.height = h;

    CONFIG.WIDTH = w;
    CONFIG.HEIGHT = h;
  }

  window.addEventListener("resize", setupCanvas);
  setupCanvas();

  /* =========================
     ROTATE OVERLAY
  ========================= */
  function showRotateOverlay() {
    let el = document.getElementById("rotate-overlay");
    if (el) return;

    el = document.createElement("div");
    el.id = "rotate-overlay";
    el.innerHTML = "🔄 Rotate your phone to landscape";
    Object.assign(el.style, {
      position: "fixed",
      inset: 0,
      background: "#000",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      zIndex: 9999,
      textAlign: "center",
    });
    document.body.appendChild(el);
  }

  function hideRotateOverlay() {
    const el = document.getElementById("rotate-overlay");
    if (el) el.remove();
  }

  /* =========================
     FULLSCREEN ON FIRST TAP
  ========================= */
  function requestFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }

  window.addEventListener(
    "click",
    () => {
      if (!document.fullscreenElement) requestFullscreen();
    },
    { once: true }
  );

  /* =========================
     WORLD FREEZE CHECK
  ========================= */
  window.isWorldFrozen = function () {
    return (
      CONFIG.GAME_OVER ||
      (window.UI &&
        (UI.state === UI_STATE.MENU ||
          UI.state === UI_STATE.PAUSED ||
          UI.state === UI_STATE.CREDITS ||
          UI.state === UI_STATE.GAME_OVER)) ||
      (window.Cutscene && Cutscene.active)
    );
  };

  /* =========================
     GAME STATE
  ========================= */
  window.player = null;
  window.enemies = [];

  let bg, tiles;
  let lastTime = 0;

  window.score = 0;
  window.bestScore = Number(localStorage.getItem("bestScore") || 0);

  let spawnTimer = 0;
  window.protectionTimer = 0;

  const SPAWN_BASE = 1200;
  const SPAWN_SPEED_FACTOR = 40;

  /* =========================
     ENEMY SPAWN
  ========================= */
  function pickEnemyType() {
    const r = Math.random();
    if (r < 0.5) return 1;
    if (r < 0.8) return 2;
    return 3;
  }

  function spawnEnemySafe() {
    if (window.protectionTimer > 0) return;

    const enemy = new Enemy(ctx);
    configureEnemy(enemy, pickEnemyType());

    const SAFE_GAP = CONFIG.SPEED * 20 + 180;
    let spawnX = CONFIG.WIDTH + SAFE_GAP;

    if (enemies.length > 0) {
      const last = enemies[enemies.length - 1];
      spawnX = Math.max(spawnX, last.x + SAFE_GAP);
    }

    enemy.x = spawnX;
    enemies.push(enemy);
  }

  /* =========================
     LOADING
  ========================= */
  function preloadAll() {
    return Assets.loadJSON("assets/json/animations.json")
      .then((json) => Assets.buildSheetsFromAnimationsObject(json))
      .then(loadStatics);
  }

  function loadStatics() {
    const list = [];

    list.push(Assets.loadImage("pause", "assets/ui/pause.png"));
    list.push(Assets.loadImage("heart", "assets/ui/heart.png"));

    list.push(Assets.loadImage("bg_far", "assets/background/bg_far.png"));
    list.push(Assets.loadImage("bg_mid", "assets/background/bg_mid.png"));
    list.push(Assets.loadImage("bg_near", "assets/background/bg_near.png"));

    list.push(Assets.loadImage("dirt", "assets/tiles/dirt.png"));
    list.push(Assets.loadImage("green_grass", "assets/tiles/grass.png"));

    Assets.loadSound("jump", "assets/sounds/jump.wav");
    Assets.loadSound("hit", "assets/sounds/hit.wav");
    Assets.loadSound("death", "assets/sounds/gameover.wav");
    Assets.loadSound("restart", "assets/sounds/restart.mp3");
    Assets.loadSound("bgm", "assets/sounds/bgm.wav");
    Assets.loadSound("ahh", "assets/sounds/ahh.mp3");

    return Promise.all(list);
  }

  /* =========================
     INIT
  ========================= */
  function init() {
    bg = new Background(ctx);
    tiles = new Tiles(ctx);
    player = new Player(ctx);

    enemies.length = 0;
    for (let i = 0; i < 2; i++) {
      const e = new Enemy(ctx);
      configureEnemy(e, (i % 3) + 1);
      e.x = CONFIG.WIDTH + 300 + i * 240;
      enemies.push(e);
    }

    UI.state = UI_STATE.MENU;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  /* =========================
     UPDATE
  ========================= */
  function updateAll(dt) {
    if (
      UI.state === UI_STATE.MENU ||
      UI.state === UI_STATE.PAUSED ||
      UI.state === UI_STATE.CREDITS ||
      UI.state === UI_STATE.GAME_OVER
    ) {
      Cutscene.update(dt);
      return;
    }

    Cutscene.update(dt);
    if (CONFIG.GAME_OVER) return;

    const level = Math.floor(score / 100);
    CONFIG.SPEED = Math.min(3 + level * 0.5, 10);

    bg.update(dt);
    tiles.update(dt);
    player.update(dt);

    enemies.forEach((e) => e.update(dt, player, enemies));
    enemies = enemies.filter((e) => e.x > -300);

    if (UI.state === UI_STATE.PLAYING && !Cutscene.active) {
      spawnTimer += dt;
      const interval = SPAWN_BASE + CONFIG.SPEED * SPAWN_SPEED_FACTOR;
      if (spawnTimer >= interval) {
        spawnEnemySafe();
        spawnTimer = 0;
      }
    }

    if (!Cutscene.active) score += dt * 0.01;

    if (Cutscene.justEnded) {
      enemies.forEach((e) => {
        if (e.hasHit) {
          e.hasHit = false;
          e.slidingBehind = true;
          e.slideTargetX = player.x - e.w - 1;
        }
      });

      window.protectionTimer = 3000;

      if (player.pendingDeath) {
        player.pendingDeath = false;
        Assets.playSound("ahh");

        player.lockToGround();
        player.state = "death";
        player.frame = 0;
        player.timer = 0;

        CONFIG.GAME_OVER = true;
        setTimeout(() => (UI.state = UI_STATE.GAME_OVER), 1000);
      }

      Cutscene.justEnded = false;
    }

    if (window.protectionTimer > 0) {
      window.protectionTimer -= dt;
      if (window.protectionTimer < 0) window.protectionTimer = 0;
    }
  }

  /* =========================
     DRAW
  ========================= */
  function drawLives() {
    const heart = Assets.images.heart;
    if (!heart || !player) return;

    for (let i = 0; i < player.lives; i++) {
      ctx.drawImage(heart, 16 + i * 20, 36, 16, 16);
    }
  }

  function drawAll() {
    ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

    bg.draw();
    tiles.draw();
    enemies.forEach((e) => e.draw());
    player.draw();
    Cutscene.draw(ctx, player);

    ctx.fillStyle = "#fff";
    ctx.font = "20px GameFont";
    ctx.fillText("SCORE: " + Math.floor(score), 16, 26);

    drawLives();
    UI.drawPauseIcon(ctx);
    UI.draw(ctx);
  }

  /* =========================
     LOOP
  ========================= */
  function loop(now) {
    const dt = now - lastTime;
    lastTime = now;

    updateAll(dt);
    drawAll();

    if (score > bestScore) {
      bestScore = Math.floor(score);
      localStorage.setItem("bestScore", bestScore);
    }

    requestAnimationFrame(loop);
  }

  /* =========================
     INPUT
  ========================= */
  window.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (UI.checkPauseClick(mx, my)) return;
    if (UI.handleClick(mx, my)) return;

    if (
      UI.state === UI_STATE.PLAYING &&
      CONFIG.GAME_STARTED &&
      !CONFIG.GAME_OVER &&
      !Cutscene.active
    ) {
      Input.jump = true;
    }
  });

  /* =========================
     START
  ========================= */
  preloadAll()
    .then(init)
    .catch((err) => console.error("LOAD ERROR:", err));
})();