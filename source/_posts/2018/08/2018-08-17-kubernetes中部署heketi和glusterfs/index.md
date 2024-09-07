---
title: "Kubernetes中部署Heketi和GlusterFS"
date: "2018-08-17"
categories: 
  - "system-operations"
  - "cloudcomputing-container"
tags: 
  - "glusterfs"
  - "kubernetes"
---

# Kubernetes中部署Heketi和GlusterFS

\[TOC\]

## 1\. 前言

在Kubernetes中，使用GlusterFS文件系统，操作步骤通常是：  
**创建brick-->创建volume-->创建PV-->创建PVC-->Pod挂载PVC**  
如果要创建多个PV，则需要手动重复执行这些繁锁步骤，Heketi可以解决这些重复问题。  
Heketi是用来管理GlusterFS卷的生命周期的，并提供了一个RESTful API接口供Kubernetes调用，因为GlusterFS没有提供API调用的方式，所以我们借助heketi，通过Heketi，Kubernetes可以动态配置GlusterFS卷，Heketi会动态在集群内选择bricks创建所需的volumes，确保数据的副本会分散到集群不同的故障域内，同时Heketi还支持GlusterFS多集群管理，便于管理员对GlusterFS进行操作。  
Heketi要求在每个glusterfs节点上配备裸磁盘，因为Heketi要用来创建PV和VG，如果有了Heketi，则可以通过StorageClass来创建PV，步骤仅有：  
**创建StorageClass-->创建PVC-->Pod挂载PVC**  
这种方式称为基于StorageClass的动态资源供应，虽然只有简单的两步，但是它所干活的活一点也不比上述中步骤少，只不过大部分工作都由Heketi在背后帮我们完成了。

## 2\. 环境说明

```
# k8s 
192.168.105.92 lab1  # master1
192.168.105.93 lab2  # master2
192.168.105.94 lab3  # master3
192.168.105.95 lab4  # node4
192.168.105.96 lab5  # node5
192.168.105.97 lab6  # node6
192.168.105.98 lab7  # node7
```

## 3\. gluster-kubernetes部署

给需要部署GlusterFS节点的Node打上标签

```
[root@lab1 glusterfs]# kubectl label node lab4 storagenode=glusterfs 
node/lab4 labeled
[root@lab1 glusterfs]# kubectl label node lab5 storagenode=glusterfs 
node/lab5 labeled
[root@lab1 glusterfs]# kubectl label node lab7 storagenode=glusterfs
node/lab7 labeled
```

准备部署文件

```bash
git clone https://github.com/gluster/gluster-kubernetes.git
cd gluster-kubernetes/deploy
mv topology.json.sample topology.json
```

修改配置`topology.json`

```json
{
  "clusters": [
    {
      "nodes": [
        {
          "node": {
            "hostnames": {
              "manage": [
                "lab4"
              ],
              "storage": [
                "192.168.105.95"
              ]
            },
            "zone": 1
          },
          "devices": [
            "/dev/sdb"
          ]
        },
        {
          "node": {
            "hostnames": {
              "manage": [
                "lab5"
              ],
              "storage": [
                "192.168.105.96"
              ]
            },
            "zone": 1
          },
          "devices": [
            "/dev/sdb"
          ]
        },
        {
          "node": {
            "hostnames": {
              "manage": [
                "lab7"
              ],
              "storage": [
                "192.168.105.98"
              ]
            },
            "zone": 1
          },
          "devices": [
            "/dev/sdb"
          ]
        }
      ]
    }
  ]
}
```

`topology-sample.json`文件，称为拓朴文件，它提供了运行gluster Pod的kubernetes节点IP，每个节点上相应的磁盘块设备，修改hostnames/manage，设置为与kubectl get nodes所显示的Name字段的值，通常为Node IP，修改hostnames/storage下的IP，为存储网络的IP地址，也即Node IP。

集群部署成功后修改配置，需要再次加载，使用如下命令：  
`/usr/bin/kubectl -n default exec -i $(kubectl get pod|grep heketi|awk '{print $1}') -- heketi-cli -s http://localhost:8080 --user admin --secret '' topology load --json=/etc/heketi/topology.json`

