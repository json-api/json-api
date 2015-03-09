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

An extension **MAY** make changes to and deviate from the requirements of the
base specification apart from this section, which remains binding.

Servers that support one or more extensions to JSON API **MUST** return
those extensions in every response in the `supported-ext` media type
parameter of the `Content-Type` header. The value of the `supported-ext`
parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of
extension names.

For example: a response that includes the header `Content-Type:
application/vnd.api+json; supported-ext=bulk,jsonpatch` indicates that the
server supports both the "bulk" and "jsonpatch" extensions.

If an extension is used to form a particular request or response document,
then it **MUST** be specified by including its name in the `ext` media type
parameter with the `Content-Type` header. The `ext` media type parameter
**MUST NOT** include more than one extension name.

For example: a response that includes the header `Content-Type:
application/vnd.api+json; ext=jsonpatch; supported-ext=bulk,jsonpatch`
indicates that the document is formatted according to the "jsonpatch"
extension.

Clients **MAY** request a particular media type extension by including its
name in the `ext` media type parameter with the `Accept` header. Servers
that do not support a requested extension **MUST** return a `415 Unsupported
Media Type` status code.

Servers **MUST NOT** provide extended functionality that is incompatible with the
base specification to clients that do not request the extension in the `ext`
parameter of the `Content-Type` or the `Accept` header.

## Document Structure <a href="#document-structure" id="document-structure" class="headerlink"></a>

