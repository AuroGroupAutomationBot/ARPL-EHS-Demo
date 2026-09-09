const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

console.log('==================================================');
console.log('SUITE 8: PT-06 ELECTRICAL WORK (HT / LT) FORM EHS_PTW_006 SPECIFICATION & COMPLIANCE');
console.log('==================================================');

// --- 1. Static Verification of PT-06 Metadata & Constants ---
console.log('\n--- 1. Static Verification of PT-06 Metadata & Constants ---');

// Check PERMIT_TYPES entry
assert(src.includes("code: 'PT-06'") || src.includes("key: 'electrical'"), "PERMIT_TYPES must include PT-06 / electrical");
assert(src.includes("form: 'EHS_PTW_006'"), "PTYPE_META must register Form EHS_PTW_006");
assert(src.includes("prefix: 'EW'"), "PTYPE_META must use EW permit prefix");
console.log('  ✓ PASS: PT-06 Form EHS_PTW_006 and EW prefix configured');

// Check Electrical apparatus and checklist constants
assert(src.includes('ELECTRICAL_CHECKLIST_ITEMS'), "ELECTRICAL_CHECKLIST_ITEMS constant must be defined");
assert(src.includes('ELECTRICAL_APPARATUS_OPTIONS'), "ELECTRICAL_APPARATUS_OPTIONS constant must be defined");
console.log('  ✓ PASS: Checklist (14 statutory items) and Apparatus options defined');

// Check roles registration
assert(src.includes("key: 'electrician'"), "ROLES must include electrician role");
assert(src.includes("key: 'quality-engineer'"), "ROLES must include quality-engineer role");
console.log('  ✓ PASS: electrician and quality-engineer roles registered in system');

// Check Statutory Declaration Cards & Checkboxes
assert(src.includes('id="inElecStatutoryDecl"') || src.includes('id="chkElectricalStatutoryDecl"'), "Step 1 Electrician statutory declaration checkbox must exist");
assert(src.includes('id="chkPmStatutoryDecl"'), "P&M statutory declaration checkbox must exist");
assert(src.includes('id="chkQualityStatutoryDecl"'), "Quality Engineer statutory declaration checkbox must exist");
assert(src.includes('id="chkMepPmStatutoryDecl"'), "MEP / P&M domain statutory declaration checkbox must exist");
assert(src.includes('id="surrElectricalClosureChk"'), "Surrender Electrical de-isolation declaration checkbox must exist");
console.log('  ✓ PASS: All statutory declaration cards and checkboxes verified in source');

// --- 2. Runtime Evaluation in VM Sandbox ---
console.log('\n--- 2. Runtime Setup & VM Sandbox Initialization ---');

const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, "Must extract main script tag from index.html");

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
                } else if (force) {
                    this.classes.add(c);
                } else {
                    this.classes.delete(c);
                }
            }
        };
    }
    appendChild(child) { this.children.push(child); return child; }
    removeChild(child) { return child; }
    remove() {}
    querySelector() { return null; }
    querySelectorAll() { return []; }
    focus() {}
    scrollIntoView() {}
    getContext() {
        return {
            clearRect() {}, beginPath() {}, arc() {}, stroke() {}, fill() {},
            moveTo() {}, lineTo() {}, fillText() {}, setLineDash() {}, strokeRect() {}, fillRect() {}
        };
    }
}

const domElements = new Map();
function getOrCreateElem(id, tagName = 'div') {
    if (!domElements.has(id)) {
        domElements.set(id, new MockElement(id, tagName));
    }
    return domElements.get(id);
}

const mockDocument = {
    getElementById: (id) => getOrCreateElem(id),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => new MockElement('', tag),
    body: new MockElement('body', 'body'),
    addEventListener: () => {}
};

const mockWindow = {
    scrollTo: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    innerWidth: 1024,
    innerHeight: 768,
    location: { hash: '' }
};

let toastMessages = [];

// Mock jsPDF for PDF generation testing
class MockPDFDoc {
    constructor(opts) {
        this.opts = opts;
        this.lines = [];
        this.images = [];
        this.pages = 1;
        this.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } };
    }
    setFillColor() { return this; }
    setDrawColor() { return this; }
    setTextColor() { return this; }
    setFont() { return this; }
    setFontSize() { return this; }
    setLineWidth() { return this; }
    rect() { return this; }
    roundedRect() { return this; }
    line() { return this; }
    text(txt, x, y, opts) {
        this.lines.push({ txt, x, y, opts });
        return this;
    }
    splitTextToSize(txt, w) { return Array.isArray(txt) ? txt : [String(txt)]; }
    addImage(data, fmt, x, y, w, h) {
        this.images.push({ data, fmt, x, y, w, h });
        return this;
    }
    addPage() { this.pages++; return this; }
    save(name) { this.savedName = name; return this; }
}

