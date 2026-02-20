/**
 * 地圖與移動系統
 * 依賴：config (RPG), data/world (MAPS, TERRAIN, GATEKEEPERS, COMPANIONS), state, utils ($, log), ui
 */
const MapSystem = {
  getCurrentMap() {
    const mapId = GameState.player?.mapId ?? 'meadow';
    return MAPS.find(m => m.id === mapId) || MAPS[0];
  },

  getGatekeeperAt(x, y) {
    const map = this.getCurrentMap();
    if (!map.gatekeepers) return null;
    const gk = map.gatekeepers.find(g => g.x === x && g.y === y);
    if (!gk) return null;
    const defeated = GameState.defeatedGatekeepers || [];
    if (defeated.includes(gk.bossId)) return { ...gk, defeated: true };
    return { ...gk, defeated: false };
  },

  getCompanionAt(x, y) {
    const map = this.getCurrentMap();
    if (!map.companions) return null;
    const comp = map.companions.find(c => c.x === x && c.y === y);
    if (!comp) return null;
    const recruited = GameState.recruitedCompanions || [];
    if (recruited.some(c => c.id === comp.id)) return { ...comp, recruited: true };
    return { ...comp, recruited: false };
  },

  render() {
    const grid = $('mapGrid');
    if (!grid) return;
    const { player } = GameState;
    const map = this.getCurrentMap();
    const size = map.size ?? RPG.MAP_SIZE ?? 10;
    const terrain = TERRAIN[map.terrain] || TERRAIN.grass;

    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, 1.8rem)`;
    grid.style.gridTemplateRows = `repeat(${size}, 1.8rem)`;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cell = document.createElement('div');
        const isPlayer = player.px === x && player.py === y;
        const gatekeeper = this.getGatekeeperAt(x, y);
        const companion = this.getCompanionAt(x, y);

        let cellClass = 'map-cell ' + (terrain.class || 'terrain-grass');
        if (isPlayer) cellClass += ' player';
        if (gatekeeper && !gatekeeper.defeated) cellClass += ' gatekeeper';
        if (companion && !companion.recruited) cellClass += ' companion';

        cell.className = cellClass;
        cell.dataset.x = x;
        cell.dataset.y = y;

        if (isPlayer) {
          cell.textContent = '🧑';
        } else if (gatekeeper && !gatekeeper.defeated) {
          const boss = GATEKEEPERS[gatekeeper.bossId];
          cell.textContent = boss?.emoji || '🚪';
        } else if (companion && !companion.recruited) {
          const comp = COMPANIONS[companion.id];
          cell.textContent = comp?.emoji || '🤝';
        } else {
          cell.textContent = terrain.emoji || '';
        }
        grid.appendChild(cell);
      }
    }
  },

  tryMove(dx, dy) {
    if (GameState.inCombat || GameState.gameOver) return;
    const { player } = GameState;
    const map = this.getCurrentMap();
    const size = map.size ?? RPG.MAP_SIZE ?? 10;

    const nx = (player.px ?? 5) + dx;
    const ny = (player.py ?? 5) + dy;
    if (nx < 0 || nx >= size || ny < 0 || ny >= size) return;

    const gatekeeper = this.getGatekeeperAt(nx, ny);
    if (gatekeeper) {
      if (gatekeeper.defeated) {
        this.switchMap(gatekeeper.nextMap);
        return;
      }
      GameState.pendingGatekeeper = gatekeeper;
      UISystem.showGatekeeperModal(gatekeeper);
      return;
    }

    const companion = this.getCompanionAt(nx, ny);
    if (companion && !companion.recruited) {
      GameState.pendingCompanion = companion;
      CombatSystem.startCompanionFight(companion.id);
      return;
    }

    player.px = nx;
    player.py = ny;
    this.render();
    const lv = GameState.player?.level ?? 1;
    const encChance = lv <= 10 ? RPG.ENCOUNTER_CHANCE_EARLY : (lv <= 20 ? RPG.ENCOUNTER_CHANCE_MID : RPG.ENCOUNTER_CHANCE);
    if (Math.random() < encChance) {
      window.dispatchEvent(new CustomEvent('encounter'));
    }
  },

  switchMap(nextMapId) {
    const { player } = GameState;
    const nextMap = MAPS.find(m => m.id === nextMapId);
    if (!nextMap) return;
    player.mapId = nextMapId;
    player.px = 0;
    player.py = Math.floor((nextMap.size ?? 10) / 2);
    this.render();
    log(`進入 ${nextMap.name}！`, 'heal');
    UISystem.update();
  },

  onGatekeeperDefeated() {
    const gk = GameState.pendingGatekeeper;
    if (!gk) return;
    GameState.defeatedGatekeepers = GameState.defeatedGatekeepers || [];
    if (!GameState.defeatedGatekeepers.includes(gk.bossId)) {
      GameState.defeatedGatekeepers.push(gk.bossId);
    }
    GameState.pendingGatekeeper = null;
    this.switchMap(gk.nextMap);
  }
};
