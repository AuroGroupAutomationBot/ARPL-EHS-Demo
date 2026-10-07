const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');

// Find all seed helper functions like base(), baseHotwork(), etc.
const matches = src.match(/function\s+(base[A-Za-z0-9_]*)\s*\(/g) || [];
console.log('Seed generator helpers:', matches);

// Check which permit types appear in seedPermits
const seedMatch = src.match(/function seedPermits\s*\(\)\s*\{([\s\S]*?)\n\s*function init\s*\(/);
if (seedMatch) {
    const seedBody = seedMatch[1];
    const ptypes = new Set();
    const ptypeMatches = seedBody.match(/ptype:\s*['"]([^'"]+)['"]/g) || [];
    ptypeMatches.forEach(m => ptypes.add(m.replace(/ptype:\s*['"]/, '').replace(/['"]/, '')));
    
    // Also check activities or form codes
    const actMatches = seedBody.match(/PTW-\d+[A-Z]?/g) || [];
    console.log('PTW codes in seed:', [...new Set(actMatches)]);
    console.log('Explicit ptypes in seed:', [...ptypes]);
}
