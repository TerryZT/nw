document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const cards = document.querySelectorAll('.card');
    const searchResults = document.getElementById('searchResults');
    const resultCount = document.getElementById('resultCount');
    const resultCategories = document.getElementById('resultCategories');

    // 搜索功能实现
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        let matchCount = 0;
        const categories = {};

        // 清空现有的分类结果
        resultCategories.innerHTML = '';

        if (!searchTerm) {
            cards.forEach(card => card.classList.remove('hidden'));
            searchResults.style.display = 'none';
            return;
        }

        cards.forEach(card => {
            // 获取卡片中的所有可搜索文本
            const title = card.querySelector('h4').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const keywords = card.dataset.keywords ? card.dataset.keywords.toLowerCase() : '';
            const searchContent = `${title} ${description} ${keywords}`;
            const section = card.closest('.nav-section');
            const sectionTitle = section.querySelector('h3').textContent;

            // 如果搜索词为空或搜索内容包含搜索词，则显示卡片
            if (searchTerm === '' || searchContent.includes(searchTerm)) {
                card.classList.remove('hidden');
                matchCount++;

                // 按分类统计搜索结果
                if (!categories[sectionTitle]) {
                    categories[sectionTitle] = {
                        element: section.cloneNode(true),
                        count: 1
                    };
                } else {
                    categories[sectionTitle].count++;
                }
            } else {
                card.classList.add('hidden');
            }
        });

        // 更新搜索结果显示
        resultCount.textContent = matchCount;
        searchResults.style.display = matchCount > 0 ? 'block' : 'none';

        // 显示分类结果
        if (matchCount > 0) {
            Object.entries(categories).forEach(([title, data]) => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'result-category';
                categoryDiv.innerHTML = `
                    <h4>${title} (${data.count})</h4>
                    <div class="card-container">
                        ${Array.from(data.element.querySelectorAll('.card')).filter(card => 
                            !card.classList.contains('hidden')
                        ).map(card => card.outerHTML).join('')}
                    </div>
                `;
                resultCategories.appendChild(categoryDiv);
            });
        } else {
            resultCategories.innerHTML = '<div class="no-results">没有找到匹配的结果</div>';
        }
    });
});