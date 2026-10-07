const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. APP_CONFIG additions
const govStagesTarget = 'governanceStages: [';
const appConfigAdditions = `sla: {
                mode: 'demo', // 'demo' (fast: 45s / 120s) | 'production' (2h / 4h)
                stage1Ms: 45 * 1000,
                stage2Ms: 120 * 1000,
                stage1MsProd: 2 * 3600 * 1000,
                stage2MsProd: 4 * 3600 * 1000,
                warningMinutesBeforeExpiry: 30,
                extensionCutoffHour: 18,
                extensionCutoffMinute: 30,
                extensionCeilingHour: 20,
                extensionCeilingMinute: 30,
                nightHandoverGateHour: 20,
                nightHandoverGateMinute: 30,
                nightHandoverCutoffHour: 21,
                nightHandoverCutoffMinute: 0,
                tickIntervalMs: 5000
            },
            weather: {
                current: 'Clear',
                windSpeedKmH: 14,
                tempC: 31,
                highWindWarningThreshold: 38,
                options: [
                    { condition: 'Clear', windSpeedKmH: 12, tempC: 30, desc: 'Optimal worksite conditions' },
                    { condition: 'Sunny', windSpeedKmH: 14, tempC: 33, desc: 'Hot & clear daylight' },
                    { condition: 'Partly Cloudy', windSpeedKmH: 18, tempC: 29, desc: 'Moderate cloud cover' },
                    { condition: 'Overcast', windSpeedKmH: 22, tempC: 27, desc: 'Cloudy, good visibility' },
                    { condition: 'Windy', windSpeedKmH: 32, tempC: 28, desc: 'Caution: Monitor crane & scaffolding operations' },
                    { condition: 'High Wind Alert', windSpeedKmH: 42, tempC: 26, desc: 'CRANE LIFT BAN: Winds exceed 38 km/h limit' },
                    { condition: 'Light Rain', windSpeedKmH: 20, tempC: 25, desc: 'Slippery surfaces; electrical caution' },
                    { condition: 'Hazy', windSpeedKmH: 10, tempC: 29, desc: 'Reduced long-range visibility' }
                ]
            },
            contractorDirectory: [
                { id: 'cnt-01', name: 'Apex Infrastructure Pvt Ltd', code: 'VND-101', category: 'General Civil & Heavy Structural', safetyRating: '5.0', status: 'Empaneled & Verified' },
                { id: 'cnt-02', name: 'L&T Construction Heavy Civil', code: 'VND-102', category: 'Infrastructure & Deep Foundation', safetyRating: '4.9', status: 'Empaneled & Verified' },
                { id: 'cnt-03', name: 'Shapoorji Pallonji & Co. Ltd', code: 'VND-103', category: 'High-Rise Superstructure & Civil', safetyRating: '4.8', status: 'Empaneled & Verified' },
                { id: 'cnt-04', name: 'SteelFab Engineering Solutions', code: 'VND-104', category: 'Hot Work, Structural Steel & Façade', safetyRating: '4.7', status: 'Empaneled & Verified' },
                { id: 'cnt-05', name: 'Apex Heavy Lift Ltd', code: 'VND-105', category: 'Tower Crane & Heavy Rigging Specialist', safetyRating: '5.0', status: 'Empaneled & Verified' },
                { id: 'cnt-06', name: 'EnerSys Electrical & Power Infra', code: 'VND-106', category: 'HT/LT Substation & Plant Maintenance', safetyRating: '4.9', status: 'Empaneled & Verified' },
                { id: 'cnt-07', name: 'RockBlast Geo-Technics India', code: 'VND-107', category: 'Licensed Explosives & Controlled Blasting', safetyRating: '5.0', status: 'Empaneled & Verified' },
                { id: 'cnt-08', name: 'In-House Auro Engineering Corps', code: 'VND-100', category: 'Direct Developer Technical Division', safetyRating: '5.0', status: 'Internal Developer Force' }
            ],
            permitFormOptions: {
                guardrailActivities: [
                    "Removal of Perimeter Guard Rails",
                    "Removal of Floor Opening / Cutout Covers",
                    "Removal of Shaft Gates / Barriers",
                    "Removal of Edge Protection / Handrails",
                    "Removal of Slab Penetration Covers",
                    "Removal of Staircase Handrails / Guardrails",
                    "Removal of Scaffolding Mid-rails / Toe-boards",
                    "Others (Specify)"
                ],
                blastingExplosives: [
                    'Emulsion Explosives',
                    'ANFO (Ammonium Nitrate Fuel Oil)',
                    'Slurry / Water Gel Explosives',
                    'Cartridge Explosives (Slurry/Emulsion)',
                    'Cast Boosters',
                    'Electric Detonators (Instantaneous / Delay)',
                    'Non-Electric (Nonel) Shock Tube Detonators',
                    'Electronic Programmable Detonators',
                    'Others'
                ],
                drillingMachines: [
                    'Crawler Drilling Rig',
                    'Jack Hammer (Pneumatic)',
                    'Rotary Blast Hole Drill',
                    'Down-The-Hole (DTH) Drill Rig',
                    'Hydraulic Crawler Drill',
                    'Handheld Rock Drill',
                    'Others'
                ]
            },
            `;

if (!content.includes('sla: {')) {
    content = content.replace(govStagesTarget, appConfigAdditions + govStagesTarget);
    console.log('1. Added dynamic schemas to APP_CONFIG');
}

