/** 遊戲狀態 */
const GameState = {
  player: { ...defaultPlayer() },
  enemy: null,
  inCombat: false,

  reset() {
    Object.assign(this.player, defaultPlayer());
    this.enemy = null;
    this.inCombat = false;
  },

  loadFromSave(data) {
    Object.assign(this.player, data);
    this.player.px = this.player.px ?? 5;
    this.player.py = this.player.py ?? 5;
    this.enemy = null;
    this.inCombat = false;
  }
};
