---
layout: page
title: 扩展
---

{% include status.md %}

## 扩展 <a href="#extending" id="extending" class="headerlink"></a>

如果你想扩展 JSON API，你应该遵循 [RFC 6906](http://tools.ietf.org/html/rfc6906) 定义的 profile。
另请参阅 [Mark Nottingham 写的这篇文章](http://www.mnot.net/blog/2012/04/17/profiles)。

`meta` 部分定义了 profile 的链接。

**注意**，在 RFC 规范中，profile：

> 不改变资源表示的语义定义本身，但让客户了解更多的语义(约束、规范、扩展)相关联的资源表示形式，
> 还有这些定义的媒体类型和可能的其他机制。

## 示例 <a href="#examples" id="examples" class="headerlink"></a>

例如，假设你想让你的 API 支持不同的分页设计，如基于游标。
你会制作某种信息页面在你的网站上，如 `http://api.example.com/profile`，
然后会响应中包含 `meta` 键:

```text
GET http://api.example.com/
```

```json
{
  "meta": {
    "profile": "http://api.example.com/profile"
  },

  "posts": [{
    // 一份单独的文档
  }]
}
```

That document will de-reference to explain your link relations:

这份文档将解释链接之间的关系:

```text
GET http://api.example.com/profile HTTP/1.1
```

```text
HTTP/1.1 200 OK
Content-Type: text/plain
```

The Example.com API Profile
===========================

Example.com API 使用基于游标的分页。
它是这样工作的:
在想要的 `meta` 部分，它将返回一个 `cursors` 的关系（relation）,
其中包括 `after`，`before` 和 `limit`，用来描述该游标。
您可以使用 `href` 给出的 URI 模板来生成分页的 URIs。

```json
"meta": {
  "cursors": {
    "after": "abcd1234",
    "before": "wxyz0987",
    "limit": 25,
    "href": "https://api.example.com/whatever{?after,before,limit}"
  }
}
```
