/** 戰鬥系統 */
const CombatSystem = {
  getExpNeed() {
    return GameState.player.level * 10;
  },

  checkLevelUp() {
    const { player } = GameState;
    const need = this.getExpNeed();
    if (player.exp >= need) {
      player.exp -= need;
      player.level++;
      player.maxHp += 5;
      player.atk += 2;
      player.hp = player.maxHp;
      log(`🎉 升級！Lv.${player.level} - HP+5、攻擊+2、HP 全滿`, 'levelup');
      if (player.exp >= this.getExpNeed()) this.checkLevelUp();
    }
  },

  startFight() {
    if (GameState.inCombat) return;
    GameState.enemy = { ...enemies[Math.floor(Math.random() * enemies.length)] };
    GameState.inCombat = true;
    log(`遇到 ${GameState.enemy.name}！`, 'damage');
    UISystem.update();
    this.combatTurn();
  },

  combatTurn() {
    const { player, enemy } = GameState;
    if (!enemy || player.hp <= 0) return;

    const dmg = Math.max(1, player.atk - Math.floor(Math.random() * 2));
    enemy.hp -= dmg;
    log(`你攻擊造成 ${dmg} 點傷害`, 'damage');

    if (enemy.hp <= 0) {
      player.gold += enemy.gold;
      player.exp += enemy.exp;
      log(`擊敗 ${enemy.name}！獲得 ${enemy.gold} 金幣、${enemy.exp} 經驗`, 'gold');
      this.checkLevelUp();
      GameState.enemy = null;
      GameState.inCombat = false;
      UISystem.update();
      return;
    }

    const enemyDmg = Math.max(1, enemy.atk - Math.floor(Math.random() * 2));
    player.hp -= enemyDmg;
    log(`${enemy.name} 攻擊造成 ${enemyDmg} 點傷害`, 'damage');

    if (player.hp <= 0) {
      player.hp = 0;
      log('你被擊敗了！遊戲結束', 'damage');
      GameState.enemy = null;
      GameState.inCombat = false;
      UISystem.update();
      return;
    }

    UISystem.update();
    setTimeout(() => this.combatTurn(), 800);
  },

  heal() {
    const { player } = GameState;
    if (player.gold >= 5 && player.hp < player.maxHp && !GameState.inCombat) {
      player.gold -= 5;
      player.hp = Math.min(player.maxHp, player.hp + 10);
      log('治療恢復 10 HP', 'heal');
      UISystem.update();
    }
  }
};
