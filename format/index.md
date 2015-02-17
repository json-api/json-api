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

A document's top level **SHOULD** contain a representation of the resource or
collection of resources primarily targeted by a request (i.e. the "primary
resource(s)").

The primary resource(s) **SHOULD** be keyed either by their resource type or the
generic key `"data"`.

A document's top level **MAY** also have the following members:

* `"meta"`: meta-information about a resource, such as pagination.
* `"links"`: URL templates to be used for expanding resources' relationships
  URLs.
* `"linked"`: a collection of resource objects, grouped by type, that are linked
  to the primary resource(s) and/or each other (i.e. "linked resource(s)").

No other members should be present at the top level of a document.

### Resource Representations <a href="#document-structure-resource-representations" id="document-structure-resource-representations" class="headerlink"></a>

This section describes how resources can be represented throughout a JSON API
document. It applies to primary as well as linked resources.

#### Individual Resource Representations <a href="#document-structure-individual-resource-representations" id="document-structure-individual-resource-representations" class="headerlink"></a>

An individual resource **SHOULD** be represented as a single "resource object"
(described below) or a string value containing its ID (also described below).

The following post is represented as a resource object:

```javascript
{
  "posts": {
    "id": "1",
    // ... attributes of this post
  }
}
```

This post is represented simply by its ID:

```javascript
{
  "posts": "1"
}
```

#### Resource Collection Representations <a href="#document-structure-resource-collection-representations" id="document-structure-resource-collection-representations" class="headerlink"></a>

A collection of any number of resources **SHOULD** be represented as an array of
resource objects or IDs, or as a single "collection object" (described below).

The following posts are represented as an array of resource objects:

```javascript
{
  "posts": [{
    "id": "1"
    // ... attributes of this post
  }, {
    "id": "2"
    // ... attributes of this post
  }]
}
```

These posts are represented as an array of IDs:

```javascript
{
  "posts": ["1", "2"]
}
```

These comments are represented by a single "collection" object:

```javascript
{
  "comments": {
    "href": "http://example.com/comments/5,12,17,20",
    "ids": [ "5", "12", "17", "20" ],
    "type": "comments"
  }
}
```

### Resource Objects <a href="#document-structure-resource-objects" id="document-structure-resource-objects" class="headerlink"></a>

Resource objects have the same internal structure, regardless of whether they
represent primary or linked resources.

Here's how a post (i.e. a resource of type "posts") might appear in a document:

```javascript
{
  "posts": {
    "id": "1",
    "title": "Rails is Omakase"
  }
}
```

In the example above, the post's resource object is simply:

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase"
  }
//...
```

This section will focus exclusively on resource objects, outside of the context
of a full JSON API document.

#### Resource Attributes <a href="#document-structure-resource-object-attributes" id="document-structure-resource-object-attributes" class="headerlink"></a>

There are four reserved keys in resource objects:

* `"id"`
* `"type"`
* `"href"`
* `"links"`

Every other key in a resource object represents an "attribute". An attribute's
value may be any JSON value.

#### Resource IDs <a href="#document-structure-resource-object-ids" id="document-structure-resource-object-ids" class="headerlink"></a>

Each resource object **SHOULD** contain a unique identifier, or ID, when
available. IDs **MAY** be assigned by the server or by the client, as described
below, and **SHOULD** be unique for a resource when scoped by its type. An ID
**SHOULD** be represented by an `"id"` key and its value **MUST** be a string
which **SHOULD** only contain alphanumeric characters, dashes and underscores.

IDs can be used with URL templates to fetch related resources, as described
below.

In scenarios where uniquely identifying information between client and server
is unnecessary (e.g. read-only, transient entities), JSON API allows for
omitting IDs.

#### Resource Types <a href="#document-structure-resource-types" id="document-structure-resource-types" class="headerlink"></a>

The type of each resource object can usually be determined from the context in
which it is contained. As discussed above, resource objects are typically keyed
by their type in a document.

Each resource object **MAY** contain a `"type"` key to explicitly designate its
type.

The `"type"` key is **REQUIRED** when the type of a resource is not otherwise
specified in a document.

#### Resource URLs <a href="#document-structure-resource-urls" id="document-structure-resource-urls" class="headerlink"></a>

The URL of each resource object **MAY** be specified with the `"href"` key.
Resource URLs **SHOULD** only be specified by the server and therefore are
typically only included in response documents.

```javascript
//...
  [{
    "id": "1",
    "href": "http://example.com/comments/1",
    "body": "Mmmmmakase"
  }, {
    "id": "2",
    "href": "http://example.com/comments/2",
    "body": "I prefer unagi"
  }]
