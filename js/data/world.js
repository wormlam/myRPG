/**
 * 遊戲世界資料：地形、地圖、守門人、夥伴
 * 依賴：無
 */
const TERRAIN = {
  grass: { emoji: '🟩', class: 'terrain-grass' },
  forest: { emoji: '🌲', class: 'terrain-forest' },
  cave: { emoji: '⬛', class: 'terrain-cave' },
  desert: { emoji: '🟨', class: 'terrain-desert' },
  lava: { emoji: '🟥', class: 'terrain-lava' },
  snow: { emoji: '⬜', class: 'terrain-snow' },
  inferno: { emoji: '🔥', class: 'terrain-inferno' },
  void: { emoji: '🌀', class: 'terrain-void' },
  abyss: { emoji: '💀', class: 'terrain-abyss' },
  chaos: { emoji: '⚡', class: 'terrain-chaos' }
};

const GATEKEEPERS = {
  slime_guard: { id: 'slime_guard', name: '守門史萊姆', suggestLv: 10, hp: 250, atk: 22, mag: 6, def: 8, gold: 60, exp: 80, emoji: '🟢' },
  goblin_guard: { id: 'goblin_guard', name: '守門哥布林', suggestLv: 20, hp: 450, atk: 38, mag: 10, def: 14, gold: 90, exp: 120, emoji: '👺' },
  skeleton_guard: { id: 'skeleton_guard', name: '守門骷髏騎士', suggestLv: 30, hp: 580, atk: 48, mag: 14, def: 20, gold: 120, exp: 160, emoji: '💀' },
  dragon_guard: { id: 'dragon_guard', name: '守門龍', suggestLv: 40, hp: 720, atk: 58, mag: 18, def: 26, gold: 150, exp: 200, emoji: '🐉' },
  demon_guard: { id: 'demon_guard', name: '守門惡魔', suggestLv: 50, hp: 880, atk: 68, mag: 22, def: 32, gold: 180, exp: 240, emoji: '😈' },
  vampire_guard: { id: 'vampire_guard', name: '守門吸血鬼', suggestLv: 60, hp: 1050, atk: 78, mag: 26, def: 38, gold: 210, exp: 280, emoji: '🧛' },
  titan_guard: { id: 'titan_guard', name: '守門泰坦', suggestLv: 70, hp: 1250, atk: 90, mag: 30, def: 44, gold: 240, exp: 320, emoji: '🗽' },
  ancient_guard: { id: 'ancient_guard', name: '守門遠古龍', suggestLv: 80, hp: 1480, atk: 102, mag: 34, def: 50, gold: 270, exp: 360, emoji: '🐲' },
  chaos_guard: { id: 'chaos_guard', name: '守門混沌帝王', suggestLv: 90, hp: 1740, atk: 116, mag: 38, def: 56, gold: 300, exp: 400, emoji: '👿' },
  final_guard: { id: 'final_guard', name: '終焉守門人', suggestLv: 100, hp: 2050, atk: 130, mag: 42, def: 62, gold: 350, exp: 450, emoji: '💀' }
};

const COMPANIONS = {
  meadow_ally: { id: 'meadow_ally', name: '見習劍士', mapId: 'meadow', hp: 35, atk: 6, mag: 3, def: 2, cost: 30, emoji: '⚔️' },
  forest_ally: { id: 'forest_ally', name: '森林獵手', mapId: 'forest', hp: 50, atk: 8, mag: 4, def: 3, cost: 60, emoji: '🏹' },
  cave_ally: { id: 'cave_ally', name: '礦工戰士', mapId: 'cave', hp: 65, atk: 9, mag: 3, def: 5, cost: 90, emoji: '⛏️' },
  desert_ally: { id: 'desert_ally', name: '沙漠巫師', mapId: 'desert', hp: 55, atk: 5, mag: 12, def: 2, cost: 120, emoji: '🔮' },
  volcano_ally: { id: 'volcano_ally', name: '火焰騎士', mapId: 'volcano', hp: 80, atk: 11, mag: 6, def: 4, cost: 150, emoji: '🔥' },
  inferno_ally: { id: 'inferno_ally', name: '煉獄法師', mapId: 'inferno', hp: 70, atk: 6, mag: 14, def: 3, cost: 180, emoji: '👿' },
  void_ally: { id: 'void_ally', name: '虛空刺客', mapId: 'void', hp: 60, atk: 15, mag: 4, def: 2, cost: 210, emoji: '🗡️' },
  abyss_ally: { id: 'abyss_ally', name: '深淵守衛', mapId: 'abyss', hp: 100, atk: 10, mag: 5, def: 8, cost: 240, emoji: '🛡️' },
  chaos_ally: { id: 'chaos_ally', name: '混沌術士', mapId: 'chaos', hp: 75, atk: 7, mag: 16, def: 4, cost: 270, emoji: '⚡' },
  end_ally: { id: 'end_ally', name: '終焉勇者', mapId: 'end', hp: 120, atk: 14, mag: 10, def: 6, cost: 300, emoji: '👑' }
};

