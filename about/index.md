---
layout: page
title: About
---

## <a href="#channels" id="channels" class="headerlink"></a> Channels

JSON:API is:

  * [@jsonapi](http://twitter.com/jsonapi) on
[Twitter](http://twitter.com)
  * _#jsonapi_ channel on [Freenode IRC](http://freenode.net)
  * [jsonapi discussion forum](http://discuss.jsonapi.org)

## <a href="#editors" id="editors" class="headerlink"></a> Editors

There are five primary editors of this specification:

- [Steve Klabnik](http://twitter.com/steveklabnik)
- [Yehuda Katz](http://twitter.com/wycats)
- [Dan Gebhardt](http://twitter.com/dgeb)
- [Tyler Kellen](http://twitter.com/tkellen)
- [Ethan Resnick](http://twitter.com/ethanresnick)

## <a href="#roadmap" id="roadmap" class="headerlink"></a> Roadmap

### <a href="#roadmap-1-1" id="roadmap-1-1" class="headerlink"></a> 1.1

* Embedding / creating multiple related resources in a single request
* Extension support

## <a href="#history" id="history" class="headerlink"></a> History

JSON:API was originally drafted by [Yehuda Katz](http://twitter.com/wycats)
in May 2013. This first draft was extracted from the JSON transport
implicitly defined by [Ember](http://emberjs.com/) Data's REST adapter.

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

This specification reached a stable version 1.0 on May 29, 2015.
