---
layout: page
title: "Bulk Operations"
---

> TODO: This entire page has just been extracted from the main Format page. Needs reworking.

## Introduction <a href="#introduction" id="introduction" class="headerlink"></a>

A JSON API server **MAY** support modification of more than one resource in
a single request.

## Creating Multiple Resources <a href="#crud-creating-multiple-resources" id="crud-creating-multiple-resources" class="headerlink"></a>

A server **MAY** support creating multiple resources in a single request by supplying an
array as the value of the data object. Each element of the array has the same requirements
as [Creating an Individual Resource](#crud-creating-individual-resources) above.

<!-- <div class="example"> -->
For instance, multiple photos might be created with the following request:

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": [{
    "type": "photos",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
    }, {
      "type": "photos",
      "title": "Mustaches on a Stick",
      "src": "http://example.com/images/mustaches.png"
      }]
    }
```
<!-- </div> -->


#### Updating Multiple Resources <a href="#crud-updating-multiple-resources" id="crud-updating-multiple-resources" class="headerlink"></a>

To update multiple resources, send a `PUT` request to the URL that represents
the multiple individual resources (NOT the entire collection of resources). The
request **MUST** include a top-level collection of resource objects that each
contain an `"id"` member.

For example:

```text
PUT /articles/1,2
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "articles": [{
    "id": "1",
    "title": "To TDD or Not"
    }, {
      "id": "2",
      "title": "LOL Engineering"
  }]
}
```
