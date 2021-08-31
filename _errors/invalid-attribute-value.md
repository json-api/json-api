---
---
A provided [attribute's](https://jsonapi.org/format/1.1/#document-resource-object-attributes) value is not legal. Its value might be invalid according to JSON:API's restrictions on [complex attribute values](https://jsonapi.org/format/1.1/#document-resource-object-attributes). More likely, though, it is simply illegal for the resource object in which it was provided, according to the business rules of this API. 

The error object's `source` member may offer more details on which attribute caused the problem.

