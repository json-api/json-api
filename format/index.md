---
layout: page
title: "格式"
---

{% include status.md %}

## 介绍 <a href="#introduction" id="introduction" class="headerlink"></a>

JSON API 是数据交互规范，用以定义客户端如何获取与修改资源，以及服务器如何响应对应请求。

JSON API设计用来最小化请求的数量，以及客户端与服务器间传输的数据量。在高效实现的同时，无需牺牲可读性、灵活性和可发现性。

JSON API需要使用JSON API媒体类型([`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json)) 进行数据交互。

JSON API服务器支持通过GET方法获取资源。而且必须独立实现HTTP POST, PUT和DELETE方法的请求响应，以支持资源的创建、更新和删除。

JSON API服务器也可以选择性支持HTTP PATCH方法 [[RFC5789](http://tools.ietf.org/html/rfc5789)]和JSON Patch格式 [[RFC6902](http://tools.ietf.org/html/rfc6902)]，进行资源修改。JSON Patch支持是可行的，因为理论上来说，JSON API通过单一JSON 文档，反映域下的所有资源，并将JSON文档作为资源操作介质。在文档顶层，依据资源类型分组。每个资源都通过文档下的唯一路径辨识。

## 规则约定 <a href="#conventions" id="conventions" class="headerlink"></a>

文档中的关键字， "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD",
"SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" 依据RFC 2119
[[RFC2119](http://tools.ietf.org/html/rfc2119)]规范解释。

## 文档结构 <a href="#document-structure" id="document-structure" class="headerlink"></a>

这一章节描述JSON API文档结构，通过媒体类型[`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json)标示。JSON API文档使用javascript 对象（JSON）[[RFC4627](http://tools.ietf.org/html/rfc4627)]定义。

尽管同种媒体类型用以请求和响应文档，但某些特性只适用于其中一种。差异在下面呈现。

### Top Level <a href="#document-structure-top-level" id="document-structure-top-level" class="headerlink"></a>

JSON 对象必须位于每个JSON API文档的根级。这个对象定义文档的“top level”。

文档的top level必须包含请求资源或者请求资源集合的实例 (即主要资源)。

主要资源应该以资源类型或者通用键`"data"`索引.

* `"meta"`: 资源的元信息，比如分页.
* `"links"`: 扩展资源关联URLs的URL模板.
* `"linked"`: 资源对象集合，按照类型分组，链接到主要资源或彼此（即链接资源）

### 资源表示 <a href="#document-structure-resource-representations" id="document-structure-resource-representations" class="headerlink"></a>

这一章节描述JSON API文档如何表示资源。适用于主要资源和链接资源。

#### 个体资源表示 <a href="#document-structure-individual-resource-representations" id="document-structure-individual-resource-representations" class="headerlink"></a>

个体资源使用单一“资源对象”（如下描述）或者包含资源ID（如下描述）的字符串表示。

The following post is represented as a resource object:
下面的post表示一个资源对象：

```javascript
{
  "posts": {
    "id": "1",
    // ... attributes of this post
  }
}
```

这个post用ID简单地表示：

```javascript
{
  "posts": "1"
}
```

#### 资源集合表示 <a href="#document-structure-resource-collection-representations" id="document-structure-resource-collection-representations" class="headerlink"></a>

任意数量资源的集合应该使用资源对象数组，或者IDs数组，或者一个简单的”集合对象“表示。

下面这个post使用资源对象数组表示：

```javascript
{
  "posts": [{
    "id": "1"
    // ... attributes of this post
  }, {
    "id": "2"
    // ... attributes of this post
  }]
}
```

这个posts使用IDs数组表示：

```javascript
{
  "posts": ["1", "2"]
}
```

这些comments使用单一集合对象表示：

```javascript
{
  "comments": {
    "href": "http://example.com/comments/5,12,17,20",
    "ids": [ "5", "12", "17", "20" ],
    "type": "comments"
  }
}
```

### 多资源对象 <a href="#document-structure-resource-objects" id="document-structure-resource-objects" class="headerlink"></a>

多个资源对象有相同的内部结构，不管他们表示主要资源还是链接资源。

下面是一个可能出现在文档中的post（即”posts"类型的一个资源）：

```javascript
{
  "posts": {
    "id": "1",
    "title": "Rails is Omakase"
  }
}
```

在上面这个例子中，post的资源对象比较简单：

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase"
  }
//...
```

这一章节专注于资源对象，在完整JSON API文档上下文环境之外。

#### 资源属性 <a href="#document-structure-resource-object-attributes" id="document-structure-resource-object-attributes" class="headerlink"></a>

资源对象有四个保留字:

* `"id"`
* `"type"`
* `"href"`
* `"links"`

资源对象中的其它键表示一个“属性”。一个属性值可以是任何JSON值。

####  资源 IDs <a href="#document-structure-resource-object-ids" id="document-structure-resource-object-ids" class="headerlink"></a>

Each resource object **SHOULD** contain a unique identifier, or ID, when
available. IDs **MAY** be assigned by the server or by the client, as described
below, and **SHOULD** be unique for a resource when scoped by its type. An ID
**SHOULD** be represented by an `"id"` key and its value **MUST** be a string
which **SHOULD** only contain alphanumeric characters, dashes and underscores.

每一个资源对象应该有一个唯一标示符，或者ID。如下所示，IDs可由服务器或者客户端指定，and **SHOULD** be unique for a resource when scoped by its type. ID应该使用 `"id"`键表示，值必须是字符串，且只包含字母，数字，连字符和下划线。

URL 模板可以使用IDs来获取关联资源，如下所示。

在特殊场景下，客户端与服务器之间的唯一标识符信息非必要，JSON API允许缺省IDs。

#### 资源类型 <a href="#document-structure-resource-types" id="document-structure-resource-types" class="headerlink"></a>

每个资源对象的类型通常由它所在的上下文环境决定。如上面讨论，资源对象在文档中通过类型索引。

每一个资源对象可能包含 `"type"` 键来显示指定类型。

当资源的类型在文档中未声明时，`"type"`键不可缺省。

#### 资源 URLs <a href="#document-structure-resource-urls" id="document-structure-resource-urls" class="headerlink"></a>

每一个资源的URL可能使用`"href"`键声明。资源URLs应该由服务器指定，因此通常包含在响应文档中。

```javascript
//...
  [{
    "id": "1",
    "href": "http://example.com/comments/1",
    "body": "Mmmmmakase"
  }, {
    "id": "2",
    "href": "http://example.com/comments/2",
    "body": "I prefer unagi"
  }]
//...
```

服务器对特定URL`GET`请求，响应内容必须包含资源。

通常在响应文档的根层级声明URL 模板会更高效，而不是在每一个资源对象内声明独立的URLs。

#### 资源关联 <a href="#document-structure-resource-relationships" id="document-structure-resource-relationships" class="headerlink"></a>

`"linkes"`键的值是一个表示链接资源的JSON对象，通过关联名索引。

举例来说，下面的post与一个`author`和一个`comments`集合相关联：

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "9",
      "comments": [ "5", "12", "17", "20" ]
    }
  }
//...
```

##### 单对象关联 <a href="#document-structure-resource-relationships-to-one" id="document-structure-resource-relationships-to-one" class="headerlink"></a>

单对象关联必须使用上面所述单资源形式的一种来表示。

举例来说，下面的post与一个author相关联，通过ID标示：

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "17"
    }
  }
