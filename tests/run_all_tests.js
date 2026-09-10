/**
 * Master Test Runner for ARPL EHS Permit-to-Work System
 * Runs all System Architecture suites + all 7 Dedicated Permit Work Type suites (PT-01 to PT-07)
 */

const { execSync } = require('child_process');
const path = require('path');

const suites = [
    { num: 1, name: 'BASE LIFECYCLE & ENGINE TESTS', file: 'run_full_test_suite.js' },
    { num: 2, name: 'EXTENDED AUDIT TESTS (NOTIFS, ESCALATION, PDF, KPIS, FILTERS)', file: 'run_extended_audit_tests.js' },
    { num: 3, name: 'UI & PDF SECTION HEAD LABEL RESOLUTION TESTS', file: 'test_tracker_labels.js' },
    { num: 4, name: 'APPLICATION-WIDE NAVIGATION & CONSISTENCY TESTS', file: 'test_navigation_application_wide.js' },
    { num: 5, name: 'RESPONSIVE DESIGN & CROSS-DEVICE ERGONOMICS', file: 'test_responsive_viewports.js' },
    { num: 6, name: 'LOCATION SELECTION MODE & SAFETY RESTRICTION MATRIX', file: 'test_location_selection_mode.js' },
    { num: 7, name: 'UNIVERSAL INITIATOR ARCHITECTURE & FORM ACTIVATION COMPLIANCE', file: 'test_initiator_pages_and_form_activation.js' },
    { num: 8, name: 'PERMIT REGISTER COMMON HEADING, ACTORS & APPROVAL-FLOW VISIBILITY', file: 'test_register_actors_and_visibility.js' },
    { num: 9, name: 'PT-01 EXCAVATION WORK (FORM EHS_PTW_001) SPECIFICATION & COMPLIANCE', file: 'test_pt01_excavation.js' },
    { num: 10, name: 'PT-02 HOT WORK (FORM EHS_PTW_002) SPECIFICATION & COMPLIANCE', file: 'test_pt02_hot_work.js' },
    { num: 11, name: 'PT-03 GUARD RAIL (FORM EHS_PTW_003) SPECIFICATION & COMPLIANCE', file: 'test_pt03_guard_rail.js' },
    { num: 12, name: 'PT-04 CONFINED SPACE ENTRY (FORM EHS_PTW_004) SPECIFICATION & COMPLIANCE', file: 'test_pt04_confined_space.js' },
    { num: 13, name: 'PT-05 SHAFT WORK (FORM EHS_PTW_005) SPECIFICATION & COMPLIANCE', file: 'test_pt05_shaft_work.js' },
    { num: 14, name: 'PT-06 ELECTRICAL WORK (FORM EHS_PTW_006) SPECIFICATION & COMPLIANCE', file: 'test_pt06_electrical_work.js' },
    { num: 15, name: 'PT-07 DRILLING & BLASTING (FORM EHS_PTW_007) SPECIFICATION & COMPLIANCE', file: 'test_pt07_drilling_blasting.js' }
];

console.log('================================================================');
console.log('STARTING MASTER TEST SUITE EXECUTION (ALL 15 SUITES)');
console.log('================================================================');

let passedCount = 0;

for (const suite of suites) {
    const scriptPath = path.join(__dirname, suite.file);
    try {
        console.log(`\n>>> RUNNING TEST SUITE ${suite.num}: ${suite.name}`);
        execSync(`node "${scriptPath}"`, { encoding: 'utf8', stdio: 'inherit' });
        passedCount++;
    } catch (e) {
        console.error(`\n❌ FAILED IN SUITE ${suite.num}: ${suite.name}`);
        process.exit(1);
    }
}

console.log('\n================================================================');
console.log(`MASTER TEST SUITE SUMMARY: ALL ${passedCount} / ${suites.length} SUITES PASSED CLEANLY (100% PASS RATE)`);
console.log('ALL 7 PERMIT WORK TYPES (PT-01 TO PT-07) FULLY VALIDATED');
console.log('================================================================');
