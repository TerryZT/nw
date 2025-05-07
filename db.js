// MongoDB数据服务层

class MongoDBService {
    constructor() {
        this.mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
        this.dbName = process.env.MONGODB_DB || 'nw_admin';
        this.client = null;
        this.db = null;
    }

    // 连接数据库
    async connect() {
        if (!this.client) {
            try {
                if (!process.env.MONGODB_URL || !process.env.MONGODB_DB) {
                    throw new Error('MongoDB环境变量未正确配置');
                }
                const { MongoClient } = require('mongodb');
                console.log('正在连接MongoDB:', this.mongoUrl);
                this.client = await MongoClient.connect(this.mongoUrl);
                this.db = this.client.db(this.dbName);
                console.log('MongoDB连接成功，数据库:', this.dbName);
            } catch (error) {
                console.error('MongoDB连接错误:', error.message);
                console.error('环境变量状态:', {
                    MONGODB_URL: process.env.MONGODB_URL ? '已设置' : '未设置',
                    MONGODB_DB: process.env.MONGODB_DB ? '已设置' : '未设置'
                });
                throw error;
            }
        }
        return this.db;
    }

    // 关闭连接
    async close() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
        }
    }

    // 用户认证相关操作
    async verifyUser(username, password) {
        try {
            console.log('正在验证用户:', username);
            const db = await this.connect();
            const user = await db.collection('users').findOne({ username });
            if (!user) {
                console.log('用户不存在:', username);
                return false;
            }
            const isValid = user.password === password;
            console.log('密码验证结果:', isValid ? '成功' : '失败');
            return isValid;
        } catch (error) {
            console.error('用户验证错误:', error.message);
            throw error;
        }
    }

    async updatePassword(username, newPassword) {
        const db = await this.connect();
        await db.collection('users').updateOne(
            { username },
            { $set: { password: newPassword } }
        );
    }

    // Logo相关操作
    async saveLogo(logoData, logoType) {
        const db = await this.connect();
        await db.collection('settings').updateOne(
            { type: 'logo' },
            { 
                $set: { 
                    data: logoData,
                    type: logoType,
                    updateTime: new Date()
                }
            },
            { upsert: true }
        );
    }

    async getLogo() {
        const db = await this.connect();
        return await db.collection('settings').findOne({ type: 'logo' });
    }

    // 主题设置相关操作
    async saveTheme(theme) {
        const db = await this.connect();
        await db.collection('settings').updateOne(
            { type: 'theme' },
            { 
                $set: { 
                    value: theme,
                    updateTime: new Date()
                }
            },
            { upsert: true }
        );
    }

    async getTheme() {
        const db = await this.connect();
        const theme = await db.collection('settings').findOne({ type: 'theme' });
        return theme ? theme.value : null;
    }
}

// 创建单例实例
const dbService = new MongoDBService();

// 导出数据服务实例
window.dbService = dbService;