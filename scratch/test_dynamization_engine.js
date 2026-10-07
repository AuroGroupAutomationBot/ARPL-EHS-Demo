const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('index.html', 'utf8');

console.log('Read index.html, size:', content.length);

// 1. Enrich APP_CONFIG with sla, weather, contractorDirectory
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
    console.log('Added sla, weather, contractorDirectory, permitFormOptions to APP_CONFIG');
} else {
    console.log('APP_CONFIG already contains sla');
}

// 2. Enrich PROJECTS and add structural accessor functions
const oldProjectsStr = `        let PROJECTS = [
            {
                id: 'PRJ-AGR',
                name: 'Auro Grand Residency',
                towers: ['Tower A', 'Tower B', 'Tower C', 'Tower D'],
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
                site: { lat: 17.3850, lng: 78.4867, address: 'Financial District, Hyderabad, Telangana' },
                radius: 100,
                configured: false, // Unconfigured by default: locks permit form filling until Admin sets location!
                configuredAt: null,
                configuredBy: null,
                tagMethod: null
            }
        ];`;

const newProjectsStr = `        let PROJECTS = [
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

if (content.includes(oldProjectsStr)) {
    content = content.replace(oldProjectsStr, newProjectsStr);
    console.log('Replaced PROJECTS with enriched structural version and accessor functions');
} else {
    console.log('oldProjectsStr not matched');
}

fs.writeFileSync('scratch/test_index.html', content);
console.log('Wrote scratch/test_index.html');
