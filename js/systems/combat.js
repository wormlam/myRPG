/**
 * 戰鬥系統
 * 依賴：data/items (SPELLS), data/world (GATEKEEPERS, COMPANIONS), data/enemies (enemies, ENEMY_STATS_BY_TIER, ELITE_BY_MAP), state, utils, ui
 */
function hideCombatSpells() {
  const el = document.getElementById('combatSpells');
  if (el) el.classList.remove('show');
}

function clearTargeting() {
  GameState.targeting = null;
  document.querySelectorAll('.enemy-slot').forEach(el => el.classList.remove('targetable', 'targeting'));
}

function clearAllCombatAnimations() {
  document.querySelectorAll('.animate-attack, .animate-defend, .animate-magic, .animate-hit, .animate-escape').forEach(el => el.classList.remove('animate-attack', 'animate-defend', 'animate-magic', 'animate-hit', 'animate-escape'));
}

function playAnimation(type, callback, targetIdx = 0) {
  const playerSprite = document.getElementById('playerSprite');
  const enemySlots = document.querySelectorAll('.enemy-slot');
  const enemySprite = enemySlots[targetIdx]?.querySelector('.enemy-emoji-wrap');
  if (!enemySprite && type !== 'defend' && type !== 'escape') {
    if (callback) callback();
    return;
  }
  clearAllCombatAnimations();
  if (type === 'attack' || type === 'magic') {
    playerSprite?.classList.add(type === 'magic' ? 'animate-magic' : 'animate-attack');
    setTimeout(() => {
      if (enemySprite) enemySprite.classList.add('animate-hit');
      setTimeout(() => {
        clearAllCombatAnimations();
        if (callback) callback();
      }, 200);
    }, 200);
  } else if (type === 'defend') {
    playerSprite?.classList.add('animate-defend');
    document.querySelectorAll('#partyCompanions .companion-sprite').forEach(s => s.classList.add('animate-defend'));
    setTimeout(() => {
      clearAllCombatAnimations();
      if (callback) callback();
    }, 500);
  } else if (type === 'escape') {
    playerSprite?.classList.add('animate-escape');
    setTimeout(() => {
      clearAllCombatAnimations();
      if (callback) callback();
    }, 400);
  } else if (callback) callback();
}

function playCombatAnimation(opts, callback) {
  const { type, attacker, attackerIdx, target, targetIdx } = opts;
  clearAllCombatAnimations();
  const playerSprite = document.getElementById('playerSprite');
  const partyCompanions = document.getElementById('partyCompanions');
  const enemySlots = Array.from(document.querySelectorAll('.enemy-slot'));
  const getEnemySlot = (idx) => enemySlots.find(s => parseInt(s.dataset.idx) === idx);
  const getCompanionSprite = (idx) => partyCompanions?.children[idx];
  const getTargetHitEl = () => {
    if (target === 'player') return playerSprite;
    if (target === 'companion' && targetIdx >= 0) return getCompanionSprite(targetIdx);
    if (target === 'enemy' && targetIdx >= 0) return getEnemySlot(targetIdx)?.querySelector('.enemy-emoji-wrap');
    return null;
  };
  const getAttackerEl = () => {
    if (attacker === 'player') return playerSprite;
    if (attacker === 'companion' && attackerIdx >= 0) return getCompanionSprite(attackerIdx);
    if (attacker === 'enemy' && attackerIdx >= 0) return getEnemySlot(attackerIdx);
    return null;
  };
  const attackerEl = getAttackerEl();
  const targetHitEl = getTargetHitEl();
  const duration = type === 'defend' ? 500 : 400;
  if (type === 'attack' || type === 'magic') {
    const attackClass = type === 'magic' ? 'animate-magic' : 'animate-attack';
    if (attackerEl) attackerEl.classList.add(attackClass);
    setTimeout(() => {
      if (targetHitEl) targetHitEl.classList.add('animate-hit');
      setTimeout(() => {
        clearAllCombatAnimations();
        if (callback) callback();
      }, 200);
    }, 200);
  } else if (type === 'defend') {
    if (attackerEl) attackerEl.classList.add('animate-defend');
    setTimeout(() => {
      clearAllCombatAnimations();
      if (callback) callback();
    }, duration);
  } else if (callback) callback();
}

function _addEnemyDrop(enemy) {
  if (GameState.isCompanionFight) return;
  const pool = ITEMS_BY_RARITY;
  const map = MapSystem.getCurrentMap();
  const mapTier = Math.ceil(((map && map.minLv) || 1) / 10);
  let itemId = null;
  if (GameState.isGatekeeperFight && enemy.id && GATEKEEPERS[enemy.id]) {
    const arr = pool.gatekeeper;
    itemId = arr.length ? arr[Math.floor(Math.random() * arr.length)].id : null;
  } else if (enemy.isEliteTank || enemy.isEliteStrong) {
    const eligible = pool.elite.filter(i => (i.tier ?? 1) <= mapTier);
    const arr = eligible.length ? eligible : pool.elite;
    const maxTier = Math.max(...arr.map(x => x.tier ?? 1));
    const topTier = arr.filter(i => (i.tier ?? 1) === maxTier);
    const pickFrom = (topTier.length > 0 && Math.random() < 0.7) ? topTier : arr;
    itemId = pickFrom.length ? pickFrom[Math.floor(Math.random() * pickFrom.length)].id : null;
  } else if (Math.random() < 0.35) {
    const eligible = pool.common.filter(i => (i.tier ?? 1) <= mapTier);
    const arr = eligible.length ? eligible : pool.common;
    const topTier = arr.filter(i => (i.tier ?? 1) === mapTier);
    const pickFrom = (topTier.length > 0 && Math.random() < 0.7) ? topTier : arr;
    itemId = pickFrom.length ? pickFrom[Math.floor(Math.random() * pickFrom.length)].id : null;
  }
  if (itemId) {
    GameState.combatRewards.items = GameState.combatRewards.items || [];
    GameState.combatRewards.items.push(itemId);
  }
}

