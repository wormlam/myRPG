/** 遊戲常數與靜態資料 */
const RPG = {
  SAVE_KEY_PREFIX: 'myrpg_save_',
  MAP_SIZE: 10,
  ENCOUNTER_CHANCE: 0.25,
  ESCAPE_CHANCE: 0.6,
  DEFEND_DAMAGE_REDUCE: 0.5,
};

const SPELLS = [
  { id: 'fireball', name: '火球術', level: 1, mp: 3, type: 'attack', mult: 2, bonus: 2, effect: '燃燒' },
  { id: 'icearrow', name: '冰箭術', level: 2, mp: 2, type: 'attack', mult: 1.5, bonus: 0, freezeChance: 0.25, effect: '凍結' },
  { id: 'thunder', name: '雷擊術', level: 3, mp: 4, type: 'attack', mult: 2.5, bonus: 5, effect: '雷擊' },
  { id: 'rockbreak', name: '破岩術', level: 4, mp: 5, type: 'attack', mult: 3, bonus: 0, effect: '破甲' },
  { id: 'heal', name: '治癒術', level: 2, mp: 5, type: 'heal', amount: 15, effect: '回復' }
];

const defaultPlayer = () => ({
  level: 1, exp: 0, hp: 20, maxHp: 20, mp: 10, maxMp: 10, atk: 5, gold: 0, px: 5, py: 5
});

const enemies = [
  { name: '史萊姆', hp: 8, atk: 2, gold: 3, exp: 5, emoji: '🟢' },
  { name: '哥布林', hp: 12, atk: 3, gold: 5, exp: 8, emoji: '👺' },
  { name: '骷髏兵', hp: 15, atk: 4, gold: 8, exp: 12, emoji: '💀' }
];
const PLAYER_EMOJI = '🧑';
