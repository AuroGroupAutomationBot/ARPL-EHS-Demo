const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');

lines.forEach((l, i) => {
    if (l.includes('const PTYPE_META') || l.includes('const PERMIT_TYPES') || l.includes('locationModes') || l.includes('LOCATION_MODES')) {
        console.log(`${i+1}: ${l.trim()}`);
    }
});
