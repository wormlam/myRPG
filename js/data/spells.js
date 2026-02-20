/**
 * 魔法/技能資料（每類 9 種共 81 種 + 精英/守門人/隊友專用 50 種）
 * 依賴：無
 */
const SPELLS = (function () {
  const list = [];
  const a = (id, name, lv, mp, element, mult, bonus, extra) =>
    list.push({ id, name, level: lv, mp, type: 'attack', element: element || 'neutral', mult, bonus: bonus ?? 0, ...extra });
  const h = (id, name, lv, mp, amount, extra) =>
    list.push({ id, name, level: lv, mp, type: 'heal', amount: amount ?? 15, ...extra });
  const o = (id, name, lv, mp, element, mult, bonus, extra) =>
    list.push({ id, name, level: lv, mp, type: 'aoe', element: element || 'neutral', mult, bonus: bonus ?? 0, ...extra });
  const b = (id, name, lv, mp, stat, amt, turns, extra) =>
    list.push({ id, name, level: lv, mp, type: 'buff', stat, amount: amt, turns, ...extra });
  const p = (id, name, mp, mult, bonus, extra) =>
    list.push({ id, name, level: 1, mp, type: 'physical', mult, bonus: bonus ?? 0, ...extra });
  const pa = (id, name, mp, mult, bonus, extra) =>
    list.push({ id, name, level: 1, mp, type: 'physical_aoe', mult, bonus: bonus ?? 0, ...extra });
  const d = (id, name, mp, stat, amt, turns, extra) =>
    list.push({ id, name, level: 1, mp, type: 'defense', stat: stat || 'def', amount: amt, turns, ...extra });

  // 火系 9種（每種效果唯一）
  a('spark','火花',1,1,'fire',1.0,0,{effectDesc:'火花'});
  a('fireball','火球術',2,3,'fire',1.2,1,{dotTurns:3,dotDmg:2,effectDesc:'燃燒'});
  a('flame_strike','焰擊',2,2,'fire',1.3,1,{dotTurns:1,dotDmg:1,effectDesc:'灼傷'});
  a('ember','餘燼',3,4,'fire',1.6,2,{effectDesc:'餘燼'});
  a('inferno_bolt','煉獄箭',4,5,'fire',2.0,4,{dotTurns:2,dotDmg:3,effectDesc:'煉獄'});
  a('blaze','烈焰',4,4,'fire',1.9,3,{effectDesc:'烈焰'});
  a('pyro_blast','爆炎',5,6,'fire',2.6,6,{effectDesc:'爆炎'});
  o('fire_ring','火環',3,6,'fire',1.2,2,{effectDesc:'火環'});
  o('inferno_wave','煉獄波',5,8,'fire',1.6,4,{effectDesc:'煉獄波'});

  // 冰系 9種
  a('frost_touch','霜觸',1,1,'ice',1.0,0,{effectDesc:'霜觸'});
  a('icearrow','冰箭術',2,2,'ice',1.1,0,{freeze:true,effectDesc:'凍結'});
  a('ice_shard','冰刺',2,2,'ice',1.2,1,{effectDesc:'冰刺'});
  a('frost_nova','霜新星',3,4,'ice',1.4,1,{freeze:true,effectDesc:'冰封'});
  a('blizzard_bolt','暴雪箭',3,4,'ice',1.7,2,{effectDesc:'暴雪'});
  a('frozen_lance','冰槍',4,5,'ice',2.1,4,{effectDesc:'冰槍'});
  o('ice_storm','冰風暴',4,7,'ice',1.2,0,{effectDesc:'冰風暴'});
  o('blizzard','暴風雪',6,10,'ice',1.8,5,{effectDesc:'暴風雪'});
  h('frost_heal','冰療',2,4,12,{effectDesc:'冰療'});

  // 雷系 9種
  a('static_shock','靜電',1,1,'thunder',1.0,0,{effectDesc:'靜電'});
  a('thunder','雷擊術',2,4,'thunder',1.3,2,{stunChance:0.5,stunTurns:2,effectDesc:'麻痺'});
  a('lightning_bolt','閃電箭',2,3,'thunder',1.4,1,{effectDesc:'閃電'});
  a('supercharge','超載',2,3,'thunder',1.1,0,{stunChance:0.3,stunTurns:1,effectDesc:'感電'});
  a('chain_lightning','連鎖閃電',3,5,'thunder',1.8,3,{effectDesc:'連鎖'});
  a('thunder_strike','雷擊',4,6,'thunder',2.2,5,{effectDesc:'雷擊'});
  o('lightning_storm','閃電風暴',4,8,'thunder',1.4,3,{effectDesc:'雷風暴'});
  o('thunder_wave','雷波',6,10,'thunder',1.8,5,{effectDesc:'雷波'});
  b('lightning_aura','雷光護體',3,5,'def',3,2,{effectDesc:'雷防'});

  // 土系 9種
  a('rock_throw','投石',1,1,'earth',1.0,0,{effectDesc:'投石'});
  a('rockbreak','破岩術',2,5,'earth',1.5,2,{ignoreDef:true,effectDesc:'破甲'});
  a('mud_slap','泥擊',1,2,'earth',1.2,1,{effectDesc:'泥擊'});
  a('earth_spike','地刺',3,3,'earth',1.6,2,{effectDesc:'地刺'});
  a('boulder','巨石',4,4,'earth',2.0,4,{effectDesc:'巨石'});
  a('crystal_shard','晶刺',3,4,'earth',1.7,2,{effectDesc:'晶刺'});
  o('earthquake','地震',5,10,'earth',1.5,4,{effectDesc:'地震'});
  h('earth_heal','大地療癒',4,6,20,{effectDesc:'地療'});
  a('quake_strike','震擊',4,5,'earth',2.4,5,{effectDesc:'震擊'});

  // 暗/毒系 9種
  a('shadow_bolt','暗影箭',1,2,'neutral',1.0,0,{effectDesc:'暗影'});
  a('poison_touch','毒觸',2,2,'neutral',1.0,0,{dotTurns:3,dotDmg:2,effectDesc:'毒'});
  a('curse_bolt','詛咒箭',2,3,'neutral',1.3,1,{effectDesc:'詛咒'});
  a('void_strike','虛空擊',3,4,'neutral',1.6,3,{effectDesc:'虛空'});
  a('corruption','腐化',5,6,'neutral',2.0,4,{dotTurns:2,dotDmg:4,effectDesc:'腐化'});
  a('dark_flame','暗焰',4,5,'neutral',2.1,4,{effectDesc:'暗焰'});
  o('shadow_wave','暗影波',4,7,'neutral',1.8,3,{effectDesc:'暗影波'});
  a('soul_drain','吸魂',6,8,'neutral',2.5,6,{effectDesc:'吸血'});
  h('dark_heal','暗療',3,5,18,{effectDesc:'暗療'});

  // 神聖 9種
  a('holy_bolt','聖光箭',2,3,'neutral',1.2,1,{effectDesc:'聖光'});
  a('purify','淨化',3,5,'neutral',1.5,2,{effectDesc:'淨化'});
  a('light_ray','光線',3,4,'neutral',1.7,2,{effectDesc:'光線'});
  a('smite','天罰',4,7,'neutral',2.1,5,{effectDesc:'天罰'});
  a('divine_strike','神聖擊',5,9,'neutral',2.5,6,{effectDesc:'神聖擊'});
  o('holy_nova','聖光新星',4,8,'neutral',1.8,4,{effectDesc:'聖光新星'});
  o('judgment','審判',7,14,'neutral',2.4,10,{effectDesc:'審判'});
  a('radiant_blast','輝煌爆',8,11,'neutral',3.2,12,{effectDesc:'聖爆'});
  h('divine_light','聖光療',5,12,45,{effectDesc:'聖療'});

  // 輔助 9種
  h('lesser_heal','小療',1,2,8,{effectDesc:'小療'});
  h('heal','治癒術',1,5,15,{effectDesc:'治癒'});
  h('greater_heal','大療',3,8,25,{effectDesc:'大療'});
  h('rejuvenate','回春',4,10,35,{effectDesc:'回春'});
  h('group_heal','群療',6,15,30,{effectDesc:'群療'});
  h('full_heal','完全治癒',7,20,999,{effectDesc:'全療'});
  b('atk_up','力量祝福',1,3,'atk',3,2,{effectDesc:'力祝'});
  b('def_up','鐵壁祝福',1,3,'def',3,2,{effectDesc:'防祝'});
  b('blessing','全能祝福',5,10,'all',5,3,{effectDesc:'全祝'});

  // 物理攻擊 9種
  p('slash','斬擊',0,1.0,0,{effectDesc:'斬擊'});
  p('heavy_strike','重擊',1,1.4,3,{effectDesc:'重擊'});
  p('cleave','順劈',2,1.5,4,{effectDesc:'順劈'});
  p('power_slash','強力斬',2,1.7,5,{effectDesc:'強斬'});
  p('double_strike','雙連擊',3,1.9,7,{effectDesc:'雙擊'});
  pa('sweep','橫掃',2,1.2,3,{effectDesc:'橫掃'});
  pa('blade_wave','劍氣波',6,2.0,10,{effectDesc:'劍氣'});
  p('whirlwind','旋風斬',5,2.2,12,{effectDesc:'旋風'});
  p('devastate','毀滅打擊',7,3.0,18,{effectDesc:'毀滅'});

  // 物理防禦 9種
  d('guard','格擋',1,'def',5,2,{effectDesc:'格擋'}); d('iron_wall','鐵壁',2,'def',8,2,{effectDesc:'鐵壁'});
  d('fortress','堡壘',3,'def',12,3,{effectDesc:'堡壘'}); d('counter_stance','反擊架勢',2,'def',3,2,{effectDesc:'架勢'});
  d('parry','招架',3,'def',6,2,{effectDesc:'招架'}); d('defensive_stance','防禦姿態',2,'def',10,2,{effectDesc:'姿態'});
  d('adamant','金剛',5,'def',15,3,{effectDesc:'金剛'}); d('retaliate','反擊',3,'def',2,2,{effectDesc:'反擊'});
  d('thorns','荊棘',4,'def',5,2,{effectDesc:'荊棘'});

  // 精英/守門人/隊友專用 50種（主角與普通敵人無法學會）
  const ex = (fn, ...args) => { fn(...args); list[list.length - 1].exclusive = true; };
  // 精英專用 火/冰/雷/土/暗 強力魔法
  ex(a,'hellfire','地獄火',9,15,'fire',3.2,12,{dotTurns:1,dotDmg:5}); ex(a,'dragon_breath','龍息',8,10,'fire',3.3,9);
  ex(o,'meteor_shower','流星雨',7,12,'fire',2.5,8); ex(a,'absolute_zero','絕對零度',7,11,'ice',8,8,{freeze:true});
  ex(o,'permafrost','永凍',8,14,'ice',2.5,8); ex(a,'cryo_beam','極寒光束',7,9,'ice',2.8,6);
  ex(o,'plasma_field','電漿場',8,14,'thunder',2.8,10); ex(a,'volt_crush','電壓碎',8,11,'thunder',3,8);
  ex(o,'avalanche','雪崩',7,12,'earth',2.5,7); ex(a,'landslide','山崩',7,9,'earth',3,6);
  ex(a,'void_rift','虛空裂隙',7,12,'neutral',2.5,8); ex(a,'abyss_strike','深淵擊',7,9,'neutral',2.8,6);
  ex(o,'poison_cloud','毒雲',5,8,'neutral',2,4,{dotTurns:2,dotDmg:3}); ex(a,'chaos_bolt','混沌箭',6,8,'neutral',2.6,5);
  // 精英專用 物理/防禦
  ex(p,'execution','處決',8,3.5,22); ex(p,'blade_storm','劍刃風暴',9,4,28); ex(pa,'massacre','屠戮',8,3,18);
  ex(d,'immovable','不動',6,'def',20,2); ex(d,'guardian','守護',5,'def',18,2); ex(d,'last_stand','背水一戰',4,'all',5,1);
  // 守門人專用 神聖/強力
  ex(a,'omega_blast','終極爆',10,25,'neutral',4,20); ex(a,'final_strike','終結一擊',9,18,'neutral',3.5,15);
  ex(o,'holy_wrath','聖怒',8,16,'neutral',3,12); ex(h,'resurrection','復活',9,30,50);
  ex(b,'heroic','英雄氣概',6,12,'all',8,2); ex(b,'berserk','狂暴',4,7,'atk',10,1);
  ex(d,'reflect','反射',5,'def',8,1); ex(d,'battle_cry','戰嚎',1,'atk',3,1);
  // 隊友專用 支援/特色
  ex(h,'ally_heal','夥伴療癒',5,8,40); ex(b,'ally_bless','夥伴祝福',4,6,'all',4,2);
  ex(a,'ally_strike','夥伴突擊',4,5,'neutral',2.2,4); ex(a,'ally_cover','夥伴掩護',3,4,'neutral',1.5,0);
  ex(b,'regen','再生',2,5,'hp',5,3); ex(b,'shield','護盾',3,6,'def',8,2);
  ex(a,'focus_blast','聚能爆',5,6,'neutral',2.5,4); ex(a,'mind_break','心靈破碎',6,8,'neutral',2.3,5);
  ex(o,'psychic_wave','念力波',6,10,'neutral',2.2,6); ex(a,'dispel','驅散',4,6,'neutral',1.5,0);
  ex(a,'counter','反擊',3,4,'neutral',2,2); ex(b,'mag_up','魔力祝福',2,4,'mag',4,2);
  ex(b,'speed_up','疾風祝福',2,4,'speed',2,2); ex(p,'backstab','背刺',3,2.2,8);
  ex(p,'assassinate','暗殺',7,3.2,16); ex(p,'annihilate','殲滅',10,4.5,30);
  ex(a,'blood_drain','吸血',5,6,'neutral',2,3); ex(a,'meteor','隕石',9,16,'earth',3,10);
  ex(pa,'apocalypse_slash','終焉斬',10,4,25); ex(o,'prismatic_blast','虹光爆',8,18,'neutral',3.2,14);
  ex(a,'soul_rend','靈魂撕裂',7,14,'neutral',3,10); ex(o,'thunder_god','雷神降臨',9,20,'thunder',3.5,15);

  return list;
})();

