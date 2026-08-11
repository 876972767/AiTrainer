const http = require('http');
const fs = require('fs');
const path = require('path');

// 配置
let PORT = parseInt(process.argv[2]) || 8080; // 支持命令行参数设置端口，默认8080
const DIRECTORY = __dirname; // 当前目录

// MIME 类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
    // 解析请求的文件路径
    let filePath = path.join(DIRECTORY, req.url === '/' ? 'index.html' : req.url);
    
    // 获取文件扩展名
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // 读取文件
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件不存在
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                // 其他错误
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // 成功读取文件
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// 启动服务器
function startServer(port) {
    server.listen(port, () => {
        console.log(`✅ 服务器已启动`);
        console.log(`   访问地址: http://localhost:${port}`);
        console.log(`   项目目录: ${DIRECTORY}`);
        console.log(`\n按 Ctrl+C 停止服务器\n`);
    });
}

// 处理错误 - 如果端口被占用，自动尝试下一个端口
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  端口 ${PORT} 已被占用，尝试端口 ${PORT + 1}...`);
        PORT++;
        startServer(PORT);
    } else {
        console.error(`❌ 服务器错误: ${err.message}`);
        process.exit(1);
    }
});

// 开始启动
startServer(PORT);
