---
layout: page
title: "A standard for building APIs in JSON."
show_masthead: true
---

If you've ever argued with your team about the way your JSON responses
should be formatted, JSON API is your anti-bikeshedding weapon.

By following shared conventions, you can increase productivity,
take advantage of generalized tooling, and focus on what
matters: your application.

Clients built around JSON API are able to take
advantage of its features around efficiently caching responses,
sometimes eliminating network requests entirely.

Here's an example response from JSON API:

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
      "comments": [ "5", "12", "17", "20" ]
    }
  }]
}
```

The top-level `"links"` section is optional, and without it the response
probably looks very close to a response from your already-existing API.

JSON API covers creating and updating resources as well, not just responses.

{% include status.md %}

## MIME Types <a href="#mime-types" id="mime-types" class="headerlink"></a>

JSON API has been properly registered with the IANA. Its media
type designation is [`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json).

## Format documentation <a href="#format-documentation" id="format-documentation" class="headerlink"></a>

To get started with JSON API, check out our [documentation](/format)

## Update history <a href="#update-history" id="update-history" class="headerlink"></a>

- 2013-05-03: Initial release of the draft.
- 2013-07-22: Media type registration completed with the IANA.

You can subscribe to an RSS feed of individual changes [here](https://github.com/json-api/json-api/commits.atom).
