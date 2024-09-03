---
title: "Mycat学习实战-Mycat全局主键"
date: "2017-10-23"
categories: 
  - "database"
tags: 
  - "mycat"
  - "mysql"
---

# Mycat学习实战-Mycat全局主键

\[TOC\]

## 1\. Mycat全局主键介绍

在分库分表的情况下，数据库自增主键无法保证自增主键的全局唯一。

全局序列号的语法符合标准SQL规范，其格式为： `next value for MYCATSEQ_XXX` `MYCATSEQ_XXX` 是序列号的名字，MyCAT自动创建新的序列号，免去了开发的复杂度，另外，MyCAT也提供了一个全局的序列号，名称为：`MYCATSEQ_GLOBAL`

注意，`MYCATSEQ_`必须大写才能正确识别。 MyCAT温馨提示：实践中，建议每个表用自己的序列号，序列号的命名建议为`MYCATSEQ _tableName_ID_SEQ`。

SQL中使用说明 自定义序列号的标识为：`MYCATSEQ_XXX` ,其中`XXX`为具体定义的`sequence`的名称，应用举例如下： 使用默认的全局`sequence` : `insert into tb1(id,name) values(next value for MYCATSEQ_GLOBAL,'tb1');` 使用自定义的 `sequence`: `insert into tb2(id,name) values(next value for MYCATSEQ_MY1,'tb2');` 获取最新的值 `select next value for MYCATSEQ_xxx`

## 2\. Mycat全局主键方式

Mycat提供的全局主键方式如下： 1. 本地文件方式：使用服务器本地磁盘文件的方式 2. 数据库方式：使用数据库的方式 3. 本地时间戳方式：使用时间戳方式 4. 分布式zookeeper生成ID

### 2.1 本地文件方式

`vim conf/server.xml`

```
<property name="sequnceHandlerType">0</property>
```

`vim conf/sequence_conf.properties`

```
#default global sequence
GLOBAL.HISIDS=
GLOBAL.MINID=10001
GLOBAL.MAXID=20000
GLOBAL.CURID=10000

# self define sequence
ID_LOCAL_FILE.HISIDS=
ID_LOCAL_FILE.MINID=1001
ID_LOCAL_FILE.MAXID=2000
ID_LOCAL_FILE.CURID=1000
```

> - 以上配置文件中，自定义表名必须大写书写
> - HISIDS：表示使用过的历史分段(一般
> - 无特殊需要可不配置)
> - MINID ：最小ID 值
> - MAXID ：表示最大ID 值
> - CURID 表示当前ID 值。
> - 当 sequence\_conf.properties的配置名字与 表名一致的时候sql可以不包含ID字段（此处表名为`id_local_file`）

`vim conf/schema.xml`

```
<?xml version="1.0"?>
<!DOCTYPE mycat:schema SYSTEM "schema.dtd">
<mycat:schema xmlns:mycat="http://io.mycat/">

        <schema name="test" checkSQLschema="false" sqlMaxLimit="100">
                <table name="id_local_file" dataNode="test1" autoIncrement="true" primaryKey="id"></table>

        </schema>
        <dataNode name="test1" dataHost="testA" database="test" />

        <dataHost name="testA" maxCon="1000" minCon="10" balance="1"
                        writeType="0" dbType="mysql" dbDriver="native" switchType="1"  slaveThreshold="100">
                        <heartbeat>select 1</heartbeat>
                        <writeHost host="hostM1" url="192.168.33.11:3306" user="root"
                                password="123456" />
        </dataHost>

</mycat:schema>
```

实验验证：

```
[root@testA conf]# mysql -uroot -p123456 -P8066 -h 127.0.0.1 test
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 3
Server version: 5.6.29-mycat-1.6-RELEASE-20161028204710 MyCat Server (OpenCloundDB)

Copyright (c) 2000, 2017, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> CREATE TABLE `id_local_file` (`id` varchar(20) NOT NULL ,`nm` varchar(60) NULL ,PRIMARY KEY (`id`));    
Query OK, 0 rows affected (0.06 sec)

mysql> insert into id_local_file(id,nm) values(next value for MYCATSEQ_GLOBAL,'id_local_file'); 
Query OK, 1 row affected (0.03 sec)

mysql> insert into id_local_file(nm) values('id_local_file'); /* 插入的sql语句里没有了自增ID字段 */
Query OK, 1 row affected (0.01 sec)

mysql> select * from id_local_file;
+-------+---------------+
| id    | nm            |
+-------+---------------+
| 10001 | id_local_file |
| 1001  | id_local_file |
+-------+---------------+
2 rows in set (0.08 sec)

mysql> select next value for MYCATSEQ_GLOBAL;
+-------+
| 10002 |
+-------+
| 10002 |
+-------+
1 row in set (0.00 sec)

mysql> 
```