This section describes the structure of a JSON API document, which is identified
by the media type [`application/vnd.api+json`]
(http://www.iana.org/assignments/media-types/application/vnd.api+json).
JSON API documents are defined in JavaScript Object Notation (JSON)
[[RFC4627](http://tools.ietf.org/html/rfc4627)].

Although the same media type is used for both request and response documents,
certain aspects are only applicable to one or the other. These differences are
called out below.

Unless otherwise noted, objects defined by this specification **MUST NOT**
contain any additional members.

### Top Level <a href="#document-structure-top-level" id="document-structure-top-level" class="headerlink"></a>

A JSON object **MUST** be at the root of every JSON API response containing
data. This object defines a document's "top level".

> Note: Responses that can not contain a message-body, such as `204 No Content`,
do not include a document with data.

The document's "primary data" is a representation of the resource, collection
of resources, or resource relationship primarily targeted by a request.

A document **MUST** contain either primary data or an array of [error objects](#errors).

Primary data **MUST** appear under a top-level key named `"data"`. Primary
data **MUST** be either a single resource object, an array of resource
objects, or a value representing a resource relationship.

```javascript
{
  "data": {
    "type": "articles",
    "id": "1",
    // ... attributes of this article
  }
}
```

A logical collection of resources (e.g., the target of a to-many relationship)
**MUST** be represented as an array, even if it only contains one item.
A logically singular resource (e.g., the target of a to-one relationship)
**MUST** be represented as a single resource object.

Error objects **MUST** appear under a top-level key named `"errors"`.

A document's top level **MAY** also have the following members:

* `"meta"`: non-standard meta-information about the primary data.
* `"links"`: URLs related to the primary data.
* `"included"`: a list of resource objects that are related to the primary data
  and/or each other ("included resources").

If any of these members appears in the top-level of a response, their values
**MUST** comply with this specification.

### Resource Objects <a href="#document-structure-resource-objects" id="document-structure-resource-objects" class="headerlink"></a>

"Resource objects" appear in a JSON API document to represent resources.

A resource object **MUST** contain at least the following top-level members:

* `"id"`
* `"type"`

Exception: The `id` member is not required when the resource object originates at
the client and represents a new resource to be created on the server.

In addition, a resource object **MAY** contain any of these top-level members:

* `"links"`: a "links object", providing information about a resource's
  relationships (described below).
* `"meta"`: non-standard meta-information about a resource that can not be
  represented as an attribute or relationship.

A resource object **MAY** contain additional top-level members. These members
represent "attributes" and may contain any valid JSON value.

If the value of an attribute is a JSON object or array, the member is called a
*complex attribute*. The value is allowed to be any valid JSON structure.
However, a JSON object that constitutes or is contained in a complex attribute
must reserve the `id`, `type`, `links`, and `meta` members for future use.

A resource object's attributes and relationships are collectively called its
"fields". <a href="#document-structure-resource-fields" id="document-structure-resource-fields"></a>

Although has-one foreign keys (e.g. `author_id`) are often stored internally
alongside other information to be represented in a resource object, these keys
**SHOULD NOT** appear as attributes. If relations are provided, they **MUST**
be represented under the "links object", as described below.

Here's how an article (i.e. a resource of type "articles") might appear in a document:

```javascript
// ...
{
  "type": "articles",
  "id": "1",
  "title": "Rails is Omakase",
  "links": {
    "author": {
      "self": "/articles/1/links/author",
      "related": "/articles/1/author",
      "type": "people",
      "id": "9"
    }
  }
}
// ...
```

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

> Note: This spec is agnostic about inflection rules, so the value of `type`
can be either plural or singular. However, the same value should be used
consistently throughout an implementation.

#### Resource IDs <a href="#document-structure-resource-ids" id="document-structure-resource-ids" class="headerlink"></a>

Each resource object **MUST** contain an `id` member, whose value **MUST**
be a string.

#### Links <a href="#document-structure-links" id="document-structure-links" class="headerlink"></a>

The value of the `"links"` key is a JSON object (a "links object") that
represents related resources, keyed by the name of each association.

The key `"self"` is reserved within the links object for the resource URL,
as described below.

#### Resource URLs <a href="#document-structure-resource-urls" id="document-structure-resource-urls" class="headerlink"></a>

A resource object **MAY** include a URL in its links object, keyed by
`"self"`, that identifies the resource represented by the resource object.

```json
// ...
{
  "type": "articles",
  "id": "1",
  "title": "Rails is Omakase",
  "links": {
    "self": "http://example.com/articles/1"
  }
}
// ...
```

A server **MUST** respond to a `GET` request to the specified URL with a
response that includes the resource as the primary data.

#### Resource Relationships <a href="#document-structure-resource-relationships" id="document-structure-resource-relationships" class="headerlink"></a>

A resource object **MAY** contain references to other resource objects
("relationships"). Relationships may be to-one or to-many. Relationships
can be specified by including a member in a resource's links object.

The name of the relationship declared in the key **SHALL NOT** be `"self"`.

The value of a relationship **MUST** be one of the following:

* A URL for the related resource(s) (a "related resource URL"). When fetched, it
  returns the related resource object(s) as the response's primary data. For
  example, an `article`'s `comments` relationship could specify a URL that
  returns a list of comment resource objects when retrieved through a `GET`
  request.

  A related resource URL **MUST** remain constant even when the relationship (the
  set of referenced resources) mutates. That is, the response from a related
  resource URL always reflects the current state of the relationship.

* An object (a "link object").

If a relationship is provided as a link object, it **MUST** contain at least
one of the following:

* A `self` member, whose value is a URL for the relationship itself (a
  "relationship URL"). This URL allows the client to directly manipulate the
  relationship. For example, it would allow a client to remove an `author` from
  an `article` without deleting the `people` resource itself.
* A `related` member, whose value is a related resource URL (as defined above).
* Linkage to other resources based on their identifying `id` and `type` members
  ("resource linkage"). Linkage **MUST** be expressed as:
  * `type` and `id` members for to-one relationships. `type` is not required
    if the value of `id` is `null`.
  * `type` and `id` members for homogeneous to-many relationships. `type` is
    not required if the value of `id` is an empty array (`[]`).
  * A `data` member whose value is an array of objects each containing `type`
    and `id` members for heterogeneous to-many relationships.
* A `"meta"` member that contains non-standard meta-information about the
  relationship.

A link object that represents a to-many relationship **MAY** also contain
pagination links, as described below.

If a link object refers to resource objects included in the same compound
document, it **MUST** include resource linkage to those resource objects.
This allows a client to link together all of the included resource objects
without having to `GET` one of the relationship URLs.

> Note: If present, a *related resource URL* must be a valid URL, even if the
relationship isn't currently associated with any target resources.

For example, the following article is associated with an `author` and `comments`:

```javascript
// ...
{
  "type": "articles",
  "id": "1",
  "title": "Rails is Omakase",
  "links": {
    "self": "http://example.com/articles/1",
    "author": {
      "self": "http://example.com/articles/1/links/author",
      "related": "http://example.com/articles/1/author",
      "type": "people",
      "id": "9"
    },
    "comments": {
      "related": "http://example.com/articles/1/comments"
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
  "type": "articles",
  "id": "1",
  "title": "Rails is Omakase",
  "links": {
    "self": "http://example.com/articles/1",
    "author": {
      "self": "http://example.com/articles/1/links/author",
      "related": "http://example.com/articles/1/author",
      "type": "people",
      "id": "9"
    },
    "comments": "http://example.com/articles/1/comments"
  }
}
// ...
```

### Compound Documents <a href="#document-structure-compound-documents" id="document-structure-compound-documents" class="headerlink"></a>

To reduce the number of HTTP requests, servers **MAY** allow responses that
include related resources along with the requested primary resources. Such
responses are called "compound documents".

In a compound document, all included resources **MUST** be represented as an
array of resource objects in a top-level `"included"` member.

A complete example document with multiple included relationships:

```json
{
  "data": [{
    "type": "articles",
    "id": "1",
    "title": "JSON API paints my bikeshed!",
    "links": {
      "self": "http://example.com/articles/1",
      "author": {
        "self": "http://example.com/articles/1/links/author",
        "related": "http://example.com/articles/1/author",
        "type": "people",
        "id": "9"
      },
      "comments": {
        "self": "http://example.com/articles/1/links/comments",
        "related": "http://example.com/articles/1/comments",
        "type": "comments",
        "id": ["5", "12"]
      }
    }
  }],
  "included": [{
    "type": "people",
    "id": "9",
    "first-name": "Dan",
    "last-name": "Gebhardt",
    "twitter": "dgeb",
    "links": {
      "self": "http://example.com/people/9"
    }
  }, {
    "type": "comments",
    "id": "5",
    "body": "First!",
    "links": {
      "self": "http://example.com/comments/5"
    }
  }, {
    "type": "comments",
    "id": "12",
    "body": "I like XML better",
    "links": {
      "self": "http://example.com/comments/12"
    }
  }]
}
```

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
meta-information as `"meta"` members in several locations: at the top-level,
within resource objects, and within link objects.

All `"meta"` members **MUST** have an object as a value, the contents of which
can be used for custom extensions.

For example:

```json
{
  "meta": {
    "copyright": "Copyright 2015 Example Corp.",
    "authors": [
      "Yehuda Katz",
      "Steve Klabnik",
      "Dan Gebhardt"
    ]
  },
  "data": {
    // ...
  }
}
```

Any members **MAY** be specified within `meta` objects.

### Top-level Links <a href="#document-structure-top-level-links" id="document-structure-top-level-links" class="headerlink"></a>

The top-level links object **MAY** contain the following members:

* `"self"` - a link for fetching the data in the response document.
* `"related"` - a related resource URL (as defined above) when the primary
  data represents a resource relationship.
* Pagination links for the primary data (as described below).

## Fetching Data <a href="#fetching" id="fetching" class="headerlink"></a>

Data, including resources and relationships, can be fetched by sending a
`GET` request to an endpoint.

JSON API requests **MUST** include an `Accept` header specifying the JSON
API media type. Servers **MUST** return a `406 Not Acceptable` status code
if this header is missing or specifies an unsupported media type.

> Note: Servers may support multiple media types at any endpoint. For example,
a server may choose to support `text/html` in order to simplify viewing content
via a web browser.

Responses can be further refined with the optional features described below.

### Fetching Resources <a href="#fetching-resources" id="fetching-resources" class="headerlink"></a>

A server **MUST** support fetching resource data for every URL provided as:

* a `self` link as part of the top-level *links object*
* a `self` link as part of a *resource object*
* a `resource` link as part of a *link object*

For example, the following request fetches a collection of articles:

```text
GET /articles
```

The following request fetches an article:

```text
GET /articles/1
```

And the following request fetches an article's author:

```text
GET /articles/1/author
```

#### Responses <a href="#fetching-resources-responses" id="fetching-resources-responses" class="headerlink"></a>

##### 200 OK <a href="#fetching-resources-responses-200" id="fetching-resources-responses-200" class="headerlink"></a>

A server **MUST** respond to a successful request to fetch an individual
resource or resource collection with a `200 OK` response.

A server **MUST** respond to a successful request to fetch a resource
collection with an array of *resource objects* or an empty array (`[]`) as
the response document's primary data.

For example, a `GET` request to a collection of articles could return:

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "http://example.com/articles"
  },
  "data": [{
    "type": "articles",
    "id": "1",
    "title": "JSON API paints my bikeshed!"
  }, {
    "type": "articles",
    "id": "2",
    "title": "Rails is Omakase"
  }]
}
```

A similar response representing an empty collection would be:

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "http://example.com/articles"
  },
  "data": []
}
```

A server **MUST** respond to a successful request to fetch an individual
resource with a *resource object* or `null` provided as the response
document's primary data.

> Note: `null` is only an appropriate response for fetching a to-one
related resource URL to indicate the absence of a resource in the relationship.

For example, a `GET` request to an individual article could return:

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "http://example.com/articles/1"
  },
  "data": {
    "type": "articles",
    "id": "1",
    "title": "JSON API paints my bikeshed!",
    "links": {
      "author": {
        "related": "http://example.com/articles/1/author"
      }
    }
  }
}
```

If the above article's author is missing, then a `GET` request to that related
resource would return:

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "http://example.com/articles/1/author"
  },
  "data": null
}
```

