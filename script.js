const SAVE_KEY_PREFIX = 'myrpg_save_';
const defaultPlayer = () => ({ level: 1, exp: 0, hp: 20, maxHp: 20, atk: 5, gold: 0 });
const player = { ...defaultPlayer() };
const enemies = [
  { name: '史萊姆', hp: 8, atk: 2, gold: 3, exp: 5 },
  { name: '哥布林', hp: 12, atk: 3, gold: 5, exp: 8 },
  { name: '骷髏兵', hp: 15, atk: 4, gold: 8, exp: 12 }
];
let enemy = null;
let inCombat = false;

const $ = id => document.getElementById(id);

function log(msg, type = '') {
  const div = document.createElement('div');
  div.className = 'log-entry ' + type;
  div.textContent = msg;
  $('log').prepend(div);
}

function getExpNeed() { return player.level * 10; }

function checkLevelUp() {
  const need = getExpNeed();
  if (player.exp >= need) {
    player.exp -= need;
    player.level++;
    player.maxHp += 5;
    player.atk += 2;
    player.hp = player.maxHp;
    log(`🎉 升級！Lv.${player.level} - HP+5、攻擊+2、HP 全滿`, 'levelup');
    if (player.exp >= getExpNeed()) checkLevelUp();
  }
}

function updateUI() {
  const expNeed = getExpNeed();
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
    $('enemyPanel').style.display = 'block';
    $('enemyName').textContent = enemy.name;
    $('enemyHp').textContent = enemy.hp;
    $('enemyMaxHp').textContent = enemy.maxHp;
    $('enemyAtk').textContent = enemy.atk;
    $('enemyHpBar').style.width = (enemy.hp / enemy.maxHp * 100) + '%';
  } else {
    $('enemyPanel').style.display = 'none';
  }

  $('btnFight').disabled = inCombat;
  $('btnHeal').disabled = inCombat || player.gold < 5 || player.hp >= player.maxHp;
  if ($('btnSave')) $('btnSave').disabled = inCombat;
  if ($('btnLoad')) $('btnLoad').disabled = inCombat;
  if ($('btnBackToMenu')) $('btnBackToMenu').disabled = inCombat;
}

function getSlotInfo(i) {
  const raw = localStorage.getItem(SAVE_KEY_PREFIX + i);
  if (!raw) return { text: '空', color: '#666', hasData: false };
  try {
    const d = JSON.parse(raw);
    return { text: `Lv.${d.player?.level || '?'} | ${d.player?.gold ?? '?'}金 | ${(d.savedAt || '').slice(0, 16)}`, color: '#4ecca3', hasData: true };
  } catch { return { text: '損壞', color: '#e94560', hasData: false }; }
}

function showSlotModal(mode, fromStart = false) {
  const modal = $('slotModal');
  const title = $('slotModalTitle');
  const container = $('modalSlots');
  container.innerHTML = '';
  if (mode === 'save') {
    title.textContent = '選擇儲存欄位';
    for (let i = 0; i < 5; i++) {
      const info = getSlotInfo(i);
      const div = document.createElement('div');
      div.className = 'modal-slot';
      div.dataset.slotId = i;
      div.innerHTML = `<span class="slot-info">${info.text}</span><button class="slot-action">儲存</button>`;
      div.onclick = () => { saveGame(i); modal.classList.remove('show'); };
      container.appendChild(div);
    }
  } else {
    title.textContent = '選擇讀取欄位';
    for (let i = 0; i < 5; i++) {
      const info = getSlotInfo(i);
      const div = document.createElement('div');
      div.className = 'modal-slot';
      div.dataset.slotId = i;
      div.innerHTML = `<span class="slot-info">${info.text}</span><button class="slot-action" ${!info.hasData ? 'disabled' : ''}>讀取</button>`;
      if (info.hasData) {
        div.onclick = () => {
          if (fromStart) loadAndEnter(i);
          else loadGame(i);
          modal.classList.remove('show');
        };
      }
      container.appendChild(div);
    }
  }
  modal.classList.add('show');
}

function enterGame() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';
}

function backToMenu() {
  if (inCombat) return;
  if (!confirm('確定要返回主畫面？未儲存的進度將遺失。')) return;
  document.getElementById('startScreen').style.display = 'block';
  document.getElementById('gameScreen').style.display = 'none';
  $('slotModal').classList.remove('show');
}

