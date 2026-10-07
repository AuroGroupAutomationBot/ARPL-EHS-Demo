const fs = require('fs');

const orig = fs.readFileSync('index.html', 'utf8');

console.log('Original index.html length:', orig.length);

// 1. Check APP_CONFIG insertion point
const sundayWorkEnd = orig.indexOf('badgeText: \'Saturday Preparation Surface\'\n            },');
console.log('sundayWorkEnd found:', sundayWorkEnd !== -1);

// 2. Check PROJECTS definition point
const projectsDecl = orig.indexOf('let PROJECTS = [');
console.log('projectsDecl found:', projectsDecl !== -1);

// 3. Check STAGE1_MS definition point
const stage1Decl = orig.indexOf('const STAGE1_MS = 45 * 1000;');
console.log('stage1Decl found:', stage1Decl !== -1);

// 4. Check view-admin-config
const adminConfigDecl = orig.indexOf('<div class="view" id="view-admin-config">');
console.log('adminConfigDecl found:', adminConfigDecl !== -1);

// 5. Check renderUniversalOrgAndLocationHtml
const univOrgDecl = orig.indexOf('function renderUniversalOrgAndLocationHtml(disAttr) {');
console.log('univOrgDecl found:', univOrgDecl !== -1);

// 6. Check saveState and loadState
const saveStateDecl = orig.indexOf('function saveState() {');
console.log('saveStateDecl found:', saveStateDecl !== -1);