##### 404 Not Found <a href="#fetching-resources-responses-404" id="fetching-resources-responses-404" class="headerlink"></a>

A server **MUST** return `404 Not Found` when processing a request to fetch
a resource that does not exist.

> Note: When requesting a related resource that is not present, a server
**MUST** respond with `200 OK` and `null` or an empty array (`[]`) as the
response document's primary data, as described above.

##### Other Responses <a href="#fetching-resources-responses-other" id="fetching-resources-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

### Fetching Relationships <a href="#fetching-relationships" id="fetching-relationships" class="headerlink"></a>

A server **MUST** support fetching relationship data for every relationship URL
provided as a `self` link as part of a *link object*.

For example, the following request fetches data about an article's comments:

```text
GET /articles/1/links/comments
```

And the following request fetches data about an article's author:

```text
GET /articles/1/links/author
```

#### Responses <a href="#fetching-relationships-responses" id="fetching-relationships-responses" class="headerlink"></a>

##### 200 OK <a href="#fetching-relationships-responses-200" id="fetching-relationships-responses-200" class="headerlink"></a>

A server **MUST** respond to a successful request to fetch a relationship
with a `200 OK` response.

The primary data in the response document **MUST** be one of the following:

* `null` for empty to-one relationships.
* an empty array (`[]`) for empty to-many relationships
* an object containing `type` and `id` members for non-empty to-one
  or homogeneous to-many relationships.
