---
layout: page
title: FAQ
---

### 为什么 JSON API 还没有发布版？ <a href="#why-is-json-api-not-versioned" id="why-is-json-api-not-versioned" class="headerlink"></a>

一旦 JSON API 发布稳定版，它将保持向后兼容，它将遵守**永不删除，只是添加**的开发策略。
[#46](https://github.com/json-api/json-api/issues/46)

### 为什么不使用 HAL 规范？ <a href="#why-not-use-the-hal-specification" id="why-not-use-the-hal-specification" class="headerlink"></a>

有几个原因:

* HAL 递归嵌套子文档，而 JSON API 在顶层采用扁平化对象结构。意味着不同的对象引用相同的 “people”（例如，posts和comments的author）时，这种规范能够保证每个person document仅存在一个有效实例。

* 相似的，JSON API使用IDs做链接，使从复合响应中缓存文档成为可能，仅当本地不存在对应文档，才会发出后续请求。如果幸运，甚至可以完全无需HTTP请求。

* HAL是序列化格式，但完全未定义文档更新操作。JSON API则仔细考虑如何更新已存在文档（依赖PATCH和JSON PATCH），以及更新操作与GET请求返回复合文档交互方式。同时定义如何创建，删除文档，以及更新操作的200,204响应。

简单来说，JSON API尝试格式化相似的，特殊的client-server通讯接口，使用JSON作为数据交换格式。专注于使用成熟的客户端来调用相关API，客户端能够缓存已经获取到的文档，避免再次请求已缓存信息。

JSON API从大量实际项目所使用的库中抽象而出。同时定义请求/响应（HAL未定义），以及对应数据交互格式。

### 如何获取资源可能的行为？ <a href="#how-to-discover-resource-possible-actions" id="how-to-discover-resource-possible-actions" class="headerlink"></a>
你应该使用OPTIONS HTTP方法来获取当前特定资源的行为。OPTIONS请求返回方法的语义遵循JSON API标准。

举例来说，如果`"GET,POST"`是URL OPTIONS请求的响应，那么就可以获取该资源信息，以及创建新资源。

如果你想知道特定资源属性作用，你不得不使用应用级别的描述来定义属性的含义与功能，并使用错误响应通知用户。这个特性依旧在讨论中，尚未加入最终标准。[discussion](https://github.com/json-api/json-api/issues/7).

### 有没有JSON 规范来定义JSON API?<a href="#is-there-a-json-schema-describing-json-api" id="is-there-a-json-schema-describing-json-api" class="headerlink"></a>

当然，你可以在[http://jsonapi.org/schema](http://jsonapi.org/schema)找到JSON规范定义。注意这个规范并不完美。 因为JSON文档可能会通过规范检查，但并不意味着是合适的JSON API文档。规范只是为了常规性排错检查。

可以在[http://json-schema.org](http://json-schema.org)找到更多关于JSON 规范格式的信息。

### 为什么资源集合作为数组返回，而不是ID索引集合？

JSON数组是自然排序，而集合需要元数据进行成员排序。因此，默认情况下，数组能够实现更自然的排序或者特殊方式排序。

除此之外，JSON API 允许返回不包含IDs的只读资源，与IDs索引集合方式不兼容。

### 为什么关联资源嵌套在复合文档的 `linked` 对象中？

主要资源应该相互独立，因为他们的顺序和数量通常比较重要。通过多种方式，分离主要资源和关联资源是必要的，因为主要资源可能会有相同类型的关联资源（e.g. the "parents" of a "person")。关联资源嵌套在 `linked` 中能够防止可能的冲突。
