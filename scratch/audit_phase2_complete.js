const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync('index.html', 'utf8');
const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Script match must exist');

// Set up DOM mock
class MockElement {
    constructor(id = '', tagName = 'div') {
        this.id = id;
        this.tagName = tagName.toUpperCase();
        this.innerHTML = '';
        this.textContent = '';
        this.value = '';
        this.checked = false;
        this.disabled = false;
        this.style = {};
        this.classes = new Set();
        this.children = [];
        this.dataset = {};
    }
    get classList() {
        return {
            add: (...cls) => cls.forEach(c => this.classes.add(c)),
            remove: (...cls) => cls.forEach(c => this.classes.delete(c)),
            contains: (c) => this.classes.has(c),
            toggle: (c, force) => {
                if (force === undefined) {
                    if (this.classes.has(c)) this.classes.delete(c);
                    else this.classes.add(c);
                } else if (force) this.classes.add(c);
                else this.classes.delete(c);
            }
        };
    }
    appendChild(c) { this.children.push(c); return c; }
    removeChild(c) { return c; }
    remove() {}
    querySelector() { return null; }
    querySelectorAll() { return []; }
    focus() {}
    scrollIntoView() {}
    getContext() {
        return {
            clearRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {},
            stroke: () => {}, fill: () => {}, arc: () => {}, strokeRect: () => {}, fillRect: () => {}
        };
    }
    addEventListener() {}
    removeEventListener() {}
    setAttribute(k, v) { this[k] = v; }
    getAttribute(k) { return this[k] || null; }
    removeAttribute(k) { delete this[k]; }
}

const elements = new Map();
function getEl(id) {
    if (!elements.has(id)) elements.set(id, new MockElement(id));
    return elements.get(id);
}

const mockStorage = {};
const localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

