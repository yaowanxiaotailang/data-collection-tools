// ==UserScript==
// @name         数采系统-分步创建实例+标注-增强版
// @namespace    http://tampermonkey.net/
// @version      5.5
// @match        *://collect.galbot.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    /*
    ==============================
    版本更新日志
    ==============================
    v1.0 到 v5.3 省略...
    v5.4 修复面板坐标飞出屏幕边界的严重漏洞
    v5.5 状态机修复版：
    - 修复全选/取消全选功能的“双击反转”问题
    - 补全点击动作间隙的状态拦截器，防止事件穿透导致状态重置
    */

    const STORAGE_KEY = 'tm_collect_tool_config_v50';

    // 默认的基础配置矩阵
    const DEFAULT_CONFIG = {
        planCount: 30,
        singleCount: 30,
        collectorName: 'rongxucheng',
        inspectorName: '田笑雨',

        actionDelay: 300,
        dropdownDelay: 600,
        submitDelay: 1200,
        refreshDelay: 1500,

        panelLeft: '',
        panelTop: '',
        collapsed: false,
        mini: false
    };

    let CONFIG = loadConfig();

    // 带有安全校验的配置加载引擎
    function loadConfig() {
        try {
            const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            const merged = Object.assign({}, DEFAULT_CONFIG, cached);

            // 坐标安全校验，防止面板被拖出可视区域
            if (merged.panelLeft && merged.panelTop) {
                const x = parseFloat(merged.panelLeft);
                const y = parseFloat(merged.panelTop);

                if (isNaN(x) || isNaN(y) || x < 0 || y < 0 || x > window.innerWidth - 50 || y > window.innerHeight - 50) {
                    console.log('[System Log] Info: 检测到控制面板坐标越界，已强制触发空间重置指令。');
                    merged.panelLeft = '';
                    merged.panelTop = '';
                }
            }
            return merged;
        } catch {
            return { ...DEFAULT_CONFIG };
        }
    }

    // 固化当前状态至浏览器本地存储
    function saveConfig() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(CONFIG));
    }

    // 异步延时节拍器
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // UI 与控制台双向同步日志输出
    function uiLog(msg) {
        console.log('[System Log]', msg);
        const el = document.querySelector('#tm-log');
        if (el) el.innerText = msg;
    }

    // 探针：检测 DOM 节点在视图中是否真实可见
    function isVisible(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0;
    }

    // 模拟完整的人类鼠标物理交互流
    function realClick(el) {
        if (!el) return false;
        try {
            el.scrollIntoView({ block: 'center', inline: 'center' });
        } catch {}
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
    }

    // 备用：原生 DOM 安全点击触发
    function safeButtonClick(button) {
        if (!button) return false;
        try {
            button.scrollIntoView({ block: 'center', inline: 'center' });
        } catch {}
        button.click();
        return true;
    }

    // 几何中心狙击算法，对抗边缘透明遮罩
    function clickCenter(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const target = document.elementFromPoint(x, y) || el;
        const eventConfig = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, screenX: x, screenY: y, button: 0 };
        target.dispatchEvent(new MouseEvent('mouseover', eventConfig));
        target.dispatchEvent(new MouseEvent('mousemove', eventConfig));
        target.dispatchEvent(new MouseEvent('mousedown', eventConfig));
        target.dispatchEvent(new MouseEvent('mouseup', eventConfig));
        target.dispatchEvent(new MouseEvent('click', eventConfig));
        return true;
    }

    // 底层数据强制劫持与事件注入
    function setInputValue(input, value) {
        if (!input) return false;
        input.focus();
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, String(value));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    // 活动抽屉模块探测器
    function getVisibleDrawer() {
        return [...document.querySelectorAll('.el-drawer')].filter(isVisible).at(-1);
    }

    // 活动下拉列表模块探测器
    function getVisibleDropdown() {
        return [...document.querySelectorAll('.el-select-dropdown, .el-popper')].filter(isVisible).at(-1);
    }

    // 异步轮询等待下拉列表组件完成 DOM 渲染
    async function waitForDropdown(timeout = 2500) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const dropdown = getVisibleDropdown();
            if (dropdown) return dropdown;
            await sleep(80);
        }
        return null;
    }

    // 穿透 Element Plus 深度封装下拉框逻辑
    async function selectElementPlusOption(selectInput, name) {
        if (!selectInput) {
            uiLog('Error: 未检测到下拉输入组件');
            return false;
        }

        const selectRoot = selectInput.closest('.el-select') || selectInput.closest('.el-select__wrapper') || selectInput.parentElement;
        realClick(selectRoot);
        await sleep(CONFIG.actionDelay);

        setInputValue(selectInput, name);
        await sleep(CONFIG.dropdownDelay);

        const dropdown = await waitForDropdown(CONFIG.dropdownDelay + 2000);
        if (!dropdown) {
            uiLog('Error: 下拉列表组件渲染超时');
            return false;
        }

        const options = [...dropdown.querySelectorAll('.el-select-dropdown__item, [role="option"], li')].filter(el => {
            const text = el.innerText.trim();
            return text && isVisible(el);
        });

        const target = options.find(el => el.innerText.trim() === name) || options.find(el => el.innerText.trim().includes(name));

        if (!target) {
            uiLog(`Error: 未匹配到目标选项 [${name}]`);
            return false;
        }

        clickCenter(target);
        await sleep(CONFIG.actionDelay);
        uiLog(`Info: 选项匹配成功 [${name}]`);
        return true;
    }

    // 同步面板 UI 配置参数至全局内存
    function syncConfigFromUI() {
        const plan = document.querySelector('#tm-plan'), single = document.querySelector('#tm-single');
        const collector = document.querySelector('#tm-collector'), inspector = document.querySelector('#tm-inspector');
        const actionDelay = document.querySelector('#tm-action-delay'), dropdownDelay = document.querySelector('#tm-dropdown-delay');
        const submitDelay = document.querySelector('#tm-submit-delay'), refreshDelay = document.querySelector('#tm-refresh-delay');

        CONFIG.planCount = Number(plan.value || 30); CONFIG.singleCount = Number(single.value || 30);
        CONFIG.collectorName = collector.value.trim(); CONFIG.inspectorName = inspector.value.trim();
        CONFIG.actionDelay = Number(actionDelay.value || 300); CONFIG.dropdownDelay = Number(dropdownDelay.value || 600);
        CONFIG.submitDelay = Number(submitDelay.value || 1200); CONFIG.refreshDelay = Number(refreshDelay.value || 1500);

        saveConfig();
        uiLog('Info: 系统配置已更新至本地磁盘');
    }

    // ==========================================
    // 业务节点：执行实例节点创建流程
    // ==========================================
    async function createInstanceTask() {
        syncConfigFromUI();
        uiLog('Task: 初始化实例创建流程');

        const addBtn = [...document.querySelectorAll('button.el-button')].find(btn => btn.innerText.includes('添加') && !btn.innerText.includes('标注'));
        if (!addBtn) { uiLog('Error: 添加实例按钮定位失败'); return false; }

        realClick(addBtn);
        await sleep(CONFIG.actionDelay + 250);

        const drawer = getVisibleDrawer();
        if (!drawer) { uiLog('Error: 任务配置抽屉组件未响应'); return false; }

        const planInput = drawer.querySelector('input[placeholder*="计划"]') || drawer.querySelectorAll('input[type="number"]')[0];
        const singleInput = drawer.querySelector('input[placeholder*="单包"]') || drawer.querySelectorAll('input[type="number"]')[1];
        const collectorInput = [...drawer.querySelectorAll('input.el-select__input, input.el-input__inner')].find(input => {
            const formItem = input.closest('.el-form-item');
            return formItem && (formItem.innerText.includes('采集员') || formItem.innerText.includes('分配人员'));
        }) || drawer.querySelector('input.el-select__input');

        if (!planInput || !singleInput) { uiLog('Error: 数量输入组件结构异常'); return false; }
        if (planInput.hasAttribute('readonly')) planInput.removeAttribute('readonly');

        setInputValue(planInput, CONFIG.planCount); await sleep(CONFIG.actionDelay);
        setInputValue(singleInput, CONFIG.singleCount); await sleep(CONFIG.actionDelay);

        if (collectorInput) {
            const selected = await selectElementPlusOption(collectorInput, CONFIG.collectorName);
            if (!selected) return false;
        } else { uiLog('Error: 采集员输入组件定位失败'); return false; }

        const confirmBtn = [...drawer.querySelectorAll('button.el-button--primary')].find(btn => btn.innerText.includes('确定') || btn.innerText.trim() === '添加');
        if (!confirmBtn) { uiLog('Error: 提交确认按钮定位失败'); return false; }

        await sleep(CONFIG.submitDelay);
        safeButtonClick(confirmBtn);
        await sleep(CONFIG.refreshDelay);

        uiLog('Task: 实例创建流程执行完毕');
        return true;
    }

    // ==========================================
    // 业务节点：触发数据视图全选 (已修复双击过当漏洞)
    // ==========================================
    async function selectAllRows() {
        const candidates = [...document.querySelectorAll('thead label.el-checkbox, thead .el-checkbox, th[class*="selection"] .el-checkbox')].filter(el => isVisible(el));
        const headerCheckbox = candidates[0];

        if (!headerCheckbox) { uiLog('Error: 表头全选组件定位失败'); return false; }

        const input = headerCheckbox.querySelector('input[type="checkbox"]');
        const inner = headerCheckbox.querySelector('.el-checkbox__inner') || headerCheckbox;

        // 首层拦截：如果已经全选，直接返回
        if (headerCheckbox.classList.contains('is-checked') || input?.checked) {
            uiLog('Info: 视图已确认处于全选状态'); return true;
        }

        // 第一击：表层物理模拟点击
        clickCenter(inner);
        await sleep(CONFIG.actionDelay);

        // 中间层拦截：确认第一击是否生效，生效则熔断，防止后续触发反选逻辑
        if (headerCheckbox.classList.contains('is-checked') || input?.checked) {
            uiLog('Info: 表层节点全选指令触发成功'); return true;
        }

        // 第二击：底层 DOM 强制触发（仅在表层失败时执行）
        if (input) {
            input.click();
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            await sleep(CONFIG.actionDelay);
        }
        uiLog('Warning: 全选指令已通过底层接口下发');
        return true;
    }

    // ==========================================
    // 业务节点：剥离数据视图全选 (已修复双击过当漏洞)
    // ==========================================
    async function unselectAllRows() {
        const candidates = [...document.querySelectorAll('thead label.el-checkbox, thead .el-checkbox, th[class*="selection"] .el-checkbox')].filter(el => isVisible(el));
        const headerCheckbox = candidates[0];

        if (!headerCheckbox) { uiLog('Error: 表头全选组件定位失败'); return false; }

        const input = headerCheckbox.querySelector('input[type="checkbox"]');
        const inner = headerCheckbox.querySelector('.el-checkbox__inner') || headerCheckbox;

        // 首层拦截：如果已经是未选状态，直接返回
        if (!headerCheckbox.classList.contains('is-checked') && !input?.checked) {
            uiLog('Info: 视图已确认处于未选状态'); return true;
        }

        // 第一击：表层物理模拟点击取消
        clickCenter(inner);
        await sleep(CONFIG.actionDelay);

        // 中间层拦截：确认取消操作是否生效
        if (!headerCheckbox.classList.contains('is-checked') && !input?.checked) {
            uiLog('Info: 表层节点取消全选指令触发成功'); return true;
        }

        // 第二击：底层 DOM 强制触发取消
        if (input) {
            input.click();
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
        uiLog('Warning: 取消全选指令已通过底层接口下发');
        return true;
    }

    // ==========================================
    // 业务节点：分配并下发标注策略
    // ==========================================
    async function addMarkTask() {
        syncConfigFromUI();
        uiLog('Task: 初始化标注任务分配流程');

        const markBtn = [...document.querySelectorAll('button')].find(btn => btn.innerText.includes('添加标注任务'));
        if (!markBtn) { uiLog('Error: 标注任务触发按钮定位失败'); return false; }

        realClick(markBtn);
        await sleep(CONFIG.actionDelay + 300);

        const drawer = getVisibleDrawer();
        if (!drawer) { uiLog('Error: 标注配置抽屉组件未响应'); return false; }

        const noMark = [...drawer.querySelectorAll('.el-checkbox')].find(el => el.innerText.includes('无需标注'));
        if (!noMark) { uiLog('Error: "无需标注"配置项定位失败'); return false; }

        const noMarkBox = noMark.querySelector('.el-checkbox__inner') || noMark;
        clickCenter(noMarkBox);
        await sleep(CONFIG.actionDelay);

        const inspectorInput = [...drawer.querySelectorAll('input.el-select__input, input')].find(input =>
            input.placeholder?.includes('质检员') || input.closest('.el-form-item')?.innerText.includes('质检员')
        );

        const selected = await selectElementPlusOption(inspectorInput, CONFIG.inspectorName);
        if (!selected) return false;

        const confirmBtn = [...drawer.querySelectorAll('button')].find(btn => btn.innerText.trim() === '确定');
        if (!confirmBtn) { uiLog('Error: 提交确认按钮定位失败'); return false; }

        await sleep(CONFIG.submitDelay);
        safeButtonClick(confirmBtn);

        uiLog('Task: 标注任务分配流程执行完毕');
        return true;
    }

    // ==========================================
    // 聚合调度模块：自动化任务串行执行流
    // ==========================================
    async function autoCreateTaskFlow() {
        uiLog('System: 启动全流程自动化调度');
        const step1 = await createInstanceTask();
        if (!step1) { uiLog('Error: 阶段一 (实例创建) 异常，自动化流程已终止'); return; }

        uiLog('Info: 等待后端数据视图同步渲染...');
        await sleep(CONFIG.refreshDelay + 800);

        const step2 = await selectAllRows();
        if (!step2) { uiLog('Error: 阶段二 (视图选取) 异常，自动化流程已终止'); return; }

        await sleep(CONFIG.actionDelay + 200);

        const step3 = await addMarkTask();
        if (!step3) { uiLog('Error: 阶段三 (标注分配) 异常，自动化流程已终止'); return; }

        uiLog('System: 全流程自动化调度执行成功');
    }

    // 控制面板空间坐标限制与拖拽逻辑
    function makeDraggable(panel, handle) {
        let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

        handle.addEventListener('mousedown', e => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            dragging = true; startX = e.clientX; startY = e.clientY;
            const rect = panel.getBoundingClientRect(); startLeft = rect.left; startTop = rect.top;
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            let left = startLeft + e.clientX - startX;
            let top = startTop + e.clientY - startY;

            // 越界强行拦截，保证面板始终存在于可视操作区域内
            if (left < 0) left = 0;
            if (top < 0) top = 0;
            if (left > window.innerWidth - panel.offsetWidth) left = window.innerWidth - panel.offsetWidth;
            if (top > window.innerHeight - panel.offsetHeight) top = window.innerHeight - panel.offsetHeight;

            panel.style.left = `${left}px`;
            panel.style.top = `${top}px`;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';

            CONFIG.panelLeft = `${left}px`;
            CONFIG.panelTop = `${top}px`;
        });

        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            dragging = false; document.body.style.userSelect = ''; saveConfig();
        });
    }

    // 交互状态：切换折叠模式
    function toggleCollapse() {
        CONFIG.collapsed = !CONFIG.collapsed; saveConfig();
        const body = document.querySelector('#tm-body'), btn = document.querySelector('#tm-toggle');
        if (!body || !btn) return;
        body.style.display = CONFIG.collapsed ? 'none' : 'block'; btn.innerText = CONFIG.collapsed ? '展开' : '隐藏';
    }

    // 交互状态：切换迷你试图
    function toggleMini() {
        CONFIG.mini = !CONFIG.mini; saveConfig();
        const panel = document.querySelector('#tm-panel');
        if (panel) panel.classList.toggle('tm-mini', CONFIG.mini);
    }

    // 界面渲染引擎：样式层注入
    function addStyle() {
        if (document.querySelector('#tm-style')) return;
        const style = document.createElement('style'); style.id = 'tm-style';
        style.textContent = `
            #tm-panel { position: fixed; z-index: 999999; width: 300px; background: linear-gradient(135deg, #151515, #242424); color: #f5f5f5; border-radius: 14px; font-size: 13px; box-shadow: 0 8px 26px rgba(0,0,0,.38); overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; border: 1px solid rgba(255,255,255,.12); transition: transform 0.2s; }
            #tm-panel.tm-mini { width: 170px; transform: scale(.88); transform-origin: bottom right; }
            #tm-header { padding: 10px 12px; cursor: move; background: rgba(255,255,255,.08); display: flex; justify-content: space-between; align-items: center; font-weight: 700; }
            #tm-header button, #tm-body button { border: none; border-radius: 8px; padding: 5px 9px; cursor: pointer; background: #3b82f6; color: #fff; font-size: 12px; }
            #tm-body { padding: 12px; }
            .tm-row { display: grid; grid-template-columns: 88px 1fr; gap: 6px; align-items: center; margin-bottom: 8px; }
            .tm-row input { width: 100%; box-sizing: border-box; border-radius: 8px; border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.08); color: #fff; padding: 6px 8px; outline: none; }
            .tm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
            #tm-save { background: #10b981 !important; }
            #tm-auto-all { grid-column: span 2; background: #4f46e5 !important; font-weight: bold; padding: 8px; font-size: 13px; }
            #tm-select-all { grid-column: span 2; background: #d97706 !important; color: #fff !important; font-weight: 700; }
            #tm-log { margin-top: 10px; color: #8cff8c; font-size: 12px; min-height: 18px; word-break: break-all; }
        `;
        document.head.appendChild(style);
    }

    // 界面渲染引擎：DOM 结构构建与事件代理
    function addPanel() {
        if (document.querySelector('#tm-panel')) return;
        addStyle();

        const panel = document.createElement('div'); panel.id = 'tm-panel';

        if (CONFIG.panelLeft && CONFIG.panelTop) {
            panel.style.left = CONFIG.panelLeft;
            panel.style.top = CONFIG.panelTop;
        } else {
            panel.style.right = '24px';
            panel.style.bottom = '36px';
        }

        if (CONFIG.mini) panel.classList.add('tm-mini');

        panel.innerHTML = `
            <div id="tm-header">
                <span id="tm-header-title">任务调度中枢 v5.5 稳态版</span>
                <span><button id="tm-mini">视图缩放</button> <button id="tm-toggle">${CONFIG.collapsed ? '展开' : '隐藏'}</button></span>
            </div>
            <div id="tm-body" style="display:${CONFIG.collapsed ? 'none' : 'block'};">
                <div class="tm-row"><label>单次计划量</label><input id="tm-plan" type="number" value="${CONFIG.planCount}"></div>
                <div class="tm-row"><label>单包配额</label><input id="tm-single" type="number" value="${CONFIG.singleCount}"></div>
                <div class="tm-row"><label>目标采集员</label><input id="tm-collector" value="${CONFIG.collectorName}"></div>
                <div class="tm-row"><label>目标质检员</label><input id="tm-inspector" value="${CONFIG.inspectorName}"></div>
                <div class="tm-row"><label>基础延时ms</label><input id="tm-action-delay" type="number" value="${CONFIG.actionDelay}"></div>
                <div class="tm-row"><label>组件延时ms</label><input id="tm-dropdown-delay" type="number" value="${CONFIG.dropdownDelay}"></div>
                <div class="tm-row"><label>网关延时ms</label><input id="tm-submit-delay" type="number" value="${CONFIG.submitDelay}"></div>
                <div class="tm-row"><label>同步延时ms</label><input id="tm-refresh-delay" type="number" value="${CONFIG.refreshDelay}"></div>
                <div class="tm-actions">
                    <button id="tm-auto-all">执行全流程自动化</button>
                    <button id="tm-create">创建实例节点</button>
                    <button id="tm-mark">分配标注策略</button>
                    <button id="tm-select-all">全选当前视图</button>
                    <button id="tm-unselect-all">重置视图选择</button>
                    <button id="tm-save">保存当前配置</button>
                    <button id="tm-reset" style="background:#ef4444">初始化窗体位置</button>
                </div>
                <div id="tm-log">Status: 待机</div>
            </div>
        `;

        document.body.appendChild(panel);
        makeDraggable(panel, document.querySelector('#tm-header'));

        // 核心事件总线注册
        document.querySelector('#tm-auto-all').onclick = autoCreateTaskFlow;
        document.querySelector('#tm-create').onclick = createInstanceTask;
        document.querySelector('#tm-mark').onclick = addMarkTask;
        document.querySelector('#tm-select-all').onclick = selectAllRows;
        document.querySelector('#tm-unselect-all').onclick = unselectAllRows;
        document.querySelector('#tm-save').onclick = syncConfigFromUI;
        document.querySelector('#tm-toggle').onclick = toggleCollapse;
        document.querySelector('#tm-mini').onclick = toggleMini;

        document.querySelector('#tm-reset').onclick = () => {
            CONFIG.panelLeft = ''; CONFIG.panelTop = ''; saveConfig();
            panel.style.left = ''; panel.style.top = ''; panel.style.right = '24px'; panel.style.bottom = '36px';
            uiLog('Info: 窗体空间坐标已释放重置');
        };
    }

    // 守护进程定时唤醒组件，抵抗路由级页面刷新脱落
    setInterval(addPanel, 1000);
})();
