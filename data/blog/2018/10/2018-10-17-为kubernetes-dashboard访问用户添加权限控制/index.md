---
title: "为Kubernetes dashboard访问用户添加权限控制"
date: "2018-10-17"
categories:
  - "system-operations"
  - "cloudcomputing-container"
tags:
  - "dashboard"
  - "kubernetes"
  - "rbac"
---

\# 为 Kubernetes dashboard 访问用户添加权限控制

[TOC]

## 1\. 需求

在开发环境给开发人员创建应用部署管理权限，可以使用 dashboard 的 token 和 kubeconfig 文件登录，并在开发人员机器上安装`kubectl`命令，可以使用`kubectl port-forward`命令。

## 2\. 方案

因为我们用到了 dashboard 和 kubeapps，所以他们的 rbac 权限都要分配。  
创建 namespace：`dev`  
创建 ServiceAccount：`dev-user1`  
给相应权限，并绑定 ServiceAccount。

## 3\. 实现

### 3.1 分配 dashboard 权限

`kubectl apply -f dev-user1.yaml`

```yaml
---
# ServiceAccount
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dev-user1
  namespace: dev

---
# role
kind: Role
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  namespace: dev
  name: role-dev-user1
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch", "delete", "update", "patch"]
  - apiGroups: [""]
    resources: ["pods/portforward", "pods/proxy"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get", "list", "watch", "delete"]
  - apiGroups: ["extensions", "apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: [""]
    resources: ["namespaces"]
    verbs: ["get", "watch", "list"]
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["get", "watch", "list"]
  - apiGroups: ["apps", "extensions"]
    resources: ["replicasets"]
    verbs: ["get", "watch", "list", "create", "update", "pathch", "delete"]
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "watch", "list", "create", "update", "pathch", "delete"]
  - apiGroups: [""]
    resources: ["persistentvolumeclaims"]
    verbs: ["get", "watch", "list"]
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "watch", "list"]
  - apiGroups: [""]
    resources: ["services"]
    verbs: ["get", "watch", "list", "create", "update", "pathch", "delete"]
  - apiGroups: ["extensions"]
    resources: ["ingresses"]
    verbs: ["get", "watch", "list"]
  - apiGroups: ["apps"]
    resources: ["daemonsets"]
    verbs: ["get", "watch", "list"]
  - apiGroups: ["batch"]
    resources: ["jobs"]
    verbs: ["get", "watch", "list"]
  - apiGroups: ["batch"]
    resources: ["cronjobs"]
    verbs: ["get", "watch", "list"]
  - apiGroups: [""]
    resources: ["replicationcontrollers"]
    verbs: ["get", "watch", "list"]
  - apiGroups: ["apps"]
    resources: ["statefulsets"]
    verbs: ["get", "watch", "list"]
  - apiGroups: [""]
    resources: ["endpoints"]
    verbs: ["get", "watch", "list"]

---
# role bind
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: role-bind-dev-user1
  namespace: dev
subjects:
  - kind: ServiceAccount
    name: dev-user1
    namespace: dev
roleRef:
  kind: Role
  name: role-dev-user1
  apiGroup: rbac.authorization.k8s.io
#---
## clusterrole
#kind: ClusterRole
#apiVersion: rbac.authorization.k8s.io/v1
#metadata:
#  namespace: dev
#  name: clusterrole-dev-user1
#rules:
#- apiGroups: [""]
#  resources: ["namespaces"]
#  verbs: ["get", "watch", "list"]
#
#---
## clusterrole bind
#kind: ClusterRoleBinding
#apiVersion: rbac.authorization.k8s.io/v1
#metadata:
#  name: clusterrole-bind-dev-user1
#  namespace: dev
#subjects:
#- kind: ServiceAccount
#  name: dev-user1
#  namespace: dev
#roleRef:
#  kind: ClusterRole
#  name: clusterrole-dev-user1
#  apiGroup: rbac.authorization.k8s.io
```

### 3.2 分配 kubeapps 权限

```bash
kubectl apply -f https://raw.githubusercontent.com/kubeapps/kubeapps/master/docs/user/manifests/kubeapps-applications-read.yaml
kubectl create -n dev rolebinding dev-user1-view \
  --clusterrole=kubeapps-applications-read \
  --serviceaccount dev:dev-user1
```

