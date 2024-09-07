---
title: "SaltStack实战之manage、salt-ssh和salt jobs"
date: "2017-06-22"
categories: 
  - "automation"
tags: 
  - "saltstack"
---

# SaltStack实战之manage、salt-ssh和salt jobs

\[TOC\]

![](images/saltstack_logo-300x154.png)

## 1\. SALT.RUNNERS.MANAGE

Manage官方文档： [https://docs.saltstack.com/en/latest/ref/runners/all/salt.runners.manage.html#module-salt.runners.manage](https://docs.saltstack.com/en/latest/ref/runners/all/salt.runners.manage.html#module-salt.runners.manage)

salt-run manage.up # 显示当前存活的minion。 salt-run manage.down # 显示当前未存活的minion。 salt-run manage.down removekeys=True # 显示未存活的minion，并将其删除。 salt-run manage.status # 显示当前up和down的minion。 salt-run manage.vesions # 显示master和所有minion的版本。

## 2\. salt-ssh

salt-ssh官方文档： [https://docs.saltstack.com/en/latest/topics/ssh/index.html](https://docs.saltstack.com/en/latest/topics/ssh/index.html)

**配置文件**/etc/salt/roster

```null
<Salt ID>:  # 目标ID
  host:  # 远程主机的IP地址或者主机名
  user:  # 可以登录的用户
  passwd:  # 可以登录用户的密码（可选）
  port:   # ssh端口
  sudo:  # 是否运行sudo，设置True或者False
  priv:  # ssh私钥的路径，默认是/etc/salt/pki/master/ssh/salt-ssh.rsa
  timeout:  # 连接ssh时的超时时间
```

**salt-ssh功能** 运行原始shell调用：`-r`

```null
[root@salt-master112 keepalived]# salt-ssh '*' -r 'df -h'
node1:
    ----------
    retcode:
        0
    stderr:
    stdout:
        Filesystem            Size  Used Avail Use% Mounted on
        /dev/mapper/vg_im75-LogVol01
                              287G   11G  262G   4% /
        tmpfs                 3.9G   20K  3.9G   1% /dev/shm
        /dev/sda1             477M   69M  383M  16% /boot
node2:
    ----------
    retcode:
        0
    stderr:
    stdout:
        Filesystem            Size  Used Avail Use% Mounted on
        /dev/mapper/vg_im75-LogVol01
                              287G  9.5G  263G   4% /
        tmpfs                 3.9G   12K  3.9G   1% /dev/shm
        /dev/sda1             477M   69M  383M  16% /boot
[root@salt-master112 keepalived]#
```

状态管理：同salt

Target：支持glob及正则

## 3\. salt job

官方文档： [https://docs.saltstack.com/en/latest/topics/jobs/](https://docs.saltstack.com/en/latest/topics/jobs/)

以下是常用的job相关的方法： `saltutil.running` # 查看当前正在运行的jobs `saltutil.find_job` # 查看指定jid的job `saltutil.signal_job` # 指定的jid进程发送信号 `saltutil.term_job` # 终止指定的jid进程（信号为15） `saltutil.kill_job` # 终止指定的jid进程（信号为9）

任务运行时，minion端/var/cache/salt/minion/proc下存放jid临时文件 master端/var/cache/salt/master/jobs默认缓存24小时

`salt-run jobs.active` # 查看所有minion当前正在运行的jobs（在所有minions上运行saltutil.running） `salt-run jobs.lookup_jid` # 从master jobs cache中查询指定jid的运行结果 `salt-run jobs.list_jobs` # 列出当前master jobs cache中的所有job

按照官方文档的描述,计划任务有3种配置方式,分别是: \* 在master配置文件中配置 \* 在minion配置文件中配置 \* 在pillar中配置

下面介绍schedule在pillar中的用法： 我的pillar文件夹是 /srv/salt/pillar 首先创建一个 /srv/salt/pillar/top.sls

```yaml
base:
  "*"
    - schedule
```

然后创建 /srv/salt/pillar/schedule.sls

```yaml
schedule:
  test-job:
    function: cmd.run
    seconds: 10
    args:
      - 'uptime >> /tmp/uptime.log'
```

这个调度任务的意思是 每隔10秒执行`uptime`，将结果追加到`/tmp/uptime.log`中。

创建完文件之后执行下面的命令把pillar的修改刷到minion端去

```bash
salt "*" saltutil.refresh_pillar
```

这样就完成了一个简单的计划任务创建。 想查看minion端都有哪些计划任务可以用

```bash
salt "*" pillar.get schedule
```

或者

```bash
salt "*" config.option schedule
```
