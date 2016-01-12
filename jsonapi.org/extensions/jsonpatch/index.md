---
layout: page
title: "JSON Patch Extension"
---

## <a href="#status" id="status" class="headerlink"></a> Status

**Extensions are an experimental feature** and should be considered a work
in progress. There is no official support for extensions in the base JSON
API specification.

## <a href="#introduction" id="introduction" class="headerlink"></a> Introduction

The "JSON Patch extension" is an [official
extension](/extensions/#official-extensions) of the JSON API specification.
It provides support for modification of resources with the HTTP PATCH method
[[RFC5789](http://tools.ietf.org/html/rfc5789)] and the JSON Patch format
[[RFC6902](http://tools.ietf.org/html/rfc6902)].

For the sake of brevity, operations requested with `PATCH` and conforming
with JSON Patch will be called "Patch operations".

Servers and clients **MUST** negotiate support for and use of the JSON Patch
extension [as described in the base specification](/format/#extending) using
`jsonpatch` as the name of the extension.

## <a href="#patch-operations" id="patch-operations" class="headerlink"></a> Patch Operations

Patch operations **MUST** be sent as an array to conform with the JSON
Patch format. A server **MAY** limit the type, order, and count of
operations allowed in this top level array.

### <a href="#patch-urls" id="patch-urls" class="headerlink"></a> Request URLs and Patch Paths

The request URL and each Patch operation's `path` are complementary and
**MUST** combine to target a particular resource, collection, attribute, or
relationship.

If a server supports the Patch extension, it **MUST** allow Patch operations at
any resource or relationship URLs that accept POST, PATCH, or DELETE requests.

Patch operations **MAY** also be allowed at the root URL of an API. In this
case, every `path` within a Patch operation **MUST** include the full
resource path relative to the root URL. This allows for general "fire hose"
updates to any resource or relationship represented by an API. As stated
above, a server **MAY** limit the type, order, and count of bulk operations.

### <a href="#patch-creating" id="patch-creating" class="headerlink"></a> Creating Resources

To create a resource, request an `add` operation with a `path` that points
to the end of its corresponding resource collection (`/-`). The `value`
should contain a resource object.

For example, a new photo could be created with the following request:

```http
PATCH /photos HTTP/1.1
Content-Type: application/vnd.api+json; ext=jsonpatch
Accept: application/vnd.api+json; ext=jsonpatch

[
  {
    "op": "add",
    "path": "/-",
    "value": {
      "type": "photos",
      "attributes": {
        "title": "Ember Hamster",
        "src": "http://example.com/images/productivity.png"
      }
    }
  }
]
```

### <a href="#patch-updating-attributes" id="patch-updating-attributes" class="headerlink"></a> Updating Attributes

To update an attribute, perform a `replace` operation with the attribute's
name specified by the `path`.

For instance, the following request should update just the `src` property of the
photo at `/photos/1`:

```http
PATCH /photos/1 HTTP/1.1
Content-Type: application/vnd.api+json; ext=jsonpatch
Accept: application/vnd.api+json; ext=jsonpatch

[
  { "op": "replace", "path": "/src", "value": "http://example.com/hamster.png" }
]
```

### <a href="#patch-updating-relationships" id="patch-updating-relationships" class="headerlink"></a> Updating Relationships

To update a relationship, send an appropriate Patch operation to the
relationship's URL.

A server **MAY** also support relationship updates at a higher level, such
as the resource's URL or the API's root URL. As discussed above, the request
URL and each Patch operation's `path` must be complementary and combine to
target a particular relationship's URL.

#### <a href="#patch-updating-to-one-relationships" id="patch-updating-to-one-relationships" class="headerlink"></a> Updating To-One Relationships

To update a to-one relationship, perform a `replace` operation with a URL
and `path` that targets the relationship. The `value` **MUST** be a
resource identifier object or `null`, to remove the relationship.

For instance, the following request should update the `author` of an article:

```http
PATCH /article/1/relationships/author HTTP/1.1
Content-Type: application/vnd.api+json; ext=jsonpatch
Accept: application/vnd.api+json; ext=jsonpatch

[
  { "op": "replace", "path": "", "value": {"type": "people", "id": "1"} }
]
```

To remove a to-one relationship, perform a `replace` operation on the
relationship to change its value to `null`. For example:

```http
PATCH /article/1/relationships/author HTTP/1.1
Content-Type: application/vnd.api+json; ext=jsonpatch
Accept: application/vnd.api+json; ext=jsonpatch

[
  { "op": "replace", "path": "", "value": null }
]
```

#### <a href="#patch-updating-to-many-relationships" id="patch-updating-to-many-relationships" class="headerlink"></a> Updating To-Many Relationships

A server **MUST** respond to Patch operations that target a *to-many
relationship URL* as described below.

For all operations, the `value` **MUST** contain an object that contains
an array of resource identifier objects or an empty array, to remove all
elements of the relationship.

If a client requests a `replace` operation to a *to-many relationship URL*, the
server **MUST** either completely replace every member of the relationship,
return an appropriate error response if some resources can not be found or
accessed, or return a `403 Forbidden` response if complete replacement is
not allowed by the server.

For example, the following request replaces every tag for an article:

```http
PATCH /photos/1/relationships/tags HTTP/1.1
Content-Type: application/vnd.api+json; ext=jsonpatch
Accept: application/vnd.api+json; ext=jsonpatch

[
  {
    "op": "replace",
    "path": "",
    "value": [
      { "type": "tags", "id": "2" },
      { "type": "tags", "id": "3" }
    ]
  }
]
```

To add an element to a to-many relationship, request an `add` operation that
targets the relationship's URL. Because the operation is targeting the end of a
collection, the `path` must end with `/-`.

In the following example, the comment with ID `123` is added to the list of
comments for the article with ID `1`:

```http
PATCH /articles/1/relationships/comments HTTP/1.1
Content-Type: application/vnd.api+json; ext=jsonpatch
Accept: application/vnd.api+json; ext=jsonpatch

[
  {
    "op": "add",
    "path": "/-",
    "value": [
      { "type": "comments", "id": "123" }
    ]
  }
]
```

To remove a to-many relationship, perform a `remove` operation that targets
the relationship's URL.

In the following example, comments with IDs of `5` and `13` are removed
from the list of comments for the article with ID `1`:

```http
PATCH /articles/1/relationships/comments HTTP/1.1
Content-Type: application/vnd.api+json; ext=jsonpatch
Accept: application/vnd.api+json; ext=jsonpatch

[
  {
    "op": "remove",
    "path": "",
    "value": [
      { "type": "comments", "id": "5" },
      { "type": "comments", "id": "13" }
    ]
  }
]
```

### <a href="#patch-deleting" id="patch-deleting" class="headerlink"></a> Deleting a Resource

To delete a resource, perform a `remove` operation with a URL and `path`
that targets the resource.

For instance, photo `"1"` might be deleted with the following request:

```http
PATCH /photos/1 HTTP/1.1
Content-Type: application/vnd.api+json; ext=jsonpatch
Accept: application/vnd.api+json; ext=jsonpatch

[
  { "op": "remove", "path": "" }
]
```

### <a href="#patch-responses" id="patch-responses" class="headerlink"></a> Responses

#### <a href="#patch-responses-204" id="patch-responses-204" class="headerlink"></a> 204 No Content

A server **MUST** return a `204 No Content` status code in response to a
successful Patch operation in which the client's current attributes remain up to
date.

#### <a href="#patch-responses-200" id="patch-responses-200" class="headerlink"></a> 200 OK

If a server accepts an update but also changes the resource(s) in other ways
than those specified by the request (for example, updating the `updatedAt`
attribute or a computed `sha`), it **MUST** return a `200 OK` response as well
as a representation of the updated resources.

The server **MUST** specify a `Content-Type` header of `application/vnd.api+json;
ext=jsonpatch`. The body of the response **MUST** contain an array of JSON objects,
each of which **MUST** conform to the JSON API media type
(`application/vnd.api+json`). Response objects in this array **MUST** be in
sequential order and correspond to the operations in the request document.

For instance, a request may create two photos in separate operations:

```http
PATCH /photos HTTP/1.1
Content-Type: application/vnd.api+json; ext=jsonpatch
Accept: application/vnd.api+json; ext=jsonpatch

[
  {
    "op": "add",
    "path": "/-",
    "value": {
      "type": "photos",
      "attributes": {
        "title": "Ember Hamster",
        "src": "http://example.com/images/productivity.png"
      }
    }
  },
  {
    "op": "add",
    "path": "/-",
    "value": {
      "type": "photos",
      "attributes": {
        "title": "Mustaches on a Stick",
        "src": "http://example.com/images/mustaches.png"
      }
    }
  }
]
```

The response would then include corresponding JSON API documents contained
within an array:

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json; ext=jsonpatch

[
  {
    "data": [{
      "type": "photos",
      "id": "123",
      "attributes": {
        "title": "Ember Hamster",
        "src": "http://example.com/images/productivity.png"
      }
    }]
  }, {
    "data": [{
      "type": "photos",
      "id": "124",
      "attributes": {
        "title": "Mustaches on a Stick",
        "src": "http://example.com/images/mustaches.png"
      }
    }]
  }
]
```

#### <a href="#patch-responses-errors" id="patch-responses-errors" class="headerlink"></a> Errors

A server **MAY** return error objects that correspond to each operation. The
body of the response **MUST** contain an array of JSON objects, which
**MUST** be in sequential order and correspond to the operations in the
request document. Each response object **SHOULD** contain only error objects
keyed by `errors`, since no operations can be completed successfully when
any errors occur. Error codes for each specific operation **SHOULD** be
returned in the `status` member of each error object.
