---
title: "kubekey 离线安装高可用 kubernetes 集群"
date: "2024-06-28"
categories: 
  - "system-operations"
  - "cloudcomputing-container"
tags: 
  - "kubernetes"
  - "kubesphere"
---

# 1\. 准备环境

版本： kubernetes: v1.29.2 kubesphere: v3.4.1 kubekey: v3.1.1

> 说明： \* kubekey 只用于安装 kubernetes，因为 kubesphere 的配置在安装时经常需要变动，用 ks-installer 的 yaml 文件更好管理； \* ks-installer 用于安装 kubesphere，kubekey、ks-installer 分工明确； \* 本文在已有 harbor 仓库环境下，建议把镜像都放在公开仓库 `library` 中，如没有 harbor 仓库，按官方文档来即可；

## 1.1 机器准备

4 台机器，操作系统：Ubuntu 24.04/RHEL8/CentOS9

```
10.0.0.130 k8smaster-lv01
10.0.0.131 k8snode-lv01
10.0.0.132 k8snode-lv02
10.0.0.133 k8snode-lv03
10.0.0.140 lb.kubesphere.local
```

## 1.2 离线安装包准备

```bash
## kk create manifest --with-kubernetes v1.29.2
# kk create manifest  # 最好在已有集群创建
```

这里提供一个可以直接使用的，因为系统安装包，我们自己处理，所以这里不用管系统的 iso 啥的地址。 `manifest-sample.yaml`:

```yaml
apiVersion: kubekey.kubesphere.io/v1alpha2
kind: Manifest
metadata:
  name: sample
spec:
  arches:
  - amd64
  operatingSystems:
  - arch: amd64
    type: linux
    id: red
    version: "Can't get the os version. Please edit it manually."
    osImage: Red Hat Enterprise Linux 8.10 (Ootpa)
    repository:
      iso:
        localPath: 
        url:
  - arch: amd64
    type: linux
    id: red
    version: "Can't get the os version. Please edit it manually."
    osImage: Red Hat Enterprise Linux 8.9 (Ootpa)
    repository:
      iso:
        localPath: 
        url:
  kubernetesDistributions:
  - type: kubernetes
    version: v1.29.2
  components:
    helm: 
      version: v3.14.3
    cni: 
      version: v1.2.0
    etcd: 
      version: v3.5.13
    containerRuntimes:
    - type: containerd
      version: 1.7.13
    calicoctl:
      version: v3.27.3
    crictl: 
      version: v1.29.0

  images:
  - docker.io/aledbf/kube-keepalived-vip:0.35
  - docker.io/bitnami/etcd:3.5.6-debian-11-r10
  - docker.io/bitnami/kubectl:1.29.2
  - docker.io/calico/cni:v3.27.3
  - docker.io/calico/node:v3.27.3
  - docker.io/coredns/coredns:1.9.3
  - docker.io/grafana/promtail:2.8.3
  - docker.io/kubesphere/examples-bookinfo-reviews-v1:1.16.2
  - docker.io/kubesphere/fluent-bit:v1.9.4
  - docker.io/kubesphere/k8s-dns-node-cache:1.22.20
  - docker.io/kubesphere/ks-apiserver:v3.4.1
  - docker.io/kubesphere/ks-installer:v3.4.1
  - docker.io/kubesphere/ks-installer:v3.4.1-patch.0
  - docker.io/kubesphere/ks-jenkins:v3.4.0-2.319.3-1
  - docker.io/kubesphere/kube-apiserver:v1.29.2
  - docker.io/kubesphere/kube-controller-manager:v1.29.2
  - docker.io/kubesphere/kube-proxy:v1.29.2
  - docker.io/kubesphere/kube-rbac-proxy:v0.11.0
  - docker.io/kubesphere/kube-scheduler:v1.29.2
  - docker.io/kubesphere/pause:3.9
  - docker.io/library/busybox:latest
  - docker.io/openebs/lvm-driver:1.5.0
  - docker.io/openebs/mayastor-agent-ha-node:v2.6.1
  - docker.io/openebs/mayastor-csi-node:v2.6.1
  - docker.io/openebs/mayastor-io-engine:v2.6.1
  - docker.io/openebs/zfs-driver:2.5.0
  - docker.io/opensearchproject/opensearch:2.6.0
  - docker.io/osixia/openldap:1.3.0
  - docker.io/prom/node-exporter:v1.3.1
  - docker.io/weaveworks/scope:1.13.0
  - quay.io/argoproj/argocd:v2.3.3
  - registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.10.0
  - registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.8.0
  registry:
    auths: {}

```

