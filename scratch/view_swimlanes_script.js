const fs = require('fs');
const s = fs.readFileSync('ptw_swimlanes.html', 'utf8');
const scriptMatch = s.match(/<script(?![^>]*src=)[\s\S]*?>([\s\S]*?)<\/script>/i);
if (scriptMatch) {
    console.log(scriptMatch[1]);
}
