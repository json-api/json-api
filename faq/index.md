---
layout: page
title: "JSON API: Frequently Asked Questions"
---

### Why is JSON API not versioned?

Once JSON API is stable, it will always be backwards compatible using a _never
remove, only add_ strategy.
[#46](https://github.com/json-api/json-api/issues/46)

### Why not use the HAL specification?

There are several reasons:

* HAL embeds child documents recursively, while JSON API flattens the entire
graph of objects at the top level. This means that if the same "people" are
referenced from different kinds of objects (say, the author of both posts and
comments), this format ensures that there is only a single representation of
each person document in the payload.
* Similarly, JSON API uses IDs for linkage, which makes it possible to cache
documents from compound responses and then limit subsequent requests to only
the documents that aren't already present locally. If you're lucky, this can
even completely eliminate HTTP requests.
* HAL is a serialization format, but says nothing about how to update
documents. JSON API thinks through how to update existing records (leaning on
PATCH and JSON Patch), and how those updates interact with compound documents
returned from GET requests. It also describes how to create and delete
documents, and what 200 and 204 responses from those updates mean.

In short, JSON API is an attempt to formalize similar ad hoc client-server
interfaces that use JSON as an interchange format. It is specifically focused
around using those APIs with a smart client that knows how to cache documents it
has already seen and avoid asking for them again.

It is extracted from a real-world library already used by a number of projects,
which has informed both the request/response aspects (absent from HAL) and the
interchange format itself.

### How to discover resource possible actions?

You should use the OPTIONS HTTP method to discover what can be done with a
particular resource. The semantics of the methods returned by OPTIONS is defined
by the JSON API standard.

For instance, if `"GET,POST"` is the response to an OPTIONS request to an URL,
then you can get information about the resource and also create new resources.

If you want to know what you can do with a specific resource attribute then
you will have to use an application level profile to define the attribute meaning
and capabilities and use the errors response to let users know. This feature is
still pending to be included in the standard since is still in discussion.