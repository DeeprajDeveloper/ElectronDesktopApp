document.addEventListener('DOMContentLoaded', () => {
	
	// GUI - button elements
	const openBtn = document.getElementById("openBtn");
	const saveBtn = document.getElementById("saveBtn");
	const saveCurrBtn = document.getElementById("saveCurrBtn");
	const exitBtn = document.getElementById("exitBtn");
	const clearBtn = document.getElementById("clearBtn");
	
	// GUI - data elements
	const spanFilepath = document.getElementById("filepath");
	const editor = document.getElementById("editor");
		
	// data storage variable
	let currentFilePath = null;
	
	openBtn.addEventListener("click", () => {
		console.log("[renderer.js] Clicked OPEN button...");
		window.api.send("open-file-dialog");
	});


	saveBtn.addEventListener("click", () => {
		console.log("[renderer.js] Clicked SAVE button...");
		const content = editor.value;
		if(content != '') {
			window.api.send("save-file-dialog", content);
		} else {
			alert("No data available in the editor to save.");
		}
	});


	saveCurrBtn.addEventListener("click", () => {
        console.log("[renderer.js] Clicked SAVE-CURR-FILE button...");
        const content = editor.value;
        if (content != '') {
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
		spanFilepath.innerText = '';
		editor.value = '';
		currentFilePath = null;
		content = null;
    });

	
	exitBtn.addEventListener("click", () => {
        window.api.send("exit-app"); // Send a message to the main process to exit
    });

	window.api.receive("save-file-success", (event, filePath) => {
        console.log(`File saved successfully.`);
        alert('File Saved !');
    });

    window.api.receive("save-file-error", (event, errorMessage) => {
        console.error(`Failed to save file: ${errorMessage}`);
        alert(`Error saving file: ${errorMessage}`);
    });
});

