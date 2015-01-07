---
layout: page
title: "JSON Patch Support"
---

> TODO: This entire page has just been extracted from the main Format page. Needs reworking.

## Recommendations for URL Design <a href="#urls" id="urls" class="headerlink"></a>

### Reference Document <a href="#urls-reference-document" id="urls-reference-document" class="headerlink"></a>

When determining an API's URL structure, it is helpful to consider that all of
its resources exist in a single "reference document" in which each resource is
addressable at a unique path. Resources are grouped by type at the top level of
this document. Individual resources are keyed by ID within these typed
collections. Attributes and links within individual resources are uniquely
addressable according to the resource object structure described above.

This concept of a reference document is used to determine appropriate URLs for
resources as well as their relationships. It is important to understand that
this reference document differs slightly in structure from documents used to
transport resources due to different goals and constraints. For instance,
collections in the reference document are represented as sets because members
must be addressable by ID, while collections are represented as arrays in
transport documents because order is significant.

### URLs for Resource Collections <a href="#urls-resource-collections" id="urls-resource-collections" class="headerlink"></a>

The URL for a collection of resources **SHOULD** be formed from the resource
type.

For example, a collection of resources of type "photos" will have the URL:    <!-- Do you mean type 'photo'? -->

```text
/photos
```

### URLs for Individual Resources <a href="#urls-individual-resources" id="urls-individual-resources" class="headerlink"></a>

Collections of resources **SHOULD** be treated as sets keyed by resource ID. The
URL for an individual resource **SHOULD** be formed by appending the resource's
ID to the collection URL.

For example, a photo with an ID of `"1"` will have the URL:

```text
/photos/1
```

The URL for multiple individual resources **SHOULD** be formed by appending a
comma-separated list of resource IDs to the collection URL.

For example, the photos with IDs of `"1"`, `"2"` and `"3"` will collectively
have the URL:

```text
/photos/1,2,3
```

### Alternative URLs <a href="#urls-alternative" id="urls-alternative" class="headerlink"></a>

Alternative URLs for resources **MAY** optionally be specified in responses with
`"href"` members or URL templates.

### Relationship URLs <a href="#urls-relationships" id="urls-relationships" class="headerlink"></a>

TODO: Move this to wherever working with relationship URLs is described

A resource's relationship **MAY** be accessible at a URL formed by appending
`/links/<relationship-name>` to the resource's URL. This relative path is
consistent with the internal structure of a resource object.

For example, a photo's collection of linked comments will have the URL:

```text
/photos/1/links/comments
```

A photo's reference to an individual linked photographer will have the URL:

```text
/photos/1/links/photographer
```

A server **MUST** represent "to-one" relationships as individual resources and
"to-many" relationships as resource collections.
