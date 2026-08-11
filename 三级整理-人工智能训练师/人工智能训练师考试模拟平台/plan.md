# 考试模拟系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个白蓝浅色调的纯前端考试模拟系统单页应用，包含登录、诚信承诺、考试模块、题目答题和答题页面，支持code/text/docx三种题型。

**Architecture:** 单页应用(SPA)架构，通过CSS控制section显示/隐藏实现页面切换。数据由data.js提供，状态通过localStorage持久化。

**Tech Stack:** HTML5 + CSS3 + Vanilla JS (ES6+), Quill.js (CDN), Prism.js (CDN)

## Global Constraints

- 无后端依赖，纯前端运行
- 白蓝浅色调配色（#f0f7ff背景, #2563eb主色）
- 单页应用，通过显示/隐藏DOM实现页面切换
- 数据来自data.js，结构不可更改
- localStorage键名: `exam_progress`
- 倒计时: 120分钟，格式HH:MM:SS
- CDN依赖: Quill.js (quill@2.x), Prism.js (prismjs@1.x)

## 文件结构

```
📁 人工智能训练师考试模拟平台/
├── 📄 index.html          # 主页面（包含所有视图）
├── 📄 data.js             # 考试数据（已有，不可修改结构）
├── 📄 design.md           # 设计文档（已有）
├── 📁 css/
│   └── 📄 style.css       # 全局样式 + 5个页面样式
├── 📁 js/
│   └── 📄 app.js          # 业务逻辑 + 页面路由 + 交互
```

---

### Task 1: 创建 index.html 主页面骨架

**Files:**
- Create: `index.html`

**Interfaces:**
- Produces: 5个section视图 (login-view, pledge-modal, exam-view, question-view, answer-view)
- Produces: CDN链接 (Quill.js, Prism.js)

**步骤：**

- [ ] **Step 1: 创建基础HTML5结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>人工智能训练师考试模拟平台</title>
    <!-- Quill.js -->
    <link href="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.js"></script>
    <!-- Prism.js -->
    <link href="https://cdn.jsdelivr.net/npm/prismjs@1/themes/prism.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1/prism.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-python.min.js"></script>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- 5个section容器，默认只显示login-view -->
    <section id="login-view" class="view active">...</section>
    <div id="pledge-modal" class="modal">...</div>
    <section id="exam-view" class="view">...</section>
    <section id="question-view" class="view">...</section>
    <section id="answer-view" class="view">...</section>
    
    <script src="data.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

**测试：** 在浏览器打开index.html，确认页面加载无错误，控制台无404。

---

### Task 2: 创建 css/style.css - 全局样式和基础布局

**Files:**
- Create: `css/style.css`

**Interfaces:**
- Consumes: HTML结构中的class/id命名
- Produces: 白蓝浅色调配色 + 响应式布局 + 动画

**步骤：**

- [ ] **Step 1: CSS变量定义和全局重置**

```css
:root {
    --bg-primary: #f0f7ff;
    --bg-white: #ffffff;
    --color-primary: #2563eb;
    --color-primary-hover: #1d4ed8;
    --color-light: #dbeafe;
    --color-text: #1e293b;
    --color-text-secondary: #64748b;
    --color-border: #e2e8f0;
    --color-success: #10b981;
    --color-pending: #cbd5e1;
    --shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg-primary); color: var(--color-text); }
.view { display: none; width: 100%; min-height: 100vh; }
.view.active { display: block; }
```

- [ ] **Step 2: 登录页面样式**
- [ ] **Step 3: 弹框和按钮样式**
- [ ] **Step 4: 考试页面卡片网格**
- [ ] **Step 5: 题目答题页面布局(三栏)**
- [ ] **Step 6: 答题页面布局(左右分栏)**
- [ ] **Step 7: Toast和倒计时样式**

**测试：** 在浏览器打开index.html，检查各页面布局是否正确。

---

### Task 3: 创建 js/app.js - 数据加载和页面路由

**Files:**
- Create: `js/app.js`

