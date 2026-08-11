// 全局数据
let questionsData = [];
let knowledgeData = [];
let currentQuestion = null;
let userAnswers = JSON.parse(localStorage.getItem('userAnswers') || '{}');
let inputCounter = 0;

// 知识点编辑弹窗当前索引
let currentEditIndices = null;
let editModalMode = 'edit'; // 'edit' 或 'add'

// 刷题统计：总刷题次数 + 当前轮次完成状态
let practiceStats = JSON.parse(localStorage.getItem('practiceStats') || '{"totalRounds":0,"currentRound":{}}');

// 模块分组配置
const moduleConfig = {
    '1.1': { title: '1.1.x 数据预处理（纯代码）', ids: ['1.1.1', '1.1.2', '1.1.3', '1.1.4', '1.1.5'] },
    '2.1': { title: '2.1.x 数据清洗与标注（代码+简答）', ids: ['2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.1.5'] },
    '2.2': { title: '2.2.x 建模（代码+简答）', ids: ['2.2.1', '2.2.2', '2.2.3', '2.2.4', '2.2.5'] },
    '3.2': { title: '3.2.x 图像识别（代码+简答）', ids: ['3.2.1', '3.2.2', '3.2.3', '3.2.4', '3.2.5'] }
};

// 初始化
async function init() {
    try {
        // 优先使用内联数据（支持双击打开），否则通过 fetch 加载
        let rawKnowledgeData;
        if (typeof questionsDataSource !== 'undefined') {
            questionsData = questionsDataSource;
        } else {
            const qResponse = await fetch('data/questions.json');
            questionsData = await qResponse.json();
        }
        
        if (typeof knowledgeDataSource !== 'undefined') {
            rawKnowledgeData = knowledgeDataSource;
        } else {
            const kResponse = await fetch('data/knowledge.json');
            rawKnowledgeData = await kResponse.json();
        }
        
        // 从 localStorage 加载知识数据，如果没有则使用原始数据并进行格式转换
        const savedKnowledge = localStorage.getItem('knowledgeData');
        if (savedKnowledge) {
            knowledgeData = JSON.parse(savedKnowledge);
        } else {
            // 转换为新格式：items 从字符串数组变为 {code, note} 对象数组
            knowledgeData = rawKnowledgeData.map(module => ({
                ...module,
                points: module.points.map(point => ({
                    ...point,
                    items: point.items.map(item => {
                        if (typeof item === 'string') {
                            return { code: item, note: '' };
                        }
                        return item;
                    })
                }))
            }));
            // 保存到 localStorage
            localStorage.setItem('knowledgeData', JSON.stringify(knowledgeData));
        }
        
        renderQuestionList();
        renderKnowledgePanel();
        updateProgress();
        renderPracticeStats();
        
        if (questionsData.length > 0) {
            selectQuestion(questionsData[0].id);
        }
        
        // 初始化拖动分隔线
        initResizer();
    } catch (error) {
        console.error('加载数据失败:', error);
        document.getElementById('codeFillContainer').innerHTML = 
            '<div style="color: #f44336; text-align: center; margin-top: 40px;">加载数据失败，请检查文件路径</div>';
    }
}

