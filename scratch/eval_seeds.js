const fs = require('fs');
const path = require('path');
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

const permits = evalInVM('PERMITS');
console.log('Total seeded permits:', permits.length);

const byType = {};
const byStatus = {};
permits.forEach(p => {
    const pt = evalInVM(`ptypeOf(${JSON.stringify(p)})`);
    byType[pt] = (byType[pt] || 0) + 1;
    byStatus[p.status] = (byStatus[p.status] || 0) + 1;
});

console.log('\nSeeded permits by type:');
Object.keys(byType).forEach(t => console.log(`  ${t}: ${byType[t]}`));

console.log('\nSeeded permits by status:');
Object.keys(byStatus).forEach(s => console.log(`  ${s}: ${byStatus[s]}`));