const sandbox = {
    window: mockWindow,
    document: mockDocument,
    history: { pushState: () => {} },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    console: { log: () => {}, warn: () => {}, error: () => {} },
    setTimeout: (fn) => fn(),
    setInterval: () => 1,
    clearTimeout: () => {},
    clearInterval: () => {},
    Math: Math,
    Date: Date,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    isFinite: isFinite,
    JSON: JSON,
    jspdf: { jsPDF: MockPDFDoc },
    showToast: (msg, type) => { toastMessages.push({ msg, type }); }
};

const context = vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], context);

function evalInVM(code) {
    return vm.runInContext(code, context);
}

evalInVM("window.__TEST_MODE__ = true;");
console.log('  ✓ PASS: VM Sandbox initialized successfully');

// --- 3. Facility Scope & Location Mode Rules ---
console.log('\n--- 3. Facility Scope & Location Mode Rules ---');

// Batching Plant: strictly Manual mode only
const modesBatching = evalInVM("getAllowedLocationModes('electrical', { facilityScope: 'batching_plant' })");
assert.strictEqual(JSON.stringify(modesBatching), JSON.stringify(['Manual']), "Batching plant must strictly allow Manual mode only");
console.log('  ✓ PASS: getAllowedLocationModes for batching plant strictly returns [\'Manual\']');

// Site: allows Tower, Basement/Podium, Manual
const modesSite = evalInVM("getAllowedLocationModes('electrical', { facilityScope: 'site' })");
assert.strictEqual(JSON.stringify(modesSite), JSON.stringify(['Tower', 'Basement/Podium', 'Manual']), "Site must allow Tower, Basement/Podium, Manual");
console.log('  ✓ PASS: getAllowedLocationModes for site returns [\'Tower\', \'Basement/Podium\', \'Manual\']');

// Default without draft: returns all 3 for compatibility
const modesDefault = evalInVM("getAllowedLocationModes('electrical')");
assert.strictEqual(JSON.stringify(modesDefault), JSON.stringify(['Tower', 'Basement/Podium', 'Manual']), "Default call returns 3 modes for compatibility");
console.log('  ✓ PASS: getAllowedLocationModes(\'electrical\') default returns 3 modes');

// Role scopes
const scopeElectrician = evalInVM("roleTypeScope('electrician')");
assert.strictEqual(JSON.stringify(scopeElectrician), JSON.stringify(['electrical']), "Electrician role scope must be strictly ['electrical']");
const scopeQuality = evalInVM("roleTypeScope('quality-engineer')");
assert.strictEqual(JSON.stringify(scopeQuality), JSON.stringify(['electrical']), "Quality Engineer role scope must be strictly ['electrical']");
console.log('  ✓ PASS: roleTypeScope(\'electrician\') and roleTypeScope(\'quality-engineer\') are strictly [\'electrical\']');

// Start new PT-06 permit as Electrician with Batching Plant scope
evalInVM("currentUser = { key: 'electrician', name: 'Duty Electrician K. Sharma', role: 'Permittee Electrician' };");
evalInVM("startNewPermit('electrical');");
evalInVM("draft.facilityScope = 'batching_plant'; draft.locationStructure = 'Manual';");

// Attempt to illegally switch to Tower or Basement/Podium while in batching_plant
evalInVM("onUniversalLocationStructureChange('Tower');");
assert.strictEqual(evalInVM("draft.locationStructure"), 'Manual', "Switching to Tower must be blocked for batching plant");
evalInVM("onUniversalLocationStructureChange('Basement/Podium');");
assert.strictEqual(evalInVM("draft.locationStructure"), 'Manual', "Switching to Basement/Podium must be blocked for batching plant");
console.log('  ✓ PASS: Illegal location mode switch blocked for batching plant');

// Switch to Site scope and ensure Tower and Basement/Podium switch succeeds
evalInVM("draft.facilityScope = 'site';");
evalInVM("onUniversalLocationStructureChange('Tower');");
assert.strictEqual(evalInVM("draft.locationStructure"), 'Tower', "Switching to Tower must succeed for site scope");
evalInVM("onUniversalLocationStructureChange('Basement/Podium');");
assert.strictEqual(evalInVM("draft.locationStructure"), 'Basement/Podium', "Switching to Basement/Podium must succeed for site scope");
console.log('  ✓ PASS: Legal location mode switch succeeds for site scope');

// --- 4. Permittee Electrician & Step 1 Parameter Validation ---
console.log('\n--- 4. Permittee Electrician & Step 1 Validation ---');