* an array of objects each containing `type` and `id` members for non-empty
  heterogenous to-many relationships.

The top-level *links object* **MAY** contain `self` and `resource` links,
as described for link objects.

For example, a `GET` request a to-one relationship URL could return:

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "/articles/1/links/author",
    "related": "/articles/1/author"
  },
  "data": {
    "type": "people", "id": "12"
  }
}
```

If the above relationship is empty, then a `GET` request to the same URL would
return:

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "/articles/1/links/author",
    "related": "/articles/1/author"
  },
  "data": null
}
```

A `GET` request to a homogenous to-many relationship URL could return:

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "/articles/1/links/tags",
    "related": "/articles/1/tags"
  },
  "data": {
    "type": "tags",
    "id": ["2", "3"]
  }
}
```

If the above relationship is empty, then a `GET` request to the same URL would
return:

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "/articles/1/links/tags",
    "related": "/articles/1/tags"
  },
  "data": []
}
```

A `GET` request to a heterogenous to-many relationship URL could return:

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "/articles/1/links/tags",
    "related": "/articles/1/tags"
  },
  "data": [{
    "type": "system-tags",
    "id": "2"
  }, {
    "type": "user-tags",
    "id": "5"
  }]
}
```

##### 404 Not Found <a href="#fetching-relationships-responses-404" id="fetching-relationships-responses-404" class="headerlink"></a>

A server **MUST** return `404 Not Found` when processing a request to fetch
a relationship URL that does not exist.

> Note: If a relationship URL exists but the relationship is empty, then
`200 OK` **MUST** be returned, as described above.

##### Other Responses <a href="#fetching-relationships-responses-other" id="fetching-relationships-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

### Inclusion of Related Resources <a href="#fetching-includes" id="fetching-includes" class="headerlink"></a>

An endpoint **MAY** return resources related to the primary data by default.

An endpoint **MAY** also support custom inclusion of related resources based
upon an `include` request parameter. This parameter **MUST** specify the
relationship using the name used in the `links` section of the primary data.

If a client supplies an `include` parameter, the server **MUST NOT** include
other resource objects in the `included` section of the compound document.

The value of the `include` parameter is a comma-separated (U+002C COMMA,
",") list of relationship paths. A relationship path is a dot-separated
(U+002E FULL-STOP, ".") list of relationship names. Each relationship name
**MUST** be identical to the key in the `links` section of its parent
resource object.

> Note: For example, a relationship path could be `comments.author`, where
`comments` is a relationship listed under a `articles` resource object, and
`author` is a relationship listed under a `comments` resource object.

For instance, comments could be requested with an article:

```text
GET /articles/1?include=comments
```

In order to request resources related to other resources, a dot-separated path
for each relationship name can be specified:

```text
GET /articles/1?include=comments.author
```

> Note: A request for `comments.author` should not automatically also
include `comments` in the response. This can happen if the client already
has the `comments` locally, and now wants to fetch the associated authors
without fetching the comments again.

Multiple related resources can be requested in a comma-separated list:

```text
GET /articles/1?include=author,comments,comments.author
```

### Sparse Fieldsets <a href="#fetching-sparse-fieldsets" id="fetching-sparse-fieldsets" class="headerlink"></a>

A client **MAY** request that an endpoint return only specific
[fields](#document-structure-resource-fields) in the response on a per-type basis
by including a `fields[TYPE]` parameter. The value of the parameter is a
comma-separated (U+002C COMMA, ",") list that refers to the names(s) of the
fields to be returned.

```text
GET /articles?include=author&fields[articles]=title,body&fields[people]=name
```

If a client requests a restricted set of fields, an endpoint **MUST NOT**
include additional fields in the response.

Resource object properties that are not fields are not affected by the `fields`
parameter. As stated in the [Resource
Objects](#document-structure-resource-objects) section, the `type` and `id`
members **MUST** always be included in each resource object, and the `self`
property **MAY** be included.

### Sorting <a href="#fetching-sorting" id="fetching-sorting" class="headerlink"></a>

A server **MAY** choose to support requests to sort resource collections
according to one or more criteria ("sort fields").

> Note: Although recommended, sort fields do not necessarily need to
correspond to resource attribute and association names.

> Note: It is recommended that dot-separated (U+002E FULL-STOP, ".") sort
fields be used to request sorting based upon relationship attributes. For
example, a sort field of `+author.name` could be used to request that the
primary data be sorted based upon the `name` attribute of the `author`
relationship.

An endpoint **MAY** support requests to sort the primary data with a `sort`
query parameter. The value for `sort` **MUST** represent sort fields.

```text
GET /people?sort=+age
```

An endpoint **MAY** support multiple sort fields by allowing comma-separated
(U+002C COMMA, ",") sort fields. Sort fields **SHOULD** be applied in the
order specified.

```text
GET /people?sort=+age,+name
```

The sort order for each sort field **MUST** be specified with one of the
following prefixes:

* Plus (U+002B PLUS SIGN, "+") to request an ascending sort order.
* Minus (U+002D HYPHEN-MINUS, "-") to request a descending sort order.

> Note: By requiring a sort order prefix instead of allowing a default
order, JSON API avoids setting requirements for the first character in sort
field names.

```text
GET /articles?sort=-created,+title
```

The above example should return the newest articles first. Any articles
created on the same date will then be sorted by their title in ascending
alphabetical order.

### Pagination <a href="#fetching-pagination" id="fetching-pagination" class="headerlink"></a>

A server **MAY** choose to limit the number of resources returned in a response
to a subset ("page") of the whole set available.

A server **MAY** provide links to traverse a paginated data set ("pagination
links").

Pagination links **MUST** appear in the link object that corresponds to a
collection. To paginate the primary data, supply pagination links in the
top-level `links` object. To paginate an included collection returned in
a compound document, supply pagination links in the corresponding link
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

The `page` query parameter is reserved for pagination. Servers and clients
**SHOULD** use this key for pagination operations.

> Note: JSON API is agnostic about the pagination strategy used by a server.
Effective pagination strategies include (but are not limited to):
page-based, offset-based, and cursor-based. The `page` query parameter can
be used as a basis for any of these strategies. For example, a page-based
strategy might use query parameters such as `page[number]` and `page[size]`,
an offset-based strategy might use `page[offset]` and `page[limit]`, while a
cursor-based strategy might use `page[cursor]`.

### Filtering <a href="#fetching-filtering" id="fetching-filtering" class="headerlink"></a>

The `filter` query parameter is reserved for filtering data. Servers and clients
**SHOULD** use this key for filtering operations.

> Note: JSON API is agnostic about the strategies supported by a server. The
`filter` query parameter can be used as the basis for any number of filtering
strategies.

## Creating, Updating and Deleting Resources <a href="#crud" id="crud" class="headerlink"></a>

A server **MAY** allow resources of a given type to be created. It **MAY**
also allow existing resources to be modified or deleted.

Any requests that contain content **MUST** include a `Content-Type` header
whose value is `application/vnd.api+json`. This header value **MUST** also
include media type extensions relevant to the request.

A request **MUST** completely succeed or fail (in a single "transaction"). No
partial updates are allowed.

> Note: The `type` member is required in every resource object throughout requests and
responses in JSON API. There are some cases, such as when `POST`ing to an
endpoint representing heterogenous data, when the `type` could not be inferred
from the endpoint. However, picking and choosing when it is required would be
confusing; it would be hard to remember when it was required and when it was
not. Therefore, to improve consistency and minimize confusion, `type` is
always required.

### Creating Resources <a href="#crud-creating" id="crud-creating" class="headerlink"></a>

A resource can be created by sending a `POST` request to a URL that represents
a collection of resources. The request **MUST** include a single resource object
as primary data. The resource object **MUST** contain at least a `type` member.

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

A server **MUST** return `403 Forbidden` in response to an unsupported request
to create a resource with a client-generated ID.

#### Responses <a href="#crud-creating-responses" id="crud-creating-responses" class="headerlink"></a>

##### 201 Created <a href="#crud-creating-responses-201" id="crud-creating-responses-201" class="headerlink"></a>

A server **MUST** respond to a successful resource creation request according to
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231#section-6.3).

The response **MUST** include a `Location` header identifying the location
of the newly created resource.

If a `POST` request did not include a [Client-Generated
ID](#crud-creating-client-ids), and a resource has been created, the server
**MUST** return a `201 Created` status code.

The response **MUST** also include a document that contains the primary
resource created.

If the resource object returned by the response contains a `self` key in its
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

##### 204 No Content <a href="#crud-creating-responses-204" id="crud-creating-responses-204" class="headerlink"></a>

If a `POST` request *did* include a [Client-Generated
ID](#crud-creating-client-ids), the server **MUST** return either a `201
Created` status code and response document (as described above) or a `204 No
Content` status code with no response document.

> Note: If a `204` response is received the client should consider the resource
object sent in the request to be accepted by the server, as if the server
had returned it back in a `201` response.

##### 403 Forbidden <a href="#crud-creating-responses-403" id="crud-creating-responses-403" class="headerlink"></a>

A server **MAY** return `403 Forbidden` in response to an unsupported request
to create a resource.

##### 409 Conflict <a href="#crud-creating-responses-409" id="crud-creating-responses-409" class="headerlink"></a>

A server **MUST** return `409 Conflict` when processing a `POST` request to
create a resource with a client-generated ID that already exists.

A server **MUST** return `409 Conflict` when processing a `POST` request in
which the resource's `type` does not match the server's endpoint.

##### Other Responses <a href="#crud-creating-responses-other" id="crud-creating-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

### Updating Resources <a href="#crud-updating" id="crud-updating" class="headerlink"></a>

A resource's attributes and relationships can be updated by sending a `PATCH`
request to the URL that represents the resource.

The URL for a resource can be obtained in the `self` link of the resource
object. Alternatively, when a `GET` request returns a single resource object as
primary data, the same request URL can be used for updates.

The `PATCH` request **MUST** include a single resource object as primary data.
The resource object **MUST** contain `type` and `id` members.

For example:

```text
PATCH /articles/1
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

