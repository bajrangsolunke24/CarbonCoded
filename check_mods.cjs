const fs = require('fs');
const path = require('path');

function getModifiedFiles(dir, maxAgeMs) {
    let results = [];
    const now = Date.now();
    
    // Ignore node_modules completely
    if (dir.includes('node_modules') || dir.includes('.git')) return results;
    
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.resolve(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getModifiedFiles(fullPath, maxAgeMs));
        } else {
            if (now - stat.mtimeMs < maxAgeMs) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const modified = getModifiedFiles('.', 10 * 60 * 1000);
console.log(modified.join('\n'));
