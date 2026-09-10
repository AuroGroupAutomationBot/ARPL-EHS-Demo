/**
 * Master Test Runner for ARPL EHS Permit-to-Work System
 * Runs all System Architecture suites + all 7 Dedicated Permit Work Type suites (PTW-001 to PTW-007)
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
    { num: 9, name: 'PERMIT SUBMISSION FLOW & OPTIONAL DRAWING PLAN VERIFICATION', file: 'test_submission_drawing_flow.js' },
    { num: 10, name: 'PTW-001 EXCAVATION WORK (FORM PTW-001) SPECIFICATION & COMPLIANCE', file: 'test_pt01_excavation.js' },
    { num: 11, name: 'PTW-002 HOT WORK (FORM PTW-002) SPECIFICATION & COMPLIANCE', file: 'test_pt02_hot_work.js' },
    { num: 12, name: 'PTW-003 GUARD RAIL (FORM PTW-003) SPECIFICATION & COMPLIANCE', file: 'test_pt03_guard_rail.js' },
    { num: 13, name: 'PTW-004 CONFINED SPACE ENTRY (FORM PTW-004) SPECIFICATION & COMPLIANCE', file: 'test_pt04_confined_space.js' },
    { num: 14, name: 'PTW-005 SHAFT WORK (FORM PTW-005) SPECIFICATION & COMPLIANCE', file: 'test_pt05_shaft_work.js' },
    { num: 15, name: 'PTW-006 ELECTRICAL WORK (FORM PTW-006) SPECIFICATION & COMPLIANCE', file: 'test_pt06_electrical_work.js' },
    { num: 16, name: 'PTW-007 DRILLING & BLASTING (FORM PTW-007) SPECIFICATION & COMPLIANCE', file: 'test_pt07_drilling_blasting.js' },
    { num: 17, name: 'DIGITAL SIGNATURE PAD ENGINE & CROSS-PROCESS COMPLIANCE', file: 'test_digital_signature_pad.js' }
];

console.log('================================================================');
console.log(`STARTING MASTER TEST SUITE EXECUTION (ALL ${suites.length} SUITES)`);
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
console.log('ALL 7 PERMIT WORK TYPES (PTW-001 TO PTW-007) FULLY VALIDATED');
console.log('================================================================');
