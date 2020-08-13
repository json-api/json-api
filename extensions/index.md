---
layout: page
title: Extensions and Profiles
show_sidebar: true
redirect_from: /profiles
---

> Note: This page describes features from [an upcoming version of the of the
> JSON:API specification](/format/1.1/) and is subject to change without
> notice.

The JSON:API specification provides a way to define new functionality not
provided by the base specification using [extensions]. Additionally, it
provides a means to share a particular usage of the specification among
implementations using [profiles].

Generally speaking, extensions provide a means to standardize a functionality
that is not so widely needed that it should be part of the base specification
but is general enough that it would benefit the community to have a standard.
Typically, that functionality is also too difficult and/or unconventional to
implement using only the parts of the specification that are reserved for
implementations (e.g. implementations can add their own members to
[`attributes`][attributes] objects, but can't add new members to a resource
identifier).

Profiles, on the other hand, are a way to standardize common usages of the base
specification that _are_ simple to implement using only the parts of the
specification that are reserved for implementations (e.g. a common way to
handle [pagination]).

One major difference between extensions and profiles are that an extension must
be agreed upon and understood by both the client and the server, while a
profile can be safely ignored if either the client or the server does not
recognize it.

Some useful extensions and profiles are listed below. However, an extension or
profile does not need to appear below to be valid. Anyone can author and host
an extension or profile document using their own domain for its URI.

In order to keep the promise of JSON:API as an anti-bikeshedding tool,
implementors are **strongly** encouraged to reuse, improve, and collaborate on
common extensions and profiles instead of creating new extensions and profiles
because of trivial or aesthetic differences.

The extensions and profiles listed on this page have been reviewed by the
JSON:API specification [editors] and are considered:

  - Compatible with the base specification
  - Able to evolve without backward incompatibilities
  - Broadly useful

Not every extension or profile can or should appear on this page. This listing
is maintained on a best-effort basis.

## <a href="#extensions" id="extensions" class="headerlink"></a> Extensions

There are no extensions at this time.

- [Extension Example](https://example.com/ext/foo)
  - URI: `https://example.com/ext/foo`
  - Namespace: `foo`
  - Description: Lorem dolor sit amet.

## <a href="#extensions" id="extensions" class="headerlink"></a> Profiles

There are no profiles at this time.

- [Profile Example](https://example.com/profile/foo)
  - URI: `https://example.com/profile/foo`
  - Description: Lorem dolor sit amet.

[extensions]: /format/1.1/#extensions
[profiles]: /format/1.1/#profiles
[attributes]: /format/1.1/#document-resource-object-attributes
[pagination]: /format/1.1/#fetching-pagination
[editors]: /about/#editors
