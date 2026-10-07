const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

const lines = s.split('\n');
lines.forEach((l, i) => {
    if (l.includes('checkEscalations') || l.includes('escalat') || l.includes('Stage 1') || l.includes('Stage 2') || l.includes('45 * 1000') || l.includes('120 * 1000')) {
        if (l.includes('function') || l.includes('const') || l.includes('let') || l.includes('if (diff')) {
            console.log(`Line ${i+1}: ${l.trim().slice(0, 100)}`);
        }
    }
});
