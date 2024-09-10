---
title: "Kubernetes使用Ceph静态卷部署应用"
date: "2018-08-23"
categories:
  - "system-operations"
  - "cloudcomputing-container"
tags:
  - "ceph"
  - "kubernetes"
---

# Kubernetes 使用 Ceph 静态卷部署应用

[TOC]

## 1\. kubernetes 中的存储方案

对于有状态服务，存储是一个至关重要的问题。k8s 提供了非常丰富的组件来支持存储，这里大致列一下：

- volume: 就是直接挂载在 pod 上的组件，k8s 中所有的其他存储组件都是通过 volume 来跟 pod 直接联系的。volume 有个 type 属性，type 决定了挂载的存储是什么，常见的比如：emptyDir，hostPath，nfs，rbd，以及下文要说的 persistentVolumeClaim 等。跟 docker 里面的 volume 概念不同的是，docker 里的 volume 的生命周期是跟 docker 紧紧绑在一起的。这里根据 type 的不同，生命周期也不同，比如 emptyDir 类型的就是跟 docker 一样，pod 挂掉，对应的 volume 也就消失了，而其他类型的都是永久存储。详细介绍可以参考[Volumes](https://kubernetes.io/docs/concepts/storage/volumes/)
- Persistent Volumes：顾名思义，这个组件就是用来支持永久存储的，Persistent Volumes 组件会抽象后端存储的提供者（也就是上文中 volume 中的 type）和消费者（即具体哪个 pod 使用）。该组件提供了 PersistentVolume 和 PersistentVolumeClaim 两个概念来抽象上述两者。一个 PersistentVolume（简称 PV）就是后端存储提供的一块存储空间，具体到 ceph rbd 中就是一个 image，一个 PersistentVolumeClaim（简称 PVC）可以看做是用户对 PV 的请求，PVC 会跟某个 PV 绑定，然后某个具体 pod 会在 volume 中挂载 PVC,就挂载了对应的 PV。关于更多详细信息比如 PV,PVC 的生命周期，dockerfile 格式等信息参考[Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
- Dynamic Volume Provisioning: 动态 volume 发现，比如上面的 Persistent Volumes,我们必须先要创建一个存储块，比如一个 ceph 中的 image，然后将该 image 绑定 PV，才能使用。这种静态的绑定模式太僵硬，每次申请存储都要向存储提供者索要一份存储快。Dynamic Volume Provisioning 就是解决这个问题的。它引入了 StorageClass 这个概念，StorageClass 抽象了存储提供者，只需在 PVC 中指定 StorageClass，然后说明要多大的存储就可以了，存储提供者会根据需求动态创建所需存储快。甚至于，我们可以指定一个默认 StorageClass，这样，只需创建 PVC 就可以了。

## 2\. 环境准备

可用的 kubernetes 可用的 Ceph 集群 Ceph monitor 节点：lab1、lab2、lab3

```
# k8s
192.168.105.92 lab1 # master1
192.168.105.93 lab2 # master2
192.168.105.94 lab3 # master3
192.168.105.95 lab4 # node4
192.168.105.96 lab5 # node5
192.168.105.97 lab6 # node6
192.168.105.98 lab7 # node7
```

在每个 k8s node 中安装`yum install -y ceph-common`

## 3\. CephFS 方式部署容器

### 3.1 创建 Ceph admin secret

```bash
ceph auth get-key client.admin > /tmp/secret
kubectl create namespace cephfs
kubectl create secret generic ceph-admin-secret --from-file=/tmp/secret
```

### 3.2 创建 pv

`vim cephfs-pv.yaml`

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: cephfs-pv1
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteMany
  cephfs:
    monitors:
      - 192.168.105.92:6789
      - 192.168.105.93:6789
      - 192.168.105.94:6789
    user: admin
    secretRef:
      name: ceph-admin-secret
    readOnly: false
  persistentVolumeReclaimPolicy: Recycle
```

### 3.3 创建 pvc

`vim cephfs-pvc.yaml`

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: cephfs-pv-claim1
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
```

### 3.4 部署验证

`vim cephfs-nginx.yaml`

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx-cephfs
spec:
  replicas: 1
  template:
    metadata:
      labels:
        name: nginx
    spec:
      containers:
        - name: nginx
          image: nginx
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
          volumeMounts:
            - name: ceph-cephfs-volume
              mountPath: "/usr/share/nginx/html"
      volumes:
        - name: ceph-cephfs-volume
          persistentVolumeClaim:
            claimName: cephfs-pv-claim1
```

```bash
kubectl create -f cephfs-pv.yaml
kubectl create -f cephfs-pvc.yaml
kubectl create -f cephfs-nginx.yaml
```

验证结果：

```
[root@lab1 cephfs]# kubectl get pv
NAME         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                      STORAGECLASS   REASON    AGE
cephfs-pv1   1Gi        RWX            Recycle          Bound     default/cephfs-pv-claim1                            1h
[root@lab1 cephfs]# kubectl get pvc
NAME               STATUS    VOLUME       CAPACITY   ACCESS MODES   STORAGECLASS   AGE
cephfs-pv-claim1   Bound     cephfs-pv1   1Gi        RWX                           1h
test-pvc           Bound     test-pv      1Gi        RWO                           32m
[root@lab1 cephfs]# kubectl get pod |grep nginx-cephfs
nginx-cephfs-7777495b9b-29vtw       1/1       Running             0          13m
[root@lab1 cephfs]# kubectl exec -it nginx-cephfs-7777495b9b-29vtw -- df -h|grep nginx
192.168.105.92:6789:/  1.6T  4.1G  1.6T   1% /usr/share/nginx/html
```

## 4\. RBD 方式部署容器

### 4.1 创建 Ceph admin secret

```bash
ceph auth get-key client.admin > /tmp/secret
kubectl create namespace cephfs
kubectl create secret generic ceph-admin-secret --from-file=/tmp/secret
```

### 4.2 创建 Ceph pool 和 Image

```bash
ceph osd pool create kube 128 128
rbd create kube/foo -s 10G --image-feature layering
```

### 4.3 创建 pv

`vim rbd-pv.yaml`

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: rbd-pv1
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  rbd:
    monitors:
      - 192.168.105.92:6789
      - 192.168.105.93:6789
      - 192.168.105.94:6789
    pool: kube
    image: foo
    user: admin
    secretRef:
      name: ceph-secret
  persistentVolumeReclaimPolicy: Recycle
```

### 4.4 创建 pvc

`vim rbd-pvc.yaml`

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: rbd-pv-claim1
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

### 4.5 部署验证

`vim rbd-nginx.yaml`

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx-rbd
spec:
  replicas: 1
  template:
    metadata:
      labels:
        name: nginx
    spec:
      containers:
        - name: nginx
          image: nginx
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
          volumeMounts:
            - name: ceph-rbd-volume
              mountPath: "/usr/share/nginx/html"
      volumes:
        - name: ceph-rbd-volume
          persistentVolumeClaim:
            claimName: rbd-pv-claim1
```

```bash
kubectl create -f rbd-pv.yaml
kubectl create -f rbd-pvc.yaml
kubectl create -f rbd-nginx.yaml
```

验证结果：

```
[root@lab1 rbd]# kubectl get pv
NAME         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                      STORAGECLASS   REASON    AGE
cephfs-pv1   1Gi        RWX            Recycle          Bound     default/cephfs-pv-claim1                            2h
rbd-pv1      5Gi        RWO            Recycle          Bound     default/rbd-pv-claim1                               8m
[root@lab1 rbd]# kubectl get pvc
NAME               STATUS    VOLUME       CAPACITY   ACCESS MODES   STORAGECLASS   AGE
cephfs-pv-claim1   Bound     cephfs-pv1   1Gi        RWX                           2h
claim2             Pending                                          rbd            2h
claim3             Pending                                          rbd            2h
rbd-pv-claim1      Bound     rbd-pv1      5Gi        RWO                           8m
[root@lab1 rbd]# kubectl exec -it nginx-rbd-6b555f58c9-7k2k9 -- df -h|grep nginx
/dev/rbd0            9.8G   37M  9.7G   1% /usr/share/nginx/html
```

进入容器使用`dd`测试，发现容器容易挂。而且经过验证，容器挂载的目录大小取决于**rbd image**的大小 `dd if=/dev/zero of=/usr/share/nginx/html/test.data bs=1G count=8 &`

```
root@nginx-rbd-6b555f58c9-7k2k9:/usr/share/nginx/html# error: Internal error occurred: error executing command in container: Error response from daemon: Container 12f9c29c03082d27c7ed4327536626189d02be451029f7385765d3c2e1451062 is not running: Exited (0) Less than a second ago
```

参考资料： \[1\] https://kubernetes.io/docs/concepts/storage/volumes/ \[2\] https://kubernetes.io/docs/concepts/storage/persistent-volumes/ \[3\] https://zhangchenchen.github.io/2017/11/17/kubernetes-integrate-with-ceph/
