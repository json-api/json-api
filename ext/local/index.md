# Local Identities Extension

This extension provides a means to uniquely identify resources "local" to a
specific document.

Resources can be assigned a "local identity" that can be used to reference each
other before they have been assigned a permanent `id`.

## <a href="#namespace" id="namespace" class="headerlink"></a> Namespace

This extension uses the namespace `local`.

> Note: JSON:API extensions can only introduce new document members using a
> reserved namespace as a prefix.

## <a href="#document-structure" id="document-structure" class="headerlink"></a> Document Structure

A document that supports this extension **MAY** include "local identity" members
using the `local:id` key in the root of resource objects and resource identifier
objects. The values of these members uniquely identify resources within the
document.

Local identity members **MUST NOT** co-exist with `id` members.

Local identity values **MUST** be strings that are unique across resource types.
Different resources of different types **MUST NOT** contain identical local
identity values in a document.

## <a href="#processing" id="processing" class="headerlink"></a> Processing

Clients **MAY** include local identity (`local:id`) members in resources and
resource identifier objects in order to uniquely identify resources that have
not yet been assigned `id` members.

For example, the following POST request contains a resource that references
itself in a relationship:

```json
POST /people HTTP/1.1
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/local"
Accept: application/vnd.api+json

{
  "data": {
    "local:id": "a",
    "type": "people",
    "attributes": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "relationships": {
      "bestFriend": {
        "data": {
          "local:id": "a",
          "type": "people"
        }
      }
    }
  }
}
```

Servers that receive a request with this extension applied **MUST** inspect
all resource objects and resource identifier objects in the request document.
If the objects do not contain `id` members, the server **MUST** check for
`local:id` members. If present, these local identities **MUST** be used to
uniquely identify resources when processing the request.

The server **MUST NOT** include `local:id` members in a response document.

For example, the following response would be appropriate for the previous
request:

```json
HTTP/1.1 201 Created
Location: http://example.com/people/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/local"

{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "people",
    "attributes": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "relationships": {
      "bestFriend": {
        "data": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "type": "people"
        }
      }
    }
  }
}
```
