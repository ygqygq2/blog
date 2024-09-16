---
title: "SaltStack实战之配置管理-Jinja2模板"
date: "2017-06-16"
categories: ["automation"]
tags: ["saltstack"]
---

# SaltStack 实战之配置管理-Jinja2 模板

[TOC]

![](images/saltstack_logo-300x154.png)

## 1. Salt yaml 配置文件使用 Jinja2 模板介绍

jinja2 官方网站： http://jinja.pocoo.org/

### 1.1 File 状态使用 template 参数

```
- template: jinja
```

### 1.2 模板文件里面变量使用`{{ 名称 }}`

```
{{ PORT }}
```

### 1.3 变量列表

```
- defaults:
  PORT: 8080
```

## 2. 实战应用

添加监听主机和端口变量

`vim /srv/salt/devfiles/httpd.conf`

```
Listen {{ HOST }}:{{ PORT }}

# {{ MAC }}
```

配置 salt master 配置文件、pillar 配置文件、lamp.sls 添加 jinja 模板：

```
[root@salt-master112 dev]# egrep -v '^$|^[#]' /etc/salt/master
state_top: top.sls
file_roots:
  base:
    - /srv/salt
  dev:
    - /srv/salt/dev
  test:
    - /srv/salt/test
  prod:
    - /srv/salt/prod
pillar_roots:
  base:
    - /srv/salt/pillar
  dev:
    - /srv/salt/dev/pillar
[root@salt-master112 dev]# cat /srv/salt/pillar/top.sls
dev:
  'node*.test.com':
    - apache
[root@salt-master112 dev]# cat /srv/salt/dev/pillar/apache.sls
apache:
  HOST: {{ grains['fqdn_ip4'][0] }}
  PORT: 8080
  MAC: {{ salt['network.hw_addr']('eth0') }}
[root@salt-master112 dev]# salt '*' saltutil.refresh_pillar
node1.test.com:
    True
master.test.com:
    True
node2.test.com:
    True
[root@salt-master112 dev]# salt '*' pillar.items
master.test.com:
    ----------
node1.test.com:
    ----------
    apache:
        ----------
        HOST:
            10.1.0.109
        MAC:
            00:50:56:a4:44:7a
        PORT:
            8080
node2.test.com:
    ----------
    apache:
        ----------
        HOST:
            10.1.0.110
        MAC:
            00:50:56:a4:44:7a
        PORT:
            8080
[root@salt-master112 dev]# cat /srv/salt/dev/lamp.sls
lamp-pkg-install:
  pkg.installed:
    - names:
      - php
      - php-fpm
      - mysql
      - php-mysql
      - php-pdo

apache-service:
  pkg.installed:
    - name: httpd
  file.managed:
    - name: /etc/httpd/conf/httpd.conf
    - source:
      - salt://files/httpd.conf
    - user: root
    - group: root
    - mode: 644
    - template: jinja
    - defaults:
      HOST: {{ pillar['apache']['HOST'] }}
      PORT: {{ pillar['apache']['PORT'] }}
      MAC: {{ pillar['apache']['MAC'] }}
    - require:
      - pkg: apache-service
  service.running:
    - name: httpd
    - enable: True
    - reload: True
    - watch:
      - file: apache-service

mysql-service:
  pkg.installed:
    - name: mysql-server
    - require_in:
      - file: mysql-service
  file.managed:
    - name: /etc/my.cnf
    - source:
      - salt://files/my.cnf
    - user: root
    - group: root
    - mode: 644
    - watch_in:
      - service: mysql-service
  service.running:
    - name: mysqld
    - enable: True

php-fpm-service:
  service.running:
    - name: php-fpm
    - enable: True
[root@salt-master112 dev]#
```

执行结果：

