const fs = require('fs');

const filePath = '/app/src/components/WellnessZone.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const oldFunc = `const handleExportWellness = () => {
    const csv = ['Tarih,Mood,Enerji,UykuSaat,SuBardak,Not,Aliskanliklar']
      .concat(nodes.filter(n => n.parentId === null).map(n => [
        n.fieldValues['/attributes/@wdate'] || n.fieldValues['/attributes/@edate'] || '',
        n.fieldValues['/attributes/@wmood'] || '',
        n.fieldValues['/attributes/@wenrg'] || '',
        n.fieldValues['/attributes/@wslep'] || '',
        n.fieldValues['/attributes/@wwatr'] || '',
        String(n.fieldValues['/attributes/@wnote'] || '').replace(/\\"/g, '""'),
        String(n.fieldValues['/attributes/@whabi'] || '').replace(/\\"/g, '""'),
      ].map(v => \`"\\${v}"\`).join(',')))
      .join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`wellness-\${new Date().toISOString().slice(0,10)}.csv\`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV indirildi');
  };`;

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
  };`;

if (content.includes(oldFunc)) {
    const newContent = content.replace(oldFunc, newFunc);
    fs.writeFileSync(filePath, newContent);
    console.log('Fixed!');
} else {
    console.log('Old function not found. Searching for handleExportWellness...');
    const idx = content.indexOf('handleExportWellness');
    if (idx >= 0) {
        console.log('Found at index:', idx);
        console.log('Context:', content.substring(idx, idx + 500));
    }
}