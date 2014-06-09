---
layout: page
title: "Format"
---

{% include status.md %}

## Document <a href="#document" id="document" class="headerlink">¶</a>

In this specification, the term "document" refers to a single object with a
set of attributes and relationships.

A JSON response may include multiple documents, as described in this
specification.

### Top Level <a href="#document-top-level" id="document-top-level" class="headerlink">¶</a>

The top-level of a JSON response will contain the primary document(s)
keyed by the plural form of the primary resource type.

The top-level of the JSON response **MAY** also have the following keys:

* `"meta"`: meta-information about a resource, such as pagination.
* `"links"`: URL templates to be used for expanding resources' relationships
  URLs.
* `"linked"`: a collection of documents, grouped by type, that are related to
  the primary document(s) and/or each other.

Each of these keys has a special meaning when included in the top level and
should not be used as a resource type in order to avoid conflicts.

No other keys should be present at the top level of the JSON response.

### Singular Resources <a href="#document-sigular-resources" id="document-sigular-resources" class="headerlink">¶</a>

Documents that represent singular resources are wrapped inside an array
and keyed by the plural form of the resource type:

```javascript
{
  "posts": [{
    "id": "1"
    // an individual post document
  }]
}
```

This simplifies processing, as you can know that documents will always be
wrapped in arrays.

The document **SHOULD** contain an `"id"` key.

### Resource Collections <a href="#document-resource-collections" id="document-resource-collections" class="headerlink">¶</a>

Documents that represent resource collections are also wrapped inside an array
and keyed by the plural form of the resource type:

```javascript
{
  "posts": [{
    "id": "1"
    // an individual post document
  }, {
    "id": "2"
    // an individual post document
  }]
}
```

Each document in the array **SHOULD** contain an `"id"` key.

### IDs <a href="#document-ids" id="document-ids" class="headerlink">¶</a>

The `"id"` key in a document represents a unique identifier for the underlying
resource, scoped to its type. It **MUST** be a string which **SHOULD** only
contain alphanumeric characters, dashes and underscores. It can be used with URL
templates to fetch related resources, as described below.


In scenarios where uniquely identifying information between client and server
is unnecessary (e.g., read-only, transient entities), JSON API allows for
omitting the `"id"` key.

NOTE: While an implementation could use the values of `"id"` keys as URLs
(which are unique string identifiers, after all), it is not generally
recommended. URLs can change, so they are unreliable for mapping a document to
any client-side models that represent the same resource. It is recommended that
URL values be left to the task of linking documents while `"id"` values remain
opaque to solely provide a unique identity within some type.

### Attributes <a href="#document-attributes" id="document-attributes" class="headerlink">¶</a>

There are three reserved attribute names in JSON API:

* `id`
* `href`
* `links`

Every other key in a document represents an attribute. An attribute's value may
be any JSON value.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase"
  }]
}
```

### Relationships <a href="#document-relationships" id="document-relationships" class="headerlink">¶</a>

The value of the `"links"` key is a JSON object that represents related
resources.

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

The link to each related resource **MUST** be one of the following:

* a string or number - to represent a single ID.
* an array of strings or numbers - to represent multiple IDs.
* a "link" object that contains one or more of the attributes:
  `"id"`, `"ids"`, `"href"` and `"type"`. Note that `"id"` and `"ids"` should
  never be present together.
* an array of "link" objects

NOTE: Use of a document level `"links"` object is generally discouraged because
root level URL Templates can usually provide the same data more concisely.
However, there may be situations where each document will have a URL that isn't
supported by the rigid structure of a template. In those cases, it may also be
necessary to include either `"id"` or `"ids"` for the related documents in a
compound document.

#### To-One Relationships <a href="#document-relationships-to-one-relationships" id="document-relationships-to-one-relationships" class="headerlink">¶</a>

A to-one relationship **MAY** be represented as a string or number value that
corresponds to the ID of a related resource.

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

It **MAY** alternatively be represented with a "link" object that contains one
or more of the attributes: `"id"`, `"href"` and `"type"`.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": {
        "href": "http://example.com/people/17",
        "id": "17",
        "type": "people"
      }
    }
  }]
}
```

