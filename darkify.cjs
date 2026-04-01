const fs = require('fs');
const file = 'src/pages/CraftsmanProfilePage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Be careful, only match full class names
content = content.replace(/bg-white([^/])/g, 'bg-white dark:bg-gray-800$1');
content = content.replace(/border-gray-100/g, 'border-gray-100 dark:border-gray-700');
content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-white');
content = content.replace(/text-gray-600/g, 'text-gray-600 dark:text-gray-400');
content = content.replace(/bg-gray-100(?!0)/g, 'bg-gray-100 dark:bg-gray-700');
content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
content = content.replace(/text-gray-700(?!0)/g, 'text-gray-700 dark:text-gray-300');
content = content.replace(/bg-gray-200/g, 'bg-gray-200 dark:bg-gray-700');
content = content.replace(/text-gray-300/g, 'text-gray-300 dark:text-gray-600');
content = content.replace(/"btn-outline"/g, '"btn-outline dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500"');
content = content.replace(/bg-green-100/g, 'bg-green-100 dark:bg-green-900/30');
content = content.replace(/text-green-800/g, 'text-green-800 dark:text-green-400');

fs.writeFileSync(file, content);
console.log('Craftsman profile updated');
