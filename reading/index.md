---
layout: page
title: "JSON API: Reading"
---

{% include status.md %}

## ID-Based JSON API

### Top Level

The top-level of a JSON API document **MAY** have the following keys:

* `meta`: meta-information about a resource, such as pagination
* Other resource names (`posts`, `comments`, `people`, etc.)

### Singular Resources

Singular resources are represented as JSON objects. However, they are still
wrapped inside an array:

```javascript
{
  "posts": [{
    // an individual post document
  }]
}
```

This simplifies processing, as you can know that a resource key will always be
a list.

The document **MUST** contain an `id` key.

### Resource Collections

If the length of an array at a resource key is greater than one, the value
represents a list of documents.

```javascript
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

Other than the `"links"` and `"id"` keys, every key in a document represents an attribute. An attribute's value may be any JSON value.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase"
  }]
}
```

### Relationships

The value of the `"links"` key is a JSON object that represents related documents.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "9",
      "comments": [ "5", "12", "17", "20" ]
    }
  }]
}
```

#### To-Many Relationships

A to-many relationship is represented as a JSON array of IDs.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": [ "5", "12", "17", "20" ]
    }
  }]
}
```

An API that provides a to-many relationship as an array of IDs **MUST** respond to a `GET` request with a list of the specified documents with a URL formed by joining:

* A base URL that represents the type of the related resource (this must be hardcoded in the client)
* `?ids=`
* A comma-separated list of the specified IDs

In the above example, a `GET` request to `/comments?ids=5,12,17,20` returns a document containing the four specified comments.

#### To-One Relationships

A to-one relationship is represented as a single string or number value.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "17"
    }
  }]
}
```

An API that provides a to-one relationship as an ID **MUST** respond to a `GET` request with the specified document with a URL formed by joining:

* A base URL that represents the type of the related resource (this must be hardcoded in the client)
* `/`
* The specified ID

In the above example, a `GET` request to `/people/17` returns a document containing the specified author.

### Compound Documents

To save HTTP requests, it may be convenient to send related documents along with the requested documents.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "9"
    }
  }],
  "people": [{
    "id": "9",
    "name": "@d2h"
  }]
}
```

The related documents are provided as an additional top-level document or document list whose key is a name that represents the document type.

The linkage between the key under `"links"` and the top-level keys is hardcoded into the client.

## URL-Based JSON API

In the above description of ID-based JSON, there were several places where information about the location of related resources needed to be hardcoded into the client.

The goal of the URL-Based JSON API is to eliminate the need for those specific instances of hardcoded information.

### Top Level

The top-level of a JSON API document **MAY** have the following keys:

* `meta`: meta-information about a resource, such as pagination
* `links`: URL templates to be used for expanding resources' relationships URLs
* Other resource names (`posts`, `comments`, `people`, etc.)

### Singular Resources

Singular resources are represented as JSON objects. However, they are still
wrapped inside an array:

```javascript
{
  "posts": [{
    // an individual post document
  }]
}
```

This simplifies processing, as you can know that a resource key will always be
a list.

The document **MAY** contain an `id` key.

### Resource Collections

If the length of an array at a resource key is greater than one, the value
represents a list of documents.

```javascript
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

Other than the `"links"` and `"id"` keys, every key in a document represents an attribute. An attribute's value may be any JSON value.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase"
  }]
}
```

### Relationships

The value of the `"links"` key is a JSON object that represents related documents.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "http://example.com/people/1",
      "comments": "http://example.com/comments/5,12,17,20"
    }
  }]
}
```

#### To-Many Relationships

A to-many relationship is a string value that represents a URL.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": "http://example.com/posts/1/comments"
    }
  }]
}
```

An API that provides a to-many relationship as a URL **MUST** respond to a `GET` request with a list of the specified documents with the specified URL.

In the above example, a `GET` request to `/posts/1/comments` returns a document containing the four specified comments.

#### To-One Relationships

A to-one relationship is represented as a string value that represents a URL.

```javascript
{
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "http://example.com/people/17"
    }
  }]
}
```

An API that provides a to-one relationship as a URL **MUST** respond to a `GET` request with the specified document with the specified URL.

In the above example, a `GET` request to `/people/17` returns a document containing the specified author.

### URL Template Shorthands

When returning a list of documents from a response, a top-level `"links"` object can specify a URL template that should be used for all documents.

Example:

```javascript
{
  "links": {
    "posts.comments": "http://example.com/posts/{posts.id}/comments"
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

In this example, the `posts.comments` variable is expanded by
"exploding" the array specified in the `"links"` section of each post.
The [URL template specification][3] specifies that the default explosion is to join the array members by a comma, so in this example, fetching `/comments/1,2,3,4` will return a list of all comments.

[3]: https://tools.ietf.org/html/rfc6570

This example shows how you can start with a list of IDs and then upgrade to specifying a different URL pattern than the default.

The top-level `"links"` key has the following behavior:

* Each key is a dot-separated path that points at a repeated relationship. For example `"posts.comments"` points at the `"comments"` relationship in each repeated document under `"posts"`.
* The value of each key is interpreted as a URL template.
* For each document that the path points to, act as if it specified a relationship formed by expanding the URL template with the non-URL value actually specified.

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

In this example, the author URL for all three posts is `/people/12`.

Top-level URL templates allow you to specify relationships as IDs, but without requiring that clients hard-code information about how to form the URLs.

### Compound Documents

To save HTTP requests, it may be convenient to send related documents along with the requested documents.

In this case, a bit of extra metadata for each relationship can link together the documents.

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
  }
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "9",
      "comments": [ "1", "2", "3" ]
   }, {
    "id": "2",
    "title": "The Parley Letter",
    "links": {
      "author": "9",
      "comments": [ "4", "5" ]
   }, {
    "id": "1",
    "title": "Dependency Injection is Not a Virtue",
    "links": {
      "author": "9",
      "comments": [ "6" ]
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

```javascript
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
    "href": "http://example.com/comments/4",
    "id": "4",
    "body": "Parley is a discussion, especially one between enemies"
  }, {
    "href": "http://example.com/comments/5",
    "id": "5",
    "body": "The parsley letter"
  }, {
    "href": "http://example.com/comments/6",
    "id": "6",
    "body": "Dependency Injection is Not a Vice"
  }]
}
```
