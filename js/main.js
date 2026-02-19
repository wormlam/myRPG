/** 主程式：初始化與事件綁定 */
(function init() {
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (GameState.inCombat) {
      if (key === 'z') { e.preventDefault(); CombatSystem.doAttack(); }
      else if (key === 'x') { e.preventDefault(); CombatSystem.doMagic(); }
      else if (key === 'c') { e.preventDefault(); CombatSystem.doDefend(); }
      else if (key === 'v') { e.preventDefault(); CombatSystem.doEscape(); }
      return;
    }
    if (key === 'w' || e.key === 'ArrowUp') { e.preventDefault(); MapSystem.tryMove(0, -1); }
    else if (key === 's' || e.key === 'ArrowDown') { e.preventDefault(); MapSystem.tryMove(0, 1); }
    else if (key === 'a' || e.key === 'ArrowLeft') { e.preventDefault(); MapSystem.tryMove(-1, 0); }
    else if (key === 'd' || e.key === 'ArrowRight') { e.preventDefault(); MapSystem.tryMove(1, 0); }
  });

  window.addEventListener('encounter', () => CombatSystem.startFight());

  $('playerNameBtn').onclick = () => $('playerPanel').classList.toggle('expanded');
  $('btnAttack').onclick = () => CombatSystem.doAttack();
  $('btnMagic').onclick = () => CombatSystem.doMagic();
  $('btnDefend').onclick = () => CombatSystem.doDefend();
  $('btnEscape').onclick = () => CombatSystem.doEscape();
  $('btnStartGame').onclick = startNewGame;
  $('btnLoadStart').onclick = () => UISystem.showSlotModal('load', true);
  $('menuHeal').onclick = () => CombatSystem.heal();
  $('menuSave').onclick = () => UISystem.showSlotModal('save');
  $('menuLoad').onclick = () => UISystem.showSlotModal('load', false);
  $('menuBack').onclick = () => UISystem.backToMenu();
  $('btnCloseModal').onclick = () => $('slotModal').classList.remove('show');
  $('slotModal').onclick = (e) => { if (e.target.id === 'slotModal') e.target.classList.remove('show'); };
})();

function startNewGame() {
  GameState.reset();
  $('log').innerHTML = '';
  log('歡迎！移動探索，移動時可能隨機遇敵');
  UISystem.enterGame();
  UISystem.update();
}