// 渲染题目列表
function renderQuestionList() {
    const container = document.getElementById('questionList');
    let html = '';
    
    for (const [moduleId, config] of Object.entries(moduleConfig)) {
        const moduleQuestions = config.ids.map(id => questionsData.find(q => q.id === id)).filter(Boolean);
        if (moduleQuestions.length === 0) continue;
        
        html += `
            <div class="module-group">
                <div class="module-title" onclick="toggleModule(this)">
                    <span>${config.title}</span>
                    <span class="toggle-icon">▼</span>
                </div>
                <div class="question-items">
                    ${moduleQuestions.map(q => {
                        const status = getQuestionStatus(q.id);
                        const statusClass = status === 'completed' ? 'completed' : (status === 'in-progress' ? 'in-progress' : '');
                        return `
                            <div class="question-item" data-id="${q.id}" onclick="selectQuestion('${q.id}')">
                                <span class="q-id">${q.id}</span>
                                <span class="q-name" title="${escapeHtml(q.name)}">${escapeHtml(q.name)}</span>
                                <span class="q-status ${statusClass}"></span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function toggleModule(element) {
    element.classList.toggle('collapsed');
    const items = element.nextElementSibling;
    if (items) {
        items.style.display = items.style.display === 'none' ? 'block' : 'none';
    }
}

// 选择题目
function selectQuestion(questionId) {
    // 切换前保存当前题目的答案
    saveUserAnswers();
    
    currentQuestion = questionsData.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    document.querySelectorAll('.question-item').forEach(item => {
        item.classList.toggle('active', item.dataset.id === questionId);
    });
    
    document.getElementById('codeTitle').textContent = `${currentQuestion.id} - 代码填空`;
    renderDescription(currentQuestion);
    renderFillCode(currentQuestion);
    renderFullCode(currentQuestion);
    hideDiff();
    restoreUserAnswers(questionId);
    
    // 切换题目时，题目描述滚动到最上面
    const descContent = document.getElementById('descriptionContent');
    if (descContent) descContent.scrollTop = 0;
}

function renderDescription(question) {
    const container = document.getElementById('descriptionContent');
    let descriptionHtml = '';
    if (question.description) {
        descriptionHtml = formatDescription(question.description);
    } else {
        descriptionHtml = `<p>本题考查${getModuleDescription(question.id)}相关知识。请根据题目要求，在下方代码中填写正确的内容。</p>`;
    }
    container.innerHTML = `
        <h3>${escapeHtml(question.id)} - ${escapeHtml(question.name)}</h3>
        <div class="description-content">${descriptionHtml}</div>
    `;
}

function formatDescription(text) {
    // 先清理多余空格
    let formatted = text.replace(/\s+/g, ' ').trim();
    
    // 将 "l " 列表标记（作为列表符号，后面跟大写单词或中文）替换为换行 + 项目符号
    formatted = formatted.replace(/\s+l\s+(?=[A-Z\u4e00-\u9fa5（])/g, '\n• ');
    
    // 将任务编号（如 "（ 1 ）"、"（1）"、"(1)" 等）前加换行
    formatted = formatted.replace(/\s*[（\(]\s*(\d+)\s*[）\)]/g, '\n（$1）');
    
    // 按换行分割成段落
    const paragraphs = formatted.split('\n').map(p => p.trim()).filter(p => p);
    
    return paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
}

function getModuleDescription(id) {
    if (id.startsWith('1.1')) return '数据预处理与代码编写';
    if (id.startsWith('2.1')) return '数据清洗与标注';
    if (id.startsWith('2.2')) return '机器学习模型开发';
    if (id.startsWith('3.2')) return '图像识别与ONNX模型应用';
    return '相关';
}

// 上一题
function prevQuestion() {
    if (!currentQuestion) return;
    const currentIndex = questionsData.findIndex(q => q.id === currentQuestion.id);
    if (currentIndex > 0) {
        selectQuestion(questionsData[currentIndex - 1].id);
    }
}

// 下一题
function nextQuestion() {
    if (!currentQuestion) return;
    const currentIndex = questionsData.findIndex(q => q.id === currentQuestion.id);
    if (currentIndex < questionsData.length - 1) {
        selectQuestion(questionsData[currentIndex + 1].id);
    }
}

// 渲染填空代码
function renderFillCode(question) {
    const container = document.getElementById('codeFillContainer');
    const code = question.fillInCode || '';
    
    if (!code) {
        container.innerHTML = '<div style="color: var(--code-line-num); text-align: center;">暂无填空代码</div>';
        return;
    }
    
    inputCounter = 0;
    const lines = code.split('\n');
    let html = '<div class="code-block">';
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        // 处理填空：将连续的下划线替换为输入框
        let processedLine = line;
        // 匹配7个或更多连续下划线
        const parts = line.split(/(_{7,})/);
        const processedParts = parts.map((part, partIndex) => {
            if (/_{7,}/.test(part)) {
                inputCounter++;
                const inputId = `input_${question.id}_${inputCounter}`;
                return `<input type="text" class="code-input" id="${inputId}" data-idx="${inputCounter}" placeholder="填写答案..." autocomplete="off" oninput="autoResizeInput(this)">`;
            }
            return escapeHtml(part);
        });
        
        html += `<span class="line"><span class="line-number">${lineNum}</span><span class="line-content">${processedParts.join('')}</span></span>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// 渲染完整代码
function renderFullCode(question) {
    const container = document.getElementById('fullCodeContent');
    
    // 优先使用标注版HTML（referenceCode）
    if (question.referenceCode) {
        // 使用CSS类让背景色跟随主题
        container.innerHTML = `
            <div class="reference-code-wrapper">
                ${question.referenceCode}
            </div>
        `;
        return;
    }
    
    const code = question.fullCode || '';
    
    if (!code) {
        container.innerHTML = '<div style="color: var(--code-line-num); padding: 16px;">暂无完整代码</div>';
        return;
    }
    
    container.innerHTML = `<pre><code class="language-python">${escapeHtml(code)}</code></pre>`;
    
    if (window.Prism) {
        Prism.highlightAll();
    }
}

// 显示/隐藏完整代码
function showFullCode() {
    const panel = document.getElementById('fullCodePanel');
    panel.classList.add('expanded');
    const btn = document.getElementById('showFullBtn');
    btn.textContent = '隐藏完整代码';
    btn.onclick = hideFullCode;
}

function hideFullCode() {
    const panel = document.getElementById('fullCodePanel');
    panel.classList.remove('expanded');
    const btn = document.getElementById('showFullBtn');
    btn.textContent = '显示完整代码';
    btn.onclick = showFullCode;
}

function toggleFullCode() {
    const panel = document.getElementById('fullCodePanel');
    if (panel.classList.contains('expanded')) {
        hideFullCode();
    } else {
        showFullCode();
    }
}

// 检查答案
function checkAnswers() {
    if (!currentQuestion) return;
    
    const inputs = document.querySelectorAll('.code-input');
    if (inputs.length === 0) return;
    
    const fillCode = currentQuestion.fillInCode || '';
    const fullCode = currentQuestion.fullCode || '';
    
    // 提取每个填空位置的正确答案
    const answers = extractAnswers(fillCode, fullCode);
    let correctCount = 0;
    let filledCount = 0;
    
    inputs.forEach((input, idx) => {
        const userAnswer = input.value.trim();
        const correctAnswer = answers[idx] || '';
        
        input.classList.remove('correct', 'incorrect');
        
        if (userAnswer) {
            filledCount++;
            // 精确匹配：忽略空格和大小写
            const normalizedUser = normalizeAnswer(userAnswer);
            const normalizedCorrect = normalizeAnswer(correctAnswer);
            
            console.log(`填空${idx}: 用户="${userAnswer}" 正确="${correctAnswer}" 归一化用户="${normalizedUser}" 归一化正确="${normalizedCorrect}" 匹配=${normalizedUser === normalizedCorrect}`);
            
            if (normalizedUser === normalizedCorrect) {
                input.classList.add('correct');
                correctCount++;
            } else {
                input.classList.add('incorrect');
            }
        }
    });
    
    saveUserAnswers();
    updateProgress();
    
    // 如果全部正确，标记当前题目为完成状态
    const allCorrect = correctCount === inputs.length && correctCount > 0;
    if (allCorrect) {
        practiceStats.currentRound[currentQuestion.id] = true;
        savePracticeStats();
    }
    
    renderQuestionList();
    renderPracticeStats();
    
    // 显示对比
    showDiff();
    
    alert(`检查结果：正确 ${correctCount}/${inputs.length} 个填空（已填写 ${filledCount} 个）`);
    
    // 检查是否20题全部完成
    if (allCorrect) {
        checkRoundComplete();
    }
}

// 从完整代码中提取答案（按行号直接对应）
function extractAnswers(fillCode, fullCode) {
    const answers = [];
    const fillLines = fillCode.split('\n');
    const fullLines = fullCode.split('\n');
    
    // 按行号直接对应（fillInCode 和 fullCode 行数相同且一一对应）
    for (let i = 0; i < fillLines.length; i++) {
        const fillLine = fillLines[i];
        const fullLine = fullLines[i] || '';
        
        if (!fillLine.includes('___')) continue;
        
        // 将该行按填空分割
        const parts = fillLine.split(/_{7,}/);
        
        // 从对应行号的完整代码中提取填空内容
        let lastExtractEnd = 0; // 记录上一次提取结束的位置
        
        for (let j = 0; j < parts.length - 1; j++) {
            const prefix = parts[j];
            const suffix = parts[j + 1];
            
            if (!suffix.trim()) {
                // 最后一个填空，取prefix之后的所有内容
                const prefixIndex = fullLine.indexOf(prefix, lastExtractEnd);
                if (prefixIndex !== -1) {
                    answers.push(fullLine.substring(prefixIndex + prefix.length).trim());
                } else {
                    answers.push('');
                }
                continue;
            }
            
            // 从上次提取结束的位置开始查找prefix
            const prefixIndex = fullLine.indexOf(prefix, lastExtractEnd);
            if (prefixIndex === -1) {
                answers.push('');
                continue;
            }
            
            // 从prefix之后开始查找suffix
            const searchStart = prefixIndex + prefix.length;
            let suffixIndex = fullLine.indexOf(suffix, searchStart);
            
            if (suffixIndex !== -1) {
                // 检查suffix是否以逗号、括号等分隔符开头
                const trimmedSuffix = suffix.trim();
                if (trimmedSuffix.startsWith(',') || trimmedSuffix.startsWith(')') || trimmedSuffix.startsWith(']')) {
                    // 如果是分隔符开头，提取从searchStart到suffix的内容
                    const answer = fullLine.substring(searchStart, suffixIndex).trim();
                    answers.push(answer);
                } else {
                    answers.push(fullLine.substring(searchStart, suffixIndex).trim());
                }
                // 更新下次查找的起始位置
                lastExtractEnd = suffixIndex;
            } else {
                answers.push('');
            }
        }
    }
    
    return answers;
}

function normalizeAnswer(str) {
    return str.replace(/\s+/g, '').toLowerCase();
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 检查 fillInCode 的一行是否与 fullCode 的一行对应（结构相似）
function isCorrespondingLine(fillLine, fullLine) {
    const trimmedFill = fillLine.replace(/\r/g, '').trim();
    const trimmedFull = fullLine.replace(/\r/g, '').trim();
    
    // 都是空行，认为对应
    if (trimmedFill === '' && trimmedFull === '') return true;
    
    // 如果 fillLine 包含下划线，说明这是需要填空的行，一定与 fullLine 对应
    if (trimmedFill.includes('___')) return true;
    
    // 非空且不含下划线的行，必须完全匹配才认为对应
    if (trimmedFill === trimmedFull) return true;
    
    return false;
}

// 代码对比
function showDiff() {
    if (!currentQuestion) return;
    
    const panel = document.getElementById('diffPanel');
    const container = document.getElementById('diffContent');
    
    const fullCode = currentQuestion.fullCode || '';
    const fillCode = currentQuestion.fillInCode || '';
    
    const fullLines = fullCode.split('\n');
    const userLines = buildUserCodeLines();
    
    let html = '';
    
    // 按行号直接对比（fillInCode 和 fullCode 行数相同且一一对应）
    for (let i = 0; i < fullLines.length; i++) {
        const fullLine = fullLines[i].replace(/\r/g, '');
        const userLine = userLines[i] || '';
        
        const normalizedUser = userLine.trim();
        const normalizedFull = fullLine.trim();
        
        // 先比较标准化后的内容（去除首尾空格）
        if (normalizedUser === normalizedFull) {
            html += `<div class="diff-line unchanged">${escapeHtml(fullLine) || '&nbsp;'}</div>`;
        } else {
            // 再进行精确比较（包括空格）
            if (userLine === fullLine) {
                html += `<div class="diff-line unchanged">${escapeHtml(fullLine) || '&nbsp;'}</div>`;
            } else {
                html += `<div class="diff-line removed">- ${escapeHtml(userLine) || '&nbsp;'}</div>`;
                html += `<div class="diff-line added">+ ${escapeHtml(fullLine) || '&nbsp;'}</div>`;
            }
        }
    }
    
    container.innerHTML = html || '<div style="color: var(--code-line-num);">暂无差异</div>';
    panel.classList.add('visible');
}

function hideDiff() {
    const panel = document.getElementById('diffPanel');
    panel.classList.remove('visible');
}

// 构建用户填写的代码
function buildUserCode() {
    return buildUserCodeLines().join('\n');
}

// 构建用户填写的代码（返回数组）
function buildUserCodeLines() {
    if (!currentQuestion) return [];
    
    const fillCode = currentQuestion.fillInCode || '';
    const lines = fillCode.split('\n');
    
    // 收集所有输入框的值，按顺序
    const inputs = document.querySelectorAll('.code-input');
    const inputValues = Array.from(inputs).map(input => input.value);
    
    let inputIdx = 0;
    return lines.map(line => {
        const cleanLine = line.replace(/\r/g, '');
        const fillParts = cleanLine.split(/(_{7,})/);
        let lineResult = '';
        fillParts.forEach(part => {
            if (/_{7,}/.test(part)) {
                lineResult += inputValues[inputIdx] || '___';
                inputIdx++;
            } else {
                lineResult += part;
            }
        });
        return lineResult;
    });
}

// 重置答案
function resetAnswers() {
    const inputs = document.querySelectorAll('.code-input');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('correct', 'incorrect');
    });
    
    hideDiff();
    
    if (currentQuestion) {
        delete userAnswers[currentQuestion.id];
        localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
    }
    
    renderQuestionList();
}

// 保存用户答案
function saveUserAnswers() {
    if (!currentQuestion) return;
    
    const inputs = document.querySelectorAll('.code-input');
    const answers = [];
    
    inputs.forEach(input => {
        if (input.value.trim()) {
            answers.push({
                idx: parseInt(input.dataset.idx),
                value: input.value
            });
        }
    });
    
    if (answers.length > 0) {
        userAnswers[currentQuestion.id] = answers;
    } else {
        // 输入框为空时，清空该题保存的记录
        delete userAnswers[currentQuestion.id];
    }
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
}

// 恢复用户答案
function restoreUserAnswers(questionId) {
    const saved = userAnswers[questionId];
    if (!saved) return;
    
    saved.forEach(answer => {
        const input = document.getElementById(`input_${questionId}_${answer.idx}`);
        if (input) {
            input.value = answer.value;
            autoResizeInput(input);
        }
    });
}

// 保存知识点数据到 localStorage
function saveKnowledgeData() {
    localStorage.setItem('knowledgeData', JSON.stringify(knowledgeData));
    renderKnowledgePanel();
}

// 渲染知识点面板
function renderKnowledgePanel() {
    const container = document.getElementById('knowledgeContent');
    
    let html = '';
    knowledgeData.forEach((module, moduleIdx) => {
        html += `
            <div class="knowledge-module" data-module-idx="${moduleIdx}">
                <h4 onclick="toggleKnowledgeModule(this)">
                    <span>${escapeHtml(module.title)}</span>
                    <span>▼</span>
                </h4>
                <div class="knowledge-categories">
                    ${module.points.map((point, pointIdx) => `
                        <div class="knowledge-category" data-point-idx="${pointIdx}">
                            <div class="category-header">
                                <h5>${escapeHtml(point.category)}</h5>
                                <div class="category-actions">
                                    <button class="btn-icon" onclick="event.stopPropagation(); editCategory(${moduleIdx}, ${pointIdx})" title="编辑标题">✏️</button>
                                    <button class="btn-icon" onclick="event.stopPropagation(); deleteCategory(${moduleIdx}, ${pointIdx})" title="删除标题">🗑️</button>
                                </div>
                            </div>
                            <ul class="knowledge-items">
                                ${point.items.map((item, itemIdx) => `
                                    <li class="knowledge-item" data-item-idx="${itemIdx}">
                                        <div class="item-main">
                                            <code>${escapeHtml(item.code || item)}</code>
                                            ${item.note ? `<span class="item-note-text">${escapeHtml(item.note)}</span>` : ''}
                                        </div>
                                        <div class="item-actions">
                                            <button class="btn-icon" onclick="event.stopPropagation(); editItem(${moduleIdx}, ${pointIdx}, ${itemIdx})" title="编辑代码及备注">✏️</button>
                                            <button class="btn-icon" onclick="event.stopPropagation(); deleteItem(${moduleIdx}, ${pointIdx}, ${itemIdx})" title="删除代码">🗑️</button>
                                        </div>
                                    </li>
                                `).join('')}
                            </ul>
                            <button class="btn-add-item" onclick="event.stopPropagation(); addItem(${moduleIdx}, ${pointIdx})">+ 添加代码</button>
                        </div>
                    `).join('')}
                    <button class="btn-add-category" onclick="event.stopPropagation(); addCategory(${moduleIdx})">+ 添加新分类</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 添加新分类
function addCategory(moduleIdx) {
    editModalMode = 'addCategory';
    currentEditIndices = { moduleIdx };
    document.getElementById('editModalTitle').textContent = '新增分类';
    document.getElementById('editCodeLabel').textContent = '分类标题：';
    document.getElementById('editCode').value = '';
    // 隐藏备注字段
    document.getElementById('editNoteLabel').style.display = 'none';
    document.getElementById('editNote').style.display = 'none';
    document.getElementById('editModal').style.display = 'flex';
}

// 编辑分类标题
function editCategory(moduleIdx, pointIdx) {
    editModalMode = 'editCategory';
    currentEditIndices = { moduleIdx, pointIdx };
    const point = knowledgeData[moduleIdx].points[pointIdx];
    document.getElementById('editModalTitle').textContent = '编辑分类标题';
    document.getElementById('editCodeLabel').textContent = '分类标题：';
    document.getElementById('editCode').value = point.category;
    // 隐藏备注字段
    document.getElementById('editNoteLabel').style.display = 'none';
    document.getElementById('editNote').style.display = 'none';
    document.getElementById('editModal').style.display = 'flex';
}

// 删除分类（二次确认）
function deleteCategory(moduleIdx, pointIdx) {
    const point = knowledgeData[moduleIdx].points[pointIdx];
    const itemCount = point.items.length;
    let confirmMsg = `确定要删除分类"${point.category}"吗？`;
    if (itemCount > 0) {
        confirmMsg += `\n该分类下有 ${itemCount} 个代码项，将一同删除。`;
    }
    if (confirm(confirmMsg)) {
        knowledgeData[moduleIdx].points.splice(pointIdx, 1);
        saveKnowledgeData();
    }
}

// 添加代码项
function addItem(moduleIdx, pointIdx) {
    editModalMode = 'add';
    currentEditIndices = { moduleIdx, pointIdx };
    document.getElementById('editModalTitle').textContent = '新增知识点';
    document.getElementById('editCode').value = '';
    document.getElementById('editNote').value = '';
    document.getElementById('editModal').style.display = 'flex';
}

// 编辑代码项
function editItem(moduleIdx, pointIdx, itemIdx) {
    editModalMode = 'edit';
    currentEditIndices = { moduleIdx, pointIdx, itemIdx };
    const item = knowledgeData[moduleIdx].points[pointIdx].items[itemIdx];
    document.getElementById('editModalTitle').textContent = '编辑知识点';
    document.getElementById('editCode').value = item.code || item || '';
    document.getElementById('editNote').value = item.note || '';
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditIndices = null;
    editModalMode = 'edit';
    // 恢复默认标签文本和显示备注字段
    document.getElementById('editCodeLabel').textContent = '代码：';
    document.getElementById('editNoteLabel').style.display = 'block';
    document.getElementById('editNote').style.display = 'block';
}

function saveEditItem() {
    if (!currentEditIndices) return;
    const newCode = document.getElementById('editCode').value.trim();
    const newNote = document.getElementById('editNote').value.trim();
    
    if (!newCode) {
        closeEditModal();
        return;
    }
    
    // 处理分类标题的保存
    if (editModalMode === 'addCategory') {
        const { moduleIdx } = currentEditIndices;
        knowledgeData[moduleIdx].points.push({
            category: newCode,
            items: []
        });
    } else if (editModalMode === 'editCategory') {
        const { moduleIdx, pointIdx } = currentEditIndices;
        knowledgeData[moduleIdx].points[pointIdx].category = newCode;
    } else if (editModalMode === 'add') {
        // 添加代码项
        const { moduleIdx, pointIdx } = currentEditIndices;
        knowledgeData[moduleIdx].points[pointIdx].items.push({
            code: newCode,
            note: newNote
        });
    } else if (editModalMode === 'edit') {
        // 编辑代码项
        const item = knowledgeData[currentEditIndices.moduleIdx].points[currentEditIndices.pointIdx].items[currentEditIndices.itemIdx];
        item.code = newCode;
        item.note = newNote;
    }
    
    saveKnowledgeData();
    closeEditModal();
}

// 删除代码项（二次确认）
function deleteItem(moduleIdx, pointIdx, itemIdx) {
    const item = knowledgeData[moduleIdx].points[pointIdx].items[itemIdx];
    if (confirm(`确定要删除代码项吗？\n代码：${item.code || item}\n备注：${item.note || '无'}`)) {
        knowledgeData[moduleIdx].points[pointIdx].items.splice(itemIdx, 1);
        saveKnowledgeData();
    }
}

function toggleKnowledgeModule(element) {
    const categories = element.nextElementSibling;
    if (categories) {
        categories.style.display = categories.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleDescriptionPanel(element) {
    const panel = element.closest('.description-panel');
    if (panel) {
        panel.classList.toggle('collapsed');
    }
}

function toggleLeftPanel() {
    const panel = document.getElementById('leftPanel');
    panel.classList.toggle('collapsed');
    
    const btn = document.getElementById('leftPanelToggle');
    btn.textContent = panel.classList.contains('collapsed') ? '▶' : '◀';
}

function toggleRightPanel() {
    const panel = document.getElementById('rightPanel');
    panel.classList.toggle('hidden');
    
    const btn = document.getElementById('rightPanelToggle');
    btn.textContent = panel.classList.contains('hidden') ? '◀' : '▶';
}

function updateProgress() {
    const total = questionsData.length;
    const completed = Object.keys(userAnswers).length;
    const percentage = total > 0 ? (completed / total * 100) : 0;
    
    document.getElementById('progressFill').style.width = percentage + '%';
}

function getQuestionStatus(questionId) {
    // 如果当前轮次已完成，返回 completed
    if (practiceStats.currentRound[questionId]) {
        return 'completed';
    }
    // 否则返回旧的填写状态
    const answers = userAnswers[questionId];
    if (!answers) return '';
    if (answers.length > 0) return 'in-progress';
    return '';
}

// 保存刷题统计到 localStorage
function savePracticeStats() {
    localStorage.setItem('practiceStats', JSON.stringify(practiceStats));
}

// 获取当前轮次完成数量
function getRoundProgress() {
    return Object.keys(practiceStats.currentRound).filter(id => practiceStats.currentRound[id]).length;
}

// 检查是否20题全部完成
function checkRoundComplete() {
    const completedCount = getRoundProgress();
    const totalQuestions = questionsData.length;
    
    if (completedCount >= totalQuestions && totalQuestions > 0) {
        // 20题全部完成
        practiceStats.totalRounds++;
        savePracticeStats();
        
        setTimeout(() => {
            if (confirm(`🎉 恭喜！第 ${practiceStats.totalRounds} 轮刷题完成！\n\n20道题已全部正确完成。\n\n是否开始新一轮练习？`)) {
                startNewRound();
            }
        }, 300);
    }
}

// 开始新一轮练习
function startNewRound() {
    // 重置当前轮次进度
    practiceStats.currentRound = {};
    savePracticeStats();
    
    // 清除所有用户答案
    userAnswers = {};
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
    
    // 清除所有输入框状态
    document.querySelectorAll('.code-input').forEach(input => {
        input.value = '';
        input.classList.remove('correct', 'incorrect');
        input.style.width = 'auto';
    });
    
    renderQuestionList();
    renderPracticeStats();
    
    alert('已重置进度，开始新一轮练习！');
}

// 渲染刷题统计
function renderPracticeStats() {
    const container = document.getElementById('practiceStats');
    if (!container) return;
    
    const totalQuestions = questionsData.length;
    const completedCount = getRoundProgress();
    const percentage = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;
    
    container.innerHTML = `\n        <div class=\"stats-header\">\n            <span class=\"stats-rounds\">🏆 已完成 ${practiceStats.totalRounds} 轮</span>\n            <span class=\"stats-progress\">${completedCount}/${totalQuestions} (${percentage}%)</span>\n        </div>\n        <div class=\"stats-bar\">\n            <div class=\"stats-fill\" style=\"width: ${percentage}%\"></div>\n        </div>\n    `;
}

// 自动调整输入框宽度
function autoResizeInput(input) {
    const measureSpan = document.getElementById('textMeasure');
    if (!measureSpan) return;
    
    if (input.value) {
        measureSpan.textContent = input.value;
        const width = measureSpan.offsetWidth;
        // 最小宽度 80px，加上 20px 的 padding，确保输入框不会太窄
        input.style.width = Math.max(width + 20, 80) + 'px';
    } else {
        // 输入为空时，恢复默认宽度
        input.style.width = 'auto';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 初始化拖动分隔线
function initResizer() {
    const resizer = document.getElementById('panelResizer');
    const descriptionPanel = document.getElementById('descriptionPanel');
    const leftPanel = document.querySelector('.left-panel');
    
    if (!resizer || !descriptionPanel || !leftPanel) return;
    
    // 恢复保存的高度
    const savedHeight = localStorage.getItem('descriptionPanelHeight');
    if (savedHeight) {
        descriptionPanel.style.height = savedHeight + 'px';
    } else {
        // 默认高度
        descriptionPanel.style.height = '400px';
    }
    
    let isResizing = false;
    
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizer.classList.add('active');
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const leftRect = leftPanel.getBoundingClientRect();
        const descriptionHeight = leftRect.bottom - e.clientY;
        
        // 限制最小和最大高度
        const minHeight = 150;
        const maxHeight = leftRect.height * 0.7;
        
        if (descriptionHeight >= minHeight && descriptionHeight <= maxHeight) {
            descriptionPanel.style.height = descriptionHeight + 'px';
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('active');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            // 保存高度
            const height = parseInt(descriptionPanel.style.height);
            localStorage.setItem('descriptionPanelHeight', height);
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
