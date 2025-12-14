// js/game/enemy-config.js
// Called by main.js after creating each enemy

window.configureEnemy = function(enemy, typeId) {
  enemy.typeId = typeId;
  
  // Assign idle animation (correct sheet from loader)
  enemy.idleSheet = Assets.sheets[`enemy_type${typeId}`];
  
  // Assign correct beat sheet
  if (typeId === 3) {
    // runner uses beat2
    enemy.beatSheet = Assets.sheets["beat_beat2"];
  } else {
    // laydown + alert use beat1
    enemy.beatSheet = Assets.sheets["beat_beat1"];
  }
  
  // Safety checks
  if (!enemy.idleSheet) console.warn("Missing idle sheet for enemy type:", typeId);
  if (!enemy.beatSheet) console.warn("Missing beat sheet for enemy type:", typeId);
};