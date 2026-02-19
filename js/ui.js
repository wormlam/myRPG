/** 介面與模態視窗 */
const UISystem = {
  update() {
    const { player, enemies, targeting } = GameState;
    const expNeed = CombatSystem.getExpNeed();

    $('playerLevel').textContent = player.level;
    $('playerHp').textContent = player.hp;
    $('playerMaxHp').textContent = player.maxHp;
    $('playerAtk').textContent = player.atk;
    $('playerDef').textContent = player.def ?? 0;
    $('gold').textContent = player.gold;
    $('playerExp').textContent = player.exp;
    $('playerExpNeed').textContent = expNeed;
    $('playerHpBar').style.width = (player.hp / player.maxHp * 100) + '%';
    $('playerMp').textContent = player.mp ?? 0;
    $('playerMaxMp').textContent = player.maxMp ?? 10;
    $('playerMpBar').style.width = ((player.mp ?? 0) / (player.maxMp ?? 10) * 100) + '%';
    $('playerExpBar').style.width = (player.exp / expNeed * 100) + '%';

    if (enemies.length > 0) {
      $('mapPanel').style.display = 'none';
      $('combatPanel').style.display = 'block';
      $('logPanel').style.display = 'block';

      const container = $('enemiesContainer');
      container.innerHTML = '';
      enemies.forEach(enemy => {
        const slot = document.createElement('div');
        slot.className = 'enemy-slot' + (enemy.hp <= 0 ? ' dead' : '') + (targeting ? ' targetable' : '');
        slot.dataset.idx = enemy.idx;
        slot.innerHTML = `
          <div class="enemy-nameplate">
            <span class="nameplate-name">${enemy.name}</span>
            <span class="nameplate-stats">HP <span class="enemy-hp-val">${enemy.hp}</span>/<span class="enemy-maxhp-val">${enemy.maxHp}</span> · 攻 ${enemy.atk} 防 ${enemy.def ?? 0}</span>
          </div>
          <div class="enemy-hp-bar">
            <div class="hp-bar"><div class="hp-fill enemy-hp-fill" style="width:${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%;background:#e94560"></div></div>
          </div>
          <div class="enemy-emoji-wrap">${enemy.emoji || '👹'}</div>
        `;
        if (enemy.hp > 0 && targeting) {
          slot.onclick = () => CombatSystem.onEnemyTargetClick(enemy.idx);
        }
        container.appendChild(slot);
      });

      $('playerEmoji').textContent = PLAYER_EMOJI;
      $('combatPlayerName').textContent = '冒險者';
      $('combatPlayerHp').textContent = player.hp;
      $('combatPlayerMaxHp').textContent = player.maxHp;
      $('combatPlayerMp').textContent = player.mp ?? 0;
      $('combatPlayerMaxMp').textContent = player.maxMp ?? 10;
      $('combatPlayerAtk').textContent = player.atk;
      $('combatPlayerDef').textContent = player.def ?? 0;
      const pHpBar = $('combatPlayerHpBar');
      if (pHpBar && player.maxHp > 0) {
        pHpBar.style.setProperty('width', Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100)) + '%', 'important');
      }
      const pMpBar = $('combatPlayerMpBar');
      if (pMpBar && (player.maxMp ?? 10) > 0) {
        pMpBar.style.setProperty('width', Math.max(0, Math.min(100, ((player.mp ?? 0) / (player.maxMp ?? 10)) * 100)) + '%', 'important');
      }
      document.querySelectorAll('.spell-btn').forEach(btn => {
        const spell = SPELLS.find(s => s.id === btn.dataset.spell);
        if (spell) {
          const canUse = player.level >= spell.level && (player.mp ?? 0) >= spell.mp;
          btn.disabled = !canUse || !!targeting;
          btn.title = `Lv.${spell.level} ${spell.name} ${spell.mp}MP${targeting ? ' (請先選擇目標或取消)' : !canUse ? ' (未解鎖或MP不足)' : ''}`;
        }
      });
      ['btnAttack','btnMagic','btnDefend'].forEach(id => {
        const btn = $(id);
        if (btn) btn.disabled = !!targeting;
      });
      const targetHint = $('targetHint');
      const btnCancel = $('btnCancelTarget');
      if (targetHint) {
        targetHint.textContent = targeting ? (targeting === 'attack' ? '選擇攻擊目標（按 V 取消）' : `選擇 ${SPELLS.find(s => s.id === targeting)?.name || ''} 目標（按 V 取消）`) : '';
        targetHint.style.display = targeting ? 'block' : 'none';
      }
      if (btnCancel) {
        btnCancel.style.display = targeting ? 'inline-block' : 'none';
        btnCancel.onclick = () => { clearTargeting(); UISystem.update(); };
      }
    } else {
      $('mapPanel').style.display = 'block';
      $('combatPanel').style.display = 'none';
      $('logPanel').style.display = 'none';
    }

    const menuHeal = $('menuHeal');
    if (menuHeal) menuHeal.disabled = player.gold < 5 || player.hp >= player.maxHp;
    const menuSave = $('menuSave');
    const menuLoad = $('menuLoad');
    if (menuSave) menuSave.disabled = GameState.inCombat;
    if (menuLoad) menuLoad.disabled = GameState.inCombat;

    MapSystem.render();
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
        if (info.hasData) {
          div.onclick = () => {
            if (fromStart) SaveSystem.loadAndEnter(i);
            else SaveSystem.load(i);
            modal.classList.remove('show');
          };
        }
        container.appendChild(div);
      }
    }
    modal.classList.add('show');
  },

  enterGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
  },

  backToMenu() {
    if (GameState.inCombat) return;
    if (!confirm('確定要返回主畫面？未儲存的進度將遺失。')) return;
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('gameScreen').style.display = 'none';
    $('slotModal').classList.remove('show');
  }
};
