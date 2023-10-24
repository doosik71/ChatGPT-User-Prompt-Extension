document.addEventListener("keydown", async function (event) {
    if (event.key === "F9" || event.code === "F9") {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText) {
            const textarea = document.querySelector("#prompt-textarea");
            if (textarea) {
                textarea.value = "Summarize compactly in bullet form:\n" + clipboardText;
                var event = new Event("input", { bubbles: true, cancelable: true });
                textarea.dispatchEvent(event);

                const button = document.querySelector("form.stretch button.absolute");
                if (button) {
                    button.click();
                }
            }
        }
    }
})
