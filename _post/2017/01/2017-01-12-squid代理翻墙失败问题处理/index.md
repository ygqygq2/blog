---
title: "Squid proxy 失败问题处理"
date: "2017-01-12"
categories: 
  - "system-operations"
tags: 
  - "squid"
  - "代理"
---

# Squid proxy 失败问题处理

\[squid,代理\]

\[TOC\]

公司香港有服务器，因此装了个Squid服务用来 proxy。今天突然有人说，proxy 不了了，此记录用于记录解决此次翻墙失败问题。

# 1.问题

proxy 失败，像google、dropbox等都不能通过 proxy 访问。

# 2.处理过程

## 1.重现问题

使用翻墙失败的帐户，在自己电脑重现问题。 发现能访问国内像ip138（查看自己出口IP）、百度等网站，都正常，根据出口IP，确认已翻墙。

## 2.登录服务器用curl访问谷歌、dropbox

服务器能正常解析，能正常访问谷歌、dropbox。

## 2.查看日志

使用tail -f tail /var/squid/access.log实时查看客户端使用代理访问谷歌日志，看到无实时日志输出，或者日志非常少。

## 3.查看服务配置文件

因为在代理本机上，能正常解析和访问谷歌、dropbox，那换dns，看squid能不能正常解析和访问呢？ 于是配置squid的dns，增加配置参数： dns\_nameservers 8.8.8.8 reload squid后，再次测试。发现解析和访问很快。问题解决。

# 总结

其实dns可用性并不是非常的高，检查dns和切换dns的使用，可能可以解决你许久解决不了而又其名的问题。像Oracle，也是经常遇到由于dns或者解析的莫名问题。
