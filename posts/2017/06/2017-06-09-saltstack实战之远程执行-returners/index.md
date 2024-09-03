---
title: "SaltStack实战之远程执行-Returners"
date: "2017-06-09"
categories: 
  - "automation"
tags: 
  - "saltstack"
---

# SaltStack实战之远程执行-Returners

![](images/saltstack_logo-300x154.png)  
\[TOC\]

## 1\. Returners列表

https://docs.saltstack.com/en/latest/ref/returners/all/index.html

| returners | description |
| --- | --- |
| carbon\_return | Take data from salt and "return" it into a carbon receiver |
| cassandra\_cql\_return | Return data to a cassandra server |
| cassandra\_return | Return data to a Cassandra ColumnFamily |
| couchbase\_return | Simple returner for Couchbase. |
| couchdb\_return | S imple returner for CouchDB. |
| django\_return | A returner that will infor a Django system that returns are available using Django's signal system. |
| elasticsearch\_return | Return data to an elasticsearch server for indexing. |
| etcd\_return | Return data to an etcd server or cluster |
| hipchat\_return | Return salt data via hipchat. |
| influxdb\_return | Return data to an influxdb server. |
| kafka\_return | Return data to a Kafka topic |
| local | The local returner is used to test the returner interface, it just prints the |
| local\_cache | Return data to local job cache |
| memcache\_return | Return data to a memcache server |
| mongo\_future\_return | Return data to a mongodb server |
| mongo\_return | Return data to a mongodb server |
| multi\_returner | Read/Write multiple returners |
| mysql | Return data to a mysql server |
| nagios\_return | Return salt data to Nagios |
| odbc | Return data to an ODBC compliant server. |
| pgjsonb | Return data to a PostgreSQL server with json data stored in Pg's jsonb data type |
| postgres | Return data to a postgresql server |
| postgres\_local\_cache | Use a postgresql server for the master job cache. |
| pushover\_returner | Return salt data via pushover (http://www.pushover.net) |
| rawfile\_json | Take data from salt and "return" it into a raw file containing the json, with one line per event. |
| redis\_return | Return data to a redis server |
| sentry\_return | Salt returner that reports execution results back to sentry. |
| slack\_returner | Return salt data via slack |
| sms\_return | Return data by SMS. |
| smtp\_return | Return salt data via email |
| splunk | Send json response data to Splunk via the HTTP Event Collector |
| sqlite3\_return | Insert minion return data into a sqlite3 database |
| syslog\_return | Return data to the host operating system's syslog facility |
| xmpp\_return | Return salt data via xmpp |
| zabbix\_return | Return salt data to Zabbix |

## 2\. 介绍mysql returner的用法

因mysql returner使用需要python MySQLdb模块，所以需要先安装MySQLdb模块。

## 2.1 安装pip和MySQLdb

在下列地址下载安装包。 https://pypi.python.org/pypi/setuptools https://pypi.python.org/pypi/pip/

```
[root@salt-master111 tmp]# yum -y install python-devel mysql-devel
[root@salt-master111 tmp]# unzip setuptools-36.0.1.zip
[root@salt-master111 tmp]# cd setuptools-36.0.1
[root@salt-master111 tmp]# python setup.py install
[root@salt-master111 tmp]# cd ../
[root@salt-master111 tmp]# tar -zxvf pip-9.0.1.tar.gz 
[root@salt-master111 tmp]# cd pip-9.0.1
[root@salt-master111 tmp]# python setup.py install
[root@salt-master111 tmp]# pip install mysql
[root@salt-master111 tmp]# python
Python 2.7.5 (default, Nov  6 2016, 00:28:07) 
[GCC 4.8.5 20150623 (Red Hat 4.8.5-11)] on linux2
Type "help", "copyright", "credits" or "license" for more information.
>>> import MySQLdb
>>> 
```

## 2.2 配置mysql数据库

使用官方的数据表结构，并给minion服务器相关权限。

```
CREATE DATABASE  `salt`
  DEFAULT CHARACTER SET utf8
  DEFAULT COLLATE utf8_general_ci;

USE `salt`;

--
-- Table structure for table `jids`
--

DROP TABLE IF EXISTS `jids`;
CREATE TABLE `jids` (
  `jid` varchar(255) NOT NULL,
  `load` mediumtext NOT NULL,
  UNIQUE KEY `jid` (`jid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX jid ON jids(jid) USING BTREE;

--
-- Table structure for table `salt_returns`
--

DROP TABLE IF EXISTS `salt_returns`;
CREATE TABLE `salt_returns` (
  `fun` varchar(50) NOT NULL,
  `jid` varchar(255) NOT NULL,
  `return` mediumtext NOT NULL,
  `id` varchar(255) NOT NULL,
  `success` varchar(10) NOT NULL,
  `full_ret` mediumtext NOT NULL,
  `alter_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY `id` (`id`),
  KEY `jid` (`jid`),
  KEY `fun` (`fun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `salt_events`
--

DROP TABLE IF EXISTS `salt_events`;
CREATE TABLE `salt_events` (
`id` BIGINT NOT NULL AUTO_INCREMENT,
`tag` varchar(255) NOT NULL,
`data` mediumtext NOT NULL,
`alter_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`master_id` varchar(255) NOT NULL,
PRIMARY KEY (`id`),
KEY `tag` (`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

grant all on salt.* to salt@"10.1.0.%" identified by "saltpass";
```

## 2.2 配置salt-master

`/etc/salt/master`

```
return: mysql
mysql.host: 'salt-host'
mysql.user: 'salt'
mysql.pass: 'saltpass'
mysql.db: 'salt'
```

重启master和minion服务

```
systemctl restart salt-master
systemctl restart salt-minion
```

## 2.3 测试

master端执行命令。

```
[root@salt-master111 ~]# salt 'salt-master111' test.ping --return mysql
salt-master111:
    True
[root@salt-master111 ~]# 
```

在数据库中查看，salt\_returns是否有数据进来。

```
mysql> select * from salt_returns;
+-----------+----------------------+--------+----------------+---------+--------------------------------------------------------------------------------------------------------------------------------------------+---------------------+
| fun       | jid                  | return | id             | success | full_ret                                                                                                                                   | alter_time          |
+-----------+----------------------+--------+----------------+---------+--------------------------------------------------------------------------------------------------------------------------------------------+---------------------+
| test.ping | 20170609172835506510 | true   | salt-master111 | 1       | {"fun_args": [], "jid": "20170609172835506510", "return": true, "retcode": 0, "success": true, "fun": "test.ping", "id": "salt-master111"} | 2017-06-09 17:28:35 |
| test.ping | 20170609172841714924 | true   | salt-master111 | 1       | {"fun_args": [], "jid": "20170609172841714924", "return": true, "retcode": 0, "success": true, "fun": "test.ping", "id": "salt-master111"} | 2017-06-09 17:28:41 |
| test.ping | 20170609173636297217 | true   | salt-master111 | 1       | {"fun_args": [], "jid": "20170609173636297217", "return": true, "retcode": 0, "success": true, "fun": "test.ping", "id": "salt-master111"} | 2017-06-09 17:36:36 |
| test.ping | 20170609173653113715 | true   | salt-master111 | 1       | {"fun_args": [], "jid": "20170609173653113715", "return": true, "retcode": 0, "success": true, "fun": "test.ping", "id": "salt-master111"} | 2017-06-09 17:36:53 |
+-----------+----------------------+--------+----------------+---------+--------------------------------------------------------------------------------------------------------------------------------------------+---------------------+
4 rows in set (0.00 sec)
```
