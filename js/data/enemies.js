/**
 * 敵人資料：前綴、種類、精英、生成邏輯
 * 依賴：world.js (MAPS)
 */
const ENEMY_PREFIXES = ['毒', '火焰', '冰霜', '黑暗', '狂暴', '幽靈', '巨', '幼', '暗黑', '神聖', '詛咒', '邪惡', '遠古', '混沌', '虛空', '深淵', '雷電', '風暴', '岩漿', '沙漠', '森林', '草原', '洞穴', '煉獄', '腐化', '狂野', '鋼鐵', '水晶', '暗影', '血', '骨', '石', '泥', '霧', '炎', '寒', '毒液', '尖刺', '腐敗', '墮落'];

const TYPE_MODIFIERS = {
  史萊姆: { hpMod: -0.25, atkMod: -0.2, magMod: -0.3, defMod: -0.2 },
  哥布林: { hpMod: -0.15, atkMod: 0.1, magMod: -0.2, defMod: -0.1 },
  骷髏: { hpMod: -0.1, atkMod: 0.05, magMod: 0, defMod: 0.15 },
  幼龍: { hpMod: -0.2, atkMod: 0.15, magMod: 0.2, defMod: -0.1 },
  小惡魔: { hpMod: -0.1, atkMod: 0.1, magMod: 0.25, defMod: -0.15 },
  吸血鬼: { hpMod: 0.1, atkMod: 0.1, magMod: 0.2, defMod: 0 },
  泰坦: { hpMod: 0.35, atkMod: 0.15, magMod: -0.25, defMod: 0.3 },
  混沌獸: { hpMod: 0.2, atkMod: 0.2, magMod: 0.15, defMod: 0.1 },
  魔狼: { hpMod: 0, atkMod: 0.25, magMod: -0.2, defMod: -0.1 },
  蜘蛛: { hpMod: -0.1, atkMod: 0.1, magMod: 0, defMod: 0.05 },
  蝙蝠: { hpMod: -0.2, atkMod: 0, magMod: 0.1, defMod: -0.2 },
  毒蛇: { hpMod: -0.15, atkMod: 0.05, magMod: 0.2, defMod: -0.15 },
  蠍子: { hpMod: 0, atkMod: 0.2, magMod: -0.1, defMod: 0.1 },
  禿鷹: { hpMod: -0.1, atkMod: 0.15, magMod: 0, defMod: -0.1 },
  魚人: { hpMod: 0.05, atkMod: 0, magMod: 0.1, defMod: 0.05 },
  甲蟲: { hpMod: 0.1, atkMod: 0.05, magMod: -0.2, defMod: 0.2 },
  魔像: { hpMod: 0.25, atkMod: 0, magMod: -0.3, defMod: 0.35 },
  元素: { hpMod: -0.1, atkMod: -0.1, magMod: 0.35, defMod: -0.1 },
  幽魂: { hpMod: -0.2, atkMod: 0.05, magMod: 0.25, defMod: -0.25 },
  盜賊: { hpMod: -0.15, atkMod: 0.3, magMod: -0.2, defMod: -0.2 },
  騎士: { hpMod: 0.15, atkMod: 0.15, magMod: -0.2, defMod: 0.2 },
  法師: { hpMod: -0.2, atkMod: -0.2, magMod: 0.4, defMod: -0.2 },
  術士: { hpMod: -0.15, atkMod: -0.1, magMod: 0.35, defMod: -0.15 },
  獸人: { hpMod: 0.2, atkMod: 0.25, magMod: -0.25, defMod: 0.05 },
  終焉魔: { hpMod: 0.3, atkMod: 0.25, magMod: 0.2, defMod: 0.2 }
};

