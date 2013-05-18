---
layout: page
title: JSON API
---

## Description

"JSON API" is a JSON-based read/write hypermedia-type designed to support
a smart client who wishes build a data-store of information.

{% include status.md %}

## MIME Types

- 'application/vnd.api+json' (application pending)

## Format documentation

There are two JSON API styles:

* [The ID Style](/format#id-based-json-api)
* [The URL Style](/format#url-based-json-api)

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

## Update history

- 2013-05-03: Initial release of the draft.

You can subscribe to an RSS feed of individual changes [here](https://github.com/json-api/json-api/commits.atom).
