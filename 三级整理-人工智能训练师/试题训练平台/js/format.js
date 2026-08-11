// 格式化填空代码，添加适当的换行
function formatFillCode(code) {
    if (!code) return code;
    
    let formatted = code;
    
    // 1. 在 import 语句之间添加换行
    formatted = formatted.replace(/(import [^#]+?)(?=import\s+\w+\s+as)/g, '$1\n');
    
    // 2. 在注释前添加换行（但避免在字符串内）
    formatted = formatted.replace(/([^\n])(#[^"]*)/g, '$1\n$2');
    
    // 3. 在 print 语句前添加换行
    formatted = formatted.replace(/([^\n])(print\()/g, '$1\n$2');
    
    // 4. 在常见的语句分隔处添加换行
    // 处理 data = ... 后面跟着另一个语句的情况
    formatted = formatted.replace(/(data\[[^\]]+\]\s*=)([^\n])/g, '$1\n$2');
    
    // 5. 清理多余的换行
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    return formatted;
}

// 更智能的格式化：基于模式匹配
function smartFormatFillCode(code) {
    if (!code) return code;
    
    let result = code;
    
    // 在 import 语句之间添加换行
    result = result.replace(/(import\s+\w+(?:\s+as\s+\w+)?)(?=import)/g, '$1\n');
    
    // 在赋值语句和后续语句之间添加换行
    // 匹配模式：变量 = 值 + 下一个语句
    const patterns = [
        // import 后面跟 # 注释
        { regex: /(import\s+.+?)(?=# )/g, replace: '$1\n' },
        // 在 = 后面跟着另一个赋值或语句
        { regex: /([a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^=;]+?)(?=[a-zA-Z_][a-zA-Z0-9_]*\s*=)/g, replace: '$1\n' },
        // print 前
        { regex: /([^\n])(print\s*\()/g, replace: '$1\n$2' },
        // 注释前
        { regex: /([^\n])(#[^"]*)/g, replace: '$1\n$2' },
    ];
    
    patterns.forEach(p => {
        result = result.replace(p.regex, p.replace);
    });
    
    return result;
}

// 基于完整代码对齐填空代码
function alignFillCodeWithFull(fillCode, fullCode) {
    if (!fillCode || !fullCode) return fillCode;
    
    const fillLines = fillCode.split('\n');
    // 如果填空代码已经有换行了，不需要处理
    if (fillLines.length > 1) return fillCode;
    
    // 使用完整代码的结构来格式化填空代码
    const fullLines = fullCode.split('\n');
    let fillIndex = 0;
    const result = [];
    
    for (const fullLine of fullLines) {
        const trimmedFull = fullLine.trim();
        if (!trimmedFull) {
            result.push('');
            continue;
        }
        
        // 尝试在填空代码中找到对应的行
        // 提取完整代码行的前几个字符（去除变量值）
        const prefix = trimmedFull.split('=')[0].trim();
        if (prefix && fillCode.substring(fillIndex).includes(prefix)) {
            const idx = fillCode.indexOf(prefix, fillIndex);
            if (idx > fillIndex) {
                // 添加之前的部分
                const before = fillCode.substring(fillIndex, idx).trim();
                if (before) result.push(before);
            }
            
            // 找到行的结束位置
            const nextBreak = findNextBreak(fillCode, idx + prefix.length);
            const line = fillCode.substring(idx, nextBreak).trim();
            if (line) result.push(line);
            
            fillIndex = nextBreak;
        }
    }
    
    // 添加剩余部分
    if (fillIndex < fillCode.length) {
        const remaining = fillCode.substring(fillIndex).trim();
        if (remaining) result.push(remaining);
    }
    
    return result.length > 1 ? result.join('\n') : fillCode;
}

function findNextBreak(code, start) {
    // 找到下一个合理的断行位置
    const nextImport = code.indexOf('import ', start + 1);
    const nextHash = code.indexOf('# ', start + 1);
    const nextPrint = code.indexOf('print(', start + 1);
    const nextAssign = code.indexOf('=', start + 1);
    
    let min = code.length;
    [nextImport, nextHash, nextPrint, nextAssign].forEach(pos => {
        if (pos > start && pos < min) min = pos;
    });
    
    return min;
}

module.exports = { formatFillCode, smartFormatFillCode, alignFillCodeWithFull };
