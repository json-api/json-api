---
layout: page
title: JSON API
---

## Abstract

This document describes the 'application/vnd.api+json' media type. It is
currently going through the process of being registered with IANA.

There are two JSON API styles:

* [The ID Style](#toc_id-based-json-api)
* [The URL Style](#toc_url-based-json-api)

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

## Document

In this specification, the term "document" refers to a single object with a
set of attributes and relationships.

A JSON response may include multiple documents, as described in this
specification.

## Reserved Attributes

There are three reserved attribute names in JSON API:

* `id`
* `href`
* `rels`

Each of these names has a special meaning when included in the
attributes section and should not be used as attribute names.
