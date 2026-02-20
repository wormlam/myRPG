/**
 * 介面與模態視窗系統
 * 依賴：data/items (SPELLS, ITEMS, PLAYER_EMOJI), data/world (MAPS, GATEKEEPERS, COMPANIONS), state, utils, systems
 */
const UISystem = {
  updateEnemyHp() {
    const container = $('enemiesContainer');
    if (!container || !GameState.enemies?.length) return;
    GameState.enemies.forEach(enemy => {
      const slot = container.querySelector(`.enemy-slot[data-idx="${enemy.idx}"]`);
      if (!slot) return;
      const hpVal = slot.querySelector('.enemy-hp-val');
      const hpFill = slot.querySelector('.enemy-hp-fill');
      if (hpVal) hpVal.textContent = enemy.hp;
      if (hpFill && (enemy.maxHp ?? 0) > 0) {
        const pct = Math.max(0, Math.min(100, ((enemy.hp ?? 0) / enemy.maxHp) * 100));
        hpFill.style.width = pct + '%';
      }
      if (enemy.hp <= 0) slot.classList.add('dead');
    });
  },

  update() {
    const { player, enemies, targeting } = GameState;
    const expNeed = CombatSystem.getExpNeed();

    const setText = (id, val) => { const el = $(id); if (el) el.textContent = val; };
    setText('playerLevel', player.level);
    setText('playerHp', player.hp);
    setText('playerMaxHp', player.maxHp);
    setText('playerAtk', player.atk);
    setText('playerMag', player.mag ?? 5);
    setText('playerDef', player.def ?? 0);
    setText('gold', player.gold);
    setText('playerExp', player.exp);
    setText('playerExpNeed', expNeed);
    setText('playerMp', player.mp ?? 0);
    setText('playerMaxMp', player.maxMp ?? 10);
    const pHp = $('playerHpBar');
    if (pHp && player.maxHp > 0) pHp.style.width = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100)) + '%';
    const pMp = $('playerMpBar');
    if (pMp && (player.maxMp ?? 10) > 0) pMp.style.width = Math.max(0, Math.min(100, ((player.mp ?? 0) / (player.maxMp ?? 10)) * 100)) + '%';
    const pExp = $('playerExpBar');
    if (pExp && expNeed > 0) pExp.style.width = Math.max(0, Math.min(100, (player.exp / expNeed) * 100)) + '%';

    if (enemies.length > 0) {
      $('mapPanel').style.display = 'none';
      $('combatPanel').style.display = 'block';
      $('logPanel').style.display = 'block';
      $('gameScreen')?.classList.add('in-combat');

      const container = $('enemiesContainer');
      container.innerHTML = '';
      const alive = enemies.filter(e => e.hp > 0);
      const idxToNum = {};
      alive.forEach((e, i) => { idxToNum[e.idx] = i + 1; });
      enemies.forEach(enemy => {
        const num = targeting && enemy.hp > 0 ? idxToNum[enemy.idx] : '';
        const slot = document.createElement('div');
        slot.className = 'enemy-slot' + (enemy.hp <= 0 ? ' dead' : '') + (targeting ? ' targetable' : '');
        slot.dataset.idx = enemy.idx;
        slot.dataset.num = num;
        const enemyMp = enemy.mp ?? enemy.mag ?? 0;
        const enemyMaxMp = enemy.maxMp ?? enemy.mag ?? 0;
        const enemyMpPct = enemyMaxMp > 0 ? Math.max(0, (enemyMp / enemyMaxMp) * 100) : 100;
        slot.innerHTML = `
          <div class="enemy-nameplate">
            <span class="nameplate-name">${num ? num + '. ' : ''}${enemy.name}</span>
            <span class="nameplate-stats-row1">HP <span class="enemy-hp-val">${enemy.hp}</span>/<span class="enemy-maxhp-val">${enemy.maxHp}</span> · MP <span class="enemy-mp-val">${enemyMp}</span>/<span class="enemy-maxmp-val">${enemyMaxMp}</span></span>
            <div class="enemy-bars-row">
              <div class="enemy-hp-bar">
                <div class="hp-bar"><div class="hp-fill enemy-hp-fill" style="width:${(enemy.maxHp ?? 0) > 0 ? Math.max(0, Math.min(100, ((enemy.hp ?? 0) / enemy.maxHp) * 100)) : 0}%;background:#e94560"></div></div>
              </div>
              <div class="enemy-mp-bar">
                <div class="hp-bar"><div class="hp-fill" style="width:${enemyMpPct}%;background:linear-gradient(90deg,#9b59b6,#8e44ad)"></div></div>
              </div>
            </div>
            <span class="nameplate-stats-row2">攻 ${enemy.atk} 魔 ${enemy.mag ?? 0} 防 ${enemy.def ?? 0}${enemy.escapeCountdown !== undefined ? ` · ⚠️${enemy.escapeCountdown}回合逃走` : ''}</span>
          </div>
          <div class="enemy-emoji-wrap">${enemy.emoji || '👹'}</div>
        `;
        if (enemy.hp > 0 && targeting) slot.onclick = () => CombatSystem.onEnemyTargetClick(enemy.idx);
        container.appendChild(slot);
      });

      const setCombat = (id, val) => { const el = $(id); if (el) el.textContent = val; };
      setCombat('playerEmoji', PLAYER_EMOJI);
      setCombat('combatPlayerName', '冒險者');
      setCombat('combatPlayerHp', player.hp);
      setCombat('combatPlayerMaxHp', player.maxHp);
      setCombat('combatPlayerMp', player.mp ?? 0);
      setCombat('combatPlayerMaxMp', player.maxMp ?? 10);
      setCombat('combatPlayerAtk', player.atk);
      setCombat('combatPlayerMag', player.mag ?? 5);
      setCombat('combatPlayerDef', player.def ?? 0);
      const combatHpBar = $('combatPlayerHpBar');
      if (combatHpBar && player.maxHp > 0) {
        const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
        combatHpBar.style.width = hpPct + '%';
      }
      const combatMpBar = $('combatPlayerMpBar');
      if (combatMpBar && (player.maxMp ?? 10) > 0) {
        const mpPct = Math.max(0, Math.min(100, ((player.mp ?? 0) / (player.maxMp ?? 10)) * 100));
        combatMpBar.style.width = mpPct + '%';
      }

      const partyCompanions = $('partyCompanions');
      if (partyCompanions) {
        const companions = (GameState.recruitedCompanions || []).filter(c => c.isActive);
        partyCompanions.innerHTML = companions.map(c => {
          const hp = c.hp ?? c.maxHp ?? 0;
          const maxHp = c.maxHp ?? c.hp ?? 1;
          const mp = c.mp ?? c.mag ?? 0;
          const maxMp = c.maxMp ?? (c.mag ?? 0) * 2 + 5;
          const hpPct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 100;
          const mpPct = maxMp > 0 ? Math.max(0, Math.min(100, (mp / maxMp) * 100)) : 100;
          const atk = c.atk ?? 0;
          const mag = c.mag ?? 0;
          const def = c.def ?? 0;
          const compLv = c.level ?? 1;
          return `<div class="companion-sprite companion-card ${hp <= 0 ? 'dead' : ''}">
            <div class="companion-nameplate player-nameplate">
              <span class="nameplate-name">${c.name || '隊友'} Lv.${compLv}</span>
              <span class="nameplate-stats-row1">HP ${hp}/${maxHp} · MP ${mp}/${maxMp}</span>
              <div class="player-bars-row">
                <div class="player-hp-bar">
                  <div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%;background:linear-gradient(90deg,#4ecca3,#2ecc71)"></div></div>
                </div>
                <div class="player-mp-bar">
                  <div class="hp-bar"><div class="hp-fill" style="width:${mpPct}%;background:linear-gradient(90deg,#9b59b6,#8e44ad)"></div></div>
                </div>
              </div>
              <span class="nameplate-stats-row2">攻 ${atk} 魔 ${mag} 防 ${def}</span>
            </div>
            <span class="sprite-emoji companion-emoji">${c.emoji || '🤝'}</span>
          </div>`;
        }).join('');
      }

      const spellWrap = $('spellListWrap');
      if (spellWrap && typeof getPlayerSpells === 'function') {
        const spells = getPlayerSpells(player);
        const emoji = { fire: '🔥', ice: '❄️', thunder: '⚡', earth: '🪨', neutral: '✨' };
        spellWrap.innerHTML = spells.map((s, i) => {
          const canUse = (player.mp ?? 0) >= (s.mp ?? 0);
          const e = emoji[s.element] || (s.type === 'physical' || s.type === 'physical_aoe' ? '⚔️' : s.type === 'defense' ? '🛡️' : '✨');
          const num = i < 9 ? ` (${i + 1})` : '';
          const mpStr = (s.mp ?? 0) > 0 ? `${s.mp}MP` : '';
          const reqStr = s.reqAtk != null ? `攻${s.reqAtk}` : s.reqMag != null ? `魔${s.reqMag}` : s.reqDef != null ? `防${s.reqDef}` : '';
          const desc = typeof getSpellEffectDesc === 'function' ? getSpellEffectDesc(s) : '';
          return `<button class="spell-btn panel-btn" data-spell="${s.id}" ${canUse ? '' : 'disabled'} title="${s.name} ${mpStr} ${reqStr}${!canUse ? ' (MP或能力不足)' : ''}"><span class="spell-name-row">${e} ${s.name}${num}</span><span class="spell-desc-row">${desc}</span></button>`;
        }).join('');
      }
      const btnEscape = $('btnEscape');
      if (btnEscape) {
        btnEscape.disabled = !!targeting || !!GameState.isGatekeeperFight || !!GameState.isCompanionFight;
        btnEscape.title = (GameState.isGatekeeperFight || GameState.isCompanionFight) ? '此戰無法逃跑' : '';
      }
      const targetHint = $('targetHint');
      if (targetHint) {
        const itemId = targeting?.startsWith('item:') ? targeting.slice(5) : null;
        const itemName = itemId ? (ITEMS.find(i => i.id === itemId)?.name || '') : '';
        targetHint.textContent = targeting ? (targeting === 'attack' ? '選擇攻擊目標：按 1-9 或點擊｜按 Z/X/C/V 切換指令' : itemId ? `選擇 ${itemName} 目標：按 1-9 或點擊` : `選擇 ${SPELLS.find(s => s.id === targeting)?.name || ''} 目標：按 1-9 或點擊｜按 Z/X/C/V 切換指令`) : '';
        targetHint.style.display = targeting ? 'block' : 'none';
      }
    } else {
      $('mapPanel').style.display = 'block';
      $('combatPanel').style.display = 'none';
      $('logPanel').style.display = 'block';
      $('gameScreen')?.classList.remove('in-combat');
    }

    if (GameState.gameOver) $('gameOverModal')?.classList.add('show');
    else $('gameOverModal')?.classList.remove('show');

    const btnAlloc = $('btnAllocate');
    if (btnAlloc) {
      const pts = player.abilityPoints ?? 0;
      btnAlloc.textContent = pts > 0 ? `分配能力 (${pts})` : '分配能力';
    }
    const menuHeal = $('menuHeal');
    const healCost = 10 + player.level;
    if (menuHeal) {
      menuHeal.disabled = player.gold < healCost || player.hp >= player.maxHp;
      menuHeal.textContent = `💚 治療 (${healCost}金)`;
    }
    const menuSave = $('menuSave');
    const menuLoad = $('menuLoad');
    if (menuSave) menuSave.disabled = GameState.inCombat;
    if (menuLoad) menuLoad.disabled = GameState.inCombat;

    const mapNameEl = $('mapName');
    if (mapNameEl) mapNameEl.textContent = MapSystem.getCurrentMap()?.name || '';

    this._renderPartyList();
    MapSystem.render();
  },

  _renderPartyList() {
    const list = $('partyList');
    if (!list) return;
    const companions = GameState.recruitedCompanions || [];
    if (companions.length === 0) {
      list.innerHTML = '<span class="party-empty" style="font-size:0.8rem;color:#666">尚無隊友</span>';
      return;
    }
    const expanded = this._companionExpanded ?? {};
    list.innerHTML = companions.map((c, i) => {
      const hp = c.hp ?? c.maxHp ?? 0;
      const maxHp = c.maxHp ?? c.hp ?? 1;
      const mp = c.mp ?? c.maxMp ?? 0;
      const maxMp = c.maxMp ?? (c.mag ?? 0) * 2 + 5;
      const compLv = c.level ?? 1;
      const compExp = c.exp ?? 0;
      const expNeed = CombatSystem.getExpNeed(compLv);
      const expPct = expNeed > 0 ? Math.max(0, Math.min(100, (compExp / expNeed) * 100)) : 0;
      const hpPct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 100;
      const mpPct = maxMp > 0 ? Math.max(0, Math.min(100, (mp / maxMp) * 100)) : 100;
      const active = c.isActive;
      const isExpanded = expanded[i];
      return `<div class="party-member ${active ? 'active' : ''} ${isExpanded ? 'expanded' : ''}" data-idx="${i}">
        <button type="button" class="party-member-btn" data-idx="${i}" title="點擊展開/收合能力值">
          <span class="party-member-name">${c.emoji || ''} ${c.name || '隊友'}</span>
          <span class="party-member-arrow">▼</span>
        </button>
        <div class="party-toggle-wrap"><button type="button" class="party-toggle" data-idx="${i}" title="點擊切換出戰/後備">${active ? '出戰' : '後備'}</button></div>
        <div class="party-member-details" data-idx="${i}">
          <div class="ability-row"><span class="ability-label">Lv.</span><span class="ability-value">${compLv}</span></div>
          <div class="ability-row"><span class="ability-label">攻擊</span><span class="ability-value">${c.atk ?? 0}</span></div>
          <div class="ability-row"><span class="ability-label">魔力</span><span class="ability-value">${c.mag ?? 0}</span></div>
          <div class="ability-row"><span class="ability-label">防禦</span><span class="ability-value">${c.def ?? 0}</span></div>
          <div class="ability-row stat-with-bar">
            <span class="ability-label">HP</span>
            <span class="ability-value">${hp}/${maxHp}</span>
            <div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%;background:linear-gradient(90deg,#4ecca3,#2ecc71)"></div></div>
          </div>
          <div class="ability-row stat-with-bar">
            <span class="ability-label">MP</span>
            <span class="ability-value">${mp}/${maxMp}</span>
            <div class="hp-bar"><div class="hp-fill" style="width:${mpPct}%;background:linear-gradient(90deg,#9b59b6,#8e44ad)"></div></div>
          </div>
          <div class="ability-row stat-with-bar">
            <span class="ability-label">經驗</span>
            <span class="ability-value">${compExp}/${expNeed}</span>
            <div class="hp-bar"><div class="hp-fill" style="width:${expPct}%;background:linear-gradient(90deg,#4ecca3,#2ecc71)"></div></div>
          </div>
        </div>
      </div>`;
    }).join('');
    list.querySelectorAll('.party-member-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx);
        this._toggleCompanionExpand(idx);
      };
    });
  },

  _toggleCompanionExpand(idx) {
    this._companionExpanded = this._companionExpanded ?? {};
    this._companionExpanded[idx] = !this._companionExpanded[idx];
    this._renderPartyList();
  },

  _toggleCompanionActive(idx) {
    if (GameState.inCombat) return;
    const companions = GameState.recruitedCompanions || [];
    const c = companions[idx];
    if (!c) return;
    if (c.isActive) {
      c.isActive = false;
    } else {
      const activeCount = companions.filter(x => x.isActive).length;
      if (activeCount >= 2) {
        const firstActive = companions.findIndex(x => x.isActive);
        companions[firstActive].isActive = false;
      }
      c.isActive = true;
    }
    UISystem.update();
  },

  showAbilityModal() {
    const modal = $('abilityModal');
    if (!modal) return;
    this._refreshAbilityModal();
    modal.classList.add('show');
    $('btnAtkPlus').onclick = () => this._allocateStat('atk');
    $('btnMagPlus').onclick = () => this._allocateStat('mag');
    $('btnDefPlus').onclick = () => this._allocateStat('def');
    $('btnAbilityReset').onclick = () => this._resetAbilityAllocation();
  },

  _refreshAbilityModal() {
    const p = GameState.player;
    const pts = p.abilityPoints ?? 0;
    const aAtk = p.allocatedAtk ?? 0;
    const aMag = p.allocatedMag ?? 0;
    const aDef = p.allocatedDef ?? 0;
    const total = aAtk + aMag + aDef;
    const resetCost = total * 5;
    const setText = (id, val) => { const el = $(id); if (el) el.textContent = val; };
    setText('abilityPointsVal', pts);
    setText('allocAtkVal', aAtk);
    setText('allocMagVal', aMag);
    setText('allocDefVal', aDef);
    const curEl = $('abilityCurrentStats');
    if (curEl) curEl.textContent = `目前：攻 ${p.atk} 魔 ${p.mag ?? 5} 防 ${p.def ?? 0}`;
    const resetBtn = $('btnAbilityReset');
    if (resetBtn) {
      resetBtn.textContent = total > 0 ? `重置（花費 ${resetCost} 金幣）` : '重置（無已分配點數）';
      resetBtn.disabled = total === 0 || (p.gold ?? 0) < resetCost;
    }
    ['btnAtkPlus', 'btnMagPlus', 'btnDefPlus'].forEach(id => {
      const btn = $(id);
      if (btn) btn.disabled = pts <= 0;
    });
  },

  _allocateStat(stat) {
    const p = GameState.player;
    if ((p.abilityPoints ?? 0) <= 0) return;
    p.abilityPoints--;
    if (stat === 'atk') p.allocatedAtk = (p.allocatedAtk ?? 0) + 1;
    else if (stat === 'mag') p.allocatedMag = (p.allocatedMag ?? 0) + 1;
    else if (stat === 'def') p.allocatedDef = (p.allocatedDef ?? 0) + 1;
    syncPlayerStats();
    this._refreshAbilityModal();
    UISystem.update();
  },

  _resetAbilityAllocation() {
    const p = GameState.player;
    const aAtk = p.allocatedAtk ?? 0;
    const aMag = p.allocatedMag ?? 0;
    const aDef = p.allocatedDef ?? 0;
    const total = aAtk + aMag + aDef;
    if (total === 0) return;
    const cost = total * 5;
    if ((p.gold ?? 0) < cost) {
      log('金幣不足，無法重置', 'damage');
      return;
    }
    p.gold -= cost;
    p.abilityPoints = (p.abilityPoints ?? 0) + total;
    p.allocatedAtk = 0;
    p.allocatedMag = 0;
    p.allocatedDef = 0;
    syncPlayerStats();
    log(`已重置能力分配，花費 ${cost} 金幣`, 'heal');
    this._refreshAbilityModal();
    UISystem.update();
  },

  showInventoryModal() {
    const modal = $('inventoryModal');
    const list = $('inventoryList');
    if (!list) return;
    const inv = GameState.player?.inventory ?? [];
    if (inv.length === 0) {
      list.innerHTML = '<p style="color:#888;font-size:0.9rem">目前沒有物品</p>';
    } else {
      const counts = {};
      inv.forEach(itemId => { counts[itemId] = (counts[itemId] || 0) + 1; });
      const inCombat = GameState.inCombat;
      list.innerHTML = Object.entries(counts).map(([itemId, qty]) => {
        const def = ITEMS.find(i => i.id === itemId);
        if (!def) return '';
        const canUse = def.useContext === 'any' || (def.useContext === 'combat' && inCombat);
        return `<div class="inventory-item" data-item="${itemId}">
          <div class="item-info">
            <span class="item-emoji">${def.emoji}</span>
            <div>
              <div>${def.name} ×${qty}</div>
              <div class="item-desc">${def.desc || ''}</div>
            </div>
          </div>
          <button type="button" class="slot-action" data-item="${itemId}" ${!canUse ? 'disabled title="此物品僅能在戰鬥中使用"' : ''}>使用</button>
        </div>`;
      }).join('');
      list.querySelectorAll('.slot-action').forEach(btn => {
        btn.onclick = () => this._useItem(btn.dataset.item);
      });
    }
    modal?.classList.add('show');
  },

  showSpellModal() {
    const modal = $('spellModal');
    const catEl = $('spellCategories');
    const listEl = $('spellListByCat');
    const hintEl = $('spellModalHint');
    if (!modal || !catEl || !listEl) return;
    GameState.spellModalCategory = null;
    const player = GameState.player;
    const emoji = { fire: '🔥', ice: '❄️', thunder: '⚡', earth: '🪨', neutral: '✨' };
    const cats = typeof SPELL_CATEGORIES !== 'undefined' ? SPELL_CATEGORIES : [];
    catEl.innerHTML = cats.map((c, i) => {
      const num = i < 9 ? ` (${i + 1})` : '';
      return `<button type="button" class="spell-cat-btn" data-cat-idx="${i}" data-cat-id="${c.id}">${c.emoji} ${c.name}${num}</button>`;
    }).join('');
    catEl.querySelectorAll('.spell-cat-btn').forEach(btn => {
      btn.onclick = () => this._selectSpellCategory(parseInt(btn.dataset.catIdx));
    });
    listEl.innerHTML = '<p style="color:#888;font-size:0.9rem">請選擇種類</p>';
    if (hintEl) hintEl.textContent = '左側選種類｜Q 上一個 / E 下一個｜1-9 選種類，1-9 選技能';
    modal.classList.add('show');
  },

  _selectSpellCategory(catIdx) {
    const cat = (typeof SPELL_CATEGORIES !== 'undefined' ? SPELL_CATEGORIES : [])[catIdx];
    if (!cat) return;
    GameState.spellModalCategory = catIdx;
    const listEl = $('spellListByCat');
    const hintEl = $('spellModalHint');
    if (!listEl) return;
    const spells = typeof getSpellsByCategory === 'function' ? getSpellsByCategory(cat.id, GameState.player) : [];
    const emoji = { fire: '🔥', ice: '❄️', thunder: '⚡', earth: '🪨', neutral: '✨' };
    $('spellCategories')?.querySelectorAll('.spell-cat-btn').forEach((b, i) => {
      b.classList.toggle('active', i === catIdx);
    });
    if (spells.length === 0) {
      listEl.innerHTML = '<p style="color:#888;font-size:0.9rem">此種類尚無可用技能</p>';
    } else {
      listEl.innerHTML = spells.map((s, i) => {
        const canUse = (GameState.player.mp ?? 0) >= (s.mp ?? 0);
        const e = emoji[s.element] || (s.type === 'physical' || s.type === 'physical_aoe' ? '⚔️' : s.type === 'defense' ? '🛡️' : '✨');
        const num = i < 9 ? ` (${i + 1})` : '';
        const mpStr = (s.mp ?? 0) > 0 ? `${s.mp}MP` : '';
        const desc = typeof getSpellEffectDesc === 'function' ? getSpellEffectDesc(s) : '';
        return `<button type="button" class="spell-modal-btn" data-spell="${s.id}" data-spell-idx="${i}" ${canUse ? '' : 'disabled'}><span class="spell-name-row">${e} ${s.name}${num}</span><span class="spell-desc-row">${desc}</span><span class="spell-mp">${mpStr}</span></button>`;
      }).join('');
      listEl.querySelectorAll('.spell-modal-btn:not([disabled])').forEach(btn => {
        btn.onclick = () => this._doSpellFromModal(btn.dataset.spell);
      });
    }
    if (hintEl) hintEl.textContent = `已選「${cat.name}」：右側點擊技能｜Q/E 切換種類｜1-9 選技能｜ESC 關閉`;
  },

  _doSpellFromModal(spellId) {
    $('spellModal')?.classList.remove('show');
    GameState.spellModalCategory = null;
    if (GameState.targeting) { clearTargeting(); UISystem.update(); }
    CombatSystem.doSpell(spellId);
  },

  hideSpellModal() {
    $('spellModal')?.classList.remove('show');
    GameState.spellModalCategory = null;
  },

  _useItem(itemId) {
    const def = ITEMS.find(i => i.id === itemId);
    if (!def || !GameState.player?.inventory) return;
    const idx = GameState.player.inventory.indexOf(itemId);
    if (idx < 0) return;
    const inCombat = GameState.inCombat;
    if (def.useContext === 'combat' && !inCombat) {
      log('此物品僅能在戰鬥中使用', 'damage');
      return;
    }
    if (['attack', 'aoe', 'buff'].includes(def.effect) && !inCombat) return;
    if (def.effect === 'attack' && inCombat) {
      const alive = CombatSystem.getAliveEnemies();
      if (alive.length === 0) return;
      if (alive.length === 1) {
        GameState.player.inventory.splice(idx, 1);
        CombatSystem.useItemOnTarget(itemId, alive[0].idx);
      } else {
        $('inventoryModal')?.classList.remove('show');
        GameState.targeting = 'item:' + itemId;
        UISystem.update();
      }
      return;
    }
    if (def.effect === 'aoe' && inCombat) {
      GameState.player.inventory.splice(idx, 1);
      CombatSystem.useItemAoe(itemId);
      return;
    }
    if (def.effect === 'buff' && inCombat) {
      GameState.player.inventory.splice(idx, 1);
      CombatSystem.useItemBuff(itemId);
      return;
    }
    const { player } = GameState;
    if (def.effect === 'heal') {
      const healed = Math.min(def.amount ?? 0, player.maxHp - player.hp);
      player.hp += healed;
      if (healed > 0) log(`已使用 ${def.name}，回復 ${healed} HP`, 'heal');
    } else if (def.effect === 'mp') {
      const healed = Math.min(def.amount ?? 0, (player.maxMp ?? 10) - (player.mp ?? 0));
      player.mp = (player.mp ?? 0) + healed;
      if (healed > 0) log(`已使用 ${def.name}，回復 ${healed} MP`, 'heal');
    } else if (def.effect === 'both') {
      const hpHealed = Math.min(def.hpAmount ?? 0, player.maxHp - player.hp);
      const mpHealed = Math.min(def.mpAmount ?? 0, (player.maxMp ?? 10) - (player.mp ?? 0));
      player.hp += hpHealed;
      player.mp = (player.mp ?? 0) + mpHealed;
      if (hpHealed > 0 || mpHealed > 0) log(`已使用 ${def.name}，回復 ${hpHealed} HP、${mpHealed} MP`, 'heal');
    }
    GameState.player.inventory.splice(idx, 1);
    UISystem.update();
    this.showInventoryModal();
  },


  showGatekeeperModal(gatekeeper) {
    const modal = $('gatekeeperModal');
    const msg = $('gatekeeperMsg');
    const boss = GATEKEEPERS[gatekeeper.bossId];
    const nextMap = MAPS.find(m => m.id === gatekeeper.nextMap);
    if (msg) msg.textContent = `${boss?.name || '守門人'} 擋住了去路！建議等級 Lv.${gatekeeper.suggestLv}。擊敗後可前往「${nextMap?.name || ''}」。是否挑戰？`;
    modal?.classList.add('show');
  },

  hideGatekeeperModal() {
    $('gatekeeperModal')?.classList.remove('show');
    GameState.pendingGatekeeper = null;
  },

  showRecruitModal(companion) {
    if (!companion) return;
    const base = COMPANIONS[companion.id];
    if (!base) return;
    const cost = base.cost ?? 0;
    const msg = $('recruitMsg');
    const costEl = $('recruitCost');
    if (msg) msg.textContent = `擊敗了 ${base.name}！支付 ${cost} 金幣即可招募加入隊伍。`;
    if (costEl) costEl.textContent = cost;
    const btn = $('btnRecruit');
    if (btn) btn.disabled = (GameState.player?.gold ?? 0) < cost;
    $('recruitModal')?.classList.add('show');
  },

  hideRecruitModal() {
    $('recruitModal')?.classList.remove('show');
    GameState.pendingCompanion = null;
  },

  _doRecruit(companionId) {
    const base = COMPANIONS[companionId];
    if (!base) return;
    const cost = base.cost ?? 0;
    if ((GameState.player?.gold ?? 0) < cost) return;
    GameState.player.gold -= cost;
    const maxMp = Math.max(5, (base.mag ?? 0) * 2 + 5);
    const activeCount = (GameState.recruitedCompanions || []).filter(c => c.isActive).length;
    const entry = { ...base, level: 1, exp: 0, hp: base.hp, maxHp: base.hp, mp: maxMp, maxMp, isActive: activeCount < 2 };
    GameState.recruitedCompanions = GameState.recruitedCompanions || [];
    GameState.recruitedCompanions.push(entry);
    this.hideRecruitModal();
    log(`招募了 ${base.name}！`, 'heal');
    UISystem.update();
  },

  showSlotModal(mode, fromStart = false) {
    const modal = $('slotModal');
    const title = $('slotModalTitle');
    const container = $('modalSlots');
    container.innerHTML = '';
    if (mode === 'save') {
      title.textContent = '選擇儲存欄位';
      for (let i = 0; i < 5; i++) {
        const info = SaveSystem.getSlotInfo(i);
        const div = document.createElement('div');
        div.className = 'modal-slot';
        div.innerHTML = `<span class="slot-info">${info.text}</span><button class="slot-action">儲存</button>`;
        div.onclick = () => { SaveSystem.save(i); modal.classList.remove('show'); };
        container.appendChild(div);
      }
    } else {
      title.textContent = '選擇讀取欄位';
      for (let i = 0; i < 5; i++) {
        const info = SaveSystem.getSlotInfo(i);
        const div = document.createElement('div');
        div.className = 'modal-slot';
        div.innerHTML = `<span class="slot-info">${info.text}</span><button class="slot-action" ${!info.hasData ? 'disabled' : ''}>讀取</button>`;
        if (info.hasData) div.onclick = () => { fromStart ? SaveSystem.loadAndEnter(i) : SaveSystem.load(i); modal.classList.remove('show'); };
        container.appendChild(div);
      }
    }
    modal?.classList.add('show');
  },

  enterGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
  },

  backToMenu() {
    if (GameState.inCombat || GameState.gameOver) return;
    if (!confirm('確定要返回主畫面？未儲存的進度將遺失。')) return;
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('gameScreen').style.display = 'none';
    $('slotModal')?.classList.remove('show');
  }
};