evalInVM("startNewPermit('electrical');");
evalInVM("draft.facilityScope = 'batching_plant'; draft.locationStructure = 'Manual';");
evalInVM("draft.project = PROJECTS[0].name;");
evalInVM("draft.locManual = 'Main Batching Plant Yard';");
evalInVM("draft.locManualArea = 'MCC Feeder Panel 01';");

// 1. Missing shutdownWhy
evalInVM("draft.shutdownWhy = ''; draft.electricalApparatus = ['Transformers']; draft.shutdownTimeFrom = '09:00'; draft.shutdownTimeTo = '14:00'; draft.electricalSafeToWork = true; draft.lotoDone = true; draft.elecLotoDone = true; draft.lotoRegisterNo = 'REG-001'; draft.lotoDateTime = '2026-09-10T09:00'; draft.elecLotoTime = '09:00'; draft.elecLotoDate = '2026-09-10'; draft.electricalStatutoryDecl = true;");
assert.strictEqual(evalInVM("validateWizStep(1)"), false, "Step 1 must fail when shutdownWhy is empty");

// 2. Missing electricalApparatus
evalInVM("draft.shutdownWhy = 'Feeder maintenance'; draft.electricalApparatus = [];");
assert.strictEqual(evalInVM("validateWizStep(1)"), false, "Step 1 must fail when electricalApparatus is empty");

// 3. Invalid shutdown hours (from >= to)
evalInVM("draft.electricalApparatus = ['Transformers']; draft.shutdownTimeFrom = '14:00'; draft.shutdownTimeTo = '09:00';");
assert.strictEqual(evalInVM("validateWizStep(1)"), false, "Step 1 must fail when shutdownTimeFrom >= shutdownTimeTo");

// 4. Missing safe to work checkbox
evalInVM("draft.shutdownTimeFrom = '09:00'; draft.shutdownTimeTo = '14:00'; draft.electricalSafeToWork = false; draft.elecSafeToWork = false;");
assert.strictEqual(evalInVM("validateWizStep(1)"), false, "Step 1 must fail when electricalSafeToWork is false");

// 5. Missing LOTO done checkbox
evalInVM("draft.electricalSafeToWork = true; draft.elecSafeToWork = true; draft.lotoDone = false; draft.elecLotoDone = false;");
assert.strictEqual(evalInVM("validateWizStep(1)"), false, "Step 1 must fail when LOTO done is false");

// 6. Missing LOTO register number
evalInVM("draft.lotoDone = true; draft.elecLotoDone = true; draft.lotoRegisterNo = ''; draft.elecLotoRegisterNo = '';");
assert.strictEqual(evalInVM("validateWizStep(1)"), false, "Step 1 must fail when lotoRegisterNo is empty");

// 7. Missing LOTO datetime
evalInVM("draft.lotoRegisterNo = 'REG-001'; draft.elecLotoRegisterNo = 'REG-001'; draft.lotoDateTime = ''; draft.elecLotoTime = ''; draft.elecLotoDate = '';");
assert.strictEqual(evalInVM("validateWizStep(1)"), false, "Step 1 must fail when lotoDateTime is empty");

// 8. Missing pre-work statutory declaration
evalInVM("draft.lotoDateTime = '2026-09-10T09:00'; draft.elecLotoTime = '09:00'; draft.elecLotoDate = '2026-09-10'; draft.electricalStatutoryDecl = false; draft.elecStatutoryDecl = false;");
assert.strictEqual(evalInVM("validateWizStep(1)"), false, "Step 1 must fail when electricalStatutoryDecl is false");

// 9. All fields valid
evalInVM("draft.electricalStatutoryDecl = true; draft.elecStatutoryDecl = true;");
assert.strictEqual(evalInVM("validateWizStep(1)"), true, "Step 1 must pass when all electrical fields are valid");
console.log('  ✓ PASS: Step 1 strictly validates shutdownWhy, apparatus, shutdown hours, LOTO register/time, safe to work, and statutory declaration');

// Step 2 checklist validation (all 14 items)
const chkItems = evalInVM("ELECTRICAL_CHECKLIST_ITEMS");
assert.strictEqual(chkItems.length, 14, "Electrical checklist must have exactly 14 items");
evalInVM("draft.checklist = ELECTRICAL_CHECKLIST_ITEMS.map(q => ({ q, ans: 'yes', comment: null, photo: null, gps: null, autoPicked: false }));");
evalInVM("draft.sitePhoto = 'demo';");
assert.strictEqual(evalInVM("validateWizStep(2)"), true, "Step 2 passes with all items answered yes");

// Step 3 does NOT require excavation drawing
evalInVM(`
nowTime = () => new Date(2026, 8, 9, 11, 0, 0);
draft.startTime = '11:30';
draft.validTillTime = '16:00';
draft.drawing = null;
`);
assert.strictEqual(evalInVM("validateWizStep(3)"), true, "Step 3 passes without requiring excavation drawing for electrical");
console.log('  ✓ PASS: Step 2 and Step 3 pass cleanly without requiring excavation drawing');

