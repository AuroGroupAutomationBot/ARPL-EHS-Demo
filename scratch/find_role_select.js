const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');

lines.forEach((l, i) => {
    if (l.includes('role-card') || l.includes('roleGrid') || l.includes('renderRoles') || l.includes('selectRole(') || l.includes('chooseRole(')) {
        console.log(`Line ${i+1}: ${l.trim()}`);
    }
});
