const fs = require('fs');
const path = require('path');
const vm = require('vm');

const srcPath = path.resolve('c:/Users/MohithSai.G/Downloads/ARPL-EHS-Demo/index.html');
const src = fs.readFileSync(srcPath, 'utf8');

console.log('=== PHASE 1 AUDIT EXECUTION ===\n');

// 1. Extract script and evaluate in VM
const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
    console.error('Failed to extract script from index.html');
    process.exit(1);
}

const mockDoc = {
    getElementById: (id) => ({
        id,
        innerHTML: '',
        value: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {} },
        setAttribute: () => {},
        getAttribute: () => null,
        dataset: {}
    }),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
    body: { classList: { add: () => {}, remove: () => {} } }
};

const sandbox = {
    window: {},
    document: mockDoc,
    console: { log: () => {}, warn: () => {}, error: () => {}, info: () => {} },
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    localStorage: {
        _data: {},
        getItem: function(k) { return this._data[k] || null; },
        setItem: function(k, v) { this._data[k] = String(v); },
        removeItem: function(k) { delete this._data[k]; },
        clear: function() { this._data = {}; }
    },
    navigator: { geolocation: {} },
    Date: Date,
    Math: Math,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    isFinite: isFinite,
    alert: () => {},
    confirm: () => true,
    prompt: () => ''
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

const evalInVM = (code) => vm.runInContext(code, sandbox);

const APP_CONFIG = evalInVM('APP_CONFIG');
const ROLES = evalInVM('ROLES');

console.log('--- 1.1.1 Status Count & Definition ---');
const statusKeys = Object.keys(APP_CONFIG.statuses || {});
console.log(`Total statuses defined in APP_CONFIG.statuses: ${statusKeys.length}`);
statusKeys.forEach((s, idx) => console.log(`  ${idx + 1}. "${s}" (class: ${APP_CONFIG.statuses[s].class}, category: ${APP_CONFIG.statuses[s].category})`));

console.log('\n--- 1.1.5 Check status assignments throughout code ---');
const statusAssignRegex = /(?:\.status|\bstatus)\s*[:=]\s*['"`]([^'"`]+)['"`]/g;
let match;
const usedStatuses = new Set();
while ((match = statusAssignRegex.exec(scriptMatch[1])) !== null) {
    const val = match[1];
    if (['active', 'draft', 'returned', 'ehs', 'parallel', 'sectionhead', 'completed', 'expired', 'cancelled', 'all'].includes(val)) {
        continue;
    }
    if (statusKeys.includes(val) || val.includes('Pending') || val.includes('Active') || val.includes('Draft') || val.includes('Closed') || val.includes('Completed') || val.includes('Returned') || val.includes('Expired') || val.includes('Cancelled')) {
        usedStatuses.add(val);
    }
}

const undefinedStatuses = [];
usedStatuses.forEach(s => {
    if (!APP_CONFIG.statuses[s]) {
        undefinedStatuses.push(s);
    }
});
console.log(`Total unique status values found in code: ${usedStatuses.size}`);
if (undefinedStatuses.length > 0) {
    console.log('🔴 BUG DETECTED: Statuses assigned in code that are NOT in APP_CONFIG.statuses:');
    undefinedStatuses.forEach(s => console.log(`  - "${s}"`));
} else {
    console.log('✅ All assigned statuses exist in APP_CONFIG.statuses');
}

console.log('\n--- 1.2.1 16 Roles Check ---');
const roleKeys = Object.keys(ROLES || {});
console.log(`Total roles in ROLES: ${roleKeys.length}`);
roleKeys.forEach((r, idx) => console.log(`  ${idx + 1}. "${r}" (${ROLES[r].name || ROLES[r].label || ''})`));

const landingRoleCardsMatch = src.match(/data-role=["']([^"']+)["']/g) || [];
const landingRoles = [...new Set(landingRoleCardsMatch.map(m => m.replace(/data-role=["']/, '').replace(/["']/, '')))];
console.log(`Roles on landing page data-role attributes: ${landingRoles.length}`);
const missingFromLanding = roleKeys.filter(r => !landingRoles.includes(r));
if (missingFromLanding.length > 0) {
    console.log('🔴 Missing roles from landing page:', missingFromLanding);
} else {
    console.log('✅ All 16 roles present on landing page.');
}

console.log('\n--- 1.2.2 Allowed Initiator Roles Matrix ---');
const initiators = ['supervisor', 'electrician', 'blasting-incharge', 'lift-supervisor', 'site-supervisor'];
initiators.forEach(role => {
    const allowedTypes = [];
    Object.keys(APP_CONFIG.permitTypes).forEach(ptype => {
        const meta = APP_CONFIG.permitTypes[ptype];
        let canInit = false;
        try {
            canInit = evalInVM(`(function() { currentUser = { role: '${role}' }; return typeof canInitiatePermitType === 'function' ? canInitiatePermitType('${role}', '${ptype}') : (${JSON.stringify(meta.initiatorRoles || meta.allowedRoles || [])}).includes('${role}'); })()`);
        } catch(e) {}
        if (canInit) allowedTypes.push(ptype);
    });
    console.log(`Role '${role}' can initiate:`, allowedTypes.join(', '));
});

console.log('\n--- 1.1.2 & 1.1.3 Trace chainStage() and roleCanActOnChain() ---');
const testKinds = [
    'excavation', 'sequential-hw', 'sequential-cs', 'shaft', 
    'electrical-site', 'electrical-batching-plant', 'blasting', 
    'general', 'lifting-routine', 'lifting-critical', 'night-shift'
];
testKinds.forEach(kind => {
    try {
        const stage = evalInVM(`(function() {
            const chain = newChain('${kind}');
            return chainStage(chain);
        })()`);
        console.log(`  kind: '${kind}' -> Initial stage:`, JSON.stringify(stage));
    } catch (e) {
        console.log(`  kind: '${kind}' -> ERROR:`, e.message);
    }
});

console.log('\n--- 1.2.4 Permit Visibility Matrix ---');
const hasVisibilityFn = evalInVM(`typeof isPermitVisibleToRole === 'function'`);
console.log('isPermitVisibleToRole exists:', hasVisibilityFn);
if (hasVisibilityFn) {
    const visibilityResults = evalInVM(`(function() {
        const p1 = { id: 'P1', ptype: 'excavation', status: 'Pending Site Engineer Acknowledgment', requestedBy: 'Site Sup', approvals: newChain('excavation') };
        const p2 = { id: 'P2', ptype: 'electrical', status: 'Pending Quality Engineer Approval', requestedBy: 'Electrician', electricalSiteType: 'batching-plant', approvals: newChain('electrical-batching-plant') };
        const p3 = { id: 'P3', ptype: 'blasting', status: 'Pending Tower Incharge', requestedBy: 'Blaster', approvals: newChain('blasting') };
        const p4 = { id: 'P4', ptype: 'lifting', status: 'Pending Project Manager Acknowledgment', requestedBy: 'Lift Sup', liftCategory: 'critical', approvals: newChain('lifting-critical') };
        const p5 = { id: 'P5', ptype: 'night-shift', status: 'Pending P&M Night Acknowledgment', requestedBy: 'Night Sup', approvals: newChain('night-shift') };
        const permits = [p1, p2, p3, p4, p5];
        const res = {};
        Object.keys(ROLES).forEach(r => {
            res[r] = permits.filter(p => isPermitVisibleToRole(p, r)).map(p => p.id);
        });
        return res;
    })()`);
    Object.keys(visibilityResults).forEach(r => {
        console.log(`  Role '${r}': sees [${visibilityResults[r].join(', ')}]`);
    });
}

console.log('\n--- 1.3 Data Persistence Functions ---');
const hasSaveState = evalInVM(`typeof saveState === 'function'`);
const hasLoadState = evalInVM(`typeof loadState === 'function'`);
const hasResetDemo = evalInVM(`typeof resetDemoData === 'function'`);
const hasSeedPermits = evalInVM(`typeof seedPermits === 'function'`);
console.log(`saveState: ${hasSaveState}, loadState: ${hasLoadState}, resetDemoData: ${hasResetDemo}, seedPermits: ${hasSeedPermits}`);

console.log('\n=== AUDIT SCRIPT COMPLETE ===');