An API that provides a to-one relationship as a URL **MUST** respond to a `GET`
request with the specified document with the specified URL.

In the above example, a `GET` request to `http://example.com/people/17` returns
a document containing the specified author.

#### To-Many Relationships <a href="#document-relationships-to-many-relationships" id="document-relationships-to-many-relationships" class="headerlink">¶</a>

A to-many relationship **MAY** be represented as an array of strings or numbers
corresponding to IDs of related resources.

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

It **MAY** alternatively be represented with a "link" object that contains one
or more of the attributes: `"ids"`, `"href"` and `"type"`.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": {
        "href": "http://example.com/comments/5,12,17,20",
        "ids": [ "5", "12", "17", "20" ],
        "type": "comments"
      }
    }
  }]
}
```

An API that provides a to-many relationship as a URL **MUST** respond to a
`GET` request with a list of the specified documents with the specified URL.

In the above example, a `GET` request to
`http://example.com/comments/5,12,17,20` returns a document containing the four
specified comments.

As another alternative, a to-many relationship **MAY** be represented as an
array of "link" objects that contain one or more of the attributes: `"id"`,
`"href"`, and `"type"`.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": [{
        "href": "http://example.com/comments/5",
        "id": "5",
        "type": "comments"
      },
      {
        "href": "http://example.com/comments/12",
        "id": "12",
        "type": "comments"
      }]
    }
  }]
}
```

In the above example, `GET` requests to `http://example.com/comments/5` and
`http://example.com/comments/12` return the respective comments.

NOTE: Given its verbosity, this third format should be used sparingly, but it
is helpful when the related resources have a variable `"type"`:

```javascript
{
  "posts": [{
    "id": "1",
    "title": "One Type Purr Author",
    "links": {
      "authors": [{
        "href": "http://example.com/people/9",
        "id": "9",
        "type": "people"
      },
      {
        "href": "http://example.com/cats/1",
        "id": "1",
        "type": "cats"
      }]
    }
  }]
}
```

### URL Template Shorthands <a href="#document-url-template-shorthands" id="document-url-template-shorthands" class="headerlink">¶</a>

When returning a list of documents from a response, a top-level `"links"`
object **MAY** be used to specify a URL template that should be used for all
documents.

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

In this example, fetching `http://example.com/posts/1/comments` will fetch
the comments for `"Rails is Omakase"` and fetching `http://example.com/posts/2/comments`
will fetch the comments for `"The Parley Letter"`.

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
The [URL template specification][3] specifies that the default explosion is to
percent encode the array members (e.g. via `encodeURIComponent()` in JavaScript)
and join them by a comma, so in this example, fetching
`http://example.com/comments/1,2,3,4` will return a list of all comments.

[3]: https://tools.ietf.org/html/rfc6570

This example shows how you can start with a list of IDs and then upgrade to
specifying a different URL pattern than the default.

The top-level `"links"` key has the following behavior:

* Each key is a dot-separated path that points at a repeated relationship.
  For example `"posts.comments"` points at the `"comments"` relationship in
  each repeated document under `"posts"`.
* The value of each key is interpreted as a URL template.
* For each document that the path points to, act as if it specified a
  relationship formed by expanding the URL template with the non-URL value
  actually specified.

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

In this example, the author URL for all three posts is
`http://example.com/people/12`.

Top-level URL templates allow you to specify relationships as IDs, but without
requiring that clients hard-code information about how to form the URLs.

NOTE: In case of conflict, an individual document's `links` object will take
precedence over a top-level `links` object.

### Compound Documents <a href="#document-compound-documents" id="document-compound-documents" class="headerlink">¶</a>

