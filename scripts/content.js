const local_storage_key = 'chatgpt-text-summary-prompts';
const local_storage_panel_top_key = 'chatgpt-text-summary-panel-top-em';
const local_storage_popup_width_key = 'chatgpt-text-summary-popup-width-em';
const user_prompt__panel_top_min_em = 3.5;
const user_prompt__panel_top_max_em = 15;
const user_prompt__popup_width_min_em = 20;
const user_prompt__popup_width_max_em = 40;

let user_prompt__default_options = [];
let user_prompt__options = [];
let user_prompt__root = null;
let user_prompt__host = null;
let user_prompt__selected_index = -1;
let user_prompt__drag_index = -1;
let user_prompt__panel_top_em = user_prompt__panel_top_min_em;
let user_prompt__popup_width_em = 24;

async function user_prompt__load_default_prompt() {
    try {
        const response = await fetch(chrome.runtime.getURL('user_prompt.json'));
        if (response.ok) {
            user_prompt__default_options = await response.json();
            return;
        }
    } catch (error) {
    }
}

function user_prompt__store_to_local_storage(data) {
    localStorage.setItem(local_storage_key, JSON.stringify(data));
}

function user_prompt__retrieve_from_local_storage() {
    const storedData = localStorage.getItem(local_storage_key);
    if (storedData) {
        try {
            const parsedData = JSON.parse(storedData);
            if (Array.isArray(parsedData) && parsedData.length > 0)
                return parsedData;
        } catch (error) {
        }
    }

    return user_prompt__default_options;
}

function user_prompt__clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function user_prompt__retrieve_number_from_local_storage(key, fallbackValue, min, max) {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) return fallbackValue;

    const parsedValue = Number.parseFloat(storedValue);
    if (Number.isNaN(parsedValue)) return fallbackValue;

    return user_prompt__clamp(parsedValue, min, max);
}

function user_prompt__store_number_to_local_storage(key, value) {
    localStorage.setItem(key, value.toString());
}

async function loadTextContent(element, url) {
    try {
        const response = await fetch(chrome.runtime.getURL(url));
        if (response.ok)
            element.textContent = await response.text();
    } catch (error) {
        console.error('Error loading HTML:', error);
    }
}

async function user_prompt__load_inner_html(element, url) {
    try {
        const response = await fetch(chrome.runtime.getURL(url));
        if (response.ok)
            element.innerHTML = await response.text();
    } catch (error) {
        console.error('Error loading HTML:', error);
    }
}

function user_prompt__qs(selector) {
    return user_prompt__root ? user_prompt__root.querySelector(selector) : null;
}

function user_prompt__open() {
    const button = user_prompt__qs("#user-prompt-open-button");
    const popup = user_prompt__qs("#user-prompt-popup-container");

    if (!button || !popup) return;

    const isOpen = popup.style.display === 'block';
    popup.style.display = isOpen ? 'none' : 'block';
    button.setAttribute('aria-expanded', (!isOpen).toString());
}

function user_prompt__apply_panel_top() {
    const panel = user_prompt__qs("#user-prompt-panel");
    if (!panel) return;
    panel.style.top = `${user_prompt__panel_top_em}em`;
}

function user_prompt__apply_popup_width() {
    const popup = user_prompt__qs("#user-prompt-popup-container");
    if (!popup) return;
    popup.style.width = `${user_prompt__popup_width_em}em`;
}

