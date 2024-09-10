---
title: "3台服务器Redis高可用哨兵模式"
date: "2017-05-06"
categories:
  - "database"
tags:
  - "redis"
  - "哨兵"
  - "高可用"
---

# 3 台服务器 Redis 高可用哨兵模式

[TOC]

## 1\. 介绍

![](images/redis_logo-300x169.jpg) Redis 的 Sentinel 系统用于管理多个 Redis 服务器（instance）， 该系统执行以下三个任务： **监控**（Monitoring）： Sentinel 会不断地检查你的主服务器和从服务器是否运作正常。 **提醒**（Notification）： 当被监控的某个 Redis 服务器出现问题时， Sentinel 可以通过 API 向管理员或者其他应用程序发送通知。 **自动故障迁移**（Automatic failover）： 当一个主服务器不能正常工作时， Sentinel 会开始一次自动故障迁移操作， 它会将失效主服务器的其中一个从服务器升级为新的主服务器， 并让失效主服务器的其他从服务器改为复制新的主服务器； 当客户端试图连接失效的主服务器时， 集群也会向客户端返回新主服务器的地址， 使得集群可以使用新主服务器代替失效服务器。 Redis Sentinel 是一个分布式系统， 你可以在一个架构中运行多个 Sentinel 进程（progress）， 这些进程使用流言协议（gossip protocols)来接收关于主服务器是否下线的信息， 并使用投票协议（agreement protocols）来决定是否执行自动故障迁移， 以及选择哪个从服务器作为新的主服务器。 虽然 Redis Sentinel 释出为一个单独的可执行文件 redis-sentinel ， 但实际上它只是一个运行在特殊模式下的 Redis 服务器， 你可以在启动一个普通 Redis 服务器时通过给定 –sentinel 选项来启动 Redis Sentinel 。

环境 CentOS7.2 redis3.2.8

| 服务器 IP  | redis 端口 | 哨兵端口 | 服务器角色 |
| :--------- | :--------: | :------: | :--------: |
| 10.1.0.160 |    6379    |  26379   |     主     |
| 10.1.0.161 |    6379    |  26379   |    从 1    |
| 10.1.0.71  |    6379    |  26379   |    从 2    |

## 2\. redis 程序安装

以下是单 redis 安装脚本，可适用于单 redis 使用。 `cat install_redis.sh`

```
#!/usr/bin/env bash
# It's Used to be install redis.
# Created on 2016/10/19 11:18.
# @author: Chinge_Yang.
# Version: 1.0

function install_redis () {
#################################################################################################
        sourcepackage_dir="/tmp"
        redis_install_dir="/usr/local/redis"
        cd ${sourcepackage_dir}
        if [ ! -f " redis-stable.tar.gz" ]; then
                wget http://download.redis.io/releases/redis-stable.tar.gz
        fi
        cd ${makework_dir}
        tar -zxvf ${sourcepackage_dir}/redis-stable.tar.gz
        cd redis-stable
        make PREFIX=/usr/local/redis install
        return_echo "make"
        mkdir -p /usr/local/redis/{etc,var}
        rsync -avz redis.conf  /usr/local/redis/etc/
        sed -i 's@pidfile.*@pidfile /var/run/redis-server.pid@' $redis_install_dir/etc/redis.conf
        sed -i "s@logfile.*@logfile $redis_install_dir/var/redis.log@" $redis_install_dir/etc/redis.conf
        sed -i "s@^dir.*@dir $redis_install_dir/var@" $redis_install_dir/etc/redis.conf
        sed -i 's/daemonize no/daemonize yes/g' /usr/local/redis/etc/redis.conf
        sed -i 's/^# bind 127.0.0.1/bind 127.0.0.1/g' /usr/local/redis/etc/redis.conf
        rsync -avz ${sourcepackage_dir}/init.d/redis-server /etc/init.d/
        /etc/init.d/redis-server start
        chkconfig --add redis-server
        chkconfig redis-server on
 #################################################################################################
}

install_redis
```

redis 启停脚本示例： `cat redis-server`

