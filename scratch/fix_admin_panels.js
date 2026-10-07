const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Find start and end of view-admin-config
const adminViewStart = content.indexOf('<div class="view" id="view-admin-config">');
console.log('adminViewStart:', adminViewStart);

// The end of this view is before <!-- GPS MODAL --> or before the next view / modal
const gpsModalIdx = content.indexOf('<!-- GPS MODAL -->');
console.log('gpsModalIdx:', gpsModalIdx);

// Look at the portion between adminViewStart and gpsModalIdx
const adminSection = content.slice(adminViewStart, gpsModalIdx);
console.log('adminSection length:', adminSection.length);

// In that section, find '<div class="dash-grid">'
const dashGridIdx = content.indexOf('<div class="dash-grid">', adminViewStart);
console.log('dashGridIdx:', dashGridIdx);

// Find where view-admin-config ends: it's the last </div> before <!-- GPS MODAL -->
// Let's inspect the last 200 chars before gpsModalIdx
console.log('Snippet before gpsModalIdx:', JSON.stringify(content.slice(gpsModalIdx - 200, gpsModalIdx)));
