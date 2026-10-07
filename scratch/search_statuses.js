const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');
const targets = ['Pending EHS Clearance', 'Pending Site Engineer', 'Permit Cancelled', 'Pending '];

targets.forEach(t => {
    console.log('=== Target: ' + t + ' ===');
    lines.forEach((l, idx) => {
        if (l.includes(t)) {
            console.log(`${idx+1}: ${l.trim()}`);
        }
    });
});
