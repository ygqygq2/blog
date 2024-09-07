---
title: "SaltStack实战之SaltStack快速入门"
date: "2017-06-06"
categories: 
  - "automation"
tags: 
  - "saltstack"
---

# SaltStack实战之SaltStack快速入门

\[TOC\]

## 1\. SaltStack介绍

![](images/saltstack_logo.png) Salt，一种全新的基础设施管理方式，部署轻松，在几分钟内可运行起来，扩展性好，很容易管理上万台服务器，速度够快，服务器之间秒级通讯。 SaltStack是使用Python语言开发，同时提供Rest API方便二次开发以及和其它平台进行集成。 Salt底层采用动态的连接总线, 使其可以用于编配, 远程执行, 配置管理等等。 其它详细介绍：http://docs.saltstack.cn/topics/index.html

### 1.1 SaltStack常用网址

官方网站：http://www.saltstack.com 官方文档：http://docs.saltstack.com GitHub：https://github.com/saltstack 中国SaltStack用户组：http://www.saltstack.cn

### 1.2 SaltStack运行方式

```
* Local
* Master/Minion
* Salt SSH
```

### 1.3 SaltStack三大功能

```
* 远程执行
* 配置管理
* 云管理
```

Salt对于常用操作系统都支持。windows不支持Slat-master。

## 2\. SaltStack部署

环境：CentOS6及以上版本 安装方式：推荐用yum 如果安装失败，可先执行 `yum -y update python` 再执行 `yum -y install salt-master salt-minion` 安装教程详细介绍：http://docs.saltstack.cn/topics/installation/index.html#installation

### 2.1 SaltStack master配置

`vim /etc/salt/master` # 修改`interface`配置为`0.0.0.0`

```
interface: 0.0.0.0
```

配置文件其它参数详细介绍：http://docs.saltstack.cn/ref/configuration/master.html

### 2.2 SaltStack minion配置

`vim /etc/salt/minion` # 修改`master`配置为`master主机IP`

```
master: 10.1.0.111
```

配置文件其它参数详细介绍：http://docs.saltstack.cn/ref/configuration/minion.html

### 2.3 SaltStack认证

```
[root@salt-master111 ~]# salt-key -A
[root@salt-master111 ~]# salt-key -L
Accepted Keys:
salt-master111
Denied Keys:
Unaccepted Keys:
Rejected Keys:
[root@salt-master111 ~]# 
```

### 2.4 saltsatck远程执行

```
[root@salt-master111 ~]# salt 'salt-master111' cmd.run 'uptime'
salt-master111:
     11:04:55 up 202 days,  1:25,  1 user,  load average: 0.11, 0.15, 0.20
[root@salt-master111 ~]# salt 'salt-master111' test.ping
salt-master111:
    True
[root@salt-master111 ~]# 
```

以上的`cmd`、`test`是模块，`ping`、`run`是其相应模块的”功能函数”。

### 2.5 saltsatck配置管理

Salt使用State模块文件进行配置管理，使用YAML编写，以.sls结尾。 了解salt state：http://docs.saltstack.cn/topics/tutorials/starting\_states.html

#### 2.5.1 修改master配置

`vim /etc/salt/master` # 修改file\_roots配置如下

```
file_roots:
  base:
    - /srv/salt
```

修改后，重启master服务。

`service salt-master restart`

#### 2.5.2 创建top.sls文件

创建一个top.sls文件，这个也是入口文件，也就是说，你执行相关命令的时候，会先检测这个文件，这文件提供了其它文件的映射，可以用于作为其它服务器的基础配置文件。 `vim /srv/salt/top.sls`

```
base:
  '*':
    - apache
    - user.useradd
    - user.users
    - user.userpasswd
    - user.userdel
    - user.sudoadd
    - user.groupadd
    - user.groupdel:
```

> 说明： base表示基础入口； `'*'`表示应用到所有minion； `-`后接子sls配置文件，不需要写文件后缀，`.`前表示文件夹；

#### 2.5.3 创建子sls文件

`vim /srv/salt/apache.sls`

```
apache-service:
  pkg.installed:
    - names:
      - httpd
      - httpd-devel
    service.running:
      - name: httpd
      - enable: True
```

#### 2.5.4 执行生效

执行如下命令，apache服务则会自动安装和启动。 `salt 'salt-master111' state.highstate`

其它详细文档：http://docs.saltstack.cn/topics/states/index.html
