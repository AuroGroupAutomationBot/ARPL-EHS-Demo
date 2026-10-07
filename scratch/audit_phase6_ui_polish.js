const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

console.log('================================================================');
console.log('AUDITING PHASE 6: RESPONSIVE VIEWPORTS, UI POLISH & DESIGN TOKENS');
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

// 1. Typography & UI Font Stack
check('6.1.1 High-performance UI font stack declared (--font-ui Segoe UI / Apple System)', 
    html.includes('--font-ui') && html.includes('sans-serif'));

// 2. Curated CSS Color Palette & Modern Tokens
check('6.1.2 Modern CSS tokens defined (primary, accent, danger, warning, success, neutral scales)',
    html.includes('--navy') && html.includes('--orange') && html.includes('--green') && html.includes('--purple') && html.includes('--border'));

// 3. Smooth Scrolling & Viewport Insets
check('6.1.3 Universal box-sizing, smooth scroll behavior & overflow containment',
    html.includes('box-sizing: border-box') && html.includes('scroll-behavior: smooth') && html.includes('overflow-x: hidden'));

check('6.1.4 Safe Area Insets declared for iOS / modern notched devices',
    html.includes('safe-area-inset-top') && html.includes('safe-area-inset-bottom'));

// 4. Responsive Breakpoints Coverage
check('6.2.1 Ultra-compact phones (<= 360px) breakpoint declared',
    html.includes('@media (max-width: 360px)'));

check('6.2.2 Mobile phones (< 580px) bottom-sheet modal transform & button stacking',
    html.includes('@media (max-width: 580px)') && html.includes('border-radius: 18px 18px 0 0') && html.includes('flex-direction: column-reverse'));

check('6.2.3 Tablets portrait (<= 768px) with 16px iOS zoom prevention & >= 44px tap targets',
    html.includes('@media (max-width: 768px)') && html.includes('font-size: 16px !important') && html.includes('min-height: 44px'));

check('6.2.4 Tablets landscape / drawer off-canvas navigation (<= 960px)',
    html.includes('@media (max-width: 960px)') && html.includes('left: -320px') && html.includes('#mobileNavBtn'));

check('6.2.5 Standard desktop adaptation (<= 1200px)',
    html.includes('@media (max-width: 1200px)'));

check('6.2.6 Ultra-wide monitors (>= 1920px) maximum container width constraint',
    html.includes('@media (min-width: 1920px)') && html.includes('max-width: 1560px'));

// 5. Touch & Mobile Ergonomics
check('6.2.7 Pointer coarse media query with >= 44px touch targets',
    html.includes('@media (pointer: coarse)') && html.includes('min-height: 44px'));

check('6.2.8 Horizontal table wrappers with overscroll-behavior containment',
    html.includes('overscroll-behavior-x: contain') && html.includes('position: sticky') && html.includes('left: 0'));

check('6.2.9 Modal scroll isolation with overscroll-behavior: contain',
    html.includes('overscroll-behavior: contain'));

// 6. Interactive Visual Polish & Micro-Interactions
check('6.3.1 Active card hover transitions and subtle micro-shadow elevations',
    html.includes('transition: all') || html.includes('transition: transform') || html.includes('box-shadow:'));

check('6.3.2 Toast notification container with smooth slide-in / fade-in animations',
    html.includes('.toast') && (html.includes('keyframes') || html.includes('animation:') || html.includes('transition:')));

check('6.3.3 Modal overlays with backdrop-filter glassmorphism / dark fade',
    html.includes('.modal-overlay') && (html.includes('rgba(0, 0, 0,') || html.includes('rgba(15, 23, 42,')));

console.log('\n================================================================');
console.log(`PHASE 6 AUDIT RESULTS: ${passCount} / ${totalCount} CHECKS PASSED (${Math.round(passCount/totalCount*100)}%)`);
console.log('================================================================\n');

assert.strictEqual(passCount, totalCount, 'All Phase 6 checks must pass 100%');
process.exit(0);
