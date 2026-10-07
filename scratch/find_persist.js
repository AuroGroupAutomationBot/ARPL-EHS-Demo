const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');

lines.forEach((l, i) => {
    if (l.includes('function saveState') || l.includes('function loadState') || l.includes('function resetDemoData') || l.includes('function seedPermits')) {
        console.log(`Line ${i+1}: ${l.trim()}`);
    }
});
