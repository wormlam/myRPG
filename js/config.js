/** 遊戲常數與靜態資料 */
const RPG = {
  SAVE_KEY_PREFIX: 'myrpg_save_',
  MAP_SIZE: 10,
  ENCOUNTER_CHANCE: 0.25,
  ESCAPE_CHANCE: 0.6,
  DEFEND_DAMAGE_REDUCE: 0.5,
};

const SPELLS = [
  { id: 'fireball', name: '火球術', level: 1, mp: 3, type: 'attack', mult: 2, bonus: 2, dotTurns: 3, dotDmg: 2, effect: '燃燒' },
  { id: 'icearrow', name: '冰箭術', level: 2, mp: 2, type: 'attack', mult: 1.5, bonus: 0, freeze: true, effect: '凍結' },
  { id: 'thunder', name: '雷擊術', level: 3, mp: 4, type: 'attack', mult: 2.5, bonus: 5, stunChance: 0.5, stunTurns: 2, effect: '電擊' },
  { id: 'rockbreak', name: '破岩術', level: 4, mp: 5, type: 'attack', mult: 3, bonus: 0, ignoreDef: true, effect: '破甲' },
  { id: 'heal', name: '治癒術', level: 2, mp: 5, type: 'heal', amount: 15, effect: '回復' }
];

const defaultPlayer = () => ({
  level: 1, exp: 0, hp: 20, maxHp: 20, mp: 10, maxMp: 10, atk: 5, gold: 0, px: 5, py: 5
});

