// 网站管理器类
class WebsiteManager {
    constructor() {
        // 默认分类（空数组）
        this.defaultCategories = [];
        
        // 初始化事件监听
        this.initEventListeners();
    }
    
    // 初始化事件监听
    initEventListeners() {
        // 监听网站数据更新事件
        window.addEventListener('websitesUpdated', () => {
            this.loadWebsites();
        });
        
        // 监听分类更新事件
        window.addEventListener('categoriesUpdated', () => {
            this.loadCategories();
            // 分类更新后也需要重新加载网站，因为网站的分类可能已更改
            this.loadWebsites();
        });
        
        // 监听localStorage变化事件
        window.addEventListener('storage', (e) => {
            if (e.key === 'sites') {
                this.loadWebsites();
            } else if (e.key === 'categoryOrder') {
                this.loadCategories();
                this.loadWebsites();
            }
        });
    }
    
    // 加载分类
    loadCategories() {
        console.log('加载分类数据...');
        const container = document.querySelector('.container');
        if (!container) return;
        
        // 获取保存的分类数据
        const savedCategories = localStorage.getItem('categoryOrder');
        const categories = savedCategories ? JSON.parse(savedCategories) : this.defaultCategories;
        
        // 使用保存的分类或空数组
        const finalCategories = categories || [];
        
        // 移除所有分类section
        const existingSections = document.querySelectorAll('.nav-section');
        existingSections.forEach(section => section.remove());
        
        // 添加或更新分类
        finalCategories.forEach((category, index) => {
            // 查找现有分类section
            let section = document.querySelector(`[data-category="${category}"]`);
            
            // 如果分类section不存在，创建新的
            if (!section) {
                section = document.createElement('section');
                section.className = 'nav-section';
                section.dataset.category = category;
                section.innerHTML = `
                    <h3>📁 ${category}</h3>
                    <div class="card-container"></div>
                `;
                container.appendChild(section);
            }
            
            // 如果找到section，设置顺序
            if (section) {
                section.style.order = index;
            }
        });
        
        console.log('分类数据加载完成');
    }
    
    // 加载网站
    loadWebsites() {
        console.log('加载网站数据...');
        // 获取保存的网站数据
        const savedSites = localStorage.getItem('sites');
        if (!savedSites) return;
        
        try {
            const sites = JSON.parse(savedSites);
            
            // 清空所有分类下的卡片容器
            const cardContainers = document.querySelectorAll('.nav-section .card-container');
            cardContainers.forEach(container => {
                container.innerHTML = '';
            });
            
            // 添加网站卡片到对应分类
            sites.forEach(site => {
                const category = site.category || '常用网站';
                const section = document.querySelector(`[data-category="${category}"]`);
                
                if (section) {
                    const cardContainer = section.querySelector('.card-container');
                    if (cardContainer) {
                        // 检查是否已存在相同URL的卡片（避免重复）
                        const existingCard = Array.from(cardContainer.querySelectorAll('a')).find(a => a.href === site.url);
                        if (!existingCard) {
                            const card = document.createElement('a');
                            card.href = site.url;
                            card.className = 'card';
                            card.target = '_blank';
                            card.innerHTML = `
                                <img src="${site.icon || 'default-icon.svg'}" alt="${site.title}" onerror="this.src='default-icon.svg'">
                                <h4>${site.title}</h4>
                                <p>${site.description || '暂无描述'}</p>
                            `;
                            cardContainer.appendChild(card);
                        }
                    }
                }
            });
            
            console.log('网站数据加载完成');
        } catch (error) {
            console.error('加载网站数据失败:', error);
        }
    }
}

// 创建网站管理器实例
let websiteManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化网站管理器
    websiteManager = new WebsiteManager();

    // 初始化主题
    initTheme();
    // 初始化搜索功能
    initSearch();
    
    // 加载分类和网站数据
    websiteManager.loadCategories();
    websiteManager.loadWebsites();

    // 初始化Logo
    initLogo();

    // 监听Logo更新事件
    window.addEventListener('logoUpdated', updateLogo);
    
    // 监听localStorage变化以同步其他标签页的Logo更新
    window.addEventListener('storage', function(e) {
        if (e.key === 'logoUpdateTime') {
            updateLogo();
        }
    });
});

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
    }

    // 主题切换按钮事件
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            document.body.className = theme;
            localStorage.setItem('theme', theme);
        });
    });
}

// Logo初始化和更新函数
function initLogo() {
    const siteLogo = document.querySelector('.site-logo');
    if (siteLogo) {
        updateLogo();
    }
}

function updateLogo() {
    const siteLogo = document.querySelector('.site-logo');
    if (siteLogo) {
        const logoData = localStorage.getItem('logoData');
        if (logoData) {
            siteLogo.src = logoData;
        }
    }
}

// 初始化搜索功能
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const resultCount = document.getElementById('resultCount');
    const resultCategories = document.getElementById('resultCategories');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            if (query.length === 0) {
                searchResults.style.display = 'none';
                return;
            }

            const cards = document.querySelectorAll('.card');
            let matches = [];

            cards.forEach(card => {
                const title = card.querySelector('h4').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                const keywords = card.dataset.keywords ? card.dataset.keywords.toLowerCase() : '';

                if (title.includes(query) || description.includes(query) || keywords.includes(query)) {
                    matches.push(card.cloneNode(true));
                }
            });

            resultCount.textContent = matches.length;
            resultCategories.innerHTML = '';
            
            if (matches.length > 0) {
                const resultsContainer = document.createElement('div');
                resultsContainer.className = 'card-container';
                matches.forEach(match => resultsContainer.appendChild(match));
                resultCategories.appendChild(resultsContainer);
                searchResults.style.display = 'block';
            } else {
                searchResults.style.display = 'none';
            }
        });

        // 点击外部关闭搜索结果
        document.addEventListener('click', function(event) {
            if (!searchResults.contains(event.target) && event.target !== searchInput) {
                searchResults.style.display = 'none';
            }
        });
    }
}

// 初始化分类显示 - 此函数已被WebsiteManager类的loadCategories方法替代
function initCategories() {
    // 如果websiteManager已初始化，则使用其方法
    if (websiteManager) {
        websiteManager.loadCategories();
        return;
    }
    
    // 兼容性处理，防止在websiteManager初始化前调用
    try {
        // 获取保存的分类数据
        const savedCategories = localStorage.getItem('categoryOrder');
        if (savedCategories) {
            const categories = JSON.parse(savedCategories);
            const container = document.querySelector('.container');
            
            if (container) {
                // 移除所有现有的自定义分类section
                const existingSections = container.querySelectorAll('.nav-section:not([id="commonSites"]):not([id="learningResources"])');
                existingSections.forEach(section => section.remove());
                
                // 只添加管理页面中定义的分类
                categories.forEach(category => {
                    // 跳过默认分类，因为它们已经在HTML中定义
                    if (category !== '常用网站' && category !== '学习资源') {
                        const section = document.createElement('section');
                        section.className = 'nav-section';
                        section.dataset.category = category;
                        section.innerHTML = `
                            <h3>📁 ${category}</h3>
                            <div class="card-container"></div>
                        `;
                        container.appendChild(section);
                    }
                });
            }
        }
    } catch (error) {
        console.error('初始化分类显示失败:', error);
    }
}