const MAPS = [
  { id: 'meadow', name: '新手草原', size: 10, terrain: 'grass', minLv: 1, maxLv: 10, gatekeepers: [{ x: 9, y: 5, nextMap: 'forest', suggestLv: 10, bossId: 'slime_guard' }], companions: [{ x: 3, y: 3, id: 'meadow_ally' }] },
  { id: 'forest', name: '幽暗森林', size: 10, terrain: 'forest', minLv: 11, maxLv: 20, gatekeepers: [{ x: 9, y: 5, nextMap: 'cave', suggestLv: 20, bossId: 'goblin_guard' }], companions: [{ x: 4, y: 4, id: 'forest_ally' }] },
  { id: 'cave', name: '地下洞穴', size: 10, terrain: 'cave', minLv: 21, maxLv: 30, gatekeepers: [{ x: 9, y: 5, nextMap: 'desert', suggestLv: 30, bossId: 'skeleton_guard' }], companions: [{ x: 5, y: 3, id: 'cave_ally' }] },
  { id: 'desert', name: '沙漠廢墟', size: 10, terrain: 'desert', minLv: 31, maxLv: 40, gatekeepers: [{ x: 9, y: 5, nextMap: 'volcano', suggestLv: 40, bossId: 'dragon_guard' }], companions: [{ x: 2, y: 7, id: 'desert_ally' }] },
  { id: 'volcano', name: '火山地帶', size: 10, terrain: 'lava', minLv: 41, maxLv: 50, gatekeepers: [{ x: 9, y: 5, nextMap: 'inferno', suggestLv: 50, bossId: 'demon_guard' }], companions: [{ x: 6, y: 2, id: 'volcano_ally' }] },
  { id: 'inferno', name: '煉獄火海', size: 10, terrain: 'inferno', minLv: 51, maxLv: 60, gatekeepers: [{ x: 9, y: 5, nextMap: 'void', suggestLv: 60, bossId: 'vampire_guard' }], companions: [{ x: 7, y: 4, id: 'inferno_ally' }] },
  { id: 'void', name: '虛空裂隙', size: 10, terrain: 'void', minLv: 61, maxLv: 70, gatekeepers: [{ x: 9, y: 5, nextMap: 'abyss', suggestLv: 70, bossId: 'titan_guard' }], companions: [{ x: 3, y: 6, id: 'void_ally' }] },
  { id: 'abyss', name: '深淵邊境', size: 10, terrain: 'abyss', minLv: 71, maxLv: 80, gatekeepers: [{ x: 9, y: 5, nextMap: 'chaos', suggestLv: 80, bossId: 'ancient_guard' }], companions: [{ x: 4, y: 5, id: 'abyss_ally' }] },
  { id: 'chaos', name: '混沌領域', size: 10, terrain: 'chaos', minLv: 81, maxLv: 90, gatekeepers: [{ x: 9, y: 5, nextMap: 'end', suggestLv: 90, bossId: 'chaos_guard' }], companions: [{ x: 5, y: 4, id: 'chaos_ally' }] },
  { id: 'end', name: '終焉之地', size: 10, terrain: 'chaos', minLv: 91, maxLv: 100, gatekeepers: [{ x: 9, y: 5, nextMap: 'end', suggestLv: 100, bossId: 'final_guard' }], companions: [{ x: 6, y: 5, id: 'end_ally' }] }
];
