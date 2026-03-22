document.addEventListener('DOMContentLoaded', () => {
  const versionEl = document.getElementById('extension-version');
  if (versionEl) {
    versionEl.textContent = chrome.runtime.getManifest().version;
  }
});
