// 用户认证相关功能

// 模拟用户数据
const ADMIN_USER = {
    username: 'admin',
    password: localStorage.getItem('adminPassword') || 'admin123'
};

// 检查登录状态
function checkLoginStatus() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// 显示登录表单
function showLoginForm() {
    const loginContainer = document.getElementById('loginContainer');
    if (loginContainer) {
        loginContainer.style.display = 'flex';
    }
}

// 隐藏登录表单
function hideLoginForm() {
    const loginContainer = document.getElementById('loginContainer');
    if (loginContainer) {
        loginContainer.style.display = 'none';
    }
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const isValid = await window.dbService.verifyUser(username, password);
        if (isValid) {
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'admin.html';
        } else {
            alert('用户名或密码错误');
        }
    } catch (error) {
        console.error('登录验证失败:', error);
        alert('登录验证失败，请稍后重试');
    }
}

// 处理登出
function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// 使用模块导出方式
const auth = {
    checkLoginStatus,
    showLoginForm,
    hideLoginForm,
    handleLogin,
    logout
};

// 导出到全局作用域
window.auth = auth;

// 页面加载完成后初始化登录按钮事件
document.addEventListener('DOMContentLoaded', function() {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', showLoginForm);
    }

    // 绑定登录表单提交事件
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});