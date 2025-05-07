// 密码修改相关功能

// 显示修改密码表单
function showPasswordForm() {
    const passwordContainer = document.getElementById('passwordContainer');
    if (passwordContainer) {
        passwordContainer.style.display = 'flex';
    }
}

// 隐藏修改密码表单
function hidePasswordForm() {
    const passwordContainer = document.getElementById('passwordContainer');
    if (passwordContainer) {
        passwordContainer.style.display = 'none';
    }
}

// 处理密码修改
async function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    try {
        // 验证当前密码
        const isValid = await window.dbService.verifyUser('admin', currentPassword);
        if (!isValid) {
            alert('当前密码错误');
            return;
        }

        // 验证新密码
        if (newPassword !== confirmPassword) {
            alert('新密码与确认密码不匹配');
            return;
        }

        // 更新密码
        await window.dbService.updatePassword('admin', newPassword);
        alert('密码修改成功');
        hidePasswordForm();
    } catch (error) {
        console.error('密码修改失败:', error);
        alert('密码修改失败，请稍后重试');
    }
}

// 导出到全局作用域
window.showPasswordForm = showPasswordForm;
window.hidePasswordForm = hidePasswordForm;
window.handlePasswordChange = handlePasswordChange;