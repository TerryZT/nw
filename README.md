# NW Admin System

一个基于MongoDB的现代化管理系统，提供用户认证、Logo管理和主题设置等功能。

## 功能特点

- 🔐 用户认证：支持管理员账户登录和密码管理
- 🎨 主题设置：可自定义系统主题样式
- 📝 Logo管理：支持上传和管理系统Logo
- 💾 MongoDB支持：使用MongoDB进行数据持久化
- 🔄 实时更新：所有设置更改实时生效

## 技术栈

- Node.js
- Express
- MongoDB
- HTML5/CSS3
- JavaScript (ES6+)

## 环境要求

- Node.js >= 14.0.0
- MongoDB >= 5.0.0
- npm >= 6.0.0

## 快速开始

1. 克隆项目到本地：
```bash
git clone [项目地址]
cd nw-admin
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
创建 `.env` 文件并设置以下配置：
```env
# MongoDB配置
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB=nw_admin

# 初始管理员账户设置
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

4. 启动服务：
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

5. 访问系统：
```
http://localhost:3000
```

## API 说明

### 用户认证
- 验证用户登录
- 更新用户密码

### Logo管理
- 上传系统Logo
- 获取当前Logo

### 主题设置
- 保存主题配置
- 获取当题设置

## 开发说明

项目使用 Express 框架构建，主要文件结构：
- `server.js`: 服务器入口文件
- `db.js`: MongoDB数据库服务
- `admin.js`: 管理功能实现
- `auth.js`: 用户认证相关

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

本项目采用 MIT 许可证。