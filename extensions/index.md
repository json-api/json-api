---
layout: page
title: Extending
---

{% include status.md %}

## Extending <a href="#extending" id="extending" class="headerlink"></a>

If you would like to extend JSON API, you may do so with the profile link
relation, defined in [RFC 6906](http://tools.ietf.org/html/rfc6906). See also
[this blog post by Mark
Nottingham](http://www.mnot.net/blog/2012/04/17/profiles).

The `meta` key is where this profile link SHOULD go.

Note that according to the RFC, profiles are

```
defined not to alter the semantics of the resource representation itself, but
to allow clients to learn about additional semantics (constraints, conventions,
extensions) that are associated with the resource representation, in addition
to those defined by the media type and possibly other mechanisms.
```

## Examples <a href="#examples" id="examples" class="headerlink"></a>

For example, let's say that you want your API to support a different pagination
scheme, such as one based on cursors. You would make some sort of profile page
on your site, such as `http://api.example.com/profile`, and then include it
in the `meta` key of your responses:

```text
GET http://api.example.com/

{
  "meta": {
    "profile": "http://api.example.com/profile"
  },

  "posts": [{
    // an individual post document
  }]
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

The Example.com API uses cursor-based pagination. Here's how it works: in the
`meta` section of responses, it will return a `cursors` relation, with
`after`, `before`, and `limit` relations that describe the cursors. You can use
these with the URI template given in the `href` relation to generate the URIs
you need to paginate.

"meta": {
  "cursors": {
    "after": "abcd1234",
    "before": "wxyz0987",
    "limit": 25,
    "href": "https://api.example.com/whatever{?after,before,limit}"
  }
}
```
