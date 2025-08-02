// A simple script to parse CSV data from a file and generate YAML files.
//
// To use this script:
// 1. Save the code as a file, e.g., 'generate-yaml.js'.
// 2. Create a file named 'implementations_fixed.csv' in the same directory
//    and paste your CSV data into it.
// 3. You must install the required packages: 'npm install csv-parser js-yaml'.
// 4. Run the script with 'node generate-yaml.js'.
// 5. A new directory 'yaml' will be created with the generated files.

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const csv = require('csv-parser');

const names = {}
// The path to the input CSV file.
const inputCsvFile = 'implementations_fixed.csv';
const outputDir = '_implementations';

// Check if the CSV file exists.
if (!fs.existsSync(inputCsvFile)) {
  console.error(`Error: The file "${inputCsvFile}" was not found.`);
  process.exit(1);
}

// Create the output directory if it doesn't exist.
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

try {
  // Create a read stream from the CSV file and pipe it to csv-parser.
  fs.createReadStream(inputCsvFile, 'utf8')
    .pipe(csv({
      // We don't have a header, so we set headers to false and let the parser
      // use default numeric keys.
      headers: false
    }))
    .on('data', (row) => {
      // csv-parser returns an object with numeric keys, e.g., {'0': 'value', '1': 'value'}.
      const fields = Object.values(row);

      if (fields.length < 5) console.log("WTF!", fields)
      if (fields.length >= 5) {
        const [category, language, name, repo, description] = fields;

        // Normalize the filename: convert to lowercase, remove all special characters, and replace spaces with hyphens.
        const normalizedName = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        let fileName = normalizedName;

	if (names[fileName]) {
	  if (!names[fileName + "_2"]) fileName = fileName + "_2"
	  else if (!names[fileName + "_3"]) fileName = fileName + "_3"
        }

	names[fileName] = fileName
        // Create the YAML object, using the original description.
        // The js-yaml library will handle multi-line formatting automatically.
        const yamlObject = {
          name: name,
          category: category,
          language: language,
          repo: repo,
          purl: "",
          description: description,
        };

        // Convert the object to YAML format.
        const yamlContent = yaml.dump(yamlObject);

        // Write the YAML content to a new file.
        const filePath = path.join(outputDir, `${fileName}.yaml`);
        fs.writeFileSync(filePath, yamlContent, 'utf8');
        console.log(`Created file: ${filePath}`);
      } else {
        console.warn(`Skipping malformed row: ${JSON.stringify(row)}`);
      }
    })
    .on('end', () => {
      console.log('YAML file generation complete.');
    });
} catch (error) {
  console.error('An error occurred:', error);
}

