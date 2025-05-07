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
                const { MongoClient } = require('mongodb');
                this.client = await MongoClient.connect(this.mongoUrl);
                this.db = this.client.db(this.dbName);
                console.log('MongoDB connected successfully');
            } catch (error) {
                console.error('MongoDB connection error:', error);
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
        const db = await this.connect();
        const user = await db.collection('users').findOne({ username });
        return user && user.password === password;
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