// ==UserScript==
// @name         数采系统-分步创建实例+标注-增强版
// @namespace    http://tampermonkey.net/
// @version      4.9
// @match        *://collect.galbot.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    /*
    ==============================
    版本更新日志
    ==============================
    v1.0 初代：
    - 支持创建实例任务

    v2.0 修复版：
    - 修复弹窗识别
    - 修复下拉框选择
    - 支持添加标注任务
    - 支持选择“无需标注”

    v3.0 稳定版：
    - 适配 Element Plus 可搜索下拉
    - 人员选择改为：点击 → 输入 → 等待 → 选择

    v4.0 增强版：
    - 新增拖动面板
    - 新增隐藏 / 展开
    - 新增缩小模式
    - 新增面板内修改采集员、质检员
    - 新增计划量、单包量配置
    - 新增本地保存配置
    - 新增作者彩蛋：zoujiakang

    v4.5：
    - 修复重复点击导致创建多个任务的问题

    v4.6：
    - 新增动作时间配置

    v4.7：
    - 改为表头全选，避免行内 checkbox 多份 DOM 导致选择失败

    v4.8：
    - 删除一键创建+标注
    - 新增独立的一键全选按钮

    v4.9：
    - 修复全选框选择器，适配 el-table__body-header
    */

    const STORAGE_KEY = 'tm_collect_tool_config_v49';

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

    function loadConfig() {
        try {
            return Object.assign(
                {},
                DEFAULT_CONFIG,
                JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
            );
        } catch {
            return { ...DEFAULT_CONFIG };
        }
    }

    function saveConfig() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(CONFIG));
    }

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    function uiLog(msg) {
        console.log('[数采脚本]', msg);
        const el = document.querySelector('#tm-log');
        if (el) el.innerText = msg;
    }

    function isVisible(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0;
    }

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

    function safeButtonClick(button) {
        if (!button) return false;

        try {
            button.scrollIntoView({ block: 'center', inline: 'center' });
        } catch {}

        button.click();
        return true;
    }

    function clickCenter(el) {
        if (!el) return false;

        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const target = document.elementFromPoint(x, y) || el;

        const eventConfig = {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: x,
            clientY: y,
            screenX: x,
            screenY: y,
            button: 0
        };

        target.dispatchEvent(new MouseEvent('mouseover', eventConfig));
        target.dispatchEvent(new MouseEvent('mousemove', eventConfig));
        target.dispatchEvent(new MouseEvent('mousedown', eventConfig));
        target.dispatchEvent(new MouseEvent('mouseup', eventConfig));
        target.dispatchEvent(new MouseEvent('click', eventConfig));

        return true;
    }

    function setInputValue(input, value) {
        if (!input) return false;

        input.focus();

        const setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
        ).set;

        setter.call(input, String(value));

        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        return true;
    }

    function getVisibleDrawer() {
        return [...document.querySelectorAll('.el-drawer')]
            .filter(isVisible)
            .at(-1);
    }

    function getVisibleDropdown() {
        return [...document.querySelectorAll('.el-select-dropdown, .el-popper')]
            .filter(isVisible)
            .at(-1);
    }

    async function waitForDropdown(timeout = 2500) {
        const start = Date.now();

        while (Date.now() - start < timeout) {
            const dropdown = getVisibleDropdown();
            if (dropdown) return dropdown;
            await sleep(80);
        }

        return null;
    }

    async function selectElementPlusOption(selectInput, name) {
        if (!selectInput) {
            uiLog('找不到下拉输入框');
            return false;
        }

        const selectRoot =
            selectInput.closest('.el-select') ||
            selectInput.closest('.el-select__wrapper') ||
            selectInput.parentElement;

        realClick(selectRoot);
        await sleep(CONFIG.actionDelay);

        setInputValue(selectInput, name);
        await sleep(CONFIG.dropdownDelay);

        const dropdown = await waitForDropdown(CONFIG.dropdownDelay + 2000);

        if (!dropdown) {
            uiLog('下拉框没打开');
            return false;
        }

        const options = [
            ...dropdown.querySelectorAll('.el-select-dropdown__item, [role="option"], li')
        ].filter(el => {
            const text = el.innerText.trim();
            return text && isVisible(el);
        });

        const target =
            options.find(el => el.innerText.trim() === name) ||
            options.find(el => el.innerText.trim().includes(name));

        if (!target) {
            uiLog('找不到选项：' + name);
            console.log('当前可见选项：', options.map(el => el.innerText.trim()));
            return false;
        }

        clickCenter(target);
        await sleep(CONFIG.actionDelay);

        uiLog('已选择：' + name);
        return true;
    }

    function syncConfigFromUI() {
        const plan = document.querySelector('#tm-plan');
        const single = document.querySelector('#tm-single');
        const collector = document.querySelector('#tm-collector');
        const inspector = document.querySelector('#tm-inspector');

        const actionDelay = document.querySelector('#tm-action-delay');
        const dropdownDelay = document.querySelector('#tm-dropdown-delay');
        const submitDelay = document.querySelector('#tm-submit-delay');
        const refreshDelay = document.querySelector('#tm-refresh-delay');

        CONFIG.planCount = Number(plan.value || 30);
        CONFIG.singleCount = Number(single.value || 30);
        CONFIG.collectorName = collector.value.trim();
        CONFIG.inspectorName = inspector.value.trim();

        CONFIG.actionDelay = Number(actionDelay.value || 300);
        CONFIG.dropdownDelay = Number(dropdownDelay.value || 600);
        CONFIG.submitDelay = Number(submitDelay.value || 1200);
        CONFIG.refreshDelay = Number(refreshDelay.value || 1500);

        saveConfig();
        uiLog('配置已保存');
    }

    async function createInstanceTask() {
        syncConfigFromUI();

        uiLog('开始创建实例任务');

        const addBtn = [...document.querySelectorAll('button')]
            .find(btn => btn.innerText.trim() === '添加');

        if (!addBtn) {
            uiLog('找不到顶部添加按钮');
            return false;
        }

        realClick(addBtn);
        await sleep(CONFIG.actionDelay + 250);

        const drawer = getVisibleDrawer();

        if (!drawer) {
            uiLog('找不到添加实例任务弹窗');
            return false;
        }

        const inputs = [...drawer.querySelectorAll('input')];

        const planInput = inputs[0];
        const singleInput = inputs[1];

        const collectorInput = [...drawer.querySelectorAll('input.el-select__input, input')]
            .find(input =>
                input.placeholder?.includes('采集员') ||
                input.closest('.el-form-item')?.innerText.includes('分配采集员')
            );

        if (!planInput || !singleInput) {
            uiLog('找不到采集量输入框');
            return false;
        }

        setInputValue(planInput, CONFIG.planCount);
        await sleep(CONFIG.actionDelay);

        setInputValue(singleInput, CONFIG.singleCount);
        await sleep(CONFIG.actionDelay);

        const selected = await selectElementPlusOption(collectorInput, CONFIG.collectorName);
        if (!selected) return false;

        const confirmBtn = [...drawer.querySelectorAll('button')]
            .find(btn => btn.innerText.trim() === '添加');

        if (!confirmBtn) {
            uiLog('找不到弹窗添加按钮');
            return false;
        }

        uiLog('准备提交实例任务');
        await sleep(CONFIG.submitDelay);

        safeButtonClick(confirmBtn);

        await sleep(CONFIG.refreshDelay);
        uiLog('实例任务创建已提交');

        return true;
    }

    async function selectAllRows() {
        const candidates = [
            ...document.querySelectorAll('.el-table__body-header label.el-checkbox'),
            ...document.querySelectorAll('.el-table__body-header .el-checkbox'),
            ...document.querySelectorAll('.el-table__header-wrapper label.el-checkbox'),
            ...document.querySelectorAll('.el-table__header-wrapper .el-checkbox'),
            ...document.querySelectorAll('thead label.el-checkbox'),
            ...document.querySelectorAll('thead .el-checkbox'),
            ...document.querySelectorAll('th[class*="selection"] label.el-checkbox'),
            ...document.querySelectorAll('th[class*="selection"] .el-checkbox')
        ].filter(el => isVisible(el));

        const headerCheckbox = candidates[0];

        if (!headerCheckbox) {
            uiLog('找不到表头全选框');
            console.log(
                '当前可见 checkbox：',
                [...document.querySelectorAll('label.el-checkbox, .el-checkbox')]
                    .filter(isVisible)
                    .map(el => el.outerHTML)
            );
            return false;
        }

        const input = headerCheckbox.querySelector('input[type="checkbox"]');
        const inner = headerCheckbox.querySelector('.el-checkbox__inner') || headerCheckbox;

        if (headerCheckbox.classList.contains('is-checked') || input?.checked) {
            uiLog('当前已是全选状态');
            return true;
        }

        clickCenter(inner);
        await sleep(CONFIG.actionDelay);

        if (headerCheckbox.classList.contains('is-checked') || input?.checked) {
            uiLog('已全选');
            return true;
        }

        if (input) {
            input.click();
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            await sleep(CONFIG.actionDelay);
        }

        if (headerCheckbox.classList.contains('is-checked') || input?.checked) {
            uiLog('已全选');
            return true;
        }

        uiLog('已点击全选，但状态未确认');
        return true;
    }
    // 取消全选
