const notes = {};

for (let key in fileNoObj) {
  notes[key] = new Audio('../audio/' + fileNoObj[key] + '.wav');
}