//...
```

A server **MUST** respond to a `GET` request to the specified URL with a
response that includes the resource.

It is generally more efficient to specify URL templates at the root level of a
response document rather than to specify individual URLs per resource.

#### Resource Relationships <a href="#document-structure-resource-relationships" id="document-structure-resource-relationships" class="headerlink"></a>

The value of the `"links"` key is a JSON object that represents linked
resources, keyed by the name of each association.

For example, the following post is associated with a single `author` and a
collection of `comments`:

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "9",
      "comments": [ "5", "12", "17", "20" ]
    }
  }
//...
```

##### To-One Relationships <a href="#document-structure-resource-relationships-to-one" id="document-structure-resource-relationships-to-one" class="headerlink"></a>

To-one relationships **MUST** be represented with one of the formats for
individual resources described above.

For example, the following post is associated with a single author, identified
by ID:

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "17"
    }
  }
//...
```

And here's an example of a linked author represented as a resource object:

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": {
        "href": "http://example.com/people/17",
        "id": "17",
        "type": "people"
      }
    }
  }
//...
```

A blank has-one relationship **SHOULD** be represented with a `null` value. For
example, the following post has no author:

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": null
    }
  }
//...
```

##### To-Many Relationships <a href="#document-structure-resource-relationships-to-many" id="document-structure-resource-relationships-to-many" class="headerlink"></a>

To-many relationships **MUST** be represented with one of the formats for
resource collections described above.

For example, the following post is associated with several comments, identified
by their IDs:

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": [ "5", "12", "17", "20" ]
    }
  }
//...
```

And here's an example of an array of comments linked as a collection object:

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": {
        "href": "http://example.com/comments/5,12,17,20",
        "ids": [ "5", "12", "17", "20" ],
        "type": "comments"
      }
    }
  }
//...
```

A blank has-many relationship **SHOULD** be represented with an empty array
value. For example, the following post has no comments:

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": []
    }
  }
//...
```

### Collection Objects <a href="#document-structure-collection-objects" id="document-structure-collection-objects" class="headerlink"></a>

A "collection object" contains one or more of the members:

* `"ids"` - an array of IDs for the referenced resources.
* `"type"` - the resource type.
* `"href"` - the URL of the referenced resources (applicable to response
  documents).

A server that provides a collection object that contains an `"href"` **MUST**
respond to a `GET` request to the specified URL with a response that includes
the referenced objects as a collection of resource objects.


### URL Templates <a href="#document-structure-url-templates" id="document-structure-url-templates" class="headerlink"></a>

A top-level `"links"` object **MAY** be used to specify URL templates that can
be used to formulate URLs for resources according to their type.

For example:

```javascript
{
  "links": {
    "posts.comments": "http://example.com/comments?posts={posts.id}"
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase"
  }, {
    "id": "2",
    "title": "The Parley Letter"
  }]
}
```

In this example, fetching `http://example.com/comments?posts=1` will fetch the
comments for `"Rails is Omakase"` and fetching
`http://example.com/comments?posts=2` will fetch the comments for `"The Parley
Letter"`.

Here's another example:

```javascript
{
  "links": {
    "posts.comments": "http://example.com/comments/{posts.comments}"
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": [ "1", "2", "3", "4" ]
    }
  }]
}
```

