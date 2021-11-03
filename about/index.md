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

There are three active editors of this specification:

- [Yehuda Katz](http://twitter.com/wycats)
- [Dan Gebhardt](http://twitter.com/dgeb)
- [Gabe Sullice](http://twitter.com/gabesullice)

The following emeritus editors are no longer active:

- [Tyler Kellen](http://twitter.com/tkellen)
- [Steve Klabnik](http://twitter.com/steveklabnik)
- [Ethan Resnick](http://twitter.com/ethanresnick)

## <a href="#roadmap" id="roadmap" class="headerlink"></a> Roadmap

### <a href="#roadmap-1-1" id="roadmap-1-1" class="headerlink"></a> 1.1

* Embedding / creating multiple related resources in a single request
* Extension support

## <a href="#history" id="history" class="headerlink"></a> History

JSON:API was originally drafted by [Yehuda Katz](https://twitter.com/wycats)
in May 2013. This first draft was extracted from the JSON transport
implicitly defined by [Ember](https://emberjs.com/) Data's REST adapter.

The goals of the media type are to balance:

* A generic media type that can work across a broad set of use cases,
  including the generally used relationship types
* Similarity to existing server-side framework practices (and human
  readability for debugging)
* Ease of implementation on the server side
* Ease of implementation on the client side

This specification reached a stable version 1.0 on May 29, 2015.

Today there are implementations in a range of languages and frameworks,
both server-side and client-side. But the idea for JSON API was born out of 
the Ember project, to eliminate the need for ad-hoc code per application to 
communicate with servers that communicate in a well-defined way.

Some servers, like Firebase, Parse and CouchDB already define strict
communication protocols for clients, and were good fits for Ember Data.
In contrast, servers written in Rails, Node, and Django tend to be
written in a "REST-style" but lack the precision necessary for drop-in
client code.

The REST Adapter in Ember Data implicitly defined a protocol that
custom servers could implement to get a drop-in client for all of their
resources. [Blueprinter][1] is a proof-of-concept library for Rails that 
implement the serialization format defined by JSON API.

[1]: https://github.com/procore/blueprinter



