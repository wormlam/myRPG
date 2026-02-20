/**
 * 依等級與分配點數同步玩家攻、魔、防
 */
function syncPlayerStats() {
  const p = GameState.player;
  const baseAtk = 5 + (p.levelUpBonusAtk ?? 0);
  const baseMag = 5 + (p.levelUpBonusMag ?? 0);
  const baseDef = (p.levelUpBonusDef ?? 0);
  p.atk = baseAtk + (p.allocatedAtk ?? 0);
  p.mag = baseMag + (p.allocatedMag ?? 0);
  p.def = baseDef + (p.allocatedDef ?? 0);
}

/**
 * 遊戲狀態
 * 依賴：config, data/items (defaultPlayer)
 */
const GameState = {
  player: { ...defaultPlayer() },
  enemies: [],
  inCombat: false,
  targeting: null,
  combatRewards: { gold: 0, exp: 0 },
  defeatedGatekeepers: [],
  pendingGatekeeper: null,
  recruitedCompanions: [],
  pendingCompanion: null,
  gameOver: false,
  isGatekeeperFight: false,
  isCompanionFight: false,

  reset() {
    Object.assign(this.player, defaultPlayer());
    this.player.inventory = [];
    syncPlayerStats();
    this.enemies = [];
    this.targeting = null;
    this.combatRewards = { gold: 0, exp: 0 };
    this.defeatedGatekeepers = [];
    this.pendingGatekeeper = null;
    this.recruitedCompanions = [];
    this.pendingCompanion = null;
    this.inCombat = false;
    this.gameOver = false;
    this.isGatekeeperFight = false;
    this.isCompanionFight = false;
  },

  loadFromSave(saveData) {
    this.loadRecalculated = { alloc: false, rand: false };
    const data = saveData?.player ?? saveData;
    const needsBonusMigration = !('levelUpBonusAtk' in data);
    Object.assign(this.player, defaultPlayer(), data);
    this.player.px = this.player.px ?? 5;
    this.player.py = this.player.py ?? 5;
    this.player.mapId = this.player.mapId ?? 'meadow';
    this.player.inventory = this.player.inventory ?? [];
    if (this.player.abilityPoints === undefined) {
      this.player.allocatedAtk = 0;
      this.player.allocatedMag = 0;
      this.player.allocatedDef = 0;
      this.player.abilityPoints = 0;
    }
    if (needsBonusMigration) {
      const lv = this.player.level ?? 1;
      this.player.levelUpBonusAtk = (lv - 1) * 2;
      this.player.levelUpBonusMag = (lv - 1) * 2;
      this.player.levelUpBonusDef = (lv - 1) * 1;
    }
    const lv = this.player.level ?? 1;
    const expectedAlloc = (lv - 1) * 4;
    const totalAlloc = (this.player.allocatedAtk ?? 0) + (this.player.allocatedMag ?? 0) + (this.player.allocatedDef ?? 0) + (this.player.abilityPoints ?? 0);
    if (totalAlloc !== expectedAlloc) {
      this.player.allocatedAtk = 0;
      this.player.allocatedMag = 0;
      this.player.allocatedDef = 0;
      this.player.abilityPoints = expectedAlloc;
      this.loadRecalculated.alloc = true;
    }
    if (!needsBonusMigration) {
      const expectedRand = (lv - 1) * 1;
      const totalRand = (this.player.levelUpBonusAtk ?? 0) + (this.player.levelUpBonusMag ?? 0) + (this.player.levelUpBonusDef ?? 0);
      if (totalRand !== expectedRand && expectedRand >= 0) {
        this.loadRecalculated.rand = true;
        if (totalRand > 0) {
          const f = expectedRand / totalRand;
          this.player.levelUpBonusAtk = Math.round((this.player.levelUpBonusAtk ?? 0) * f);
          this.player.levelUpBonusMag = Math.round((this.player.levelUpBonusMag ?? 0) * f);
          this.player.levelUpBonusDef = Math.round((this.player.levelUpBonusDef ?? 0) * f);
          const adj = expectedRand - ((this.player.levelUpBonusAtk ?? 0) + (this.player.levelUpBonusMag ?? 0) + (this.player.levelUpBonusDef ?? 0));
          if (adj !== 0) this.player.levelUpBonusAtk = (this.player.levelUpBonusAtk ?? 0) + adj;
        } else {
          const stats = ['levelUpBonusAtk', 'levelUpBonusMag', 'levelUpBonusDef'];
          let remain = expectedRand;
          for (let i = 0; i < 2 && remain > 0; i++) {
            const add = Math.floor(Math.random() * (remain + 1));
            this.player[stats[i]] = add;
            remain -= add;
          }
          this.player[stats[2]] = remain;
        }
      }
    }
    this.enemies = [];
    this.targeting = null;
    this.combatRewards = { gold: 0, exp: 0 };
    this.defeatedGatekeepers = saveData?.defeatedGatekeepers ?? [];
    this.pendingGatekeeper = null;
    const loaded = saveData?.recruitedCompanions ?? [];
    this.recruitedCompanions = loaded.map((c, i) => ({ ...c, isActive: c.isActive !== undefined ? c.isActive : i < 2 }));
    this.pendingCompanion = null;
    this.inCombat = false;
    this.gameOver = false;
    this.isGatekeeperFight = false;
    this.isCompanionFight = false;
    syncPlayerStats();
  }
};
