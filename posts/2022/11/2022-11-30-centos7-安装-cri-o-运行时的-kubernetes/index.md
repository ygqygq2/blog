---
title: "CentOS7 安装 cri-o 运行时的 Kubernetes"
date: "2022-11-30"
categories: 
  - "cloudcomputing-container"
tags: 
  - "centos"
  - "cri-o"
  - "kubernetes"
---

# 1\. 环境

系统：`CentOS Linux release 7.7.1908 (Core)` Kubernetes: `1.25.4` Cri-o: `1.25`

# 2\. 安装 crio

根据官方文档：

```bash
curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable.repo https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/CentOS_7/devel:kubic:libcontainers:stable.repo
curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable:cri-o:1.25.repo https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable:/cri-o:/1.25/CentOS_7/devel:kubic:libcontainers:stable:cri-o:1.25.repo
yum -y install cri-o
```

其它注意修改 `/etc/crio/crio.conf` 中的 `pause_image`，可使用 `"ygqygq2/pause:3.8"`。

# 3\. 安装 Kubernetes

此步略：（可使用或参考[一键安装k8s脚本](https://github.com/ygqygq2/kubeadm-shell)），脚本已解决 4 中的问题。

# 4\. 无法运行容器

如果没有更新 runc，可能报如下类似错误：

```
Nov 28 18:48:36 master1 kubelet: E1128 18:48:36.921976    5567 pod_workers.go:965] "Error syncing pod, skipping" err="failed to \"StartContainer\" for \"kube-scheduler\" with CreateContainerError: \"container create failed: time=\\\"2022-11-28T18:48:36+08:00\\\" level=error msg=\\\"container_linux.go:349: starting container process caused \\\\\\\"error adding seccomp filter rule for syscall bdflush: requested action matches default action of filter\\\\\\\"\\\"\\ncontainer_linux.go:349: starting container process caused \\\"error adding seccomp filter rule for syscall bdflush: requested action matches default action of filter\\\"\\n\"" pod="kube-system/kube-scheduler-master1" podUID=ab975606d36a082ab6e36e8ea38bb29d
```

使用二进制文件 [runc](https://github.com/opencontainers/runc/releases/) 更新下 `/usr/bin/runc` ，更新前注意备份，然后执行如下命令：

```bash
    mkdir -p /etc/crio/crio.conf.d
    cat >/etc/crio/crio.conf.d/cri-o-runc <<EOF
[crio.runtime.runtimes.runc]
runtime_path = ""
runtime_type = "oci"
runtime_root = "/run/runc"
EOF
```

重启 crio 后，再次 `kubeadm init` 即可正常初始化。 cri-o 调试不如 containerd，有时候报错都没有，这个 `runc` 是因为文档描述了安装 ubuntu 上需要更新，才尝试在 CentOS7 这样处理。