//...
```

下面是一个示例，链接的author用一个资源对象表示：

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": {
        "href": "http://example.com/people/17",
        "id": "17",
        "type": "people"
      }
    }
  }
//...
```

空白的单对象关联应该用`null`值表示。举例来说，下面的post没有关联author:

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": null
    }
  }
//...
```

##### 多对象关联 <a href="#document-structure-resource-relationships-to-many" id="document-structure-resource-relationships-to-many" class="headerlink"></a>

多对象关联必须使用上述资源集合形式的一种来表示。

举例来说，下面的post与多个comments关联，通过IDs标示：

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": [ "5", "12", "17", "20" ]
    }
  }
//...
```

这是一个使用集合对象链接的comments数组：

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": {
        "href": "http://example.com/comments/5,12,17,20",
        "ids": [ "5", "12", "17", "20" ],
        "type": "comments"
      }
    }
  }
//...
```

空白的多对象关联应该使用空数组表示。举例来说，下面的post没有comments：

```javascript
//...
  {
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": []
    }
  }
//...
```

### 集合对象 <a href="#document-structure-collection-objects" id="document-structure-collection-objects" class="headerlink"></a>

“集合对象”包含一个或多个元素：

* `"ids"` - 关联资源的IDs数组。
* `"type"` - 资源类型
* `"href"` - 关联资源的URL（适用于响应文档）。

提供包含`href`属性集合对象的服务器，必须响应特定URL `GET` 请求，响应内容包含资源对象集合的关联资源。

### URL模板 <a href="#document-structure-url-templates" id="document-structure-url-templates" class="headerlink"></a>

顶层的 `"links"` 对象可用来声明URL模板，从而依据资源对象类型获取最终URLs。

举例说明:

```javascript
{
  "links": {
    "posts.comments": "http://example.com/comments?posts={posts.id}"
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase"
  }, {
    "id": "2",
    "title": "The Parley Letter"
  }]
}
```

在这个示例中，请求`http://example.com/comments?posts=1` 将会得到`"Rails is Omakase"`的comments，请求`http://example.com/comments?posts=2` 将会得到 `"The Parley
Letter"`的comments.

下面是另外一个示例:

```javascript
{
  "links": {
    "posts.comments": "http://example.com/comments/{posts.comments}"
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "comments": [ "1", "2", "3", "4" ]
    }
  }]
}
```

