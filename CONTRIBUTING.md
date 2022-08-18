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

Then you can run the schema validator by running the following command :

`
node ./_schemas/scripts/validator.js
`

This script accepts only one option (`-v`) that allows more verbose output.