// 2. Enrich PROJECTS and add structural accessors
const projRegex = /let PROJECTS = \[[\s\S]*?\];/;
const enrichedProjects = `let PROJECTS = [
            {
                id: 'PRJ-AGR',
                name: 'Auro Grand Residency',
                towers: ['Tower A', 'Tower B', 'Tower C', 'Tower D'],
                basements: ['Basement 3 (B3)', 'Basement 2 (B2)', 'Basement 1 (B1)', 'Ground Floor (GF)', 'Podium Level 1 (P1)', 'Podium Level 2 (P2)', 'Podium Level 3 (P3)'],
                floors: ['Basement 3 (B3)', 'Basement 2 (B2)', 'Basement 1 (B1)', 'Ground Floor (GF)', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Floor 6', 'Floor 7', 'Floor 8', 'Floor 9', 'Floor 10', 'Floor 11', 'Floor 12', 'Floor 13', 'Floor 14', 'Floor 15', 'Floor 16', 'Floor 17', 'Floor 18', 'Floor 19', 'Floor 20', 'Floor 21', 'Floor 22', 'Floor 23', 'Floor 24', 'Floor 25', 'Floor 26', 'Floor 27', 'Floor 28', 'Floor 29', 'Floor 30', 'Floor 31', 'Floor 32', 'Floor 33', 'Floor 34', 'Floor 35', 'Terrace / Roof Level'],
                zones: ['Zone 1 (Excavation & Shoring)', 'Zone 2 (Tower Footprint)', 'Zone 3 (Central Podium)', 'Zone 4 (Perimeter Boundary)'],
                contractors: ['Apex Infrastructure Pvt Ltd', 'L&T Construction Heavy Civil', 'SteelFab Engineering Solutions', 'Apex Heavy Lift Ltd'],
                site: { lat: 17.4239, lng: 78.4738, address: 'Gachibowli, Hyderabad, Telangana' },
                radius: 150,
                configured: true,
                configuredAt: '2026-09-01T10:00:00Z',
                configuredBy: 'Site Administrator (A. K. Sharma)',
                tagMethod: 'On-Site Tagged (Device GPS)'
            },
            {
                id: 'PRJ-ABP',
                name: 'Auro Business Park',
                towers: ['Block 1', 'Block 2', 'Block 3'],
                basements: ['Basement 2 (B2)', 'Basement 1 (B1)', 'Ground Floor (GF)', 'Podium Level 1 (P1)', 'Podium Level 2 (P2)'],
                floors: ['Basement 2 (B2)', 'Basement 1 (B1)', 'Ground Floor (GF)', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Floor 6', 'Floor 7', 'Floor 8', 'Floor 9', 'Floor 10', 'Floor 11', 'Floor 12', 'Floor 14', 'Floor 15', 'Terrace Level'],
                zones: ['Zone A (Office Core)', 'Zone B (Retail Atrium)', 'Zone C (Basement Utilities)'],
                contractors: ['L&T Construction Heavy Civil', 'Shapoorji Pallonji & Co. Ltd', 'EnerSys Electrical & Power Infra'],
                site: { lat: 17.4483, lng: 78.3915, address: 'Kondapur, Hyderabad, Telangana' },
                radius: 200,
                configured: true,
                configuredAt: '2026-09-01T11:30:00Z',
                configuredBy: 'Site Administrator (A. K. Sharma)',
                tagMethod: 'On-Site Tagged (Device GPS)'
            },
            {
                id: 'PRJ-ART',
                name: 'Auro Riverside Towers',
                towers: ['Tower North', 'Tower South'],
                basements: ['Basement 1 (B1)', 'Ground Floor (GF)', 'Podium Level 1 (P1)'],
                floors: ['Basement 1 (B1)', 'Ground Floor (GF)', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Floor 6', 'Floor 7', 'Floor 8', 'Floor 9', 'Floor 10', 'Terrace Level'],
                zones: ['Zone 1 (River Embankment)', 'Zone 2 (Tower North Base)', 'Zone 3 (Tower South Base)'],
                contractors: ['Apex Infrastructure Pvt Ltd', 'RockBlast Geo-Technics India'],
                site: { lat: 17.3850, lng: 78.4867, address: 'Financial District, Hyderabad, Telangana' },
                radius: 100,
                configured: false, // Unconfigured by default: locks permit form filling until Admin sets location!
                configuredAt: null,
                configuredBy: null,
                tagMethod: null
            }
        ];

        /* Centralized Dynamic Structural Accessors */
        function getProject(projIdOrName) {
            if (!projIdOrName) return PROJECTS[0] || null;
            return PROJECTS.find(p => p.id === projIdOrName || p.name === projIdOrName) || null;
        }

        function getProjectTowers(projIdOrName) {
            const p = getProject(projIdOrName);
            if (p && Array.isArray(p.towers) && p.towers.length > 0) return p.towers;
            return ['Tower A', 'Tower B', 'Tower C', 'Tower D'];
        }

        function getProjectBasements(projIdOrName) {
            const p = getProject(projIdOrName);
            if (p && Array.isArray(p.basements) && p.basements.length > 0) return p.basements;
            return (typeof BASEMENT_PODIUM_OPTIONS !== 'undefined') ? BASEMENT_PODIUM_OPTIONS : ['Basement 2 (B2)', 'Basement 1 (B1)', 'Ground Floor (GF)', 'Podium Level 1 (P1)'];
        }

        function getProjectFloors(projIdOrName) {
            const p = getProject(projIdOrName);
            if (p && Array.isArray(p.floors) && p.floors.length > 0) return p.floors;
            return (typeof SHAFT_FLOORS !== 'undefined') ? SHAFT_FLOORS : ['Ground Floor (GF)', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Terrace / Roof Level'];
        }

        function getProjectZones(projIdOrName) {
            const p = getProject(projIdOrName);
            if (p && Array.isArray(p.zones) && p.zones.length > 0) return p.zones;
            return ['Zone 1 (Excavation & Shoring)', 'Zone 2 (Tower Footprint)', 'Zone 3 (Central Podium)', 'Zone 4 (Perimeter Boundary)'];
        }

        function getProjectContractors(projIdOrName) {
            const p = getProject(projIdOrName);
            if (p && Array.isArray(p.contractors) && p.contractors.length > 0) return p.contractors;
            if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.contractorDirectory && Array.isArray(APP_CONFIG.contractorDirectory)) {
                return APP_CONFIG.contractorDirectory.map(c => c.name);
            }
            return ['Apex Infrastructure Pvt Ltd', 'L&T Construction Heavy Civil', 'Shapoorji Pallonji & Co. Ltd', 'SteelFab Engineering Solutions', 'Apex Heavy Lift Ltd'];
        }

        function getContractorDirectory() {
            if (typeof APP_CONFIG !== 'undefined' && Array.isArray(APP_CONFIG.contractorDirectory)) {
                return APP_CONFIG.contractorDirectory;
            }
            return [];
        }

        function getSlaConfig() {
            if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sla) {
                return APP_CONFIG.sla;
            }
            return {
                mode: 'demo',
                stage1Ms: 45 * 1000,
                stage2Ms: 120 * 1000,
                stage1MsProd: 2 * 3600 * 1000,
                stage2MsProd: 4 * 3600 * 1000,
                warningMinutesBeforeExpiry: 30,
                extensionCutoffHour: 18,
                extensionCutoffMinute: 30,
                extensionCeilingHour: 20,
                extensionCeilingMinute: 30,
                nightHandoverGateHour: 20,
                nightHandoverGateMinute: 30,
                nightHandoverCutoffHour: 21,
                nightHandoverCutoffMinute: 0,
                tickIntervalMs: 5000
            };
        }

        function getWeatherOptions() {
            if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.weather && Array.isArray(APP_CONFIG.weather.options)) {
                return APP_CONFIG.weather.options;
            }
            return [
                { condition: 'Clear', windSpeedKmH: 12, tempC: 30 },
                { condition: 'Sunny', windSpeedKmH: 14, tempC: 33 },
                { condition: 'Partly Cloudy', windSpeedKmH: 18, tempC: 29 },
                { condition: 'Overcast', windSpeedKmH: 22, tempC: 27 },
                { condition: 'Windy', windSpeedKmH: 32, tempC: 28 },
                { condition: 'High Wind Alert', windSpeedKmH: 42, tempC: 26 },
                { condition: 'Light Rain', windSpeedKmH: 20, tempC: 25 },
                { condition: 'Hazy', windSpeedKmH: 10, tempC: 29 }
            ];
        }`;

