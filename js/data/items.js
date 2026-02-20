/**
 * 遊戲物品資料（技能見 data/spells.js）
 * 依賴：無
 */
const ITEMS = (function () {
  const list = [];
  const h = (id, name, emoji, amt, rarity, tier, desc) =>
    list.push({ id, name, emoji, effect: 'heal', amount: amt, useContext: 'any', rarity, tier: tier ?? 1, desc: desc || `回復 ${amt} HP` });
  const m = (id, name, emoji, amt, rarity, tier, desc) =>
    list.push({ id, name, emoji, effect: 'mp', amount: amt, useContext: 'any', rarity, tier: tier ?? 1, desc: desc || `回復 ${amt} MP` });
  const b = (id, name, emoji, hpAmt, mpAmt, rarity, tier, desc) =>
    list.push({ id, name, emoji, effect: 'both', hpAmount: hpAmt, mpAmount: mpAmt, useContext: 'any', rarity, tier: tier ?? 1, desc: desc || `回復 ${hpAmt} HP、${mpAmt} MP` });
  const a = (id, name, emoji, dmg, element, rarity, tier, desc) =>
    list.push({ id, name, emoji, effect: 'attack', damage: dmg, element: element || 'neutral', useContext: 'combat', rarity, tier: tier ?? 1, desc: desc || `造成 ${dmg} 點傷害` });
  const f = (id, name, emoji, stat, amt, turns, rarity, tier, desc) =>
    list.push({ id, name, emoji, effect: 'buff', stat, amount: amt, turns, useContext: 'combat', rarity, tier: tier ?? 1, desc });
  const o = (id, name, emoji, dmg, rarity, tier, desc) =>
    list.push({ id, name, emoji, effect: 'aoe', damage: dmg, useContext: 'combat', rarity, tier: tier ?? 1, desc: desc || `對全體造成 ${dmg} 點傷害` });
  // tier 1: 低效果 (地圖 1-10)
  h('potion','治療藥水','🧪',20,'common',1); h('herb','療傷草','🌿',15,'common',1); h('bandage','繃帶','🩹',25,'common',1); h('salve','藥膏','💊',30,'common',1); h('honey','蜂蜜','🍯',18,'common',1);
  h('mushroom','療傷菇','🍄',22,'common',1); h('berry','治癒莓','🫐',12,'common',1); h('root','療傷根','🥔',28,'common',1); h('leaf','生命葉','🍃',16,'common',1); h('dew','晨露','💧',10,'common',1);
  m('ether','魔力藥水','💧',15,'common',1); m('crystal','魔力水晶','💎',12,'common',1); m('essence','魔力精華','✨',20,'common',1); m('dust','魔粉','🌟',8,'common',1); m('orb','魔力球','🔮',18,'common',1);
  m('shard','魔晶碎片','◇',10,'common',1); m('vial','魔力瓶','🧴',14,'common',1); m('stone','回魔石','🪨',16,'common',1); m('flower','魔力花','🌸',11,'common',1); m('gem','小魔晶','💠',9,'common',1);
  b('elixir','萬能藥','✨',30,20,'common',1); b('tonic','活力劑','🥤',25,15,'common',1); b('remedy','萬靈藥','💫',35,25,'common',1); b('nectar','仙露','🍶',20,18,'common',1); b('ambrosia','神饌','🍱',40,30,'common',2);
  a('fire_bomb','火爆彈','💣',40,'fire','common',1); a('ice_shard','冰晶','❄️',35,'ice','common',1); a('thunder_stone','雷石','⚡',45,'thunder','common',1); a('rock_throw','投石','🪨',30,'earth','common',1); a('poison_dart','毒鏢','🗡️',25,'neutral','common',1,'造成 25 點傷害');
  a('flame_flask','火焰瓶','🔥',50,'fire','common',2); a('frost_vial','寒霜瓶','🧊',42,'ice','common',2); a('spark_powder','雷粉','✨',48,'thunder','common',2); a('earth_chip','岩片','🪵',38,'earth','common',2); a('acid_flask','酸液瓶','🧪',33,'neutral','common',2);
  f('atk_powder','力量粉','💪','atk',5,3,'common',1,'3 回合攻擊+5'); f('def_powder','鐵壁粉','🛡️','def',4,3,'common',1,'3 回合防禦+4'); f('mag_powder','魔力粉','🔮','mag',5,3,'common',1,'3 回合魔力+5');
  f('speed_herb','疾風草','🌬️','speed',2,2,'common',1,'2 回合先制'); f('vigor_tonic','鬥志劑','⚔️','atk',8,2,'common',1,'2 回合攻擊+8');
  o('smoke_bomb','煙霧彈','💨',20,'common',1); o('flash_powder','閃光粉','✨',15,'common',1);
  // tier 2: 中低效果 (地圖 11-20)
  h('greater_potion','強效藥水','🧪',45,'common',2); h('super_herb','超級療傷草','🌿',50,'common',2); m('greater_ether','強效魔力藥水','💧',35,'common',2); m('crystal_cluster','魔晶簇','💎',40,'common',2);
  a('inferno_bomb','煉獄彈','🔥',60,'fire','common',2); a('blizzard_shard','暴風雪晶','❄️',55,'ice','common',2); a('lightning_stone','閃電石','⚡',65,'thunder','common',2); a('boulder','巨石','🪨',50,'earth','common',2);
  b('mega_elixir','超級萬能藥','✨',60,40,'common',2); f('hero_tonic','英雄藥','🏆','atk',10,3,'common',2,'3 回合攻擊+10'); f('guard_tonic','守護藥','🛡️','def',8,3,'common',2,'3 回合防禦+8'); f('sage_tonic','賢者藥','📜','mag',10,3,'common',2,'3 回合魔力+10');
  // tier 3: 中高效果 (地圖 21-40)
  h('full_salve','全效藥膏','💊',55,'common',3); h('life_water','生命之水','💧',60,'common',3); m('mana_spring','魔力之泉','🌊',45,'common',3); m('arcane_vial','奧術瓶','🔮',50,'common',3);
  a('dragon_fire','龍炎彈','🐉',70,'fire','common',3); a('absolute_zero','絕對零度','🧊',65,'ice','common',3); a('storm_core','風暴核心','⛈️',75,'thunder','common',3); a('quake_chip','地震片','🌋',60,'earth','common',3);
  o('inferno_powder','煉獄粉','🔥',35,'common',2); o('blizzard_dust','暴雪塵','❄️',30,'common',2);
  // tier 4: 高效果 (地圖 41-70)
  h('phoenix_down','鳳凰尾','🪶',80,'common',4); b('supreme_elixir','至尊萬能藥','✨',80,60,'common',4);
  // 精英物品 tier 5-8 (依地圖 41+ 掉落更高 tier)
  h('elite_potion','精英藥水','🧪',80,'elite',5); h('elite_herb','精英療傷草','🌿',90,'elite',5); m('elite_ether','精英魔力藥水','💧',60,'elite',5); m('elite_crystal','精英魔晶','💎',70,'elite',5); b('elite_elixir','精英萬能藥','✨',100,80,'elite',5);
  a('elite_fire','精英火爆彈','💣',120,'fire','elite',5); a('elite_ice','精英冰晶','❄️',110,'ice','elite',5); a('elite_thunder','精英雷石','⚡',130,'thunder','elite',5); a('elite_earth','精英岩片','🪨',100,'earth','elite',5);
  f('elite_atk','精英力量藥','💪','atk',15,5,'elite',5,'5 回合攻擊+15'); f('elite_def','精英鐵壁藥','🛡️','def',12,5,'elite',5,'5 回合防禦+12'); f('elite_mag','精英魔力藥','🔮','mag',15,5,'elite',5,'5 回合魔力+15');
  o('elite_smoke','精英煙霧彈','💨',60,'elite',5); h('elite_salve','精英藥膏','💊',120,'elite',6); b('elite_tonic','精英活力劑','🥤',120,100,'elite',6);
  a('elite_inferno','精英煉獄彈','🔥',150,'fire','elite',6); a('elite_blizzard','精英暴雪晶','❄️',140,'ice','elite',6); a('elite_lightning','精英閃電石','⚡',160,'thunder','elite',6);
  f('elite_hero','精英英雄藥','🏆','atk',20,5,'elite',6,'5 回合攻擊+20'); f('elite_guard','精英守護藥','🛡️','def',18,5,'elite',6,'5 回合防禦+18');
  o('elite_inferno_powder','精英煉獄粉','🔥',80,'elite',6); h('elite_phoenix','精英鳳凰尾','🪶',150,'elite',7); b('elite_supreme','精英至尊藥','✨',150,120,'elite',7);
  a('elite_void','精英虛空彈','🌑',180,'neutral','elite',8,'造成 180 點無屬性傷害'); f('elite_all','精英全能藥','👑','all',10,4,'elite',7,'4 回合全能力+10');
  // 守門人物品 tier 10 (固定最高)
  h('gate_phoenix','守門鳳凰羽','🪶',999,'gatekeeper',10,'完全回復 HP'); b('gate_elixir','守門神藥','✨',999,999,'gatekeeper',10,'完全回復 HP 與 MP');
  a('gate_judgment','守門審判彈','⚖️',300,'neutral','gatekeeper',10,'造成 300 點傷害'); f('gate_blessing','守門祝福','🙏','all',25,10,'gatekeeper',10,'10 回合全能力+25');
  o('gate_apocalypse','守門終焉','💀',200,'gatekeeper',10,'對全體造成 200 點傷害');
  return list;
})();

const ITEMS_BY_RARITY = {
  common: ITEMS.filter(i => i.rarity === 'common'),
  elite: ITEMS.filter(i => i.rarity === 'elite'),
  gatekeeper: ITEMS.filter(i => i.rarity === 'gatekeeper')
};

const defaultPlayer = () => ({
  level: 1, exp: 0, hp: 20, maxHp: 20, mp: 10, maxMp: 10, atk: 5, mag: 5, def: 0, gold: 0, px: 5, py: 5, mapId: 'meadow', inventory: [],
  abilityPoints: 0, allocatedAtk: 0, allocatedMag: 0, allocatedDef: 0, levelUpBonusAtk: 0, levelUpBonusMag: 0, levelUpBonusDef: 0
});

const PLAYER_EMOJI = '🧑';
