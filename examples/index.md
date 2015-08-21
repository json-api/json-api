---
layout: page
title: Examples
---

This page contains additional examples of how to apply various parts of the specification.

## Sparse Fieldsets

Examples of how [sparse fieldsets](http://jsonapi.org/format/#fetching-sparse-fieldsets) work.

Basic request:

```http
GET /articles?include=author
```

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "data": [{
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON API paints my bikeshed!",
      "body": "The shortest article. Ever.",
      "created": "2015-05-22T14:56:29.000Z",
      "updated": "2015-05-22T14:56:28.000Z"
    },
    "relationships": {
      "author": {
        "data": {"id": 42, "type": "people"}
      }
    }
  }],
  "included": [
    {
      "type": "people",
      "id": 42,
      "attributes": {
        "name": "John",
        "age": 80,
        "gender": "male"
      }
    }
  ]
}
```

Request with `fields` parameter:

```http
GET /articles?include=author&fields[articles]=title,body,author&fields[people]=name
```

> Note: The above example URI shows unencoded `[` and `]` characters simply
for readability. In practice, these characters must be percent-encoded, as
noted in the base specification.

Here we want `articles` objects to have fields `title`, `body` and `author` only and `people` objects to have `name` field only.

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "data": [{
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON API paints my bikeshed!",
      "body": "The shortest article. Ever."
    },
    "relationships": {
      "author": {
        "data": {"id": 42, "type": "people"}
      }
    }
  }],
  "included": [
    {
      "type": "people",
      "id": 42,
      "attributes": {
        "name": "John"
      }
    }
  ]
}
```

Pay attention to the fact that you have to add a relationship name both in `include` and `fields` (since relationships are fields too), otherwise you'll get:

```http
GET /articles?include=author&fields[articles]=title,body&fields[people]=name
```

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "data": [{
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON API paints my bikeshed!",
      "body": "The shortest article. Ever."
    }
  }],
  "included": [
    {
      "type": "people",
      "id": 42,
      "attributes": {
        "name": "John"
      }
    }
  ]
}
```

> Note: The above example URI shows unencoded `[` and `]` characters simply
for readability. In practice, these characters must be percent-encoded, as
noted in the base specification.

## Pagination Links

Example of a page-based strategy on how to add [pagination links](http://jsonapi.org/format/#fetching-pagination).

Basic request:

```http
GET /articles?page[number]=3&page[size]=1
```

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "meta": {
    "total-pages": 13
  },
  "data": [
    {
      "type": "articles",
      "id": "3",
      "attributes": {
        "title": "JSON API paints my bikeshed!",
        "body": "The shortest article. Ever.",
        "created": "2015-05-22T14:56:29.000Z",
        "updated": "2015-05-22T14:56:28.000Z"
      }
    }
  ],
  "links": {
    "self": "http://example.com/articles?page[number]=3&page[size]=1",
    "first": "http://example.com/articles?page[number]=1&page[size]=1",
    "prev": "http://example.com/articles?page[number]=2&page[size]=1",
    "next": "http://example.com/articles?page[number]=4&page[size]=1",
    "last": "http://example.com/articles?page[number]=13&page[size]=1"
  }
}
```

Note: Putting a property like `"total-pages"` in `"meta"` can be a convenient way
to indicate to clients the total number of pages in a collection (as opposed to
the `"last"` link, which simply gives the URI of the last page). However, all
`"meta"` values are implementation-specific, so you can call this member whatever
you like (`"total"`, `"count"`, etc.) or not use it at all.

## Error Objects

