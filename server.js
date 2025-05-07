const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});