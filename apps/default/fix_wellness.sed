167,187c
  const handleExportWellness = () => {
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
      ].map(v => `"${v}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV indirildi');
  };
