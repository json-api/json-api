---
layout: page
title: Extensions
show_sidebar: true
---

JSON API can be extended in several ways:

* [Meta information](/format/#document-structure-meta) can be included throughout
  request and response documents, to communicate extra data or enable additional
  behaviors. Meta information is non-standard, and so should be used only for
  customizations that only apply to a single API or a small set of APIs.

* API creators can also author [extensions](/format#extending) if they need to
  make more radical changes to the base specification than is possible using
  `meta`. Extensions also allow individuals to define a format for supporting
  a new capability that can then be published and shared for use by others.
  Two such published extensions are the official extensions listed below.


## Official Extensions <a href="#official-extensions" id="official-extensions" class="headerlink"></a>

JSON API currently supports the following official extensions:

* [Bulk extension](/extensions/bulk/) - provides support for performing multiple
  operations in a request, including adding and removing multiple resources.
  The Bulk extension is referenced with the extension name `bulk`.

* [JSON Patch extension](/extensions/jsonpatch/) - provides support for
  modification of resources with the HTTP PATCH method
  [[RFC5789](http://tools.ietf.org/html/rfc5789)] and the JSON Patch format
  [[RFC6902](http://tools.ietf.org/html/rfc6902)]. The JSON Patch extension is
  referenced with the extension name `jsonpatch`.
