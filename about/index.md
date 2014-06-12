---
layout: page
title: About
---

## Channels <a href="#channels" id="channels" class="headerlink"></a>

JSON API is:

  * [@jsonapi](http://twitter.com/jsonapi) on
[Twitter](http://twitter.com)
  * _#jsonapi_ channel on [Freenode IRC](http://freenode.net)
  * [jsonapi Google group](https://groups.google.com/forum/?fromgroups#!forum/jsonapi)

## Editors <a href="#editors" id="editors" class="headerlink"></a>

There are two primary editors of this specification:

- [Steve Klabnik](http://twitter.com/steveklabnik)
- [Yehuda Katz](http://twitter.com/wycats)

> Perhaps most significant to the Web, however, is that the separation [between
> clients and servers] allows the components to evolve independently, thus
> supporting the Internet-scale requirement of multiple organizational domains.
>
> - Roy Fielding, "Architectural Styles and the Design of Network-based
> Software Architectures", Chapter 5.

Steve primarily represents the server side, Yehuda the client side. Both of us
care about both, but we want to make sure to have a champion on either side.

## History <a href="#history" id="history" class="headerlink"></a>

JSON API is extracted from the JSON transport implicitly defined by
[Ember](http://emberjs.com/) Data's REST adapter.

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

The goals of the media type are to balance:

* A generic media type that can work across a broad set of use cases,
  including the generally used relationship types
* Similarity to existing server-side framework practices (and human
  readability for debugging)
* Ease of implementation on the server side
* Ease of implementation on the client side

This media type is still a work in progress, and we are extremely open to
feedback and proposals for improvement. That said, implementation work
has already begun, and we value good working systems over perfect
vaporware.
