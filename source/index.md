---
title: JSON API
---

# JSON API

See also [JSON API Updating](/write).

## NOTE

_This document is a work in progress, and will likely change over the
next month as implementation work progresses. It is currently missing
some details about the `meta` attribute and could be more precise about
details of working with relationships._

_Please feel free to help flesh it out or if you try to write an
implementation, tell us where things were ambiguous._

## History

JSON API is extracted from the JSON transport implicitly defined by
Ember Data's REST adapter.

In general, Ember Data's goal is to eliminate the need for ad-hoc code
per application to communicate with servers that communicate in a
well-defined way.

Some servers, like Firebase, Parse and CouchDB already define strict
communication protocols for clients, and were good fits for Ember Data.
In contrast, servers written in Rails, Node, and Django tend to be
written in a "REST-style" but lack the precision necessary for drop-in
client code.

The REST Adapter in Ember Data implicitly defined a protocol that
custom servers could implement to get a drop-in client for all of their
resources. [ActiveModel::Serializers][1] is a proof-of-concept library
for Rails that implemented the serialization format expected by Ember
Data.

[1]: https://github.com/rails-api/active_model_serializers

Record creation, update, and deletion was defined implicitly by the
Ember Data library and was close to conventions already in wide use by
Rails, Django and Node developers.

The goals of the protocols defined by the Ember Data REST Adapter and
JSON API are to balance:

* A generic protocol that can work across a broad set of use cases,
  including the generally used relationship types
* Similarity to existing server-side framework practices (and human
  readability for debugging)
* Ease of implementation on the server side 
* Ease of implementation on the client side

This protocol is still a work in progress, and we are extremely open to
feedback and proposals for improvement. That said, implementation work
has already begun, and we value good working systems over perfect
vaporware.

## Protocol Improvements

JSON API is an attempt to extract and formalize a protocol that has
worked well for us, and to simplify areas that hid implicit requirements
tied to the specific implementations Ember Data users were working with.

In particular:

* JSON API defines a URL-based style that allows servers to provide URLs
  and URL templates to supplement Ember Data's inflector-based approach.
  This allows servers to be explicit about where to find related
  documents instead of having to ensure that their documents were
  located in a conventional place.
* JSON API differentiates between attributes and relationships, using a
  `rels` key to group a document's relationships.
* JSON API makes heavy use of the `PATCH` verb and [JSON Patch][2]
  specification, which provides a unified way to modify the attributes
  and relationships of a document, without requiring that the entire
  document be updated at once. This helps to solve some thorny issues
  with relationships that the original proof-of-concept protocol had
  a lot of trouble with.
* JSON API defines precise semantics for compound documents and
  responses from `POST`, `PATCH`, and `DELETE`, while the original
  protocol had subtle differences in different parts of the
  implementation.

[2]: http://tools.ietf.org/html/rfc6902 

## Abstract

There are two JSON API styles:

* [The ID Style](#toc_id-based-json-api)
* [The URL Style](#toc_url-based-json-api)

The ID style is the easiest to get started with, but requires that your
clients be able to guess the URLs for related documents. It also locks
your API into a particular URL structure, which may become a problem as
your API grows.

The URL style requires less guessing on the client side, and makes
clients more resilient to API changes, but is trickier to use with
relationships and compound documents.

In general, you should be able to start with an ID-based JSON API and
upgrade to a URL-based API, if you want more control over the precise
URLs used for a resource.

## Document

In this specification, the term "document" refers to a single object with a set of attributes and relationships.

A JSON response may include multiple documents, as described below.

## Reserved Attributes

There are three reserved attribute names in JSON API:

* `id`
* `href`
* `rels`

Each of these names has a special meaning when included in the
attributes section and should not be used as attribute names.

## ID-Based JSON API

### Top Level

The top-level of a JSON API document **MAY** have the following keys:

* `meta`: meta-information about a resource, such as pagination
* Other resource names (`posts`, `comments`, `people`, etc.) 

### Singular Resources

If the value of a resource key is a JSON object, the value represents a single document.

```javascript
{
  "posts": {
    // an individual post document
  }
}
```

The document **MUST** contain an `id` key. 

### Resource Collections

If the value of a resource key is a JSON array, the value represents a list of documents.

```js
{
  "posts": [{
    // an individual post document
  }, {
    // an individual post document
  }]
}
```

Each document in the list **MUST** contain an `id` key.

### IDs

The `"id"` key in a document represents a unique identifier for the document, scoped to the document's type. The type scope is implicit, and hardcoded into clients of the API.

### Attributes

Other than the `"rels"` and `"id"` keys, every key in a document represents an attribute. An attribute's value may be any JSON value.

```js
{
  "posts": {
    "id": "1",
    "title": "Rails is Omakase"
  }
}
```

### Relationships

The value of the `"rels"` key is a JSON object that represents related documents.

```js
{
  "posts": {
    "id": "1",
    "title": "Rails is Omakase",
    "rels": {
      "author": 9,
      "comments": [ 5, 12, 17, 20 ]
    }
  }
}
```

#### To-Many Relationships

A to-many relationship is represented as a JSON array of IDs.

```js
{
  "posts": {
    "id": "1",
    "title": "Rails is Omakase",
    "rels": {
      "comments": [ 5, 12, 17, 20 ]
    }
  }
}
```

An API that provides a to-many relationship as an array of IDs **MUST** respond to a `GET` request with a list of the specified documents with a URL formed by joining:

* A base URL that represents the type of the related resource (this must be hardcoded in the client)
* `?ids=`
* A comma-separated list of the specified IDs

In the above example, a `GET` request to `/comments?ids=5,12,17,20` returns a document containing the four specified comments.

#### To-One Relationships

A to-one relationship is represented as a single string or number value.

```js
{
  "posts": {
    "id": "1",
    "title": "Rails is Omakase",
    "rels": {
      "author": 17
    }
  }
}
```

An API that provides a to-one relationship as an ID **MUST** respond to a `GET` request with the specified document with a URL formed by joining:

* A base URL that represents the type of the related resource (this must be hardcoded in the client)
* `/`
* The specified ID

In the above example, a `GET` request to `/people/17` returns a document containing the specified author.

### Compound Documents

To save HTTP requests, it may be convenient to send related documents along with the requested documents.

```js
{
  "posts": {
    "id": "1",
    "title": "Rails is Omakase",
    "rels": {
      "author": 9
    }
  },
  "people": [{
    "id": "9",
    "name": "@d2h"
  }]
}
```

The related documents are provided as an additional top-level document or document list whose key is a name that represents the document type.

The linkage between the key under `"rels"` and the top-level keys is hardcoded into the client.

## URL-Based JSON API

In the above description of ID-based JSON, there were several places where information about the location of related resources needed to be hardcoded into the client.

The goal of the URL-Based JSON API is to eliminate the need for those specific instances of hardcoded information.

### Top Level

The top-level of a JSON API document **MAY** have the following keys:

* `meta`: meta-information about a resource, such as pagination
* `rels`: in compound resources, information about relationships that would otherwise need to be repeated
* Other resource names (`posts`, `comments`, `people`, etc.) 

### Singular Resources

If the value of a resource key is a JSON object, the value represents a single document.

```js
{
  "posts": {
    // an individual post document
  }
}
```

The document **MAY** contain an `id` key. 

### Resource Collections

If the value of a resource key is a JSON array, the value represents a list of documents.

```js
{
  "posts": [{
    // an individual post document
  }, {
    // an individual post document
  }]
}
```

Each document in the list **MAY** contain an `id` key.

### IDs

The `"id"` key in a document represents a unique identifier for the document, scoped to the document's type. It can be used with URL templates to fetch related records, as described below.

### Attributes

Other than the `"rels"` and `"id"` keys, every key in a document represents an attribute. An attribute's value may be any JSON value.

```js
{
  "posts": {
    "id": "1",
    "title": "Rails is Omakase"
  }
}
```

### Relationships

The value of the `"rels"` key is a JSON object that represents related documents.

```js
{
  "posts": {
    "id": "1",
    "title": "Rails is Omakase",
    "rels": {
      "author": "http://example.com/people/1",
      "comments": "http://example.com/comments/5,12,17,20"
    }
  }
}
```

#### To-Many Relationships

A to-many relationship is a string value that represents a URL.

```js
{
  "posts": {
    "id": "1",
    "title": "Rails is Omakase",
    "rels": {
      "comments": "http://example.com/posts/1/comments"
    }
  }
}
```

An API that provides a to-many relationship as a URL **MUST** respond to a `GET` request with a list of the specified documents with the specified URL.

In the above example, a `GET` request to `/posts/1/comments` returns a document containing the four specified comments.

#### To-One Relationships

A to-one relationship is represented as a string value that represents a URL.

```js
{
  "posts": {
    "id": "1",
    "title": "Rails is Omakase",
    "rels": {
      "author": "http://example.com/people/17"
    }
  }
}
```

An API that provides a to-one relationship as an ID **MUST** respond to a `GET` request with the specified document with the specified URL.

In the above example, a `GET` request to `/people/17` returns a document containing the specified author.

### URL Template Shorthands

When returning a list of documents from a response, a top-level `"rels"` object can specify a URL template that should be used for all documents.

Example:

```js
{
  "rels": {
    "posts.comments": "http://example.com/posts/{post.id}/comments"
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

In this example, fetching `/posts/1/comments` will fetch the comments for `"Rails is Omakase"` and fetching `/posts/2/comments` will fetch the comments for `"The Parley Letter"`.

```js
{
  "rels": {
    "posts.comments": "http://example.com/comments/{posts.comments}"
  },
  "posts": {
    "id": "1",
    "title": "Rails is Omakase",
    "rels": {
      "comments": [ "1", "2", "3", "4" ]
    }
  }
}
```

In this example, the `posts.comments` variable is expanded by
"exploding" the array specified in the `"rels"` section of each post.
The [URL template specification][3] specifies that the default explosion is to join the array members by a comma, so in this example, fetching `/comments/1,2,3,4` will return a list of all comments.

[3]: https://tools.ietf.org/html/rfc6570

This example shows how you can start with a list of IDs and then upgrade to specifying a different URL pattern than the default.

The top-level `"rels"` key has the following behavior:

* Each key is a dot-separated path that points at a repeated relationship. For example `"posts.comments"` points at the `"comments"` relationship in each repeated document under `"posts"`.
* The value of each key is interpreted as a URL template.
* For each document that the path points to, act as if it specified a relationship formed by expanding the URL template with the non-URL value actually specified.

Here is another example that uses a has-one relationship:

```js
{
  "rels": {
    "posts.author": "http://example.com/people/{posts.author}"
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "rels": {
      "author": 12
    }
  }, {
    "id": "2",
    "title": "The Parley Letter",
    "rels": {
      "author": 12
    }
  }, {
    "id": "3",
    "title": "Dependency Injection is Not a Virtue",
    "rels": {
      "author": 12
    }
  }]
}
```

In this example, the author URL for all three posts is `/people/12`.

Top-level URL templates allow you to specify relationships as IDs, but without requiring that clients hard-code information about how to form the URLs. 

### Compound Documents

To save HTTP requests, it may be convenient to send related documents along with the requested documents.

In this case, a bit of extra metadata for each relationship can link together the documents.

```js
{
  "rels": {
    "posts.author": {
      "href": "http://example.com/people/{post.author}",
      "type": "people"
    },
    "posts.comments": {
      "href": "http://example.com/comments/{post.comments}",
      "type": "comments"
    }
  }
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "rels": {
      "author": 9,
      "comments": [ 1, 2, 3 ]
   }, {
    "id": "2",
    "title": "The Parley Letter",
    "rels": {
      "author": 9,
      "comments": [ 4, 5 ]
   }, {
    "id": "1",
    "title": "Dependency Injection is Not a Virtue",
    "rels": {
      "author": 9,
      "comments": [ 6 ]
    }
  }],
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
```

The benefit of this approach is that when the same document is referenced multiple times (in this example, the author of the three posts), it only needs to be presented a single time in the document.

By always combining documents in this way, a client can consistently extract and wire up references.

JSON API documents **MAY** specify the URL for a document in a compound
response by specifying a `"href"` key:

```js
{
  // ...
  "comments": [{
    "href": "http://example.com/comments/1",
    "id": "1",
    "body": "Mmmmmakase"
  }, {
    "href": "http://example.com/comments/2",
    "id": "2",
    "body": "I prefer unagi"
  }, {
    "href": "http://example.com/comments/3",
    "id": "3",
    "body": "What's Omakase?"
  }, {
    "href": "/comments/1",
    "id": "4",
    "body": "Parley is a discussion, especially one between enemies"
  }, {
    "href": "/comments/1",
    "id": "5",
    "body": "The parsley letter"
  }, {
    "href": "/comments/1",
    "id": "6",
    "body": "Dependency Injection is Not a Vice"
  }]
}
```

See also [JSON API Updating](/write).
