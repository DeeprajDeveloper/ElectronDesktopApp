const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const extToLang = require(path.join(__dirname, "./src/mapping.js"));


function createWindow() {
	let mainWindow = new BrowserWindow({
		title: "Electron Project",
		width: 1020,
		height: 900,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false
		},
	});
	mainWindow.loadFile(path.join(__dirname, './public/index.html'));

	ipcMain.on("exit-app", () => {
        if (mainWindow) {
            mainWindow.close(); // Close the main window
        }
    });
}


app.whenReady().then(() => {
	createWindow();
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});


ipcMain.on("open-file-dialog", (event) => {
	console.log("----------------------------------------------------");
	console.log("[app.js] Received event OPEN-FILE-DIALOG");
	dialog.showOpenDialog({
		properties: ["openFile"],
	}).then((result) => {
		if (!result.canceled) {
			const filePath = result.filePaths[0];
			const fileContent = fs.readFileSync(filePath, "utf-8");
			const fileExt = path.extname(filePath);
			const lang = extToLang[fileExt] || "Unknown";
			event.reply("open-file", filePath, fileContent, lang);
			console.log("[app.js] File loaded successfully");
		}
	}).catch((err) => {
		console.log(err);
	});
});


ipcMain.on("save-file-dialog", (event, content) => {
	console.log("----------------------------------------------------");
	console.log("[app.js] Received event save-file-dialog");
	dialog
		.showSaveDialog({
			properties: ["createDirectory"],
		})
		.then((result) => {
			console.log("[app.js] Attempting to save the file ...");
			if (!result.canceled) {
				console.log("[app.js] File saved successfully to new dir.");
				const filePath = result.filePath;
				fs.writeFileSync(filePath, content, "utf-8");
				event.reply("save-file", filePath);
			}
		})
		.catch((err) => {
			console.log(err);
		});
});


ipcMain.on("save-current-file", (event, filePath, content) => {
	console.log('----------------------------------------------------');
	console.log('[app.js] Received event save-current-file');
	try {
        fs.writeFileSync(filePath, content, "utf-8"); // Save directly to the file path
        event.reply("save-file-success", filePath);
        console.log(`[app.js] File saved: ${filePath}`);
    } catch (err) {
        console.error(`[app.js] Failed to save file: ${err}`);
        event.reply("save-file-error", err.message);
    }
});