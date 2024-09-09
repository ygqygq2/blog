---
title: "kubeadm安装的Kubernetes etcd备份恢复"
date: "2018-09-18"
categories:
  - "database"
  - "system-operations"
  - "cloudcomputing-container"
tags:
  - "etcd"
  - "kubeadm"
  - "kubernetes"
---

# kubeadm 安装的 Kubernetes etcd 备份恢复

[TOC]

## 1\. 事件由来

2018 年 9 月 16 日台风过后，我的一套 kuernetes 测试系统，etcd 启动失败，经过半天的抢救，仍然无果（3 台 master 都是如下错误）。无奈再花半天时间把环境重新弄了起来。即使是 etcd 集群，备份也是必须的，因为数据没了，就都没了。好在问题出现得早，要是正式生产出现这种情况，估计要卷铺盖走人了。因此，研究下 kubernetes 备份。

```
2018-09-17 00:11:55.781279 I | etcdmain: etcd Version: 3.2.18
2018-09-17 00:11:55.781457 I | etcdmain: Git SHA: eddf599c6
2018-09-17 00:11:55.781477 I | etcdmain: Go Version: go1.8.7
2018-09-17 00:11:55.781503 I | etcdmain: Go OS/Arch: linux/amd64
2018-09-17 00:11:55.781519 I | etcdmain: setting maximum number of CPUs to 32, total number of available CPUs is 32
2018-09-17 00:11:55.781634 N | etcdmain: the server is already initialized as member before, starting as etcd member...
2018-09-17 00:11:55.781702 I | embed: peerTLS: cert = /etc/kubernetes/pki/etcd/peer.crt, key = /etc/kubernetes/pki/etcd/peer.key, ca = , trusted-ca = /etc/kubernetes/pki/etcd/ca.crt, client-cert-auth = true
2018-09-17 00:11:55.783073 I | embed: listening for peers on https://192.168.105.92:2380
2018-09-17 00:11:55.783182 I | embed: listening for client requests on 127.0.0.1:2379
2018-09-17 00:11:55.783281 I | embed: listening for client requests on 192.168.105.92:2379
2018-09-17 00:11:55.791474 I | etcdserver: recovered store from snapshot at index 16471696
2018-09-17 00:11:55.792633 I | mvcc: restore compact to 13683366
2018-09-17 00:11:55.849153 C | mvcc: store.keyindex: put with unexpected smaller revision [{13685569 0} / {13685569 0}]
panic: store.keyindex: put with unexpected smaller revision [{13685569 0} / {13685569 0}]

goroutine 89 [running]:
github.com/coreos/etcd/cmd/vendor/github.com/coreos/pkg/capnslog.(*PackageLogger).Panicf(0xc42018c160, 0xfa564e, 0x3e, 0xc420062cb0, 0x2, 0x2)
/tmp/etcd/release/etcd/gopath/src/github.com/coreos/etcd/cmd/vendor/github.com/coreos/pkg/capnslog/pkg_logger.go:75 +0x15c
github.com/coreos/etcd/cmd/vendor/github.com/coreos/etcd/mvcc.(*keyIndex).put(0xc4207fd7c0, 0xd0d341, 0x0)
/tmp/etcd/release/etcd/gopath/src/github.com/coreos/etcd/cmd/vendor/github.com/coreos/etcd/mvcc/key_index.go:80 +0x3ec
github.com/coreos/etcd/cmd/vendor/github.com/coreos/etcd/mvcc.restoreIntoIndex.func1(0xc42029e460, 0xc4202a0600, 0x14bef40, 0xc420285640)
/tmp/etcd/release/etcd/gopath/src/github.com/coreos/etcd/cmd/vendor/github.com/coreos/etcd/mvcc/kvstore.go:367 +0x3e3
created by github.com/coreos/etcd/cmd/vendor/github.com/coreos/etcd/mvcc.restoreIntoIndex
/tmp/etcd/release/etcd/gopath/src/github.com/coreos/etcd/cmd/vendor/github.com/coreos/etcd/mvcc/kvstore.go:374 +0xa5
```

## 2\. 环境说明

kubeadm 安装的 kubernetes1.11

## 3\. etcd 集群查看

```bash
# 列出成员
etcdctl --endpoints=https://192.168.105.92:2379,https://192.168.105.93:2379,https://192.168.105.94:2379 --cert-file=/etc/kubernetes/pki/etcd/server.crt  --key-file=/etc/kubernetes/pki/etcd/server.key --ca-file=/etc/kubernetes/pki/etcd/ca.crt member list
# 列出kubernetes数据
export ETCDCTL_API=3
etcdctl get / --prefix --keys-only --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key --cacert=/etc/kubernetes/pki/etcd/ca.crt
```

