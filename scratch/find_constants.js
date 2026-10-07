const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

const identifiers = ['PROJECTS', 'ROLES', 'TOWERS', 'CONTRACTORS', 'PTYPE_META', 'APP_CONFIG', 'PERMITS'];
identifiers.forEach(name => {
    let pos = 0;
    console.log(`=== Matches for ${name} ===`);
    let count = 0;
    while ((pos = s.indexOf(name, pos)) !== -1 && count < 3) {
        const lineStart = s.lastIndexOf('\n', pos) + 1;
        const lineEnd = s.indexOf('\n', pos);
        const lineNo = s.slice(0, pos).split('\n').length;
        console.log(`Line ${lineNo}: ${s.slice(lineStart, lineEnd).trim()}`);
        pos += name.length;
        count++;
    }
});
