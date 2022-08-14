// Import the modules
const Ajv = require("ajv");
const Ajv2020 = require("ajv/dist/2020");
const addFormats = require("ajv-formats");
const readdirp = require("readdirp");
const npath = require("path");

// Define root dir
const rootDir = "./_schemas";

// Check for arguments
const verbose = process.argv.indexOf('-v') > -1;

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
      console.log("Version : %s", version);

      // ... create ajv instance
      const ajv = ajvFactory(version);

      // ... add schemas
      await addSchemas(ajv, version);

      // ... test all files
      const { ok, ko } = await doTest(ajv, version);

      // ... log the results
      if (ko.length != 0) {
        console.log("Errors : %d / %d", ko.length, ko.length + ok.length);

        if (verbose) {
          console.log(ko.map(item => item.version + " : " + item.relativePath).join("\n"));
        }
        // console.log(JSON.stringify(ko, undefined, 2));
        
        process.exit(2);
      } else {
        console.log("Success : %d tests done", ok.length);
      }

    }
  } catch (err) {
    console.log(err);
  }
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
    const schema = require(fullPath);
    const t = path.split(".").shift().split("_");
    t.shift();
    const t2 = t.join("_");
    const key = t2 === "" ? "response" : "request_" + t2;

    ajv.addSchema(schema, key);

    if (verbose) {
      console.log("Add schema : %s => %s", key, fullPath);
    }
  }
};

/**
 * Check all the test files for the given version of the JSON:API spec.
 * @param {Ajv|Ajv2020} ajv - An instance of Ajv validator
 * @param {String} version - The version of the JSON:API spec that will be validated
 * @return {{ok: String[], ko: String[]}} - The results of the tests.
 */
const doTest = async function (ajv, version) {
  // ... define some constants
  const ok = new Array();
  const ko = new Array();

  for await (const entry of readdirp(`${rootDir}/${version}/tests/`, { fileFilter: "*.json" })) {
    const { path, fullPath } = entry;
    const data = require(fullPath);

    const re = new RegExp('(.*)\\' + npath.sep + '(in)?valid\\' + npath.sep);
    const matches = path.match(re);
    const valid_data = typeof matches[2] === "undefined";

    const t = matches[1].split(npath.sep);
    const key = [
      t.shift(),
      ...t.reverse()
    ];

    // Generate validating function
    const validate = ajv.getSchema(key.join('_'));
    const valid = validate(data);

    if ((valid && valid_data) || (!valid && !valid_data)) {
      ok.push(path);
    } else {
      ko.push({
        version: "1.0",
        relativePath: path,
        errors: validate.errors
      });
      // console.log(validate.errors);
    }
  }

  return { ok, ko };
};

