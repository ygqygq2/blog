---
title: "使用Helm部署Prometheus和Grafana监控Kubernetes"
date: "2018-09-13"
categories:
  - "system-operations"
  - "cloudcomputing-container"
tags:
  - "grafana"
  - "helm"
  - "kubernetes"
  - "prometheus"
  - "监控"
---

# 使用 Helm 部署 Prometheus 和 Grafana 监控 Kubernetes

[TOC]

## 1\. 环境说明

- 可用的 kubernetes 集群
- 可用的持久化存储
- 可用的 helm

这里我们使用 kubeapps 管理 charts。

![](images/1536736878230-1024x510.png)

## 2\. 安装 chart

安装时，适当修改`values.yaml`里的参数以适应自身的环境。我是设置持久化存储、ingress 和证书 secret。

安装 Prometheus

![](images/1536736989976-1024x542.png)

![](images/1536737042569-1024x613.png)

安装成功后，注意提示页面的提示。同一 namespace 里，引用域名可只使用前面一段。

同理，安装`stable/mysql`和`stable/grafana`。 mysql 的`values.yaml`配置用户密码和库名，以给 grafana 使用。

![](images/1536737862650-1024x684.png)

安装 grafana 时注意`values.yaml`里的数据库配置

```
[database]
type = mysql
host = monitoring-mysql-mysql:3306
name = grafana
user = grafana
password = GrafanaPWD
```

![Alt text](images/1536738039023.png)

## 3\. 配置 Grafana

全部安装运行正常后。我们配置登录 Grafana 添加数据源：

![](images/1536738131821-1024x824.png)

添加测试成功后，添加 dashboard 模板：

![](images/1536738328324-1024x428.png)

访问官网搜索模板： [https://grafana.com/dashboards?dataSource=prometheus&search=kubernetes](https://grafana.com/dashboards?dataSource=prometheus&search=kubernetes) Grafana 的 POD 在上网环境可使用 id 直接导入，也可下载 json 文件导入。

我用的这位大神的 dashboard，[https://karlstoney.com/2018/07/07/managing-your-costs-on-kubernetes/](https://karlstoney.com/2018/07/07/managing-your-costs-on-kubernetes/)

感觉比较清爽，当然，有需要再自己调整添加些 dashboard。

![](images/1536738838948-1024x492.png)

## 4\. 小结

Helm 使部署方便快捷，瞬间感觉 kubernetes 管理是如此 easy。但是，helm 安装 chart 过程中，最好看得懂 chart 里的 templates，会排查问题，不然出错了会感觉无从下手。我是直接参考 github 里的 chart，模仿各种用法，加上学习下面参考资料中的[\[3\]](https://whmzsu.github.io/helm-doc-zh-cn/quickstart/using_helm-zh_cn.html)写了一个[fastdfs-nginx](https://github.com/ygqygq2/charts/tree/master/fastdfs-nginx)的 chart，再回来部署 helm 的 chart，遇到问题才知道调试。

参考资料： \[1\] https://github.com/kubernetes/kube-state-metrics \[2\] https://www.kancloud.cn/huyipow/prometheus/527093 \[3\] https://whmzsu.github.io/helm-doc-zh-cn/quickstart/using\_helm-zh\_cn.html
