---
layout: page
title: Extensions
---

JSON API can be extended in several ways:

* The `ext` media type parameter can be used to declare and request support for
  extensions, [as discussed in the base specification](/format#extending).
  Official and custom extensions to the specification are discussed below.

* Meta information can be included in several places in a document,
  [as discussed in the base specification](/format/#document-structure-meta).

* A profile can be specified in the top-level `meta` object, as discussed below.

## Official Extensions <a href="#official-extensions" id="official-extensions" class="headerlink"></a>

JSON API currently supports the following official extensions:

* [`bulk`](/extensions/bulk/) - provides support for performing multiple
  operations in a request, including adding and removing multiple resources.

* [`patch`](/extensions/patch/) - provides support for modification of resources
  with the HTTP PATCH method [[RFC5789](http://tools.ietf.org/html/rfc5789)]
  and the JSON Patch format [[RFC6902](http://tools.ietf.org/html/rfc6902)].

## Custom Extensions <a href="#custom-extensions" id="custom-extensions" class="headerlink"></a>

The JSON API media type can be extended for your organization by writing your
own custom extension. This extension should also be specified using the `ext`
media type parameter.

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

```text
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
