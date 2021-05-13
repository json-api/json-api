# List of compliance specs

Note: This document is a RFC and is not intended to be merged as is in the repo.

## Content negotiation (http://jsonapi.org/format/#content-negotiation-servers)
+ response document content type (ensure `Content-Type: application/vnd.api+json`)
+ unsupported media type
+ not acceptable

## Resources
### Fetching resources (http://jsonapi.org/format/#fetching-resources)
+ fetching single resource
+ fetching single resource with meta
+ fetching single resource with links
+ fetching null single resource
+ fetching empty collection
+ fetching collection
+ fetching non-existent resource
+ presence of jsonapi member
+ presence of meta member
+ presence of links member

#### Inclusion of related resources (http://jsonapi.org/format/#fetching-includes)
+ explicit `?include` query parameter
+ implicit default inclusion
+ presence of relationship meta
+ presence of relationship links
+ no linkage data (only links) for non-included relationships

#### Sparse fieldsets (http://jsonapi.org/format/#fetching-sparse-fieldsets)
+ explicit `?fields` query parameter
+ sparse fieldset removing an included relationship key (`?include=comments&fields[posts]=title,content`)

### Creating resources (http://jsonapi.org/format/#crud-creating)
+ simple resource creation
+ resource creation with client-generated ID

### Updating resources (http://jsonapi.org/format/#crud-updating)
+ simple resource update

### Deleting resources (http://jsonapi.org/format/#crud-deleting)
+ simple resource deletion

## Relationships

## Errors
