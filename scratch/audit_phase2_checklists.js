const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync('index.html', 'utf8');
const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);

const mockDoc = {
    getElementById: (id) => ({ id, innerHTML: '', value: '', style: {}, classList: { add: () => {}, remove: () => {}, toggle: () => {} }, setAttribute: () => {}, getAttribute: () => null, dataset: {} }),
    querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, body: { classList: { add: () => {}, remove: () => {} } }
};
const sandbox = {
    window: {}, document: mockDoc, console: { log: () => {}, warn: () => {}, error: () => {} },
    setTimeout: (fn) => setTimeout(fn, 0), clearTimeout: () => {}, setInterval: () => {}, clearInterval: () => {},
    localStorage: { _data: {}, getItem: (k) => null, setItem: () => {}, removeItem: () => {} },
    navigator: { geolocation: {} }, Date, Math, parseInt, parseFloat, isNaN, isFinite, alert: () => {}, confirm: () => true
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

const evalInVM = (code) => vm.runInContext(code, sandbox);

console.log('=== PHASE 2: CHECKLIST ITEM COUNTS & RESOLUTION ===\n');

const checks = [
    { ptype: 'excavation', arg: null, expected: 12, name: 'PTW-001 Excavation' },
    { ptype: 'hotwork', arg: null, expected: 20, name: 'PTW-002 Hot Work' },
    { ptype: 'guardrail', arg: null, expected: 9, name: 'PTW-003 Guard Rail' },
    { ptype: 'confined', arg: null, expected: 15, name: 'PTW-004 Confined Space' },
    { ptype: 'shaft', arg: null, expected: 10, name: 'PTW-005 Shaft Work' },
    { ptype: 'electrical', arg: null, expected: 14, name: 'PTW-006 Electrical Work' },
    { ptype: 'blasting', arg: null, expected: 21, name: 'PTW-007 Drilling & Blasting' },
    { ptype: 'general', arg: 'Erection of Glass Panel', expected: 17, name: 'PTW-008 General (Panel)' },
    { ptype: 'general', arg: 'Passenger & Material Hoist Shifting', expected: 13, name: 'PTW-008 General (Hoist)' },
    { ptype: 'general', arg: 'Formwork Erection(shuttering)', expected: 15, name: 'PTW-008 General (Formwork)' },
    { ptype: 'general', arg: 'Other', expected: 9, name: 'PTW-008 General (Common)' },
    { ptype: 'lifting', arg: null, expected: 14, name: 'PTW-009 Lifting Operations' },
    { ptype: 'liftplan', arg: null, expected: 14, name: 'PTW-009B Critical Lift' },
    { ptype: 'nightshift', arg: null, expected: 13, name: 'PTW-010 Night Shift' }
];

checks.forEach(c => {
    const list = evalInVM(`checklistFor('${c.ptype}', ${JSON.stringify(c.arg)})`);
    const count = list ? list.length : 0;
    const match = count === c.expected ? '✅' : '🔴 MISMATCH';
    console.log(`${match} ${c.name}: got ${count} items (expected ${c.expected})`);
});
