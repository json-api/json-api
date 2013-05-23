---
layout: page
title: "JSON API: Format"
---

{% include status.md %}

<a id="id-based-json-api"></a>
## ID-Based JSON API

## Document

In this specification, the term "document" refers to a single object with a
set of attributes and relationships.

A JSON response may include multiple documents, as described in this
specification.

Each of these names has a special meaning when included in the
attributes section and should not be used as attribute names.

### Top Level

The top-level of a JSON API document **MAY** have the following keys:

* `meta`: meta-information about a resource, such as pagination
* Other resource names (`posts`, `comments`, `people`, etc.)

### Reserved Attributes

There are three reserved attribute names in JSON API:

* `id`
* `href`
* `links`

### Singular Resources

Singular resources are represented as JSON objects. However, they are still
wrapped inside an array:

```javascript
{
  "posts": [{
    // an individual post document
  }]
}
```

This simplifies processing, as you can know that a resource key will always be
a list.

The document **MUST** contain an `id` key.

### Resource Collections

If the length of an array at a resource key is greater than one, the value
represents a list of documents.

```javascript
{
  "posts": [{
    // an individual post document
  }, {
    // an individual post document
  }]
}
```

Each document in the list **MUST** contain an `id` key.

### IDs

The `"id"` key in a document represents a unique identifier for the document, scoped to the document's type. The type scope is implicit, and hardcoded into clients of the API.

### Attributes

Other than the `"links"` and `"id"` keys, every key in a document represents an attribute. An attribute's value may be any JSON value.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase"
  }]
}
```

### Relationships

The value of the `"links"` key is a JSON object that represents related documents.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "9",
      "comments": [ "5", "12", "17", "20" ]
    }
  }]
}
```

#### To-Many Relationships

A to-many relationship is represented as a JSON array of IDs.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": [ "5", "12", "17", "20" ]
    }
  }]
}
```

An API that provides a to-many relationship as an array of IDs **MUST** respond to a `GET` request with a list of the specified documents with a URL formed by joining:

* A base URL that represents the type of the related resource (this must be hardcoded in the client)
* `?ids=`
* A comma-separated list of the specified IDs

In the above example, a `GET` request to `/comments?ids=5,12,17,20` returns a document containing the four specified comments.

#### To-One Relationships

A to-one relationship is represented as a single string or number value.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "17"
    }
  }]
}
```

An API that provides a to-one relationship as an ID **MUST** respond to a `GET` request with the specified document with a URL formed by joining:

* A base URL that represents the type of the related resource (this must be hardcoded in the client)
* `/`
* The specified ID

In the above example, a `GET` request to `/people/17` returns a document containing the specified author.

### Compound Documents

To save HTTP requests, it may be convenient to send related documents along with the requested documents.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "9"
    }
  }],
  "people": [{
    "id": "9",
    "name": "@d2h"
  }]
}
```

The related documents are provided as an additional top-level document or document list whose key is a name that represents the document type.

The linkage between the key under `"links"` and the top-level keys is hardcoded into the client.

<a id="url-based-json-api"></a>
## URL-Based JSON API

In the above description of ID-based JSON, there were several places where information about the location of related resources needed to be hardcoded into the client.

The goal of the URL-Based JSON API is to eliminate the need for those specific instances of hardcoded information.

### Top Level

The top-level of a JSON API document **MAY** have the following keys:

* `meta`: meta-information about a resource, such as pagination
* `links`: URL templates to be used for expanding resources' relationships URLs
* Other resource names (`posts`, `comments`, `people`, etc.)

### Singular Resources

Singular resources are represented as JSON objects. However, they are still
wrapped inside an array:

```javascript
{
  "posts": [{
    // an individual post document
  }]
}
```

This simplifies processing, as you can know that a resource key will always be
a list.

The document **MAY** contain an `id` key.

### Resource Collections

If the length of an array at a resource key is greater than one, the value
represents a list of documents.

```javascript
{
  "posts": [{
    // an individual post document
  }, {
    // an individual post document
  }]
}
```

Each document in the list **MAY** contain an `id` key.

### IDs

The `"id"` key in a document represents a unique identifier for the document, scoped to the document's type. It can be used with URL templates to fetch related records, as described below.

### Attributes

Other than the `"links"` and `"id"` keys, every key in a document represents an attribute. An attribute's value may be any JSON value.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase"
  }]
}
```

