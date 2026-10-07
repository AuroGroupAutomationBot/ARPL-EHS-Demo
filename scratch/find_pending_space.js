const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');
lines.forEach((l, i) => {
    if (l.includes("status = 'Pending ") || l.includes('status: "Pending ') || l.includes("status: 'Pending ") || l.includes('.status = "Pending ')) {
        const m = l.match(/(?:\.status|\bstatus)\s*[:=]\s*['"`](Pending\s*[^'"`]*)['"`]/);
        if (m && m[1].trim() === 'Pending') {
            console.log(`Line ${i+1}: ${l.trim()}`);
        }
    }
});
