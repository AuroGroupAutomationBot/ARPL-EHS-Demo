const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');

lines.forEach((l, i) => {
    if (l.includes('gas') || l.includes('Gas') || l.includes('O2') || l.includes('LEL') || l.includes('H2S') || l.includes('extension') || l.includes('nightShift')) {
        if (l.includes('function ') || l.includes('validate') || l.includes('prohibit') || l.includes('extensionCap')) {
            console.log(`${i+1}: ${l.trim()}`);
        }
    }
});
