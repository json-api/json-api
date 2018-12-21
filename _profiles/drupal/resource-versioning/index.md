---
name: Resource Versioning
short_description: |
  Defines a protocol for requesting versioned resources via a JSON:API
  server.

extended_description: |
  # Overview
  JSON:API servers that are capable of tracking a record of changes to a
  resource object may afford the capability of requesting a resource object
  as it existed in a prior or successive state. This capability is herein
  defined as _resource versioning_.
  
  This profile establishes a protocol for resource versioning by defining a
  query parameter and its semantics in order to identify arbitrary revisions
  of a resource and how a server should interpret this query parameter.

minimum_jsonapi_version: 1.0
minimum_jsonapi_version_explanation:

discussion_url: https://www.drupal.org/project/issues/jsonapi

editors:
  - name: Gabriel Sullice
    email: gabriel@sullice.com
  - name: Mateu Aguiló Bosch
    email: mateu.aguilo.bosch@gmail.com
    website: https://humanbits.es
  - name: Wim Leers
    email: work@wimleers.com
    website: https://wimleers.com

categories:
  - Resource Versioning
---
  
# Concepts
Resources on a server may undergo changes and the state of a resource with an
arbitrary number of changes may be accessible. It is often useful to retrieve
resources as they existed at the time of their creation or in various states of
change for editorial or archival purposes. This profile establishes a protocol
for accessing resources in those various states.

For the purpose of understanding this profile, it is helpful to establish a
vocabulary for describing various possible states of a resource.

A _revision_ is to be understood as an identifiable state of a resource after
its creation or after some number of changes.

A _version_ is to be understood as a revision that is or was the default
revision of a resource. In other words, as a revision of a resource that is
available, or was previously available, without any version negotiation.

A _working copy_ is the revision to which new changes can be made or to which
they will be applied. Colloquially, a working copy is often thought of as the
"tip" of a version history.

For example, a resource which existed as a draft and underwent multiple changes
before the resource was published may have many revisions. Only the published
revision would be considered a version. The revisions prior to first version
would have been known as the working copy as each one was created.

If the version is then checked out for further changes each new revision becomes
the working copy. When the working copy is checked in and made the default
revision, this revision becomes the latest version and the version before it is
its _predecessor version _. If no other revisions come after the latest version,
it may also be considered the working copy.

Sophisticated servers may support multiple versions of a resource as well as
multiple working copies of a resource (e.g., to support multiple
languages or within a version control system which supports multiple branches).

This profile creates a standard for JSON:API to support these diverse versioning
schemes.
# Query Parameter

## Usage

An endpoint **MAY** support a `resourceVersion` query parameter to allow a
client to indicate which version(s) of a resource should be returned.

If an endpoint does not support the `resourceVersion` parameter, it **MUST**
respond with `400 Bad Request` to any requests that include it. An error object
detailing the source of the error **SHOULD** include a `source` member referencing
the `resourceVersion` query parameter.

If an endpoint supports the `resourceVersion` parameter and a client supplies
it:

  - The server’s response **MUST** contain the most appropriate version of the
    resource requested.
  - The server **MUST** respond with `404 Not Found` if an appropriate version of
    the resource requested cannot be located. 
    
> Note: This means that a server should not provide "fallbacks" unless the
> behavior is well defined by the version negotiation mechanism (see below).
> These rules apply to individual and collection endpoints alike.

## Format
  
The value of the `resourceVersion` parameter **MUST** be a colon-separated
(U+003A COLON, “:”) string composed of one or more segments. The first segment
of the string **MUST** be interpreted as an identifier for a _version negotiation
mechanism_. A version negotiation mechanism defines how a server will
locate an appropriate resource version. Subsequent segments of the string
**SHOULD** be interpreted as version negotiation arguments for the preceding
mechanism. Collectively, this query parameter value is known as the _version
identifier_.

> Note: For example, a server may support both ID-based and time-based
> mechanisms for requesting a resource version. The former mechanism would be
> useful for comparing versions and the latter could be useful for requesting a
> resource as it existed at an arbitrary point in time. This profile does not
> attempt to define every possible mechanism for versioning resources.

```
                   version-identifier
                   _______|_________
                  /                \
?resourceVersion=rel:latest-version
                  \_/ \____________/
                   |        |
         version-negotiator |
                     version-argument
```

## Server Responsibilities

<a id="bad-version-negotiator"></a>A server **MUST** respond with `400 Bad Request` if a version negotiator is not
supported. An error object detailing the source of the error **SHOULD** include a
`type` link to
`https://jsonapi.org/profiles/drupal/resource-versioning/#bad-version-negotiator`
and **SHOULD** include a `source` member referencing the `resourceVersion` query
parameter.
   
<a id="bad-version-argument"></a>If a server cannot process the given version argument for the given negotiation
mechanism, it **MUST** respond with a `400 Bad Request`. An error object detailing the
source of the error **SHOULD** include a `type` link to
`https://jsonapi.org/profiles/drupal/resource-versioning/#bad-version-argument`
and **SHOULD** include a `source` member referencing the `resourceVersion` query
parameter.

If a server is able to process the version argument but an appropriate version
cannot be located, the server **MUST** respond with a `404 Not Found`.

# Links

When a server processes a request with a `resourceVersion` query parameter and
a `self` link is provided for a top-level links object, the link's `href`
**MUST** include the `resourceVersion` query parameter with the same version
identifier that was requested.

