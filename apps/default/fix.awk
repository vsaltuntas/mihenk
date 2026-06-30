NR==167 {print "  const handleExportWellness = () => {"}
NR==168 {print "    const csv = ["}
NR==169 {print "      '\''Tarih,Mood,Enerji,UykuSaat,SuBardak,Not,Aliskanliklar'\'',"}
NR==170 {print "      ...nodes.filter(n => n.parentId === null).map(n => ["}
NR==171 {print "        n.fieldValues['\''/attributes/@wdate'\''] || n.fieldValues['\''/attributes/@edate'\''] || '\'\',"}
NR==172 {print "        n.fieldValues['\''/attributes/@wmood'\''] || '\'\',"}
NR==173 {print "        n.fieldValues['\''/attributes/@wenrg'\''] || '\'\',"}
NR==174 {print "        n.fieldValues['\''/attributes/@wslep'\''] || '\'\',"}
NR==175 {print "        n.fieldValues['\''/attributes/@wwatr'\''] || '\'\',"}
NR==176 {print "        String(n.fieldValues['\''/attributes/@wnote'\''] || '\'\').replace(/\"/g, '\''\"\"'\''),"}
NR==177 {print "        String(n.fieldValues['\''/attributes/@whabi'\''] || '\'\').replace(/\"/g, '\''\"\"'\''),"}
NR==178 {print "      ].map(v => '\'\"\${v}\"'''').join(','))"}
NR==179 {print "    ].join('\n');"}
NR==180 {print "    const blob = new Blob([csv], { type: '\''text/csv;charset=utf-8'\'' });"}
NR==181 {print "    const url = URL.createObjectURL(blob);"}
NR==182 {print "    const a = document.createElement('\''a'\'');"}
NR==183 {print "    a.href = url;"}
NR==184 {print "    a.download = '\''wellness-'\'' + new Date().toISOString().slice(0,10) + '\'' .csv'\'';'"}
NR==185 {print "    a.click();"}
NR==186 {print "    URL.revokeObjectURL(url);"}
NR==187 {print "    toast.success('\''CSV indirildi'\'');"}
NR==188 {print "  };"}
NR<167 || NR>188 {print}