function user_prompt__setup_open_button_drag() {
    const button = user_prompt__qs("#user-prompt-open-button");
    const panel = user_prompt__qs("#user-prompt-panel");
    if (!button || !panel) return;

    let dragState = null;
    let suppressClick = false;

    button.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;

        dragState = {
            startY: event.clientY,
            startTopEm: user_prompt__panel_top_em,
            moved: false
        };

        button.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    button.addEventListener('pointermove', (event) => {
        if (!dragState) return;

        const fontSizePx = Number.parseFloat(getComputedStyle(panel).fontSize) || 16;
        const deltaEm = (event.clientY - dragState.startY) / fontSizePx;
        const nextTopEm = user_prompt__clamp(
            dragState.startTopEm + deltaEm,
            user_prompt__panel_top_min_em,
            user_prompt__panel_top_max_em
        );

        if (Math.abs(nextTopEm - dragState.startTopEm) > 0.02) {
            dragState.moved = true;
        }

        user_prompt__panel_top_em = nextTopEm;
        user_prompt__apply_panel_top();
    });

    button.addEventListener('pointerup', (event) => {
        if (!dragState) return;

        if (button.hasPointerCapture(event.pointerId)) {
            button.releasePointerCapture(event.pointerId);
        }

        if (dragState.moved) {
            user_prompt__store_number_to_local_storage(local_storage_panel_top_key, user_prompt__panel_top_em);
            suppressClick = true;
        }

        dragState = null;
    });

    button.addEventListener('pointercancel', () => {
        dragState = null;
    });

    button.addEventListener('click', (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
    }, true);
}

function user_prompt__setup_popup_resize() {
    const popup = user_prompt__qs("#user-prompt-popup-container");
    const resizeHandle = user_prompt__qs("#user-prompt-resize-handle");
    if (!popup || !resizeHandle) return;

    let resizeState = null;

    resizeHandle.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;

        resizeState = {
            startX: event.clientX,
            startWidthEm: user_prompt__popup_width_em
        };

        popup.classList.add('is-resizing');
        resizeHandle.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    resizeHandle.addEventListener('pointermove', (event) => {
        if (!resizeState) return;

        const fontSizePx = Number.parseFloat(getComputedStyle(popup).fontSize) || 16;
        const deltaEm = (resizeState.startX - event.clientX) / fontSizePx;
        user_prompt__popup_width_em = user_prompt__clamp(
            resizeState.startWidthEm + deltaEm,
            user_prompt__popup_width_min_em,
            user_prompt__popup_width_max_em
        );

        user_prompt__apply_popup_width();
    });

    const finishResize = (pointerId) => {
        if (!resizeState) return;
        if (typeof pointerId === 'number' && resizeHandle.hasPointerCapture(pointerId)) {
            resizeHandle.releasePointerCapture(pointerId);
        }

        popup.classList.remove('is-resizing');
        user_prompt__store_number_to_local_storage(local_storage_popup_width_key, user_prompt__popup_width_em);
        resizeState = null;
    };

    resizeHandle.addEventListener('pointerup', (event) => finishResize(event.pointerId));
    resizeHandle.addEventListener('pointercancel', () => finishResize());
}

function user_prompt__get_color_scheme() {
    const html = document.documentElement;
    if (!html) return '';
    const style = html.getAttribute('style') || '';
    const match = style.match(/color-scheme:\s*(dark|light)/i);
    if (match) return match[1].toLowerCase();
    return '';
}

function user_prompt__apply_theme() {
    if (!user_prompt__host) return;
    const scheme = user_prompt__get_color_scheme();
    if (scheme === 'dark') {
        user_prompt__host.setAttribute('data-theme', 'dark');
    } else if (scheme === 'light') {
        user_prompt__host.setAttribute('data-theme', 'light');
    } else {
        user_prompt__host.removeAttribute('data-theme');
    }
}

function user_prompt__add_button_click() {
    const input = user_prompt__qs("#user-prompt-user-input");
    if (!input) return;
    const prompt = input.value;
    if (!prompt) return;
    input.value = '';
    user_prompt__autosize();

    user_prompt__options.push(prompt);
    user_prompt__store_to_local_storage(user_prompt__options);
    user_prompt__update_prompt_count();
    user_prompt__selected_index = user_prompt__options.length - 1;
    user_prompt__render_list();
    user_prompt__select_index(user_prompt__selected_index);
}

