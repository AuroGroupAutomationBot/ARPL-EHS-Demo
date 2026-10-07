const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');

lines.forEach((l, i) => {
    if (l.includes('CHECKLIST_ITEMS') || (l.includes('const ') && l.includes('_CHECKLIST'))) {
        console.log(`${i+1}: ${l.trim()}`);
    }
});
