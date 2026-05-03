# GitHub 上傳指南

## 📦 準備的文件

你的專案包含以下文件：

```
nkust-racing/
├── nkust_racing.html   # 主程式（包含所有功能）
├── README.md           # 專案說明文檔
├── LICENSE             # MIT 授權文件
└── .gitignore          # Git 忽略文件配置
```

## 🚀 上傳步驟

### 方法一：透過 GitHub 網頁介面（推薦新手）

1. **登入 GitHub**
   - 前往 https://github.com
   - 登入你的帳號

2. **建立新的 Repository**
   - 點擊右上角的 `+` → `New repository`
   - Repository name: `nkust-racing` （或你喜歡的名稱）
   - Description: `NKUST Racing Formula SAE 知識庫管理系統`
   - 選擇 `Public` （公開）或 `Private` （私密）
   - **不要**勾選 "Add a README file"（我們已經有了）
   - 點擊 `Create repository`

3. **上傳文件**
   - 在新建的 repository 頁面，點擊 `uploading an existing file`
   - 將以下 4 個文件拖曳到網頁中：
     * `nkust_racing.html`
     * `README.md`
     * `LICENSE`
     * `.gitignore`
   - Commit message 填寫：`Initial commit - NKUST Racing knowledge base`
   - 點擊 `Commit changes`

4. **完成！**
   - 你的專案現在已經在 GitHub 上了
   - Repository 網址：`https://github.com/你的用戶名/nkust-racing`

### 方法二：透過 Git 命令行（進階）

```bash
# 1. 初始化本地 Git repository
cd 你的專案資料夾
git init

# 2. 添加所有文件
git add nkust_racing.html README.md LICENSE .gitignore

# 3. 第一次提交
git commit -m "Initial commit - NKUST Racing knowledge base"

# 4. 連接到 GitHub repository
git remote add origin https://github.com/你的用戶名/nkust-racing.git

# 5. 推送到 GitHub
git branch -M main
git push -u origin main
```

## 🌐 啟用 GitHub Pages（讓網頁可以直接訪問）

1. 在 GitHub repository 頁面，點擊 `Settings`
2. 左側選單找到 `Pages`
3. Source 選擇 `main` branch
4. 點擊 `Save`
5. 等待 1-2 分鐘後，你的網頁就會在以下網址可用：
   ```
   https://你的用戶名.github.io/nkust-racing/nkust_racing.html
   ```

## 📝 後續更新

### 透過網頁介面更新

1. 在 GitHub repository 中找到要更新的文件
2. 點擊文件名稱進入
3. 點擊右上角的 ✏️ （Edit）圖示
4. 修改內容
5. 填寫 Commit message 說明你的修改
6. 點擊 `Commit changes`

### 透過 Git 命令行更新

```bash
# 1. 修改文件後
git add .

# 2. 提交修改
git commit -m "描述你的修改內容"

# 3. 推送到 GitHub
git push
```

## ✨ 專案亮點說明

你的系統已經預載了教授提供的所有 17 個重要資源：

### 📋 賽事資訊 (3個)
- Formula SAE Taiwan 文件審查
- FSAE Online 官方文件資源
- JSAE 日本賽事官方公告

### 🔧 工程工具 (4個)
- Realis Simulation 學術贊助
- Altair 技術贊助
- ANSYS 學生團隊計畫
- MathWorks Formula SAE 支援

### 🏭 零件供應商 (5個)
- OZ Racing 輪圈
- Keizer Wheels
- Enkei SF-01 規格書
- Hoosier 輪胎
- GY Racing 產品

### 📚 學習資源 (5個)
- JSAE 2025 數位手冊
- Learn And Compete 入門書
- Race Car Design 教材
- FSAE 設計理念文章
- FSAE TO WIN 技術網站

## 🎯 建議的 Repository 設定

### Topics（標籤）
在 repository 設定中加入以下 topics：
```
formula-sae
fsae
racing
knowledge-base
nkust
student-competition
web-app
javascript
```

### About（簡介）
```
NKUST Racing Formula SAE 知識庫管理系統 - 整合人員管理、工作日誌、賽事資訊、零件供應商與學習資源的全方位車隊管理平台
```

### Website（網站連結）
如果啟用了 GitHub Pages，填入：
```
https://你的用戶名.github.io/nkust-racing/nkust_racing.html
```

## 💡 提示

1. **記得定期備份**：雖然 GitHub 會保存歷史版本，但建議定期匯出資料
2. **使用有意義的 commit message**：方便日後查看修改歷史
3. **善用 Issues**：可以用 GitHub Issues 追蹤待辦事項或 bug
4. **分享連結**：把 GitHub Pages 連結分享給隊友使用

## ❓ 常見問題

**Q: 我修改了 HTML 文件，為什麼 GitHub Pages 沒更新？**
A: GitHub Pages 需要 1-2 分鐘才會更新，請稍等片刻後重新整理頁面（Ctrl+F5 強制刷新）。

**Q: 我不小心刪除了檔案，怎麼辦？**
A: GitHub 會保留所有歷史版本，點擊文件的 `History` 可以看到過去的版本並還原。

**Q: 資料會不會被別人看到？**
A: 如果 repository 設為 Private，只有你能看到。如果設為 Public，程式碼是公開的，但用戶的資料（儲存在 localStorage）只存在他們自己的瀏覽器中，不會上傳到 GitHub。

**Q: 我想讓隊友一起編輯，怎麼辦？**
A: 在 repository 的 `Settings` → `Collaborators` 中添加隊友的 GitHub 帳號，給予權限。

---

**祝你順利上傳！有任何問題隨時問我！** 🚀
