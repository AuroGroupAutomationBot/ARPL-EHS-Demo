const fs = require('fs');

let s = fs.readFileSync('index.html', 'utf8');

const oldDecl = `const STAGE1_MS = 45 * 1000;   // demo Stage-1 escalation window`;
const oldDecl2 = `const STAGE2_MS = 120 * 1000;  // demo Stage-2 escalation window`;

console.log('oldDecl found:', s.indexOf(oldDecl));
console.log('oldDecl2 found:', s.indexOf(oldDecl2));

const newDecl = `let STAGE1_MS = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sla && APP_CONFIG.sla.mode === 'production')
            ? (APP_CONFIG.sla.stage1MsProd || 2 * 3600 * 1000)
            : ((typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sla && APP_CONFIG.sla.stage1Ms) || 45 * 1000);
        let STAGE2_MS = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sla && APP_CONFIG.sla.mode === 'production')
            ? (APP_CONFIG.sla.stage2MsProd || 4 * 3600 * 1000)
            : ((typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sla && APP_CONFIG.sla.stage2Ms) || 120 * 1000);`;

// Replace both
const combinedOld = `${oldDecl}\r\n        ${oldDecl2}`;
const combinedOldLf = `${oldDecl}\n        ${oldDecl2}`;

if (s.includes(combinedOld)) {
    s = s.replace(combinedOld, newDecl);
    console.log('Replaced combinedOld with newDecl (CRLF)');
} else if (s.includes(combinedOldLf)) {
    s = s.replace(combinedOldLf, newDecl);
    console.log('Replaced combinedOldLf with newDecl (LF)');
} else {
    // Single replace
    s = s.replace(oldDecl, `let STAGE1_MS = 45 * 1000;`);
    s = s.replace(oldDecl2, `let STAGE2_MS = 120 * 1000;`);
    console.log('Replaced individual const with let');
}

fs.writeFileSync('index.html', s);
console.log('Updated index.html successfully!');
