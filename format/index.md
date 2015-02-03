---
layout: page
title: "Format"
---

{% include status.md %}

## Introduction <a href="#introduction" id="introduction" class="headerlink"></a>

JSON API is a specification for how a client should request that resources be
fetched or modified, and how a server should respond to those requests.

JSON API is designed to minimize both the number of requests and the amount of
data transmitted between clients and servers. This efficiency is achieved
without compromising readability, flexibility, or discoverability.

JSON API requires use of the JSON API media type
([`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json))
for exchanging data.

## Conventions <a href="#conventions" id="conventions" class="headerlink"></a>

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be
interpreted as described in RFC 2119
[[RFC2119](http://tools.ietf.org/html/rfc2119)].

## Extending <a href="#extending" id="extending" class="headerlink"></a>

The base JSON API specification **MAY** be extended to support additional
capabilities.

Servers that support one or more extensions to JSON API **SHOULD** return
those extensions in every response in the `ext` media type parameter of the
`Content-Type` header. The value of the `ext` parameter **MUST** be a
comma-separated (U+002C COMMA, ",") list of extension names.

For example: a response that includes the header `Content-Type:
application/vnd.api+json; ext=bulk,patch` indicates that the server supports
both the "bulk" and "patch" extensions.

Clients **MAY** request a particular media type extension by including the
its name in the `ext` media type parameter with the `Accept` header. Servers
that do not support a requested extension **MUST** return a `415 Unsupported
Media Type` status code.  

## Document Structure <a href="#document-structure" id="document-structure" class="headerlink"></a>

This section describes the structure of a JSON API document, which is identified
by the media type [`application/vnd.api+json`](http://www.iana.org/assignments
/media-types/application/vnd.api+json). JSON API documents are defined in
JavaScript Object Notation (JSON)
[[RFC4627](http://tools.ietf.org/html/rfc4627)].

Although the same media type is used for both request and response documents,
certain aspects are only applicable to one or the other. These differences are
called out below.

### Top Level <a href="#document-structure-top-level" id="document-structure-top-level" class="headerlink"></a>

A JSON object **MUST** be at the root of every JSON API response. This object
defines a document's "top level".

The document's "primary data" is a representation of the resource or
collection of resources primarily targeted by a request.

The primary data **MUST** appear under a top-level key named `"data"`. The
primary data **MUST** be either a single resource object or an array of
resource objects.

<!-- <div class="example"> -->
```javascript
{
  "data": {
    "type": "posts",
    "id": "1",
    // ... attributes of this post
  }
}
```
<!-- </div> -->

A document's top level **MAY** also have the following members:

* `"meta"`: non-standard meta-information about the primary data.
* `"links"`: URLs related to the primary data.
* `"linked"`: a list of resource objects that are linked to the primary data
  and/or each other ("linked resources").

If any of these members appears in the top-level of a response, their values
**MUST** comply with this specification.

The top level of a document **MUST NOT** contain any additional members.

### Resource Objects <a href="#document-structure-resource-objects" id="document-structure-resource-objects" class="headerlink"></a>

"Resource objects" appear in a JSON API document to represent primary data
and linked resources.

Here's how a post (i.e. a resource of type "posts") might appear in a document:

```javascript
// ...
{
  "type": "posts",
  "id": "1",
  "title": "Rails is Omakase"
}
// ...
```

#### Resource Attributes <a href="#document-structure-resource-object-attributes" id="document-structure-resource-object-attributes" class="headerlink"></a>

A resource object **MUST** contain at least the following top-level members:

* `"id"`
* `"type"`

In addition, a resource object **MAY** contain any of these top-level members:

* `"links"`: information about a resource's relationships (described
  below).
* `"meta"`: non-standard meta-information about a resource that can not be
  represented as an attribute or relationship.

Any other member in a resource object represents an "attribute", which may
contain any valid JSON value.

Attribute names **MUST** consist of only lower case alphanumeric characters
and dashes (U+002D: HYPHEN-MINUS, "-"). Attribute names **MUST NOT** begin
with a dash.

> Note: Although has-one foreign keys are often stored as columns in a
database alongside other fields, foreign keys **MUST NOT** be included as
a resource's attributes. Relationship data **MUST** all be represented under a
resource's `links` object, as described below.

#### Resource Identification <a href="#document-structure-resource-identification" id="document-structure-resource-identification" class="headerlink"></a>

Every JSON API resource object is uniquely identified by a combination of
its `type` and `id` members. This identification is used for linkage in
compound documents and batch operations that modify multiple resources at a
time.

A resource object's `type` and `id` pair **MUST** refer to a single, unique
resource.

#### Resource Types <a href="#document-structure-resource-types" id="document-structure-resource-types" class="headerlink"></a>

Each resource object **MUST** contain a `type` member, whose value **MUST**
be a string. The `type` is used to describe resource objects that share
common attributes and relationships.

> Note: This spec is agnostic about inflection rules, so `type` can be either
plural or singular. However, the same value should be used consistently
throughout an implementation.

#### Resource IDs <a href="#document-structure-resource-ids" id="document-structure-resource-ids" class="headerlink"></a>

Each resource object **MUST** contain an `id` member, whose value **MUST**
be a string.

#### Links

The value of the `"links"` key is a JSON object (a "links object") that
represents linked resources, keyed by the name of each association.

The key `"self"` is reserved within the links object for the resource URL,
as described below.

Association names **MUST** consist of only lower case alphanumeric
characters and dashes (U+002D: HYPHEN-MINUS, "-"). Association names **MUST
NOT** begin with a dash.

#### Resource URLs <a href="#document-structure-resource-urls" id="document-structure-resource-urls" class="headerlink"></a>

A resource object **MAY** include a URL in its links object, keyed by
`"self"`, that identifies the resource represented by the resource object.

```json
// ...
{
  "type": "posts",
  "id": "1",
  "title": "Rails is Omakase",
  "links": {
    "self": "http://example.com/posts/1"
  }
}
// ...
```

A server **MUST** respond to a `GET` request to the specified URL with a
response that includes the resource as the primary data.

#### Resource Relationships <a href="#document-structure-resource-relationships" id="document-structure-resource-relationships" class="headerlink"></a>

A resource object **MAY** contain references to other resource objects
("relationships"). Relationships may be to-one or to-many. Relationships
can be specified by including a member, keyed by the name of the
relationship (anything but `"self"`), in a resource's links object.

The value of a relationship **MUST** be one of the following:

* A string, which represents a URL for the related resource(s) (a "related
  resource URL"). When fetched, it returns the related resource object(s) as the
  response's primary data. For example, a `post`'s `comments` could specify a
  URL that returns a list of comment resource objects when retrieved through a
  `GET` request.
* An object (a "link object").

If a relationship is provided as a link object, it **MUST** contain at least
one of the following:

* A `self` member, whose value is a URL for the relationship itself (a
  "relationship URL"). This URL allows the client to directly manipulate the
  relationship. For example, it would allow a client to remove an `author` from
  a `post` without deleting the `people` resource itself.
* A `resource` member, whose value is a related resource URL (as defined above).
* Linkage to other resource objects ("object linkage") included in a compound
  document. This allows a client to link together all of the resource objects
  included in a compound document without having to `GET` one of the
  relationship URLs. Linkage **MUST** be expressed as:
  * `type` and `id` members for to-one relationships.
  * `type` and `ids` members for homogenous to-many relationships.
  * A `data` member whose value is an array of objects each containing `type`
    and `id` members for heterogenous to-many relationships.
* A `"meta"` member that contains non-standard meta-information about the
  relationship.

A link object that represents a to-many relationship **MAY** also contain
pagination links, as described below.

If a link object refers to resource objects included in the same compound
document, it **MUST** include object linkage to those resource objects.

<!-- <div class="example"> -->
For example, the following post is associated with an `author` and `comments`:

```javascript
// ...
{
  "type": "posts",
  "id": "1",
  "title": "Rails is Omakase",
  "links": {
    "self": "http://example.com/posts/1",
    "author": {
      "self": "http://example.com/posts/1/links/author"
      "resource": "http://example.com/posts/1/author",
      "type": "people",
      "id": "9"
    },
    "comments": {
      "resource": "http://example.com/posts/1/comments"
    }
  }
}
// ...
```

The `author` relationship includes a URL for the relationship itself (which
allows the client to change the related author without deleting the `people`
object), a URL to fetch the resource objects, and linkage information for
the current compound document.

The `comments` relationship is simpler: it just provides a URL to fetch the
comments. The following resource object, which provides the `comments`
relationship as a string value rather than an object, is equivalent:

```javascript
// ...
{
  "type": "posts",
  "id": "1",
  "title": "Rails is Omakase",
  "links": {
    "self": "http://example.com/posts/1",
    "author": {
      "self": "http://example.com/posts/1/links/author"
      "resource": "http://example.com/posts/1/author",
      "type": "people",
      "id": "9"
    },
    "comments": "http://example.com/posts/1/comments"
  }
}
// ...
```

<!-- </div> -->

### Compound Documents <a href="#document-structure-compound-documents" id="document-structure-compound-documents" class="headerlink"></a>

To reduce the number of HTTP requests, responses **MAY** allow for the
inclusion of linked resources along with the requested primary resources.
Such responses are called "compound documents".

In a compound document, linked resources **MUST** be included as an array of
resource objects in a top level `"linked"` member.

<!-- <div class="example"> -->
A complete example document with multiple included relationships:

```json
{
  "data": [{
    "type": "posts",
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "self": "http://example.com/posts/1",
      "author": { "resource": "http://example.com/posts/1/author", "type": "people", "id": "9" },
      "comments": { "resource": "http://example.com/posts/1/comments", "type": "comments", "ids": ["5", "12"] },
    }
  }],
  "linked": [{
    "type": "people",
    "id": "9",
    "name": "dgeb"
    "links": {
      "self": "http://example.com/people/9"
    }
  }, {
    "type": "comments",
    "id": "5"
    "body": "First!",
    "links": {
      "self": "http://example.com/comments/5"
    }
  }, {
    "type": "comments",
    "id": "12"
    "body": "Second!",
    "links": {
      "self": "http://example.com/comments/12"
    }
  }]
}
```
<!-- </div> -->

A compound document **MUST NOT** include more than one resource object for
each `type` and `id` pair.

> Note: In a single document, you can think of the `type` and `id` as a
composite key that uniquely references resource objects in another part of
the document.

> Note: This approach ensures that a single canonical resource object is
returned with each response, even when the same resource is referenced
multiple times.

### Meta information <a href="#document-structure-meta" id="document-structure-meta" class="headerlink"></a>

As discussed above, the document **MAY** be extended to include
meta-information in several locations: at the top-level, within resource
objects, and within link objects.

Any `"meta"` members **MUST** have an object value, the contents of which
can be used for custom extensions.

### Top-level Links <a href="#document-structure-top-level-links" id="document-structure-top-level-links" class="headerlink"></a>

The top-level links object **MAY** contain the following members:

* `"self"` - a self link for the primary data.
* Pagination links for the primary data, as described below.

## Fetching Resources <a href="#fetching" id="fetching" class="headerlink"></a>

A resource, or collection of resources, can be fetched by sending a `GET`
request to an endpoint.

JSON API requests **MUST** include an `Accept` header specifying the JSON
API media type.

Responses can be further refined with the optional features described below.

### Inclusion of Linked Resources <a href="#fetching-includes" id="fetching-includes" class="headerlink"></a>

An endpoint **MAY** return resources linked to the primary data by default.

An endpoint **MAY** also support custom inclusion of linked resources based
upon an `include` request parameter. This parameter **MUST** specify the
relationship using the name used in the `links` section of the primary data.

If a client supplies an `include` parameter, the server **MUST NOT** include
other resource objects in the `linked` section of the compound document.

The value of the `include` parameter is a comma-separated (U+002C COMMA,
",") list of relationship paths. A relationship path is a dot-separated
(U+002E FULL-STOP, ".") list of relationship names. Each relationship name
**MUST** be identical to the key in the `links` section of its parent
resource object.

> Note: For example, a relationship path could be `comments.author`, where
`comments` is a relationship listed under a `posts` resource object, and
`author` is a relationship listed under a `comments` resource object.

<!-- <div class="example"> -->
For instance, comments could be requested with a post:

```text
GET /posts/1?include=comments
```

In order to request resources linked to other resources, a dot-separated path
for each relationship name can be specified:

```text
GET /posts/1?include=comments.author
```

> Note: A request for `comments.author` should not automatically also
include `comments` in the response. This can happen if the client already
has the `comments` locally, and now wants to fetch the associated authors
without fetching the comments again.

Multiple linked resources can be requested in a comma-separated list:

```text
GET /posts/1?include=author,comments,comments.author
```

<!-- </div> -->

### Sparse Fieldsets <a href="#fetching-sparse-fieldsets" id="fetching-sparse-fieldsets" class="headerlink"></a>

A client **MAY** request that an endpoint return only specific fields in the
response on a per-type basis by including a `fields[TYPE]` parameter. The
value of the parameter refers to an attribute name or a relationship name.

```text
GET /posts?include=author&fields[posts]=id,title&fields[people]=id,name
```

If a client requests a restricted set of fields, an endpoint **MUST NOT** include other
fields in the response.

### Sorting <a href="#fetching-sorting" id="fetching-sorting" class="headerlink"></a>

A server **MAY** choose to support requests to sort resource collections
according to one or more criteria.

An endpoint **MAY** support requests to sort the primary resource type with a
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
same date will then be sorted by their title in ascending alphabetical order.

### Pagination <a href="#fetching-pagination" id="fetching-pagination" class="headerlink"></a>

A server **MAY** choose to limit the number of resources returned in a response
to a subset ("page") of the whole set available.

A server **MAY** provide links to traverse a paginated data set ("pagination
links").

Pagination links **MUST** appear in the link object that corresponds to a
collection. To paginate the primary data, include pagination links in the
top-level `links` object. To paginate a linked collection returned in a
compound document, include pagination links in the corresponding link
object.

The following keys **MUST** be used for pagination links:

* `"first"` - the first page of data
* `"last"` - the last page of data
* `"prev"` - the previous page of data
* `"next"` - the next page of data

Keys **MUST** either be omitted or have a `null` value to indicate that a
particular link is unavailable.

Concepts of order, as expressed in the naming of pagination links, **MUST**
remain consistent with JSON API's [sorting rules](#fetching-sorting).

The `page` query parameter is reserved for servers to use to specify pagination.

> Note: JSON API is agnostic about the pagination strategy used by a server.
Effective pagination strategies include (but are not limited to):
page-based, offset-based, and cursor-based. The `page` query parameter can
be used as a basis for any of these strategies. For example, a page-based
strategy might use query parameters such as `page[number]` and `page[size]`,
an offset-based strategy might use `page[offset]` and `page[limit]`, while a
cursor-based strategy might use `page[cursor]`.

### Filtering <a href="#fetching-filtering" id="fetching-filtering" class="headerlink"></a>

The `filter` query parameter is reserved for servers to use for filtering data.

> Note: JSON API is agnostic about the filtering strategies supported by a
server. The `filter` query parameter can be used as the basis for any number of
filtering strategies.

## Creating, Updating and Deleting Resources <a href="#crud" id="crud" class="headerlink"></a>

A server **MAY** allow resources of a given type to be created. It **MAY** also allow
existing resources to be modified or deleted.

Any requests that contain content **MUST** include a `Content-Type` header whose
value is `application/vnd.api+json`.

A request **MUST** completely succeed or fail (in a single "transaction"). No
partial updates are allowed.

### Creating Resources <a href="#crud-creating" id="crud-creating" class="headerlink"></a>

A request to create an individual resource **MUST** include a single data object. The
data object **MUST** contain at least a `type` member.

> Note: The `type` member is required throughout requests and responses in JSON API
> for consistency. Picking and choosing when it is required would be confusing; it
> would be hard to remember when it was required and when it was not. In this case,
> it may be required when `POST`ing to an endpoint representing heterogeneous data.

For instance, a new photo might be created with the following request:

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "photos",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

#### Client-Generated IDs <a href="#crud-creating-client-ids" id="crud-creating-client-ids" class="headerlink"></a>

A server **MAY** accept a client-generated ID along with a request to create
a resource. An ID **MUST** be specified with an `"id"` key, the value of
which **MUST** be a universally unique identifier. The client **SHOULD** use
a properly generated and formatted *UUID* as described in RFC 4122
[[RFC4122](http://tools.ietf.org/html/rfc4122.html)].

> NOTE: In some use-cases, such as importing data from another source, it
may be possible to use something other than a UUID that is still guaranteed
to be globally unique. Do not use anything other than a UUID unless you are
100% confident that the strategy you are using is indeed globally unique.

For example:

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "photos",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

#### Responses <a href="#crud-creating-responses" id="crud-creating-responses" class="headerlink"></a>

##### 201 Created <a href="#crud-creating-responses-201" id="crud-creating-responses-201" class="headerlink"></a>

A server **MUST** respond to a successful resource creation request according to
[`HTTP semantics`](http://tools.ietf.org/html/draft-ietf-
httpbis-p2-semantics-22#section-6.3).

The response **MUST** include a `Location` header identifying the location
of the newly created resource.

If a `POST` request did not include a [Client-Generated
ID](#crud-creating-client-ids), and a resource has been created, the server
**MUST** return a `201 Created` status code.

The response **MUST** also include a document that contains the primary
resource created.

If the data object returned by the response contains a `self` key in its
`links` member, the value of the `self` member **MUST** match the value of
the `Location` header.

```text
HTTP/1.1 201 Created
Location: http://example.com/photos/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "photos",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png",
    "links": {
      "self": "http://example.com/photos/550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

If a `POST` request *did* include a [Client-Generated
ID](#crud-creating-client-ids), the server **MUST** return either a `201
Created` status code and response document (as described above) or a `204 No
Content` status code with no response document.

> Note: If a `204` response is received the client should consider the data
object sent in the request to be accepted by the server, as if the server
had returned it back in a `201` response.

##### 409 Conflict <a href="#crud-creating-responses-409" id="crud-creating-responses-409" class="headerlink"></a>

A server **MUST** return `409 Conflict` when processing a `POST` request to
create a resource with a client-generated ID that already exists.

##### Other Responses <a href="#crud-creating-responses-other" id="crud-creating-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

### Updating Resources <a href="#crud-updating" id="crud-updating" class="headerlink"></a>

To update an individual resource send a `PUT` request to the URL that
represents the resource. The request **MUST** include a single top-level
resource object.

The URL for a resource can be obtained:

* from the `self` link in the resource object
* for a *data object*, the original URL that was used to `GET` the document

For example:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "title": "To TDD or Not"
  }
}
```

If a request does not include all of the fields for a resource, the server
**MUST** interpret the missing fields as if they were included together with
their current values. It **MUST NOT** interpret them as `null` values.

> Note: Because the resources represented by JSON API have a list of known
fields, the server *must* interpret the missing attributes in some way.
Choosing to interpret them as `null` values would be just as arbitrary as
choosing to interpret them as containing their current values, and the
dominant real-world practice is to interpret such a request as a request for
a partial update.

For example, the following `PUT` request is interpreted as a request to
update only the `title` and `text` attributes of an article:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "title": "To TDD or Not",
    "text": "TLDR; It's complicated... but check your test coverage regardless."
  }
}
```

#### Responses <a href="#crud-updating-responses" id="crud-updating-responses" class="headerlink"></a>

##### 204 No Content <a href="#crud-updating-responses-204" id="crud-updating-responses-204" class="headerlink"></a>

A server **MAY** return a `204 No Content` status code if an update is
successful and the client's current attributes remain up to date.

##### 200 OK <a href="#crud-updating-responses-200" id="crud-updating-responses-200" class="headerlink"></a>

If a server accepts an update but also changes the resource(s) in other ways
than those specified by the request (for example, updating the `updatedAt`
attribute or a computed `sha`), it **MUST** return a `200 OK` response.

The response document for a `200 OK` **MUST** include a representation of
the updated resource(s) as if a `GET` request was made to the request URL.

##### 404 Not Found

A server **MUST** return `404 Not Found` when processing a request to modify
a resource that does not exist.

##### 409 Conflict

A server **MAY** return `409 Conflict` when processing a `PUT` request to
update a resource if that update would violate other server-enforced
constraints (such as a uniqueness constraint on a field other than `id`).

##### Other Responses <a href="#crud-updating-responses-other" id="crud-updating-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

### Deleting Resources <a href="#crud-deleting" id="crud-deleting" class="headerlink"></a>

An individual resource can be *deleted* by making a `DELETE` request to the
resource's URL:

```text
DELETE /photos/1
```

#### Responses <a href="#crud-deleting-responses" id="crud-deleting-responses" class="headerlink"></a>

##### 204 No Content <a href="#crud-deleting-responses-204" id="crud-deleting-responses-204" class="headerlink"></a>

A server **MUST** return a `204 No Content` status code if a delete request is
successful.

##### 404 Not Found <a href="#crud-deleting-responses-404" id="crud-deleting-responses-404" class="headerlink"></a>

A server **MUST** return `404 Not Found` when processing a request to delete
a resource that does not exist.

##### Other Responses <a href="#crud-deleting-responses-other" id="crud-deleting-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

### Updating Relationships <a href="#crud-updating-relationships" id="crud-updating-relationships" class="headerlink"></a>

JSON API provides a mechanism for updating a relationship without modifying
the resources involved in the relationship, and without exposing the
underlying server semantics (for example, foreign keys).

> Note: For example, if a post has many authors, it is possible to remove
one of the authors from the post without deleting the person itself.
Similarly, if a post has many tags, it is possible to add or remove tags.
Under the hood on the server, the first of these examples might be
implemented with a foreign key, while the second could be implemented with a
join table, but the JSON API protocol would be the same in both cases.

> Note: A server may choose to delete the underlying resource if a
relationship is deleted (as a garbage collection measure).

#### Updating To-One Relationships <a href="#crud-updating-to-one-relationships" id="crud-updating-to-one-relationships" class="headerlink"></a>

A client can update a to-one relationships along with other attributes by
including them in a `links` object within the resource object in a `PUT`
request.

If a to-one relationship is provided in the `links` section of a resource
object in a `PUT` request, it **MUST** be one of:

* an object with `type` and `id` members corresponding to the related resource
* `null`, to remove the relationship

<!-- <div class="example"> -->

For instance, the following `PUT` request will update the `title` attribute
and `author` relationship of an article:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "title": "Rails is a Melting Pot",
    "links": {
      "author": { "type": "people", "id": "1" }
    }
  }
}
```

<!-- </div> -->

> TODO: separate subheading? YES

If a resource object includes a relationship URL in its *link object*, the
server **MUST** update the relationship if it receives a `PUT` request to
that URL.

The `PUT` request **MUST** include a top-level member named `data` containing
one of:

* an object with `type` and `id` members corresponding to the related resource
* `null`, to remove the relationship

<!-- <div class="example"> -->
```text
PUT /articles/1/links/author
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "people", "id": "12" }
}
```
<!-- </div> -->

#### Updating To-Many Relationships <a href="#crud-updating-to-many-relationships" id="crud-updating-to-many-relationships" class="headerlink"></a>

A client can update a to-many relationship together with other attributes by
including them in a `links` object within the document in a `PUT` request.

If a to-many relationship is included in the `links` section of a resource
object, it **MUST** be an object containing:

* `type` and `ids` members for homogenous to-many relationships; to clear the
  relationship, set the `ids` member to `[]`
* a `data` member whose value is an array of objects each containing `type` and
  `id` members for heterogenous to-many relationships; to clear the
  relationship, set the `data` member to `[]`

<!-- <div class="example"> -->

For instance, the following `PUT` request performs a complete replacement of
the `tags` for an article:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "title": "Rails is a Melting Pot",
    "links": {
      "tags": { "type": "tags", "ids": ["2", "3"] }
    }
  }
}
```

<!-- </div> -->

A server **MAY** reject an attempt to do a full replacement of a to-many
relationship. In such a case, the server **MUST** reject the entire update,
and return a `403 Forbidden` response.

> Note: Since full replacement may be a very dangerous operation, a server
may choose to disallow it. A server may reject full replacement if it has
not provided the client with the full list of associated objects, and does
not want to allow deletion of records the client has not seen.

If the data object included a relationship URL for the relationship in the
*link object*, the server **MUST** update the relationship if it receives
a `POST`, `PUT` or `DELETE` request to that URL.

If the client makes a `PUT` request to the *relationship URL*, the server
**MUST** either completely replace every member of the relationship or return
a `403 Forbidden` response if complete replacement is not allowed.

The body of the request **MUST** contain a `data` member, whose value is the
same as the above-described `links` section.

<!-- <div class="example"> -->
```text
PUT /articles/1/links/tags
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "tags", "ids": ["2", "3"] }
}
```
<!-- </div> -->

If the client makes a `POST` request to the *relationship URL*, the server
**MUST** append the specified members to the relationship using set
semantics. This means that if a given `type` and `id` is already in the
relationship, it should not add it again.

> TODO: what is the appropriate response for POSTing a relationship that already exists?
> 204

> Note: This matches the semantics of databases that use foreign keys for
has-many relationships. Document-based storage should check the has-many
relationship before appending to avoid duplicates.

<!-- <div class="example"> -->
```text
POST /articles/1/links/comments
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "comments", "ids": ["123"] }
}
```

In this example, the comment with id `123` is added to the list of comments
for the article with id `1`.
<!-- </div> -->

If the client makes a `DELETE` request to the *relationship URL*, the server
**MUST** delete the specified members from the relationship or return a
`403 Forbidden` response.

The members are specified in the same way as in the `POST` request.

<!-- <div class="example"> -->
```text
DELETE /articles/1/links/comments
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "comments", "ids": ["1"] }
}
```
<!-- </div> -->

> Note: RFC 7231 specifies that a DELETE request may include a body, but
that a server may reject the request. This spec defines the semantics of a
server, and we are defining its semantics for JSON API.

#### Responses <a href="#crud-updating-relationship-responses" id="crud-updating-relationship-responses" class="headerlink"></a>

##### 204 No Content <a href="#crud-updating-relationship-responses-204" id="crud-updating-relationship-responses-204" class="headerlink"></a>

A server **MAY** return a `204 No Content` status code if an update is
successful and the client's current attributes remain up to date.

##### 200 OK <a href="#crud-updating-relationship-responses-200" id="crud-updating-relationship-responses-200" class="headerlink"></a>

If a server accepts an update but also changes the resource(s) in other ways
than those specified by the request (for example, updating the `updatedAt`
attribute or a computed `sha`), it **MUST** return a `200 OK` response.

The response document for a `200 OK` **MUST** include a representation of
the updated resource(s) as if a `GET` request was made to the request URL.

##### 403 Forbidden <a href="#crud-updating-relationship-responses-403" id="crud-updating-relationship-responses-403" class="headerlink"></a>

A server **MAY** return `403 Forbidden` in response to an unsupported request
to update a resource or relationship.

##### 404 Not Found <a href="#crud-updating-relationship-responses-404" id="crud-updating-relationship-responses-404" class="headerlink"></a>

A server **MUST** return `404 Not Found` when processing a request to modify or
delete a resource or relationship that does not exist.

##### 409 Conflict <a href="#crud-updating-relationship-responses-409" id="crud-updating-relationship-responses-409" class="headerlink"></a>

A server **MAY** return `409 Conflict` when processing a `POST` or `PUT`
request to update a resource if that update would violate other
server-enforced constraints (such as a uniqueness constraint on a field
other than `id`).

##### Other Responses <a href="#crud-updating-relationship-responses-other" id="crud-updating-relationship-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

## Errors <a href="#errors" id="errors" class="headerlink"></a>

Error objects are specialized resource objects that **MAY** be returned in a
response to provide additional information about problems encountered while
performing an operation. Error objects **MUST** be returned as a collection
keyed by `"errors"` in the top level of a JSON API document, and **SHOULD
NOT** be returned with any other top level resources.

An error object **MAY** have the following members:

* `"id"` - A unique identifier for this particular occurrence of the problem.
* `"href"` - A URI that **MAY** yield further details about this particular
  occurrence of the problem.
* `"status"` - The HTTP status code applicable to this problem, expressed as a
  string value.
* `"code"` - An application-specific error code, expressed as a string value.
* `"title"` - A short, human-readable summary of the problem. It **SHOULD NOT**
  change from occurrence to occurrence of the problem, except for purposes of
  localization.
* `"detail"` - A human-readable explanation specific to this occurrence of the
  problem.
* `"links"` - An array of JSON Pointers
  [[RFC6901](https://tools.ietf.org/html/rfc6901)] to the associated resource(s)
  within the request document.
* `"paths"` - An array of JSON Pointers to the relevant attribute(s) within the
  associated resource(s) in the request document. Each path **MUST** be relative
  to the resource path(s) expressed in the error object's `"links"` member
  [e.g. `"/links/comments/0"`].

Additional members **MAY** be specified within error objects.
