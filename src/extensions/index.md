---
layout: page
title: Extensions
show_sidebar: true
---

## Status

**Extensions are an experimental feature** and should be considered a work
in progress. There is no official support for extensions in the base JSON
API specification.

## Extending JSON API <a href="#extending-json-api" id="extending-json-api" class="headerlink"></a>

JSON API can be extended in several ways:

* [Official](#official-extensions) and [custom](#custom-extensions) extensions
  are in development. The `supported-ext` and `ext` media type parameters can
  be used to [negotiate support for extensions](#extension-negotiation).

* Meta information can be included in several places in a document,
  [as discussed in the base specification](/format/#document-structure-meta).

* A profile can be specified in the top-level `"meta"` object, as discussed
  below.

## Extension Negotiation <a href="#extension-negotiation" id="extension-negotiation" class="headerlink"></a>

The JSON API specification **MAY** be extended to support additional
capabilities.

An extension **MAY** make changes to and deviate from the requirements of the
base specification apart from this section, which remains binding.

Servers that support one or more extensions to JSON API **MUST** return
those extensions in every response in the `supported-ext` media type
parameter of the `Content-Type` header. The value of the `supported-ext`
parameter **MUST** be a comma-separated (U+002C COMMA, ",") list of
extension names.

For example: a response that includes the header `Content-Type:
application/vnd.api+json; supported-ext="bulk,jsonpatch"` indicates that the
server supports both the "bulk" and "jsonpatch" extensions.

If an extension is used to form a particular request or response document,
then it **MUST** be specified by including its name in the `ext` media type
parameter with the `Content-Type` header. The value of the `ext` media type
parameter **MUST** be formatted as a comma-separated (U+002C COMMA, ",")
list of extension names and **MUST** be limited to a subset of the
extensions supported by the server, which are listed in `supported-ext`
of every response.

For example: a response that includes the header `Content-Type:
application/vnd.api+json; ext="ext1,ext2"; supported-ext="ext1,ext2,ext3"`
indicates that the response document is formatted according to the
extensions "ext1" and "ext2". Another example: a request that includes
the header `Content-Type: application/vnd.api+json; ext="ext1,ext2"`
indicates that the request document is formatted according to the
extensions "ext1" and "ext2".

Clients **MAY** request a particular media type extension by including its
name in the `ext` media type parameter with the `Accept` header. Servers
that do not support a requested extension or combination of extensions
**MUST** return a `406 Not Acceptable` status code.

If the media type in the `Accept` header is supported by a server but the
media type in the `Content-Type` header is unsupported, the server
**MUST** return a `415 Unsupported Media Type` status code.

Servers **MUST NOT** provide extended functionality that is incompatible
with the base specification to clients that do not request the extension in
the `ext` parameter of the `Content-Type` or the `Accept` header.

> Note: Since extensions can contradict one another or have interactions
that can be resolved in many equally plausible ways, it is the
responsibility of the server to decide which extensions are compatible, and
it is the responsibility of the designer of each implementation of this
specification to describe extension interoperability rules which are
applicable to that implementation.

When the value of the `ext` or `supported-ext` media type parameter contains
more than one extension name, the value **MUST** be surrounded with quotation
marks (U+0022 QUOTATION MARK, """), in accordance with the HTTP specification.

## Official Extensions <a href="#official-extensions" id="official-extensions" class="headerlink"></a>

JSON API currently supports the following official extensions:

* [Bulk extension](/extensions/bulk/) - provides support for performing multiple
  operations in a request, including adding and removing multiple resources.
  The Bulk extension is referenced with the extension name `bulk`.

* [JSON Patch extension](/extensions/jsonpatch/) - provides support for
  modification of resources with the HTTP PATCH method
  [[RFC5789](http://tools.ietf.org/html/rfc5789)] and the JSON Patch format
  [[RFC6902](http://tools.ietf.org/html/rfc6902)]. The JSON Patch extension is
  referenced with the extension name `jsonpatch`.

## Custom Extensions <a href="#custom-extensions" id="custom-extensions" class="headerlink"></a>

The JSON API media type can be extended for your organization by writing your
own custom extension. This extension should also be specified using the `ext`
and `supported-ext` media type parameters.

It is strongly recommended that custom extensions be prefixed with a unique
identifier for your organization to avoid namespace collision. For example,
`my-org/embedded-resources`.

## Profiles <a href="#profiles" id="profiles" class="headerlink"></a>

JSON API can be extended with the profile link relation, defined in [RFC
6906](http://tools.ietf.org/html/rfc6906). See also [this blog post by Mark
Nottingham](http://www.mnot.net/blog/2012/04/17/profiles).

According to the RFC, profiles are:

```text
defined not to alter the semantics of the resource representation itself, but
to allow clients to learn about additional semantics (constraints, conventions,
extensions) that are associated with the resource representation, in addition
to those defined by the media type and possibly other mechanisms.
```

A profile link **SHOULD** be specified in the top-level `meta` object, keyed
by `profile`.

For example, let's say that you want your API to support a offset / limit
based pagination scheme that you'd like to describe to your users. You would
make some sort of profile page on your site, such as
`http://api.example.com/profile`, and then include it in the `meta` key of
your responses:

```text
GET http://api.example.com/posts

{
  "meta": {
    "profile": "http://api.example.com/profile",
    "page": {
      "offset": 1,
      "limit": 10,
      "total": 35
    }
  },
  "links": {
    "self": "http://api.example.com/posts",
    "next": "http://api.example.com/posts?page[offset]=11",
    "last": "http://api.example.com/posts?page[offset]=31"
  },
  "data": [
    // First 10 posts
  ]
}
```

That document will de-reference to explain your link relations:

```http
GET http://api.example.com/profile HTTP/1.1
```

```text
HTTP/1.1 200 OK
Content-Type: text/plain

The Example.com API Profile
===========================

The Example.com API uses simple offset and limit-based pagination. Paginated
resources will include the standard JSON API `next`, `prev`, `first`, and
`last` pagination links in the top-level `links` object when they are not
`null`.

In addition, a `page` member will be added to the top-level `meta` object
that includes the following members: `offset`, `limit`, and `total`. The
`total` member represents the total count of resources in the paginated
collection. You can use the `offset` and `limit` members to construct your
own custom pagination links with the query parameters `page[offset]` and
`page[limit]`.
```
