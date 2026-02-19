/** 戰鬥系統 */
function hideCombatSpells() {
  const el = document.getElementById('combatSpells');
  if (el) el.classList.remove('show');
}

function clearTargeting() {
  GameState.targeting = null;
  document.querySelectorAll('.enemy-slot').forEach(el => el.classList.remove('targetable', 'targeting'));
}

function playAnimation(type, callback, targetIdx = 0) {
  const playerSprite = document.getElementById('playerSprite');
  const enemySlots = document.querySelectorAll('.enemy-slot');
  const enemySprite = enemySlots[targetIdx]?.querySelector('.enemy-emoji-wrap');
  if (!enemySprite) {
    if (callback) callback();
    return;
  }
  playerSprite?.classList.remove('animate-attack', 'animate-defend', 'animate-escape', 'animate-magic', 'animate-hit');
  enemySlots.forEach(s => s.querySelector('.enemy-emoji-wrap')?.classList.remove('animate-hit'));
  if (type === 'attack' || type === 'magic') {
    playerSprite?.classList.add(type === 'magic' ? 'animate-magic' : 'animate-attack');
    setTimeout(() => {
      enemySprite.classList.add('animate-hit');
      setTimeout(() => {
        playerSprite?.classList.remove('animate-attack', 'animate-magic');
        enemySprite.classList.remove('animate-hit');
        if (callback) callback();
      }, 200);
    }, 200);
  } else if (type === 'defend') {
    playerSprite?.classList.add('animate-defend');
    setTimeout(() => {
      playerSprite?.classList.remove('animate-defend');
      if (callback) callback();
    }, 500);
  } else if (type === 'escape') {
    playerSprite?.classList.add('animate-escape');
    setTimeout(() => {
      playerSprite?.classList.remove('animate-escape');
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
      player.def += 1;
      player.hp = player.maxHp;
      player.mp = player.maxMp;
      log(`🎉 升級！Lv.${player.level} - HP+5、MP+3、攻擊+2、防禦+1、HP/MP 全滿`, 'levelup');
      if (player.exp >= this.getExpNeed()) this.checkLevelUp();
    }
  },

  getAliveEnemies() {
    return GameState.enemies.filter(e => e.hp > 0);
  },

  startFight() {
    if (GameState.inCombat) return;
    const playerLevel = GameState.player.level;
    const maxEnemyLv = Math.max(...enemies.map(e => e.level));
    const minLv = Math.max(1, playerLevel - 2);
    const maxLv = Math.min(maxEnemyLv, playerLevel + 1);
    let pool = enemies.filter(e => e.level >= minLv && e.level <= maxLv);
    if (pool.length === 0) pool = enemies.filter(e => e.level >= maxEnemyLv - 1);
    if (pool.length === 0) pool = enemies;
    const count = Math.max(1, Math.min(pool.length, Math.floor(Math.random() * 3) + 2));
    GameState.enemies = [];
    for (let i = 0; i < count; i++) {
      const base = pool[Math.floor(Math.random() * pool.length)];
      GameState.enemies.push({
        ...base,
        maxHp: base.hp,
        def: base.def ?? 0,
        frozen: false,
        stunned: 0,
        burnTurns: 0,
        burnDmg: 0,
        idx: i
      });
    }
    GameState.inCombat = true;
    GameState.targeting = null;
    const spellsEl = document.getElementById('combatSpells');
    if (spellsEl) spellsEl.classList.remove('show');
    const names = GameState.enemies.map(e => e.name).join('、');
    log(`遇到 ${names}！`, 'damage');
    UISystem.update();
  },

  endCombat() {
    GameState.enemies = [];
    GameState.inCombat = false;
    GameState.targeting = null;
    UISystem.update();
  },

  enterTargetMode(action) {
    if (this.getAliveEnemies().length === 0) return;
    if (this.getAliveEnemies().length === 1 && action !== 'attack') {
      const spell = SPELLS.find(s => s.id === action);
      if (spell && spell.type === 'attack') {
        this.doSpellOnTarget(action, 0);
        return;
      }
    }
    GameState.targeting = action;
    hideCombatSpells();
    UISystem.update();
  },

  onEnemyTargetClick(idx) {
    const { targeting } = GameState;
    if (!targeting) return;
    const alive = this.getAliveEnemies();
    const target = alive.find(e => e.idx === idx);
    if (!target) return;
    if (targeting === 'attack') {
      this.doAttack(target.idx);
    } else {
      this.doSpellOnTarget(targeting, target.idx);
    }
    clearTargeting();
  },

  enemyTurns(defending = false) {
    const { player } = GameState;
    const alive = this.getAliveEnemies();
    if (alive.length === 0) {
      this.endCombat();
      return;
    }
    let idx = 0;
    const processNext = () => {
      if (idx >= alive.length) {
        UISystem.update();
        return;
      }
      const enemy = alive[idx];
      idx++;
      if (enemy.burnTurns > 0) {
        enemy.hp -= enemy.burnDmg;
        enemy.burnTurns--;
        log(`${enemy.name} 受到燃燒傷害 ${enemy.burnDmg} 點`, 'damage');
        UISystem.update();
        if (enemy.hp <= 0) {
          player.gold += enemy.gold;
          player.exp += enemy.exp;
          log(`擊敗 ${enemy.name}！獲得 ${enemy.gold} 金幣、${enemy.exp} 經驗`, 'gold');
          this.checkLevelUp();
        }
        if (GameState.enemies.every(e => e.hp <= 0)) {
          this.endCombat();
          return;
        }
        if (player.hp <= 0) return;
        setTimeout(processNext, 300);
        return;
      }
      if (enemy.frozen) {
        enemy.frozen = false;
        log(`${enemy.name} 被凍結，無法行動！`, 'heal');
        UISystem.update();
        setTimeout(processNext, 300);
        return;
      }
      if (enemy.stunned > 0) {
        enemy.stunned--;
        log(`${enemy.name} 被電擊麻痺，無法行動！`, 'heal');
        UISystem.update();
        setTimeout(processNext, 300);
        return;
      }
      const enemySlot = document.querySelector(`.enemy-slot[data-idx="${enemy.idx}"]`);
      const enemySprite = enemySlot?.querySelector('.enemy-emoji-wrap');
      const playerSprite = document.getElementById('playerSprite');
      if (enemySprite) enemySprite.classList.add('animate-attack');
      setTimeout(() => {
        if (enemySprite) enemySprite.classList.remove('animate-attack');
        playerSprite?.classList.add('animate-hit');
        setTimeout(() => {
          playerSprite?.classList.remove('animate-hit');
          let dmg = Math.max(1, enemy.atk - Math.floor(Math.random() * 2));
          dmg = Math.max(1, dmg - (player.def ?? 0));
          if (defending) dmg = Math.max(1, Math.floor(dmg * (1 - RPG.DEFEND_DAMAGE_REDUCE)));
          player.hp -= dmg;
          log(`${enemy.name} 攻擊造成 ${dmg} 點傷害`, 'damage');
          if (player.hp <= 0) {
            player.hp = 0;
            log('你被擊敗了！遊戲結束', 'damage');
            this.endCombat();
          } else {
            UISystem.update();
            setTimeout(processNext, 400);
          }
        }, 400);
      }, 300);
    };
    processNext();
  },

  doAttack(targetIdx) {
    const { player, enemies } = GameState;
    const enemy = enemies.find(e => e.idx === targetIdx && e.hp > 0);
    if (!enemy || player.hp <= 0) return;
    hideCombatSpells();

    playAnimation('attack', () => {
      let dmg = Math.max(1, player.atk - Math.floor(Math.random() * 2));
      dmg = Math.max(1, dmg - (enemy.def ?? 0));
      enemy.hp -= dmg;
      log(`你攻擊 ${enemy.name} 造成 ${dmg} 點傷害`, 'damage');
      UISystem.update();

      if (enemy.hp <= 0) {
        player.gold += enemy.gold;
        player.exp += enemy.exp;
        log(`擊敗 ${enemy.name}！獲得 ${enemy.gold} 金幣、${enemy.exp} 經驗`, 'gold');
        this.checkLevelUp();
      }
      if (this.getAliveEnemies().length === 0) {
        this.endCombat();
        return;
      }
      this.enemyTurns(false);
    }, targetIdx);
  },

  doAttackClick() {
    const alive = this.getAliveEnemies();
    if (alive.length === 1) {
      this.doAttack(alive[0].idx);
    } else {
      this.enterTargetMode('attack');
    }
  },

  doDefend() {
    const { player, enemies } = GameState;
    if (enemies.length === 0 || player.hp <= 0) return;
    hideCombatSpells();
    clearTargeting();

    playAnimation('defend', () => {
      log('你採取防禦姿態', 'heal');
      this.enemyTurns(true);
    });
  },

  doSpellOnTarget(spellId, targetIdx) {
    const { player, enemies } = GameState;
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
      playAnimation('magic', () => {
        player.mp -= spell.mp;
        const healAmt = Math.min(spell.amount, player.maxHp - player.hp);
        player.hp += healAmt;
        log(`${spell.name} 恢復 ${healAmt} HP（消耗 ${spell.mp} MP）`, 'heal');
        UISystem.update();
        this.enemyTurns(false);
      });
      return;
    }

    const enemy = enemies.find(e => e.idx === targetIdx && e.hp > 0);
    if (!enemy) return;

    playAnimation('magic', () => {
      player.mp -= spell.mp;
      const base = Math.max(1, player.atk - Math.floor(Math.random() * 2));
      let dmg = Math.max(1, Math.floor(base * spell.mult) + Math.floor(Math.random() * (spell.bonus + 1)));
      if (!spell.ignoreDef) dmg = Math.max(1, dmg - (enemy.def ?? 0));
      enemy.hp -= dmg;
      let msg = `${spell.name} 對 ${enemy.name} 造成 ${dmg} 點傷害（消耗 ${spell.mp} MP）`;
      if (spell.dotTurns) {
        enemy.burnTurns = spell.dotTurns;
        enemy.burnDmg = spell.dotDmg;
        msg += '，敵人燃燒中！';
      }
      if (spell.freeze) {
        enemy.frozen = true;
        msg += '，敵人被凍結！';
      }
      if (spell.stunChance && Math.random() < spell.stunChance) {
        enemy.stunned = spell.stunTurns;
        msg += '，敵人被電擊麻痺！';
      }
      log(msg, 'heal');
      UISystem.update();

      if (enemy.hp <= 0) {
        player.gold += enemy.gold;
        player.exp += enemy.exp;
        log(`擊敗 ${enemy.name}！獲得 ${enemy.gold} 金幣、${enemy.exp} 經驗`, 'gold');
        this.checkLevelUp();
      }
      if (this.getAliveEnemies().length === 0) {
        this.endCombat();
        return;
      }
      this.enemyTurns(false);
    }, targetIdx);
  },

  doSpell(spellId) {
    const spell = SPELLS.find(s => s.id === spellId);
    if (!spell) return;
    if (spell.type === 'heal') {
      this.doSpellOnTarget(spellId, -1);
      return;
    }
    const alive = this.getAliveEnemies();
    if (alive.length === 0) return;
    if (alive.length === 1) {
      this.doSpellOnTarget(spellId, alive[0].idx);
    } else {
      this.enterTargetMode(spellId);
    }
  },

  doEscape() {
    const { enemies } = GameState;
    if (enemies.length === 0) return;
    hideCombatSpells();
    clearTargeting();

    playAnimation('escape', () => {
      if (Math.random() < RPG.ESCAPE_CHANCE) {
        log('成功逃脫！', 'heal');
        this.endCombat();
      } else {
        log('逃跑失敗！', 'damage');
        this.enemyTurns(false);
      }
    });
  },

  heal() {
    const { player } = GameState;
    if (player.gold >= 5 && player.hp < player.maxHp && GameState.inCombat) {
      hideCombatSpells();
      clearTargeting();
      player.gold -= 5;
      player.hp = Math.min(player.maxHp, player.hp + 10);
      log('治療恢復 10 HP', 'heal');
      this.enemyTurns(false);
    }
  }
};