async function unselectAllRows() {
    const candidates = [
        ...document.querySelectorAll('.el-table__body-header label.el-checkbox'),
        ...document.querySelectorAll('.el-table__body-header .el-checkbox'),
        ...document.querySelectorAll('.el-table__header-wrapper label.el-checkbox'),
        ...document.querySelectorAll('.el-table__header-wrapper .el-checkbox'),
        ...document.querySelectorAll('thead label.el-checkbox'),
        ...document.querySelectorAll('thead .el-checkbox'),
        ...document.querySelectorAll('th[class*="selection"] label.el-checkbox'),
        ...document.querySelectorAll('th[class*="selection"] .el-checkbox')
    ].filter(el => isVisible(el));

    const headerCheckbox = candidates[0];

    if (!headerCheckbox) {
        uiLog('找不到表头复选框');
        return false;
    }

    const input = headerCheckbox.querySelector('input[type="checkbox"]');
    const inner = headerCheckbox.querySelector('.el-checkbox__inner') || headerCheckbox;

    // 如果本来就是未选中
    if (!headerCheckbox.classList.contains('is-checked') && !input?.checked) {
        uiLog('当前已经是未选状态');
        return true;
    }

    // 点一下取消
    clickCenter(inner);
    await sleep(CONFIG.actionDelay);

    // 再确认
    if (!headerCheckbox.classList.contains('is-checked') && !input?.checked) {
        uiLog('已取消全选');
        return true;
    }

    // 兜底（有些情况必须点 input）
    if (input) {
        input.click();
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(CONFIG.actionDelay);
    }

    uiLog('已尝试取消全选');
    return true;
}

    async function addMarkTask() {
        syncConfigFromUI();

        uiLog('开始添加标注任务');

        const markBtn = [...document.querySelectorAll('button')]
            .find(btn => btn.innerText.includes('添加标注任务'));

        if (!markBtn) {
            uiLog('找不到添加标注任务按钮');
            return false;
        }

        realClick(markBtn);
        await sleep(CONFIG.actionDelay + 300);

        const drawer = getVisibleDrawer();

        if (!drawer) {
            uiLog('找不到分配标注任务弹窗');
            return false;
        }

        const noMark = [...drawer.querySelectorAll('.el-checkbox')]
            .find(el => el.innerText.includes('无需标注'));

        if (!noMark) {
            uiLog('找不到“无需标注”');
            return false;
        }

        const noMarkBox = noMark.querySelector('.el-checkbox__inner') || noMark;
        clickCenter(noMarkBox);
        await sleep(CONFIG.actionDelay);

        const inspectorInput = [...drawer.querySelectorAll('input.el-select__input, input')]
            .find(input =>
                input.placeholder?.includes('质检员') ||
                input.closest('.el-form-item')?.innerText.includes('质检员')
            );

        const selected = await selectElementPlusOption(inspectorInput, CONFIG.inspectorName);
        if (!selected) return false;

        const confirmBtn = [...drawer.querySelectorAll('button')]
            .find(btn => btn.innerText.trim() === '确定');

        if (!confirmBtn) {
            uiLog('找不到确定按钮');
            return false;
        }

        await sleep(CONFIG.submitDelay);

        safeButtonClick(confirmBtn);

        uiLog('标注任务已提交');
        return true;
    }

    function makeDraggable(panel, handle) {
        let dragging = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        handle.addEventListener('mousedown', e => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;

            dragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = panel.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;

            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', e => {
            if (!dragging) return;

            const left = startLeft + e.clientX - startX;
            const top = startTop + e.clientY - startY;

            panel.style.left = `${left}px`;
            panel.style.top = `${top}px`;
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';

            CONFIG.panelLeft = `${left}px`;
            CONFIG.panelTop = `${top}px`;
        });

        document.addEventListener('mouseup', () => {
            if (!dragging) return;

            dragging = false;
            document.body.style.userSelect = '';
            saveConfig();
        });
    }

    function toggleCollapse() {
        CONFIG.collapsed = !CONFIG.collapsed;
        saveConfig();

        const body = document.querySelector('#tm-body');
        const btn = document.querySelector('#tm-toggle');

        if (!body || !btn) return;

        body.style.display = CONFIG.collapsed ? 'none' : 'block';
        btn.innerText = CONFIG.collapsed ? '展开' : '隐藏';
    }

    function toggleMini() {
        CONFIG.mini = !CONFIG.mini;
        saveConfig();

        const panel = document.querySelector('#tm-panel');
        if (!panel) return;

        panel.classList.toggle('tm-mini', CONFIG.mini);
    }

    function showEgg() {
        uiLog('作者：zoujiakang');
        alert('作者：zoujiakang');
    }

    function addStyle() {
        if (document.querySelector('#tm-style')) return;

        const style = document.createElement('style');
        style.id = 'tm-style';
        style.textContent = `
            #tm-panel {
                position: fixed;
                z-index: 999999;
                width: 300px;
                background: linear-gradient(135deg, #151515, #242424);
                color: #f5f5f5;
                border-radius: 14px;
                font-size: 13px;
                box-shadow: 0 8px 26px rgba(0,0,0,.38);
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                border: 1px solid rgba(255,255,255,.12);
            }

            #tm-panel.tm-mini {
                width: 170px;
                transform: scale(.88);
                transform-origin: bottom right;
            }

            #tm-header {
                padding: 10px 12px;
                cursor: move;
                background: rgba(255,255,255,.08);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: 700;
            }

            #tm-header-title:hover {
                color: #8cff8c;
            }

            #tm-header button,
            #tm-body button {
                border: none;
                border-radius: 8px;
                padding: 5px 9px;
                cursor: pointer;
                background: #3b82f6;
                color: #fff;
                font-size: 12px;
            }

            #tm-body {
                padding: 12px;
            }

            .tm-row {
                display: grid;
                grid-template-columns: 88px 1fr;
                gap: 6px;
                align-items: center;
                margin-bottom: 8px;
            }

            .tm-row label {
                color: #cfcfcf;
            }

            .tm-row input {
                width: 100%;
                box-sizing: border-box;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,.18);
                background: rgba(255,255,255,.08);
                color: #fff;
                padding: 6px 8px;
                outline: none;
            }

            .tm-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-top: 10px;
            }

            #tm-save {
                background: #10b981 !important;
            }

            #tm-select-all {
                grid-column: span 2;
                background: #f59e0b !important;
                color: #111 !important;
                font-weight: 700;
            }

            #tm-log {
                margin-top: 10px;
                color: #8cff8c;
                font-size: 12px;
                min-height: 18px;
                word-break: break-all;
            }

            #tm-history {
                margin-top: 10px;
                font-size: 11px;
                color: #aaa;
                line-height: 1.45;
                border-top: 1px solid rgba(255,255,255,.12);
                padding-top: 8px;
            }
        `;

        document.head.appendChild(style);
    }

    function addPanel() {
        if (document.querySelector('#tm-panel')) return;

        addStyle();

        const panel = document.createElement('div');
        panel.id = 'tm-panel';

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
                <span id="tm-header-title" title="双击显示作者">数采批量工具 v4.9</span>
                <span>
                    <button id="tm-mini">缩放</button>
                    <button id="tm-toggle">${CONFIG.collapsed ? '展开' : '隐藏'}</button>
                </span>
            </div>

            <div id="tm-body" style="display:${CONFIG.collapsed ? 'none' : 'block'};">
                <div class="tm-row">
                    <label>计划量</label>
                    <input id="tm-plan" type="number" value="${CONFIG.planCount}">
                </div>

                <div class="tm-row">
                    <label>单包量</label>
                    <input id="tm-single" type="number" value="${CONFIG.singleCount}">
                </div>

                <div class="tm-row">
                    <label>采集员</label>
                    <input id="tm-collector" value="${CONFIG.collectorName}">
                </div>

                <div class="tm-row">
                    <label>质检员</label>
                    <input id="tm-inspector" value="${CONFIG.inspectorName}">
                </div>

                <div class="tm-row">
                    <label>动作间隔ms</label>
                    <input id="tm-action-delay" type="number" value="${CONFIG.actionDelay}">
                </div>

                <div class="tm-row">
                    <label>下拉等待ms</label>
                    <input id="tm-dropdown-delay" type="number" value="${CONFIG.dropdownDelay}">
                </div>

                <div class="tm-row">
                    <label>提交等待ms</label>
                    <input id="tm-submit-delay" type="number" value="${CONFIG.submitDelay}">
                </div>

                <div class="tm-row">
                    <label>刷新等待ms</label>
                    <input id="tm-refresh-delay" type="number" value="${CONFIG.refreshDelay}">
                </div>

                <div class="tm-actions">
                    <button id="tm-create">① 创建实例</button>
                    <button id="tm-mark">② 添加标注</button>
                    <button id="tm-select-all">③ 一键全选</button>
                    <button id="tm-unselect-all">④ 取消全选</button>
                    <button id="tm-save">保存配置</button>
                    <button id="tm-reset">重置位置</button>
                </div>

                <div id="tm-log">待命</div>

                <div id="tm-history">
                    v1 初代按钮版<br>
                    v2 修复弹窗/下拉<br>
                    v3 适配可搜索下拉<br>
                    v4 拖动/隐藏/配置/作者<br>
                    v4.5 防重复创建<br>
                    v4.6 动作时间配置<br>
                    v4.7 改为表头全选<br>
                    v4.8 删除一键流程/保留全选<br>
                    v4.9 修复全选框选择器
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        const header = document.querySelector('#tm-header');

        makeDraggable(panel, header);

        document.querySelector('#tm-create').onclick = createInstanceTask;
        document.querySelector('#tm-mark').onclick = addMarkTask;
        document.querySelector('#tm-select-all').onclick = selectAllRows;
        document.querySelector('#tm-unselect-all').onclick = unselectAllRows;
        document.querySelector('#tm-save').onclick = syncConfigFromUI;
        document.querySelector('#tm-toggle').onclick = toggleCollapse;
        document.querySelector('#tm-mini').onclick = toggleMini;

        document.querySelector('#tm-reset').onclick = () => {
            CONFIG.panelLeft = '';
            CONFIG.panelTop = '';
            saveConfig();

            panel.style.left = '';
            panel.style.top = '';
            panel.style.right = '24px';
            panel.style.bottom = '36px';

            uiLog('位置已重置');
        };

        document.querySelector('#tm-header-title').ondblclick = showEgg;
    }

    setInterval(addPanel, 1000);
})();