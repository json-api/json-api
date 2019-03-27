---
name: Bulk
short_description: Allow bulk operations on API endpoints

extended_description: |
  Allow multiple POST, PATCH and DELETE operation on the same endpoint with the
  same request. Every bulk operation must be applied on the same API resource
  collection and must be of the same type.

minimum_jsonapi_version: 1.1

discussion_url: http://github.com/json-api/json-api/pull/1380

editors:
  - name: Konstantinos Bairaktaris
    email: kbairak@transifex.com

categories:
  - Bulk Operations
---

# Bulk profile

## Introduction

This page specifies a profile for the `application/vnd.api+json` media type,
as described in the [JSON:API specification](http://jsonapi.org/format/).

This profile allows clients to perform a number of operations with only one
request. Instead of supporting arbitrary operations on the whole API, this
profile limits operations of the same type (aka HTTP verb: `POST`, `PATCH`,
`DELETE`) on the same API resource.

## Creating Resources In Bulk

### Requests

A collection of resources can be created by sending a `POST` request to a URL
that represents a collection of resources. The request **MUST** include an
array of resource objects as primary data. All items of the array **MUST** have
the same `type` member. The same restrictions that apply to a resource object
when creating a single resource apply to each item of the array. Either all the
items in the request **MUST** include client-generated IDs, or none **MUST**.

Every bulk create operation **MUST** be atomic. If the server has changed, all
the requested items **MUST** have been created. Also, no side-effects are to be
expected to happen asynchronously on the server's side; assuming no further
interaction with the server, the returned items **SHOULD** remain as they are
and further attempts to fetch them **SHOULD** return the same resource objects.

For instance, a collection of articles might be created with the following
request:

```
POST /articles HTTP/1.1
Content-Type: application/vnd.api+json;profile="https://github.com/json-api/json-api/_profiles/transifex/bulk/index.md"
Accept: application/vnd.api+json;profile="https://github.com/json-api/json-api/_profiles/transifex/bulk/index.md",application/vnd.api+json

{
  "data": [
    {
      "type": "articles",
      "attributes": {"title": "Creating resources in bulk"}
    },
    {
      "type": "articles",
      "attributes": {"title": "Creating many resources at the same time"}
      "relationships": {"author": {"data": {"type": "users", "id": "1"}}}
    }
  ]
}
```

### Responses

#### `201 Created`

If the requested items did not include Client-Generated IDs and the requested
resources have been created successfully, the server **MUST** return a
`201 Created` status code.

The server **MUST NOT** include a `Location` header.

The response **MUST** also include a document that contains an array with the
primary resources created, in the same order as they appear in the request.

For instance, A response when all requested items were created can be:

```
201 Created
{
  "data": [
    {
      "type": "articles",
      "id": "1",
      "attributes": {"title": "Creating resources in bulk"}
    },
    {
      "type": "articles",
      "id": "2",
      "attributes": {"title": "Handling responses in bulk creation"}
    }
  ],
  "links": {
    "profile": [
      "https://github.com/json-api/json-api/_profiles/transifex/bulk/index.md"
    ]
  }
}
```

#### `204 No Content`

If the requested items did include a Client-Generated ID and the requested
resources have been created successfully, the server **MUST** return either a
`201 Created` status code and response document (as described above) or a
`204 No Content` status code with no response document.


> Note: If a 204 response is received the client should consider the resources
> object sent in the request to be accepted by the server, as if the server had
> returned them back in a 201 response.

#### Failure

In case of failure, a normal JSON:API error response **MUST** be returned as
described in the specification. The errors of the response **SHOULD** only
describe the requested items that caused a problem with the server; requested
items that would have been accepted on their own **SHOULD NOT** be reflected in
the response.

In case of multiple errors, like with error responses as described in the
JSON:API specification, the most generally applicable HTTP error code
**SHOULD** be used in the response.

In order for the client to identify which of the requested items caused the
failure, the error object **SHOULD** include the `source` member with a
`pointer`.

For instance, a response when the server encountered a problem while creating
the first and third item in a bulk request can be:

```
400 Bad Request
{
  "errors": [
    {
      "status": "403",
      "title": "Forbidden",
      "detail": "You do not have permissions to perform this action",
      "source": {"pointer": "/data/0"}
    },
    {
      "status": "409",
      "title": "Conflict",
      "detail": "An article with the same title already exists",
      "source": {"pointer": "/data/2/attributes/title"}
    }
  ],
  "links": {
    "profile": [
      "https://github.com/json-api/json-api/_profiles/transifex/bulk/index.md"
    ]
  }
}
```

## Updating Resources In Bulk

### Requests

A collection of resources can be updated by sending a `PATCH` request to a URL
that represents a collection of resources. The request **MUST** include an
array of resource objects as primary data. All items of the array **MUST** have
the same `type` member. An `id` member is also required to identify the
resource being edited. The same restrictions that apply to a resource object
when updating a single resource apply to each item of the array.

Every bulk update operation **MUST** be atomic. If the server has changed, all
the requested updates **MUST** have been applied. Also, no side-effects are to
be expected to happen asynchronously on the server's side; assuming no further
interaction with the server, the returned items **SHOULD** remain as they are
and further attempts to fetch them **SHOULD** return the same resource objects.

For instance, a collection of article updates might be performed with the
following request:

```
PATCH /articles HTTP/1.1
Content-Type: application/vnd.api+json;profile="https://github.com/json-api/json-api/_profiles/transifex/bulk/index.md"
Accept: application/vnd.api+json;profile="https://github.com/json-api/json-api/_profiles/transifex/bulk/index.md",application/vnd.api+json

{
  "data": [
    {
      "type": "articles",
      "id": "1",
      "attributes": {"title": "Creating resources in bulk"}
    },
    {
      "type": "articles",
      "id": "2",
      "relationships": {"author": {"data": {"type": "users", "id": "1"}}}
    }
  ]
}
```

### Responses

#### `200 OK`

If a server accepts an update but also changes at least one of the resources in
ways other than those specified by the request (for example, updating the
`updated-at` attribute or a computed `sha`), it **MUST** return a `200 OK`
response. The response document **MUST** include an array of representations of
the updated resources as if a `GET` request was made to the request URL, in the
same order as they appear in the request.

The server **MUST NOT** include a `Location` header.

For instance, A response when all requested items were updated can be:

```
200 OK
{
  "data": [
    {
      "type": "articles",
      "id": "1",
      "attributes": {"title": "Creating resources in bulk"},
      "relationships": {
          "author": {"data": {"type": "users", "id": "1"},
                     "links": {"self": "/articles/1/relationships/author",
                               "related": "/articles/1/author"}}
      }
    },
    {
      "type": "articles",
      "id": "2",
      "attributes": {"title": "Handling responses in bulk creation"},
      "relationships": {
          "author": {"data": {"type": "users", "id": "2"},
                     "links": {"self": "/articles/2/relationships/author",
                               "related": "/articles/2/author"}}
      }
    }
  ],
  "links": {
    "profile": [
      "https://github.com/json-api/json-api/_profiles/transifex/bulk/index.md"
    ]
  }
}
```
#### `204 No Content`

If an update is successful and the server doesn’t update any attributes besides
those provided, the server **MUST** return either a 200 OK status code and
response document (as described above) or a 204 No Content status code with no
response document.


#### Failure

In case of failure, a normal JSON:API error response **MUST** be returned as
described in the specification. The errors of the response **SHOULD** only
describe the requested items that caused a problem with the server; requested
items that would have been accepted on their own **SHOULD NOT** be reflected in
the response.

In case of multiple errors, like with error responses as described in the
JSON:API specification, the most generally applicable HTTP error code
**SHOULD** be used in the response.

In order for the client to identify which of the requested items caused the
failure, the error object **SHOULD** include the `source` member with a
`pointer`.

For instance, a response when the server encountered a problem while updating the
first and third item in a bulk request can be:

```
400 Bad Request
{
  "errors": [
    {
      "status": "403",
      "title": "Forbidden",
      "detail": "You do not have permissions to perform this action",
      "source": {"pointer": "/data/0"}
    },
    {
      "status": "409",
      "title": "Conflict",
      "detail": "An article with the same title already exists",
      "source": {"pointer": "/data/2/attributes/title"}
    }
  ],
  "links": {
    "profile": [
      "https://github.com/json-api/json-api/_profiles/transifex/bulk/index.md"
    ]
  }
}
```

## Deleting Resources In Bulk

### Requests

A collection of resources can be deleted by sending a `DELETE` request to a URL
that represents a collection of resources. The request **MUST** include an
array of resource identifier objects as primary data. All items of the array
**MUST** have the same `type` member. An `id` member is also required to
identify the resource being edited.

Every bulk delete operation **MUST** be atomic. If the server has changed, all
the requested items **MUST** have been deleted. Also, no side-effects are to be
expected to happen asynchronously on the server's side.

For instance, a collection of articles might be deleted with the following
request:

```
DELETE /articles HTTP/1.1
Content-Type: application/vnd.api+json;profile="https://github.com/json-api/json-api/_profiles/transifex/bulk/index.md"
Accept: application/vnd.api+json;profile="https://github.com/json-api/json-api/_profiles/transifex/bulk/index.md",application/vnd.api+json

{
  "data": [
    {"type": "articles", "id": 1},
    {"type": "articles", "id": 2}
  ]
}
```

### Responses

#### `204 No Content`

A server **MUST** return a 204 No Content status code if a deletion request is
successful and no content is returned.

#### `200 OK`

A server **MUST** return a 200 OK status code if a deletion request is
successful and the server responds with only top-level meta data.

#### Failure

In case of failure, a normal JSON:API error response **MUST** be returned as
described in the specification. The errors of the response **SHOULD** only
describe the requested items that caused a problem with the server; requested
items that would have been accepted on their own **SHOULD NOT** be reflected in
the response.

In case of multiple errors, like with error responses as described in the
JSON:API specification, the most generally applicable HTTP error code
**SHOULD** be used in the response.

In order for the client to identify which of the requested items caused the
failure, the error object **SHOULD** include the `source` member with a
`pointer`.

For instance, a response when the server encountered a problem while creating
the first and third item in a bulk request can be:

```
400 Bad Request
{
  "errors": [
    {
      "status": "404",
      "title": "Not Found",
      "detail": "Article with id '1' was not found",
      "source": {"pointer": "/data/0/id"}
    },
    {
      "status": "403",
      "title": "Forbidden",
      "detail": "You do not have permissions to perform this action",
      "source": {"pointer": "/data/2"}
    }
  ],
  "links": {
    "profile": [
      "https://github.com/json-api/json-api/_profiles/transifex/bulk/index.md"
    ]
  }
}
```

## Keywords

* `bulk`