Examples of how [error objects](http://jsonapi.org/format/#error-objects) work.

### Responses to failed resource creation:

Response with one error object, with attribute error:

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/vnd.api+json

{
  "errors": [
    {
      "title":  "Invalid Attribute",
      "source": { "pointer": "data/attributes/first-name" },
      "detail": "First name must contain at least three characters."
    }
  ]
}
```

Notice that the attribute `first-name` is dasherized.  Dasherized attributes are preferred
over underscored.

Notice also that the `detail` is specific to this occurrence of the problem,
whereas the `title` is more generic.

Notice that the `source` points to the associated attribute with the error.

Response with one error object, with relationship error:

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/vnd.api+json

{
  "errors": [
    {
      "status": "422",
      "title":  "Missing Association",
      "source": { "pointer": "data/relationships/author" },
      "detail": "Post author cannot be blank."
    }
  ]
}
```

Notice that the `source` points to the associated relationship with the error.

Notice also that the error object includes a `status` code. Though optional,
it can be useful when the code processing the JSON isn't directly aware of
the HTTP response or even if the JSON is coming via non-HTTP protocols.

Response with one error, using a `code`:

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/vnd.api+json

{
  "errors": [
    {
      "title": "Adapter Error",
      "code": "ds.errors.invalid-error-expects-json-api-format",
      "detail": "The adapter rejected the commit because it was not in the JSON API format."
    }
  ]
}
```

Response with status:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/vnd.api+json

{
  "errors": [
    {
      "status": "403",
      "source": { "pointer": "data/attributes/secret-powers" },
      "detail": "Access to secret powers not authorized on Sundays."
    },
    {
      "status": "404",
      "links": { "about": {
        "href": "http://example.com/weapons/vorpal-blade",
        },
      },
      "title": "Weapon not found."
    },
    {
      "status": "422",
      "source": { "pointer": "data/attributes/volume" },
      "detail": "Volume does not, in fact, go to 11."
    },
    {
      "status": "500",
      "title": "The backend responded with an error",
      "detail": "Reputation service not responding after three requests."
    },
    {
      "status": "400",
      "detail": "JSON parse error - Expecting property name enclosed in double quotes: line 1 column 2 (char 1)"
    }
  ]
}
```

The only uniqueness constraint on error objects in a response is the `id` field.
Thus, multiple errors on the same attribute may be described by an error object
for each error.

Notice that one of the error objects references an association that was not found using
a `links` object containing an about `link`.

Multiple errors on `first-name` attribute:

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/vnd.api+json

{
  "errors": [
    {
      "title": "Invalid Attribute",
      "source": { "pointer": "data/attributes/first-name" },
      "detail": "First name must contain at least three characters."
    },
    {
      "title": "Invalid Attribute",
      "source": { "pointer": "data/attributes/first-name" },
      "detail": "First name must contain an emoji."
    }
  ]
}
```

A "400 Bad Request" response would also be acceptable. See
[http://stackoverflow.com/a/20215807/1261879]('400 vs 422 response to POST of data' on
Stack Overflow). The JSON API doesn't take a position on 400 vs. 422.

If the API docs specified:

> | Error Code | Title                                                                             |
> |------------|-----------------------------------------------------------------------------------|
> |  11        | "Invalid Attribute"                                                               |
> |  123       | "too short"                                                                       |
> |  124       | "emoji missing"                                                                   |
> |  225       | "password must contain a letter, number, space, neologism, and special character" |
> |  226       | "passwords do not match"                                                          |
> |  227       | "password cannot be one of last five passwords"                                   |

Multiple errors on `password` attribute, with error `code`:

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/vnd.api+json

{
  "errors": [
    {
      "code":   "123",
      "source": { "pointer": "data/attributes/first-name" },
      "detail": "First name must contain at least three characters."
    },
    {
      "code":   "225",
      "source": { "pointer": "data/attributes/password" },
      "detail": "Frobnicate is not a neologism."
    },
    {
      "code":   "226",
      "source": { "pointer": "data/attributes/password" },
      "detail": "Password and password confirmation do not match."
    }
  ]
}
```

Multiple errors on `first-name` attribute, with error `code`, and `title`:

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/vnd.api+json

{
  "jsonapi": { "version": "1.0" },
  "errors": [
    {
      "code":   "123",
      "title":  "too short",
      "source": { "pointer": "data/attributes/first-name" },
      "detail": "First name must contain at least three characters."
    },
    {
      "code":   "124",
      "title":  "emoji missing",
      "source": { "pointer": "data/attributes/first-name" },
      "detail": "First name must contain an emoji"
    }
  ]
}
```

Notice that this response includes not only the `errors` top-level member,
but the `jsonapi` top-level member. It may also have include the `meta` or `links`
top-level members, but not the `data` member.

```http
PATCH /posts/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{ "datum": [ ] }
```

```http
HTTP/1.1 422 Unprocesssable Entity
Content-Type: application/vnd.api+json

{
  "errors": [
    {
      "title":  "Missing Data Member",
      "source": { "pointer": "/data" }
    }
  ]
}
```

Notice that the `source` indicates the error was causes not by a missing attribute, but
by missing `data`.

### Responses to failed resource request:

Response with one error object, with parameter error:

```http
GET /api/posts/1
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/vnd.api+json

{
  "errors": [
    {
      "title":  "Missing Query Parameter",
      "source": { "parameter": "auth_key" },
      "detail": "The required parameter, auth_key, is missing."
    }
  ]
}
```

Notice that the `source` indicates the URI query parameter which caused the error.
This example with a missing `auth_key` parameter was chosen over an example with an invalid
URI query parameter, since it may make sense to ignore invalid parameters in some cases, and
have the request succeed rather than fail. As described in the [Bulk
extension](http://jsonapi.org/extensions/bulk/#bulk-operations):

> ...a request MUST completely succeed or fail (in a single "transaction").
> ...any request that involves multiple operations MUST only succeed if all operations are performed
successfully

Examples of invalid parameters may be `?page[prev]=` (parameter present, but has no value),
`?include=auther` (invalid parameter value, perhaps a typo), `?felds[author]=`,
(invalid parameter key, perhaps a typo), `?redirect_to=http%3A%2F%2Fwww.owasp.org` (invalid
parameter, in this case, a phishing attack), etc.

### Using JSON API extensions

Request and response using the [JSON PATCH
Extension](http://jsonapi.org/extensions/jsonpatch/):

```http
PATCH /posts/1
Content-Type: application/vnd.api+json; ext=jsonpatch
Accept: application/vnd.api+json; ext=jsonpatch

[ { "op": "remove" } ]
```

```http
HTTP/1.1 422 Unprocesssable Entity
Content-Type: application/vnd.api+json; ext=jsonpatch

[
  {
    "errors": [
      {
        "status": "422",
        "detail": "Operation missing required keys: 'path'"
      }
    ]
  }
]
```

Notice that JSON PATCH is a special semantics and does not mean an HTTP PATCH request
containing JSON.

Request and response using the [Bulk extension](http://jsonapi.org/extensions/bulk/)

```http
PATCH /photos
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

```http
HTTP/1.1 400 Bad Request
Content-Type: application/vnd.api+json


{
  "errors": [
    {
      "status": "404",
      "source": { "pointer": "/data/articles/1" },
      "detail": "Article with id 1 could not be found."
    }
  ]
}
```

Since requests are transactional, as the [Bulk
extension](http://jsonapi.org/extensions/bulk/#bulk-operations) describes: *"The
state of the server MUST NOT be changed by a request if any individual operation fails."*
Thus, even though one of the objects to update was found, one was not, so none get updated.
