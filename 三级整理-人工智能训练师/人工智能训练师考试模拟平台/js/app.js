// ===== 全局状态 =====
let currentModule = null;
let currentQuestion = null;
let currentTodo = null;
let currentTodoIndex = null;
let timerInterval = null;

// ===== 页面路由 =====
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId)?.classList.add('active');
    // 切换页面时重置滚动位置，模拟独立页面体验
    setTimeout(() => {
        const activeView = document.getElementById(viewId);
        if (activeView) activeView.scrollTop = 0;
    }, 10);
}

// ===== 答题状态管理 =====
function getProgress() {
    try {
        return JSON.parse(localStorage.getItem('exam_progress') || '{}');
    } catch {
        return {};
    }
}

function setProgress(questionId, todoIndex) {
    const progress = getProgress();
    if (!progress[questionId]) progress[questionId] = {};
    progress[questionId][todoIndex] = true;
    localStorage.setItem('exam_progress', JSON.stringify(progress));
}

function isTodoCompleted(questionId, todoIndex) {
    const progress = getProgress();
    return progress[questionId]?.[todoIndex] === true;
}

// ===== Toast =====
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ===== 倒计时 =====
function startTimer(durationMinutes) {
    let remaining = durationMinutes * 60;
    if (timerInterval) clearInterval(timerInterval);
    
    function updateTimer() {
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        const text = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        ['exam-timer', 'question-timer', 'answer-timer'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        });
        
        if (remaining > 0) {
            remaining--;
        } else {
            clearInterval(timerInterval);
            alert('考试时间结束！');
        }
    }
    
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

// ===== 登录页面 =====
document.getElementById('login-btn')?.addEventListener('click', () => {
    document.getElementById('pledge-modal').classList.add('active');
    startPledgeCountdown();
});

// ===== 诚信承诺书 =====
function startPledgeCountdown() {
    const agreeBtn = document.getElementById('agree-btn');
    const countdownSpan = document.getElementById('countdown');
    let seconds = 3;
    
    agreeBtn.disabled = true;
    agreeBtn.innerHTML = `同意 (<span id="countdown">${seconds}</span>秒)`;
    
    const interval = setInterval(() => {
        seconds--;
        const span = document.getElementById('countdown');
        if (span) span.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(interval);
            agreeBtn.disabled = false;
            agreeBtn.textContent = '同意';
        }
    }, 1000);
}

document.getElementById('agree-btn')?.addEventListener('click', () => {
    document.getElementById('pledge-modal').classList.remove('active');
    showView('exam-view');
    renderModules();
    startTimer(120);
});

