/** 工具函式 */
const $ = id => document.getElementById(id);

function log(msg, type = '') {
  const div = document.createElement('div');
  div.className = 'log-entry ' + type;
  div.textContent = msg;
  $('log').prepend(div);
}
