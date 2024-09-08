---
title: "JavaScript学习记录day5-函数的定义和调用"
date: "2018-01-23"
categories:
  - "development"
tags:
  - "javascript"
---

# JavaScript 学习记录 day5-函数的定义和调用

\[TOC\]

## 1\. 定义函数

在 JavaScript 中，定义函数的方式如下：

```
function abs(x) {
    if (x >= 0) {
        return x;
    } else {
        return -x;
    }
}
```

上述`abs()`函数的定义如下：

`function`指出这是一个函数定义； `abs`是函数的名称； `(x)`括号内列出函数的参数，多个参数以`,`分隔； `{ ... }`之间的代码是函数体，可以包含若干语句，甚至可以没有任何语句。 请注意，函数体内部的语句在执行时，一旦执行到`return`时，函数就执行完毕，并将结果返回。因此，函数内部通过条件判断和循环可以实现非常复杂的逻辑。

如果没有`return`语句，函数执行完毕后也会返回结果，只是结果为`undefined`。

由于 JavaScript 的函数也是一个对象，上述定义的`abs()`函数实际上是一个函数对象，而函数名`abs`可以视为指向该函数的变量。

因此，第二种定义函数的方式如下：

```
var abs = function (x) {
    if (x >= 0) {
        return x;
    } else {
        return -x;
    }
};
```

在这种方式下，`function (x) { ... }`是一个匿名函数，它没有函数名。但是，这个匿名函数赋值给了变量`abs`，所以，通过变量`abs`就可以调用该函数。

上述两种定义**完全等价**，注意第二种方式按照完整语法需要在函数体末尾加一个`;`，表示赋值语句结束。

## 2\. 调用函数

调用函数时，按顺序传入参数即可：

```
abs(10);  // 返回10
abs(-9);  // 返回9
```

由于 JavaScript 允许传入任意个参数而不影响调用，因此传入的参数比定义的参数多也没有问题，虽然函数内部并不需要这些参数：

```
abs(10, 'blablabla');  // 返回10
abs(-9, 'haha', 'hehe', null);  // 返回9
```

传入的参数比定义的少也没有问题：

```
abs();  // 返回NaN
```

此时 abs(x)函数的参数 x 将收到`undefined`，计算结果为`NaN`。

要避免收到`undefined`，可以对参数进行检查：

```
function abs(x) {
    if (typeof x !== 'number') {
        throw 'Not a number';
    }
    if (x >= 0) {
        return x;
    } else {
        return -x;
    }
}
```

## 3\. arguments

JavaScript 还有一个免费赠送的关键字`arguments`，它只在函数内部起作用，并且永远指向当前函数的调用者传入的所有参数。`arguments`类似`Array`但它不是一个`Array`：

```
'use strict'

function foo(x) {
    console.log('x = ' + x);  // 10
    for (var i = 0; i < arguments.length; i++) {
        console.log('arg ' + i + ' = ' + arguments[i]);  // 10, 20, 30
    }
}

foo(10, 20, 30);
```

利用`arguments`，你可以获得调用者传入的所有参数。也就是说，即使函数不定义任何参数，还是可以拿到参数的值：

```
function abs() {
    if (arguments.length === 0) {
        return 0;
    }
    var x = arguments[0];
    return x >= 0 ? x : -x;
}

console.log(abs());  // 0
console.log(abs(10));  // 10
console.log(abs(-9));  // 9
```

实际上`arguments`最常用于判断传入参数的个数。你可能会看到这样的写法：

```
// foo(a[, b], c)
// 接收2~3个参数，b是可选参数，如果只传2个参数，b默认为null：
function foo(a, b, c) {
    if (arguments.length === 2) {
        // 实际拿到的参数是a和b，c为undefined
        c = b;  // 把b赋给c
        b = null;  // b变为默认值
    }
    console.log(a, b, c);
}

foo(1, 2);  // 1 null 2
```

要把中间的参数 b 变为“可选”参数，就只能通过`arguments`判断，然后重新调整参数并赋值。

## 4\. reset 参数

由于 JavaScript 函数允许接收任意个参数，于是我们就不得不用 arguments 来获取所有参数：