#### Updating a Resource's Attributes <a href="#crud-updating-resource-attributes" id="crud-updating-resource-attributes" class="headerlink"></a>

Any or all of a resource's attributes **MAY** be included in the resource
object included in a `PATCH` request.

If a request does not include all of the fields for a resource, the server
**MUST** interpret the missing fields as if they were included together with
their current values. It **MUST NOT** interpret them as `null` values.

For example, the following `PATCH` request is interpreted as a request to
update only the `title` and `text` attributes of an article:

```text
PATCH /articles/1
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

#### Updating a Resource's To-One Relationships <a href="#crud-updating-resource-to-one-relationships" id="crud-updating-resource-to-one-relationships" class="headerlink"></a>

If a to-one relationship is provided in the `links` section of a resource
object in a `PATCH` request, it **MUST** be one of:

* an object with `type` and `id` members corresponding to the related resource
* `null`, to remove the relationship

For instance, the following `PATCH` request will update the `title` attribute
and `author` relationship of an article:

```text
PATCH /articles/1
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

#### Updating a Resource's To-Many Relationships <a href="#crud-updating-resource-to-many-relationships" id="crud-updating-resource-to-many-relationships" class="headerlink"></a>

If a to-many relationship is included in the `links` section of a resource
object, it **MUST** be an object containing:

