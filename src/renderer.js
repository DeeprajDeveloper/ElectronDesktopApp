document.addEventListener('DOMContentLoaded', () => {
    // GUI - button elements
    const openBtn = document.getElementById("openBtn");
    const saveBtn = document.getElementById("saveBtn");
    const saveCurrBtn = document.getElementById("saveCurrBtn");
    const exitBtn = document.getElementById("exitBtn");
    const clearBtn = document.getElementById("clearBtn");
    const cmdCallBtn = document.getElementById("cmdBtnIPConfig");
    const cmdCustomCallBtn = document.getElementById("cmdBtnCustom");

    // GUI - data elements
    const spanFilepath = document.getElementById("filepath");
    const spanCmdResult = document.getElementById("cmd-display");
    const editor = document.getElementById("editor");
    const cmdInput = document.getElementById("inpCommand");

    // Model elements
    const credentialsModal = document.getElementById("credentialsModal");
    const closeModal = document.querySelector(".close");
    const submitCredentials = document.getElementById("submitCredentials");

    // data storage variable
    let currentFilePath = null;

    openBtn.addEventListener("click", () => {
        console.log("[renderer.js] Clicked OPEN button...");
        window.api.send("open-file-dialog");
    });

    saveBtn.addEventListener("click", () => {
        console.log("[renderer.js] Clicked SAVE button...");
        const content = editor.value;
        if (content != "") {
            window.api.send("save-file-dialog", content);
        } else {
            alert("No data available in the editor to save.");
        }
    });

    saveCurrBtn.addEventListener("click", () => {
        console.log("[renderer.js] Clicked SAVE-CURR-FILE button...");
        const content = editor.value;
        if (content != "") {
            if (currentFilePath) {
                console.log(`[renderer.js] File path: ${currentFilePath}`);
                window.api.send("save-current-file", currentFilePath, content);
            } else {
                console.log("No file opened to save.");
            }
        } else {
            alert("No data available in the editor to save.");
        }
    });

    window.api.receive("open-file", (filePath, fileContent, lang) => {
        console.log("[renderer.js] 'span' element updated...");
        currentFilePath = filePath;
        spanFilepath.innerText = `File Path: ${filePath} | Language: ${lang}`;
        editor.value = fileContent;
    });

    clearBtn.addEventListener("click", () => {
        console.log("[renderer.js] Clearing content");
        spanFilepath.innerText = "";
        editor.value = "";
        currentFilePath = null;
        content = null;
    });

    exitBtn.addEventListener("click", () => {
        window.api.send("exit-app"); // Send a message to the main process to exit
    });

    window.api.receive("save-file-success", () => {
        console.log(`File saved successfully.`);
        alert("File Saved !");
    });

    window.api.receive("save-file-error", (event, errorMessage) => {
        console.error(`Failed to save file: ${errorMessage}`);
        alert(`Error saving file: ${errorMessage}`);
    });


    cmdCustomCallBtn.addEventListener("click", () => {
        console.log("[renderer.js] Clicked 'RUN CMD' button...");
        window.api.sendCommand("execute-command", cmdInput.value);
    });

    window.api.receive("command-result", (result) => {
        console.log("[renderer.js] Receiving results for IPCONFIG button...");
        // console.log(`[renderer.js] Displaying Results: ${result}`);
        spanCmdResult.innerText = result;
    });


	cmdCallBtn.addEventListener("click", () => {
		console.log("[renderer.js] Clicked 'Launch SSMS as Different User' button... Launching Model.");
		console.log("[renderer.js] Launching Model.");
		credentialsModal.style.display = "block";
		// window.api.sendCommand("execute-command", 'ipconfig');
	});


    // Close the modal when the "x" button is clicked
    closeModal.addEventListener("click", () => {
		console.log("[renderer.js] Closing Model.");
        credentialsModal.style.display = "none";
    });

    // Close the modal when clicking outside of it
    window.addEventListener("click", (event) => {
		if (event.target === credentialsModal) {
			console.log("[renderer.js] Clicked outside the model ...");
            credentialsModal.style.display = "none";
        }
    });

    // Handle form submission
    submitCredentials.addEventListener("click", () => {
		console.log("[renderer.js] Clicked 'RUN APPLICATION' button ...");
        
		const userID = document.getElementById("userID").value;
        const password = document.getElementById("password").value;
        const appPath = document.getElementById("appPath").value;
		
		console.log(`[renderer.js] Data Captured from model. Username: ${userID}`);

        if (userID && password && appPath) {
            // Send data to main process
            window.api.send("run-as-different-user", userID, password, appPath);

            // Close the modal
            credentialsModal.style.display = "none";
        } else {
            alert("Please fill in all fields.");
        }
    });
});

