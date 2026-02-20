/**
 * 主程式：初始化與事件綁定
 * 使用事件委派確保選單點擊一定有效
 */
(function init() {
  document.addEventListener('keydown', (e) => {
    if (GameState.gameOver) return;
    const key = e.key.toLowerCase();
    const spellModalEl = $('spellModal');
    const spellModalVisible = spellModalEl && spellModalEl.classList.contains('show');

    if (spellModalVisible) {
      if (key === 'escape') {
        e.preventDefault();
        UISystem.hideSpellModal();
        return;
      }
      if (key === 'q') {
        e.preventDefault();
        const cats = typeof SPELL_CATEGORIES !== 'undefined' ? SPELL_CATEGORIES : [];
        const cur = GameState.spellModalCategory;
        const prev = cur == null ? cats.length - 1 : (cur - 1 + cats.length) % cats.length;
        if (cats[prev]) UISystem._selectSpellCategory(prev);
        return;
      }
      if (key === 'e') {
        e.preventDefault();
        const cats = typeof SPELL_CATEGORIES !== 'undefined' ? SPELL_CATEGORIES : [];
        const cur = GameState.spellModalCategory;
        const next = cur == null ? 0 : (cur + 1) % cats.length;
        if (cats[next]) UISystem._selectSpellCategory(next);
        return;
      }
      if (['1','2','3','4','5','6','7','8','9'].includes(key)) {
        e.preventDefault();
        const n = parseInt(key);
        const catIdx = GameState.spellModalCategory;
        if (catIdx == null) {
          if (n <= 9 && typeof SPELL_CATEGORIES !== 'undefined' && SPELL_CATEGORIES[n - 1]) {
            UISystem._selectSpellCategory(n - 1);
          }
        } else {
          const cat = (typeof SPELL_CATEGORIES !== 'undefined' ? SPELL_CATEGORIES : [])[catIdx];
          if (cat && typeof getSpellsByCategory === 'function') {
            const spells = getSpellsByCategory(cat.id, GameState.player);
            if (n <= spells.length) {
              const spell = spells[n - 1];
              if (spell && (GameState.player.mp ?? 0) >= (spell.mp ?? 0)) UISystem._doSpellFromModal(spell.id);
            }
          }
        }
      }
      return;
    }

    if (GameState.inCombat) {
      if (GameState.targeting) {
        if (['1','2','3','4','5','6','7','8','9'].includes(key)) {
          e.preventDefault();
          const n = parseInt(key);
          const alive = CombatSystem.getAliveEnemies();
          if (n <= alive.length) {
            const target = alive[n - 1];
            if (GameState.targeting === 'attack') CombatSystem.doAttack(target.idx);
            else if (GameState.targeting.startsWith('item:')) {
              const itemId = GameState.targeting.slice(5);
              const inv = GameState.player?.inventory || [];
              const i = inv.indexOf(itemId);
              if (i >= 0) {
                GameState.player.inventory.splice(i, 1);
                CombatSystem.useItemOnTarget(itemId, target.idx);
              }
            } else CombatSystem.doSpellOnTarget(GameState.targeting, target.idx);
            clearTargeting();
          }
        } else if (key === 'z' || key === 'x' || key === 'c' || key === 'v' || key === 'escape') {
          e.preventDefault();
          clearTargeting();
          UISystem.update();
          if (key === 'z') CombatSystem.doAttackClick();
          else if (key === 'x') UISystem.showSpellModal();
          else if (key === 'c') CombatSystem.doDefend();
          else if (key === 'v') CombatSystem.doEscape();
        }
        return;
      }
      if (key === 'z') { e.preventDefault(); CombatSystem.doAttackClick(); }
      else if (key === 'x') { e.preventDefault(); UISystem.showSpellModal(); }
      else if (key === 'c') { e.preventDefault(); CombatSystem.doDefend(); }
      else if (key === 'v') { e.preventDefault(); CombatSystem.doEscape(); }
      return;
    }
    if (GameState.gameOver) return;
    if (key === 'w' || e.key === 'ArrowUp') { e.preventDefault(); MapSystem.tryMove(0, -1); }
    else if (key === 's' || e.key === 'ArrowDown') { e.preventDefault(); MapSystem.tryMove(0, 1); }
    else if (key === 'a' || e.key === 'ArrowLeft') { e.preventDefault(); MapSystem.tryMove(-1, 0); }
    else if (key === 'd' || e.key === 'ArrowRight') { e.preventDefault(); MapSystem.tryMove(1, 0); }
  });

  window.addEventListener('encounter', () => CombatSystem.startFight());

  $('playerNameBtn').onclick = () => $('playerPanel')?.classList.toggle('expanded');
  $('btnAllocate').onclick = () => UISystem.showAbilityModal();
  $('btnItems').onclick = () => UISystem.showInventoryModal();
  $('btnCloseInventory').onclick = () => $('inventoryModal')?.classList.remove('show');
  $('inventoryModal').onclick = (e) => { if (e.target.id === 'inventoryModal') e.target.classList.remove('show'); };
  $('btnCloseAbility').onclick = () => { $('abilityModal')?.classList.remove('show'); UISystem.update(); };
  $('abilityModal').onclick = (e) => { if (e.target.id === 'abilityModal') { e.target.classList.remove('show'); UISystem.update(); } };
  $('btnCloseSpellModal').onclick = () => UISystem.hideSpellModal();
  $('spellModal').onclick = (e) => { if (e.target.id === 'spellModal') UISystem.hideSpellModal(); };

  $('btnAttack').onclick = () => {
    if (GameState.targeting) { clearTargeting(); UISystem.update(); }
    CombatSystem.doAttackClick();
  };
  $('btnMagic').onclick = () => {
    if (GameState.targeting) { clearTargeting(); UISystem.update(); }
    UISystem.showSpellModal();
  };
  $('btnDefend').onclick = () => {
    if (GameState.targeting) { clearTargeting(); UISystem.update(); }
    CombatSystem.doDefend();
  };
  $('btnEscape').onclick = () => {
    if (GameState.targeting) { clearTargeting(); UISystem.update(); }
    CombatSystem.doEscape();
  };
  $('combatSpells')?.addEventListener('click', (e) => {
    const btn = e.target?.closest('.spell-btn');
    if (btn?.dataset?.spell) {
      if (GameState.targeting) { clearTargeting(); UISystem.update(); }
      CombatSystem.doSpell(btn.dataset.spell);
    }
  });

  $('btnStartGame').onclick = startNewGame;
  $('btnLoadStart').onclick = () => UISystem.showSlotModal('load', true);

  document.addEventListener('click', (e) => {
    const id = e.target?.id;
    if (id === 'menuHeal') { CombatSystem.heal(); return; }
    if (id === 'menuSave') { UISystem.showSlotModal('save'); return; }
    if (id === 'menuLoad') { UISystem.showSlotModal('load', false); return; }
    if (id === 'menuBack') { UISystem.backToMenu(); return; }
    const toggle = e.target?.closest('.party-toggle');
    if (toggle && toggle.dataset.idx !== undefined) {
      e.preventDefault();
      e.stopPropagation();
      UISystem._toggleCompanionActive(parseInt(toggle.dataset.idx));
      return;
    }
  });

  $('btnCloseModal').onclick = () => $('slotModal')?.classList.remove('show');
  $('slotModal').onclick = (e) => { if (e.target.id === 'slotModal') e.target.classList.remove('show'); };

  $('btnChallengeGatekeeper').onclick = () => {
    const gk = GameState.pendingGatekeeper;
    if (gk) {
      $('gatekeeperModal')?.classList.remove('show');
      CombatSystem.startGatekeeperFight(gk.bossId);
    }
  };
  $('btnCancelGatekeeper').onclick = () => { UISystem.hideGatekeeperModal(); UISystem.update(); };
  $('gatekeeperModal').onclick = (e) => { if (e.target.id === 'gatekeeperModal') UISystem.hideGatekeeperModal(); };

  $('btnRecruit').onclick = () => {
    const comp = GameState.pendingCompanion;
    if (comp) UISystem._doRecruit(comp.id);
  };
  $('btnRejectRecruit').onclick = () => UISystem.hideRecruitModal();
  $('recruitModal').onclick = (e) => { if (e.target.id === 'recruitModal') UISystem.hideRecruitModal(); };

  $('btnGameOverLoad').onclick = () => UISystem.showSlotModal('load', false);
  $('btnGameOverMenu').onclick = () => {
    GameState.gameOver = false;
    GameState.reset();
    $('gameScreen').style.display = 'none';
    $('startScreen').style.display = 'block';
    $('gameOverModal')?.classList.remove('show');
    $('slotModal')?.classList.remove('show');
  };
})();

function startNewGame() {
  GameState.reset();
  GameState.player.inventory = ['potion', 'potion', 'ether'];
  $('log').innerHTML = '';
  log('歡迎！移動探索，移動時可能隨機遇敵');
  UISystem.enterGame();
  UISystem.update();
}