* `type` and `id` members for homogeneous to-many relationships; to clear the
  relationship, set the `id` member to `[]`
* a `data` member whose value is an array of objects each containing `type` and
  `id` members for heterogeneous to-many relationships; to clear the
  relationship, set the `data` member to `[]`

For instance, the following `PATCH` request performs a complete replacement of
the `tags` for an article:

```text
PATCH /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "title": "Rails is a Melting Pot",
    "links": {
      "tags": { "type": "tags", "id": ["2", "3"] }
    }
  }
}
```

A server **MAY** reject an attempt to do a full replacement of a to-many
relationship. In such a case, the server **MUST** reject the entire update,
and return a `403 Forbidden` response.

> Note: Since full replacement may be a very dangerous operation, a server
may choose to disallow it. A server may reject full replacement if it has
not provided the client with the full list of associated objects, and does
not want to allow deletion of records the client has not seen.

#### Responses <a href="#crud-updating-responses" id="crud-updating-responses" class="headerlink"></a>

##### 204 No Content <a href="#crud-updating-responses-204" id="crud-updating-responses-204" class="headerlink"></a>

A server **MUST** return a `204 No Content` status code if an update is
successful and the client's current attributes remain up to date.

##### 200 OK <a href="#crud-updating-responses-200" id="crud-updating-responses-200" class="headerlink"></a>

