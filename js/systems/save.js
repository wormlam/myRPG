/**
 * 儲存與讀取系統
 * 依賴：config (RPG), data/world (MAPS), state, utils ($, log), ui
 */
const SaveSystem = {
  getSlotInfo(i) {
    const raw = localStorage.getItem(RPG.SAVE_KEY_PREFIX + i);
    if (!raw) return { text: '空', color: '#666', hasData: false };
    try {
      const d = JSON.parse(raw);
      const map = MAPS.find(m => m.id === (d.player?.mapId || 'meadow'));
      return {
        text: `Lv.${d.player?.level || '?'} ${map?.name || ''} | ${d.player?.gold ?? '?'}金 | ${(d.savedAt || '').slice(0, 16)}`,
        color: '#4ecca3',
        hasData: true
      };
    } catch {
      return { text: '損壞', color: '#e94560', hasData: false };
    }
  },

  save(slot) {
    if (GameState.inCombat) return;
    const { player, defeatedGatekeepers, recruitedCompanions } = GameState;
    const data = {
      player: { ...player, px: player.px ?? 5, py: player.py ?? 5, mapId: player.mapId ?? 'meadow', inventory: player.inventory ?? [] },
      defeatedGatekeepers: defeatedGatekeepers ?? [],
      recruitedCompanions: (recruitedCompanions ?? []).map(c => ({ ...c, isActive: c.isActive })),
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
      GameState.loadFromSave(data);
      $('log').innerHTML = '';
      log(`已讀取欄位 ${slot + 1} (${data.savedAt || '未知時間'})`, 'heal');
      const rec = GameState.loadRecalculated;
      if (rec && (rec.alloc || rec.rand)) {
        const parts = [];
        if (rec.alloc) parts.push('能力點數');
        if (rec.rand) parts.push('隨機加成');
        log(`已重新計算${parts.join('與')}，請至「分配能力」重新分配`, 'levelup');
      }
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
      GameState.loadFromSave(data);
      $('log').innerHTML = '';
      log(`已讀取欄位 ${slot + 1} (${data.savedAt || '未知時間'})`, 'heal');
      const rec = GameState.loadRecalculated;
      if (rec && (rec.alloc || rec.rand)) {
        const parts = [];
        if (rec.alloc) parts.push('能力點數');
        if (rec.rand) parts.push('隨機加成');
        log(`已重新計算${parts.join('與')}，請至「分配能力」重新分配`, 'levelup');
      }
      UISystem.enterGame();
      UISystem.update();
    } catch (e) {}
  }
};
