---
title: "kubesphere/kubernetes 镜像拉取失败问题处理"
date: "2024-07-10"
categories: 
  - "cloudcomputing-container"
tags: 
  - "kubernetes"
  - "kubesphere"
---

# 1\. 背景

最近 docker hub 下载镜像经常失败，同一台机器有可能这个镜像可以，那个镜像不行。另外，看到很多人安装 kubesphere/kubernetes 不知道如何处理镜像拉取失败问题。

# 2\. 基本概念和基本操作

## 2.1 vim 基本操作

vim 基本操作，以下为按键流程说明，比如： \* 前后左右用方向键即可，或者按 esc 状态下，h（左） j（下） k（上） l（右） \* 查找 "image:"，ecs -> /image: -> 回车 \* 往后查找，前面查找按了回车后，按 n \* 往前查找，前面查找按了回车后，按 N（shift + n） \* 替换 aaa 成 bbb，esc -> 输入 `:s@aaa@bbb@g` （注意冒号）g 为全局替换，不加 g 则替换匹配到的第一个

基本能满足编辑需求了。

## 2.2 kubernetes 资源编辑

kubernetes 中最常见拉镜像的有： [deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)：kubectl 命令使用时简写：deploy [statefulset](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)：kubectl 命令使用时简写：sts [daemonset](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/)：kubectl 命令使用时简写：ds

比如编辑一个 deployment abc，如果不是在 default 命名空间，则需要接上命令空间： `kubectl edit deploy abc [-n NAMESPACE]`

命令执行后，就是 vim 操作了。

镜像拉取策略： \* `imagePullPolicy: "IfNotPresent"`：有相同地址和 tag 的镜像存在时则不拉取 \* `imagePullPolicy: "Always"`：总是拉取镜像，即使存在相同地址和 tag 镜像时

# 3\. kubesphere 安装设置私有仓库

## 3.1 私有仓库 harbor 说明

