/** 戰鬥系統 */
function hideCombatSpells() {
  const el = document.getElementById('combatSpells');
  if (el) el.classList.remove('show');
}

function playAnimation(type, callback) {
  const playerSprite = document.getElementById('playerSprite');
  const enemySprite = document.getElementById('enemySprite');
  playerSprite.classList.remove('animate-attack', 'animate-defend', 'animate-escape', 'animate-magic', 'animate-hit');
  enemySprite.classList.remove('animate-hit');
  if (type === 'attack' || type === 'magic') {
    playerSprite.classList.add(type === 'magic' ? 'animate-magic' : 'animate-attack');
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
      player.maxMp += 3;
      player.atk += 2;
      player.hp = player.maxHp;
      player.mp = player.maxMp;
      log(`🎉 升級！Lv.${player.level} - HP+5、MP+3、攻擊+2、HP/MP 全滿`, 'levelup');
      if (player.exp >= this.getExpNeed()) this.checkLevelUp();
    }
  },

  startFight() {
    if (GameState.inCombat) return;
    const base = enemies[Math.floor(Math.random() * enemies.length)];
    GameState.enemy = { ...base, maxHp: base.hp, frozen: false };
    GameState.inCombat = true;
    const spellsEl = document.getElementById('combatSpells');
    if (spellsEl) spellsEl.classList.remove('show');
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
    if (enemy.frozen) {
      enemy.frozen = false;
      log(`${enemy.name} 被凍結，無法行動！`, 'heal');
      UISystem.update();
      return;
    }
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
    hideCombatSpells();

    playAnimation('attack', () => {
      const dmg = Math.max(1, player.atk - Math.floor(Math.random() * 2));
      enemy.hp -= dmg;
      log(`你攻擊造成 ${dmg} 點傷害`, 'damage');
      UISystem.update();

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
    hideCombatSpells();

    playAnimation('defend', () => {
      log('你採取防禦姿態', 'heal');
      this.enemyAttack(true);
    });
  },

  doSpell(spellId) {
    const { player, enemy } = GameState;
    const spell = SPELLS.find(s => s.id === spellId);
    if (!spell || player.hp <= 0) return;
    if (player.level < spell.level) {
      log(`需要 Lv.${spell.level} 才能使用 ${spell.name}`, 'damage');
      return;
    }
    if (player.mp < spell.mp) {
      log(`MP 不足（需要 ${spell.mp}）`, 'damage');
      return;
    }
    hideCombatSpells();

    if (spell.type === 'heal') {
      if (!enemy) return;
      playAnimation('magic', () => {
        player.mp -= spell.mp;
        const healAmt = Math.min(spell.amount, player.maxHp - player.hp);
        player.hp += healAmt;
        log(`${spell.name} 恢復 ${healAmt} HP（消耗 ${spell.mp} MP）`, 'heal');
        UISystem.update();
        this.enemyAttack(false);
      });
      return;
    }

    if (!enemy) return;
    playAnimation('magic', () => {
      player.mp -= spell.mp;
      const base = Math.max(1, player.atk - Math.floor(Math.random() * 2));
      let dmg = Math.max(1, Math.floor(base * spell.mult) + Math.floor(Math.random() * (spell.bonus + 1)));
      enemy.hp -= dmg;
      let msg = `${spell.name} 造成 ${dmg} 點傷害（消耗 ${spell.mp} MP）`;
      if (spell.freezeChance && Math.random() < spell.freezeChance) {
        enemy.frozen = true;
        msg += '，敵人被凍結！';
      }
      log(msg, 'heal');
      UISystem.update();

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

  doEscape() {
    const { enemy } = GameState;
    if (!enemy) return;
    hideCombatSpells();

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
      hideCombatSpells();
      player.gold -= 5;
      player.hp = Math.min(player.maxHp, player.hp + 10);
      log('治療恢復 10 HP', 'heal');
      this.enemyAttack(false);
    }
  }
};