### Relationships

The value of the `"links"` key is a JSON object that represents related documents.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "http://example.com/people/1",
      "comments": "http://example.com/comments/5,12,17,20"
    }
  }]
}
```

#### To-Many Relationships

A to-many relationship is a string value that represents a URL.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": "http://example.com/posts/1/comments"
    }
  }]
}
```

An API that provides a to-many relationship as a URL **MUST** respond to a `GET` request with a list of the specified documents with the specified URL.

In the above example, a `GET` request to `/posts/1/comments` returns a document containing the four specified comments.

#### To-One Relationships

A to-one relationship is represented as a string value that represents a URL.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "http://example.com/people/17"
    }
  }]
}
```

An API that provides a to-one relationship as a URL **MUST** respond to a `GET` request with the specified document with the specified URL.

In the above example, a `GET` request to `/people/17` returns a document containing the specified author.

### URL Template Shorthands

When returning a list of documents from a response, a top-level `"links"` object can specify a URL template that should be used for all documents.

Example:

```javascript
{
  "links": {
    "posts.comments": "http://example.com/posts/{posts.id}/comments"
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase"
  }, {
    "id": "2",
    "title": "The Parley Letter"
  }]
}
```

In this example, fetching `/posts/1/comments` will fetch the comments for `"Rails is Omakase"` and fetching `/posts/2/comments` will fetch the comments for `"The Parley Letter"`.

```javascript
{
  "links": {
    "posts.comments": "http://example.com/comments/{posts.comments}"
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": [ "1", "2", "3", "4" ]
    }
  }]
}
```

In this example, the `posts.comments` variable is expanded by
"exploding" the array specified in the `"links"` section of each post.
The [URL template specification][3] specifies that the default explosion is to join the array members by a comma, so in this example, fetching `/comments/1,2,3,4` will return a list of all comments.

[3]: https://tools.ietf.org/html/rfc6570

This example shows how you can start with a list of IDs and then upgrade to specifying a different URL pattern than the default.

The top-level `"links"` key has the following behavior:

* Each key is a dot-separated path that points at a repeated relationship. For example `"posts.comments"` points at the `"comments"` relationship in each repeated document under `"posts"`.
* The value of each key is interpreted as a URL template.
* For each document that the path points to, act as if it specified a relationship formed by expanding the URL template with the non-URL value actually specified.

Here is another example that uses a has-one relationship:

```javascript
{
  "links": {
    "posts.author": "http://example.com/people/{posts.author}"
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "12"
    }
  }, {
    "id": "2",
    "title": "The Parley Letter",
    "links": {
      "author": "12"
    }
  }, {
    "id": "3",
    "title": "Dependency Injection is Not a Virtue",
    "links": {
      "author": "12"
    }
  }]
}
```

In this example, the author URL for all three posts is `/people/12`.

Top-level URL templates allow you to specify relationships as IDs, but without requiring that clients hard-code information about how to form the URLs.

### Compound Documents

To save HTTP requests, it may be convenient to send related documents along with the requested documents.

In this case, a bit of extra metadata for each relationship can link together the documents.

```javascript
{
  "links": {
    "posts.author": {
      "href": "http://example.com/people/{posts.author}",
      "type": "people"
    },
    "posts.comments": {
      "href": "http://example.com/comments/{posts.comments}",
      "type": "comments"
    }
  }
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "9",
      "comments": [ "1", "2", "3" ]
   }, {
    "id": "2",
    "title": "The Parley Letter",
    "links": {
      "author": "9",
      "comments": [ "4", "5" ]
   }, {
    "id": "1",
    "title": "Dependency Injection is Not a Virtue",
    "links": {
      "author": "9",
      "comments": [ "6" ]
    }
  }],
  "people": [{
    "id": "9",
    "name": "@d2h"
  }],
  "comments": [{
    "id": "1",
    "body": "Mmmmmakase"
  }, {
    "id": "2",
    "body": "I prefer unagi"
  }, {
    "id": "3",
    "body": "What's Omakase?"
  }, {
    "id": "4",
    "body": "Parley is a discussion, especially one between enemies"
  }, {
    "id": "5",
    "body": "The parsley letter"
  }, {
    "id": "6",
    "body": "Dependency Injection is Not a Vice"
  }]
}
```

The benefit of this approach is that when the same document is referenced multiple times (in this example, the author of the three posts), it only needs to be presented a single time in the document.

By always combining documents in this way, a client can consistently extract and wire up references.

JSON API documents **MAY** specify the URL for a document in a compound
response by specifying a `"href"` key:

```javascript
{
  // ...
  "comments": [{
    "href": "http://example.com/comments/1",
    "id": "1",
    "body": "Mmmmmakase"
  }, {
    "href": "http://example.com/comments/2",
    "id": "2",
    "body": "I prefer unagi"
  }, {
    "href": "http://example.com/comments/3",
    "id": "3",
    "body": "What's Omakase?"
  }, {
    "href": "http://example.com/comments/4",
    "id": "4",
    "body": "Parley is a discussion, especially one between enemies"
  }, {
    "href": "http://example.com/comments/5",
    "id": "5",
    "body": "The parsley letter"
  }, {
    "href": "http://example.com/comments/6",
    "id": "6",
    "body": "Dependency Injection is Not a Vice"
  }]
}
```

## Updating

## URLs

Update URLs are determined [the same way][1] as `GET` URLs. When using the
ID-based approach, URLs are conventionally formed. When using the
URL-based approach, every document specifies the URLs for its related
documents, which can be used to fetch **and** update.

[1]: /reading

## Creating a Document

A JSON API document is *created* by making a `POST` request to the URL that
represents a collection of documents that the new document should belong to.
While this method is preferred, you can always use anything that's valid with
RFC 2616, as long as it's compliant. For example, PUT can be used to create
documents if you wish. We believe most people will generally use POST, so we'll
elaborate on it further below.

In general, this is a collection scoped to the **type** of document.

The request **MUST** contain a `Content-Type` header whose value is
`application/json`. It **MUST** also include `application/json` as the
only or highest quality factor.

Its root key **MUST** be the same as the root key provided in the
server's response to `GET` request for the collection.

For example, assuming the following request for the collection of
photos:

```text
GET /photos