在这个示例中，处理每个post`"links"`区块内的特定数组，以扩展`posts.comments`变量。URI模板规范 [[RFC6570](https://tools.ietf.org/html/rfc6570)]声明默认处理方式，使用%编码（即`encodeURIComponent()` javascript原生方法）编码每一个元素，然后用逗号连接。在这个示例中，请求`http://example.com/comments/1,2,3,4` ，将会获取一个`comments`列表。

顶层 `"linkes"`对象具有以下行为:

* 每个键使用点分隔路径，指向重复的关联。路径以特定资源类型名开头，遍历相关的资源。举例来  说，`"posts.comments"`指向每个`"posts"`对象的`"comments"`关联.
* 每个键的值作为URL模板处理。
* 每个path指向的资源，就像是使用实际指定的非URL值扩展URL模板形成的关联。

这是另外一个使用单对象关联的示例：

```javascript
{
  "links": {
    "posts.author": "http://example.com/people/{posts.author}"
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "12"
    }
  }, {
    "id": "2",
    "title": "The Parley Letter",
    "links": {
      "author": "12"
    }
  }, {
    "id": "3",
    "title": "Dependency Injection is Not a Virtue",
    "links": {
      "author": "12"
    }
  }]
}
```

这个实例中，三个posts指向author的URL都为`http://example.com/people/12`.

顶层URL模板允许指定关联作为IDs，但是不要求客户端硬编码来获取URLs的信息.

注意：为防止冲突，单独资源对象的`links`对象优先级高于顶层的`links`对象。
### 复合文档 <a href="#document-structure-compound-documents" id="document-structure-compound-documents" class="headerlink"></a>

为减少HTTP请求，响应需要返回所请求的主要资源，同时可以选择性的包含链接资源。这样的响应称作“复合文档”。

在复合文档中，链接资源必须作为资源对象，包含在文档顶层`"linked"`对象中，依据类型，组合到不同数组中。

每个关联的类型，可以在资源层级，或顶层`"links"`对象层级，使用`"type"`键指定。能够辅助客户端查询链接资源对象。

```javascript
{
  "links": {
    "posts.author": {
      "href": "http://example.com/people/{posts.author}",
      "type": "people"
    },
    "posts.comments": {
      "href": "http://example.com/comments/{posts.comments}",
      "type": "comments"
    }
  },
  "posts": [{
    "id": "1",
    "title": "Rails is Omakase",
    "links": {
      "author": "9",
      "comments": [ "1", "2", "3" ]
    }}, {
    "id": "2",
    "title": "The Parley Letter",
    "links": {
      "author": "9",
      "comments": [ "4", "5" ]
   }}, {
    "id": "1",
    "title": "Dependency Injection is Not a Virtue",
    "links": {
      "author": "9",
      "comments": [ "6" ]
    }
  }],
  "linked": {
    "people": [{
      "id": "9",
      "name": "@d2h"
    }],
    "comments": [{
      "id": "1",
      "body": "Mmmmmakase"
    }, {
      "id": "2",
      "body": "I prefer unagi"
    }, {
      "id": "3",
      "body": "What's Omakase?"
    }, {
      "id": "4",
      "body": "Parley is a discussion, especially one between enemies"
    }, {
      "id": "5",
      "body": "The parsley letter"
    }, {
      "id": "6",
      "body": "Dependency Injection is Not a Vice"
    }]
  }
}
```

这种处理方式，保证随每个响应返回每个文档的单例，即使当相同的文档被多次引用时（这个实例中三个posts的author）。沿着这种方式，如果主要文档链接到另外的主要或链接文档，在`"linked"`对象中也不应该重复。


## URLs <a href="#urls" id="urls" class="headerlink"></a>

### 关联文档 <a href="#urls-reference-document" id="urls-reference-document" class="headerlink"></a>

When determining an API's URL structure, it is helpful to consider that all of
its resources exist in a single "reference document" in which each resource is
addressable at a unique path. Resources are grouped by type at the top level of
this document. Individual resources are keyed by ID within these typed
collections. Attributes and links within individual resources are uniquely
addressable according to the resource object structure described above.

This concept of a reference document is used to determine appropriate URLs for
resources as well as their relationships. It is important to understand that
this reference document differs slightly in structure from documents used to
transport resources due to different goals and constraints. For instance,
collections in the reference document are represented as sets because members
must be addressable by ID, while collections are represented as arrays in
transport documents because order is significant.

### URLs for Resource Collections <a href="#urls-resource-collections" id="urls-resource-collections" class="headerlink"></a>

The URL for a collection of resources **SHOULD** be formed from the resource
type.

For example, a collection of resources of type "photos" will have the URL:

```text
/photos
```

### URLs for Individual Resources <a href="#urls-individual-resources" id="urls-individual-resources" class="headerlink"></a>

Collections of resources **SHOULD** be treated as sets keyed by resource ID. The
URL for an individual resource **SHOULD** be formed by appending the resource's
ID to the collection URL.

For example, a photo with an ID of `"1"` will have the URL:

```text
/photos/1
```

The URL for multiple individual resources **SHOULD** be formed by appending a
comma-separated list of resource IDs to the collection URL.

For example, the photos with IDs of `"1"`, `"2"` and `"3"` will collectively
have the URL:

```text
/photos/1,2,3
```

### Alternative URLs <a href="#urls-alternative" id="urls-alternative" class="headerlink"></a>

Alternative URLs for resources **MAY** optionally be specified in responses with
`"href"` members or URL templates.

### Relationship URLs <a href="#urls-relationships" id="urls-relationships" class="headerlink"></a>

A resource's relationship **MAY** be accessible at a URL formed by appending
`/links/<relationship-name>` to the resource's URL. This relative path is
consistent with the internal structure of a resource object.

For example, a photo's collection of linked comments will have the URL:

```text
/photos/1/links/comments
```

A photo's reference to an individual linked photographer will have the URL:

```text
/photos/1/links/photographer
```

A server **MUST** represent "to-one" relationships as individual resources and
"to-many" relationships as resource collections.


## Fetching Resources <a href="#fetching" id="fetching" class="headerlink"></a>

A resource, or collection of resources, can be fetched by sending a `GET`
request to the URL described above.

Responses can be further refined with the optional features described below. 

### Filtering <a href="#fetching-filtering" id="fetching-filtering" class="headerlink"></a>

A server **MAY** choose to support requests to filter resources according to
specific criteria.

Filtering **SHOULD** be supported by appending parameters to the base URL for
the collection of resources to be filtered.

For example, the following is a request for all comments associated with a
particular post:

```text
GET /comments?posts=1
```

With this approach, multiple filters **MAY** be applied to a single request:

```text
GET /comments?posts=1&author=12
```

This specification only supports filtering based upon strict matching.
Additional filtering allowed by an API should be specified in its profile (see
[Extending](/extending)).

### Inclusion of Linked Resources <a href="#fetching-includes" id="fetching-includes" class="headerlink"></a>

A server **MAY** choose to support returning compound documents that include
both primary and linked resource objects.

An endpoint **MAY** return resources linked to the primary resource(s) by
default.

An endpoint **MAY** also support custom inclusion of linked resources based upon
an `include` request parameter. This parameter should specify the path to one or
more resources relative to the primary resource. If this parameter is used,
**ONLY** the requested linked resources should be returned alongside the primary
resource(s).

For instance, comments could be requested with a post:

```text
GET /posts/1?include=comments
```

In order to request resources linked to other resources, the dot-separated path
of each relationship should be specified:

```text
GET /posts/1?include=comments.author
```

Note: a request for `comments.author` should not automatically also include
`comments` in the response (although comments will obviously need to be queried
in order to fulfill the request for their authors).

Multiple linked resources could be requested in a comma-separated list:

```text
GET /posts/1?include=author,comments,comments.author
```

### Sparse Fieldsets <a href="#fetching-sparse-fieldsets" id="fetching-sparse-fieldsets" class="headerlink"></a>

A server **MAY** choose to support requests to return only specific fields in
resource object.

An endpoint **MAY** support requests that specify fields for the primary
resource type with a `fields` parameter.

```text
GET /people?fields=id,name,age
```

An endpoint **MAY** support requests that specify fields for any resource type
with a `fields[TYPE]` parameter.

```text
GET /posts?include=author&fields[posts]=id,title&fields[people]=id,name
```

An endpoint **SHOULD** return a default set of fields in a resource object if no
fields have been specified for its type, or if the endpoint does not support use
of either `fields` or `fields[TYPE]`.

An endpoint **MAY** also choose to always return a limited set of 
non-specified fields, such as `id` or `href`.

Note: `fields` and `fields[TYPE]` can not be mixed. If the latter format is
used, then it must be used for the primary resource type as well.

### Sorting <a href="#fetching-sorting" id="fetching-sorting" class="headerlink"></a>

A server **MAY** choose to support requests to sort resource collections
according to one or more criteria.

An endpoint **MAY** support requests to sort the primary resource type with a
`sort` parameter.

```text
GET /people?sort=age
```

An endpoint **MAY** support multiple sort criteria by allowing comma-separated
fields as the value for `sort`. Sort criteria should be applied in the order
specified.

```text
GET /people?sort=age,name
```

The default sort order **SHOULD** be ascending. A `-` prefix on any sort field
specifies a descending sort order.

```text
GET /posts?sort=-created,title
```

The above example should return the newest posts first. Any posts created on the
same date will then be sorted by their title in ascending alpabetical order.

An endpoint **MAY** support requests to sort any resource type with a
`sort[TYPE]` parameter.

```text
GET /posts?include=author&sort[posts]=-created,title&sort[people]=name
```

If no sort order is specified, or if the endpoint does not support use of either
`sort` or `sort[TYPE]`, then the endpoint **SHOULD** return resource objects
sorted with a repeatable algorithm. In other words, resources **SHOULD** always
be returned in the same order, even if the sort criteria aren't specified.

Note: `sort` and `sort[TYPE]` can not be mixed. If the latter format is used,
then it **MUST** be used for the primary resource type as well.


## Creating, Updating and Deleting Resources <a href="#crud" id="crud" class="headerlink"></a>

A server **MAY** allow resources that can be fetched to also be created,
modified and deleted.

A server **MAY** allow multiple resources to be updated in a single request, as
discussed below. Updates to multiple resources **MUST** completely succeed or
fail. No partial updates are allowed.

Any requests that contain content **MUST** include a `Content-Type` header whose
value is `application/vnd.api+json`.

### Creating Resources <a href="#crud-creating-resources" id="crud-creating-resources" class="headerlink"></a>

A server that supports creating resources **MUST** support creating individual
resources and **MAY** optionally support creating multiple resources in a single
request.

One or more resources can be *created* by making a `POST` request to the URL
that represents a collection of resources to which the new resource should
belong.

#### Creating an Individual Resource <a href="#crud-creating-individual-resources" id="crud-creating-individual-resources" class="headerlink"></a>

A request to create an individual resource **MUST** include a single primary
resource object.

For instance, a new photo might be created with the following request:

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "photos": {
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

#### Creating Multiple Resources <a href="#crud-creating-multiple-resources" id="crud-creating-multiple-resources" class="headerlink"></a>

A request to create multiple resources **MUST** include a collection of primary
resource objects.

For instance, multiple photos might be created with the following request:

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "photos": [{
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }, {
    "title": "Mustaches on a Stick",
    "src": "http://example.com/images/mustaches.png"
  }]
}
```

#### Responses <a href="#crud-creating-responses" id="crud-creating-responses" class="headerlink"></a>

##### 201 Created <a href="#crud-creating-responses-201" id="crud-creating-responses-201" class="headerlink"></a>

A server **MUST** respond to a successful resource creation request according to
[`HTTP semantics`](http://tools.ietf.org/html/draft-ietf-
httpbis-p2-semantics-22#section-6.3).

When one or more resources has been created, the server **MUST** return a `201
Created` status code.

The response **MUST** include a `Location` header identifying the location of
_all_ resources created by the request.

If a single resource is created and that resource's object includes an `href`
key, the `Location` URL **MUST** match the `href` value.

The response **SHOULD** also include a document that contains the primary
resource(s) created. If absent, the client **SHOULD** treat the transmitted
document as accepted without modification.

```text
HTTP/1.1 201 Created
Location: http://example.com/photos/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/vnd.api+json

{
  "photos": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "href": "http://example.com/photos/550e8400-e29b-41d4-a716-446655440000",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

##### Other Responses <a href="#crud-creating-responses-other" id="crud-creating-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error details
**MAY** also be returned, as discussed below.

#### Client-Generated IDs <a href="#crud-creating-client-ids" id="crud-creating-client-ids" class="headerlink"></a>

A server **MAY** accept client-generated IDs along with requests to create one
or more resources. IDs **MUST** be specified with an `"id"` key, the value of 
which **MUST** be a properly generated and formatted *UUID*.

For example:

```text
POST /photos
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "photos": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Ember Hamster",
    "src": "http://example.com/images/productivity.png"
  }
}
```

### Updating Resources <a href="#crud-updating" id="crud-updating" class="headerlink"></a>

A server that supports updating resources **MUST** support updating individual
resources and **MAY** optionally support updating multiple resources in a single
request.

Resources can be updated by making a `PUT` request to the URL that represents
either the individual or multiple individual resources.

#### Updating an Individual Resource <a href="#crud-updating-individual-resources" id="crud-updating-individual-resources" class="headerlink"></a>

To update an individual resource, send a `PUT` request to the URL that
represents the resource. The request **MUST** include a single top-level
resource object.

For example:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "articles": {
    "id": "1",
    "title": "To TDD or Not"
  }
}
```

#### Updating Multiple Resources <a href="#crud-updating-multiple-resources" id="crud-updating-multiple-resources" class="headerlink"></a>

To update multiple resources, send a `PUT` request to the URL that represents
the multiple individual resources (NOT the entire collection of resources). The
request **MUST** include a top-level collection of resource objects that each
contain an `"id"` member.

For example:

```text
PUT /articles/1,2
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "articles": [{
    "id": "1",
    "title": "To TDD or Not"
  }, {
    "id": "2",
    "title": "LOL Engineering"
  }]
}
```

#### Updating Attributes <a href="#crud-updating-attributes" id="crud-updating-attributes" class="headerlink"></a>

To update one or more attributes of a resource, the primary resource object
should include only the attributes to be updated. Attributes omitted from the
resource object should not be updated.

For example, the following `PUT` request will only update the `title` and `text`
attributes of an article:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "articles": {
    "id": "1",
    "title": "To TDD or Not",
    "text": "TLDR; It's complicated... but check your test coverage regardless."
  }
}
```

#### Updating Relationships <a href="#crud-updating-relationships" id="crud-updating-relationships" class="headerlink"></a>

##### Updating To-One Relationships <a href="#crud-updating-to-one-relationships" id="crud-updating-to-one-relationships" class="headerlink"></a>

To-one relationships **MAY** be updated along with other attributes by including
them in a `links` object within the resource object in a `PUT` request.

For instance, the following `PUT` request will update the `title` and `author`
attributes of an article:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "articles": {
    "title": "Rails is a Melting Pot",
    "links": {
      "author": "1"
    }
  }
}
```

In order to remove a to-one relationship, specify `null` as the value of the
relationship.

Alternatively, a to-one relationship **MAY** optionally be accessible at its
relationship URL (see above).

A to-one relationship **MAY** be added by sending a `POST` request with an
individual primary resource to the URL of the relationship. For example:

```text
POST /articles/1/links/author
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "people": "12"
}
```

A to-one relationship **MAY** be removed by sending a `DELETE` request to the URL
of the relationship. For example:

```text
DELETE /articles/1/links/author
```

##### Updating To-Many Relationships <a href="#crud-updating-to-many-relationships" id="crud-updating-to-many-relationships" class="headerlink"></a>

To-many relationships **MAY** optionally be updated with other attributes by
including them in a `links` object within the document in a `PUT` request.

For instance, the following `PUT` request performs a complete replacement of the
`tags` for an article:

```text
PUT /articles/1
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "articles": {
    "id": "1",
    "title": "Rails is a Melting Pot",
    "links": {
      "tags": ["2", "3"]
    }
  }
}
```

In order to remove every member of a to-many relationship, specify an empty
array (`[]`) as the value of the relationship.

Replacing a complete set of data is not always appropriate in a distributed
system which may involve many editors. An alternative is to allow relationships
to be added and removed individually.

To facilitate fine-grained access, a to-many relationship **MAY** optionally be
accessible at its relationship URL (see above).

A to-many relationship **MAY** be added by sending a `POST` request with a
primary resource collection to the URL of the relationship. For example:

```text
POST /articles/1/links/comments
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json

