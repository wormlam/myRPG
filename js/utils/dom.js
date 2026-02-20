/**
 * DOM 工具函式
 * 依賴：無
 */
const $ = id => document.getElementById(id);

function log(msg, type = '') {
  const el = $('log');
  if (!el) return;
  const div = document.createElement('div');
  div.className = 'log-entry ' + type;
  div.textContent = msg;
  el.prepend(div);
}
