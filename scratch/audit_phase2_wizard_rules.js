const fs = require('fs');
const assert = require('assert');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync('index.html', 'utf8');
const scriptMatch = src.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
assert(scriptMatch, 'Script match must exist');

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

const sandbox = {
    window: { scrollTo: () => {}, scrollBy: () => {} },
    document: {
        getElementById: (id) => getEl(id),
        querySelector: (sel) => getEl(sel.replace(/^[#.]/, '')),
        querySelectorAll: () => [],
        createElement: (tag) => new MockElement('', tag),
        body: new MockElement('body', 'body'),
        addEventListener: () => {},
        removeEventListener: () => {}
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
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
sandbox.window.document = sandbox.document;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

const evalInVM = (code) => vm.runInContext(code, sandbox);

console.log('=== AUDITING SPECIFIC WIZARD RULES & VALIDATION GATES ===\n');

// 1. Excavation: Depth & Slope & Equipment gating in Step 1
evalInVM(`
    currentUser = Object.assign({}, roleInfo('site-supervisor'));
    startNewPermit('excavation');
    PROJECTS[0].configured = true;
    draft.project = PROJECTS[0].name;
    draft.locationStructure = 'Basement/Podium';
    draft.locBasementPodium = 'Basement 1';
    draft.locArea = 'Retaining Wall North';
    draft.depth = '';
    draft.slope = '45';
    draft.equipment = [];
    exV1 = validateWizStep(1);
    
    draft.depth = '3.5';
    draft.slope = '45';
    draft.equipment = ['Excavator'];
    exV2 = validateWizStep(1);
`);
console.log('1. Excavation empty depth/equipment validation:', evalInVM('exV1 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   Excavation filled depth/equipment validation:', evalInVM('exV2 === true') ? '✅ PASSED' : '🔴 FAILED');
assert.strictEqual(evalInVM('exV1'), false);
assert.strictEqual(evalInVM('exV2'), true);

// 2. Confined Space: Mandatory Activity, Personnel, and Pre-entry Declaration in Step 1
evalInVM(`
    startNewPermit('confined');
    PROJECTS[0].configured = true;
    draft.project = PROJECTS[0].name;
    draft.locationStructure = 'Basement/Podium';
    draft.locBasementPodium = 'Basement 1';
    draft.locArea = 'Sewage Treatment Plant';
    draft.confinedActivity = 'STP / WTP Maintenance';
    draft.numPersonnel = '0'; // invalid personnel count
    draft.confinedDeclaration = false;
    csV1 = validateWizStep(1);

    draft.numPersonnel = '3';
    draft.confinedDeclaration = false;
    csV2 = validateWizStep(1);

    draft.confinedDeclaration = true;
    csV3 = validateWizStep(1);
`);
console.log('2. Confined space invalid personnel count (< 1):', evalInVM('csV1 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   Confined space missing mandatory safety declaration:', evalInVM('csV2 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   Confined space with valid personnel & declaration:', evalInVM('csV3 === true') ? '✅ PASSED' : '🔴 FAILED');
assert.strictEqual(evalInVM('csV1'), false);
assert.strictEqual(evalInVM('csV2'), false);
assert.strictEqual(evalInVM('csV3'), true);

// 3. Electrical Work: LOTO Register No, Date/Time, and Statutory Declaration in Step 1
evalInVM(`
    currentUser = Object.assign({}, roleInfo('electrician'));
    startNewPermit('electrical');
    PROJECTS[0].configured = true;
    draft.project = PROJECTS[0].name;
    draft.locationStructure = 'Manual';
    draft.locManual = 'Batching Plant';
    draft.locManualArea = 'Main Panel';
    draft.shutdownWhy = 'Testing MCC';
    draft.electricalApparatus = ['Transformers'];
    draft.elecSafeToWork = true;
    draft.elecLotoDone = true;
    draft.elecLotoRegisterNo = ''; // Missing LOTO register
    draft.elecLotoDate = '2026-10-06';
    draft.elecLotoTime = '09:00';
    draft.elecStatutoryDecl = true;
    elecV1 = validateWizStep(1);

    draft.elecLotoRegisterNo = 'LOTO-REG-4421';
    draft.elecStatutoryDecl = false; // Missing statutory declaration
    elecV2 = validateWizStep(1);

    draft.elecStatutoryDecl = true;
    elecV3 = validateWizStep(1);
`);
console.log('3. Electrical work missing LOTO register number:', evalInVM('elecV1 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   Electrical work missing CEA statutory declaration:', evalInVM('elecV2 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   Electrical work with all LOTO & declaration fields complete:', evalInVM('elecV3 === true') ? '✅ PASSED' : '🔴 FAILED');
assert.strictEqual(evalInVM('elecV1'), false);
assert.strictEqual(evalInVM('elecV2'), false);
assert.strictEqual(evalInVM('elecV3'), true);

// 4. Lifting Operations: Pre-location signatures (Crane Operator + Rigger) & Rigging Plan in Step 1
evalInVM(`
    currentUser = Object.assign({}, roleInfo('lift-supervisor'));
    startNewPermit('lifting');
    PROJECTS[0].configured = true;
    draft.project = PROJECTS[0].name;
    draft.locationStructure = 'Tower';
    draft.tower = 'Tower A';
    draft.locFloor = 'Floor 2';
    draft.locUnit = 'Drop Zone';
    // Fill all sub-table fields except signatures
    draft.loadDescription = 'Air handling units';
    draft.numWorkers = '4';
    draft.loadWeight = '3.5';
    draft.loadWeightType = 'Gross Weight';
    draft.loadDimX = '2'; draft.loadDimY = '2'; draft.loadDimZ = '2';
    draft.loadCg = 'Central'; draft.loadCgType = 'Standard';
    draft.liftingDocs = ['Lift Permit'];
    draft.craneEquipmentType = 'Mobile Crane';
    draft.craneRegId = 'CR-102';
    draft.craneSwl = '10.0';
    draft.craneCertDate = '2026-01-01';
    draft.craneCertNo = 'CERT-9988';
    draft.craneBoomLength = '25';
    draft.craneFlyJib = '0';
    draft.craneOffsetAngle = '0';
    draft.craneRadiusInitial = '5'; draft.craneSwlInitial = '10';
    draft.craneRadiusFinal = '8'; draft.craneSwlFinal = '8';
    draft.craneRadiusWorst = '10'; draft.craneSwlWorst = '6';
    draft.craneGearType = 'Wire Rope Sling';
    draft.craneGearWeight = '0.2';
    draft.craneTandemLift = 'no';
    draft.slingDiameter = '20';
    draft.slingLength = '4';
    draft.slingApexHeight = '3';
    draft.slingSwl = '5.0';
    draft.slingsCount = '2';
    draft.slingsAdjustable = 'no';
    draft.riggingGears = [{ type: 'Wire Rope Sling', serialNo: 'WRS-1', swl: 5, certDate: '2026-01-01' }];
    draft.liftingComms = 'Two-way Radio';
    draft.liftingGround = 'Compacted Soil / Outrigger Mats';
    draft.liftingRoadTrap = 'no';
    draft.liftingSpecialPrecautions = 'Exclusion zone 15m radius barriered';
    draft.craneOperatorSig = null;
    draft.riggerSig = null;
    liftV1 = validateWizStep(1);

    // Add Crane Operator sig only
    draft.craneOperatorSig = 'data:image/png;base64,mockop';
    draft.riggerSig = null;
    liftV2 = validateWizStep(1);

    // Add Rigger sig as well
    draft.riggerSig = 'data:image/png;base64,mockrig';
    liftV3 = validateWizStep(1);
`);
console.log('4. Lifting without pre-location signatures:', evalInVM('liftV1 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   Lifting with Crane Operator signature only (missing Rigger):', evalInVM('liftV2 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   Lifting with both pre-location signatures and rigging specs:', evalInVM('liftV3 === true') ? '✅ PASSED' : '🔴 FAILED');
assert.strictEqual(evalInVM('liftV1'), false);
assert.strictEqual(evalInVM('liftV2'), false);
assert.strictEqual(evalInVM('liftV3'), true);

// 5. Blasting: Step 3 sunset cap (18:30 IST) & Step 4 PESO Statutory Declaration
evalInVM(`
    currentUser = Object.assign({}, roleInfo('blasting-incharge'));
    startNewPermit('blasting');
    PROJECTS[0].configured = true;
    draft.project = PROJECTS[0].name;
    draft.drillingBlastingType = 'blasting';
    draft.dbOperationType = 'Blasting';
    draft.startTime = '14:00';
    
    // Step 3 time beyond 18:30 IST
    draft.validTillTime = '19:00';
    blastTimeV1 = validateWizStep(3);

    // Step 3 time at or before 18:30 IST
    draft.validTillTime = '18:30';
    blastTimeV2 = validateWizStep(3);

    // Step 4 PESO declaration gating
    draft.signerVerified = true;
    draft.signature = { dataUrl: 'data:image/png;base64,mock' };
    draft.blastingStatutoryDecl = false;
    blastDeclV1 = validateWizStep(4);

    draft.blastingStatutoryDecl = true;
    blastDeclV2 = validateWizStep(4);
`);
console.log('5. Blasting validity time beyond 18:30 sunset hard cap:', evalInVM('blastTimeV1 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   Blasting validity time within 18:30 sunset hard cap:', evalInVM('blastTimeV2 === true') ? '✅ PASSED' : '🔴 FAILED');
console.log('   Blasting Step 4 without PESO statutory declaration:', evalInVM('blastDeclV1 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   Blasting Step 4 with PESO statutory declaration:', evalInVM('blastDeclV2 === true') ? '✅ PASSED' : '🔴 FAILED');
assert.strictEqual(evalInVM('blastTimeV1'), false);
assert.strictEqual(evalInVM('blastTimeV2'), true);
assert.strictEqual(evalInVM('blastDeclV1'), false);
assert.strictEqual(evalInVM('blastDeclV2'), true);

// 6. Night Shift: Subcontractor and Linked Permit rules in Step 1
evalInVM(`
    currentUser = Object.assign({}, roleInfo('site-supervisor'));
    startNewPermit('nightshift');
    PROJECTS[0].configured = true;
    draft.project = PROJECTS[0].name;
    draft.locationStructure = 'Tower';
    draft.tower = 'Tower A'; draft.locFloor = 'Basement 1'; draft.locUnit = 'Core';
    draft.nightWorkType = 'hotwork';
    draft.nightWorkDescription = 'Steel structure fabrication';
    draft.isSubcontractor = true;
    draft.nightSubcontractorName = ''; // Missing subcontractor name
    nightV1 = validateWizStep(1);

    draft.nightSubcontractorName = 'Apex Foundations Ltd';
    nightV2 = validateWizStep(1);
`);
console.log('6. Night shift with subcontractor enabled but name empty:', evalInVM('nightV1 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   Night shift with subcontractor name filled:', evalInVM('nightV2 === true') ? '✅ PASSED' : '🔴 FAILED');
assert.strictEqual(evalInVM('nightV1'), false);
assert.strictEqual(evalInVM('nightV2'), true);

// 7. General Work: Work description gating
evalInVM(`
    startNewPermit('general');
    PROJECTS[0].configured = true;
    draft.project = PROJECTS[0].name;
    draft.locationStructure = 'Tower';
    draft.tower = 'Tower A'; draft.locFloor = 'Floor 1'; draft.locUnit = 'Corridor';
    draft.generalWorkType = '';
    genV1 = validateWizStep(1);

    draft.generalWorkType = 'Other';
    draft.generalWorkOther = '';
    genV2 = validateWizStep(1);

    draft.generalWorkOther = 'Waterproofing installation';
    genV3 = validateWizStep(1);
`);
console.log('7. General work missing work type:', evalInVM('genV1 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   General work "Other" with blank description:', evalInVM('genV2 === false') ? '✅ BLOCKED' : '🔴 FAILED');
console.log('   General work with valid description:', evalInVM('genV3 === true') ? '✅ PASSED' : '🔴 FAILED');
assert.strictEqual(evalInVM('genV1'), false);
assert.strictEqual(evalInVM('genV2'), false);
assert.strictEqual(evalInVM('genV3'), true);

console.log('\n=== ALL SPECIFIC WIZARD RULES VERIFIED 100% ===\n');