If a server accepts an update but also changes the resource(s) in other ways
than those specified by the request (for example, updating the `updated-at`
attribute or a computed `sha`), it **MUST** return a `200 OK` response.

The response document for a `200 OK` **MUST** include a representation of
the updated resource(s) as if a `GET` request was made to the request URL.

##### 403 Forbidden <a href="#crud-updating-relationship-responses-403" id="crud-updating-relationship-responses-403" class="headerlink"></a>

A server **MUST** return `403 Forbidden` in response to an unsupported request
to update a resource or relationship.

##### 404 Not Found <a href="#crud-updating-responses-404" id="crud-updating-responses-404" class="headerlink"></a>

A server **MUST** return `404 Not Found` when processing a request to modify
a resource that does not exist.

A server **MUST** return `404 Not Found` when processing a request that
references a related resource that does not exist.

##### 409 Conflict <a href="#crud-updating-responses-409" id="crud-updating-responses-409" class="headerlink"></a>

A server **MAY** return `409 Conflict` when processing a `PATCH` request to
update a resource if that update would violate other server-enforced
constraints (such as a uniqueness constraint on a property other than `id`).

A server **MUST** return `409 Conflict` when processing a `PATCH` request in
which the resource's `type` and `id` do not match the server's endpoint.

##### Other Responses <a href="#crud-updating-responses-other" id="crud-updating-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

### Updating Relationships <a href="#crud-updating-relationships" id="crud-updating-relationships" class="headerlink"></a>

Although relationships can be modified along with resources (as described
above), JSON API also supports updating of relationships independently at
*relationship URLs*.

If a *link object* contains a *relationship URL*, then the server **MUST**
respond to requests to that URL to update the relationship.

> Note: Relationships are updated without exposing the underlying server
semantics, such as foreign keys. Furthermore, relationships can be updated
without necessarily affecting the related resources. For example, if an article
has many authors, it is possible to remove one of the authors from the article
without deleting the person itself. Similarly, if an article has many tags, it
is possible to add or remove tags. Under the hood on the server, the first
of these examples might be implemented with a foreign key, while the second
could be implemented with a join table, but the JSON API protocol would be
the same in both cases.

> Note: A server may choose to delete the underlying resource if a
relationship is deleted (as a garbage collection measure).

#### Updating To-One Relationships <a href="#crud-updating-to-one-relationships" id="crud-updating-to-one-relationships" class="headerlink"></a>

A server **MUST** respond to `PATCH` requests to a *to-one relationship URL* as
described below.

The `PATCH` request **MUST** include a top-level member named `data` containing
one of:

* an object with `type` and `id` members corresponding to the related resource
* `null`, to remove the relationship

For example, the following request updates the author of an article:

