import JSZip from "jszip";

// Helper functions to format date (YYYY-MM-DD)
export function formatDate(dateString) {
    if (dateString == null) return "";
    // Create a new Date object from the date string
    let date = new Date(dateString);
    // Get the year, month and day from the date object
    let year = date.getFullYear();
    let month = date.getMonth() + 1; // Month is zero-based, so add one
    let day = date.getDate();
    // Pad the month and day with leading zeros if needed
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    // Return the formatted date string
    return year + "-" + month + "-" + day;
}

// Helper function to format a name (LAST, first)
export function formatName(last_name, first_name) {
    if (last_name == null || first_name == null) return "";
    return last_name.toUpperCase() + ", " + first_name;
}

// Helper function to format an enum
export function formatEnum(val) {
    if (val == null) return "";
    return val
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

// Helper function to add non-duplicate items to an array
export function addUnique(arr, item) {
    if (arr.indexOf(item) === -1) {
        arr.push(item);
    }
}

// Helper function to download CSV file
export function downloadCSV(csvString, filename) {
    // If csv is empty, do nothing
    if (csvString == null || csvString.length === 0) return;

    // Check if filename ends with .csv
    if (!filename.endsWith(".csv")) filename += ".csv";

    // CSV file
    // Download link
    let downloadLink = document.createElement("a");
    // File name
    downloadLink.download = filename;
    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(
        new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    );
    // Hide download link
    downloadLink.style.display = "none";
    // Add the link to DOM
    document.body.appendChild(downloadLink);
    // Click download link
    downloadLink.click();
    // Delete the link from DOM
    document.body.removeChild(downloadLink);
}

// Helper function to format string for CSV
export function formatCSVString(str) {
    // If string is empty, return empty string
    if (str == null || str.length === 0) return "";
    // If string contains a double quote, replace with two double quotes
    if (str.indexOf('"') !== -1) str = str.replace(/"/g, '""');
    // If string contains a comma, replace with
    if (str.indexOf(",") !== -1) str = str.replace(/,/g, ",");
    // If string contains a newline, replace with \\n
    if (str.indexOf("\n") !== -1) str = str.replace(/\n/g, "\\n");
    // If string contains a carriage return, replace with \\r
    if (str.indexOf("\r") !== -1) str = str.replace(/\r/g, "\\r");
    // If string contains a tab, replace with \\t
    if (str.indexOf("\t") !== -1) str = str.replace(/\t/g, "\\t");
    // Otherwise, return string
    return `"${str}"`;
}

// Helper function to download ZIP file
export async function downloadZIP(zipString, filename) {
    // If zip is empty, do nothing
    if (zipString == null || zipString.length === 0) return;

    // Check if filename ends with .zip
    if (!filename.endsWith(".zip")) filename += ".zip";

    // ZIP file

    // Convert base64 string to blob
    const zip = new JSZip();
    await zip.loadAsync(zipString, { base64: true });
    const blob = await zip.generateAsync({ type: "blob" });

    // Download link
    let downloadLink = document.createElement("a");
    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(blob);
    // File name
    downloadLink.download = filename;
    // Hide download link
    downloadLink.style.display = "none";
    // Add the link to DOM
    document.body.appendChild(downloadLink);
    // Click download link
    downloadLink.click();
    // Delete the link from DOM
    document.body.removeChild(downloadLink);
}

export function formatText(text) {
    if (text === null) {
        return "";
    } else {
        return text;
    }
}
