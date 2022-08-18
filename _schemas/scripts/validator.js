// Import the modules
const Ajv = require("ajv");
const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");
const readdirp = require("readdirp");
const npath = require("path");
const compareVersions = require("compare-versions");

// Define root dir
const rootDir = "./_schemas";

// Define object that will record the full path of all files tested
const files = {};

// Check for arguments
const verbose = process.argv.indexOf("-v") > -1;

// Main function
(async function () {
  // Define the exit code
  let exitCode = 0;

  try {
    // List all the available versions of the spec
    for await (const entry of readdirp(rootDir, { depth: 0, entryType: "directories" })) {
      const version = entry.path;
      if (isNaN(version)) {
        continue;
      }

      // For this version, ...
      console.log("");
      console.log("JSON:API spec version : %s", version);
      console.log("");

      // ... create ajv instance
      const ajv = ajvFactory(version);

      // ... add schemas
      await addSchemas(ajv, version);

      // ... prepare record object
      files[version] = new Array();

      // ... test all files
      const { ok, ko } = await handleTests(ajv, version);

      // ... log the results
      console.log("Tests done : %d, success : %d, errors : %d", ko.length + ok.length, ok.length, ko.length);
      if (ko.length != 0) {
        ko.forEach(item => {
          console.log("");
          console.log(item.relativePath + " should be " + (item.shouldBeValid ? "valid" : "invalid") + " but is not.");
          console.log("  spec version : " + item.version);
          console.log("  absolute path : " + item.fullPath);
          console.log("  errors : ");
          console.log(item.errors.map(err => "    " + err.instancePath + " : " + err.message).join("\n"));
        });
        // console.log(JSON.stringify(ko, undefined, 2));

        exitCode = 1;
      }
    }
  } catch (err) {
    console.log(err);
    exitCode = 2;
  }
  process.exit(exitCode);
})()

/**
 * Generate new instance of Ajv validator.
 * @param {String} version - The version of the JSON:API spec that will be validated
 * @returns {Ajv|Ajv2020} - An in stance of Ajv validator
 */
const ajvFactory = function (version) {
  // ... create ajv instance
  const ajv = (version === "1.0") ? new Ajv() : new Ajv2020();

  // ...add formats to ajv validator
  addFormats(ajv);

  return ajv;
};

/**
 * Load all version-related schemas and register them with the instance of the Ajv validator.
 * @param {Ajv|Ajv2020} ajv - An instance of Ajv validator
 * @param {String} version - The version of the JSON:API spec that will be validated
 * @return {void}
 */
const addSchemas = async function (ajv, version) {
  for await (const entry of readdirp(`${rootDir}/${version}/`, { depth: 0, fileFilter: "*.json" })) {
    const { path, fullPath } = entry;

    // Load schema file
    const schema = require(fullPath);

    // Build the schema key to be used
    const t = path.split(".").shift().split("_");
    t.shift();
    const t2 = t.join("_");
    const key = t2 === "" ? "response" : "request_" + t2;

    // Add schema to the Ajv validator instance
    ajv.addSchema(schema, key);

    if (verbose) {
      console.log("Add schema : %s => %s", key, fullPath);
    }
  }
  if (verbose) {
    console.log("");
  }
};

/**
 * Check all the test files for the given version of the JSON:API spec.
 * @param {Ajv|Ajv2020} ajv - An instance of Ajv validator
 * @param {String} version - The version of the JSON:API spec that will be validated
 * @return {{ok: String[], ko: String[]}} - The results of the tests.
 */
const handleTests = async function (ajv, version) {
  // Define some constants
  const ok = new Array();
  const ko = new Array();

  // Build a list of test files from previous versions
  const tmpFiles = new Array();
  for (const v in files) {
    if (compareVersions(version, v) === 1) {
      tmpFiles.push(...files[v]);
    }
  }

  // Validate each file of previous versions
  tmpFiles.forEach(item => {
    const result = doTest(ajv, version, item.relativePath, item.fullPath);

    // Handle validation result
    if (result.ok) {
      ok.push(result);
    } else {
      ko.push(result);
    }
  });

  // Iterate through version-specifiques test files
  for await (const entry of readdirp(`${rootDir}/${version}/tests/`, { fileFilter: "*.json" })) {
    const { path, fullPath } = entry;

    // Validate test file
    const result = doTest(ajv, version, path, fullPath);

    // Handle validation result
    if (result.ok) {
      ok.push(result);
    } else {
      ko.push(result);
    }

    // Record file path
    files[version].push({
      relativePath: path,
      fullPath: fullPath
    });
  }

  if (verbose) {
    console.log("");
  }

  return { ok, ko };
};

/**
 * validate a test file for the given version of the JSON:API spec.
 * @param {Ajv|Ajv2020} ajv - An instance of Ajv validator
 * @param {String} version - The version of the JSON:API spec that will be validated
 * @param {String} relativePath - The relative path of the file to validate.
 * @param {String} fullPath - The absolute path of the file to validate.
 * @return {{version: String, relativePath: String, fullPath: String, ok : Boolean, errors: Object}} - The result of the validation.
 */
const doTest = function (ajv, version, relativePath, fullPath) {
  if (verbose) {
    console.log("testing : %s : %s", version, fullPath);
  }

  // Load file
  const data = require(fullPath);

  // Build the schema key to be used
  const re = new RegExp("(.*)\\" + npath.sep + "(in)?valid\\" + npath.sep);
  const matches = relativePath.match(re);
  const valid_data = typeof matches[2] === "undefined";

  const t = matches[1].split(npath.sep);
  const key = [
    t.shift(),
    ...t.reverse()
  ];

  // Generate validating function
  const validate = ajv.getSchema(key.join("_"));

  // Validate file
  const valid = validate(data);
  const ok = (valid && valid_data) || (!valid && !valid_data);

  // Return result of validation
  return {
    version: version,
    relativePath: relativePath,
    fullPath: fullPath,
    shouldBeValid: valid_data,
    ok: ok,
    errors: !ok ? validate.errors : undefined
  };
};

