/**
 * SUITE 9: UNIVERSAL INITIATOR ARCHITECTURE & FORM ACTIVATION COMPLIANCE
 * Verifies that:
 * 1. All initiators (Site Supervisor, Electrician, Blasting In-charge) share identical page layouts.
 * 2. For Electrician: ONLY PT-06 Electrical Work is available; all other 10 forms are strictly inactive.
 * 3. For Blasting In-charge: ONLY PT-07 Drilling & Blasting is available; all other 10 forms are strictly inactive.
 * 4. For Site Supervisor: PT-01 to PT-05 are active; PT-06 Electrical is strictly inactive (restricted to Electrician).
 * 5. Work-specific extensions: strictly no extension for Blasting operations, extension available for Drilling and Electrical.
 * 6. Non-initiators have all forms locked for creation.
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('==================================================');
console.log('SUITE 9: UNIVERSAL INITIATOR ARCHITECTURE & FORM ACTIVATION COMPLIANCE');
console.log('==================================================');

// --- 1. Static Verification of UI & Constants ---
console.log('\n--- 1. Static Verification of Codebase & UI Tokens ---');

assert(src.includes('const INITIATOR_PERMIT_RULES = {'), "Must define INITIATOR_PERMIT_RULES");
assert(src.includes("'electrician': ['electrical']"), "electrician must map strictly to ['electrical']");
assert(src.includes("'blasting-incharge': ['blasting']"), "blasting-incharge must map strictly to ['blasting']");
assert(src.includes("function getPermitAvailabilityForRole(ptypeKey, roleKey)"), "Must define getPermitAvailabilityForRole");
assert(src.includes("id=\"ptypeRoleBanner\""), "view-ptype must contain contextual role banner container");
assert(src.includes(".ptype-card.initiator-inactive"), "CSS must include .ptype-card.initiator-inactive");
assert(src.includes(".ptype-status.restricted"), "CSS must include .ptype-status.restricted");
assert(src.includes('data-roles="site-supervisor,electrician,blasting-incharge"'), "Create Permit button in register must support all 3 initiators");
assert(src.includes("Site Supervisor (PT-01 to PT-05), Electrician (PT-06), or Blasting In-charge (PT-07)"), "Landing workflow strip must name all 3 initiators with their permit domains");

console.log('  ✓ PASS: Static tokens, CSS rules, role boundaries, and initiator constants verified');

// --- 2. Runtime VM Sandbox Setup ---
console.log('\n--- 2. Runtime Setup & VM Sandbox Initialization ---');

const scriptMatch = src.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch, "Must extract script block from index.html");
const jsCode = scriptMatch[1];

let toastMessages = [];
const elements = {};
function getEl(id) {
    if (!elements[id]) {
        elements[id] = {
            id,
            innerHTML: '',
            textContent: '',
            value: '',
            style: {},
            children: [],
            classList: {
                _classes: new Set(),
                add: function(c) { this._classes.add(c); },
                remove: function(c) { this._classes.delete(c); },
                contains: function(c) { return this._classes.has(c); },
                toggle: function(c, force) {
                    if (force === undefined) {
                        if (this._classes.has(c)) this._classes.delete(c);
                        else this._classes.add(c);
                    } else if (force) {
                        this._classes.add(c);
                    } else {
                        this._classes.delete(c);
                    }
                }
            },
            querySelectorAll: () => [],
            querySelector: () => null,
            addEventListener: () => {},
            removeEventListener: () => {},
            setAttribute: () => {},
            getAttribute: () => null,
            appendChild: function(child) { this.children.push(child); },
            removeChild: function(child) {
                const idx = this.children.indexOf(child);
                if (idx >= 0) this.children.splice(idx, 1);
            },
            remove: () => {},
            focus: () => {},
            click: () => {}
        };
    }
    return elements[id];
}

const mockDoc = {
    getElementById: getEl,
    querySelectorAll: (sel) => [],
    querySelector: (sel) => null,
    createElement: (tag) => getEl('mock_' + tag),
    addEventListener: () => {},
    removeEventListener: () => {},
    body: getEl('body')
};

const sandbox = {
    window: {
        __TEST_MODE__: true,
        scrollTo: () => {},
        addEventListener: () => {},
        location: { reload: () => {} }
    },
    document: mockDoc,
    localStorage: {
        _data: {},
        getItem: function(k) { return this._data[k] || null; },
        setItem: function(k, v) { this._data[k] = String(v); },
        removeItem: function(k) { delete this._data[k]; },
        clear: function() { this._data = {}; }
    },
    navigator: {
        geolocation: {
            getCurrentPosition: (cb) => cb({ coords: { latitude: 17.44, longitude: 78.38 } })
        }
    },
    setTimeout: (fn) => { if (typeof fn === 'function') fn(); },
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    Date: Date,
    Math: Math,
    console: console,
    showToast: (msg, type) => { toastMessages.push({ msg, type }); }
};

const vmContext = vm.createContext(sandbox);
sandbox.window.recordToast = (msg, type, icon) => { toastMessages.push({ msg, type, icon }); };
vm.runInContext(jsCode, vmContext);

vm.runInContext(`
const _origShowToast = showToast;
showToast = function(msg, type, icon) {
    if (typeof window.recordToast === 'function') window.recordToast(msg, type, icon);
    return _origShowToast(msg, type, icon);
};
`, vmContext);

function evalInVM(expr) {
    return vm.runInContext(expr, vmContext);
}

console.log('  ✓ PASS: VM Sandbox initialized successfully');

// --- 3. Electrician Role: Strict Form Activation ---
console.log('\n--- 3. Electrician Form Activation Matrix ---');

const ALL_PERMITS = ['excavation', 'hotwork', 'guardrail', 'confined', 'shaft', 'electrical', 'blasting', 'general', 'lifting', 'liftplan', 'nightshift'];

// For Electrician, ONLY electrical must be available
ALL_PERMITS.forEach(pKey => {
    const avail = evalInVM(`getPermitAvailabilityForRole('${pKey}', 'electrician')`);
    if (pKey === 'electrical') {
        assert.strictEqual(avail.available, true, "PT-06 Electrical Work must be ACTIVE for Electrician");
        assert.strictEqual(avail.statusClass, 'live', "PT-06 must have 'live' status class");
    } else {
        assert.strictEqual(avail.available, false, `${pKey} must be STRICTLY INACTIVE for Electrician`);
        assert(avail.statusClass === 'restricted' || avail.statusClass === 'future', `${pKey} must have restricted/future status class`);
    }
});
console.log('  ✓ PASS: For Electrician, ONLY PT-06 Electrical Work is available; all other 10 forms are strictly inactive');

// Attempting to select inactive permit as Electrician triggers warning
evalInVM("currentUser = { key: 'electrician', label: 'Electrician', role: 'Electrician' };");
toastMessages = [];
evalInVM("selectPermitType('excavation');");
assert(toastMessages.some(t => t.type === 'warn' && t.msg.includes('Role Restriction')), "Must show role restriction warning when selecting excavation");
console.log('  ✓ PASS: Electrician clicking inactive form is rejected with clear role restriction warning');

// Hard gate in startNewPermit
toastMessages = [];
evalInVM("startNewPermit('excavation');");
assert(toastMessages.some(t => t.type === 'err' && t.msg.includes('Role Restriction')), "Must block startNewPermit('excavation') for electrician");
console.log('  ✓ PASS: startNewPermit hard gate prevents Electrician from creating Excavation permit');

evalInVM("startNewPermit('electrical');");
const elecDraft = evalInVM("draft");
assert.strictEqual(elecDraft.ptype, 'electrical', "Electrician must successfully create PT-06 Electrical Work draft");
console.log('  ✓ PASS: Electrician successfully initiates PT-06 Electrical Work (Form EHS_PTW_006)');

// --- 4. Blasting In-charge Role: Strict Form Activation ---
console.log('\n--- 4. Blasting In-charge Form Activation Matrix ---');

// For Blasting In-charge, ONLY blasting must be available
ALL_PERMITS.forEach(pKey => {
    const avail = evalInVM(`getPermitAvailabilityForRole('${pKey}', 'blasting-incharge')`);
    if (pKey === 'blasting') {
        assert.strictEqual(avail.available, true, "PT-07 Drilling & Blasting must be ACTIVE for Blasting In-charge");
        assert.strictEqual(avail.statusClass, 'live', "PT-07 must have 'live' status class");
    } else {
        assert.strictEqual(avail.available, false, `${pKey} must be STRICTLY INACTIVE for Blasting In-charge`);
        assert(avail.statusClass === 'restricted' || avail.statusClass === 'future', `${pKey} must have restricted/future status class`);
    }
});
console.log('  ✓ PASS: For Blasting In-charge, ONLY PT-07 Drilling & Blasting is available; all other 10 forms are strictly inactive');

evalInVM("currentUser = { key: 'blasting-incharge', label: 'Blasting / Drilling In-charge', role: 'Blasting In-charge' };");
toastMessages = [];
evalInVM("selectPermitType('electrical');");
assert(toastMessages.some(t => t.type === 'warn' && t.msg.includes('Role Restriction')), "Must show role restriction warning when selecting electrical as blaster");
console.log('  ✓ PASS: Blasting In-charge clicking Electrical form is rejected with role restriction warning');

toastMessages = [];
evalInVM("startNewPermit('electrical');");
assert(toastMessages.some(t => t.type === 'err' && t.msg.includes('Role Restriction')), "Must block startNewPermit('electrical') for blaster");
console.log('  ✓ PASS: startNewPermit hard gate prevents Blasting In-charge from creating Electrical permit');

evalInVM("startNewPermit('blasting');");
const blastDraft = evalInVM("draft");
assert.strictEqual(blastDraft.ptype, 'blasting', "Blasting In-charge must successfully create PT-07 draft");
console.log('  ✓ PASS: Blasting In-charge successfully initiates PT-07 Drilling & Blasting (Form EHS_PTW_007)');

// --- 5. Site Supervisor Role: Strict Form Activation ---
console.log('\n--- 5. Site Supervisor Form Activation Matrix ---');

// PT-06 Electrical Work must be strictly inactive for Site Supervisor
const elecAvailForSup = evalInVM("getPermitAvailabilityForRole('electrical', 'site-supervisor')");
assert.strictEqual(elecAvailForSup.available, false, "PT-06 Electrical Work must be STRICTLY INACTIVE for Site Supervisor");
assert.strictEqual(elecAvailForSup.statusText, 'Restricted to Electrician', "PT-06 must show 'Restricted to Electrician'");
assert.strictEqual(elecAvailForSup.statusClass, 'restricted', "PT-06 must have 'restricted' statusClass");
console.log('  ✓ PASS: For Site Supervisor, PT-06 Electrical Work is strictly inactive with lock badge (Restricted to Electrician)');

// PT-07 Drilling & Blasting must be strictly inactive for Site Supervisor
const blastAvailForSup = evalInVM("getPermitAvailabilityForRole('blasting', 'site-supervisor')");
assert.strictEqual(blastAvailForSup.available, false, "PT-07 Drilling & Blasting must be STRICTLY INACTIVE for Site Supervisor");
assert.strictEqual(blastAvailForSup.statusText, 'Restricted to Blasting In-charge', "PT-07 must show 'Restricted to Blasting In-charge'");
assert.strictEqual(blastAvailForSup.statusClass, 'restricted', "PT-07 must have 'restricted' statusClass");
console.log('  ✓ PASS: For Site Supervisor, PT-07 Drilling & Blasting is strictly inactive with lock badge (Restricted to Blasting In-charge)');

// Verify full 11-permit activation matrix for Site Supervisor
const supervisorAllowedPermits = ['excavation', 'hotwork', 'guardrail', 'confined', 'shaft'];
ALL_PERMITS.forEach(pKey => {
    const avail = evalInVM(`getPermitAvailabilityForRole('${pKey}', 'site-supervisor')`);
    if (supervisorAllowedPermits.includes(pKey)) {
        assert.strictEqual(avail.available, true, `${pKey} must be ACTIVE for Site Supervisor`);
        assert.strictEqual(avail.statusClass, 'live', `${pKey} must have 'live' status class`);
    } else {
        assert.strictEqual(avail.available, false, `${pKey} must be STRICTLY INACTIVE for Site Supervisor`);
        if (pKey === 'electrical') {
            assert.strictEqual(avail.statusText, 'Restricted to Electrician');
        } else if (pKey === 'blasting') {
            assert.strictEqual(avail.statusText, 'Restricted to Blasting In-charge');
        } else {
            assert.strictEqual(avail.statusClass, 'future');
        }
    }
});
console.log('  ✓ PASS: For Site Supervisor, ONLY PT-01 through PT-05 are available; PT-06, PT-07, and future forms are strictly inactive');

evalInVM("currentUser = { key: 'site-supervisor', label: 'Site Supervisor', role: 'Site Supervisor' };");

// Attempting to select PT-06 Electrical Work triggers warning
toastMessages = [];
evalInVM("selectPermitType('electrical');");
assert(toastMessages.some(t => t.type === 'warn' && t.msg.includes('Role Restriction')), "Must show role restriction warning when supervisor clicks electrical");
console.log('  ✓ PASS: Site Supervisor clicking PT-06 Electrical Work is rejected with role restriction warning');

// Attempting to select PT-07 Drilling & Blasting triggers warning
toastMessages = [];
evalInVM("selectPermitType('blasting');");
assert(toastMessages.some(t => t.type === 'warn' && t.msg.includes('Role Restriction') && t.msg.includes('Blasting / Drilling In-charge')), "Must show role restriction warning when supervisor clicks blasting");
console.log('  ✓ PASS: Site Supervisor clicking PT-07 Drilling & Blasting is rejected with role restriction warning');

// Hard gate in startNewPermit for PT-06
toastMessages = [];
evalInVM("startNewPermit('electrical');");
assert(toastMessages.some(t => t.type === 'err' && t.msg.includes('Role Restriction')), "Must block startNewPermit('electrical') for supervisor");
console.log('  ✓ PASS: startNewPermit hard gate prevents Site Supervisor from creating Electrical permit');

// Hard gate in startNewPermit for PT-07
toastMessages = [];
evalInVM("startNewPermit('blasting');");
assert(toastMessages.some(t => t.type === 'err' && t.msg.includes('Role Restriction')), "Must block startNewPermit('blasting') for supervisor");
console.log('  ✓ PASS: startNewPermit hard gate prevents Site Supervisor from creating Drilling & Blasting permit');

// Valid initiation for Site Supervisor (PT-01 Excavation)
evalInVM("startNewPermit('excavation');");
const supExcDraft = evalInVM("draft");
assert.strictEqual(supExcDraft.ptype, 'excavation', "Site Supervisor must successfully create PT-01 Excavation draft");
console.log('  ✓ PASS: Site Supervisor successfully initiates PT-01 Excavation (Form EHS_PTW_001)');

// --- 6. Non-Initiator Roles: All Forms Inactive ---
console.log('\n--- 6. Non-Initiator Roles Locked ---');

['site-engineer', 'mep', 'pm', 'it', 'quality-engineer', 'hw-section-head', 'ehs-manager', 'admin'].forEach(r => {
    ALL_PERMITS.forEach(pKey => {
        const avail = evalInVM(`getPermitAvailabilityForRole('${pKey}', '${r}')`);
        assert.strictEqual(avail.available, false, `Non-initiator ${r} must have ${pKey} inactive`);
    });
});
console.log('  ✓ PASS: All non-initiator roles have 100% of permit forms inactive for creation');

// --- 7. Universal Initiator Dashboard Parity ---
console.log('\n--- 7. Universal Initiator Dashboard Parity ---');

['site-supervisor', 'electrician', 'blasting-incharge'].forEach(rKey => {
    evalInVM(`currentUser = roleInfo('${rKey}'); buildDashboard();`);
    const dashHtml = getEl('view-dashboard').innerHTML;
    assert(dashHtml.includes('My Drafts'), `${rKey} dashboard must contain My Drafts KPI`);
    assert(dashHtml.includes('In Approval Chain'), `${rKey} dashboard must contain In Approval Chain KPI`);
    assert(dashHtml.includes('Active Permits'), `${rKey} dashboard must contain Active Permits KPI`);
    assert(dashHtml.includes('Open Observations'), `${rKey} dashboard must contain Open Observations KPI`);
    assert(dashHtml.includes('Create New Permit (Step 1)'), `${rKey} dashboard must contain Create New Permit action button`);
    assert(dashHtml.includes('View My Permits'), `${rKey} dashboard must contain View My Permits button`);
});
console.log('  ✓ PASS: Site Supervisor, Electrician, and Blasting In-charge all share the identical Permittee Dashboard structure');

// --- 8. Navigation Consistency for All Initiators ---
console.log('\n--- 8. Global Navigation Parity ---');

['site-supervisor', 'electrician', 'blasting-incharge'].forEach(rKey => {
    const navItems = evalInVM(`navItemsFor('${rKey}')`);
    assert(navItems.some(it => it.id === 'ptype' && it.label === 'Create Permit'), `${rKey} must have Create Permit in top-level navigation`);
    assert(navItems.some(it => it.id === 'register' && it.label === 'My Permits'), `${rKey} must have My Permits in top-level navigation`);
});
console.log('  ✓ PASS: Global sidebar navigation provides Create Permit and My Permits for all 3 initiators');

// --- 9. Work-Specific Extension Rules ---
console.log('\n--- 9. Work-Specific Extension Rules ---');

// Test Blasting permit extension blocking
evalInVM(`
const activeBlasting = {
    id: 'PT-DB-TEST-BLAST',
    ptype: 'blasting',
    dbOperationType: 'Blasting',
    status: 'Active',
    startTime: '09:00',
    validTill: new Date(nowTime() + 7200000)
};
PERMITS.push(activeBlasting);
`);

evalInVM("currentUser = { key: 'blasting-incharge', label: 'Blasting In-charge', role: 'Blasting In-charge' };");
const blastActionHtml = evalInVM("actionPanelHtml(PERMITS.find(p => p.id === 'PT-DB-TEST-BLAST'))");
assert(blastActionHtml.includes('Extension Not Permitted for Blasting Operations'), "Blasting operation must display Extension Not Permitted card");
assert(blastActionHtml.includes('No Extension Available (Blasting)'), "Blasting operation must render disabled extension button");
console.log('  ✓ PASS: Blasting operation renders Extension Not Permitted card with disabled button');

toastMessages = [];
evalInVM("openExtensionRequestModal('PT-DB-TEST-BLAST');");
assert(toastMessages.some(t => t.type === 'err' && t.msg.includes('strictly prohibited for Blasting operations')), "Must show error toast blocking extension on Blasting operation");
console.log('  ✓ PASS: Attempt to request extension on Blasting operation is blocked by statutory alert');

// Test Drilling permit extension permission
evalInVM(`
const activeDrilling = {
    id: 'PT-DB-TEST-DRILL',
    ptype: 'blasting',
    dbOperationType: 'Drilling',
    status: 'Active',
    startTime: '09:00',
    validTill: new Date(nowTime() + 7200000)
};
PERMITS.push(activeDrilling);
`);
const drillActionHtml = evalInVM("actionPanelHtml(PERMITS.find(p => p.id === 'PT-DB-TEST-DRILL'))");
assert(drillActionHtml.includes('Request Extension'), "Drilling operation must permit requesting extensions");
console.log('  ✓ PASS: Drilling operation allows extension request');

// Test Electrical permit extension permission for Electrician
evalInVM(`
const activeElec = {
    id: 'PT-EW-TEST-ELEC',
    ptype: 'electrical',
    electricalSiteType: 'site',
    status: 'Active',
    startTime: '09:00',
    validTill: new Date(nowTime() + 7200000)
};
PERMITS.push(activeElec);
`);
evalInVM("currentUser = { key: 'electrician', label: 'Electrician', role: 'Electrician' };");
const elecActionHtml = evalInVM("actionPanelHtml(PERMITS.find(p => p.id === 'PT-EW-TEST-ELEC'))");
assert(elecActionHtml.includes('Request Extension'), "Electrical permit must allow Electrician to request extension");
console.log('  ✓ PASS: Electrical permit allows Electrician to request extension');

// Test non-permittee cannot request extension
evalInVM("currentUser = { key: 'site-supervisor', label: 'Site Supervisor', role: 'Site Supervisor' };");
toastMessages = [];
evalInVM("openExtensionRequestModal('PT-EW-TEST-ELEC');");
assert(toastMessages.some(t => t.type === 'err' && t.msg.includes('Access Denied')), "Non-electrician must be blocked from extending electrical permit");
console.log('  ✓ PASS: Non-electrician is blocked from requesting extension on electrical permit');

// --- 10. Select Permit Type Catalog Rendering & Banner ---
console.log('\n--- 10. Permit Type Selection Catalog & Contextual Banner ---');

evalInVM("currentUser = { key: 'electrician', label: 'Electrician', role: 'Electrician' }; buildPermitTypeCards();");
const bannerHtmlElec = getEl('ptypeRoleBanner').innerHTML;
assert(bannerHtmlElec.includes('Electrician Initiator Mode'), "Must display Electrician Initiator Mode banner");
assert(bannerHtmlElec.includes('PT-06 Electrical Work (HT/LT) — Form EHS_PTW_006'), "Banner must name Form EHS_PTW_006");

evalInVM("currentUser = { key: 'blasting-incharge', label: 'Blasting / Drilling In-charge', role: 'Blasting In-charge' }; buildPermitTypeCards();");
const bannerHtmlBlast = getEl('ptypeRoleBanner').innerHTML;
assert(bannerHtmlBlast.includes('Blasting / Drilling In-charge Initiator Mode'), "Must display Blasting In-charge Initiator Mode banner");
assert(bannerHtmlBlast.includes('PT-07 Drilling and Blasting — Form EHS_PTW_007'), "Banner must name Form EHS_PTW_007");

console.log('  ✓ PASS: Contextual role banners correctly render on the Select Permit Type catalog');

console.log('\n==================================================');
console.log('ALL INITIATOR ARCHITECTURE & FORM ACTIVATION TESTS PASSED (100% SUCCESS RATE)');
console.log('==================================================');
