/** 戰鬥系統 */
function playAnimation(type, callback) {
  const playerSprite = document.getElementById('playerSprite');
  const enemySprite = document.getElementById('enemySprite');
  playerSprite.classList.remove('animate-attack', 'animate-defend', 'animate-escape', 'animate-hit');
  enemySprite.classList.remove('animate-hit');
  if (type === 'attack') {
    playerSprite.classList.add('animate-attack');
    setTimeout(() => {
      enemySprite.classList.add('animate-hit');
      setTimeout(() => {
        playerSprite.classList.remove('animate-attack');
        enemySprite.classList.remove('animate-hit');
        if (callback) callback();
      }, 200);
    }, 200);
  } else if (type === 'defend') {
    playerSprite.classList.add('animate-defend');
    setTimeout(() => {
      playerSprite.classList.remove('animate-defend');
      if (callback) callback();
    }, 500);
  } else if (type === 'escape') {
    playerSprite.classList.add('animate-escape');
    setTimeout(() => {
      playerSprite.classList.remove('animate-escape');
      if (callback) callback();
    }, 400);
  } else if (callback) callback();
}

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
  },

  endCombat() {
    GameState.enemy = null;
    GameState.inCombat = false;
    UISystem.update();
  },

  enemyAttack(defending = false) {
    const { player, enemy } = GameState;
    if (!enemy) return;
    const playerSprite = document.getElementById('playerSprite');
    const enemySprite = document.getElementById('enemySprite');
    enemySprite.classList.add('animate-attack');
    setTimeout(() => {
      enemySprite.classList.remove('animate-attack');
      playerSprite.classList.add('animate-hit');
      setTimeout(() => {
        playerSprite.classList.remove('animate-hit');
        let dmg = Math.max(1, enemy.atk - Math.floor(Math.random() * 2));
        if (defending) dmg = Math.max(1, Math.floor(dmg * (1 - RPG.DEFEND_DAMAGE_REDUCE)));
        player.hp -= dmg;
        log(`${enemy.name} 攻擊造成 ${dmg} 點傷害`, 'damage');
        if (player.hp <= 0) {
          player.hp = 0;
          log('你被擊敗了！遊戲結束', 'damage');
          this.endCombat();
        } else {
          UISystem.update();
        }
      }, 400);
    }, 300);
  },

  doAttack() {
    const { player, enemy } = GameState;
    if (!enemy || player.hp <= 0) return;

    playAnimation('attack', () => {
      const dmg = Math.max(1, player.atk - Math.floor(Math.random() * 2));
      enemy.hp -= dmg;
      log(`你攻擊造成 ${dmg} 點傷害`, 'damage');

      if (enemy.hp <= 0) {
        player.gold += enemy.gold;
        player.exp += enemy.exp;
        log(`擊敗 ${enemy.name}！獲得 ${enemy.gold} 金幣、${enemy.exp} 經驗`, 'gold');
        this.checkLevelUp();
        this.endCombat();
        return;
      }
      this.enemyAttack(false);
    });
  },

  doDefend() {
    const { player, enemy } = GameState;
    if (!enemy || player.hp <= 0) return;

    playAnimation('defend', () => {
      log('你採取防禦姿態', 'heal');
      this.enemyAttack(true);
    });
  },

  doEscape() {
    const { enemy } = GameState;
    if (!enemy) return;

    playAnimation('escape', () => {
      if (Math.random() < RPG.ESCAPE_CHANCE) {
        log('成功逃脫！', 'heal');
        this.endCombat();
      } else {
        log('逃跑失敗！', 'damage');
        this.enemyAttack(false);
      }
    });
  },

  heal() {
    const { player } = GameState;
    if (player.gold >= 5 && player.hp < player.maxHp && GameState.inCombat) {
      player.gold -= 5;
      player.hp = Math.min(player.maxHp, player.hp + 10);
      log('治療恢復 10 HP', 'heal');
      this.enemyAttack(false);
    }
  }
};