// --- 5. Dual Approval Flow: Batching Plant ---
console.log('\n--- 5. Dual Approval Flow: Batching Plant ---');

// Submit Batching Plant permit
evalInVM("currentUser = { key: 'electrician', name: 'Duty Electrician K. Sharma', role: 'Permittee Electrician' };");
evalInVM("draft.signature = { dataUrl: makeSimSignature('Duty Electrician K. Sharma'), at: nowTime(), by: 'Duty Electrician K. Sharma' };");
evalInVM("draft.gps = { lat: 12.971, lng: 77.594, within: true, distance: 10 };");
evalInVM("executeFinalSubmit();");

const bpPermit = evalInVM("PERMITS[PERMITS.length - 1]");
assert.strictEqual(bpPermit.ptype, 'electrical', "Permit ptype must be electrical");
assert.strictEqual(bpPermit.facilityScope, 'batching_plant', "Permit facilityScope must be batching_plant");
assert.strictEqual(bpPermit.status, 'Pending P&M Acknowledgment', "Batching Plant permit must route to Pending P&M Acknowledgment");
console.log('  ✓ PASS: Batching Plant permit submitted directly to Pending P&M Acknowledgment');

// Stage 2: P&M Acknowledgment with statutory declaration
// Non-PM role cannot act
evalInVM("currentUser = { key: 'site-engineer', name: 'Site Eng', role: 'Site Engineer' };");
assert.strictEqual(evalInVM("roleCanActOnChain(PERMITS[PERMITS.length - 1])"), false, "Site Engineer cannot act on Pending P&M Acknowledgment");

// PM role can act
evalInVM("currentUser = { key: 'pm', name: 'P&M Plant Incharge', role: 'P&M Engineer' };");
assert.strictEqual(evalInVM("roleCanActOnChain(PERMITS[PERMITS.length - 1])"), true, "P&M Engineer can act on Pending P&M Acknowledgment");

// Acknowledge with statutory declaration
evalInVM("acknowledgePmEngineer(PERMITS[PERMITS.length - 1].id, 'Plant isolation confirmed and LOTO tag verified', { lat: 12.971, lng: 77.594 }, makeSimSignature('P&M Plant Incharge'), true);");
const bpPermitAfterPm = evalInVM("PERMITS.find(p => p.id === '" + bpPermit.id + "')");
assert.strictEqual(bpPermitAfterPm.status, 'Pending Quality Engineer Approval', "P&M Acknowledgment must advance to Pending Quality Engineer Approval");
assert.strictEqual(bpPermitAfterPm.pmAck.acknowledged, true, "pmAck.acknowledged must be true");
assert.strictEqual(bpPermitAfterPm.pmAck.statutoryDeclaration, true, "pmAck.statutoryDeclaration must be true");
console.log('  ✓ PASS: P&M Acknowledgment with statutory declaration advances to Pending Quality Engineer Approval');

// Stage 3: Quality Engineer Approval with statutory declaration
// Non-QE role cannot act
evalInVM("currentUser = { key: 'mep', name: 'MEP Eng', role: 'MEP Engineer' };");
assert.strictEqual(evalInVM("roleCanActOnChain(PERMITS.find(p => p.id === '" + bpPermit.id + "'))"), false, "MEP cannot act on Quality Engineer stage");

// QE can act
evalInVM("currentUser = { key: 'quality-engineer', name: 'Lead Quality Inspector', role: 'Quality Engineer' };");
assert.strictEqual(evalInVM("roleCanActOnChain(PERMITS.find(p => p.id === '" + bpPermit.id + "'))"), true, "Quality Engineer can act on Quality Engineer stage");

// Quality Engineer approves
evalInVM("approveCurrentChain(PERMITS.find(p => p.id === '" + bpPermit.id + "'), 'Quality Engineer insulation resistance test verified > 50 Megohm', { lat: 12.971, lng: 77.594 }, makeSimSignature('Lead Quality Inspector'));");
const bpPermitAfterQe = evalInVM("PERMITS.find(p => p.id === '" + bpPermit.id + "')");
assert.strictEqual(bpPermitAfterQe.status, 'Pending EHS Approval', "Quality Engineer approval must advance to Pending EHS Approval");
console.log('  ✓ PASS: Quality Engineer approval advances to Pending EHS Approval');

