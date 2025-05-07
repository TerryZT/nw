// 导入auth.js中的登录相关函数
// 通过window.auth安全调用，避免解构导致的TypeError

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查window.auth是否存在
    if (!window.auth || typeof window.auth.checkLoginStatus !== 'function') {
        window.location.href = 'index.html';
        return;
    }
    // 检查登录状态
    if (!window.auth.checkLoginStatus()) {
        window.location.href = 'index.html';
        return;
    }

    // 已登录，隐藏登录界面并显示管理界面
    const loginContainer = document.getElementById('loginContainer');
    const adminContent = document.querySelector('.admin-content');
    const adminHeader = document.querySelector('.admin-header');
    
    // 确保登录界面被隐藏
    if (loginContainer) {
        loginContainer.style.display = 'none';
    }

    // 显示管理界面
    if (adminContent && adminHeader) {
        adminContent.style.display = 'block';
        adminHeader.style.display = 'flex';
        
        // 绑定退出登录按钮事件
        const logoutBtns = document.querySelectorAll('.back-btn');
        logoutBtns.forEach(btn => {
            if (btn.textContent.includes('退出登录')) {
                btn.addEventListener('click', function() {
                    if (window.auth && typeof window.auth.logout === 'function') {
                        window.auth.logout();
                    }
                });
            }
        });

        // 初始化各个功能模块
        initThemeSettings();
        initUnifiedManager();
        initSearchSettings(); // Make sure this function is defined
        // initDragAndDrop(); // Make sure this function is defined if uncommented
    }
});

// 主题设置初始化和管理
function initThemeSettings() {
    const previewBtns = document.querySelectorAll('.preview-btn');
    const savedTheme = localStorage.getItem('theme');

    // 设置当前主题
    if (savedTheme) {
        document.body.className = savedTheme;
        highlightCurrentTheme(savedTheme);
    }

    // 主题预览和切换
    previewBtns.forEach(btn => {
        btn.addEventListener('click', handleThemeChange);
    });
}

// 处理主题切换
async function handleThemeChange(event) {
    const theme = event.target.dataset.theme;
    if (theme) {
        try {
            document.body.className = theme;
            await window.dbService.saveTheme(theme);
            highlightCurrentTheme(theme);
        } catch (error) {
            console.error('主题保存失败:', error);
            alert('主题设置保存失败，请稍后重试');
        }
    }
}

// 高亮当前使用的主题
function highlightCurrentTheme(currentTheme) {
    const previewBtns = document.querySelectorAll('.preview-btn');
    previewBtns.forEach(btn => {
        if (btn.dataset.theme === currentTheme) {
            btn.classList.add('active');
            btn.textContent = '当前使用';
        } else {
            btn.classList.remove('active');
            btn.textContent = '预览';
        }
    });
}

// Logo管理功能
async function saveLogo() {
    const logoUrl = document.getElementById('logoUrl').value;
    const logoFile = document.getElementById('logoFile').files[0];
    const currentLogo = document.getElementById('currentLogo');

    try {
        if (logoFile) {
            // 处理文件上传
            const reader = new FileReader();
            reader.onload = async function(e) {
                const logoData = e.target.result;
                try {
                    // 保存到MongoDB
                    await window.dbService.saveLogo(logoData, logoFile.type);
                    
                    // 更新预览
                    currentLogo.src = logoData;
                    // 触发自定义事件通知Logo更新
                    window.dispatchEvent(new CustomEvent('logoUpdated'));
                    alert('Logo已更新并保存');
                } catch (error) {
                    console.error('Logo保存失败:', error);
                    alert('Logo保存失败，请稍后重试');
                }
            };
            reader.readAsDataURL(logoFile);
        } else if (logoUrl) {
            // 处理URL输入
            const fileExtension = logoUrl.split('.').pop().toLowerCase();
            const validExtensions = ['svg', 'png', 'jpg', 'jpeg'];
            
            if (validExtensions.includes(fileExtension)) {
                // 保存到MongoDB
                await window.dbService.saveLogo(logoUrl, 'url');
                
                // 更新预览
                currentLogo.src = logoUrl;
                // 触发自定义事件通知Logo更新
                window.dispatchEvent(new CustomEvent('logoUpdated'));
                alert('Logo已更新并保存');
            } else {
                alert('请提供有效的图片URL（支持SVG、PNG、JPG格式）');
            }
        } else {
            alert('请选择图片文件或输入URL');
        }
    } catch (error) {
        console.error('Logo保存失败:', error);
        alert('Logo保存失败，请稍后重试');
    }
}

