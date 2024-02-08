const fs = require('fs');

async function downloadJson(url, outputPath) {
    try {
        const response = await fetch(url);

        const data = await response.json();

        fs.writeFileSync(outputPath, JSON.stringify(data, null, 4), 'utf-8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('File saved:', outputPath);
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
    return outputPath;
}

module.exports = {
    downloadJson
}