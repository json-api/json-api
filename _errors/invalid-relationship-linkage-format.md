---
title: Invalid Resource Linkage
---
A provided [relationship object](https://jsonapi.org/format/1.1/#document-resource-object-relationships) either: 

- contained an array for its [resource linkage](https://jsonapi.org/format/1.1/#document-resource-object-linkage) (under the `data` key), when a single resource identifier object or `null` was expected; or, conversely, 

- contained singular linkage when an array was expected.

"To-one" relationships generally expect their resource linkage to not be in an array, while "to-many" relationships require an array.

The error object's `source` member may offer more details on which relationship caused the problem.

