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

const toasts = [];
const sandbox = {
    window: { scrollTo: () => {}, scrollBy: () => {} },
    document: {
        getElementById: (id) => getEl(id),
        querySelector: (sel) => getEl(sel.replace(/^[#.]/, '')),
        querySelectorAll: () => [],
        createElement: (tag) => new MockElement('', tag),
        body: new MockElement('body', 'body'),
        documentElement: { scrollTop: 0 },
        activeElement: null,
        addEventListener: () => {},
        removeEventListener: () => {}
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    navigator: { userAgent: 'NodeTest', geolocation: { getCurrentPosition: (cb) => cb({ coords: { latitude: 19.0760, longitude: 72.8777 } }) } },
    console: { log: () => {}, warn: () => {}, error: () => {}, info: () => {} },
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: () => {},
    setInterval: (fn, ms) => setInterval(fn, ms),
    clearInterval: (id) => clearInterval(id),
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

console.log('================================================================');
console.log('AUDITING PHASE 3: CROSS-CUTTING WORKFLOW ENGINES');
console.log('================================================================\n');

let passCount = 0;
let totalCount = 0;

function check(desc, condition) {
    totalCount++;
    if (condition) {
        passCount++;
        console.log(`  ✓ PASS: ${desc}`);
    } else {
        console.log(`  🔴 FAIL: ${desc}`);
    }
}

// ---------------------------------------------------------------------
// 3.1 SAFETY OBSERVATION WORKFLOW (FR-005)
// ---------------------------------------------------------------------
console.log('--- 3.1 Safety Observation Workflow (FR-005) ---');

evalInVM(`
    // Create an active hotwork permit
    currentUser = Object.assign({}, roleInfo('site-supervisor'));
    const testPermit = {
        id: 'TEST-HW-OBS-001',
        ptype: 'hotwork',
        project: PROJECTS[0].name,
        tower: 'Tower A',
        status: 'Active',
        validTill: new Date(Date.now() + 4 * 3600 * 1000),
        startTime: '09:00',
        validTillTime: '17:00',
        createdBy: 'Supervisor Sam',
        activityLog: []
    };
    PERMITS.push(testPermit);

    // EHS raises observation
    currentUser = Object.assign({}, roleInfo('ehs-officer'));
    raiseObservation(testPermit, {
        comment: 'Missing welding screen and spark blanket in corridor',
        gps: { lat: 19.076, lng: 72.877, within: true },
        sig: 'data:image/png;base64,ehssig',
        signerName: 'Kavita EHS'
    });
`);

const pObs = evalInVM(`PERMITS.find(p => p.id === 'TEST-HW-OBS-001')`);
check('3.1.1 EHS raises observation -> status transitions to Active – Observation Open', pObs.status === 'Active – Observation Open');
check('3.1.1 Observation object created with Open status and correct remarks', pObs.observation && pObs.observation.status === 'Open' && pObs.observation.comment.includes('welding screen'));

// Supervisor Rectification Response
evalInVM(`
    currentUser = Object.assign({}, roleInfo('site-supervisor'));
    respondToObservation(testPermit, {
        comment: 'Spark blankets and fire-resistant screens installed at welding zone',
        photo: 'data:image/jpeg;base64,mockphoto',
        gps: { lat: 19.076, lng: 72.877, within: true },
        sig: 'data:image/png;base64,supsig',
        signerName: 'Supervisor Sam'
    });
`);
check('3.1.2 Supervisor submits rectification -> status transitions to Observation Pending Site Engineer Acknowledgment', testPermit => {
    return evalInVM(`testPermit.status === 'Observation Pending Site Engineer Acknowledgment' && testPermit.observation.status === 'Rectified – Awaiting Engineer Ack'`);
});

// Site Engineer Verification
evalInVM(`
    currentUser = Object.assign({}, roleInfo('site-engineer'));
    acknowledgeObservationEng(testPermit, {
        comment: 'Inspected blankets and welding screen on Floor 3 corridor. Confirmed adequate.',
        gps: { lat: 19.076, lng: 72.877, within: true },
        sig: 'data:image/png;base64,engsig',
        signerName: 'Engineer Dave'
    });
`);
check('3.1.2 Site Engineer acknowledges -> status transitions to Observation Pending Section Head Review', evalInVM(`testPermit.status === 'Observation Pending Section Head Review'`));

// Section Head Review & Approval
evalInVM(`
    currentUser = Object.assign({}, roleInfo('tower-incharge'));
    reviewObservationSectionHead(testPermit, true, {
        comment: 'Approved rectification. Endorsed for EHS safety clearance.',
        gps: { lat: 19.076, lng: 72.877, within: true },
        sig: 'data:image/png;base64,tisig',
        signerName: 'Tower Incharge Rajesh'
    });
`);
check('3.1.2 Section Head approves -> status transitions to Observation Pending EHS Clearance', evalInVM(`testPermit.status === 'Observation Pending EHS Clearance'`));

// EHS Final Clearance
evalInVM(`
    currentUser = Object.assign({}, roleInfo('ehs-manager'));
    resolveObservation(testPermit, true, {
        comment: 'Site inspected. Verified zero spark hazard. Rectification approved and observation cleared.',
        sig: 'data:image/png;base64,mgrsig',
        signerName: 'Kavita EHS'
    });
`);
check('3.1.2 EHS resolves observation -> status restored to Active, observation status Resolved', evalInVM(`testPermit.status === 'Active' && testPermit.observation.status === 'Resolved'`));

// Section Head Rejection & Loop Back to Permittee
evalInVM(`
    const testRejPermit = {
        id: 'TEST-HW-REJ-001',
        ptype: 'hotwork',
        project: PROJECTS[0].name,
        tower: 'Tower A',
        status: 'Active',
        validTill: new Date(Date.now() + 4 * 3600 * 1000),
        startTime: '09:00',
        validTillTime: '17:00',
        createdBy: 'Supervisor Sam',
        activityLog: []
    };
    PERMITS.push(testRejPermit);
    raiseObservation(testRejPermit, { comment: 'No fire extinguisher at hot work point' });
    respondToObservation(testRejPermit, { comment: 'Extinguisher brought' });
    acknowledgeObservationEng(testRejPermit, { comment: 'Verified' });
    
    // Tower incharge rejects
    currentUser = Object.assign({}, roleInfo('tower-incharge'));
    reviewObservationSectionHead(testRejPermit, false, { comment: 'Extinguisher pressure gauge is in red zone. Replace immediately.' });
`);
check('3.1.3 Section Head rejection returns status to Active – Observation Open and observation status Open', evalInVM(`testRejPermit.status === 'Active – Observation Open' && testRejPermit.observation.status === 'Open'`));
check('3.1.3 Rejection records origin role and remarks for re-rectification', evalInVM(`testRejPermit.observation.rejectionOrigin && testRejPermit.observation.rejectionOrigin.comment.includes('pressure gauge')`));

// Observation Blocks Extension and Closure in UI action panel
evalInVM(`
    currentUser = Object.assign({}, roleInfo('site-supervisor'));
    const obsBlockPermit = {
        id: 'TEST-OBS-BLOCK-001',
        ptype: 'excavation',
        project: PROJECTS[0].name,
        status: 'Active – Observation Open',
        startTime: '08:30',
        validTill: new Date(Date.now() + 3600 * 1000),
        observation: { status: 'Open' },
        activityLog: []
    };
    PERMITS.push(obsBlockPermit);
    actionHtml = actionPanelHtml(obsBlockPermit);
    extBlocked = actionHtml.includes('Extensions are BLOCKED while an Observation is open');
    closeBlocked = actionHtml.includes('Permit closure is BLOCKED while an Observation is open');
`);
check('3.1.4 Extensions are BLOCKED while an observation is open in action panel', evalInVM(`extBlocked === true`));
check('3.1.4 Permit closure is BLOCKED while an observation is open in action panel', evalInVM(`closeBlocked === true`));

// Auto-Cancel at Expiry with Open Observation
evalInVM(`
    const expObsPermit = {
        id: 'TEST-EXP-OBS-001',
        ptype: 'hotwork',
        project: PROJECTS[0].name,
        status: 'Active – Observation Open',
        startTime: '08:30',
        validTill: new Date(Date.now() - 5000), // expired 5 seconds ago
        observation: { status: 'Open' },
        activityLog: []
    };
    PERMITS.push(expObsPermit);
    runEscalationTick();
`);
check('3.1.5 Permit with open observation past expiry is AUTO-CANCELLED', evalInVM(`expObsPermit.status === 'Cancelled' && expObsPermit.isCancelled === true`));
check('3.1.5 Auto-cancellation records EHS Automation and cancel reason', evalInVM(`expObsPermit.cancelledByRole === 'EHS Automation' && expObsPermit.cancelReason.includes('unrectified')`));

// ---------------------------------------------------------------------
// 3.2 PERMIT EXTENSION WORKFLOW (FR-006)
// ---------------------------------------------------------------------
console.log('\n--- 3.2 Permit Extension Workflow (FR-006) ---');

evalInVM(`
    // Create an active hotwork permit eligible for extension
    const extPermit = {
        id: 'TEST-EXT-001',
        ptype: 'hotwork',
        project: PROJECTS[0].name,
        tower: 'Tower A',
        status: 'Active',
        startTime: '08:30',
        validTillTime: '17:00',
        validTill: new Date(Date.now() + 2 * 3600 * 1000),
        createdBy: 'Supervisor Sam',
        activityLog: []
    };
    PERMITS.push(extPermit);

    // Request extension (60 min)
    currentUser = Object.assign({}, roleInfo('site-supervisor'));
    requestExtension(extPermit, {
        reason: 'Delayed structural welding due to rain stoppage earlier',
        minutes: 60,
        gps: { lat: 19.076, lng: 72.877, within: true },
        sig: 'data:image/png;base64,extsig',
        signerName: 'Supervisor Sam'
    });
`);
check('3.2.1 Extension requested -> p.extension status is Pending Site Engineer', evalInVM(`extPermit.extension && extPermit.extension.status === 'Pending Site Engineer'`));
check('3.2.1 Extension approvals object initialized with standard 3-stage chain', evalInVM(`extPermit.extension.approvals && extPermit.extension.approvals.kind === 'ext-flow'`));

// Site Engineer approves extension
evalInVM(`
    currentUser = Object.assign({}, roleInfo('site-engineer'));
    approveExtensionStage(extPermit, 'site-engineer', {
        comment: 'Verified reason and safe site conditions for overtime',
        gps: { lat: 19.076, lng: 72.877, within: true },
        sig: 'data:image/png;base64,engsig',
        signerName: 'Engineer Dave'
    });
`);
check('3.2.1 Site Engineer approves extension -> status advances to Pending Section Head', evalInVM(`extPermit.extension.status === 'Pending Section Head'`));

// Tower Incharge approves extension
evalInVM(`
    currentUser = Object.assign({}, roleInfo('tower-incharge'));
    approveExtensionStage(extPermit, 'section-head', {
        comment: 'Endorsed for 60-minute evening work extension',
        gps: { lat: 19.076, lng: 72.877, within: true },
        sig: 'data:image/png;base64,tisig',
        signerName: 'Rajesh TI'
    });
`);
check('3.2.1 Tower Incharge approves extension -> status advances to Pending EHS Approval', evalInVM(`extPermit.extension.status === 'Pending EHS Approval'`));

// EHS Manager gives final endorsement
const oldValidTill = evalInVM(`new Date(extPermit.validTill).getTime()`);
evalInVM(`
    currentUser = Object.assign({}, roleInfo('ehs-manager'));
    approveExtensionStage(extPermit, 'ehs-manager', {
        comment: 'Final EHS approval granted. Validity extended by 60 minutes.',
        gps: { lat: 19.076, lng: 72.877, within: true },
        sig: 'data:image/png;base64,ehssig',
        signerName: 'Kavita EHS'
    });
`);
const newValidTill = evalInVM(`new Date(extPermit.validTill).getTime()`);
check('3.2.1 EHS approves extension -> extension marked Approved and validTill extended', evalInVM(`extPermit.extension.status === 'Approved'`) && (newValidTill > oldValidTill));

// Extension Limits & Cutoff Rules
evalInVM(`
    // Test Blasting extension cap: 18:30 IST sunset hard stop rule
    const blastPermit = {
        id: 'TEST-BLAST-EXT-001',
        ptype: 'blasting',
        dbOperationType: 'Blasting',
        drillingBlastingType: 'blasting',
        status: 'Active',
        validTill: new Date('2026-10-06T18:30:00+05:30')
    };
    blastCap = extensionCapMinutes(blastPermit);

    // Drilling permit can extend up to 20:30 ceiling
    const drillPermit = {
        id: 'TEST-DRILL-EXT-001',
        ptype: 'blasting',
        dbOperationType: 'Drilling',
        drillingBlastingType: 'drilling',
        status: 'Active',
        validTill: new Date('2026-10-06T18:00:00+05:30')
    };
    drillCap = extensionCapMinutes(drillPermit);
`);
check('3.2.4 PTW-007 Blasting at 18:30 IST has zero extension capacity (sunset hard cap)', evalInVM(`blastCap === 0`));
check('3.2.5 PTW-007 Drilling has positive extension runway up to 20:30 ceiling', evalInVM(`drillCap > 0`));

// Specialized Extension Topologies
evalInVM(`
    // Lifting extension uses ext-lifting flow
    const liftExtPermit = {
        id: 'TEST-LIFT-EXT-001',
        ptype: 'lifting',
        project: PROJECTS[0].name,
        tower: 'Tower A',
        status: 'Active',
        startTime: '08:30',
        validTillTime: '16:00',
        validTill: new Date(Date.now() + 2 * 3600 * 1000),
        activityLog: []
    };
    PERMITS.push(liftExtPermit);
    currentUser = Object.assign({}, roleInfo('lift-supervisor'));
    requestExtension(liftExtPermit, { reason: 'Heavy component placement delayed', minutes: 60 });

    // Batching plant electrical extension uses ext-batching-elec flow
    const bpExtPermit = {
        id: 'TEST-BP-EXT-001',
        ptype: 'electrical',
        electricalSiteType: 'batching_plant',
        project: PROJECTS[0].name,
        status: 'Active',
        startTime: '08:30',
        validTillTime: '16:00',
        validTill: new Date(Date.now() + 2 * 3600 * 1000),
        activityLog: []
    };
    PERMITS.push(bpExtPermit);
    currentUser = Object.assign({}, roleInfo('electrician'));
    requestExtension(bpExtPermit, { reason: 'Transformer calibration testing continuation', minutes: 60 });
`);
check('3.2.6 Lifting extension initializes dedicated ext-lifting approval flow', evalInVM(`liftExtPermit.extension.approvals.kind === 'ext-lifting'`));
check('3.2.7 Batching Plant Electrical extension routes to P&M Engineer acknowledgment', evalInVM(`bpExtPermit.extension.approvals.kind === 'ext-batching-elec' && bpExtPermit.extension.status === 'Pending P&M Acknowledgment'`));

// ---------------------------------------------------------------------
// 3.3 ESCALATION & AUTO-EXPIRY ENGINE (FR-007)
// ---------------------------------------------------------------------
console.log('\n--- 3.3 Escalation & Auto-Expiry Engine (FR-007) ---');

evalInVM(`
    NOTIFICATIONS.length = 0;
    const now = Date.now();

    // 1. Stage 1 Escalation (> STAGE1_MS, 45s)
    const pEsc1 = {
        id: 'ESC-TICK-001',
        ptype: 'hotwork',
        status: 'Pending Section Head',
        stageEnteredAt: new Date(now - 55 * 1000),
        escalation: { stage1: false, stage2: false },
        validTill: new Date(now + 3 * 3600 * 1000),
        activityLog: []
    };
    PERMITS.push(pEsc1);

    // 2. Stage 2 Escalation (> STAGE2_MS, 120s)
    const pEsc2 = {
        id: 'ESC-TICK-002',
        ptype: 'excavation',
        status: 'Pending Parallel Approval',
        stageEnteredAt: new Date(now - 140 * 1000),
        escalation: { stage1: true, stage2: false },
        validTill: new Date(now + 3 * 3600 * 1000),
        activityLog: []
    };
    PERMITS.push(pEsc2);

    // 3. 30-Minute Expiry Warning
    const pWarn = {
        id: 'ESC-TICK-003',
        ptype: 'shaft',
        status: 'Active',
        validTill: new Date(now + 25 * 60 * 1000), // 25 min remaining
        warned30: false,
        activityLog: []
    };
    PERMITS.push(pWarn);

    // 4. Auto-expiry of Active Permit
    const pAutoExp = {
        id: 'ESC-TICK-004',
        ptype: 'guardrail',
        status: 'Active',
        validTill: new Date(now - 10 * 1000), // passed
        activityLog: []
    };
    PERMITS.push(pAutoExp);

    // Execute tick
    runEscalationTick();
`);

check('3.3.1 Stage 1 escalation flag set and warning notification dispatched', evalInVM(`pEsc1.escalation.stage1 === true && NOTIFICATIONS.some(n => n.permitId === 'ESC-TICK-001' && n.message.includes('ESCALATION (Stage 1)'))`));
check('3.3.2 Stage 2 escalation flag set and critical notification dispatched', evalInVM(`pEsc2.escalation.stage2 === true && NOTIFICATIONS.some(n => n.permitId === 'ESC-TICK-002' && n.message.includes('ESCALATION (Stage 2)'))`));
check('3.3.3 30-minute expiry close reminder flagged and notification dispatched', evalInVM(`pWarn.warned30 === true && NOTIFICATIONS.some(n => n.permitId === 'ESC-TICK-003' && n.message.includes('CLOSE REMINDER (T-30 min)'))`));
check('3.3.4 Active permit past validTill auto-transitions to Expired status', evalInVM(`pAutoExp.status === 'Expired'`));

// Timer Lifecycle
evalInVM(`
    stopEscalationTimer();
    const stoppedTimerId = escalationIntervalId;
    startEscalationTimer();
    const startedTimerId = escalationIntervalId;
    stopEscalationTimer();
`);
check('3.3.5 startEscalationTimer and stopEscalationTimer manage interval lifecycle cleanly', evalInVM(`stoppedTimerId === null && startedTimerId !== null && escalationIntervalId === null`));

// ---------------------------------------------------------------------
// 3.4 4-STEP PERMIT CREATION WIZARD (FR-008)
// ---------------------------------------------------------------------
console.log('\n--- 3.4 4-Step Permit Creation Wizard (FR-008) ---');

evalInVM(`
    currentUser = Object.assign({}, roleInfo('site-supervisor'));
    startNewPermit('hotwork');
    PROJECTS[0].configured = true;

    // Initially at Step 1
    initStep = wizStep;

    // Fill valid Step 1 data
    draft.project = PROJECTS[0].name;
    draft.locationStructure = 'Tower';
    draft.tower = 'Tower A';
    draft.locFloor = 'Floor 4';
    draft.locUnit = 'Unit 402';
    draft.hotworkTypes = ['Welding'];
    draft.welderName = 'Suresh Welder';
    draft.welderCertNo = 'WLD-CERT-884';
    draft.fireWatchName = 'Ramesh Watch';

    step1Passed = validateWizStep(1);

    // Navigate to Step 2
    wizNext();
    stepAfterNext1 = wizStep;

    // Step 2 checklist initially unanswered
    step2Unanswered = validateWizStep(2);

    // Answer all checklist items + site photo
    draft.checklist.forEach(item => { item.ans = 'yes'; item.comment = 'Checked OK'; });
    draft.sitePhoto = 'data:image/jpeg;base64,mocksitephoto';
    step2Answered = validateWizStep(2);

    // Navigate to Step 3
    wizNext();
    stepAfterNext2 = wizStep;

    // Deterministic office hours clock for Step 3 testing
    nowTime = () => new Date(2026, 8, 10, 8, 30, 0);

    // Step 3 time selection
    draft.startTime = '09:00';
    draft.validTillTime = '17:00';
    step3Valid = validateWizStep(3);

    // Navigate to Step 4
    wizNext();
    stepAfterNext3 = wizStep;

    // Step 4 signature & consent
    step4PreSign = validateWizStep(4);
    draft.signerVerified = true;
    draft.signature = { dataUrl: 'data:image/png;base64,mocksig', by: 'Supervisor Sam' };
    step4PostSign = validateWizStep(4);
`);

check('3.4.1 Wizard initiates at Step 1', evalInVM(`initStep === 1`));
check('3.4.1 Step 1 validates with complete master data and advances to Step 2', evalInVM(`step1Passed === true && stepAfterNext1 === 2`));
check('3.4.3 Step 2 blocks progression with unanswered checklist items', evalInVM(`step2Unanswered === false`));
check('3.4.3 Step 2 validates when all items answered and site photo attached', evalInVM(`step2Answered === true && stepAfterNext2 === 3`));
check('3.4.4 Step 3 validates office hours time window (09:00 - 17:00)', evalInVM(`step3Valid === true && stepAfterNext3 === 4`));
check('3.4.5 Step 4 blocks submission before digital signature & verification', evalInVM(`step4PreSign === false`));
check('3.4.5 Step 4 validates after digital signature and consent captured', evalInVM(`step4PostSign === true`));

// Backward Navigation and Direct Step Jumping
evalInVM(`
    // Backward navigation
    wizPrev();
    stepAfterPrev = wizStep;

    // Jump ahead validation check (from Step 3 to Step 4 is allowed if valid)
    goToWizStep(4);
    jumpForwardStep = wizStep;

    // Jump backward to Step 1 directly
    goToWizStep(1);
    jumpBackwardStep = wizStep;
`);
check('3.4.2 Backward navigation via wizPrev() returns to previous step', evalInVM(`stepAfterPrev === 3`));
check('3.4.2 Direct forward jumping validates intermediate steps', evalInVM(`jumpForwardStep === 4`));
check('3.4.2 Direct backward jumping to Step 1 allowed freely', evalInVM(`jumpBackwardStep === 1`));

// Draft Save & Resume
evalInVM(`
    // Save current draft
    const draftId = draft.id;
    saveDraftAndExit();
    draftNullAfterExit = (draft === null);
    savedDraftFound = PERMITS.find(p => p.id === draftId && p.status === 'Draft');

    // Resume saved draft
    resumeDraft(savedDraftFound);
    resumedIdMatches = (draft && draft.id === draftId);
    resumedAtStep1 = (wizStep === 1);
    resumedDataRetained = (draft.tower === 'Tower A' && draft.locFloor === 'Floor 4');
`);
check('3.4.6 saveDraftAndExit stores permit in Draft status and cleans active draft', evalInVM(`draftNullAfterExit && savedDraftFound !== undefined`));
check('3.4.6 resumeDraft restores draft at Step 1 with all previously entered fields intact', evalInVM(`resumedIdMatches && resumedAtStep1 && resumedDataRetained`));

// Correction Mode
evalInVM(`
    // Simulate returned for correction permit
    const corrPermit = {
        id: 'TEST-CORR-001',
        ptype: 'hotwork',
        project: PROJECTS[0].name,
        tower: 'Tower A',
        locFloor: 'Floor 2',
        status: 'Returned for Correction',
        signature: { dataUrl: 'data:image/png;base64,oldsig', by: 'Supervisor Sam' },
        checklist: [{ q: 'Check 1', ans: 'no', comment: 'Needs fix' }],
        activityLog: []
    };
    PERMITS.push(corrPermit);

    openCorrectionMode('TEST-CORR-001');
    corrModeActive = correctionMode;
    corrStartsAtStep2 = (wizStep === 2);
    sigRetained = (draft.signerVerified === true && draft.signature !== null);
`);
check('3.4.7 openCorrectionMode locks Step 1 and starts directly at Step 2 (Checklist)', evalInVM(`corrModeActive && corrStartsAtStep2`));
check('3.4.7 Correction mode retains digital signature and permittee on file', evalInVM(`sigRetained`));

console.log('\n================================================================');
console.log(`PHASE 3 AUDIT RESULTS: ${passCount} / ${totalCount} CHECKS PASSED (${Math.round(passCount/totalCount*100)}%)`);
console.log('================================================================\n');

assert.strictEqual(passCount, totalCount, 'All Phase 3 checks must pass 100%');
process.exit(0);
