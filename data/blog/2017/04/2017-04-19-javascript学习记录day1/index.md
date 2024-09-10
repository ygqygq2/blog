---
title: "JavaScript学习记录day1"
date: "2017-04-19"
categories:
  - "development"
tags:
  - "javascript"
---

# JavaScript 学习记录 day1

[TOC]

**JavaScritps 是什么？** JavaScript 一种直译式脚本语言，是一种动态类型、弱类型、基于原型的语言，内置支持类型。它的解释器被称为 JavaScript 引擎，为浏览器的一部分，广泛用于客户端的脚本语言，最早是在 HTML（标准通用标记语言下的一个应用）网页上使用，用来给 HTML 网页增加动态功能。

> 在 Web 世界里，只有 JavaScript 能跨平台、跨浏览器驱动网页，与用户交互。

**编写 JS 的流程** 布局：HTML+CSS 属性：确定要修改哪些属性 事件：确定用户做哪些操作（产品设计） 编写 JS：在事件中，用 JS 来修改页面元素的样式

## 1\. 快速入门

JavaScript 代码可以直接嵌在网页的任何地方，不过通常我们都把 JavaScript 代码放到`<head>`中：

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>我的第一个JS</title>
    <script>
        function myFirstScript() {
            alert("Hello word!");
        }
        myFirstScript();
    </script>

</head>
<body>

</body>
</html>
```

由`<script>...</script>`包含的代码就是 JavaScript 代码，它将直接被浏览器执行。

第二种方法是把 JavaScript 代码放到一个单独的.js 文件，然后在 HTML 中通过

<script src="..."></script>

引入这个文件：

```
<html>
<head>
  <script src="/static/js/abc.js"></script>
</head>
<body>
  ...
</body>
</html>
```

这样，/static/js/abc.js 就会被浏览器执行。 把 JavaScript 代码放入一个单独的.js 文件中更利于维护代码，并且多个页面可以各自引用同一份.js 文件。 可以在同一个页面中引入多个.js 文件，还可以在页面中多次编写`<script> js代码... </script>`，浏览器按照顺序依次执行。

## 2\. 编程工具

我使用的是 webstorm，这款工具非常好用，但是是收费软件，可以使用它的开源 license。 https://www.jetbrains.com/webstorm/

## 3\. 语法

JavaScript 的语法和 Java 语言类似，每个语句以`;`结束，语句块用`{...}`。但是，JavaScript 并不强制要求在每个语句的结尾加`;`，浏览器中负责执行 JavaScript 代码的引擎会自动在每个语句的结尾补上`;`。

> 注意：让 JavaScript 引擎自动加分号在某些情况下会改变程序的语义，导致运行结果与期望不一致。为了养成良好习惯，我们不要省略`;`，所有语句都添加`;`。

```
if (2 > 1) {
    x = 1;
    y = 2;
    z = 3;
}
```

> 注意花括号`{...}`内的语句具有缩进，通常是 4 个空格。缩进不是 JavaScript 语法要求必须的，但缩进有助于我们理解代码的层次，所以编写代码时要遵守缩进规则。很多文本编辑器具有“自动缩进”的功能，可以帮助整理代码。

## 4\. 注释

以`//`开头直到行末的字符被视为行注释，注释是给开发人员看到，JavaScript 引擎会自动忽略：

```
// 这是一行注释
alert('hello'); // 这也是注释

//另一种块注释是用/*...*/把多行字符包裹起来，把一大“块”视为一个注释：
/* 从这里开始是块注释
仍然是注释
仍然是注释
注释结束 */
```

## 5\. 大小写

请注意，JavaScript 严格区分大小写，如果弄错了大小写，程序将报错或者运行不正常。

学习参考教程：http://www.liaoxuefeng.com
