const fs = require('fs');
let s = fs.readFileSync('index.html', 'utf8');

const adminViewStart = s.indexOf('<div class="view" id="view-admin-config">');
const dashGridIdx = s.indexOf('<div class="dash-grid">', adminViewStart);
const gpsModalIdx = s.indexOf('<!-- GPS MODAL -->');

// Find the canvas 'geofenceRadarCanvas'
const canvasIdx = s.indexOf('geofenceRadarCanvas', dashGridIdx);
console.log('canvasIdx:', canvasIdx);

// Find the </div> that closes the card, and the </div> that closes the dash-grid
// Let's print out the text between canvasIdx and gpsModalIdx
console.log(s.slice(canvasIdx, gpsModalIdx));
