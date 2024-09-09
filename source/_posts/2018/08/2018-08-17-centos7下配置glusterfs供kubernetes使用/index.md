---
title: "CentOS7下配置GlusterFS供Kubernetes使用"
date: "2018-08-17"
categories:
  - "system-operations"
tags:
  - "centos"
  - "glusterfs"
  - "kubernetes"
---

# CentOS7 下配置 GlusterFS 供 Kubernetes 使用

[TOC]

## 1\. 环境说明

系统：CentOS7，`/data`为非系统分区挂载目录 docker：1.13.1 kubernetes：1.11.1 glusterfs：4.1.2

## 2\. GlusterFS 部署

2 个节点，192.168.105.97、192.168.105.98

使用 yum 安装

```bash
yum install centos-release-gluster
yum -y install glusterfs glusterfs-fuse glusterfs-server
```

`CentOS-Gluster-4.1.repo`

启动及设置开机启动

```bash
systemctl start glusterd
systemctl enable glusterd
```

GlusterFS 通过 24007 端口相互通信。防火墙需要开放端口。

`/etc/hosts`

```
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6

# k8s
192.168.105.92 lab1  # master1
192.168.105.93 lab2  # master2
192.168.105.94 lab3  # master3
192.168.105.95 lab4  # node4
192.168.105.96 lab5  # node5

# glusterfs
192.168.105.98 glu1  # glusterfs1
192.168.105.97 harbor1  # harbor1
```

在主机`glu1`上执行

```bash
#添加节点到集群执行操作的本机不需要probe本机
gluster peer probe harbor1
```

查看集群状态（节点间相互看到对方信息）

```bash
gluster peer status
```

```
Number of Peers: 1

Hostname: harbor1
Uuid: ebedc57b-7c71-4ecb-b92e-a7529b2fee31
State: Peer in Cluster (Connected)
```