In this example, the `posts.comments` variable is expanded by "exploding" the
array specified in the `"links"` section of each post. The URI template
specification [[RFC6570](https://tools.ietf.org/html/rfc6570)] specifies that
the default explosion is to percent encode the array members (e.g. via
`encodeURIComponent()` in JavaScript) and join them by a comma. In this example,
fetching `http://example.com/comments/1,2,3,4` will return a list of all
comments.

The top-level `"links"` object has the following behavior:

* Each key is a dot-separated path that points at a repeated relationship. Paths
  start with a particular resource type and can traverse related resources. For
  example `"posts.comments"` points at the `"comments"` relationship in each
  resource of type `"posts"`.
* The value of each key is interpreted as a URL template.
* For each resource that the path points to, act as if it specified a
  relationship formed by expanding the URL template with the non-URL value
  actually specified.

Here is another example that uses a has-one relationship:

```javascript
{
  "links": {
    "posts.author": "http://example.com/people/{posts.author}"
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "12"
    }
  }, {
    "id": "2",
    "title": "The Parley Letter",
    "links": {
      "author": "12"
    }
  }, {
    "id": "3",
    "title": "Dependency Injection is Not a Virtue",
    "links": {
      "author": "12"
    }
  }]
}
```

In this example, the URL for the author of all three posts is
`http://example.com/people/12`.

Top-level URL templates allow you to specify relationships as IDs, but without
requiring that clients hard-code information about how to form the URLs.

NOTE: In case of conflict, an individual resource object's `links` object will
take precedence over a top-level `links` object.

### Compound Documents <a href="#document-structure-compound-documents" id="document-structure-compound-documents" class="headerlink"></a>

To reduce the number of HTTP requests, responses may optionally allow for the inclusion of
linked resources along with the requested primary resources. Such response
documents are called "compound documents".

In a compound document, linked resources **MUST** be included as resource
objects in a top level `"linked"` object, in which they are grouped together in
arrays according to their type.

The type of each relationship **MAY** be specified in a resource-level or top-
level `"links"` object with the `"type"` key. This facilitates lookups of linked
resource objects by the client.

```javascript
{
  "links": {
    "posts.author": {
      "href": "http://example.com/people/{posts.author}",
      "type": "people"
    },
    "posts.comments": {
      "href": "http://example.com/comments/{posts.comments}",
      "type": "comments"
    }
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "9",
      "comments": [ "1", "2", "3" ]
    }}, {
    "id": "2",
    "title": "The Parley Letter",
    "links": {
      "author": "9",
      "comments": [ "4", "5" ]
   }}, {
    "id": "3",
    "title": "Dependency Injection is Not a Virtue",
    "links": {
      "author": "9",
      "comments": [ "6" ]
    }
  }],
  "linked": {
    "people": [{
      "id": "9",
      "name": "@d2h"
    }],
    "comments": [{
      "id": "1",
      "body": "Mmmmmakase"
    }, {
      "id": "2",
      "body": "I prefer unagi"
    }, {
      "id": "3",
      "body": "What's Omakase?"
    }, {
      "id": "4",
      "body": "Parley is a discussion, especially one between enemies"
    }, {
      "id": "5",
      "body": "The parsley letter"
    }, {
      "id": "6",
      "body": "Dependency Injection is Not a Vice"
    }]
  }
}
```

This approach ensures that a single canonical representation of each document is
returned with each response, even when the same document is referenced multiple
times (in this example, the author of the three posts). Along these lines, if a
primary document is linked to another primary or linked document, it should not
be duplicated within the `"linked"` object.


## URLs <a href="#urls" id="urls" class="headerlink"></a>

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

For example, a collection of resources of type "photos" will have the URL:

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
request to the URL described above.

Responses can be further refined with the optional features described below.

### Filtering <a href="#fetching-filtering" id="fetching-filtering" class="headerlink"></a>

A server **MAY** choose to support requests to filter resources according to
specific criteria.

Filtering **SHOULD** be supported by appending parameters to the base URL for
the collection of resources to be filtered.

For example, the following is a request for all comments associated with a
particular post:

```text
GET /comments?post=1
```

With this approach, multiple filters **MAY** be applied to a single request:

```text
GET /comments?post=1&author=12
```

This specification only supports filtering based upon strict matching.
Additional filtering allowed by an API should be specified in its profile (see
[Extending](/extending)).

### Inclusion of Linked Resources <a href="#fetching-includes" id="fetching-includes" class="headerlink"></a>

A server **MAY** choose to support returning compound documents that include
both primary and linked resource objects.

An endpoint **MAY** return resources linked to the primary resource(s) by
default.

An endpoint **MAY** also support custom inclusion of linked resources based upon
an `include` request parameter. This parameter should specify the path to one or
more resources relative to the primary resource. If this parameter is used,
**ONLY** the requested linked resources should be returned alongside the primary
resource(s).

For instance, comments could be requested with a post:

```text
GET /posts/1?include=comments
```

In order to request resources linked to other resources, the dot-separated path
of each relationship should be specified:

```text
GET /posts/1?include=comments.author
```

Note: a request for `comments.author` should not automatically also include
`comments` in the response (although comments will obviously need to be queried
in order to fulfill the request for their authors).

Multiple linked resources could be requested in a comma-separated list:

```text
GET /posts/1?include=author,comments,comments.author
```

### Sparse Fieldsets <a href="#fetching-sparse-fieldsets" id="fetching-sparse-fieldsets" class="headerlink"></a>

A server **MAY** choose to support requests to return only specific fields in
resource object.

An endpoint **MAY** support requests that specify fields for the primary
resource type with a `fields` parameter.

```text
GET /people?fields=id,name,age
```

An endpoint **MAY** support requests that specify fields for any resource type
with a `fields[TYPE]` parameter.

```text
GET /posts?include=author&fields[posts]=id,title&fields[people]=id,name
```

An endpoint **SHOULD** return a default set of fields in a resource object if no
fields have been specified for its type, or if the endpoint does not support use
of either `fields` or `fields[TYPE]`.

An endpoint **MAY** also choose to always return a limited set of
non-specified fields, such as `id` or `href`.

Note: `fields` and `fields[TYPE]` can not be mixed. If the latter format is
used, then it must be used for the primary resource type as well.

### Sorting <a href="#fetching-sorting" id="fetching-sorting" class="headerlink"></a>

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

A server **MAY** allow resources that can be fetched to also be created,
modified and deleted.

A server **MAY** allow multiple resources to be updated in a single request, as
discussed below. Updates to multiple resources **MUST** completely succeed or
fail. No partial updates are allowed.

Any requests that contain content **MUST** include a `Content-Type` header whose
value is `application/vnd.api+json`.

### Creating Resources <a href="#crud-creating-resources" id="crud-creating-resources" class="headerlink"></a>

A server that supports creating resources **MUST** support creating individual
resources and **MAY** optionally support creating multiple resources in a single
request.

One or more resources can be *created* by making a `POST` request to the URL
that represents a collection of resources to which the new resource should
belong.

#### Creating an Individual Resource <a href="#crud-creating-individual-resources" id="crud-creating-individual-resources" class="headerlink"></a>

A request to create an individual resource **MUST** include a single primary
resource object.

For instance, a new photo might be created with the following request:

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "photos": {
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

#### Creating Multiple Resources <a href="#crud-creating-multiple-resources" id="crud-creating-multiple-resources" class="headerlink"></a>

A request to create multiple resources **MUST** include a collection of primary
resource objects.

For instance, multiple photos might be created with the following request:

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "photos": [{
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }, {
    "title": "Mustaches on a Stick",
    "src": "http://example.com/images/mustaches.png"
  }]
}
```

#### Responses <a href="#crud-creating-responses" id="crud-creating-responses" class="headerlink"></a>

##### 201 Created <a href="#crud-creating-responses-201" id="crud-creating-responses-201" class="headerlink"></a>

A server **MUST** respond to a successful resource creation request according to
[`HTTP semantics`](http://tools.ietf.org/html/draft-ietf-httpbis-p2-semantics-22#section-6.3).

When one or more resources has been created, the server **MUST** return a `201
Created` status code.

The response **MUST** include a `Location` header identifying the location of
_all_ resources created by the request.

If a single resource is created and that resource's object includes an `href`
key, the `Location` URL **MUST** match the `href` value.

The response **SHOULD** also include a document that contains the primary
resource(s) created. If absent, the client **SHOULD** treat the transmitted
document as accepted without modification.

```text
HTTP/1.1 201 Created
Location: http://example.com/photos/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/vnd.api+json

{
  "photos": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "href": "http://example.com/photos/550e8400-e29b-41d4-a716-446655440000",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

##### Other Responses <a href="#crud-creating-responses-other" id="crud-creating-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error details
**MAY** also be returned, as discussed below.

#### Client-Generated IDs <a href="#crud-creating-client-ids" id="crud-creating-client-ids" class="headerlink"></a>

A server **MAY** accept client-generated IDs along with requests to create one
or more resources. IDs **MUST** be specified with an `"id"` key, the value of
which **MUST** be a properly generated and formatted *UUID*.

For example:

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "photos": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

### Updating Resources <a href="#crud-updating" id="crud-updating" class="headerlink"></a>

A server that supports updating resources **MUST** support updating individual
resources and **MAY** optionally support updating multiple resources in a single
request.

Resources can be updated by making a `PUT` request to the URL that represents
either the individual or multiple individual resources.

#### Updating an Individual Resource <a href="#crud-updating-individual-resources" id="crud-updating-individual-resources" class="headerlink"></a>

To update an individual resource, send a `PUT` request to the URL that
represents the resource. The request **MUST** include a single top-level
resource object.

For example:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "articles": {
    "id": "1",
    "title": "To TDD or Not"
  }
}
```

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

#### Updating Attributes <a href="#crud-updating-attributes" id="crud-updating-attributes" class="headerlink"></a>

To update one or more attributes of a resource, the primary resource object
should include only the attributes to be updated. Attributes omitted from the
resource object should not be updated.

For example, the following `PUT` request will only update the `title` and `text`
attributes of an article:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "articles": {
    "id": "1",
    "title": "To TDD or Not",
    "text": "TLDR; It's complicated... but check your test coverage regardless."
  }
}
```

#### Updating Relationships <a href="#crud-updating-relationships" id="crud-updating-relationships" class="headerlink"></a>

##### Updating To-One Relationships <a href="#crud-updating-to-one-relationships" id="crud-updating-to-one-relationships" class="headerlink"></a>

To-one relationships **MAY** be updated along with other attributes by including
them in a `links` object within the resource object in a `PUT` request.

For instance, the following `PUT` request will update the `title` attribute and
`author` relationship of an article:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "articles": {
    "title": "Rails is a Melting Pot",
    "links": {
      "author": "1"
    }
  }
}
```

In order to remove a to-one relationship, specify `null` as the value of the
relationship.

Alternatively, a to-one relationship **MAY** be accessible at its relationship
URL (see above).

A `PUT` request sent to the URL of a relationship **SHOULD** update the
relationship. For example:

```text
PUT /articles/1/links/author
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "people": "12"
}
```

A `PUT` request **SHOULD** succeed regardless of whether a relationship is
currently defined.

A to-one relationship **MAY** alternatively be added by sending a `POST`
request with an individual primary resource to the URL of the relationship.
For example:

```text
POST /articles/1/links/author
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "people": "12"
}
```

A `POST` request should only succeed if no relationship is currently defined.

A to-one relationship **MAY** be removed by sending a `DELETE` request to
the URL of the relationship. For example:

```text
DELETE /articles/1/links/author
```

A `DELETE` request should only succeed if the relationship is currently defined.

##### Updating To-Many Relationships <a href="#crud-updating-to-many-relationships" id="crud-updating-to-many-relationships" class="headerlink"></a>

To-many relationships **MAY** optionally be updated with other attributes by
including them in a `links` object within the document in a `PUT` request.

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
      "tags": ["2", "3"]
    }
  }
}
```

