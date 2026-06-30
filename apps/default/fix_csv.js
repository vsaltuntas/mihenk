const fs = require('fs');

const filePath = '/app/src/components/WellnessZone.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the function
const startMarker = 'const handleExportWellness = () => {';
const startIdx = content.indexOf(startMarker);

if (startIdx === -1) {
    console.error('Function not found');
    process.exit(1);
}

// Find the end of the function (next function or double newline with const)
let endIdx = content.indexOf('\n\n  const today =', startIdx);
if (endIdx === -1) {
    endIdx = content.indexOf('\n\n  // Daily wellness', startIdx);
}
if (endIdx === -1) {
    console.error('End of function not found');
    process.exit(1);
}

// Include the newline after the function
endIdx += 2;

const oldFunc = content.substring(startIdx, endIdx);
console.log('Found function, length:', oldFunc.length);
console.log('Preview:', oldFunc.substring(0, 100));

const newFunc = `const handleExportWellness = () => {
    const csv = [
      'Tarih,Mood,Enerji,UykuSaat,SuBardak,Not,Aliskanliklar',
      ...nodes.filter(n => n.parentId === null).map(n => [
        n.fieldValues['/attributes/@wdate'] || n.fieldValues['/attributes/@edate'] || '',
        n.fieldValues['/attributes/@wmood'] || '',
        n.fieldValues['/attributes/@wenrg'] || '',
        n.fieldValues['/attributes/@wslep'] || '',
        n.fieldValues['/attributes/@wwatr'] || '',
        String(n.fieldValues['/attributes/@wnote'] || '').replace(/"/g, '""'),
        String(n.fieldValues['/attributes/@whabi'] || '').replace(/"/g, '""'),
      ].map(v => \`"\${v}"\`).join(','))
    ].join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`wellness-\${new Date().toISOString().slice(0,10)}.csv\`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV indirildi');
  };\n\n`;

const newContent = content.substring(0, startIdx) + newFunc + content.substring(endIdx);
fs.writeFileSync(filePath, newContent);
console.log('Fixed!');
