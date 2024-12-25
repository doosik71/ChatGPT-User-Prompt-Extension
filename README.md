# ChatGPT User Prompt Extension

## Overview

- This project implements a JavaScript-based tool to manage customizable text summary prompts for ChatGPT.
- It allows users to store, update, and delete prompts in the browser's local storage and interactively paste those prompts into the ChatGPT input area.

## Features

- **Prompt Management**: Add, update, delete, and view a list of predefined prompts.
- **Local Storage**: Prompts are saved in the browser’s local storage for persistence between sessions.
- **Dynamic Prompt Insertion**: Prompts can be inserted into the ChatGPT input area, with text templates dynamically filled using clipboard content.
- **User Interface**: Includes buttons and a dropdown for managing prompts.
- **Keyboard Shortcut**: Pressing `F9` triggers automatic pasting of the selected prompt.

## How to Use

1. **Open the Prompt Panel**: Click the `Open Prompt` button to manage your prompts.
2. **Select a Prompt**: Choose an existing prompt from the dropdown, or create a new one by typing into the prompt textarea.
3. **Paste the Prompt**: Click the `Paste [F9]` button or press `F9` to insert the selected prompt into ChatGPT’s input field.
4. `Add`/`Update`/`Delete` **Prompts**: Use the corresponding buttons to modify your prompts. These changes are automatically saved to local storage.
  
## Conclusion

- This tool streamlines the process of managing and using predefined prompts within ChatGPT.
- By leveraging local storage, dynamic UI elements, and prompt templates, users can efficiently interact with the chatbot, enhancing productivity for tasks like content summarization, code generation, and language translation.

## Version History

- v1.4.5
  - Fix the error where dialogue disappears.

- v1.4.4
  - Ensure prompt is treated as text.

- v1.4.3
  - Wait for the UI update before clicking send button.

- v1.4.2
  - Activate send button.

- v1.4.1
  - Update README.

- v1.4
  - Fix `PASTE` script.

- v1.3
  - Update icon.

- v1.2
  - Add update button.

- v1.1
  - Use cookie to store prompt.

- v1.0
  - First commit.
