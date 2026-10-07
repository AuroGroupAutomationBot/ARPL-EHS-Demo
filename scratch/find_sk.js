const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');
lines.forEach((l, i) => {
    if (l.includes('STORAGE_KEY')) {
        console.log(`${i+1}: ${l.trim()}`);
    }
});