content = content.replace(projRegex, enrichedProjects);
console.log('2. Replaced PROJECTS with enriched structural version and accessors');

// 3. Update STAGE1_MS & STAGE2_MS and runEscalationTick
const oldStageDecl = `const STAGE1_MS = 45 * 1000;   // demo Stage-1 escalation window
        const STAGE2_MS = 120 * 1000;  // demo Stage-2 escalation window`;
const newStageDecl = `let STAGE1_MS = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sla && APP_CONFIG.sla.mode === 'production')
            ? (APP_CONFIG.sla.stage1MsProd || 2 * 3600 * 1000)
            : ((typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sla && APP_CONFIG.sla.stage1Ms) || 45 * 1000);
        let STAGE2_MS = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sla && APP_CONFIG.sla.mode === 'production')
            ? (APP_CONFIG.sla.stage2MsProd || 4 * 3600 * 1000)
            : ((typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sla && APP_CONFIG.sla.stage2Ms) || 120 * 1000);`;

content = content.replace(oldStageDecl, newStageDecl);

const oldElapsedCheck = `const elapsed = t - new Date(p.stageEnteredAt);
                    if (!p.escalation) p.escalation = { stage1: false, stage2: false };
                    if (elapsed > STAGE1_MS && !p.escalation.stage1) {
                        p.escalation.stage1 = true;
                        notify([shRoleFor(p), 'ehs-manager'], 'ESCALATION (Stage 1): ' + pLabel(p) + ' has been pending ' + stageLabelFor(p.status, p) + ' beyond the expected window.', 'warn', p.id);
                    }
                    if (elapsed > STAGE2_MS && !p.escalation.stage2) {
                        p.escalation.stage2 = true;
                        notify(['ehs-manager', 'ehs-officer'], 'ESCALATION (Stage 2): ' + pLabel(p) + ' is significantly overdue at ' + stageLabelFor(p.status, p) + '. Project Manager / EHS Head visibility required.', 'error', p.id);
                    }`;

const newElapsedCheck = `const elapsed = t - new Date(p.stageEnteredAt);
                    const slaCfg = getSlaConfig();
                    const curStage1Ms = (slaCfg.mode === 'production') ? (slaCfg.stage1MsProd || 7200000) : (slaCfg.stage1Ms || STAGE1_MS);
                    const curStage2Ms = (slaCfg.mode === 'production') ? (slaCfg.stage2MsProd || 14400000) : (slaCfg.stage2Ms || STAGE2_MS);
                    if (!p.escalation) p.escalation = { stage1: false, stage2: false };
                    if (elapsed > curStage1Ms && !p.escalation.stage1) {
                        p.escalation.stage1 = true;
                        notify([shRoleFor(p), 'ehs-manager'], 'ESCALATION (Stage 1): ' + pLabel(p) + ' has been pending ' + stageLabelFor(p.status, p) + ' beyond the expected window.', 'warn', p.id);
                    }
                    if (elapsed > curStage2Ms && !p.escalation.stage2) {
                        p.escalation.stage2 = true;
                        notify(['ehs-manager', 'ehs-officer'], 'ESCALATION (Stage 2): ' + pLabel(p) + ' is significantly overdue at ' + stageLabelFor(p.status, p) + '. Project Manager / EHS Head visibility required.', 'error', p.id);
                    }`;

content = content.replace(oldElapsedCheck, newElapsedCheck);
console.log('3. Updated STAGE1_MS & STAGE2_MS and dynamic escalation checks');

// 4. Update renderUniversalOrgAndLocationHtml
const oldTowerOpts = `(prj && isConfigured ? prj.towers.map(t => '<option value="' + t + '" ' + (draft.tower === t ? 'selected' : '') + '>' + t + '</option>').join('') : '')`;
const newTowerOpts = `(prj && isConfigured ? getProjectTowers(draft.project).map(t => '<option value="' + t + '" ' + (draft.tower === t ? 'selected' : '') + '>' + t + '</option>').join('') : '')`;
content = content.replace(oldTowerOpts, newTowerOpts);

const oldFloorOpts = `SHAFT_FLOORS.map(fl => '<option value="' + fl + '" ' + ((draft.locFloor || draft.grFloor || draft.shaftFloor) === fl ? 'selected' : '') + '>' + fl + '</option>').join('')`;
const newFloorOpts = `getProjectFloors(draft.project).map(fl => '<option value="' + fl + '" ' + ((draft.locFloor || draft.grFloor || draft.shaftFloor) === fl ? 'selected' : '') + '>' + fl + '</option>').join('')`;
content = content.replace(oldFloorOpts, newFloorOpts);

const oldBpOpts = `BASEMENT_PODIUM_OPTIONS.map(bp => '<option value="' + bp + '" ' + ((draft.locBasementPodium || draft.grBasementPodium) === bp ? 'selected' : '') + '>' + bp + '</option>').join('')`;
const newBpOpts = `getProjectBasements(draft.project).map(bp => '<option value="' + bp + '" ' + ((draft.locBasementPodium || draft.grBasementPodium) === bp ? 'selected' : '') + '>' + bp + '</option>').join('')`;
content = content.replace(oldBpOpts, newBpOpts);

