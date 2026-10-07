const fs = require('fs');
const path = require('path');

let src = fs.readFileSync('index.html', 'utf8');

// Build the lifting and nightshift seed permits code
const seedAdditionCode = `
            function baseLifting(over) {
                const qList = (typeof CHECKLIST_ITEMS_LIFTING !== 'undefined') ? CHECKLIST_ITEMS_LIFTING : [];
                const res = Object.assign({
                    id: genPermitNumber('lifting'), ptype: 'lifting', activity: 'Lifting Operations (PTW-009A)', createdBy: 'Vikram Singh (Lifting Supervisor)',
                    createdByRole: 'lift-supervisor',
                    weather: 'Clear (Wind: 14 km/h)', organization: 'ARPL', contractor: 'Apex Heavy Lift Ltd',
                    liftingEquipmentType: 'Tower Crane',
                    liftingClassification: 'routine',
                    loadDescription: 'Palletized Tiles & Ducting Shifting to Floor 8',
                    loadWeight: 3.5,
                    craneSwl: 10.0,
                    slingSwl: 5.0,
                    loadDimX: 2.5, loadDimY: 1.8, loadDimZ: 1.5,
                    slingLength: 5.0, slingApexHeight: 4.0,
                    riggingNumSlings: 2, slingsCount: '2', slingsAdjustable: 'yes',
                    riggingSlingAngle: 60, riggingStressPercent: 46,
                    craneOperatorName: 'Rajesh Sharma', riggerName: 'Sunil Kumar',
                    liftingDocs: ['P&M Green Card Sticker', 'Lift Permit'],
                    locationStructure: 'Tower',
                    tower: 'Tower A',
                    locFloor: 'Floor 8',
                    locUnit: 'Drop Zone 2',
                    location: 'Tower A - Floor 8 - Drop Zone 2',
                    startTime: '09:00',
                    numWorkers: 4,
                    checklist: qList.map((q, i) => ({ q, ans: 'yes', comment: 'Inspected & verified', photo: null, gps: null })),
                    sitePhoto: 'demo',
                    drawing: null,
                    activityLog: [], surrenderEscalations: 0
                }, over);
                if (res.gps) {
                    res.gps = Object.assign({ within: true, distance: 12, radius: 150 }, res.gps);
                }
                return res;
            }

            // 1. Active PTW-009A Routine Lifting Operation
            PERMITS.push(baseLifting({
                project: site1.name, tower: 'Tower A',
                createdAt: new Date(nowTime() - 3 * 3600 * 1000), submittedAt: new Date(nowTime() - 3 * 3600 * 1000),
                validTill: new Date(nowTime().getTime() + 5 * 3600 * 1000),
                status: 'Active', activatedAt: new Date(nowTime() - 2 * 3600 * 1000), stageEnteredAt: new Date(nowTime() - 2 * 3600 * 1000), escalation: { stage1: false, stage2: false },
                siteEngineerAck: { acknowledged: true, at: new Date(nowTime() - 2.8 * 3600 * 1000), by: 'Duty Site Engineer' },
                approvals: {
                    kind: 'lifting-routine',
                    pm: mkApproved('Duty P&M Engineer', 160),
                    sectionHead: mkApproved('Tower Incharge', 140),
                    ehsManager: mkApproved('EHS Safety Manager', 120),
                    ehsOfficer: mkPending()
                },
                activityLog: [
                    { ts: new Date(nowTime() - 2 * 3600 * 1000), actor: 'EHS Safety Manager', text: 'Routine Lifting permit ENDORSED and activated for crane operations.' },
                    { ts: new Date(nowTime() - 2.3 * 3600 * 1000), actor: 'Tower Incharge', text: 'Tower Incharge verified barricades and cleared swing radius.' },
                    { ts: new Date(nowTime() - 2.6 * 3600 * 1000), actor: 'Duty P&M Engineer', text: 'P&M Engineer verified crane certificate & rigging fitness.' },
                    { ts: new Date(nowTime() - 2.8 * 3600 * 1000), actor: 'Duty Site Engineer', text: 'Site Engineer acknowledged lifting permit on site.' },
                    { ts: new Date(nowTime() - 3 * 3600 * 1000), actor: 'Vikram Singh (Lifting Supervisor)', text: 'Routine lifting permit submitted with operator & rigger sign-offs.' }
                ],
                extension: null, closure: null, surrender: null
            }));

            // 2. Pending Project Manager PTW-009B Critical Lift Plan
            PERMITS.push(baseLifting({
                id: genPermitNumber('liftplan'),
                ptype: 'liftplan',
                activity: 'Critical Lift Plan (PTW-009B)',
                liftingClassification: 'critical',
                loadDescription: 'Heavy Chiller Unit 11.5 MT Shifting to Terrace',
                loadWeight: 11.5,
                craneSwl: 25.0,
                slingSwl: 15.0,
                liftingTandemLift: true,
                liftingEquipmentType: 'Crawler Crane',
                project: site2.name, tower: 'Tower B', locFloor: 'Terrace',
                location: 'Tower B - Terrace - Central Plant Room',
                createdAt: new Date(nowTime() - 60 * 60000), submittedAt: new Date(nowTime() - 60 * 60000),
                validTill: new Date(nowTime().getTime() + 6 * 3600 * 1000),
                status: 'Pending Project Manager Acknowledgment', stageEnteredAt: new Date(nowTime() - 15 * 60000), escalation: { stage1: false, stage2: false },
                siteEngineerAck: { acknowledged: true, at: new Date(nowTime() - 45 * 60000), by: 'Duty Site Engineer' },
                approvals: {
                    kind: 'lifting-critical',
                    pm: mkApproved('Duty P&M Engineer', 35),
                    sectionHead: mkApproved('Tower Incharge', 20),
                    projectManager: mkPending(),
                    ehsManager: mkPending(),
                    ehsOfficer: mkPending()
                },
                activityLog: [
                    { ts: new Date(nowTime() - 20 * 60000), actor: 'Tower Incharge', text: 'Tower Incharge reviewed heavy lift rigging and approved.' },
                    { ts: new Date(nowTime() - 35 * 60000), actor: 'Duty P&M Engineer', text: 'P&M Engineer inspected dual crane tandem configuration and approved.' },
                    { ts: new Date(nowTime() - 45 * 60000), actor: 'Duty Site Engineer', text: 'Site Engineer physically inspected drop zone.' },
                    { ts: new Date(nowTime() - 60 * 60000), actor: 'Vikram Singh (Lifting Supervisor)', text: 'Critical Lift Plan submitted with engineering calculations.' }
                ],
                extension: null, closure: null, surrender: null
            }));

            function baseNightShift(over) {
                const qList = (typeof NIGHTSHIFT_CHECKLIST_ITEMS !== 'undefined') ? NIGHTSHIFT_CHECKLIST_ITEMS : [];
                const res = Object.assign({
                    id: genPermitNumber('nightshift'), ptype: 'nightshift', activity: 'Night Shift / Holiday Work (PTW-010)', createdBy: 'Day Site Supervisor',
                    createdByRole: 'site-supervisor',
                    weather: 'Clear Night', organization: 'ARPL', contractor: 'Apex Infra Ltd',
                    nightWorkType: 'hotwork',
                    nightSupervisorName: 'Venkatesh Rao', nightSupervisorPhone: '+91 98765 43210',
                    locationStructure: 'Tower',
                    tower: 'Tower A', locFloor: 'Basement 1', locUnit: 'Zone B Plumbing Core',
                    location: 'Tower A - Basement 1 - Zone B Plumbing Core',
                    startTime: '20:30',
                    numWorkers: 5,
                    checklist: qList.map((q, i) => ({ q, ans: 'yes', comment: 'Night precautions verified', photo: null, gps: null })),
                    sitePhoto: 'demo',
                    drawing: null,
                    activityLog: [], surrenderEscalations: 0
                }, over);
                if (res.gps) {
                    res.gps = Object.assign({ within: true, distance: 10, radius: 150 }, res.gps);
                }
                return res;
            }

            // 3. Approved – Pending Night Handover PTW-010 Night Shift Permit
            PERMITS.push(baseNightShift({
                project: site1.name, tower: 'Tower A',
                createdAt: new Date(nowTime() - 2 * 3600 * 1000), submittedAt: new Date(nowTime() - 2 * 3600 * 1000),
                validTill: new Date(nowTime().getTime() + 8 * 3600 * 1000),
                status: 'Approved – Pending Night Handover', stageEnteredAt: new Date(nowTime() - 30 * 60000), escalation: { stage1: false, stage2: false },
                siteEngineerAck: { acknowledged: true, at: new Date(nowTime() - 75 * 60000), by: 'Duty Site Engineer' },
                approvals: {
                    kind: 'nightshift',
                    sectionHead: mkApproved('Tower Incharge', 40),
                    nightHandover: mkPending(),
                    pmNight: mkPending(),
                    ehsManager: mkPending(),
                    ehsOfficer: mkPending()
                },
                activityLog: [
                    { ts: new Date(nowTime() - 40 * 60000), actor: 'Tower Incharge', text: 'Daytime Section Head review approved for night work schedule.' },
                    { ts: new Date(nowTime() - 75 * 60000), actor: 'Duty Site Engineer', text: 'Site Engineer acknowledged night work pre-fill.' },
                    { ts: new Date(nowTime() - 120 * 60000), actor: 'Day Site Supervisor', text: 'Night Shift Day Pre-Fill submitted for daytime approvals.' }
                ],
                extension: null, closure: null, surrender: null
            }));
`;

// Test inserting before line 11496: `}` of seedPermits
const target = "            // 2. Pending Site Electrical Permit (Pending MEP or P&M Approval)\n            PERMITS.push(baseElectrical({";
console.log('Target found in index.html:', src.includes(target));
