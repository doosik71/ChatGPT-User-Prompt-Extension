const local_storage_key = 'chatgpt-text-summary-prompts';

let user_prompt__default_options = [];

async function user_prompt__load_user_prompt_data() {
    try {
        const response = await fetch(chrome.runtime.getURL('user_prompt.json'));
        if (response.ok)
            user_prompt__default_options = await response.json();
        else
            user_prompt__default_options = [];
    } catch (error) {
        user_prompt__default_options = [];
    }
}

function user_prompt__store_to_local_storage(data) {
    localStorage.setItem(local_storage_key, JSON.stringify(data));
}

function user_prompt__retrieve_from_local_storage() {
    const storedData = localStorage.getItem(local_storage_key);
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        return parsedData.length > 0 ? parsedData : user_prompt__default_options;
    } else {
        return user_prompt__default_options;
    }
}

var user_prompt__options = user_prompt__retrieve_from_local_storage();

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

function user_prompt__open() {
    const button = document.querySelector("#user-prompt-open-button");
    const popup = document.querySelector("#user-prompt-popup-container");

    if (button.textContent === '⊞') {
        button.textContent =   '⊟';
        popup.style.display = 'block';
    } else {
        button.textContent = '⊞';
        popup.style.display = 'none';
    }
}

function user_prompt__add_button_click() {
    const newItem = document.createElement('option');
    const prompt = document.querySelector("#user-prompt-user-input").value;
    newItem.title = prompt;
    newItem.text = prompt.split('\n')[0];
    document.querySelector("#user-prompt-combo-list").add(newItem);
    document.querySelector("#user-prompt-user-input").value = '';
    user_prompt__autosize();

    user_prompt__options.push(prompt);
    user_prompt__store_to_local_storage(user_prompt__options);
}

function user_prompt__update_button_click() {
    const combo_list = document.querySelector("#user-prompt-combo-list");
    const index = combo_list.selectedIndex;
    if (index >= 0) {
        const prompt = document.querySelector("#user-prompt-user-input").value;
        combo_list.options[index].title = prompt;
        combo_list.options[index].text = prompt.split('\n')[0];
        user_prompt__options[index] = prompt;
        user_prompt__store_to_local_storage(user_prompt__options);
    }
}

function user_prompt__delete_button_click() {
    var combo_list = document.querySelector("#user-prompt-combo-list");
    const index = combo_list.selectedIndex;

    user_prompt__options.splice(index, 1);
    user_prompt__store_to_local_storage(user_prompt__options);

    combo_list.remove(index);
    combo_list.selectedIndex = -1;
    document.querySelector("#user-prompt-user-input").value = "";
}

function user_prompt__combo_list_change() {
    const combo_list = document.querySelector("#user-prompt-combo-list");
    const selected_option = combo_list.options[combo_list.selectedIndex];
    console.log(selected_option);
    console.log(selected_option.title);
    console.log(selected_option.innerHTML);
    document.querySelector("#user-prompt-user-input").value = selected_option.title;
    user_prompt__autosize();
}

async function user_prompt__paste_button_click() {
    // If popup is opened, close it.
    if (document.querySelector("#user-prompt-open-button").textContent === 'Close Prompt')
        user_prompt__open();

    // Check chatGPT text area.
    const chatgpt_textarea = document.querySelector("#prompt-textarea");

    if (chatgpt_textarea === null) {
        alert("No text area found!");
        return;
    }

    // Get prompt
    var prompt = document.querySelector("#user-prompt-user-input").value;
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
        prompt = user_prompt__escape_html(prompt.replace("{{text}}", clipboardText));
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
    var el = document.querySelector("#user-prompt-user-input");

    setTimeout(function () {
        el.style.cssText = 'height:auto;';
        el.style.cssText = 'height: ' + el.scrollHeight + 'px';
    }, 0);
}

function user_prompt__setup() {
    const eventMap = {
        "user-prompt-open-button": ["click", user_prompt__open],
        "user-prompt-paste-button": ["click", user_prompt__paste_button_click],
        "user-prompt-add-button": ["click", user_prompt__add_button_click],
        "user-prompt-update-button": ["click", user_prompt__update_button_click],
        "user-prompt-delete-button": ["click", user_prompt__delete_button_click],
        "user-prompt-combo-list": ["change", user_prompt__combo_list_change],
        "user-prompt-user-input": ["input", user_prompt__autosize]
    };

    for (let id in eventMap)
        document.querySelector('#' + id).addEventListener(eventMap[id][0], eventMap[id][1]);

    // Update combo list.
    const combo_list = document.querySelector("#user-prompt-combo-list");

    // Add default options.
    for (let i = 0; i < user_prompt__options.length; i++) {
        const prompt = user_prompt__options[i];
        const option = document.createElement('option');
        option.title = prompt;
        option.text = prompt.split('\n')[0];
        combo_list.appendChild(option);
    }

    // add keydown event listener.
    document.addEventListener("keydown", function (event) {
        if (event.key !== "F9" && event.code !== "F9")
            return;

        user_prompt__paste_button_click();
    });
}

async function user_prompt__init() {
    await user_prompt__load_user_prompt_data();

    const style = document.createElement('style');
    const div = document.createElement('div');

    await loadTextContent(style, 'user_prompt.css');
    await user_prompt__load_inner_html(div, 'user_prompt.html');

    document.head.appendChild(style);
    document.body.appendChild(div);

    user_prompt__setup();
}

user_prompt__init();
