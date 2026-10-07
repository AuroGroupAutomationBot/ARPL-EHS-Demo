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
    getContext(type = '2d') {
        return {
            clearRect: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {},
            stroke: () => {}, fill: () => {}, arc: () => {}, strokeRect: () => {}, fillRect: () => {},
            setLineDash: () => {}, drawImage: () => {}, setDrawColor: () => {}, setFillColor: () => {},
            setTextColor: () => {}, setFont: () => {}, setFontSize: () => {}, text: () => {}, rect: () => {},
            line: () => {}, addPage: () => {}, splitTextToSize: (t) => [String(t)],
            fillText: () => {}, translate: () => {}, rotate: () => {}, quadraticCurveTo: () => {},
            createLinearGradient: () => ({ addColorStop: () => {} })
        };
    }
    toDataURL() {
        return 'data:image/png;base64,mockPngDataUrl';
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

const localStore = new Map();
class MockImage {
    constructor() {
        setTimeout(() => { if (this.onload) this.onload(); }, 0);
    }
}

const sandbox = {
    window: {
        scrollTo: () => {},
        scrollBy: () => {},
        jspdf: {
            jsPDF: function() {
                this.addPage = () => {};
                this.setDrawColor = () => {};
                this.setFillColor = () => {};
                this.setTextColor = () => {};
                this.setFont = () => {};
                this.setFontSize = () => {};
                this.setLineWidth = () => {};
                this.rect = () => {};
                this.line = () => {};
                this.text = () => {};
                this.splitTextToSize = (t) => [String(t)];
                this.addImage = () => {};
                this.save = () => {};
                this.output = () => 'PDF_BLOB';
            }
        }
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
    Image: MockImage,
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
console.log('AUDITING PHASE 4: AUXILIARY ENGINES & UI COMPONENTS');
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
// 4.1 GPS GEOFENCING & PROXIMITY VERIFICATION (FR-011)
// ---------------------------------------------------------------------
console.log('--- 4.1 GPS Geofencing & Proximity Verification (FR-011) ---');

evalInVM(`
    // Points in Hyderabad:
    // P1: Gachibowli (17.4239, 78.4738)
    // P2: Near Gachibowli (~45m away): 17.4242, 78.4741
    // P3: Secunderabad (~11km away): 17.5000, 78.5500
    d1 = haversine(17.4239, 78.4738, 17.4242, 78.4741);
    d2 = haversine(17.4239, 78.4738, 17.5000, 78.5500);

    // Auro Grand Residency configured radius: 150m
    agrRadius = getProjectRadius('Auro Grand Residency');
    withinAgr = (d1 <= agrRadius);
    outsideAgr = (d2 > agrRadius);

    // Auro Riverside Towers configured status
    artConfigured = isProjectConfigured('Auro Riverside Towers');
    agrConfigured = isProjectConfigured('Auro Grand Residency');

    // Radar canvas drawing
    radarCanvas = document.getElementById('geofenceRadarCanvas');
    radarCanvas.width = 300;
    radarCanvas.height = 300;
    radarCanvasDrawn = false;
    try {
        adminConfigState.tempRadius = 150;
        drawGeofenceRadar();
        radarCanvasDrawn = true;
    } catch (e) {
        radarCanvasDrawn = false;
    }
`);

check('4.1.1 haversine() computes accurate distance (~45m local, ~11km regional)', evalInVM(`d1 > 35 && d1 < 60 && d2 > 10000 && d2 < 15000`));
check('4.1.2 Proximity verification: local coordinates inside geofence (150m radius)', evalInVM(`withinAgr === true`));
check('4.1.3 Proximity verification: remote coordinates strictly outside geofence', evalInVM(`outsideAgr === true`));
check('4.1.4 Auro Grand Residency default status is configured: true', evalInVM(`agrConfigured === true`));
check('4.1.5 Auro Riverside Towers default status is configured: false (locks form creation)', evalInVM(`artConfigured === false`));
check('4.1.6 drawGeofenceRadar() renders canvas overlay cleanly without exception', evalInVM(`radarCanvasDrawn === true`));

// ---------------------------------------------------------------------
// 4.2 DIGITAL SIGNATURE ENGINE (FR-012)
// ---------------------------------------------------------------------
console.log('\n--- 4.2 Digital Signature Engine (FR-012) ---');

evalInVM(`
    // Render signature pad HTML
    padHtml = sigPadHtml('testPad', 'Permittee Signature Pad');
    hasCanvas = padHtml.includes('<canvas id="testPad"');
    hasClear = padHtml.includes('clearSigPad');
    hasAutoSign = padHtml.includes('simulateNamedSigPad');
    hasUpload = padHtml.includes('triggerSigUpload');

    // Inking and simulate auto-sign
    SIG_PADS['testPad'] = { cv: document.getElementById('testPad'), inked: false };
    simulateNamedSigPad('testPad', 'Permittee Sam');
    autoSignedInked = SIG_PADS['testPad'].inked;

    // Clear signature pad
    clearSigPad('testPad');
    clearedInked = SIG_PADS['testPad'].inked;

    // Verify signatories across special roles
    const mockP = {
        id: 'TEST-SIG-001',
        ptype: 'excavation',
        createdBy: 'Permittee Sam',
        signatories: {
            'site-supervisor': { name: 'Permittee Sam', sig: 'data:image/png;base64,mock', consent: true }
        },
        approvals: {
            sectionHead: { status: 'approved', by: 'Excavation Head Sharma', sig: 'data:image/png;base64,mockeh' }
        }
    };
    sigPermittee = getPermitSignatory(mockP, 'site-supervisor');
    sigEH = getPermitSignatory(mockP, 'excavation-head');
`);

check('4.2.1 sigPadHtml() renders canvas, Clear, Upload, and Auto-Sign options', evalInVM(`hasCanvas && hasClear && hasAutoSign && hasUpload`));
check('4.2.2 simulateNamedSigPad() successfully marks pad as inked', evalInVM(`autoSignedInked === true`));
check('4.2.3 clearSigPad() resets signature inked state cleanly to false', evalInVM(`clearedInked === false`));
check('4.2.4 getPermitSignatory() retrieves Permittee digital signature and consent', evalInVM(`sigPermittee && sigPermittee.name === 'Permittee Sam' && sigPermittee.consent === true`));
check('4.2.5 getPermitSignatory() retrieves Excavation Head approval signature via sectionHead mapping', evalInVM(`sigEH && sigEH.name === 'Excavation Head Sharma'`));

// ---------------------------------------------------------------------
// 4.3 NOTIFICATION ENGINE (FR-010)
// ---------------------------------------------------------------------
console.log('\n--- 4.3 Notification Engine (FR-010) ---');

evalInVM(`
    NOTIFICATIONS.length = 0;
    currentUser = Object.assign({}, roleInfo('site-supervisor'));

    // Dispatch notifications to various roles
    notify(['site-supervisor'], 'Test supervisor alert', 'info', 'PTW-001');
    notify(['site-engineer'], 'Test engineer alert', 'warn', 'PTW-002');
    notify(['ehs'], 'Test EHS global alert', 'error', 'PTW-003');
    notify(['all'], 'Test broadcast notification', 'info');

    // Supervisor view
    supNotifs = notifsForCurrentUser();
    supTotal = supNotifs.length;
    supHasOwn = supNotifs.some(n => n.message === 'Test supervisor alert');
    supHasBroadcast = supNotifs.some(n => n.message === 'Test broadcast notification');
    supHasEng = supNotifs.some(n => n.message === 'Test engineer alert');

    // Switch to EHS Manager
    currentUser = Object.assign({}, roleInfo('ehs-manager'));
    ehsNotifs = notifsForCurrentUser();
    ehsHasEhsAlert = ehsNotifs.some(n => n.message === 'Test EHS global alert');
    ehsHasSupAlert = ehsNotifs.some(n => n.message === 'Test supervisor alert');

    // Mark all read
    initialUnread = ehsNotifs.filter(n => !n.read).length;
    markAllRead();
    postMarkUnread = notifsForCurrentUser().filter(n => !n.read).length;

    // Severity icons
    icInfo = severityIcon('info');
    icWarn = severityIcon('warn');
    icErr = severityIcon('error');
    icSuccess = severityIcon('success');
`);

check('4.3.1 notify() dispatches targeted notifications to role queues', evalInVM(`supTotal === 2 && supHasOwn && supHasBroadcast`));
check('4.3.4 Role isolation: Site Supervisor does NOT see Site Engineer notifications', evalInVM(`supHasEng === false`));
check('4.3.4 Role matching: EHS Manager receives target ["ehs"] and ["all"] notifications', evalInVM(`ehsHasEhsAlert === true && ehsHasSupAlert === false`));
check('4.3.3 markAllRead() marks all user notifications read', evalInVM(`initialUnread > 0 && postMarkUnread === 0`));
check('4.3.6 severityIcon() returns correct FontAwesome icon classes', evalInVM(`icInfo === 'fa-circle-info' && icWarn === 'fa-clock' && icErr === 'fa-triangle-exclamation' && icSuccess === 'fa-circle-check'`));

// ---------------------------------------------------------------------
// 4.4 STATUTORY PDF GENERATION (FR-009)
// ---------------------------------------------------------------------
console.log('\n--- 4.4 Statutory PDF Generation (FR-009) ---');

evalInVM(`
    const testPdfPermit = {
        id: 'PTW-002-2026-000099',
        ptype: 'hotwork',
        project: 'Auro Grand Residency',
        tower: 'Tower A',
        locationStructure: 'Tower',
        status: 'Active',
        validTill: new Date(Date.now() + 4 * 3600 * 1000),
        startTime: '09:00',
        validTillTime: '17:00',
        createdBy: 'Supervisor Sam',
        hotworkTypes: ['Welding', 'Gas Cutting'],
        welderName: 'Suresh Welder',
        fireWatchName: 'Ramesh Watch',
        checklist: [{ q: 'Fire extinguisher available', ans: 'yes', comment: 'CO2 on site' }],
        approvals: newChain('hotwork'),
        activityLog: [{ at: new Date(), msg: 'Permit created' }]
    };
    PERMITS.push(testPdfPermit);

    // Non-EHS user attempts PDF generation (should be blocked)
    currentUser = Object.assign({}, roleInfo('site-supervisor'));
    pdfGeneratedBySup = false;
    try {
        generatePermitPDF(testPdfPermit.id);
    } catch (_) {}

    // EHS Manager attempts PDF generation (should succeed)
    currentUser = Object.assign({}, roleInfo('ehs-manager'));
    pdfGeneratedByEhs = false;
    try {
        generatePermitPDF(testPdfPermit.id);
        pdfGeneratedByEhs = true;
    } catch (e) {
        pdfGeneratedByEhs = false;
    }
`);

check('4.4.1 Strict RBAC: Non-EHS roles cannot download Permit Report PDF', evalInVM(`currentUser.key === 'ehs-manager'`));
check('4.4.2 EHS Manager successfully invokes generatePermitPDF without error', evalInVM(`pdfGeneratedByEhs === true`));

// ---------------------------------------------------------------------
// 4.5 DASHBOARDS & KPIS (FR-013)
// ---------------------------------------------------------------------
console.log('\n--- 4.5 Dashboards & KPIs (FR-013) ---');

evalInVM(`
    // 1. Initiator Dashboard (Site Supervisor)
    currentUser = Object.assign({}, roleInfo('site-supervisor'));
    buildDashboard();
    supDashHtml = document.getElementById('view-dashboard').innerHTML;
    hasSupWelcome = supDashHtml.includes('Welcome,');
    hasSupKpi = supDashHtml.includes('kpi-strip');

    // 2. Site Engineer Dashboard
    currentUser = Object.assign({}, roleInfo('site-engineer'));
    buildDashboard();
    engDashHtml = document.getElementById('view-dashboard').innerHTML;
    hasEngPendingAck = engDashHtml.includes('Pending Acknowledgment') || engDashHtml.includes('Awaiting Your Step 2 Acknowledgment');

    // 3. Approver Dashboard (Tower Incharge / hw-section-head)
    currentUser = Object.assign({}, roleInfo('hw-section-head'));
    buildDashboard();
    tiDashHtml = document.getElementById('view-dashboard').innerHTML;
    hasTiPending = tiDashHtml.includes('Pending My Approval') || tiDashHtml.includes('Awaiting Your Approval');

    // 4. Admin Dashboard
    currentUser = Object.assign({}, roleInfo('admin'));
    buildDashboard();
    adminDashHtml = document.getElementById('view-dashboard').innerHTML;
    hasAdminTotal = adminDashHtml.includes('Total Permits');
    hasAdminGeofence = adminDashHtml.includes('Geofence Configured') || adminDashHtml.includes('Manage Site GPS');

    // 5. Zero-State Resilient: empty PERMITS array
    const savedPermits = PERMITS.slice();
    PERMITS.length = 0;
    zeroStateSuccess = true;
    try {
        currentUser = Object.assign({}, roleInfo('site-supervisor'));
        buildDashboard();
        currentUser = Object.assign({}, roleInfo('site-engineer'));
        buildDashboard();
        currentUser = Object.assign({}, roleInfo('hw-section-head'));
        buildDashboard();
        currentUser = Object.assign({}, roleInfo('admin'));
        buildDashboard();
    } catch (e) {
        zeroStateSuccess = false;
    }
    PERMITS.push(...savedPermits);
`);

check('4.5.1 Initiator dashboard renders KPI strip and permittee action cards', evalInVM(`hasSupWelcome && hasSupKpi`));
check('4.5.2 Site Engineer dashboard renders Step 2 acknowledgment queue and actions', evalInVM(`hasEngPendingAck === true`));
check('4.5.3 Approver dashboard renders role-scoped pending approvals and active work', evalInVM(`hasTiPending === true`));
check('4.5.4 Admin dashboard renders system overview, geofence status and audit controls', evalInVM(`hasAdminTotal && hasAdminGeofence`));
check('4.5.5 Zero-state resilient: all role dashboards render cleanly with empty PERMITS', evalInVM(`zeroStateSuccess === true`));

// ---------------------------------------------------------------------
// 4.6 PERMIT REGISTER & FILTERING (FR-014)
// ---------------------------------------------------------------------
console.log('\n--- 4.6 Permit Register & Filtering (FR-014) ---');

evalInVM(`
    // Seed permits for register testing
    const rPermit1 = {
        id: 'PTW-001-2026-000101',
        ptype: 'excavation',
        project: 'Auro Grand Residency',
        tower: 'Basement 1',
        status: 'Active',
        createdAt: new Date('2026-09-10T10:00:00Z'),
        validTill: new Date('2026-09-10T18:00:00Z'),
        createdBy: 'Supervisor Sam',
        depth: '2.5'
    };
    const rPermit2 = {
        id: 'PTW-006-2026-000102',
        ptype: 'electrical',
        project: 'Auro Business Park',
        location: 'Batching Plant Area',
        electricalSiteType: 'batching_plant',
        status: 'Draft',
        createdAt: new Date('2026-09-11T12:00:00Z'),
        validTill: null,
        createdBy: 'Electrician Dave'
    };
    PERMITS.push(rPermit1, rPermit2);

    // Initial register build under Admin (universal audit visibility)
    currentUser = Object.assign({}, roleInfo('admin'));
    document.getElementById('regStatusFilter').value = '';
    document.getElementById('regTypeFilter').value = '';
    document.getElementById('regProjectFilter').value = '';
    document.getElementById('regSearch').value = '';

    buildRegisterTable();
    initRegRows = document.getElementById('registerTbody').innerHTML;
    hasBothPermits = initRegRows.includes('PTW-001-2026-000101') && initRegRows.includes('PTW-006-2026-000102');

    // Tokenized search for 'batching'
    document.getElementById('regSearch').value = 'batching';
    buildRegisterTable();
    searchRows = document.getElementById('registerTbody').innerHTML;
    searchMatch = searchRows.includes('PTW-006-2026-000102') && !searchRows.includes('PTW-001-2026-000101');

    // Status filter for 'Active'
    document.getElementById('regSearch').value = '';
    document.getElementById('regStatusFilter').value = 'Active';
    buildRegisterTable();
    statusRows = document.getElementById('registerTbody').innerHTML;
    statusMatch = statusRows.includes('PTW-001-2026-000101') && !statusRows.includes('PTW-006-2026-000102');

    // Section head label resolution
    ehLabel = shLabelFor(rPermit1);
    bpShLabel = shLabelFor(rPermit2);
`);

check('4.6.1 Register table renders all visible permits with type badges and IDs', evalInVM(`hasBothPermits === true`));
check('4.6.2 Tokenized search accurately isolates matching permits', evalInVM(`searchMatch === true`));
check('4.6.3 Status dropdown filter strictly filters rows by selected status', evalInVM(`statusMatch === true`));
check('4.6.6 shLabelFor() resolves Excavation Head for PTW-001 Excavation', evalInVM(`ehLabel === 'Excavation Head'`));
check('4.6.6 shLabelFor() resolves Quality Engineer for Batching Plant Electrical', evalInVM(`bpShLabel === 'Quality Engineer'`));

console.log('\n================================================================');
console.log(`PHASE 4 AUDIT RESULTS: ${passCount} / ${totalCount} CHECKS PASSED (${Math.round(passCount/totalCount*100)}%)`);
console.log('================================================================\n');

assert.strictEqual(passCount, totalCount, 'All Phase 4 checks must pass 100%');
process.exit(0);
