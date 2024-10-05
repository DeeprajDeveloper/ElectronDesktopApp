const { ipcRenderer, contextBridge } = require("electron");

// Expose a safe API to interact with Monaco and Electron
contextBridge.exposeInMainWorld('api', {
    send: (channel, ...args) => {
        let validSendChannels = [
            "open-file-dialog",
            "save-current-file",
            "save-file-dialog",
            "exit-app",
        ];
        if (validSendChannels.includes(channel)) {
            ipcRenderer.send(channel, ...args); // Pass all arguments to ipcRenderer
        }
    },
    receive: (channel, func) => {
        let validReveiveChannels = [
            "open-file",
            "save-file-success",
            "save-file-error",
        ];
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});


window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ["chrome", "node", "electron"]) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});
