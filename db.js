// 数据服务层

class DataService {
    constructor() {
        // 根据当前环境动态设置API基础路径
        this.apiBaseUrl = process.env.NODE_ENV === 'production' ? process.env.API_BASE_URL || 'https://api.yourdomain.com' : window.location.origin + '/api';
        this.isAuthenticated = false;
    }

    // 用户认证相关操作
    async verifyUser(username, password) {
        try {
            console.log('正在验证用户:', username);
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('登录失败:', errorData.message);
                throw new Error(errorData.message || '登录失败');
            }

            const data = await response.json();
            this.isAuthenticated = true;
            console.log('登录成功');
            return true;
        } catch (error) {
            console.error('验证错误:', error.message);
            this.isAuthenticated = false;
            throw error;
        }
    }

    async updatePassword(username, newPassword) {
        try {
            if (!this.isAuthenticated) {
                throw new Error('用户未登录');
            }

            const response = await fetch(`${this.apiBaseUrl}/auth/update-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, newPassword })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '密码更新失败');
            }

            console.log('密码更新成功');
            return true;
        } catch (error) {
            console.error('密码更新错误:', error.message);
            throw error;
        }
    }

    // Logo相关操作
    async saveLogo(logoData, logoType) {
        localStorage.setItem('logo', JSON.stringify({
            data: logoData,
            type: logoType,
            updateTime: new Date().toISOString()
        }));
    }

    async getLogo() {
        const logoData = localStorage.getItem('logo');
        return logoData ? JSON.parse(logoData) : null;
    }

    // 主题设置相关操作
    async saveTheme(theme) {
        localStorage.setItem('theme', JSON.stringify({
            value: theme,
            updateTime: new Date().toISOString()
        }));
    }

    async getTheme() {
        const themeData = localStorage.getItem('theme');
        return themeData ? JSON.parse(themeData).value : null;
    }
}

class MongoDBService {
    constructor() {
        // 根据当前环境动态设置API基础路径
        this.apiBaseUrl = process.env.NODE_ENV === 'production' ? process.env.API_BASE_URL || 'https://api.yourdomain.com' : window.location.origin + '/api';
        this.isAuthenticated = false;
        // MongoDB连接配置
        this.mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
        this.dbName = process.env.MONGODB_DB || 'default_db';
    }

    // 测试MongoDB连接
    async testConnection() {
        try {
            console.log('正在测试MongoDB连接...');
            const response = await fetch(`${this.apiBaseUrl}/db/test-connection`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mongoUrl: this.mongoUrl,
                    dbName: this.dbName
                })
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('连接测试API端点不存在，请检查服务器是否运行正常');
                } else if (response.status >= 500) {
                    throw new Error('服务器内部错误，请稍后再试');
                }
                const errorData = await response.json();
                throw new Error(errorData.message || '数据库连接测试失败');
            }

            const result = await response.json();
            console.log('MongoDB连接测试成功！');
            console.log('数据库信息:', {
                url: this.mongoUrl,
                database: this.dbName,
                status: '已连接',
                ...result
            });
            return result;
        } catch (error) {
            console.error('MongoDB连接测试失败:', error.message);
            throw new Error(`MongoDB连接测试失败: ${error.message}`);
        }
    }

    // 分类管理相关操作
    async saveCategory(categoryData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });

            if (!response.ok) {
                throw new Error('保存分类失败');
            }

            return await response.json();
        } catch (error) {
            console.error('保存分类错误:', error.message);
            throw error;
        }
    }

    async getCategories() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/categories`);
            if (!response.ok) {
                throw new Error('获取分类列表失败');
            }
            return await response.json();
        } catch (error) {
            console.error('获取分类列表错误:', error.message);
            throw error;
        }
    }

    // 网站管理相关操作
    async saveSite(siteData) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/sites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(siteData)
            });

            if (!response.ok) {
                throw new Error('保存网站失败');
            }

            return await response.json();
        } catch (error) {
            console.error('保存网站错误:', error.message);
            throw error;
        }
    }

    async getSites() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/sites`);
            if (!response.ok) {
                throw new Error('获取网站列表失败');
            }
            return await response.json();
        } catch (error) {
            console.error('获取网站列表错误:', error.message);
            throw error;
        }
    }

    async verifyUser(username, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('登录API端点不存在，请检查服务器是否运行正常');
                } else if (response.status === 401) {
                    throw new Error('用户名或密码错误');
                } else if (response.status >= 500) {
                    throw new Error('服务器内部错误，请稍后再试');
                }
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '登录失败');
                } catch (e) {
                    throw new Error('服务器返回了无效的响应');
                }
            }

            this.isAuthenticated = true;
            return true;
        } catch (error) {
            this.isAuthenticated = false;
            throw error;
        }
    }
}

// 创建单例实例
const dataService = new DataService();
const mongoDBService = new MongoDBService();

// 导出数据服务实例
window.dataService = dataService;
window.MongoDBService = MongoDBService;