const oldContractorInput = `(isContractor
                    ? '<div class="form-field full" id="ff-contractor"><label>Contractor Agency / Company Name <span class="req">*</span></label><input type="text" id="inContractor" placeholder="Enter full contractor company / agency name..." value="' + escapeHtml(draft.contractor || '') + '" oninput="draft.contractor=this.value;draft.welderContractor=this.value;validateWizStep(1)"' + disAttr + '><div class="form-error"><i class="fa-solid fa-circle-exclamation"></i> Contractor name is mandatory.</div></div>'
                    : '')`;

const newContractorInput = `(isContractor
                    ? '<div class="form-field full" id="ff-contractor"><label>Contractor Agency / Company Name <span class="req">*</span></label><input type="text" id="inContractor" list="contractorDatalist" placeholder="Select or enter contractor company / agency name..." value="' + escapeHtml(draft.contractor || '') + '" oninput="draft.contractor=this.value;draft.welderContractor=this.value;validateWizStep(1)"' + disAttr + '><datalist id="contractorDatalist">' + getProjectContractors(draft.project).map(c => '<option value="' + escapeHtml(c) + '"></option>').join('') + '</datalist><div class="form-hint" style="font-size:11px;color:var(--text-muted);margin-top:3px;"><i class="fa-solid fa-building-shield"></i> Choose from approved contractor registry or enter new agency.</div><div class="form-error"><i class="fa-solid fa-circle-exclamation"></i> Contractor name is mandatory.</div></div>'
                    : '')`;

content = content.replace(oldContractorInput, newContractorInput);
console.log('4. Updated universal organization & location dropdowns to dynamic project structures');

// 5. Upgrade view-admin-config markup with multi-tab interface
const oldAdminViewHeaderAndGrid = `<!-- ADMIN CONFIG (SITE GPS & GEOFENCE) -->
                <div class="view" id="view-admin-config">
                    <div class="view-header">
                        <div>
                            <h1><i class="fa-solid fa-map-location-dot"></i> Site GPS &amp; Geofencing Configuration
                            </h1>
                            <p>Administrator control: Configure worksite coordinates (Lat/Lng) and proximity circle
                                radius range for approval gates</p>
                        </div>
                        <button class="btn btn-primary" onclick="openSaveGeofenceModal()"><i
                                class="fa-solid fa-floppy-disk"></i> Save Geofence Configuration</button>
                    </div>

                    <div class="dash-grid">`;

const newAdminViewHeaderAndGrid = `<!-- ADMIN CONFIG (SITE GPS, GEOFENCE, PROJECTS, CONTRACTORS & SLA) -->
                <div class="view" id="view-admin-config">
                    <div class="view-header">
                        <div>
                            <h1><i class="fa-solid fa-sliders"></i> Enterprise Administration &amp; Governance Center
                            </h1>
                            <p>Administrator control: Configure worksite GPS geofencing, project structures, approved contractor directory, SLA timers, and permit policies</p>
                        </div>
                        <button class="btn btn-primary" onclick="openSaveGeofenceModal()"><i
                                class="fa-solid fa-floppy-disk"></i> Save Geofence Configuration</button>
                    </div>

                    <!-- Admin Navigation Tab Bar -->
                    <div class="admin-tab-bar" style="display:flex;gap:8px;border-bottom:2px solid var(--border);margin-bottom:20px;padding-bottom:2px;overflow-x:auto;">
                        <button type="button" class="admin-tab-btn active" id="tabBtnGps" onclick="switchAdminTab('gps')" style="padding:10px 18px;font-size:13px;font-weight:700;border:none;background:none;cursor:pointer;color:var(--orange);border-bottom:3px solid var(--orange);display:flex;align-items:center;gap:8px;">
                            <i class="fa-solid fa-map-location-dot"></i> Worksite GPS &amp; Geofencing
                        </button>
                        <button type="button" class="admin-tab-btn" id="tabBtnProjects" onclick="switchAdminTab('projects')" style="padding:10px 18px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;color:var(--text-muted);border-bottom:3px solid transparent;display:flex;align-items:center;gap:8px;">
                            <i class="fa-solid fa-building"></i> Projects &amp; Structural Hierarchies
                        </button>
                        <button type="button" class="admin-tab-btn" id="tabBtnContractors" onclick="switchAdminTab('contractors')" style="padding:10px 18px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;color:var(--text-muted);border-bottom:3px solid transparent;display:flex;align-items:center;gap:8px;">
                            <i class="fa-solid fa-helmet-safety"></i> Approved Contractor Directory
                        </button>
                        <button type="button" class="admin-tab-btn" id="tabBtnSla" onclick="switchAdminTab('sla')" style="padding:10px 18px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;color:var(--text-muted);border-bottom:3px solid transparent;display:flex;align-items:center;gap:8px;">
                            <i class="fa-solid fa-stopwatch"></i> SLA Timers &amp; Operating Windows
                        </button>
                        <button type="button" class="admin-tab-btn" id="tabBtnPermits" onclick="switchAdminTab('permits')" style="padding:10px 18px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;color:var(--text-muted);border-bottom:3px solid transparent;display:flex;align-items:center;gap:8px;">
                            <i class="fa-solid fa-file-shield"></i> Permit Types &amp; Weekend Rules
                        </button>
                    </div>

                    <!-- Panel 1: Worksite GPS & Geofencing -->
                    <div id="adminPanelGps" class="admin-panel" style="display:block;">
                    <div class="dash-grid">`;

content = content.replace(oldAdminViewHeaderAndGrid, newAdminViewHeaderAndGrid);

// Close panel 1 and add panels 2, 3, 4, 5 before the end of view-admin-config
const oldAdminEndMarker = `                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>`;

