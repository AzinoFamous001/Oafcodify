const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/Pages', function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('overflow-hidden') && content.includes('<main')) {
      // Replace overflow-hidden with overflow-x-hidden only if it's on the main tag's className
      const updated = content.replace(/(<main[^>]*className="[^"]*)overflow-hidden([^"]*">)/g, '$1overflow-x-hidden$2');
      if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf8');
        console.log('Fixed:', filePath);
      }
    }
  }
});
