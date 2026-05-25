# NKUST Racing 知識庫管理系統

> Formula SAE 車隊資源管理與知識庫系統
https://ijioxc.github.io/nkust-racing/
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 📖 專案簡介

NKUST Racing 知識庫是一個專為 Formula SAE 賽車隊設計的全方位資源管理系統。透過直觀的介面，團隊成員可以有效管理人員資訊、工作日誌、賽事資訊、工程工具、零件供應商、學習資源及計畫討論。

### ✨ 核心特色

- **📊 多維度管理** - 7大分類模組化管理
- **👥 人員系統** - 翻轉卡片設計，支援頭像、職位、科系、工作類別
- **📝 工作日誌** - 時間軸/卡片雙視圖，進度追蹤
- **📋 計畫管理** - 圖片/網址上傳，拖拽排序，標籤分類
- **🔍 智慧搜尋** - 即時搜尋所有資源
- **🌓 深色模式** - 護眼深色/明亮模式切換
- **💾 本地儲存** - 資料保存在瀏覽器 LocalStorage
- **📤 資料匯出/匯入** - JSON 格式備份與還原

## 🎯 功能模組

### 1. 人員管理 👥
- 翻轉卡片設計（正面：基本資料/背面：詳細資訊）
- 支援頭像上傳
- 職位分類：隊長/副隊長/組長/成員/教授/助教/顧問
- 工作類別多選：車體/引擎/懸吊/煞車/電裝/空力/其他
- 科系與年級記錄
- 聯絡方式與興趣技能

### 2. 工作日誌 📝
- **卡片視圖**：優先度標示（高/中/低）
- **時間軸視圖**：時間範圍篩選（自動/1/3/6/12個月）
- 進度標籤：討論中/進行中/已完成/擱置
- 日期與星期自動顯示
- 圖片附件上傳

### 3. 賽事資訊 🏁
- 賽事網址連結
- 重要程度分級
- 詳細描述與內容

### 4. 工程工具 🔧
- 工具資源整理
- 網址連結管理
- 優先度標示

### 5. 零件供應商 🏭
- 供應商資訊管理
- 聯絡方式與網址
- 分類與重要度

### 6. 學習資源 📚
- 學習資料整合
- 資源連結管理
- 優先度分類

### 7. 計畫 💡
- **圖片上傳**：支援視覺化展示
- **網頁連結**：外部資源整合
- **拖拽排序**：自訂計畫優先順序
- **標籤管理**：討論中/進行中/已完成/擱置
- **內容預覽**：重點與完整內容分離

## 🚀 快速開始

### 方法一：直接開啟（推薦）

1. 下載 `nkust_racing.html`
2. 用瀏覽器開啟即可使用
3. 所有功能完全離線可用

### 方法二：Web 伺服器

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# 訪問 http://localhost:8000/nkust_racing.html
```

## 📦 內建資源

系統已預載以下官方資源：

### 📋 賽事資訊
- [Formula SAE Taiwan 文件審查](https://www.fstaiwan.net/3-ses-document-review)
- [FSAE Online 官方文件](https://www.fsaeonline.com/cdsweb/gen/documentresources.aspx)
- [JSAE 日本賽事公告](https://www.jsae.or.jp/formula/past-result/23rd_official_announce_icvclass/)

### 🔧 工程工具
- [Realis Simulation 贊助申請](https://www.realis-simulation.com/zh/support/academia/formula-sae-grant-request/)
- [Altair 技術贊助](https://altair.com/technology-sponsorship-request)
- [ANSYS 學生團隊支援](https://www.ansys.com/academic/students/student-teams)
- [MathWorks Formula SAE 支援](https://jp.mathworks.com/academia/student-competitions/formula-student-michigan.html)

### 🏭 零件供應商
- [OZ Racing FSAE 輪圈](https://www.ozracing.com/motorsport/formula-student/wheels)
- [Keizer Wheels FSAE 專區](https://keizerwheels.com/product-category/fsae/)
- [Enkei SF-01 規格書](https://www.enkei.co.jp/upload/product/wheels/_2512_SF-01_web_02.pdf)
- [Hoosier FSAE 輪胎](https://www.hoosiertirewest.com/categories/circuit-racing-road-course-rally/formula-student-fsae.html)
- [GY Racing FSAE 產品](https://gyracing.com.au/product-category/fsae/)

### 📚 學習資源
- [JSAE 2025 數位書](https://digitalbook.jsae.or.jp/library/books/fsaej2025/book/)
- [Learn And Compete - FSAE 入門](https://www.scribd.com/document/511418795/Learn-And-Compete-A-Primer-For-Formula-SAE)
- [Race Car Design by Derek Seward](https://www.scribd.com/document/868117502/pdfcoffee-com-race-car-design-by-derek-seward-2-pdf-free)
- [FSAE 設計理念文章](https://www.designjudges.com/articles/conceptual-and-objective-design-in-fsae)
- [FSAE TO WIN 完整指南](https://xxkizashi.github.io/FSAE_TO_WIN/)

## 💾 資料管理

### 匯出資料
1. 點擊右上角 📤 按鈕
2. 下載 JSON 格式備份檔

### 匯入資料
1. 點擊右上角 📥 按鈕
2. 選擇先前匯出的 JSON 檔案
3. 系統自動還原所有資料

### 資料儲存
- 所有資料儲存在瀏覽器 `localStorage`
- 鍵名：`fsaeResources`
- 建議定期匯出備份

## 🎨 設計系統

### 色彩配置
- **主色橙 #ED6C00**：主要動作、車體、煞車
- **輔色黃 #F6AB00**：次要強調、引擎
- **強調藍 #006DAD**：懸吊、點綴
- **深色模式**：#1a1a1a / #2a2a2a / #3a3a3a

### 響應式設計
- 桌面：完整功能
- 平板：卡片網格調整
- 手機：單欄顯示

## 🔧 技術規格

- **純前端**：無需後端伺服器
- **零依賴**：無需外部函式庫
- **HTML5**：語意化標籤
- **CSS3**：Flexbox/Grid 排版
- **ES6+**：現代 JavaScript
- **LocalStorage**：資料持久化

## 📝 資料結構

### 人員資料
```javascript
{
  category: "人員管理",
  isPerson: true,
  name: "姓名",
  image: "base64...",
  position: "隊長",
  department: "機械系",
  grade: "大三",
  workType: ["車體", "懸吊"],
  joinDate: "2024-01-15",
  gmail: "example@gmail.com",
  phone: "0912345678",
  skills: "技能描述",
  other: "其他資訊"
}
```

### 工作日誌
```javascript
{
  category: "工作日誌",
  isWorkLog: true,
  name: "工作標題",
  image: "base64...",
  date: "2024-01-15",
  shortDesc: "簡短描述",
  content: "詳細內容",
  tag: "進行中",
  priority: "高"
}
```

### 計畫資料
```javascript
{
  category: "計畫",
  isPlan: true,
  name: "內容重點",
  image: "base64...",
  url: "https://...",
  content: "完整內容",
  tag: "進行中",
  order: 1234567890
}
```

### 一般資源
```javascript
{
  category: "賽事資訊/工程工具/零件供應商/學習資源",
  name: "標題",
  url: "https://...",
  desc: "描述",
  content: "詳細內容",
  priority: "高"
}
```

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

### 開發流程
1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 👥 作者

**NKUST Racing Team**
- 高雄科技大學 Formula SAE 車隊

## 🙏 致謝

- Formula SAE Taiwan
- JSAE (日本自動車技術會)
- 所有贊助商與供應商
- 參考資源作者

---

**⚡ Built with ❤️ by NKUST Racing Team**