HTTP/1.1 200 OK
Content-Type: application/json

{
  "photos": [{
    "id": "1",
    "title": "Mustaches on a Stick"
  }]
}
```

You would create a new photo by `POST`ing to the same URL:

```text
POST /photos
Content-Type: application/json
Accept: application/json

{
  "photos": [{
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }]
}
```

#### Client-Side IDs

A server **MAY** require a client to provide IDs generated on the
client. If a server wants to request client-generated IDs, it **MUST**
include a `meta` section in its response with the key `client-ids` and
the value `true`:

```text
GET /photos

HTTP/1.1 200 OK
Content-Type: application/json

{
  "posts": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Mustaches on a Stick",
    "src": "http://example.com/images/mustaches.png"
  }],
  "meta": {
    "client-ids": true
  }
}
```

If the server requests client-generated IDs, the client **MUST** include
an `id` key in its `POST` request, and the value of the `id` key
**MUST** be a properly generated and formatted *UUID* provided as a JSON
string.

```text
POST /photos
Content-Type: application/json
Accept: application/json

{
  "photos": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }]
}
```

### Response

A server **MUST** respond to a successful document creation request
according to [`HTTP semantics`][2]

[2]: http://tools.ietf.org/html/draft-ietf-httpbis-p2-semantics-22#section-6.3

The response **MUST** include a `Location` header identifying the primary
document created by the request. It **SHOULD** also include a request body
describing that document. If absent, the client **SHOULD** treat the
transmitted document as accepted without modification.

The response body **MAY** include an `href` key in the attributes section. If
a response body is present and the server is using the URL-based JSON API,
this `href` attribute is **REQUIRED**. When present, the value of the `href`
attribute **MUST** match the URI in the `Location` header.

Example:

```text
HTTP/1.1 201 Created
Location: http://example.com/photos/12
Content-Type: application/json