// 依類型設定解鎖需求：魔法→reqMag，物理→reqAtk，防禦→reqDef（幅度再加大，專用法術不設定）
let physIdx = 0, defIdx = 0;
SPELLS.forEach((s) => {
  if (s.exclusive) return;
  if (s.type === 'physical' || s.type === 'physical_aoe') { s.reqAtk = 18 + physIdx * 12; physIdx++; }
  else if (s.type === 'defense') { s.reqDef = 12 + defIdx * 12; defIdx++; }
  else if (s.type === 'attack' || s.type === 'aoe' || s.type === 'heal' || s.type === 'buff') s.reqMag = 18 + (s.level || 1) * 12;
});

const SPELLS_BY_ID = Object.fromEntries(SPELLS.map(s => [s.id, s]));
const SPELLS_BY_ELEMENT = { fire: [], ice: [], thunder: [], earth: [], neutral: [] };
SPELLS.forEach(s => {
  const el = s.element || 'neutral';
  if (!SPELLS_BY_ELEMENT[el]) SPELLS_BY_ELEMENT[el] = [];
  SPELLS_BY_ELEMENT[el].push(s);
});

// 前綴 → 元素/類型
const PREFIX_TO_ELEMENT = {
  毒:'neutral',毒液:'neutral',腐敗:'neutral',腐化:'neutral',
  火焰:'fire',炎:'fire',岩漿:'fire',煉獄:'fire',
  冰霜:'ice',寒:'ice',
  雷電:'thunder',風暴:'thunder',
  石:'earth',骨:'earth',洞穴:'earth',沙漠:'earth',泥:'earth',森林:'earth',草原:'earth',
  黑暗:'neutral',暗黑:'neutral',暗影:'neutral',虛空:'neutral',深淵:'neutral',詛咒:'neutral',邪惡:'neutral',墮落:'neutral',
  神聖:'neutral',混沌:'neutral',狂暴:'neutral',狂野:'neutral',血:'neutral',尖刺:'neutral',
  鋼鐵:'earth',水晶:'neutral',幽靈:'neutral',霧:'neutral',巨:'neutral',幼:'neutral',遠古:'neutral'
};

