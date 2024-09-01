---
title: "使用Nginx制作内网yum mirrors proxy"
date: "2017-08-29"
categories: 
  - "system-operations"
tags: 
  - "nginx"
---

# 使用Nginx制作内网yum mirrors proxy

\[TOC\]

## 1\. 背景

公司内网服务器不能直接通过Internet上网，但为了与外网通信和同步时间等，会指定那么几台服务器可以访问Internet。这里就是通过能上网的机器作为 mirror proxy，制作内网使用的yum仓库。

## 2\. 环境需求

1. 内网dns（推荐，非必须，因为可使用IP代替）
2. 一台能上Internet的服务器A
3. 不能上Internet的服务器能与A服务器通信
4. 这里示例为CentOS7和Ubuntu16

## 3\. Nginx安装配置

Nginx安装在能上网的A服务器上，安装过程略。 具体一个nginx server配置如下：

```
# mirrors
server
    {
        listen 80;
        #listen [::]:80;
        server_name mirrors.yourdomain.com;
        index index.html index.htm index.php default.html default.htm default.php;
        root  /home/wwwroot/html;

        location /ubuntu/ {
            proxy_pass http://mirrors.aliyun.com/ubuntu/ ;
        }

        location /centos/ {
            proxy_pass http://mirrors.aliyun.com/centos/ ;
        }

        location /epel/ {
            proxy_pass http://mirrors.aliyun.com/epel/ ;
        }
}
```

> 以上使用阿里云镜像，其镜像版本很全，速度也很快。 [http://mirrors.aliyun.com/](http://mirrors.aliyun.com/)

CentOS7系统镜像源： `cat /etc/yum.repos.d/CentOS-7.repo`

```
[base]
name=CentOS-$releasever - Base - mirrors.yourdomain.com
failovermethod=priority
baseurl=http://mirrors.yourdomain.com/centos/$releasever/os/$basearch/
        http://mirrors.yourdomain.com/centos/$releasever/os/$basearch/
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=os
gpgcheck=1
gpgkey=http://mirrors.yourdomain.com/centos/RPM-GPG-KEY-CentOS-7

#released updates 
[updates]
name=CentOS-$releasever - Updates - mirrors.yourdomain.com
failovermethod=priority
baseurl=http://mirrors.yourdomain.com/centos/$releasever/updates/$basearch/
        http://mirrors.yourdomain.com/centos/$releasever/updates/$basearch/
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=updates
gpgcheck=1
gpgkey=http://mirrors.yourdomain.com/centos/RPM-GPG-KEY-CentOS-7

#additional packages that may be useful
[extras]
name=CentOS-$releasever - Extras - mirrors.yourdomain.com
failovermethod=priority
baseurl=http://mirrors.yourdomain.com/centos/$releasever/extras/$basearch/
        http://mirrors.yourdomain.com/centos/$releasever/extras/$basearch/
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=extras
gpgcheck=1
gpgkey=http://mirrors.yourdomain.com/centos/RPM-GPG-KEY-CentOS-7

#additional packages that extend functionality of existing packages
[centosplus]
name=CentOS-$releasever - Plus - mirrors.yourdomain.com
failovermethod=priority
baseurl=http://mirrors.yourdomain.com/centos/$releasever/centosplus/$basearch/
        http://mirrors.yourdomain.com/centos/$releasever/centosplus/$basearch/
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=centosplus
gpgcheck=1
enabled=0
gpgkey=http://mirrors.yourdomain.com/centos/RPM-GPG-KEY-CentOS-7

#contrib - packages by Centos Users
[contrib]
name=CentOS-$releasever - Contrib - mirrors.yourdomain.com
failovermethod=priority
baseurl=http://mirrors.yourdomain.com/centos/$releasever/contrib/$basearch/
        http://mirrors.yourdomain.com/centos/$releasever/contrib/$basearch/
#mirrorlist=http://mirrorlist.centos.org/?release=$releasever&arch=$basearch&repo=contrib
gpgcheck=1
enabled=0
gpgkey=http://mirrors.yourdomain.com/centos/RPM-GPG-KEY-CentOS-7
```

EPEL第三方扩展源： `cat /etc/yum.repos.d/epel.repo`

```
[epel]
name=Extra Packages for Enterprise Linux 7 - $basearch
baseurl=http://mirrors.yourdomain.com/epel/7/$basearch
failovermethod=priority
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7

[epel-debuginfo]
name=Extra Packages for Enterprise Linux 7 - $basearch - Debug
baseurl=http://download.yourdomain.com/epel/7/$basearch/debug
failovermethod=priority
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
gpgcheck=1

[epel-source]
name=Extra Packages for Enterprise Linux 7 - $basearch - Source
baseurl=http://download.yourdomain.com/epel/7/SRPMS
failovermethod=priority
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
```

Ubuntu16 apt镜像源： `cat /etc/apt/sources.list`

```
deb http://mirrors.yourdomain.com/ubuntu/ xenial main restricted universe multiverse
deb http://mirrors.yourdomain.com/ubuntu/ xenial-security main restricted universe multiverse
deb http://mirrors.yourdomain.com/ubuntu/ xenial-updates main restricted universe multiverse
deb http://mirrors.yourdomain.com/ubuntu/ xenial-proposed main restricted universe multiverse
deb http://mirrors.yourdomain.com/ubuntu/ xenial-backports main restricted universe multiverse
deb-src http://mirrors.yourdomain.com/ubuntu/ xenial main restricted universe multiverse
deb-src http://mirrors.yourdomain.com/ubuntu/ xenial-security main restricted universe multiverse
deb-src http://mirrors.yourdomain.com/ubuntu/ xenial-updates main restricted universe multiverse
deb-src http://mirrors.yourdomain.com/ubuntu/ xenial-proposed main restricted universe multiverse
deb-src http://mirrors.yourdomain.com/ubuntu/ xenial-backports main restricted universe multiverse
```
