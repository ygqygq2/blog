---
title: "kubernetes flannel 切换 calico 后节点 pod 无法通信"
date: "2022-03-11"
categories: 
  - "cloudcomputing-container"
tags: 
  - "calico"
  - "kubernetes"
---

# 1\. 问题

版本： kubernetes version:

```
NAME      STATUS   ROLES                  AGE   VERSION
master1   Ready    control-plane,master   56d   v1.23.4
master2   Ready    control-plane,master   56d   v1.23.4
master3   Ready    control-plane,master   56d   v1.23.4
```

calico version:

```
Client Version:    v3.22.1
Git commit:        82e7ce520
Cluster Version:   v3.22.1
Cluster Type:      typha,kdd,k8s,operator,bgp,kubeadm
```

kubernetes 节点的 pod 间无法通信

# 2\. 问题排查

安装 calicoctl 命令排查 ![发现有节点IPv4不对](images/1646962946168.png)

查看异常 ip 对应的网卡 ![查看网卡](images/1646963023267.png)

使用 docker 列出 network ![有以前docker compose使用的网络设置](images/1646963121944.png)

清除这些不使用的网络 `docker network rm fastdfs-net fd_fastdfs-net`

重启 pod ![再重启相应pod](images/1646963205716.png)

确认是否正常

![master1](images/1646963563291.png)

![master2](images/1646963580697.png)

确认跨节点 pod 正常通信了 ![k8s网络正常](images/1646965042883.png)

# 3\. 小结

使用 calico 网络插件需要在支持 bgp 协议的网络中，默认的 node to node mesh 的 peer type 下，节点数一多，会占用大量的连接数，官方推荐其在 100 节点内使用。

参考资料： \[1\] [https://projectcalico.docs.tigera.io/about/about-k8s-networking](https://projectcalico.docs.tigera.io/about/about-k8s-networking)