const PHYSICAL_PREFIXES = ['狂暴','狂野','血','尖刺','鋼鐵','巨','盜賊','騎士','獸人','骨','石'];

// 前綴 → 技能池（依元素/物理篩選，排除專用法術）
function getSpellsForPrefix(prefix) {
  const base = s => !s.exclusive;
  const isPhys = PHYSICAL_PREFIXES.includes(prefix);
  if (isPhys) {
    const physPool = SPELLS.filter(s => base(s) && (s.type === 'physical' || s.type === 'physical_aoe' || s.type === 'defense'));
    return physPool.length ? physPool : SPELLS.filter(s => base(s) && (s.type === 'physical' || s.type === 'defense')).slice(0, 8);
  }
  const el = PREFIX_TO_ELEMENT[prefix] || 'neutral';
  const pool = (SPELLS_BY_ELEMENT[el] || SPELLS_BY_ELEMENT.neutral || SPELLS).filter(
    s => base(s) && (s.type === 'attack' || s.type === 'aoe' || s.type === 'heal')
  );
  return pool.length ? pool : SPELLS.filter(s => base(s) && (s.type === 'attack' || s.type === 'heal')).slice(0, 10);
}

function getSpellsForElite(mapId) {
  return ELITE_SPELLS_BY_MAP[mapId] || ELITE_SPELLS_BY_MAP.meadow;
}

