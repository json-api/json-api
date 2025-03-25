# Included Extension

This extension provides a means to embed included resources within the related [resource identifier object](https://jsonapi.org/format/1.1/#document-resource-identifier-objects) instead of the top-level `included` member. 

## <a href="#namespace" id="namespace" class="headerlink"></a> Namespace

This extension uses the namespace `included`.

> Note: JSON:API extensions can only introduce new document members using a
> reserved namespace as a prefix.

## <a href="#document-structure" id="document-structure" class="headerlink"></a> Document Structure

A document that supports this extension MAY embed included resources within the related [resource identifier object](https://jsonapi.org/format/1.1/#document-resource-identifier-objects) instead of the top-level `included` member.
 
This extension adds the following members to related [resource identifier object](https://jsonapi.org/format/1.1/#document-resource-identifier-objects):
* `included:attributes`
* `included:relationships`
* `included:links`

A complete example document with multiple included relationships:

```json
{
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "JSON:API paints my bikeshed!"
    },
    "links": {
      "self": "http://example.com/articles/1"
    },
    "relationships": {
      "author": {
        "links": {
          "self": "http://example.com/articles/1/relationships/author",
          "related": "http://example.com/articles/1/author"
        },
        "data": { "type": "people", "id": "9" },
        "included:attributes": {
          "firstName": "Dan",
          "lastName": "Gebhardt",
          "twitter": "dgeb"
        },
        "included:links": {
          "self": "http://example.com/people/9"
        }
      },
      "comments": {
        "links": {
          "self": "http://example.com/articles/1/relationships/comments",
          "related": "http://example.com/articles/1/comments"
        },
        "data": [
          { 
            "type": "comments", 
            "id": "5",
            "included:attributes": {
              "body": "First!"
            },
            "included:relationships": {
              "author": {
                "data": { "type": "people", "id": "2" }
              }
            },
            "included:links": {
              "self": "http://example.com/comments/5"
            } 
          },
          { 
            "type": "comments", 
            "id": "12",
            "included:attributes": {
              "body": "I like XML better"
            },
            "included:relationships": {
              "author": {
                "data": { "type": "people", "id": "9" }
              }
            },
            "included:links": {
              "self": "http://example.com/comments/12"
            } 
          }
        ]
      }
    }
  }
}
```




