const text_summary_options = [
    `I want you to act as a research paper summarizer.
I will provide you with a research paper on a specific topic, and you will create a summary of the main points and findings of the paper.
Your summary should be concise and should accurately and objectively communicate the key points of the paper.
You should not include any personal opinions or interpretations in your summary but rather focus on objectively presenting the information from the paper.
Your summary should be written in your own words and should not include any direct quotes from the paper.
Please ensure that your summary is clear, concise, and accurately reflects the content of the original paper.`,
    `Summarize concisely in bullet point. Each sentence must have a subject and a verb:
{{text}}`,
    `Summarize concisely in bullet point:
{{text}}`,
    `Summarize concisely in bullet point and translate it into English:
{{text}}`,
    `Summarize concisely in bullet point and translate it into Korean:
{{text}}`,
    `Summarize concisely in bullet point and translate it into English and Korean:
{{text}}`,
    `Summarize in 100 words or less:
{{text}}`,
    `Summarize in 100 words or less in Korean:
{{text}}`,
    `Summarize in 100 words or less in bullet point:
{{text}}`,
    `Explain the following in detail in English:
{{text}}`,
    `Explain the following in detail in Korean:
{{text}}`,
    `Regarding the previous content, please explain the following in detail:
{{text}}`,
    `Translate into English:
{{text}}`,
    `Translate into Korean:
{{text}}`,
    `Please answer again what you just said in English.`,
    `Please answer again what you just said in Korean.`,
    `Below is the content of the research paper. Please summarize the contents in bullet point:
{{text}}`,
];

const text_summary_style = `
#text-summary-panel {
    position: fixed;
    top: 5em;
    right: 1em;
    color: white;
}

#text-summary-popup-button, #text-summary-add-button, #text-summary-paste-button {
    width: 6em;
    height: 2em;
    margin: 0.1em;
    color: white;
    background: darkslategray;
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
    color: gray;
}

#text-summary-prompt {
    color: black;
    height: 5em;
}

#text-summary-add-button {
    vertical-align: top;
}

`;

const text_summary_html = `
<p style="text-align:right"><button id="text-summary-popup-button">Prompt ▼</button></p>
<div id="text-summary-popup-container">
    <select id="text-summary-combo-list">
    </select>
    <br/>
    <textarea id="text-summary-prompt" placeholder="New prompt..." spellcheck="false">${text_summary_options[0]}</textarea>
    <button id="text-summary-add-button">Add</button>
</div>
<p style="text-align:right"><button id="text-summary-paste-button">Paste [F9]</button></p>
`;

function text_summary_open() {
    const button = document.querySelector("#text-summary-popup-button");
    const popup = document.querySelector("#text-summary-popup-container");

    if (button.textContent === 'Prompt ▼') {
        button.textContent = 'Prompt ▲';
        popup.style.display = 'block';
    } else {
        button.textContent = 'Prompt ▼';
        popup.style.display = 'none';
    }
}

function text_summary_add() {
    const newItem = document.createElement('option');
    newItem.text = document.querySelector("#text-summary-prompt").value;
    document.querySelector("#text-summary-combo-list").add(newItem);
    document.querySelector("#text-summary-prompt").value = '';
    text_summary_autosize();
}

function text_summary_change() {
    const combo_list = document.querySelector("#text-summary-combo-list");
    document.querySelector("#text-summary-prompt").value = combo_list.options[combo_list.selectedIndex].innerHTML;
    text_summary_autosize();
}

async function text_summary_paste() {
    const chatgpt_textarea = document.querySelector("#prompt-textarea");
    if (chatgpt_textarea === null)
        return;

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

    const button = document.querySelector("form.stretch button.absolute");
    if (button) {
        button.click();
    }
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