```
#!/bin/bash
#
# redis - this script starts and stops the redis-server daemon
#
# chkconfig:   - 85 15
# description:  Redis is a persistent key-value database
# processname: redis-server
# config:      /usr/local/redis/etc/redis.conf
# config:      /etc/sysconfig/redis
# pidfile:     /usr/local/redis/var/redis-server.pid

# Source function library.
. /etc/rc.d/init.d/functions

# Source networking configuration.
. /etc/sysconfig/network

# Check that networking is up.
[ "$NETWORKING" = "no" ] && exit 0

redis="/usr/local/redis/bin/redis-server"
prog=$(basename $redis)

REDIS_CONF_FILE="/usr/local/redis/etc/redis.conf"

[ -f /etc/sysconfig/redis ] && . /etc/sysconfig/redis

lockfile=/var/lock/subsys/redis-server

start() {
    [ -x $redis ] || exit 5
    [ -f $REDIS_CONF_FILE ] || exit 6
    echo -n $"Starting $prog: "
    daemon $redis $REDIS_CONF_FILE
    retval=$?
    echo
    [ $retval -eq 0 ] && touch $lockfile
    return $retval
}

stop() {
    echo -n $"Stopping $prog: "
    killproc $prog
    retval=$?
    echo
    [ $retval -eq 0 ] && rm -f $lockfile
    return $retval
}

restart() {
    stop
    start
}

reload() {
    echo -n $"Reloading $prog: "
    killproc $redis -HUP
    RETVAL=$?
    echo
}

force_reload() {
    restart
}

rh_status() {
    status $prog
}

rh_status_q() {
    rh_status >/dev/null 2>&1
}

case "$1" in
    start)
        rh_status_q && exit 0
        $1
        ;;
    stop)
        rh_status_q || exit 0
        $1
        ;;
    restart)
        $1
        ;;
    reload)
        rh_status_q || exit 7
        $1
        ;;
    force-reload)
        force_reload
        ;;
    status)
        rh_status
        ;;
    condrestart|try-restart)
        rh_status_q || exit 0
            ;;
    *)
        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload}"
        exit 2
esac
```

redis-sentinel 启停脚本示例：

```
#!/bin/bash
#
# redis-sentinel - this script starts and stops the redis-server sentinel daemon
#
# chkconfig:   - 85 15
# description:  Redis sentinel
# processname: redis-server
# config:      /usr/local/redis/etc/sentinel.conf
# config:      /etc/sysconfig/redis
# pidfile:     /usr/local/redis/var/redis-sentinel.pid

# Source function library.
. /etc/rc.d/init.d/functions

# Source networking configuration.
. /etc/sysconfig/network

# Check that networking is up.
[ "$NETWORKING" = "no" ] && exit 0

redis="/usr/local/redis/bin/redis-sentinel"
prog=$(basename $redis)

REDIS_CONF_FILE="/usr/local/redis/etc/sentinel.conf"

[ -f /etc/sysconfig/redis ] && . /etc/sysconfig/redis

lockfile=/var/lock/subsys/redis-sentinel

start() {
    [ -x $redis ] || exit 5
    [ -f $REDIS_CONF_FILE ] || exit 6
    echo -n $"Starting $prog: "
    daemon $redis $REDIS_CONF_FILE --sentinel
    retval=$?
    echo
    [ $retval -eq 0 ] && touch $lockfile
    return $retval
}

stop() {
    echo -n $"Stopping $prog: "
    killproc $prog
    retval=$?
    echo
    [ $retval -eq 0 ] && rm -f $lockfile
    return $retval
}

restart() {
    stop
    start
}

reload() {
    echo -n $"Reloading $prog: "
    killproc $redis -HUP
    RETVAL=$?
    echo
}

force_reload() {
    restart
}

rh_status() {
    status $prog
}

rh_status_q() {
    rh_status >/dev/null 2>&1
}

case "$1" in
    start)
        rh_status_q && exit 0
        $1
        ;;
    stop)
        rh_status_q || exit 0
        $1
        ;;
    restart)
        $1
        ;;
    reload)
        rh_status_q || exit 7
        $1
        ;;
    force-reload)
        force_reload
        ;;
    status)
        rh_status
        ;;
    condrestart|try-restart)
        rh_status_q || exit 0
            ;;
    *)
        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload}"
        exit 2
esac
```

## 3\. 哨兵模式配置

3 台主机相同设置： 1. 按照前面单 redis 安装方法安装程序； 2. 创建相应数据目录；

```
mkdir -p /usr/local/redis/data/redis
mkdir -p /usr/local/redis/data/sentinel
mkdir -p /usr/local/redis/sbin
vim /usr/local/redis/sbin/redis-server  # 使用上文中的示例脚本
vim /usr/local/redis/sbin/redis-sentinel  # 使用上文中的示例脚本
```

### 3.1 主 redis 配置

`vim redis.conf`