```text
PATCH /articles/1/links/author
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "people", "id": "12" }
}
```

And the following request clears the author of the same article:

```text
PATCH /articles/1/links/author
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": null
}
```

If the relationship is updated successfully then the server **MUST** return
a `204 No Content` response.

#### Updating To-Many Relationships <a href="#crud-updating-to-many-relationships" id="crud-updating-to-many-relationships" class="headerlink"></a>

A server **MUST** respond to `PATCH`, `POST`, and `DELETE` requests to a *to-many
relationship URL* as described below.

For all request types, the body **MUST** contain a `data` member whose value
is an object that contains `type` and `id` members, or an array of objects
that each contain `type` and `id` members.

If a client makes a `PATCH` request to a *to-many relationship URL*, the
server **MUST** either completely replace every member of the relationship,
return an appropriate error response if some resources can not be found or
accessed, or return a `403 Forbidden` response if complete replacement is
not allowed by the server.

For example, the following request replaces every tag for an article:

```text
PATCH /articles/1/links/tags
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "tags", "id": ["2", "3"] }
}
```

If a client makes a `POST` request to a *relationship URL*, the server
**MUST** append the specified members to the relationship using set
semantics. This means that if a given `type` and `id` is already in the
relationship, the server **MUST NOT** add it again.

> Note: This matches the semantics of databases that use foreign keys for
has-many relationships. Document-based storage should check the has-many
relationship before appending to avoid duplicates.

If all of the specified resources can be added to, or are already present
in, the relationship then the server **MUST** return a successful `204 No
Content` response.

> Note: This approach ensures that a request is successful if the server's
state matches the requested state, and helps avoid pointless race conditions
caused by multiple clients making the same changes to a relationship.

In the following example, the comment with ID `123` is added to the list of
comments for the article with ID `1`:

```text
POST /articles/1/links/comments
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "comments", "id": ["123"] }
}
```

If the client makes a `DELETE` request to a *relationship URL*, the server
**MUST** delete the specified members from the relationship or return a `403
Forbidden` response. If all of the specified resources are able to be
removed from, or are already missing from, the relationship then the server
**MUST** return a successful `204 No Content` response.

> Note: As described above for `POST` requests, this approach helps avoid
pointless race conditions between multiple clients making the same changes.

Relationship members are specified in the same way as in the `POST` request.

In the following example, comments with IDs of `12` and `13` are removed
from the list of comments for the article with ID `1`:

```text
DELETE /articles/1/links/comments
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "comments", "id": ["12", "13"] }
}
```

> Note: RFC 7231 specifies that a DELETE request may include a body, but
that a server may reject the request. This spec defines the semantics of a
server, and we are defining its semantics for JSON API.

#### Responses <a href="#crud-updating-relationship-responses" id="crud-updating-relationship-responses" class="headerlink"></a>

##### 204 No Content <a href="#crud-updating-relationship-responses-204" id="crud-updating-relationship-responses-204" class="headerlink"></a>

A server **MUST** return a `204 No Content` status code if an update is
successful and the client's current attributes remain up to date.

> Note: This is the appropriate response to a `POST` request sent to a
*to-many relationship URL* when that relationship already exists. It is also
the appropriate response to a `DELETE` request sent to a *to-many
relationship URL* when that relationship does not exist.

##### 403 Forbidden <a href="#crud-updating-relationship-responses-403" id="crud-updating-relationship-responses-403" class="headerlink"></a>

A server **MUST** return `403 Forbidden` in response to an unsupported request
to update a relationship.

##### Other Responses <a href="#crud-updating-relationship-responses-other" id="crud-updating-relationship-responses-other" class="headerlink"></a>

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

##### Other Responses <a href="#crud-deleting-responses-other" id="crud-deleting-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

## Errors <a href="#errors" id="errors" class="headerlink"></a>

Error objects provide additional information about problems encountered while
performing an operation. Error objects **MUST** be returned as an array
keyed by `"errors"` in the top level of a JSON API document, and **SHOULD
NOT** be returned with any primary data.

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
  within the request document [e.g. `["/data"]` for a primary data object].
* `"paths"` - An array of JSON Pointers to the relevant attribute(s) within the
  associated resource(s) in the request document. Each path **MUST** be relative
  to the resource path(s) expressed in the error object's `"links"` member
  [e.g. `["/first-name", "/last-name"]` to reference a couple attributes].

Additional members **MAY** be specified within error objects.
