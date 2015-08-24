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

> Note: The above example URIs show unencoded `[` and `]` characters simply
for readability. In practice, these characters must be percent-encoded, as
noted in the base specification.

> Note: Putting a property like `"total-pages"` in `"meta"` can be a convenient way
to indicate to clients the total number of pages in a collection (as opposed to
the `"last"` link, which simply gives the URI of the last page). However, all
`"meta"` values are implementation-specific, so you can call this member whatever
you like (`"total"`, `"count"`, etc.) or not use it at all.