const newAdminEndMarker = `                            </div>
                        </div>
                    </div>
                    </div> <!-- End of adminPanelGps -->

                    <!-- Panel 2: Projects & Structural Hierarchies -->
                    <div id="adminPanelProjects" class="admin-panel" style="display:none;">
                        <div style="display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start;">
                            <div>
                                <div class="card" style="padding:20px;margin-bottom:16px;">
                                    <h3 style="font-size:15px;font-weight:700;margin:0 0 14px;color:var(--navy);display:flex;align-items:center;gap:8px;">
                                        <i class="fa-solid fa-building" style="color:var(--orange);"></i> Registered Worksite Construction Projects
                                    </h3>
                                    <p style="font-size:12px;color:var(--text-muted);margin:0 0 16px;">Manage building towers, basement levels, approved contractors, and location coordinates dynamically per project site.</p>
                                    <div id="adminProjectsList"></div>
                                </div>
                            </div>
                            <div>
                                <div class="card" style="padding:20px;">
                                    <h3 style="font-size:14px;font-weight:700;margin:0 0 12px;color:var(--navy);display:flex;align-items:center;gap:8px;">
                                        <i class="fa-solid fa-circle-plus" style="color:var(--green);"></i> Register New Worksite
                                    </h3>
                                    <div class="form-field" style="margin-bottom:12px;">
                                        <label>Project Name <span class="req">*</span></label>
                                        <input type="text" id="newProjName" placeholder="e.g. Auro Sky City">
                                    </div>
                                    <div class="form-field" style="margin-bottom:12px;">
                                        <label>Project Code (ID) <span class="req">*</span></label>
                                        <input type="text" id="newProjId" placeholder="e.g. PRJ-ASC" class="mono" style="text-transform:uppercase;">
                                    </div>
                                    <div class="form-field" style="margin-bottom:12px;">
                                        <label>Site Address / Location</label>
                                        <input type="text" id="newProjAddress" placeholder="e.g. HITEC City, Hyderabad">
                                    </div>
                                    <div class="form-field" style="margin-bottom:16px;">
                                        <label>Initial Towers (Comma-separated)</label>
                                        <input type="text" id="newProjTowers" placeholder="e.g. Tower 1, Tower 2, Tower 3">
                                    </div>
                                    <button type="button" class="btn btn-primary btn-block" onclick="adminAddNewProject()"><i class="fa-solid fa-plus"></i> Register Project</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Panel 3: Approved Contractor Directory -->
                    <div id="adminPanelContractors" class="admin-panel" style="display:none;">
                        <div style="display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start;">
                            <div>
                                <div class="card" style="padding:20px;">
                                    <h3 style="font-size:15px;font-weight:700;margin:0 0 14px;color:var(--navy);display:flex;align-items:center;gap:8px;">
                                        <i class="fa-solid fa-helmet-safety" style="color:var(--orange);"></i> Empaneled Contractor &amp; Vendor Directory
                                    </h3>
                                    <p style="font-size:12px;color:var(--text-muted);margin:0 0 16px;">Approved agencies authorized to perform contract works on ARPL projects. Registered vendors populate wizard auto-suggest catalogs.</p>
                                    <div style="overflow-x:auto;">
                                        <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
                                            <thead>
                                                <tr style="background:var(--bg);border-bottom:2px solid var(--border);text-align:left;">
                                                    <th style="padding:10px 12px;">Agency Name</th>
                                                    <th style="padding:10px 12px;">Vendor Code</th>
                                                    <th style="padding:10px 12px;">Trade Category</th>
                                                    <th style="padding:10px 12px;">Safety Rating</th>
                                                    <th style="padding:10px 12px;">Status</th>
                                                    <th style="padding:10px 12px;">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody id="adminContractorsTableBody"></tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="card" style="padding:20px;">
                                    <h3 style="font-size:14px;font-weight:700;margin:0 0 12px;color:var(--navy);display:flex;align-items:center;gap:8px;">
                                        <i class="fa-solid fa-user-plus" style="color:var(--green);"></i> Empanel New Contractor
                                    </h3>
                                    <div class="form-field" style="margin-bottom:12px;">
                                        <label>Company / Agency Name <span class="req">*</span></label>
                                        <input type="text" id="newContractorName" placeholder="e.g. Apex Infra Ltd">
                                    </div>
                                    <div class="form-field" style="margin-bottom:12px;">
                                        <label>Vendor Code</label>
                                        <input type="text" id="newContractorCode" placeholder="e.g. VND-108" class="mono">
                                    </div>
                                    <div class="form-field" style="margin-bottom:12px;">
                                        <label>Primary Trade</label>
                                        <select id="newContractorCategory">
                                            <option value="General Civil & Heavy Structural">General Civil &amp; Heavy Structural</option>
                                            <option value="Tower Crane & Heavy Rigging Specialist">Tower Crane &amp; Heavy Rigging Specialist</option>
                                            <option value="HT/LT Substation & Plant Maintenance">HT/LT Substation &amp; Plant Maintenance</option>
                                            <option value="Hot Work, Structural Steel & Façade">Hot Work, Structural Steel &amp; Façade</option>
                                            <option value="Licensed Explosives & Controlled Blasting">Licensed Explosives &amp; Controlled Blasting</option>
                                        </select>
                                    </div>
                                    <div class="form-field" style="margin-bottom:16px;">
                                        <label>Safety Audit Score (1.0 to 5.0)</label>
                                        <input type="number" id="newContractorRating" min="1.0" max="5.0" step="0.1" value="5.0">
                                    </div>
                                    <button type="button" class="btn btn-primary btn-block" onclick="adminAddNewContractor()"><i class="fa-solid fa-plus"></i> Empanel Contractor</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Panel 4: SLA Timers & Operating Windows -->
                    <div id="adminPanelSla" class="admin-panel" style="display:none;">
                        <div class="card" style="padding:20px;max-width:800px;margin:0 auto;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
                                <div>
                                    <h3 style="font-size:15px;font-weight:700;margin:0;color:var(--navy);display:flex;align-items:center;gap:8px;">
                                        <i class="fa-solid fa-stopwatch" style="color:var(--orange);"></i> SLA &amp; Escalation Timing Policy Engine
                                    </h3>
                                    <p style="font-size:12px;color:var(--text-muted);margin:4px 0 0;">Configure escalation triggers, validity expiry reminders, and operational cutoffs.</p>
                                </div>
                                <span id="slaCurrentModeBadge" class="badge st-parallel" style="font-size:12px;padding:6px 12px;">⚡ Fast Demo Mode</span>
                            </div>

                            <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:20px;">
                                <div style="font-weight:700;font-size:13px;color:var(--navy);margin-bottom:8px;">Operating Mode Selection</div>
                                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                                    <button type="button" class="btn btn-sm btn-primary" onclick="adminToggleSlaMode('demo')"><i class="fa-solid fa-bolt"></i> Fast Demo Mode (45s / 120s)</button>
                                    <button type="button" class="btn btn-sm btn-ghost" onclick="adminToggleSlaMode('production')"><i class="fa-solid fa-industry"></i> Enterprise Production Mode (2h / 4h)</button>
                                </div>
                            </div>

                            <div class="form-grid" style="margin-bottom:16px;">
                                <div class="form-field">
                                    <label>Stage 1 Overdue Escalation Threshold (Sec / Hours) <span class="req">*</span></label>
                                    <input type="number" id="inSlaStage1" min="1" step="1" value="45">
                                </div>
                                <div class="form-field">
                                    <label>Stage 2 Critical Escalation Threshold (Sec / Hours) <span class="req">*</span></label>
                                    <input type="number" id="inSlaStage2" min="1" step="1" value="120">
                                </div>
                                <div class="form-field">
                                    <label>Validity Expiry Warning Reminder (Minutes before end) <span class="req">*</span></label>
                                    <input type="number" id="inSlaWarning" min="5" max="120" step="5" value="30">
                                </div>
                            </div>

                            <button type="button" class="btn btn-primary" onclick="adminSaveSlaSettings()"><i class="fa-solid fa-check"></i> Apply &amp; Save SLA Timers</button>
                        </div>
                    </div>

                    <!-- Panel 5: Permit Types & Weekend Rules -->
                    <div id="adminPanelPermits" class="admin-panel" style="display:none;">
                        <div class="card" style="padding:20px;">
                            <h3 style="font-size:15px;font-weight:700;margin:0 0 14px;color:var(--navy);display:flex;align-items:center;gap:8px;">
                                <i class="fa-solid fa-file-shield" style="color:var(--orange);"></i> Statutory Permit Types &amp; Operational Policies
                            </h3>
                            <p style="font-size:12px;color:var(--text-muted);margin:0 0 16px;">Toggle permit types on or off and review statutory workflow topologies.</p>
                            <div id="adminPermitTypesList" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(360px, 1fr));gap:14px;"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>`;

