const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

const lines = s.split('\n');
lines.forEach((l, i) => {
    if (l.includes('adminConfig') || l.includes('admin-config') || l.includes('renderAdmin')) {
        console.log(`Line ${i+1}: ${l.trim().slice(0, 100)}`);
    }
});
