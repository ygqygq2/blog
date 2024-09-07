---
title: "CentOS7.2下unison+inotify的Web目录同步方案"
date: "2017-05-04"
categories: 
  - "system-operations"
tags: 
  - "inotify"
  - "unison"
---

# CentOS7.2下unison+inotify的Web目录同步方案

\[TOC\]

## 1\. 背景

最近需要上线一个公司展厅项目，项目中主要是后台图片管理。因此它基本不会出现多人同时修改同一图片的情况，这样做双机的情况下，WEB目录最好是双向同步。

在Linux下做WEB目录文件同步，一般有如下几种方式：

1. nfs实现web数据共享
2. rsync +inotify实现web数据同步
3. rsync+sersync更快更节约资源实现web数据同步
4. unison+inotify实现web数据双向同步

他们各有优缺点，这里我根据实际情况，选择方案4。

## 2\. Unison简介

![](images/unison.png)

Unison是一款跨平台的文件同步工具，不仅支持本地对本地同步，也支持通过SSH、RSH和Socket等网络协议进行同步。更棒的是，Unison支持双向同步操作，你既可以从A同步到B，也可以从B同步到A，这些都不需要额外的设定。

官方文档： [http://www.seas.upenn.edu/~bcpierce/unison//download/releases/stable/unison-2.48.4-manual.html](http://www.seas.upenn.edu/~bcpierce/unison//download/releases/stable/unison-2.48.4-manual.html)

## 3\. 环境准备

CentOS7.2 2台： show160 10.1.0.160 show161 10.1.0.161

## 4\. 安装Objective Caml compiler

Objective Caml compiler (version 3.11.2 or later) 官网地址：[http://caml.inria.fr/](http://caml.inria.fr/)

```
cd /tmp
wget http://caml.inria.fr/pub/distrib/ocaml-4.03/ocaml-4.03.0.tar.gz
tar -zxvf ocaml-4.03.0.tar.gz
cd ocaml-4.03.0
./configure
make configure
make world opt
make install
```

## 5\. 安装unison

如果需要同步到远程目录，则远程机器也需要安装unison。

```
yum -y install ctags-etags  # 缺少此安装包时下面make步骤会报错
cd /tmp
wget http://www.seas.upenn.edu/~bcpierce/unison//download/releases/stable/unison-2.48.4.tar.gz
mkdir unison-2.48.4 && cd unison-2.48.4
tar -zxvf /tmp/unison-2.48.4.tar.gz
cd src
make UISTYLE=text THREADS=true
cp unison /usr/local/bin/
unison -version  # 有版本信息出现，则安装成功
```

## 6\. 安装inotify

inotify官方地址：[https://en.wikipedia.org/wiki/Inotify](https://en.wikipedia.org/wiki/Inotify)

```
yum -y install inotify-tools
```

## 7\. 配置双机ssh信任

show160上生成密钥，不输入私钥密码。

```
[root@show160 src]# ssh-keygen
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa): 
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/id_rsa.
Your public key has been saved in /root/.ssh/id_rsa.pub.
The key fingerprint is:
d6:3b:8a:47:23:04:5d:31:9a:97:d2:d3:5c:1b:f7:a3 root@show160
The key's randomart image is:
+--[ RSA 2048]----+
|     . .+.  o .  |
|    . .+ = . + . |
|     .+ = o .  ..|
|      .o o    . .|
|     .  S .  E   |
|      ..o  .     |
|       o .o      |
|       ... .     |
|      ...        |
+-----------------+
[root@show160 src]# cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys 
[root@show160 src]# chmod 700 ~/.ssh
[root@show160 src]# chmod 600 ~/.ssh/authorized_keys 
[root@show160 src]# rsync -avz /root/.ssh/authorized_keys root@10.1.0.161:/root/.ssh/authorized_keys 
```

show161上生成密钥，不输入私钥密码。

```
[root@show161 tomcat]# ssh-keygen 
Generating public/private rsa key pair.
Enter file in which to save the key (/root/.ssh/id_rsa): 
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/id_rsa.
Your public key has been saved in /root/.ssh/id_rsa.pub.
The key fingerprint is:
e8:b4:f7:91:ad:a0:83:fb:00:55:c2:c6:2c:65:08:91 root@show161
The key's randomart image is:
+--[ RSA 2048]----+
|o+ *+ .          |
|E o.=o           |
|   o.            |
|   .   .         |
|  .   o S        |
|   . o .   o     |
|    ..o o o .    |
|    ...o o o     |
|    .oo.  o      |
+-----------------+
[root@show161 tomcat]# cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys 
[root@show161 tomcat]# rsync -avz /root/.ssh/authorized_keys root@10.1.0.160:/root/.ssh/authorized_keys 
```

在2台机器上分别ssh对方IP，能无密码登录则表示配置成功。

## 8\. unison的使用

unison的用法非常灵活和简单，可以通过如下三种方式调用unison。 **第一种方式**："unison profile\_name \[options\]" unison默认会读取~/.unison目录下的配置文件"profile\_name.prf"。

> **注意**，在这种方式下，命令行中并没有指出要进行同步的两个地址，所以，此种调用unison的方式必须在配置文件profile\_name.prf中通过相关的root指令设置同步的路径和同步的参数，如：

```
#Unison preferences file 
root = /tmp/test 
root = ssh://root@10.1.0.161//tmp/test/ 
#force = 
#ignore = 
batch = true 
```

**第二种方式**："unison profile root1 root2 \[options\]" root1、root2分别表示要执行同步的两个路径。这两个路径可以是本地目录路径，也可以是远程服务器的路径，如ssh://username@//tmp/test 。由于同步的路径已经在命令行指定了，所以这里无需在profile.prf配置文件中进行root指令的相关设置。

**第三种方式**："unison root1 root2 \[options\]" 这种方式相当于执行"unison default root1 root2"命令，即unison默认读取default.prf的配置。

## 9\. 配置双机web目录同步

```
[root@show160 src]# mkdir -p /root/.unison/
[root@show160 src]# vim /root/.unison/default.prf
```

```
#Unison preferences file 
root = /data/showroom/
root = ssh://root@10.1.0.161//data/showroom/
#force = 
#ignore = 
batch = true
maxthreads = 300
#repeat = 1 
#retry = 3 
owner = true
group = true
perms = -1
fastcheck = false
rsync = false
sshargs = -C
xferbycopying = true
log = true
logfile = /root/.unison/unison.log
```

```
[root@show161 tmp]# mkdir -p /root/.unison/
[root@show161 tmp]# vim /root/.unison/default.prf
```

```
#Unison preferences file 
root = /data/showroom/
root = ssh://root@10.1.0.160//data/showroom/
#force = 
#ignore = 
batch = true
maxthreads = 300
#repeat = 1 
#retry = 3 
owner = true
group = true
perms = -1
fastcheck = false
rsync = false
sshargs = -C
xferbycopying = true
log = true
logfile = /root/.unison/unison.log
```

相关注解如下： force表示会以本地所指定文件夹为标准，将该目录同步到远端。这里需要注意，如果指定了force参数，那么Unison就变成了单项同步了，也就是说会以force指定的文件夹为准进行同步，类似与rsync。 Unison双向同步基本原理是：假如有A B两个文件夹，A文件夹把自己的改动同步到B，B文件夹也把自己的改动同步到A，最后A B两文件夹的内容相同，是AB文件夹的合集。 Unison双向同步的一个缺点是，对于一个文件在两个同步文件夹中都被修改时，unison是不会去同步的，因为unison无法判断以那个为准。 ignore = Path表示忽略指定目录，即同步时不同步它。 batch = true，表示全自动模式，接受缺省动作，并执行。 -fastcheck true 表示同步时仅通过文件的创建时间来比较，如果选项为false，Unison则将比较两地文件的内容。 log = true 表示在终端输出运行信息。 logfile 指定输出的log文件。

另外，Unison有很多参数，这里仅介绍常用的几个，详细的请参看Unison官方手册。 -auto //接受缺省的动作，然后等待用户确认是否执行。 -batch //batch mode, 全自动模式，接受缺省动作，并执行。 -ignore xxx //增加 xxx 到忽略列表中 -ignorecase \[true|false|default\] //是否忽略文件名大小写 -follow xxx //是否支持对符号连接指向内容的同步 owner = true //保持同步过来的文件属主 group = true //保持同步过来的文件组信息 perms = -1 //保持同步过来的文件读写权限 repeat = 1 //间隔1秒后,开始新的一次同步检查 retry = 3 //失败重试 sshargs = -C //使用ssh的压缩传输方式 xferbycopying = true" -immutable xxx //不变目录，扫描时可以忽略 -silent //安静模式 -times //同步修改时间 -path xxx 参数 //只同步 -path 参数指定的子目录以及文件，而非整个目录，-path 可以多次出现。

> **注意**：Windows下的unison配置文件默认位于C:\\Documents and Settings\\currentuser.unison目录，默认的配置文件名是default.prf。

在两台机器都添加如下脚本，并使用nohup方式运行。有需要则将脚本添加到/etc/rc.local中。

```
#/bin/bash 

src="/data/showroom/"

/usr/bin/inotifywait -mrq -e create,delete,modify,move $src | while read line; do
    /usr/local/bin/unison 
    echo -n "$(date +%F-%T) $line" >> /var/log/inotify.log
done
```

## 10\. 总结

经过以上介绍，我们大体知道了unison的使用方法。它的双向同步的确给我们带来了极大的方便，但同时也有一个缺点：**对于一个文件在两个同步文件夹中都被修改时，unison是不会去同步的，因为unison无法判断以哪个为准**，需要人工干预处理，这就需要我们自己权衡利弊。