## 4\. etcd 数据备份

- 备份 `/etc/kubernetes/` 目录下的所有文件(证书，manifest 文件)
- `/var/lib/kubelet/` 目录下所有文件(plugins 容器连接认证)
- etcd V3 版 api 数据

将脚本添加到计划任务，每日备份。

```bash
#!/usr/bin/env bash
##############################################################
# File Name: ut_backup_k8s.sh
# Version: V1.0
# Author: Chinge_Yang
# Blog: http://blog.csdn.net/ygqygq2
# Created Time : 2018-09-18 09:13:55
# Description:
##############################################################

#获取脚本所存放目录
cd `dirname $0`
bash_path=`pwd`

#脚本名
me=$(basename $0)
# delete dir and keep days
delete_dirs=("/data/backup/kubernetes:7")
backup_dir=/data/backup/kubernetes
files_dir=("/etc/kubernetes" "/var/lib/kubelet")
log_dir=$backup_dir/log
shell_log=$log_dir/${USER}_${me}.log
ssh_port="22"
ssh_parameters="-o StrictHostKeyChecking=no -o ConnectTimeout=60"
ssh_command="ssh ${ssh_parameters} -p ${ssh_port}"
scp_command="scp ${ssh_parameters} -P ${ssh_port}"
DATE=$(date +%F)
BACK_SERVER="127.0.0.1"  # 远程备份服务器IP
BACK_SERVER_BASE_DIR="/data/backup"
BACK_SERVER_DIR="$BACK_SERVER_BASE_DIR/kubernetes/${HOSTNAME}"  # 远程备份服务器目录
BACK_SERVER_LOG_DIR="$BACK_SERVER_BASE_DIR/kubernetes/logs"

#定义保存日志函数
function save_log () {
    echo -e "`date +%F\ %T` $*" >> $shell_log
}

save_log "start backup mysql"

[ ! -d $log_dir ] && mkdir -p $log_dir

#定义输出颜色函数
function red_echo () {
#用法:  red_echo "内容"
    local what=$*
    echo -e "\e[1;31m ${what} \e[0m"
}

function green_echo () {
#用法:  green_echo "内容"
    local what=$*
    echo -e "\e[1;32m ${what} \e[0m"
}

function yellow_echo () {
#用法:  yellow_echo "内容"
    local what=$*
    echo -e "\e[1;33m ${what} \e[0m"
}

function twinkle_echo () {
#用法:  twinkle_echo $(red_echo "内容")  ,此处例子为红色闪烁输出
    local twinkle='\e[05m'
    local what="${twinkle} $*"
    echo -e "${what}"
}

function return_echo () {
    [ $? -eq 0 ] && green_echo "$* 成功" || red_echo "$* 失败"
}

function return_error_exit () {
    [ $? -eq 0 ] && REVAL="0"
    local what=$*
    if [ "$REVAL" = "0" ];then
        [ ! -z "$what" ] && green_echo "$what 成功"
    else
        red_echo "$* 失败，脚本退出"
        exit 1
    fi
}

#定义确认函数
function user_verify_function () {
    while true;do
        echo ""
        read -p "是否确认?[Y/N]:" Y
        case $Y in
    [yY]|[yY][eE][sS])
        echo -e "answer:  \\033[20G [ \e[1;32m是\e[0m ] \033[0m"
        break
        ;;
    [nN]|[nN][oO])
        echo -e "answer:  \\033[20G [ \e[1;32m否\e[0m ] \033[0m"
        exit 1
        ;;
      *)
        continue
        ;;
        esac
    done
}

#定义跳过函数
function user_pass_function () {
    while true;do
        echo ""
        read -p "是否确认?[Y/N]:" Y
        case $Y in
            [yY]|[yY][eE][sS])
            echo -e "answer:  \\033[20G [ \e[1;32m是\e[0m ] \033[0m"
            break
            ;;
            [nN]|[nN][oO])
            echo -e "answer:  \\033[20G [ \e[1;32m否\e[0m ] \033[0m"
            return 1
            ;;
            *)
            continue
            ;;
            esac
    done
}

function backup () {
    for f_d in ${files_dir[@]}; do
        f_name=$(basename ${f_d})
        d_name=$(dirname $f_d)
        cd $d_name
        tar -cjf ${f_name}.tar.bz $f_name
        if [ $? -eq 0 ]; then
            file_size=$(du ${f_name}.tar.bz|awk '{print $1}')
            save_log "$file_size ${f_name}.tar.bz"
            save_log "finish tar ${f_name}.tar.bz"
        else
            file_size=0
            save_log "failed tar ${f_name}.tar.bz"
        fi
        rsync -avzP ${f_name}.tar.bz  $backup_dir/$(date +%F)-${f_name}.tar.bz
        rm -f ${f_name}.tar.bz
    done

    export ETCDCTL_API=3
    etcdctl --cert=/etc/kubernetes/pki/etcd/server.crt \
        --key=/etc/kubernetes/pki/etcd/server.key \
        --cacert=/etc/kubernetes/pki/etcd/ca.crt \
        snapshot save $backup_dir/$(date +%F)-k8s-snapshot.db
    cd $backup_dir
    tar -cjf $(date +%F)-k8s-snapshot.tar.bz $(date +%F)-k8s-snapshot.db
    if [ $? -eq 0 ]; then
        file_size=$(du $(date +%F)-k8s-snapshot.tar.bz|awk '{print $1}')
        save_log "$file_size ${f_name}.tar.bz"
        save_log "finish tar ${f_name}.tar.bz"
    else
        file_size=0
        save_log "failed tar ${f_name}.tar.bz"
    fi
    rm -f $(date +%F)-k8s-snapshot.db
}

function rsync_backup_files () {
    # 传输日志文件
    #传输到远程服务器备份, 需要配置免密ssh认证
    $ssh_command root@${BACK_SERVER} "mkdir -p ${BACK_SERVER_DIR}/${DATE}/"
    rsync -avz --bwlimit=5000 -e "${ssh_command}" $backup_dir/*.bz \
    root@${BACK_SERVER}:${BACK_SERVER_DIR}/${DATE}/
    [ $? -eq 0 ] && save_log "success rsync" || \
      save_log "failed rsync"
}

function delete_old_files () {
    for delete_dir_keep_days in ${delete_dirs[@]}; do
        delete_dir=$(echo $delete_dir_keep_days|awk -F':' '{print $1}')
        keep_days=$(echo $delete_dir_keep_days|awk -F':' '{print $2}')
        [ -n "$delete_dir" ] && cd ${delete_dir}
        [ $? -eq 0 ] && find -L ${delete_dir} -mindepth 1 -mtime +$keep_days -exec rm -rf {} \;
    done
}

backup
delete_old_files
#rsync_backup_files

save_log "finish $0\n"

exit 0
```

