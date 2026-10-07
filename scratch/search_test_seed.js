const fs = require('fs');
const path = require('path');
const testsDir = path.resolve('tests');
const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.js'));

files.forEach(f => {
    const content = fs.readFileSync(path.join(testsDir, f), 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, i) => {
        if (l.includes('seedPermits')) {
            console.log(`${f}:${i+1}: ${l.trim()}`);
        }
    });
});
