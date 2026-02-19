/** 遊戲狀態 */
const GameState = {
  player: { ...defaultPlayer() },
  enemies: [],
  inCombat: false,
  targeting: null,

  reset() {
    Object.assign(this.player, defaultPlayer());
    this.enemies = [];
    this.targeting = null;
    this.inCombat = false;
  },

  loadFromSave(data) {
    Object.assign(this.player, defaultPlayer(), data);
    this.player.px = this.player.px ?? 5;
    this.player.py = this.player.py ?? 5;
    this.enemies = [];
    this.targeting = null;
    this.inCombat = false;
  }
};
