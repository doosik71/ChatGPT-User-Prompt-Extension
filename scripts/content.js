const local_storage_key = 'chatgpt-text-summary-prompts';

let default_user_prompt_options = [];

async function loadTextSummaryOptions() {
    try {
        const response = await fetch(chrome.runtime.getURL('user_prompt.json'));
        if (response.ok)
            default_user_prompt_options = await response.json();
        else
            default_user_prompt_options = [];
    } catch (error) {
        default_user_prompt_options = [];
    }
}

function store_to_local_storage(data) {
    localStorage.setItem(local_storage_key, JSON.stringify(data));
}

function retrieve_from_local_storage() {
    const storedData = localStorage.getItem(local_storage_key);
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        return parsedData.length > 0 ? parsedData : default_user_prompt_options;
    } else {
        return default_user_prompt_options;
    }
}

var user_prompt_options = retrieve_from_local_storage();

const user_prompt_style = ``;

async function loadTextContent(element, url) {
    try {
        const response = await fetch(chrome.runtime.getURL(url));
        if (response.ok)
            element.textContent = await response.text();
    } catch (error) {
        console.error('Error loading HTML:', error);
    }
}

async function loadInnerHTML(element, url) {
    try {
        const response = await fetch(chrome.runtime.getURL(url));
        if (response.ok)
            element.innerHTML = await response.text();
    } catch (error) {
        console.error('Error loading HTML:', error);
    }
}

function user_prompt_open() {
    const button = document.querySelector("#text-summary-popup-button");
    const popup = document.querySelector("#text-summary-popup-container");

    if (button.textContent === '🔽') {
        button.textContent = '🔼';
        popup.style.display = 'block';
    } else {
        button.textContent = '🔽';
        popup.style.display = 'none';
    }
}

function user_prompt_add() {
    const newItem = document.createElement('option');
    newItem.text = document.querySelector("#text-summary-prompt").value;
    document.querySelector("#text-summary-combo-list").add(newItem);
    document.querySelector("#text-summary-prompt").value = '';
    user_prompt_autosize();

    user_prompt_options.push(newItem.text);
    store_to_local_storage(user_prompt_options);
}

function user_prompt_update() {
    const combo_list = document.querySelector("#text-summary-combo-list");
    const index = combo_list.selectedIndex;
    if (index >= 0) {
        combo_list.options[index].text = document.querySelector("#text-summary-prompt").value;
        user_prompt_options[index] = document.querySelector("#text-summary-prompt").value;
        store_to_local_storage(user_prompt_options);
    }
}

function user_prompt_delete() {
    var combo_list = document.querySelector("#text-summary-combo-list");
    const index = combo_list.selectedIndex;

    user_prompt_options.splice(index, 1);
    store_to_local_storage(user_prompt_options);

    combo_list.remove(index);
    combo_list.selectedIndex = -1;
    document.querySelector("#text-summary-prompt").value = "";
}

function user_prompt_change() {
    const combo_list = document.querySelector("#text-summary-combo-list");
    document.querySelector("#text-summary-prompt").value = combo_list.options[combo_list.selectedIndex].innerHTML;
    user_prompt_autosize();
}

async function user_prompt_paste() {
    // If popup is opened, close it.
    if (document.querySelector("#text-summary-popup-button").textContent === 'Close Prompt')
        user_prompt_open();

    // Check chatGPT text area.
    const chatgpt_textarea = document.querySelector("#prompt-textarea");

    if (chatgpt_textarea === null) {
        alert("No text area found!");
        return;
    }

    // Get prompt
    var prompt = document.querySelector("#text-summary-prompt").value;
    const wait_propmt = prompt.endsWith(' ');

    if (prompt === null) {
        alert("No prompt menu found!");
        return;
    }
    
    if (prompt.includes("{{text}}")) {
        let clipboardText = await navigator.clipboard.readText();
        if (clipboardText === null) {
            alert("Nothing in clipboard!");
            return;
        }

        // Ensure prompt is treated as text.
        prompt = escapeHtml(prompt.replace("{{text}}", clipboardText));
    }

    prompt = prompt.replace(/\r/g, '').split('\n').map(line => `<p>${line}</p>`).join('');
    chatgpt_textarea.focus();
    chatgpt_textarea.innerHTML = prompt;

    // If the last char of prompt is not space character,
    if (wait_propmt) {
        return;
    }

    requestAnimationFrame(() => {
        const button = document.querySelector('button[data-testid="send-button"]');
        button.click()
    });
}

function escapeHtml(str) {
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

function user_prompt_autosize() {
    var el = document.querySelector("#text-summary-prompt");

    setTimeout(function () {
        el.style.cssText = 'height:auto;';
        el.style.cssText = 'height: ' + el.scrollHeight + 'px';
    }, 0);
}

function user_prompt_setup() {
    document.querySelector("#text-summary-popup-button").addEventListener("click", user_prompt_open);
    document.querySelector("#text-summary-paste-button").addEventListener("click", user_prompt_paste);
    document.querySelector("#text-summary-add-button").addEventListener("click", user_prompt_add);
    document.querySelector("#text-summary-update-button").addEventListener("click", user_prompt_update);
    document.querySelector("#text-summary-delete-button").addEventListener("click", user_prompt_delete);
    document.querySelector("#text-summary-combo-list").addEventListener("change", user_prompt_change);
    document.querySelector("#text-summary-prompt").addEventListener("input", user_prompt_autosize);

    // Update combo list.
    const combo_list = document.querySelector("#text-summary-combo-list");

    // Add default options.
    for (let i = 0; i < user_prompt_options.length; i++) {
        const option = document.createElement('option');
        option.text = user_prompt_options[i];
        combo_list.appendChild(option);
    }

    // add keydown event listener.
    document.addEventListener("keydown", function (event) {
        if (event.key !== "F9" && event.code !== "F9")
            return;

        user_prompt_paste();
    });
}

async function user_prompt_init() {
    await loadTextSummaryOptions();

    const style = document.createElement('style');
    const div = document.createElement('div');
    div.id = "text-summary-panel";

    document.head.appendChild(style);
    document.body.appendChild(div);

    loadTextContent(style, 'user_prompt.css').then(() => {
        loadInnerHTML(div, 'user_prompt.html').then(() => {
            user_prompt_setup();
        });
    });
}

user_prompt_init();
