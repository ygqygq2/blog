---
title: "Python动态导入模块"
date: "2017-10-30"
categories: 
  - "develop"
tags: 
  - "python"
---

# Python动态导入模块

\[TOC\]

下面是python的动态导入模块用法：

`cat lib/c.py`

```
# _*_coding:utf-8_*_
class Foo(object):

    def __init__(self):
        self.name = 'ygqygq2'
```

`cat 动态导入模块.py`

```
# _*_coding:utf-8_*_
# 官方推荐用法
import importlib

ygqygq2 = importlib.import_module("lib.c")
print(ygqygq2.Foo().name)  # 结果是 ygqygq2 

# python内置解释器用法，不推荐
#lib = __import__("lib.c")  # 对象是lib模块
#print(lib.c.Foo().name)  # 结果是 ygqygq2
```

详情： [https://docs.python.org/3/library/importlib.html](https://docs.python.org/3/library/importlib.html)