```
daemonize yes
pidfile "/usr/local/redis/var/redis-server.pid"
port 6379
tcp-backlog 128
timeout 0
tcp-keepalive 0
loglevel notice
logfile "/usr/local/redis/var/redis-server.log"
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir "/usr/local/redis/data/redis"
masterauth "20170310"
requirepass "20170310"
slave-serve-stale-data yes
slave-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
repl-disable-tcp-nodelay no
slave-priority 100
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
lua-time-limit 5000
slowlog-log-slower-than 10000
slowlog-max-len 128
latency-monitor-threshold 0
notify-keyspace-events ""
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-entries 512
list-max-ziplist-value 64
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit slave 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
aof-rewrite-incremental-fsync yes
```

**群集文件配置** `vim sentinel.conf`

```
port 26379
pidfile "/usr/local/redis/var/redis-sentinel.pid"
dir "/usr/local/redis/data/sentinel"
daemonize yes
logfile "/usr/local/redis/var/redis-sentinel.log"
sentinel monitor mymaster 10.1.0.160 6379 2
sentinel parallel-syncs mymaster 2
sentinel auth-pass mymaster 20170310
```

### 3.2 从 redis 配置

相对主 redis 配置，多添加了如下行：

```
slaveof 10.1.0.160 6379
```

`vim redis.conf`

```
daemonize yes
pidfile "/usr/local/redis/var/redis-server.pid"
port 6379
tcp-backlog 128
timeout 0
tcp-keepalive 0
loglevel notice
logfile "/usr/local/redis/var/redis-server.log"
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir "/usr/local/redis/data/redis"
masterauth "20170310"
requirepass "20170310"
slaveof 10.1.0.160 6379
slave-serve-stale-data yes
slave-read-only yes
repl-diskless-sync no
repl-diskless-sync-delay 5
repl-disable-tcp-nodelay no
slave-priority 90
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
aof-load-truncated yes
lua-time-limit 5000
slowlog-log-slower-than 10000
slowlog-max-len 128
latency-monitor-threshold 0
notify-keyspace-events ""
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-entries 512
list-max-ziplist-value 64
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64
hll-sparse-max-bytes 3000
activerehashing yes
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit slave 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
hz 10
aof-rewrite-incremental-fsync yes
```

vim sentinel.conf

```
port 26379
pidfile "/usr/local/redis/var/redis-sentinel.pid"
dir "/usr/local/redis/data/sentinel"
daemonize yes
logfile "/usr/local/redis/var/redis-sentinel.log"
sentinel monitor mymaster 10.1.0.160 6379 2
sentinel config-epoch mymaster 0
```

## 3.3 启动 redis 和哨兵

启动 redis，主从都要启动 `/usr/local/redis/sbin/redis-server start` 启动群集监控，主从都要启动 `/usr/local/redis/sbin/redis-sentinel start`

启动报错处理

```
错误1：
WARNING overcommit_memory is set to 0! Background save may fail under low memory condition. To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and then reboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.

解决方法(overcommit_memory)
1. `vim /etc/sysctl.conf`添加如下设置 , 然后`sysctl -p`
"vm.overcommit_memory = 1"
可选值：0、1、2。

0， 表示内核将检查是否有足够的可用内存供应用进程使用；如果有足够的可用内存，内存申请允许；否则，内存申请失败，并把错误返回给应用进程。
1， 表示内核允许分配所有的物理内存，而不管当前的内存状态如何。
2， 表示内核允许分配超过所有物理内存和交换空间总和的内存

注意：redis在dump数据的时候，会fork出一个子进程，理论上child进程所占用的内存和parent是一样的，比如parent占用 的内存为8G，这个时候也要同样分配8G的内存给child,如果内存无法负担，往往会造成redis服务器的down机或者IO负载过高，效率下降。所 以这里比较优化的内存分配策略应该设置为 1（表示内核允许分配所有的物理内存，而不管当前的内存状态如何）。
这里又涉及到Overcommit和OOM。

什么是Overcommit和OOM？
在Unix中，当一个用户进程使用malloc()函数申请内存时，假如返回值是NULL，则这个进程知道当前没有可用内存空间，就会做相应的处理工作。许多进程会打印错误信息并退出。
Linux使用另外一种处理方式，它对大部分申请内存的请求都回复"yes"，以便能跑更多更大的程序。因为申请内存后，并不会马上使用内存。这种技术叫做Overcommit。
当内存不足时，会发生OOM killer(OOM=out-of-memory)。它会选择杀死一些进程(用户态进程，不是内核线程)，以便释放内存。

Overcommit的策略
Linux下overcommit有三种策略(Documentation/vm/overcommit-accounting)：
0. 启发式策略。合理的overcommit会被接受，不合理的overcommit会被拒绝。
1. 任何overcommit都会被接受。
2. 当系统分配的内存超过swap+N%*物理RAM(N%由vm.overcommit_ratio决定)时，会拒绝commit。
overcommit的策略通过vm.overcommit_memory设置。
overcommit的百分比由vm.overcommit_ratio设置。

# echo 2 > /proc/sys/vm/overcommit_memory
# echo 80 > /proc/sys/vm/overcommit_ratio

当oom-killer发生时，linux会选择杀死哪些进程
选择进程的函数是oom_badness函数(在mm/oom_kill.c中)，该函数会计算每个进程的点数(0~1000)。
点数越高，这个进程越有可能被杀死。
每个进程的点数跟oom_score_adj有关，而且oom_score_adj可以被设置(-1000最低，1000最高)。

错误2：
WARNING: The TCP backlog setting of 511 cannot be enforced because /proc/sys/net/core/somaxconn is set to the lower value of 128.

echo 511 > /proc/sys/net/core/somaxconn

错误3：
16433:X 12 Jun 14:52:37.734 * Increased maximum number of open files to 10032 (it was originally set to 1024).

新装的linux默认只有1024，当负载较大时，会经常出现error: too many open files

ulimit -a：使用可以查看当前系统的所有限制值

vim /etc/security/limits.conf
在文件的末尾加上

* soft nofile 65535
* hard nofile 65535

执行su或者重新关闭连接用户再执行ulimit -a就可以查看修改后的结果。
```