// 监听文件选择变化
document.getElementById('logoFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg'];
        if (validTypes.includes(file.type)) {
            document.getElementById('logoUrl').value = '';
            // 预览选择的文件
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('currentLogo').src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            alert('请选择有效的图片文件（支持SVG、PNG、JPG格式）');
            this.value = '';
        }
    }
});

// 监听URL输入变化
document.getElementById('logoUrl').addEventListener('input', function() {
    const url = this.value;
    if (url) {
        const fileExtension = url.split('.').pop().toLowerCase();
        const validExtensions = ['svg', 'png', 'jpg', 'jpeg'];
        if (validExtensions.includes(fileExtension)) {
            document.getElementById('logoFile').value = '';
            document.getElementById('currentLogo').src = url;
        }
    }
});

// 页面加载时恢复保存的Logo
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const savedLogo = await window.dbService.getLogo();
        if (savedLogo) {
            const currentLogo = document.getElementById('currentLogo');
            currentLogo.src = savedLogo.data;
            
            if (savedLogo.type === 'url') {
                document.getElementById('logoUrl').value = savedLogo.data;
            }
        }
    } catch (error) {
        console.error('加载Logo失败:', error);
    }
});

// SVG文件上传处理
function handleSvgUpload(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const svgContent = e.target.result;
        document.getElementById('siteIcon').value = svgContent;
        document.getElementById('previewSvg').src = svgContent;
        document.getElementById('iconPreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// 移除SVG预览
function removeIconPreview() {
    document.getElementById('siteIcon').value = '';
    document.getElementById('previewSvg').src = '';
    document.getElementById('iconPreview').style.display = 'none';
}

// 统一的分类和网站管理初始化
function initUnifiedManager() {
    const categoryList = document.querySelector('.category-list');
    const sitesContainer = document.querySelector('.sites-container');
    const addCategoryBtn = document.querySelector('.add-category-btn');
    const addSiteBtn = document.querySelector('.add-site-btn');
    const siteSearch = document.getElementById('siteSearch');
    const iconFileInput = document.getElementById('iconFile');
    
    // 初始化SVG文件上传
    if (iconFileInput) {
        iconFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type === 'image/svg+xml') {
                handleSvgUpload(file);
            } else {
                alert('请选择SVG格式的文件');
            }
        });
    }

    // 默认分类（空数组）
    const defaultCategories = [];

    // 加载分类数据（清空所有分类）
    let categories = [];
    localStorage.setItem('categoryOrder', JSON.stringify(categories));

    // 清空所有网站数据
    let sites = [];
    localStorage.setItem('sites', JSON.stringify(sites));

    // 触发数据更新事件
    function dispatchDataUpdateEvent() {
        // 触发分类更新事件
        window.dispatchEvent(new CustomEvent('categoriesUpdated'));
        // 触发网站更新事件
        window.dispatchEvent(new CustomEvent('websitesUpdated'));
        // 触发localStorage事件以同步其他标签页
        localStorage.setItem('categoryOrder', localStorage.getItem('categoryOrder'));
        localStorage.setItem('sites', localStorage.getItem('sites'));
    }

    // 保存分类顺序并同步数据
    function saveCategoryOrder() {
        localStorage.setItem('categoryOrder', JSON.stringify(categories));
        dispatchDataUpdateEvent();
    }

    // 保存网站数据并同步
    function saveSites() {
        localStorage.setItem('sites', JSON.stringify(sites));
        dispatchDataUpdateEvent();
    }

    // 创建网站卡片
    function createSiteCard(site, index) {
        const card = document.createElement('div');
        card.className = 'site-card';
        card.dataset.index = index;
        card.innerHTML = `
            <img src="${site.icon || 'default-icon.svg'}" alt="${site.title}" class="site-icon">
            <div class="site-info">
                <h4>${site.title}</h4>
                <p>${site.description || '暂无描述'}</p>
                <a href="${site.url}" target="_blank">${site.url}</a>
            </div>
            <div class="site-actions">
                <button class="edit-site-btn">编辑</button>
                <button class="delete-site-btn">删除</button>
            </div>
        `;
        return card;
    }

    // 更新分类选择框
    function updateCategorySelect() {
        const categorySelect = document.getElementById('siteCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">请选择分类</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }
    }

    // 初始化界面
    function initializeUI() {
        // 清空现有内容
        categoryList.innerHTML = '';
        sitesContainer.innerHTML = '';
        
        // 更新分类选择框
        updateCategorySelect();

        // 渲染分类列表
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.draggable = true;
            categoryItem.innerHTML = `
                <span>${category}</span>
                <div class="category-actions">
                    <button class="edit-btn">编辑</button>
                    <button class="delete-btn">删除</button>
                </div>
            `;
            categoryList.appendChild(categoryItem);

            // 创建对应的网站容器
            const categorySection = document.createElement('div');
            categorySection.className = 'category-sites';
            categorySection.innerHTML = `
                <h4>${category}</h4>
                <div class="site-list" data-category="${category}"></div>
            `;
            sitesContainer.appendChild(categorySection);

            // 渲染该分类下的网站
            const siteList = categorySection.querySelector('.site-list');
            sites.forEach((site, index) => { // Iterate over the main 'sites' array
                if (site.category === category) {
                    // Pass the original index from the main 'sites' array
                    const siteCard = createSiteCard(site, index);
                    siteList.appendChild(siteCard);
                }
            });
        });

        // 初始化拖拽排序
        initDragAndDrop();

        // No need to dispatch update event here, it's called after modifications
        // dispatchDataUpdateEvent();
    }

    // 初始化拖拽排序功能
    function initDragAndDrop() {
        let draggedItem = null;
        let draggedIndex = -1;

        // 为每个分类项添加拖拽事件监听
        const categoryItems = categoryList.querySelectorAll('.category-item');
        categoryItems.forEach((item, index) => {
            // 开始拖拽
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                draggedIndex = index;
                e.dataTransfer.effectAllowed = 'move';
                item.classList.add('dragging');
            });

            // 拖拽结束
            item.addEventListener('dragend', () => {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
                draggedIndex = -1;
            });

            // 拖拽经过其他元素
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (draggedItem && draggedItem !== item) {
                    const itemRect = item.getBoundingClientRect();
                    const dragY = e.clientY;
                    const dropIndex = Array.from(categoryList.children).indexOf(item);
                    
                    if (dragY < itemRect.top + itemRect.height / 2) {
                        categoryList.insertBefore(draggedItem, item);
                    } else {
                        categoryList.insertBefore(draggedItem, item.nextSibling);
                    }

                    // 更新分类顺序
                    const newCategories = Array.from(categoryList.querySelectorAll('.category-item'))
                        .map(item => item.querySelector('span').textContent);
                    categories = newCategories;
                    saveCategoryOrder();
                }
            });

            // 放置
            item.addEventListener('drop', (e) => {
                e.preventDefault();
            });
        });
    }

    // 初始化界面
    initializeUI();

    // 分类管理事件
    if (categoryList && addCategoryBtn) {
        // 添加新分类
        addCategoryBtn.addEventListener('click', () => {
            const categoryName = prompt('请输入新分类名称：');
            if (categoryName && !categories.includes(categoryName)) {
                categories.push(categoryName);
                saveCategoryOrder();
                initializeUI();
            } else if (categories.includes(categoryName)) {
                alert('该分类已存在！');
            }
        });

        // 分类操作（编辑、删除）
        categoryList.addEventListener('click', (event) => {
            const target = event.target;
            const categoryItem = target.closest('.category-item');
            if (!categoryItem) return;

            const categoryName = categoryItem.querySelector('span').textContent;
            const categoryIndex = categories.indexOf(categoryName);

            if (target.classList.contains('edit-btn')) {
                const newName = prompt('请输入新的分类名称：', categoryName);
                if (newName && newName !== categoryName && !categories.includes(newName)) {
                    // 更新分类名称
                    categories[categoryIndex] = newName;
                    // 更新相关网站的分类
                    sites = sites.map(site => {
                        if (site.category === categoryName) {
                            return { ...site, category: newName };
                        }
                        return site;
                    });
                    // 保存更新
                    saveCategoryOrder();
                    saveSites();
                    initializeUI();
                } else if (categories.includes(newName)) {
                    alert('该分类名称已存在！');
                }
            } else if (target.classList.contains('delete-btn')) {
                if (confirm(`确定要删除分类"${categoryName}"？删除后该分类下的网站将被移动到"常用网站"`)) {
                    // 将该分类下的网站移动到常用网站
                    sites = sites.map(site => {
                        if (site.category === categoryName) {
                            return { ...site, category: '常用网站' };
                        }
                        return site;
                    });
                    
                    // 从分类列表中删除
                    const updatedCategories = categories.filter(cat => cat !== categoryName);
                    categories = updatedCategories;
                    
                    // 保存更新到localStorage
                    localStorage.setItem('categoryOrder', JSON.stringify(categories));
                    localStorage.setItem('sites', JSON.stringify(sites));
                    
                    // 触发数据更新事件
                    dispatchDataUpdateEvent();
                    
                    // 重新初始化界面
                    initializeUI();
                    
                    // 显示删除成功提示
                    alert('分类已成功删除');
                }
            }
        });
    }

    // 网站管理事件
    if (sitesContainer && addSiteBtn) {
        // 添加新网站
        addSiteBtn.addEventListener('click', () => {
            const title = prompt('请输入网站标题：');
            if (!title) return;

            const url = prompt('请输入网站URL：');
            if (!url) return;

            const description = prompt('请输入网站描述：') || '暂无描述';
            const category = prompt('请输入网站分类（留空则添加到常用网站）：') || '常用网站';
            const icon = prompt('请输入网站SVG图标代码或URL（留空则使用默认图标）：');

            // 验证URL格式
            try {
                new URL(url);
            } catch (e) {
                alert('请输入有效的URL格式（例如：https://example.com）');
                return;
            }

            // 验证SVG格式
            let validIcon = 'default-icon.svg';
            if (icon) {
                if (icon.startsWith('<svg') && icon.endsWith('</svg>')) {
                    validIcon = 'data:image/svg+xml;base64,' + btoa(icon);
                } else if (icon.startsWith('http')) {
                    validIcon = icon;
                }
            }

            // 确保分类存在
            if (!categories.includes(category)) {
                if (confirm(`分类"${category}"不存在，是否创建新分类？`)) {
                    categories.push(category);
                    saveCategoryOrder();
                } else {
                    return;
                }
            }

            // 添加新网站
            const newSite = {
                title,
                url,
                description,
                category,
                icon: validIcon
            };

            sites.push(newSite);
            saveSites();
            initializeUI();
            
            // 滚动到新添加的网站
            const lastSiteCard = document.querySelector('.site-card:last-child');
            if (lastSiteCard) {
                lastSiteCard.scrollIntoView({ behavior: 'smooth' });
            }
        });

        // 网站操作（编辑、删除）
        sitesContainer.addEventListener('click', (event) => {
            const target = event.target;
            const siteCard = target.closest('.site-card');
            if (!siteCard) return;

            // Get the original index stored in the dataset
            const siteIndex = parseInt(siteCard.dataset.index);
            if (isNaN(siteIndex) || siteIndex < 0 || siteIndex >= sites.length) {
                console.error('Invalid site index found:', siteCard.dataset.index);
                alert('操作失败，无效的网站索引。');
                return;
            }
            const site = sites[siteIndex];

            if (target.classList.contains('edit-site-btn')) {
                // Edit logic uses siteIndex correctly now
                const title = prompt('请输入新的网站标题：', site.title);
                if (!title) return;

                const url = prompt('请输入新的网站URL：', site.url);
                if (!url) return;

                // 验证URL格式
                try {
                    new URL(url);
                } catch (e) {
                    alert('请输入有效的URL格式（例如：https://example.com）');
                    return;
                }

                const description = prompt('请输入新的网站描述：', site.description) || '暂无描述';
                const category = prompt('请输入新的网站分类（留空则保持不变）：', site.category) || site.category;
                const icon = prompt('请输入新的SVG图标代码或URL（留空则保持不变）：');

                // 验证SVG格式
                let validIcon = site.icon;
                if (icon) {
                    if (icon.startsWith('<svg') && icon.endsWith('</svg>')) {
                        validIcon = 'data:image/svg+xml;base64,' + btoa(icon);
                    } else if (icon.startsWith('http')) {
                        validIcon = icon;
                    }
                }

                // 确保分类存在
                if (!categories.includes(category)) {
                    if (confirm(`分类"${category}"不存在，是否创建新分类？`)) {
                        categories.push(category);
                        saveCategoryOrder(); // Save categories first
                    } else {
                        return;
                    }
                }

                // 更新网站信息
                sites[siteIndex] = {
                    ...site,
                    title,
                    url,
                    description,
                    category
                };

                saveSites();
                initializeUI(); // Re-render UI
            } else if (target.classList.contains('delete-site-btn')) {
                // Delete logic uses siteIndex correctly now
                if (confirm(`确定要删除网站 "${site.title}" 吗？`)) {
                    // 获取当前网站的分类
                    const siteCategory = site.category;
                    
                    // 询问是否删除整个分类下的网站
                    if (confirm(`是否删除"${siteCategory}"分类下的所有网站？`)) {
                        // 删除该分类下的所有网站
                        sites = sites.filter(s => s.category !== siteCategory);
                    } else {
                        // 只删除当前网站
                        sites.splice(siteIndex, 1);
                    }
                    
                    saveSites();
                    initializeUI(); // Re-render UI

                    // 显示删除成功的提示
                    alert('网站已成功删除');
                }
            }
        });
    }
}

// Placeholder for initDragAndDrop if it's needed later
function initDragAndDrop(element) {
    console.log('initDragAndDrop called for element:', element);
    // Add drag and drop implementation here if required
}

// Placeholder for initSearchSettings
function initSearchSettings() {
    console.log('initSearchSettings called');
    // Add search settings implementation here if required
}