In order to remove every member of a to-many relationship, specify an empty
array (`[]`) as the value of the relationship.

Alternatively, a to-many relationship **MAY** optionally be accessible at its
relationship URL (see above).

A `PUT` request sent to the URL of a relationship **SHOULD** completely replace
every member of the relationship. For example:

```text
PUT /articles/1/links/tags
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "tags": ["2", "3"]
}
```

Replacing a complete set of data is not always appropriate in a distributed
system which may involve many editors. An alternative is to allow relationships
to be added and removed individually. This can be done by making fine-grained
requests to the relationship URL.

A to-many relationship **MAY** be added by sending a `POST` request with a
single resource ID to the URL of the relationship. For example:

```text
POST /articles/1/links/comments
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "comments": "1"
}
```

More than one relationship **MAY** be added by sending an array of resource IDs.
For example:

```text
POST /articles/1/links/comments
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "comments": ["1", "2"]
}
```

To-many relationships **MAY** be deleted individually by sending a `DELETE`
request to the URL of the relationship:

```text
DELETE /articles/1/links/tags/1
```

Multiple to-many relationships **MAY** be deleted by sending a `DELETE` request
to the URL of the relationships:

```text
DELETE /articles/1/links/tags/1,2
```

### Responses <a href="#crud-updating-responses" id="crud-updating-responses" class="headerlink"></a>