```bash
export KUBEAPPS_NAMESPACE=kubeapps
kubectl apply -n $KUBEAPPS_NAMESPACE -f https://raw.githubusercontent.com/kubeapps/kubeapps/master/docs/user/manifests/kubeapps-repositories-read.yaml
kubectl create -n dev rolebinding dev-user1-edit \
  --clusterrole=edit \
  --serviceaccount dev:dev-user1
kubectl create -n $KUBEAPPS_NAMESPACE rolebinding dev1-user1-kubeapps-repositories-read \
  --role=kubeapps-repositories-read \
  --serviceaccount dev:dev-user1
```

token 获取：

```bash
kubectl get -n dev secret $(kubectl get -n dev serviceaccount dev-user1 -o jsonpath='{.secrets[].name}') -o jsonpath='{.data.token}' | base64 --decode
```

### 3.3 生成 kubeconfig

通过 token 方式访问 kube-apiserver

```bash
# 创建 kubectl config 文件
# 设置集群参数
kubectl config set-cluster kubernetes \
  --insecure-skip-tls-verify=true \
  --server="https://192.168.105.99:8443"
# 设置客户端认证参数
kubectl config set-credentials dev-user1 \
  --token='上文中获取到的token'
# 设置上下文参数
kubectl config set-context kubernetes \
  --cluster=kubernetes \
  --user=dev-user1  \
  --namespace=dev
# 设置默认上下文
kubectl config use-context kubernetes
```

> 注意 配置 kubeconfig 时指定路径，以免覆盖已有配置，`--kubeconfig=configpath`

也可以直接创建文件 config，修改内容即可。

```yaml
apiVersion: v1
clusters:
  - cluster:
      insecure-skip-tls-verify: true
      server: https://192.168.105.99:8443
    name: kubernetes
contexts:
  - context:
      cluster: kubernetes
      namespace: dev
      user: dev-user1
    name: kubernetes
current-context: kubernetes
kind: Config
preferences: {}
users:
  - name: dev-user1
    user:
      token: eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZXYiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlY3JldC5uYW1lIjoiZGV2LXVzZXIxLXRva2VuLTJsbDlnIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZX291bnQubmFtZSI6ImRldi11c2VyMSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjdiY2Q4N2E1LWM0NGEtMTFlOC1iY2I5LTAwMGMyOWVhM2UzMCIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZXY6ZGV2LXVzZXIxIn0.1M84CPHY-GoyeaRFyBcD49GTwG5o0HMhN8lVsH9GDiqdui-1ppyi3JMONRJ9aWdswEF7-wsb5d4MQEk-9z5yiVh2r8SMP0EhcUR5ierntzD1bwwwuYzDxE4vHAuPB1tTxM0fOL3H-BOjt68iBKmOtRJumx8LzSUleQiNBBqR1B_yRLqrO6yslw44WC432O5g1v
```

## 4\. 测试验证

**windows `kubectl`命令安装**

命令下载：  
[https://storage.googleapis.com/kubernetes-release/release/v1.12.0/bin/windows/amd64/kubectl.exe](https://storage.googleapis.com/kubernetes-release/release/v1.12.0/bin/windows/amd64/kubectl.exe)

然后将其放至系统 PATH 目录下，比如`c:\Windows`  
命令使用时，可使用 cmd、powershell 或者其它命令提示行工具。推荐使用**Git Bash**，因为安装过 Git，则安装了此工具。

**kubeconfig 文件** kubeconfig 文件，即上文件中生成的 config 文件。  
文件名为`config`，文件放到 ~/.kube/下（~为用户家目录），因为 kubectl 命令默认读取此文件，否则每次使用 kubectl 命令，需要用参数`--kubeconfig=configpath`指定。

```
kubectl get pod -n dev
kubectl port-forward svc/dev-mysql-mysqlha 3306:3306 -n dev
```

参考资料： \[1\] https://kubernetes.io/docs/reference/access-authn-authz/rbac/  
\[2\] https://blog.qikqiak.com/post/add-authorization-for-kubernetes-dashboard/  
\[3\] https://github.com/kubeapps/kubeapps/blob/master/docs/user/access-control.md  
\[4\] https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#config \[5\] https://kubernetes.io/docs/tasks/tools/install-kubectl/#configure-kubectl
