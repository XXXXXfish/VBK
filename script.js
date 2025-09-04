document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const mainView = document.getElementById('main-view');
    const pageTitle = document.getElementById('page-title');
    const backButton = document.getElementById('back-button');

    let allData = null; // 用于存储加载的JSON数据

    // --- 数据加载 ---
    async function loadData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allData = await response.json();
            console.log('数据加载成功:', allData);
        } catch (error) {
            console.error('加载数据失败:', error);
            mainView.innerHTML = '<p style="color: red;">加载面试题数据失败，请检查data.json文件或网络连接。</p>';
        }
    }

    // --- 视图渲染函数 ---

    /**
     * 渲染主页（学科列表）
     */
    function renderHomeView() {
        pageTitle.textContent = '面试题宝典';
        backButton.classList.add('hidden');
        mainView.innerHTML = `
            <ul class="subject-list">
                ${allData.subjects.map(subject => `
                    <li class="subject-list-item">
                        <button data-subject-id="${subject.id}">${subject.name}</button>
                    </li>
                `).join('')}
            </ul>
        `;

        // 添加学科按钮的点击事件
        mainView.querySelectorAll('.subject-list-item button').forEach(button => {
            button.addEventListener('click', (event) => {
                const subjectId = event.target.dataset.subjectId;
                window.location.hash = `#subject/${subjectId}`;
            });
        });
    }

    /**
     * 渲染特定学科的题目列表
     * @param {string} subjectId - 学科ID
     */
    function renderSubjectQuestionsView(subjectId) {
        const subject = allData.subjects.find(s => s.id === subjectId);
        if (!subject) {
            mainView.innerHTML = `<p>找不到学科：${subjectId}</p>`;
            pageTitle.textContent = '错误';
            backButton.classList.remove('hidden'); // 允许返回
            return;
        }

        pageTitle.textContent = subject.name + ' 面试题';
        backButton.classList.remove('hidden');
        backButton.onclick = () => {
            window.location.hash = `#`; // 返回主页
        };

        mainView.innerHTML = `
            <ul class="question-list">
                ${subject.questions.map(question => `
                    <li class="question-list-item">
                        <a href="#subject/${subjectId}/${question.id}">
                            <h3>${question.question}</h3>
                        </a>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    /**
     * 渲染特定题目的答案页
     * @param {string} subjectId - 学科ID
     * @param {string} questionId - 问题ID
     */
    function renderQuestionAnswerView(subjectId, questionId) {
        const subject = allData.subjects.find(s => s.id === subjectId);
        if (!subject) {
            mainView.innerHTML = `<p>找不到学科：${subjectId}</p>`;
            pageTitle.textContent = '错误';
            backButton.classList.remove('hidden'); // 允许返回
            return;
        }

        const question = subject.questions.find(q => q.id === questionId);
        if (!question) {
            mainView.innerHTML = `<p>找不到题目：${questionId}</p>`;
            pageTitle.textContent = '错误';
            backButton.classList.remove('hidden'); // 允许返回
            return;
        }

        pageTitle.textContent = subject.name + ' - 题目详情';
        backButton.classList.remove('hidden');
        backButton.onclick = () => {
            window.location.hash = `#subject/${subjectId}`; // 返回该学科题目列表
        };

        mainView.innerHTML = `
            <div class="answer-view">
                <h2 class="subject-name">${subject.name}</h2>
                <h3 class="question-text">${question.question}</h3>
                <div class="answer-text">
                    <p>${question.answer.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `;
    }

    // --- 路由管理 ---
    function router() {
        if (!allData) {
            // 如果数据还没加载，等待加载完成后再执行路由
            setTimeout(router, 50);
            return;
        }

        const hash = window.location.hash; // 例如: #subject/os 或 #subject/os/os-q1

        if (hash === '' || hash === '#') {
            renderHomeView();
        } else if (hash.startsWith('#subject/')) {
            const parts = hash.split('/'); // ["#subject", "os", "os-q1"]
            const subjectId = parts[1];
            const questionId = parts[2];

            if (subjectId && questionId) {
                renderQuestionAnswerView(subjectId, questionId);
            } else if (subjectId) {
                renderSubjectQuestionsView(subjectId);
            } else {
                // 无效的哈希，重定向到主页
                window.location.hash = '#';
            }
        } else {
            // 处理其他未知哈希，重定向到主页
            window.location.hash = '#';
        }
    }

    // --- 初始化 ---
    async function init() {
        await loadData(); // 先加载数据
        if (allData) {
            router(); // 数据加载成功后，执行初始路由
            window.addEventListener('hashchange', router); // 监听哈希变化
        }
    }

    init(); // 启动应用
});
