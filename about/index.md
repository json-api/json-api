---
layout: page
title: About
---

## 频道 <a href="#channels" id="channels" class="headerlink"></a>

JSON API：

  * [@jsonapi](http://twitter.com/jsonapi) on Twitter
  * _#jsonapi_ channel on [Freenode IRC](http://freenode.net)
  * [jsonapi Google group](https://groups.google.com/forum/?fromgroups#!forum/jsonapi)

## 编辑者 <a href="#editors" id="editors" class="headerlink"></a>

该规范的两个主要编辑者:

- Steve Klabnik：twitter [@steveklabnik](http://twitter.com/steveklabnik)
- Yehuda Katz：twitter [@wycats](http://twitter.com/wycats)

翻译者：

- justjavac：新浪微博 [@justjavac](http://weibo.com/justjavac)

> 然而，对于 Web 来说，最重要的是这种关注点的分离允许组件独立地进化，
> 从而支持多个组织领域的 Internet 规模的需求。
>
> —— Roy Fielding 《架构风格与基于网络的软件架构设计》 [第五章](http://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)

（译注：此书第五章介绍了 RESTful 风格的网络架构 by [@justjavac](http://weibo.com/justjavac)）

Steve Klabnik 主要是服务器端，而 Yehuda Katz 则是客户端。
而我们两者都关注，但我们要确保两边都有一个捍卫者。

## 历史 <a href="#history" id="history" class="headerlink"></a>

JSON API is extracted from the JSON transport implicitly defined by
[Ember](http://emberjs.com/) Data's REST adapter.

JSON API 来自 JSON 的数据传输，它被隐式地定义在 [Ember](http://emberjs.com/) 的 REST 风格数据适配器。

一般来说，Ember Data 被设计用来实现这样的目的：消除哪些为不同应用程序与服务器之间通信而写的特殊代码，
而是用 REST 风格数据适配器将它们转换成统一的方式。

一些服务器，比如 Firebase、Parse 和 CouchDB 已经定义了和客户端通信的精确的协议，以便适合 Ember 数据。
相比之下，用 Rails、Node.js、 Django 编写的服务器端程序，倾向于使用 REST 风格，
但对于客户端程序，却没有多少是使用 REST 风格的。

Ember Data 的 REST Adapter 隐式定义了一个协议，
服务器需要实现此协议，用来为客户端程序提供有所的资源。
[ActiveModel::Serializers][1] 是 Rails 的一个库，并实现了 Ember
Data 所期望的序列化格式。

[1]: https://github.com/rails-api/active_model_serializers

Ember Data 关于记录的创建、更新和删除，
已经成为 Rails、Django 和 Node.js 开发者广泛使用的约定。

媒体类型的目标是追求均衡:

* 一个通用的媒体类型，可以在非常广泛的场景中使用，包括常用的关系类型
* 对现有服务器端框架最佳实践类似（可读性与可调试性）
* 易于在服务器端实现
* 易于在客户端实现

该类媒体仍然是一个进展中的工作，我们是非常开放的反馈和建议改进。
就是说，该规范的实现工作已经开始，我们的价值在于提供更好的雾件（Vaporware）。
