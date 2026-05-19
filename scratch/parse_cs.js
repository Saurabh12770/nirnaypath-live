const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../generate_cs_final.js'), 'utf8');

const regex = /topic:\s*["']([^"']+)["'],\s*name:\s*["']([^"']+)["']/g;
const concepts = [];
let match;
while ((match = regex.exec(content)) !== null) {
    concepts.push({ topic: match[1], name: match[2] });
}

console.log('Concepts Count:', concepts.length);
const topics = {};
concepts.forEach(c => {
    topics[c.topic] = (topics[c.topic] || 0) + 1;
});
console.log('Topics Summary:', JSON.stringify(topics, null, 2));
