---
layout: page
title: Extensions
show_sidebar: true
---

Extensions enable an API to provide clients with information or functionality
beyond that described in the base JSON API specification.

Anyone can author an extension, and a single extension can be reused by
multiple APIs. Popular extensions may be implemented by off-the-shelf tools
so that developers can seamlessly take advantage of the features these
extensions provide.

## <a href="#existing-extensions" id="existing-extensions" class="headerlink"></a> Existing Extensions

Patience, my friend. A list of existing extensions is coming very soon.


## <a href="#prior-extensions" id="prior-extensions" class="headerlink"></a> Prior Extensions

JSON API previously offered experimental support for a different extension
negotiation system than the one now in the specification, and it provided a
number of extensions for use with that old negotiation system. However, this
system was always experimental and has now been deprecated.

New APIs should not use the old system or any extensions designed for it.
APIs that already use these old extensions should direct clients to an
[earlier version of this page](https://github.com/json-api/json-api/blob/9c7a03dbc37f80f6ca81b16d444c960e96dd7a57/extensions/index.md)
as documentation.
