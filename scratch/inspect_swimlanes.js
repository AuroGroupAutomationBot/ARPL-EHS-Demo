const fs = require('fs');
const s = fs.readFileSync('ptw_swimlanes.html', 'utf8');

const scriptMatches = [...s.matchAll(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/gi)];
console.log('Script tags in ptw_swimlanes.html:', scriptMatches.length);
scriptMatches.forEach((m, i) => console.log(`Script ${i}: length ${m[1].length}`));