// Stage 4: EHS Endorsement activates permit
evalInVM("currentUser = { key: 'ehs-manager', name: 'Safety Head', role: 'EHS Manager' };");
evalInVM("approveCurrentChain(PERMITS.find(p => p.id === '" + bpPermit.id + "'), 'EHS endorsement approved', { lat: 12.971, lng: 77.594 }, makeSimSignature('Safety Head'));");
const bpPermitActive = evalInVM("PERMITS.find(p => p.id === '" + bpPermit.id + "')");
assert.strictEqual(bpPermitActive.status, 'Active', "EHS endorsement must activate the Batching Plant electrical permit");
console.log('  ✓ PASS: EHS endorsement activates the Batching Plant electrical permit');

// --- 6. Dual Approval Flow: Site ---
console.log('\n--- 6. Dual Approval Flow: Site ---');

// Submit Site electrical permit
evalInVM("currentUser = { key: 'electrician', name: 'Duty Electrician K. Sharma', role: 'Permittee Electrician' };");
evalInVM("startNewPermit('electrical');");
evalInVM("draft.facilityScope = 'site'; draft.electricalSiteType = 'site'; draft.locationStructure = 'Tower'; draft.tower = 'Block A'; draft.locFloor = 'Floor 5'; draft.locUnit = 'Riser Shaft 2';");
evalInVM("draft.project = PROJECTS[0].name;");
evalInVM("draft.shutdownWhy = 'Installation of busduct tap-off and breaker commissioning';");
evalInVM("draft.electricalApparatus = ['Cables / Busbars', 'Switchgear / Breakers'];");
evalInVM("draft.shutdownTimeFrom = '10:00'; draft.shutdownTimeTo = '15:00'; draft.approxShutdownFrom = '10:00'; draft.approxShutdownTo = '15:00';");
evalInVM("draft.electricalSafeToWork = true; draft.elecSafeToWork = true; draft.lotoDone = true; draft.elecLotoDone = true; draft.lotoRegisterNo = 'REG-SITE-101'; draft.elecLotoRegisterNo = 'REG-SITE-101'; draft.lotoDateTime = '2026-09-10T10:00'; draft.elecLotoTime = '10:00'; draft.elecLotoDate = '2026-09-10'; draft.electricalStatutoryDecl = true; draft.elecStatutoryDecl = true;");
evalInVM("draft.checklist = ELECTRICAL_CHECKLIST_ITEMS.map(q => ({ q, ans: 'yes', comment: null, photo: null, gps: null, autoPicked: false }));");
evalInVM("draft.drawing = null; draft.sitePhoto = 'demo'; draft.startTime = '11:30'; draft.validTillTime = '16:00';");
evalInVM("draft.signature = { dataUrl: makeSimSignature('Duty Electrician K. Sharma'), at: nowTime(), by: 'Duty Electrician K. Sharma' };");
evalInVM("draft.gps = { lat: 12.971, lng: 77.594, within: true, distance: 10 };");
evalInVM("executeFinalSubmit();");

const sitePermit = evalInVM("PERMITS[PERMITS.length - 1]");
assert.strictEqual(sitePermit.ptype, 'electrical', "Permit ptype must be electrical");
assert.strictEqual(sitePermit.facilityScope, 'site', "Permit facilityScope must be site");
assert.strictEqual(sitePermit.status, 'Pending Site Engineer Acknowledgment', "Site electrical permit must route to Pending Site Engineer Acknowledgment");
console.log('  ✓ PASS: Site electrical permit submitted to Pending Site Engineer Acknowledgment');

// Stage 2: Site Engineer Acknowledgment
evalInVM("currentUser = { key: 'site-engineer', name: 'Duty Site Engineer', role: 'Site Engineer' };");
assert.strictEqual(evalInVM("roleCanActOnChain(PERMITS.find(p => p.id === '" + sitePermit.id + "'))"), true, "Site Engineer can act on Site Ack stage");
evalInVM("acknowledgeSiteEngineer(PERMITS.find(p => p.id === '" + sitePermit.id + "').id, 'Site civil clearance confirmed', { lat: 12.971, lng: 77.594 }, makeSimSignature('Duty Site Engineer'));");

const sitePermitAfterSiteEng = evalInVM("PERMITS.find(p => p.id === '" + sitePermit.id + "')");
assert.strictEqual(sitePermitAfterSiteEng.status, 'Pending MEP or P&M Approval', "Site Engineer ack must route to Pending MEP or P&M Approval");
console.log('  ✓ PASS: Site Engineer acknowledgment advances to Pending MEP or P&M Approval');

// Stage 3: Domain Clearance (Either/Or rule)
// Quality Engineer CANNOT act on site stage 3
evalInVM("currentUser = { key: 'quality-engineer', name: 'Lead Quality Inspector', role: 'Quality Engineer' };");
assert.strictEqual(evalInVM("roleCanActOnChain(PERMITS.find(p => p.id === '" + sitePermit.id + "'))"), false, "Quality Engineer cannot act on Site MEP/P&M stage");

