# ChatGPT User Prompt Extension

## Overview

- This is a simple browser extension to manage and use custom text summary prompts for ChatGPT.
- The extension allows users to store, update, and delete prompts in the browser's local storage and interactively paste those prompts into the ChatGPT input area.

## Features

- **Prompt Management**: Add, update, delete, and view a list of predefined prompts.
- **Local Storage**: Prompts are saved in the browser’s local storage for persistence between sessions.
- **Dynamic Prompt Insertion**: Prompts can be inserted into the ChatGPT input area, with text templates dynamically filled using clipboard content.
- **User Interface**: Includes buttons and a dropdown for managing prompts.
- **Keyboard Shortcut**: Pressing `F9` triggers automatic pasting of the selected prompt.

## Usage

Once installed, you will see a button labeled "Open Prompt" at the top right of your browser. Clicking this button opens a popup that lets you:

- **Add a new prompt**: Add a custom summary prompt by typing into the text area and clicking "Add".
- **Update an existing prompt**: Select a prompt from the dropdown, modify it, and click "Update".
- **Delete a prompt**: Select a prompt from the dropdown and click "Delete".
- **Paste text**: Use the "Paste [F9]" button to paste clipboard content into the currently selected prompt, automatically replacing `{{text}}` placeholders.

### Example Prompts

Here are some example prompts you can manage with this tool:

```text
Please explain the following in detail.
---
{{text}}
```

```text
Please summarize the key points using Markdown bullet style.
---
{{text}}
```

## Conclusion

- This tool streamlines the process of managing and using predefined prompts within ChatGPT.
- By leveraging local storage, dynamic UI elements, and prompt templates, users can efficiently interact with ChatGPT, enhancing productivity for tasks like content summarization, code generation, and language translation.

## Version History

- v1.4.6
  - Set focus before updating the text.
  - Updated the README.

- v1.4.5
  - Fixed an issue where the dialogue would disappear.

- v1.4.4
  - Ensured the prompt is treated as text.

- v1.4.3
  - Waited for UI update before clicking the send button.

- v1.4.2
  - Activated  send button.

- v1.4.1
  - Updated the README.

- v1.4
  - Fix the `PASTE` script.

- v1.3
  - Updated the icon.

- v1.2
  - Added the update button.

- v1.1
  - Used cookies to store prompts.

- v1.0
  - First commit.
