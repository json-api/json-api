## Issue Tracker
> http://github.com/json-api/json-api/issues

Our issue tracker can always be used to address internal inconsistencies within
the current specification, or updates to the website. Beyond this, we try to
limit discussions to those which focus on problems that will be dealt with in
the next version of JSON:API. A roadmap can be found on the [about] section of
our website.

The ideal world we are shooting for is an empty issue tracker on release days.

## Discussion Forum
> http://discuss.jsonapi.org

Our discussion forum is where general conversations about JSON:API should take
place. Ideas for new extensions and questions about how to correctly implement
or consume an API that adheres to the JSON:API specification belong here.

[about]: http://jsonapi.org/about

## JSON Schema
If you would like to update the JSON schemas, you must first install the node.js dependencies :

`
npm install
`

Then you can run the schema validator by running one of the following commands :

`
node ./schemas/scripts/validator.js
`

or

`
npm run test-schema
`

This script validates all test files against all available versions of the specification.
Some options can be used :
- `--verbose` : allows more verbose output.
- `-f relative-path` : the relative path of the only file to test. For example : `npm run test-schema -- -f schemas/1.0/response/valid/with_success/complete.json`
- `-v version` : the version of the specification to use to test the files. For example : `npm run test-schema -- -v 1.0`