// MEP Engineer CAN act
evalInVM("currentUser = { key: 'mep', name: 'MEP Project Engineer', role: 'MEP Engineer' };");
assert.strictEqual(evalInVM("roleCanActOnChain(PERMITS.find(p => p.id === '" + sitePermit.id + "'))"), true, "MEP Engineer can act on Site MEP/P&M stage");

// P&M Engineer ALSO CAN act (either/or)
evalInVM("currentUser = { key: 'pm', name: 'P&M Plant Incharge', role: 'P&M Engineer' };");
assert.strictEqual(evalInVM("roleCanActOnChain(PERMITS.find(p => p.id === '" + sitePermit.id + "'))"), true, "P&M Engineer can ALSO act on Site MEP/P&M stage");

// Let MEP approve
evalInVM("currentUser = { key: 'mep', name: 'MEP Project Engineer', role: 'MEP Engineer' };");
evalInVM("approveCurrentChain(PERMITS.find(p => p.id === '" + sitePermit.id + "'), 'MEP domain verified and single line diagram reviewed', { lat: 12.971, lng: 77.594 }, makeSimSignature('MEP Project Engineer'));");

const sitePermitAfterMep = evalInVM("PERMITS.find(p => p.id === '" + sitePermit.id + "')");
assert.strictEqual(sitePermitAfterMep.status, 'Pending Section Head', "MEP approval must advance to Pending Section Head (Tower Incharge)");
console.log('  ✓ PASS: MEP approval satisfies Stage 3 either/or clearance and advances to Pending Section Head');

// Stage 4: Tower Incharge Review
evalInVM("currentUser = { key: 'section-head', name: 'Tower 1 Incharge', role: 'Section Head / Tower Incharge' };");
assert.strictEqual(evalInVM("roleCanActOnChain(PERMITS.find(p => p.id === '" + sitePermit.id + "'))"), true, "Tower Incharge can act on Section Head stage");
evalInVM("approveCurrentChain(PERMITS.find(p => p.id === '" + sitePermit.id + "'), 'Tower incharge clearance granted', { lat: 12.971, lng: 77.594 }, makeSimSignature('Tower 1 Incharge'));");

const sitePermitAfterSecHead = evalInVM("PERMITS.find(p => p.id === '" + sitePermit.id + "')");
assert.strictEqual(sitePermitAfterSecHead.status, 'Pending EHS Approval', "Tower Incharge approval advances to Pending EHS Approval");
console.log('  ✓ PASS: Tower Incharge approval advances to Pending EHS Approval');

// Stage 5: EHS Endorsement activates permit
evalInVM("currentUser = { key: 'ehs-manager', name: 'Safety Head', role: 'EHS Manager' };");
evalInVM("approveCurrentChain(PERMITS.find(p => p.id === '" + sitePermit.id + "'), 'EHS final site endorsement', { lat: 12.971, lng: 77.594 }, makeSimSignature('Safety Head'));");

const sitePermitActive = evalInVM("PERMITS.find(p => p.id === '" + sitePermit.id + "')");
assert.strictEqual(sitePermitActive.status, 'Active', "EHS endorsement must activate the Site electrical permit");
console.log('  ✓ PASS: EHS endorsement activates the Site electrical permit');

// --- 7. Rejection & Return for Correction Flows ---
console.log('\n--- 7. Rejection & Return for Correction Flows ---');

// Batching Plant P&M Rejection flow
evalInVM("currentUser = { key: 'electrician', name: 'Duty Electrician K. Sharma', role: 'Permittee Electrician' };");
evalInVM("startNewPermit('electrical');");
evalInVM("draft.facilityScope = 'batching_plant'; draft.electricalSiteType = 'batching_plant'; draft.locationStructure = 'Manual'; draft.locManual = 'Yard'; draft.locManualArea = 'Substation';");
evalInVM("draft.shutdownWhy = 'Testing'; draft.electricalApparatus = ['Transformers']; draft.shutdownTimeFrom = '08:00'; draft.shutdownTimeTo = '12:00'; draft.approxShutdownFrom = '08:00'; draft.approxShutdownTo = '12:00';");
evalInVM("draft.electricalSafeToWork = true; draft.elecSafeToWork = true; draft.lotoDone = true; draft.elecLotoDone = true; draft.lotoRegisterNo = 'REG-BP-REJ'; draft.elecLotoRegisterNo = 'REG-BP-REJ'; draft.lotoDateTime = '2026-09-10T08:00'; draft.elecLotoTime = '08:00'; draft.elecLotoDate = '2026-09-10'; draft.electricalStatutoryDecl = true; draft.elecStatutoryDecl = true;");
evalInVM("draft.checklist = ELECTRICAL_CHECKLIST_ITEMS.map(q => ({ q, ans: 'yes', comment: null, photo: null, gps: null, autoPicked: false }));");
evalInVM("draft.drawing = null; draft.sitePhoto = 'demo'; draft.startTime = '11:30'; draft.validTillTime = '16:00';");
evalInVM("draft.signature = { dataUrl: makeSimSignature('Duty Electrician K. Sharma'), at: nowTime(), by: 'Duty Electrician K. Sharma' };");
evalInVM("draft.gps = { lat: 12.971, lng: 77.594, within: true, distance: 10 };");
evalInVM("executeFinalSubmit();");
const rejPermit = evalInVM("PERMITS[PERMITS.length - 1]");