To save HTTP requests, it may be convenient to send related documents along
with the requested documents.

Related documents **MUST** be included in a top level `"linked"` object, in
which they are grouped together in arrays according to their type.

The type of each relationship **MAY** be specified in the `"links"` object with
the `"type"` key. This facilitates lookups of related documents by the client.

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
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "9",
      "comments": [ "1", "2", "3" ]
    }}, {
    "id": "2",
    "title": "The Parley Letter",
    "links": {
      "author": "9",
      "comments": [ "4", "5" ]
   }}, {
    "id": "1",
    "title": "Dependency Injection is Not a Virtue",
    "links": {
      "author": "9",
      "comments": [ "6" ]
    }
  }],
  "linked": {
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
}
```

This approach ensures that a single canonical representation of each document
is returned with each response, even when the same document is referenced
multiple times (in this example, the author of the three posts). Along these
lines, if a primary document is linked to another primary or related document,
it should not be duplicated within the `"linked"` object.

By always combining documents in this way, a client can consistently extract and
wire up references.

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

## Fetching <a href="#fetching" id="fetching" class="headerlink">¶</a>

### Inclusion of Related Documents <a href="#fetching-inclusion-of-related-documents" id="fetching-inclusion-of-related-documents" class="headerlink">¶</a>

A server **MAY** choose to support returning compound documents that include
both primary and related documents.

An endpoint **MAY** return documents related to the primary document(s) by
default.

An endpoint **MAY** also support custom inclusion of related documents based
upon an `include` request parameter. This parameter should specify the path to
one or more documents relative to the primary document. If this parameter is
used, **ONLY** the requested related documents should be returned alongside the
primary document(s).

For instance, comments could be requested with a post:

```text
GET /posts/1?include=comments
```

In order to request documents related to other documents, the dot-separated path
of each document should be specified:

```text
GET /posts/1?include=comments.author
```

Note: a request for `comments.author` should not automatically also include
`comments` in the response (although comments will obviously need to be
queried in order to fulfill the request for their authors).

Multiple related documents could be requested in a comma-separated list:

```text
GET /posts/1?include=author,comments,comments.author
```

### Sparse Fieldsets <a href="#fetching-sparse-fieldsets" id="fetching-sparse-fieldsets" class="headerlink">¶</a>

A server **MAY** choose to support requests to return only specific fields for
documents.

An endpoint **MAY** support requests that specify fields for the primary document
type with a `fields` parameter.

```text
GET /people?fields=id,name,age
```

An endpoint **MAY** support requests that specify fields for any document type
with a `fields[DOCUMENT_TYPE]` parameter.

```text
GET /posts?include=author&fields[posts]=id,title&fields[people]=id,name
```

An endpoint SHOULD return a default set of fields for a document if no fields
have been specified for its type, or if the endpoint does not support use of
either `fields` or `fields[DOCUMENT_TYPE]`.

Note: `fields` and `fields[DOCUMENT_TYPE]` can not be mixed. If the latter
format is used, then it must be used for the primary document type as well.

### Sorting <a href="#fetching-sorting" id="fetching-sorting" class="headerlink">¶</a>

A server **MAY** choose to support requests to sort documents according to
one or more criteria.

An endpoint **MAY** support requests to sort the primary document type with a
`sort` parameter.

```text
GET /people?sort=age
```

An endpoint **MAY** support multiple sort criteria by allowing comma-separated
fields as the value for `sort`. Sort criteria should be applied in the order
specified.

```text
GET /people?sort=age,name
```

The default sort order **SHOULD** be ascending. A `-` prefix on any sort field
specifies a descending sort order.

```text
GET /posts?sort=-created,title
```

The above example should return the newest posts first. Any posts created on the
same date will then be sorted by their title in ascending alpabetical order.

An endpoint **MAY** support requests to sort any document type with a
`sort[DOCUMENT_TYPE]` parameter.

```text
GET /posts?include=author&sort[posts]=-created,title&sort[people]=name
```

If no sort order is specified, or if the endpoint does not support use of either
`sort` or `sort[DOCUMENT_TYPE]`, then the endpoint **SHOULD** return documents
sorted with a repeatable algorithm. In other words, documents **SHOULD** always
be returned in the same order, even if the sort criteria aren't specified.

Note: `sort` and `sort[DOCUMENT_TYPE]` can not be mixed. If the latter
format is used, then it **MUST** be used for the primary document type as well.

## Updating <a href="#updating" id="updating" class="headerlink">¶</a>

### URLs <a href="#updating-urls" id="updating-urls" class="headerlink">¶</a>

Update URLs are determined the same way as `GET` URLs.

### Creating a Document <a href="#updating-creating-a-document" id="updating-creating-a-document" class="headerlink">¶</a>

A JSON API document is *created* by making a `POST` request to the URL that
represents a collection of documents that the new document should belong to.
While this method is preferred, you can always use anything that's valid with
RFC 2616, as long as it's compliant. For example, PUT can be used to create
documents if you wish. We believe most people will generally use POST, so we'll
elaborate on it further below.

In general, this is a collection scoped to the **type** of document.

The request **MUST** contain a `Content-Type` header whose value is
`application/vnd.api+json`. It **MUST** also include `application/vnd.api+json`
as the only or highest quality factor.

Its root key **MUST** be the same as the root key provided in the
server's response to `GET` request for the collection.

For example, assuming the following request for the collection of
photos:

```text
GET /photos

HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "photos": [{
    "id": "1",
    "title": "Mustaches on a Stick",
    "src": "http://example.com/images/mustache.png"
  }]
}
```

You would create a new photo by `POST`ing to the same URL:

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "photos": [{
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }]
}
```

#### Client-Side IDs <a href="#updating-creating-a-document-client-side-ids" id="updating-creating-a-document-client-side-ids" class="headerlink">¶</a>

A server **MAY** require a client to provide IDs generated on the
client. If a server wants to request client-generated IDs, it **MUST**
include a `meta` section in all of its responses with the key
`client-ids` and the value `true`:

```text
GET /photos

HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

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
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "photos": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }]
}
```

#### Response <a href="#updating-creating-a-document-response" id="updating-creating-a-document-response" class="headerlink">¶</a>

A server **MUST** respond to a successful document creation request
according to [`HTTP semantics`][2]

[2]: http://tools.ietf.org/html/draft-ietf-httpbis-p2-semantics-22#section-6.3

The response **MUST** include a `Location` header identifying the primary
document created by the request. It **SHOULD** also include a request body
describing that document. If absent, the client **SHOULD** treat the
transmitted document as accepted without modification.

The response body **MAY** include an `href` key in the attributes section. When present, the value of the `href`
attribute **MUST** match the URI in the `Location` header.

Example:

```text
HTTP/1.1 201 Created
Location: http://example.com/photos/12
Content-Type: application/vnd.api+json

{
  "photos": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "href": "http://example.com/photos/12",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }]
}
```

##### Other Responses <a href="#updating-creating-a-document-response-other-responses" id="updating-creating-a-document-response-other-responses" class="headerlink">¶</a>

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics.

## Updating a Document (`PATCH`) <a href="#updating-a-document" id="updating-a-document" class="headerlink">¶</a>

The body of the `PATCH` request **MUST** be in JSON format with a `Content-Type`
header of `application/json-patch+json`.

It **MUST** be a valid [JSON Patch (RFC 6902)][4] document.

[4]: http://tools.ietf.org/html/rfc6902

### Attributes <a href="#updating-a-document-attributes" id="updating-a-document-attributes" class="headerlink">¶</a>

To update an attribute, include a `replace` operation in the JSON Patch
document. The name of the property to replace **MUST** be the same as
the attribute name in the original `GET` request.

