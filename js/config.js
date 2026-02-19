/** 遊戲常數與靜態資料 */
const RPG = {
  SAVE_KEY_PREFIX: 'myrpg_save_',
  MAP_SIZE: 10,
  ENCOUNTER_CHANCE: 0.25,
  ESCAPE_CHANCE: 0.6,
  DEFEND_DAMAGE_REDUCE: 0.5,
  MAGIC_MP_COST: 3,
  MAGIC_DAMAGE_MULTIPLIER: 2,
};

const defaultPlayer = () => ({
  level: 1, exp: 0, hp: 20, maxHp: 20, mp: 10, maxMp: 10, atk: 5, gold: 0, px: 5, py: 5
});

const enemies = [
  { name: '史萊姆', hp: 8, atk: 2, gold: 3, exp: 5, emoji: '🟢' },
  { name: '哥布林', hp: 12, atk: 3, gold: 5, exp: 8, emoji: '👺' },
  { name: '骷髏兵', hp: 15, atk: 4, gold: 8, exp: 12, emoji: '💀' }
];
const PLAYER_EMOJI = '🧑';
