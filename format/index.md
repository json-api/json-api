---
layout: page
title: "Format"
show_sidebar: true
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

## Media Type Negotiation <a href="#media-type-negotiation" id="media-type-negotiation" class="headerlink"></a>

Clients **MUST** send all JSON API data in request documents with
the header `Content-Type: application/vnd.api+json`.

Clients **MUST** ignore all parameters for the `application/vnd.api+json`
media type received in the `Content-Type` header of response documents.

Servers **MUST** send all JSON API data in response documents with
the header `Content-Type: application/vnd.api+json`.

Servers **MUST** return a `406 Not Acceptable` status code if the
`application/vnd.api+json` media type is modified by the `ext` parameter in
the `Accept` header of a request. Otherwise, servers **MUST** return a `415
Unsupported Media Type` status code if the `application/vnd.api+json` media
type is modified by the `ext` parameter in the `Content-Type` header of a
request. Servers **MUST** ignore all other parameters for the
`application/vnd.api+json` media type in `Accept` and `Content-Type`
headers.

> Note: These requirements may allow future versions of this specification
to support an extension mechanism based upon the `ext` media type parameter.

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
contain any additional members. Client and server implementations **MUST**
ignore object members not recognized by this specification.

> Note: These conditions for object members allow this specification to
evolve through additive changes.

### Top Level <a href="#document-structure-top-level" id="document-structure-top-level" class="headerlink"></a>

A JSON object **MUST** be at the root of every JSON API response containing
data. This object defines a document's "top level".

A document **MUST** contain at least one of the following top-level members:

* `data`: containing the document's "primary data"
* `errors`: containing an array of [error objects](#errors)
* `meta`: non-standard meta-information.

The members `data` and `errors` **MUST NOT** coexist in the same document.

The document's "primary data" is a representation of the resource or collection
of resources targeted by a request.

Primary data **MUST** be either:

* a single resource object, a single [resource identifier object], or `null`,
  for requests that target single resources
* an array of resource objects, an array of [resource identifier objects], or
  an empty array ([]), for requests that target resource collections

For example, the following primary data is a single resource object:

```javascript
{
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      // ... this article's attributes
    },
    "relationships": {
      // ... this article's relationships
    }
  }
}
```

The following primary data is a single [resource identifier object] that
references the same resource:

```javascript
{
  "data": {
    "type": "articles",
    "id": "1"
  }
}
```

A logical collection of resources (e.g. the target of a to-many relationship)
**MUST** be represented as an array, even if it only contains one item or is
empty.

A document's top level **MAY** also have the following members:

* `jsonapi`: an object describing the server's implementation
* `links`: URLs related to the primary data.
* `included`: an array of resource objects that are related to the primary
  data and/or each other ("included resources").

If any of these members appears in the top-level of a response, their values
**MUST** comply with this specification.

If a document does not contain a top-level `data` key, then the `included` key **MUST NOT** be present either.

### Resource Objects <a href="#document-structure-resource-objects" id="document-structure-resource-objects" class="headerlink"></a>

"Resource objects" appear in a JSON API document to represent resources.

A resource object **MUST** contain at least the following top-level members:

* `id`
* `type`

The value of `type` members **MUST** adhere to the same constraints as
[member names].

Exception: The `id` member is not required when the resource object originates at
the client and represents a new resource to be created on the server.

In addition, a resource object **MAY** contain any of these top-level members:

* `attributes`: an "attributes object" representing some of the resource's data.
* `relationships`: a "relationships object" describing relationships between
 the resource and other JSON API resources.
* `links`: a "links object" containing URLs related to the resource.
* `meta`: non-standard meta-information about a resource that can not be
  represented as an attribute or relationship.

Here's how an article (i.e. a resource of type "articles") might appear in a document:

```javascript
// ...
{
  "type": "articles",
  "id": "1",
  "attributes": {
    "title": "Rails is Omakase"
  },
  "relationships": {
    "author": {
      "links": {
        "self": "/articles/1/relationships/author",
        "related": "/articles/1/author"
      },
      "data": { "type": "people", "id": "9" }
    }
  }
}
// ...
```
#### Resource Identification <a href="#document-structure-resource-identification" id="document-structure-resource-identification" class="headerlink"></a>

Every resource object **MUST** contain an `id` member and a `type` member.
The value of each of these members **MUST** be a string.

Within a given API, each resource object's `type` and `id` pair **MUST**
identify a single, unique resource. (The set of URIs controlled by a server,
or multiple servers acting as one, constitute an API.)

The `type` member is used to describe resource objects that share common
attributes and relationships.

> Note: This spec is agnostic about inflection rules, so the value of `type`
can be either plural or singular. However, the same value should be used
consistently throughout an implementation.


#### Attributes <a href="#document-structure-resource-attributes" id="document-structure-resource-attributes" class="headerlink"></a>

The value of the `attributes` key is an "attributes object". The attributes
object is a JSON object that represents information about the resource object.

The members of the attributes object ("attributes") share a namespace with the
members of the relationships object of the resource object; that is, attributes
of a given resource object **MUST** be named differently than its relationships.
The attributes object **MUST NOT** contain `id` or `type` members. Apart from
these restrictions, this object can contain members keyed by any string valid
for this specification.

All members which appear in an attributes object are considered attributes and
may contain any valid JSON value.

Complex data structures involving JSON objects and arrays are allowed as
attribute values. However, any object that constitutes or is contained in an
attribute **MUST** reserve the `relationships` and `links` members for future use.

Although has-one foreign keys (e.g. `author_id`) are often stored internally
alongside other information to be represented in a resource object, these keys
**SHOULD NOT** appear as attributes. If relations are provided, they **MUST**
be represented under the "relationships object".

#### Relationships <a href="#document-structure-resource-objects-relationships" id="document-structure-resource-objects-relationships" class="headerlink"></a>

The value of the `relationships` key is a JSON object (a "relationships object")
that represents references from the resource in whose resource object it's defined
to other resources ("relationships"). These relationships share a namespace with
[attributes]; that is, relationships of a given resource object **MUST** be named
differently than its [attributes].

The keys `id` and `type` are not allowed within the relationships object.

Relationships may be to-one or to-many. Relationships can be specified by
including a member in a resource's relationship's object. The name of the
relationship is its key in the relationships object.

The value of a relationship **MUST** be an object (a "relationship object"),
which **MUST** contain at least one of the following:

* A `links` member that contains at least one of the following:
  * A `self` member, whose value is a URL for the relationship itself (a
    "relationship URL"). This URL allows the client to directly manipulate the
    relationship. For example, it would allow a client to remove an `author`
    from an `article` without deleting the `people` resource itself.
  * A `related` member, whose value is a related resource URL, as defined below.
* A `data` member, whose value represents "resource linkage" (defined below).
* A `meta` member that contains non-standard meta-information about the
  relationship.

A relationship object that represents a to-many relationship **MAY** also contain
pagination links under the `links` member, as described below.

A "related resource URL" provides access to the resources targeted by the
relationship. When fetched, it returns the related resource object(s) as the
response's primary data. For example, an `article`'s `comments` relationship
could specify a URL that returns a list of comment resource objects when
retrieved through a `GET` request.

A related resource URL **MUST** remain constant even when the relationship (the
set of referenced resources) mutates. That is, the response from a related
resource URL always reflects the current state of the relationship.

If present, a related resource URL **MUST** be a valid URL, even if the
relationship isn't currently associated with any target resources.

Resource linkage **MUST** be represented as one of the following:

* `null` for empty to-one relationships.
* a [resource identifier object] for non-empty to-one relationships.
* an empty array (`[]`) for empty to-many relationships.
* an array of [resource identifier objects] for non-empty to-many relationships.

> Note: Resource linkage in a compound document allows a client to link
together all of the included resource objects without having to `GET` any
relationship URLs.

> Note: The spec does not impart meaning to order of resource identifier
objects in linkage arrays of to-many relationships, although implementations
may do that. Arrays of resource identifier objects may represent ordered
or unordered relationships, and both types can be mixed in one response
object.

For example, the following article is associated with an `author`:

```javascript
// ...
{
  "type": "articles",
  "id": "1",
  "attributes": {
    "title": "Rails is Omakase"
  },
  "relationships": {
    "author": {
      "links": {
        "self": "http://example.com/articles/1/relationships/author",
        "related": "http://example.com/articles/1/author"
      },
      "data": { "type": "people", "id": "9" }
    }
  },
  "links": {
    "self": "http://example.com/articles/1"
  }
}
// ...
```

The `author` relationship includes a URL for the relationship itself (which
allows the client to change the related author directly), a related resource URL
to fetch the resource objects, and linkage information.

#### Fields <a href="#document-structure-resource-object-fields" id="document-structure-resource-object-fields" class="headerlink"></a>

A resource object's [attributes] and its [relationships] are collectively called
its "[fields]".

#### Resource Links <a href="#document-structure-structure-resource-object-links" id="document-structure-resource-object-links" class="headerlink"></a>

Analogous to the `links` member at the document's top level, the optional
`links` member within each resource object contains URLs related to the
resource.

If present, this object **MAY** contain a URL keyed by `self`, that identifies
the resource represented by the resource object.

```json
// ...
{
  "type": "articles",
  "id": "1",
  "attributes": {
    "title": "Rails is Omakase"
  },
  "links": {
    "self": "http://example.com/articles/1"
  }
}
// ...
```

A server **MUST** respond to a `GET` request to the specified URL with a
response that includes the resource as the primary data.

### Resource Indentifier Objects <a href="#document-structure-resource-identifier-objects" id="document-structure-resource-identifier-objects" class="headerlink"></a>

A "resource identifier object" is an object that identifies an individual
resource.

It **MUST** contain `type` and `id` members.

It **MAY** also include a `meta` member to contain non-standard
meta-information.

### Compound Documents <a href="#document-structure-compound-documents" id="document-structure-compound-documents" class="headerlink"></a>

To reduce the number of HTTP requests, servers **MAY** allow responses that
include related resources along with the requested primary resources. Such
responses are called "compound documents".

In a compound document, all included resources **MUST** be represented as an
array of resource objects in a top-level `included` member.

Compound documents require "full linkage", meaning that every included
resource **MUST** be identified by at least one [resource identifier object]
in the same document. These resource identifier objects could either be
primary data or represent resource linkage contained within primary or
included resources. The only exception to the full linkage requirement is
when relationship fields that would otherwise contain linkage data are
excluded via [sparse fieldsets](#fetching-sparse-fieldsets).

> Note: Full linkage ensures that included resources are related to either
the primary data (which could be resource objects or resource identifier
objects) or to each other.

A complete example document with multiple included relationships:

```json
{
  "data": [{
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON API paints my bikeshed!"
    },
    "links": {
      "self": "http://example.com/articles/1"
    },
    "relationships": {
      "author": {
        "links": {
          "self": "http://example.com/articles/1/relationships/author",
          "related": "http://example.com/articles/1/author"
        },
        "data": { "type": "people", "id": "9" }
      },
      "comments": {
        "links": {
          "self": "http://example.com/articles/1/relationships/comments",
          "related": "http://example.com/articles/1/comments"
        },
        "data": [
          { "type": "comments", "id": "5" },
          { "type": "comments", "id": "12" }
        ]
      }
    }
  }],
  "included": [{
    "type": "people",
    "id": "9",
    "attributes": {
      "first-name": "Dan",
      "last-name": "Gebhardt",
      "twitter": "dgeb"
    },
    "links": {
      "self": "http://example.com/people/9"
    }
  }, {
    "type": "comments",
    "id": "5",
    "attributes": {
      "body": "First!"
    },
    "links": {
      "self": "http://example.com/comments/5"
    }
  }, {
    "type": "comments",
    "id": "12",
    "attributes": {
      "body": "I like XML better"
    },
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

### Meta Information <a href="#document-structure-meta" id="document-structure-meta" class="headerlink"></a>

As discussed above, a JSON API document **MAY** be extended to include
meta-information as `meta` members in several locations:

* at the top-level
* within the top level `jsonapi` object.
* within resource objects
* within relationship objects
* within link objects
* within [resource identifier objects]
* within [error objects](#errors)

All `meta` members **MUST** have an object as a value, the contents of which
can be used for custom extensions.

For example:

```javascript
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

### Links <a href="#document-structure-links" id="document-structure-links" class="headerlink"></a>

As discussed above, a document **MAY** be extended to include relevant URLs
within `links` members at several locations: at the top-level, within resource
objects, and within relationship objects.

The allowed keys for `links` objects at the resource and relationship object
levels are defined in the sections on [resource relationships] and
[resource links].

When a links object appears at the document's top-level, it **MAY** have
the following members:

* `self` - the URL that generated the current response document.
* `related` - a related resource URL (as defined above) when the primary
  data represents a resource relationship.
* Pagination links for the primary data (as described below).

For links currently defined by the spec (`self`, `related`, `prev`, `next`,
`first`, `last`), the value of each member of a `links` object can be either
a string containing the link URL or a "link object", which can contain
the following members:

* `href` - the string containing the link URL,
* `meta` - non-standard meta-information about the link.

Examples of the supported formats:

```
"links": {
  "self": "http://example.com/posts",
}
```
```
"links": {
  "self": {
    "href": "http://example.com/posts",
    "meta": {}
  }
}
```

> Note: For links which can be defined or allowed by the spec in the future,
the value of each member of a `links` object is not constrained by the
current version of the spec. It should be assumed that anything can be
allowed in the future for such values: object, array, or scalar.

### JSON API Object <a href="#document-structure-jsonapi-object" id="document-structure-jsonapi-object" class="headerlink"></a>

A JSON API document **MAY** include information about its implementation under
a top level `jsonapi` member. If present, it **MUST** be an object containing
a `version` member whose value is a string indicating the highest JSON API
version supported. Other than `meta`, servers **MUST NOT** include any
additional members.

```json
{
  "jsonapi": {
    "version": "1.0"
  }
}
```

If this member is not present, clients should assume the server implements
version 1.0 of the specification.

> Note: Because JSON API is committed to making additive changes only, the
version string primarily indicates which new features a server may support.

### Member Names <a href="#document-structure-member-names" id="document-structure-member-names" class="headerlink"></a>

All member names used in a JSON API document **MUST** be treated as case sensitive
by clients and servers, and they **MUST** meet all of the following conditions:

- Member names **MUST** contain at least one character.
- Member names **MUST** contain only the allowed characters listed below.
- Member names **MUST** start and end with a "globally allowed character",
  as defined below.

To enable an easy mapping of member names to URLs, it is **RECOMMENDED** that
member names use only non-reserved, URL safe characters specified in [RFC 3986](http://tools.ietf.org/html/rfc3986#page-13).

#### Allowed Characters <a href="#document-structure-member-names-allowed-characters" id="document-structure-member-names-allowed-characters" class="headerlink"></a>

The following "globally allowed characters" **MAY** be used anywhere in a member name:

- U+0061 to U+007A, "a-z"
- U+0041 to U+005A, "A-Z"
- U+0030 to U+0039, "0-9"
- any UNICODE character except U+0000 to U+007F _(not recommended, not URL safe)_

Additionally, the following characters are allowed in member names, except as the
first or last character:

- U+002D HYPHEN-MINUS, "-"
- U+005F LOW LINE, "_"
- U+0020 SPACE, " " _(not recommended, not URL safe)_

#### Reserved Characters <a href="#document-structure-member-names-reserved-characters" id="document-structure-member-names-reserved-characters" class="headerlink"></a>

The following characters **MUST NOT** be used in member names:

- U+002B PLUS SIGN, "+" _(used for ordering)_
- U+002C COMMA, "," _(used separator for multiple relationship paths)_
- U+002E PERIOD, "." _(used as relationship path separators)_
- U+005B LEFT SQUARE BRACKET, "[" _(use in sparse fieldsets)_
- U+005D RIGHT SQUARE BRACKET, "]" _(used in sparse fieldsets)_
- U+0021 EXCLAMATION MARK, "!"
- U+0022 QUOTATION MARK, '"'
- U+0023 NUMBER SIGN, "#"
- U+0024 DOLLAR SIGN, "$"
- U+0025 PERCENT SIGN, "%"
- U+0026 AMPERSAND, "&"
- U+0027 APOSTROPHE, "'"
- U+0028 LEFT PARENTHESIS, "("
- U+0029 RIGHT PARENTHESIS, ")"
- U+002A ASTERISK, "*"
- U+002F SOLIDUS, "/"
- U+003A COLON, ":"
- U+003B SEMICOLON, ";"
- U+003C LESS-THAN SIGN, "<"
- U+003D EQUALS SIGN, "="
- U+003E GREATER-THAN SIGN, ">"
- U+003F QUESTION MARK, "?"
- U+0040 COMMERCIAL AT, "@"
- U+005C REVERSE SOLIDUS, "\"
- U+005E CIRCUMFLEX ACCENT, "^"
- U+0060 GRAVE ACCENT, "`"
- U+007B LEFT CURLY BRACKET, "{"
- U+007C VERTICAL LINE, "|"
- U+007D RIGHT CURLY BRACKET, "}"
- U+007E TILDE, "~"

## Fetching Data <a href="#fetching" id="fetching" class="headerlink"></a>

Data, including resources and relationships, can be fetched by sending a
`GET` request to an endpoint.

Clients **MUST** indicate that they can accept the JSON API media type, per
the semantics of the HTTP `Accept` header. If present, this header value **MUST**
also include any media type extensions relevant to the request. Servers **MUST**
return a `406 Not Acceptable` status code if this header specifies an
unsupported media type.

> Note: Servers may support multiple media types at any endpoint. For example,
a server may choose to support `text/html` in order to simplify viewing content
via a web browser.

Responses can be further refined with the optional features described below.

### Fetching Resources <a href="#fetching-resources" id="fetching-resources" class="headerlink"></a>

A server **MUST** support fetching resource data for every URL provided as:

* a `self` link as part of the top-level links object
* a `self` link as part of a resource-level links object
* a `related` link as part of a relationship-level links object

For example, the following request fetches a collection of articles:

```http
GET /articles HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

The following request fetches an article:

```http
GET /articles/1 HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

And the following request fetches an article's author:

```http
GET /articles/1/author HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

#### Responses <a href="#fetching-resources-responses" id="fetching-resources-responses" class="headerlink"></a>

##### 200 OK <a href="#fetching-resources-responses-200" id="fetching-resources-responses-200" class="headerlink"></a>

A server **MUST** respond to a successful request to fetch an individual
resource or resource collection with a `200 OK` response.

A server **MUST** respond to a successful request to fetch a resource
collection with an array of *resource objects* or an empty array (`[]`) as
the response document's primary data.

For example, a `GET` request to a collection of articles could return:

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "http://example.com/articles"
  },
  "data": [{
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON API paints my bikeshed!"
    }
  }, {
    "type": "articles",
    "id": "2",
    "attributes": {
      "title": "Rails is Omakase"
    }
  }]
}
```

A similar response representing an empty collection would be:

```http
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

`null` is only an appropriate response when the requested URL is one that
might correspond to a single resource, but doesn't currently.

> Note: Consider, for example, a request to fetch a to-one related resource URL.
This request would respond with `null` when the relationship is empty (such that
the URL is corresponding to no resources) but with the single related resource's
resource object otherwise.

For example, a `GET` request to an individual article could return:

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "http://example.com/articles/1"
  },
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON API paints my bikeshed!"
    },
    "relationships": {
      "author": {
        "links": {
          "related": "http://example.com/articles/1/author"
        }
      }
    }
  }
}
```

If the above article's author is missing, then a `GET` request to that related
resource would return:

```http
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

A server **MUST** respond with `404 Not Found` when processing a request to
fetch a single resource that does not exist, except when the request warrants a
`200 OK` response with `null` as the primary data (as described above).

##### Other Responses <a href="#fetching-resources-responses-other" id="fetching-resources-responses-other" class="headerlink"></a>

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

### Fetching Relationships <a href="#fetching-relationships" id="fetching-relationships" class="headerlink"></a>

A server **MUST** support fetching relationship data for every relationship URL
provided as a `self` link as part of a relationship's `links` object.

For example, the following request fetches data about an article's comments:

```http
GET /articles/1/relationships/comments HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

And the following request fetches data about an article's author:

```http
GET /articles/1/relationships/author HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

#### Responses <a href="#fetching-relationships-responses" id="fetching-relationships-responses" class="headerlink"></a>

##### 200 OK <a href="#fetching-relationships-responses-200" id="fetching-relationships-responses-200" class="headerlink"></a>

A server **MUST** respond to a successful request to fetch a relationship
with a `200 OK` response.

The primary data in the response document **MUST** match the appropriate
value for resource linkage, as described above for relationship objects.

The top-level *links object* **MAY** contain `self` and `related` links,
as described above for relationship objects.

For example, a `GET` request to a to-one relationship URL could return:

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "/articles/1/relationships/author",
    "related": "/articles/1/author"
  },
  "data": {
    "type": "people",
    "id": "12"
  }
}
```

If the above relationship is empty, then a `GET` request to the same URL would
return:

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "/articles/1/relationships/author",
    "related": "/articles/1/author"
  },
  "data": null
}
```

A `GET` request to a to-many relationship URL could return:

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "/articles/1/relationships/tags",
    "related": "/articles/1/tags"
  },
  "data": [
    { "type": "tags", "id": "2" },
    { "type": "tags", "id": "3" }
  ]
}
```

If the above relationship is empty, then a `GET` request to the same URL would
return:

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "links": {
    "self": "/articles/1/relationships/tags",
    "related": "/articles/1/tags"
  },
  "data": []
}
```

##### 404 Not Found <a href="#fetching-relationships-responses-404" id="fetching-relationships-responses-404" class="headerlink"></a>

A server **MUST** return `404 Not Found` when processing a request to fetch
a relationship URL that does not exist.

> Note: This can happen when the parent resource of the relationship
does not exist. For example, when `/articles/1` does not exist, request to
`/articles/1/relationships/tags` returns `404 Not Found`.

If a relationship URL exists but the relationship is empty, then
`200 OK` **MUST** be returned, as described above.

##### Other Responses <a href="#fetching-relationships-responses-other" id="fetching-relationships-responses-other" class="headerlink"></a>

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

### Inclusion of Related Resources <a href="#fetching-includes" id="fetching-includes" class="headerlink"></a>

An endpoint **MAY** return resources related to the primary data by default.

An endpoint **MAY** also support an `include` request parameter to allow the
client to customize which related resources should be returned.

If an endpoint does not support the `include` parameter, it must respond with
`400 Bad Request` to any requests that include it.

If an endpoint supports the `include` parameter and a client supplies it,
the server **MUST NOT** include other resource objects in the `included`
section of the compound document.

The value of the `include` parameter **MUST** be a comma-separated (U+002C
COMMA, ",") list of relationship paths. A relationship path is a dot-separated
(U+002E FULL-STOP, ".") list of relationship names.

If a server is unable to identify a relationship path or does not support
inclusion of resources from a path, it **MUST** respond with 400 Bad Request.

> Note: For example, a relationship path could be `comments.author`, where
`comments` is a relationship listed under a `articles` resource object, and
`author` is a relationship listed under a `comments` resource object.

For instance, comments could be requested with an article:

```http
GET /articles/1?include=comments HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