```bash
# 生成离线安装包
kk artifact export -m manifest-sample.yaml -o kubesphere.tar.gz
```

因为最近 docker hub 无法在大陆拉 image，可以使用我这个 Jenkinsfile 配合海外节点将 image 拉下来，传到私有 harbor 仓库。 [mirror-images-to-harbor](https://github.com/linuxba/mirror-images-to-harbor)，当前直接在它上面提 issue 同步也可，只是一个 issue 只能同步一个 image。

当然，官方的这个 image 同步脚本 [offline-installation-tool.sh](https://github.com/kubesphere/ks-installer/blob/master/scripts/offline-installation-tool.sh) 也可以，它是直接拉的 image，可能拉不动，你下面列表里的 image 得转成你拉得动的 image 地址：

以下为image列表，生成的 image 列表，并不完全，所以后面发现有漏的 image，随时使用 jenkins 把缺少的image同步下。

```
docker.io/aledbf/kube-keepalived-vip:0.35
docker.io/bitnami/etcd:3.5.6-debian-11-r10
docker.io/bitnami/kubectl:1.29.2
docker.io/calico/cni:v3.27.3
docker.io/calico/node:v3.27.3
docker.io/coredns/coredns:1.9.3
docker.io/grafana/promtail:2.8.3
docker.io/kubesphere/examples-bookinfo-reviews-v1:1.16.2
docker.io/kubesphere/fluent-bit:v1.9.4
docker.io/kubesphere/k8s-dns-node-cache:1.22.20
docker.io/kubesphere/ks-apiserver:v3.4.1
docker.io/kubesphere/ks-installer:v3.4.1
docker.io/kubesphere/ks-installer:v3.4.1-patch.0
docker.io/kubesphere/ks-jenkins:v3.4.0-2.319.3-1
docker.io/kubesphere/kube-apiserver:v1.29.2
docker.io/kubesphere/kube-controller-manager:v1.29.2
docker.io/kubesphere/kube-proxy:v1.29.2
docker.io/kubesphere/kube-rbac-proxy:v0.11.0
docker.io/kubesphere/kube-scheduler:v1.29.2
docker.io/kubesphere/pause:3.9
docker.io/library/busybox:latest
docker.io/openebs/lvm-driver:1.5.0
docker.io/openebs/mayastor-agent-ha-node:v2.6.1
docker.io/openebs/mayastor-csi-node:v2.6.1
docker.io/openebs/mayastor-io-engine:v2.6.1
docker.io/openebs/zfs-driver:2.5.0
docker.io/opensearchproject/opensearch:2.6.0
docker.io/osixia/openldap:1.3.0
docker.io/prom/node-exporter:v1.3.1
docker.io/weaveworks/scope:1.13.0
quay.io/argoproj/argocd:v2.3.3
registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.10.0
registry.k8s.io/sig-storage/csi-node-driver-registrar:v2.8.0
```

## 1.3 安装依赖和配置

系统源即可安装的依赖包，所有节点都需要执行

Ubuntu 系:

```bash
apt-get install -y socat conntrack ebtables ipset chrony
```

RHEL 系：

```bash
yum install -y socat conntrack ebtables ipset chrony 
```

因为使用私有 Harbor 仓库，所有节点配置 host：

`10.25.23.102 harbor.ops.shenzhen.com`

## 1.4 安装负载均衡 keepalived + haproxy

负载均衡节点安装 keepalived haproxy

```bash
apt-get -y install keepalived haproxy
# yum -y install keepalived haproxy
```

新建用户

```
useradd -r -u 139 -g 100 -s /sbin/nologin keepalived_script
```

配置 keepalived `/etc/keepalived/keepalived.conf` （注意配置中注释，不同节点权重不同）内容：

```
! /etc/keepalived/keepalived.conf
! Configuration File for keepalived
global_defs {
    script_user keepalived_script
    enable_script_security     
    router_id LVS_DEVEL
    max_auto_priority 99
}
vrrp_script check_apiserver {
    script "/etc/keepalived/check_apiserver.sh"
    interval 3
    weight -2
    fall 10
    rise 2
}

vrrp_instance VI_1 {
    # 只配置一个 MASTER，其它的配置为 BACKUP
    state MASTER
    # 注意网卡名
    interface ens192
    virtual_router_id 60
    # MASTER 权重最高，尽量全部设置为不同的权重
    priority 101
    authentication {
        auth_type PASS
        auth_pass k8s
    }
    virtual_ipaddress {
        10.0.0.140
    }
    track_script {
        check_apiserver
    }
}
```

`/etc/keepalived/check_apiserver.sh` 内容：

```
#!/bin/bash

# if check error then repeat check for 12 times, else exit
err=0
for k in $(seq 1 12)
do
    check_code=$(curl -k https://localhost:6443)
    if [[ $check_code == "" ]]; then
        err=$(expr $err + 1)
        sleep 5
        continue
    else
        err=0
        break
    fi
done

if [[ $err != "0" ]]; then
    # if apiserver is down send SIG=1
    echo 'apiserver error!'
    exit 1
else
    # if apiserver is up send SIG=0
    echo 'apiserver normal!'
    exit 0
fi
```

`chmod a+x /etc/keepalived/check_apiserver.sh`

配置 haproxy `/etc/haproxy/haproxy.cfg` 内容：

```
global
  log 127.0.0.1 local0 err
  maxconn 50000
  uid 138 
  gid 138
  #daemon
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
  server master1 10.0.0.130:6443 weight 1 maxconn 1000 check inter 2000 rise 2 fall 3
```

```
systemctl start haproxy
systemctl start keepalived
systemctl enable haproxy
systemctl enable keepalived
```

# 2\. kubernetes 集群安装

## 2.1 kk 安装

kk 命令是二进制的，从安装好的机器，直接拷贝到安装集群的 master 机器即可。

```bash
curl -sfL https://get-kk.kubesphere.io | VERSION=v3.1.1 sh -
mv kk /usr/local/sbin/
kk version --show-supported-k8s

# 生成 ssh key
ssh-keygen -t ed25519 -C "master"
# 公钥添加到其它节点
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@其它节点IP
```

## 2.2 kk 配置

```bash
mkdir k8s
cd k8s
# kk create config --with-kubernetes v1.29.2
```

直接使用如下配置文件 `config-sample.yaml`，然后修改下节点信息，如下：

内容：

```yaml
apiVersion: kubekey.kubesphere.io/v1alpha2
kind: Cluster
metadata:
  name: sample
spec:
  hosts:
  - {name: k8smaster-lv01, address: 10.0.0.130, internalAddress: 10.0.0.130, user: root, privateKeyPath: "~/.ssh/id_ed25519"}
  - {name: k8snode-lv01, address: 10.0.0.131, internalAddress: 10.0.0.131, user: root, privateKeyPath: "~/.ssh/id_ed25519"}
  - {name: k8snode-lv02, address: 10.0.0.132, internalAddress: 10.0.0.132, user: root, privateKeyPath: "~/.ssh/id_ed25519"}
  - {name: k8snode-lv03, address: 10.0.0.133, internalAddress: 10.0.0.133 , user: root, privateKeyPath: "~/.ssh/id_ed25519"}
  roleGroups:
    etcd:
    - k8smaster-lv01
    - k8snode-lv01
    - k8snode-lv02
    control-plane: 
    - k8smaster-lv01
    worker:
    - k8snode-lv01
    - k8snode-lv02
    - k8snode-lv03
  controlPlaneEndpoint:
    ## Internal loadbalancer for apiservers 
    # internalLoadbalancer: haproxy

    domain: lb.kubesphere.local
    address: "10.0.0.140"
    port: 8443
  kubernetes:
    version: v1.29.2
    clusterName: cluster.local
    autoRenewCerts: true
    containerManager: containerd
  etcd:
    type: kubekey
  network:
    plugin: calico
    kubePodsCIDR: 10.233.64.0/18
    kubeServiceCIDR: 10.233.0.0/18
    ## multus support. https://github.com/k8snetworkplumbingwg/multus-cni
    multusCNI:
      enabled: false
  registry:
    privateRegistry: "harbor地址"
    namespaceOverride: ""
    registryMirrors: [""]
    # insecureRegistries: ["非httpsimage地址"]  # 如果是 http，请取消注释
    #auths:
    #  "harbor地址":
    #    username: ''
    #    password: ''
    #    skipTLSVerify: true # Allow contacting registries over HTTPS with failed TLS verification.
    #    plainHTTP: true # Allow contacting registries over HTTP.
  addons: []
```

## 2.3 kk 安装集群

检查时间，如果时间未同步，重启 chronyd 服务。

```bash
date
systemctl stop chronyd
systemctl start chronyd
chronyc tracking
# chronc -a makestep # 强制同步
```

集群安装：

```bash
kk create cluster -f config-sample.yaml -a kubesphere.tar.gz
```

如果使用的 harbor 是 http 的，kubekey 内部是使用的 https 的仓库，可能会中断安装。我们再次安装，前面二进制文件已经缓存至 kubekey 安装目录，然后不加 `-a` 参数，就是在线安装，只是使用内部仓库的在线安装方式。

再次集群安装：

```bash
kk create cluster -f config-sample.yaml
```

**有可能需要处理的地方** 1. `/etc/containerd/config.toml`，里面改成私有仓库地址

```
    sandbox_image = "harbor地址/library/kubesphere/pause:3.9"
```

1. 如果你需要 coredns 添加 hosts，注意 `/etc/resolv.conf` 里面要设置 DNS，否则 coredns 可能无法启动。 `kubectl edit cm coredns -n kube-system`：

```
data:
  Corefile: |
    .:53 {
        errors
        health {
          lameduck 5s
        }
        hosts /etc/coredns/hosts {
          IP 域名
          fallthrough
        } 
```

`kubectl edit cm nodelocaldns -n kube-system`：

```
    }
    .:53 {
        errors
        cache 30
        reload
        loop
        bind 169.254.25.10
        # forward . /etc/resolv.conf
        forward . 10.233.0.3 {
            force_tcp
        }
        prometheus :9253
    }
```

## 2.4 kk 安装集群失败处理

在 master 节点执行，注意确认正确的节点和危险性！！！

```bash
kk delete cluster -f config-sample.yaml
```

# 3\. kubesphere 安装

根据官方文档来即可。

```bash
curl -L -O https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/cluster-configuration.yaml
curl -L -O https://github.com/kubesphere/ks-installer/releases/download/v3.4.1/kubesphere-installer.yaml
```

```yaml
spec:
  persistence:
    storageClass: ""
  authentication:
    jwtSecret: ""
  local_registry: 你的harbor地址/library  # 镜像都放在 library 下并保持原来目录结构
```

```bash
sed -i "s#^\s*image: kubesphere.*/ks-installer:.*#        image: 你的harbor地址/library/kubesphere/ks-installer:v3.4.1#" kubesphere-installer.yaml

```

安装：

```bash
kubectl apply -f kubesphere-installer.yaml
kubectl apply -f cluster-configuration.yaml
```

最容易出问题的就是镜像拉取，随时查看并解决镜像问题。

```bash
kubectl get pod -A
kubectl describe pod <pod名> -n <namespace>
```

# 4\. 暴露 kubesphere 控制台

## 4.1 安装 metallb

推荐 helm 方式安装，这里略，详情参考 [metallb官方文档](https://metallb.io/)。 安装好后配置一个全局 IP 池。

## 4.2 打开全局网关

使用 ``http://某一节点IP:30880` 登录 ks 后，在集群设置中，打开全局网关，注意使用``Loadbalancer\` 类型暴露，因为有全局 IP 池可用，按理说随便选一个负载均衡厂商即可，因为没有 metallb 选项。

## 4.3 ingress 暴露 ks 控制台

`console-ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/upstream-vhost: ks-console.kubesphere-system.svc.cluster.local
  name: ks-console
  namespace: kubesphere-system
spec:
  rules:
  - host: ks域名
    http:
      paths:
      - backend:
          service:
            name: ks-console
            port:
              number: 80
        path: /
        pathType: ImplementationSpecific
```

```bash
kubectl apply -f console-ingress.yaml
```

参考资料： \[1\] https://www.kubesphere.io/zh/docs/v3.4/installing-on-linux/introduction/air-gapped-installation/ \[2\] https://www.kubesphere.io/zh/docs/v3.4/installing-on-kubernetes/on-prem-kubernetes/install-ks-on-linux-airgapped/