```
[root@salt-master112 dev]# salt '*' state.highstate
master.test.com:
----------
          ID: /etc/resolv.conf
    Function: file.managed
      Result: True
     Comment: File /etc/resolv.conf is in the correct state
     Started: 17:54:00.390576
    Duration: 31.841 ms
     Changes:

Summary for master.test.com
------------
Succeeded: 1
Failed:    0
------------
Total states run:     1
Total run time:  31.841 ms
node1.test.com:
----------
          ID: /etc/resolv.conf
    Function: file.managed
      Result: True
     Comment: File /etc/resolv.conf is in the correct state
     Started: 09:56:43.761673
    Duration: 34.809 ms
     Changes:
----------
          ID: lamp-pkg-install
    Function: pkg.installed
        Name: php-fpm
      Result: True
     Comment: Package php-fpm is already installed
     Started: 09:56:44.225287
    Duration: 630.568 ms
     Changes:
----------
          ID: lamp-pkg-install
    Function: pkg.installed
        Name: php-pdo
      Result: True
     Comment: Package php-pdo is already installed
     Started: 09:56:44.856050
    Duration: 0.522 ms
     Changes:
----------
          ID: lamp-pkg-install
    Function: pkg.installed
        Name: php
      Result: True
     Comment: Package php is already installed
     Started: 09:56:44.856677
    Duration: 0.366 ms
     Changes:
----------
          ID: lamp-pkg-install
    Function: pkg.installed
        Name: php-mysql
      Result: True
     Comment: Package php-mysql is already installed
     Started: 09:56:44.857143
    Duration: 0.386 ms
     Changes:
----------
          ID: lamp-pkg-install
    Function: pkg.installed
        Name: mysql
      Result: True
     Comment: Package mysql is already installed
     Started: 09:56:44.857623
    Duration: 0.349 ms
     Changes:
----------
          ID: apache-service
    Function: pkg.installed
        Name: httpd
      Result: True
     Comment: Package httpd is already installed
     Started: 09:56:44.858061
    Duration: 0.343 ms
     Changes:
----------
          ID: apache-service
    Function: file.managed
        Name: /etc/httpd/conf/httpd.conf
      Result: True
     Comment: File /etc/httpd/conf/httpd.conf updated
     Started: 09:56:44.858780
    Duration: 34.022 ms
     Changes:
              ----------
              diff:
                  ---
                  +++
                  @@ -133,9 +133,9 @@
                   # prevent Apache from glomming onto all bound IP addresses (0.0.0.0)
                   #
                   #Listen 12.34.56.78:80
                  -Listen 0.0.0.0:8080
                  -
                  -# 00:50:56:a4:7a:70
                  +Listen 10.1.0.109:8080
                  +
                  +# 00:50:56:a4:44:7a
                   # Dynamic Shared Object (DSO) Support
                   #
                   # To be able to use the functionality of a module which was built as a DSO you
----------
          ID: apache-service
    Function: service.running
        Name: httpd
      Result: True
     Comment: Service reloaded
     Started: 09:56:44.950689
    Duration: 87.451 ms
     Changes:
              ----------
              httpd:
                  True
----------
          ID: mysql-service
    Function: pkg.installed
        Name: mysql-server
      Result: True
     Comment: Package mysql-server is already installed
     Started: 09:56:45.038390
    Duration: 0.739 ms
     Changes:
----------
          ID: mysql-service
    Function: file.managed
        Name: /etc/my.cnf
      Result: True
     Comment: File /etc/my.cnf is in the correct state
     Started: 09:56:45.039596
    Duration: 17.182 ms
     Changes:
----------
          ID: mysql-service
    Function: service.running
        Name: mysqld
      Result: True
     Comment: The service mysqld is already running
     Started: 09:56:45.057008
    Duration: 68.422 ms
     Changes:
----------
          ID: php-fpm-service
    Function: service.running
        Name: php-fpm
      Result: True
     Comment: The service php-fpm is already running
     Started: 09:56:45.125649
    Duration: 53.97 ms
     Changes:

Summary for node1.test.com
-------------
Succeeded: 13 (changed=2)
Failed:     0
-------------
Total states run:     13
Total run time:  929.129 ms
node2.test.com:
----------
          ID: /etc/resolv.conf
    Function: file.managed
      Result: True
     Comment: File /etc/resolv.conf is in the correct state
     Started: 09:56:44.357709
    Duration: 56.916 ms
     Changes:
----------
          ID: lamp-pkg-install
    Function: pkg.installed
        Name: php-fpm
      Result: True
     Comment: Package php-fpm is already installed
     Started: 09:56:45.634382
    Duration: 1721.668 ms
     Changes:
----------
          ID: lamp-pkg-install
    Function: pkg.installed
        Name: php-pdo
      Result: True
     Comment: Package php-pdo is already installed
     Started: 09:56:47.356467
    Duration: 1.34 ms
     Changes:
----------
          ID: lamp-pkg-install
    Function: pkg.installed
        Name: php
      Result: True
     Comment: Package php is already installed
     Started: 09:56:47.358095
    Duration: 1.359 ms
     Changes:
----------
          ID: lamp-pkg-install
    Function: pkg.installed
        Name: php-mysql
      Result: True
     Comment: Package php-mysql is already installed
     Started: 09:56:47.359721
    Duration: 1.553 ms
     Changes:
----------
          ID: lamp-pkg-install
    Function: pkg.installed
        Name: mysql
      Result: True
     Comment: Package mysql is already installed
     Started: 09:56:47.361541
    Duration: 1.361 ms
     Changes:
----------
          ID: apache-service
    Function: pkg.installed
        Name: httpd
      Result: True
     Comment: Package httpd is already installed
     Started: 09:56:47.363199
    Duration: 1.377 ms
     Changes:
----------
          ID: apache-service
    Function: file.managed
        Name: /etc/httpd/conf/httpd.conf
      Result: True
     Comment: File /etc/httpd/conf/httpd.conf updated
     Started: 09:56:47.365880
    Duration: 84.28 ms
     Changes:
              ----------
              diff:
                  ---
                  +++
                  @@ -133,9 +133,9 @@
                   # prevent Apache from glomming onto all bound IP addresses (0.0.0.0)
                   #
                   #Listen 12.34.56.78:80
                  -Listen 0.0.0.0:8080
                  -
                  -# 00:50:56:a4:00:5c
                  +Listen 10.1.0.110:8080
                  +
                  +# 00:50:56:a4:44:7a
                   # Dynamic Shared Object (DSO) Support
                   #
                   # To be able to use the functionality of a module which was built as a DSO you
----------
          ID: apache-service
    Function: service.running
        Name: httpd
      Result: True
     Comment: Service reloaded
     Started: 09:56:47.617560
    Duration: 236.903 ms
     Changes:
              ----------
              httpd:
                  True
----------
          ID: mysql-service
    Function: pkg.installed
        Name: mysql-server
      Result: True
     Comment: Package mysql-server is already installed
     Started: 09:56:47.855453
    Duration: 6.781 ms
     Changes:
----------
          ID: mysql-service
    Function: file.managed
        Name: /etc/my.cnf
      Result: True
     Comment: File /etc/my.cnf is in the correct state
     Started: 09:56:47.865735
    Duration: 72.983 ms
     Changes:
----------
          ID: mysql-service
    Function: service.running
        Name: mysqld
      Result: True
     Comment: The service mysqld is already running
     Started: 09:56:47.939601
    Duration: 169.518 ms
     Changes:
----------
          ID: php-fpm-service
    Function: service.running
        Name: php-fpm
      Result: True
     Comment: The service php-fpm is already running
     Started: 09:56:48.109622
    Duration: 157.914 ms
     Changes:

Summary for node2.test.com
-------------
Succeeded: 13 (changed=2)
Failed:     0
-------------
Total states run:     13
Total run time:    2.514 s
[root@salt-master112 dev]#
```

node1 和 node2 的 apache 配置文件，Listen 位置内容也有相应变化。

```
[root@im109 ~]# vim /etc/httpd/conf/httpd.conf
Listen 10.1.0.109:8080

# 00:50:56:a4:44:7a
```

```
[root@im110 ~]# vim /etc/httpd/conf/httpd.conf
Listen 10.1.0.110:8080

# 00:50:56:a4:44:7a
```