In order to request resources related to other resources, a dot-separated path
for each relationship name can be specified:

```http
GET /articles/1?include=comments.author HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

> Note: Because compound documents require full linkage, intermediate
resources in a multi-part path must be returned along with the leaf nodes.
For example, a response to a request for `comments.author` should
automatically include `comments` as well as the `author` of each of those
`comments`.

> Note: A server may choose to expose a deeply nested relationship such as
`comments.author` as a direct relationship with an alias such as
`comment-authors`. This would allow a client to request
`/articles/1?include=comment-authors` instead of
`/articles/1?include=comments.author`. By abstracting the nested
relationship with an alias, the server can still provide full linkage in
compound documents without including potentially unwanted intermediate
resources.

Multiple related resources can be requested in a comma-separated list:

```http
GET /articles/1?include=author,comments.author HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

Furthermore, related resources can be requested from a relationship endpoint:

```http
GET /articles/1/relationships/comments?include=comments.author HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

In this case, the primary data would be a collection of [resource identifier
objects] that represent linkage to comments for an article, while the full
comments and comment authors would be returned as included data.

> Note: This section applies to any endpoint that responds with primary
data, regardless of the request type. For instance, a server could support
the inclusion of related resources along with a `POST` request to create a
resource or relationship.

### Sparse Fieldsets <a href="#fetching-sparse-fieldsets" id="fetching-sparse-fieldsets" class="headerlink"></a>

A client **MAY** request that an endpoint return only specific [fields] in the
response on a per-type basis by including a `fields[TYPE]` parameter.

The value of the `fields` parameter **MUST** be a comma-separated (U+002C
COMMA, ",") list that refers to the name(s) of the fields to be returned.

If a client requests a restricted set of [fields], an endpoint **MUST NOT**
include additional [fields] in the response.

```http
GET /articles?include=author&fields[articles]=title,body&fields[people]=name HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

