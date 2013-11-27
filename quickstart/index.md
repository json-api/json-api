---
layout: page
title: "JSON API: Quickstart"
---

{% include status.md %}

## JSON API Quickstart

Welcome to the JSON API Quickstart! Following this document should give you an
idea of what JSON API is like. For the full format documentation, please see
[the format page](/format/).

### An initial API

For the purposes of this guide, we'll take an example API and convert it to
JSON API format. This API will expose a blog, with posts, authors, and
comments. For now, we'll only cover posts. Future work on this guide will cover
the associations.

There is also a live example of the API running
[here](http://json-api-demo.herokuapp.com).

As an example, here is what would happen if you were to request a list of all
posts:

```javascript
[
  {
    "id": 1,
    "title": "Rails is Omakase",
    "body": "There are a lot of...",
    "created_at": "2013-11-27T20:32:41.574Z",
    "updated_at": "2013-11-27T20:32:41.574Z"
  }
]
```

Pretty simple, right? This is what you're probably used to seeing when you
fetch data from a random API. And there's a lot that's good about this: it's
simple, there's not a lot there, it's pretty straightforward. But here's the
problem: when everyone creates their own formats for an API, we have to
re-build software to deal with it, every time. And while for this simple
example, everything seems straightforward, what happens when you need extra
features?  Everyone implements them differently. JSON API provides a standard
way that works across different APIs.

### Adding JSON API support

The first thing we need to do to turn this into a valid JSON API response is
to namespace our data, like this:

```javascript
{
  "posts": [{
    "id": 1,
    "title": "Rails is Omakase",
    "body": "There are a lot of...",
    "created_at": "2013-11-27T20:32:41.574Z",
    "updated_at": "2013-11-27T20:32:41.574Z"
  }]
}
```

This allows us to have multiple kinds of objects in one response. Imagine when
we add authors, as well as psots: you'll need a way to separate the two.

Secondly, we're already using `id` as the name for our unique identifier:
that's good, it's what JSON API already uses. There are three special names
that are reserved by the specification: `id`, `href`, and `links`. Any other
names are used for your own application data.

The second thing we need to do is change our MIME type: instead of serving this
response as `application/json`, it should be served as
`application/vnd.api+json`. This allows clients to use the `Content-Type` header
to specifically request JSON API responses, and allows people to find the
documentation about the API type.

You'll have to check your framework or library's documentation to figure out
how to accomplish this. For example,
[here](http://guides.rubyonrails.org/layouts_and_rendering.html#the-content-type-option)
is the documentation for doing this with Ruby on Rails.

For this simple case, that's all we need to do!

### Moving to the URL style