优点：本地加载，读取速度较快，配置简单 缺点：mycat重新发布时，seq文件需要替换，集群部署无法用此方式，路由到不同的mycat上无法保证id唯一，使mycat变成了有状态的中间件。

### 2.2 本地时间戳方式

`vim conf/server.xml`

```
<property name="sequnceHandlerType">2</property>
```

`vim conf/sequence_time_conf.properties`

```
#sequence depend on TIME
WORKID=01
DATAACENTERID=01
```

> 两个属性值为：0-31 任意整数

`vim conf/schema.xml`

```
<?xml version="1.0"?>
<!DOCTYPE mycat:schema SYSTEM "schema.dtd">
<mycat:schema xmlns:mycat="http://io.mycat/">

        <schema name="test" checkSQLschema="false" sqlMaxLimit="100">
                <table name="id_local_time" dataNode="test1" autoIncrement="true" primaryKey="id"></table>

        </schema>
        <dataNode name="test1" dataHost="testA" database="test" />

        <dataHost name="testA" maxCon="1000" minCon="10" balance="1"
                        writeType="0" dbType="mysql" dbDriver="native" switchType="1"  slaveThreshold="100">
                        <heartbeat>select 1</heartbeat>
                        <writeHost host="hostM1" url="192.168.33.11:3306" user="root"
                                password="123456" />
        </dataHost>

</mycat:schema>
```

实验验证：

```
[root@testA conf]# mysql -uroot -p123456 -P8066 -h 127.0.0.1 test
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 2
Server version: 5.6.29-mycat-1.6-RELEASE-20161028204710 MyCat Server (OpenCloundDB)

Copyright (c) 2000, 2017, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> CREATE TABLE `id_local_time` (`id` varchar(20) NOT NULL ,`nm` varchar(60) NULL ,PRIMARY KEY (`id`));
Query OK, 0 rows affected (0.02 sec)

mysql> insert into id_local_time(id,nm) values(next value for MYCATSEQ_GLOBAL,'id_local_time'); 
Query OK, 1 row affected (0.06 sec)

mysql> insert into id_local_time(nm) values('id_local_time'); /* 插入的sql语句里没有了自增ID字段 */
Query OK, 1 row affected (0.01 sec)

mysql> select * from id_local_time;
+--------------------+---------------+
| id                 | nm            |
+--------------------+---------------+
| 922641363168792576 | id_local_time |
| 922641424359493632 | id_local_time |
+--------------------+---------------+
2 rows in set (0.06 sec)

mysql> select next value for MYCATSEQ_GLOBAL;
+--------------------+
| 922641542101995520 |
+--------------------+
| 922641542101995520 |
+--------------------+
1 row in set (0.00 sec)
```

