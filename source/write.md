---
title: JSON API Updating
---

# JSON API Updating

See also: 

- [Reading](/)
- [Extending](/extending)
- [History](/history)

## URLs

Update URLs are determined [the same way][1] as `GET` URLs. When using the
ID-based approach, URLs are conventionally formed. When using the
URL-based approach, every document specifies the URLs for its related
documents, which can be used to fetch **and** update.

[1]: /

## Creating a Document

A JSON API document is *created* by making a `POST` request to the URL
that represents a collection of documents that the new document should
belong to. While this method is preferred, you can always use anything that's
valid with RFC 2616, as long as it's compliant. For example, PUT can be used
to create documents if you wish. We believe most people will generally use
POST, so we'll elaborate on it further below.

In general, this is a collection scoped to the **type** of document.

The request **MUST** contain a `Content-Type` header whose value is
`application/json`. It **MUST** also include `application/json` as the
only or highest quality factor.

Its root key **MUST** be the same as the root key provided in the
server's response to `GET` request for the collection.

For example, assuming the following request for the collection of
photos:

```text
GET /photos

HTTP/1.1 200 OK
Content-Type: application/json

{
  "photos": [{
    "id": "1",
    "title": "Mustaches on a Stick",
    "src": "http://example.com/images/mustaches.png"
  }]
}
```

You would create a new photo by `POST`ing to the same URL:

```text
POST /photos
Content-Type: application/json
Accept: application/json

{
  "photos": {
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

#### Client-Side IDs

A server **MAY** require a client to provide IDs generated on the
client. If a server wants to request client-generated IDs, it **MUST**
include a `meta` section in its response with the key `client-ids` and
the value `true`:

```text
GET /photos

HTTP/1.1 200 OK
Content-Type: application/json

{
  "posts": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Mustaches on a Stick",
    "src": "http://example.com/images/mustaches.png"
  }],
  "meta": {
    "client-ids": true
  }
}
```

If the server requests client-generated IDs, the client **MUST** include
an `id` key in its `POST` request, and the value of the `id` key
**MUST** be a properly generated and formatted *UUID* provided as a JSON
string. 

```text
POST /photos
Content-Type: application/json
Accept: application/json

{
  "photos": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

#### 204 Responses

A server **MAY** respond to a `POST` request with a `204 No Content`
response. If it does so, the client **MUST** assume that the server has
successfully created the document, and accepted all of the attributes as
is.

Note that if the server is using client-generated IDs, it is possible
for the client to determine the URL for the newly generated record if
the collection response included a URL template:

```text
GET /photos

HTTP/1.1 200 OK
Content-Type: application/json

{
  "posts": [{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Mustaches on a Stick"
  }],
  "links": {
    "posts": "http://example.com/posts/{posts.id}"
  },
  "meta": {
    "client-ids": true
  }
}
```

If the client generated a UUID of
"550e8400-e29b-41d4-a716-446655440001", and it receives a 204 response,
it knows that the URL for the newly created document is
`http://example.com/posts/550e8400-e29b-41d4-a716-446655440001`.

#### 200 Responses

A server **MAY** respond to a `POST` request with a `200 OK` response.
If it does so, it **MUST** include a response body that is a valid
response to a JSON API `GET` request.

If the server is using the URL-based JSON API, it **MUST** include a
`href` key in the attributes section that is the server location of the
newly created document.

```text
HTTP/1.1 200 OK
Content-Type: application/json

{
  "photos": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "href": "http://example.com/photos/12",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

#### Other Responses

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics.

## Updating a Document (`PATCH`)

The body of the `PATCH` request **MUST** be in JSON format with a `Content-Type`
header of `application/json-patch+json`.

It **MUST** be a valid [JSON Patch (RFC 6902)][2] document.

[2]: http://tools.ietf.org/html/rfc6902

### Attributes

To update an attribute, include a `replace` operation in the JSON Patch
document. The name of the property to replace **MUST** be the same as
the attribute name in the original `GET` request.

For example, consider this `GET` request:

```text
GET /photos/1

HTTP/1.1 200 OK
Content-Type: application/json

{
  "photos": {
    "id": "1",
    "title": "Productivity",
    "src": "http://example.com/productivity.png"
  }
}
```

To update just the `src` property of the photo at `/photos/1`, make the
following request:

```text
PATCH /photos/1
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "/src", "value": "http://example.com/hamster.png" }
]
```

For attributes, only the `replace` operation is supported at the current
time.

### Relationships

Relationship updates are represented as JSON Patch operations on the
`links` document.

#### To-One Relationships

To update a to-one relationship, the client **MUST** issue a `PATCH`
request that includes a `replace` operation on the relationship
`links/<name>`.

For example, for the following `GET` request:

```text
GET /photos/1
Content-Type: application/json

{
  "links": {
    "photos.author": "http://example.com/people/{photos.author}"
  },
  "photos": {
    "id": "1",
    "href": "http://example.com/photos/1",
    "title": "Hamster",
    "src": "images/hamster.png",
    "links": {
      "author": "1"
    }
  }
}
```

To change the author to person 2, issue a `PATCH` request to
`/photos/1`:

```text
PATCH /photos/1
Content-Type: application/json-patch+json
Accept: application/json

[
  { "op": "replace", "path": "/links/author", "value": 2 }
]
```

#### To-Many Relationships

While to-many relationships are represented as a JSON array in a `GET`
response, they are updated as if they were a set.

To remove an element from a to-many relationship, use a `remove`
operation on `links/<name>/<id>`. To add an element, use an `add`
operation on `links/<name>/-`.

For example, for the following `GET` request:

```text
GET /photos/1
Content-Type: application/json

{
  "links": {
    "photos.author": "http://example.com/people/{photos.author}"
  },
  "photos": {
    "id": "1",
    "href": "http://example.com/photos/1",
    "title": "Hamster",
    "src": "images/hamster.png",
    "links": {
      "comments": [ "1", "5", "12", "17" ]
    }
  }
}
```

You could move comment 30 to this photo by issuing an `add` operation in
the `PATCH` request:

```text
PATCH /photos/1

[
  { "op": "add", "path": "/links/comments/-", "value": 30 }
]
```

To remove comment 5 from this photo, issue a `remove` operation:

```text
PATCH /photos/1

[
  { "remove": "links/comments/5" }
]
```

Note that to-many relationships have set-like behavior in JSON API to
limit the damage that can be caused by concurrent modifications.

### 204 No Content

If a server returns a `204 No Content` in response to a `PATCH` request,
it means that the update was successful, and that the client's current
attributes remain up to date.

### 200 OK

If the server accepts the updated but also changes the document in other
ways than those specified by the `PATCH` request (for example, updating
the `updatedAt` attribute or a computed `sha`), it **MUST** return a
`200 OK` response.

The body of the response **MUST** be a valid JSON API response, as if a
`GET` request was made to the same URL.

### Other Responses

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics.

## Deletions

A JSON API document is *deleted* by making a `DELETE` request to the
document's URL.

```text
DELETE /photos/1
```

### 204 Responses

If a server returns a `204 No Content` in response to a `DELETE`
request, it means that the deletion was successful.

### Other Responses

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics.

## HTTP Caching

Servers **MAY** use HTTP caching headers (`ETag`, `Last-Modified`) in
accordance with the semantics described in HTTP 1.1.

## Compound Responses

Whenever a server returns a `200 OK` response in response to a creation,
update or deletion, it **MAY** include other documents in the JSON
document. The semantics of these documents are [the same][1] as when
additional documents are included in response to a `GET`.

See also [JSON API Reading](/).