{
  "comments": ["1", "2"]
}
```

To-many relationships **MAY** be deleted individually by sending a `DELETE`
request to the URL of the relationship:

```text
DELETE /articles/1/links/tags/1
```

Multiple to-many relationships **MAY** be deleted by sending a `DELETE` request
to the URL of the relationships:

```text
DELETE /articles/1/links/tags/1,2
```

### Responses <a href="#crud-updating-responses" id="crud-updating-responses" class="headerlink"></a>

#### 204 No Content <a href="#crud-updating-responses-204" id="crud-updating-responses-204" class="headerlink"></a>

A server **MUST** return a `204 No Content` status code if an update is
successful and the client's current attributes remain up to date. This applies
to `PUT` requests as well as `POST` and `DELETE` requests that modify links
without affecting other attributes of a resource.

#### 200 OK <a href="#crud-updating-responses-200" id="crud-updating-responses-200" class="headerlink"></a>

If a server accepts an update but also changes the resource(s) in other ways
than those specified by the request (for example, updating the `updatedAt`
attribute or a computed `sha`), it **MUST** return a `200 OK` response as well
as a representation of the updated resource(s) as if a `GET` request was made to
the request URL.

#### Other Responses <a href="#crud-updating-responses-other" id="crud-updating-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error details
**MAY** also be returned, as discussed below.

### Deleting Resources <a href="#crud-deleting" id="crud-deleting" class="headerlink"></a>

An individual resource can be *deleted* by making a `DELETE` request to the
resource's URL:

```text
DELETE /photos/1
```

A server **MAY** optionally allow multiple resources to be *deleted* with a
`DELETE` request to their URL:

```text
DELETE /photos/1,2,3
```

#### Responses <a href="#crud-deleting-responses" id="crud-deleting-responses" class="headerlink"></a>

##### 204 No Content <a href="#crud-deleting-responses-204" id="crud-deleting-responses-204" class="headerlink"></a>

A server **MUST** return a `204 No Content` status code if a delete request is
successful.

##### Other Responses <a href="#crud-deleting-responses-other" id="crud-deleting-responses-other" class="headerlink"></a>

Servers **MAY** use other HTTP error codes to represent errors.  Clients
**MUST** interpret those errors in accordance with HTTP semantics. Error details
**MAY** also be returned, as discussed below.

## Errors <a href="#errors" id="errors" class="headerlink"></a>

Error objects are specialized resource objects that **MAY** be returned in a
response to provide additional information about problems encountered while
performing an operation. Error objects **SHOULD** be returned as a collection
keyed by `"errors"` in the top level of a JSON API document, and **SHOULD NOT**
be returned with any other top level resources.

An error object **MAY** have the following members:

* `"id"` - A unique identifier for this particular occurrence of the problem.
* `"href"` - A URI that **MAY** yield further details about this particular
  occurrence of the problem.
* `"status"` - The HTTP status code applicable to this problem, expressed as a
  string value.
* `"code"` - An application-specific error code, expressed as a string value.
* `"title"` - A short, human-readable summary of the problem. It **SHOULD NOT**
  change from occurrence to occurrence of the problem, except for purposes of
  localization.
* `"detail"` - A human-readable explanation specific to this occurrence of the
  problem.
* `"links"` - Associated resources which can be dereferenced from the request
  document.
* `"path"` - The relative path to the relevant attribute within the associated
  resource(s). Only appropriate for problems that apply to a single resource or
  type of resource.

Additional members **MAY** be specified within error objects.

Implementors **MAY** choose to use an alternative media type for errors.

## PATCH Support <a href="#patch" id="patch" class="headerlink"></a>

JSON API servers **MAY** opt to support HTTP `PATCH` requests that conform to
the JSON Patch format [[RFC6902](http://tools.ietf.org/html/rfc6902)]. There are
JSON Patch equivalant operations for the operations described above that use
`POST`, `PUT` and `DELETE`. From here on, JSON Patch operations sent in a
`PATCH` request will be referred to simply as "`PATCH` operations".

`PATCH` requests **MUST** specify a `Content-Type` header of `application/json-
patch+json`.

`PATCH` operations **MUST** be sent as an array to conform with the JSON Patch
format. A server **MAY** limit the type, order and count of operations allowed
in this top level array.

### Request URLs <a href="#patch-urls" id="patch-urls" class="headerlink"></a>

The URL for each `PATCH` request **SHOULD** map to the resource(s) or
relationship(s) to be updated.

Every `"path"` within a `PATCH` operation **SHOULD** be relative to the request
URL. The request URL and the `PATCH` operation's `"path"` are complementary and
combine to target a particular resource, collection, attribute, or relationship.

`PATCH` operations **MAY** be allowed at the root URL of an API. In this case,
every `"path"` within a `PATCH` operation **MUST** include the full resource
URL. This allows for general "fire hose" updates to any resource represented by
an API. As stated above, a server **MAY** limit the type, order and count of
bulk operations.

### Creating a Resource with PATCH <a href="#patch-creating" id="patch-creating" class="headerlink"></a>

To create a resource, perform an `"add"` operation with a `"path"` that points
to the end of its corresponding resource collection (`"/-"`). The `"value"`
should contain a resource object.

For instance, a new photo might be created with the following request:

```text
PATCH /photos
Content-Type: application/json-patch+json
Accept: application/json

