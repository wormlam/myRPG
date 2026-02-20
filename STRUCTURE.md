# myRPG 專案結構

## 目錄說明

```
myRPG/
├── css/
│   └── style.css   # 樣式表
├── js/
│   ├── core/       # 核心模組（無 DOM 依賴）
│   │   ├── config.js   # 遊戲設定 (RPG)
│   │   └── state.js    # 遊戲狀態 (GameState)
│   ├── data/       # 靜態資料（依領域拆分）
│   │   ├── items.js    # 技能、物品、玩家預設 (SPELLS, ITEMS, defaultPlayer, PLAYER_EMOJI)
│   │   ├── world.js    # 世界資料 (TERRAIN, MAPS, GATEKEEPERS, COMPANIONS)
│   │   └── enemies.js  # 敵人資料 (前綴、種類、精英、enemies 陣列)
│   ├── utils/
│   │   └── dom.js      # DOM 工具 ($, log)
│   ├── systems/        # 遊戲邏輯系統
│   │   ├── map.js      # 地圖與移動 (MapSystem)
│   │   ├── combat.js   # 戰鬥系統 (CombatSystem)
│   │   └── save.js     # 儲存與讀取 (SaveSystem)
│   ├── ui/
│   │   └── ui.js       # 介面更新與模態框 (UISystem)
│   └── main.js         # 入口與事件綁定
├── index.html
└── STRUCTURE.md
```

## 載入順序

腳本必須依以下順序載入（依賴關係）：

1. `config` → `data/items` → `data/world` → `data/enemies` → `utils/dom` → `state` → `map` → `combat` → `save` → `ui` → `main`

## 依賴關係

- **core**：無 DOM 依賴，可獨立測試
- **data**：依領域拆分，enemies 依賴 world (MAPS)
- **utils**：提供 `$()`、`log()` 等通用工具
- **systems**：依賴 core、data、utils，實作遊戲邏輯
- **ui**：依賴 core、data、utils、systems，負責畫面更新
- **main**：綁定鍵盤與按鈕事件，協調各系統
