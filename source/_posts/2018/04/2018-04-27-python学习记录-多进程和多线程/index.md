---
title: "Python学习记录-多进程和多线程"
date: "2018-04-27"
categories: 
  - "develop"
tags: 
  - "python"
  - "线程"
  - "进程"
---

# Python学习记录-多进程和多线程

\[TOC\]

## 1\. 进程和线程

**进程**

狭义定义：进程是正在运行的程序的实例（an instance of a computer program that is being executed）。 广义定义：进程是一个具有一定独立功能的程序关于某个数据集合的一次运行活动。它是操作系统动态执行的基本单元，在传统的操作系统中，进程既是基本的分配单元，也是基本的执行单元。

**线程**

线程是操作系统能够进行运算调度的最小单位。它被包含在进程之中，是进程中的实际运作单位。一条线程指的是进程中一个单一顺序的控制流，一个进程中可以并发多个线程，每条线程并行执行不同的任务。

**线程与进程比较**

线程与进程的区别： 1）地址空间和其它资源（如打开文件）：进程间相互独立，同一进程的各线程间共享。某进程内的线程在其它进程不可见。 2）通信：进程间通信IPC，线程间可以直接读写进程数据段（如全局变量）来进行通信——需要进程同步和互斥手段的辅助，以保证数据的一致性。 3）创建：创建新线程很简单，创建新进程需要对父进程进行一次克隆。 4）调度和切换：一个线程可以控制和操作同一进程里的其它线程，但是进程只能操作子进程；线程上下文切换比进程上下文切换要快得多。 5）在多线程OS中，进程不是一个可执行的实体。

> _注意：_ 线程和进程快慢无法对比，因为线程被包含在进程中。

## 2\. threading模块

线程有2种调用方式，如下：

**直接调用**

```
import threading
import time


def sayhi(num):  # 定义每个线程要运行的函数

    print("running on number:%s" % num)

    time.sleep(3)


if __name__ == '__main__':
    t1 = threading.Thread(target=sayhi, args=(1,))  # 生成一个线程实例
    t2 = threading.Thread(target=sayhi, args=(2,))  # 生成另一个线程实例

    t1.start()  # 启动线程
    t2.start()  # 启动另一个线程

    print(t1.getName())  # 获取线程名
    print(t2.getName())
```

**继承式调用**

```
import threading
import time


class MyThread(threading.Thread):
    def __init__(self, num):
        threading.Thread.__init__(self)
        self.num = num

    def run(self):  # 定义每个线程要运行的函数
        print("running on number:%s" % self.num)
        time.sleep(3)


if __name__ == '__main__':
    t1 = MyThread(1)
    t2 = MyThread(2)
    t1.start()
    t2.start()
```

平常用到的主要方法：

`start` 线程准备就绪，等待CPU调度 `setName` 为线程设置名称 `getName` 获取线程名称 `setDaemon` 设置为后台线程或前台线程（默认） 如果是后台线程，主线程执行过程中，后台线程也在进行，主线程执行完毕后，后台线程不论成功与否，均停止 如果是前台线程，主线程执行过程中，前台线程也在进行，主线程执行完毕后，等待前台线程也执行完成后，程序停止 `join` 逐个执行每个线程，执行完毕后继续往下执行，该方法使得多线程变得无意义 `run` 线程被cpu调度后自动执行线程对象的run方法

### 2.1 Join & Daemon

```
import time
import threading


def run(n):
    print('[%s]------running----\n' % n)
    time.sleep(2)
    print('--done--')


def main():
    for i in range(5):
        t = threading.Thread(target=run, args=[i, ])
        t.start()
        t.join(1)
        print('starting thread', t.getName())


m = threading.Thread(target=main, args=[])
m.setDaemon(True)  # 将main线程设置为Daemon线程,它做为程序主线程的守护线程,当主线程退出时,m线程也会退出,由m启动的其它子线程会同时退出,不管是否执行完任务
m.start()
m.join(timeout=2)
print("---main thread done----")
```

```
import time
import threading


def addNum():
    global num  # 在每个线程中都获取这个全局变量
    print('--get num:', num)
    time.sleep(1)
    num -= 1  # 对此公共变量进行-1操作


num = 100  # 设定一个共享变量
thread_list = []
for i in range(100):
    t = threading.Thread(target=addNum)
    t.start()
    thread_list.append(t)

for t in thread_list:  # 等待所有线程执行完毕
    t.join()

print('final num:', num)
```

