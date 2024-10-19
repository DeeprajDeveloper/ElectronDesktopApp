const { ipcRenderer, contextBridge } = require("electron");

// Expose a safe API to interact with Monaco and Electron
contextBridge.exposeInMainWorld("api", {
    send: (channel, ...args) => {
        let validSendChannels = [
            "open-file-dialog",
            "save-current-file",
            "save-file-dialog",
            "exit-app",
            "run-as-different-user",
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
            "command-result",
        ];
        if (validReveiveChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => {
                console.log(`[preload.js] Validating channel... ${channel}`);
                func(...args)
            });
        }
    },
    sendCommand: (channel, ...args) => {
        ipcRenderer.send(channel, ...args);
    },
    onCommandResult: (channel, func) => {
        ipcRenderer.on(channel, (event, result) => func(result));
    }
});


window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ["chrome", "node", "electron",]) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
    replaceText(`app-version`, 'v1.0.0');
});
