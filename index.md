---
layout: page
title: "A specification for building APIs in JSON"
show_masthead: true
---

If you've ever argued with your team about the way your JSON responses
should be formatted, JSON:API can be your anti-[bikeshedding](http://bikeshed.org) tool.

By following shared conventions, you can increase productivity,
take advantage of generalized tooling, and focus on what
matters: your application.

Clients built around JSON:API are able to take
advantage of its features around efficiently caching responses,
sometimes eliminating network requests entirely.

Here's an example response from a blog that implements JSON:API:

```json
{
  "links": {
    "self": "http://example.com/articles",
    "next": "http://example.com/articles?page[offset]=2",
    "last": "http://example.com/articles?page[offset]=10"
  },
  "data": [{
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON:API paints my bikeshed!"
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
    },
    "links": {
      "self": "http://example.com/articles/1"
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

The response above contains the first in a collection of "articles", as well as
links to subsequent members in that collection. It also contains resources
linked to the article, including its author and comments. Last but not least,
links are provided that can be used to fetch or update any of these
resources.

JSON:API covers creating and updating resources as well, not just responses.

## <a href="#mime-types" id="mime-types" class="headerlink"></a> MIME Types

JSON:API has been properly registered with the IANA. Its media
type designation is [`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json).

## <a href="#format-documentation" id="format-documentation" class="headerlink"></a> Format documentation

To get started with JSON:API, check out [documentation for the base
specification](/format).

## <a href="#extensions" id="extensions" class="headerlink"></a> Extensions

The JSON:API community has created a collection of extensions that APIs can use
to provide clients with information or functionality beyond that described in the 
base JSON:API specification. These extensions are called profiles.

You can [browse existing profiles](/extensions/#existing-profiles) or
[create a new one](/extensions/#profile-creation).

## <a href="#update-history" id="update-history" class="headerlink"></a> Update history

- 2020-10-01: 1.1 Release candidate 3 released.
  - Refined links objects. The link object `params` member was removed to
    better align with other JSON link serializations. The `anchor` target
    attribute was also removed. It may be restored in a future minor release.
- 2020-08-20: 1.1 Release candidate 2 released. 
  - [Extensions](https://jsonapi.org/format/1.1/#extensions) were added and the
    scope of [profiles](https://jsonapi.org/format/1.1/#profiles) were reduced
    since their introduction in RC1.
  - [Links](https://github.com/json-api/json-api/pull/1348) can be represented
    as [RFC 8288](https://tools.ietf.org/html/rfc8288)-style web links.
  - A new [`describedby`](https://github.com/json-api/json-api/pull/1447) [links member](https://jsonapi.org/format/1.1/#document-top-level)
    was added so that implementors can incorporate description documents (e.g.
    [OpenAPI](https://www.openapis.org/) or [JSON Schema](https://json-schema.org/specification.html))
    directly into their APIs.
  - [Local IDs](https://jsonapi.org/format/1.1/#document-resource-object-identification)
    were [introduced](https://github.com/json-api/json-api/pull/1244) so that a
    client can create a relationship to a resource yet-to-be created by the
    same request.
- 2018-12-01: 1.1 Release candidate 1 released.
  - New features include: [profiles](https://jsonapi.org/format/1.1/#profiles), ["@-Members"](https://jsonapi.org/format/1.1/#document-member-names-at-members), and [error object `type` links](https://jsonapi.org/format/1.1/#error-objects). 
  - There are editorial clarifications around: [query parameters](https://jsonapi.org/format/1.1/#query-parameters) (their parsing/serialization, and reserved parameter names), the appropriate status code for [specific](https://github.com/json-api/json-api/pull/1036) [responses](https://github.com/json-api/json-api/pull/1029), and the [presence of the `included` key](https://github.com/json-api/json-api/pull/1236) even when its value is an empty array.
  - JSON:API switched to [recommending camelCased names](https://jsonapi.org/recommendations/#naming).
- 2015-05-29: 1.0 final released.
- 2015-05-21: 1.0 Release candidate 4 released.
- 2015-03-16: 1.0 Release candidate 3 released.
- 2015-02-18: 1.0 Release candidate 2 released.
- 2014-07-05: 1.0 Release candidate 1 released.
- 2013-07-21: Media type registration completed with the IANA.
- 2013-05-03: Initial release of the draft.

You can subscribe to an RSS feed of individual changes [here](https://github.com/json-api/json-api/commits.atom).
