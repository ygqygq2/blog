---
title: "SaltStack之修改salt-minion id"
date: "2017-06-06"
categories: 
  - "automation"
tags: 
  - "saltstack"
---

# SaltStack之修改salt-minion id

\[TOC\] ![](images/saltstack_logo.png)

## 1\. 需求背景

之前使用saltstack添加的主机默认使用了hostname作为salt-minion id，而主机名如果没有做规范和规划，是比较难区分属于什么业务或者机器的。我们需要修改salt-minion的id。

## 2\. 解决办法

- 停止salt-minion服务

```
service salt-minion stop
```

- 删除salt-minion公钥文件

```
rm /etc/salt/pki/minion/minion.pub
rm /etc/salt/pki/minion/minion.pem
```

- 修改新minion\_id

```
echo NewId > /etc/salt/minion_id
```

- master上删除旧的key

```
salt-key -d oldId
```

- minion端重新启动salt-minion

```
service salt-minion start
```

- master端重新接受新的key

```
salt-key -a NewId
```

至此已经修改完成。
