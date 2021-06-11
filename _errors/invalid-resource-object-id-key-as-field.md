---
title: Resource object contains a `type` or `id` field
---
A resource object contained an attribute or relationship named `type` or `id`, whic is illegal because those keys are reserved for resource object identification. See [Resource Object Fields](https://jsonapi.org/format/1.1/#document-resource-object-fields).

The error object's `source` member may help identify the problematic resource object.