function startFight() {
  if (inCombat) return;
  enemy = { ...enemies[Math.floor(Math.random() * enemies.length)] };
  inCombat = true;
  log(`遇到 ${enemy.name}！`, 'damage');
  updateUI();
  combatTurn();
}

function combatTurn() {
  if (!enemy || player.hp <= 0) return;

  const dmg = Math.max(1, player.atk - Math.floor(Math.random() * 2));
  enemy.hp -= dmg;
  log(`你攻擊造成 ${dmg} 點傷害`, 'damage');

  if (enemy.hp <= 0) {
    player.gold += enemy.gold;
    player.exp += enemy.exp;
    log(`擊敗 ${enemy.name}！獲得 ${enemy.gold} 金幣、${enemy.exp} 經驗`, 'gold');
    checkLevelUp();
    enemy = null;
    inCombat = false;
    updateUI();
    return;
  }

  const enemyDmg = Math.max(1, enemy.atk - Math.floor(Math.random() * 2));
  player.hp -= enemyDmg;
  log(`${enemy.name} 攻擊造成 ${enemyDmg} 點傷害`, 'damage');

  if (player.hp <= 0) {
    player.hp = 0;
    log('你被擊敗了！遊戲結束', 'damage');
    inCombat = false;
    enemy = null;
    updateUI();
    return;
  }

  updateUI();
  setTimeout(combatTurn, 800);
}

function heal() {
  if (player.gold >= 5 && player.hp < player.maxHp && !inCombat) {
    player.gold -= 5;
    player.hp = Math.min(player.maxHp, player.hp + 10);
    log('治療恢復 10 HP', 'heal');
    updateUI();
  }
}

function newGame() {
  if (inCombat) return;
  if (!confirm('確定要開始新遊戲？當前進度將遺失。')) return;
  Object.assign(player, defaultPlayer());
  enemy = null;
  inCombat = false;
  $('log').innerHTML = '';
  log('開始新冒險！');
  updateUI();
}

function saveGame(slot) {
  if (inCombat) return;
  const data = { player: { ...player }, savedAt: new Date().toLocaleString('zh-TW') };
  localStorage.setItem(SAVE_KEY_PREFIX + slot, JSON.stringify(data));
  log(`已儲存至欄位 ${slot + 1}`, 'heal');
  updateUI();
}

function loadGame(slot) {
  if (inCombat) return;
  const raw = localStorage.getItem(SAVE_KEY_PREFIX + slot);
  if (!raw) { log(`欄位 ${slot + 1} 沒有存檔`, 'damage'); return; }
  try {
    const data = JSON.parse(raw);
    Object.assign(player, data.player);
    enemy = null;
    inCombat = false;
    $('log').innerHTML = '';
    log(`已讀取欄位 ${slot + 1} (${data.savedAt || '未知時間'})`, 'heal');
    updateUI();
  } catch (e) {
    log('讀取存檔失敗', 'damage');
  }
}

function startNewGame() {
  Object.assign(player, defaultPlayer());
  enemy = null;
  inCombat = false;
  $('log').innerHTML = '';
  log('歡迎！點擊「戰鬥」開始冒險');
  enterGame();
  updateUI();
}

function loadAndEnter(slot) {
  const raw = localStorage.getItem(SAVE_KEY_PREFIX + slot);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    Object.assign(player, data.player);
    enemy = null;
    inCombat = false;
    $('log').innerHTML = '';
    log(`已讀取欄位 ${slot + 1} (${data.savedAt || '未知時間'})`, 'heal');
    enterGame();
    updateUI();
  } catch (e) {}
}

$('btnFight').onclick = startFight;
$('btnHeal').onclick = heal;
$('btnNewGame').onclick = newGame;
$('btnStartGame').onclick = startNewGame;
$('btnLoadStart').onclick = () => showSlotModal('load', true);
$('btnSave').onclick = () => showSlotModal('save');
$('btnLoad').onclick = () => showSlotModal('load', false);
$('btnBackToMenu').onclick = backToMenu;
$('btnCloseModal').onclick = () => $('slotModal').classList.remove('show');
$('slotModal').onclick = (e) => { if (e.target.id === 'slotModal') e.target.classList.remove('show'); };
