# Atomic Operations Extension

This extension provides a means to perform multiple "operations" in a linear and
atomic manner. Operations are a serialized form of the mutations allowed in the
base JSON:API specification.

Clients can send an array of operations in a single request. This extension
guarantees that those operations will be processed in order and will either
completely succeed or fail together.

## <a href="#namespace" id="namespace" class="headerlink"></a> Namespace

This extension uses the namespace `atomic`.

> Note: JSON:API extensions can only introduce new document members using a
> reserved namespace as a prefix.

## <a href="#document-structure" id="document-structure" class="headerlink"></a> Document Structure

A document that supports this extension **MAY** include any of the top-level
members allowed by the base specification with the exception of `data` and
`included`, which **MUST NOT** be included.

In addition, such a document **MAY** include either of the following members,
but not both:

- `atomic:operations` - an array of [operation objects](#operation-objects).

- `atomic:results` - an array of [result objects](#result-objects).

If either `atomic:operations` or `atomic:results` is present, the `errors`
member **MUST NOT** be included in the same document.

### <a href="#operation-objects" id="operation-objects" class="headerlink"></a> Operation Objects

An operation object **MUST** contain the following member:

- `op`: an operation code, expressed as a string, that indicates the type of
  operation to perform. Valid values include:

  - `"add"`: creates a new resource or relationship
  - `"update"`: updates a resource or relationship
  - `"remove"`: removes a resource or relationship

An operation object **MAY** contain either of the following members, but not
both, to specify the target of the operation:

- `ref`: an object that **MAY** contain any of the following combinations of
  members:

  - `type` and `id`: to target an individual resource.
  - `type`, `id`, and `relationship`: to target an individual resource's relationship.

  Note that `local:id` **MAY** be used instead of `id` when used together with
  the local identity extension.

- `href`: a string that contains a URI-reference [[RFC3986 Section
  4.1](https://tools.ietf.org/html/rfc3986#section-4.1)] that identifies the
  target of the operation.

An operation object **MAY** also contain any of the following members:

- `data`: the operation's "primary data".

- `meta`: a [meta object](#document-meta) that contains non-standard
  meta-information about the operation.

Different members are required for processing different types of operations, as
described below.

### <a href="#result-objects" id="result-objects" class="headerlink"></a> Result Objects

An operation result object **MAY** contain any of the following members:

- `data`: the "primary data" resulting from the operation.

- `meta`: a [meta object](#document-meta) that contains non-standard
  meta-information about the result.

An empty result object (`{}`) is acceptable for operations that are not required
to return `data`.

## <a href="#processing" id="processing" class="headerlink"></a> Processing

All HTTP requests sent with this extension **MUST** be issued with `POST`.

A server **MUST** perform operations in the order they appear in the
`atomic:operations` array.

A server **MUST** perform all operations atomically, so that a failure
to perform any operation **MUST** invalidate any effects of preceding
operations.

A server **MUST** respond to a successful operations request with `200 OK` if a
response document is returned. An array of [result objects](#result-objects)
**MUST** be returned in a top-level `atomic:results` member. The results array
**MUST** be the same length as the requested operations array and each result
**MUST** correspond positionally to its associated operation.

A server **MAY** respond to successful requests that include operations with
`204 No Content` and no response document if no operations are required to
return `data`.

### <a href="#processing-errors" id="processing-errors" class="headerlink"></a> Processing Errors

If any operation in a request fails, the server **MUST** respond as described
[in the base specification](/format/#errors-processing). An array of one or
more [error objects](/format/#error-objects) **SHOULD** be returned, each with
a `source` member that contains a `pointer` to the source of the problem in the
request document.

### <a href="#specific-operations" id="specific-operations" class="headerlink"></a> Processing Specific Operations

The following sections describe how to process specific operations.

#### Creating Resources

An operation that creates a resource **MAY** target a resource collection
through the operation's `ref` member. The operation **MUST** include an `op`
code of `"add"` as well as a resource object as `data`. The resource object
**MUST** contain at least a `type` member.

For example:

```json
POST /operations HTTP/1.1
Host: example.org
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"
Accept: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"

{
  "atomic:operations": [{
    "op": "add",
    "href": "/blogPosts",
    "data": {
      "type": "articles",
      "attributes": {
        "title": "JSON API paints my bikeshed!"
      }
    }
  }]
}
```

Note that `href` is used in this example to target a resource collection,
`blogPosts` in this case, that is distinct from the `type` of the resource.

##### Responses

If the server is able to create a resource with a client-generated ID and its
representation would be identical to the resource in the operation, then the
server **MAY** return a result with no `data` member or it **MAY** return a
result that contains the created resource as `data`.

In all other cases in which the server is able to successfully create the
resource, the server **MUST** return a result that contains the created resource
as `data`.

For example:

```json
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"

{
  "atomic:results": [{
    "data": {
      "links": {
        "self": "http://example.com/blogPosts/13"
      },
      "type": "articles",
      "id": "13",
      "attributes": {
        "title": "JSON API paints my bikeshed!"
      }
    }
  }]
}
```

If the server is unable to create the resource, an appropriate error response
**MUST** be returned and a response document **SHOULD** be returned that
contains a top-level `errors` as [described above](#processing-errors).

#### Updating Resources

An operation that updates a resource **MUST** target that resource through the
operation's `ref` member. The operation **MUST** include an `op` code of
`"update"`.

For example:

```json
POST /operations HTTP/1.1
Host: example.org
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"
Accept: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"

{
  "atomic:operations": [{
    "op": "update",
    "ref": {
      "type": "articles",
      "id": "13"
    },
    "data": {
      "type": "articles",
      "id": "13",
      "attributes": {
        "title": "To TDD or Not"
      }
    }
  }]
}
```

##### Responses

If a server accepts an update but also changes the resource in ways other than
those specified by the request (for example, updating the `updatedAt` attribute
or a computed `sha`), then the server **MUST** return a result that includes a
representation of the updated resource as `data`.

If a server accepts an update and doesn’t update any fields besides those
provided, the server **MUST** return a result that includes either no `data` or
a representation of the resource as `data` or, if all results are empty, the
server **MAY** respond with `204 No Content` and no document.

If a server is unable to update the resource, an appropriate error response
**MUST** be returned and a response document **SHOULD** be returned that
contains a top-level `errors` as [described above](#processing-errors).

#### Deleting Resources

An operation that deletes a resource **MUST** target that resource through the
operation's `ref` member. The operation **MUST** include an `op` code of
`"remove"`.

For example:

```json
POST /operations HTTP/1.1
Host: example.org
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"
Accept: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"

{
  "atomic:operations": [{
    "op": "remove",
    "ref": {
      "type": "articles",
      "id": "13"
    }
  }]
}
```

##### Responses

If a server is able to delete the resource, the server **MUST** return a result
with no `data` or, if all results are empty, the server **MAY** respond with
`204 No Content` and no document.

If a server is unable to delete the resource, an appropriate error response
**MUST** be returned and a response document **SHOULD** be returned that
contains a top-level `errors` as [described above](#processing-errors).

#### Updating To-One Relationships

An operation that updates a resource's to-one relationship **MUST** target that
relationship through the operation's `ref` member. The operation **MUST**
include an `op` code of `"update"`.

For example, the following request assigns a to-one relationship:

```json
POST /operations HTTP/1.1
Host: example.org
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"
Accept: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"

{
  "atomic:operations": [{
    "op": "update",
    "ref": {
      "type": "articles",
      "id": "13",
      "relationship": "author"
    },
    "data": {
      "type": "people",
      "id": "9"
    }
  }]
}
```

And the following request clears a to-one relationship:

```json
POST /operations HTTP/1.1
Host: example.org
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"
Accept: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"

{
  "atomic:operations": [{
    "op": "update",
    "ref": {
      "type": "articles",
      "id": "13",
      "relationship": "author"
    },
    "data": null
  }]
}
```

##### Responses

If a server is able to update the relationship, the server **MUST** return a
result with no `data` or, if all results are empty, the server **MAY** respond
with `204 No Content` and no document.

If a server is unable to update the relationship, an appropriate error response
**MUST** be returned and a response document **SHOULD** be returned that
contains a top-level `errors` as [described above](#processing-errors).

#### Updating To-Many Relationships

An operation that updates a resource's to-many relationship **MUST** target that
relationship through the operation's `ref` member.

To add members to a to-many relationship, the operation **MUST** include an
`op` code of `"add"`. For example:

```json
POST /operations HTTP/1.1
Host: example.org
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"
Accept: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"

{
  "atomic:operations": [{
    "op": "add",
    "ref": {
      "type": "articles",
      "id": "1",
      "relationship": "comments"
    },
    "data": [
      { "type": "comments", "id": "123" }
    ]
  }]
}
```

To replace all the members of a to-many relationship, the operation **MUST**
include an `op` code of `"update"`. For example:

```json
POST /operations HTTP/1.1
Host: example.org
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"
Accept: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"

{
  "atomic:operations": [{
    "op": "update",
    "ref": {
      "type": "articles",
      "id": "1",
      "relationship": "tags"
    },
    "data": [
      { "type": "tags", "id": "2" },
      { "type": "tags", "id": "3" }
    ]
  }]
}
```

To remove members from a to-many relationship, the operation **MUST** include an
`op` code of `"remove"`. For example:

```json
POST /operations HTTP/1.1
Host: example.org
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"
Accept: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"

{
  "atomic:operations": [{
    "op": "remove",
    "ref": {
      "type": "articles",
      "id": "1",
      "relationship": "comments"
    },
    "data": [
      { "type": "comments", "id": "12" },
      { "type": "comments", "id": "13" }
    ]
  }]
}
```

##### Responses

If a server is able to update the relationship, the server **MUST** return a
result with no `data` or, if all results are empty, the server **MAY** respond
with `204 No Content` and no document.

If a server is unable to update the relationship, an appropriate error response
**MUST** be returned and a response document **SHOULD** be returned that
contains a top-level `errors` as [described above](#processing-errors).

### Processing Multiple Operations

The above examples all perform a single operation that aligns with an equivalent
singular request from the base spec. Yet, the primary value of this extension is
that unlocks the ability to perform more than one action linearally and
atomically.

The following example adds two resources and creates a relationship between them
in a single request:

```json
POST /operations HTTP/1.1
Host: example.org
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"
Accept: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"

{
  "atomic:operations": [{
    "op": "add",
    "data": {
      "type": "authors",
      "id": "acb2ebd6-ed30-4877-80ce-52a14d77d470",
      "attributes": {
        "name": "dgeb"
      }
    }
  }, {
    "op": "add",
    "data": {
      "type": "articles",
      "id": "bb3ad581-806f-4237-b748-f2ea0261845c",
      "attributes": {
        "title": "JSON API paints my bikeshed!"
      },
      "relationships": {
        "author": {
          "data": {
            "type": "authors",
            "id": "acb2ebd6-ed30-4877-80ce-52a14d77d470"
          }
        }
      }
    }
  }]
}
```

A server might respond to this request as follows:

```json
HTTP/1.1 200 OK
Content-Type: application/vnd.api+json;ext="https://jsonapi.org/ext/atomic"

{
  "atomic:results": [{
    "data": {
      "links": {
        "self": "http://example.com/authors/acb2ebd6-ed30-4877-80ce-52a14d77d470"
      },
      "type": "authors",
      "id": "acb2ebd6-ed30-4877-80ce-52a14d77d470",
      "attributes": {
        "name": "dgeb"
      }
    }
  }, {
    "data": {
      "links": {
        "self": "http://example.com/articles/bb3ad581-806f-4237-b748-f2ea0261845c"
      },
      "type": "articles",
      "id": "bb3ad581-806f-4237-b748-f2ea0261845c",
      "attributes": {
        "title": "JSON API paints my bikeshed!"
      },
      "relationships": {
        "author": {
          "links": {
            "self": "http://example.com/articles/bb3ad581-806f-4237-b748-f2ea0261845c/relationships/author",
            "related": "http://example.com/articles/bb3ad581-806f-4237-b748-f2ea0261845c/author"
          }
        }
      }
    }
  }]
}
```

> Note that this operations request could also have been structured to add the
> author, then add the article, then add the relationship between them.

> Also note that the local identities extension is particularly useful for
> requests that involve multiple operations. Local identities can be used to
> associate resources that have not yet been assigned IDs.
