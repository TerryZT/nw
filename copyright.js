// 保存版权信息设置
function saveCopyrightSettings() {
    const copyrightText = document.getElementById('copyrightText').value;
    const copyrightLink = document.getElementById('copyrightLink').value;

    // 保存到localStorage
    localStorage.setItem('copyrightText', copyrightText);
    localStorage.setItem('copyrightLink', copyrightLink);

    alert('版权信息设置已保存');
}

// 加载版权信息
function loadCopyrightInfo() {
    const footerText = document.querySelector('.site-footer p');
    if (!footerText) return;

    const savedText = localStorage.getItem('copyrightText');
    const savedLink = localStorage.getItem('copyrightLink');

    if (savedText) {
        const linkStart = savedText.indexOf('由');
        if (linkStart !== -1) {
            const beforeLink = savedText.substring(0, linkStart + 1);
            const afterLink = savedText.substring(linkStart + 1);
            const developerName = afterLink.split(' ')[0];
            
            footerText.innerHTML = `${beforeLink} <a href="${savedLink || 'https://github.com/yourusername'}" target="_blank">${developerName}</a> 开发和维护`;
        } else {
            footerText.textContent = savedText;
        }
    }
}

// 在页面加载时初始化版权信息
document.addEventListener('DOMContentLoaded', function() {
    // 如果在管理页面，加载保存的设置到输入框
    const copyrightTextInput = document.getElementById('copyrightText');
    const copyrightLinkInput = document.getElementById('copyrightLink');
    
    if (copyrightTextInput && copyrightLinkInput) {
        const savedText = localStorage.getItem('copyrightText');
        const savedLink = localStorage.getItem('copyrightLink');
        
        if (savedText) copyrightTextInput.value = savedText;
        if (savedLink) copyrightLinkInput.value = savedLink;
    }

    // 加载页脚版权信息
    loadCopyrightInfo();
});