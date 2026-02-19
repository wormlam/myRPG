/** 介面與模態視窗 */
const UISystem = {
  update() {
    const { player, enemy } = GameState;
    const expNeed = CombatSystem.getExpNeed();

    $('playerLevel').textContent = player.level;
    $('playerHp').textContent = player.hp;
    $('playerMaxHp').textContent = player.maxHp;
    $('playerAtk').textContent = player.atk;
    $('gold').textContent = player.gold;
    $('playerExp').textContent = player.exp;
    $('playerExpNeed').textContent = expNeed;
    $('playerHpBar').style.width = (player.hp / player.maxHp * 100) + '%';
    $('playerExpBar').style.width = (player.exp / expNeed * 100) + '%';

    if (enemy) {
      $('mapPanel').style.display = 'none';
      $('combatPanel').style.display = 'block';
      $('enemyName').textContent = enemy.name;
      $('enemyHp').textContent = enemy.hp;
      $('enemyMaxHp').textContent = enemy.maxHp;
      $('enemyAtk').textContent = enemy.atk;
      $('enemyHpBar').style.width = (enemy.hp / enemy.maxHp * 100) + '%';
    } else {
      $('mapPanel').style.display = 'block';
      $('combatPanel').style.display = 'none';
    }

    document.querySelectorAll('.move-controls button').forEach(b => { if (b) b.disabled = GameState.inCombat; });
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
