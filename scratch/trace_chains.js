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

console.log('=== TRACING CHAIN TOPOLOGY & ACTORS FOR ALL PERMIT TYPES ===\n');

const permitConfigs = [
    { type: 'excavation', draftOrSub: null, name: 'PTW-001 Excavation' },
    { type: 'hotwork', draftOrSub: null, name: 'PTW-002 Hot Work' },
    { type: 'guardrail', draftOrSub: null, name: 'PTW-003 Guard Rail' },
    { type: 'confined', draftOrSub: null, name: 'PTW-004 Confined Space' },
    { type: 'shaft', draftOrSub: null, name: 'PTW-005 Shaft Work' },
    { type: 'electrical', draftOrSub: { electricalSiteType: 'site' }, name: 'PTW-006 Electrical (Site)' },
    { type: 'electrical', draftOrSub: { electricalSiteType: 'batching_plant' }, name: 'PTW-006 Electrical (Batching Plant)' },
    { type: 'blasting', draftOrSub: null, name: 'PTW-007 Drilling & Blasting' },
    { type: 'general', draftOrSub: null, name: 'PTW-008 General Work' },
    { type: 'lifting', draftOrSub: null, name: 'PTW-009A Routine Lifting' },
    { type: 'liftplan', draftOrSub: null, name: 'PTW-009B Critical Lift Plan' },
    { type: 'nightshift', draftOrSub: null, name: 'PTW-010 Night Shift' }
];

permitConfigs.forEach(cfg => {
    console.log(`\n--- ${cfg.name} (type: '${cfg.type}') ---`);
    const result = evalInVM(`(function() {
        const chain = newChain('${cfg.type}', ${JSON.stringify(cfg.draftOrSub)});
        const kind = chain.kind;
        const stages = [];
        let curStage = chainStage(chain);
        stages.push({ stage: curStage });
        
        // Let's see what roles can act at initial stage
        const canActInitial = ROLES.filter(r => roleCanActOnChain(chain, r.key)).map(r => r.key);
        
        return { kind, initialStage: curStage, canActInitial, keys: Object.keys(chain) };
    })()`);
    console.log(`  chain.kind: '${result.kind}'`);
    console.log(`  chain fields:`, result.keys.join(', '));
    console.log(`  Initial chainStage: '${result.initialStage}'`);
    console.log(`  Roles that can act at initial stage:`, result.canActInitial.join(', '));
});