For example, consider this `GET` request:

```text
GET /photos/1

HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

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
  { "op": "replace", "path": "/photos/0/src", "value": "http://example.com/hamster.png" }
]
```

For attributes, only the `replace` operation is supported at the current
time.

### Relationships <a href="#updating-a-document-relationships" id="updating-a-document-relationships" class="headerlink">¶</a>

Relationship updates are represented as JSON Patch operations on the
`links` document.

#### To-One Relationships <a href="#updating-a-document-relationships-to-one-relationships" id="updating-a-document-relationships-to-one-relationships" class="headerlink">¶</a>

To update a to-one relationship, the client **MUST** issue a `PATCH`
request that includes a `replace` operation on the relationship
`links/<name>`.

For example, for the following `GET` request:

```text
GET /photos/1
Content-Type: application/vnd.api+json

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
Accept: application/vnd.api+json

[
  { "op": "replace", "path": "/photos/0/links/author", "value": "2" }
]
```

#### To-Many Relationships <a href="#updating-a-document-relationships-to-many-relationships" id="updating-a-document-relationships-to-many-relationships" class="headerlink">¶</a>

While to-many relationships are represented as a JSON array in a `GET`
response, they are updated as if they were a set.

To remove an element from a to-many relationship, use a `remove`
operation on `links/<name>/<id>`. To add an element, use an `add`
operation on `links/<name>/-`.

For example, for the following `GET` request:

```text
GET /photos/1
Content-Type: application/vnd.api+json

{
  "links": {
    "photos.comments": "http://example.com/comments/{photos.comments}"
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
  { "op": "add", "path": "/photos/0/links/comments/-", "value": "30" }
]
```

To remove comment 5 from this photo, issue a `remove` operation:

```text
PATCH /photos/1

[
  { "op": "remove", "path": "/photos/0/links/comments/5" }
]
```

Note that to-many relationships have set-like behavior in JSON API to
limit the damage that can be caused by concurrent modifications.

### 204 No Content <a href="#updating-a-document-204-no-content" id="updating-a-document-204-no-content" class="headerlink">¶</a>

If a server returns a `204 No Content` in response to a `PATCH` request,
it means that the update was successful, and that the client's current
attributes remain up to date.

### 200 OK <a href="#updating-a-document-200-ok" id="updating-a-document-200-ok" class="headerlink">¶</a>

If the server accepts the update but also changes the document in other
ways than those specified by the `PATCH` request (for example, updating
the `updatedAt` attribute or a computed `sha`), it **MUST** return a
`200 OK` response.

The body of the response **MUST** be a valid JSON API response, as if a
`GET` request was made to the same URL.

### Other Responses <a href="#updating-a-document-other-responses" id="updating-a-document-other-responses" class="headerlink">¶</a>

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics.

## Deletions <a href="#deletions" id="deletions" class="headerlink">¶</a>

A JSON API document is *deleted* by making a `DELETE` request to the
document's URL.

```text
DELETE /photos/1
```

### 204 Responses <a href="#deletions-204-responses" id="deletions-204-responses" class="headerlink">¶</a>

If a server returns a `204 No Content` in response to a `DELETE`
request, it means that the deletion was successful.

### Other Responses <a href="#deletions-other-responses" id="deletions-other-responses" class="headerlink">¶</a>

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics.

## HTTP Caching <a href="#http-caching" id="http-caching" class="headerlink">¶</a>

Servers **MAY** use HTTP caching headers (`ETag`, `Last-Modified`) in
accordance with the semantics described in HTTP 1.1.

## Compound Responses <a href="#compound-responses" id="compound-responses" class="headerlink">¶</a>

Whenever a server returns a `200 OK` response in response to a creation,
update or deletion, it **MAY** include other documents in the JSON
document. The semantics of these documents are [the same][1] as when
additional documents are included in response to a `GET`.
