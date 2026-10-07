const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const lines = src.split('\n');

lines.forEach((l, i) => {
    if (l.includes('buildNav') || l.includes('Create Permit') || l.includes('navContainer') || l.includes('nav-item')) {
        if (l.includes('function buildNav') || l.includes('navCreate') || l.includes('navItemsFor') || l.includes('initiator') || l.includes('create')) {
            console.log(`Line ${i+1}: ${l.trim()}`);
        }
    }
});
