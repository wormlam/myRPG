/** 儲存與讀取 */
const SaveSystem = {
  getSlotInfo(i) {
    const raw = localStorage.getItem(RPG.SAVE_KEY_PREFIX + i);
    if (!raw) return { text: '空', color: '#666', hasData: false };
    try {
      const d = JSON.parse(raw);
      return {
        text: `Lv.${d.player?.level || '?'} | ${d.player?.gold ?? '?'}金 | ${(d.savedAt || '').slice(0, 16)}`,
        color: '#4ecca3',
        hasData: true
      };
    } catch {
      return { text: '損壞', color: '#e94560', hasData: false };
    }
  },

  save(slot) {
    if (GameState.inCombat) return;
    const { player } = GameState;
    const data = {
      player: { ...player, px: player.px ?? 5, py: player.py ?? 5 },
      savedAt: new Date().toLocaleString('zh-TW')
    };
    localStorage.setItem(RPG.SAVE_KEY_PREFIX + slot, JSON.stringify(data));
    log(`已儲存至欄位 ${slot + 1}`, 'heal');
    UISystem.update();
  },

  load(slot) {
    if (GameState.inCombat) return;
    const raw = localStorage.getItem(RPG.SAVE_KEY_PREFIX + slot);
    if (!raw) {
      log(`欄位 ${slot + 1} 沒有存檔`, 'damage');
      return;
    }
    try {
      const data = JSON.parse(raw);
      GameState.loadFromSave(data.player);
      $('log').innerHTML = '';
      log(`已讀取欄位 ${slot + 1} (${data.savedAt || '未知時間'})`, 'heal');
      UISystem.update();
    } catch (e) {
      log('讀取存檔失敗', 'damage');
    }
  },

  loadAndEnter(slot) {
    const raw = localStorage.getItem(RPG.SAVE_KEY_PREFIX + slot);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      GameState.loadFromSave(data.player);
      $('log').innerHTML = '';
      log(`已讀取欄位 ${slot + 1} (${data.savedAt || '未知時間'})`, 'heal');
      UISystem.enterGame();
      UISystem.update();
    } catch (e) {}
  }
};