function getSpellsForGatekeeper(bossId) {
  return GATEKEEPER_SPELLS[bossId] || GATEKEEPER_SPELLS.slime_guard;
}

function getSpellsForCompanion(compId) {
  return COMPANION_SPELLS[compId] || ['spark', 'heal'];
}

// 精英技能（依地圖，含專用法術）
const ELITE_SPELLS_BY_MAP = {
  meadow: ['fireball','icearrow','slash','heal','guard'], forest: ['blaze','ice_shard','meteor_shower','greater_heal','iron_wall'],
  cave: ['thunder','rockbreak','avalanche','earth_heal','fortress'], desert: ['frost_touch','permafrost','cleave','dark_heal','parry'],
  volcano: ['inferno_bolt','hellfire','whirlwind','rejuvenate','defensive_stance'], inferno: ['dragon_breath','hellfire','blade_storm','divine_light','immovable'],
  void: ['void_strike','void_rift','soul_drain','dark_heal','retaliate'], abyss: ['abyss_strike','void_rift','execution','full_heal','guardian'],
  chaos: ['chaos_bolt','plasma_field','massacre','blessing','last_stand'], end: ['omega_blast','final_strike','annihilate','heroic','guardian']
};

// 守門人技能（含專用法術）
const GATEKEEPER_SPELLS = {
  slime_guard: ['poison_touch','ember','slash','heal','guard'], goblin_guard: ['flame_strike','ice_shard','heavy_strike','lesser_heal','iron_wall'],
  skeleton_guard: ['curse_bolt','shadow_bolt','poison_cloud','dark_heal','parry'], dragon_guard: ['dragon_breath','hellfire','devastate','rejuvenate','fortress'],
  demon_guard: ['dark_flame','chaos_bolt','execution','greater_heal','adamant'], vampire_guard: ['soul_drain','blood_drain','assassinate','rejuvenate','retaliate'],
  titan_guard: ['landslide','avalanche','blade_storm','earth_heal','guardian'], ancient_guard: ['avalanche','omega_blast','annihilate','full_heal','immovable'],
  chaos_guard: ['chaos_bolt','void_rift','massacre','blessing','last_stand'], final_guard: ['omega_blast','final_strike','annihilate','resurrection','guardian']
};

