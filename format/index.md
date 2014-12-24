---
layout: page
title: "Format"
---

{% include status.md %}

## Introduction <a href="#introduction" id="introduction" class="headerlink"></a>

JSON API is a specification for how a client should request that resources be
fetched or modified and how a server should respond to those requests.

JSON API is designed to minimize both the number of requests and the amount of
data transmitted between clients and servers. This efficiency is achieved
without compromising readability, flexibility, and discoverability.

JSON API requires use of the JSON API media type
([`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json))
for exchanging data.

A JSON API server supports fetching of resources through the HTTP method GET.
//reword 
In order to support creating, updating and deleting resources, it must support
use of the HTTP methods POST, PUT and DELETE, respectively.

A JSON API server may also optionally support modification of resources with
the HTTP PATCH method [[RFC5789](http://tools.ietf.org/html/rfc5789)] and the
JSON Patch format [[RFC6902](http://tools.ietf.org/html/rfc6902)]. JSON Patch
support is possible because, conceptually, JSON API represents all of a
domain's resources as a single JSON document that can act as the target for
operations. Resources are grouped at the top level of this document according
to their type. Each resource can be identified at a unique path within this
document.

## Conventions <a href="#conventions" id="conventions" class="headerlink"></a>

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be
interpreted as described in RFC 2119
[[RFC2119](http://tools.ietf.org/html/rfc2119)].

## Document Structure <a href="#document-structure" id="document-structure" class="headerlink"></a>

This section describes the structure of a JSON API document, which is identified by the media type
[`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json).
JSON API documents are defined in JavaScript Object Notation (JSON) [[RFC4627](http://tools.ietf.org/html/rfc4627)].

Although the same media type is used for both request and response documents,
certain aspects are only applicable to one or the other. These differences are
called out below.

### Top Level <a href="#document-structure-top-level" id="document-structure-top-level" class="headerlink"></a>

A JSON object **MUST** be at the root of every JSON API document. This object
defines a document's "top level".

The document's "primary data" is a representation of the resource or collection of resources primarily targeted by a request.

The primary data **MUST** appear under a top-level key named `"data"`. The primary data may be a single resource object or an array of resource objects.

<div class="example">
```javascript
{
  "data": {
    "type": "posts",
    "id": "1",
    // ... attributes of this post
  }
}
```
</div>

A document's top level **MAY** also have the following members:

* `"meta"`: meta-information about a resource, such as pagination, or additional non-standard information.
* `"links"`: URL templates to be used for expanding resources' relationships
  URLs.
* `"linked"`: a list of resource objects that are linked
  to the primary resource object and/or each other (i.e. "linked resource(s)").

If any of these members appears in the top-level, their values **MUST** comply with this specification.

The top level of a document **MUST NOT** contain any additional members.

### Resource Objects <a href="#document-structure-resource-objects" id="document-structure-resource-objects" class="headerlink"></a>

"Resource objects" appear in a JSON API document to represent primary data and related resources.

Here's how a post (i.e. a resource of type "posts") might appear in a document:

```javascript
{
  "type": "posts",
  "id": "1",
  "title": "Rails is Omakase"
}
```

#### Resource Attributes <a href="#document-structure-resource-object-attributes" id="document-structure-resource-object-attributes" class="headerlink"></a>

A resource object **MUST** contain at least the following top-level members:

* `"id"`
* `"type"`

In addition, a resource object **MAY** contain any of these top-level members:

* `"links"`, used for relationships (described below)
* `"meta"`, which can be used for additional non-standard information that does not represent an attribute or relationship

Any other member in a resource object represents an "attribute", which may contain any legal JSON value.

#### Resource Identification <a href="#document-structure-resource-identification" id="document-structure-resource-identification" class="headerlink"></a>

Every JSON API resource object is uniquely identified by a combination of its `type` and `id` members. This identification is used for linkage in compound documents and batch operations that modify multiple resources at a time.

A resource object's `type` and `id` pair **MUST** refer to a single, unique resource.

#### Resource Types <a href="#document-structure-resource-types" id="document-structure-resource-types" class="headerlink"></a>

Each resource object **MUST** contain a `type` member. The `type` is used to describe resource objects that share common attributes and relationships.

#### Resource IDs <a href="#document-structure-resource-object-ids" id="document-structure-resource-object-ids" class="headerlink"></a>

Each resource object **MUST** contain an `id` member, whose value **MUST** be a string.

#### Links

The value of the `"links"` key is a JSON object that represents linked
resources, keyed by the name of each association.

#### Resource URLs <a href="#document-structure-resource-urls" id="document-structure-resource-urls" class="headerlink"></a>

A resource object **MAY** include a URL that identifies the resource represented by the resource object.

```json
{
  "type": "posts",
  "id": "1",
  "title": "Rails is Omakase",
  "links": {
    "self": "http://example.com/posts/1"
  }
}
```

A server **MUST** respond to a `GET` request to the specified URL with a
response that includes the resource as the primary data.

#### Resource Relationships <a href="#document-structure-resource-relationships" id="document-structure-resource-relationships" class="headerlink"></a>

A resource object **MAY** contain references to other resource objects ("relationships"). Relationships may be to-one or to-many.

In JSON API, a relationship has the following capabilities:

* A URL for the related resource objects. For example, a `post`'s `comments` could specify a URL that returns a list of comment resource objects when `GET`ed.
* A URL representing the relationship itself. This allows the client to directly manipulate the relationship. For example, it would allow a client to remove
  an `author` from a `post` without deleting the `people` resource itself.
* The `type` and `id`s of resource objects included in the same compound document. This allows a client to link together all of the resource objects included
  in a compound document without having to `GET` one of the relationship URLs.

A resource object **MAY** provide relationships by including keys other than `self` in its `links` member. The value of a relationship **MUST** be one of
the following:

* A string, which represents a URL for the related resource objects
* An object

If a relationship is provided as an object (a "link object"), it **MUST** contain at least one of the following:

* A `self` member, whose value is the relationship URL. The semantics of a relationship URL are described below.
* A `resource` member, whose value is a URL that, when fetched, returns the related resource object(s) in the response's `data`
* Linkage to other resource objects ("object linkage") included in a compound document:
  * `type` and `id` members for to-one relationships
  * `type` and `ids` members for homogenous to-many relationships
  * a `data` member whose value is an array of objects each containing `type` and `id` members for heterogenous to-many relationships

A link object **MUST NOT** include any other members, except for a member named `meta`. The `meta` member can be used for custom extensions, and may have any value.

If a link object refers to resource objects included in the same compound document, it **MUST** include object linkage to thheose resource objects.

<div class="example">
For example, the following post is associated with an `author` and `comments`:

```javascript
// ...
{
  "type": "posts",
  "id": "1",
  "title": "Rails is Omakase",
  "links": {
    "self": "http://example.com/posts/1",
    "author": {
      "self": "http://example.com/posts/1/links/author"
      "resource": "http://example.com/posts/1/author",
      "type": "people",
      "id": "9"
    },
    "comments": {
      "resource": "http://example.com/posts/1/comments"
    }
  }
}
// ...
```

The `author` relationship includes both a URL for the relationship itself, which allows the client to change the related author without deleting the
`people` object, a URL to fetch the resource objects, and linkage information for the current compound document.

The `comments` relationship is simpler: it just provides a URL to fetch the comments. As a result, the following resource object (which provides the
`comments` relationship as a string value rather than an object) is equivalent:

```javascript
// ...
{
  "type": "posts",
  "id": "1",
  "title": "Rails is Omakase",
  "links": {
    "self": "http://example.com/posts/1",
    "author": {
      "self": "http://example.com/posts/1/links/author"
      "resource": "http://example.com/posts/1/author",
      "type": "people",
      "id": "9"
    },
    "comments": "http://example.com/posts/1/comments"
  }
}
// ...
```

</div>

### Compound Documents <a href="#document-structure-compound-documents" id="document-structure-compound-documents" class="headerlink"></a>

To reduce the number of HTTP requests, responses may optionally allow for the inclusion of linked resources along with the requested primary resources. Such response documents are called "compound documents".

In a compound document, linked resources **MUST** be included as an array of resource
objects in a top level `"linked"` object.

<div class="example">
A complete example document wth multiple included relationships:

```json
{
  "data": [{
    "type": "posts",
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "self": "http://example.com/posts/1",
      "author": { "resource": "http://example.com/posts/1/author", "type": "people", "id": "9" },
      "comments": { "resource": "http://example.com/posts/1/comments", "type": "comments", "ids": ["5", "12"] },
    }
  }],
  "linked": [{
    "type": "people",
    "id": "9",
    "name": "dgeb"
    "links": {
      "self": "http://example.com/people/9"
    }
  }, {
    "type": "comments",
    "id": "5"
    "body": "First!",
    "links": {
      "self": "http://example.com/comments/5"
    }
  }, {
    "type": "comments",
    "id": "12"
    "body": "Second!",
    "links": {
      "self": "http://example.com/comments/12"
    }
  }]
}
```
</div>

A compound document **MUST NOT** include more than one resource object for each `type` and `id` pair.

> Note: In a single document, you can think of the `type` and `id` as a composite key that uniquely references resource objects in another part of the document.

> Note: This approach ensures that a single canonical resource object is returned with each response, even when the same resource is referenced multiple times.

## URLs <a href="#urls" id="urls" class="headerlink"></a>

TODO: Move into a separate "Recommendations for URL design" page

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

## Fetching Resources <a href="#fetching" id="fetching" class="headerlink"></a>

A resource, or collection of resources, can be fetched by sending a `GET`
request to an endpoint.

JSON API requests **MUST** include an `Accept` header specifying the JSON API media type.

Responses can be further refined with the optional features described below.

### Inclusion of Linked Resources <a href="#fetching-includes" id="fetching-includes" class="headerlink"></a>

An endpoint **MAY** return resources linked to the primary data by default.

An endpoint **MAY** also support custom inclusion of linked resources based upon
an `include` request parameter. This parameter **MUST** specify the relationship using the same name as the name in the `links` section of the primary data.

If a client supplies an `include` parameter, the server **MUST NOT** include other resource objects in the `linked` section of the compound document.

> TODO: A **MUST** for what has to be returned, plus a basic pagination spec

The value of the `include` parameter is a comma-separated (U+002C COMMA, ",") list of relationship paths. A relationship path is a dot-separated (U+002E FULL-STOP, ".") list of relationship names. Each relationship name **MUST** be identical to the
key in the `links` section of its parent resource object.

> Note: For example, a relationship path would be something like `comments.author`, where
> `comments` is a relationship listed under a `posts` resource object, and `author` is a
> relationship listed under a `comments` resource object.

<div class="example">
For instance, comments could be requested with a post:

```text
GET /posts/1?include=comments
```

In order to request resources linked to other resources, a dot-separated path
for each relationship name can be specified:

```text
GET /posts/1?include=comments.author
```

> Note: A request for `comments.author` should not automatically also include `comments` in the 
> response. This can happen if the client already has the `comments` locally, and now wants to
> fetch the associated authors without fetching the comments again.

Multiple linked resources can be requested in a comma-separated list:

```text
GET /posts/1?include=author,comments,comments.author
```

</div>

### Sparse Fieldsets <a href="#fetching-sparse-fieldsets" id="fetching-sparse-fieldsets" class="headerlink"></a>

A client **MAY** request that an endpoint return only specific fields in the response on a
per-type basis by including a `fields[TYPE]` parameter. The value of the parameter refers to an attribute name or a relationship name.

```text
GET /posts?include=author&fields[posts]=id,title&fields[people]=id,name
```

If a client requests a restricted set of fields, an endpoint **MUST NOT** include those  <!-- you either mean must not include other fields or must include those fields -->
fields in the response.

### Sorting <a href="#fetching-sorting" id="fetching-sorting" class="headerlink"></a>

> TODO: Come back to this after pagination

A server **MAY** choose to support requests to sort resource collections
according to one or more criteria.

An endpoint **MAY** support requests to sort the primary resource type with a
`sort` parameter.

```text
GET /people?sort=age
```

An endpoint **MAY** support multiple sort criteria by allowing comma-separated
fields as the value for `sort`. Sort criteria should be applied in the order
specified.

```text
GET /people?sort=age,name
```

The default sort order **SHOULD** be ascending. A `-` prefix on any sort field
specifies a descending sort order.

```text
GET /posts?sort=-created,title
```

The above example should return the newest posts first. Any posts created on the
same date will then be sorted by their title in ascending alpabetical order.

An endpoint **MAY** support requests to sort any resource type with a
`sort[TYPE]` parameter.

```text
GET /posts?include=author&sort[posts]=-created,title&sort[people]=name  
```

If no sort order is specified, or if the endpoint does not support use of either
`sort` or `sort[TYPE]`, then the endpoint **SHOULD** return resource objects
sorted with a repeatable algorithm. In other words, resources **SHOULD** always
be returned in the same order, even if the sort criteria aren't specified.

Note: `sort` and `sort[TYPE]` can not be mixed. If the latter format is used,
then it **MUST** be used for the primary resource type as well.

## Creating, Updating and Deleting Resources <a href="#crud" id="crud" class="headerlink"></a>

A server **MAY** allow resources of a given type to be newly created. It **MAY** also allow
existing resources to be modified or deleted.

A server **MAY** allow multiple resources to be updated in a single request, as
discussed below. Updates to multiple resources **MUST** completely succeed or
fail (in a single "transaction"). No partial updates are allowed.

Any requests that contain content **MUST** include a `Content-Type` header whose
value is `application/vnd.api+json`.

### Creating Resources <a href="#crud-creating-resources" id="crud-creating-resources" class="headerlink"></a>

#### Creating an Individual Resource <a href="#crud-creating-individual-resources" id="crud-creating-individual-resources" class="headerlink"></a>

A request to create an individual resource **MUST** include a single data object. The
data object **MUST** contain at least a `type` member.

> Note: The `type` member is required throughout requests and responses in JSON API
> for consistency. Picking and choosing when it is required would be confusing; it
> would be hard to remember when it was required and when it was not. In this case,
> it may be required when `POST`ing to an endpoint representing heterogeneous data.

For instance, a new photo might be created with the following request:

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "photos",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

#### Creating Multiple Resources <a href="#crud-creating-multiple-resources" id="crud-creating-multiple-resources" class="headerlink"></a>

> TODO: Move this into a "bulk" profile

A server **MAY** support creating multiple resources in a single request by supplying an
array as the value of the data object. Each element of the array has the same requirements
as [Creating an Individual Resource](#crud-creating-individual-resources) above.

<div class="example">
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
</div>

#### Client-Generated IDs <a href="#crud-creating-client-ids" id="crud-creating-client-ids" class="headerlink"></a>

A server **MAY** accept client-generated IDs along with requests to create one
or more resources. IDs **MUST** be specified with an `"id"` key, the value of
which **MUST** be a properly generated and formatted *UUID*.

A server **MUST** respond to a successful resource creation request according to
[`HTTP semantics`](http://tools.ietf.org/html/draft-ietf-
httpbis-p2-semantics-22#section-6.3).

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "photos",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

#### Responses <a href="#crud-creating-responses" id="crud-creating-responses" class="headerlink"></a>

##### 201 Created <a href="#crud-creating-responses-201" id="crud-creating-responses-201" class="headerlink"></a>

A server **MUST** respond to a successful resource creation request according to
[`HTTP semantics`](http://tools.ietf.org/html/draft-ietf-
httpbis-p2-semantics-22#section-6.3).

If a `POST` request did not include [Client-Generated IDs](#crud-creating-client-ids), and
a resource has been created, the server **MUST** return a `201 Created` status code.

The response **MUST** include a `Location` header identifying the location of the newly
created resource.

If the data object returned by the response contains a `self` key in its `links` member,
the value of the `self` member **MUST** match the value of the `Location` header.

The response **MUST** also include a document that contains the primary resource created.

```text
HTTP/1.1 201 Created
Location: http://example.com/photos/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "photos",
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png",
    "links": {
      "self": "http://example.com/photos/550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

If a `POST` request *did* include [Client-Generated IDs](#crud-creating-client-ids), the
server **MAY** return a `204 No Content` status code.

> Note: In this case, the client should consider the data object sent in the request to be 
> accepted by the server, as if the server had returned it back in a `201` response.

##### Other Responses <a href="#crud-creating-responses-other" id="crud-creating-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error details
**MAY** also be returned, as discussed below.

### Updating Resources <a href="#crud-updating" id="crud-updating" class="headerlink"></a>

#### Updating an Individual Resource <a href="#crud-updating-individual-resources" id="crud-updating-individual-resources" class="headerlink"></a>

To update an individual resource, send a `PUT` request to the URL that
represents the resource. The request **MUST** include a single top-level resource object.

The URL for a resource can be obtained:

* from the `self` link in the resource object
* for a *data object*, the original URL that was used to `GET` the document

For example:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "title": "To TDD or Not"
  }
}
```

#### Updating Multiple Resources <a href="#crud-updating-multiple-resources" id="crud-updating-multiple-resources" class="headerlink"></a>

> TODO: Move this into a "bulk" profile

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

#### Updating Attributes <a href="#crud-updating-attributes" id="crud-updating-attributes" class="headerlink"></a>

If a request does not include all of the fields for a resource, the server **MUST**
interpret the missing fields as if they were included together with their current
values. It **MUST NOT** interpret them as `null` values.

> Note: Because the resources represented by JSON API have a list of known fields,
> the server *must* interpret the missing attributes in some way. Choosing to interpret
> them as `null` values would be just as arbitrary as choosing to interpret them as
> containing their current values, and the dominant real-world practice is to interpret
> such as a request as a request for a partial update.

For example, the following `PUT` request is interpreted as a request to update only
the `title` and `text` attributes of an article:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "title": "To TDD or Not",
    "text": "TLDR; It's complicated... but check your test coverage regardless."
  }
}
```


#### Deleting Resources <a href="#crud-deleting" id="crud-deleting" class="headerlink"></a>

An individual resource can be *deleted* by making a `DELETE` request to the
resource's URL:

```text
DELETE /photos/1
```

#### Updating Relationships <a href="#crud-updating-relationships" id="crud-updating-relationships" class="headerlink"></a>

JSON API provides a mechanism for updating a relationship without modifying the
resources involved in the relationship, and without exposing the underlying
server semantics (for example, foreign keys).

> Note: For example, if a post has many authors, it is possible to remove one of the
> authors from the post without deleting the person itself. Similarly, if a post
> has many tags, it is possible to add or remove tags. Under the hood on the server,
> the first of these examples might be implemented with a foreign key, while the
> second could be implemented with a join table, but the JSON API protocol would
> be the same in both cases.

> Note: A server may choose to delete the underlying resource if a relationship
> is deleted (as a garbage collection measure).

##### Updating To-One Relationships <a href="#crud-updating-to-one-relationships" id="crud-updating-to-one-relationships" class="headerlink"></a>

A client can update a to-one relationships along with other attributes by including
them in a `links` object within the resource object in a `PUT` request.

If a to-one relationship is provided in the `links` section of a resource object
in a `PUT` request, it **MUST** be one of:

* an object with `type` and `id` members corresponding to the related resource
* `null`, to remove the relationship

<div class="example">

For instance, the following `PUT` request will update the `title` attribute and
`author` relationship of an article:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": {
    "type": "articles",
    "id": "1",
    "title": "Rails is a Melting Pot",
    "links": {
      "author": { "type": "people", "id": "1" }
    }
  }
}
```

</div>

If the data object included a relationship URL for the relationship in the
*link object*, the server **MUST** update the relationship if it receives
a `PUT` request to that URL.

The `PUT` request **MUST** include a top-level member named `data` containing
one of:

* an object with `type` and `id` members corresponding to the related resource
* `null`, to remove the relationship

<div class="example">
```text
PUT /articles/1/links/author
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "people", "id": "12" }
}
```
</div>

##### Updating To-Many Relationships <a href="#crud-updating-to-many-relationships" id="crud-updating-to-many-relationships" class="headerlink"></a>

A client can update a to-many relationships together with other attributes by
including them in a `links` object within the document in a `PUT` request.

If a to-many relationship is included in the `links` section of a resource object,
it **MUST** be an object containing:

* `type` and `ids` members for homogenous to-many relationships; to clear the
  relationship, set the `ids` member to `[]`
* a `data` member whose value is an array of objects each containing `type` and
  `id` members for heterogenous to-many relationships; to clear the relationship,
  set the `data` member to `[]`

<div class="example">

For instance, the following `PUT` request performs a complete replacement of the
`tags` for an article:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "articles": {
    "id": "1",
    "title": "Rails is a Melting Pot",
    "links": {
      "tags": { "type": "tags", "ids": ["2", "3"] }
    }
  }
}
```

</div>

A server **MAY** reject an attempt to do a full replacement of a to-many relationship.
In such a case, the server **MUST** reject the entire update, and return a
`403 Forbidden` response.

> Note:  Since full replacement may be a very dangerous operation, a server may choose
> to disallow it. A server may reject full replacement if it has not provided the client
> with the full list of associated objects, and does not want to allow deletion
> of records the client has not seen.

If the data object included a relationship URL for the relationship in the
*link object*, the server **MUST** update the relationship if it receives
a `POST`, `PUT` or `DELETE` request to that URL.

If the client makes a `PUT` request to the *relationship URL*, the server
**MUST** either completely replace every member of the relationship or return
a `403 Forbidden` response.

The body of the request **MUST** contain a `data` member, whose value is the
same as the above-described `links` section.

<div class="example">
```text
PUT /articles/1/links/tags
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "tags", "ids": ["2", "3"] }
}
```
</div>

If the client makes a `POST` request to the *relationship URL*, the server
**MUST** append the specified members to the relationship using set
semantics. This means that if a given `type` and `id` is already in the
relationship, it should not add it again.

> Note: This matches the semantics of databases that use foreign keys
> for has-many relationships. Document-based storage should check the
> has-many relationship before appending to avoid duplicates. 

<div class="example">
```text
POST /articles/1/links/comments
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "comments", "ids": ["1"] }
}
```

In this example, the comment with id `1` is added to the list of comments
for the article with id `1`.
</div>

If the client makes a `DELETE` request to the *relationship URL*, the server
**MUST** delete the specified members from the relationship or return a
`403 Forbidden` response.

The members are specified in the same way as in the `POST` request.

<div class="example">
```text
DELETE /articles/1/links/comments
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "data": { "type": "comments", "ids": ["1"] }
}
```
</div>

> Note: RFC 7231 specifies that a DELETE request may include a body, but that
> a server may reject the request. This spec defines the semantics of a server,
> and we are defining its semantics for JSON API.

### Responses to Updates <a href="#crud-updating-responses" id="crud-updating-responses" class="headerlink"></a>

#### 204 No Content <a href="#crud-updating-responses-204" id="crud-updating-responses-204" class="headerlink"></a>

A server **MAY** return a `204 No Content` status code if an update is
successful and the client's current attributes remain up to date.

#### 200 OK <a href="#crud-updating-responses-200" id="crud-updating-responses-200" class="headerlink"></a>

If a server accepts an update but also changes the resource(s) in other ways
than those specified by the request (for example, updating the `updatedAt`
attribute or a computed `sha`), it **MUST** return a `200 OK` response.

The response document for a `200 OK` **MUST** include a representation of
the updated resource(s) as if a `GET` request was made to the request URL.

#### 403 Forbidden

A server **MAY** return `403 Forbidden` in response to an unsupported request
to update a resource when that lack of support is allowed above.

#### 404 Not Found

A server **MUST** return `404 Not Found` when processing a request to modify or
delete a resource or relationship that does not exist.

#### 409 Conflict

A server **MUST** return `409 Conflict` when processing a `POST` request to create
a resource with a client-generated ID that aready exists.

A server **MAY** return `409 Conflict` when processing a `POST` or `PUT` request
to update a resource if that update would violate other server-enforced constraints
(such as a uniqueness constraint on a field other than `id`).

#### Other Responses <a href="#crud-updating-responses-other" id="crud-updating-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error details
**MAY** also be returned, as discussed below.

#### Responses to Deletes <a href="#crud-deleting-responses" id="crud-deleting-responses" class="headerlink"></a>

##### 204 No Content <a href="#crud-deleting-responses-204" id="crud-deleting-responses-204" class="headerlink"></a>

A server **MUST** return a `204 No Content` status code if a delete request is
successful.

##### Other Responses <a href="#crud-deleting-responses-other" id="crud-deleting-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error details
**MAY** also be returned, as discussed below.

## Errors <a href="#errors" id="errors" class="headerlink"></a>

Error objects are specialized resource objects that **MAY** be returned in a
response to provide additional information about problems encountered while
performing an operation. Error objects **SHOULD** be returned as a collection
keyed by `"errors"` in the top level of a JSON API document, and **SHOULD NOT**
be returned with any other top level resources.

An error object **MAY** have the following members:

* `"id"` - A unique identifier for this particular occurrence of the problem.
* `"href"` - A URI that **MAY** yield further details about this particular
  occurrence of the problem.
* `"status"` - The HTTP status code applicable to this problem, expressed as a
  string value.
* `"code"` - An application-specific error code, expressed as a string value.
* `"title"` - A short, human-readable summary of the problem. It **SHOULD NOT**
  change from occurrence to occurrence of the problem, except for purposes of
  localization.
* `"detail"` - A human-readable explanation specific to this occurrence of the
  problem.
* `"links"` - Associated resources which can be dereferenced from the request
  document.
* `"path"` - The relative path to the relevant attribute within the associated
  resource(s). Only appropriate for problems that apply to a single resource or
  type of resource.

Additional members **MAY** be specified within error objects.

Implementors **MAY** choose to use an alternative media type for errors.

## PATCH Support <a href="#patch" id="patch" class="headerlink"></a>

JSON API servers **MAY** opt to support HTTP `PATCH` requests that conform to
the JSON Patch format [[RFC6902](http://tools.ietf.org/html/rfc6902)]. There are
JSON Patch equivalant operations for the operations described above that use
`POST`, `PUT` and `DELETE`. From here on, JSON Patch operations sent in a
`PATCH` request will be referred to simply as "`PATCH` operations".

`PATCH` requests **MUST** specify a `Content-Type` header of `application/json-patch+json`.

`PATCH` operations **MUST** be sent as an array to conform with the JSON Patch
format. A server **MAY** limit the type, order and count of operations allowed
in this top level array.

### Request URLs <a href="#patch-urls" id="patch-urls" class="headerlink"></a>

The URL for each `PATCH` request **SHOULD** map to the resource(s) or
relationship(s) to be updated.

Every `"path"` within a `PATCH` operation **SHOULD** be relative to the request
URL. The request URL and the `PATCH` operation's `"path"` are complementary and
combine to target a particular resource, collection, attribute, or relationship.

`PATCH` operations **MAY** be allowed at the root URL of an API. In this case,
every `"path"` within a `PATCH` operation **MUST** include the full resource
URL. This allows for general "fire hose" updates to any resource represented by
an API. As stated above, a server **MAY** limit the type, order and count of
bulk operations.

### Creating a Resource with PATCH <a href="#patch-creating" id="patch-creating" class="headerlink"></a>

To create a resource, perform an `"add"` operation with a `"path"` that points
to the end of its corresponding resource collection (`"/-"`). The `"value"`
should contain a resource object.

For instance, a new photo might be created with the following request:

```text
PATCH /photos
Content-Type: application/json-patch+json
Accept: application/json