执行了`heketi-cli topology load`之后，Heketi到底在服务器上做了什么呢？  
进入任意glusterfs Pod内，执行`gluster peer status`发现都已把对端加入到了可信存储池(TSP)中。  
在运行了gluster Pod的节点上，自动创建了一个VG，此VG正是由`topology.json`文件中的磁盘裸设备创建而来。 一块磁盘设备创建出一个VG，以后创建的PVC，即从此VG里划分的LV。  
heketi-cli topology info 查看拓扑结构，显示出每个磁盘设备的ID，对应VG的ID，总空间、已用空间、空余空间等信息。 可以通过Heketi Pod 日志查看到。

执行部署

```bash
./gk-deploy -g
# bash -x ./gk-deploy -g  # 调试运行过程
```

> 注意： \* 上文json中的磁盘是没有新建vg、pv的。  
> \* 部署失败使用`./gk-deploy -g --abort`删除pod，再将节点的目录`/var/lib/glusterd`清空，删除磁盘的vg和pv  
> \* 在`gk-deploy`我修改了`create -f`成`apply -f`，避免secret不更新，适当在确认无误但又影响脚本运行的地方注释`exit`，比如`Error: Volume heketidbstorage alreay exists`

**问题** [https://github.com/gluster/gluster-kubernetes/issues/507](https://github.com/gluster/gluster-kubernetes/issues/507)：

```
MountVolume.SetUp failed for volume "heketi-storage" : mount failed: mount failed: exit status 32 Mounting command: systemd-run Mounting arguments: --description=Kubernetes transient mount for /var/lib/kubelet/pods/e2531fbe-a133-11e8-b55d-000c2931d938/volumes/kubernetes.io~glusterfs/heketi-storage --scope -- mount -t glusterfs -o log-file=/var/lib/kubelet/plugins/kubernetes.io/glusterfs/heketi-storage/heketi-storage-copy-job-ptnx4-glusterfs.log,backup-volfile-servers=192.168.105.95:192.168.105.96:192.168.105.98,log-level=ERROR 192.168.105.95:heketidbstorage /var/lib/kubelet/pods/e2531fbe-a133-11e8-b55d-000c2931d938/volumes/kubernetes.io~glusterfs/heketi-storage Output: Running scope as unit run-53418.scope. mount: unknown filesystem type 'glusterfs' the following error information was pulled from the glusterfs log to help diagnose this issue: could not open log file for pod heketi-storage-copy-job-ptnx4
```

上面提示挂载失败，其实是需要在运行的`deploy-heketi`节点上安装`yum -y install glusterfs-fuse`。

全部部署成功后：

```
[root@lab1 deploy]# kubectl get pod
NAME                                READY     STATUS    RESTARTS   AGE
curl-87b54756-wzm66                 1/1       Running   0          17h
glusterfs-9xj2r                     1/1       Running   0          15h
glusterfs-kbqpc                     1/1       Running   1          15h
glusterfs-wwg5w                     1/1       Running   0          15h
heketi-86f98754c-dvqpk              1/1       Running   0          38s
nginx-deployment-7f46fc97b9-hn8g7   1/1       Running   0          14h
nginx-deployment-7f46fc97b9-t82fv   1/1       Running   0          17h
[root@lab1 deploy]# kubectl  exec -it heketi-86f98754c-dvqpk -- df |grep heketidb
192.168.105.95:heketidbstorage   2086912   54280   2032632   3% /var/lib/heketi
```

```
export HEKETI_CLI_SERVER=$(kubectl get svc/deploy-heketi --template 'http://{{.spec.clusterIP}}:{{(index .spec.ports 0).port}}')
curl $HEKETI_CLI_SERVER/hello
```

返回如下则正常：

```
Hello from Heketi
```

参考资料： \[1\] http://blog.51cto.com/newfly/2134514  
\[2\] http://blog.51cto.com/newfly/2139393  
\[3\] https://github.com/gluster/gluster-kubernetes  
\[4\] https://github.com/gluster/gluster-kubernetes/blob/master/docs/examples/hello\_world/README.md
