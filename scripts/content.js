const local_storage_key = 'chatgpt-text-summary-prompts';

const default_text_summary_options = [
    `Please summarize the content of the paper. The summary must provide a detailed and thorough explanation of each chapter and section of the paper, focusing on key concepts, methodologies, and challenges, along with relevant formulas and examples. The amount of the content should be sufficient for a comprehensive lecture on the paper. The markdown bullet point format is required and the formulas must use "$$" and "$" notation, not "\[", "\(".`,
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

function store_to_local_storage(data) {
    localStorage.setItem(local_storage_key, JSON.stringify(data));
}

function retrieve_from_local_storage() {
    const storedData = localStorage.getItem(local_storage_key);
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        return parsedData.length > 0 ? parsedData : default_text_summary_options;
    } else {
        return default_text_summary_options;
    }
}

var text_summary_options = retrieve_from_local_storage();

const text_summary_style = `
#text-summary-panel {
    position: fixed;
    top: 5em;
    right: 1em;
    color: white;
}

#text-summary-popup-button, #text-summary-update-button, #text-summary-add-button, #text-summary-delete-button, #text-summary-paste-button {
    width: 7em;
    height: 2em;
    margin: 0.1em;
    color: white;
}

#text-summary-popup-button, #text-summary-update-button, #text-summary-add-button, #text-summary-paste-button {
    background: darkslategray;
}

#text-summary-delete-button {
    background: red;
}

#text-summary-popup-container {
    display: none;
    border: 1px solid gray;
}

#text-summary-combo-list{
    background: floralwhite;
    width: 40em;
    max-width: 40em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#text-summary-combo-list option{
    width: 40em;
    max-width: 40em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#text-summary-prompt {
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

#button-container {
    display: inline-block;
    vertical-align: top;
    // margin-left: 0.5em;
}

#text-summary-add-button, #text-summary-update-button, #text-summary-delete-button {
    vertical-align: top;
}
`;

const text_summary_html = `
<p style="text-align:right"><button id="text-summary-popup-button">Open Prompt</button></p>
<div id="text-summary-popup-container">
    <select id="text-summary-combo-list"></select>
    <div id="button-container">
        <button id="text-summary-update-button">Update</button>
        <br/>
        <button id="text-summary-delete-button">Delete</button>
    </div>
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
    store_to_local_storage(text_summary_options);
}

function text_summary_update() {
    const combo_list = document.querySelector("#text-summary-combo-list");
    const index = combo_list.selectedIndex;
    if (index >= 0) {
        combo_list.options[index].text = document.querySelector("#text-summary-prompt").value;
        text_summary_options[index] = document.querySelector("#text-summary-prompt").value;
        store_to_local_storage(text_summary_options);
    }
}

function text_summary_delete() {
    var combo_list = document.querySelector("#text-summary-combo-list");
    const index = combo_list.selectedIndex;

    text_summary_options.splice(index, 1);
    store_to_local_storage(text_summary_options);

    combo_list.remove(index);
    combo_list.selectedIndex = -1;
    document.querySelector("#text-summary-prompt").value = "";
}

function text_summary_change() {
    const combo_list = document.querySelector("#text-summary-combo-list");
    document.querySelector("#text-summary-prompt").value = combo_list.options[combo_list.selectedIndex].innerHTML;
    text_summary_autosize();
}

async function text_summary_paste() {
    // If popup is opened, close it.
    if (document.querySelector("#text-summary-popup-button").textContent === 'Close Prompt')
        text_summary_open();

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

        prompt = prompt.replace("{{text}}", clipboardText);
    }

    prompt = prompt.replace(/\r/g, '').split('\n').map(line => `<p>${line}</p>`).join('');
    chatgpt_textarea.innerHTML = prompt

    // If the last char of prompt is not space character,
    if (wait_propmt) {
        return;
    }

    setTimeout(function() {}, 100);

    setTimeout(() => {
        const button = document.querySelector('button[data-testid="send-button"]');
        button.click()
    }, 100);
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
    document.querySelector("#text-summary-update-button").addEventListener("click", text_summary_update);
    document.querySelector("#text-summary-delete-button").addEventListener("click", text_summary_delete);
    document.querySelector("#text-summary-combo-list").addEventListener("change", text_summary_change);
    document.querySelector("#text-summary-prompt").addEventListener("input", text_summary_autosize);

    // Update combo list.
    const combo_list = document.querySelector("#text-summary-combo-list");

    // Add default options.
    for (let i = 0; i < text_summary_options.length; i++) {
        const option = document.createElement('option');
        option.text = text_summary_options[i];
        combo_list.appendChild(option);
    }

    // add keydown event listener.
    document.addEventListener("keydown", function (event) {
        if (event.key !== "F9" && event.code !== "F9")
            return;

        text_summary_paste();
    });
}

text_summary_init();
