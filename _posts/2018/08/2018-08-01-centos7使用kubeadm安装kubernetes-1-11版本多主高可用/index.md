---
title: "centos7使用kubeadm安装kubernetes 1.11版本多主高可用"
date: "2018-08-01"
categories: 
  - "system-operations"
tags: 
  - "centos"
  - "docker"
  - "kubeadm"
  - "kubernetes"
---

# centos7使用kubeadm安装kubernetes 1.11版本多主高可用

\[TOC\]

**kubernetes介绍** 要学习一个新的东西，先了解它是什么，熟悉基本概念会有很大帮助。以下是我学习时看过的一篇核心概念介绍。 [http://dockone.io/article/932](http://dockone.io/article/932)

搭建Kubernetes集群环境有以下3种方式：

_minikube_ Minikube是一个工具，可以在本地快速运行一个单点的Kubernetes，尝试Kubernetes或日常开发的用户使用。不能用于生产环境。 官方地址：[https://kubernetes.io/docs/setup/minikube/](https://kubernetes.io/docs/setup/minikube/)

> 以下是符合企业生产环境标准的Kubernetes集群环境方式：

_kubeadm_ Kubeadm也是一个工具，提供`kubeadm init`和`kubeadm join`，用于快速部署Kubernetes集群。

官方地址：[https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm/](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm/)

_二进制包_ 从官方下载发行版的二进制包，手动部署每个组件，组成Kubernetes集群。

官方也提供了一个互动测试环境供大家玩耍：[https://kubernetes.io/cn/docs/tutorials/kubernetes-basics/cluster-interactive/](https://kubernetes.io/cn/docs/tutorials/kubernetes-basics/cluster-interactive/) 国外的这个最多支持5个节点的测试环境也很赞：[https://labs.play-with-k8s.com/](https://labs.play-with-k8s.com/)

## 1\. 实验环境说明

```
lab1: etcd master haproxy keepalived 192.168.105.92
lab2: etcd master haproxy keepalived 192.168.105.93
lab3: etcd master haproxy keepalived 192.168.105.94
lab4: node  192.168.105.95
lab4: node  192.168.105.96


vip(loadblancer ip): 192.168.105.99
```

virtualbox实验使用的Vagrantfile：

```
# -*- mode: ruby -*-
# vi: set ft=ruby :

ENV["LC_ALL"] = "en_US.UTF-8"

Vagrant.configure("2") do |config|
    (2..6).each do |i|
      config.vm.define "lab#{i}" do |node|
        node.vm.box = "centos-7.4-docker-17"
        node.ssh.insert_key = false
        node.vm.hostname = "lab#{i}"
        node.vm.network "private_network", ip: "192.168.105.9#{i}"
        node.vm.provision "shell",
          inline: "echo hello from node #{i}"
        node.vm.provider "virtualbox" do |v|
          v.cpus = 2
          v.customize ["modifyvm", :id, "--name", "lab#{i}", "--memory", "2048"]
        end
      end
    end
end
```

## 2\. 准备yum源

使用阿里yum源，并将默认yum源文件都移走。

```bash
cd /etc/yum.repos.d
mkdir bak
mv *.repo bak/
```

`vim CentOS-Base.repo`

```
# CentOS-Base.repo
#
# The mirror system uses the connecting IP address of the client and the
# update status of each mirror to pick mirrors that are updated to and
# geographically close to the client.  You should use this for CentOS updates
# unless you are manually picking other mirrors.
#
# If the mirrorlist= does not work for you, as a fall back you can try the 
# remarked out baseurl= line instead.
#
#

[base]
name=CentOS-$releasever - Base - mirrors.aliyun.com
failovermethod=priority
baseurl=http://mirrors.aliyun.com/centos/$releasever/os/$basearch/
        http://mirrors.aliyuncs.com/centos/$releasever/os/$basearch/
        http://mirrors.cloud.aliyuncs.com/centos/$releasever/os/$basearch/
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7

#released updates 
[updates]
name=CentOS-$releasever - Updates - mirrors.aliyun.com
failovermethod=priority
baseurl=http://mirrors.aliyun.com/centos/$releasever/updates/$basearch/
        http://mirrors.aliyuncs.com/centos/$releasever/updates/$basearch/
        http://mirrors.cloud.aliyuncs.com/centos/$releasever/updates/$basearch/
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7

#additional packages that may be useful
[extras]
name=CentOS-$releasever - Extras - mirrors.aliyun.com
failovermethod=priority
baseurl=http://mirrors.aliyun.com/centos/$releasever/extras/$basearch/
        http://mirrors.aliyuncs.com/centos/$releasever/extras/$basearch/
        http://mirrors.cloud.aliyuncs.com/centos/$releasever/extras/$basearch/
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7

#additional packages that extend functionality of existing packages
[centosplus]
name=CentOS-$releasever - Plus - mirrors.aliyun.com
failovermethod=priority
baseurl=http://mirrors.aliyun.com/centos/$releasever/centosplus/$basearch/
        http://mirrors.aliyuncs.com/centos/$releasever/centosplus/$basearch/
        http://mirrors.cloud.aliyuncs.com/centos/$releasever/centosplus/$basearch/
gpgcheck=1
enabled=0
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7

#contrib - packages by Centos Users
[contrib]
name=CentOS-$releasever - Contrib - mirrors.aliyun.com
failovermethod=priority
baseurl=http://mirrors.aliyun.com/centos/$releasever/contrib/$basearch/
        http://mirrors.aliyuncs.com/centos/$releasever/contrib/$basearch/
        http://mirrors.cloud.aliyuncs.com/centos/$releasever/contrib/$basearch/
gpgcheck=1
enabled=0
gpgkey=http://mirrors.aliyun.com/centos/RPM-GPG-KEY-CentOS-7
```

`vim epel-7.repo`

```
[epel]
name=Extra Packages for Enterprise Linux 7 - $basearch
baseurl=http://mirrors.aliyun.com/epel/7/$basearch
failovermethod=priority
enabled=1
gpgcheck=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7

[epel-debuginfo]
name=Extra Packages for Enterprise Linux 7 - $basearch - Debug
baseurl=http://mirrors.aliyun.com/epel/7/$basearch/debug
failovermethod=priority
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
gpgcheck=0

[epel-source]
name=Extra Packages for Enterprise Linux 7 - $basearch - Source
baseurl=http://mirrors.aliyun.com/epel/7/SRPMS
failovermethod=priority
enabled=0
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7
gpgcheck=0
```

`vim docker-ce.repo`

```
[docker-ce-stable]
name=Docker CE Stable - $basearch
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/$basearch/stable
enabled=1
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[docker-ce-stable-debuginfo]
name=Docker CE Stable - Debuginfo $basearch
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/debug-$basearch/stable
enabled=0
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[docker-ce-stable-source]
name=Docker CE Stable - Sources
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/source/stable
enabled=0
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[docker-ce-edge]
name=Docker CE Edge - $basearch
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/$basearch/edge
enabled=1
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[docker-ce-edge-debuginfo]
name=Docker CE Edge - Debuginfo $basearch
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/debug-$basearch/edge
enabled=0
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[docker-ce-edge-source]
name=Docker CE Edge - Sources
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/source/edge
enabled=0
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[docker-ce-test]
name=Docker CE Test - $basearch
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/$basearch/test
enabled=0
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[docker-ce-test-debuginfo]
name=Docker CE Test - Debuginfo $basearch
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/debug-$basearch/test
enabled=0
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[docker-ce-test-source]
name=Docker CE Test - Sources
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/source/test
enabled=0
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[docker-ce-nightly]
name=Docker CE Nightly - $basearch
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/$basearch/nightly
enabled=0
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[docker-ce-nightly-debuginfo]
name=Docker CE Nightly - Debuginfo $basearch
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/debug-$basearch/nightly
enabled=0
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg

[docker-ce-nightly-source]
name=Docker CE Nightly - Sources
baseurl=https://mirrors.aliyun.com/docker-ce/linux/centos/7/source/nightly
enabled=0
gpgcheck=1
gpgkey=https://mirrors.aliyun.com/docker-ce/linux/centos/gpg
```

`vim kubernetes.repo`

```
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
```

## 2\. 安装配置docker

v1.11.1版本推荐使用docker v17.03,v1.11,v1.12,v1.13, 也可以使用，再高版本的docker可能无法正常使用。

这里安装v1.13版本。

```bash
yum -y install docker
systemctl enable docker && systemctl restart docker
```

docker启动错误解决：

```
Error starting daemon: SELinux is not supported with the overlay2 graph driver on this kernel. Either boot into a newer kernel or disable selinux in docke...-enabled=false)
```

修改`/etc/sysconfig/docker`中的`--selinux-enabled=false`

## 3\. 安装 kubeadm, kubelet 和 kubectl

> 如下操作在所有节点操作

```bash
yum install -y kubelet kubeadm kubectl ipvsadm
systemctl enable kubelet && systemctl start kubelet
```

## 4\. 配置系统相关参数

> 如下操作在所有节点操作

```
# 设置时区
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# 临时禁用selinux
# 永久关闭 修改/etc/sysconfig/selinux文件设置
sed -i 's/SELINUX=.*/SELINUX=disabled/' /etc/sysconfig/selinux
setenforce 0  # 需要重启生效

# 开启forward
# Docker从1.13版本开始调整了默认的防火墙规则
# 禁用了iptables filter表中FOWARD链
# 这样会引起Kubernetes集群中跨Node的Pod无法通信
iptables -P FORWARD ACCEPT

# 临时关闭swap
# 永久关闭 注释/etc/fstab文件里swap相关的行
swapoff -a

# 开启防火墙允许集群机器间通信（为了方便测试或者直接关闭防火墙）
firewall-cmd --add-rich-rule 'rule family=ipv4 source address=192.168.105.0/24 accept' # # 指定源IP（段），即时生效
firewall-cmd --add-rich-rule 'rule family=ipv4 source address=192.168.105.0/24 accept' --permanent # 指定源IP（段），永久生效

# 配置转发相关参数，否则可能会出错
cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
vm.swappiness=0
EOF
sysctl --system

# 加载ipvs相关内核模块
# 如果重新开机，需要重新加载
modprobe ip_vs
modprobe ip_vs_rr
modprobe ip_vs_wrr
modprobe ip_vs_sh
modprobe nf_conntrack_ipv4
lsmod | grep ip_vs
```

## 5\. 配置hosts解析

> 如下操作在所有节点操作

```bash
cat >>/etc/hosts<<EOF
192.168.105.92 lab1
192.168.105.93 lab2
192.168.105.94 lab3
192.168.105.95 lab4
192.168.105.96 lab5
EOF
```

## 6\. 配置haproxy代理和keepalived

> 如下操作在节点lab1,lab2,lab3操作

```bash
# 拉取haproxy镜像
docker pull haproxy:1.7.8-alpine
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
  stats auth    will:will
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
  server lab1 192.168.105.92:6443 weight 1 maxconn 1000 check inter 2000 rise 2 fall 3
  server lab2 192.168.105.93:6443 weight 1 maxconn 1000 check inter 2000 rise 2 fall 3
  server lab3 192.168.105.94:6443 weight 1 maxconn 1000 check inter 2000 rise 2 fall 3
EOF

# 启动haproxy
docker run -d --name my-haproxy \
-v /etc/haproxy:/usr/local/etc/haproxy:ro \
-p 8443:8443 \
-p 1080:1080 \
--restart always \
haproxy:1.7.8-alpine

# 查看日志
docker logs my-haproxy

# 浏览器查看状态
http://192.168.105.92:1080/haproxy-status
http://192.168.105.93:1080/haproxy-status
http://192.168.105.94:1080/haproxy-status

# 拉取keepalived镜像
docker pull osixia/keepalived:1.4.4

# 启动
# 载入内核相关模块
lsmod | grep ip_vs
modprobe ip_vs

# 启动keepalived
# ens32为本次实验192.168.105.0/24网段的所在网卡
docker run --net=host --cap-add=NET_ADMIN \
-e KEEPALIVED_INTERFACE=ens32 \
-e KEEPALIVED_VIRTUAL_IPS="#PYTHON2BASH:['192.168.105.99']" \
-e KEEPALIVED_UNICAST_PEERS="#PYTHON2BASH:['192.168.105.92','192.168.105.93','192.168.105.94']" \
-e KEEPALIVED_PASSWORD=hello \
--name k8s-keepalived \
--restart always \
-d osixia/keepalived:1.4.4

# 查看日志
# 会看到两个成为backup 一个成为master
docker logs k8s-keepalived

# 此时会配置 192.168.105.99 到其中一台机器
# ping测试
ping -c4 192.168.105.99

# 如果失败后清理后，重新实验
#docker rm -f k8s-keepalived
#ip a del 192.168.105.99/32 dev ens32
```

## 7\. 配置启动kubelet

> 如下操作在所有节点操作

```bash
# 配置kubelet使用国内pause镜像
# 配置kubelet的cgroups
# 获取docker的cgroups
DOCKER_CGROUPS=$(docker info | grep 'Cgroup' | cut -d' ' -f3)
echo $DOCKER_CGROUPS
cat >/etc/sysconfig/kubelet<<EOF
KUBELET_EXTRA_ARGS="--cgroup-driver=$DOCKER_CGROUPS --pod-infra-container-image=registry.cn-hangzhou.aliyuncs.com/google_containers/pause-amd64:3.1"
EOF

# 启动
systemctl daemon-reload
systemctl enable kubelet && systemctl restart kubelet
```

## 8\. 配置master

### 8.1 配置第一个master

> 如下操作在lab1节点操作

```bash
# centos下使用 ipvs 模式问题已解决
# 参考 https://github.com/kubernetes/kubernetes/issues/65461

cd /etc/kubernetes
# 生成配置文件
CP0_IP="192.168.105.92"
CP0_HOSTNAME="lab1"
cat >kubeadm-master.config<<EOF
apiVersion: kubeadm.k8s.io/v1alpha2
kind: MasterConfiguration
kubernetesVersion: v1.11.1
imageRepository: registry.cn-hangzhou.aliyuncs.com/google_containers

apiServerCertSANs:
- "lab1"
- "lab2"
- "lab3"
- "192.168.105.92"
- "192.168.105.93"
- "192.168.105.94"
- "192.168.105.99"
- "127.0.0.1"

api:
  advertiseAddress: $CP0_IP
  controlPlaneEndpoint: 192.168.105.99:8443

etcd:
  local:
    extraArgs:
      listen-client-urls: "https://127.0.0.1:2379,https://$CP0_IP:2379"
      advertise-client-urls: "https://$CP0_IP:2379"
      listen-peer-urls: "https://$CP0_IP:2380"
      initial-advertise-peer-urls: "https://$CP0_IP:2380"
      initial-cluster: "$CP0_HOSTNAME=https://$CP0_IP:2380"
    serverCertSANs:
      - $CP0_HOSTNAME
      - $CP0_IP
    peerCertSANs:
      - $CP0_HOSTNAME
      - $CP0_IP

controllerManagerExtraArgs:
  node-monitor-grace-period: 10s
  pod-eviction-timeout: 10s

networking:
  podSubnet: 10.244.0.0/16

kubeProxy:
  config:
    mode: ipvs
    # mode: iptables
EOF

# 提前拉取镜像
# 如果执行失败 可以多次执行
kubeadm config images pull --config kubeadm-master.config

# 初始化
# 注意保存返回的 join 命令
kubeadm init --config kubeadm-master.config

# 初始化失败时使用
#kubeadm reset

# 将ca相关文件传至其他master节点
USER=root # customizable
CONTROL_PLANE_IPS=(lab2 lab3)
for host in ${CONTROL_PLANE_IPS[@]}; do
    scp /etc/kubernetes/pki/ca.crt "${USER}"@$host:/etc/kubernetes/pki/ca.crt
    scp /etc/kubernetes/pki/ca.key "${USER}"@$host:/etc/kubernetes/pki/ca.key
    scp /etc/kubernetes/pki/sa.key "${USER}"@$host:/etc/kubernetes/pki/sa.key
    scp /etc/kubernetes/pki/sa.pub "${USER}"@$host:/etc/kubernetes/pki/sa.pub
    scp /etc/kubernetes/pki/front-proxy-ca.crt "${USER}"@$host:/etc/kubernetes/pki/front-proxy-ca.crt
    scp /etc/kubernetes/pki/front-proxy-ca.key "${USER}"@$host:/etc/kubernetes/pki/front-proxy-ca.key
    ssh "${USER}"@$host "mkdir -p /etc/kubernetes/pki/etcd"
    scp /etc/kubernetes/pki/etcd/ca.crt "${USER}"@$host:/etc/kubernetes/pki/etcd/ca.crt
    scp /etc/kubernetes/pki/etcd/ca.key "${USER}"@$host:/etc/kubernetes/pki/etcd/ca.key
    scp /etc/kubernetes/admin.conf "${USER}"@$host:/etc/kubernetes/admin.conf
done
```

`kubeadm init`失败解决： 将阿里云image tag成官方的image，即可解决`init`失败问题。(v1.11.0有此问题)

```bash
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/kube-apiserver-amd64:v1.11.1 k8s.gcr.io/kube-apiserver-amd64:v1.11.1
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/kube-proxy-amd64:v1.11.1 k8s.gcr.io/kube-proxy-amd64:v1.11.1
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/etcd-amd64:3.2.18 k8s.gcr.io/etcd-amd64:3.2.18
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/kube-scheduler-amd64:v1.11.1 k8s.gcr.io/kube-scheduler-amd64:v1.11.1
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/kube-controller-manager-amd64:v1.11.1 k8s.gcr.io/kube-controller-manager-amd64:v1.11.1
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/coredns:1.1.3 k8s.gcr.io/coredns:1.1.3
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/pause-amd64:3.1 k8s.gcr.io/pause-amd64:3.1
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/pause:3.1 k8s.gcr.io/pause:3.1
```

`docker images` # 结果如下

```
docker images
REPOSITORY                                                                          TAG                 IMAGE ID            CREATED             SIZE
k8s.gcr.io/kube-apiserver-amd64                                                     v1.11.1             214c48e87f58        3 weeks ago         187 MB
registry.cn-hangzhou.aliyuncs.com/google_containers/kube-apiserver-amd64            v1.11.1             214c48e87f58        3 weeks ago         187 MB
k8s.gcr.io/kube-proxy-amd64                                                         v1.11.1             1d3d7afd77d1        3 weeks ago         97.8 MB
registry.cn-hangzhou.aliyuncs.com/google_containers/kube-proxy-amd64                v1.11.1             1d3d7afd77d1        3 weeks ago         97.8 MB
k8s.gcr.io/kube-controller-manager-amd64                                            v1.11.1             55b70b420785        3 weeks ago         155 MB
registry.cn-hangzhou.aliyuncs.com/google_containers/kube-controller-manager-amd64   v1.11.1             55b70b420785        3 weeks ago         155 MB
k8s.gcr.io/kube-scheduler-amd64                                                     v1.11.1             0e4a34a3b0e6        3 weeks ago         56.8 MB
registry.cn-hangzhou.aliyuncs.com/google_containers/kube-scheduler-amd64            v1.11.1             0e4a34a3b0e6        3 weeks ago         56.8 MB
k8s.gcr.io/coredns                                                                  1.1.3               b3b94275d97c        2 months ago        45.6 MB
registry.cn-hangzhou.aliyuncs.com/google_containers/coredns                         1.1.3               b3b94275d97c        2 months ago        45.6 MB
docker.io/osixia/keepalived                                                         1.4.4               d83816204582        2 months ago        53.7 MB
registry.cn-shanghai.aliyuncs.com/gcr-k8s/flannel                                   v0.10.0-amd64       b949a39093d6        2 months ago        44.6 MB
k8s.gcr.io/etcd-amd64                                                               3.2.18              b8df3b177be2        3 months ago        219 MB
registry.cn-hangzhou.aliyuncs.com/google_containers/etcd-amd64                      3.2.18              b8df3b177be2        3 months ago        219 MB
quay.io/coreos/flannel                                                              v0.10.0-amd64       f0fad859c909        6 months ago        44.6 MB
k8s.gcr.io/pause-amd64                                                              3.1                 da86e6ba6ca1        7 months ago        742 kB
k8s.gcr.io/pause                                                                    3.1                 da86e6ba6ca1        7 months ago        742 kB
registry.cn-hangzhou.aliyuncs.com/google_containers/pause-amd64                     3.1                 da86e6ba6ca1        7 months ago        742 kB
registry.cn-hangzhou.aliyuncs.com/google_containers/pause                           3.1                 da86e6ba6ca1        7 months ago        742 kB
docker.io/haproxy                                                                   1.7.8-alpine        297a495c0e70        12 months ago       14.7 MB
```

### 8.2 配置第二个master

> 如下操作在lab2节点操作

```bash
# centos下使用 ipvs 模式问题已解决
# 参考 https://github.com/kubernetes/kubernetes/issues/65461

cd /etc/kubernetes
# 生成配置文件
CP0_IP="192.168.105.92"
CP0_HOSTNAME="lab1"
CP1_IP="192.168.105.93"
CP1_HOSTNAME="lab2"
cat >kubeadm-master.config<<EOF
apiVersion: kubeadm.k8s.io/v1alpha2
kind: MasterConfiguration
kubernetesVersion: v1.11.1
imageRepository: registry.cn-hangzhou.aliyuncs.com/google_containers

apiServerCertSANs:
- "lab1"
- "lab2"
- "lab3"
- "192.168.105.92"
- "192.168.105.93"
- "192.168.105.94"
- "192.168.105.99"
- "127.0.0.1"

api:
  advertiseAddress: $CP1_IP
  controlPlaneEndpoint: 192.168.105.99:8443

etcd:
  local:
    extraArgs:
      listen-client-urls: "https://127.0.0.1:2379,https://$CP1_IP:2379"
      advertise-client-urls: "https://$CP1_IP:2379"
      listen-peer-urls: "https://$CP1_IP:2380"
      initial-advertise-peer-urls: "https://$CP1_IP:2380"
      initial-cluster: "$CP0_HOSTNAME=https://$CP0_IP:2380,$CP1_HOSTNAME=https://$CP1_IP:2380"
      initial-cluster-state: existing
    serverCertSANs:
      - $CP1_HOSTNAME
      - $CP1_IP
    peerCertSANs:
      - $CP1_HOSTNAME
      - $CP1_IP

controllerManagerExtraArgs:
  node-monitor-grace-period: 10s
  pod-eviction-timeout: 10s

networking:
  podSubnet: 10.244.0.0/16

kubeProxy:
  config:
    mode: ipvs
    # mode: iptables
EOF

# 配置kubelet
kubeadm alpha phase certs all --config kubeadm-master.config
kubeadm alpha phase kubelet config write-to-disk --config kubeadm-master.config
kubeadm alpha phase kubelet write-env-file --config kubeadm-master.config
kubeadm alpha phase kubeconfig kubelet --config kubeadm-master.config
systemctl restart kubelet

# 添加etcd到集群中
CP0_IP="192.168.105.92"
CP0_HOSTNAME="lab1"
CP1_IP="192.168.105.93"
CP1_HOSTNAME="lab2"
export KUBECONFIG=/etc/kubernetes/admin.conf 
kubectl exec -n kube-system etcd-${CP0_HOSTNAME} -- etcdctl --ca-file /etc/kubernetes/pki/etcd/ca.crt --cert-file /etc/kubernetes/pki/etcd/peer.crt --key-file /etc/kubernetes/pki/etcd/peer.key --endpoints=https://${CP0_IP}:2379 member add ${CP1_HOSTNAME} https://${CP1_IP}:2380
kubeadm alpha phase etcd local --config kubeadm-master.config

# 提前拉取镜像
# 如果执行失败 可以多次执行
kubeadm config images pull --config kubeadm-master.config

# 部署
kubeadm alpha phase kubeconfig all --config kubeadm-master.config
kubeadm alpha phase controlplane all --config kubeadm-master.config
kubeadm alpha phase mark-master --config kubeadm-master.config
```

### 8.3 配置第三个master

> 如下操作在lab3节点操作

```bash
# centos下使用 ipvs 模式问题已解决
# 参考 https://github.com/kubernetes/kubernetes/issues/65461

cd /etc/kubernetes
# 生成配置文件
CP0_IP="192.168.105.92"
CP0_HOSTNAME="lab1"
CP1_IP="192.168.105.93"
CP1_HOSTNAME="lab2"
CP2_IP="192.168.105.94"
CP2_HOSTNAME="lab3"
cat >kubeadm-master.config<<EOF
apiVersion: kubeadm.k8s.io/v1alpha2
kind: MasterConfiguration
kubernetesVersion: v1.11.1
imageRepository: registry.cn-hangzhou.aliyuncs.com/google_containers

apiServerCertSANs:
- "lab1"
- "lab2"
- "lab3"
- "192.168.105.92"
- "192.168.105.93"
- "192.168.105.94"
- "192.168.105.99"
- "127.0.0.1"

api:
  advertiseAddress: $CP2_IP
  controlPlaneEndpoint: 192.168.105.99:8443

etcd:
  local:
    extraArgs:
      listen-client-urls: "https://127.0.0.1:2379,https://$CP2_IP:2379"
      advertise-client-urls: "https://$CP2_IP:2379"
      listen-peer-urls: "https://$CP2_IP:2380"
      initial-advertise-peer-urls: "https://$CP2_IP:2380"
      initial-cluster: "$CP0_HOSTNAME=https://$CP0_IP:2380,$CP1_HOSTNAME=https://$CP1_IP:2380,$CP2_HOSTNAME=https://$CP2_IP:2380"
      initial-cluster-state: existing
    serverCertSANs:
      - $CP2_HOSTNAME
      - $CP2_IP
    peerCertSANs:
      - $CP2_HOSTNAME
      - $CP2_IP

controllerManagerExtraArgs:
  node-monitor-grace-period: 10s
  pod-eviction-timeout: 10s

networking:
  podSubnet: 10.244.0.0/16

kubeProxy:
  config:
    mode: ipvs
    # mode: iptables
EOF

# 配置kubelet
kubeadm alpha phase certs all --config kubeadm-master.config
kubeadm alpha phase kubelet config write-to-disk --config kubeadm-master.config
kubeadm alpha phase kubelet write-env-file --config kubeadm-master.config
kubeadm alpha phase kubeconfig kubelet --config kubeadm-master.config
systemctl restart kubelet

# 添加etcd到集群中
CP0_IP="192.168.105.92"
CP0_HOSTNAME="lab1"
CP2_IP="192.168.105.94"
CP2_HOSTNAME="lab3"
KUBECONFIG=/etc/kubernetes/admin.conf
kubectl exec -n kube-system etcd-${CP0_HOSTNAME} -- etcdctl --ca-file /etc/kubernetes/pki/etcd/ca.crt --cert-file /etc/kubernetes/pki/etcd/peer.crt --key-file /etc/kubernetes/pki/etcd/peer.key --endpoints=https://${CP0_IP}:2379 member add ${CP2_HOSTNAME} https://${CP2_IP}:2380
kubeadm alpha phase etcd local --config kubeadm-master.config

# 提前拉取镜像
# 如果执行失败 可以多次执行
kubeadm config images pull --config kubeadm-master.config

# 部署
kubeadm alpha phase kubeconfig all --config kubeadm-master.config
kubeadm alpha phase controlplane all --config kubeadm-master.config
kubeadm alpha phase mark-master --config kubeadm-master.config
```

## 9\. 配置使用kubectl

> 如下操作在任意master节点操作

```bash
rm -rf $HOME/.kube
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

```
# 查看node节点
kubectl get nodes

# 只有网络插件也安装配置完成之后，才能会显示为ready状态
# 设置master允许部署应用pod，参与工作负载，现在可以部署其他系统组件
# 如 dashboard, heapster, efk等
kubectl taint nodes --all node-role.kubernetes.io/master-
```

## 10\. 配置使用网络插件

> 如下操作在任意master节点操作

```bash
# 下载配置
cd /etc/kubernetes
mkdir flannel && cd flannel
wget https://raw.githubusercontent.com/coreos/flannel/v0.10.0/Documentation/kube-flannel.yml

# 修改配置
# 此处的ip配置要与上面kubeadm的pod-network一致
  net-conf.json: |
    {
      "Network": "10.244.0.0/16",
      "Backend": {
        "Type": "vxlan"
      }
    }

# 修改镜像
image: registry.cn-shanghai.aliyuncs.com/gcr-k8s/flannel:v0.10.0-amd64

# 如果Node有多个网卡的话，参考flannel issues 39701，
# https://github.com/kubernetes/kubernetes/issues/39701
# 目前需要在kube-flannel.yml中使用--iface参数指定集群主机内网网卡的名称，
# 否则可能会出现dns无法解析。容器无法通信的情况，需要将kube-flannel.yml下载到本地，
# flanneld启动参数加上--iface=<iface-name>
    containers:
      - name: kube-flannel
        image: registry.cn-shanghai.aliyuncs.com/gcr-k8s/flannel:v0.10.0-amd64
        command:
        - /opt/bin/flanneld
        args:
        - --ip-masq
        - --kube-subnet-mgr
        - --iface=ens32

# 启动
kubectl apply -f kube-flannel.yml

# 查看
kubectl get pods --namespace kube-system
kubectl get svc --namespace kube-system
```

## 11\. 配置node节点加入集群

> 如下操作在所有node节点操作

```bash
# 此命令为初始化master成功后返回的结果
kubeadm join 192.168.105.99:8443 --token j6zjtl.tgptijigkhhnuc23 --discovery-token-ca-cert-hash sha256:f3e9ae0841084185649b6c111b7e992465b81f2442d42871c6a15731a17dabba
```

node节点报错处理办法：

`tail -f /var/log/message`

```
Jul 26 07:52:21 localhost kubelet: E0726 07:52:21.336281   10018 summary.go:102] Failed to get system container stats for "/system.slice/kubelet.service": failed to get cgroup stats for "/system.slice/kubelet.service": failed to get container info for "/system.slice/kubelet.service": unknown container "/system.slice/kubelet.service"
```

在kubelet配置文件追加以下配置 `/etc/sysconfig/kubelet`

```
# Append configuration in Kubelet
--runtime-cgroups=/systemd/system.slice --kubelet-cgroups=/systemd/system.slice
```

## 12\. 配置dashboard

默认是没web界面的，可以在master机器上安装一个dashboard插件，实现通过web来管理。

### 12.1 安装Dashboard插件

> 如下操作在任意master节点操作

```bash
cd /etc/kubernetes
wget https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml  # 下载
```

编辑`kubernetes-dashboard.yaml`文件\`：

```
      - name: kubernetes-dashboard
        image: registry.cn-hangzhou.aliyuncs.com/google_containers/kubernetes-dashboard-amd64:v1.8.3
```

执行命令

```bash
# 安装Dashboard插件
kubectl create -f kubernetes-dashboard.yaml
kubectl get svc,pod --all-namespaces | grep dashboard
```

可以看到kubernetes-dashboard已正常运行。

```
kube-system   service/kubernetes-dashboard   NodePort    10.108.96.71   <none>        443:30356/TCP   1m
kube-system   pod/kubernetes-dashboard-754f4d5f69-nfvrk   0/1       CrashLoopBackOff   3          1m
```

### 12.2 授予Dashboard账户集群管理权限

需要一个管理集群admin的权限，新建`kubernetes-dashboard-admin.rbac.yaml`文件，内容如下

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kube-system
---
# Create ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kube-system
```

执行命令

```bash
kubectl create -f kubernetes-dashboard-admin.rbac.yaml
```

找到kubernete-dashboard-admin的token，用户登录使用

执行命令并查看结果

```
[root@lab1 kubernetes]# kubectl -n kube-system get secret | grep admin-user
admin-user-token-b9mpt                           kubernetes.io/service-account-token   3         29s
```

可以看到名称是kubernetes-dashboard-admin-token-ddskx，使用该名称执行如下命令

```
[root@lab1 kubernetes]# kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
Name:         admin-user-token-b9mpt
Namespace:    kube-system
Labels:       <none>
Annotations:  kubernetes.io/service-account.name=admin-user
              kubernetes.io/service-account.uid=f1247ca8-9173-11e8-bbc3-000c29ea3e30

Type:  kubernetes.io/service-account-token

Data
====
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLWI5bXB0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJmMTI0N2NhOC05MTczLTExZTgtYmJjMy0wMDBjMjllYTNlMzAiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.g9F6vn84ds6iVi1TJViWaK1oHMsY0vQoV5Xq8n0nF5WF4uJkkToHxs0nHO4G4u927ZWsMuF0JiTD4rKB0uJcnHdc4GwBN6L2XMceD69YCpunLlgoFOFbu6z9IsZfyvHvFAYbm0Tv4JWBYxkCqmeTKtL1GOtobIs24dvfXk6inn51ZhTAUW_urWvIn8yqckOBJkq7B_wf6EZA0QeNEhhbt_GHPpwq0CMhk4cWHXh_a27y-qKkpu5Cbo_Ux2kUA44o1wmiHgbw4Lh-__KJY3LZmIu9PZzyWyIPaUWlSQ76GXHyOZQ8dw3WRANi9zaEpiwi4e4XXXXXXXXXXXXXXXXXXXXXXX
ca.crt:     1025 bytes
namespace:  11 bytes
```

记下这串token，等下登录使用，这个token默认是永久的。

### 12.3 dashboard访问方式

此处推荐API Server方式访问。（谷歌内核浏览器）

#### 12.3.1 `kubectl proxy`方式访问

> 如下操作在lab1上操作

```bash
kubectl proxy --address=0.0.0.0 --disable-filter=true
```

即可通过浏览器访问: `http://192.168.105.92:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/login`

> 注意 仪表盘使用kubectl代理命令不应暴露公开,因为它只允许HTTP连接。域以外的localhost和127.0.0.1将不能登录。在登录页面点击登录按钮什么都不会发生后，跳过登录后，没有任何权限。

此方式只允许开发测试使用。为了便于开发测试，以下配置用于提升默认权限为超级用户权限。

`vim kubernetes-dashboard-test.yaml`

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: kubernetes-dashboard
  namespace: kube-system
---
# Create ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kubernetes-dashboard
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: kubernetes-dashboard
  namespace: kube-system
```

#### 12.3.2 NodePort方式访问

这种访问方式仪表板只建议在单个节点上设置开发环境。

编辑`kubernetes-dashboard.yaml`文件，添加`type: NodePort`和`nodePort: 30001`，暴露Dashboard服务为30001端口，参考如下。

```yaml
# ------------------- Dashboard Service ------------------- #
kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kube-system
spec:
  type: NodePort  # NodePort登录方式
  ports:
    - port: 443
      targetPort: 8443
      nodePort: 30001  # NodePort登录暴露端口
  selector:
    k8s-app: kubernetes-dashboard
```

> 注意 仪表盘可以在master节点上访问，如果是多节点集群，官方文档说应该是使用节点IP和NodePort来访问，但是经过测试，`https://<master-ip>:<nodePort>` 和 `https://<node-ip>:<nodePort>`都可以访问。

#### 12.3.3 API Server方式访问

`https://<master-ip>:<apiserver-port>/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/`

> 注意 这种方式访问仪表盘的仅仅可能在安装了你的用户证书的浏览器上。与API Server通信可以使用示例所使用的证书kubeconfig文件。

浏览器访问问题：

```
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {

  },
  "status": "Failure",
  "message": "services \"https:kubernetes-dashboard:\" is forbidden: User \"system:anonymous\" cannot get services/proxy in the namespace \"kube-system\"",
  "reason": "Forbidden",
  "details": {
    "name": "https:kubernetes-dashboard:",
    "kind": "services"
  },
  "code": 403
}
```

这是因为最新版的k8s默认启用了RBAC，并为未认证用户赋予了一个默认的身份：`anonymous`。

对于API Server来说，它是使用证书进行认证的，我们需要先创建一个证书：

1. 首先找到kubectl命令的配置文件，默认情况下为`/etc/kubernetes/admin.conf`，在 上文 中，我们已经复制到了`$HOME/.kube/config`中。
    
2. 然后我们使用client-certificate-data和client-key-data生成一个p12文件，可使用下列命令：
    

```bash
# 生成client-certificate-data
grep 'client-certificate-data' ~/.kube/config | head -n 1 | awk '{print $2}' | base64 -d >> kubecfg.crt

# 生成client-key-data
grep 'client-key-data' ~/.kube/config | head -n 1 | awk '{print $2}' | base64 -d >> kubecfg.key

# 生成p12
openssl pkcs12 -export -clcerts -inkey kubecfg.key -in kubecfg.crt -out kubecfg.p12 -name "kubernetes-client"
```

1. 最后导入上面生成的p12文件，重新打开浏览器，显示出现选择证书选项，选OK，然后就可以看到熟悉的登录界面了。我们可以使用一开始创建的admin-user用户的token进行登录，一切OK。

> 注意 对于生产系统，我们应该为每个用户应该生成自己的证书，因为不同的用户会有不同的命名空间访问权限。

#### 12.3.4 nginx ingress方式访问

可以动态的更新Nginx配置等，是比较灵活，更为推荐的暴露服务的方式，但也相对比较复杂，业务环境推荐使用。

## 13\. 基础测试

测试容器间的通信和DNS 配置好网络之后，kubeadm会自动部署coredns

如下测试可以在配置kubectl的节点上操作

```
# 启动名为nginx的容器
kubectl run nginx --replicas=2 --image=nginx:alpine --port=80
# 暴露nginx容器为服务（--type=NodePort/ClusterIP/LoadBalancer，3种类型访问方式不同）
kubectl expose deployment nginx --type=NodePort --name=example-service-nodeport
kubectl expose deployment nginx --name=example-service
# 查看状态
kubectl get deploy
kubectl get pods
kubectl get svc
kubectl describe svc example-service
# DNS解析
kubectl run curl --image=radial/busyboxplus:curl -i --tty
nslookup kubernetes
nslookup example-service
curl example-service
# 访问测试
# 10.103.184.0 为查看svc时获取到的clusterip
curl "10.103.184.0:80"

# 32223 为查看svc时获取到的 nodeport
http://192.168.105.93:32223/
http://192.168.105.94:32223/
# 清理删除
kubectl delete svc example-service example-service-nodeport
kubectl delete deploy nginx curl
# 高可用测试
# 关闭任一master节点测试集群是能否正常执行上一步的基础测试，查看相关信息，不能同时关闭两个节点，因为3个节点组成的etcd集群，最多只能有一个当机。

# 查看组件状态
kubectl get pod --all-namespaces -o wide
kubectl get pod --all-namespaces -o wide | grep lab1
kubectl get pod --all-namespaces -o wide | grep lab2
kubectl get pod --all-namespaces -o wide | grep lab3
kubectl get nodes -o wide
kubectl get deploy
kubectl get pods
kubectl get svc

# 访问测试
CURL_POD=$(kubectl get pods | grep curl | grep Running | cut -d ' ' -f1)
kubectl exec -it $CURL_POD -- sh --tty
nslookup kubernetes
nslookup example-service
curl example-service
```

## 13\. 小技巧

忘记初始master节点时的node节点加入集群命令怎么办

```bash
# 简单方法
kubeadm token create --print-join-command

# 第二种方法
token=$(kubeadm token generate)
kubeadm token create $token --print-join-command --ttl=0
```

## 14\. 相关命令

```bash
# 查看集群结点状态
kubectl get nodes
# 查看详细结点信息
kubectl describe nodes
# 查看所有pod
kubectl get pods --all-namespaces
# 查看集群服务状态
kubectl get svc --all-namespaces
# 查看集群运行在那些ip上
kubectl cluster-info
# 查看master的各种token
kubectl get secret -n kube-system
# 查看某一个特定的token
kubectl describe secret/[token name] -n kube-system
```

参考文档： \[1\] https://kubernetes.io/docs/setup/independent/install-kubeadm/ \[2\] https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/ \[3\] https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init/ \[4\] https://kubernetes.io/docs/setup/independent/high-availability/ \[5\] https://sealyun.com/post/k8s-ipvs/ \[6\] http://www.maogx.win/posts/33/ \[7\] https://github.com/opsnull/follow-me-install-kubernetes-cluster \[8\] https://github.com/xizhibei/blog/issues/64 \[9\] https://www.cnblogs.com/RainingNight/p/deploying-k8s-dashboard-ui.html
