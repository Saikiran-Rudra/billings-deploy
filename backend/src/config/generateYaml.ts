import fs from "fs";
import YAML from "yaml";
import swaggerSpec from "./swagger.js"; 

// Convert JSON → YAML
const yamlData = YAML.stringify(swaggerSpec);

// Save file
fs.writeFileSync("swagger.yaml", yamlData);

console.log("✅ swagger.yaml generated successfully!");