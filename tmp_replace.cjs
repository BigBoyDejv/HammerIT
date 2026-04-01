const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx')) {
               results.push(file);
            }
        }
    });
    return results;
}

const pagesDir = path.join(__dirname, 'src', 'pages');
if (!fs.existsSync(pagesDir)) {
    console.log("Pages dir not found: " + pagesDir);
    process.exit(1);
}

const files = walk(pagesDir);

let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Broad regex to catch spinners: <div className="...animate-spin...h-12 w-12...">...</div> or <div ... />
    // Also matching h-8 w-8 if they exist, but mostly h-12 w-12 are used in pages
    const spinnerRegex = /<div\s+className="[^"]*animate-spin[^"]*(?:h-\d+\s+w-\d+|w-\d+\s+h-\d+)[^"]*"\s*(?:>\s*<\/div>|\/>)/g;
    
    if (spinnerRegex.test(content)) {
        let importStatement = "import { LoadingSpinner } from '../components/LoadingSpinner';\n";
        
        // Count directory depth to calculate relative import path correctly
        const relativePath = path.relative(pagesDir, file);
        const depth = relativePath.split(path.sep).length - 1;
        
        if (depth > 0) {
            importStatement = `import { LoadingSpinner } from '${'../'.repeat(depth + 1)}components/LoadingSpinner';\n`;
        }
        
        if (!content.includes('LoadingSpinner')) {
            // Find last import
            const lastImportRegex = /import.*?;?\n/g;
            let match;
            let lastIndex = 0;
            while ((match = lastImportRegex.exec(content)) !== null) {
                lastIndex = lastImportRegex.lastIndex;
            }
            if (lastIndex > 0) {
                content = content.slice(0, lastIndex) + importStatement + content.slice(lastIndex);
            } else {
                content = importStatement + content;
            }
        }
        
        content = content.replace(spinnerRegex, '<LoadingSpinner />');
        
        fs.writeFileSync(file, content);
        modifiedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Modified ${modifiedCount} files.`);