function user_prompt__update_button_click() {
    const input = user_prompt__qs("#user-prompt-user-input");
    if (!input) return;
    const index = user_prompt__selected_index;
    if (index < 0 || index >= user_prompt__options.length) return;
    const prompt = input.value;
    if (!prompt) return;
    user_prompt__options[index] = prompt;
    user_prompt__store_to_local_storage(user_prompt__options);
    user_prompt__render_list();
    user_prompt__select_index(index);
}

function user_prompt__delete_prompt(index) {
    const input = user_prompt__qs("#user-prompt-user-input");
    if (!input) return;
    if (index < 0 || index >= user_prompt__options.length) return;

    user_prompt__options.splice(index, 1);
    user_prompt__store_to_local_storage(user_prompt__options);

    if (user_prompt__selected_index === index) {
        user_prompt__selected_index = -1;
        input.value = "";
    } else if (user_prompt__selected_index > index) {
        user_prompt__selected_index -= 1;
    }

    user_prompt__update_prompt_count();
    user_prompt__render_list();
    if (user_prompt__selected_index >= 0) {
        user_prompt__select_index(user_prompt__selected_index);
    }
}

function user_prompt__delete_button_click() {
    user_prompt__delete_prompt(user_prompt__selected_index);
}

function user_prompt__get_prompt_label(prompt) {
    const firstLine = prompt.split('\n')[0].trim();
    return firstLine || "(untitled prompt)";
}

function user_prompt__select_index(index) {
    const input = user_prompt__qs("#user-prompt-user-input");
    if (!input) return;
    if (index < 0 || index >= user_prompt__options.length) return;
    user_prompt__selected_index = index;
    input.value = user_prompt__options[index];
    user_prompt__autosize();
    user_prompt__render_list();
}

function user_prompt__update_prompt_count() {
    const countEl = user_prompt__qs("#user-prompt-count");
    if (!countEl) return;
    const count = user_prompt__options.length;
    countEl.textContent = `${count} prompt${count === 1 ? "" : "s"}`;
}

function user_prompt__filter_prompts() {
    const searchInput = user_prompt__qs("#user-prompt-search-input");
    if (!searchInput) return;
    const query = searchInput.value.trim().toLowerCase();
    user_prompt__render_list(query);
}

function user_prompt__render_list(forcedQuery) {
    const list = user_prompt__qs("#user-prompt-items");
    const searchInput = user_prompt__qs("#user-prompt-search-input");
    if (!list) return;
    const query = typeof forcedQuery === 'string'
        ? forcedQuery
        : (searchInput ? searchInput.value.trim().toLowerCase() : '');

    list.innerHTML = '';

    for (let i = 0; i < user_prompt__options.length; i++) {
        const prompt = user_prompt__options[i];
        const label = user_prompt__get_prompt_label(prompt);
        const matches = !query || label.toLowerCase().includes(query) || prompt.toLowerCase().includes(query);
        if (!matches) continue;

        const item = document.createElement('div');
        item.className = 'up-item' + (i === user_prompt__selected_index ? ' is-selected' : '');
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', i === user_prompt__selected_index ? 'true' : 'false');
        item.dataset.index = i.toString();
        item.draggable = true;

        const labelEl = document.createElement('div');
        labelEl.className = 'up-item-label';
        labelEl.textContent = label;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'up-item-delete';
        deleteBtn.type = 'button';
        deleteBtn.draggable = false;
        deleteBtn.setAttribute('aria-label', 'Delete this prompt');
        deleteBtn.innerHTML = `
            <svg class="up-icon" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3.5 5H12.5M6 5V12M10 5V12M5 5L5.5 13H10.5L11 5M6 3H10" />
            </svg>
        `;

        item.addEventListener('click', () => user_prompt__select_index(i));
        item.addEventListener('dragstart', (event) => {
            user_prompt__drag_index = i;
            item.classList.add('is-dragging');
            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', i.toString());
            }
        });
        item.addEventListener('dragend', () => {
            user_prompt__drag_index = -1;
            item.classList.remove('is-dragging');
            const targets = list.querySelectorAll('.is-drop-target');
            targets.forEach(target => target.classList.remove('is-drop-target'));
        });
        item.addEventListener('dragover', (event) => {
            event.preventDefault();
            item.classList.add('is-drop-target');
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move';
            }
        });
        item.addEventListener('dragleave', () => {
            item.classList.remove('is-drop-target');
        });
        item.addEventListener('drop', (event) => {
            event.preventDefault();
            item.classList.remove('is-drop-target');
            const fromIndex = user_prompt__drag_index;
            const toIndex = i;
            if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
            user_prompt__move_prompt(fromIndex, toIndex);
        });
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            user_prompt__delete_prompt(i);
        });

        item.appendChild(labelEl);
        item.appendChild(deleteBtn);
        list.appendChild(item);
    }
}