## 5\. etcd 数据恢复

> **注意** 数据恢复操作，会停止全部应用状态和访问！！！

首先需要分别停掉三台 Master 机器的 kube-apiserver，确保 kube-apiserver 已经停止了。

```bash
mv /etc/kubernetes/manifests /etc/kubernetes/manifests.bak
docker ps|grep k8s_  # 查看etcd、api是否up，等待全部停止
mv /var/lib/etcd /var/lib/etcd.bak
```

etcd 集群用同一份 snapshot 恢复。

```
# 准备恢复文件
cd /tmp
tar -jxvf /data/backup/kubernetes/2018-09-18-k8s-snapshot.tar.bz
rsync -avz 2018-09-18-k8s-snapshot.db 192.168.105.93:/tmp/
rsync -avz 2018-09-18-k8s-snapshot.db 192.168.105.94:/tmp/
```

在 lab1 上执行：

```bash
cd /tmp/
export ETCDCTL_API=3
etcdctl snapshot restore 2018-09-18-k8s-snapshot.db \
    --endpoints=192.168.105.92:2379 \
    --name=lab1 \
    --cert=/etc/kubernetes/pki/etcd/server.crt \
    --key=/etc/kubernetes/pki/etcd/server.key \
    --cacert=/etc/kubernetes/pki/etcd/ca.crt \
    --initial-advertise-peer-urls=https://192.168.105.92:2380 \
    --initial-cluster-token=etcd-cluster-0 \
    --initial-cluster=lab1=https://192.168.105.92:2380,lab2=https://192.168.105.93:2380,lab3=https://192.168.105.94:2380 \
    --data-dir=/var/lib/etcd
```

在 lab2 上执行：

```bash
cd /tmp/
export ETCDCTL_API=3
etcdctl snapshot restore 2018-09-18-k8s-snapshot.db \
    --endpoints=192.168.105.93:2379 \
    --name=lab2 \
    --cert=/etc/kubernetes/pki/etcd/server.crt \
    --key=/etc/kubernetes/pki/etcd/server.key \
    --cacert=/etc/kubernetes/pki/etcd/ca.crt \
    --initial-advertise-peer-urls=https://192.168.105.93:2380 \
    --initial-cluster-token=etcd-cluster-0 \
    --initial-cluster=lab1=https://192.168.105.92:2380,lab2=https://192.168.105.93:2380,lab3=https://192.168.105.94:2380 \
    --data-dir=/var/lib/etcd
```