GlusterFS 几种 volume 模式说明：  
链接中比较直观：[https://docs.gluster.org/en/latest/Administrator%20Guide/Setting%20Up%20Volumes/](https://docs.gluster.org/en/latest/Administrator%20Guide/Setting%20Up%20Volumes/)

1. 默认模式，既 DHT, 也叫分布卷: 将文件已 hash 算法随机分布到 一台服务器节点中存储。  
   命令格式：`gluster volume create test-volume server1:/exp1 server2:/exp2`
2. 复制模式，既 AFR, 创建 volume 时带 replica x 数量: 将文件复制到 replica x 个节点中，现在已经推荐 3 节点仲裁者复制模式，因为 2 节点可能产生脑裂。 命令格式：`gluster volume create test-volume replica 2 transport tcp server1:/exp1 server2:/exp2`  
   `gluster volume create test-volume replica 3 arbiter 1 transport tcp server1:/exp1 server2:/exp2 server3:/exp3`
3. 分布式复制模式，至少 4 节点。 命令格式：`gluster volume create test-volume replica 2 transport tcp server1:/exp1 server2:/exp2 server3:/exp3 server4:/exp4`
4. 分散模式，最少需要 3 节点  
   命令格式：`gluster volume create test-volume disperse 3 server{1..3}:/bricks/test-volume`
5. 分布式分散模式，创建一个分布式分散体积,分散关键字和<数量>是强制性的，指定的砖块在命令行中的数量必须是分散数的倍数  
   命令格式：`gluster volume create <volname> disperse 3 server1:/brick{1..6}`

```bash
gluster volume create k8s_volume 192.168.105.98:/data/glusterfs/dev/k8s_volume
gluster volume start k8s_volume
gluster volume status
gluster volume info
```

列一些 Glusterfs 调优：

```bash
# 开启 指定 volume 的配额
gluster volume quota k8s-volume enable
# 限制 指定 volume 的配额
gluster volume quota k8s-volume limit-usage / 1TB
# 设置 cache 大小, 默认32MB
gluster volume set k8s-volume performance.cache-size 4GB
# 设置 io 线程, 太大会导致进程崩溃
gluster volume set k8s-volume performance.io-thread-count 16
# 设置 网络检测时间, 默认42s
gluster volume set k8s-volume network.ping-timeout 10
# 设置 写缓冲区的大小, 默认1M
gluster volume set k8s-volume performance.write-behind-window-size 1024MB
```

## 3\. 客户端使用 GlusterFS

###3.1 物理机上使用 GlusterFS 的 volume

```bash
yum install -y centos-release-gluster
yum install -y glusterfs glusterfs-fuse fuse fuse-libs openib libibverbs
mkdir -p /tmp/test
mount -t glusterfs 192.168.105.98:k8s_volume/tmp/test  # 和NFS挂载用法类似
```

### 3.2 Kubernetes 使用 GlusterFS

> 以下操作在 kubernetes master 节点操作

#### 3.2.1 创建 GlusterFS 端点定义

`vim /etc/kubernetes/glusterfs/glusterfs-endpoints.json`

```json
{
  "kind": "Endpoints",
  "apiVersion": "v1",
  "metadata": {
    "name": "glusterfs-cluster"
  },
  "subsets": [
    {
      "addresses": [
        {
          "ip": "192.168.105.98"
        }
      ],
      "ports": [
        {
          "port": 1
        }
      ]
    },
    {
      "addresses": [
        {
          "ip": "192.168.105.97"
        }
      ],
      "ports": [
        {
          "port": 1
        }
      ]
    }
  ]
}
```

> 注意： 该 subsets 字段应填充 GlusterFS 集群中节点的地址。可以在 port 字段中提供任何有效值（从 1 到 65535）。

```bash
kubectl apply -f /etc/kubernetes/glusterfs/glusterfs-endpoints.json
kubectl get endpoints
```

```
NAME                ENDPOINTS                                                     AGE
glusterfs-cluster   192.168.105.97:1,192.168.105.98:1
```

#### 3.2.2 配置 service

我们还需要为这些端点创建服务，以便它们能够持久存在。我们将在没有选择器的情况下添加此服务，以告知 Kubernetes 我们想要手动添加其端点

`vim glusterfs-service.json`

```json
{
  "kind": "Service",
  "apiVersion": "v1",
  "metadata": {
    "name": "glusterfs-cluster"
  },
  "spec": {
    "ports": [{ "port": 1 }]
  }
}
```

```bash
kubectl apply -f glusterfs-service.json
```

#### 3.3.3 配置 PersistentVolume

创建 glusterfs-pv.yaml 文件，指定 storage 容量和读写属性

`vim glusterfs-pv.yaml`

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv001
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteMany
  glusterfs:
    endpoints: "glusterfs-cluster"
    path: "k8s_volume"
    readOnly: false
```

```bash
kubectl apply -f glusterfs-pv.yaml
kubectl get pv
```

```
NAME      CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM     STORAGECLASS   REASON    AGE
pv001     10Gi       RWX            Retain           Available                                      21s
```

#### 3.3.4 配置 PersistentVolumeClaim

创建`glusterfs-pvc.yaml`文件，指定请求资源大小

`vim glusterfs-pvc.yaml`

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv001
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteMany
  glusterfs:
    endpoints: "glusterfs-cluster"
    path: "k8s_volume"
    readOnly: false
```

```bash
kubectl apply -f glusterfs-pvc.yaml
kubectl get pvc
```

```
NAME      STATUS    VOLUME    CAPACITY   ACCESS MODES   STORAGECLASS   AGE
pvc001    Bound     zk001     10Gi       RWX                           44s
```

#### 3.3.5 部署应用挂载 pvc

以创建 nginx，把 pvc 挂载到容器内的`/usr/share/nginx/html`文件夹为例：

`vim glusterfs-nginx-deployment.yaml`

```yaml
apiVersion: apps/v1 # for versions before 1.9.0 use apps/v1beta2
kind: Deployment
metadata:
  name: nginx-dm
  namespace: default
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: 2 # tells deployment to run 2 pods matching the template
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx
          ports:
            - containerPort: 80
          volumeMounts:
            - name: storage001
              mountPath: "/usr/share/nginx/html"
      volumes:
        - name: storage001
          persistentVolumeClaim:
            claimName: pvc001
```

```bash
kubectl create -f nginx_deployment.yaml
# 查看部署是否成功
kubectl get pod|grep nginx-dm
```

```
nginx-dm-c8c895d96-hfdsz            1/1       Running   0          36s
nginx-dm-c8c895d96-jrfbx            1/1       Running   0          36s
```

验证结果：

```
# 查看挂载
[root@lab1 glusterfs]# kubectl exec -it nginx-dm-c8c895d96-5h649 -- df -h|grep nginx
192.168.105.97:k8s_volume 1000G   11G  990G   2% /usr/share/nginx/html
[root@lab1 glusterfs]# kubectl exec -it nginx-dm-c8c895d96-zf6ch -- df -h|grep nginx
192.168.105.97:k8s_volume 1000G   11G  990G   2% /usr/share/nginx/html
[root@lab1 glusterfs]# kubectl exec -it nginx-dm-c8c895d96-5h649 -- touch /usr/share/nginx/html/ygqygq2
[root@lab1 glusterfs]# kubectl exec -it nginx-dm-c8c895d96-5h649 -- ls -lt /usr/share/nginx/html/
total 1
-rw-r--r--. 1 root root 4 Aug 13 09:43 ygqygq2
-rw-r--r--. 1 root root 5 Aug 13 09:34 ygqygq2.txt
[root@lab1 glusterfs]# kubectl exec -it nginx-dm-c8c895d96-zf6ch -- ls -lt /usr/share/nginx/html/
total 1
-rw-r--r--. 1 root root 4 Aug 13 09:43 ygqygq2
-rw-r--r--. 1 root root 5 Aug 13 09:34 ygqygq2.txt
```

至此部署完成。

## 4\. 小结

此文 GlusterFS 是安装在物理系统下，而非 kubernetes 中，所有需要手工维护，下次介绍在 kubernetes 中安装使用 gluster。GlusterFS 的 volume 模式根据业务灵活应用。需要注意的是，如果使用分布卷，pod 中的挂载目录文件可能存在卷的任一节点中，可能并非直接`df -h`看到的那个节点中。

参数资料： \[1\] https://kubernetes.io/docs/concepts/storage/persistent-volumes/ \[2\] https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/ \[3\] https://www.kubernetes.org.cn/4069.html \[4\] https://www.gluster.org/ \[5\] https://blog.csdn.net/hxpjava1/article/details/79817078 \[6\] https://docs.gluster.org/en/latest/Administrator%20Guide/Setting%20Up%20Volumes/ \[7\] https://docs.gluster.org/en/latest/Administrator%20Guide/Setting%20Up%20Clients/ \[8\] https://github.com/kubernetes/examples/blob/master/staging/volumes/glusterfs/README.md