// 隊友技能（含專用法術）
const COMPANION_SPELLS = {
  meadow_ally: ['spark','flame_strike','slash','ally_heal','guard'], forest_ally: ['ice_shard','blizzard_bolt','heavy_strike','ally_heal','iron_wall'],
  cave_ally: ['rock_throw','earth_spike','power_slash','earth_heal','fortress'], desert_ally: ['mud_slap','purify','cleave','ally_heal','parry'],
  volcano_ally: ['flame_strike','inferno_bolt','whirlwind','rejuvenate','defensive_stance'], inferno_ally: ['inferno_bolt','meteor_shower','devastate','ally_heal','adamant'],
  void_ally: ['shadow_bolt','void_strike','backstab','dark_heal','retaliate'], abyss_ally: ['earth_spike','earth_heal','assassinate','crystal_shard','thorns'],
  chaos_ally: ['chain_lightning','psychic_wave','blade_wave','ally_bless','thorns'], end_ally: ['smite','holy_wrath','annihilate','heroic','guardian']
};

// 主角可用技能（依攻/魔/防解鎖）
// 技能分類（供選單顯示）
const DARK_POISON_IDS = new Set(['shadow_bolt','poison_touch','curse_bolt','void_strike','dark_flame','shadow_wave','corruption','soul_drain','dark_heal']);
const HOLY_IDS = new Set(['holy_bolt','purify','smite','divine_strike','holy_nova','judgment','light_ray','radiant_blast','divine_light']);
const SUPPORT_IDS = new Set();
const SPELL_CATEGORIES = [
  { id: 'physical', name: '物理攻擊', emoji: '⚔️', filter: s => (s.type === 'physical' || s.type === 'physical_aoe') },
  { id: 'defense', name: '物理防禦', emoji: '🛡️', filter: s => s.type === 'defense' },
  { id: 'fire', name: '火系', emoji: '🔥', filter: s => s.element === 'fire' },
  { id: 'ice', name: '冰系', emoji: '❄️', filter: s => s.element === 'ice' },
  { id: 'thunder', name: '雷系', emoji: '⚡', filter: s => s.element === 'thunder' },
  { id: 'earth', name: '土系', emoji: '🪨', filter: s => s.element === 'earth' },
  { id: 'dark', name: '暗／毒', emoji: '🌑', filter: s => DARK_POISON_IDS.has(s.id) },
  { id: 'holy', name: '神聖', emoji: '✨', filter: s => HOLY_IDS.has(s.id) },
  { id: 'support', name: '輔助', emoji: '💚', filter: s => !HOLY_IDS.has(s.id) && (s.type === 'heal' || s.type === 'buff' || SUPPORT_IDS.has(s.id)) }
];

function getSpellEffectDesc(s) {
  return s?.effectDesc ?? '';
}

function getSpellsByCategory(catId, player) {
  const cat = SPELL_CATEGORIES.find(c => c.id === catId);
  if (!cat) return [];
  const all = getPlayerSpells(player);
  return all.filter(cat.filter);
}

function getPlayerSpells(player) {
  const p = player || GameState?.player;
  const atk = p?.atk ?? 5;
  const mag = p?.mag ?? 5;
  const def = p?.def ?? 0;
  return SPELLS.filter(s => {
    if (s.exclusive) return false;
    if (s.reqAtk != null) return atk >= s.reqAtk;
    if (s.reqMag != null) return mag >= s.reqMag;
    if (s.reqDef != null) return def >= s.reqDef;
    return true;
  }).sort((a, b) => {
    const order = (x) => (x.reqAtk ?? 0) + (x.reqMag ?? 0) * 100 + (x.reqDef ?? 0) * 10;
    return order(a) - order(b) || a.id.localeCompare(b.id);
  });
}
