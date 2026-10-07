const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

const terms = ['BASEMENT_PODIUM_OPTIONS', 'SHAFT_FLOORS', 'CONTRACTORS', 'WEATHER', 'TOWERS', 'CONTRACTOR_OPTIONS', 'DEPARTMENTS', 'TRADES'];
terms.forEach(t => {
    let idx = 0;
    while ((idx = s.indexOf(t, idx)) !== -1) {
        const lineNo = s.slice(0, idx).split('\n').length;
        const line = s.slice(s.lastIndexOf('\n', idx) + 1, s.indexOf('\n', idx)).trim();
        console.log(`${t} at line ${lineNo}: ${line.slice(0, 100)}`);
        idx += t.length;
    }
});
