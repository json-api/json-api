---
layout: page
title: "JSON API: Examples"
---

Examples are excellent learning aids. The following projects implementing JSON
API are divided into server- and client-side. The server-side is further
divided by implementation language. If you'd like your project listed, [send a
Pull Request](https://github.com/json-api/json-api).

## Client

### JavaScript

* [ember-data](https://github.com/emberjs/data) is one of the original exemplar
implementations. There is a [custom adapter](https://github.com/daliwali/ember-json-api) to support json-api.

* [backbone-jsonapi](https://github.com/guillaumervls/backbone-jsonapi) is a Backbone adapter for JSON API. Supports fetching Models & Collections from a JSON API source.

### iOS

* [jsonapi-ios](https://github.com/joshdholtz/jsonapi-ios) is a library for loading data from a JSON API datasource. Parses JSON API data into models with support for auto-linking of resources and custom model classes.

## Server

### PHP

* [FriendsOfSymfony / FOSRestBundle](https://github.com/FriendsOfSymfony/FOSRestBundle/issues/452)

### Node.js

* [Fortune.js](http://fortunejs.com) is a framework built to implement json-api.

### Ruby

* [ActiveModel::Serializers](https://github.com/rails-api/active_model_serializers)
is one of the original exemplar implementations, but is slightly out of date at
the moment.

* [The rabl wiki](https://github.com/nesquena/rabl/wiki/Conforming-to-jsonapi.org-format)
has page describing how to emit conformant JSON.

* [RestPack::Serializer](https://github.com/RestPack/restpack_serializer) implements the read elements of json-api. It also supports paging and side-loading.

* [Oat](https://github.com/ismasan/oat#adapters) ships with a JSON API adapter.

### Python

* [Hy](https://github.com/kalasjocke/hy) is a library for creating json-api responses.

## Messages

* [RestPack::Serializer provides examples](http://restpack-serializer-sample.herokuapp.com/) which demonstrate sample responses.

## Related Tools

### Ruby

* [json-patch](https://github.com/guillec/json-patch) implementation of JSON Patch (rfc6902) 

* [hana](https://github.com/tenderlove/hana) implementation of the JSON Patch and JSON pointer spec 

### Node.js

* [json-patch](https://www.npmjs.org/package/json-patch) implementation of JSON Patch (rfc6902)