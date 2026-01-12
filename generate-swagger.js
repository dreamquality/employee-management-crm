// Script to generate swagger.json file from swagger.js configuration
const fs = require('fs');
const path = require('path');
const { swaggerSpec } = require('./swagger');

const outputPath = path.join(__dirname, 'swagger.json');

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log(`Swagger specification generated at ${outputPath}`);
