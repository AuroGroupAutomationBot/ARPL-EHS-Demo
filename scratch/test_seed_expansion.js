const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync('index.html', 'utf8');

// Check what functions exist for nightshift checklist
const hasNightList = src.includes('NIGHTSHIFT_CHECKLIST_ITEMS');
const hasLiftList = src.includes('CHECKLIST_ITEMS_LIFTING');
console.log('NIGHTSHIFT_CHECKLIST_ITEMS exists:', hasNightList);
console.log('CHECKLIST_ITEMS_LIFTING exists:', hasLiftList);