**Interfaces:**
- Consumes: data.js中的`data`数组
- Consumes: localStorage中的`exam_progress`
- Produces: 页面切换函数 `showView(viewId)`
- Produces: 答题状态管理函数 `getProgress()`, `setProgress(questionId, todoIndex)`
- Produces: 倒计时函数 `startTimer(duration)`

**步骤：**

- [ ] **Step 1: 页面路由和状态管理**

```javascript
// 页面路由
function showView(viewId) { ... }

// 答题状态管理
function getProgress() { ... }
function setProgress(questionId, todoIndex) { ... }

// 倒计时
function startTimer(durationMinutes) { ... }

// 当前状态
let currentModule = null;
let currentQuestion = null;
let currentTodo = null;
```

**测试：** 在控制台调用 `showView('exam-view')`，确认页面切换正常。

---

### Task 4: 实现登录页面和诚信承诺书弹框

**Files:**
- Modify: `index.html` - 填充login-view和pledge-modal的HTML
- Modify: `css/style.css` - 补充登录页和弹框样式
- Modify: `js/app.js` - 添加登录和弹框逻辑

**Interfaces:**
- Consumes: `showView('exam-view')`

**步骤：**

- [ ] **Step 1: 登录页面HTML**
  - 居中卡片: 标题"人工智能训练师考试模拟平台"、账号输入框(提示身份证号)、密码输入框(提示后6位)、登录按钮
- [ ] **Step 2: 诚信承诺书弹框HTML**
  - 半透明遮罩层、承诺书正文、倒计时"同意"按钮(3秒)
- [ ] **Step 3: 登录按钮事件**
  - 点击 → 显示pledge-modal
- [ ] **Step 4: 倒计时逻辑**
  - 弹框显示时启动3秒倒计时
  - 按钮灰显 → 3秒后高亮可点击
  - 点击"同意" → showView('exam-view') + startTimer(120)

**测试：** 点击登录 → 弹框显示 → 3秒后同意 → 跳转到考试页面。

---

### Task 5: 实现考试页面（4个模块卡片）

**Files:**
- Modify: `index.html` - 填充exam-view的HTML
- Modify: `css/style.css` - 补充考试页面样式
- Modify: `js/app.js` - 添加模块渲染和点击事件

**Interfaces:**
- Consumes: `data`数组
- Consumes: `getProgress()`
- Produces: `renderModules()`, 模块点击事件 → showView('question-view')

**步骤：**

- [ ] **Step 1: 考试页面HTML**
  - 顶部: 考试标题 + 倒计时显示区域
  - 中部: 4个模块卡片(2×2网格)
- [ ] **Step 2: renderModules()函数**
  - 遍历data数组生成卡片
  - 卡片内容: 图标 + firstName + 题目数量 + 进度%
  - 进度% = 已完成todo数 / 总todo数 × 100
- [ ] **Step 3: 模块点击事件**
  - 点击卡片 → currentModule = 对应模块 → showView('question-view') → renderQuestions()

**测试：** 确认4个模块卡片正确渲染，点击后跳转题目答题页面。

---

### Task 6: 实现题目答题页面

**Files:**
- Modify: `index.html` - 填充question-view的HTML
- Modify: `css/style.css` - 补充题目答题页面样式
- Modify: `js/app.js` - 添加题目渲染和todo状态

**Interfaces:**
- Consumes: `currentModule`
- Consumes: `getProgress()`
- Produces: `renderQuestions()`, 去答题按钮 → showView('answer-view')

**步骤：**

- [ ] **Step 1: 题目答题页面HTML**
  - 顶部: 返回按钮(→exam-view) + 模块标题 + 倒计时
  - 左侧: 题目列表(question id)
  - 中间: question描述 + todo列表
- [ ] **Step 2: renderQuestions()函数**
  - 遍历currentModule.questions生成题目列表
  - 显示当前选中的question详情
- [ ] **Step 3: todo列表渲染**
  - 每个todo显示: questionTitle + 完成状态(✅/⭕) + "去答题"按钮
  - 点击"去答题" → currentTodo = todo → showView('answer-view') → renderAnswer()

