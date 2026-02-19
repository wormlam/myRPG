/** 地圖與移動 */
const MapSystem = {
  render() {
    const grid = $('mapGrid');
    if (!grid) return;
    const { player } = GameState;
    grid.innerHTML = '';
    for (let y = 0; y < RPG.MAP_SIZE; y++) {
      for (let x = 0; x < RPG.MAP_SIZE; x++) {
        const cell = document.createElement('div');
        cell.className = 'map-cell' + (player.px === x && player.py === y ? ' player' : '');
        cell.textContent = (player.px === x && player.py === y) ? '🧑' : '';
        grid.appendChild(cell);
      }
    }
  },

  tryMove(dx, dy) {
    if (GameState.inCombat) return;
    const { player } = GameState;
    const nx = (player.px ?? 5) + dx;
    const ny = (player.py ?? 5) + dy;
    if (nx < 0 || nx >= RPG.MAP_SIZE || ny < 0 || ny >= RPG.MAP_SIZE) return;
    player.px = nx;
    player.py = ny;
    this.render();
    if (Math.random() < RPG.ENCOUNTER_CHANCE) {
      window.dispatchEvent(new CustomEvent('encounter'));
    }
  }
};
