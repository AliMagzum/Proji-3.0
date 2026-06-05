const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace PageBackButton and the title right after it.
// Many patterns:
// <PageBackButton destination={prevView} />
// <h2 className="...">{something}</h2>
// Or wrapped in divs.
const regex = /<div className="flex items-center(?:[^"]*)">\s*<PageBackButton[^>]*\/>\s*(?:<div[^>]*>)?\s*<h2[^>]*>.*?<\/h2>\s*(?:<\/div>)?\s*<\/div>/gs;

content = content.replace(regex, '');

fs.writeFileSync('src/App.tsx', content);
console.log('Done');
