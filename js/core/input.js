// js/core/input.js
window.Input = { jump: false };

window.addEventListener("click", () => {
  if (!window.CONFIG) return;
  if (!CONFIG.GAME_STARTED) {
    CONFIG.GAME_STARTED = true;
    // start bgm safely if loaded
    if (Assets.sounds && Assets.sounds.bgm) Assets.loopSound("bgm");
    return;
  }
  Input.jump = true;
});