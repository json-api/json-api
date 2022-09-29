---
layout: page
title: About
---

## <a href="#channels" id="channels" class="headerlink"></a> Channels

JSON:API is:

  * [@jsonapi](https://twitter.com/jsonapi) on
[Twitter](https://twitter.com)
  * _#jsonapi_ channel on [Freenode IRC](http://freenode.net)
  * [jsonapi discussion forum](https://discuss.jsonapi.org)

## <a href="#editors" id="editors" class="headerlink"></a> Editors

There are four active editors of this specification:

- [Yehuda Katz](https://twitter.com/wycats)
- [Dan Gebhardt](https://twitter.com/dgeb)
- [Gabe Sullice](https://twitter.com/gabesullice)
- [Jeldrik Hanschke](https://twitter.com/jelhan1)

The following emeritus editors are no longer active:

- [Tyler Kellen](https://twitter.com/tkellen)
- [Steve Klabnik](https://twitter.com/steveklabnik)
- [Ethan Resnick](https://twitter.com/ethanresnick)

## <a href="#history" id="history" class="headerlink"></a> History

JSON:API was originally drafted by [Yehuda Katz](https://twitter.com/wycats)
in May 2013. This first draft was extracted from the JSON transport
implicitly defined by [Ember](https://emberjs.com/) Data's REST adapter.

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

### <a href="#update-history" id="update-history" class="headerlink"></a> Update history

- 2022-09-30: 1.1 final released.
- 2022-08-22: 1.1 Release candidate 4 released.
  - Formalized the definition of specification and implementation
    [semantics](https://jsonapi.org/format/1.1/#semantics).
  - Refined the definitions of
    [extensions](https://jsonapi.org/format/1.1/#extensions) and
    [profiles](https://jsonapi.org/format/1.1/#profiles).
  - Clarified details regarding expected and allowed responses, query
    parameters, and more.
- 2020-10-01: 1.1 Release candidate 3 released.
  - Refined links objects. The link object `params` member was removed to
    better align with other JSON link serializations. The `anchor` target
    attribute was also removed. It may be restored in a future minor release.
- 2020-08-20: 1.1 Release candidate 2 released.
  - [Extensions](https://jsonapi.org/format/1.1/#extensions) were added and the
    scope of [profiles](https://jsonapi.org/format/1.1/#profiles) were reduced
    since their introduction in RC1.
  - [Links](https://github.com/json-api/json-api/pull/1348) can be represented
    as [RFC 8288](https://tools.ietf.org/html/rfc8288)-style web links.
  - A new [`describedby`](https://github.com/json-api/json-api/pull/1447) [links member](https://jsonapi.org/format/1.1/#document-top-level)
    was added so that implementors can incorporate description documents (e.g.
    [OpenAPI](https://www.openapis.org/) or [JSON Schema](https://json-schema.org/specification.html))
    directly into their APIs.
  - [Local IDs](https://jsonapi.org/format/1.1/#document-resource-object-identification)
    were [introduced](https://github.com/json-api/json-api/pull/1244) so that a
    client can create a relationship to a resource yet-to-be created by the
    same request.
- 2018-12-01: 1.1 Release candidate 1 released.
  - New features include: [profiles](https://jsonapi.org/format/1.1/#profiles), ["@-Members"](https://jsonapi.org/format/1.1/#document-member-names-at-members), and [error object `type` links](https://jsonapi.org/format/1.1/#error-objects).
  - There are editorial clarifications around: [query parameters](https://jsonapi.org/format/1.1/#query-parameters) (their parsing/serialization, and reserved parameter names), the appropriate status code for [specific](https://github.com/json-api/json-api/pull/1036) [responses](https://github.com/json-api/json-api/pull/1029), and the [presence of the `included` key](https://github.com/json-api/json-api/pull/1236) even when its value is an empty array.
  - JSON:API switched to [recommending camelCased names](https://jsonapi.org/recommendations/#naming).
- 2015-05-29: 1.0 final released.
- 2015-05-21: 1.0 Release candidate 4 released.
- 2015-03-16: 1.0 Release candidate 3 released.
- 2015-02-18: 1.0 Release candidate 2 released.
- 2014-07-05: 1.0 Release candidate 1 released.
- 2013-07-21: Media type registration completed with the IANA.
- 2013-05-03: Initial release of the draft.