本地时间戳计算方式 ID= 64 位二进制 (42(毫秒)+5(机器 ID)+5(业务编码)+12(重复累加) 长度18位，因此下面提示非常重要。

> **注意** 表字段长度必须大于等于18位

优点：不存在mycat重新发布影响seq的问题， 缺点：字段长度是18位。

### 2.3 数据库方式

`vim conf/server.xml`

```
<property name="sequnceHandlerType">1</property>
```

`vim conf/sequence_db_conf.properties`

```
#sequence stored in datanode
GLOBAL=test1
ID_DB=test1
```

在test1节点本地数据库添加函数和表，以下为sql内容：

```
DROP TABLE IF EXISTS mycat_sequence;
CREATE TABLE mycat_sequence (
NAME VARCHAR (50) NOT NULL,
current_value INT NOT NULL,
increment INT NOT NULL DEFAULT 100,
PRIMARY KEY (NAME)
) ENGINE = INNODB ;


INSERT INTO mycat_sequence(name,current_value,increment) VALUES ('GLOBAL', 100000, 100);


DROP FUNCTION IF EXISTS `mycat_seq_currval`;
DELIMITER ;;
CREATE  FUNCTION `mycat_seq_currval`(seq_name VARCHAR(50)) 
RETURNS varchar(64) CHARSET utf8
    DETERMINISTIC
BEGIN 
        DECLARE retval VARCHAR(64);
        SET retval="-999999999,null";  
        SELECT concat(CAST(current_value AS CHAR),",",CAST(increment AS CHAR) ) INTO retval 
          FROM mycat_sequence  WHERE name = seq_name;  
        RETURN retval ; 
END
;;
DELIMITER ;


DROP FUNCTION IF EXISTS `mycat_seq_nextval`;
DELIMITER ;;
CREATE FUNCTION `mycat_seq_nextval`(seq_name VARCHAR(50)) RETURNS varchar(64)
 CHARSET utf8
    DETERMINISTIC
BEGIN 
         UPDATE mycat_sequence  
                 SET current_value = current_value + increment 
                  WHERE name = seq_name;  
         RETURN mycat_seq_currval(seq_name);  
END
;;
DELIMITER ;




DROP FUNCTION IF EXISTS `mycat_seq_setval`;
DELIMITER ;;
CREATE FUNCTION `mycat_seq_setval`(seq_name VARCHAR(50), value INTEGER) 
RETURNS varchar(64) CHARSET utf8
    DETERMINISTIC
BEGIN 
         UPDATE mycat_sequence  
                   SET current_value = value  
                   WHERE name = seq_name;  
         RETURN mycat_seq_currval(seq_name);  
END
;;
DELIMITER ;
```

添加过程：

```
[root@testA mycat]# mysql -uroot -p123456 test
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 102
Server version: 5.7.19-log Source distribution

Copyright (c) 2000, 2017, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> DROP TABLE IF EXISTS mycat_sequence;
Query OK, 0 rows affected, 1 warning (0.00 sec)

mysql> CREATE TABLE mycat_sequence (
    -> NAME VARCHAR (50) NOT NULL,
    -> current_value INT NOT NULL,
    -> increment INT NOT NULL DEFAULT 100,
    -> PRIMARY KEY (NAME)
    -> ) ENGINE = INNODB ;




INSERT INTO mycat_sequence(name,current_value,increment) VALUES ('GLOBAL', 100000, 100);


Query OK, 0 rows affected (0.11 sec)

mysql> 
mysql> 
mysql> 
mysql> 
mysql> INSERT INTO mycat_sequence(name,current_value,increment) VALUES ('GLOBAL', 100000, 100);
Query OK, 1 row affected (0.00 sec)

mysql> 
mysql> 
mysql> DROP FUNCTION IF EXISTS `mycat_seq_currval`;
Query OK, 0 rows affected (0.00 sec)

mysql> DELIMITER ;;
mysql> CREATE  FUNCTION `mycat_seq_currval`(seq_name VARCHAR(50)) 
    -> RETURNS varchar(64) CHARSET utf8
    ->     DETERMINISTIC
    -> BEGIN 
    ->         DECLARE retval VARCHAR(64);
    ->         SET retval="-999999999,null";  
    ->         SELECT concat(CAST(current_value AS CHAR),",",CAST(increment AS CHAR) ) INTO retval 
    ->           FROM mycat_sequence  WHERE name = seq_name;  
    ->         RETURN retval ; 
    -> END
    -> ;;
Query OK, 0 rows affected (0.00 sec)

mysql> DELIMITER ;
mysql> 
mysql> 
mysql> DROP FUNCTION IF EXISTS `mycat_seq_nextval`;
DELIMITER ;;
Query OK, 0 rows affected (0.00 sec)

mysql> DELIMITER ;;
mysql> CREATE FUNCTION `mycat_seq_nextval`(seq_name VARCHAR(50)) RETURNS varchar(64)
    ->  CHARSET utf8
    ->     DETERMINISTIC
    -> BEGIN 
    ->          UPDATE mycat_sequence  
    ->                  SET current_value = current_value + increment 
    ->                   WHERE name = seq_name;  
    ->          RETURN mycat_seq_currval(seq_name);  
    -> END
    -> ;;
Query OK, 0 rows affected (0.00 sec)

mysql> DELIMITER ;
mysql> 
mysql> 
mysql> 
mysql> 
mysql> DROP FUNCTION IF EXISTS `mycat_seq_setval`;
Query OK, 0 rows affected (0.00 sec)

mysql> DELIMITER ;;
mysql> CREATE FUNCTION `mycat_seq_setval`(seq_name VARCHAR(50), value INTEGER) 
    -> RETURNS varchar(64) CHARSET utf8
    ->     DETERMINISTIC
    -> BEGIN 
    ->          UPDATE mycat_sequence  
    ->                    SET current_value = value  
    ->                    WHERE name = seq_name;  
    ->          RETURN mycat_seq_currval(seq_name);  
    -> END
    -> ;;
Query OK, 0 rows affected (0.00 sec)

mysql> DELIMITER ;
mysql> 
```

以下步骤非常关键，让`id_db`表也支持数据库序列号。

```
mysql> INSERT INTO mycat_sequence ('ID_DB', 1, 100);
mysql> select * from mycat_sequence;
+--------+---------------+-----------+
| NAME   | current_value | increment |
+--------+---------------+-----------+
| GLOBAL |        100200 |       100 |
| ID_DB  |           301 |       100 |
+--------+---------------+-----------+
2 rows in set (0.00 sec)
```

`vim conf/schema.xml`

```
<?xml version="1.0"?>
<!DOCTYPE mycat:schema SYSTEM "schema.dtd">
<mycat:schema xmlns:mycat="http://io.mycat/">

        <schema name="test" checkSQLschema="false" sqlMaxLimit="100">
                <table name="id_db" dataNode="test1" autoIncrement="true" primaryKey="id"></table>
                <table name="mycat_sequence" dataNode="test1" autoIncrement="true" primaryKey="id"></table>

        </schema>
        <dataNode name="test1" dataHost="testA" database="test" />

        <dataHost name="testA" maxCon="1000" minCon="10" balance="1"
                        writeType="0" dbType="mysql" dbDriver="native" switchType="1"  slaveThreshold="100">
                        <heartbeat>select 1</heartbeat>
                        <writeHost host="hostM1" url="192.168.33.11:3306" user="root"
                                password="123456" />
        </dataHost>

</mycat:schema>
```

> **注意** 将mycat\_sequence表也放出来，且注意大小写（数据库默认区分大小写）

实验验证：

```
[root@testA mycat]# mysql -uroot -p123456 -P8066 -h127.0.0.1 test
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 2
Server version: 5.6.29-mycat-1.6-RELEASE-20161028204710 MyCat Server (OpenCloundDB)

Copyright (c) 2000, 2017, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+----------+
| DATABASE |
+----------+
| test     |
+----------+
1 row in set (0.00 sec)

mysql> show tables;
+----------------+
| Tables in test |
+----------------+
| id_db          |
| mycat_sequence |
+----------------+
2 rows in set (0.00 sec)

mysql> drop id_db;
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'id_db' at line 1
mysql> drop table id_db;
Query OK, 0 rows affected (0.08 sec)

mysql> CREATE TABLE `id_db` (`id` int NOT NULL ,`nm` varchar(60) NULL ,PRIMARY KEY (`id`));
Query OK, 0 rows affected (0.02 sec)

mysql> insert into id_db(id,nm) values(next value for MYCATSEQ_GLOBAL,'id_db');
Query OK, 1 row affected (0.10 sec)

mysql> insert into id_db(nm) values('db');
Query OK, 1 row affected (0.00 sec)

mysql> select next value for MYCATSEQ_GLOBAL;
+--------+
| 100201 |
+--------+
| 100201 |
+--------+
1 row in set (0.00 sec)

mysql> select * from id_db;
+--------+-------+
| id     | nm    |
+--------+-------+
|    303 | db    |
| 100200 | id_db |
+--------+-------+
2 rows in set (0.00 sec)

mysql> insert into id_db(nm) values('db');
Query OK, 1 row affected (0.01 sec)

mysql> select * from id_db;
+--------+-------+
| id     | nm    |
+--------+-------+
|    303 | db    |
|    304 | db    |
| 100200 | id_db |
+--------+-------+
3 rows in set (0.00 sec)

mysql> 
```

优点：重新部署mycat不受影响 缺点：当配置节点的部署是主从复制，当主挂了切从后会有重复。

> **注意** 节点如果是主从切换后，数据id可能会有异常（重复）

### 2.4 zookeeper方式

`vim conf/server.xml`

```
<property name="sequnceHandlerType">3</property>
```

`vim conf/sequence_distributed_conf.properties`

```
INSTANCEID=01
CLUSTERID=01
```

schema的table 增加属性 `autoIncrement="true"`和 `primaryKey="id"`

基于ZK 与本地配置的分布式ID 生成器(可以通过ZK 获取集群（机房）唯一InstanceID，也可以通过配置文件配置InstanceID)ID 结构：long 64 位，ID 最大可占63 位 current time millis(微秒时间戳38 位,可以使用17 年) instanceId（实例ID，可以通过ZK 或者配置文件获取，5 位，也就是十进制0-31） threadId（线程ID，9 位） increment(自增,6 位) 一共63 位，可以承受单机房单机器单线程1000\*(2^6)=640000 的并发。

优点：无悲观锁，无强竞争，吞吐量更高 缺点：对zookeeper集群的要求增加。

参考资料： \[1\] http://mycat.io/ \[2\] 《分布式数据库架构及企业实践——基于Mycat中间件》 \[3\] 龙哥官方课程课件、[博客](http://blog.csdn.net/webnum)
