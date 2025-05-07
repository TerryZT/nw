const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// 登录路由
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // 简单验证逻辑
    if (username === 'admin' && password === 'admin123') {
        return res.json({ 
            success: true,
            message: '登录成功'
        });
    }
    
    res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误'
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});