---
layout: page
title: "Bulk Extension"
---

## <a href="#status" id="status" class="headerlink"></a> Status

**Extensions are an experimental feature** and should be considered a work
in progress. There is no official support for extensions in the base JSON
API specification.

## <a href="#introduction" id="introduction" class="headerlink"></a> Introduction

The "Bulk extension" is an [official
extension](/extensions/#official-extensions) of the JSON API specification.
It provides support for performing multiple operations in a request,
including adding and removing multiple resources.

Servers and clients **MUST** negotiate support for and use of the Bulk extension
[as described in the base specification](/format/#extending) using `bulk` as the
name of the extension.

## <a href="#bulk-operations" id="bulk-operations" class="headerlink"></a> Bulk Operations

[As mentioned in the base specification](/format/#crud), a request **MUST**
completely succeed or fail (in a single "transaction").

Therefore, any request that involves multiple operations **MUST** only
succeed if all operations are performed successfully. The state of the
server **MUST NOT** be changed by a request if any individual operation fails.

## <a href="#creating-multiple-resources" id="creating-multiple-resources" class="headerlink"></a> Creating Multiple Resources

Multiple resources can be created by sending a `POST` request to a URL that
represents a collection of resources. The request **MUST** include an array
of resource objects as primary data. Each resource object **MUST** contain
at least a `type` member.

For instance, multiple photos might be created with the following request:

```http
POST /photos HTTP/1.1
Content-Type: application/vnd.api+json; ext=bulk
Accept: application/vnd.api+json; ext=bulk

{
  "data": [{
    "type": "photos",
    "attributes": {
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    }
  }, {
    "type": "photos",
    "attributes": {
      "title": "Mustaches on a Stick",
      "src": "http://example.com/images/mustaches.png"
    }
  }]
}
```


## <a href="#updating-multiple-resources" id="updating-multiple-resources" class="headerlink"></a> Updating Multiple Resources

Multiple resources can be updated by sending a `PATCH` request to a URL that
represents a collection of resources to which they all belong. The request
**MUST** include an array of resource objects as primary data. Each resource
object **MUST** contain at least `type` and `id` members.

For example:

```http
PATCH /articles HTTP/1.1
Content-Type: application/vnd.api+json; ext=bulk
Accept: application/vnd.api+json; ext=bulk

{
  "data": [{
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "To TDD or Not"
    }
  }, {
    "type": "articles",
    "id": "2",
    "attributes": {
      "title": "LOL Engineering"
    }
  }]
}
```

## <a href="#deleting-multiple-resources" id="deleting-multiple-resources" class="headerlink"></a> Deleting Multiple Resources

Multiple resources can be deleted by sending a `DELETE` request to a URL that
represents a collection of resources to which they all belong.

The body of the request **MUST** contain a `data` member whose value is an
an array of resource identifier objects.

For example:

```http
DELETE /articles HTTP/1.1
Content-Type: application/vnd.api+json; ext=bulk
Accept: application/vnd.api+json; ext=bulk

{
  "data": [
    { "type": "articles", "id": "1" },
    { "type": "articles", "id": "2" }
  ]
}
```
