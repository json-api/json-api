---
title: "JSON API: History"
---

# JSON API: History

See also 

- [Reading](/)
- [Writing](/write)
- [Extending](/extending)

## NOTE

_This document is a work in progress, and will likely change over the
next month as implementation work progresses. It is currently missing
some details about the `meta` attribute and could be more precise about
details of working with relationships._

_Please feel free to help flesh it out or if you try to write an
implementation, tell us where things were ambiguous._

_You can do so by filing an Issue against [our GitHub
repository.](https://github.com/json-api/json-api/issues)_

## History

JSON API is extracted from the JSON transport implicitly defined by
Ember Data's REST adapter.

In general, Ember Data's goal is to eliminate the need for ad-hoc code
per application to communicate with servers that communicate in a
well-defined way.

Some servers, like Firebase, Parse and CouchDB already define strict
communication protocols for clients, and were good fits for Ember Data.
In contrast, servers written in Rails, Node, and Django tend to be
written in a "REST-style" but lack the precision necessary for drop-in
client code.

The REST Adapter in Ember Data implicitly defined a protocol that
custom servers could implement to get a drop-in client for all of their
resources. [ActiveModel::Serializers][1] is a proof-of-concept library
for Rails that implemented the serialization format expected by Ember
Data.

[1]: https://github.com/rails-api/active_model_serializers

Record creation, update, and deletion was defined implicitly by the
Ember Data library and was close to conventions already in wide use by
Rails, Django and Node developers.

The goals of the protocols defined by the Ember Data REST Adapter and
JSON API are to balance:

* A generic protocol that can work across a broad set of use cases,
  including the generally used relationship types
* Similarity to existing server-side framework practices (and human
  readability for debugging)
* Ease of implementation on the server side 
* Ease of implementation on the client side

This protocol is still a work in progress, and we are extremely open to
feedback and proposals for improvement. That said, implementation work
has already begun, and we value good working systems over perfect
vaporware.

