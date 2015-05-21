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
without compromising readability, flexibility, or discoverability. JSON API can
also be easily [extended](#extending).

JSON API requires use of the JSON API media type
([`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json))
for exchanging data.

## Conventions <a href="#conventions" id="conventions" class="headerlink"></a>

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be
interpreted as described in RFC 2119
[[RFC2119](http://tools.ietf.org/html/rfc2119)].

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

A document **MUST** contain one of the following top-level members:

* `"data"`, containing the document's "primary data"
* `"errors"`, containing an array of [error objects](#errors)

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

* `"meta"`: non-standard meta-information about the primary data.
* `"links"`: URLs related to the primary data.
* `"included"`: an array of resource objects that are related to the primary
  data and/or each other ("included resources").

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

* `"attributes"`: an "attributes object" representing some of the resource's data.
* `"relationships"`: a "relationships object" describing relationships between
 the resource and other JSON API resources.
* `"links"`: a "links object" containing URLs related to the resource.
* `"meta"`: non-standard meta-information about a resource that can not be
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

#### Attributes Object <a href="#document-structure-resource-attributes-object" id="document-structure-resource-attributes-object" class="headerlink"></a>

The value of the `"attributes"` key is a JSON object (an "attributes object")
that represents information about the resource object it is contained within.

The top level of this object shares a namespace with the members of `relationships`
and **MUST NOT** contain `id` or `type` members. Apart from these restrictions,
this object can contain members keyed by any string valid for this specification.

#### Attributes <a href="#document-structure-resource-attributes" id="document-structure-resource-attributes" class="headerlink"></a>

All members which appear in an "attributes object" are considered attributes and
may contain any valid JSON value.

Although has-one foreign keys (e.g. `author_id`) are often stored internally
alongside other information to be represented in a resource object, these keys
**SHOULD NOT** appear as attributes. If relations are provided, they **MUST**
be represented under the "relationships object".

#### Resource Identification <a href="#document-structure-resource-identification" id="document-structure-resource-identification" class="headerlink"></a>

Every resource object is uniquely identified by the combination of its `"type"`
and `"id"` members.

A resource object's `"type"` and `"id"` pair **MUST** refer to a single, unique
resource.

#### Resource Types <a href="#document-structure-resource-types" id="document-structure-resource-types" class="headerlink"></a>

Each resource object **MUST** contain a `"type"` member, whose value **MUST**
be a string. The `"type"` is used to describe resource objects that share
common attributes and relationships.

> Note: This spec is agnostic about inflection rules, so the value of `type`
can be either plural or singular. However, the same value should be used
consistently throughout an implementation.

#### Resource IDs <a href="#document-structure-resource-ids" id="document-structure-resource-ids" class="headerlink"></a>

Each resource object **MUST** contain an `"id"` member, whose value **MUST**
be a string.

#### Relationships <a href="#document-structure-links" id="document-structure-resource-objects-relationships" class="headerlink"></a>

The value of the `"relationships"` key is a JSON object (a "relationships object")
that represents references from the resource in whose resource object it's defined
to other resources ("relationships"). These relationships share a namespace with
[attributes]; that is, relationships of a given resource object **MUST** be named
differently than its [attributes].

The keys `"id"` and `"type"` are not allowed within the relationships object.

Relationships may be to-one or to-many. Relationships can be specified by
including a member in a resource's relationship's object. The name of the
relationship is its key in the relationship object.

The value of a relationship **MUST** be an object (a "relationship object"),
which **MUST** contain at least one of the following:

* A `"links"` member that contains at least one of the following:
  * A `"self"` member, whose value is a URL for the relationship itself (a
    "relationship URL"). This URL allows the client to directly manipulate the
    relationship. For example, it would allow a client to remove an `author`
    from an `article` without deleting the `people` resource itself.
  * A `"related"` member, whose value is a related resource URL, as defined above.
* A `"data"` member, whose value represents "resource linkage" (defined below).
* A `"meta"` member that contains non-standard meta-information about the
  relationship.

A relationship object that represents a to-many relationship **MAY** also contain
pagination links under the `"links"` member, as described below.

Resource linkage **MUST** be represented as one of the following:

* `null` for empty to-one relationships.
* a [resource identifier object] for non-empty to-one relationships.
* an empty array (`[]`) for empty to-many relationships.
* an array of [resource identifier objects] for non-empty to-many relationships.

> Note: Resource linkage in a compound document allows a client to link
together all of the included resource objects without having to `GET` any
relationship URLs.

If present, a *related resource URL* **MUST** be a valid URL, even if the
relationship isn't currently associated with any target resources.

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

#### Resource Links <a href="#document-structure-structure-resource-object-links" id="document-structure-resource-object-links" class="headerlink"></a>

Analogous to the `"links"` member at the document's top level, the optional
`"links"` member within each resource object contains URLs related to the
resource.

If present, this object **MAY** contain a URL keyed by `"self"`, that identifies
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

#### Fields <a href="#document-structure-resource-object-fields" id="document-structure-resource-object-fields" class="headerlink"></a>

A resource object's [attributes] and its [relationships] are collectively called
its "[fields]".

### Resource Indentifier Objects <a href="#document-structure-resource-identifier-objects" id="document-structure-resource-identifier-objects" class="headerlink"></a>

A "resource identifier object" is an object that identifies an individual
resource.

It **MUST** contain `"type"` and `"id"` members.

It **MAY** also include a `"meta"` member to contain non-standard
meta-information.

### Compound Documents <a href="#document-structure-compound-documents" id="document-structure-compound-documents" class="headerlink"></a>

To reduce the number of HTTP requests, servers **MAY** allow responses that
include related resources along with the requested primary resources. Such
responses are called "compound documents".

In a compound document, all included resources **MUST** be represented as an
array of resource objects in a top-level `"included"` member.

Compound documents require "full linkage", meaning that every included
resource **MUST** be identified by at least one [resource identifier object]
in the same document. These resource identifier objects could either be
primary data or represent resource linkage contained within primary or
included resources.

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
meta-information as `"meta"` members in several locations: at the top-level,
within resource objects, within relationship objects, and within [resource
identifier objects].

All `"meta"` members **MUST** have an object as a value, the contents of which
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
within `"links"` members at several locations: at the top-level, within resource
objects, and within relationship objects.

The allowed keys for `links` objects at the resource and relationship object
levels are defined in the sections on [resource relationships] and
[resource links].

When a links object appears at the document's top-level, it **MAY** have
the following members:

* `"self"` - the URL that generated the current response document.
* `"related"` - a related resource URL (as defined above) when the primary
  data represents a resource relationship.
* `"profile"` - the name of one or more [profile extensions](#extending-extension-types-profile-extensions) being used
  in the document.
* Pagination links for the primary data (as described below).

### Member Names <a href="#document-structure-member-names" id="document-structure-member-names" class="headerlink"></a>

All member names used in a JSON API document **MUST** be treated as case
sensitive by clients and servers.

Member names added to a document by a [profile extension](#extending-extension-types-profile-extensions) **MUST** be
prefixed with either an underscore (U+005F LOW LINE, "_") or an "at sign"
(U+0040 COMMERCIAL AT, "@") if they sit at the same level as any members defined
by this specification.

Additionally:

- Member names **MUST** contain at least one character in addition to their
  prefix character (if any).
- Member names **MUST** contain only the allowed characters listed below.
- Excluding their prefix character (if any), member names **MUST** start and end
  with a "globally allowed character", as defined below.

To enable an easy mapping of member names to URLs, it is **RECOMMENDED** that
member names use only non-reserved, URL safe characters specified in [RFC 3986](http://tools.ietf.org/html/rfc3986#page-13).

#### Allowed Characters <a href="#document-structure-member-names-allowed-characters" id="document-structure-member-names-allowed-characters" class="headerlink"></a>

The following "globally allowed characters" **MAY** be used anywhere in a member name:

- U+0061 to U+007A, "a-z"
- U+0041 to U+005A, "A-Z"
- U+0030 to U+0039, "0-9"
- any UNICODE character except U+0000 to U+007F _(not recommended, not URL safe)_

Additionally, the following characters **MAY** be used in member names, except as
the last character and, excluding their possible use as a prefix character, as the
first character:

- U+002D HYPHEN-MINUS, "-"
- U+005F LOW LINE, "_"
- U+0040 COMMERCIAL AT, "@"
- U+0020 SPACE, " " _(not recommended, not URL safe)_
- U+005E CIRCUMFLEX ACCENT, "^" _(not recommended, not URL safe)_
- U+0060 GRAVE ACCENT, "`" _(not recommended, not URL safe)_

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
- U+005C REVERSE SOLIDUS, "\"
- U+007B LEFT CURLY BRACKET, "{"
- U+007C VERTICAL LINE, "|"
- U+007D RIGHT CURLY BRACKET, "}"
- U+007E TILDE, "~"

### Query Parameter Names <a href="#document-structure-query-parameter-names" id="document-structure-query-parameter-names" class="headerlink"></a>

If a URI in a `links` object contains any query parameters other than those
defined or reserved for users by this specification, the names of these
additional query parameters **MUST** begin with an underscore (U+005F LOW LINE, "_")
or an "at sign" (U+0040 COMMERCIAL AT, "@").

This is the only restriction that JSON API imposes on URIs.

## Fetching Data <a href="#fetching" id="fetching" class="headerlink"></a>

Data, including resources and relationships, can be fetched by sending a
`GET` request to an endpoint.

Clients **MUST** indicate that they can accept the JSON API media type, per
the semantics of the HTTP `Accept` header. If present, this header value **MUST**
also include any media type extensions relevant to the request.

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
GET /articles
```

The following request fetches an article:

```http
GET /articles/1
```

And the following request fetches an article's author:

```http
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

`null` is only an appropriate response when the requested URL is one that
might correspond to a single resource, but doesn't currently.

> Note: Consider, for example, a request to fetch a to-one related resource URL.
This request would respond with `null` when the relationship is empty (such that
the URL is corresponding to no resources) but with the single related resource's
resource object otherwise.

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

A server **MUST** respond with `404 Not Found` when processing a request to
fetch a single resource that does not exist, except when the request warrants a
`200 OK` response with `null` as the primary data (as described above).

##### Other Responses <a href="#fetching-resources-responses-other" id="fetching-resources-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

### Fetching Relationships <a href="#fetching-relationships" id="fetching-relationships" class="headerlink"></a>

A server **MUST** support fetching relationship data for every relationship URL
provided as a `self` link as part of a relationship's `links` object.

For example, the following request fetches data about an article's comments:

```http
GET /articles/1/relationships/comments
```

And the following request fetches data about an article's author:

```http
GET /articles/1/relationships/author
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

```text
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

```text
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

```text
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

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

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
(U+002E FULL-STOP, ".") list of relationship names. Each relationship name
**MUST** be identical to the key in the `"relationships"` member of its parent
resource object.

> Note: For example, a relationship path could be `comments.author`, where
`comments` is a relationship listed under a `articles` resource object, and
`author` is a relationship listed under a `comments` resource object.

For instance, comments could be requested with an article:

```http
GET /articles/1?include=comments
```

In order to request resources related to other resources, a dot-separated path
for each relationship name can be specified:

```http
GET /articles/1?include=comments.author
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
GET /articles/1?include=author,comments.author
```

### Sparse Fieldsets <a href="#fetching-sparse-fieldsets" id="fetching-sparse-fieldsets" class="headerlink"></a>

A client **MAY** request that an endpoint return only specific [fields] in the
response on a per-type basis by including a `fields[TYPE]` parameter.

The value of the `fields` parameter **MUST** be a comma-separated (U+002C
COMMA, ",") list that refers to the name(s) of the fields to be returned.

If a client requests a restricted set of [fields], an endpoint **MUST NOT**
include additional [fields] in the response.

```http
GET /articles?include=author&fields[articles]=title,body&fields[people]=name
```

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
GET /people?sort=age
```

An endpoint **MAY** support multiple sort fields by allowing comma-separated
(U+002C COMMA, ",") sort fields. Sort fields **SHOULD** be applied in the
order specified.

```http
GET /people?sort=age,name
```

The sort order for each sort field **MUST** be ascending unless it is prefixed
with a minus (U+002D HYPHEN-MINUS, "-"), in which case it **MUST** be descending.

```http
GET /articles?sort=-created,title
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
[include media type extensions](#extending-negotiating-extensions-sending)
relevant to the request.

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

If a relationship is provided in the `"relationships"` member of the
resource object, its value **MUST** be a relationship object with a `"data"`
member. The value of this key represents the linkage the new resource is to
have.

#### Client-Generated IDs <a href="#crud-creating-client-ids" id="crud-creating-client-ids" class="headerlink"></a>

A server **MAY** accept a client-generated ID along with a request to create
a resource. An ID **MUST** be specified with an `"id"` key, the value of
which **MUST** be a universally unique identifier. The client **SHOULD** use
a properly generated and formatted *UUID* as described in RFC 4122
[[RFC4122](http://tools.ietf.org/html/rfc4122.html)].

> NOTE: In some use-cases, such as importing data from another source, it
may be possible to use something other than a UUID that is still guaranteed
to be globally unique. Do not use anything other than a UUID unless you are
100% confident that the strategy you are using indeed generates globally
unique indentifiers.

For example:

```text
POST /photos
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

A server **MUST** respond to a successful resource creation request according to
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231#section-6.3).

The response **SHOULD** include a `Location` header identifying the location
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
which the resource's `type` is not among the type(s) that constitute the
collection represented by the endpoint.

A server **SHOULD** include error details and provide enough information to
recognize the source of the conflict.

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

```text
PATCH /articles/1
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

If a relationship is provided in the `"relationships"` member of a resource
object in a `PATCH` request, its value **MUST** be a relationship object
with a `"data"` member. The relationship's value will be replaced with the
value specified in this member.

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

```text
PATCH /articles/1
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

A server **SHOULD** include error details and provide enough information to
recognize the source of the conflict.

##### Other Responses <a href="#crud-updating-responses-other" id="crud-updating-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors. Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error
details **MAY** also be returned, as discussed below.

### Updating Relationships <a href="#crud-updating-relationships" id="crud-updating-relationships" class="headerlink"></a>

Although relationships can be modified along with resources (as described
above), JSON API also supports updating of relationships independently at
*relationship URLs*.

If a *relationship's `links` object* contains a *relationship URL*, then the
server **MUST** respond to requests to that URL to update the relationship.

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

```text
PATCH /articles/1/relationships/author
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "people", "id": "12" }
}
```

And the following request clears the author of the same article:

```text
PATCH /articles/1/relationships/author
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": null
}
```

If the relationship is updated successfully then the server **MUST** return
a `204 No Content` response.

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

```text
PATCH /articles/1/relationships/tags
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

```text
PATCH /articles/1/relationships/tags
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": []
}
```

If a client makes a `POST` request to a *relationship URL*, the server
**MUST** add the specified members to the relationship using set
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
POST /articles/1/relationships/comments
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
**MUST** return a successful `204 No Content` response.

> Note: As described above for `POST` requests, this approach helps avoid
pointless race conditions between multiple clients making the same changes.

Relationship members are specified in the same way as in the `POST` request.

In the following example, comments with IDs of `12` and `13` are removed
from the list of comments for the article with ID `1`:

```text
DELETE /articles/1/relationships/comments
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

```http
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


## Extending <a href="#extending" id="extending" class="headerlink"></a>

The base JSON API specification **MAY** be extended to support additional
capabilities.

### Extension Types <a href="#extending-extension-types" id="extending-extension-types" class="headerlink"></a>

JSON API allows two types of extensions, each with their own constraints and
negotiation rules.

#### Profile Extensions <a href="#extending-extension-types-profile-extensions" id="extending-extension-types-profile-extensions" class="headerlink"></a>

An extension **MAY** allow (or require) users to add new members to a JSON API
document. An extension that does this, and that defines the semantics or behavior
associated with those new members, is called a "profile extension".

Beyond adding new members to JSON objects, a profile extension **MUST NOT** alter
the JSON structure for any concept defined in this specification, including to
allow a superset of JSON structures.

The semantics that a profile extension defines for the new document members it
allows **MUST NOT** vary based on the presence or absence of other profile extensions.

Additionally, a profile extension **MUST NOT** alter the semantics associated
with any concept defined in the base spec, including to add additional meaning.

> Note: Prohibiting profile extensions from imposing additional meanings on base
spec constructs prevents profile extensions from conflicting with one another and
ensures forward compatibility with meanings the base spec might add in the future.

The members that a profile extension defines **MAY** be added anywhere in the
document. However, they **MUST** follow the [member naming rules](#document-structure-member-names)
about prefixing.

Profile extensions that add multiple members **SHOULD** group those members in
an object literal when possible, to reduce the risk of name collisions with other
profile extensions.

To simplify extension negotiation, servers **MUST NOT** offer support for profile
extensions which add conflicting member names, even if only one such extension
is requested at a time.

#### Comprehensive Extensions <a href="#extending-extension-types-comprehensive-extensions" id="extending-extension-types-comprehensive-extensions" class="headerlink"></a>

An extension **MAY** define semantics for requests that are invalid or
undefined under the base specification. An extension that does this is called a
"comprehensive extension".

For the purposes of this section, an invalid request is one that triggers a 4xx
or 5xx status code in response. Conversly, a valid request is one that triggers
a 2xx or 3xx status code.

When a comprehensive extension is in use, it **MUST** treat any requests that
are valid under the base specification's rules exactly as though they were made
without the extension in use. That is, comprehensive extensions only affect
requests that would otherwise be invalid.

On the requests for which it applies, a comprehensive extension **MAY** deviate
from the base specification however it wishes, apart from the definitions and
requirements of the [Extending](#extending) section, which remain binding.

#### Other Extensions <a href="#extending-extension-types-other-extensions" id="extending-extension-types-other-extensions" class="headerlink"></a>

Any extension that can not be classified as a profile extension or a
comprehensive extension, per the above definitions, is not allowed.

### Naming Extensions <a href="#extending-naming-extensions" id="extending-naming-extensions" class="headerlink"></a>

A profile extension is named with a [URI](https://www.ietf.org/rfc/rfc3986.txt).
This URI **SHOULD** be dereferencable to a document that contains useful
documentation about the profile extension.

A comprehensive extension is named with a string. Except for official extensions,
the name of a comprehensive extension **MUST** contain a slash (U+002F SOLIDUS, "/").
Additionally, the name of a comprehensive extension **MUST NOT** contain a space
(U+0020 SPACE, " ") or any character that is not allowed in a media type parameter.

It is **RECOMMENDED** that comprehensive extensions that are not designed to be
shared be named in the format "organization-name/extension-name" and that
extensions that are designed to be shared be named with URIs.

### Advertising Extensions <a href="#extending-advertising-extensions" id="extending-advertising-extensions" class="headerlink"></a>

A server **MAY** advertise the extensions it supports to make it easier for
clients to request extended responses.

Servers that choose to advertise their extensions **MUST** do so by responding
to an `OPTIONS` request made to any URI that represents a JSON API resource or
collection, or that is provided in a `links` object (as defined in the base spec).

The server's response **MUST** contain a body with a JSON object at the top-level.
This object **MUST** contain a `"data"` member, the value of which be must be an
array of JSON objects.

Each object in the array **MUST** have a `"type"` member and an `"id"` member.

The value of the `"type"` member **MUST** be either `"comprehensive"`, for
comprehensive extensions, or `"profile"` for profile extensions. The value of
the `"id"` member **MUST** be the extension's name.

The server's response **MUST** have a `Content-Type` header whose value is
`application/vnd.api+json`.

For example, a client interested in the extensions supported at the `/articles`
endpoint would request `OPTIONS /articles`, and the response might be as follows:

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "data": [{
    "type": "comprehensive",
    "id": "bulk"
  }, {
    "type": "comprehensive",
    "id": "acme-corp/magic-ext"
  }, {
    "type": "profile",
    "id": "http://example.com/json-api-profile"
  }]
}
```

### Negotiating Extensions <a href="#extending-negotiating-extensions" id="extending-negotiating-extensions" class="headerlink"></a>

The JSON API media type defines two parameters, `ext` and `profile`. These
parameters allow clients and servers to indicate the use of comprehensive
extensions and profile extensions, respectively, on an HTTP request. They also
allow clients to ask for particular extensions.

The value of each of these parameters, if present, is a space-separated
(U+0020 SPACE, " ") list of extension names.

#### Fetching Data

##### The Client

When fetching data using a `GET` request, the client **MAY** ask for the
response to be formatted using a combination of comprehensive extensions by
listing those extensions as the value of the `ext` parameter and including the
parameterized media type in its `Accept` header.

For example, to request that the response to `GET /` be formatted according to a
comprehensive extension called `"acme/entry-point"`, the client would send a
request like:

```http
GET /
Accept: application/vnd.api+json; ext="acme/entry-point"
```

> Note: this example request is for an API's entrypoint (i.e. the `/` URI)
because a comprehensive extension cannot, for example, change the response of a
request to fetch a JSON API resource, since that is a valid request under the
base specification.

And, to request that the response be simultaneously be formatted according to
the `acme/entry-point` extension _and_ the `acme/ext2` extension, the
client would request:

```http
GET /
Accept: application/vnd.api+json; ext="acme/entry-point acme/ext2"
```

A client **MAY** also signal that it can accept more than one combination of
comprehensive extensions, by adding additional entries to its `Accept` header.

For example, if a client wants to communicate that it understands both the
`http://example.com/ext/entry-point` format and the `http://jsonapi.org/ext/entry-point`
format, it would make a request like so:

```http
GET /
Accept: application/vnd.api+json; ext="http://example.com/ext/entry-point",
          application/vnd.api+json; ext="http://jsonapi.org/ext/entry-point"
```

Whenever the client provides the JSON API media type in the `Accept` header, it
**MAY** also include a `profile` parameter to request a set of profiles. This
applies even when the `ext` parameter is not present.

##### The Server

When the server recieves a `GET` request with an `Accept` header, it **MUST**
first select the comprehensive extensions to use in its response.

To do this, it checks the entries of the `Accept` header, in the order defined
by the HTTP specification. The first combination of comprehensive extensions
that it finds that it supports, as specified by the `ext` parameter (or the lack
of such a parameter, if the base specification is requested) constitute the
"selected comprehensive extensions".

If the server doesn't support any of the requested combinations of comprehensive
extensions, it **MUST** return a `406 Not Acceptable` status code.

Otherwise, having selected the comprehensive extensions to use for the request,
it **MUST** then look for a `profile` parameter on the entry in the `Accept`
header from which it picked the selected comprehensive extensions.

If such a `profile` parameter exists, the server **MUST** apply to its response
as many of the specified profile extensions as it knows how to support in
conjunction with the selected comprehensive extensions.

> Note: Because most profile extensions will define the locations of the members
that they add to the document with reference to the document described by the
base specification, there is no gaurantee that a given profile will work
with a given comprehensive extension (which can change the document structure
arbitrarily). Authors of a comprehensive extension (or server implementors) who
wish to make that extension compatible with profile extensions are responsible
for explicitly defining how this interoperability works.

Finally, in its response, the server **MUST** send the `Content-Type` header
with the JSON API media type; the selected comprehensive extensions' names
as the value of the `ext` parameter; and the selected profile extensions' name
as the value of the `profile` parameter.

Additionally, the server **MUST** indicate in the body of the response which
profile extensions are in use by listing them in the [top-level `links` object]().

#### Sending Data to the Server <a href="#extending-negotiating-extensions-sending" id="extending-negotiating-extensions-sending" class="headerlink"></a>

THIS IS TO BE WRITTEN.

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
* `"source"` - An object containing references to the source of the error,
  optionally including any of the following members:
  * `"pointer"` - A JSON Pointer
    [[RFC6901](https://tools.ietf.org/html/rfc6901)] to the associated entity in
    the request document [e.g. `"/data"` for a primary data object, or
    `"/data/attributes/title"` for a specific attribute].
  * `"parameter"` - An optional string indicating which query parameter caused
    the error.
* `"meta"` - to contain non-standard meta-information about the error.

[attributes]: #document-structure-resource-object-attributes
[relationships]: #document-structure-resource-object-relationships
[resource relationships]: #document-structure-resource-object-relationships
[resource links]: #document-structure-resource-object-links
[resource identifier object]: #document-structure-resource-identifier-objects
[resource identifier objects]: #document-structure-resource-identifier-objects
[fields]: #document-structure-resource-object-fields