[
  {
    "op": "add",
    "path": "/-",
    "value": {
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    }
  }
]
```

### Updating Attributes with PATCH <a href="#patch-updating-attributes" id="patch-updating-attributes" class="headerlink"></a>

To update an attribute, perform a `"replace"` operation with the attribute's
name specified as the `"path"`.

For instance, the following request should update just the `src` property of the
photo at `/photos/1`:

```text
PATCH /photos/1
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "/src", "value": "http://example.com/hamster.png" }
]
```

### Updating Relationships with PATCH <a href="#patch-updating-relationships" id="patch-updating-relationships" class="headerlink"></a>

To update a relationship, send an appropriate `PATCH` operation to the
corresponding relationship's URL.

A server **MAY** also support updates at a higher level, such as the resource's
URL (or even the API's root URL). As discussed above, the request URL and each
operation's `"path"` must be complementary and combine to target a particular
relationship's URL.

#### Updating To-One Relationships with PATCH <a href="#patch-updating-to-one-relationships" id="patch-updating-to-one-relationships" class="headerlink"></a>

To update a to-one relationship, perform a `"replace"` operation with a URL and
`"path"` that targets the relationship. The `"value"` should be an individual
resource representation.

For instance, the following request should update the `author` of an article:

```text
PATCH /article/1/links/author
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "", "value": "1" }
]
```

To remove a to-one relationship, perform a `remove` operation on the
relationship. For example:

```text
PATCH /article/1/links/author
Content-Type: application/json-patch+json