[
  { 
    "op": "add", 
    "path": "/-", 
    "value": {
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    }
  }
]
```

### Updating Attributes with PATCH <a href="#patch-updating-attributes" id="patch-updating-attributes" class="headerlink"></a>

To update an attribute, perform a `"replace"` operation with the attribute's
name specified as the `"path"`.

For instance, the following request should update just the `src` property of the
photo at `/photos/1`:

```text
PATCH /photos/1
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "/src", "value": "http://example.com/hamster.png" }
]
```

### Updating Relationships with PATCH <a href="#patch-updating-relationships" id="patch-updating-relationships" class="headerlink"></a>

To update a relationship, send an appropriate `PATCH` operation to the
corresponding relationship's URL.

A server **MAY** also support updates at a higher level, such as the resource's
URL (or even the API's root URL). As discussed above, the request URL and each
operation's `"path"` must be complementary and combine to target a particular
relationship's URL.

#### Updating To-One Relationships with PATCH <a href="#patch-updating-to-one-relationships" id="patch-updating-to-one-relationships" class="headerlink"></a>

To update a to-one relationship, perform a `"replace"` operation with a URL and
`"path"` that targets the relationship. The `"value"` should be an individual
resource representation.

For instance, the following request should update the `author` of an article:

```text
PATCH /article/1/links/author
Content-Type: application/json-patch+json

