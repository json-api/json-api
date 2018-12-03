---
name: Cursor Pagination
short_description: |
  Enables pagination forward and backwards from a client-provided cursor, with
  a client-controlled page size.

extended_description: |
  Cursor-based pagination (aka keyset pagination) is a [common](https://slack.engineering/evolving-api-pagination-at-slack-1c1f644f8e12)
  [pagination strategy](https://www.citusdata.com/blog/2016/03/30/five-ways-to-paginate/)
  that avoids many of the pitfalls of "offset–limit" pagination.

  For example, with offset–limit pagination, if an item from a prior page is
  deleted while the client is paginating, all subsequent results will be shifted
  forward by one. Therefore, when the client requests the next page, there's one
  result that it will skip over and never see. Conversely, if a result is added
  to the list of results as the client is paginating, the client may see the
  same result multiple times, on different pages. Cursor-based pagination
  can prevent both of these possibilities.

  Cursor-based pagination also performs better for large data sets under most
  implementations.

  To support cursor-based pagination, this specification defines three query
  parameters&nbsp;— `page[size]`, `page[before]`, and `page[after]`&nbsp;—&nbsp;
  and a method for providing clients with pagination links and cursors in response
  bodies.

  For example, this request would get the next 100 people after the cursor `abcde`:

  ```
  GET /people?page[size]=100&page[after]=abcde
  ```

  Replacing `page[after]` with `page[before]` would allow the client to paginate
  backwards.

  Alternatively, to find all people between cursors `abcde` and `fghij`
  (exclusive), the client could request:

  ```
  GET /people?page[after]=abcde&page[before]=fghij
  ```

  Other combinations are possible, and these parameters are described more below.

# If your profile defines values that can only be used in document members that
# were introduced after JSON:API v1.0, change the minimum_jsonapi_version field
# and fill in the minimum_jsonapi_version_explanation field with an explanation
# of the features you're relying on from the JSON:API version you've indicated.
minimum_jsonapi_version: 1.0
minimum_jsonapi_version_explanation:

# Url of a Github repo or some other place where people can
# ask questions/start discussions about your extension.
discussion_url: http://tets.com

author_name: Ethan Resnick
author_email: ethan.resnick@gmail.com
# Optional fields
author_website: https://ethanresnick.com/
author_phone: +13104398032 # use `tel` url format.

# Valid categories are listed under the profile_categories section
# in https://github.com/json-api/json-api/blob/gh-pages/_config.yml
categories:
  - Pagination
---
# Concepts

## <a id="concepts-sorting"></a> Sorting Requirement

**Pagination only applies to an ordered list of results.** This order must not
change between requests unless the underlying data changes, to ensure that
results don't arbitrarily move between pages.

If the client's paginated request includes a `?sort` query parameter that
only partially orders the results, the server **MUST** apply additional
sorting constraints — consistent with the client-requested ones — to produce
a unique ordering, if it wishes to support pagination of that data.

For example, suppose a client requests `GET /people?sort=age&page[size]=10`.
If multiple people have the same age, their relative ordering is not defined
(and could vary between requests), making pagination impossible. Therefore,
to fulfill the request, the server must treat all paginated requests with
`?sort=age` as though the client had instead asked to sort by age followed
by some unique field or combination of fields (e.g., `?sort=age,id`).

Similarly, when the collection being paginated has no natural or
client-requested order (like the set of resource identifier objects in
a relationship), the server **MUST** assign an order if it wishes to support
pagination.

The server **MAY** reject pagination requests if the client has requested that
the results be sorted in a way that server cannot efficiently paginate. In that
case, the server **MUST** reject the request according to the rules for the
[unsupported sort error].

## <a id="concepts-cursors"></a> Cursors
A "cursor" is a string, created by the server using whatever method it likes,
that divides the list of results into those that fall before the cursor, those
that fall after the cursor, and, optionally, one result that falls "on" the
cursor.

For example, imagine that the list of results being paginated is as follows:

```
[
  { "type": "examples", "id": "1" },
  { "type": "examples", "id": "5" },
  { "type": "examples", "id": "7" },
  { "type": "examples", "id": "8" },
  { "type": "examples", "id": "9" }
]
```

For this list, the server might produce the cursor string `abcde` as its way of
encoding "id = 5". With that cursor, then, the first result would fall before
the cursor, the second result would fall on the cursor, and the other results
would fall after it.

The list of results **MAY** change between the client's pagination requests.
For example, the result with `"id": "5"` might be removed from the result set if
the resource it refers to is deleted. In that case, the cursor `abcde` would no
longer fall on any one result, but the same results would still come before it
and after it.

In rare cases, a server may find it unacceptable for the results list to change
between a client's pagination requests. In those cases, the server **MAY**
encode into the cursor information uniquely identifying the client or its session,
and use that identifier to return consistent results from a single "snapshot" in
time.

# Query Parameters

## `page[size]`

The ```page[size]``` parameter indicates the number of results that the client
would like to see in the response.

If `page[size]` is provided, it **MUST** be a positive integer.<sup>[1](#fn-1)</sup>
If this requirement isn't met — e.g. if `page[size]` is negative — the server
**MUST** respond according to the rules for the [invalid query parameter error].

For each endpoint on which it supports pagintation, a server **MAY** define a
maximum number of results that it will send in response to a paginated request
to that endpoint. This is called the "max page size". If the server does not
choose a max page size for a given endpoint, it is implicitly infinity.

If `page[size]` exceeds the server-defined max page size, the server **MUST**
respond according to the rules for the [max page size exceeded error].

If `page[size]` is omitted, the server **MUST** choose a "default page size".
This default size **MUST** be an integer between 1 and the max page size,
inclusive.

<a id="terms-used-page-size"></a>The `page[size]` value, or the default page
size if `page[size]` is omitted, is called the "used page size".

On any valid paginated request, the number of [pagination items][pagination item]
returned **MUST** equal the used page size&nbsp;—&nbsp;provided there are at
least that many items in the results list, and which satisfy the constraints of
the `page[after]` and/or `page[before]` parameters (if any).

## `page[after]` and `page[before]`

The `page[after]` and `page[before]` parameters are both optional and both, if
provided, take a cursor as their value. If their value is not a valid cursor,
the server **MUST** respond according to the rules for the
[invalid query parameter error].

The `page[after]` parameter is typically sent by the client to get the next page,
while `page[before]` is used to get the prior page.

More formally, when `page[after]` is provided, the returned [paginated data]
**MUST** have as its first item the item that is *immediately after* the cursor
in the results list. (An exception is that, if there are no items in the results
list that fall after the cursor, the returned paginated data **MUST** be an
empty array.)

When `page[before]` is provided, the *last* item returned in the [paginated data]
**MUST** be the item that is closest to, but still before, the cursor in the
unpaginated results list. (Analogous to the above, if there are no items in the
results list that fall before the cursor, the returned paginated data **MUST**
be an empty array.)

For example, imagine that the list of results being paginated is again:

```
[
  { "type": "examples", "id": "1" },
  { "type": "examples", "id": "5" },
  { "type": "examples", "id": "7" },
  { "type": "examples", "id": "8" },
  { "type": "examples", "id": "9" }
]
```

Further, imagine that the cursor `xxx` falls on the entry with `"id": "9"`,
while the cursor `abcde` still falls on the entry with `"id": "5"`.

Then, for example, if the request was:

```
GET /example-data?page[after]=abcde&page[size]=2
```

The response would contain:

```
{
  "links": {
    "prev": "/example-data?page[before]=yyy&page[size]=2",
    "next": "/example-data?page[after]=zzz&page[size]=2"
  },
  "data": [
    // the pagination item metadata is optional below.
    { "type": "examples", "id": "7", "meta": { "page": { "cursor": "yyy" } } },
    { "type": "examples", "id": "8", "meta": { "page": { "cursor": "zzz" } }  }
  ]
}
```

Alternatively, if the request was:

```
GET /example-data?page[before]=xxx&page[size]=3
```

The response would contain:

```
{
  "links": {
    "prev": "/example-data?page[before]=abcde&page[size]=3"
    "next": "/example-data?page[after]=zzz&page[size]=3"
  },
  "data": [
    // again, optional pagination item metadata is allowed for each item here.
    { "type": "examples", "id": "5" },
    { "type": "examples", "id": "7" },
    { "type": "examples", "id": "8" }
  ]
}
```

Notice that the `page[before]=xxx` is causing the last item in the response's
[paginated data] to be the entry with `"id": "8"`, while the number of items in
the paginated data above that item is controlled by the used page size.

### Omitting Both `page[after]` and `page[before]`
If the client's paginated request includes neither the `page[after]` nor the
`page[before]` parameters, the returned [paginated data] **MUST** start with
the first item from the results list. (If the results list is empty, the
paginated data **MUST** be an empty array.)

### <a id="query-range-pagination"></a> Combining `page[after]` and `page[before]`
Clients **MAY** use the `page[after]` and `page[before]` parameters together on
the same request. These are called "range pagination requests", as the client is
asking for all the results starting from immediately after the `page[after]`
cursor and continuing up until the `page[before]` cursor.

Servers are not required to support such requests. If the server chooses not to
support these requests, it **MUST** respond according to the rules for the
[range pagination not supported error].

On range pagination requests, the server **MUST** use its max page size for that
endpoint as the default page size. In other words, the [used page size] will
either by the value of the `page[size]` parameter or the max page size.

If the number of results that satisfy both the `page[after]` and `page[before]`
constraints exceeds the used page size, the server **MUST** respond with the
same [paginated data] that it would have if the `page[before]` parameter had not
been provided. However, in this case the server **MUST** also add
`"rangeTruncated": true` to the [pagination metadata] to indicate to the client
that the paginated data does not contain all the results it requested.

For example, given our example data and cursors above, imagine the client
requests:

```
GET /example-data?page[after]=abcde&page[before]=xxx
```

Then, assuming our server's max page size was greater than 1, the response
would contain:

```
{
  "links": {
    "prev": "/example-data?page[before]=yyy",
    "next": "/example-data?page[after]=zzz"
  },
  "data": [
    { "type": "examples", "id": "7" },
    { "type": "examples", "id": "8" }
  ]
}
```

However, if our server's max page size was 1, or the client included
`page[size]=1` in its request, the response would contain:

```
{
  "meta": {
    "page": { "rangeTruncated": true }
  },
  "links": {
    "prev": "/example-data?page[before]=yyy&page[size]=1",
    "next": "/example-data?page[after]=yyy&page[size]=1"
  },
  "data": [
    { "type": "examples", "id": "7" }
  ]
}
```

# Document Structure

## Terms
This profile uses the following terms to refer to different document elements:

1. <a id="terms-paginated-data"></a>paginated data: an array in a JSON:API
  response document that holds the results that were extracted from a full list
  of results being paginated. It is always the value of a `data` key. When the
  [primary data](https://jsonapi.org/format/#document-top-level) is being
  paginated, the value of the document's top-level `data` key is paginated data.
  When the resource identifier objects in a relationship are being paginated,
  the value of the `data` key in the relationship object is paginated data.

2. <a id="terms-pagination-links"></a>pagination links: the `links` object
  that's a sibling of the paginated data.

3. <a id="terms-pagination-metadata"></a>pagination metadata: the [`page`
  member] of the `meta` object that's a sibling of the paginated data (and
  pagination links).

4. <a id="terms-pagination-item"></a>pagination item: an entry in the
  paginated data array.

5. <a id="terms-pagination-item-metadata"></a>pagination item metadata: the
  [`page` member] of the `meta` object that's at the top-level of a
  paginated data item.

To demonstrate these terms, various elements are labeled in the following
example:

```
GET /people?page[size]=1
```
```
{
  // "pagination links" (for the top-level `data`)
  "links": { },
  "meta": {
    // "pagination metadata"
    "page": {}
  },
  // "paginated data"
  "data": [
    // a "pagination item"
    {
      "type": "people",
      "id": "1",
      // "pagination item metadata" in `page`.
      "meta": { "page": {} },
      "attributes": {},
      "relationships": {
        "friends": {
          // "pagination links".
          // would be non-empty in practice to indicate that the server
          // has chosen to paginate this relationship, even though the
          // client hasn't explicitly asked, which is allowed.
          "links": {},
          // another instance of "paginated data"
          "data": [
            // a "pagination item", with (empty) "pagination item metadata".
            { "type": "people", "id": "3", "meta": { "page": { } } }
          ]
        }
      }
    }
  ]
}
```

## <a id="document-page-meta"></a> `page` Meta Object Members
This profile reserves a `page` member in every JSON:API-defined `meta` object.
(Each of these `page` members constitutes an element defined by this profile,
so they can be [aliased](https://jsonapi.org/format/1.1/#profile-keywords-and-aliases).)

The `page` member, when present, **MUST** hold an object as its value; any other
values are [unrecognized](https://jsonapi.org/format/1.1/#profiles-processing).
The recognized keys/values in these various `page` objects are defined throughout
this specification.


## <a id="document-item-cursors"></a> Item Cursors
The server **MAY** choose to send some or all pagination items back to the client
with a `cursor` member in the [pagination item's metadata][pagination item metadata].
If present, this member **MUST** hold a cursor that (at the time of the response)
["falls on"][cursor] the item it is returned with. Clients can use this cursor
to paginate from this item.

For example, a response might contain:

```
{
  // top-level links, meta, etc. omitted.
  // more people would likely be in the response as well.
  "data": [{
    "type": "people",
    "id": "3",
    "meta": {
      "page": { "cursor": "someOpaqueString" }
    }
    //...
  }]
}
```

With this response, clients could use `page[before]=someOpaqueString` or
`page[after]=someOpaqueString` to paginate from person 3 in either direction.

## Links
JSON:API allows four types of pagination links: [`prev`, `next`, `first`, and
`last`](https://jsonapi.org/format/#fetching-pagination).

It is **RECOMMENDED** that servers include `first` and `last` links when these
are inexpensive to compute.

However, servers **MUST** include a `prev` and a `next` link for each instance
of paginated data in a response.

If a request does not contain the `page[before]` parameter, the server **MUST**
determine whether a next page exists, and return `null` as the `next` link if not.

If a request does not contain the `page[after]` parameter, the server **MUST**
determine whether a previous page exists, and return `null` as the `prev` link
if not.

In all other cases, a server **SHOULD** set these links to `null` when it can
inexpensively determine that the current response is for the first or last page
respectively.

However, if the server can't easily determine whether there are prior results
(when computing the `prev` link) or subsequent results (when computing the
`next` link), it **MAY** use a URI in these links that returns an empty array
as its paginated data.

For example, imagine a request for:

```
GET /example-data?page[before]=xyz
```

To fulfill this request, the server will likely issue a query that filters the
full `example-data` results list to find only records that are before the cursor.
From those query results, the server would not know whether there are additional
results that come *after* the cursor, and it may not have a cheap way to find out.

So, in this case, the server can simply return a `next` URI where the `page[after]`
parameter is set to the [item cursor][item cursors] for the last item in the
response's paginated data.

If the client goes to fetch this link, it will either receive an empty array
as the paginated data, in which case it knows it's reached the end, or it will
get the subsequent results.

> Note: in general, servers are likely to find it more expensive to determine
whether a previous page exists when `page[after]` is in use, and whether a
subsequent page exists when `page[before]` is in use. Luckily, when `page[after]`
is in use, clients usually don't care about the previous page (only the next
one), and vice-versa when `page[before]` is in use. So, by allowing the server
to return a link that might end up corresponding to an empty page, the server
can often skip a query that will never be needed.

## Collection Sizes
The pagination metadata **MAY** contain a `total` member containing an integer
indicating the total number of items in the list of results that's being
paginated.

For example, a response to `GET /people?page[size]=2` might include:

```
{
  "meta": {
    "page": { "total": 200 }
  },
  // links omitted
  "data": [
    {
      "type": "people",
      // ...
    },
    {
      "type": "people",
      // ...
    }
  ]
}
```

The pagination metadata **MAY** also contain an `estimatedTotal` member.
If present, the value of this member **MUST** be an object. That object
**MAY** have one key, `bestGuess`. If present, `bestGuess` **MUST** contain
an integer indicating the server's best estimate of the size of the full results
list.

Server's might choose to use `estimatedTotal` instead of `total` when computing
the exact total is costly.

# Error Cases
## <a id="errors-unsupported-sort"></a> Unsupported Sort Error
The server **MUST** respond to this error by sending a `400 Bad Request`. The
response document **MUST** contain an error object that identifies the `sort`
parameter as the [error's `source`](https://jsonapi.org/format/#error-objects),
and has a `type` link of:

```
https://jsonapi.org/profiles/ethanresnick/cursor-pagination/unsupported-sort
```


## <a id="errors-max-page-size-exceeded"></a> Max Page Size Exceeded Error
The server **MUST** respond to this error by sending a `400 Bad Request`. The
response document **MUST** contain an error object that:

- identifies `page[size]` as the error's `source`;
- provides the maximum page size as an integer in `maxSize` member of the `page`
  element in the error object's `meta` object; and
- includes a `type` link of:

  ```
  https://jsonapi.org/profiles/ethanresnick/cursor-pagination/max-size-exceeded
  ```

If this profile's `page` element has not been [aliased](https://jsonapi.org/format/1.1/#profile-keywords-and-aliases),
the error object might look like:

```
{
  "status": "400",
  "meta": {
    "page": { "maxSize": 100 }
  },
  "title": "Page size requested is too large.",
  "detail": "You requested a size of 200, but 100 is the maximum.",
  "source": {
    "parameter": "page[size]"
  },
  "links": {
    "type": ["https://jsonapi.org/profiles/ethanresnick/cursor-pagination/max-size-exceeded"]
  }
}
```

## <a id="errors-invalid-query-parameter"></a> Invalid Parameter Value Error
The server **MUST** respond to this error by sending a `400 Bad Request` with an
error object in the response document that identifies the problematic parameter
in the error object's `source` member.

For example, the server might send:

```
{
  "errors": [{
    "title": "Invalid Parameter.",
    "detail": "page[size] must be a positive integer; got 0",
    "source": { "parameter": "page[size]" },
    "status": "400"
  }]
}
```

## <a id="errors-range-pagination-not-supported"></a> Range Pagination Not Supported Error
The server **MUST** respond to this error by sending a `400 Bad Request`. The
response document **MUST** contain an error object that has a `type` link of:

```
https://jsonapi.org/profiles/ethanresnick/cursor-pagination/range-pagination-not-supported
```

# Notes

1. <a id="fn-1"></a> Technically, a URI is a series of characters, so the value
   of a query parameter -- including `page[size]` -- is always a string. When
   the text says the value "MUST be a positive integer", it means more precisely
   that the value **MUST** be a sequence of characters matching the regular
   expression `^[0-9]+$`, which **MUST** then be interpreted as a base-10 integer.


[sorting requirement]: #concepts-sorting
[cursor]: #concepts-cursors

[`page` member]: #document-page-meta
[item cursors]: #document-item-cursors

[range pagination]: #query-range-pagination

[used page size]: #terms-used-page-size
[paginated data]: #terms-paginated-data
[pagination metadata]: #terms-pagination-metadata
[pagination item]: #terms-pagination-item
[pagination item metadata]: #terms-pagination-item-metadata

[unsupported sort error]: #errors-unsupported-sort
[max page size exceeded error]: #errors-max-page-size-exceeded
[invalid query parameter error]: #errors-invalid-query-parameter
[range pagination not supported error]: #errors-range-pagination-not-supported