content = content.replace(oldAdminEndMarker, newAdminEndMarker);
console.log('5. Upgraded view-admin-config with 5 interactive panels');

// 6. Add Admin Tab Switching and Management Functions
const adminFuncs = `
        /* ---------------- DYNAMIC ADMIN CENTER ENGINE ---------------- */
        let adminCurrentTab = 'gps';

        function switchAdminTab(tab) {
            adminCurrentTab = tab;
            ['gps', 'projects', 'contractors', 'sla', 'permits'].forEach(t => {
                const panel = document.getElementById('adminPanel' + t.charAt(0).toUpperCase() + t.slice(1));
                const btn = document.getElementById('tabBtn' + t.charAt(0).toUpperCase() + t.slice(1));
                if (panel) panel.style.display = (t === tab ? 'block' : 'none');
                if (btn) {
                    if (t === tab) {
                        btn.style.color = 'var(--orange)';
                        btn.style.borderBottom = '3px solid var(--orange)';
                        btn.classList.add('active');
                    } else {
                        btn.style.color = 'var(--text-muted)';
                        btn.style.borderBottom = '3px solid transparent';
                        btn.classList.remove('active');
                    }
                }
            });
            if (tab === 'gps') renderAdminConfigView();
            if (tab === 'projects') renderAdminProjectsTab();
            if (tab === 'contractors') renderAdminContractorsTab();
            if (tab === 'sla') renderAdminSlaTab();
            if (tab === 'permits') renderAdminPermitsTab();
        }

        function renderAdminProjectsTab() {
            const container = document.getElementById('adminProjectsList');
            if (!container) return;
            container.innerHTML = PROJECTS.map((p, idx) => {
                const towers = (p.towers || []).map(t => '<span class="radius-preset-pill" style="cursor:default;font-size:11px;padding:3px 8px;">' + escapeHtml(t) + '</span>').join(' ');
                const basements = (p.basements || BASEMENT_PODIUM_OPTIONS).slice(0, 4).map(b => '<span class="radius-preset-pill" style="cursor:default;font-size:10px;padding:2px 6px;background:rgba(27,95,174,0.08);color:var(--navy);">' + escapeHtml(b) + '</span>').join(' ');
                return '<div class="card" style="padding:16px;margin-bottom:14px;border:1px solid var(--border);">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
                    '<div style="font-weight:700;font-size:14px;color:var(--navy);"><i class="fa-solid fa-building" style="color:var(--orange);margin-right:6px;"></i>' + escapeHtml(p.name) + ' <span class="mono" style="font-size:11px;color:var(--text-muted);">(' + p.id + ')</span></div>' +
                    '<span class="badge ' + (p.configured ? 'st-active' : 'st-draft') + '" style="font-size:11px;">' + (p.configured ? '✓ GPS Active' : '⚠️ Locked') + '</span>' +
                    '</div>' +
                    '<div style="font-size:12px;color:var(--text);margin-bottom:8px;"><b>Site Address:</b> ' + escapeHtml((p.site && p.site.address) || 'Not set') + ' &bull; <b>Radius:</b> ' + (p.radius || 150) + 'm</div>' +
                    '<div style="margin-bottom:8px;"><div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:4px;">BUILDING TOWERS &amp; BLOCKS:</div>' + towers + ' <button class="btn btn-xs btn-ghost" onclick="adminPromptAddTower(' + idx + ')" style="padding:2px 6px;font-size:10px;"><i class="fa-solid fa-plus"></i> Add Tower</button></div>' +
                    '<div><div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:4px;">BASEMENT &amp; PODIUM STRUCTURES:</div>' + basements + '</div>' +
                    '</div>';
            }).join('');
        }

        function adminPromptAddTower(idx) {
            const t = prompt('Enter new Tower or Block name (e.g. Tower E, Block 4):');
            if (!t || !t.trim()) return;
            if (!PROJECTS[idx].towers) PROJECTS[idx].towers = [];
            PROJECTS[idx].towers.push(t.trim());
            saveState();
            showToast('Added ' + t.trim() + ' to ' + PROJECTS[idx].name, 'ok');
            renderAdminProjectsTab();
            if (typeof draft !== 'undefined' && draft && draft.project === PROJECTS[idx].name) {
                renderWizStep();
            }
        }

        function adminAddNewProject() {
            const nameEl = document.getElementById('newProjName');
            const idEl = document.getElementById('newProjId');
            const addrEl = document.getElementById('newProjAddress');
            const towersEl = document.getElementById('newProjTowers');
            if (!nameEl || !idEl) return;
            const name = nameEl.value.trim();
            const id = idEl.value.trim().toUpperCase();
            if (!name || !id) {
                showToast('Project Name and ID are required.', 'warn');
                return;
            }
            if (PROJECTS.some(p => p.id === id)) {
                showToast('Project ID ' + id + ' already exists.', 'err');
                return;
            }
            const towers = (towersEl && towersEl.value.trim()) ? towersEl.value.split(',').map(s => s.trim()).filter(Boolean) : ['Tower 1', 'Tower 2'];
            const newPrj = {
                id: id,
                name: name,
                towers: towers,
                basements: ['Basement 2 (B2)', 'Basement 1 (B1)', 'Ground Floor (GF)', 'Podium Level 1 (P1)'],
                floors: SHAFT_FLOORS.slice(0, 25),
                zones: ['Zone 1 (Excavation)', 'Zone 2 (Tower Footprint)'],
                contractors: ['Apex Infrastructure Pvt Ltd', 'L&T Construction Heavy Civil'],
                site: { lat: 17.4300, lng: 78.4000, address: (addrEl && addrEl.value.trim()) || 'Hyderabad, Telangana' },
                radius: 150,
                configured: true,
                configuredAt: nowTime(),
                configuredBy: (currentUser && currentUser.name) || 'Site Administrator',
                tagMethod: 'On-Site Tagged (Device GPS)'
            };
            PROJECTS.push(newPrj);
            nameEl.value = '';
            idEl.value = '';
            if (addrEl) addrEl.value = '';
            if (towersEl) towersEl.value = '';
            saveState();
            showToast('Project ' + name + ' (' + id + ') registered successfully with ' + towers.length + ' towers!', 'ok');
            renderAdminProjectsTab();
            renderAdminConfigView();
        }

        function renderAdminContractorsTab() {
            const container = document.getElementById('adminContractorsTableBody');
            if (!container) return;
            const contractors = getContractorDirectory();
            container.innerHTML = contractors.map((c, idx) => {
                return '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:10px 12px;font-weight:600;color:var(--navy);">' + escapeHtml(c.name) + '</td>' +
                    '<td style="padding:10px 12px;" class="mono">' + escapeHtml(c.code || ('VND-' + (idx+101))) + '</td>' +
                    '<td style="padding:10px 12px;"><span class="badge" style="background:rgba(27,95,174,0.1);color:var(--navy);font-size:11px;">' + escapeHtml(c.category || 'General Civil') + '</span></td>' +
                    '<td style="padding:10px 12px;"><span style="color:var(--orange);font-weight:700;"><i class="fa-solid fa-star"></i> ' + (c.safetyRating || '5.0') + '</span></td>' +
                    '<td style="padding:10px 12px;"><span class="badge st-active" style="font-size:10.5px;"><i class="fa-solid fa-shield-check"></i> ' + escapeHtml(c.status || 'Empaneled') + '</span></td>' +
                    '<td style="padding:10px 12px;"><button class="btn btn-xs btn-ghost" onclick="adminRemoveContractor(' + idx + ')" style="color:var(--red);" title="Remove vendor"><i class="fa-solid fa-trash-can"></i></button></td>' +
                    '</tr>';
            }).join('');
        }

        function adminAddNewContractor() {
            const nameEl = document.getElementById('newContractorName');
            const codeEl = document.getElementById('newContractorCode');
            const catEl = document.getElementById('newContractorCategory');
            const ratingEl = document.getElementById('newContractorRating');
            if (!nameEl || !nameEl.value.trim()) {
                showToast('Contractor Agency Name is mandatory.', 'warn');
                return;
            }
            const name = nameEl.value.trim();
            const code = (codeEl && codeEl.value.trim()) ? codeEl.value.trim().toUpperCase() : ('VND-' + Math.floor(100 + Math.random() * 900));
            const cat = (catEl && catEl.value) ? catEl.value : 'General Civil & Heavy Structural';
            const rating = (ratingEl && ratingEl.value) ? ratingEl.value : '5.0';

            if (!APP_CONFIG.contractorDirectory) APP_CONFIG.contractorDirectory = [];
            APP_CONFIG.contractorDirectory.push({
                id: 'cnt-' + uid(),
                name: name,
                code: code,
                category: cat,
                safetyRating: rating,
                status: 'Empaneled & Verified'
            });
            nameEl.value = '';
            if (codeEl) codeEl.value = '';
            saveState();
            showToast('Contractor "' + name + '" successfully empaneled!', 'ok');
            renderAdminContractorsTab();
        }

        function adminRemoveContractor(idx) {
            if (!confirm('Remove this contractor agency from the approved directory?')) return;
            if (APP_CONFIG.contractorDirectory && APP_CONFIG.contractorDirectory[idx]) {
                const removed = APP_CONFIG.contractorDirectory.splice(idx, 1);
                saveState();
                showToast('Removed ' + (removed[0] ? removed[0].name : 'contractor'), 'ok');
                renderAdminContractorsTab();
            }
        }

        function renderAdminSlaTab() {
            const cfg = getSlaConfig();
            const modeEl = document.getElementById('slaCurrentModeBadge');
            if (modeEl) {
                modeEl.textContent = cfg.mode === 'production' ? '🏭 Enterprise Production Mode (2h / 4h SLA)' : '⚡ Fast Demo Mode (45s / 120s SLA)';
                modeEl.className = 'badge ' + (cfg.mode === 'production' ? 'st-active' : 'st-parallel');
            }
            const s1El = document.getElementById('inSlaStage1');
            const s2El = document.getElementById('inSlaStage2');
            const warnEl = document.getElementById('inSlaWarning');
            if (s1El) s1El.value = cfg.mode === 'production' ? Math.round((cfg.stage1MsProd || 7200000) / 3600000) : Math.round((cfg.stage1Ms || 45000) / 1000);
            if (s2El) s2El.value = cfg.mode === 'production' ? Math.round((cfg.stage2MsProd || 14400000) / 3600000) : Math.round((cfg.stage2Ms || 120000) / 1000);
            if (warnEl) warnEl.value = cfg.warningMinutesBeforeExpiry || 30;
        }

        function adminToggleSlaMode(mode) {
            if (!APP_CONFIG.sla) APP_CONFIG.sla = getSlaConfig();
            APP_CONFIG.sla.mode = mode;
            if (mode === 'production') {
                STAGE1_MS = APP_CONFIG.sla.stage1MsProd || (2 * 3600 * 1000);
                STAGE2_MS = APP_CONFIG.sla.stage2MsProd || (4 * 3600 * 1000);
            } else {
                STAGE1_MS = APP_CONFIG.sla.stage1Ms || (45 * 1000);
                STAGE2_MS = APP_CONFIG.sla.stage2Ms || (120 * 1000);
            }
            saveState();
            showToast('SLA mode switched to ' + (mode === 'production' ? 'Production Mode (2h/4h)' : 'Demo Mode (45s/120s)'), 'ok');
            renderAdminSlaTab();
        }

        function adminSaveSlaSettings() {
            if (!APP_CONFIG.sla) APP_CONFIG.sla = getSlaConfig();
            const s1Val = parseFloat(document.getElementById('inSlaStage1').value);
            const s2Val = parseFloat(document.getElementById('inSlaStage2').value);
            const warnVal = parseInt(document.getElementById('inSlaWarning').value, 10);
            if (isNaN(s1Val) || isNaN(s2Val) || isNaN(warnVal) || s1Val <= 0 || s2Val <= 0) {
                showToast('Please enter valid numeric SLA durations.', 'warn');
                return;
            }
            if (APP_CONFIG.sla.mode === 'production') {
                APP_CONFIG.sla.stage1MsProd = s1Val * 3600 * 1000;
                APP_CONFIG.sla.stage2MsProd = s2Val * 3600 * 1000;
                STAGE1_MS = APP_CONFIG.sla.stage1MsProd;
                STAGE2_MS = APP_CONFIG.sla.stage2MsProd;
            } else {
                APP_CONFIG.sla.stage1Ms = s1Val * 1000;
                APP_CONFIG.sla.stage2Ms = s2Val * 1000;
                STAGE1_MS = APP_CONFIG.sla.stage1Ms;
                STAGE2_MS = APP_CONFIG.sla.stage2Ms;
            }
            APP_CONFIG.sla.warningMinutesBeforeExpiry = warnVal;
            saveState();
            showToast('SLA & Escalation timing configurations applied successfully!', 'ok');
            renderAdminSlaTab();
        }

        function renderAdminPermitsTab() {
            const container = document.getElementById('adminPermitTypesList');
            if (!container) return;
            const pts = Object.keys(APP_CONFIG.permitTypes);
            container.innerHTML = pts.map(k => {
                const pt = APP_CONFIG.permitTypes[k];
                const isAvail = pt.available !== false;
                return '<div class="card" style="padding:14px;border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
                    '<div style="display:flex;align-items:center;gap:12px;">' +
                    '<div style="width:36px;height:36px;border-radius:6px;background:var(--bg);color:var(--navy);display:flex;align-items:center;justify-content:center;font-size:16px;"><i class="fa-solid ' + (pt.icon || 'fa-file') + '"></i></div>' +
                    '<div>' +
                    '<div style="font-weight:700;font-size:13px;color:var(--navy);">' + pt.code + ' &mdash; ' + pt.name + '</div>' +
                    '<div style="font-size:11px;color:var(--text-muted);">' + escapeHtml(pt.desc ? pt.desc.slice(0, 80) + '...' : '') + '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<span class="badge ' + (isAvail ? 'st-active' : 'st-draft') + '" style="font-size:10.5px;">' + (isAvail ? 'Active' : 'Disabled') + '</span>' +
                    '<button class="btn btn-xs ' + (isAvail ? 'btn-ghost' : 'btn-primary') + '" onclick="adminTogglePermitType(\'' + k + '\')">' + (isAvail ? 'Disable' : 'Enable') + '</button>' +
                    '</div>' +
                    '</div>';
            }).join('');
        }

        function adminTogglePermitType(k) {
            if (APP_CONFIG.permitTypes[k]) {
                APP_CONFIG.permitTypes[k].available = !APP_CONFIG.permitTypes[k].available;
                saveState();
                showToast((APP_CONFIG.permitTypes[k].available ? 'Enabled ' : 'Disabled ') + APP_CONFIG.permitTypes[k].name, 'ok');
                renderAdminPermitsTab();
            }
        }
`;

