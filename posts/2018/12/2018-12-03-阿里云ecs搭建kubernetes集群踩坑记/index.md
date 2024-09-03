---
title: "阿里云ECS搭建Kubernetes集群踩坑记"
date: "2018-12-03"
categories: 
  - "system-operations"
  - "cloudcomputing-container"
tags: 
  - "kubernetes"
  - "阿里云"
---

# 阿里云ECS搭建Kubernetes集群踩坑记

\[TOC\]

## 1\. 现有环境、资源

| 资源 | 数量 | 规格 |
| --- | --- | --- |
| EIP | 1 | 5M带宽 |
| ECS | 3 | 2 vCPU 16 GB内存 100G硬盘 |
| ECS | 3 | 2 vCPU 16 GB内存 150G硬盘 |
| SLB | 2 | 私网slb.s1.small |

## 2\. 规划

坑： 1. 上网问题，因为只有一个EIP，所有其它节点只能通过代理上网;  
2\. 负载均衡问题，因为阿里不支持LVS，负载均衡TCP方式后端又不支持访问负载均衡，HTTP和HTTPS方式，只支持后端协议为HTTP;

为了避免上面的坑，作以下规划：

1. Kubernetes master 3台100G，硬盘挂载到`/data`下，`/data/etcd`作软链接到`/var/lib/etcd`。节点不作调度分配一般POD；SLB设置`kubeadm init`这台master1作为后端，方式为TCP，且在master1上docker中安装haproxy和keepalived解决自己不能连接VIP问题；
2. 3台150G硬盘作为ceph osd，机器也作为Kubernetes nodes；
3. EIP绑定到node5，安装squid作为所有节点上网代理，安装ansible作为管理分发文件，也作为SSH管理跳板机；
4. 生成一套ssh key， 复制ssh私钥到所有节点，添加公钥到所有节点，考虑到安全性，部署完成后，删除除node5上的私钥；
5. 配置yum、docker ce使用代理上网；
6. 版本信息  
    操作系统：`CentOS7` Kubernetes：`v1.12.3` Docker CE：`docker-ce-18.06.1.ce` podSubnet：`10.244.0.0/16` 网络插件：`canal`

## 3\. 部署

先解决上网问题： 1. 将EIP绑定到node5，并安装squid;  
2\. 申请阿里内网免费SLB，将node5的3128端口使用TCP方式负载均衡；  
3\. 在除node5的节点上，`~/.bashrc`后面添加以下内容：

```bash
export http_proxy=http://squid_slb_ip:3128
export https_proxy=http://squild_slb_ip:3128
export no_proxy=''
```

1. 在除node5的节点上执行以下命令（docker安装后）：

```bash
mkdir -p /etc/systemd/system/docker.service.d
cat >/etc/systemd/system/docker.service.d/http-proxy.conf<<EOF
[Service]
Environment="HTTP_PROXY=http://squid_slb_ip:3128" "HTTPS_PROXY=http://squid_slb_ip:3128" "NO_PROXY="
EOF

systemctl daemon-reload 
systemctl restart docker
```

### 3.1 master部署

先在阿里负载均衡申请内网免费SLB，设置master1的6443为后端端口，8443为监听端口。  
因Kubernetes apiserver为https协议，阿里SLB中能负载均衡HTTPS的只有TCP方式，而TCP方式限制是负载均衡后端不能此负载均衡，所以为了master1能访问这个VIP，手动添加keepalived+haproxy：