### 2.2 线程锁(互斥锁Mutex)

一个进程下可以启动多个线程，多个线程共享父进程的内存空间，也就意味着每个线程可以访问同一份数据，由于线程之间是进行随机调度，并且每个线程可能只执行n条执行之后，当多个线程同时修改同一条数据时可能会出现脏数据，所以，出现了线程锁 - 同一时刻允许一个线程执行操作。

```
import time
import threading


def addNum():
    global num  # 在每个线程中都获取这个全局变量
    print('--get num:', num)
    time.sleep(1)
    num -= 1  # 对此公共变量进行-1操作


num = 100  # 设定一个共享变量
thread_list = []
for i in range(100):
    t = threading.Thread(target=addNum)
    t.start()
    thread_list.append(t)

for t in thread_list:  # 等待所有线程执行完毕
    t.join()

print('final num:', num)
```

因为python2.7以上版本，已经自动添加线程锁，所以我们不用细纠。

```
import time
import threading


def addNum():
    global num  # 在每个线程中都获取这个全局变量
    print('--get num:', num)
    time.sleep(1)
    lock.acquire()  # 修改数据前加锁
    num -= 1  # 对此公共变量进行-1操作
    lock.release()  # 修改后释放


num = 100  # 设定一个共享变量
thread_list = []
lock = threading.Lock()  # 生成全局锁
for i in range(100):
    t = threading.Thread(target=addNum)
    t.start()
    thread_list.append(t)

for t in thread_list:  # 等待所有线程执行完毕
    t.join()

print('final num:', num)
```

### 2.3 信号量(Semaphore)

互斥锁 同时只允许一个线程更改数据，而Semaphore是同时允许一定数量的线程更改数据 ，比如厕所有3个坑，那最多只允许3个人上厕所，后面的人只能等里面有人出来了才能再进去。

```
import threading, time


def run(n):
    semaphore.acquire()
    time.sleep(1)
    print("run the thread: %s" % n)
    semaphore.release()


if __name__ == '__main__':

    num = 0
    semaphore = threading.BoundedSemaphore(5)  # 最多允许5个线程同时运行
    for i in range(20):
        t = threading.Thread(target=run, args=(i,))
        t.start()
```

### 2.4 事件(event)

python线程的事件用于主线程控制其他线程的执行，事件主要提供了三个方法 `set`、`wait`、`clear`。

事件处理的机制：全局定义了一个`“Flag”`，如果`“Flag”`值为 `False`，那么当程序执行 `event.wait` 方法时就会阻塞，如果`“Flag”`值为`True`，那么`event.wait` 方法时便不再阻塞。

`clear`：将`“Flag”`设置为`False` `set`：将`“Flag”`设置为`True`

```
import threading


def do(event):
    print('start')
    event.wait()
    print('execute')


event_obj = threading.Event()
for i in range(10):
    t = threading.Thread(target=do, args=(event_obj,))
    t.start()

event_obj.clear()
inp = input('input:')
if inp == 'true':
    event_obj.set()
```

### 2.5 条件(Condition)

使得线程等待，只有满足某条件时，才释放n个线程。

未使用条件时：

```
import threading

def run(n):
    con.acquire()
    con.wait()
    print("run the thread: %s" %n)
    con.release()

if __name__ == '__main__':

    con = threading.Condition()
    for i in range(10):
        t = threading.Thread(target=run, args=(i,))
        t.start()

    while True:
        inp = input('>>>')
        if inp == 'q':
            break
        con.acquire()
        con.notify(int(inp))
        con.release()
```

使用条件时：

```
def condition_func():

    ret = False
    inp = input('>>>')
    if inp == '1':
        ret = True

    return ret


def run(n):
    con.acquire()
    con.wait_for(condition_func)
    print("run the thread: %s" %n)
    con.release()

if __name__ == '__main__':

    con = threading.Condition()
    for i in range(10):
        t = threading.Thread(target=run, args=(i,))
        t.start()
```

### 2.6 定时器(Timer)

定时器，指定n秒后执行某操作

```
from threading import Timer


def hello():
    print("hello, world")

t = Timer(1, hello)
t.start()  # after 1 seconds, "hello, world" will be printed
```

## 3\. queue队列模块