function user_prompt__move_prompt(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= user_prompt__options.length || toIndex >= user_prompt__options.length) return;

    const [moved] = user_prompt__options.splice(fromIndex, 1);
    const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    user_prompt__options.splice(insertIndex, 0, moved);
    user_prompt__store_to_local_storage(user_prompt__options);

    if (user_prompt__selected_index === fromIndex) {
        user_prompt__selected_index = insertIndex;
    } else if (fromIndex < user_prompt__selected_index && insertIndex >= user_prompt__selected_index) {
        user_prompt__selected_index -= 1;
    } else if (fromIndex > user_prompt__selected_index && insertIndex <= user_prompt__selected_index) {
        user_prompt__selected_index += 1;
    }

    user_prompt__render_list();
    if (user_prompt__selected_index >= 0) {
        user_prompt__select_index(user_prompt__selected_index);
    }
}

function user_prompt__get_selection_text() {
    const selection = window.getSelection();
    if (!selection) return '';
    return selection.toString();
}

async function user_prompt__resolve_template(prompt) {
    let resolved = prompt;
    const needsClipboard = /{{(text|clipboard)}}/g.test(resolved);
    const needsSelection = /{{selection}}/g.test(resolved);

    if (needsClipboard) {
        let clipboardText = '';
        try {
            clipboardText = await navigator.clipboard.readText();
        } catch (error) {
        }
        if (!clipboardText) {
            alert("Nothing in clipboard!");
            return null;
        }
        resolved = resolved
            .replaceAll("{{text}}", clipboardText)
            .replaceAll("{{clipboard}}", clipboardText);
    }

    if (needsSelection) {
        const selectionText = user_prompt__get_selection_text();
        if (!selectionText) {
            alert("Nothing selected!");
            return null;
        }
        resolved = resolved.replaceAll("{{selection}}", selectionText);
    }

    return resolved;
}

async function user_prompt__paste_button_click() {
    // If popup is opened, close it.
    const openButton = user_prompt__qs("#user-prompt-open-button");
    const popup = user_prompt__qs("#user-prompt-popup-container");
    if (openButton && popup && popup.style.display === 'block') {
        user_prompt__open();
    }

    // Check chatGPT text area.
    const chatgpt_textarea = document.querySelector("#prompt-textarea");

    if (chatgpt_textarea === null) {
        alert("No text area found!");
        return;
    }

    // Get prompt
    const input = user_prompt__qs("#user-prompt-user-input");
    if (!input) {
        alert("No prompt menu found!");
        return;
    }

    let prompt = input.value;
    if (!prompt) {
        alert("No prompt to execute!");
        return;
    }

    const wait_propmt = prompt.endsWith(' ');

    prompt = await user_prompt__resolve_template(prompt);
    if (prompt === null) return;
    prompt = user_prompt__escape_html(prompt);

    prompt = prompt.replace(/\r/g, '').split('\n').map(line => `<p>${line}</p>`).join('');
    chatgpt_textarea.focus();
    chatgpt_textarea.innerHTML = prompt;
    chatgpt_textarea.dispatchEvent(new Event('input', { bubbles: true }));

    if (wait_propmt) {
        return;
    }

    requestAnimationFrame(() => {
        const button = document.querySelector('button[data-testid="send-button"]');
        if (button) {
            button.click();
        }
    });
}