我的私有仓库是 [harbor.ygqygq2.com](https://harbor.ygqygq2.com)，带宽小，勉强能用。其中 `library` 项目中保留的为 [创建 issue](https://github.com/linuxba/mirror-images-to-harbor/issues/new/choose) 推送上去的镜像地址，对应关系是： \* `nginx:latest` 对应 `harbor.ygqygq2.com/library/nginx:latest` \* `bitnami/nginx:latest` 对应 `harbor.ygqygq2.com/library/bitnami/nginx:latest`

其中 `proxy` 项目为代理 docker hub，对应关系是： \* `nginx:latest` 对应 `harbor.ygqygq2.com/proxy/library/nginx:latest` \* `bitnami/nginx:latest` 对应 `harbor.ygqygq2.com/proxy/bitnami/nginx:latest`

私有仓库 harbor 推荐的做法就是 `library` 设置成公开，然后里面镜像保留原镜像目录结构，像我上面一样。

## 3.2 config-sample.yaml 先用默认的

kubekey 安装前设置环境变量 `export KKZONE=cn`

然后 `config-sample.yaml` 使用默认的：

```yaml
  registry:
    privateRegistry: ""  # 私有仓库地址，如果镜像都在 library 中，则比如 harbor.ygqygq2.com/library
    namespaceOverride: ""
    registryMirrors: []
    insecureRegistries: []  # 如果私有仓库为 http 访问，得加到这里
```

kubekey 安装 kubernetes 集群，初始化时就可以使用命令查看容器运行情况了。 \* docker 环境推荐 docker 命令，比如 `docker ps -a` \* containerd 环境推荐 nerdctl 命令，只是注意镜像拉取要指定命令空间 `--namespace k8s.io`，可以设置 `alias nerdctl=nerdctl --namespace k8s.io`，比如 `nerdctl ps -a --namespace k8s.io`

注意 sandbox\_image 镜像地址： \* docker 环境中查看 kubelet 配置 `/etc/systemd/system/kubelet.service.d/10-kubeadm.conf`，可以看到 `EnvironmentFile=-/etc/default/kubelet`，所以可以配置 `/etc/default/kubelet`（Ubuntu）、`/etc/sysconfig/kubelet`（RHEL系），内容为：`KUBELET_EXTRA_ARGS="--pod-infra-container-image="registry.cn-beijing.aliyuncs.com/kubesphereio/pause:3.9"` \* containerd 配置中可以配置为，`sandbox_image = "registry.cn-beijing.aliyuncs.com/kubesphereio/pause:3.9"`

安装完 kubernetes 后，`kubectl get pod -A` 可以查看 pod 运行情况，此时就可以根据 [4](#4-总结镜像失败处理) 解决失败的 POD 镜像问题了。

## 3.3 kubesphere-installer.yaml

`kubesphere-installer.yaml` 中有个镜像地址，修成成你的仓库镜像地址，也可以使用我的仓库`image: harbor.ygqygq2.com/proxy/kubesphere/ks-installer:v3.4.1`，并注意修改策略 `imagePullPolicy: "IfNotPresent"`

![installer 地址修改](images/1720187018369.png)

```bash
kubectl apply -f kubesphere-installer.yaml
kubectl get pod -A  # 查看 pod 情况
```

![有pod异常](images/1720189736967.png)

`kubectl describe pod ks-installer-67f67f9698-lglwb -n kubesphere-system`

![没有镜像](images/1720189861484.png)

因为我们使用 yaml 安装的，直接修改 yaml，再 `kubectl apply -f kubesphere-installer.yaml` ![直接修改 yaml](images/1720189907134.png)

再次查看 pod，等待它运行正常。 ![再次查看](images/1720189977274.png)

## 3.4 cluster-configuration.yaml

![使用私有仓库地址](images/1720190112270.png)

```bash
kubectl apply -f cluster-configuration.yaml 
kubectl get pod -A

kubectl logs -f <ks-installer pod名> -n kubesphere-system --tail=10
```

![查看日志](images/1720190306986.png)

kubekey 安装ks 会有默认 storageclass，但是使用 ks-installer 安装，因为没有默认 storageclass 可能日志提示 `"msg": "Default StorageClass was not found !"`，创建一个：

```bash
cat > local-sc.yaml<<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: StorageType
        value: "hostpath"
      - name: BasePath
        value: "/var/openebs/local"
    openebs.io/cas-type: local
    storageclass.beta.kubernetes.io/is-default-class: "true"
    storageclass.kubesphere.io/supported-access-modes: '["ReadWriteOnce"]'
  name: local
provisioner: openebs.io/local
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer

---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    name: openebs-localpv-provisioner
    openebs.io/component-name: openebs-localpv-provisioner
    openebs.io/version: 3.3.0
  name: openebs-localpv-provisioner
  namespace: kube-system
spec:
  progressDeadlineSeconds: 600
  replicas: 1
  revisionHistoryLimit: 10
  selector:
    matchLabels:
      name: openebs-localpv-provisioner
      openebs.io/component-name: openebs-localpv-provisioner
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        name: openebs-localpv-provisioner
        openebs.io/component-name: openebs-localpv-provisioner
        openebs.io/version: 3.3.0
    spec:
      containers:
      - env:
        - name: NODE_NAME
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: spec.nodeName
        - name: OPENEBS_NAMESPACE
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: metadata.namespace
        - name: OPENEBS_SERVICE_ACCOUNT
          valueFrom:
            fieldRef:
              apiVersion: v1
              fieldPath: spec.serviceAccountName
        - name: OPENEBS_IO_ENABLE_ANALYTICS
          value: "true"
        - name: OPENEBS_IO_INSTALLER_TYPE
          value: openebs-operator-lite
        - name: OPENEBS_IO_HELPER_IMAGE
          value: openebs/linux-utils:3.3.0
        # image: harbor.ygqygq2.com/proxy/openebs/provisioner-localpv:3.3.0
        image: openebs/provisioner-localpv:3.3.0
        imagePullPolicy: IfNotPresent
        livenessProbe:
          exec:
            command:
            - sh
            - -c
            - test 0 = 1
          failureThreshold: 3
          initialDelaySeconds: 30
          periodSeconds: 60
          successThreshold: 1
          timeoutSeconds: 1
        name: openebs-provisioner-hostpath
        resources: {}
        terminationMessagePath: /dev/termination-log
        terminationMessagePolicy: File
      dnsPolicy: ClusterFirst
      restartPolicy: Always
      schedulerName: default-scheduler
      securityContext: {}
      serviceAccount: openebs-maya-operator
      serviceAccountName: openebs-maya-operator
      terminationGracePeriodSeconds: 30
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: openebs-maya-operator
  namespace: kube-system
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: openebs-maya-operator
rules:
- apiGroups: ["*"]
  resources: ["nodes", "nodes/proxy"]
  verbs: ["*"]
- apiGroups: ["*"]
  resources: ["namespaces", "services", "pods", "pods/exec", "deployments", "deployments/finalizers", "replicationcontrollers", "replicasets", "events", "endpoints", "configmaps", "secrets", "jobs", "cronjobs"]
  verbs: ["*"]
- apiGroups: ["*"]
  resources: ["statefulsets", "daemonsets"]
  verbs: ["*"]
- apiGroups: ["*"]
  resources: ["resourcequotas", "limitranges"]
  verbs: ["list", "watch"]
- apiGroups: ["*"]
  resources: ["ingresses", "horizontalpodautoscalers", "verticalpodautoscalers", "poddisruptionbudgets", "certificatesigningrequests"]
  verbs: ["list", "watch"]
- apiGroups: ["*"]
  resources: ["storageclasses", "persistentvolumeclaims", "persistentvolumes"]
  verbs: ["*"]
- apiGroups: ["apiextensions.k8s.io"]
  resources: ["customresourcedefinitions"]
  verbs: [ "get", "list", "create", "update", "delete", "patch"]
- apiGroups: ["openebs.io"]
  resources: [ "*"]
  verbs: ["*"]
- nonResourceURLs: ["/metrics"]
  verbs: ["get"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: openebs-maya-operator
subjects:
- kind: ServiceAccount
  name: openebs-maya-operator
  namespace: kube-system
roleRef:
  kind: ClusterRole
  name: openebs-maya-operator
  apiGroup: rbac.authorization.k8s.io
EOF

kubectl apply -f local-sc.yaml
```

安装 openelb localpath storageclass，就会有镜像拉取问题了。所以你现在就可以尝试解决了。

![openelb init](images/1720193477797.png)

查看问题，可以看出来 init-pvc 的 pod 并不属于 deploy 啥的，它只是一个 pod， ![查看问题](images/1720193603266.png)

所以直接编辑 pod，因为也没有 deploy/sts/ds 给你编辑 init-pvc， ![编辑pod](images/1720193685448.png)

可以看到运行成功 ![正常完成](images/1720193790676.png)

其它 2 个 pod 同理处理。如果想 pod 快速重启，直接删除 pod 即可，它自动会重启。

![重启 pod](images/1720193971920.png)

![还在卡住](images/1720194177095.png)

`kubectl describe pod -n kubesphere-system openldap-0` 看是什么状态，发现是 pvc 还没准备好。 ![查原因](images/1720194117974.png)

查 localpv provisioner pod 日志 `kubectl logs -f -n kube-system openebs-localpv-provisioner-7bbb56b778-mwrp5` ![日志](images/1720194344826.png) ![看来是 init pod存在](images/1720194384561.png)

尝试删除 init-pvc pod ![删除 pod](images/1720194455354.png)

再次看日志 ![看到成功日志](images/1720194510007.png) ![pvc成功创建](images/1720194535359.png)

看ks-installer pod 日志 ![看ks-installer pod 日志](images/1720194602179.png)

如果 ks-installer POD 没有动作，你又想它执行任务，可以删除 ks-installer POD，`kubectl delete pod <ks-installer pod名> -n kubesphere-system`，它重启后，就会执行任务了。 ![重启ks-installer pod](images/1720194652857.png)

看安装情况 ![查看pod](images/1720194715057.png)

发现问题，重试几次都卡在这 ![重试几次都在这](images/1720195448423.png)

把 minio 关了，删除它的 pvc ![设置 pod为0](images/1720195513981.png) ![删除pvc](images/1720195556163.png)

尝试恢复 pod，但是还是一样 ![恢复pod](images/1720195645391.png)

`helm list -n kubesphere-system` 查看是否安装成功 minio，看到没安装成功 ![没有安装](images/1720195805162.png)

进 ks-installer 手动安装，安装失败，发现其实只是没显示出来，安装名字可以看看正常集群是什么。uninstall 后，重启 ks-installer安装。 ![进ks-installer手动安装](images/1720196114117.png)

查看日志，minio 安装成功，已经跳过了。 ![minio已经安装成功](images/1720196479573.png)

继续看 pod 和日志 ![继续看pod](images/1720196534156.png)

又有镜像拉取问题 ![发现又有镜像拉取问题](images/1720196579084.png)

发现是 busybox 镜像，这个我提过 [issue](https://github.com/kubesphere/kubesphere/issues/6129) ![busybox镜像](images/1720196656163.png)

`kubectl edit sts -n kubesphere-logging-system opensearch-cluster-master` ![改它](images/1720196818952.png)

```
        image: harbor.ygqygq2.com/proxy/busybox:latest
        imagePullPolicy: IfNotPresent
```

后面镜像问题处理基本前面已经出现过，都能处理了。

# 4\. 总结镜像失败处理

## 4.1 直接编辑资源 deploy、sts、ds 等

- `kubectl get pod -A` 找一下有什么失败的 POD
- `kubectl describe pod <POD 名> [-n namespace]` 查看 pod 状态
- 修改资源 deploy/sts/ds 的镜像地址和拉取策略

## 4.2 无法修改资源修改镜像地址和拉取策略时

这种一般是程序（比如 ks）封装了，你虽然修改资源可以拉取镜像，但是它还是可能被恢复，那只能使用 tag 镜像方式，比如前面遇到的的 initContainers 使用 `busybox:latest`、`imagePullPolicy: "Always"`，如果镜像拉取策略无法被修改，这更麻烦。推荐命令有前面的 `docker`/`nerdctl`。

在 pod 所在节点

```bash
nerdctl pull harbor.ygqygq2.com/proxy/library/busybox:latest --namespace k8s.io
nerdctl tag harbor.ygqygq2.com/proxy/library/busybox:latest busybox:latest --namespace k8s.io
```

然后就等 pod 自动重启。

## 4.3 helm chart 修改镜像仓库地址

推荐使用 [bitnami/charts](https://github.com/bitnami/charts)，写的很规范，因为它们都可以通过 `values.yaml` 中的 `global.imageRegistry` 设置镜像仓库地址，比如我的镜像都在 `library` 中，而且保持原镜像目录构建，则可以设置 `global.imageRegistry` 为 `harbor.ygqygq2.com/library`

![全局仓库地址](images/1720197596001.png)

如果遇到不规范的 charts，而且它引用其它的 charts，可以从主 `values.yaml` 设置子 charts 的镜像地址设置，也可以直接修改子 charts 目录下的 `values.yaml` 来设置。

在使用 helm charts 安装应用时，推荐使用 `helm pull` 到本地安装，比如：

```bash
helm repo add kubesphere https://charts.kubesphere.io/stable
helm repo update
mkdir -p /data/helm # 专门建个目录管理安装的 helm charts
cd /data/helm
helm pull --untar kubesphere/openelb # 拉到本地
cd openelb
mkdir kube-system # 将要安装在这个命名空间下
rsync -avz ../values.yaml . # 不修改原 values.yaml，因为可能还要作参考
helm install openelb -f values.yaml ../ -n kube-system
```
