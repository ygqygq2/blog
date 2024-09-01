---
title: "JavaScript学习记录day4-Map、Set和iterable"
date: "2018-01-11"
categories: 
  - "develop"
tags: 
  - "javascript"
---

# JavaScript学习记录day4-Map、Set和iterable

\[TOC\]

JavaScript的默认对象表示方式`{}`可以视为其他语言中的`Map`或`Dictionary`的数据结构，即一组键值对。

但是JavaScript的对象有个小问题，就是键必须是字符串。但实际上Number或者其他数据类型作为键也是非常合理的。

为了解决这个问题，最新的ES6规范引入了新的数据类型`Map`。要测试你的浏览器是否支持ES6规范，请执行以下代码，如果浏览器报ReferenceError错误，那么你需要换一个支持ES6的浏览器：

```
'use strict';
var m = new Map();
var s = new Set();
console.log('你的浏览器支持Map和Set！');
```

## 1\. Map

Map是一组键值对的结构，具有极快的查找速度。

举个例子，假设要根据同学的名字查找对应的成绩，如果用Array实现，需要两个Array：

```
var names = ['Michael', 'Bob', 'Tracy'];
var scores = [95, 75, 85];
```

给定一个名字，要查找对应的成绩，就先要在names中找到对应的位置，再从scores取出对应的成绩，Array越长，耗时越长。

如果用Map实现，只需要一个“名字”-“成绩”的对照表，直接根据名字查找成绩，无论这个表有多大，查找速度都不会变慢。用JavaScript写一个Map如下：

```
var m = new Map([['Michael', 95], ['Bob', 75], ['Tracy', 85]]);
m.get('Michael'); // 95
```

类似于python中的字典，只是写法不同。

初始化Map需要一个二维数组，或者直接初始化一个空Map。Map具有以下方法：

```
var m = new Map(); // 空Map
m.set('Lucy', 99); // 添加新的key-value
m.set('Lily', 89);
console.log(m.has('Lucy')); // 是否存在key 'Lucy': true
console.log(m.get('Lily')); // 89
m.delete('Lily'); // 删除key 'Lily'
console.log(m.get('Lily')); // undefined
```

由于一个key只能对应一个value，所以，多次对一个key放入value，后面的值会把前面的值冲掉：

```
var m = new Map();
m.set('Lily', 89);
m.set('Lily', 99);
console.log(m.get('Lily'));  // 99
```

## 2\. Set

Set和Map类似，也是一组key的集合，但不存储value。由于key不能重复，所以，在Set中，没有重复的key。

要创建一个Set，需要提供一个Array作为输入，或者直接创建一个空Set：

```
var s1 = new Set();  // 空Set
var s2 = new Set([1, 2, 3]);  // 含1, 2, 3
```

重复元素在Set中自动被过滤：

```
var s = new Set([1, 2, 3, 3, "3"]);
console.log(s);  // Set {1, 2, 3, "3"} 
```

> _注意_ 数字3和字符串'3'是不同的元素。

通过add(key)方法可以添加元素到Set中，可以重复添加，但不会有效果：

```
s.add(4);
console.log(s);  // Set {1, 2, 3, 4}
s.add(4);
console.log(s);  // 仍然是 Set {1, 2, 3, 4}
```

通过delete(key)方法可以删除元素：

```
var s = new Set([1, 2, 3]);
console.log(s);  // Set {1, 2, 3}
s.delete(3);
console.log(s);  // Set {1, 2}
```

## 3\. iterable

遍历`Array`可以采用下标循环，遍历`Map`和`Set`就无法使用下标。为了统一集合类型，ES6标准引入了新的`iterable`类型，`Array`、`Map`和`Set`都属于`iterable`类型。

具有`iterable`类型的集合可以通过新的`for ... of`循环来遍历。

`for ... of`循环是ES6引入的新的语法，请测试你的浏览器是否支持：

```
'use strict';
var a = [1, 2, 3];
for (var x of a) {
}
console.log('你的浏览器支持for ... of');
```

**for ... of循环和for ... in循环有何区别？**

`for ... in`循环由于历史遗留问题，它遍历的实际上是对象的属性名称。一个`Array`数组实际上也是一个对象，它的每个元素的索引被视为一个属性。

当我们手动给`Array`对象添加了额外的属性后，`for ... in`循环将带来意想不到的意外效果：

```
var a = ['A', 'B', 'C'];
a.name = 'Hello';
for (var x in a) {
    console.log(x); // '0', '1', '2', 'name'
}
```

`for ... in`循环将把`name`包括在内，但`Array`的`length`属性却不包括在内。

`for ... of`循环则完全修复了这些问题，它只循环集合本身的元素：

```
var a = ['A', 'B', 'C'];
a.name = 'Hello';
for (var x of a) {
    console.log(x); // 'A', 'B', 'C'
}
```

这就是为什么要引入新的`for ... of`循环。

然而，更好的方式是直接使用`iterable`内置的`forEach`方法，它接收一个函数，每次迭代就自动回调该函数。以`Array`为例：

```
'use strict';
var a = ['A', 'B', 'C'];

a.forEach(function (element, index, array) {
    // element: 指向当前元素的值
    // index: 指向当前索引
    // array: 指向Array对象本身
    console.log(element + ', index = ' + index);
});
```

结果：

```
A, index = 0
B, index = 1
C, index = 2
```

> 注意： `forEach()`方法是ES5.1标准引入的，你需要测试浏览器是否支持。

`Set`与`Array`类似，但`Set`没有索引，因此回调函数的前两个参数都是元素本身：

```
var s = new Set(['A', 'B', 'C']);
s.forEach(function (element, sameElement, set) {
    console.log(element);
});
```

结果：

```
A
B
C
```

`Map`的回调函数参数依次为`value`、`key`和`map`本身：

```
var m = new Map([[1, 'x'], [2, 'y'], [3, 'z']]);
m.forEach(function (value, key, map) {
    console.log(value);
});
```

结果：

```
x
y
z
```

如果对某些参数不感兴趣，由于JavaScript的函数调用不要求参数必须一致，因此可以忽略它们。例如，只需要获得`Array`的`element`：

```
var a = ['A', 'B', 'C'];
a.forEach(function (element) {
    console.log(element);
});
```

结果：

```
A
B
C
```

学习参考教程：[http://www.liaoxuefeng.com](http://www.liaoxuefeng.com)
