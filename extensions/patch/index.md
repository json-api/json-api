---
layout: page
title: "Patch Extension"
---

## Introduction <a href="#introduction" id="introduction" class="headerlink"></a>

The "Patch extension" is an [official
extension](/extensions/#official-extensions) of the JSON API specification.
It provides support for modification of resources with the HTTP PATCH method
[[RFC5789](http://tools.ietf.org/html/rfc5789)] and the JSON Patch format
[[RFC6902](http://tools.ietf.org/html/rfc6902)].

For the sake of brevity, operatons requested with `PATCH` and conforming
with JSON Patch will be called "Patch operations".

Servers **SHOULD** indicate support for the JSON API media type's Patch
extension by including the header `Content-Type: application/vnd.api+json;
ext=patch` in every response.

Clients **MAY** request the JSON API media type's Patch extension by
specifying the header `Accept: application/vnd.api+json; ext=patch`. Servers
that do not support the Patch extension **MUST** return a `415 Unsupported
Media Type` status code.

## Patch Operations <a href="#patch-operations" id="patch-operations" class="headerlink"></a>

Patch operations **MUST** specify a `Content-Type` header of
`application/vnd.api+json; ext=patch`.

Patch operations **MUST** be sent as an array to conform with the JSON
Patch format. A server **MAY** limit the type, order, and count of
operations allowed in this top level array.

### Request URLs and Patch Paths <a href="#patch-urls" id="patch-urls" class="headerlink"></a>

The request URL and each Patch operation's `"path"` are complementary and
MUST combine to target a particular resource, collection, attribute, or
relationship.

If a server supports the Patch extension, it **MUST** allow PATCH requests at
any resource or relationship URLs that accept POST, PUT, or DELETE requests.

PATCH requests **MAY** also be allowed at the root URL of an API. In this
case, every `"path"` within a Patch operation **MUST** include the full
resource path relative to the root URL. This allows for general "fire hose"
updates to any resource or relationship represented by an API. As stated
above, a server **MAY** limit the type, order, and count of bulk operations.

### Creating Resources <a href="#patch-creating" id="patch-creating" class="headerlink"></a>

To create a resource, request an `"add"` operation with a `"path"` that points
to the end of its corresponding resource collection (`"/-"`). The `"value"`
should contain a resource object.

For example, a new photo could be created with the following request:

```text
PATCH /photos
Content-Type: application/vnd.api+json; ext=patch
Accept: application/vnd.api+json; ext=patch

[
  {
    "op": "add",
    "path": "/-",
    "value": {
      "type": "photos",
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    }
  }
]
```

### Updating Attributes <a href="#patch-updating-attributes" id="patch-updating-attributes" class="headerlink"></a>

To update an attribute, perform a `"replace"` operation with the attribute's
name specified by the `"path"`.

For instance, the following request should update just the `src` property of the
photo at `/photos/1`:

```text
PATCH /photos/1
Content-Type: application/vnd.api+json; ext=patch
Accept: application/vnd.api+json; ext=patch

[
  { "op": "replace", "path": "/src", "value": "http://example.com/hamster.png" }
]
```

### Updating Relationships <a href="#patch-updating-relationships" id="patch-updating-relationships" class="headerlink"></a>

To update a relationship, send an appropriate Patch operation to the
relationship's URL.

A server **MAY** also support relationship updates at a higher level, such
as the resource's URL or the API's root URL. As discussed above, the request
URL and each Patch operation's `"path"` must be complementary and combine to
target a particular relationship's URL.

#### Updating To-One Relationships <a href="#patch-updating-to-one-relationships" id="patch-updating-to-one-relationships" class="headerlink"></a>

To update a to-one relationship, perform a `"replace"` operation with a URL and
`"path"` that targets the relationship. The `"value"` should be a link object
that contains `"type"` and `"id"` members.

For instance, the following request should update the `author` of an article:

```text
PATCH /article/1/links/author
Content-Type: application/vnd.api+json; ext=patch
Accept: application/vnd.api+json; ext=patch

[
  { "op": "replace", "path": "", "value": {"type": "people", "id": "1"} }
]
```

To remove a to-one relationship, perform a `replace` operation on the
relationship to change its value to `null`. For example:

```text
PATCH /article/1/links/author
Content-Type: application/vnd.api+json; ext=patch
Accept: application/vnd.api+json; ext=patch

[
  { "op": "replace", "path": "", "value": null }
]
```

#### Updating To-Many Relationships <a href="#patch-updating-to-many-relationships" id="patch-updating-to-many-relationships" class="headerlink"></a>

A server **MUST** respond to Patch operations that target a *to-many
relationship URL* as described below.

For all operations, the `"value"` **MUST** contain an object that contains
`type` and `ids` members, or an array of objects that each contain `type`
and `id` members.

If a client requests a `"replace"` operation to a *to-many relationship URL*, the
server **MUST** either completely replace every member of the relationship,
return an appropriate error response if some resources can not be found or
accessed, or return a `403 Forbidden` response if complete replacement is
not allowed by the server.

For example, the following request replaces every tag for an article:

```text
PATCH /photos/1/links/tags
Content-Type: application/vnd.api+json; ext=patch
Accept: application/vnd.api+json; ext=patch

[
  { "op": "replace", "path": "", "value": {"type": "tags", "ids": ["2", "3"]} }
]
```

To add an element to a to-many relationship, request an `"add"` operation that
targets the relationship's URL. Because the operation is targeting the end of a
collection, the `"path"` must end with `"/-"`.

In the following example, the comment with ID `123` is added to the list of
comments for the article with ID `1`:

```text
PATCH /articles/1/links/comments
Content-Type: application/vnd.api+json; ext=patch
Accept: application/vnd.api+json; ext=patch

[
  { "op": "add", "path": "/-", "value": { "type": "comments", "ids": ["123"] } }
]
```

To remove a to-many relationship, perform a `"remove"` operation that targets
the relationship's URL.

In the following example, comments with IDs of `12` and `13` are removed
from the list of comments for the article with ID `1`:

```text
PATCH /articles/1/links/comments
Content-Type: application/vnd.api+json; ext=patch
Accept: application/vnd.api+json; ext=patch

[
  { "op": "remove", "path": "", "value": {"type": "comments", "ids": ["5", "13"]} }
]
```

### Deleting a Resource <a href="#patch-deleting" id="patch-deleting" class="headerlink"></a>

To delete a resource, perform a `"remove"` operation with a URL and `"path"`
that targets the resource.

For instance, photo `1` might be deleted with the following request:

```text
PATCH /photos/1
Content-Type: application/vnd.api+json; ext=patch
Accept: application/vnd.api+json; ext=patch

[
  { "op": "remove", "path": "" }
]
```

### Responses <a href="#patch-responses" id="patch-responses" class="headerlink"></a>

#### 204 No Content <a href="#patch-responses-204" id="patch-responses-204" class="headerlink"></a>

A server **MUST** return a `204 No Content` status code in response to a
successful `PATCH` request in which the client's current attributes remain up to
date.

#### 200 OK <a href="#patch-responses-200" id="patch-responses-200" class="headerlink"></a>

If a server accepts an update but also changes the resource(s) in other ways
than those specified by the request (for example, updating the `updatedAt`
attribute or a computed `sha`), it **MUST** return a `200 OK` response as well
as a representation of the updated resources.

The server **MUST** specify a `Content-Type` header of `application/vnd.api+json;
ext=patch`. The body of the response **MUST** contain an array of JSON objects,
each of which **MUST** conform to the JSON API media type
(`application/vnd.api+json`). Response objects in this array **MUST** be in
sequential order and correspond to the operations in the request document.

For instance, a request may create two photos in separate operations:

```text
PATCH /photos
Content-Type: application/vnd.api+json; ext=patch
Accept: application/vnd.api+json; ext=patch

[
  {
    "op": "add",
    "path": "/-",
    "value": {
      "type": "photos",
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    }
  },
  {
    "op": "add",
    "path": "/-",
    "value": {
      "type": "photos",
      "title": "Mustaches on a Stick",
      "src": "http://example.com/images/mustaches.png"
    }
  }
]
```

The response would then include corresponding JSON API documents contained
within an array:

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json; ext=patch

[
  {
    "data": [{
      "type": "photos",
      "id": "123",
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    }]
  }, {
    "data": [{
      "type": "photos",
      "id": "124",
      "title": "Mustaches on a Stick",
      "src": "http://example.com/images/mustaches.png"
    }]
  }
]
```

#### Other Responses <a href="#patch-responses-other" id="patch-responses-other" class="headerlink"></a>

When a server encounters one or more problems while processing a `PATCH`
request, it **SHOULD** specify the most appropriate HTTP error code in the
response. Clients **MUST** interpret those errors in accordance with HTTP
semantics.

A server **MAY** choose to stop processing Patch operations as soon as the
first problem is encountered, or it **MAY** continue processing operations and
encounter multiple problems. For instance, a server might process multiple
attribute updates and then return multiple validation problems in a single
response.

When a server encounters multiple problems from a single request, the most
generally applicable HTTP error code should be specified in the response. For
instance, `400 Bad Request` might be appropriate for multiple 4xx errors or `500
Internal Server Error` might be appropriate for multiple 5xx errors.

A server **MAY** return error objects that correspond to each operation. The
body of the response **MUST** contain an array of JSON objects, which
**MUST** be in sequential order and correspond to the operations in the
request document. Each response object **SHOULD** contain only error objects
keyed by `"errors"`, since no operations can be completed successfully when
any errors occur. Error codes for each specific operation **SHOULD** be
returned in the `"status"` member of each error object.