[
  { "op": "remove", "path": "" }
]
```

#### Updating To-Many Relationships with PATCH <a href="#patch-updating-to-many-relationships" id="patch-updating-to-many-relationships" class="headerlink"></a>

While to-many relationships are represented as a JSON array in a `GET` response,
they are updated as if they were a set.

To add an element to a to-many relationship, perform an `"add"` operation that
targets the relationship's URL. Because the operation is targeting the end of a
collection, the `"path"` must end with `"/-"`. The `"value"` should be a
representation of an individual resource or collection of resources.

For example, consider the following `GET` request:

```text
GET /photos/1
Content-Type: application/vnd.api+json

{
  "links": {
    "photos.comments": "http://example.com/comments/{photos.comments}"
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

You could move comment 30 to this photo by issuing an `add` operation in the
`PATCH` request:

```text
PATCH /photos/1/links/comments
Content-Type: application/json-patch+json

[
  { "op": "add", "path": "/-", "value": "30" }
]
```

To remove a to-many relationship, perform a `"remove"` operation that targets
the relationship's URL. Because the operation is targeting a member of a
collection, the `"path"` **MUST** end with `"/<id>"`.

For example, to remove comment 5 from this photo, issue this `"remove"`
operation:

```text
PATCH /photos/1/links/comments
Content-Type: application/json-patch+json

[
  { "op": "remove", "path": "/5" }
]
```

### Deleting a Resource with PATCH <a href="#patch-deleting" id="patch-deleting" class="headerlink"></a>

To delete a resource, perform an `"remove"` operation with a URL and `"path"`
that targets the resource.

For instance, photo 1 might be deleted with the following request:

```text
PATCH /photos/1
Content-Type: application/json-patch+json
Accept: application/vnd.api+json

[
  { "op": "remove", "path": "" }
]
```

### Responses <a href="#patch-responses" id="patch-responses" class="headerlink"></a>

#### 204 No Content <a href="#patch-responses-204" id="patch-responses-204" class="headerlink"></a>

A server **MUST** return a `204 No Content` status code in response to a
successful `PATCH` request in which the client's current attributes remain up to
date.

#### 200 OK <a href="#patch-responses-200" id="patch-responses-200" class="headerlink"></a>

If a server accepts an update but also changes the resource(s) in other ways
than those specified by the request (for example, updating the `updatedAt`
attribute or a computed `sha`), it **MUST** return a `200 OK` response as well
as a representation of the updated resources.

The server **MUST** specify a `Content-Type` header of `application/json`. The
body of the response **MUST** contain an array of JSON objects, each of which
**MUST** conform to the JSON API media type (`application/vnd.api+json`).
Response objects in this array **MUST** be in sequential order and correspond to
the operations in the request document.

For instance, a request may create two photos in separate operations:

```text
PATCH /photos
Content-Type: application/json-patch+json
Accept: application/json

[
  {
    "op": "add",
    "path": "/-",
    "value": {
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    }
  },
  {
    "op": "add",
    "path": "/-",
    "value": {
      "title": "Mustaches on a Stick",
      "src": "http://example.com/images/mustaches.png"
    }
  }
]
```

The response would then include corresponding JSON API documents contained
within an array:

```text
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "photos": [{
      "id": "123",
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    }]
  }, {
    "photos": [{
      "id": "124",
      "title": "Mustaches on a Stick",
      "src": "http://example.com/images/mustaches.png"
    }]
  }
]
```

#### Other Responses <a href="#patch-responses-other" id="patch-responses-other" class="headerlink"></a>

When a server encounters one or more problems while processing a `PATCH`
request, it **SHOULD** specify the most appropriate HTTP error code in the
response. Clients **MUST** interpret those errors in accordance with HTTP
semantics.

A server **MAY** choose to stop processing `PATCH` operations as soon as the
first problem is encountered, or it **MAY** continue processing operations and
encounter multiple problems. For instance, a server might process multiple
attribute updates and then return multiple validation problems in a single
response.

When a server encounters multiple problems from a single request, the most
generally applicable HTTP error code should be specified in the response. For
instance, `400 Bad Request` might be appropriate for multiple 4xx errors or `500
Internal Server Error` might be appropriate for multiple 5xx errors.

A server **MAY** return error objects that correspond to each operation. The
server **MUST** specify a `Content-Type` header of `application/json` and the
body of the response **MUST** contain an array of JSON objects, each of which
**MUST** conform to the JSON API media type (`application/vnd.api+json`).
Response objects in this array **MUST** be in sequential order and correspond to
the operations in the request document. Each response object **SHOULD** contain
only error objects, since no operations can be completed successfully when any
errors occur. Error codes for each specific operation **SHOULD** be returned in
the `"status"` member of each error object.

## HTTP Caching <a href="#http-caching" id="http-caching" class="headerlink"></a>

Servers **MAY** use HTTP caching headers (`ETag`, `Last-Modified`) in accordance
with the semantics described in HTTP 1.1.