故障切换机制

1. 启动群集之后，群集程序默认会在主从的 sentinel.conf 文件中加入群集信息

主：

```
port 26379
pidfile "/usr/local/redis/var/redis-sentinel.pid"
dir "/usr/local/redis/data/sentinel"
daemonize yes
logfile "/usr/local/redis/var/redis-sentinel.log"
sentinel myid aeff525d03a2234ef834808f7991761db03a1973
sentinel monitor mymaster 10.1.0.160 6379 2
sentinel parallel-syncs mymaster 2
sentinel auth-pass mymaster 20170310
# Generated by CONFIG REWRITE
sentinel config-epoch mymaster 0
sentinel leader-epoch mymaster 0
sentinel known-slave mymaster 10.1.0.71 6379
sentinel known-slave mymaster 10.1.0.161 6379
sentinel current-epoch 0
```

从 1：

```
port 26379
pidfile "/usr/local/redis/var/redis-sentinel.pid"
dir "/usr/local/redis/data/sentinel"
daemonize yes
logfile "/usr/local/redis/var/redis-sentinel.log"
sentinel myid 01b1b7674abe648f6a2344fc5610e73b7e87cb8a
sentinel monitor mymaster 10.1.0.160 6379 2
sentinel config-epoch mymaster 0
# Generated by CONFIG REWRITE
sentinel leader-epoch mymaster 0
sentinel current-epoch 0
```

从 2：

```
port 26379
pidfile "/usr/local/redis/var/redis-sentinel.pid"
dir "/usr/local/redis/data/sentinel"
daemonize yes
logfile "/usr/local/redis/var/redis-sentinel.log"
sentinel myid f1589f48079b3b3b536add4e2e01a36304aeba8c
sentinel monitor mymaster 10.1.0.160 6379 2
sentinel config-epoch mymaster 0
# Generated by CONFIG REWRITE
sentinel leader-epoch mymaster 0
sentinel current-epoch 0
```

模拟主故障

```
[root@show160 redis]# /usr/local/redis/bin/redis-cli -p 6379
127.0.0.1:6379> AUTH 20170310
OK
127.0.0.1:6379> DEBUG SEGFAULT
Could not connect to Redis at 127.0.0.1:6379: Connection refused
not connected> quit
```

从哨兵配置文件中可以看到当前的主库的已经发生了改变

## 4\. 总结

redis 的哨兵端口 26379 使用 redis-cli 可以连接查看哨兵相关信息，要想连接此高可用 redis，可使用官方的连接客户端。使用哨兵监控当主故障后会自动切换从为主，当主启动后就变成了从。至少要 3 哨兵和 3redis 节点才能允许挂一节点还能保证服务可用性。

参考资料： https://redis.io/topics/sentinel http://www.redis.cn/topics/sentinel.html http://www.majunwei.com/view/201610302123020678.html
