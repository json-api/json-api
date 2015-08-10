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

Example of how to add [pagination links](http://jsonapi.org/format/#fetching-pagination).

Basic request:

```http
GET /articles?page=3&per_page=1
```

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "data": [
    {
      "type": "articles",
      "id": "1",
      "attributes": {
        "title": "JSON API paints my bikeshed!",
        "body": "The shortest article. Ever.",
        "created": "2015-05-22T14:56:29.000Z",
        "updated": "2015-05-22T14:56:28.000Z"
      }
    }
  ],
  "links": {
    "first": "http://example.com/articles?page=1&per_page=1",
    "prev": "http://example.com/articles?page=2&per_page=1",
    "next": "http://example.com/articles?page=4&per_page=1",
    "last": "http://example.com/articles?page=13&per_page=1"
  }
}
```
