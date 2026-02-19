# myRPG

簡易 RPG 遊戲

## 遊玩方式

直接用瀏覽器開啟 `index.html` 即可開始遊戲。

## 遊戲說明

- **戰鬥**：點擊「戰鬥」按鈕隨機遭遇敵人（史萊姆、哥布林、骷髏兵）
- **治療**：花費 5 金幣恢復 10 HP
- 回合制自動戰鬥，擊敗敵人獲得金幣

## 一鍵部署

執行 `deploy.bat` 即可完成：add → commit → push → Vercel 部署

```
deploy.bat              （使用預設訊息 "Auto update"）
deploy.bat 修復血條     （自訂 commit 訊息）
```

**流程**：修改程式 → 執行 `deploy.bat` → 完成

若在新環境需先執行一次 `setup-deploy-hook.bat` 啟用 hook。
