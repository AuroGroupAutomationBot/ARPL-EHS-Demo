const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');

['Pending EHS Clearance', 'Permit Cancelled'].forEach(term => {
    console.log('=== SEARCH: ' + term + ' ===');
    lines.forEach((l, i) => {
        if (l.includes(term)) console.log(`${i+1}: ${l.trim()}`);
    });
});

console.log('=== SEARCH: Pending Site Engineer without Acknowledgment ===');
lines.forEach((l, i) => {
    if (l.includes('Pending Site Engineer') && !l.includes('Pending Site Engineer Acknowledgment') && !l.includes('Pending Site Engineer Re-Acknowledgment')) {
        console.log(`${i+1}: ${l.trim()}`);
    }
});
