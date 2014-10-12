---
layout: page
title: "用 JSON 构建 API 的标准指南"
show_masthead: true
---

如果您和您的团队曾经争论过使用什么方式构建合理 JSON 响应格式，
那么 JSON API 就是您的 anti-bikeshedding 武器。

通过遵循共同的约定，可以提高开发效率，利用更普遍的工具，可以是您更加专注于开发重点：您的程序。

基于 JSON API 的客户端还能够充分利用缓存，以提升性能，有时甚至可以完全不需要网络请求。

下面是一个使用 JSON API 发送响应（response）的示例：

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
      "comments": [ "5", "12", "17", "20" ]
    }
  }]
}
```

顶级的 `"links"` 部分是可选的。
除去 `"links"` 部分，此响应看起来非常接近使用已经存在的 API 构建的响应。

JSON API 不仅可以用来构建响应，还包括创建和更新资源。

{% include status.md %}

## MIME 类型 <a href="#mime-types" id="mime-types" class="headerlink"></a>

JSON API 已经在  IANA 机构完成注册。
它的 MIME 类型是 [`application/vnd.api+json`](http://www.iana.org/assignments/media-types/application/vnd.api+json)。

## 格式 <a href="#format-documentation" id="format-documentation" class="headerlink"></a>

在开始使用 JSON API 前，先查看一下[JSON API 格式文档](/format)

## 更新历史 <a href="#update-history" id="update-history" class="headerlink"></a>

- 2013-05-03：最初版本的草案。
- 2013-07-22：媒体类型在 IANA 注册完成。

你可以使用 RSS 阅读器在[这里](https://github.com/json-api/json-api/commits.atom)订阅本提要的变更。
