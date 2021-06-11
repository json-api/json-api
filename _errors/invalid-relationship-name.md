---
---
A provided [relationship's](https://jsonapi.org/format/1.1/#document-resource-object-relationships) name is not legal. Its name might be invalid according to JSON:API's requirements for [member names](https://jsonapi.org/format/1.1/#document-member-names). More likely, though, it is simply illegal for the resource object in which it was provided, according to the business rules of this API. 

The error object's `source` member may offer more details on which relationship caused the problem.