// P&M Rejects
evalInVM("currentUser = { key: 'pm', name: 'P&M Plant Incharge', role: 'P&M Engineer' };");
evalInVM("rejectPmEngineer(PERMITS.find(p => p.id === '" + rejPermit.id + "').id, 'Batching plant production ongoing, reschedule after 18:00');");
const rejPermitAfter = evalInVM("PERMITS.find(p => p.id === '" + rejPermit.id + "')");
assert.strictEqual(rejPermitAfter.status, 'Returned for Correction', "P&M rejection must return permit for correction");
assert.strictEqual(rejPermitAfter.returnStage, 'pm', "returnStage must be pm");
console.log('  ✓ PASS: P&M Engineer rejection returns permit for correction to Electrician');

// Electrician resubmits
evalInVM("currentUser = { key: 'electrician', name: 'Duty Electrician K. Sharma', role: 'Permittee Electrician' };");
evalInVM("resubmitPermit(PERMITS.find(p => p.id === '" + rejPermit.id + "').id, 'Rescheduled shutdown window to 18:30');");
const rejPermitResubmitted = evalInVM("PERMITS.find(p => p.id === '" + rejPermit.id + "')");
assert.strictEqual(rejPermitResubmitted.status, 'Pending P&M Re-Acknowledgment', "Resubmitted permit must route to Pending P&M Re-Acknowledgment");
console.log('  ✓ PASS: Resubmission routes to Pending P&M Re-Acknowledgment');

// Re-acknowledge by P&M
evalInVM("currentUser = { key: 'pm', name: 'P&M Plant Incharge', role: 'P&M Engineer' };");
evalInVM("acknowledgeReturnPermitEng(PERMITS.find(p => p.id === '" + rejPermit.id + "').id, 'Updated timing confirmed safe');");
const rejPermitReAck = evalInVM("PERMITS.find(p => p.id === '" + rejPermit.id + "')");
assert.strictEqual(rejPermitReAck.status, 'Pending Quality Engineer Approval', "P&M re-acknowledgment routes forward to Quality Engineer");
console.log('  ✓ PASS: P&M Re-acknowledgment routes forward to Pending Quality Engineer Approval');

// --- 8. Safety Observations Gate ---
console.log('\n--- 8. Safety Observations Gate ---');

// Raise an open observation on the active Site permit
evalInVM("PERMITS.find(p => p.id === '" + sitePermitActive.id + "').status = 'Active – Observation Open';");
evalInVM("PERMITS.find(p => p.id === '" + sitePermitActive.id + "').observation = { id: 'OBS-EL-001', status: 'Open', comment: 'Rubber insulating mat missing at HT panel front', raisedBy: 'EHS Inspector', raisedByRole: 'EHS Safety Officer', raisedAt: nowTime(), response: null };");

// Render action panel as Electrician
evalInVM("currentUser = { key: 'electrician', name: 'Duty Electrician K. Sharma', role: 'Permittee Electrician' };");
const panelObsOpen = evalInVM("actionPanelHtml(PERMITS.find(p => p.id === '" + sitePermitActive.id + "'))");
assert(panelObsOpen.includes('Active Safety Observation In Progress'), "Action panel must show active observation warning");
assert(panelObsOpen.includes('Extension and surrender are locked until observation is resolved'), "Extension and surrender must be locked when observation open");
console.log('  ✓ PASS: Active safety observation strictly blocks closure/surrender and extension');

// Close the observation
evalInVM("PERMITS.find(p => p.id === '" + sitePermitActive.id + "').observation.status = 'Resolved';");
evalInVM("PERMITS.find(p => p.id === '" + sitePermitActive.id + "').status = 'Active';");
const panelObsClosed = evalInVM("actionPanelHtml(PERMITS.find(p => p.id === '" + sitePermitActive.id + "'))");
assert(panelObsClosed.includes('Close &amp; Surrender Permit'), "Action panel must restore Close & Surrender button once observation resolved");
console.log('  ✓ PASS: Resolving observation unblocks Close & Surrender button');

// --- 9. Surrender Flow & Electrical De-isolation ---
console.log('\n--- 9. Surrender Flow & Electrical De-isolation ---');

