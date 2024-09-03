---
title: "Kubernetes基于Metrics Server的HPA"
date: "2018-10-08"
categories: 
  - "system-operations"
  - "cloudcomputing-container"
tags: 
  - "hpa"
  - "kubernetes"
---

# Kubernetes基于Metrics Server的HPA

\[TOC\]

## 1\. 环境说明和相关介绍

我的kubernetes环境：

- kubeadm安装的kubernetes1.11

Horizontal Pod Autoscaler（HPA，Pod水平自动伸缩），根据资源利用率或者自定义指标自动调整replication controller、deployment 或 replica set，实现部署的自动扩展和缩减，让部署的规模接近于实际服务的负载。HPA不适于无法缩放的对象，例如DaemonSet。

Kubernetes从1.8版本开始，CPU、内存等资源的metrics信息可以通过 Metrics API来获取，用户可以直接获取这些metrics信息（例如通过执行`kubect top`命令），HPA使用这些metics信息来实现动态伸缩。本文介绍Kubernetes集群基于metric server的HPA。在开始之前我们需要了解一下Metrics API和Metrics Server。

**Metrics API**：  
1\. 通过Metrics API我们可以获取到指定node或者pod的当前资源使用情况，API本身不存储任何信息，所以我们不可能通过API来获取资源的历史使用情况。  
2\. Metrics API的获取路径位于：`/apis/metrics.k8s.io/`  
3\. 获取Metrics API的前提条件是metrics server要在K8S集群中成功部署  
4\. 更多的metrics资料请参考：[https://github.com/kubernetes/metrics](https://github.com/kubernetes/metrics)

**Metrics server**：  
1\. Metrics server是Kubernetes集群资源使用情况的聚合器  
2\. 从1.8版本开始，Metrics server默认可以通过`kube-up.sh`脚本以deployment的方式进行部署，也可以通过yaml文件的方式进行部署  
3\. Metrics server收集所有node节点的metrics信息  
4\. Kubernetes从1.7版本，通过 [Kubernetes aggregator](https://kubernetes.io/docs/concepts/api-extension/apiserver-aggregation/)注册Metrics Server在主API server

## 2\. 部署metrics-server

由于官方已经弃用[heapster](https://github.com/kubernetes/heapster)，现[metrics-server](https://github.com/kubernetes-incubator/metrics-server)作为其替代方案。

当前最新版本为v0.3.1。部署yaml文件链接：[deploy](https://github.com/kubernetes-incubator/metrics-server/tree/master/deploy/1.8%2B)

在`metrics-server-deployment.yaml`中，  
image可使用：[ygqygq2/metrics-server:v0.3.1](https://hub.docker.com/r/ygqygq2/metrics-server/) 另还需添加2个参数：

```yaml
      containers:
      - name: metrics-server
        args:
          - --kubelet-preferred-address-types=InternalIP,Hostname,InternalDNS,ExternalDNS,ExternalIP
          - --kubelet-insecure-tls
        image: ygqygq2/metrics-server:v0.3.1
```

部署成功后，达到如下结果，则为正常：

```
[root@lab1 1.8+]# kubectl top nodes
NAME      CPU(cores)   CPU%      MEMORY(bytes)   MEMORY%   
lab1      777m         2%        16064Mi         50%       
lab2      526m         1%        12577Mi         79%       
lab3      569m         1%        8819Mi          27%       
lab4      56m          5%        4151Mi          53%       
lab5      353m         2%        8287Mi          53%       
lab6      55m          5%        4021Mi          52%       
[root@lab1 1.8+]# kubectl top pods
NAME                                CPU(cores)   MEMORY(bytes)   
gohttpserver-849d47c88f-pqf7f       0m           4Mi             
nginx-cephfs-7777495b9b-5sfvv       0m           1Mi             
nginx-cephfs-dy1-7777495b9b-6jvph   0m           1Mi             
nginx-cephfs-dy2-86bdbfd977-g278z   0m           1Mi  
```

## 3\. 测试HPA

1. 创建一个名为nginxtest的deployment；
2. 创建一个关联资源nginxtest的HPA，最小的pod副本数为1，最大为10。HPA会根据设定的cpu使用率（10%）动态的增加或者减少pod数量，此地方用于测试，所以设定的伸缩阈值会比较小；
3. 使用curl方式加大、减小nginx的负载；

```bash
kubectl run nginxtest --image=nginx:latest --requests=cpu=1m --expose --port=80
nginxtest_ip=$(kubectl get svc nginxtest -o=jsonpath="{.spec.clusterIP}")  # 获取svc IP，用于测试
kubectl autoscale deployment nginxtest --cpu-percent=10 --min=1 --max=10
```

我们来创建一个busybox，并且循环访问上面创建的服务。

```bash
kubectl run load-generator --image=busybox
busybox_pod=$(kubectl get pod |grep load-generator|awk '{print $1}')
kubectl exec -it ${busybox_pod} -- /bin/sh -c "while true; do curl -s $nginxtest_ip; done" & # 后台跑，负载不够可多条同时执行
```

查看hpa状态，同时我们查看相关资源nginxtest的副本数量，副本数量在变化。CPU资源利用率也在变化，最后趋于平稳。

```bash
$ kubectl get hpa                  
NAME        REFERENCE              TARGETS    MINPODS   MAXPODS   REPLICAS   AGE
nginxtest   Deployment/nginxtest   100%/10%   1         10        4          24m
$ kubectl get deployment nginxtest
NAME        DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
nginxtest   4         4         4            4           27m
```

我们关掉刚才的busbox并等待一段时间。可以看到副本数量变回为1。

```
$ kubectl get deployment nginxtest
NAME        DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
nginxtest   1         1         1            1           36m
$ kubectl get hpa                  
NAME        REFERENCE              TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
nginxtest   Deployment/nginxtest   0%/10%    1         10        1          33m
```

## 4\. 小结

HPA能对服务的容器数量做自动伸缩，对于服务的稳定性是一个很好的提升，但在生产中应用较少，原因是因为不太容易衡量业务负载是否正常，影响服务稳定性的因素非常多。

参考资料： \[1\] https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/  
\[2\] https://cloud.tencent.com/developer/article/1005406
