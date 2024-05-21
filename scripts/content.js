const cookie_name = 'chatgpt-text-summary-extension';

const default_text_summary_options = [
    `Please summarize the key points in complete sentences using Markdown bullet style.\n---\n{{text}}`,
    `Please summarize the key points as concisely as possible using Markdown bullet style.\n---\n{{text}}`,
    `Please explain the following in detail.\n---\n{{text}}`,
    `Say the following sentences in descriptive form.\n---\n{{text}}`,
    `Highlight important sentences or words in the following sentences in Markdown format.\n---\n{{text}}`,
    `Correct the following sentence.\n---\n{{text}}`,
    `Translate into English.\n---\n{{text}}`,
    `Translate into Korean.\n---\n{{text}}`,
    `Please answer in English.`,
    `Please answer in Korean.`,
    `Please provide recent research topic or ideas related to `,
    `Find and fix bugs in the following code.\n---\n{{text}}`,
    `Write a C/C++ code to `,
    `Write a JavaScript code to `,
    `Write a Python code to `,
    `Write a Rust code to `,
];

function store_cookie(data) {
    const cookieValue = btoa(encodeURIComponent(JSON.stringify(data)));
    console.log('Cookie value:', cookieValue);

    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();

    document.cookie = cookie_name + '=' + cookieValue + ';' + expires + ';path=/';
}

function retrieve_cookie() {
    const cookies = document.cookie.split(';');
    let cookieValue = null;

    cookies.forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name === cookie_name) {
            cookieValue = value;
        }
    });

    if (cookieValue) {
        return JSON.parse(decodeURIComponent(atob(cookieValue)))
    } else {
        return default_text_summary_options;
    }
}

var text_summary_options = retrieve_cookie();

const text_summary_style = `
#text-summary-panel {
    position: fixed;
    top: 5em;
    right: 1em;
    color: white;
}

#text-summary-popup-button, #text-summary-add-button, #text-summary-delete-button, #text-summary-paste-button {
    width: 7em;
    height: 2em;
    margin: 0.1em;
    color: white;
}

#text-summary-popup-button, #text-summary-add-button, #text-summary-paste-button {
    background: darkslategray;
}

#text-summary-delete-button {
    background: red;
}

#text-summary-popup-container {
    display: none;
    border: 1px solid gray;
}

#text-summary-combo-list, #text-summary-prompt {
    background: floralwhite;
    width: 40em;
}

#text-summary-combo-list, #text-summary-combo-list option, #text-summary-prompt {
    white-space: pre-wrap;
}

#text-summary-combo-list {
    color: DodgerBlue;
}

#text-summary-prompt {
    color: IndianRed;
    height: 5em;
}

#text-summary-add-button, #text-summary-delete-button,  {
    vertical-align: top;
}
`;

const text_summary_html = `
<p style="text-align:right"><button id="text-summary-popup-button">Open Prompt</button></p>
<div id="text-summary-popup-container">
    <select id="text-summary-combo-list">
    </select>
    <button id="text-summary-delete-button">Delete</button>
    <br/>
    <textarea id="text-summary-prompt" placeholder="New prompt..." spellcheck="false">${text_summary_options[0]}</textarea>
    <button id="text-summary-add-button">Add</button>
</div>
<p style="text-align:right"><button id="text-summary-paste-button">Paste [F9]</button></p>
`;

function text_summary_open() {
    const button = document.querySelector("#text-summary-popup-button");
    const popup = document.querySelector("#text-summary-popup-container");

    if (button.textContent === 'Open Prompt') {
        button.textContent = 'Close Prompt';
        popup.style.display = 'block';
    } else {
        button.textContent = 'Open Prompt';
        popup.style.display = 'none';
    }
}

function text_summary_add() {
    const newItem = document.createElement('option');
    newItem.text = document.querySelector("#text-summary-prompt").value;
    document.querySelector("#text-summary-combo-list").add(newItem);
    document.querySelector("#text-summary-prompt").value = '';
    text_summary_autosize();

    text_summary_options.push(newItem.text);
    store_cookie(text_summary_options);
}

function text_summary_delete() {
    var combo_list = document.querySelector("#text-summary-combo-list");
    const index = combo_list.selectedIndex;

    text_summary_options.splice(index, 1);
    store_cookie(text_summary_options);

    combo_list.remove(index);
}

function text_summary_change() {
    const combo_list = document.querySelector("#text-summary-combo-list");
    document.querySelector("#text-summary-prompt").value = combo_list.options[combo_list.selectedIndex].innerHTML;
    text_summary_autosize();
}

async function text_summary_paste() {
    // Check chatGPT text area.
    const chatgpt_textarea = document.querySelector("#prompt-textarea");
    if (chatgpt_textarea === null)
        return;

    // Get prompt
    const prompt = document.querySelector("#text-summary-prompt").value;
    if (prompt.includes("{{text}}")) {
        let clipboardText = await navigator.clipboard.readText();
        if (clipboardText === null) {
            alert("Nothing in clipboard!");
            return;
        }

        chatgpt_textarea.value = prompt.replace("{{text}}", clipboardText);
    } else
        chatgpt_textarea.value = prompt;

    var event = new Event("input", { bubbles: true, cancelable: true });
    chatgpt_textarea.dispatchEvent(event);

    // If the last char of prompt is not space character,
    if (prompt.slice(-1) !== ' ') {
        // Push the send button.
        const button = document.querySelector("body main form button");
        if (button)
            button.click();
    }

    // If popup is opened, close it.
    if (document.querySelector("#text-summary-popup-button").textContent === 'Close Prompt')
        text_summary_open();
}

function text_summary_autosize() {
    var el = document.querySelector("#text-summary-prompt");

    setTimeout(function () {
        el.style.cssText = 'height:auto;';
        el.style.cssText = 'height: ' + el.scrollHeight + 'px';
    }, 0);
}

function text_summary_init() {
    // Add style.
    const style = document.createElement('style');
    style.textContent = text_summary_style;
    document.head.appendChild(style);

    // Insert html
    const div = document.createElement('div');
    div.id = "text-summary-panel";
    div.innerHTML = text_summary_html;
    document.body.appendChild(div);

    // Register event handler.
    document.querySelector("#text-summary-popup-button").addEventListener("click", text_summary_open);
    document.querySelector("#text-summary-paste-button").addEventListener("click", text_summary_paste);
    document.querySelector("#text-summary-add-button").addEventListener("click", text_summary_add);
    document.querySelector("#text-summary-delete-button").addEventListener("click", text_summary_delete);
    document.querySelector("#text-summary-combo-list").addEventListener("change", text_summary_change);
    document.querySelector("#text-summary-prompt").addEventListener("input", text_summary_autosize);

    // Update combo list.
    const combo_ist = document.querySelector("#text-summary-combo-list");

    // Add default options.
    for (let i = 0; i < text_summary_options.length; i++) {
        const option = document.createElement('option');
        option.text = text_summary_options[i];
        combo_ist.appendChild(option);
    }

    // add keydown event listner.
    document.addEventListener("keydown", function (event) {
        if (event.key !== "F9" && event.code !== "F9")
            return;

        text_summary_paste();
    })
}

text_summary_init();
