---
title: Invalid Resource Object Structure
---
A provided resource object contained an attribute and a relationship with the same name. This is not allowed, because attribute and relationships are treated as one single set of "[fields](https://jsonapi.org/format/1.1/#document-resource-object-fields)".

The error object's `source` member may provide more details about where the problem occurred.