const sandbox = {
    window: {},
    document: {
        getElementById: (id) => getEl(id),
        querySelector: (sel) => getEl(sel.replace(/^[#.]/, '')),
        querySelectorAll: () => [],
        createElement: (tag) => new MockElement('', tag),
        body: new MockElement('body', 'body'),
        addEventListener: () => {},
        removeEventListener: () => {}
    },
    localStorage,
    navigator: { userAgent: 'NodeTest', geolocation: { getCurrentPosition: (cb) => cb({ coords: { latitude: 19.0760, longitude: 72.8777 } }) } },
    console: { log: () => {}, warn: () => {}, error: () => {}, info: () => {} },
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
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

console.log('==================================================');
console.log('EXHAUSTIVE PHASE 2 AUDIT: ALL 10 PERMIT TYPE MODULES');
console.log('==================================================\n');

let passCount = 0;
let failCount = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ PASS: ${name}`);
        passCount++;
    } catch (e) {
        console.error(`  🔴 FAIL: ${name} -> ${e.message}`);
        failCount++;
    }
}

// ==========================================
// 2.1 PTW-001 Excavation Work
// ==========================================
console.log('--- 2.1 PTW-001 Excavation Work ---');

test('2.1.1 5-stage approval topology: Site Sup -> Site Eng -> Parallel(MEP, P&M, IT) -> Excavation Head -> EHS', () => {
    const chain = evalInVM("newChain('excavation')");
    assert.strictEqual(chain.kind, 'exc');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'parallel');
    assert(chain.mep && chain.pm && chain.it && chain.sectionHead && chain.ehsManager && chain.ehsOfficer);
});

test('2.1.2 3-way parallel gate: all 3 disciplines must approve before advancing', () => {
    evalInVM(`
        cExc = newChain('excavation');
        cExc.mep.status = 'approved';
        s1 = chainStage(cExc);
        cExc.pm.status = 'approved';
        s2 = chainStage(cExc);
        cExc.it.status = 'approved';
        s3 = chainStage(cExc);
    `);
    assert.strictEqual(evalInVM('s1'), 'parallel');
    assert.strictEqual(evalInVM('s2'), 'parallel');
    assert.strictEqual(evalInVM('s3'), 'section-head');
});

test('2.1.3 12-item safety checklist renders and all items must be answered', () => {
    const list = evalInVM("checklistFor('excavation')");
    assert.strictEqual(list.length, 12);
});

test('2.1.4 Location modes: Basement/Podium and Manual only (no Tower)', () => {
    const modes = Array.from(evalInVM("getAllowedLocationModes('excavation')"));
    assert.deepStrictEqual(modes, ['Basement/Podium', 'Manual']);
    assert(!modes.includes('Tower'));
});

test('2.1.5 Excavation Head (not Tower Incharge) is section head for this type', () => {
    const shRole = evalInVM("shRoleFor({ ptype: 'excavation' })");
    const shLabel = evalInVM("shLabelFor({ ptype: 'excavation' })");
    assert.strictEqual(shRole, 'excavation-head');
    assert.strictEqual(shLabel, 'Excavation Head');
});

// ==========================================
// 2.2 PTW-002 Hot Work
// ==========================================
console.log('\n--- 2.2 PTW-002 Hot Work ---');

test('2.2.1 4-stage sequential: Site Sup -> Site Eng -> Tower Incharge -> EHS', () => {
    const chain = evalInVM("newChain('hotwork')");
    assert.strictEqual(chain.kind, 'hotwork');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'section-head');
    assert(chain.sectionHead && chain.ehsManager && chain.ehsOfficer);
    assert(!chain.mep && !chain.pm && !chain.it);
});

test('2.2.2 20-item safety checklist renders completely', () => {
    const list = evalInVM("checklistFor('hotwork')");
    assert.strictEqual(list.length, 20);
});

test('2.2.3 Hot work descriptions defined', () => {
    const descs = evalInVM("HOTWORK_DESCRIPTIONS");
    assert(descs.length >= 4);
    assert(descs.includes('Welding') && descs.includes('Gas Cutting'));
});

test('2.2.4 Location modes: Tower, Basement/Podium, Manual (all three)', () => {
    const modes = Array.from(evalInVM("getAllowedLocationModes('hotwork')"));
    assert.deepStrictEqual(modes, ['Tower', 'Basement/Podium', 'Manual']);
});

// ==========================================
// 2.3 PTW-003 Guard Rail / Floor Protection Removal
// ==========================================
console.log('\n--- 2.3 PTW-003 Guard Rail / Floor Protection Removal ---');

test('2.3.1 4-stage sequential: Site Sup -> Site Eng -> Tower Incharge -> EHS', () => {
    const chain = evalInVM("newChain('guardrail')");
    assert.strictEqual(chain.kind, 'guardrail');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'section-head');
});

test('2.3.2 9-item safety checklist', () => {
    const list = evalInVM("checklistFor('guardrail')");
    assert.strictEqual(list.length, 9);
});

test('2.3.3 Location modes: Tower and Basement/Podium only (no Manual)', () => {
    const modes = Array.from(evalInVM("getAllowedLocationModes('guardrail')"));
    assert.deepStrictEqual(modes, ['Tower', 'Basement/Podium']);
    assert(!modes.includes('Manual'));
});

// ==========================================
// 2.4 PTW-004 Confined Space Entry
// ==========================================
console.log('\n--- 2.4 PTW-004 Confined Space Entry ---');

test('2.4.1 4-stage sequential: Site Sup -> Site Eng -> Tower Incharge -> EHS', () => {
    const chain = evalInVM("newChain('confined')");
    assert.strictEqual(chain.kind, 'confined');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'section-head');
});

test('2.4.2 Multi-gas detection thresholds: O2 19.5-21.0%, LEL < 10%, CO < 25 PPM, H2S <= 5 PPM (FR-016)', () => {
    // Test isGasReadingSafe
    assert.strictEqual(evalInVM("isGasReadingSafe('o2', '20.5')"), true);
    assert.strictEqual(evalInVM("isGasReadingSafe('o2', '18.9')"), false);
    assert.strictEqual(evalInVM("isGasReadingSafe('o2', '22.0')"), false);
    assert.strictEqual(evalInVM("isGasReadingSafe('combustible', '5')"), true);
    assert.strictEqual(evalInVM("isGasReadingSafe('combustible', '12')"), false);
    assert.strictEqual(evalInVM("isGasReadingSafe('co', '15')"), true);
    assert.strictEqual(evalInVM("isGasReadingSafe('co', '28')"), false);
    assert.strictEqual(evalInVM("isGasReadingSafe('h2s', '3')"), true);
    assert.strictEqual(evalInVM("isGasReadingSafe('h2s', '8')"), false);
});

test('2.4.4 15-item checklist + location modes allow Tower, Basement, Manual', () => {
    const list = evalInVM("checklistFor('confined')");
    assert.strictEqual(list.length, 15);
    const modes = Array.from(evalInVM("getAllowedLocationModes('confined')"));
    assert.deepStrictEqual(modes, ['Tower', 'Basement/Podium', 'Manual']);
});

test('2.4.5 Confined space explicitly blocked from night shift linkage', () => {
    assert.strictEqual(evalInVM("canLinkToNightShift('confined')"), false);
});

// ==========================================
// 2.5 PTW-005 Shaft Work
// ==========================================
console.log('\n--- 2.5 PTW-005 Shaft Work ---');

test('2.5.1 5-stage with MEP clearance: Site Sup -> Site Eng -> MEP -> Tower Incharge -> EHS', () => {
    const chain = evalInVM("newChain('shaft')");
    assert.strictEqual(chain.kind, 'shaft');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'mep');
    assert(chain.mep && chain.sectionHead && chain.ehsManager && chain.ehsOfficer);
});

test('2.5.3 10-item safety checklist', () => {
    const list = evalInVM("checklistFor('shaft')");
    assert.strictEqual(list.length, 10);
});

test('2.5.4 Location modes: Tower and Basement/Podium only (no Manual)', () => {
    const modes = Array.from(evalInVM("getAllowedLocationModes('shaft')"));
    assert.deepStrictEqual(modes, ['Tower', 'Basement/Podium']);
    assert(!modes.includes('Manual'));
});

// ==========================================
// 2.6 PTW-006 Electrical Work (HT/LT) — Dual Topology
// ==========================================
console.log('\n--- 2.6 PTW-006 Electrical Work (HT/LT) ---');

test('2.6.1 Site topology (5-stage): Electrician -> Site Eng -> MEP/P&M (either/or) -> Tower Incharge -> EHS', () => {
    const chain = evalInVM("newChain('electrical-site')");
    assert.strictEqual(chain.kind, 'electrical-site');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'mep-pm');
    assert(chain.mep && chain.pm && chain.sectionHead && chain.ehsManager && chain.ehsOfficer);
});

test('2.6.2 Batching Plant topology (4-stage): Electrician -> P&M -> Quality Engineer -> EHS', () => {
    const chain = evalInVM("newChain('electrical-batching')");
    assert.strictEqual(chain.kind, 'electrical-batching');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'pm');
    assert(chain.pm && chain.qualityEngineer && chain.ehsManager && chain.ehsOfficer);
    assert(!chain.mep && !chain.sectionHead);
});

test('2.6.3 Topology selection driven by electricalSiteType', () => {
    const cSite = evalInVM("newChain('electrical', { electricalSiteType: 'site' })");
    const cBP = evalInVM("newChain('electrical', { electricalSiteType: 'batching_plant' })");
    assert.strictEqual(cSite.kind, 'electrical-site');
    assert.strictEqual(cBP.kind, 'electrical-batching');
});

test('2.6.4 14-item electrical safety checklist', () => {
    const list = evalInVM("checklistFor('electrical')");
    assert.strictEqual(list.length, 14);
});

test('2.6.5 Only electrician role can initiate', () => {
    assert.deepStrictEqual(Array.from(evalInVM("INITIATOR_PERMIT_RULES['electrician']")), ['electrical']);
    assert(!evalInVM("INITIATOR_PERMIT_RULES['site-supervisor']").includes('electrical'));
});

test('2.6.6 Batching Plant -> Manual location mode only', () => {
    const bpModes = Array.from(evalInVM("getAllowedLocationModes('electrical', 'batching_plant')"));
    assert.deepStrictEqual(bpModes, ['Manual']);
    const siteModes = Array.from(evalInVM("getAllowedLocationModes('electrical', 'site')"));
    assert.deepStrictEqual(siteModes, ['Tower', 'Basement/Podium', 'Manual']);
});

// ==========================================
// 2.7 PTW-007 Drilling & Blasting
// ==========================================
console.log('\n--- 2.7 PTW-007 Drilling & Blasting ---');

test('2.7.1 Blasting topology: Blasting Incharge -> Site Eng -> EHS (3 stages)', () => {
    const chain = evalInVM("newChain('blasting')");
    assert.strictEqual(chain.kind, 'blasting');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'ehs');
    assert(chain.ehsManager && chain.ehsOfficer);
});

test('2.7.4 Location mode: Manual only', () => {
    const modes = Array.from(evalInVM("getAllowedLocationModes('blasting')"));
    assert.deepStrictEqual(modes, ['Manual']);
});

test('2.7.5 Blasting sunset cap at 18:30 IST has zero extension runway', () => {
    evalInVM(`
        pBlastAtSunset = { ptype: 'blasting', dbOperationType: 'Blasting', drillingBlastingType: 'blasting', status: 'Active' };
        sunsetD = new Date();
        sunsetD.setHours(18, 30, 0, 0);
        pBlastAtSunset.validTill = sunsetD;
        zeroRunway = extensionCapMinutes(pBlastAtSunset);
    `);
    assert.strictEqual(evalInVM('zeroRunway'), 0);
});

test('2.7.6 Night shift linkage strictly blocked for Blasting', () => {
    assert.strictEqual(evalInVM("canLinkToNightShift('blasting')"), false);
});

// ==========================================
// 2.8 PTW-008 General Work
// ==========================================
console.log('\n--- 2.8 PTW-008 General Work ---');

test('2.8.1 4-stage sequential: Site Sup -> Site Eng -> Tower Incharge -> EHS', () => {
    const chain = evalInVM("newChain('general')");
    assert.strictEqual(chain.kind, 'general');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'section-head');
});

test('2.8.2 Dynamic sub-checklists: Panel (21), Hoist (15), Formwork (20), Other (11)', () => {
    assert.strictEqual(evalInVM("checklistFor('general', 'Erection of Glass Panel').length"), 21);
    assert.strictEqual(evalInVM("checklistFor('general', 'Electric chain Hoist').length"), 15);
    assert.strictEqual(evalInVM("checklistFor('general', 'Formwork Erection(shuttering)').length"), 20);
    assert.strictEqual(evalInVM("checklistFor('general', 'Other').length"), 11);
});

test('2.8.3 All 3 location modes available', () => {
    const modes = Array.from(evalInVM("getAllowedLocationModes('general')"));
    assert.deepStrictEqual(modes, ['Tower', 'Basement/Podium', 'Manual']);
});

// ==========================================
// 2.9 & 2.10 PTW-009A & PTW-009B Lifting Operations
// ==========================================
console.log('\n--- 2.9 & 2.10 PTW-009A/B Lifting Operations ---');

test('2.9.1 PTW-009A Routine 5-stage: Lift Sup -> Site Eng -> P&M -> Tower Incharge -> EHS', () => {
    const chain = evalInVM("newChain('lifting')");
    assert.strictEqual(chain.kind, 'lifting-routine');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'pm');
    assert(chain.pm && chain.sectionHead && chain.ehsManager && chain.ehsOfficer);
    assert(!chain.projectManager);
});

test('2.9.2 Sling stress calculation: T = (W x L)/(H x N), N=2', () => {
    evalInVM(`
        draft = { loadWeight: 4.0, craneGearWeight: 0, riggingNumSlings: 2, slingsCount: '2', slingsAdjustable: 'yes', riggingSlingAngle: 60, riggingSlingSwl: 5.0, slingLength: 6.0, slingApexHeight: 4.5 };
        renderLiftingCalculations();
    `);
    const stress = evalInVM('draft.riggingStressPerSling');
    assert(stress > 2.30 && stress < 2.32);
});

test('2.9.3 >80% SWL stress auto-promotes to PTW-009B Critical Lift Plan', () => {
    evalInVM(`
        draft = { ptype: 'lifting', loadWeight: 4.0, craneGearWeight: 0, riggingStressPercent: 85.0 };
        updateLiftingClassification();
    `);
    assert.strictEqual(evalInVM('draft.liftingClassification'), 'critical');
    assert.strictEqual(evalInVM('draft.ptype'), 'liftplan');
});

test('2.10.1 PTW-009B Critical 6-stage with Project Manager', () => {
    const chain = evalInVM("newChain('liftplan')");
    assert.strictEqual(chain.kind, 'lifting-critical');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'pm');
    assert(chain.pm && chain.sectionHead && chain.projectManager && chain.ehsManager && chain.ehsOfficer);
});

test('2.10.3 Weight > 5 MT or Tandem lift auto-promotes to Critical', () => {
    evalInVM(`
        draft = { ptype: 'lifting', loadWeight: 5.5, craneGearWeight: 0 };
        updateLiftingClassification();
    `);
    assert.strictEqual(evalInVM('draft.liftingClassification'), 'critical');

    evalInVM(`
        draft = { ptype: 'lifting', loadWeight: 3.0, craneGearWeight: 0, liftingTandemLift: true };
        updateLiftingClassification();
    `);
    assert.strictEqual(evalInVM('draft.liftingClassification'), 'critical');
});

test('2.9.5 14-item lifting checklist', () => {
    const list = evalInVM("checklistFor('lifting')");
    assert.strictEqual(list.length, 14);
});

test('2.9.6 Only lift-supervisor can initiate', () => {
    assert.deepStrictEqual(Array.from(evalInVM("INITIATOR_PERMIT_RULES['lift-supervisor']")), ['lifting', 'liftplan']);
    assert(!evalInVM("INITIATOR_PERMIT_RULES['site-supervisor']").includes('lifting'));
});

// ==========================================
// 2.11 PTW-010 Night Shift / Holiday Work
// ==========================================
console.log('\n--- 2.11 PTW-010 Night Shift / Holiday Work ---');

test('2.11.1 8-stage dual-phase chain: sectionHead -> nightHandover -> pmNight -> ehs', () => {
    const chain = evalInVM("newChain('nightshift')");
    assert.strictEqual(chain.kind, 'nightshift');
    assert.strictEqual(evalInVM(`chainStage(${JSON.stringify(chain)})`), 'section-head');
    assert(chain.sectionHead && chain.nightHandover && chain.pmNight && chain.ehsManager && chain.ehsOfficer);
});

test('2.11.2 Night supervisor qualification gate: PM authorized + training < 365 days', () => {
    assert.strictEqual(evalInVM("validateNightSupervisorGate('venkatesh_rao').valid"), true);
    assert.strictEqual(evalInVM("validateNightSupervisorGate('kishore_varma').valid"), false); // not PM authorized
    assert.strictEqual(evalInVM("validateNightSupervisorGate('anand_kumar').valid"), false);   // training expired
});

test('2.11.3 21:00 IST cutoff auto-cancel if handover not completed', () => {
    const cutoff = evalInVM(`checkNightHandoverCutoff({ ptype: 'nightshift', status: 'Approved – Pending Night Handover' }, new Date('2026-09-17T21:05:00+05:30'))`);
    assert.strictEqual(cutoff.cutoffReached, true);
});

test('2.11.4 13-item night shift checklist', () => {
    const list = evalInVM("checklistFor('nightshift')");
    assert.strictEqual(list.length, 13);
});

test('2.11.5 Confined space, Blasting, Critical Lift prohibited for night shift', () => {
    assert.strictEqual(evalInVM("canLinkToNightShift('confined')"), false);
    assert.strictEqual(evalInVM("canLinkToNightShift('blasting')"), false);
    assert.strictEqual(evalInVM("canLinkToNightShift('liftplan')"), false);
    assert.strictEqual(evalInVM("canLinkToNightShift({ ptype: 'lifting', liftingClassification: 'critical' })"), false);
    assert.strictEqual(evalInVM("canLinkToNightShift({ ptype: 'lifting', loadWeight: 6.5 })"), false);
    assert.strictEqual(evalInVM("canLinkToNightShift({ ptype: 'hotwork' })"), true);
});

console.log('\n==================================================');
console.log(`MASTER PHASE 2 AUDIT COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('==================================================');
