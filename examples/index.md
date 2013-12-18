---
layout: page
title: "JSON API: Examples"
---

Examples are excellent learning aids. The following projects implementing JSON
API are divided into server- and client-side. The server-side is further
divided by implementation language. If you'd like your project listed, [send a
Pull Request](https://github.com/json-api/json-api).

## Client

* [ember-data](https://github.com/emberjs/data) is one of the original exemplar
implementations. There is a [custom adapter](https://github.com/daliwali/ember-json-api) to support json-api.

* [backbone-jsonapi](https://github.com/guillaumervls/backbone-jsonapi) is a Backbone adapter for JSON API. Supports fetching Models & Collections from a JSON API source.

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

## Messages

* [RestPack::Serializer provides examples](http://restpack-serializer-sample.herokuapp.com/) which demonstrate sample responses.