先使用脚本初始化环境（需要能上网），脚本内变量`INSTALL_CLUSTER="false"`，执行时询问是否添加节点选否。 [https://github.com/ygqygq2/kubernetes/blob/master/kubeadm/kubeadm\_install\_k8s.sh](https://github.com/ygqygq2/kubernetes/blob/master/kubeadm/kubeadm_install_k8s.sh)

```bash
mkdir /etc/haproxy
cat >/etc/haproxy/haproxy.cfg<<EOF
global
  log 127.0.0.1 local0 err
  maxconn 50000
  uid 99
  gid 99
  #daemon
  nbproc 1
  pidfile haproxy.pid

defaults
  mode http
  log 127.0.0.1 local0 err
  maxconn 50000
  retries 3
  timeout connect 5s
  timeout client 30s
  timeout server 30s
  timeout check 2s

listen admin_stats
  mode http
  bind 0.0.0.0:1080
  log 127.0.0.1 local0 err
  stats refresh 30s
  stats uri     /haproxy-status
  stats realm   Haproxy\ Statistics
  stats auth    admin:k8s
  stats hide-version
  stats admin if TRUE

frontend k8s-https
  bind 0.0.0.0:8443
  mode tcp
  #maxconn 50000
  default_backend k8s-https

backend k8s-https
  mode tcp
  balance roundrobin
  server lab1 master1_ip:6443 weight 1 maxconn 1000 check inter 2000 rise 2 fall 3  # 注意更换IP
EOF

docker run -d --name k8s-haproxy \
-v /etc/haproxy:/usr/local/etc/haproxy:ro \
-p 8443:8443 \
-p 1080:1080 \
--restart always \
haproxy:1.7.8-alpine

docker run --net=host --cap-add=NET_ADMIN \
-e KEEPALIVED_INTERFACE=eth0 \
-e KEEPALIVED_VIRTUAL_IPS="#PYTHON2BASH:['master_slb_ip']" \
-e KEEPALIVED_UNICAST_PEERS="#PYTHON2BASH:['maser1_ip'" \
-e KEEPALIVED_PASSWORD=k8s \
--name k8s-keepalived \
--restart always \
-d osixia/keepalived:1.4.4   
```

在master1上再次使用该脚本，设置好变量。 [https://github.com/ygqygq2/kubernetes/blob/master/kubeadm/kubeadm\_install\_k8s.sh](https://github.com/ygqygq2/kubernetes/blob/master/kubeadm/kubeadm_install_k8s.sh)

```bash
INSTALL_CLUSTER="true"
# 是否安装Keepalived+HAproxy
INSTALL_SLB="false"
# 定义Kubernetes信息
KUBEVERSION="v1.12.2"
DOCKERVERSION="docker-ce-18.06.1.ce"
# k8s master VIP（使用负载均衡IP）
k8s_master_vip="master_slb_ip"
# 主机名:IP，需要执行脚本前设置
server0="master1:master1_ip"
server1="master2:master2_ip"
server2="master3:master3_ip"
```

脚本执行后，至少是可以`kubeadm init`成功的，脚本过程中，会有命令提示，若master2和master3添加etcd集群失败，可手动按上面命令提示解决。

集群健康后，修改master\_slb的后端，添加master2和master3的6443。并将`/etc/kubernetes/admin.conf` 和`~/.kube/config`里修改成 `server: https://127.0.0.1:8443`。因为他们都为master\_slb后端，都不能访问master\_slb的IP了。而其它非master节点，则可以通过`server: https://master_slb_ip:8443`访问。

### 3.2 添加node

将master1上的`/etc/kubernetes/admin.conf`拷贝为node5上的`~/.kube/config`，并修改为`server: https://master_slb_ip:8443`，这样即可以node5上通过`kubeadm token create --print-join-command`获取集群添加命令。

在node5上继续使用该脚本，设置好变量。 [https://github.com/ygqygq2/kubernetes/blob/master/kubeadm/kubeadm\_install\_k8s.sh](https://github.com/ygqygq2/kubernetes/blob/master/kubeadm/kubeadm_install_k8s.sh)

```bash
INSTALL_CLUSTER="false"
# 可获取kubeadm join命令的节点IP
k8s_join_ip="node5_ip"  # 脚本中是通过ssh到该IP变量获取kubeadm join命令
```

执行脚本，即可添加节点成功。

## 4\. 小结

因为EIP只有一个，所以存在单点问题，当然可以通过添加EIP绑定ECS解决。因为各种限制条件，没有可以直接上网的私有云服务器好用，使用过程中，可能出现访问不允许代理情况，或者部分地址不需要使用代理访问。若后续Nginx ingress使用阿里SLB暴露服务，需要考虑nginx ingress是否为HTTPS。总之，很折腾。