const CombatSystem = {
  getExpNeed(lv) { return (lv ?? GameState.player.level) * 12; },

  checkCompanionLevelUp() {
    const companions = (GameState.recruitedCompanions || []).filter(c => c.isActive);
    companions.forEach(c => {
      const need = this.getExpNeed(c.level ?? 1);
      if ((c.exp ?? 0) >= need) {
        c.exp -= need;
        c.level = Math.min(100, (c.level ?? 1) + 1);
        c.maxHp = (c.maxHp ?? c.hp ?? 20) + 5;
        c.maxMp = (c.maxMp ?? 10) + 3;
        c.atk = (c.atk ?? 5) + 2;
        c.mag = (c.mag ?? 5) + 2;
        c.def = (c.def ?? 0) + 1;
        c.hp = c.maxHp;
        c.mp = c.maxMp;
        log(`${c.name} 升級！Lv.${c.level}`, 'levelup');
        if ((c.exp ?? 0) >= this.getExpNeed(c.level)) this.checkCompanionLevelUp();
      }
    });
  },

  checkLevelUp() {
    const { player } = GameState;
    const need = this.getExpNeed();
    if (player.exp >= need) {
      player.exp -= need;
      player.level = Math.min(100, player.level + 1);
      player.maxHp += 5; player.maxMp += 3;
      player.abilityPoints = (player.abilityPoints ?? 0) + 4;
      const stats = ['atk', 'mag', 'def'];
      const names = { atk: '攻擊', mag: '魔力', def: '防禦' };
      const pick = stats[Math.floor(Math.random() * 3)];
      player.levelUpBonusAtk = (player.levelUpBonusAtk ?? 0) + (pick === 'atk' ? 1 : 0);
      player.levelUpBonusMag = (player.levelUpBonusMag ?? 0) + (pick === 'mag' ? 1 : 0);
      player.levelUpBonusDef = (player.levelUpBonusDef ?? 0) + (pick === 'def' ? 1 : 0);
      const msg = `${names[pick]}+1`;
      player.hp = player.maxHp; player.mp = player.maxMp;
      syncPlayerStats();
      log(`🎉 升級！Lv.${player.level}，HP+5 MP+3，${msg}，獲得 4 點能力可分配`, 'levelup');
      if (player.exp >= this.getExpNeed()) this.checkLevelUp();
    }
  },

  getAliveEnemies() { return GameState.enemies.filter(e => e.hp > 0); },

  startFight() {
    if (GameState.inCombat) return;
    const map = MapSystem.getCurrentMap();
    const minLv = map.minLv ?? 1, maxLv = map.maxLv ?? 100, playerLevel = GameState.player.level;
    const effectiveMin = Math.max(minLv, playerLevel - 2), effectiveMax = Math.min(maxLv, playerLevel + 2);
    const encounterLv = effectiveMin + Math.floor(Math.random() * (effectiveMax - effectiveMin + 1));
    const mapTier = Math.ceil(encounterLv / 10);
    let pool = enemies.filter(e => e.mapId === map.id);
    if (pool.length === 0) pool = enemies.filter(e => Math.abs(e.tier - mapTier) <= 1);
    if (pool.length === 0) pool = enemies;
    this._spawnEnemies(pool, false, encounterLv, map.id);
  },

  startGatekeeperFight(bossId) {
    if (GameState.inCombat) return;
    const boss = GATEKEEPERS[bossId];
    if (!boss) return;
    this._spawnEnemies([boss], true);
  },

  startCompanionFight(companionId) {
    if (GameState.inCombat) return;
    const comp = COMPANIONS[companionId];
    if (!comp) return;
    const asEnemy = { id: companionId, name: comp.name, hp: comp.hp, atk: comp.atk, mag: comp.mag ?? 0, def: comp.def ?? 0, gold: 0, exp: 0, emoji: comp.emoji };
    GameState.isCompanionFight = true;
    this._spawnEnemies([asEnemy], false, 1, null);
  },

  getParty() { return [GameState.player, ...(GameState.recruitedCompanions || []).filter(c => c.isActive)]; },
  getAliveParty() { return this.getParty().filter(p => (p.hp ?? 0) > 0); },

  _spawnEnemies(pool, isGatekeeper, encounterLv = 1, mapId = null) {
    (GameState.recruitedCompanions || []).filter(c => c.isActive).forEach(c => { c.hp = c.maxHp ?? c.hp; c.mp = c.maxMp ?? c.mp; });
    const r = Math.random();
    const lv = GameState.player?.level ?? 1;
    let count = 1;
    if (!isGatekeeper) {
      if (lv <= 10) count = r < 0.75 ? 1 : (r < 0.95 ? 2 : Math.min(3, pool.length));
      else if (lv <= 20) count = r < 0.60 ? 1 : (r < 0.90 ? 2 : Math.min(3, pool.length));
      else count = r < 0.5 ? 1 : (r < 0.85 ? 2 : Math.min(3, pool.length));
    }
    let finalPool = pool;
    if (!isGatekeeper && count === 1 && mapId && ELITE_BY_MAP[mapId]) {
      const elites = ELITE_BY_MAP[mapId];
      const rElite = Math.random();
      const tier = Math.min(10, Math.ceil(encounterLv / 10));
      const baseStats = ENEMY_STATS_BY_TIER[tier] || ENEMY_STATS_BY_TIER[1];
      if (rElite < elites.eliteTank.spawnChance) {
        const e = elites.eliteTank;
        const hp = Math.max(10, Math.floor(baseStats.hp * e.hpMult));
        const atk = Math.max(1, Math.floor(baseStats.atk * e.atkMult));
        const mag = Math.max(0, Math.floor(baseStats.mag * e.magMult));
        const def = Math.max(1, Math.floor(baseStats.def * e.defMult));
        const gold = Math.max(1, Math.floor(baseStats.gold * e.goldMult));
        const exp = Math.max(1, Math.floor(baseStats.exp * e.expMult));
        finalPool = [{
          name: e.name, emoji: e.emoji, hp, atk, mag, def, gold, exp,
          weakToSpell: e.weakToSpell, escapeTurns: e.escapeTurns, isEliteTank: true
        }];
      } else if (rElite < elites.eliteTank.spawnChance + elites.eliteStrong.spawnChance) {
        const e = elites.eliteStrong;
        const hp = Math.max(10, Math.floor(baseStats.hp * e.hpMult));
        const atk = Math.max(1, Math.floor(baseStats.atk * e.atkMult));
        const mag = Math.max(0, Math.floor(baseStats.mag * e.magMult));
        const def = Math.max(1, Math.floor(baseStats.def * e.defMult));
        const gold = Math.max(1, Math.floor(baseStats.gold * e.goldMult));
        const exp = Math.max(1, Math.floor(baseStats.exp * e.expMult));
        finalPool = [{ name: e.name, emoji: e.emoji, hp, atk, mag, def, gold, exp, isEliteStrong: true }];
      }
    }
    GameState.enemies = [];
    for (let i = 0; i < count; i++) {
      const base = finalPool[Math.floor(Math.random() * finalPool.length)];
      const actInterval = base.actInterval ?? 1;
      const mag = base.mag ?? 0;
      const maxMp = Math.max(mag * 2, 5);
      let spellIds = [];
      if (GameState.isCompanionFight && base.id) spellIds = getSpellsForCompanion(base.id) || [];
      else if (isGatekeeper && base.id) spellIds = getSpellsForGatekeeper(base.id) || [];
      else if ((base.isEliteTank || base.isEliteStrong) && mapId) spellIds = getSpellsForElite(mapId) || [];
      else if (base.prefix) {
        const pool = getSpellsForPrefix(base.prefix);
        spellIds = pool.slice(0, 8).map(s => s.id);
      }
      const enemyData = { ...base, hp: base.hp, maxHp: base.hp, mp: maxMp, maxMp, atk: base.atk, mag, def: base.def ?? 0, gold: base.gold, exp: base.exp, frozen: false, stunned: 0, burnTurns: 0, burnDmg: 0, idx: i, actCharge: actInterval > 1 ? actInterval - 1 : 0, spellIds };
      if (base.escapeTurns) {
        enemyData.escapeCountdown = base.escapeTurns;
        enemyData.weakToSpell = base.weakToSpell;
      }
      GameState.enemies.push(enemyData);
    }
    GameState.inCombat = true; GameState.targeting = null; GameState.combatRewards = { gold: 0, exp: 0, items: [] };
    GameState.isGatekeeperFight = isGatekeeper;
    if (isGatekeeper) GameState.isCompanionFight = false;
    document.getElementById('combatSpells')?.classList.remove('show');
    log(`遇到 ${GameState.enemies.map(e => e.name).join('、')}！`, 'damage');
    UISystem.update();
  },

  endCombat(won = false) {
    const { player } = GameState;
    const { gold, exp } = GameState.combatRewards;
    const wasGatekeeper = GameState.isGatekeeperFight, wasCompanion = GameState.isCompanionFight;
    const aliveCompanions = (GameState.recruitedCompanions || []).filter(c => c.isActive && (c.hp ?? 0) > 0);
    const companionCount = aliveCompanions.length;
    if (won && (gold > 0 || exp > 0)) {
      player.gold += gold;
      const totalShares = 1 + companionCount;
      const expPerShare = Math.floor(exp / totalShares);
      player.exp += expPerShare + (exp - expPerShare * totalShares);
      aliveCompanions.forEach(c => { c.exp = (c.exp ?? 0) + expPerShare; });
      log(`戰鬥結束：獲得 ${gold} 金幣、${exp} 經驗`, 'gold');
      this.checkLevelUp();
      this.checkCompanionLevelUp();
    }
    if (won && GameState.combatRewards?.items?.length) {
      GameState.combatRewards.items.forEach(id => { player.inventory = player.inventory || []; player.inventory.push(id); });
      log(`獲得物品：${GameState.combatRewards.items.map(id => ITEMS.find(i => i.id === id)?.name || id).join('、')}`, 'gold');
    }
    GameState.enemies = []; GameState.inCombat = false; GameState.targeting = null; GameState.combatRewards = { gold: 0, exp: 0, items: [] };
    GameState.isGatekeeperFight = false; GameState.isCompanionFight = false;
    if (won && wasGatekeeper && GameState.pendingGatekeeper) MapSystem.onGatekeeperDefeated();
    if (won && wasCompanion && GameState.pendingCompanion) UISystem.showRecruitModal(GameState.pendingCompanion);
    if (!won && this.getAliveParty().length === 0) GameState.gameOver = true;
    UISystem.update();
  },

  enterTargetMode(action) {
    if (this.getAliveEnemies().length === 0) return;
    if (this.getAliveEnemies().length === 1 && action !== 'attack') {
      const spell = SPELLS.find(s => s.id === action);
      if (spell && spell.type === 'attack') { this.doSpellOnTarget(action, 0); return; }
    }
    GameState.targeting = action; hideCombatSpells(); UISystem.update();
  },

  onEnemyTargetClick(idx) {
    const { targeting } = GameState;
    if (!targeting) return;
    const alive = this.getAliveEnemies();
    const target = alive.find(e => e.idx === idx);
    if (!target) return;
    if (targeting.startsWith('item:')) {
      const itemId = targeting.slice(5);
      const inv = GameState.player?.inventory || [];
      const i = inv.indexOf(itemId);
      if (i >= 0) {
        GameState.player.inventory.splice(i, 1);
        this.useItemOnTarget(itemId, target.idx);
      }
    } else if (targeting === 'attack') this.doAttack(target.idx);
    else this.doSpellOnTarget(targeting, target.idx);
    clearTargeting();
  },

  enemyTurns(defending = false) {
    const { player } = GameState;
    const alive = this.getAliveEnemies();
    if (alive.length === 0) { this.endCombat(true); return; }
    const escapeCandidates = alive.filter(e => e.escapeCountdown !== undefined);
    for (const e of escapeCandidates) {
      e.escapeCountdown--;
      if (e.escapeCountdown <= 0) {
        log(`${e.name} 趁亂逃走了！`, 'damage');
        e.hp = 0;
        if (this.getAliveEnemies().length === 0) { this.endCombat(false); return; }
      }
    }
    const stillAlive = this.getAliveEnemies();
    if (stillAlive.length === 0) { this.endCombat(false); return; }
    this.getAliveParty().forEach(p => {
      if ((p.burnTurns ?? 0) > 0) {
        p.hp = Math.max(0, (p.hp ?? 0) - (p.burnDmg ?? 0));
        p.burnTurns--;
        log(`${p === player ? '你' : p.name} 受到燃燒傷害 ${p.burnDmg ?? 0} 點`, 'damage');
      }
    });
    if (this.getAliveParty().length === 0) { this.endCombat(); return; }
    let idx = 0;
    const processNext = () => {
      if (idx >= alive.length) { UISystem.update(); return; }
      const enemy = alive[idx++];
      if (enemy.burnTurns > 0) {
        enemy.hp -= enemy.burnDmg; enemy.burnTurns--;
        log(`${enemy.name} 受到燃燒傷害 ${enemy.burnDmg} 點`, 'damage');
        if (enemy.hp <= 0) { GameState.combatRewards.gold += enemy.gold; GameState.combatRewards.exp += enemy.exp; _addEnemyDrop(enemy); log(`擊敗 ${enemy.name}！`, 'gold'); }
        if (GameState.enemies.every(e => e.hp <= 0)) { this.endCombat(true); return; }
        UISystem.update(); setTimeout(processNext, 300); return;
      }
      if (enemy.frozen) { enemy.frozen = false; log(`${enemy.name} 被凍結，無法行動！`, 'heal'); UISystem.update(); setTimeout(processNext, 300); return; }
      if (enemy.stunned > 0) { enemy.stunned--; log(`${enemy.name} 被電擊麻痺，無法行動！`, 'heal'); UISystem.update(); setTimeout(processNext, 300); return; }
      const actInterval = enemy.actInterval ?? 1;
      if (actInterval > 1) {
        if ((enemy.actCharge ?? 0) > 0) {
          enemy.actCharge--;
          log(`${enemy.name} 蓄力中，本回合無法行動`, 'heal');
          UISystem.update(); setTimeout(processNext, 300); return;
        }
        enemy.actCharge = actInterval - 1;
      }
      const aliveParty = this.getAliveParty();
      if (aliveParty.length === 0) return;
      const willDefend = Math.random() < 0.1;
      if (willDefend) {
        playCombatAnimation({ type: 'defend', attacker: 'enemy', attackerIdx: enemy.idx, target: null, targetIdx: -1 }, () => {
          log(`${enemy.name} 採取防禦姿態`, 'heal');
          UISystem.update();
          setTimeout(processNext, 300);
        });
        return;
      }
      const target = aliveParty[Math.floor(Math.random() * aliveParty.length)];
      const targetName = target === player ? '你' : target.name;
      const usableSpells = (enemy.spellIds || []).map(id => SPELLS.find(s => s.id === id)).filter(s => s && (s.type === 'attack' || s.type === 'aoe' || s.type === 'physical' || s.type === 'physical_aoe') && (enemy.mp ?? 0) >= (s.mp ?? 0));
      const useSpell = usableSpells.length > 0 && Math.random() < 0.4;
      let dmg;
      let spellUsed = null;
      let isAoe = spellUsed?.type === 'aoe' || spellUsed?.type === 'physical_aoe';
      if (useSpell && usableSpells.length > 0) {
        spellUsed = usableSpells[Math.floor(Math.random() * usableSpells.length)];
        isAoe = spellUsed.type === 'aoe' || spellUsed.type === 'physical_aoe';
        enemy.mp = Math.max(0, (enemy.mp ?? 0) - (spellUsed.mp ?? 0));
        const isPhys = spellUsed.type === 'physical' || spellUsed.type === 'physical_aoe';
        if (isPhys) {
          const atkBase = Math.max(1, (enemy.atk ?? 0) - Math.floor(Math.random() * 2));
          dmg = Math.max(1, Math.floor(atkBase * spellUsed.mult) + Math.floor(Math.random() * (spellUsed.bonus + 1)));
          if (!spellUsed.ignoreDef) dmg = Math.max(1, dmg - ((target.def ?? 0) + (target.combatBuff?.def ?? 0)));
        } else {
          const magBase = Math.max(1, (enemy.mag ?? 0) - Math.floor(Math.random() * 2));
          const effMag = (target.mag ?? 0) + (target.combatBuff?.mag ?? 0);
          dmg = Math.max(1, Math.floor(magBase * spellUsed.mult) + Math.floor(Math.random() * (spellUsed.bonus + 1)));
          if (!spellUsed.ignoreDef) dmg = Math.max(1, dmg - effMag);
          const elem = spellUsed.element;
          if (elem) { const res = target[elem + 'Res'] ?? 0; dmg = Math.max(1, dmg - res); }
        }
      } else {
        dmg = Math.max(1, enemy.atk - Math.floor(Math.random() * 2));
        const effDef = (target.def ?? 0) + (target.combatBuff?.def ?? 0);
        dmg = Math.max(1, dmg - effDef);
      }
      if (defending && target === player) dmg = Math.max(1, Math.floor(dmg * (1 - RPG.DEFEND_DAMAGE_REDUCE)));
      const targetType = target === player ? 'player' : 'companion';
      const targetIdx = target === player ? -1 : (GameState.recruitedCompanions || []).filter(c => c.isActive).indexOf(target);
      const animType = (spellUsed && (spellUsed.type === 'physical' || spellUsed.type === 'physical_aoe')) ? 'attack' : (spellUsed ? 'magic' : 'attack');
      const applyDmg = (t, d) => {
        t.hp = Math.max(0, (t.hp ?? 0) - d);
        if (spellUsed?.dotTurns) { t.burnTurns = spellUsed.dotTurns; t.burnDmg = spellUsed.dotDmg; }
        if (spellUsed?.freeze) t.frozen = true;
        if (spellUsed?.stunChance && Math.random() < spellUsed.stunChance) t.stunned = spellUsed.stunTurns;
      };
      playCombatAnimation({ type: animType, attacker: 'enemy', attackerIdx: enemy.idx, target: targetType, targetIdx }, () => {
        if (isAoe && spellUsed) {
          const isPhysAoe = spellUsed.type === 'physical_aoe';
          const baseStat = isPhysAoe ? Math.max(1, (enemy.atk ?? 0) - Math.floor(Math.random() * 2)) : Math.max(1, (enemy.mag ?? 0) - Math.floor(Math.random() * 2));
          const baseDmg = Math.floor(baseStat * spellUsed.mult) + Math.floor(Math.random() * (spellUsed.bonus + 1));
          aliveParty.forEach(t => {
            let tdmg = Math.max(1, baseDmg);
            if (!spellUsed.ignoreDef) tdmg = Math.max(1, tdmg - (isPhysAoe ? ((t.def ?? 0) + (t.combatBuff?.def ?? 0)) : ((t.mag ?? 0) + (t.combatBuff?.mag ?? 0))));
            applyDmg(t, tdmg);
          });
          log(`${enemy.name} 使用 ${spellUsed.name} 對全體造成傷害`, 'damage');
        } else {
          applyDmg(target, dmg);
          if (spellUsed) log(`${enemy.name} 使用 ${spellUsed.name} 對 ${targetName} 造成 ${dmg} 點傷害`, 'damage');
          else log(`${enemy.name} 攻擊造成 ${targetName} ${dmg} 點傷害`, 'damage');
        }
        if (this.getAliveParty().length === 0) { log('全隊被擊敗！遊戲結束', 'damage'); this.endCombat(); return; }
        UISystem.update();
        setTimeout(processNext, 300);
      });
    };
    processNext();
  },

  _companionTurns(defending, callback) {
    const companions = (GameState.recruitedCompanions || []).filter(c => c.isActive && (c.hp ?? 0) > 0);
    if (companions.length === 0 || this.getAliveEnemies().length === 0) { if (callback) callback(); return; }
    let idx = 0;
    const doNext = () => {
      if (idx >= companions.length) { if (callback) callback(); return; }
      const comp = companions[idx++];
      const compIdx = idx - 1;
      const alive = this.getAliveEnemies();
      if (alive.length === 0) { this.endCombat(true); return; }
      const target = alive[Math.floor(Math.random() * alive.length)];
      const spellIds = getSpellsForCompanion(comp.id) || [];
      const usableSpells = spellIds.map(id => SPELLS.find(s => s.id === id)).filter(s => s && (s.type === 'attack' || s.type === 'aoe' || s.type === 'physical' || s.type === 'physical_aoe') && (comp.mp ?? 0) >= (s.mp ?? 0));
      const useSpell = usableSpells.length > 0 && Math.random() < 0.35;
      let dmg;
      let spellUsed = null;
      if (useSpell && usableSpells.length > 0) {
        spellUsed = usableSpells[Math.floor(Math.random() * usableSpells.length)];
        comp.mp = Math.max(0, (comp.mp ?? 0) - (spellUsed.mp ?? 0));
        const isPhys = spellUsed.type === 'physical' || spellUsed.type === 'physical_aoe';
        if (isPhys) {
          const atkBase = Math.max(1, (comp.atk ?? 5) - Math.floor(Math.random() * 2));
          dmg = Math.max(1, Math.floor(atkBase * spellUsed.mult) + Math.floor(Math.random() * (spellUsed.bonus + 1)));
          if (!spellUsed.ignoreDef) dmg = Math.max(1, dmg - (target.def ?? 0));
        } else {
          const magBase = Math.max(1, (comp.mag ?? 5) - Math.floor(Math.random() * 2));
          dmg = Math.max(1, Math.floor(magBase * spellUsed.mult) + Math.floor(Math.random() * (spellUsed.bonus + 1)));
          if (!spellUsed.ignoreDef) dmg = Math.max(1, dmg - (target.mag ?? 0));
          const elem = spellUsed.element;
          if (elem) dmg = Math.max(1, dmg - (target[elem + 'Res'] ?? 0));
        }
        const isWeak = target.escapeCountdown !== undefined && target.weakToSpell === spellUsed.id;
        if (isWeak) dmg = Math.max(1, Math.floor(dmg * 3));
        else if (target.escapeCountdown !== undefined) dmg = Math.max(1, Math.floor(dmg * 0.15));
      } else {
        dmg = Math.max(1, (comp.atk ?? 5) - (target.def ?? 0));
      }
      const animType = (spellUsed && (spellUsed.type === 'physical' || spellUsed.type === 'physical_aoe')) ? 'attack' : (spellUsed ? 'magic' : 'attack');
      playCombatAnimation({ type: animType, attacker: 'companion', attackerIdx: compIdx, target: 'enemy', targetIdx: target.idx }, () => {
        target.hp = Math.max(0, (target.hp ?? 0) - dmg);
        if (spellUsed) {
          log(`${comp.name} 使用 ${spellUsed.name} 對 ${target.name} 造成 ${dmg} 點傷害`, 'damage');
          if (spellUsed.dotTurns) { target.burnTurns = spellUsed.dotTurns; target.burnDmg = spellUsed.dotDmg; }
          if (spellUsed.freeze) target.frozen = true;
          if (spellUsed.stunChance && Math.random() < spellUsed.stunChance) target.stunned = spellUsed.stunTurns;
        } else log(`${comp.name} 攻擊 ${target.name} 造成 ${dmg} 點傷害`, 'damage');
        if (target.hp <= 0) { GameState.combatRewards.gold += target.gold ?? 0; GameState.combatRewards.exp += target.exp ?? 0; _addEnemyDrop(target); log(`擊敗 ${target.name}！`, 'gold'); }
        UISystem.updateEnemyHp();
        UISystem.update();
        if (this.getAliveEnemies().length === 0) { this.endCombat(true); return; }
        setTimeout(doNext, 100);
      });
    };
    doNext();
  },

  doAttack(targetIdx) {
    const { player, enemies } = GameState;
    const enemy = enemies.find(e => e.idx === targetIdx && e.hp > 0);
    if (!enemy || player.hp <= 0) return;
    hideCombatSpells();
    playAnimation('attack', () => {
      const effAtk = player.atk + (player.combatBuff?.atk ?? 0);
      let dmg = Math.max(1, effAtk - Math.floor(Math.random() * 2));
      dmg = Math.max(1, dmg - (enemy.def ?? 0));
      enemy.hp -= dmg;
      log(`你攻擊 ${enemy.name} 造成 ${dmg} 點傷害`, 'damage');
      if (enemy.hp <= 0) { GameState.combatRewards.gold += enemy.gold; GameState.combatRewards.exp += enemy.exp; _addEnemyDrop(enemy); log(`擊敗 ${enemy.name}！`, 'gold'); }
      UISystem.update();
      if (this.getAliveEnemies().length === 0) { this.endCombat(true); return; }
      this._companionTurns(false, () => this.enemyTurns(false));
    }, targetIdx);
  },

  doAttackClick() {
    const alive = this.getAliveEnemies();
    if (alive.length === 1) this.doAttack(alive[0].idx);
    else this.enterTargetMode('attack');
  },

  doDefend() {
    const { player, enemies } = GameState;
    if (enemies.length === 0 || player.hp <= 0) return;
    hideCombatSpells(); clearTargeting();
    playAnimation('defend', () => {
      log('你採取防禦姿態', 'heal');
      this._companionTurns(true, () => this.enemyTurns(true));
    });
  },

  doSpellOnTarget(spellId, targetIdx) {
    const { player, enemies } = GameState;
    const spell = SPELLS.find(s => s.id === spellId);
    if (!spell || player.hp <= 0) return;
    if ((spell.level || 1) > 1 && player.level < spell.level) { log(`需要 Lv.${spell.level} 才能使用 ${spell.name}`, 'damage'); return; }
    if ((player.mp ?? 0) < (spell.mp ?? 0)) { log(`MP 不足（需要 ${spell.mp}）`, 'damage'); return; }
    hideCombatSpells();
    if (spell.type === 'heal') {
      playAnimation('magic', () => {
        player.mp -= spell.mp;
        const effMag = (player.mag ?? 5) + (player.combatBuff?.mag ?? 0);
        const baseHeal = (spell.amount || 10) + effMag * 2;
        const healAmt = Math.min(baseHeal, player.maxHp - player.hp);
        player.hp += healAmt;
        log(`${spell.name} 恢復 ${healAmt} HP（消耗 ${spell.mp} MP）`, 'heal');
        UISystem.update();
        this._companionTurns(false, () => this.enemyTurns(false));
      });
      return;
    }
    const enemy = enemies.find(e => e.idx === targetIdx && e.hp > 0);
    if (!enemy) return;
    const isPhysical = spell.type === 'physical';
    playAnimation(isPhysical ? 'attack' : 'magic', () => {
      player.mp = Math.max(0, (player.mp ?? 0) - (spell.mp ?? 0));
      let dmg;
      if (isPhysical) {
        const effAtk = (player.atk ?? 5) + (player.combatBuff?.atk ?? 0);
        const atkBase = Math.max(1, effAtk - Math.floor(Math.random() * 2));
        dmg = Math.max(1, Math.floor(atkBase * spell.mult) + Math.floor(Math.random() * (spell.bonus + 1)));
        if (!spell.ignoreDef) dmg = Math.max(1, dmg - (enemy.def ?? 0));
      } else {
        const effMag = (player.mag ?? 5) + (player.combatBuff?.mag ?? 0);
        const magBase = Math.max(1, effMag - Math.floor(Math.random() * 2));
        dmg = Math.max(1, Math.floor(magBase * spell.mult) + Math.floor(Math.random() * (spell.bonus + 1)));
        if (!spell.ignoreDef) dmg = Math.max(1, dmg - (enemy.mag ?? 0));
        const elem = spell.element;
        if (elem) { const res = enemy[elem + 'Res'] ?? 0; dmg = Math.max(1, dmg - res); }
      }
      const isWeakSpell = enemy.weakToSpell === spell.id;
      const isEliteTank = enemy.escapeCountdown !== undefined;
      if (isWeakSpell && isEliteTank) dmg = Math.max(1, Math.floor(dmg * 8));
      else if (isEliteTank) dmg = Math.max(1, Math.floor(dmg * 0.15));
      if (isWeakSpell) log(`${enemy.name} 的弱點被擊中！`, 'heal');
      enemy.hp -= dmg;
      let msg = `${spell.name} 對 ${enemy.name} 造成 ${dmg} 點傷害（消耗 ${spell.mp} MP）`;
      if (spell.dotTurns) { enemy.burnTurns = spell.dotTurns; enemy.burnDmg = spell.dotDmg; msg += '，敵人燃燒中！'; }
      if (spell.freeze) { enemy.frozen = true; msg += '，敵人被凍結！'; }
      if (spell.stunChance && Math.random() < spell.stunChance) { enemy.stunned = spell.stunTurns; msg += '，敵人被電擊麻痺！'; }
      log(msg, 'heal');
      if (enemy.hp <= 0) { GameState.combatRewards.gold += enemy.gold; GameState.combatRewards.exp += enemy.exp; _addEnemyDrop(enemy); log(`擊敗 ${enemy.name}！`, 'gold'); }
      UISystem.update();
      if (this.getAliveEnemies().length === 0) { this.endCombat(true); return; }
      this._companionTurns(false, () => this.enemyTurns(false));
    }, targetIdx);
  },

  doSpell(spellId) {
    const spell = SPELLS.find(s => s.id === spellId);
    if (!spell) return;
    if (spell.type === 'heal') { this.doSpellOnTarget(spellId, -1); return; }
    if (spell.type === 'aoe') { this.doSpellAoe(spellId); return; }
    if (spell.type === 'buff' || spell.type === 'defense') { this.doSpellBuff(spellId); return; }
    if (spell.type === 'physical_aoe') { this.doSpellAoe(spellId); return; }
    const alive = this.getAliveEnemies();
    if (alive.length === 0) return;
    if (alive.length === 1) this.doSpellOnTarget(spellId, alive[0].idx);
    else this.enterTargetMode(spellId);
  },

  doSpellBuff(spellId) {
    const { player } = GameState;
    const spell = SPELLS.find(s => s.id === spellId);
    if (!spell || (spell.type !== 'buff' && spell.type !== 'defense') || player.hp <= 0) return;
    if ((spell.level || 1) > 1 && player.level < spell.level) { log(`需要 Lv.${spell.level} 才能使用 ${spell.name}`, 'damage'); return; }
    if ((player.mp ?? 0) < (spell.mp ?? 0)) { log(`MP 不足（需要 ${spell.mp}）`, 'damage'); return; }
    hideCombatSpells(); clearTargeting();
    playAnimation('magic', () => {
      player.mp -= spell.mp;
      player.combatBuff = player.combatBuff || {};
      const amt = spell.amount ?? 0;
      const turns = spell.turns ?? 2;
      if (spell.stat === 'all') {
        player.combatBuff.atk = (player.combatBuff.atk ?? 0) + amt;
        player.combatBuff.def = (player.combatBuff.def ?? 0) + amt;
        player.combatBuff.mag = (player.combatBuff.mag ?? 0) + amt;
      } else player.combatBuff[spell.stat] = (player.combatBuff[spell.stat] ?? 0) + amt;
      player.combatBuff.turns = Math.max(player.combatBuff.turns ?? 0, turns);
      log(`${spell.name} 生效（${turns} 回合）`, 'heal');
      UISystem.update();
      this._companionTurns(false, () => this.enemyTurns(false));
    });
  },

  doSpellAoe(spellId) {
    const { player, enemies } = GameState;
    const spell = SPELLS.find(s => s.id === spellId);
    if (!spell || (spell.type !== 'aoe' && spell.type !== 'physical_aoe') || player.hp <= 0) return;
    if ((spell.level || 1) > 1 && player.level < spell.level) { log(`需要 Lv.${spell.level} 才能使用 ${spell.name}`, 'damage'); return; }
    if ((player.mp ?? 0) < (spell.mp ?? 0)) { log(`MP 不足（需要 ${spell.mp}）`, 'damage'); return; }
    hideCombatSpells(); clearTargeting();
    const alive = enemies.filter(e => e.hp > 0);
    if (alive.length === 0) return;
    const isPhysical = spell.type === 'physical_aoe';
    playAnimation(isPhysical ? 'attack' : 'magic', () => {
      player.mp = Math.max(0, (player.mp ?? 0) - (spell.mp ?? 0));
      const effAtk = (player.atk ?? 5) + (player.combatBuff?.atk ?? 0);
      const effMag = (player.mag ?? 5) + (player.combatBuff?.mag ?? 0);
      const baseStat = isPhysical ? Math.max(1, effAtk - Math.floor(Math.random() * 2)) : Math.max(1, effMag - Math.floor(Math.random() * 2));
      alive.forEach(enemy => {
        let dmg = Math.max(1, Math.floor(baseStat * spell.mult) + Math.floor(Math.random() * (spell.bonus + 1)));
        const isWeak = enemy.escapeCountdown !== undefined && enemy.weakToSpell === spell.id;
        if (isWeak) dmg = Math.max(1, Math.floor(dmg * 3));
        else if (enemy.escapeCountdown !== undefined) dmg = Math.max(1, Math.floor(dmg * 0.15));
        else {
          if (isPhysical) { if (!spell.ignoreDef) dmg = Math.max(1, dmg - (enemy.def ?? 0)); }
          else { if (!spell.ignoreDef) dmg = Math.max(1, dmg - (enemy.mag ?? 0)); const res = enemy[spell.element + 'Res'] ?? 0; dmg = Math.max(1, dmg - res); }
        }
        enemy.hp -= dmg;
        if (spell.dotTurns) { enemy.burnTurns = spell.dotTurns; enemy.burnDmg = spell.dotDmg; }
        if (spell.freeze) enemy.frozen = true;
        if (spell.stunChance && Math.random() < spell.stunChance) enemy.stunned = spell.stunTurns;
        if (enemy.hp <= 0) { GameState.combatRewards.gold += enemy.gold; GameState.combatRewards.exp += enemy.exp; _addEnemyDrop(enemy); log(`擊敗 ${enemy.name}！`, 'gold'); }
      });
      log(`${spell.name} 對全體造成傷害（消耗 ${spell.mp} MP）`, 'heal');
      UISystem.update();
      if (this.getAliveEnemies().length === 0) { this.endCombat(true); return; }
      this._companionTurns(false, () => this.enemyTurns(false));
    });
  },

  doEscape() {
    if (GameState.enemies.length === 0) return;
    if (GameState.isGatekeeperFight || GameState.isCompanionFight) { log('此戰無法逃跑！', 'damage'); return; }
    hideCombatSpells(); clearTargeting();
    playAnimation('escape', () => {
      if (Math.random() < RPG.ESCAPE_CHANCE) { log('成功逃脫！', 'heal'); this.endCombat(); }
      else { log('逃跑失敗！', 'damage'); this.enemyTurns(false); }
    });
  },

  useItemOnTarget(itemId, targetIdx) {
    const def = ITEMS.find(i => i.id === itemId);
    if (!def || def.effect !== 'attack') return;
    clearTargeting(); hideCombatSpells();
    const enemy = GameState.enemies.find(e => e.idx === targetIdx && e.hp > 0);
    if (!enemy) return;
    let dmg = def.damage ?? 0;
    if (def.element && def.element !== 'neutral') {
      const resKey = def.element + 'Res';
      dmg = Math.max(1, dmg - (enemy[resKey] ?? 0));
    }
    const isEliteTank = enemy.escapeCountdown !== undefined;
    const weakElement = enemy.weakToSpell ? (SPELLS.find(s => s.id === enemy.weakToSpell)?.element || '') : '';
    if (isEliteTank && def.element !== weakElement) dmg = Math.max(1, Math.floor(dmg * 0.15));
    else if (isEliteTank && def.element === weakElement) dmg = Math.max(1, Math.floor(dmg * 3));
    playAnimation('magic', () => {
      enemy.hp -= dmg;
      log(`使用 ${def.name} 對 ${enemy.name} 造成 ${dmg} 點傷害`, 'heal');
      if (enemy.hp <= 0) { GameState.combatRewards.gold += enemy.gold; GameState.combatRewards.exp += enemy.exp; _addEnemyDrop(enemy); log(`擊敗 ${enemy.name}！`, 'gold'); }
      UISystem.update();
      if (this.getAliveEnemies().length === 0) { this.endCombat(true); return; }
      this._companionTurns(false, () => this.enemyTurns(false));
    }, targetIdx);
  },

  useItemAoe(itemId) {
    const def = ITEMS.find(i => i.id === itemId);
    if (!def || def.effect !== 'aoe') return;
    clearTargeting(); hideCombatSpells();
    const dmg = def.damage ?? 0;
    if (dmg <= 0) return;
    const alive = this.getAliveEnemies();
    playAnimation('magic', () => {
      alive.forEach(e => {
        e.hp -= dmg;
        if (e.hp <= 0) { GameState.combatRewards.gold += e.gold; GameState.combatRewards.exp += e.exp; _addEnemyDrop(e); log(`擊敗 ${e.name}！`, 'gold'); }
      });
      log(`使用 ${def.name} 對全體造成 ${dmg} 點傷害`, 'heal');
      UISystem.update();
      if (this.getAliveEnemies().length === 0) { this.endCombat(true); return; }
      this._companionTurns(false, () => this.enemyTurns(false));
    });
  },

  useItemBuff(itemId) {
    const def = ITEMS.find(i => i.id === itemId);
    if (!def || def.effect !== 'buff') return;
    clearTargeting(); hideCombatSpells();
    const p = GameState.player;
    p.combatBuff = p.combatBuff || { atk: 0, def: 0, mag: 0, turns: 0 };
    const amt = def.amount ?? 0;
    if (def.stat === 'all') {
      p.combatBuff.atk += amt; p.combatBuff.def += amt; p.combatBuff.mag += amt;
    } else if (def.stat) p.combatBuff[def.stat] = (p.combatBuff[def.stat] ?? 0) + amt;
    p.combatBuff.turns = Math.max(p.combatBuff.turns, def.turns ?? 0);
    log(`使用 ${def.name}，${def.desc || ''}`, 'heal');
    UISystem.update();
    this._companionTurns(false, () => this.enemyTurns(false));
  },

  heal() {
    const { player } = GameState;
    const cost = 10 + player.level;
    const amount = 5 + player.level * 2;
    if (player.gold < cost || player.hp >= player.maxHp) return;
    hideCombatSpells(); clearTargeting();
    player.gold -= cost;
    player.hp = Math.min(player.maxHp, player.hp + amount);
    log(`治療恢復 ${amount} HP（消耗 ${cost} 金）`, 'heal');
    if (GameState.inCombat) this.enemyTurns(false);
    else UISystem.update();
  }
};