// Insert admin management functions right after confirmSaveGeofence
const confirmSaveMarker = 'renderAdminConfigView();\n        }';
content = content.replace(confirmSaveMarker, confirmSaveMarker + adminFuncs);
console.log('6. Injected Admin Tab Switching and Management Functions');

// 7. Update saveState and loadState to persist SLA and contractor directory
const oldSaveState = `localStorage.setItem(STORAGE_KEY, JSON.stringify({ permits: PERMITS, notifications: NOTIFICATIONS.slice(0, 250), permitSeq: permitSeq, gpsRadiusM: GPS_RADIUS_M, projects: PROJECTS }));`;
const newSaveState = `localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    permits: PERMITS,
                    notifications: NOTIFICATIONS.slice(0, 250),
                    permitSeq: permitSeq,
                    gpsRadiusM: GPS_RADIUS_M,
                    projects: PROJECTS,
                    sla: (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.sla : null),
                    contractorDirectory: (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.contractorDirectory : null)
                }));`;
content = content.replace(oldSaveState, newSaveState);

const oldLoadProjects = `if (Array.isArray(s.projects) && s.projects.length) {
                    PROJECTS = s.projects.map((p, i) => {
                        const def = PROJECTS.find(dp => dp.id === p.id) || p;
                        return Object.assign({}, def, p);
                    });
                }`;

const newLoadProjects = `if (Array.isArray(s.projects) && s.projects.length) {
                    PROJECTS = s.projects.map((p, i) => {
                        const def = PROJECTS.find(dp => dp.id === p.id) || p;
                        return Object.assign({}, def, p);
                    });
                }
                if (s.sla && typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sla) {
                    Object.assign(APP_CONFIG.sla, s.sla);
                }
                if (Array.isArray(s.contractorDirectory) && typeof APP_CONFIG !== 'undefined') {
                    APP_CONFIG.contractorDirectory = s.contractorDirectory;
                }`;

content = content.replace(oldLoadProjects, newLoadProjects);
console.log('7. Updated saveState and loadState to persist dynamic SLA and contractors');

fs.writeFileSync('index.html', content);
console.log('SUCCESS: Written completely updated dynamic architecture to index.html!');
