const fs = require('fs');

let s = fs.readFileSync('index.html', 'utf8');

const targetStr = `id="inContractor" placeholder="Enter full contractor company / agency name..."`;
const targetIdx = s.indexOf(targetStr);
console.log('targetIdx:', targetIdx);

if (targetIdx !== -1) {
    // Replace the input with datalist-enabled input
    const oldField = `<input type="text" id="inContractor" placeholder="Enter full contractor company / agency name..." value="' + escapeHtml(draft.contractor || '') + '" oninput="draft.contractor=this.value;draft.welderContractor=this.value;validateWizStep(1)"' + disAttr + '><div class="form-error"><i class="fa-solid fa-circle-exclamation"></i> Contractor name is mandatory.</div></div>'`;
    
    const newField = `<input type="text" id="inContractor" list="contractorDatalist" placeholder="Select or enter contractor company / agency name..." value="' + escapeHtml(draft.contractor || '') + '" oninput="draft.contractor=this.value;draft.welderContractor=this.value;validateWizStep(1)"' + disAttr + '><datalist id="contractorDatalist">' + getProjectContractors(draft.project).map(c => '<option value="' + escapeHtml(c) + '"></option>').join('') + '</datalist><div class="form-hint" style="font-size:11px;color:var(--text-muted);margin-top:3px;"><i class="fa-solid fa-building-shield"></i> Choose from approved contractor registry or enter new agency.</div><div class="form-error"><i class="fa-solid fa-circle-exclamation"></i> Contractor name is mandatory.</div></div>'`;
    
    s = s.replace(oldField, newField);
    fs.writeFileSync('index.html', s);
    console.log('Successfully updated contractor input with datalist in index.html!');
} else {
    console.log('targetStr not found!');
}