const PREFIX_EFFECTS = {
  毒: { magMod: 3, fireRes: -2, iceRes: 0, thunderRes: 0, earthRes: 0 },
  火焰: { atkMod: 4, fireRes: 5, iceRes: -5, thunderRes: 0, earthRes: 0 },
  冰霜: { atkMod: 2, fireRes: -5, iceRes: 5, thunderRes: 0, earthRes: 0 },
  黑暗: { atkMod: 5, defMod: -3, magMod: 5, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  狂暴: { atkMod: 8, defMod: -5, magMod: -3, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  幽靈: { atkMod: 3, defMod: -8, magMod: 5, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  巨: { atkMod: 8, defMod: 6, magMod: -5, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  幼: { atkMod: -5, defMod: -4, magMod: -3, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  暗黑: { atkMod: 5, magMod: 4, fireRes: 2, iceRes: 2, thunderRes: 2, earthRes: 2 },
  神聖: { defMod: 6, magMod: 5, fireRes: 2, iceRes: 2, thunderRes: 2, earthRes: 2 },
  詛咒: { magMod: 8, defMod: -4, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  邪惡: { atkMod: 5, magMod: 4, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  遠古: { atkMod: 6, defMod: 6, magMod: 6, fireRes: 3, iceRes: 3, thunderRes: 3, earthRes: 3 },
  混沌: { atkMod: 4, magMod: 6, fireRes: 1, iceRes: 1, thunderRes: 1, earthRes: 1 },
  虛空: { magMod: 8, defMod: -6, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  深淵: { atkMod: 6, defMod: 6, fireRes: 2, iceRes: 2, thunderRes: 2, earthRes: 2 },
  雷電: { magMod: 6, fireRes: 0, iceRes: 0, thunderRes: 5, earthRes: -2 },
  風暴: { atkMod: 4, magMod: 4, fireRes: 0, iceRes: 0, thunderRes: 3, earthRes: 0 },
  岩漿: { atkMod: 6, fireRes: 8, iceRes: -8, thunderRes: 0, earthRes: 2 },
  沙漠: { defMod: 6, fireRes: 3, iceRes: -3, thunderRes: 0, earthRes: 2 },
  森林: { defMod: 4, fireRes: -2, iceRes: 1, thunderRes: 0, earthRes: 2 },
  草原: { atkMod: -3, defMod: 0, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 1 },
  洞穴: { defMod: 6, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 4 },
  煉獄: { atkMod: 6, magMod: 4, fireRes: 10, iceRes: -10, thunderRes: 0, earthRes: 0 },
  腐化: { atkMod: 4, defMod: -3, magMod: 5, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  狂野: { atkMod: 10, defMod: -6, magMod: -5, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  鋼鐵: { atkMod: 6, defMod: 10, magMod: -8, actInterval: 2, fireRes: 0, iceRes: 0, thunderRes: -2, earthRes: 2 },
  水晶: { defMod: 6, magMod: 6, atkMod: -3, fireRes: 1, iceRes: 1, thunderRes: 1, earthRes: 3 },
  暗影: { atkMod: 4, defMod: -6, magMod: 6, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  血: { atkMod: 6, defMod: -4, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  骨: { defMod: 10, atkMod: 0, magMod: -5, fireRes: -1, iceRes: 0, thunderRes: 0, earthRes: 2 },
  石: { atkMod: 0, defMod: 12, magMod: -8, actInterval: 2, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 5 },
  泥: { defMod: 4, atkMod: -3, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 3 },
  霧: { defMod: -6, magMod: 4, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  炎: { atkMod: 4, fireRes: 6, iceRes: -6, thunderRes: 0, earthRes: 0 },
  寒: { magMod: 4, fireRes: -4, iceRes: 6, thunderRes: 0, earthRes: 0 },
  毒液: { magMod: 6, fireRes: -1, iceRes: 0, thunderRes: 0, earthRes: 0 },
  尖刺: { atkMod: 8, defMod: 4, magMod: -5, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  腐敗: { atkMod: 4, defMod: -4, magMod: 4, fireRes: 0, iceRes: 0, thunderRes: 0, earthRes: 0 },
  墮落: { atkMod: 6, defMod: 4, magMod: 4, fireRes: 1, iceRes: 1, thunderRes: 1, earthRes: 1 }
};
const ENEMY_TYPES = ['史萊姆', '哥布林', '骷髏', '幼龍', '小惡魔', '吸血鬼', '泰坦', '混沌獸', '魔狼', '蜘蛛', '蝙蝠', '毒蛇', '蠍子', '禿鷹', '魚人', '甲蟲', '魔像', '元素', '幽魂', '盜賊', '騎士', '法師', '術士', '獸人', '終焉魔'];
const ENEMY_EMOJIS = ['🟢', '👺', '💀', '🐉', '😈', '🧛', '🗽', '👿', '🐺', '🕷️', '🦇', '🐍', '🦂', '🦅', '🐟', '🪲', '🗿', '💧', '👻', '🗡️', '⚔️', '🔮', '✨', '👹', '💀'];

function _seed(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

const ELITE_BY_MAP = {
  meadow: {
    eliteStrong: { name: '草原霸主', emoji: '🦁', hpMult: 1.4, atkMult: 1.35, magMult: 1.35, defMult: 1.3, goldMult: 2.5, expMult: 2.5, spawnChance: 0.05 },
    eliteTank: { name: '堅岩史萊姆', emoji: '🪨', hpMult: 0.9, atkMult: 0.6, magMult: 0.5, defMult: 6, goldMult: 5, expMult: 5, weakToSpell: 'rockbreak', escapeTurns: 3, spawnChance: 0.008 }
  },
  forest: {
    eliteStrong: { name: '森林領主', emoji: '🦌', hpMult: 1.4, atkMult: 1.35, magMult: 1.35, defMult: 1.3, goldMult: 2.5, expMult: 2.5, spawnChance: 0.05 },
    eliteTank: { name: '古樹守衛', emoji: '🌳', hpMult: 0.9, atkMult: 0.6, magMult: 0.5, defMult: 6, goldMult: 5, expMult: 5, weakToSpell: 'fireball', escapeTurns: 3, spawnChance: 0.008 }
  },
  cave: {
    eliteStrong: { name: '洞穴霸主', emoji: '🦇', hpMult: 1.4, atkMult: 1.35, magMult: 1.35, defMult: 1.3, goldMult: 2.5, expMult: 2.5, spawnChance: 0.05 },
    eliteTank: { name: '水晶魔像', emoji: '💎', hpMult: 0.9, atkMult: 0.6, magMult: 0.5, defMult: 6, goldMult: 5, expMult: 5, weakToSpell: 'thunder', escapeTurns: 3, spawnChance: 0.008 }
  },
  desert: {
    eliteStrong: { name: '沙漠暴君', emoji: '🦂', hpMult: 1.4, atkMult: 1.35, magMult: 1.35, defMult: 1.3, goldMult: 2.5, expMult: 2.5, spawnChance: 0.05 },
    eliteTank: { name: '沙之壁壘', emoji: '🏜️', hpMult: 0.9, atkMult: 0.6, magMult: 0.5, defMult: 6, goldMult: 5, expMult: 5, weakToSpell: 'icearrow', escapeTurns: 3, spawnChance: 0.008 }
  },
  volcano: {
    eliteStrong: { name: '熔岩領主', emoji: '🔥', hpMult: 1.4, atkMult: 1.35, magMult: 1.35, defMult: 1.3, goldMult: 2.5, expMult: 2.5, spawnChance: 0.05 },
    eliteTank: { name: '岩漿護甲', emoji: '🛡️', hpMult: 0.9, atkMult: 0.6, magMult: 0.5, defMult: 6, goldMult: 5, expMult: 5, weakToSpell: 'icearrow', escapeTurns: 3, spawnChance: 0.008 }
  },
  inferno: {
    eliteStrong: { name: '煉獄將軍', emoji: '👹', hpMult: 1.4, atkMult: 1.35, magMult: 1.35, defMult: 1.3, goldMult: 2.5, expMult: 2.5, spawnChance: 0.05 },
    eliteTank: { name: '地獄壁壘', emoji: '🧱', hpMult: 0.9, atkMult: 0.6, magMult: 0.5, defMult: 6, goldMult: 5, expMult: 5, weakToSpell: 'rockbreak', escapeTurns: 3, spawnChance: 0.008 }
  },
  void: {
    eliteStrong: { name: '虛空獵手', emoji: '🌑', hpMult: 1.4, atkMult: 1.35, magMult: 1.35, defMult: 1.3, goldMult: 2.5, expMult: 2.5, spawnChance: 0.05 },
    eliteTank: { name: '虛無之殼', emoji: '⬛', hpMult: 0.9, atkMult: 0.6, magMult: 0.5, defMult: 6, goldMult: 5, expMult: 5, weakToSpell: 'fireball', escapeTurns: 3, spawnChance: 0.008 }
  },
  abyss: {
    eliteStrong: { name: '深淵統帥', emoji: '🐉', hpMult: 1.4, atkMult: 1.35, magMult: 1.35, defMult: 1.3, goldMult: 2.5, expMult: 2.5, spawnChance: 0.05 },
    eliteTank: { name: '深淵甲殼', emoji: '🦀', hpMult: 0.9, atkMult: 0.6, magMult: 0.5, defMult: 6, goldMult: 5, expMult: 5, weakToSpell: 'thunder', escapeTurns: 3, spawnChance: 0.008 }
  },
  chaos: {
    eliteStrong: { name: '混沌戰將', emoji: '⚡', hpMult: 1.4, atkMult: 1.35, magMult: 1.35, defMult: 1.3, goldMult: 2.5, expMult: 2.5, spawnChance: 0.05 },
    eliteTank: { name: '混沌結晶', emoji: '🔮', hpMult: 0.9, atkMult: 0.6, magMult: 0.5, defMult: 6, goldMult: 5, expMult: 5, weakToSpell: 'icearrow', escapeTurns: 3, spawnChance: 0.008 }
  },
  end: {
    eliteStrong: { name: '終焉先鋒', emoji: '👑', hpMult: 1.4, atkMult: 1.35, magMult: 1.35, defMult: 1.3, goldMult: 2.5, expMult: 2.5, spawnChance: 0.05 },
    eliteTank: { name: '終焉之壁', emoji: '🛕', hpMult: 0.9, atkMult: 0.6, magMult: 0.5, defMult: 6, goldMult: 5, expMult: 5, weakToSpell: 'rockbreak', escapeTurns: 3, spawnChance: 0.008 }
  }
};

const ENEMY_STATS_BY_TIER = {
  1: { hp: 32, atk: 10, mag: 5, def: 4, gold: 10, exp: 14 },
  2: { hp: 65, atk: 22, mag: 10, def: 10, gold: 22, exp: 26 },
  3: { hp: 100, atk: 35, mag: 15, def: 16, gold: 35, exp: 40 },
  4: { hp: 140, atk: 48, mag: 20, def: 22, gold: 48, exp: 54 },
  5: { hp: 180, atk: 60, mag: 25, def: 28, gold: 62, exp: 68 },
  6: { hp: 225, atk: 73, mag: 30, def: 34, gold: 75, exp: 82 },
  7: { hp: 270, atk: 85, mag: 35, def: 40, gold: 88, exp: 96 },
  8: { hp: 320, atk: 98, mag: 40, def: 46, gold: 102, exp: 110 },
  9: { hp: 370, atk: 110, mag: 45, def: 52, gold: 115, exp: 124 },
  10: { hp: 420, atk: 123, mag: 50, def: 58, gold: 128, exp: 138 }
};

const enemies = (function () {
  const list = [];
  const mapIds = MAPS.map(m => m.id);
  for (let i = 0; i < 40; i++) {
    for (let j = 0; j < 25; j++) {
      const idx = i * 25 + j;
      const mapIdx = idx % 10;
      const mapId = mapIds[mapIdx];
      const map = MAPS.find(m => m.id === mapId);
      const tier = Math.min(10, Math.ceil((map?.minLv ?? 1) / 10));
      const base = ENEMY_STATS_BY_TIER[tier] || ENEMY_STATS_BY_TIER[1];
      const rnd = _seed(idx * 7919 + 1);
      const prefix = ENEMY_PREFIXES[i];
      const typeName = ENEMY_TYPES[j];
      const tMod = TYPE_MODIFIERS[typeName] || {};
      const pEff = PREFIX_EFFECTS[prefix] || {};
      const prefixScale = 1 + (tier - 1) * 0.25;
      const hp = Math.max(10, Math.floor(base.hp * (1 + (tMod.hpMod ?? 0)) + (rnd() * 8 - 4)));
      const atk = Math.max(1, Math.floor(base.atk * (1 + (tMod.atkMod ?? 0)) + (pEff.atkMod ?? 0) * prefixScale + (rnd() * 2 - 1)));
      const mag = Math.max(0, Math.floor(base.mag * (1 + (tMod.magMod ?? 0)) + (pEff.magMod ?? 0) * prefixScale + (rnd() * 2 - 1)));
      const def = Math.max(0, Math.floor(base.def * (1 + (tMod.defMod ?? 0)) + (pEff.defMod ?? 0) * prefixScale + (rnd() * 2 - 1)));
      list.push({
        id: `enemy_${idx}`,
        name: prefix + typeName,
        tier,
        mapId,
        prefix,
        hp,
        atk,
        mag,
        def,
        gold: Math.max(1, base.gold + Math.floor(rnd() * 6) - 3),
        exp: Math.max(1, base.exp + Math.floor(rnd() * 8) - 4),
        emoji: ENEMY_EMOJIS[j % ENEMY_EMOJIS.length],
        actInterval: pEff.actInterval ?? 1,
        fireRes: pEff.fireRes ?? 0,
        iceRes: pEff.iceRes ?? 0,
        thunderRes: pEff.thunderRes ?? 0,
        earthRes: pEff.earthRes ?? 0
      });
    }
  }
  return list;
})();
