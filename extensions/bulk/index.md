---
layout: page
title: "Bulk Extension"
---

## Introduction <a href="#introduction" id="introduction" class="headerlink"></a>

The "Bulk extension" is an [official
extension](/extensions/#official-extensions) of the JSON API specification.
It provides support for performing multiple operations in a request,
including adding and removing multiple resources.

Servers and clients **MUST** negotiate support for and use of the Bulk extension
[as described in the base specification](/format/#extending) using `bulk` as the
name of the extension.

## Bulk Operations <a href="#bulk-operations" id="bulk-operations" class="headerlink"></a>

[As mentioned in the base specification](/format/#crud), a request **MUST**
completely succeed or fail (in a single "transaction").

Therefore, any request that involves multiple operations **MUST** only
succeed if all operations are performed successfully. The state of the
server **MUST NOT** be changed by a request if any individual operation fails.

## Creating Multiple Resources <a href="#creating-multiple-resources" id="creating-multiple-resources" class="headerlink"></a>

Multiple resources can be created by sending a `POST` request to a URL that
represents a collection of resources. The request **MUST** include an array
of resource objects as primary data. Each resource object **MUST** contain
at least a `type` member.

For instance, multiple photos might be created with the following request:

```text
POST /photos
Content-Type: application/vnd.api+json; ext=bulk
Accept: application/vnd.api+json; ext=bulk

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


## Updating Multiple Resources <a href="#updating-multiple-resources" id="updating-multiple-resources" class="headerlink"></a>

Multiple resources can be updated by sending a `PUT` request to a URL that
represents a collection of resources to which they all belong. The request
**MUST** include an array of resource objects as primary data. Each resource
object **MUST** contain at least `type` and `id` members.

For example:

```text
PUT /articles
Content-Type: application/vnd.api+json; ext=bulk
Accept: application/vnd.api+json; ext=bulk

{
  "data": [{
    "type": "articles",
    "id": "1",
    "title": "To TDD or Not"
  }, {
    "type": "articles",
    "id": "2",
    "title": "LOL Engineering"
  }]
}
```

## Deleting Multiple Resources <a href="#deleting-multiple-resources" id="deleting-multiple-resources" class="headerlink"></a>

Multiple resources can be deleted by sending a `DELETE` request to a URL that
represents a collection of resources to which they all belong.

The body of the request **MUST** contain a `data` member whose value is an
object that contains `type` and `id`, or an array of objects that each
contain a `type` and `id`.

For example:

```text
DELETE /articles
Content-Type: application/vnd.api+json; ext=bulk
Accept: application/vnd.api+json; ext=bulk

{
  "data": { "type": "articles", "id": ["1", "2"] }
}
```
