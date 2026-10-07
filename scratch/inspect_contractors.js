const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

// Find occurrences of contractor company names or arrays
const names = ['Apex', 'L&T', 'Shapoorji', 'Contractor', 'contractor'];
names.forEach(n => {
    let count = 0;
    let idx = 0;
    while ((idx = s.indexOf(n, idx)) !== -1 && count < 5) {
        const lineNo = s.slice(0, idx).split('\n').length;
        const line = s.slice(s.lastIndexOf('\n', idx) + 1, s.indexOf('\n', idx)).trim();
        console.log(`${n} at Line ${lineNo}: ${line.slice(0, 100)}`);
        idx += n.length;
        count++;
    }
});
