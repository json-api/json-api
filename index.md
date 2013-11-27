---
layout: page
title: JSON API
---

## Description

"JSON API" is a standard for building APIs in JSON. If you've
ever argued with your team about the way your JSON responses
should be formatted, JSON API is your anti-bikeshedding weapon.

Furthermore, clients built around JSON API are able to take
advantage of its features around efficently caching responses,
sometimes eliminating network requests entirely.

By following shared conventions, you can increase productivity,
take advantage of generalized tooling, and focus on what
matters: your application.

{% include status.md %}

Here's what JSON API (in the ID style) looks like:

```javascript
{
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

and in the URL style:

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "http://example.com/people/1",
      "comments": "http://example.com/comments/5,12,17,20"
    }
  }]
}
```

JSON API covers creating and updating resources as well, not just responses.

## MIME Types

JSON API has been properly registered with the IANA. Its media
type designation is [`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json).

## Format documentation

To get started with JSON API, check out our documentation. There
are two styles:

* [The ID Style](/format#id-based-json-api)
* [The URL Style](/format#url-based-json-api)

The ID style is easier to get started with, and probably looks
very close to your already-existing API.

After you're more comfortable with the format, you may decide
to upgrade to the URL style. It offers extra flexibility, but
requires more intelligent client code.

We expect most users of JSON API will transition from their
totally custom API to one based on the ID style, and then later
to the URL style. This is of course not required, but if you're
not sure, it's the easiest way to get started.

## Update history

- 2013-05-03: Initial release of the draft.
- 2013-07-22: Media type registration completed with the IANA.

You can subscribe to an RSS feed of individual changes [here](https://github.com/json-api/json-api/commits.atom).
