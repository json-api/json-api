---
layout: page
title: "A specification for building APIs in JSON"
show_masthead: true
---

If you've ever argued with your team about the way your JSON responses
should be formatted, JSON:API can help you stop the
[bikeshedding](http://bikeshed.org) and focus on what matters:
**your application**.

By following shared conventions, you can increase productivity, take advantage
of generalized tooling and best practices. Clients built around JSON:API are
able to take advantage of its features around efficiently caching responses,
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
    "revision": "1234567890",
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
    "revision": "9999999999",
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
    "revision": "5555555555",
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
    "revision": "1212121212",
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

## <a href="#milestones" id="milestones" class="headerlink"></a> Milestones

Major milestones for this specification include:

- 2022-09-30: 1.1 final released.
- 2015-05-29: 1.0 final released.
- 2013-07-21: Media type registration completed with the IANA.
- 2013-05-03: Initial release of the draft.

A more thorough history is available [here](/about/#update-history).

You can subscribe to an RSS feed of individual changes [here](https://github.com/json-api/json-api/commits.atom).