#### 204 No Content <a href="#crud-updating-responses-204" id="crud-updating-responses-204" class="headerlink"></a>

A server **SHOULD** return a `204 No Content` status code if an update is
successful and the client's current attributes remain up to date. This applies
to `PUT` requests as well as `POST` and `DELETE` requests that modify links
without affecting other attributes of a resource.

#### 200 OK <a href="#crud-updating-responses-200" id="crud-updating-responses-200" class="headerlink"></a>

If a server accepts an update but also changes the resource(s) in other ways
than those specified by the request (for example, updating the `updatedAt`
attribute or a computed `sha`), it **SHOULD** return a `200 OK` response.

The response document for a `200 OK` **MUST** include a representation of
the updated resource(s) as if a `GET` request was made to the request URL.

#### 404 Not Found

A server should return `404 Not Found` when processing a request to modify or
delete a resource or relationship that does not exist.

#### 409 Conflict

A server should return `409 Conflict` when processing a `POST` request to create
a resource or relationship that already exists.

#### Other Responses <a href="#crud-updating-responses-other" id="crud-updating-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error details
**MAY** also be returned, as discussed below.

### Deleting Resources <a href="#crud-deleting" id="crud-deleting" class="headerlink"></a>

An individual resource can be *deleted* by making a `DELETE` request to the
resource's URL:

```text
DELETE /photos/1
```

A server **MAY** optionally allow multiple resources to be *deleted* with a
`DELETE` request to their URL:

```text
DELETE /photos/1,2,3
```

#### Responses <a href="#crud-deleting-responses" id="crud-deleting-responses" class="headerlink"></a>

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