[queue](https://docs.python.org/3/library/queue.html)特别用于在多个线程间安全的交换。

```
class queue.Queue(maxsize=0) #先入先出
class queue.LifoQueue(maxsize=0) #后入先出
class queue.PriorityQueue(maxsize=0) #存储数据时可设置优先级的队列
```

maxsize为队列最大容量，如果设置为0或者小于0，则队列大小无限制。

### 3.1 一些常用方法

`task_done()` 意味着之前入队的一个任务已经完成。由队列的消费者线程调用。每一个`get()`调用得到一个任务，接下来的`task_done()`调用告诉队列该任务已经处理完毕。

如果当前一个`join()`正在阻塞，它将在队列中的所有任务都处理完时恢复执行（即每一个由`put()`调用入队的任务都有一个对应的`task_done()`调用。

`join()` 阻塞调用线程，直到队列中的所有任务被处理掉。

只要有数据被加入队列，未完成的任务数就会增加。当消费者线程调用`task_done()`（意味着有消费者取得任务并完成任务），未完成的任务数就会减少。当未完成的任务数降到0，`join()`解除阻塞。

`put(item[, block[, timeout]])` 将item放入队列中。

如果可选的参数`block`为`True`且`timeout`为空对象（默认的情况，阻塞调用，无超时）。 如果`timeout`是个正整数，阻塞调用进程最多`timeout`秒，如果一直无空空间可用，抛出`Full`异常（带超时的阻塞调用）。 如果`block`为`False`，如果有空闲空间可用将数据放入队列，否则立即抛出`Full`异常 其非阻塞版本为`put_nowait`等同于`put(item, False)`

`get([block[, timeout]])` 从队列中移除并返回一个数据。`block`跟`timeout`参数同`put`方法

其非阻塞方法为`get_nowait()`相当与`get(False)`

`empty()` 如果队列为空，返回`True`,反之返回`False`

## 4\. 生产者消费者模型

在并发编程中使用生产者和消费者模式能够解决绝大多数并发问题。该模式通过平衡生产线程和消费线程的工作能力来提高程序的整体处理数据的速度。

为什么要使用生产者和消费者模式？

在线程世界里，生产者就是生产数据的线程，消费者就是消费数据的线程。在多线程开发当中，如果生产者处理速度很快，而消费者处理速度很慢，那么生产者就必须等待消费者处理完，才能继续生产数据。同样的道理，如果消费者的处理能力大于生产者，那么消费者就必须等待生产者。为了解决这个问题于是引入了生产者和消费者模式。

什么是生产者消费者模式？

生产者消费者模式是通过一个容器来解决生产者和消费者的强耦合问题。生产者和消费者彼此之间不直接通讯，而通过阻塞队列来进行通讯，所以生产者生产完数据之后不用等待消费者处理，直接扔给阻塞队列，消费者不找生产者要数据，而是直接从阻塞队列里取，阻塞队列就相当于一个缓冲区，平衡了生产者和消费者的处理能力。

生产者消费者例子：

```
import threading
import queue
import time

def producer(name):
    count = 1
    while True:
        for i in range(10):
            q.put("包子 %s" % count)
            print("生产了包子", count)
            count += 1
            time.sleep(0.5)

def consumer(n):
    while True:
        if q.qsize() > 0:
            print("%s 取到" %n  , q.get())
            time.sleep(1.5)


q = queue.Queue(maxsize=10)
p = threading.Thread(target=producer,args=("包子店",))
p.start()

c1 = threading.Thread(target=consumer,args=("Lily",))
c1.start()
c2 = threading.Thread(target=consumer,args=("Aeny",))
c2.start()
c3 = threading.Thread(target=consumer,args=("Bob",))
c3.start()
```

### 4.1 多线程的使用场景

python多线程不适合CPU密集型的任务，适合IO密集型的任务。

## 5\. 多进程

多进程模块`multiprocessing`的基本使用方法：

```
from multiprocessing import Process
import threading
import time

def thread_run():
    print(threading.get_ident())

def foo(i):
    time.sleep(1)
    print('say hi',i)
    t = threading.Thread(target=thread_run,)
    t.start()


for i in range(10):
    p = Process(target=foo,args=(i,))
    p.start()
    # p.join()
```

> _注意_： 由于进程之间的数据需要各自持有一份，所以创建进程需要的非常大的开销。

获取进程ID和父进程ID的方法示例：

```
from multiprocessing import Process
import os

def info(title):
    print(title)
    print('module name:', __name__)
    print('parent process:', os.getppid())
    print('process id:', os.getpid())
    print("\n\n")

def f(name):
    info('\033[31;1mfunction f\033[0m')
    print('hello', name)

if __name__ == '__main__':
    info('\033[32;1mmain process line\033[0m')
    p = Process(target=f, args=('bob',))
    p.start()
    p.join()
```

### 5.1 进程间数据交互

不同进程间内存是不共享的，要想实现两个进程间的数据交换，可以用以下方法： `Queues`

```
from multiprocessing import Process, Queue

def f(q):
    q.put([100, None, 'hello'])

if __name__ == '__main__':
    q = Queue()
    p = Process(target=f, args=(q,))
    p.start()
    print(q.get())    # prints "[100, None, 'hello']"
    p.join()
```

`Pipes`

```
from multiprocessing import Process, Pipe

def f(conn):
    conn.send([1, True, 'first'])
    conn.send([2, True, 'second'])
    print("from parent:", conn.recv())  # from parent: Third
    conn.close()

if __name__ == '__main__':
    parent_conn, child_conn = Pipe()
    p = Process(target=f, args=(child_conn,))
    p.start()
    print(parent_conn.recv())  # [1, True, 'first']
    print(parent_conn.recv())  # [2, True, 'second']
    parent_conn.send("Third")
    p.join()
```

### 5.2 进程数据共享

进程各自持有一份数据，默认无法共享数据。

```
from multiprocessing import Process

import time

li = []

def foo(i):
    li.append(i)
    print('say hi',li)

for i in range(10):
    p = Process(target=foo,args=(i,))
    p.start()

print ('ending',li)
```

结果类似这样（每次的结果可能排序会有变化）。

```
say hi [2]
say hi [3]
say hi [5]
say hi [0]
say hi [1]
say hi [4]
say hi [6]
say hi [7]
say hi [8]
ending []
say hi [9]
```

想要进程间共享数据

方法一：使用Array

```
from multiprocessing import Process,Array
temp = Array('i', [11,22,33,44])

def Foo(i):
    temp[i] = 100+i
    for item in temp:
        print(i,'----->',item)

for i in range(2):
    p = Process(target=Foo,args=(i,))
    p.start() 
```

方法二：manage.dict()共享数据

```
from multiprocessing import Process,Manager
import os


def f(d, l):
    d[os.getpid()] = os.getpid()
    l.append(os.getpid())
    print(l)


if __name__ == '__main__':
    manager = Manager()
    d= manager.dict()
    l = manager.list(range(5))
    p_list = []
    for i in range(10):
        p = Process(target=f,args=(d, l))
        p.start()
        p_list.append(p)

    for res in p_list:  # 等待结果
        res.join()

    print(d)
    print(l)
```

### 5.3 进程同步

进程锁的作用是保证屏幕打印正常，因为不加锁有可能同一时间打印的数据导致显示错乱。

```
from multiprocessing import Process, Lock

def f(l, i):
    l.acquire()
    try:
        print('hello world', i)
    finally:
        l.release()

if __name__ == '__main__':
    lock = Lock()

    for num in range(10):
        Process(target=f, args=(lock, num)).start()
```

### 5.4 进程池

进程池内部维护一个进程序列，当使用时，则去进程池中获取一个进程，如果进程池序列中没有可供使用的进进程，那么程序就会等待，直到进程池中有可用进程为止。

进程池中有两个方法：

- apply
- apply\_async

```
from multiprocessing import Process, Pool
import time
import os

def Foo(i):
    time.sleep(2)
    print("in process", os.getpid())
    return i + 100

def Bar(arg):
    print('-->exec done:', arg, os.getpid())

if __name__ == '__main__':
    pool = Pool(processes=3)  # 允许进程池同时放入的个数
    print("主进程", os.getpid())
    for i in range(10):
        pool.apply_async(func=Foo, args=(i,), callback=Bar)  # callback=回调
        # pool.apply(func=Foo, args=(i,))  # 串行
        # pool.apply_async(func=Foo, args=(i,))  # 并行

    print('end')
    pool.close()
    pool.join()  # 进程池中进程执行完毕后再关闭，如果注释，那么进程直接关闭
```
