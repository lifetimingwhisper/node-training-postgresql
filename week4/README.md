# Node.js + TypeORM 訓練

## 功能

- 使用 Node.js 原生 HTTP 模組建立 API 伺服器
- 使用 TypeORM 操作 PostgreSQL 資料庫
- 支援 API CRUD 操作

## 開發指令

- `npm run dev` - 啟動開發伺服器
- `npm run start` - 啟動伺服器與資料庫 
- `npm run restart` - 重新啟動伺服器與資料庫
- `npm run stop` - 關閉啟動伺服器與資料庫
- `npm run clean` - 關閉伺服器與資料庫並清除所有資料

## JC's notes
- `"start": "docker compose --env-file .env up -d --build"` - 讀取 docker-compose.yml, 打開容器，安裝運作 postgres 資料庫服務， services > postgres