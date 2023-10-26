const text_summary_options = [
    'Summarize concisely in bullet format:',
    'Summarize concisely in bullet format and translate it into English:',
    'Summarize concisely in bullet format and translate it into Korean:',
    'Summarize concisely in bullet format and translate it into English and Korean:',
    'Summarize in 100 words or less:',
    'Summarize in 100 words or less in Korean:',
    'Summarize in 100 words or less in bullet format:',
    'Explain the following in detail in English:',
    'Explain the following in detail in Korean:',
    'Regarding the previous content, please explain the following in detail:',
    'Translate into English:',
    'Translate into Korean:',
    'Please answer again what you just said in English.',
    'Please answer again what you just said in Korean.',
];

const text_summary_style = `
#text-summary-popup-button {
    position: fixed;
    top: 60px;
    right: 10px;
    padding: 18.5px;
    color: white;
    background: darkslategray;
}
#text-summary-prompt, #text-summary-combo-list {
    color: darkslategray;
    background: floralwhite;
    width: 30em;
}
#text-summary-add-button {
    margin-left: 1em;
    margin-right: 1em;
}
#text-summary-close-button {
    margin-left: 1em;
}
#text-summary-popup-container {
    display: none;
    position: fixed;
    top: 60px;
    right: 10px;
    padding: 10px;
    color: white;
    background: darkslategray;
    border: 1px solid white;
}`;

(function text_summary_init() {
    console.log('init');

    // Add style.
    const style = document.createElement('style');
    style.textContent = text_summary_style;
    document.head.appendChild(style);

    // Add button.
    const popupButton = document.createElement('button');
    popupButton.id = 'text-summary-popup-button';
    popupButton.textContent = 'P+';
    document.body.appendChild(popupButton);

    // Create popup container.
    const popupContainer = document.createElement('div');
    popupContainer.id = 'text-summary-popup-container';

    // Create text input.
    const inputText = document.createElement('input');
    inputText.id = 'text-summary-prompt';
    inputText.type = 'text';
    inputText.placeholder = 'New prompt...';
    inputText.value = 'Summarize concisely in bullet format:';
    popupContainer.appendChild(inputText);

    // Create add button.
    const addButton = document.createElement('button');
    addButton.id = 'text-summary-add-button';
    addButton.textContent = 'Add';
    popupContainer.appendChild(addButton);

    // Create combo list.
    const comboList = document.createElement('select');
    comboList.id = 'text-summary-combo-list';

    // Add default options.
    for (let i = 0; i < text_summary_options.length; i++) {
        const option = document.createElement('option');
        option.text = text_summary_options[i];
        comboList.appendChild(option);
    }

    popupContainer.appendChild(comboList);

    // Create close button.
    const closeButton = document.createElement('button');
    closeButton.id = 'text-summary-close-button';
    closeButton.textContent = 'Close';
    popupContainer.appendChild(closeButton);

    // Add popup button and popup container.
    document.body.appendChild(popupContainer);

    // Add click listener to popup button.
    popupButton.addEventListener('click', () => {
        popupContainer.style.display = 'block';
        popupButton.style.display = 'none';
    });

    // Add click listener to close button.
    closeButton.addEventListener('click', () => {
        popupContainer.style.display = 'none';
        popupButton.style.display = 'block';
    });

    // Add click listener to add button.
    addButton.addEventListener('click', () => {
        const newItem = document.createElement('option');
        newItem.text = inputText.value;
        comboList.add(newItem);
        inputText.value = '';
    });

    // Add change listener to combo list.
    comboList.addEventListener('change', () => {
        inputText.value = comboList.value;
    });

    // add keydown event listner.
    document.addEventListener("keydown", async function (event) {
        if (event.key !== "F9" && event.code !== "F9")
            return;

        const textarea = document.querySelector("#prompt-textarea");
        if (textarea === null)
            return;
            
        const prompt = document.querySelector("#text-summary-prompt").value;
        let clipboardText = await navigator.clipboard.readText();
        if (clipboardText === null)
            clipboardText = '';

        if (clipboardText.trim() !== '')
            textarea.value = prompt + "\n```" + clipboardText + '```';
        else
            textarea.value = prompt;

        var event = new Event("input", { bubbles: true, cancelable: true });
        textarea.dispatchEvent(event);

        const button = document.querySelector("form.stretch button.absolute");
        if (button) {
            button.click();
        }
    })
    
}) ();
