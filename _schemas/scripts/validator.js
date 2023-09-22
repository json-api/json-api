// Import the modules
const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");
const readdirp = require("readdirp");
const npath = require("path");
const { compareVersions } = require("compare-versions");

/**
 * Retrieve the value of the given option.
 * @param {String} name - The name of the option to retrieve
 * @param {*} defaultValue  - The default value
 * @returns {*}
 */
const getArgValue = function (name, defaultValue) {
  const index = process.argv.indexOf(name);
  let value;

  if (index > -1) {
    // Retrieve the value after --custom
    value = process.argv[index + 1];
  }

  return (value || defaultValue);
};

// Define root dir
const rootDir = "./_schemas";

// Define object that will record the full path of all files tested
const files = {};

// Check for options
const options = {
  verbose: process.argv.indexOf("--verbose") > -1,
  requiredVersion: getArgValue("-v"),
  requiredFile: getArgValue("-f"),

  onlyOneVersion: function () {
    return typeof this.requiredVersion !== "undefined";
  },
  onlyForVersion: function (version) {
    return this.onlyOneVersion() && this.requiredVersion === version;
  },
  singleTest: function() {
    return (typeof this.requiredFile !== "undefined");
  }
};

// Main function
(async function () {
  try {
    // List all the available versions of the spec
    for await (const entry of readdirp(rootDir, { depth: 0, entryType: "directories" })) {
      const version = entry.path;
      if (isNaN(version)) {
        continue;
      }

      // For this version, ...

      // ... prepare record object
      files[version] = new Array();

      // ... if not required to test this version, register all version-specific test files
      if (options.onlyOneVersion() && !options.onlyForVersion(version)) {
        await readTestDir(version);
        continue;
      }

      // ... log some infos
      console.log("");
      console.log("JSON:API spec version : %s", version);
      console.log("");

      // ... create ajv instance
      const ajv = ajvFactory();

      // ... add schemas to ajv instance
      await addSchemas(ajv, version);

      // ... test all files
      const { ok, ko } = await handleTests(ajv, version);

      // ... log the results
      if (options.verbose) {
        console.log("");
      }
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

      }

      // ... define the exit code
      process.exitCode = (ko.length != 0) ? 1 : 0;
    }
  } catch (err) {
    console.log(err);
    process.exitCode = 2;
  }
})()

/**
 * Generate new instance of Ajv validator.
 * @returns {Ajv2020} - An instance of Ajv validator
 */
const ajvFactory = function () {
  // ... create ajv instance
  const ajv = new Ajv2020();

  // ...add formats to ajv validator
  addFormats(ajv);

  return ajv;
};

/**
 * Load all version-related schemas and register them with the instance of the Ajv validator.
 * @param {Ajv2020} ajv - An instance of Ajv validator
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

    if (options.verbose) {
      console.log("Add schema : %s => %s", key, fullPath);
    }
  }
  if (options.verbose) {
    console.log("");
  }
};

/**
 * Check all the test files for the given version of the JSON:API spec.
 * @param {Ajv2020} ajv - An instance of Ajv validator
 * @param {String} version - The version of the JSON:API spec that will be validated
 * @return {{ok: String[], ko: String[]}} - The results of the tests.
 */
const handleTests = async function (ajv, version) {
  // Define some constants
  const results = {
    ok: new Array(),
    ko: new Array()
  };

  if (options.singleTest()) {
    await runSingleTest(ajv, version, results);
  } else {
    await runAllTests(ajv, version, results);
  }

  return results;
};

/**
 * Check all the test files for the given version of the JSON:API spec.
 * @param {Ajv2020} ajv - An instance of Ajv validator
 * @param {String} version - The version of the JSON:API spec that will be validated
 * @param {{ok: String[], ko: String[]}} results - The results of the tests.
 * @return {void}
 */
const runAllTests = async function (ajv, version, results) {
  // Build a list of test files from previous versions
  const tmpFiles = new Array();
  for (const v in files) {
    if (compareVersions(version, v) === 1) {
      tmpFiles.push(...files[v]);
    }
  }

  // Validate each file of previous versions
  tmpFiles.forEach(item => {
    runTest(ajv, version, item.relativePath, item.fullPath, results);
  });

  // Iterate through version-specifiques test files
  await readTestDir(version, (path, fullPath) => {
    // Validate test file
    runTest(ajv, version, path, fullPath, results);
  })
};

/**
 * Run a single test for the given version of the JSON:API spec and the test file that was passed in the options.
 * @param {Ajv2020} ajv - An instance of Ajv validator
 * @param {String} version - The version of the JSON:API spec that will be validated
 * @param {{ok: String[], ko: String[]}} results - The result of the test.
 * @return {void}
 */
const runSingleTest = async function (ajv, version, results) {
  // Retrieve relative and full path of the file to test
  const baseDir = __dirname.replaceAll(/[\/\\]/g, npath.sep).split(npath.sep);
  baseDir.pop();
  const filePath = options.requiredFile.replaceAll(/[\/\\]/g, npath.sep).split(npath.sep);
  if (filePath[0] === "_schemas") {
    filePath.shift();
  }
  const fullPath = [...baseDir, ...filePath].join(npath.sep);

  filePath.shift();
  filePath.shift();
  const path = filePath.join(npath.sep);

  // Validate test file
  runTest(ajv, version, path, fullPath, results);
};

/**
 * Check a single test files for the given version of the JSON:API spec.
 * @param {Ajv2020} ajv - An instance of Ajv validator
 * @param {String} version - The version of the JSON:API spec that will be validated
 * @param {String} relativePath - The relative path of the test file that will be validated
 * @param {String} fullPath - The absolute path of the test file that will be validated
 * @param {{ok: String[], ko: String[]}} results - The results of the test.
 * @return {void}
 */
const runTest = function (ajv, version, relativePath, fullPath, results) {
  // Validate test file
  const result = doTest(ajv, version, relativePath, fullPath);

  // Handle validation result
  if (result.ok) {
    results.ok.push(result);
  } else {
    results.ko.push(result);
  }
};


/**
 * Load the list of test files for the given version of the JSON:API spec.
 * @param {String} version - The version of the JSON:API spec that will be validated
 * @param {Function} callback - A callback function to execute for each test file with path (relative path of test file) and fullPath (absolute path of test file) as arguments.
 * @return {void}
 */
const readTestDir = async function (version, callback) {
  // Iterate through version-specifiques test files
  for await (const entry of readdirp(`${rootDir}/${version}/tests/`, { fileFilter: "*.json" })) {
    const { path, fullPath } = entry;

    if (callback) {
      callback(path, fullPath);
    }
    // Record file path
    files[version].push({
      relativePath: path,
      fullPath: fullPath
    });
  }
};

/**
 * validate a test file for the given version of the JSON:API spec.
 * @param {Ajv2020} ajv - An instance of Ajv validator
 * @param {String} version - The version of the JSON:API spec that will be validated
 * @param {String} relativePath - The relative path of the file to validate.
 * @param {String} fullPath - The absolute path of the file to validate.
 * @return {{version: String, relativePath: String, fullPath: String, ok : Boolean, errors: Object}} - The result of the validation.
 */
const doTest = function (ajv, version, relativePath, fullPath) {
  if (options.verbose) {
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