function user_prompt__escape_html(str) {
    if (!str) return str;

    return str.replace(/[&<>"']/g, function (match) {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#039;';
            default: return match;
        }
    });
}

function user_prompt__autosize() {
    const el = user_prompt__qs("#user-prompt-user-input");
    if (!el) return;

    requestAnimationFrame(() => {
        el.style.cssText = 'height:auto;';
        el.style.cssText = 'height: ' + el.scrollHeight + 'px';
    });
}

function user_prompt__setup() {
    const eventMap = {
        "user-prompt-open-button": ["click", user_prompt__open],
        "user-prompt-paste-button": ["click", user_prompt__paste_button_click],
        "user-prompt-add-button": ["click", user_prompt__add_button_click],
        "user-prompt-update-button": ["click", user_prompt__update_button_click],
        "user-prompt-delete-button": ["click", user_prompt__delete_button_click],
        "user-prompt-user-input": ["input", user_prompt__autosize],
        "user-prompt-search-input": ["input", user_prompt__filter_prompts]
    };

    for (const id in eventMap) {
        const target = user_prompt__qs('#' + id);
        if (target) {
            target.addEventListener(eventMap[id][0], eventMap[id][1]);
        }
    }

    user_prompt__render_list();
    user_prompt__update_prompt_count();
    user_prompt__apply_panel_top();
    user_prompt__apply_popup_width();
    user_prompt__setup_open_button_drag();
    user_prompt__setup_popup_resize();

    const listContainer = user_prompt__qs("#user-prompt-list");
    if (listContainer) {
        listContainer.addEventListener('dragover', (event) => {
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move';
            }
        });
        listContainer.addEventListener('drop', (event) => {
            event.preventDefault();
            const fromIndex = user_prompt__drag_index;
            if (fromIndex < 0) return;
            const toIndex = user_prompt__options.length - 1;
            if (toIndex >= 0 && fromIndex !== toIndex) {
                user_prompt__move_prompt(fromIndex, toIndex);
            }
        });
    }

    // add keydown event listener.
    document.addEventListener("keydown", function (event) {
        if (event.key !== "F9" && event.code !== "F9")
            return;

        user_prompt__paste_button_click();
    });
}

async function user_prompt__init() {
    await user_prompt__load_default_prompt();
    user_prompt__options = user_prompt__retrieve_from_local_storage();
    user_prompt__panel_top_em = user_prompt__retrieve_number_from_local_storage(
        local_storage_panel_top_key,
        user_prompt__panel_top_min_em,
        user_prompt__panel_top_min_em,
        user_prompt__panel_top_max_em
    );
    user_prompt__popup_width_em = user_prompt__retrieve_number_from_local_storage(
        local_storage_popup_width_key,
        24,
        user_prompt__popup_width_min_em,
        user_prompt__popup_width_max_em
    );

    const style = document.createElement('style');
    const div = document.createElement('div');
    const host = document.createElement('div');
    host.id = 'user-prompt-root';
    user_prompt__host = host;
    user_prompt__root = host.attachShadow({ mode: 'open' });

    await loadTextContent(style, 'user_prompt.css');
    await user_prompt__load_inner_html(div, 'user_prompt.html');

    user_prompt__root.appendChild(style);
    user_prompt__root.appendChild(div);
    document.body.appendChild(host);

    user_prompt__apply_theme();
    const observer = new MutationObserver(() => user_prompt__apply_theme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    user_prompt__setup();
}

user_prompt__init();
