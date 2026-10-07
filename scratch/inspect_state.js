const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

const lines = s.split('\n');
lines.forEach((l, i) => {
    if (l.includes('function saveState') || l.includes('function loadState') || l.includes('function resetDemoData')) {
        console.log(`Line ${i+1}: ${l.trim().slice(0, 100)}`);
    }
});