[
  { "op": "replace", "path": "/", "value": "1" }
]
```

To remove a to-one relationship, perform a `remove` operation on the
relationship. For example:

```text
PATCH /article/1/links/author
Content-Type: application/json-patch+json

[
  { "op": "remove", "path": "/" }
]
```

#### Updating To-Many Relationships with PATCH <a href="#patch-updating-to-many-relationships" id="patch-updating-to-many-relationships" class="headerlink"></a>

While to-many relationships are represented as a JSON array in a `GET` response,
they are updated as if they were a set.

To add an element to a to-many relationship, perform an `"add"` operation that
targets the relationship's URL. Because the operation is targeting the end of a
collection, the `"path"` must end with `"/-"`. The `"value"` should be a
representation of an individual resource or collection of resources.

For example, consider the following `GET` request:

```text
GET /photos/1
Content-Type: application/vnd.api+json

{
  "links": {
    "comments": "http://example.com/comments/{comments}"
  },
  "photos": {
    "id": "1",
    "href": "http://example.com/photos/1",
    "title": "Hamster",
    "src": "images/hamster.png",
    "links": {
      "comments": [ "1", "5", "12", "17" ]
    }
  }
}
```

You could move comment 30 to this photo by issuing an `add` operation in the
`PATCH` request:

```text
PATCH /photos/1/links/comments
Content-Type: application/json-patch+json

