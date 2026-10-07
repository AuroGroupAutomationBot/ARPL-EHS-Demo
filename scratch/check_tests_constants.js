const fs = require('fs');
const path = require('path');

const testDir = path.resolve('tests');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.js'));

const identifiers = ['PROJECTS', 'BASEMENT_PODIUM_OPTIONS', 'SHAFT_FLOORS', 'STAGE1_MS', 'STAGE2_MS', 'WEATHER_OPTIONS'];

identifiers.forEach(id => {
    console.log(`=== Matches for ${id} in tests/ ===`);
    files.forEach(f => {
        const content = fs.readFileSync(path.join(testDir, f), 'utf8');
        if (content.includes(id)) {
            console.log(`  in ${f}`);
        }
    });
});