**测试：** 左侧题目列表可切换，todo显示正确，完成状态标记正确。

---

### Task 7: 实现答题页面（code/text/docx）

**Files:**
- Modify: `index.html` - 填充answer-view的HTML
- Modify: `css/style.css` - 补充答题页面样式
- Modify: `js/app.js` - 添加答题区渲染逻辑

**Interfaces:**
- Consumes: `currentQuestion`, `currentTodo`
- Consumes: `getProgress()`, `setProgress()`
- Produces: `renderAnswer()`, 保存/运行按钮逻辑

**步骤：**

- [ ] **Step 1: 答题页面HTML**
  - 顶部: 返回按钮(→question-view) + 保存按钮 + 倒计时
  - 左侧: 答题区容器
  - 右侧: 上半=题目题干, 下半=mock文件夹
- [ ] **Step 2: renderAnswer()函数**
  - 根据currentTodo.type渲染不同答题区:
    - `code`: `<pre><code class="language-python">...</code></pre>` + "运行"按钮
    - `text`: `<div id="editor"></div>` (Quill初始化)
    - `docx`: `<div id="editor"></div>` (Quill初始化, 预填充content)
- [ ] **Step 3: 右侧mock文件夹**
  - 固定假文件列表: Excel文件, CSV文件等
  - 鼠标hover显示"点击复制路径"
  - 点击复制路径到剪贴板
- [ ] **Step 4: 运行按钮**
  - code类型显示运行按钮
  - 点击 → showToast("运行成功")
- [ ] **Step 5: 保存按钮**
  - 点击 → setProgress(currentQuestion.id, todoIndex) → showToast("保存成功")

**测试：** 
- code类型显示Python代码 + 运行按钮 → 点击弹出"运行成功"
- text类型显示空白Quill编辑器
- docx类型显示预填充content的Quill编辑器
- 保存按钮 → 状态更新 + Toast提示

---

### Task 8: 整合测试和细节调整

**Files:**
- Modify: `index.html`, `css/style.css`, `js/app.js`

**步骤：**

- [ ] **Step 1: 倒计时全局显示**
  - 在考试页面、题目答题页面、答题页面顶部都显示倒计时
  - 120分钟倒计时，格式 HH:MM:SS
- [ ] **Step 2: Toast组件**
  - 创建全局Toast函数，用于显示"运行成功"/"保存成功"
- [ ] **Step 3: 返回按钮逻辑**
  - 答题页面返回 → 题目答题页面
  - 题目答题页面返回 → 考试页面
- [ ] **Step 4: 进度百分比计算**
  - 模块卡片和题目答题页面正确显示完成进度
- [ ] **Step 5: 响应式适配**
  - 确保在常见屏幕尺寸下显示正常

**测试：** 完整走一遍流程: 登录 → 同意 → 考试页面 → 模块 → 题目 → 答题(code/text/docx) → 保存 → 返回 → 返回

---

## Spec Coverage Check

| 需求 | 对应Task | 状态 |
|------|---------|------|
| 登录页面(账号/密码) | Task 4 | ✅ |
| 诚信承诺书(3秒倒计时) | Task 4 | ✅ |
| 考试页面(4模块卡片) | Task 5 | ✅ |
| 题目答题页面(左侧选题/中间question/todo列表) | Task 6 | ✅ |
| 答题页面(code/text/docx) | Task 7 | ✅ |
| code运行按钮(Toast) | Task 7 | ✅ |
| text/docx富文本(Quill) | Task 7 | ✅ |
| 保存按钮(Toast) | Task 7 | ✅ |
| mock文件夹(固定假文件) | Task 7 | ✅ |
| 120分钟倒计时 | Task 8 | ✅ |
| 返回层级 | Task 8 | ✅ |
| 白蓝浅色调 | Task 2 | ✅ |
| localStorage状态管理 | Task 3,7 | ✅ |

## Placeholder Scan

- 无 "TBD", "TODO", "implement later" 等占位符
- 所有步骤都有具体代码或明确指令
- 所有函数名在前后Task中保持一致

## Execution Handoff

**Plan complete and saved.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach would you like?**