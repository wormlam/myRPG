/** 遊戲常數與靜態資料 */
const RPG = {
  SAVE_KEY_PREFIX: 'myrpg_save_',
  MAP_SIZE: 10,
  ENCOUNTER_CHANCE: 0.25,
  ESCAPE_CHANCE: 0.6,
  DEFEND_DAMAGE_REDUCE: 0.5,
};

const defaultPlayer = () => ({
  level: 1, exp: 0, hp: 20, maxHp: 20, atk: 5, gold: 0, px: 5, py: 5
});

const enemies = [
  { name: '史萊姆', hp: 8, atk: 2, gold: 3, exp: 5 },
  { name: '哥布林', hp: 12, atk: 3, gold: 5, exp: 8 },
  { name: '骷髏兵', hp: 15, atk: 4, gold: 8, exp: 12 }
];
