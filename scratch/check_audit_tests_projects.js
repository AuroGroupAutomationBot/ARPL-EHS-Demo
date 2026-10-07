const fs = require('fs');
const s = fs.readFileSync('tests/run_extended_audit_tests.js', 'utf8');

const lines = s.split('\n');
lines.forEach((l, i) => {
    if (l.includes('PROJECTS')) {
        console.log(`Line ${i+1}: ${l}`);
    }
});
