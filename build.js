const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views'); 
const outputDir = path.join(__dirname, 'public'); 

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdir(viewsDir, (err, files) => {
  if (err) throw err;

  files.forEach(file => {
    if (path.extname(file) === '.ejs') {
      const filePath = path.join(viewsDir, file);
      const outputPath = path.join(outputDir, path.basename(file, '.ejs') + '.html');

      ejs.renderFile(filePath, {}, (err, str) => {
        if (err) throw err;
        fs.writeFile(outputPath, str, (err) => {
          if (err) throw err;
          console.log(`Converted ${file} to HTML`);
        });
      });
    }
  });
});