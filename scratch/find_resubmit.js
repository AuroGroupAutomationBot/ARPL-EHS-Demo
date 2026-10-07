const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');

lines.forEach((l, i) => {
    if (l.includes('function resubmit') || l.includes('function rejectPermit') || l.includes('staleApprovals') || l.includes('fast-track') || l.includes('Previously Approved')) {
        console.log(`Line ${i+1}: ${l.trim()}`);
    }
});
