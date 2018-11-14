---
layout: page
title: Frequently Asked Questions
show_sidebar: true
---

## <a href="#what-is-the-meaning-of-json-apis-version" id="what-is-the-meaning-of-json-apis-version" class="headerlink"></a> What is the meaning of JSON:API's version?

Now that JSON:API has reached a stable version 1.0, it will always be
backwards compatible using a _never remove, only add_ strategy.

A version is maintained in order to:

* allow tracking of additive changes to the specification.
* know what features a particular implementation *may potentially* support.

## <a href="#why-not-use-the-hal-specification" id="why-not-use-the-hal-specification" class="headerlink"></a> Why not use the HAL specification?

There are several reasons:

* HAL embeds child documents recursively, while JSON:API flattens the entire
graph of objects at the top level. This means that if the same "people" are
referenced from different kinds of objects (say, the author of both posts and
comments), this format ensures that there is only a single representation of
each person document in the payload.
* Similarly, JSON:API uses IDs for linkage, which makes it possible to cache
documents from compound responses and then limit subsequent requests to only
the documents that aren't already present locally. If you're lucky, this can
even completely eliminate HTTP requests.
* HAL is a serialization format, but says nothing about how to update
documents. JSON:API thinks through how to update existing records (leaning on
PATCH and JSON Patch), and how those updates interact with compound documents
returned from GET requests. It also describes how to create and delete
documents, and what 200 and 204 responses from those updates mean.

In short, JSON:API is an attempt to formalize similar ad hoc client-server
interfaces that use JSON as an interchange format. It is specifically focused
around using those APIs with a smart client that knows how to cache documents it
has already seen and avoid asking for them again.

It is extracted from a real-world library already used by a number of projects,
which has informed both the request/response aspects (absent from HAL) and the
interchange format itself.

## <a href="#how-to-discover-resource-possible-actions" id="how-to-discover-resource-possible-actions" class="headerlink"></a> How can I discover a resource's supported actions?

Whenever a client requests a URI, the server can include an [`Allow` header](https://tools.ietf.org/html/rfc7231#section-7.4.1)
in its response to indicate the methods the requested resource supports. Servers
wishing to support method discovery should include this header. The client can
then send a [`HEAD`](https://tools.ietf.org/html/rfc7231#section-4.3.2) request
(or any other type of request) to the URI in order to discover its supported methods.

For instance, a client might request `HEAD /articles`, and the response could
contain the header `Allow: GET,POST`, indicating that the client can GET the
collection and also POST to it to create new resources.

JSON:API is still working on a way to for resources to advertise and detail
non-standard actions they support. Feel free to
[join that discussion](https://github.com/json-api/json-api/issues/745)!

## <a href="#wheres-put" id="wheres-put" class="headerlink"></a> Where's PUT?

Using PUT to partially update a resource (i.e. to change only some of its state)
is not allowed by the
[HTTP specification](https://tools.ietf.org/html/rfc7231#section-4.3.4).
Instead, PUT is supposed to completely replace the state of a resource:

> “The PUT method requests that the state of the target resource be **created
  or replaced** with the state…in the request message payload. A successful PUT
  of a given representation would suggest that a subsequent GET on that same
  target resource will result in an equivalent representation being sent…”

The correct method for partial updates, therefore, is [PATCH](http://tools.ietf.org/html/rfc5789),
which is what JSON:API uses. And because PATCH can also be used compliantly for
full resource replacement, JSON:API hasn't needed to define any behavior for
PUT so far. However, it may define PUT semantics in the future.

In the past, many APIs used PUT for partial updates because PATCH wasn’t yet
well-supported. However, almost all clients now support PATCH, and those that
don’t can be easily [worked around](/recommendations/#patchless-clients).

## <a href="#is-there-a-json-schema-describing-json-api" id="is-there-a-json-schema-describing-json-api" class="headerlink"></a> Is there a JSON Schema describing JSON:API?

Yes, you can find the JSON Schema definition at
[http://jsonapi.org/schema](http://jsonapi.org/schema). This schema is as
restrictive as possible, but has flexibility to be extended within your
documentation. Validation will not yield false negatives, but could yield false
positives for the sake of flexibility.

You can find more information about the JSON Schema format at
[http://json-schema.org](http://json-schema.org).

## <a href="#resource-collections-returned-as-arrays" id="resource-collections-returned-as-arrays" class="headerlink"></a> Why are resource collections returned as arrays instead of sets keyed by ID?

A JSON array is naturally ordered while sets require metadata to specify order
among members. Therefore, arrays allow for more natural sorting by default or
specified criteria.

## <a href="#why-related-resources-included-compound-document" id="why-related-resources-included-compound-document" class="headerlink"></a> Why are related resources nested in an `included` object in a compound document?

Primary resources should be isolated because their order and number is often
significant. It's necessary to separate primary and related resources by more
than type because it's possible that a primary resource may have related
resources of the same type (e.g. the "parents" of a "person"). Nesting related
resources in `included` prevents this possible conflict.

## <a href="#position-uri-structure-custom-endpoints" id="position-uri-structure-custom-endpoints" class="headerlink"></a> Does JSON:API take any position on URI structure, on rules for custom endpoints, which do not fit the paradigm of GET/POST/PATCH/DELETE on the resource URI, etc.?

JSON:API has no requirements about URI structure, implementations are free to use whatever form they wish.
