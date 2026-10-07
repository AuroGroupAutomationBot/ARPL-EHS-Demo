const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync('index.html', 'utf8');
const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);

const mockStorage = {};
const mockLocalStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

const mockDoc = {
    getElementById: (id) => ({ id, innerHTML: '', value: '', style: {}, classList: { add: () => {}, remove: () => {}, toggle: () => {} }, setAttribute: () => {}, getAttribute: () => null, dataset: {} }),
    querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, body: { classList: { add: () => {}, remove: () => {} } }
};
const sandbox = {
    window: {}, document: mockDoc, console: { log: () => {}, warn: () => {}, error: () => {} },
    setTimeout: (fn) => setTimeout(fn, 0), clearTimeout: () => {}, setInterval: () => {}, clearInterval: () => {},
    localStorage: mockLocalStorage,
    navigator: { geolocation: {} }, Date, Math, parseInt, parseFloat, isNaN, isFinite, alert: () => {}, confirm: () => true
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

const evalInVM = (code) => vm.runInContext(code, sandbox);

console.log('=== DATA PERSISTENCE ROUND-TRIP TEST ===\n');

// 1. Add permit and save state
evalInVM(`(function() {
    const richPermit = {
        id: 'PTW-TEST-999',
        ptype: 'electrical',
        electricalSiteType: 'batching_plant',
        status: 'Active',
        location: 'Batching Plant Panel B2',
        createdBy: 'Master Electrician',
        checklist: [
            { q: 'Is MCC isolated?', ans: 'yes', comment: 'Verified by lock 44' }
        ],
        approvals: {
            kind: 'electrical-batching',
            pm: { status: 'approved', by: 'Duty PM', sig: 'data:image/png;base64,123', at: new Date() },
            qualityEngineer: { status: 'approved', by: 'Duty QE', sig: 'data:image/png;base64,456', at: new Date() },
            ehsManager: { status: 'approved', by: 'Duty EHS', sig: 'data:image/png;base64,789', at: new Date() }
        },
        signatories: {
            'electrician': { name: 'Master Electrician', sig: 'sig1', consent: true },
            'pm': { name: 'Duty PM', sig: 'sig2', consent: true }
        },
        observation: {
            id: 'OBS-01',
            status: 'Closed',
            issue: 'Earthing wire loose',
            rectification: 'Re-tightened and torqued'
        },
        extension: {
            status: 'Approved',
            requestedMinutes: 60,
            approvals: {
                kind: 'ext-flow',
                siteEngineer: { status: 'approved', by: 'SE' }
            }
        }
    };
    PERMITS.push(richPermit);
    saveState();
})()`);

const storedJson = mockStorage['arpl_ehs_ptw_state_v16_prod'];
console.log('Storage key exists:', !!storedJson);
console.log('Stored bytes:', storedJson ? storedJson.length : 0);

// Clear in-memory PERMITS and reload from storage
evalInVM(`(function() {
    PERMITS = [];
    const loaded = loadState();
    if (!loaded) throw new Error('loadState returned false');
    const p = PERMITS.find(x => x.id === 'PTW-TEST-999');
    if (!p) throw new Error('PTW-TEST-999 not found after loadState');
    if (p.approvals.kind !== 'electrical-batching') throw new Error('Approvals kind mismatch: ' + p.approvals.kind);
    if (p.checklist[0].comment !== 'Verified by lock 44') throw new Error('Checklist mismatch');
    if (!p.signatories['electrician']) throw new Error('Signatories mismatch');
    if (p.observation.issue !== 'Earthing wire loose') throw new Error('Observation mismatch');
    if (p.extension.requestedMinutes !== 60) throw new Error('Extension mismatch');
})()`);

console.log('✅ loadState() restored all data and nested objects flawlessly');
