const fs = require("fs");
const path = require("path");

function loadDataFromFile(filePath) {
    const inputFile = path.join(__dirname, filePath);

    try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const list = fileContent
            .split("\n")
            .filter((item) => item.trim() !== ""); // Split by newlines and filter out empty lines
        // if (list.length === 0) {
        //     list.push('No history available to display');
        // }
        console.log("[customFunctions.js] List loaded from file");
        return list;
    } catch (err) {
        console.error("[customFunctions.js] Error loading list from file:", err);
        return [];
    }
}

function getCurrentDateTime() {
    console.log("[customFunction.js] calling getCurrentDateTime() function ...");
    let currDate = new Date();

    let date = currDate.getDate();
    let month = currDate.getMonth();
    let year = currDate.getFullYear();
    let hour = currDate.getHours();
    let mins = currDate.getMinutes();
    let secs = currDate.getSeconds();

    let datetimeString = `${year}-${month}-${date} ${hour}:${mins}:${secs}`;

    return datetimeString;
}

module.exports = { loadDataFromFile, getCurrentDateTime };