```
function foo(a, b) {
    var i, rest = [];
    if (arguments.length > 2) {
        for (i = 2; i<arguments.length; i++) {
            rest.push(arguments[i]);
        }
    }
    console.log('a = ' + a);
    console.log('b = ' + b);
    console.log(rest);
}

foo();
// 结果：
// a = undefined
// b = undefined
// []

foo(1, 2);
// 结果：
// []
// a = 1
// b = 2

foo(3, 4, 5);
// 结果：
// a = 3
// b = 4
// [ 5 ]
```

为了获取除了已定义参数`a`、`b`之外的参数，我们不得不用`arguments`，并且循环要从索引`2`开始以便排除前两个参数，这种写法很别扭，只是为了获得额外的`rest`参数，有没有更好的方法？

ES6 标准引入了`rest`参数，上面的函数可以改写为：

```
function foo(a, b,...rest){
    console.log('a = ' + a);
    console.log('b = ' + b);
    console.log(rest);
}

foo(1, 2, 3, 4, 5);
// 结果:
// a = 1
// b = 2
// Array [ 3, 4, 5 ]

foo(1);
// 结果:
// a = 1
// b = undefined
// Array []
```

`rest`参数只能写在最后，前面用`...`标识，从运行结果可知，传入的参数先绑定`a`、`b`，多余的参数以数组形式交给变量`rest`，所以，不再需要`arguments`我们就获取了全部参数。

如果传入的参数连正常定义的参数都没填满，也不要紧，`rest`参数会接收一个空数组（注意不是`undefined`）。

因为`rest`参数是 ES6 新标准，所以你需要测试一下浏览器是否支持。请用`rest`参数编写一个`sum()`函数，接收任意个参数并返回它们的和：

```
'use strict';

function sum(...rest) {
   var num = 0;
   var x;
   for (x of rest) {
        num = num + x;
    }
    return num;
}

// 测试:
var i, args = [];
for (i=1; i<=100; i++) {
    args.push(i);
}
if (sum() !== 0) {
    console.log('测试失败: sum() = ' + sum());
} else if (sum(1) !== 1) {
    console.log('测试失败: sum(1) = ' + sum(1));
} else if (sum(2, 3) !== 5) {
    console.log('测试失败: sum(2, 3) = ' + sum(2, 3));
} else if (sum.apply(null, args) !== 5050) {
    console.log('测试失败: sum(1, 2, 3, ..., 100) = ' + sum.apply(null, args));
} else {
    console.log('测试通过!');
}
```

## 5\. 小心你的 return 语句

前面我们讲到了 JavaScript 引擎有一个在行末自动添加分号的机制，这可能让你栽到`return`语句的一个大坑：

```
function foo() {
    return { name: 'foo' };
}

foo(); // { name: 'foo' }
```

如果把 return 语句拆成两行：

```
function foo() {
    return
        { name: 'foo' };
}

foo(); // undefined
```

要小心了，由于 JavaScript 引擎在行末自动添加分号的机制，上面的代码实际上变成了：

```
function foo() {
    return; // 自动添加了分号，相当于return undefined;
        { name: 'foo' }; // 这行语句已经没法执行到了
}
```

所以正确的多行写法是：

```
function foo() {
    return { // 这里不会自动加分号，因为{表示语句尚未结束
        name: 'foo'
    };
}
```

**练习** 1. 定义一个计算圆面积的函数`area_of_circle()`，它有两个参数： \* r: 表示圆的半径； \* pi: 表示 π 的值，如果不传，则默认 3.14

```
'use strict';

function area_of_circle(r, pi) {
    // var area;
    // if (arguments.length == 2) {
    //     area = pi * r * r;
    // } else if (arguments.length < 2){
    //     pi = 3.14;
    //     area = pi * r * r;
    // } else {
    //     console.log("arguments number must be 1 or 2.")
    //     return;
    // }
    // return area;
    return r * r * (pi || 3.14);
}

// 测试:
if (area_of_circle(2) === 12.56 && area_of_circle(2, 3.1416) === 12.5664) {
    console.log('测试通过');
} else {
    console.log('测试失败');
}
```

学习参考教程：[http://www.liaoxuefeng.com](http://www.liaoxuefeng.com)
