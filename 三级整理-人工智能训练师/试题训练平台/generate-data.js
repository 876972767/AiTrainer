const fs = require('fs');
const path = require('path');

// 读取 questions.json
const questionsPath = path.join(__dirname, 'data', 'questions.json');
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

// 读取 knowledge.json
const knowledgePath = path.join(__dirname, 'data', 'knowledge.json');
const knowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'));

// 生成内联数据文件
let output = '// 自动生成的数据文件，请勿手动修改\n';
output += '// 由 generate-data.js 脚本生成\n\n';
output += '// 试题数据\n';
output += `const questionsDataSource = ${JSON.stringify(questions, null, 2)};\n\n`;
output += '// 知识点数据\n';
output += `const knowledgeDataSource = ${JSON.stringify(knowledge, null, 2)};\n`;

// 写入 js/data.js
const dataJsPath = path.join(__dirname, 'js', 'data.js');
fs.writeFileSync(dataJsPath, output, 'utf-8');

console.log(`已生成 ${dataJsPath}`);
console.log(`  - 试题数量: ${questions.length}`);
console.log(`  - 知识点模块数: ${knowledge.length}`);