在 lab3 上执行：

```bash
cd /tmp/
export ETCDCTL_API=3
etcdctl snapshot restore 2018-09-18-k8s-snapshot.db \
    --endpoints=192.168.105.94:2379 \
    --name=lab3 \
    --cert=/etc/kubernetes/pki/etcd/server.crt \
    --key=/etc/kubernetes/pki/etcd/server.key \
    --cacert=/etc/kubernetes/pki/etcd/ca.crt \
    --initial-advertise-peer-urls=https://192.168.105.94:2380 \
    --initial-cluster-token=etcd-cluster-0 \
    --initial-cluster=lab1=https://192.168.105.92:2380,lab2=https://192.168.105.93:2380,lab3=https://192.168.105.94:2380 \
    --data-dir=/var/lib/etcd
```

全部恢复完成后，三台 Master 机器恢复 manifests。

```bash
mv /etc/kubernetes/manifests.bak /etc/kubernetes/manifests
```

最后确认：

```
# 再次查看key
[root@lab1 kubernetes]# etcdctl get / --prefix --keys-only --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key --cacert=/etc/kubernetes/pki/etcd/ca.crt
registry/apiextensions.k8s.io/customresourcedefinitions/apprepositories.kubeapps.com

/registry/apiregistration.k8s.io/apiservices/v1.

/registry/apiregistration.k8s.io/apiservices/v1.apps

/registry/apiregistration.k8s.io/apiservices/v1.authentication.k8s.io

           ........此处省略..........
[root@lab1 kubernetes]# kubectl get pod -n kube-system
NAME                                              READY     STATUS    RESTARTS   AGE
coredns-777d78ff6f-m5chm                          1/1       Running   1          18h
coredns-777d78ff6f-xm7q8                          1/1       Running   1          18h
dashboard-kubernetes-dashboard-7cfc6c7bf5-hr96q   1/1       Running   0          13h
dashboard-kubernetes-dashboard-7cfc6c7bf5-x9p7j   1/1       Running   0          13h
etcd-lab1                                         1/1       Running   0          18h
etcd-lab2                                         1/1       Running   0          1m
etcd-lab3                                         1/1       Running   0          18h
kube-apiserver-lab1                               1/1       Running   0          18h
kube-apiserver-lab2                               1/1       Running   0          1m
kube-apiserver-lab3                               1/1       Running   0          18h
kube-controller-manager-lab1                      1/1       Running   0          18h
kube-controller-manager-lab2                      1/1       Running   0          1m
kube-controller-manager-lab3                      1/1       Running   0          18h
kube-flannel-ds-7w6rl                             1/1       Running   2          18h
kube-flannel-ds-b9pkf                             1/1       Running   2          18h
kube-flannel-ds-fck8t                             1/1       Running   1          18h
kube-flannel-ds-kklxs                             1/1       Running   1          18h
kube-flannel-ds-lxxx9                             1/1       Running   2          18h
kube-flannel-ds-q7lpg                             1/1       Running   1          18h
kube-flannel-ds-tlqqn                             1/1       Running   1          18h
kube-proxy-85j7g                                  1/1       Running   1          18h
kube-proxy-gdvkk                                  1/1       Running   1          18h
kube-proxy-jw5gh                                  1/1       Running   1          18h
kube-proxy-pgfxf                                  1/1       Running   1          18h
kube-proxy-qx62g                                  1/1       Running   1          18h
kube-proxy-rlbdb                                  1/1       Running   1          18h
kube-proxy-whhcv                                  1/1       Running   1          18h
kube-scheduler-lab1                               1/1       Running   0          18h
kube-scheduler-lab2                               1/1       Running   0          1m
kube-scheduler-lab3                               1/1       Running   0          18h
kubernetes-dashboard-754f4d5f69-7npk5             1/1       Running   0          13h
kubernetes-dashboard-754f4d5f69-whtg9             1/1       Running   0          13h
tiller-deploy-98f7f7564-59hcs                     1/1       Running   0          13h
```

进相应的安装程序确认，数据全部正常。

## 6\. 小结

不管是二进制还是 kubeadm 安装的 Kubernetes，其备份主要是通过 etcd 的备份完成的。而恢复时，主要考虑的是整个顺序：停止 kube-apiserver，停止 etcd，恢复数据，启动 etcd，启动 kube-apiserver。

参考资料： \[1\] https://yq.aliyun.com/articles/561894
