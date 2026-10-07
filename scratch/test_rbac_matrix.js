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

console.log('=== EXHAUSTIVE RBAC MATRIX AUDIT ===\n');

const roles = evalInVM('ROLES').map(r => r.key);
console.log('Roles tested:', roles.join(', '));

// Test various permit states
const testPermits = [
    { name: 'Excavation Parallel', p: { status: 'Pending Parallel Approval', approvals: evalInVM(`newChain('excavation')`) }, expected: ['mep', 'pm', 'it'] },
    { name: 'Excavation Section Head', p: { status: 'Pending Section Head', approvals: evalInVM(`(function(){ const c = newChain('excavation'); c.mep.status = 'approved'; c.pm.status = 'approved'; c.it.status = 'approved'; return c; })()`) }, expected: ['excavation-head'] },
    { name: 'Hot Work Section Head', p: { status: 'Pending Section Head', approvals: evalInVM(`newChain('hotwork')`) }, expected: ['hw-section-head'] },
    { name: 'Hot Work EHS', p: { status: 'Pending EHS Approval', approvals: evalInVM(`(function(){ const c = newChain('hotwork'); c.sectionHead.status = 'approved'; return c; })()`) }, expected: ['ehs-manager', 'ehs-officer'] },
    { name: 'Batching Plant PM', p: { status: 'Pending P&M Approval', approvals: evalInVM(`newChain('electrical-batching')`) }, expected: ['pm'] },
    { name: 'Batching Plant QE', p: { status: 'Pending Quality Engineer Approval', approvals: evalInVM(`(function(){ const c = newChain('electrical-batching'); c.pm.status = 'approved'; return c; })()`) }, expected: ['quality-engineer'] },
    { name: 'Critical Lift PM Exec', p: { status: 'Pending Project Manager Acknowledgment', approvals: evalInVM(`(function(){ const c = newChain('liftplan'); c.pm.status = 'approved'; c.sectionHead.status = 'approved'; return c; })()`) }, expected: ['project-manager'] },
    { name: 'Night Shift Handover', p: { status: 'Approved – Pending Night Handover', approvals: evalInVM(`(function(){ const c = newChain('nightshift'); c.sectionHead.status = 'approved'; return c; })()`) }, expected: ['night-supervisor'] },
    { name: 'Night Shift P&M Night', p: { status: 'Pending P&M Night Acknowledgment', approvals: evalInVM(`(function(){ const c = newChain('nightshift'); c.sectionHead.status = 'approved'; c.nightHandover.status = 'approved'; return c; })()`) }, expected: ['pm'] }
];

let totalChecks = 0;
let passedChecks = 0;
let failures = [];

testPermits.forEach(tc => {
    roles.forEach(r => {
        totalChecks++;
        const canAct = evalInVM(`roleCanActOnChain(${JSON.stringify(tc.p)}, '${r}')`);
        const shouldAct = tc.expected.includes(r);
        if (canAct === shouldAct) {
            passedChecks++;
        } else {
            failures.push({ test: tc.name, role: r, canAct, shouldAct });
        }
    });
});

console.log(`RBAC Checks: ${passedChecks} / ${totalChecks} PASSED`);
if (failures.length > 0) {
    console.log('🔴 RBAC Gate Failures:');
    failures.forEach(f => console.log(`  [${f.test}] Role '${f.role}' -> got ${f.canAct}, expected ${f.shouldAct}`));
} else {
    console.log('✅ 100% RBAC Gating Accuracy: Unauthorized roles are blocked with 0 leakages!');
}
