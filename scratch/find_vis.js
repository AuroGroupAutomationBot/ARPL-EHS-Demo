const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');

lines.forEach((l, i) => {
    if (l.includes('function isPermitVisibleToRole')) {
        console.log(`Line ${i+1}: ${l.trim()}`);
    }
});