[
  { "op": "add", "path": "/-", "value": "30" }
]
```

To remove a to-many relationship, perform a `"remove"` operation that targets
the relationship's URL. Because the operation is targeting a member of a
collection, the `"path"` **MUST** end with `"/<id>"`.

For example, to remove comment 5 from this photo, issue this `"remove"`
operation:

```text
PATCH /photos/1/links/comments
Content-Type: application/json-patch+json

[
  { "op": "remove", "path": "/5" }
]
```

### Deleting a Resource with PATCH <a href="#patch-deleting" id="patch-deleting" class="headerlink"></a>

To delete a resource, perform an `"remove"` operation with a URL and `"path"`
that targets the resource.

For instance, photo 1 might be deleted with the following request:

```text
PATCH /photos/1
Content-Type: application/json-patch+json
Accept: application/vnd.api+json

[
  { "op": "remove", "path": "/" }
]
```

### Responses <a href="#patch-responses" id="patch-responses" class="headerlink"></a>

#### 204 No Content <a href="#patch-responses-204" id="patch-responses-204" class="headerlink"></a>

A server **MUST** return a `204 No Content` status code in response to a
successful `PATCH` request in which the client's current attributes remain up to
date.

#### 200 OK <a href="#patch-responses-200" id="patch-responses-200" class="headerlink"></a>

If a server accepts an update but also changes the resource(s) in other ways
than those specified by the request (for example, updating the `updatedAt`
attribute or a computed `sha`), it **MUST** return a `200 OK` response as well
as a representation of the updated resources.

The server **MUST** specify a `Content-Type` header of `application/json`. The
body of the response **MUST** contain an array of JSON objects, each of which
**MUST** conform to the JSON API media type (`application/vnd.api+json`).
Response objects in this array **MUST** be in sequential order and correspond to
the operations in the request document.

For instance, a request may create two photos in separate operations:

```text
PATCH /photos
Content-Type: application/json-patch+json
Accept: application/json

