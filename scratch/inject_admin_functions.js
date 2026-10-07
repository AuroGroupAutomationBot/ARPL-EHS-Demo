const fs = require('fs');

let s = fs.readFileSync('index.html', 'utf8');

const marker = `function confirmSaveGeofence() {`;
const markerIdx = s.indexOf(marker);
console.log('markerIdx:', markerIdx);

// Find closing brace of confirmSaveGeofence
// In confirmSaveGeofence:
const endMarker = `renderAdminConfigView();`;
const endMarkerIdx = s.indexOf(endMarker, markerIdx);
console.log('endMarkerIdx:', endMarkerIdx);

// Find the next '}' after endMarkerIdx
const closeBraceIdx = s.indexOf('}', endMarkerIdx);
console.log('closeBraceIdx:', closeBraceIdx);

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
            const name = nameEl.value ? nameEl.value.trim() : '';
            const id = idEl.value ? idEl.value.trim().toUpperCase() : '';
            if (!name || !id) {
                showToast('Project Name and ID are required.', 'warn');
                return;
            }
            if (PROJECTS.some(p => p.id === id)) {
                showToast('Project ID ' + id + ' already exists.', 'err');
                return;
            }
            const towers = (towersEl && towersEl.value && towersEl.value.trim()) ? towersEl.value.split(',').map(s => s.trim()).filter(Boolean) : ['Tower 1', 'Tower 2'];
            const newPrj = {
                id: id,
                name: name,
                towers: towers,
                basements: ['Basement 2 (B2)', 'Basement 1 (B1)', 'Ground Floor (GF)', 'Podium Level 1 (P1)'],
                floors: SHAFT_FLOORS.slice(0, 25),
                zones: ['Zone 1 (Excavation)', 'Zone 2 (Tower Footprint)'],
                contractors: ['Apex Infrastructure Pvt Ltd', 'L&T Construction Heavy Civil'],
                site: { lat: 17.4300, lng: 78.4000, address: (addrEl && addrEl.value && addrEl.value.trim()) ? addrEl.value.trim() : 'Hyderabad, Telangana' },
                radius: 150,
                configured: true,
                configuredAt: nowTime(),
                configuredBy: (typeof currentUser !== 'undefined' && currentUser && currentUser.name) ? currentUser.name : 'Site Administrator',
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
            if (!nameEl || !nameEl.value || !nameEl.value.trim()) {
                showToast('Contractor Agency Name is mandatory.', 'warn');
                return;
            }
            const name = nameEl.value.trim();
            const code = (codeEl && codeEl.value && codeEl.value.trim()) ? codeEl.value.trim().toUpperCase() : ('VND-' + Math.floor(100 + Math.random() * 900));
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
                    '<button class="btn btn-xs ' + (isAvail ? 'btn-ghost' : 'btn-primary') + '" onclick="adminTogglePermitType(\\'' + k + '\\')">' + (isAvail ? 'Disable' : 'Enable') + '</button>' +
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
        }`;

s = s.slice(0, closeBraceIdx + 1) + adminFuncs + s.slice(closeBraceIdx + 1);

fs.writeFileSync('index.html', s);
console.log('Successfully injected admin functions into index.html!');