const enemies = [
  { name: '史萊姆', hp: 8, atk: 2, def: 0, gold: 3, exp: 5, emoji: '🟢', level: 1 },
  { name: '小蝙蝠', hp: 6, atk: 2, def: 0, gold: 2, exp: 4, emoji: '🦇', level: 1 },
  { name: '野鼠', hp: 5, atk: 1, def: 0, gold: 1, exp: 3, emoji: '🐀', level: 1 },
  { name: '史萊姆王', hp: 12, atk: 3, def: 0, gold: 5, exp: 8, emoji: '🟢', level: 1 },
  { name: '毒蘑菇', hp: 7, atk: 2, def: 0, gold: 4, exp: 6, emoji: '🍄', level: 1 },
  { name: '哥布林', hp: 12, atk: 3, def: 1, gold: 5, exp: 8, emoji: '👺', level: 2 },
  { name: '狼', hp: 14, atk: 4, def: 0, gold: 6, exp: 10, emoji: '🐺', level: 2 },
  { name: '野豬', hp: 16, atk: 3, def: 1, gold: 5, exp: 9, emoji: '🐗', level: 2 },
  { name: '哥布林戰士', hp: 15, atk: 4, def: 2, gold: 8, exp: 12, emoji: '👺', level: 2 },
  { name: '毒蜘蛛', hp: 10, atk: 3, def: 0, gold: 6, exp: 9, emoji: '🕷️', level: 2 },
  { name: '骷髏兵', hp: 15, atk: 4, def: 2, gold: 8, exp: 12, emoji: '💀', level: 3 },
  { name: '殭屍', hp: 18, atk: 3, def: 1, gold: 7, exp: 11, emoji: '🧟', level: 3 },
  { name: '幽靈', hp: 12, atk: 5, def: 0, gold: 9, exp: 14, emoji: '👻', level: 3 },
  { name: '巨鼠', hp: 20, atk: 4, def: 1, gold: 8, exp: 13, emoji: '🐀', level: 3 },
  { name: '地精', hp: 14, atk: 4, def: 2, gold: 10, exp: 15, emoji: '🧝', level: 3 },
  { name: '獸人', hp: 22, atk: 5, def: 2, gold: 12, exp: 18, emoji: '👹', level: 4 },
  { name: '巨狼', hp: 20, atk: 6, def: 1, gold: 11, exp: 16, emoji: '🐺', level: 4 },
  { name: '石像鬼', hp: 25, atk: 4, def: 4, gold: 15, exp: 20, emoji: '🗿', level: 4 },
  { name: '黑暗史萊姆', hp: 18, atk: 5, def: 1, gold: 10, exp: 15, emoji: '🟣', level: 4 },
  { name: '食人花', hp: 20, atk: 5, def: 0, gold: 12, exp: 17, emoji: '🌸', level: 4 },
  { name: '骷髏騎士', hp: 28, atk: 6, def: 3, gold: 18, exp: 24, emoji: '💀', level: 5 },
  { name: '獸人戰士', hp: 30, atk: 6, def: 3, gold: 20, exp: 26, emoji: '👹', level: 5 },
  { name: '火元素', hp: 22, atk: 7, def: 0, gold: 16, exp: 22, emoji: '🔥', level: 5 },
  { name: '冰元素', hp: 24, atk: 5, def: 2, gold: 17, exp: 23, emoji: '❄️', level: 5 },
  { name: '巨蜘蛛', hp: 26, atk: 6, def: 1, gold: 18, exp: 24, emoji: '🕷️', level: 5 },
  { name: '牛頭人', hp: 35, atk: 8, def: 3, gold: 25, exp: 32, emoji: '🐂', level: 6 },
  { name: '暗黑騎士', hp: 38, atk: 7, def: 5, gold: 28, exp: 35, emoji: '🦇', level: 6 },
  { name: '龍蜥', hp: 32, atk: 8, def: 2, gold: 24, exp: 30, emoji: '🦎', level: 6 },
  { name: '惡魔', hp: 30, atk: 9, def: 2, gold: 26, exp: 33, emoji: '😈', level: 6 },
  { name: '岩石怪', hp: 40, atk: 5, def: 6, gold: 22, exp: 28, emoji: '🪨', level: 6 },
  { name: '吸血鬼', hp: 36, atk: 9, def: 3, gold: 30, exp: 38, emoji: '🧛', level: 7 },
  { name: '雙頭龍', hp: 42, atk: 8, def: 3, gold: 32, exp: 40, emoji: '🐉', level: 7 },
  { name: '炎魔', hp: 38, atk: 10, def: 2, gold: 35, exp: 42, emoji: '👿', level: 7 },
  { name: '冰霜巨人', hp: 45, atk: 7, def: 5, gold: 33, exp: 41, emoji: '🧊', level: 7 },
  { name: '死靈法師', hp: 32, atk: 10, def: 2, gold: 34, exp: 43, emoji: '🧙', level: 7 },
  { name: '遠古龍', hp: 55, atk: 12, def: 4, gold: 45, exp: 55, emoji: '🐲', level: 8 },
  { name: '泰坦', hp: 60, atk: 10, def: 6, gold: 48, exp: 58, emoji: '🗽', level: 8 },
  { name: '墮落天使', hp: 50, atk: 11, def: 4, gold: 42, exp: 52, emoji: '👼', level: 8 },
  { name: '深淵領主', hp: 52, atk: 12, def: 5, gold: 50, exp: 60, emoji: '👹', level: 8 },
  { name: '混沌獸', hp: 48, atk: 11, def: 3, gold: 44, exp: 54, emoji: '🐲', level: 8 },
  { name: '魔王', hp: 70, atk: 14, def: 6, gold: 60, exp: 70, emoji: '😈', level: 9 },
  { name: '遠古泰坦', hp: 75, atk: 12, def: 8, gold: 65, exp: 75, emoji: '🗽', level: 9 },
  { name: '毀滅龍', hp: 68, atk: 15, def: 5, gold: 62, exp: 72, emoji: '🐉', level: 9 },
  { name: '虛空惡魔', hp: 65, atk: 14, def: 4, gold: 58, exp: 68, emoji: '👿', level: 9 },
  { name: '終焉使者', hp: 72, atk: 13, def: 7, gold: 68, exp: 78, emoji: '💀', level: 9 },
  { name: '創世神獸', hp: 90, atk: 16, def: 8, gold: 80, exp: 90, emoji: '🐲', level: 10 },
  { name: '虛無之主', hp: 85, atk: 17, def: 7, gold: 78, exp: 88, emoji: '👹', level: 10 },
  { name: '永恆龍神', hp: 95, atk: 15, def: 9, gold: 85, exp: 95, emoji: '🐉', level: 10 },
  { name: '混沌帝王', hp: 88, atk: 16, def: 8, gold: 82, exp: 92, emoji: '😈', level: 10 },
  { name: '究極魔王', hp: 100, atk: 18, def: 10, gold: 100, exp: 100, emoji: '👿', level: 10 }
];
const PLAYER_EMOJI = '🧑';
