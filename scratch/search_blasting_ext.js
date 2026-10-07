const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');

lines.forEach((l, i) => {
    if (l.includes('dbOperationType') || l.includes('drillingBlastingType')) {
        if (l.includes('ext') || l.includes('Ext') || l.includes('validTill')) {
            console.log(`${i+1}: ${l.trim()}`);
        }
    }
});
