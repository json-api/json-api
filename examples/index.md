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
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON API paints my bikeshed!",
      "body": "The shortest article. Ever.",
      "created": 1432306588,
      "updated": 1432306589
    },
    "relationships": {
      "author": {
        "data": {"id": 42, "type": "people"}
      }
    }
  },
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

Here we want `articles` objects to have fields `title`, `body` and `author` only and `people` objects to have `name` field only.

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json

{
  "data": {
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
  },
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
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON API paints my bikeshed!",
      "body": "The shortest article. Ever."
    }
  },
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
