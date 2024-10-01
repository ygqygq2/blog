---
title: "SaltStack实战之数据系统-Pillar"
date: "2017-06-07"
categories: 
  - "automation"
tags: 
  - "saltstack"
---

# SaltStack实战之数据系统-Pillar

\[toc\]

![](images/saltstack_logo-300x154.png)

## 1\. Pillar简介和应用场景

Pillar是Salt用来分发全局变量到所有minions的一个接口。Pillar data的管理类似于Salt State Tree。 Salt 0.9.8版本增加了pillar（动态数据） 存储位置： \* 存储在master端，存放需要提供给minion的信息。

应用场景： \* 敏感信息：每个minion只能访问master分配给自己的。

## 2\. Pillar应用示例

`[root@salt-master111 ~]# vim /etc/salt/master`

```
pillar_roots:
  base:
    - /srv/pillar
```

```
[root@salt-master111 ~]# mkdir -p /srv/pillar
[root@salt-master111 ~]# cd /srv/pillar/
[root@salt-master111 pillar]# vim zabbix.sls
```

内容如下：

```
Zabbix_Server: 10.1.0.111
```

`[root@salt-master111 pillar]# vim top.sls` 内容如下

```
base:
  '10.1.0.112':
    - zabbix
```

```
[root@salt-master111 pillar]# salt '*' saltutil.refresh_pillar          
10.1.0.112:
    True
salt-master111:
    True
[root@salt-master111 pillar]# 
[root@salt-master111 pillar]# salt -I 'Zabbix_Server:10.1.0.111' test.ping
10.1.0.112:
    True
[root@salt-master111 pillar]# 
```

更多Pillar详情：http://docs.saltstack.cn/topics/pillar/index.html