When a server processes a request with a `resourceVersion` query parameter
all resource object `self` links **SHOULD** contain a `resourceVersion` query
parameter which identifies the specific revision represented by that resource
object.

A server **MUST** use the most specific version negotiator it supports for any
resource object `self` links that it provides.

For example, in the following response document the `self` links are not the
same:

```json
{
  "data": {
    "type": "article",
    "id": 1,
    "links": {
      "self": "/article/1?resourceVersion=id:42"
    }
  },
  "links": {
    "self": "/article/1?resourceVersion=rel:latest-version"
  }
}
```

A server **MAY** provide a `version-history` link in a resource object's links
object if a [version history](version-history) endpoint is available for the context resource
object.

A server **MAY** provide the following resource object links so that a client may
navigate a resource object's version history:

  - `latest-version`: links to the latest version of the context resource
    object.
  - `working-copy`: links to the working copy of the context resource object.
  - `predecessor-version`: links to the version which immediately preceded the
    context resource object.
  - `successor-version`: links to the version which immediately succeeded the
    context resource object.
  - `prior-working-copy`: links to the working copy which immediately preceded
    the context resource object.
  - `subsequent-working-copy`: links to the working copy which immediately
    preceded the context resource object.

A server **MAY** provide an array of any of these links to support branching.

For example, in the following version history:

```
    _c_
   /   \
  /__b__d__   __f__   __h
 /         \ /     \ /
a           e       g
```

`g` is the latest version. Both `a` and `e` were previously the latest version.
No other revisions were ever the latest version. In this example, the following
links could be provided:

| Revision | `latest-version` | `working-copy` | `predecessor-version` | `successor-version` | `prior-working-copy` | `subsequent-working-copy` |
| :------: | :--------------: | :------------: | :-------------------: | :-----------------: | :------------------: | :-----------------------: |
| `a`      | `g`              | `h`            | no link               | `e`                 | no link              | `b`, `c`                  |
| `b`      | `g`              | `h`            | `a`                   | `e`                 | `a`                  | `c`                       |
| `c`      | `g`              | `h`            | `a`                   | `e`                 | `b`                  | `d`                       |
| `d`      | `g`              | `h`            | `a`                   | `e`                 | `b`, `c`             | `e`                       |
| `e`      | `g`              | `h`            | `a`                   | `g`                 | `d`                  | `f`                       |
| `f`      | `g`              | `h`            | `e`                   | `g`                 | `e`                  | `g`                       |
| `g`      | no link          | `h`            | `e`                   | no link             | `f`                  | `h`                       |
| `h`      | `g`              | no link        | `g`                   | no link             | `g`                  | no link                   |

> Note: In this example, `f` has both a `predecessor-version` and
> `prior-working-copy` link to `e` because `e` was a version and `e` was also the
> revision to which changes could be applied prior to `f`'s creation.

# Version History

A server **MAY** provide a "version history" endpoint. The primary data
of a response document from a version history endpoint must be a collection of
resource objects.

Unless an `id` contains version information, the `type` and `id` members of each
resource object in the collection **MUST** be the same.

If provided, resource objects' `self` links **MUST NOT** be the same.

# Version Negotiators

This profile defines a number of version negotiators which a server **MAY**
implement. Additional version negotiator's may be added to this profile at a
later date.

Version negotiators which are not defined by this profile **MUST** adhere to the
same constraints as [implementation-specific query parameter names](https://jsonapi.org/format/1.1/#query-parameters-custom).

It is **RECOMMENDED** that any alternative version negotiators be added to this
profile. New version negotiators may be registered by sending one, joint email
to the profile editors with the subject line: "New JSON:API Resource Version
Negotiator: {negotiator name}". This will begin a process of refinement and/or
result in a determination of fitness for addition to this profile.

## ID-Based Version Negotiator

This profile establishes the `id` version negotiator. An `id`-based version
identifier is composed of two segments—the `id` version negotiator and a single
version argument. Any colons (U+003A COLON, “:”) present in the version
identifier after the first occurrence **MUST** be interpreted as part of the
single version argument and **MUST NOT** be interpreted as a segment delimiter.

The resource version returned for any given version argument in an `id`-based
version identifier **MUST NOT** change over time.

> Note: This profile is agnostic about the format of the version argument in
> `id`-based version identifiers. For example, one server may use integers as
> revision IDs, another may use UUIDs and yet another may use content-based
> hashes.

## Relative Version Negotiator

This profile establishes the `rel` version negotiator. A `rel`-based version
identifier is composed of two or more segments. The first segment **MUST** be
`rel` and the following version arguments describe a resource version that is
relative to the version history.

The `rel` version negotiator **MUST NOT** appear in a resource object's `self` link.

The resource version returned for any given version argument in a `rel`-based
version identifier **MAY** change over time.

The `rel` version negotiator has the following valid version argument strings:

  - `latest-version`: requests the latest default revision of a resource.
  - `working-copy`: requests revision of a resource to which changes can be
    made.

If any of the following version arguments is received in a `rel`-based version
identifier, the server **MUST** respond with a `501 Not Implemented`:

  - `predecessor-version`
  - `successor-version`
  - `prior-working-copy`
  - `subsequent-working-copy`

> Note: Future versions of this profile may define the behavior of these version
> arguments.