> Note: This section applies to any endpoint that responds with resources as
primary or included data, regardless of the request type. For instance, a
server could support sparse fieldsets along with a `POST` request to create
a resource.

### Sorting <a href="#fetching-sorting" id="fetching-sorting" class="headerlink"></a>

A server **MAY** choose to support requests to sort resource collections
according to one or more criteria ("sort fields").

> Note: Although recommended, sort fields do not necessarily need to
correspond to resource attribute and association names.

> Note: It is recommended that dot-separated (U+002E FULL-STOP, ".") sort
fields be used to request sorting based upon relationship attributes. For
example, a sort field of `author.name` could be used to request that the
primary data be sorted based upon the `name` attribute of the `author`
relationship.

An endpoint **MAY** support requests to sort the primary data with a `sort`
query parameter. The value for `sort` **MUST** represent sort fields.

```http
GET /people?sort=age HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

An endpoint **MAY** support multiple sort fields by allowing comma-separated
(U+002C COMMA, ",") sort fields. Sort fields **SHOULD** be applied in the
order specified.

```http
GET /people?sort=age,name HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

The sort order for each sort field **MUST** be ascending unless it is prefixed
with a minus (U+002D HYPHEN-MINUS, "-"), in which case it **MUST** be descending.

```http
GET /articles?sort=-created,title HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

The above example should return the newest articles first. Any articles
created on the same date will then be sorted by their title in ascending
alphabetical order.

If the server does not support sorting as specified in the query parameter
`sort`, it **MUST** return `400 Bad Request`.

If sorting is supported by the server and requested by the client via query
parameter `sort`, the server **MUST** return elements of the top-level
`data` array of the response ordered according to the criteria specified.
The server **MAY** apply default sorting rules to top-level `data` if
request parameter `sort` is not specified.

> Note: This section applies to any endpoint that responds with a resource
collection as primary data, regardless of the request type.

### Pagination <a href="#fetching-pagination" id="fetching-pagination" class="headerlink"></a>

A server **MAY** choose to limit the number of resources returned in a response
to a subset ("page") of the whole set available.

A server **MAY** provide links to traverse a paginated data set ("pagination
links").

Pagination links **MUST** appear in the links object that corresponds to a
collection. To paginate the primary data, supply pagination links in the
top-level `links` object. To paginate an included collection returned in
a compound document, supply pagination links in the corresponding links
object.

The following keys **MUST** be used for pagination links:

* `first` - the first page of data
* `last` - the last page of data
* `prev` - the previous page of data
* `next` - the next page of data

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

> Note: This section applies to any endpoint that responds with a resource
collection as primary data, regardless of the request type.

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

```http
POST /photos HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "photos",
    "attributes": {
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    },
    "relationships": {
      "photographer": {
        "data": { "type": "people", "id": "9" }
      }
    }
  }
}
```

If a relationship is provided in the `relationships` member of the
resource object, its value **MUST** be a relationship object with a `data`
member. The value of this key represents the linkage the new resource is to
have.

#### Client-Generated IDs <a href="#crud-creating-client-ids" id="crud-creating-client-ids" class="headerlink"></a>

A server **MAY** accept a client-generated ID along with a request to create
a resource. An ID **MUST** be specified with an `id` key, the value of
which **MUST** be a universally unique identifier. The client **SHOULD** use
a properly generated and formatted *UUID* as described in RFC 4122
[[RFC4122](http://tools.ietf.org/html/rfc4122.html)].

> NOTE: In some use-cases, such as importing data from another source, it
may be possible to use something other than a UUID that is still guaranteed
to be globally unique. Do not use anything other than a UUID unless you are
100% confident that the strategy you are using indeed generates globally
unique indentifiers.

For example:

```http
POST /photos HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "photos",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "attributes": {
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    }
  }
}
```

A server **MUST** return `403 Forbidden` in response to an unsupported request
to create a resource with a client-generated ID.

#### Responses <a href="#crud-creating-responses" id="crud-creating-responses" class="headerlink"></a>

##### 201 Created <a href="#crud-creating-responses-201" id="crud-creating-responses-201" class="headerlink"></a>

If a `POST` request did not include a [Client-Generated
ID](#crud-creating-client-ids) and the requested resource has been created
successfully, the server **MUST** return a `201 Created` status code.

The response **SHOULD** include a `Location` header identifying the location
of the newly created resource.

The response **MUST** also include a document that contains the primary
resource created.

If the resource object returned by the response contains a `self` key in its
`links` member, the value of the `self` member **MUST** match the value of
the `Location` header.

```http
HTTP/1.1 201 Created
Location: http://example.com/photos/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "photos",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "attributes": {
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    },
    "links": {
      "self": "http://example.com/photos/550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

##### 202 Accepted <a href="#crud-creating-responses-202" id="crud-creating-responses-202" class="headerlink"></a>

If a request to create a resource has been accepted for processing, but the
processing has not been completed by the time the server responds, the
server **MUST** return a `202 Accepted` status code.

##### 204 No Content <a href="#crud-creating-responses-204" id="crud-creating-responses-204" class="headerlink"></a>

If a `POST` request *did* include a [Client-Generated
ID](#crud-creating-client-ids) and the requested resource has been created
successfully, the server **MUST** return either a `201 Created` status code
and response document (as described above) or a `204 No Content` status code
with no response document.

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
which the resource's `type` is not among the type(s) that constitute the
collection represented by the endpoint.

A server **SHOULD** include error details and provide enough information to
recognize the source of the conflict.

##### Other Responses <a href="#crud-creating-responses-other" id="crud-creating-responses-other" class="headerlink"></a>

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

### Updating Resources <a href="#crud-updating" id="crud-updating" class="headerlink"></a>

A resource's attributes and relationships can be updated by sending a `PATCH`
request to the URL that represents the resource.

The URL for a resource can be obtained in the `self` link of the resource
object. Alternatively, when a `GET` request returns a single resource object as
primary data, the same request URL can be used for updates.

The `PATCH` request **MUST** include a single resource object as primary data.
The resource object **MUST** contain `type` and `id` members.

For example:

```http
PATCH /articles/1 HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "To TDD or Not"
    }
  }
}
```

#### Updating a Resource's Attributes <a href="#crud-updating-resource-attributes" id="crud-updating-resource-attributes" class="headerlink"></a>

Any or all of a resource's attributes **MAY** be included in the resource
object included in a `PATCH` request.

If a request does not include all of the [fields] for a resource, the server
**MUST** interpret the missing [fields] as if they were included with their
current values. It **MUST NOT** interpret them as `null` values.

For example, the following `PATCH` request is interpreted as a request to
update only the `title` and `text` attributes of an article:

```http
PATCH /articles/1 HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "To TDD or Not",
      "text": "TLDR; It's complicated... but check your test coverage regardless."
    }
  }
}
```

#### Updating a Resource's Relationships <a href="#crud-updating-resource-relationships" id="crud-updating-resource-relationships" class="headerlink"></a>

If a relationship is provided in the `relationships` member of a resource
object in a `PATCH` request, its value **MUST** be a relationship object
with a `data` member. The relationship's value will be replaced with the
value specified in this member.

For instance, the following `PATCH` request will update the `title` attribute
and `author` relationship of an article:

```http
PATCH /articles/1 HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "Rails is a Melting Pot"
    },
    "relationships": {
      "author": {
        "data": { "type": "people", "id": "1" }
      }
    }
  }
}
```

Likewise, the following `PATCH` request performs a complete replacement of
the `tags` for an article:

```http
PATCH /articles/1 HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "Rails is a Melting Pot"
    },
    "relationships": {
      "tags": {
        "data": [
          { "type": "tags", "id": "2" },
          { "type": "tags", "id": "3" }
        ]
      }
    }
  }
}
```

A server **MAY** reject an attempt to do a full replacement of a to-many
relationship. In such a case, the server **MUST** reject the entire update,
and return a `403 Forbidden` response.

> Note: Since full replacement may be a very dangerous operation, a server
may choose to disallow it. For example, a server may reject full replacement if
it has not provided the client with the full list of associated objects, and
does not want to allow deletion of records the client has not seen.

#### Responses <a href="#crud-updating-responses" id="crud-updating-responses" class="headerlink"></a>

##### 202 Accepted <a href="#crud-updating-responses-202" id="crud-updating-responses-202" class="headerlink"></a>

If an update request has been accepted for processing, but the processing
has not been completed by the time the server responds, the server **MUST**
return a `202 Accepted` status code.

##### 200 OK <a href="#crud-updating-responses-200" id="crud-updating-responses-200" class="headerlink"></a>

If a server accepts an update but also changes the resource(s) in ways other
than those specified by the request (for example, updating the `updated-at`
attribute or a computed `sha`), it **MUST** return a `200 OK` response. The
response document **MUST** include a representation of the updated
resource(s) as if a `GET` request was made to the request URL.

A server **MUST** return a `200 OK` status code if an update is successful,
the client's current attributes remain up to date, and the server responds
only with top-level `meta` data. In this case the server **MUST NOT**
include a representation of the updated resource(s).

##### 204 No Content <a href="#crud-updating-responses-204" id="crud-updating-responses-204" class="headerlink"></a>

If an update is successful and the server doesn't update any attributes besides
those provided, the server **MUST** return either a `200 OK` status code and
response document (as described above) or a `204 No Content` status code with no
response document.

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

A server **SHOULD** include error details and provide enough information to
recognize the source of the conflict.

##### Other Responses <a href="#crud-updating-responses-other" id="crud-updating-responses-other" class="headerlink"></a>

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

### Updating Relationships <a href="#crud-updating-relationships" id="crud-updating-relationships" class="headerlink"></a>

Although relationships can be modified along with resources (as described
above), JSON API also supports updating of relationships independently at
*relationship URLs*.

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

* a [resource identifier object] corresponding to the new related resource.
* `null`, to remove the relationship.

For example, the following request updates the author of an article:

```http
PATCH /articles/1/relationships/author HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "people", "id": "12" }
}
```

And the following request clears the author of the same article:

```http
PATCH /articles/1/relationships/author HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": null
}
```

If the relationship is updated successfully then the server **MUST** return
a successful response.

#### Updating To-Many Relationships <a href="#crud-updating-to-many-relationships" id="crud-updating-to-many-relationships" class="headerlink"></a>

A server **MUST** respond to `PATCH`, `POST`, and `DELETE` requests to a
*to-many relationship URL* as described below.

For all request types, the body **MUST** contain a `data` member whose value
is an empty array or an array of [resource identifier objects].

If a client makes a `PATCH` request to a *to-many relationship URL*, the
server **MUST** either completely replace every member of the relationship,
return an appropriate error response if some resources can not be found or
accessed, or return a `403 Forbidden` response if complete replacement is
not allowed by the server.

For example, the following request replaces every tag for an article:

```http
PATCH /articles/1/relationships/tags HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": [
    { "type": "tags", "id": "2" },
    { "type": "tags", "id": "3" }
  ]
}
```

And the following request clears every tag for an article:

```http
PATCH /articles/1/relationships/tags HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": []
}
```

If a client makes a `POST` request to a *relationship URL*, the server
**MUST** add the specified members to the relationship unless they are
already present. If a given `type` and `id` is already in the relationship,
the server **MUST NOT** add it again.

> Note: This matches the semantics of databases that use foreign keys for
has-many relationships. Document-based storage should check the has-many
relationship before appending to avoid duplicates.

If all of the specified resources can be added to, or are already present
in, the relationship then the server **MUST** return a successful response.

> Note: This approach ensures that a request is successful if the server's
state matches the requested state, and helps avoid pointless race conditions
caused by multiple clients making the same changes to a relationship.

In the following example, the comment with ID `123` is added to the list of
comments for the article with ID `1`:

```http
POST /articles/1/relationships/comments HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": [
    { "type": "comments", "id": "123" }
  ]
}
```

If the client makes a `DELETE` request to a *relationship URL*, the server
**MUST** delete the specified members from the relationship or return a `403
Forbidden` response. If all of the specified resources are able to be
removed from, or are already missing from, the relationship then the server
**MUST** return a successful response.

> Note: As described above for `POST` requests, this approach helps avoid
pointless race conditions between multiple clients making the same changes.

Relationship members are specified in the same way as in the `POST` request.

In the following example, comments with IDs of `12` and `13` are removed
from the list of comments for the article with ID `1`:

```http
DELETE /articles/1/relationships/comments HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": [
    { "type": "comments", "id": "12" },
    { "type": "comments", "id": "13" }
  ]
}
```

> Note: RFC 7231 specifies that a DELETE request may include a body, but
that a server may reject the request. This spec defines the semantics of a
server, and we are defining its semantics for JSON API.

#### Responses <a href="#crud-updating-relationship-responses" id="crud-updating-relationship-responses" class="headerlink"></a>

##### 202 Accepted <a href="#crud-updating-relationship-responses-202" id="crud-updating-relationship-responses-202" class="headerlink"></a>

If a relationship update request has been accepted for processing, but the
processing has not been completed by the time the server responds, the
server **MUST** return a `202 Accepted` status code.

##### 204 No Content <a href="#crud-updating-relationship-responses-204" id="crud-updating-relationship-responses-204" class="headerlink"></a>

A server **MUST** return a `204 No Content` status code if an update is
successful and the client's current attributes remain up to date.

> Note: This is the appropriate response to a `POST` request sent to a
*to-many relationship URL* when that relationship already exists. It is also
the appropriate response to a `DELETE` request sent to a *to-many
relationship URL* when that relationship does not exist.

##### 200 OK <a href="#crud-updating-relationship-responses-200" id="crud-updating-relationship-responses-200" class="headerlink"></a>

If a server accepts an update but also changes the targeted relationship(s)
in other ways than those specified by the request, it **MUST** return a `200
OK` response. The response document **MUST** include a representation of the
updated relationship(s).

A server **MUST** return a `200 OK` status code if an update is successful,
the client's current data remain up to date, and the server responds
only with top-level `meta` data. In this case the server **MUST NOT**
include a representation of the updated relationship(s).

##### 403 Forbidden <a href="#crud-updating-relationship-responses-403" id="crud-updating-relationship-responses-403" class="headerlink"></a>

A server **MUST** return `403 Forbidden` in response to an unsupported request
to update a relationship.

##### Other Responses <a href="#crud-updating-relationship-responses-other" id="crud-updating-relationship-responses-other" class="headerlink"></a>

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

### Deleting Resources <a href="#crud-deleting" id="crud-deleting" class="headerlink"></a>

An individual resource can be *deleted* by making a `DELETE` request to the
resource's URL:

```http
DELETE /photos/1 HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

#### Responses <a href="#crud-deleting-responses" id="crud-deleting-responses" class="headerlink"></a>

##### 202 Accepted <a href="#crud-deleting-responses-202" id="crud-deleting-responses-202" class="headerlink"></a>

If a deletion request has been accepted for processing, but the processing has
not been completed by the time the server responds, the server **MUST**
return a `202 Accepted` status code.

##### 204 No Content <a href="#crud-deleting-responses-204" id="crud-deleting-responses-204" class="headerlink"></a>

A server **MUST** return a `204 No Content` status code if a deletion
request is successful and no content is returned.

##### 200 OK <a href="#crud-deleting-responses-200" id="crud-deleting-responses-200" class="headerlink"></a>

A server **MUST** return a `200 OK` status code if a deletion request is
successful and the server responds with only top-level `meta` data.

##### Other Responses <a href="#crud-deleting-responses-other" id="crud-deleting-responses-other" class="headerlink"></a>

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

## Query Parameters <a href="#query-parameters" id="query-parameters" class="headerlink"></a>

Implementation specific query parameters **MUST** adhere to the same constraints
as [member names] with the additional requirement that they **MUST** contain at
least one non a-z character (U+0061 to U+007A). It is **RECOMMENDED** that a
U+002D HYPHEN-MINUS, "-", U+005F LOW LINE, "_", or capital letter is used
(e.g. camelCasing).

> Note: This is to preserve the ability of JSON API to make additive additions
to standard query parameters without conflicting with existing implementations.

## Errors <a href="#errors" id="errors" class="headerlink"></a>

### Processing Errors <a href="#errors-processing" id="errors-processing" class="headerlink"></a>

A server **MAY** choose to stop processing as soon as a problem is encountered,
or it **MAY** continue processing and encounter multiple problems. For instance,
a server might process multiple attribute updates and then return multiple
validation problems in a single response.

When a server encounters multiple problems for a single request, the most
generally applicable HTTP error code **SHOULD** be used in the response. For
instance, `400 Bad Request` might be appropriate for multiple 4xx errors
or `500 Internal Server Error` might be appropriate for multiple 5xx errors.

### Error Objects <a href="#error-objects" id="error-objects" class="headerlink"></a>

Error objects provide additional information about problems encountered while
performing an operation. Error objects **MUST** be returned as an array
keyed by `errors` in the top level of a JSON API document.

An error object **MAY** have the following members:

* `id` - A unique identifier for this particular occurrence of the problem.
* `href` - A URI that **MAY** yield further details about this particular
  occurrence of the problem.
* `status` - The HTTP status code applicable to this problem, expressed as a
  string value.
* `code` - An application-specific error code, expressed as a string value.
* `title` - A short, human-readable summary of the problem. It **SHOULD NOT**
  change from occurrence to occurrence of the problem, except for purposes of
  localization.
* `detail` - A human-readable explanation specific to this occurrence of the
  problem.
* `source` - An object containing references to the source of the error,
  optionally including any of the following members:
  * `pointer` - A JSON Pointer
    [[RFC6901](https://tools.ietf.org/html/rfc6901)] to the associated entity in
    the request document [e.g. `/data` for a primary data object, or
    `/data/attributes/title` for a specific attribute].
  * `parameter` - An optional string indicating which query parameter caused
    the error.
* `meta` - to contain non-standard meta-information about the error.

[attributes]: #document-structure-resource-attributes
[relationships]: #document-structure-resource-objects-relationships
[resource relationships]: #document-structure-resource-objects-relationships
[resource links]: #document-structure-resource-object-links
[resource identifier object]: #document-structure-resource-identifier-objects
[resource identifier objects]: #document-structure-resource-identifier-objects
[fields]: #document-structure-resource-object-fields
[error details]: #errors
[member names]: #document-structure-member-names