[
  { 
    "op": "add", 
    "path": "/-", 
    "value": {
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    }
  },
  { 
    "op": "add", 
    "path": "/-", 
    "value": {
      "title": "Mustaches on a Stick",
      "src": "http://example.com/images/mustaches.png"
    }
  }
]
```

The response would then include corresponding JSON API documents contained
within an array:

```text
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "photos": [{
      "id": "123",
      "title": "Ember Hamster",
      "src": "http://example.com/images/productivity.png"
    }]
  }, {
    "photos": [{
      "id": "124",
      "title": "Mustaches on a Stick",
      "src": "http://example.com/images/mustaches.png"
    }]
  }
]
```

#### Other Responses <a href="#patch-responses-other" id="patch-responses-other" class="headerlink"></a>

When a server encounters one or more problems while processing a `PATCH`
request, it **SHOULD** specify the most appropriate HTTP error code in the
response. Clients **MUST** interpret those errors in accordance with HTTP
semantics.

A server **MAY** choose to stop processing `PATCH` operations as soon as the
first problem is encountered, or it **MAY** continue processing operations and
encounter multiple problems. For instance, a server might process multiple
attribute updates and then return multiple validation problems in a single
response.

When a server encounters multiple problems from a single request, the most
generally applicable HTTP error code should be specified in the response. For
instance, `400 Bad Request` might be appropriate for multiple 4xx errors or `500
Internal Server Error` might be appropriate for multiple 5xx errors.

A server **MAY** return error objects that correspond to each operation. The
server **MUST** specify a `Content-Type` header of `application/json` and the
body of the response **MUST** contain an array of JSON objects, each of which
**MUST** conform to the JSON API media type (`application/vnd.api+json`).
Response objects in this array **MUST** be in sequential order and correspond to
the operations in the request document. Each response object **SHOULD** contain
only error objects, since no operations can be completed successfully when any
errors occur. Error codes for each specific operation **SHOULD** be returned in
the `"status"` member of each error object.

## HTTP Caching <a href="#http-caching" id="http-caching" class="headerlink"></a>

Servers **MAY** use HTTP caching headers (`ETag`, `Last-Modified`) in accordance
with the semantics described in HTTP 1.1.





