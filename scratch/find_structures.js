const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');

// Find project declaration
const projectMatch = s.match(/(?:let|var|const)\s+PROJECTS\s*=\s*(\[[\s\S]*?\]);/);
if (projectMatch) {
    console.log('PROJECTS definition length:', projectMatch[0].length);
    console.log(projectMatch[0].slice(0, 300));
} else {
    console.log('PROJECTS not found with simple regex');
    // search for PROJECTS =
    let idx = 0;
    while ((idx = s.indexOf('PROJECTS =', idx)) !== -1) {
        console.log('PROJECTS = at:', s.slice(idx - 20, idx + 100));
        idx += 10;
    }
}

// Find HTML select tags and their options
const selectMatches = [...s.matchAll(/<select[^>]*id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/select>/gi)];
console.log(`\nFound ${selectMatches.length} <select> elements in HTML markup:`);
selectMatches.forEach(m => {
    console.log(`Select id: ${m[1]}, has ${m[2].split('<option').length - 1} options`);
    if (m[1].includes('tower') || m[1].includes('contractor') || m[1].includes('project') || m[1].includes('weather')) {
        console.log(`  Preview:`, m[2].trim().slice(0, 200).replace(/\s+/g, ' '));
    }
});