// ===== 考试页面 =====
function renderModules() {
    const container = document.getElementById('modules-container');
    const progress = getProgress();
    
    container.innerHTML = data.map(module => {
        let totalTodos = 0;
        let completedTodos = 0;
        
        module.questions.forEach(q => {
            q.todo.forEach((_, idx) => {
                totalTodos++;
                if (progress[q.id]?.[idx]) completedTodos++;
            });
        });
        
        const percent = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
        const icons = ['📊', '🤖', '🏗️', '📚'];
        const icon = icons[(parseInt(module.id) - 1) % icons.length];
        
        return `
            <div class="module-card" data-module-id="${module.id}">
                <div class="module-icon">${icon}</div>
                <div class="module-name">${module.firstName}</div>
                <div class="module-count">共 ${module.questions.length} 道题目</div>
                <div class="module-progress">
                    <div class="module-progress-bar" style="width: ${percent}%"></div>
                </div>
                <div class="module-progress-text">完成进度: ${completedTodos}/${totalTodos} (${percent}%)</div>
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('click', () => {
            const moduleId = card.dataset.moduleId;
            currentModule = data.find(m => m.id === moduleId);
            showView('question-view');
            document.getElementById('module-title').textContent = currentModule.firstName;
            renderQuestionList();
        });
    });
}

// ===== 题目答题页面 =====
function renderQuestionList() {
    const listEl = document.getElementById('question-list');
    const progress = getProgress();
    
    let html = '<h3>题目列表</h3>';
    
    currentModule.questions.forEach((q, qIdx) => {
        let allCompleted = true;
        q.todo.forEach((_, tIdx) => {
            if (!progress[q.id]?.[tIdx]) allCompleted = false;
        });
        
        html += `<div class="question-list-item ${qIdx === 0 ? 'active' : ''}" data-idx="${qIdx}">
            ${q.id} ${allCompleted ? ' ✅' : ''}
        </div>`;
    });
    
    listEl.innerHTML = html;
    
    listEl.querySelectorAll('.question-list-item').forEach(item => {
        item.addEventListener('click', () => {
            listEl.querySelectorAll('.question-list-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            renderQuestionDetail(parseInt(item.dataset.idx));
        });
    });
    
    renderQuestionDetail(0);
}

function renderQuestionDetail(questionIndex) {
    const mainEl = document.getElementById('question-main');
    const question = currentModule.questions[questionIndex];
    const progress = getProgress();
    
    let todosHtml = '';
    question.todo.forEach((todo, tIdx) => {
        const completed = isTodoCompleted(question.id, tIdx);
        const typeClass = todo.type;
        const typeLabel = { code: '代码题', text: '文字题', docx: '文档题' }[todo.type] || todo.type;
        
        todosHtml += `
            <div class="todo-item">
                <div class="todo-status">${completed ? '✅' : '⭕'}</div>
                <div class="todo-content">
                    <span class="todo-type ${typeClass}">${typeLabel}</span>
                    <div class="todo-title">${todo.questionTitle.replace(/\n/g, '<br>')}</div>
                </div>
                <button class="btn-go-answer" data-qid="${question.id}" data-tidx="${tIdx}">去答题</button>
            </div>
        `;
    });
    
    mainEl.innerHTML = `
        <div class="question-text">${question.question.replace(/\n/g, '<br>')}</div>
        <div class="todo-section">
            <h3>答题任务</h3>
            ${todosHtml}
        </div>
    `;
    
    mainEl.querySelectorAll('.btn-go-answer').forEach(btn => {
        btn.addEventListener('click', () => {
            currentQuestion = question;
            currentTodoIndex = parseInt(btn.dataset.tidx);
            currentTodo = question.todo[currentTodoIndex];
            showView('answer-view');
            renderAnswer();
        });
    });
}

// 题目答题页面返回
document.getElementById('question-back')?.addEventListener('click', () => {
    showView('exam-view');
    renderModules();
});

// ===== 答题页面 =====
function renderAnswer() {
    const areaEl = document.getElementById('answer-area');
    const infoEl = document.getElementById('question-info');
    const breadcrumbEl = document.getElementById('answer-breadcrumb');
    
    // 面包屑导航
    if (breadcrumbEl) {
        breadcrumbEl.innerHTML = `
            <a onclick="goToExam()">考试首页</a>
            <span class="breadcrumb-separator">&gt;</span>
            <a onclick="goToModule()">${currentModule.firstName}</a>
            <span class="breadcrumb-separator">&gt;</span>
            <span>题目 ${currentQuestion.id}</span>
        `;
    }
    
    // 右侧题目信息 - 显示question + 所有todo的questionTitle
    const allTodoTitles = currentQuestion.todo.map((todo, idx) => {
        const typeLabel = { code: '【代码题】', text: '【文字题】', docx: '【文档题】' }[todo.type] || '';
        return `<div style="margin-bottom:12px; padding:10px; background:#f8fafc; border-radius:6px; border-left:3px solid #2563eb;">
            <div style="font-size:12px; color:#64748b; margin-bottom:4px;">${typeLabel} 任务 ${idx + 1}</div>
            <div style="font-size:14px; line-height:1.6; white-space:pre-wrap;">${todo.questionTitle}</div>
        </div>`;
    }).join('');
    
    infoEl.innerHTML = `
        <h3>题目信息</h3>
        <div style="margin-bottom:16px; padding:12px; background:#eff6ff; border-radius:8px; border-left:3px solid #2563eb;">
            <div style="font-size:12px; color:#64748b; margin-bottom:6px;">题目描述</div>
            <div class="question-info-text" style="font-size:14px; line-height:1.8;">${currentQuestion.question.replace(/\n/g, '<br>')}</div>
        </div>
        <div style="font-size:14px; font-weight:600; margin-bottom:12px; color:#1e293b;">答题任务：</div>
        ${allTodoTitles}
    `;
    
    // 左侧答题区
    const type = currentTodo.type;
    
    if (type === 'code') {
        areaEl.innerHTML = `
            <div class="answer-header">
                <h4>代码答题区</h4>
                <button id="run-code-btn" class="btn-run">▶ 运行</button>
            </div>
            <div class="answer-content">
                <pre><code class="language-python">${escapeHtml(currentTodo.content || '')}</code></pre>
            </div>
        `;
        if (window.Prism) Prism.highlightAll();
        
        document.getElementById('run-code-btn')?.addEventListener('click', () => {
            showToast('运行成功');
        });
    } else if (type === 'text' || type === 'docx') {
        const headerText = type === 'text' ? '文字答题区' : '文档答题区';
        const prefillContent = (type === 'docx' && currentTodo.content) ? currentTodo.content : '';
        areaEl.innerHTML = `
            <div class="answer-header">
                <h4>${headerText}</h4>
            </div>
            <div class="answer-content">
                <textarea id="editor" class="answer-textarea" placeholder="在此输入您的答案...">${escapeHtml(prefillContent)}</textarea>
            </div>
        `;
    }
}

// 保存按钮
document.getElementById('save-btn')?.addEventListener('click', () => {
    setProgress(currentQuestion.id, currentTodoIndex);
    showToast('保存成功');
});

// 答题页面返回
document.getElementById('answer-back')?.addEventListener('click', () => {
    showView('question-view');
    renderQuestionList();
    // 高亮当前题目
    const items = document.querySelectorAll('.question-list-item');
    items.forEach(i => i.classList.remove('active'));
    const currentQ = currentModule.questions.findIndex(q => q.id === currentQuestion.id);
    if (items[currentQ]) items[currentQ].classList.add('active');
});

// ===== Mock文件夹文件复制 =====
document.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('click', () => {
        const path = item.dataset.path;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(path).then(() => showToast('路径已复制: ' + path));
        } else {
            showToast('路径: ' + path);
        }
    });
});

// ===== 工具函数 =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 面包屑导航跳转
function goToExam() {
    showView('exam-view');
    renderModules();
}

function goToModule() {
    showView('question-view');
    renderQuestionList();
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    showView('login-view');
});
