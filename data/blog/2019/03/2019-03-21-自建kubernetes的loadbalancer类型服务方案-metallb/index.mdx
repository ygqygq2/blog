---
title: "自建Kubernetes的LoadBalancer类型服务方案-MetalLB"
date: "2019-03-21"
categories:
  - "system-operations"
  - "cloudcomputing-container"
tags:
  - "kubernetes"
  - "loadbalancer"
  - "metallb"
---

# 自建 Kubernetes 的 LoadBalancer 类型服务方案-MetalLB

[TOC]

## 1\. 环境

kubernetes 环境： \* kubeadm v1.13.1，网络使用 flannel \* helm v2.13.0

## 2\. 安装

```bash
helm fetch --untar stable/metallb
cd metallb
vim values.yaml  # 配置ip池
helm install --name metallb --namespce kube-system ./
```

```yaml
configInline:
  # Example ARP Configuration
  address-pools:
    - name: default
      protocol: layer2
      addresses:
        - 192.168.105.170-192.168.105.175
```

## 3\. 使用示例

示例：

`nginx-metallb.yaml`

```yaml
apiVersion: apps/v1beta2
kind: Deployment
metadata:
  name: nginx-metallb
spec:
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx
          ports:
            - name: http
              containerPort: 80

---
apiVersion: v1
kind: Service
metadata:
  name: nginx-metallb
spec:
  ports:
    - name: http
      port: 80
      protocol: TCP
      targetPort: 80
  selector:
    app: nginx
  type: LoadBalancer
```

正常结果是可以看到 svc 的 EXTERNAL-IP 列有分配 IP 池中的地址，kubernetes 外部也可以访问。

```bash
# 访问测试
lb_ip=$(kubectl get svc nginx-metallb -ojsonpath={.status.loadBalancer.ingress[0].ip})
curl $lb_ip
```

参考链接： \[1\] https://metallb.universe.tf/
