---
layout: page
title: Frequently Asked Questions
---

### Why is JSON API not versioned? <a href="#why-is-json-api-not-versioned" id="why-is-json-api-not-versioned" class="headerlink"></a>

Once JSON API is stable, it will always be backwards compatible using a _never
remove, only add_ strategy.
[#46](https://github.com/json-api/json-api/issues/46)

### Why not use the HAL specification? <a href="#why-not-use-the-hal-specification" id="why-not-use-the-hal-specification" class="headerlink"></a>

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

### How to discover resource possible actions? <a href="#how-to-discover-resource-possible-actions" id="how-to-discover-resource-possible-actions" class="headerlink"></a>

You should use the OPTIONS HTTP method to discover what can be done with a
particular resource. The semantics of the methods returned by OPTIONS is defined
by the JSON API standard.

For instance, if `"GET,POST"` is the response to an OPTIONS request to an URL,
then you can get information about the resource and also create new resources.

If you want to know what you can do with a specific resource attribute then
you will have to use an application level profile to define the attribute meaning
and capabilities and use the errors response to let users know. This error feature
is still pending to be included in the standard since is still in
[discussion](https://github.com/json-api/json-api/issues/7).

### Is there a JSON Schema describing JSON API? <a href="#is-there-a-json-schema-describing-json-api" id="is-there-a-json-schema-describing-json-api" class="headerlink"></a>

Yes, you can find the JSON Schema definition at
[http://jsonapi.org/schema](http://jsonapi.org/schema). Please note that this
schema is not a perfect document. Just because a JSON document may validate
against this schema, that does not necessarily mean it is a valid JSON API
document. The schema is provided for a base level sanity check.

You can find more information about the JSON Schema format at
[http://json-schema.org](http://json-schema.org).

### Why are resource collections returned as arrays instead of sets keyed by ID?

A JSON array is naturally ordered while sets require metadata to specify order
among members. Therefore, arrays allow for more natural sorting by default or
specified criteria.

In addition, JSON API allows read-only resources to be returned without IDs,
which would of course be incompatible with a set keyed by IDs.

### Why are related resources nested in a `linked` object in a compound document?

Primary resources should be isolated because their order and number is often
significant. It's necessary to separate primary and related resources by more
than type because it's possible that a primary resource may have related
resources of the same type (e.g. the "parents" of a "person"). Nesting related
resources in `linked` prevents this possible conflict.

### Since HTTP resources are already identified by URIs, why are `ID` and `type` required attributes? <a href="#resources-ids" id="resources-ids" class="headerlink"></a>

*Resource* is a core abstraction in both JSON API and HTTP [[RFC
7231](https://tools.ietf.org/html/rfc7231)]. The concepts are not equivalent,
however, and each specification has its own definition for the term.

In HTTP, a resource is simply the service available at an HTTP endpoint. In order
to interact with it, *representations* are needed. JSON API provides structure
for those representations.

An HTTP resource can be thought of as an interface (or a mapping) to a set of
underlying JSON API resources. An HTTP request always targets a single HTTP
resource but may affect any number of JSON API resources either in full or
partially.

Importantly, the same JSON API resource may be exposed via several different HTTP
resources (URIs). An application is free to implement one-to-one correspondence
between JSON API resources and HTTP resources by always using unique canonical
URIs. But this is not required, and therefore an ID scheme is necessary.

While JSON API resources often represent persistent objects that have a
meaningful ID, this need not be the case. For example, a server might provide an
authentication service (an HTTP resource) that returns instances of
authentication events (JSON API resources) that do not need an ID. In such a
situation, it is suggested that a UUID be generated for each resource object
originating at the server.
