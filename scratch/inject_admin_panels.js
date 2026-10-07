const fs = require('fs');

let s = fs.readFileSync('index.html', 'utf8');

const adminViewStart = s.indexOf('<div class="view" id="view-admin-config">');
const dashGridIdx = s.indexOf('<div class="dash-grid">', adminViewStart);

const tabBarHtml = `<!-- Admin Navigation Tab Bar -->
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
`;

// Insert tabBarHtml and wrap dashGrid
s = s.slice(0, dashGridIdx) + tabBarHtml + s.slice(dashGridIdx);

// Now locate the closing of dash-grid (around radarLegend)
const radarLegendIdx = s.indexOf('id="radarLegend"');
const closeDashGridTarget = '</div>\r\n                    </div>\r\n                </div>';
const closeDashGridIdx = s.indexOf(closeDashGridTarget, radarLegendIdx);

if (closeDashGridIdx === -1) {
    // Try with \n
    const closeDashGridTargetLf = '</div>\n                    </div>\n                </div>';
    const closeDashGridIdxLf = s.indexOf(closeDashGridTargetLf, radarLegendIdx);
    console.log('closeDashGridIdxLf:', closeDashGridIdxLf);
} else {
    console.log('closeDashGridIdx found at:', closeDashGridIdx);
}

const panels2To5Html = `</div> <!-- End of dash-grid -->
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
                `;

// Replace the closing of dashGrid
const targetClose = closeDashGridIdx !== -1 ? closeDashGridTarget : '</div>\n                    </div>\n                </div>';
s = s.replace(targetClose, panels2To5Html);

fs.writeFileSync('index.html', s);
console.log('Successfully injected admin panels into index.html!');
