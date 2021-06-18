const fs = require('fs');

const buildDir = __dirname + '/../dist';
for (const file of fs.readdirSync(buildDir)) {
  const path = buildDir + '/' + file;
  const stats = fs.lstatSync(path);
  if (stats.isFile()) {
    fs.unlinkSync(path);
  } else {
    fs.rmdirSync(path, { recursive: true });
  }
}
