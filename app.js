const { Menu, app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const { getCurrentDateTime, loadDataFromFile } = require("./src/customFunctions");

const extToLang = require(path.join(__dirname, "./src/mapping.js"));
const custFunc = require(path.join(__dirname, "./src/customFunctions.js"));
const filePathText = "./public/command-history.txt";
const filePath = path.join(__dirname, filePathText);
let commandHistory = [];
let historyWindow = null;
let mainWindow = null;
let currDate = null;
const emptyString = '';


function createWindow() {
	mainWindow = new BrowserWindow({
		icon: './images/icon.ico',
        title: "Desktop Quick Access Utility",
        width: 1020,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            devTools: true,
        },
    });
	mainWindow.loadFile(path.join(__dirname, "./public/index.html"));

	ipcMain.on("exit-app", () => {
		if (mainWindow) {
			mainWindow.close(); // Close the main window
		}
	});
}

app.whenReady().then(() => {
	createWindow();
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

// [Menu Template - Start] ------------------------------------------------------- //

const menuTemplate = [
    {
        label: "File",
		submenu: [
			{
                label: "Toggle Developer Tools",
                accelerator: process.platform === 'darwin' ? 'Cmd+Alt+I' : 'Ctrl+Shift+I',
                click: () => {
                    mainWindow.webContents.toggleDevTools();
                }
            },
			{ role: "quit" },
		]
    },
    {
        label: "History",
        submenu: [
            {
                label: "Save History",
                click: () => {
                    saveCommandHistory();
                },
            },
            {
                label: "Clear History",
                click: () => {
                    clearCommandHistory();
                },
            },
            { type: "separator" },
            {
                label: "View History",
                click: () => {
                    console.log("[app.js] Clicked on Viewing History");
					openHistoryWindow();
                },
            },
        ],
    },
];


const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

function saveCommandHistory() {
	const oldHistoryData = loadDataFromFile(filePathText).join("\n");
	const newHistoryData = commandHistory.join("\n");
	const historyData = `${oldHistoryData}\n${newHistoryData}`;
	let lenCurrHistory = commandHistory.length;

	fs.writeFile(filePath, historyData, (err) => {
		if (err) {
			dialog.showErrorBox(
                "Save Error",
                "Failed to save command history."
            );
			console.error("[app.js] Error saving command history:", err);
		} else {
			console.log(lenCurrHistory);
			if(lenCurrHistory) {
				dialog.showMessageBox({
					type: "info",
					title: "Success",
					message: "Command history saved successfully!",
					detail: `Shell Commands History saved successfully`,
				});
				console.log("[app.js] Command history saved successfully.");
			} else {
				dialog.showMessageBox({
                    type: "info",
                    title: "History is Blank",
                    message: "Blank History",
                    detail: `No New command is available to be saved in the History.`,
                });
                console.log("[app.js] Blank History.");
			}

		}
	});
	commandHistory = [];
}


function clearCommandHistory() {
	commandHistory = [];
	
	fs.writeFile(filePath, emptyString, (err) => {
		if(err) {
			console.log('Error occurred while clearing the file.');
		} else {
			console.log('File cleared successfully.');
		}
	});

	dialog.showMessageBox({
        type: "warning",
        title: "Warning",
        message: "Command history cleared successfully!"
    });
	console.log("[app.js] Command history cleared.");
}


function openHistoryWindow() {
    if (historyWindow) {
        historyWindow.focus(); // If the window already exists, focus on it
        return;
    }

    historyWindow = new BrowserWindow({
        icon: "./images/history.ico",
        width: 600,
        height: 600,
        title: "Command History",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
        },
    });

	// historyWindow.openDevTools();

    historyWindow.loadFile(path.join(__dirname, "./public/history.html")); // Load the HTML file for displaying history
    historyWindow.on("closed", () => {
        historyWindow = null;
    });

    // Send the command history to the new window
    historyWindow.webContents.on("did-finish-load", () => {
		let historyData = custFunc.loadDataFromFile("./public/command-history.txt");
        historyWindow.webContents.send("load-history", historyData);
    });
}

// [Menu Template - Start] ------------------------------------------------------- //

// [IPC Main Controls - Start] ------------------------------------------------------- //

ipcMain.on("open-file-dialog", (event) => {
	console.log("----------------------------------------------------");
	console.log("[app.js] Received event OPEN-FILE-DIALOG");
	dialog
		.showOpenDialog({
			properties: ["openFile"],
		})
		.then((result) => {
			if (!result.canceled) {
				const filePath = result.filePaths[0];
				const fileContent = fs.readFileSync(filePath, "utf-8");
				const fileExt = path.extname(filePath);
				const lang = extToLang[fileExt] || "Unknown";
				event.reply("open-file", filePath, fileContent, lang);
				console.log("[app.js] File loaded successfully");
			}
		})
		.catch((err) => {
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
	console.log("----------------------------------------------------");
	console.log("[app.js] Received event save-current-file");
	try {
		fs.writeFileSync(filePath, content, "utf-8"); // Save directly to the file path
		event.reply("save-file-success", filePath);
		console.log(`[app.js] File saved: ${filePath}`);
	} catch (err) {
		console.error(`[app.js] Failed to save file: ${err}`);
		event.reply("save-file-error", err.message);
	}
});

ipcMain.on("execute-command", (event, command) => {
	currDate = new Date();
	try {
		console.log("----------------------------------------------------");
		console.log(
			`[app.js] Received event execute-command -- command received '${command}'`
		);
		if (command === "") {
			event.reply(
				"command-result",
				"No command provided. No results to be displayed."
			);
		} else {
			exec(command, (error, stdout, stderr) => {
				console.log("[app.js] Executing Command ...");
				commandHistory.push(`${command}|${currDate.toLocaleString()}`);
				console.log("[app.js] Command History Saved ...");
				console.log(commandHistory);
				if (error) {
					console.error(`exec error: ${error}`);
					event.reply("command-result", `Error: ${error.message}`);
					return;
				}
				if (stderr) {
					console.error(`stderr: ${stderr}`);
					event.reply("command-result", `Error: ${stderr}`);
					return;
				}
				// Send the command output back to the renderer process
				// console.log(stdout);
				event.reply("command-result", stdout);
			});
		}
	} catch (error) {
		console.log(`Error: ${error.message}`);
	}
});

ipcMain.on("run-as-different-user", (event, userID, password, appPath) => {
	console.log("----------------------------------------------------");
	console.log(
		`[app.js] Running application as a different user: UserID: ${userID}`
	);
	console.log(
		`[app.js] Running application as a different user: Password: ${password}`
	);
	console.log(
		`[app.js] Running application as a different user: app path: ${appPath}`
	);
	event.reply(
		"command-result",
		"Sending results blah blah blah blah blah ..."
	);
});

// [IPC Main Controls - End  ] ------------------------------------------------------- //
