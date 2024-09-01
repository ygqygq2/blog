---
title: "SaltStack实战之远程执行-Modules"
date: "2017-06-09"
categories: 
  - "automation"
tags: 
  - "saltstack"
---

# SaltStack实战之远程执行-Modules

\[TOC\] ![](images/saltstack_logo-300x154.png)

## 1\. 官方模块链接

官网可执行模块文档： [https://docs.saltstack.com/en/latest/ref/modules/all/](https://docs.saltstack.com/en/latest/ref/modules/all/)

## 2\. 常用模块

[network模块](https://docs.saltstack.com/en/latest/ref/modules/all/salt.modules.network.html)  
收集和管理网络信息的模块

[service模块](https://docs.saltstack.com/en/latest/ref/modules/all/salt.modules.service.html)  
管理minion系统服务的模块

[state模块](https://docs.saltstack.com/en/latest/ref/modules/all/salt.modules.state.html)  
控制minion端state系统的模块

[file模块](https://docs.saltstack.com/en/latest/ref/modules/all/salt.modules.file.html)  
管理minion端文件和目录相关的模块

## 3\. 禁用cmd模块方法

`vim /etc/salt/master`

```
publisher_acl_blacklist:
#  users:
#    - root
#    - '^(?!sudo_).*$'   #  all non sudo users
  modules:
    - cmd
```

```
[root@salt-master111 ~]# salt '10.1.0.112' cmd.run 'uptime'
10.1.0.112:
     00:51:52 up 204 days,  6:38,  2 users,  load average: 0.00, 0.01, 0.05
[root@salt-master111 ~]# systemctl restart salt-master
[root@salt-master111 ~]# salt '10.1.0.112' cmd.run 'uptime'
Failed to authenticate! This is most likely because this user is not permitted to execute commands, but there is a small possibility that a disk error occurred (check disk/inode usage).
[root@salt-master111 ~]# 
```
