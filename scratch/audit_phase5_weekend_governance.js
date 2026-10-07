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
        this.width = 460;
        this.height = 140;
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
    querySelector() { return new MockElement('div'); }
    querySelectorAll() { return []; }
    focus() {}
    scrollIntoView() {}
    getContext() {
        return {
            clearRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {},
            stroke: () => {}, fill: () => {}, arc: () => {}, strokeRect: () => {}, fillRect: () => {},
            setLineDash: () => {}, drawImage: () => {}, setDrawColor: () => {}, setFillColor: () => {},
            setTextColor: () => {}, setFont: () => {}, setFontSize: () => {}, text: () => {}, rect: () => {},
            line: () => {}, addPage: () => {}, splitTextToSize: (t) => [String(t)],
            fillText: () => {}, translate: () => {}, rotate: () => {}, quadraticCurveTo: () => {}
        };
    }
    toDataURL() { return 'data:image/png;base64,mockPngDataUrl'; }
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

const localStore = new Map();
const sandbox = {
    window: {
        scrollTo: () => {},
        scrollBy: () => {},
        jspdf: { jsPDF: function() { this.output = () => 'PDF'; } }
    },
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
    localStorage: {
        getItem: (k) => localStore.get(k) || null,
        setItem: (k, v) => localStore.set(k, String(v)),
        removeItem: (k) => localStore.delete(k)
    },
    Image: class { constructor() { setTimeout(() => { if (this.onload) this.onload(); }, 0); } },
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
console.log('AUDITING PHASE 5: WEEKEND GOVERNANCE, LOCATION MODES & NIGHT SHIFT');
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
// 5.1 SUNDAY WORK TILE & WEEKEND GOVERNANCE (FR-018)
// ---------------------------------------------------------------------
console.log('--- 5.1 Sunday Work Tile & Weekend Governance (FR-018) ---');

evalInVM(`
    currentUser = Object.assign({}, roleInfo('site-supervisor'));

    // 1. Day simulator modes:
    // Saturday: Sunday Work preparation surface active
    setSimulatedDay(6); // 6 = Saturday
    isSat = isSaturday();
    isSunActive = isSundayTileActive();

    buildDashboard();
    satDashHtml = document.getElementById('view-dashboard').innerHTML;
    hasSatBanner = satDashHtml.includes('Saturday Advanced Preparation Surface Active') || satDashHtml.includes('Sunday Work (SUN)');

    // 2. Sunday Work Catalog: excludes Night Shift (PTW-010)
    blockedTypes = (APP_CONFIG.sundayWork && APP_CONFIG.sundayWork.blockedPermitTypes) || [];
    nightExcludedFromCatalog = blockedTypes.includes('nightshift');

    // 3. 3-Layer Hard Exclusion: Attempt to initiate Night Shift in Sunday context
    sundayWorkContext = true;
    nightCreationBlockedInSun = (startNewPermit('nightshift') === false);

    // 4. Legitimate permit in Sunday Work context
    startNewPermit('hotwork');
    isTaggedSunday = (draft && draft.sundayWork === true);
    sundayWorkContext = false;

    // 5. Sunday Mode: Zero-creation lockout
    setSimulatedDay(0); // 0 = Sunday
    isSun = isSunday();
    creationAllowedOnSunday = isPermitRaisingAllowedToday();
    creationBlockedOnSunday = (startNewPermit('hotwork') === false);

    buildDashboard();
    sunDashHtml = document.getElementById('view-dashboard').innerHTML;
    hasSunLockoutBanner = sunDashHtml.includes('Sunday Lockout Active') || sunDashHtml.includes('Zero Permit-Raising Policy');

    // 6. Pre-authorized Sunday permit execution & closure
    // Existing pre-authorized Sunday permit can still be viewed and closed
    const sunNow = nowTime();
    const preAuthSunPermit = {
        id: 'PTW-002-2026-SUN001',
        ptype: 'hotwork',
        project: PROJECTS[0].name,
        tower: 'Tower A',
        status: 'Active',
        sundayWork: true,
        startTime: '08:30',
        startAt: new Date(sunNow.getTime() - 2 * 3600 * 1000),
        validTillTime: '18:00',
        validTill: new Date(sunNow.getTime() + 4 * 3600 * 1000),
        createdBy: 'Supervisor Sam',
        activityLog: []
    };
    PERMITS.push(preAuthSunPermit);

    sunCanClose = canClosePermitOnSunday(preAuthSunPermit).allowed;

    // 7. Monday: Reset weekend surface
    setSimulatedDay(1); // 1 = Monday
    isMonSat = isSaturday();
    isMonSun = isSunday();
    isMonSunActive = isSundayTileActive();

    // Restore live clock
    resetSimulatedDay();
`);

check('5.1.1 Saturday mode renders Saturday preparation banner & dual-tile hero', evalInVM(`isSat && isSunActive && hasSatBanner`));
check('5.1.2 Sunday Work catalog configuration strictly excludes Night Shift (PTW-010)', evalInVM(`nightExcludedFromCatalog === true`));
check('5.1.2 3-Layer enforcement strictly blocks Night Shift from Sunday Work tile', evalInVM(`nightCreationBlockedInSun === true`));
check('5.1.5 Standard permit initiated via Sunday tile receives sundayWork = true tag', evalInVM(`isTaggedSunday === true`));
check('5.1.3 Sunday mode zero-creation lockout blocks permit initiation across all tiles', evalInVM(`isSun && !creationAllowedOnSunday && creationBlockedOnSunday`));
check('5.1.3 Sunday mode renders Sunday Lockout banner and zero-raising policy', evalInVM(`hasSunLockoutBanner === true`));
check('5.1.4 Pre-authorized Sunday permits permit execution and closure during valid window', evalInVM(`sunCanClose === true`));
check('5.1.6 Monday mode turns off weekend banners and deactivates Sunday Work tile', evalInVM(`!isMonSat && !isMonSun && !isMonSunActive`));

// ---------------------------------------------------------------------
// 5.2 LOCATION SELECTION MODE (FR-020)
// ---------------------------------------------------------------------
console.log('\n--- 5.2 Location Selection Mode (FR-020) ---');

evalInVM(`
    // 1. Excavation: Tower blocked, Basement/Podium & Manual allowed
    modesExc = getAllowedLocationModes('excavation');
    excHasTower = modesExc.includes('Tower');
    excHasBP = modesExc.includes('Basement/Podium');
    excHasManual = modesExc.includes('Manual');

    // 2. Guard Rail: Manual blocked, Tower & Basement/Podium allowed
    modesGr = getAllowedLocationModes('guardrail');
    grHasTower = modesGr.includes('Tower');
    grHasBP = modesGr.includes('Basement/Podium');
    grHasManual = modesGr.includes('Manual');

    // 3. Shaft Work: Manual blocked, Tower & Basement/Podium allowed
    modesShaft = getAllowedLocationModes('shaft');
    shaftHasTower = modesShaft.includes('Tower');
    shaftHasBP = modesShaft.includes('Basement/Podium');
    shaftHasManual = modesShaft.includes('Manual');

    // 4. Drilling & Blasting: Manual only
    modesBlast = getAllowedLocationModes('blasting');
    blastIsManualOnly = (modesBlast.length === 1 && modesBlast[0] === 'Manual');

    // 5. Flexible types: Hot Work and Confined Space allow all 3
    modesHw = getAllowedLocationModes('hotwork');
    modesCs = getAllowedLocationModes('confined');
    hwAllThree = (modesHw.length === 3 && modesHw.includes('Tower') && modesHw.includes('Basement/Podium') && modesHw.includes('Manual'));
    csAllThree = (modesCs.length === 3 && modesCs.includes('Tower') && modesCs.includes('Basement/Podium') && modesCs.includes('Manual'));

    // 6. Fallback enforcement in validateWizStep(1)
    currentUser = Object.assign({}, roleInfo('site-supervisor'));
    startNewPermit('excavation');
    draft.project = PROJECTS[0].name;
    draft.locationStructure = 'Tower'; // illegal mode for excavation
    validateWizStep(1);
    excLocationFellBack = (draft.locationStructure !== 'Tower' && modesExc.includes(draft.locationStructure));
`);

check('5.2.1 Excavation restricts Tower mode, permitting Basement/Podium and Manual only', evalInVM(`!excHasTower && excHasBP && excHasManual`));
check('5.2.2 Guard Rail restricts Manual mode, permitting Tower and Basement/Podium only', evalInVM(`grHasTower && grHasBP && !grHasManual`));
check('5.2.2 Shaft Work restricts Manual mode, permitting Tower and Basement/Podium only', evalInVM(`shaftHasTower && shaftHasBP && !shaftHasManual`));
check('5.2.3 Drilling & Blasting restricts location mode to Manual exclusively', evalInVM(`blastIsManualOnly === true`));
check('5.2.5 Hot Work & Confined Space permit all 3 location modes', evalInVM(`hwAllThree && csAllThree`));
check('5.2.5 Wizard Step 1 fallback enforcement overrides illegal location mode', evalInVM(`excLocationFellBack === true`));

// ---------------------------------------------------------------------
// 5.3 NIGHT SHIFT DUAL-PHASE HANDOVER (FR-019)
// ---------------------------------------------------------------------
console.log('\n--- 5.3 Night Shift Dual-Phase Handover (FR-019) ---');

evalInVM(`
    // 1. Statutory Exclusions from Night Shift linkage:
    canLinkCs = canLinkToNightShift('confined');
    canLinkBlast = canLinkToNightShift('blasting');
    canLinkCritLift = canLinkToNightShift('liftplan');
    canLinkRoutineLift = canLinkToNightShift('lifting', { loadWeight: 3.5, tandemLift: false });
    canLinkHeavyLift = canLinkToNightShift('lifting', { loadWeight: 6.0, tandemLift: false });

    // 2. Night Supervisor Qualification Gate:
    // Qualified supervisor: Venkatesh Rao (PM authorized, training certified)
    venkOk = (validateNightSupervisorGate('Venkatesh Rao').qualified === true);
    unqualOk = (validateNightSupervisorGate('Unknown Person Without Training').qualified === false);

    // 3. 21:00 IST Cutoff Auto-Cancel Engine:
    const cutoffPermit = {
        id: 'PTW-010-2026-NIGHT001',
        ptype: 'nightshift',
        project: PROJECTS[0].name,
        status: 'Approved – Pending Night Handover',
        nightHandover: null,
        activityLog: []
    };
    // Current time at 20:45 (before cutoff)
    cutoffAt2045 = (checkNightHandoverCutoff(cutoffPermit, new Date('2026-09-10T20:45:00+05:30')).cutoffReached === false);
    // Current time at 21:05 (past cutoff)
    cutoffAt2105 = (checkNightHandoverCutoff(cutoffPermit, new Date('2026-09-10T21:05:00+05:30')).cancelled === true);
    cutoffCancelled = (cutoffPermit.status === 'Cancelled');

    // 4. Linked Permit Cascade Cancellation:
    const parentNightPermit = {
        id: 'PTW-010-2026-PARENT',
        ptype: 'nightshift',
        linkedPermitId: 'PTW-002-2026-CHILD',
        status: 'Active',
        activityLog: []
    };
    const childPermit = {
        id: 'PTW-002-2026-CHILD',
        ptype: 'hotwork',
        parentNightShiftId: 'PTW-010-2026-PARENT',
        status: 'Active',
        activityLog: []
    };
    PERMITS.push(parentNightPermit, childPermit);

    // Cancel parent night shift
    currentUser = Object.assign({}, roleInfo('ehs-manager'));
    cancelNightShift(parentNightPermit.id, 'Emergency cancellation by EHS');
    childAlsoCancelled = (childPermit.status === 'Cancelled' && childPermit.isCancelled === true);
`);

check('5.3.5 canLinkToNightShift() strictly blocks Confined Space (IDLH rescue hazard)', evalInVM(`canLinkCs === false`));
check('5.3.5 canLinkToNightShift() strictly blocks Drilling & Blasting (PESO prohibition)', evalInVM(`canLinkBlast === false`));
check('5.3.5 canLinkToNightShift() strictly blocks Critical Lift Plan (>5 MT or complex)', evalInVM(`canLinkCritLift === false && canLinkHeavyLift === false`));
check('5.3.5 canLinkToNightShift() authorizes Routine Lifting (<= 5 MT standard lift)', evalInVM(`canLinkRoutineLift === true`));
check('5.3.2 validateNightSupervisorGate() verifies PM authorization & annual training', evalInVM(`venkOk === true && unqualOk === true`));
check('5.3.3 checkNightHandoverCutoff() allows handover before 21:00 IST', evalInVM(`cutoffAt2045 === true`));
check('5.3.3 checkNightHandoverCutoff() auto-cancels night permit past 21:00 IST', evalInVM(`cutoffAt2105 === true && cutoffCancelled === true`));
check('5.3.4 Cascade cancel: terminating parent night shift permit auto-cancels linked activity permit', evalInVM(`childAlsoCancelled === true`));

console.log('\n================================================================');
console.log(`PHASE 5 AUDIT RESULTS: ${passCount} / ${totalCount} CHECKS PASSED (${Math.round(passCount/totalCount*100)}%)`);
console.log('================================================================\n');

assert.strictEqual(passCount, totalCount, 'All Phase 5 checks must pass 100%');
process.exit(0);
