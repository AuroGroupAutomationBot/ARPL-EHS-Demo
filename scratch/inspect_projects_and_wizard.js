const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

// Find line number of PROJECTS
const lines = s.split('\n');
lines.forEach((l, i) => {
    if (l.includes('let PROJECTS =') || l.includes('const PROJECTS =')) {
        console.log(`PROJECTS declaration at line ${i+1}:`);
        console.log(lines.slice(i, i + 50).join('\n'));
    }
});

// Check where inProject or onProjectChange or inTower is populated
lines.forEach((l, i) => {
    if (l.includes('function onProjectChange') || l.includes('populateProject') || l.includes('inTower') && l.includes('innerHTML') || l.includes('inContractor')) {
        console.log(`Line ${i+1}: ${l.trim().slice(0, 100)}`);
    }
});