{
  "photos": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "href": "http://example.com/photos/12",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }]
}
```

#### Other Responses

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics.

## Updating a Document (`PATCH`)

The body of the `PATCH` request **MUST** be in JSON format with a `Content-Type`
header of `application/json-patch+json`.

It **MUST** be a valid [JSON Patch (RFC 6902)][4] document.

[4]: http://tools.ietf.org/html/rfc6902

### Attributes

To update an attribute, include a `replace` operation in the JSON Patch
document. The name of the property to replace **MUST** be the same as
the attribute name in the original `GET` request.

For example, consider this `GET` request:

```text
GET /photos/1

HTTP/1.1 200 OK
Content-Type: application/json

{
  "photos": [{
    "id": "1",
    "title": "Productivity",
    "src": "http://example.com/productivity.png"
  }]
}
```

To update just the `src` property of the photo at `/photos/1`, make the
following request:

```text
PATCH /photos/1
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "/src", "value": "http://example.com/hamster.png" }
]
```

For attributes, only the `replace` operation is supported at the current
time.

### Relationships

Relationship updates are represented as JSON Patch operations on the
`links` document.

#### To-One Relationships

To update a to-one relationship, the client **MUST** issue a `PATCH`
request that includes a `replace` operation on the relationship
`links/<name>`.

For example, for the following `GET` request:

```text
GET /photos/1
Content-Type: application/json

{
  "links": {
    "photos.author": "http://example.com/people/{photos.author}"
  },
  "photos": [{
    "id": "1",
    "href": "http://example.com/photos/1",
    "title": "Hamster",
    "src": "images/hamster.png",
    "links": {
      "author": "1"
    }
  }]
}
```

To change the author to person 2, issue a `PATCH` request to
`/photos/1`:

```text
PATCH /photos/1
Content-Type: application/json-patch+json
Accept: application/json

[
  { "op": "replace", "path": "/links/author", "value": 2 }
]
```

#### To-Many Relationships

While to-many relationships are represented as a JSON array in a `GET`
response, they are updated as if they were a set.

To remove an element from a to-many relationship, use a `remove`
operation on `links/<name>/<id>`. To add an element, use an `add`
operation on `links/<name>/-`.

For example, for the following `GET` request:

```text
GET /photos/1
Content-Type: application/json

{
  "links": {
    "photos.author": "http://example.com/people/{photos.author}"
  },
  "photos": [{
    "id": "1",
    "href": "http://example.com/photos/1",
    "title": "Hamster",
    "src": "images/hamster.png",
    "links": {
      "comments": [ "1", "5", "12", "17" ]
    }
  }]
}
```

You could move comment 30 to this photo by issuing an `add` operation in
the `PATCH` request:

```text
PATCH /photos/1

[
  { "op": "add", "path": "/links/comments/-", "value": 30 }
]
```

To remove comment 5 from this photo, issue a `remove` operation:

```text
PATCH /photos/1

[
  { "op": "remove", "path": "links/comments/5" }
]
```

Note that to-many relationships have set-like behavior in JSON API to
limit the damage that can be caused by concurrent modifications.

### 204 No Content

If a server returns a `204 No Content` in response to a `PATCH` request,
it means that the update was successful, and that the client's current
attributes remain up to date.

### 200 OK

If the server accepts the update but also changes the document in other
ways than those specified by the `PATCH` request (for example, updating
the `updatedAt` attribute or a computed `sha`), it **MUST** return a
`200 OK` response.

The body of the response **MUST** be a valid JSON API response, as if a
`GET` request was made to the same URL.

### Other Responses

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics.

## Deletions

A JSON API document is *deleted* by making a `DELETE` request to the
document's URL.

```text
DELETE /photos/1
```

### 204 Responses

If a server returns a `204 No Content` in response to a `DELETE`
request, it means that the deletion was successful.

### Other Responses

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics.

## HTTP Caching

Servers **MAY** use HTTP caching headers (`ETag`, `Last-Modified`) in
accordance with the semantics described in HTTP 1.1.

## Compound Responses

Whenever a server returns a `200 OK` response in response to a creation,
update or deletion, it **MAY** include other documents in the JSON
document. The semantics of these documents are [the same][1] as when
additional documents are included in response to a `GET`.
