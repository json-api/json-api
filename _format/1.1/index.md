---
version: 1.1
status: rc
release_date: 2019-01-31
---

## <a href="#introduction" id="introduction" class="headerlink"></a> Introduction

JSON:API is a specification for how a client should request that resources be
fetched or modified, and how a server should respond to those requests. JSON:API
can also be easily extended with [profiles].

JSON:API is designed to minimize both the number of requests and the amount of
data transmitted between clients and servers. This efficiency is achieved
without compromising readability, flexibility, or discoverability.

JSON:API requires use of the JSON:API media type
([`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json))
for exchanging data.

## <a href="#conventions" id="conventions" class="headerlink"></a> Conventions

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this
document are to be interpreted as described in
[BCP 14](https://tools.ietf.org/html/bcp14)
[[RFC2119](https://tools.ietf.org/html/rfc2119)]
[[RFC8174](https://tools.ietf.org/html/rfc8174)]
when, and only when, they appear in all capitals, as shown here.

## <a href="#content-negotiation" id="content-negotiation" class="headerlink"></a> Content Negotiation

### <a href="#content-negotiation-all" id="content-negotiation-all" class="headerlink"></a> Universal Responsibilities

The JSON:API media type is [`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json).
Clients and servers **MUST** send all JSON:API data using this media type in the
`Content-Type` header.

Further, the JSON:API media type **MUST** always be specified with either no
media type parameters or with only the `profile` parameter. This applies to both
the `Content-Type` and `Accept` headers.

> Note: A media type parameter is an extra piece of information that can
accompany a media type. For example, in the header
`Content-Type: text/html; charset="utf-8"`, the media type is `text/html` and
`charset` is a parameter.

The `profile` parameter is used to support [profiles].

### <a href="#content-negotiation-clients" id="content-negotiation-clients" class="headerlink"></a> Client Responsibilities

Clients that include the JSON:API media type in their `Accept` header **MUST**
specify the media type there at least once without any media type parameters.

When processing a JSON:API response document, clients **MUST** ignore any
parameters other than `profile` in the server's `Content-Type` header.

### <a href="#content-negotiation-servers" id="content-negotiation-servers" class="headerlink"></a> Server Responsibilities

Servers **MUST** respond with a `415 Unsupported Media Type` status code if
a request specifies the header `Content-Type: application/vnd.api+json`
with any media type parameters other than `profile`.

Servers **MUST** respond with a `406 Not Acceptable` status code if a
request's `Accept` header contains the JSON:API media type and all instances
of that media type are modified with media type parameters.

> Note: These content negotiation requirements exist to allow future versions
of this specification to add other media type parameters for extension
negotiation and versioning.

## <a href="#document-structure" id="document-structure" class="headerlink"></a> Document Structure

This section describes the structure of a JSON:API document, which is identified
by the media type [`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json).
JSON:API documents are defined in JavaScript Object Notation (JSON)
[[RFC8259](http://tools.ietf.org/html/rfc8259)].

Although the same media type is used for both request and response documents,
certain aspects are only applicable to one or the other. These differences are
called out below.

Unless otherwise noted, objects defined by this specification **MUST NOT**
contain any additional members. Client and server implementations **MUST**
ignore members not recognized by this specification.

> Note: These conditions allow this specification to evolve through additive
changes.

### <a href="#document-top-level" id="document-top-level" class="headerlink"></a> Top Level

A JSON object **MUST** be at the root of every JSON:API request and response
containing data. This object defines a document's "top level".

A document **MUST** contain at least one of the following top-level members:

* `data`: the document's "primary data"
* `errors`: an array of [error objects](#errors)
* `meta`: a [meta object][meta] that contains non-standard
  meta-information.

The members `data` and `errors` **MUST NOT** coexist in the same document.

A document **MAY** contain any of these top-level members:

* `jsonapi`: an object describing the server's implementation
* `links`: a [links object][links] related to the primary data.
* `included`: an array of [resource objects] that are related to the primary
  data and/or each other ("included resources").

If a document does not contain a top-level `data` key, the `included` member
**MUST NOT** be present either.

The top-level [links object][links] **MAY** contain the following members:

* `self`: the [link][links] that generated the current response document.
* `related`: a [related resource link] when the primary data represents a
  resource relationship.
* `profile`: an array of [links][link], each specifying a [profile][profiles]
  in use in the document.
* [pagination] links for the primary data.

The document's "primary data" is a representation of the resource or collection
of resources targeted by a request.

Primary data **MUST** be either:

* a single [resource object][resource objects], a single [resource identifier object], or `null`,
  for requests that target single resources
* an array of [resource objects], an array of
  [resource identifier objects][resource identifier object], or
  an empty array (`[]`), for requests that target resource collections

For example, the following primary data is a single resource object:

```json
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

```json
{
  "data": {
    "type": "articles",
    "id": "1"
  }
}
```

A logical collection of resources **MUST** be represented as an array, even if
it only contains one item or is empty.

### <a href="#document-resource-objects" id="document-resource-objects" class="headerlink"></a> Resource Objects

"Resource objects" appear in a JSON:API document to represent resources.

A resource object **MUST** contain at least the following top-level members:

* `id`
* `type`

Exception: The `id` member is not required when the resource object originates at
the client and represents a new resource to be created on the server.

In addition, a resource object **MAY** contain any of these top-level members:

* `attributes`: an [attributes object][attributes] representing some of the resource's data.
* `relationships`: a [relationships object][relationships] describing relationships between
 the resource and other JSON:API resources.
* `links`: a [links object][links] containing links related to the resource.
* `meta`: a [meta object][meta] containing non-standard meta-information about a
  resource that can not be represented as an attribute or relationship.

Here's how an article (i.e. a resource of type "articles") might appear in a document:

```json
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

#### <a href="#document-resource-object-identification" id="document-resource-object-identification" class="headerlink"></a> Identification

Every [resource object][resource objects] **MUST** contain an `id` member and a `type` member.
The values of the `id` and `type` members **MUST** be strings.

Within a given API, each resource object's `type` and `id` pair **MUST**
identify a single, unique resource. (The set of URIs controlled by a server,
or multiple servers acting as one, constitute an API.)

The `type` member is used to describe [resource objects] that share common
attributes and relationships.

The values of `type` members **MUST** adhere to the same constraints as
[member names].

> Note: This spec is agnostic about inflection rules, so the value of `type`
can be either plural or singular. However, the same value should be used
consistently throughout an implementation.

#### <a href="#document-resource-object-fields" id="document-resource-object-fields" class="headerlink"></a> Fields

A resource object's [attributes] and its [relationships] are collectively called
its "[fields]".

Fields for a [resource object][resource objects] **MUST** share a common namespace with each
other and with `type` and `id`. In other words, a resource can not have an
attribute and relationship with the same name, nor can it have an attribute
or relationship named `type` or `id`.

##### <a href="#document-resource-object-attributes" id="document-resource-object-attributes" class="headerlink"></a> Attributes

The value of the `attributes` key **MUST** be an object (an "attributes
object"). Members of the attributes object ("attributes") represent information
about the [resource object][resource objects] in which it's defined.

Attributes may contain any valid JSON value.

Complex data structures involving JSON objects and arrays are allowed as
attribute values. However, any object that constitutes or is contained in an
attribute **MUST NOT** contain a `relationships` or `links` member, as those
members are reserved by this specification for future use.

Although has-one foreign keys (e.g. `author_id`) are often stored internally
alongside other information to be represented in a resource object, these keys
**SHOULD NOT** appear as attributes.

> Note: See [fields] and [member names] for more restrictions on this container.

##### <a href="#document-resource-object-relationships" id="document-resource-object-relationships" class="headerlink"></a> Relationships

The value of the `relationships` key **MUST** be an object (a "relationships
object"). Members of the relationships object ("relationships") represent
references from the [resource object][resource objects] in which it's defined to other resource
objects.

Relationships may be to-one or to-many.

<a id="document-resource-object-relationships-relationship-object"></a>
A "relationship object" **MUST** contain at least one of the following:

* `links`: a [links object][links] containing at least one of the following:
  * `self`: a link for the relationship itself (a "relationship link"). This
    link allows the client to directly manipulate the relationship. For example,
    removing an `author` through an `article`'s relationship URL would disconnect
    the person from the `article` without deleting the `people` resource itself.
    When fetched successfully, this link returns the [linkage][resource linkage]
    for the related resources as its primary data.
    (See [Fetching Relationships](#fetching-relationships).)
  * `related`: a [related resource link]
* `data`: [resource linkage]
* `meta`: a [meta object][meta] that contains non-standard meta-information about the
  relationship.

A relationship object that represents a to-many relationship **MAY** also contain
[pagination] links under the `links` member, as described below. Any
[pagination] links in a relationship object **MUST** paginate the relationship
data, not the related resources.

> Note: See [fields] and [member names] for more restrictions on this container.

##### <a href="#document-resource-object-related-resource-links" id="document-resource-object-related-resource-links" class="headerlink"></a> Related Resource Links

A "related resource link" provides access to [resource objects][resource objects] [linked][links]
in a [relationship][relationships]. When fetched, the related resource object(s)
are returned as the response's primary data.

For example, an `article`'s `comments` [relationship][relationships] could
specify a [link][links] that returns a collection of comment [resource objects]
when retrieved through a `GET` request.

If present, a related resource link **MUST** reference a valid URL, even if the
relationship isn't currently associated with any target resources. Additionally,
a related resource link **MUST NOT** change because its relationship's content
changes.

##### <a href="#document-resource-object-linkage" id="document-resource-object-linkage" class="headerlink"></a> Resource Linkage

Resource linkage in a [compound document] allows a client to link together all
of the included [resource objects] without having to `GET` any URLs via [links].

Resource linkage **MUST** be represented as one of the following:

* `null` for empty to-one relationships.
* an empty array (`[]`) for empty to-many relationships.
* a single [resource identifier object] for non-empty to-one relationships.
* an array of [resource identifier objects][resource identifier object] for non-empty to-many relationships.

> Note: The spec does not impart meaning to order of resource identifier
objects in linkage arrays of to-many relationships, although implementations
may do that. Arrays of resource identifier objects may represent ordered
or unordered relationships, and both types can be mixed in one response
object.

For example, the following article is associated with an `author`:

```json
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

The `author` relationship includes a link for the relationship itself (which
allows the client to change the related author directly), a related resource
link to fetch the resource objects, and linkage information.

#### <a href="#document-resource-object-links" id="document-resource-object-links" class="headerlink"></a> Resource Links

The optional `links` member within each [resource object][resource objects] contains [links]
related to the resource.

If present, this links object **MAY** contain a `self` [link][links] that
identifies the resource represented by the resource object.

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

### <a href="#document-resource-identifier-objects" id="document-resource-identifier-objects" class="headerlink"></a> Resource Identifier Objects

A "resource identifier object" is an object that identifies an individual
resource.

A "resource identifier object" **MUST** contain `type` and `id` members.

A "resource identifier object" **MAY** also include a `meta` member, whose value is a [meta] object that
contains non-standard meta-information.

### <a href="#document-compound-documents" id="document-compound-documents" class="headerlink"></a> Compound Documents

To reduce the number of HTTP requests, servers **MAY** allow responses that
include related resources along with the requested primary resources. Such
responses are called "compound documents".

In a compound document, all included resources **MUST** be represented as an
array of [resource objects] in a top-level `included` member.

Compound documents require "full linkage", meaning that every included
resource **MUST** be identified by at least one [resource identifier object]
in the same document. These resource identifier objects could either be
primary data or represent resource linkage contained within primary or
included resources.

The only exception to the full linkage requirement is when relationship fields
that would otherwise contain linkage data are excluded via [sparse fieldsets](#fetching-sparse-fieldsets).

> Note: Full linkage ensures that included resources are related to either
the primary data (which could be [resource objects] or [resource identifier
objects][resource identifier object]) or to each other.

A complete example document with multiple included relationships:

```json
{
  "data": [{
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON:API paints my bikeshed!"
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
      "firstName": "Dan",
      "lastName": "Gebhardt",
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
    "relationships": {
      "author": {
        "data": { "type": "people", "id": "2" }
      }
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
    "relationships": {
      "author": {
        "data": { "type": "people", "id": "9" }
      }
    },
    "links": {
      "self": "http://example.com/comments/12"
    }
  }]
}
```

A [compound document] **MUST NOT** include more than one [resource object][resource objects] for
each `type` and `id` pair.

> Note: In a single document, you can think of the `type` and `id` as a
composite key that uniquely references [resource objects] in another part of
the document.

> Note: This approach ensures that a single canonical [resource object][resource objects] is
returned with each response, even when the same resource is referenced
multiple times.

### <a href="#document-meta" id="document-meta" class="headerlink"></a> Meta Information

Where specified, a `meta` member can be used to include non-standard
meta-information. The value of each `meta` member **MUST** be an object (a
"meta object").

Any members **MAY** be specified within `meta` objects.

For example:

```json
{
  "meta": {
    "copyright": "Copyright 2015 Example Corp.",
    "authors": [
      "Yehuda Katz",
      "Steve Klabnik",
      "Dan Gebhardt",
      "Tyler Kellen"
    ]
  },
  "data": {
    // ...
  }
}
```

### <a href="#document-links" id="document-links" class="headerlink"></a> Links

Where specified, a `links` member can be used to represent links. The value
of this member **MUST** be an object (a "links object").

<a href="#document-links-link" id="document-links-link"></a>
Within this object, a link **MUST** be represented as either:

* a string containing the link's URI.
* <a id="document-links-link-object"></a>an object ("link object") which can
  contain the following members:
  * `href`: a string containing the link's URI.
  * `meta`: a meta object containing non-standard meta-information about the
    link.
  * Any link-specific target attributes described below.

Except for the `profile` key in the top-level links object and the `type` 
key in an [error object]'s links object, each key present in a links object 
**MUST** have a single link as its value. The aforementioned `profile` and
`type` keys, if present, **MUST** hold an array of links.

In the example below, the `self` link is simply a URI string, whereas the 
`related` link uses the object form to provide meta information about a 
related resource collection:

```json
"links": {
  "self": "http://example.com/articles/1",
  "related": {
    "href": "http://example.com/articles/1/comments",
    "meta": {
      "count": 10
    }
  }
}
```

#### <a href="#profile-links" id="profile-links" class="headerlink"></a> Profile Links

Like all [links][link], a link in an array of `profile` links can be represented
with a [link object].

Here, the `profile` key specifies an array of `profile` links:

```json
"links": {
  "profile": [
    "http://example.com/profiles/flexible-pagination",
    "http://example.com/profiles/resource-versioning"
  ]
}
```

> Note: Additional link types, similar to `profile` links, may be specified in
the future.

### <a href="#document-jsonapi-object" id="document-jsonapi-object" class="headerlink"></a> JSON:API Object

A JSON:API document **MAY** include information about its implementation
under a top level `jsonapi` member. If present, the value of the `jsonapi`
member **MUST** be an object (a "jsonapi object").

The jsonapi object **MAY** contain any of the following members:

* `version` - whose value is a string indicating the highest JSON:API version
  supported.
* `meta` - a [meta] object that contains non-standard meta-information.

A simple example appears below:

```json
{
  "jsonapi": {
    "version": "1.1"
  }
}
```

If the `version` member is not present, clients should assume the server
implements at least version 1.0 of the specification.

> Note: Because JSON:API is committed to making additive changes only, the
version string primarily indicates which new features a server may support.

### <a href="#document-member-names" id="document-member-names" class="headerlink"></a> Member Names

All member names used in a JSON:API document **MUST** be treated as case sensitive
by clients and servers, and they **MUST** meet all of the following conditions:

- Member names **MUST** contain at least one character.
- Member names **MUST** contain only the allowed characters listed below.
- Member names **MUST** start and end with a "globally allowed character",
  as defined below.

To enable an easy mapping of member names to URLs, it is **RECOMMENDED** that
member names use only non-reserved, URL safe characters specified in [RFC 3986](http://tools.ietf.org/html/rfc3986#page-13).

#### <a href="#document-member-names-allowed-characters" id="document-member-names-allowed-characters" class="headerlink"></a> Allowed Characters

The following "globally allowed characters" **MAY** be used anywhere in a member name:

- U+0061 to U+007A, "a-z"
- U+0041 to U+005A, "A-Z"
- U+0030 to U+0039, "0-9"
- U+0080 and above (non-ASCII Unicode characters; _not recommended, not URL safe_)

Additionally, the following characters are allowed in member names, except as the
first or last character:

- U+002D HYPHEN-MINUS, "-"
- U+005F LOW LINE, "_"
- U+0020 SPACE, " " _(not recommended, not URL safe)_

#### <a href="#document-member-names-reserved-characters" id="document-member-names-reserved-characters" class="headerlink"></a> Reserved Characters

The following characters **MUST NOT** be used in member names:

- U+002B PLUS SIGN, "+" _(has overloaded meaning in URL query strings)_
- U+002C COMMA, "," _(used as a separator between relationship paths)_
- U+002E PERIOD, "." _(used as a separator within relationship paths)_
- U+005B LEFT SQUARE BRACKET, "[" _(used in sparse fieldsets)_
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
- U+002A ASTERISK, "&#x2a;"
- U+002F SOLIDUS, "/"
- U+003A COLON, ":"
- U+003B SEMICOLON, ";"
- U+003C LESS-THAN SIGN, "<"
- U+003D EQUALS SIGN, "="
- U+003E GREATER-THAN SIGN, ">"
- U+003F QUESTION MARK, "?"
- U+0040 COMMERCIAL AT, "@" (except as first character in [@-Members](#document-member-names-at-members))
- U+005C REVERSE SOLIDUS, "&#x5c;"
- U+005E CIRCUMFLEX ACCENT, "^"
- U+0060 GRAVE ACCENT, "&#x60;"
- U+007B LEFT CURLY BRACKET, "{"
- U+007C VERTICAL LINE, "&#x7c;"
- U+007D RIGHT CURLY BRACKET, "}"
- U+007E TILDE, "~"
- U+007F DELETE
- U+0000 to U+001F (C0 Controls)

#### <a href="#document-member-names-at-members" id="document-member-names-at-members" class="headerlink"></a> @-Members

Member names **MAY** also begin with an at sign (U+0040 COMMERCIAL AT, "@").
Members named this way are called "@-Members". @-Members **MAY** appear
anywhere in a JSON:API document.

However, JSON:API processors **MUST** completely ignore @-Members (i.e. not
treat them as JSON:API data).

Moreover, the existence of @-Members **MUST** be ignored when interpreting all
JSON:API definitions and processing instructions given outside of this
subsection. For example, an [attribute][attributes] is defined above as any
member of the attributes object. However, because @-Members must be ignored
when interpreting that definition, an @-Member that occurs in an attributes
object is not an attribute.

> Note: Among other things, "@" members can be used to add JSON-LD data to a
JSON:API document. Such documents should be served with [an extra header](http://www.w3.org/TR/json-ld/#interpreting-json-as-json-ld)
to convey to JSON-LD clients that they contain JSON-LD data.

## <a href="#fetching" id="fetching" class="headerlink"></a> Fetching Data

Data, including resources and relationships, can be fetched by sending a
`GET` request to an endpoint.

Responses can be further refined with the optional features described below.

### <a href="#fetching-resources" id="fetching-resources" class="headerlink"></a> Fetching Resources

A server **MUST** support fetching resource data for every URL provided as:

* a `self` link as part of the top-level links object
* a `self` link as part of a resource-level links object
* a `related` link as part of a relationship-level links object

For example, the following request fetches a collection of articles:

```http
GET /articles HTTP/1.1
Accept: application/vnd.api+json
```

The following request fetches an article:

```http
GET /articles/1 HTTP/1.1
Accept: application/vnd.api+json
```

And the following request fetches an article's author:

```http
GET /articles/1/author HTTP/1.1
Accept: application/vnd.api+json
```

#### <a href="#fetching-resources-responses" id="fetching-resources-responses" class="headerlink"></a> Responses

##### <a href="#fetching-resources-responses-200" id="fetching-resources-responses-200" class="headerlink"></a> 200 OK

A server **MUST** respond to a successful request to fetch an individual
resource or resource collection with a `200 OK` response.

A server **MUST** respond to a successful request to fetch a resource
collection with an array of [resource objects] or an empty array (`[]`) as
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
      "title": "JSON:API paints my bikeshed!"
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
resource with a [resource object][resource objects] or `null` provided as
the response document's primary data.

`null` is only an appropriate response when the requested URL is one that
might correspond to a single resource, but doesn't currently.

> Note: Consider, for example, a request to fetch a to-one related resource link.
This request would respond with `null` when the relationship is empty (such that
the link is corresponding to no resources) but with the single related resource's
[resource object][resource objects] otherwise.

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
      "title": "JSON:API paints my bikeshed!"
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

##### <a href="#fetching-resources-responses-404" id="fetching-resources-responses-404" class="headerlink"></a> 404 Not Found

A server **MUST** respond with `404 Not Found` when processing a request to
fetch a single resource that does not exist, except when the request warrants a
`200 OK` response with `null` as the primary data (as described above).

##### <a href="#fetching-resources-responses-other" id="fetching-resources-responses-other" class="headerlink"></a> Other Responses

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

### <a href="#fetching-relationships" id="fetching-relationships" class="headerlink"></a> Fetching Relationships

A server **MUST** support fetching relationship data for every relationship URL
provided as a `self` link as part of a relationship's `links` object.

For example, the following request fetches data about an article's comments:

```http
GET /articles/1/relationships/comments HTTP/1.1
Accept: application/vnd.api+json
```

And the following request fetches data about an article's author:

```http
GET /articles/1/relationships/author HTTP/1.1
Accept: application/vnd.api+json
```

#### <a href="#fetching-relationships-responses" id="fetching-relationships-responses" class="headerlink"></a> Responses

##### <a href="#fetching-relationships-responses-200" id="fetching-relationships-responses-200" class="headerlink"></a> 200 OK

A server **MUST** respond to a successful request to fetch a relationship
with a `200 OK` response.

The primary data in the response document **MUST** match the appropriate
value for [resource linkage], as described above for
[relationship objects][relationships].

The top-level [links object][links] **MAY** contain `self` and `related` links,
as described above for [relationship objects][relationships].

For example, a `GET` request to a URL from a to-one relationship link could
return:

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

A `GET` request to a URL from a to-many relationship link could return:

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

```http
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

##### <a href="#fetching-relationships-responses-404" id="fetching-relationships-responses-404" class="headerlink"></a> 404 Not Found

A server **MUST** return `404 Not Found` when processing a request to fetch
a relationship link URL that does not exist.

> Note: This can happen when the parent resource of the relationship
does not exist. For example, when `/articles/1` does not exist, request to
`/articles/1/relationships/tags` returns `404 Not Found`.

If a relationship link URL exists but the relationship is empty, then
`200 OK` **MUST** be returned, as described above.

##### <a href="#fetching-relationships-responses-other" id="fetching-relationships-responses-other" class="headerlink"></a> Other Responses

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

### <a href="#fetching-includes" id="fetching-includes" class="headerlink"></a> Inclusion of Related Resources

An endpoint **MAY** return resources related to the primary data by default.

An endpoint **MAY** also support an `include` query parameter to allow the
client to customize which related resources should be returned.

If an endpoint does not support the `include` parameter, it **MUST** respond
with `400 Bad Request` to any requests that include it.

If an endpoint supports the `include` parameter and a client supplies it:

 - The server's response **MUST** be a [compound document] with an `included` key — even if that `included` key holds an empty array (because the requested relationships are empty).
 - The server **MUST NOT** include unrequested [resource objects] in the `included`
section of the [compound document].

The value of the `include` parameter **MUST** be a comma-separated (U+002C
COMMA, ",") list of relationship paths. A relationship path is a dot-separated
(U+002E FULL-STOP, ".") list of [relationship][relationships] names.

If a server is unable to identify a relationship path or does not support
inclusion of resources from a path, it **MUST** respond with 400 Bad Request.

> Note: For example, a relationship path could be `comments.author`, where
`comments` is a relationship listed under a `articles` [resource object][resource objects], and
`author` is a relationship listed under a `comments` [resource object][resource objects].

For instance, comments could be requested with an article:

```http
GET /articles/1?include=comments HTTP/1.1
Accept: application/vnd.api+json
```

In order to request resources related to other resources, a dot-separated path
for each relationship name can be specified:

```http
GET /articles/1?include=comments.author HTTP/1.1
Accept: application/vnd.api+json
```

> Note: Because [compound documents][compound document] require full linkage
(except when relationship linkage is excluded by sparse fieldsets), intermediate
resources in a multi-part path must be returned along with the leaf nodes. For
example, a response to a request for `comments.author` should include `comments`
as well as the `author` of each of those `comments`.

> Note: A server may choose to expose a deeply nested relationship such as
`comments.author` as a direct relationship with an alternative name such as
`commentAuthors`. This would allow a client to request
`/articles/1?include=commentAuthors` instead of
`/articles/1?include=comments.author`. By exposing the nested relationship with 
an alternative name, the server can still provide full linkage in compound 
documents without including potentially unwanted intermediate resources.

Multiple related resources can be requested in a comma-separated list:

```http
GET /articles/1?include=author,comments.author HTTP/1.1
Accept: application/vnd.api+json
```

Furthermore, related resources can be requested from a relationship endpoint:

```http
GET /articles/1/relationships/comments?include=comments.author HTTP/1.1
Accept: application/vnd.api+json
```

In this case, the primary data would be a collection of
[resource identifier objects][resource identifier object] that represent linkage to comments for an article,
while the full comments and comment authors would be returned as included data.

> Note: This section applies to any endpoint that responds with primary
data, regardless of the request type. For instance, a server could support
the inclusion of related resources along with a `POST` request to create a
resource or relationship.

### <a href="#fetching-sparse-fieldsets" id="fetching-sparse-fieldsets" class="headerlink"></a> Sparse Fieldsets

A client **MAY** request that an endpoint return only specific [fields] in the
response on a per-type basis by including a `fields[TYPE]` query parameter.

The value of any `fields[TYPE]` parameter **MUST** be a comma-separated (U+002C
COMMA, ",") list that refers to the name(s) of the fields to be returned.

If a client requests a restricted set of [fields] for a given resource type,
an endpoint **MUST NOT** include additional [fields] in resource objects of
that type in its response.

```http
GET /articles?include=author&fields[articles]=title,body&fields[people]=name HTTP/1.1
Accept: application/vnd.api+json
```

> Note: The above example URI shows unencoded `[` and `]` characters simply for
readability. In practice, these characters should be percent-encoded. See 
"[Square Brackets in Parameter Names](#appendix-query-details-square-brackets)".

> Note: This section applies to any endpoint that responds with resources as
primary or included data, regardless of the request type. For instance, a
server could support sparse fieldsets along with a `POST` request to create
a resource.

### <a href="#fetching-sorting" id="fetching-sorting" class="headerlink"></a> Sorting

A server **MAY** choose to support requests to sort resource collections
according to one or more criteria ("sort fields").

> Note: Although recommended, sort fields do not necessarily need to
correspond to resource attribute and relationship names.

> Note: It is recommended that dot-separated (U+002E FULL-STOP, ".") sort
fields be used to request sorting based upon relationship attributes. For
example, a sort field of `author.name` could be used to request that the
primary data be sorted based upon the `name` attribute of the `author`
relationship.

An endpoint **MAY** support requests to sort the primary data with a `sort`
query parameter. The value for `sort` **MUST** represent sort fields.

```http
GET /people?sort=age HTTP/1.1
Accept: application/vnd.api+json
```

An endpoint **MAY** support multiple sort fields by allowing comma-separated
(U+002C COMMA, ",") sort fields. Sort fields **SHOULD** be applied in the
order specified.

```http
GET /people?sort=age,name HTTP/1.1
Accept: application/vnd.api+json
```

The sort order for each sort field **MUST** be ascending unless it is prefixed
with a minus (U+002D HYPHEN-MINUS, "-"), in which case it **MUST** be descending.

```http
GET /articles?sort=-created,title HTTP/1.1
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

### <a href="#fetching-pagination" id="fetching-pagination" class="headerlink"></a> Pagination

A server **MAY** choose to limit the number of resources returned in a response
to a subset ("page") of the whole set available.

A server **MAY** provide links to traverse a paginated data set ("pagination
links").

Pagination links **MUST** appear in the links object that corresponds to a
collection. To paginate the primary data, supply pagination links in the
top-level `links` object. To paginate an included collection returned in
a [compound document], supply pagination links in the corresponding links
object.

The following keys **MUST** be used for pagination links:

* `first`: the first page of data
* `last`: the last page of data
* `prev`: the previous page of data
* `next`: the next page of data

Keys **MUST** either be omitted or have a `null` value to indicate that a
particular link is unavailable.

Concepts of order, as expressed in the naming of pagination links, **MUST**
remain consistent with JSON:API's [sorting rules](#fetching-sorting).

The `page` [query parameter family] is reserved for pagination. Servers and 
clients **SHOULD** use these parameters for pagination operations.

> Note: JSON API is agnostic about the pagination strategy used by a server, but
> the `page` query parameter family can be used regardless of the strategy 
> employed. For example, a page-based strategy might use query parameters such 
> as `page[number]` and `page[size]`, while a cursor-based strategy might use 
> `page[cursor]`.

> Note: This section applies to any endpoint that responds with a resource
collection as primary data, regardless of the request type.

### <a href="#fetching-filtering" id="fetching-filtering" class="headerlink"></a> Filtering

The `filter` [query parameter family] is reserved for filtering data. Servers 
and clients **SHOULD** use these parameters for filtering operations.

> Note: JSON API is agnostic about the strategies supported by a server.

## <a href="#crud" id="crud" class="headerlink"></a> Creating, Updating and Deleting Resources

A server **MAY** allow resources of a given type to be created. It **MAY**
also allow existing resources to be modified or deleted.

A request **MUST** completely succeed or fail (in a single "transaction"). No
partial updates are allowed.

> Note: The `type` member is required in every [resource object][resource objects] throughout requests and
responses in JSON:API. There are some cases, such as when `POST`ing to an
endpoint representing heterogenous data, when the `type` could not be inferred
from the endpoint. However, picking and choosing when it is required would be
confusing; it would be hard to remember when it was required and when it was
not. Therefore, to improve consistency and minimize confusion, `type` is
always required.

### <a href="#crud-creating" id="crud-creating" class="headerlink"></a> Creating Resources

A resource can be created by sending a `POST` request to a URL that represents
a collection of resources. The request **MUST** include a single [resource object][resource objects]
as primary data. The [resource object][resource objects] **MUST** contain at least a `type` member.

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
[resource object][resource objects], its value **MUST** be a relationship object with a `data`
member. The value of this key represents the [linkage][resource linkage] the new resource is to
have.

#### <a href="#crud-creating-client-ids" id="crud-creating-client-ids" class="headerlink"></a> Client-Generated IDs

A server **MAY** accept a client-generated ID along with a request to create
a resource. An ID **MUST** be specified with an `id` key, the value of
which **MUST** be a universally unique identifier. The client **SHOULD** use
a properly generated and formatted *UUID* as described in RFC 4122
[[RFC4122](http://tools.ietf.org/html/rfc4122.html)].

> NOTE: In some use-cases, such as importing data from another source, it
may be possible to use something other than a UUID that is still guaranteed
to be globally unique. Do not use anything other than a UUID unless you are
100% confident that the strategy you are using indeed generates globally
unique identifiers.

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

#### <a href="#crud-creating-responses" id="crud-creating-responses" class="headerlink"></a> Responses

##### <a href="#crud-creating-responses-201" id="crud-creating-responses-201" class="headerlink"></a> 201 Created

If a `POST` request did not include a [Client-Generated
ID](#crud-creating-client-ids) and the requested resource has been created
successfully, the server **MUST** return a `201 Created` status code.

The response **SHOULD** include a `Location` header identifying the location
of the newly created resource, in order to comply with [RFC
7231](http://tools.ietf.org/html/rfc7231#section-6.3.2).

The response **MUST** also include a document that contains the primary
resource created.

If the [resource object][resource objects] returned by the response contains a `self` key in its
`links` member and a `Location` header is provided, the value of the `self`
member **MUST** match the value of the `Location` header.

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

##### <a href="#crud-creating-responses-202" id="crud-creating-responses-202" class="headerlink"></a> 202 Accepted

If a request to create a resource has been accepted for processing, but the
processing has not been completed by the time the server responds, the
server **MUST** return a `202 Accepted` status code.

##### <a href="#crud-creating-responses-204" id="crud-creating-responses-204" class="headerlink"></a> 204 No Content

If a `POST` request *did* include a [Client-Generated
ID](#crud-creating-client-ids) and the requested resource has been created
successfully, the server **MUST** return either a `201 Created` status code
and response document (as described above) or a `204 No Content` status code
with no response document.

> Note: If a `204` response is received the client should consider the resource
object sent in the request to be accepted by the server, as if the server
had returned it back in a `201` response.

##### <a href="#crud-creating-responses-403" id="crud-creating-responses-403" class="headerlink"></a> 403 Forbidden

A server **MAY** return `403 Forbidden` in response to an unsupported request
to create a resource.

##### <a href="#crud-creating-responses-404" id="crud-creating-responses-404" class="headerlink"></a> 404 Not Found

A server **MUST** return `404 Not Found` when processing a request that
references a related resource that does not exist.

##### <a href="#crud-creating-responses-409" id="crud-creating-responses-409" class="headerlink"></a> 409 Conflict

A server **MUST** return `409 Conflict` when processing a `POST` request to
create a resource with a client-generated ID that already exists.

A server **MUST** return `409 Conflict` when processing a `POST` request in
which the [resource object][resource objects]'s `type` is not among the type(s) that constitute the
collection represented by the endpoint.

A server **SHOULD** include error details and provide enough information to
recognize the source of the conflict.

##### <a href="#crud-creating-responses-other" id="crud-creating-responses-other" class="headerlink"></a> Other Responses

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

### <a href="#crud-updating" id="crud-updating" class="headerlink"></a> Updating Resources

A resource can be updated by sending a `PATCH` request to the URL that
represents the resource.

The URL for a resource can be obtained in the `self` link of the resource
object. Alternatively, when a `GET` request returns a single [resource object][resource objects] as
primary data, the same request URL can be used for updates.

The `PATCH` request **MUST** include a single [resource object][resource objects] as primary data.
The [resource object][resource objects] **MUST** contain `type` and `id` members.

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

#### <a href="#crud-updating-resource-attributes" id="crud-updating-resource-attributes" class="headerlink"></a> Updating a Resource's Attributes

Any or all of a resource's [attributes] **MAY** be included in the resource
object included in a `PATCH` request.

If a request does not include all of the [attributes] for a resource, the server
**MUST** interpret the missing [attributes] as if they were included with their
current values. The server **MUST NOT** interpret missing attributes as `null`
values.

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

#### <a href="#crud-updating-resource-relationships" id="crud-updating-resource-relationships" class="headerlink"></a> Updating a Resource's Relationships

Any or all of a resource's [relationships] **MAY** be included in the resource
object included in a `PATCH` request.

If a request does not include all of the [relationships] for a resource, the server
**MUST** interpret the missing [relationships] as if they were included with their
current values. It **MUST NOT** interpret them as `null` or empty values.

If a relationship is provided in the `relationships` member of a resource
object in a `PATCH` request, its value **MUST** be a relationship object
with a `data` member. The relationship's value will be replaced with the
value specified in this member.

For instance, the following `PATCH` request will update the `author` relationship of an article:

```http
PATCH /articles/1 HTTP/1.1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
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

#### <a href="#crud-updating-responses" id="crud-updating-responses" class="headerlink"></a> Responses

##### <a href="#crud-updating-responses-202" id="crud-updating-responses-202" class="headerlink"></a> 202 Accepted

If an update request has been accepted for processing, but the processing
has not been completed by the time the server responds, the server **MUST**
return a `202 Accepted` status code.

##### <a href="#crud-updating-responses-200" id="crud-updating-responses-200" class="headerlink"></a> 200 OK

If a server accepts an update but also changes the resource(s) in ways other
than those specified by the request (for example, updating the `updated-at`
attribute or a computed `sha`), it **MUST** return a `200 OK` response. The
response document **MUST** include a representation of the updated
resource(s) as if a `GET` request was made to the request URL.

A server **MUST** return a `200 OK` status code if an update is successful,
the client's current attributes remain up to date, and the server responds
only with top-level [meta] data. In this case the server **MUST NOT**
include a representation of the updated resource(s).

##### <a href="#crud-updating-responses-204" id="crud-updating-responses-204" class="headerlink"></a> 204 No Content

If an update is successful and the server doesn't update any attributes besides
those provided, the server **MUST** return either a `200 OK` status code and
response document (as described above) or a `204 No Content` status code with no
response document.

##### <a href="#crud-updating-relationship-responses-403" id="crud-updating-relationship-responses-403" class="headerlink"></a> 403 Forbidden

A server **MUST** return `403 Forbidden` in response to an unsupported request
to update a resource or relationship.

##### <a href="#crud-updating-responses-404" id="crud-updating-responses-404" class="headerlink"></a> 404 Not Found

A server **MUST** return `404 Not Found` when processing a request to modify
a resource that does not exist.

A server **MUST** return `404 Not Found` when processing a request that
references a related resource that does not exist.

##### <a href="#crud-updating-responses-409" id="crud-updating-responses-409" class="headerlink"></a> 409 Conflict

A server **MAY** return `409 Conflict` when processing a `PATCH` request to
update a resource if that update would violate other server-enforced
constraints (such as a uniqueness constraint on a property other than `id`).

A server **MUST** return `409 Conflict` when processing a `PATCH` request in
which the resource object's `type` and `id` do not match the server's endpoint.

A server **SHOULD** include error details and provide enough information to
recognize the source of the conflict.

##### <a href="#crud-updating-responses-other" id="crud-updating-responses-other" class="headerlink"></a> Other Responses

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

### <a href="#crud-updating-relationships" id="crud-updating-relationships" class="headerlink"></a> Updating Relationships

Although relationships can be modified along with resources (as described
above), JSON:API also supports updating of relationships independently at
URLs from [relationship links][relationships].

> Note: Relationships are updated without exposing the underlying server
semantics, such as foreign keys. Furthermore, relationships can be updated
without necessarily affecting the related resources. For example, if an article
has many authors, it is possible to remove one of the authors from the article
without deleting the person itself. Similarly, if an article has many tags, it
is possible to add or remove tags. Under the hood on the server, the first
of these examples might be implemented with a foreign key, while the second
could be implemented with a join table, but the JSON:API protocol would be
the same in both cases.

> Note: A server may choose to delete the underlying resource if a
relationship is deleted (as a garbage collection measure).

#### <a href="#crud-updating-to-one-relationships" id="crud-updating-to-one-relationships" class="headerlink"></a> Updating To-One Relationships

A server **MUST** respond to `PATCH` requests to a URL from a to-one
[relationship link][relationships] as described below.

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

#### <a href="#crud-updating-to-many-relationships" id="crud-updating-to-many-relationships" class="headerlink"></a> Updating To-Many Relationships

A server **MUST** respond to `PATCH`, `POST`, and `DELETE` requests to a
URL from a to-many [relationship link][relationships] as described below.

For all request types, the body **MUST** contain a `data` member whose value
is an empty array or an array of [resource identifier objects][resource identifier object].

If a client makes a `PATCH` request to a URL from a to-many
[relationship link][relationships], the server **MUST** either completely
replace every member of the relationship, return an appropriate error response
if some resources can not be found or accessed, or return a `403 Forbidden`
response if complete replacement is not allowed by the server.

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

If a client makes a `POST` request to a URL from a
[relationship link][relationships], the server **MUST** add the specified
members to the relationship unless they are already present. If a given `type`
and `id` is already in the relationship, the server **MUST NOT** add it again.

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

If the client makes a `DELETE` request to a URL from a
[relationship link][relationships] the server **MUST** delete the specified
members from the relationship or return a `403 Forbidden` response. If all of
the specified resources are able to be removed from, or are already missing
from, the relationship then the server **MUST** return a successful response.

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
server, and we are defining its semantics for JSON:API.

#### <a href="#crud-updating-relationship-responses" id="crud-updating-relationship-responses" class="headerlink"></a> Responses

##### <a href="#crud-updating-relationship-responses-202" id="crud-updating-relationship-responses-202" class="headerlink"></a> 202 Accepted

If a relationship update request has been accepted for processing, but the
processing has not been completed by the time the server responds, the
server **MUST** return a `202 Accepted` status code.

##### <a href="#crud-updating-relationship-responses-204" id="crud-updating-relationship-responses-204" class="headerlink"></a> 204 No Content

A server **MUST** return a `204 No Content` status code if an update is
successful and the representation of the resource in the request matches the
result.

> Note: This is the appropriate response to a `POST` request sent to a URL
from a to-many [relationship link][relationships] when that relationship already
exists. It is also the appropriate response to a `DELETE` request sent to a URL
from a to-many [relationship link][relationships] when that relationship does
not exist.

##### <a href="#crud-updating-relationship-responses-200" id="crud-updating-relationship-responses-200" class="headerlink"></a> 200 OK

If a server accepts an update but also changes the targeted relationship(s)
in other ways than those specified by the request, it **MUST** return a `200
OK` response. The response document **MUST** include a representation of the
updated relationship(s).

A server **MUST** return a `200 OK` status code if an update is successful,
the client's current data remain up to date, and the server responds
only with top-level [meta] data. In this case the server **MUST NOT**
include a representation of the updated relationship(s).

##### <a href="#crud-updating-relationship-responses-403" id="crud-updating-relationship-responses-403" class="headerlink"></a> 403 Forbidden

A server **MUST** return `403 Forbidden` in response to an unsupported request
to update a relationship.

##### <a href="#crud-updating-relationship-responses-other" id="crud-updating-relationship-responses-other" class="headerlink"></a> Other Responses

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

### <a href="#crud-deleting" id="crud-deleting" class="headerlink"></a> Deleting Resources

An individual resource can be *deleted* by making a `DELETE` request to the
resource's URL:

```http
DELETE /photos/1 HTTP/1.1
Accept: application/vnd.api+json
```

#### <a href="#crud-deleting-responses" id="crud-deleting-responses" class="headerlink"></a> Responses

##### <a href="#crud-deleting-responses-202" id="crud-deleting-responses-202" class="headerlink"></a> 202 Accepted

If a deletion request has been accepted for processing, but the processing has
not been completed by the time the server responds, the server **MUST**
return a `202 Accepted` status code.

##### <a href="#crud-deleting-responses-204" id="crud-deleting-responses-204" class="headerlink"></a> 204 No Content

A server **MUST** return a `204 No Content` status code if a deletion
request is successful and no content is returned.

##### <a href="#crud-deleting-responses-200" id="crud-deleting-responses-200" class="headerlink"></a> 200 OK

A server **MUST** return a `200 OK` status code if a deletion request is
successful and the server responds with only top-level [meta] data.

##### <a href="#crud-deleting-responses-404" id="crud-deleting-responses-404" class="headerlink"></a> 404 NOT FOUND

A server **SHOULD** return a `404 Not Found` status code if a deletion request fails
due to the resource not existing.

##### <a href="#crud-deleting-responses-other" id="crud-deleting-responses-other" class="headerlink"></a> Other Responses

A server **MAY** respond with other HTTP status codes.

A server **MAY** include [error details] with error responses.

A server **MUST** prepare responses, and a client **MUST** interpret
responses, in accordance with
[`HTTP semantics`](http://tools.ietf.org/html/rfc7231).

## <a href="#query-parameters" id="query-parameters" class="headerlink"></a> Query Parameters

### <a href="#query-parameters-families" id="query-parameters-families" class="headerlink"></a>  Query Parameter Families
Although "query parameter" is a common term in everyday web development, it is
not a well-standardized concept. Therefore, JSON:API provides its own 
[definition of a query parameter](#appendix-query-details).

For the most part, JSON:API's definition coincides with colloquial usage, and its 
details can be safely ignored. However, one important consequence of this 
definition is that a URL like the following is considered to have two distinct
query parameters:

```
/?page[offset]=0&page[limit]=10
```

The two parameters are named `page[offset]` and `page[limit]`; there is no 
single `page` parameter.

In practice, however, parameters like `page[offset]` and `page[limit]` are 
usually defined and processed together, and it's convenient to refer to them 
collectively. Therefore, JSON:API introduces the concept of a query parameter 
family.

A "query parameter family" is the set of all query parameters whose name starts 
with a "base name", followed by zero or more instances of empty square brackets 
(i.e. `[]`) or square-bracketed legal member names. The family is referred to 
by its base name.

For example, the `filter` query parameter family includes parameters named:
`filter`, `filter[x]`, `filter[]`, `filter[x][]`, `filter[][]`, `filter[x][y]`, 
etc. However, `filter[_]` is not a valid parameter name in the family, because
`_` is not a valid [member name][member names].

### <a href="#query-parameters-custom" id="query-parameters-custom" class="headerlink"></a>   Implementation-Specific Query Parameters
Implementations **MAY** support custom query parameters. However, the names of 
these query parameters **MUST** come from a [family][query parameter family] 
whose base name is a legal [member name][member names] and also contains at least 
one non a-z character (i.e., outside U+0061 to U+007A).

It is **RECOMMENDED** that a capital letter (e.g. camelCasing) be used to 
satisfy the above requirement.

If a server encounters a query parameter that does not follow the naming
conventions above, and the server does not know how to process it as a query
parameter from this specification, it **MUST** return `400 Bad Request`.

> Note: By forbidding the use of query parameters that contain only the characters
> \[a-z\], JSON:API is reserving the ability to standardize additional query
> parameters later without conflicting with existing implementations.

## <a href="#profiles" id="profiles" class="headerlink"></a> Profiles

JSON:API supports the use of "profiles" as a way to indicate additional
semantics that apply to a JSON:API request/document, without altering the
basic semantics described in this specification.

A profile is a separate specification defining these additional semantics. 

[RFC 6906](https://tools.ietf.org/html/rfc6906) covers the nature of profile
identification:

> Profiles are identified by URI... The presence of a specific URI has to be
  sufficient for a client to assert that a resource representation conforms to 
  a profile [regardless of any content that may or may not be available at that 
  URI].

However, to aid human understanding, visiting a profile's URI **SHOULD** return
documentation of the profile.

The following example profile reserves a `timestamps` member in the `meta`
object of every resource object:

<a id="profiles-timestamp-profile"></a>
```text
# Timestamps profile

## Introduction

This page specifies a profile for the `application/vnd.api+json` media type,
as described in the [JSON:API specification](http://jsonapi.org/format/).

This profile allows every resource in a JSON:API document to represent
significant timestamps in a consistent way.

## Document Structure

Every resource object **MAY** include a `timestamps` member in its associated 
`meta` object. If this member is present, its value **MUST** be an object that 
**MAY** contain any of the following members:

* `created`
* `updated`

The value of each member **MUST** comply with the variant of ISO 8601 used by 
JavaScript's `JSON.stringify` method to format Javascript `Date` objects. 

## Keywords

This profile defines the following keywords:

* `timestamps`
```

### <a href="#profile-media-type-parameter" id="profile-media-type-parameter" class="headerlink"></a> `profile` Media Type Parameter

The `profile` media type parameter is used to describe the application of
one or more profiles to a JSON:API document. The value of the `profile`
parameter **MUST** equal a space-separated (U+0020 SPACE, " ") list of profile URIs.

> Note: When serializing the `profile` media type parameter, the HTTP
> specification requires that its value be surrounded by quotation marks
> (U+0022 QUOTATION MARK, "\"") if it contains more than one URI.

A client **MAY** use the `profile` media type parameter in conjunction with the
JSON:API media type in an `Accept` header to _request_, but not _require_, that
the server apply one or more profiles to the response document. When such a
request is received, a server **SHOULD** attempt to apply the requested profiles
to its response.

For example, in the following request, the client asks that the server apply the
`http://example.com/last-modified` profile if it is able to.

```http
Accept: application/vnd.api+json;profile="http://example.com/last-modified", application/vnd.api+json
```

> Note: The second instance of the JSON:API media type in the example above is
  required under the [client's content negotiation responsibilities](#content-negotiation-clients).
  It is used to support old servers that don't understand the profile parameter.

Servers **MAY** add profiles to a JSON:API document even if the client has not
requested them. The recipient of a document **MUST** ignore any profiles in that
document that it does not understand. The only exception to this is profiles
whose support is required using the `profile` query parameter, as described later.

#### <a href="#profiles-sending" id="profiles-sending" class="headerlink"></a> Sending Profiled Documents

Clients and servers **MUST** include the `profile` media type parameter in
conjunction with the JSON:API media type in a `Content-Type` header to indicate
that they have applied one or more profiles to a JSON:API document.

Likewise, clients and servers applying profiles to a JSON:API document **MUST**
include a [top-level][top level] [`links` object][links] with a `profile` key,
and that `profile` key **MUST** include a [link] to the URI of each profile
that has been applied.

When an older JSON:API server that doesn't support the `profile` media type
parameter receives a document with one or more profiles, it will respond with a
`415 Unsupported Media Type` error.

After attempting to rule out other possible causes of this error, a client that
receives a `415 Unsupported Media Type` **SHOULD** remove the profiles it has 
applied to the document and retry its request without the `profile` media type 
parameter. If this resolves the error, the client **SHOULD NOT** attempt to
apply profiles in subsequent interactions with the same API.

> The most likely other causes of a 415 error are that the server doesn't
support JSON:API at all or that the client has failed to provide a required
profile.

### <a href="#profile-query-parameter" id="profile-query-parameter" class="headerlink"></a> `profile` Query Parameter

A client **MAY** use the `profile` query parameter to _require_ the server to
apply one or more profiles when processing the request. The value of the `profile`
query parameter **MUST** equal a URI-encoded whitespace-separated list of profile URIs.

If a server receives a request requiring the application of a profile or
combination of profiles that it can not apply, it **MUST** respond with a `400
Bad Request` status code. The response **MUST** contain an [error object] that
identifies the `profile` query parameter as the `source` and has the following
URI as (one of) its `type`s:

```
https://jsonapi.org/errors/profile-not-supported
```

> Note: When a client lists a profile in the `Accept` header, it's asking the
> server to compute its response as normal, but then send the response document
> with some extra information, as described in the requested profile. By
> contrast, when a client lists a profile in the `profile` *query parameter*,
> it's asking the server to *process the incoming request* according to the
> rules of the profile. This can fundamentally change the meaning of the 
> server's response.

#### <a href="#profile-query-parameter-omitting" id="profile-query-parameter" class="headerlink"></a> Omitting the `profile` Query Parameter

Requiring the client to specify the `profile` query parameter would be 
cumbersome. Accordingly, JSON:API defines a way that server's may infer its 
value in many cases.

To do so, a server **MAY** define an internal mapping from query parameter names 
to profile URIs. The profile URI for a query parameter name in this mapping 
**MUST NOT** change over time.

> Note: the server may choose to map all query parameter names from the same 
> [family][query parameter family] to one profile URI. Or, it may choose to map
> only specific query parameter names. 

If a requested URL does not contain the `profile` query parameter and does 
contain one or more query parameters in the server's internal mapping, the 
server may act as though the request URL contained a `profile` query parameter 
whose value was the URI-encoded space-separated list of each unique profile URI 
found in the server's internal mapping for the query parameters in use on the 
request.

For example, the server might support a profile that defines a meaning for the
values of the `page[cursor]` query parameter. Then, it could define its internal 
param name to profile URI mapping like so:

```json
{ "page[cursor]": "https://example.com/pagination-profile" }
```

Accordingly, a request for:

```
https://example.com/?page[cursor]=xyz
```

would be interpreted by the server as:

```
https://example.com/?page[cursor]=xyz&profile=https://example.com/pagination-profile
```


### <a href="#profile-keywords" id="profile-keywords" class="headerlink"></a> Profile Keywords

A profile **SHOULD** explicitly declare "keywords" for any elements that it
introduces to the document structure. If a profile does not explicitly declare a
keyword for an element, then the name of the element itself (i.e., its key in
the document) is considered to be its keyword. All profile keywords **MUST** 
meet this specification's requirements for [member names].

In other words, if a profile introduces an object-valued document member, that 
member is an element, but any keys in it are not themselves elements. Likewise,
if the profile defines an array-valued element, the keys in nested objects
within that array are not elements.

The following example profile defines a single keyword, `version`:

```text
# Resource versioning profile

## Introduction

This page specifies a profile for the `application/vnd.api+json` media type,
as described in the [JSON:API specification](http://jsonapi.org/format/).

This profile ensures that every resource represented in a JSON:API document
includes a version.

## Document Structure

Every resource **MUST** include a `meta` object containing a `version` member.
The value of this member **MUST** be a string that represents a unique version
for that resource.

## Keywords

This profile defines the following keywords:

* `version`
```

This profile might be applied as follows:

```json
{
  "data": {
    "type": "contacts",
    "id": "345",
    "meta": {
      "version": "2018-04-14-879976658"
    },
    "attributes": {
      "name": "Ethan"
    }
  },
  "links": {
    "profile": ["http://example.com/profiles/resource-versioning"]
  }
}
```


### <a href="#profiles-processing" id="profiles-processing" class="headerlink"></a> Processing Profiled Documents/Requests

When a profile is applied to a request and/or document, the value used for each 
of the profile's document members or query parameters is said to be "a 
recognized value" if that value, including all parts of it, has a legal, defined
meaning *according to the latest revision of the profile that the application is 
aware of*.

> Note: The set of recognized values is also/more technically known as the 
> [defined text set](http://www.w3.org/2001/tag/doc/versioning-compatibility-strategies#terminology).

For example, the hypothetical [timestamps profile] specifies the `timestamps` 
element, and the meaning for two keys within it -- `created` and `updated`. 
Therefore, in the following use of the profile, the value for the timestamps 
element would be a recognized value: 

```json
{
  "type": "contacts",
  "id": "345",
  "meta": {
    "timestamps": { "created": "2018-08-29T18:38:17.567Z" }
  }
  //...
}
```

However, in the following case, the value for `timestamps` is *not* a recognized 
value because one of the keys in it, `createdUnixEpoch`, doesn't have a meaning
assigned to it in the timestamps profile:

```json
{
    "type": "contacts",
    "id": "345",
    "meta": {
      "timestamps": { 
        "createdUnixEpoch": 1535567910201, 
        "created": "2018-08-29T18:38:17.567Z" 
      }
    }
    //...
  }
```

Likewise, if a profile defines an element and enumerates `true` and `false`
as legal values with a specific meaning, then a string appearing as that 
element's value would be an unrecognized value.

> Note: unrecognized values are not necessarily invalid or erroneous values.
> For example, the timestamps profile might be revised later to actually define 
> a "createdUnixEpoch" key. This key would be unrecognized by all applications
> that existed at the time it was defined, but not by ones created/deployed later.

Each profile **MAY** define its own rules for how applications should proceed
when encountering unrecognized values.

If a profile does not define its own rules for handling unrecognized values, 
the following rule applies by default:

  1. If the value of a profile-defined query parameter is unrecognized, the 
     server **MUST** fail the request and respond with a `400 Bad Request` and 
     an [error object][error objects] indicating the problematic parameter.
     
  2. Otherwise, if the unrecognized value is a JSON object in the 
     request/response document, and the only thing that makes it unrecognized 
     is that it contains one or more keys that have no meaning assigned to them
     (in the latest revision of the profile that the application is aware of),
     then the application **MUST** simply ignore those unknown keys and 
     continue processing the profile.

  3. In all other cases, the application **MUST** assume that the profile has
     been applied erroneously and **MUST** totally ignore the profile (i.e.,
     process the request as if the profile were not there).

In the case of our example [timestamps profile], it does not define its own 
rules, so the above defaults would apply. 

Under the second of these default rules, the unrecognized value we saw 
above (with the `createdUnixEpoch` key) would be processed as though the 
`createdUnixEpoch` key simply weren't present, and the application would still 
be able to use the data in the `created` key. 

However, if the user instead provided the following value, the whole timestamps
profile would need to be ignored:

```json
{
  //...
  "timestamps": { 
    "updated": "Wed Aug 29 2018 15:00:05 GMT-0400", 
    "created": "2018-08-29T18:38:17.567Z" 
  }
}
```

Ignoring the profile in this case is required by the third default rule, 
because the value for the `updated` key is not recognized under the profile's
requirement that the `updated` key hold a string of the form produced by 
`JSON.stringify`.

### <a href="#profiles-authoring" id="profiles-authoring" class="headerlink"></a> Authoring Profiles

A profile **MAY** assign meaning to elements of the document structure whose use
is left up to each implementation, such as resource fields or members of `meta`
objects. A profile **MUST NOT** define/assign a meaning to document members 
in areas of the document reserved for future use by the JSON:API specification. 

For example, it would be illegal for a profile to define a new key in a 
document's [top-level][top level] object, or in a [links object][links], as 
JSON API implementations are not allowed to add custom keys in those areas.

Likewise, a profile **MAY** assign a meaning to query parameters or parameter 
values whose details are left up to each implementation, such as `filter` and 
all parameters that contain a non a-z character. However, profiles **MUST NOT** 
assign a meaning to query parameters that [are reserved](#query-parameters).

The meaning of an element or query parameter defined by a profile **MUST NOT** 
vary based on the presence or absence of other profiles.

The scope of a profile **MUST** be clearly delineated. The elements and query 
parameters specified by a profile, and their meanings, **MUST NOT** change over
time or else the profile **MUST** be considered a new profile with a new URI.

> Note: When a profile changes its URI, a huge amount of interoperability is lost.
> Users that reference the new URI will not have their messages understood by
> implementations still aware only of the old URI, and vice-versa. Accordingly,
> it's important to design your profile so that it can evolve without its URI
> needing to change. See ["Revising a Profile"](#profiles-updating) for details.

Finally, a profile **MUST NOT**:

1. assume that, if it is supported, then other specific profiles will be 
supported as well.

2. define fixed endpoints, HTTP headers, or header values.

3. alter the JSON structure of any concept defined in this specification, 
including to allow a superset of JSON structures.


> If you create your own profile, you are **strongly encouraged to [register](/extensions/#profile-creation) 
> it** with the JSON API [profile registry](/extensions/), so that others can
> find and reuse it.

#### <a href="#profiles-updating" id="profiles-updating" class="headerlink"></a> Revising a Profile

Profiles **MAY** be revised over time, e.g., to add new capabilities. However, 
any such changes **MUST** be [backwards and forwards compatible](http://www.w3.org/2001/tag/doc/versioning-compatibility-strategies#terminology) 
("compatible evolution"), in order to not break existing users of the profile.

For example, the hypothetical [timestamps profile] *could not* introduce a new,
required `deleted` member within the `timestamps` object, as that would be 
incompatible with existing deployments of the profile, which would not include 
this new member.

The timestamps profile also *could not* evolve to define a new element as a 
sibling of the `timestamps` key, as that would be incompatible with the rule 
that "The elements... specified by a profile... **MUST NOT** change over time."

> The practical issue with adding a sibling element is that another profile 
> in use on the document might already define a sibling element of the same 
> name.

However, the timestamps profile could evolve to allow other optional members, 
such as `deleted`, in the `timestamps` object. This is possible because the 
`timestamps` object is already a reserved element of the profile, and the profile
is subject to the default rule that new (previously unrecognized) keys will
simply be ignored by existing applications.

##### <a href="#profiles-design-for-evolution" id="profiles-design-for-evolution" class="headerlink"></a> Designing Profiles to Evolve Over Time

Fundamentally, for a profile to be able to change in a compatible way over time, 
it must define -- from the beginning -- a rule describing how an application 
that is only familiar with the original version of the profile should process 
documents/requests that use features from an updated version of the profile.

One major approach is to simply have applications ignore (at least some types of) 
unrecognized data. This allows the profile to define new, optional features; 
old applications will continue to work, but simply won't process/"see" these new 
capabilities.

This is essentially the strategy that JSON:API itself uses when it says that:

> Client and server implementations **MUST** ignore members not recognized by 
> this specification.

Other protocols use analogous strategies. E.g., in HTTP, unknown headers are 
simply ignored; they don't crash the processing of the request/response.

As a profile author, you may define your own rules for how applications should 
process uses of the profile that contain unrecognized data, or you may simply 
allow the default rules described in the ["Processing Profiled Documents/Requests"](#profiles-processing)
to take effect.

If you choose to use the default rules, you **SHOULD** reserve an object-valued 
element anywhere you expect to potentially add new features over time.

## <a href="#errors" id="errors" class="headerlink"></a> Errors

### <a href="#errors-processing" id="errors-processing" class="headerlink"></a> Processing Errors

A server **MAY** choose to stop processing as soon as a problem is encountered,
or it **MAY** continue processing and encounter multiple problems. For instance,
a server might process multiple attributes and then return multiple validation
problems in a single response.

When a server encounters multiple problems for a single request, the most
generally applicable HTTP error code **SHOULD** be used in the response. For
instance, `400 Bad Request` might be appropriate for multiple 4xx errors
or `500 Internal Server Error` might be appropriate for multiple 5xx errors.

### <a href="#error-objects" id="error-objects" class="headerlink"></a> Error Objects

Error objects provide additional information about problems encountered while
performing an operation. Error objects **MUST** be returned as an array
keyed by `errors` in the top level of a JSON:API document.

An error object **MAY** have the following members:

* `id`: a unique identifier for this particular occurrence of the problem.
* `links`: a [links object][links] containing the following members:
  * `about`: a [link][link] that leads to further details about this
    particular occurrence of the problem. When derefenced, this URI **SHOULD**
    return a human-readable description of the error.
  * `type`: an array of [links][link] that identify the type of error 
    that this particular error is an instance of. This URI **SHOULD** be 
    dereferencable to a human-readable explanation of the general error.
* `status`: the HTTP status code applicable to this problem, expressed as a
  string value.
* `code`: an application-specific error code, expressed as a string value.
* `title`: a short, human-readable summary of the problem that **SHOULD NOT**
  change from occurrence to occurrence of the problem, except for purposes of
  localization.
* `detail`: a human-readable explanation specific to this occurrence of the
  problem. Like `title`, this field's value can be localized.
* `source`: an object containing references to the source of the error,
  optionally including any of the following members:
  * `pointer`: a JSON Pointer [[RFC6901](https://tools.ietf.org/html/rfc6901)]
    to the value in the request document that caused the error [e.g. `"/data"`
    for a primary data object, or `"/data/attributes/title"` for a specific
    attribute]. This **MUST** point to a value in the request document that
    exists; if it doesn't, the client **SHOULD** simply ignore the pointer.
  * `parameter`: a string indicating which URI query parameter caused
    the error.
* `meta`: a [meta object][meta] containing non-standard meta-information about the
  error.

## <a href="#appendix" id="appendix" class="headerlink"></a> Appendix
### <a href="#appendix-query-details" id="appendix-query-details" class="headerlink"></a> Query Parameters Details
#### <a href="#appendix-query-details-parsing" id="appendix-query-details-parsing" class="headerlink"></a> Parsing/Serialization
A query parameter is a name–value pair extracted from, or serialized into, a 
URI's query string. 

To extract the query parameters from a URI, an implementation **MUST** run the 
URI's query string, excluding the leading question mark, through the 
[`application/x-www-form-urlencoded` parsing algorithm](https://url.spec.whatwg.org/#urlencoded-parsing),
with one exception: JSON:API allows the specification that defines a query 
parameter's usage to provide its own rules for parsing the parameter's value 
from the `value` bytes identified in steps 3.2 and and 3.3 of the `application/x-www-form-urlencoded` 
parsing algorithm. The resulting value might not be a string.

> Note: In general, the query string parsing built in to servers and browsers
> will match the process specified above, so most implementations do not need
> to worry about this.
> 
> The `application/x-www-form-urlencoded` format is referenced because it is
> the basis for the `a=b&c=d` style that almost all query strings use today. 
> 
> However, `application/x-www-form-urlencoded` parsing contains the bizarre 
> historical artifact that `+` characters must be treated as spaces, and it 
> requires that all values be percent-decoded during parsing, which makes it
> impossible to use [RFC 3986 delimiter characters](https://tools.ietf.org/html/rfc3986#section-2.2)
> as delimiters. These issues motivate the exception that JSON:API defines above.

Similarly, to serialize a query parameter into a URI, an implementation **MUST**
use the [the `application/x-www-form-urlencoded` serializer](https://url.spec.whatwg.org/#concept-urlencoded-serializer),
with the corresponding exception that a parameter's value — but not its name —
may be serialized differently than that algorithm requires, provided the 
serialization does not interfere with the ability to parse back the resulting URI.

#### <a href="#appendix-query-details-square-brackets" id="appendix-query-details-square-brackets" class="headerlink"></a> Square Brackets in Parameter Names
With [query parameter families][query parameter family], JSON:API allows for 
query parameters whose names contain square brackets (i.e., U+005B "[" and 
U+005D "]").

According to the query parameter serialization rules above, a compliant 
implementation will percent-encode these square brackets. However, some URI 
producers — namely browsers — do not always encode them. Servers **SHOULD** 
accept requests in which these square brackets are left unencoded in a query 
parameter's name. If a server does accept these requests, it **MUST** treat the 
request as equivalent to one in which the square brackets were percent-encoded.

[top level]: #document-top-level
[resource objects]: #document-resource-objects
[attributes]: #document-resource-object-attributes
[relationships]: #document-resource-object-relationships
[fields]: #document-resource-object-fields
[related resource link]: #document-resource-object-related-resource-links
[resource linkage]: #document-resource-object-linkage
[resource links]: #document-resource-object-links
[resource identifier object]: #document-resource-identifier-objects
[compound document]: #document-compound-documents
[meta]: #document-meta
[links]: #document-links
[link]: #document-links-link
[link object]: #document-links-link-object
[profiles]: #profiles
[timestamps profile]: #profiles-timestamp-profile
[profile keywords]: #profile-keywords
[error details]: #errors
[error object]: #error-objects
[error objects]: #errror-objects
[member names]: #document-member-names
[pagination]: #fetching-pagination
[query parameter family]: #query-parameters-families
