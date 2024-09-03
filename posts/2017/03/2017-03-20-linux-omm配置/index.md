---
title: "Linux OMM配置"
date: "2017-03-20"
categories: 
  - "system-operations"
tags: 
  - "linux"
  - "oom"
---

# Linux OMM配置

\[TOC\]

## 1\. 背景

新版redis启动时，可能会报如下警告：

WARNING overcommit\_memory is set to 0! Background save may fail under low memory condition. To fix this issue add 'vm.overcommit\_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit\_memory=1' for this to take effect.

## 2\. OOM 简介

Out Of Memory Killer 是 Linux 的一种系统保护机制，实现了内存紧张时 kill 掉某些进程防止系统卡死的问题。内核官方文档在此 kernel vm instruction。

Kill 的默认机制是扫描所有进程任务的内存占用、CPU占用等因素然后打分（badness），分值越高，kill 的优先级越高。进程分值可以在 /proc/PID/oom\_score 文件中查看。分值范围为-17 ~ 50。可以通过手动将一个进程的 oom\_score 配置为-17来防止该进程被 kill。

OOM Killer 配置有两种方法：

> 1. 在 /etc/sysctl.conf 中配置，然后 sysctl -p 更新
> 2. 直接 echo 值到 /proc/sys/vm 中对应的参数接口

OOM 常用配置项

vm.panic\_on\_oom：触发 oom 机制时是否触发 kernel panic，打开会在触发OOM时重启机器，推荐配置为 0（关闭）

vm.oom\_kill\_allocating\_task：直接 kill 掉触发 oom 机制的进程，而不去扫描进程然后打分（会占用比较多的资源）。此案例中推荐配置为 1 打开，因为内存泄露的进程会以很快的速度占满内存，很可能再扫描打分结束前系统就 freeze 了。

vm.overcommit\_memory：是否允许程序申请过量的内存，默认为0。有0，1，2三个选项（此案例推荐为2，平时推荐为0）：

> 0：内核会预估是否有充足的内存，然后再为进程分配内存 1：内核会永远认为有充足的内存可用，进程申请内存时总是允许 2：内核永远不允许进程申请定额以上的内存，定额有两个参数可以配置 vm.overcommit\_kbytes：最大允许申请的内存，单位为 kbytes，配置后，应用程序不允许申请 swap + 该值 以上的内存。默认为0表示禁用。

vm.overcommit\_ratio：最大允许申请的物理内存百分比，配置后，应用程序不允许申请 swap + 该值\*物理内存总量 以上的内存。默认为50%。此例推荐配置为 85%。

## 3\. 配置方法

编辑 /etc/sysctl.conf（较新的 Linux 发行版可以在 sysctl.d 里创建专门的oom配置），添加如下几行：

```
vm.panic_on_oom=0
vm.oom_kill_allocating_task=1
vm.overcommit_memory=2
vm.overcommit_ratio=85
```

保存退出后执行: sysctl -p，确认参数更新无误即可。

也可以采用第二种配置方法临时配置：

```
echo 0 > /proc/sys/vm/panic_on_oom
echo 1 > /proc/sys/vm/oom_kill_allocating_task
echo 2 > /proc/sys/vm/overcommit_memory=2
echo 85 > /proc/sys/vm/overcommit_ratio=85
```

但要注意该方法配置的参数重启后失效，需要持久化还是需要修改sysctl.conf。