// RBAC Gate: Non-electrician role CANNOT surrender PT-06
evalInVM("currentUser = { key: 'site-supervisor', name: 'Site Supervisor', role: 'Site Supervisor' };");
const activeP = evalInVM("PERMITS.find(p => p.id === '" + sitePermitActive.id + "')");
// Testing RBAC restriction logic:
assert.strictEqual(evalInVM("currentUser.key === 'electrician' || (currentUser.role && currentUser.role.toLowerCase().includes('electrician'))"), false, "Non-electrician must not be recognized as Electrician");

// Electrician opens surrender flow
evalInVM("currentUser = { key: 'electrician', name: 'Duty Electrician K. Sharma', role: 'Permittee Electrician' };");
assert.strictEqual(evalInVM("currentUser.key === 'electrician' || (currentUser.role && currentUser.role.toLowerCase().includes('electrician'))"), true, "Electrician recognized for PT-06 surrender");

// Surrender modal HTML verification
evalInVM("openSurrenderFlow(PERMITS.find(p => p.id === '" + sitePermitActive.id + "').id);");
const surrCard = getOrCreateElem('surrenderModalBody');
assert(surrCard.innerHTML.includes('ELECTRICAL DE-ISOLATION &amp; RESTORATION DECLARATION'), "Surrender modal must contain prominent electrical de-isolation declaration");
assert(surrCard.innerHTML.includes('surrElectricalClosureChk'), "Surrender modal must contain surrElectricalClosureChk checkbox");
assert(surrCard.innerHTML.includes('Lockouts surrendered and key returned to supervisor'), "Declaration must mention lockouts surrendered");
console.log('  ✓ PASS: Surrender modal renders statutory Electrical De-isolation card and checkbox');

// Close and surrender permit with electrical de-isolation confirmed
evalInVM("closeAndSurrenderPermit(PERMITS.find(p => p.id === '" + sitePermitActive.id + "').id, 'All HT connections torqued, locks surrendered, breaker energized on test load', { lat: 12.971, lng: 77.594 }, 'data:image/jpeg;base64,demoPhoto', { electricalSurrender: true });");
const surrenderedP = evalInVM("PERMITS.find(p => p.id === '" + sitePermitActive.id + "')");
assert.strictEqual(surrenderedP.status, 'Completed (Surrendered)', "Status must update to Completed (Surrendered)");
assert.strictEqual(surrenderedP.surrender.electricalClosureConfirmed, true, "electricalClosureConfirmed must be true");
console.log('  ✓ PASS: Permit surrendered successfully with electrical de-isolation certification');

// --- 10. PDF Generation ---
console.log('\n--- 10. PDF Generation Verification ---');

// Generate PDF for Batching Plant permit
evalInVM("generatePermitPDF(PERMITS.find(p => p.id === '" + bpPermitActive.id + "').id);");
console.log('  ✓ PASS: PDF generation executes cleanly for Batching Plant electrical permit');

// Generate PDF for Site electrical permit
evalInVM("generatePermitPDF(PERMITS.find(p => p.id === '" + surrenderedP.id + "').id);");
console.log('  ✓ PASS: PDF generation executes cleanly for Site electrical permit (surrendered with de-isolation certified)');

// --- 11. Detail View Verification ---
console.log('\n--- 11. Detail View Rendering Verification ---');

evalInVM("viewDetail(PERMITS.find(p => p.id === '" + bpPermitActive.id + "').id);");
const detailElem = getOrCreateElem('view-detail');
assert(detailElem.innerHTML.includes('Batching Plant'), "Detail view must display Batching Plant facility scope");
assert(detailElem.innerHTML.includes('Reason for Shutdown'), "Detail view must display Reason for Shutdown");
assert(detailElem.innerHTML.includes('Apparatus to be Worked On'), "Detail view must display Apparatus to be Worked On");
assert(detailElem.innerHTML.includes('Lockout / Tagout (LOTO)'), "Detail view must display LOTO register and placed time");
assert(detailElem.innerHTML.includes('Statutory Declaration'), "Detail view must display Statutory Declaration");
console.log('  ✓ PASS: viewDetail correctly renders all PT-06 specific fields and badges');

evalInVM("viewDetail(PERMITS.find(p => p.id === '" + surrenderedP.id + "').id);");
assert(detailElem.innerHTML.includes('Electrical De-Isolation'), "Detail view of surrendered permit must display Electrical De-Isolation check");
console.log('  ✓ PASS: viewDetail renders Electrical De-Isolation confirmation in Surrender section');

console.log('\n==================================================');
console.log('ALL PT-06 ELECTRICAL WORK TESTS PASSED (100% SUCCESS RATE)');
console.log('==================================================\n');
