---
layout: page
title: "Recommendations"
show_sidebar: true
---

This section contains recommendations for JSON API implementations. These
recommendations are intended to establish a level of consistency in areas that
are beyond the scope of the base JSON API specification.

## <a href="#naming" id="naming" class="headerlink"></a> Naming


### URLs

The allowed and recommended characters for an URL safe naming of members are defined in the format spec. To also standardize member names, the following (more restrictive) rules are recommended:

- Member names **SHOULD** start and end with the characters "a-z" (U+0061 to U+007A)
- Member names **SHOULD** contain only the characters "a-z" (U+0061 to U+007A), "0-9" (U+0030 to U+0039), and the hyphen minus (U+002D HYPHEN-MINUS, "-") as separator between multiple words.

### JSON  

It is important to adhere to a defined convention. Recommended property names **SHOULD** conform to the following guidelines:

- Property names **SHOULD** be camel-cased, ascii strings.
- First characters **SHOULD** be "a-z" (U+0061 to U+007A).
- Property names **SHOULD** be meaningful names with defined semantics.


These guidelines mirror the guidelines for naming JavaScript identifiers. This allows JavaScript clients to access properties using dot notation.

> Here's an example of an object with one property:

```json
{
  "thisPropertyIsAnIdentifier": "identifier value"
}
```


## <a href="#urls" id="urls" class="headerlink"></a> URL Design

### <a href="#urls-reference-document" id="urls-reference-document" class="headerlink"></a> Reference Document

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

### <a href="#urls-resource-collections" id="urls-resource-collections" class="headerlink"></a> URLs for Resource Collections

It is recommended that the URL for a collection of resources be formed from
the resource type.

For example, a collection of resources of type `photos` will have the URL:

```text
/photos
```

### <a href="#urls-individual-resources" id="urls-individual-resources" class="headerlink"></a> URLs for Individual Resources

Treat collections of resources as sets keyed by resource ID. The URL for an
individual resource can be formed by appending the resource's ID to the
collection URL.

For example, a photo with an ID of `"1"` will have the URL:

```text
/photos/1
```

### <a href="#urls-relationships" id="urls-relationships" class="headerlink"></a> Relationship URLs and Related Resource URLs

As described in the base specification, there are two URLs that can be exposed
for each relationship:

* the "relationship URL" - a URL for the relationship itself, which is
identified with the `self` key in a relationship's `links` object. This URL
allows the client to directly manipulate the relationship. For example, it would
allow a client to remove an `author` from a `post` without deleting the `people`
resource itself.

* the "related resource URL" - a URL for the related resource(s), which is
identified with the `related` key within a relationship's `links` object. When
fetched, it returns the related resource object(s) as the response's primary data.

It is recommended that a relationship URL be formed by appending `/relationships/`
and the name of the relationship to the resource's URL.

For example, a photo's `comments` relationship will have the URL:

```text
/photos/1/relationships/comments
```

And a photo's `photographer` relationship will have the URL:

```text
/photos/1/relationships/photographer
```

It is recommended that a related resource URL be formed by appending the name
of the relationship to the resource's URL.

For example, the URL for a photo's `comments` will be:

```text
/photos/1/comments
```

And the URL for a photo's `photographer` will be:

```text
/photos/1/photographer
```

Because these URLs represent resources in relationships, they should not be
used as `self` links for the resources themselves. Instead the recommendations
for individual resource URLs should still apply when forming `self` links.

## <a href="#filtering" id="filtering" class="headerlink"></a> Filtering

The base specification is agnostic about filtering strategies supported by a
server. The `filter` query parameter is reserved to be used as the basis for
any filtering strategy.

It's recommended that servers that wish to support filtering of a resource
collection based upon associations do so by allowing query parameters that
combine `filter` with the association name.

For example, the following is a request for all comments associated with a
particular post:

```http
GET /comments?filter[post]=1 HTTP/1.1
```

Multiple filter values can be combined in a comma-separated list. For example:

```http
GET /comments?filter[post]=1,2 HTTP/1.1
```

Furthermore, multiple filters can be applied to a single request:

```http
GET /comments?filter[post]=1,2&filter[author]=12 HTTP/1.1
```

## <a href="#including-links" id="including-links" class="headerlink"></a> Including Top-level, Resource-level and Relationship Links

The base specification is agnostic about including links with a resource response. However, it is recommended that the following links be included within response documents:

- **Top-level links** like a self-link (for the whole response) as well as relative pagination links (if appropriate).
- **Resource-level links** like a self-link for each resource (which differs from the top-level, if the resource is part of a collection).
- **Relationship links** for all available relationships of a resource.

For example, a request for a collection of comments could prompt the following response:

```http
GET /comments HTTP/1.1

{
  "data": [{
      "type": "comments",
      "id": "1",
      "attributes": {
          "text": "HATEOS are the thing!"
      },
      "links": {
          "self": "/comments/1"
      },
      "relationships": {
        "author": {
          "links": {
            "self": "/comments/1/relationships/author",
            "related": "/comments/1/author"
          }
        },
        "articles": {
          "links": {
            "self": "/comments/1/relationships/articles",
            "related": "/comments/1/articles"
          }
        }
      }
  }],
  "links": {
      "self": "/comments"
  }
}
```

## <a href="#patchless-clients" id="patchless-clients" class="headerlink"></a> Supporting Clients Lacking `PATCH`

Some clients, like IE8, lack support for HTTP's `PATCH` method. API servers
that wish to support these clients are recommended to treat `POST` requests as
`PATCH` requests if the client includes the `X-HTTP-Method-Override: PATCH`
header. This allows clients that lack `PATCH` support to have their update
requests honored, simply by adding the header.

## <a href="#date-and-time-fields" id="date-and-time-fields" class="headerlink"></a> Formatting Date and Time Fields

Although JSON API does not specify the format of date and time fields, it is
recommended that servers align with ISO 8601. [This W3C
NOTE](http://www.w3.org/TR/NOTE-datetime) provides an overview of the
recommended formats.

## <a href="#asynchronous-processing" id="asynchronous-processing" class="headerlink"></a> Asynchronous Processing

Consider a situation when you need to create a resource and the operation takes a long time to complete.

```http
POST /photos HTTP/1.1
```

The request **SHOULD** return a status `202 Accepted` with a link in the `Content-Location` header.

```http
HTTP/1.1 202 Accepted
Content-Type: application/vnd.api+json
Content-Location: https://example.com/photos/queue-jobs/5234

{
  "data": {
    "type": "queue-jobs",
    "id": "5234",
    "attributes": {
      "status": "Pending request, waiting other process"
    },
    "links": {
      "self": "/photos/queue-jobs/5234"
    }
  }
}
```

To check the status of the job process, a client can send a request to the location given earlier.

```http
GET /photos/queue-jobs/5234 HTTP/1.1
Accept: application/vnd.api+json
```

Requests for still-pending jobs **SHOULD** return a status `200 OK`, as the server is reporting the status successfully. Optionally, the server can return a `Retry-After` header to provide guidance to the client as to how long it should wait before checking again. Recommendations to retry sooner than 1 second can be accomplised with `Retry-After: 0`.

```http
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json
Retry-After: 1

{
  "data": {
    "type": "queue-jobs",
    "id": "5234",
    "attributes": {
      "status": "Pending request, waiting other process"
    },
    "links": {
      "self": "/photos/queue-jobs/5234"
    }
  }
}
```

When job process is done, the request **SHOULD** return a status `303 See other` with a link in `Location` header.

```http
HTTP/1.1 303 See other
Content-Type: application/vnd.api+json
Location: https://example.com/photos/4577
```
