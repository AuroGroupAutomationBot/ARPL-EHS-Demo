const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');

// Extract APP_CONFIG.statuses keys
const cfgMatch = src.match(/statuses:\s*\{([\s\S]*?)\n\s*\},/);
const configStatuses = new Set();
if (cfgMatch) {
    const lines = cfgMatch[1].split('\n');
    lines.forEach(l => {
        const m = l.match(/['"]([^'"]+)['"]\s*:/);
        if (m) configStatuses.add(m[1]);
    });
}
console.log('Defined APP_CONFIG.statuses count:', configStatuses.size);

// Find all p.status = ... or permit.status = ...
const lines = src.split('\n');
const permitStatusAssignments = [];
lines.forEach((l, idx) => {
    // Look for lines that assign to p.status or permit.status
    if (/(?:\bp|\bpermit|\bcurPermit|\bperm)\.status\s*=\s*/.test(l)) {
        permitStatusAssignments.push({ line: idx + 1, content: l.trim() });
    }
});

console.log('Total permit status assignments found:', permitStatusAssignments.length);
const unrecognised = [];
permitStatusAssignments.forEach(item => {
    // check string literal
    const matchLiteral = item.content.match(/(?:\bp|\bpermit|\bcurPermit|\bperm)\.status\s*=\s*['"`]([^'"`]+)['"`]/);
    if (matchLiteral) {
        const val = matchLiteral[1];
        if (!configStatuses.has(val)) {
            unrecognised.push({ line: item.line, val, code: item.content });
        }
    } else {
        // dynamic assignment
        console.log('Dynamic status assignment at line', item.line, ':', item.content);
    }
});

if (unrecognised.length > 0) {
    console.log('🔴 UNDEFINED STATUS ASSIGNED TO PERMIT:');
    unrecognised.forEach(u => console.log(`  Line ${u.line}: "${u.val}" -> ${u.code}`));
} else {
    console.log('✅ All literal permit status assignments are strictly valid in APP_CONFIG.statuses!');
}
