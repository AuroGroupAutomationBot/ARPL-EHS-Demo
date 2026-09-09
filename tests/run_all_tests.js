/**
 * Master Test Runner for ARPL EHS Permit-to-Work System
 * Runs Base Lifecycle Test Suite + Extended Audit Test Suite
 */

const { execSync } = require('child_process');
const path = require('path');

const script1 = path.join(__dirname, 'run_full_test_suite.js');
const script2 = path.join(__dirname, 'run_extended_audit_tests.js');

console.log('================================================================');
console.log('STARTING MASTER TEST SUITE EXECUTION');
console.log('================================================================');

try {
    console.log('\n>>> RUNNING TEST SUITE 1: BASE LIFECYCLE & ENGINE TESTS');
    const out1 = execSync(`node "${script1}"`, { encoding: 'utf8', stdio: 'inherit' });
} catch (e) {
    console.error('FAILED IN SUITE 1');
    process.exit(1);
}

try {
    console.log('\n>>> RUNNING TEST SUITE 2: EXTENDED AUDIT TESTS (NOTIFS, ESCALATION, PDF, KPIS, FILTERS)');
    const out2 = execSync(`node "${script2}"`, { encoding: 'utf8', stdio: 'inherit' });
} catch (e) {
    console.error('FAILED IN SUITE 2');
    process.exit(1);
}

const script3 = path.join(__dirname, 'test_tracker_labels.js');

try {
    console.log('\n>>> RUNNING TEST SUITE 3: UI & PDF SECTION HEAD LABEL RESOLUTION TESTS');
    const out3 = execSync(`node "${script3}"`, { encoding: 'utf8', stdio: 'inherit' });
} catch (e) {
    console.error('FAILED IN SUITE 3');
    process.exit(1);
}

const script4 = path.join(__dirname, 'test_navigation_application_wide.js');

try {
    console.log('\n>>> RUNNING TEST SUITE 4: APPLICATION-WIDE NAVIGATION & CONSISTENCY TESTS');
    const out4 = execSync(`node "${script4}"`, { encoding: 'utf8', stdio: 'inherit' });
} catch (e) {
    console.error('FAILED IN SUITE 4');
    process.exit(1);
}

const script5 = path.join(__dirname, 'test_responsive_viewports.js');

try {
    console.log('\n>>> RUNNING TEST SUITE 5: RESPONSIVE DESIGN & CROSS-DEVICE ERGONOMICS');
    const out5 = execSync(`node "${script5}"`, { encoding: 'utf8', stdio: 'inherit' });
} catch (e) {
    console.error('FAILED IN SUITE 5');
    process.exit(1);
}

const script6 = path.join(__dirname, 'test_location_selection_mode.js');

try {
    console.log('\n>>> RUNNING TEST SUITE 6: LOCATION SELECTION MODE & SAFETY RESTRICTION MATRIX');
    const out6 = execSync(`node "${script6}"`, { encoding: 'utf8', stdio: 'inherit' });
} catch (e) {
    console.error('FAILED IN SUITE 6');
    process.exit(1);
}

const script7 = path.join(__dirname, 'test_pt07_drilling_blasting.js');

try {
    console.log('\n>>> RUNNING TEST SUITE 7: PT-07 DRILLING & BLASTING SPECIFICATION & COMPLIANCE');
    const out7 = execSync(`node "${script7}"`, { encoding: 'utf8', stdio: 'inherit' });
} catch (e) {
    console.error('FAILED IN SUITE 7');
    process.exit(1);
}

const script8 = path.join(__dirname, 'test_pt06_electrical_work.js');

try {
    console.log('\n>>> RUNNING TEST SUITE 8: PT-06 ELECTRICAL WORK (HT / LT) SPECIFICATION & COMPLIANCE');
    const out8 = execSync(`node "${script8}"`, { encoding: 'utf8', stdio: 'inherit' });
} catch (e) {
    console.error('FAILED IN SUITE 8');
    process.exit(1);
}

console.log('\n================================================================');
console.log('MASTER TEST SUITE SUMMARY: ALL 8 SUITES PASSED CLEANLY (100% PASS RATE)');
console.log('================================================================');
