---
title: "kubernetes 1.11配置使用nginx ingress"
date: "2018-08-24"
categories: 
  - "system-operations"
  - "cloudcomputing-container"
tags: 
  - "ingress"
  - "kubernetes"
  - "nginx"
---

# kubernetes 1.11配置使用nginx ingress

\[TOC\]

## 1\. 实验环境说明

```
lab1: etcd master haproxy keepalived 192.168.105.92
lab2: etcd master haproxy keepalived 192.168.105.93
lab3: etcd master haproxy keepalived 192.168.105.94
lab4: node  192.168.105.95
lab4: node  192.168.105.96

vip(loadblancer ip): 192.168.105.99
```

## 2\. 暴露服务的方式

由于Pod和Service是kubernetes集群范围内的虚拟概念，所以集群外的客户端系统无法通过Pod的IP地址或者Service的虚拟IP地址和虚拟端口号访问到它们。为了让外部客户端能够访问到这些服务，可以将Pod或Service的端口号映射到宿主机。

1. 将容器应用的端口号映射到物理机  
    1）设置容器级别的`hostPort`，将容器应用的端口号映射到物理机  
    2）设置Pod级别的`hostNetwork=true`，该Pod中所有容器的端口号都将被直接映射到物理机上
    
2. 将Service的端口号映射到物理机  
    1）设置`nodePort`映射到物理机，同时设置Service的类型为`NodePort`  
    2）设置LoadBalancer映射到云服务商提供的LoadBalancer地址
    

如果设置了Service的`nodePort`，那么集群会在每一个节点都监听设置的`nodePort`，外部客户端可以通过任意 `nodeIP:Port`的方式对集群服务进行访问。但是当集群中服务较多，那么需要管理的端口也会比较多，各个端口之间不能冲突，比较麻烦；另外，因为方式访问形式为`nodeIP:Port`的方式，那么对于一些HTTP服务，这种方式是无法做到根据URL路径进行转发的。

1. ingress是kubernetes V1.1版本之后新增的资源对象，用于实现HTTP层业务路由机制。  
    实现ingress路由机制主要包括3个组件：  
    1）ingress是kubernetes的一个资源对象，用于编写定义规则。  
    2）反向代理负载均衡器，通常以Service的Port方式运行，接收并按照ingress定义的规则进行转发，通常为nginx，haproxy，traefik等，本文使用nginx。  
    3）ingress-controller，监听apiserver，获取服务新增，删除等变化，并结合ingress规则动态更新到反向代理负载均衡器上，并重载配置使其生效。

## 3\. 安装nginx ingress

一般是以`DaemonSet`形式在每个node上创建一个资源，然后以`hostNetwork`的方式开放一个端口。

下面是根据官方只修改了image地址和添加了`hostNetwork: true`的ingress-control的yaml文件。

```yaml
#---
#
#apiVersion: v1
#kind: Namespace
#metadata:
#  name: default
#---

apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: default-http-backend
  labels:
    app: default-http-backend
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: default-http-backend
  template:
    metadata:
      labels:
        app: default-http-backend
    spec:
      terminationGracePeriodSeconds: 60
      containers:
      - name: default-http-backend
        # Any image is permissible as long as:
        # 1. It serves a 404 page at /
        # 2. It serves 200 on a /healthz endpoint
        image: registry.cn-hangzhou.aliyuncs.com/google-containers/defaultbackend:1.4
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
            scheme: HTTP
          initialDelaySeconds: 30
          timeoutSeconds: 5
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: 10m
            memory: 20Mi
          requests:
            cpu: 10m
            memory: 20Mi
---

apiVersion: v1
kind: Service
metadata:
  name: default-http-backend
  namespace: default
  labels:
    app: default-http-backend
spec:
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: default-http-backend
---

kind: ConfigMap
apiVersion: v1
metadata:
  name: nginx-configuration
  namespace: default
  labels:
    app: ingress-nginx
---

kind: ConfigMap
apiVersion: v1
metadata:
  name: tcp-services
  namespace: default
---

kind: ConfigMap
apiVersion: v1
metadata:
  name: udp-services
  namespace: default
---

apiVersion: v1
kind: ServiceAccount
metadata:
  name: nginx-ingress-serviceaccount
  namespace: default

---

apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRole
metadata:
  name: nginx-ingress-clusterrole
rules:
  - apiGroups:
      - ""
    resources:
      - configmaps
      - endpoints
      - nodes
      - pods
      - secrets
    verbs:
      - list
      - watch
  - apiGroups:
      - ""
    resources:
      - nodes
    verbs:
      - get
  - apiGroups:
      - ""
    resources:
      - services
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - "extensions"
    resources:
      - ingresses
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - ""
    resources:
        - events
    verbs:
        - create
        - patch
  - apiGroups:
      - "extensions"
    resources:
      - ingresses/status
    verbs:
      - update

---

apiVersion: rbac.authorization.k8s.io/v1beta1
kind: Role
metadata:
  name: nginx-ingress-role
  namespace: default
rules:
  - apiGroups:
      - ""
    resources:
      - configmaps
      - pods
      - secrets
      - namespaces
    verbs:
      - get
  - apiGroups:
      - ""
    resources:
      - configmaps
    resourceNames:
      # Defaults to "<election-id>-<ingress-class>"
      # Here: "<ingress-controller-leader>-<nginx>"
      # This has to be adapted if you change either parameter
      # when launching the nginx-ingress-controller.
      - "ingress-controller-leader-nginx"
    verbs:
      - get
      - update
  - apiGroups:
      - ""
    resources:
      - configmaps
    verbs:
      - create
  - apiGroups:
      - ""
    resources:
      - endpoints
    verbs:
      - get

---

apiVersion: rbac.authorization.k8s.io/v1beta1
kind: RoleBinding
metadata:
  name: nginx-ingress-role-nisa-binding
  namespace: default
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: nginx-ingress-role
subjects:
  - kind: ServiceAccount
    name: nginx-ingress-serviceaccount
    namespace: default

---

apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: nginx-ingress-clusterrole-nisa-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: nginx-ingress-clusterrole
subjects:
  - kind: ServiceAccount
    name: nginx-ingress-serviceaccount
    namespace: default
---

apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: nginx-ingress-controller
  namespace: default 
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ingress-nginx
  template:
    metadata:
      labels:
        app: ingress-nginx
      annotations:
        prometheus.io/port: '10254'
        prometheus.io/scrape: 'true'
    spec:
      serviceAccountName: nginx-ingress-serviceaccount
      hostNetwork: true  # 添加这行
      containers:
        - name: nginx-ingress-controller
          image: registry.cn-hangzhou.aliyuncs.com/google_containers/nginx-ingress-controller:0.17.1
          args:
            - /nginx-ingress-controller
            #- --apiserver-host=https://192.168.105.99:8443
            - --default-backend-service=$(POD_NAMESPACE)/default-http-backend
            - --configmap=$(POD_NAMESPACE)/nginx-configuration
            - --tcp-services-configmap=$(POD_NAMESPACE)/tcp-services
            - --udp-services-configmap=$(POD_NAMESPACE)/udp-services
            - --publish-service=$(POD_NAMESPACE)/ingress-nginx
            - --annotations-prefix=nginx.ingress.kubernetes.io
            #- --report-node-internal-ip-address=true
          securityContext:
            capabilities:
                drop:
                - ALL
                add:
                - NET_BIND_SERVICE
            # www-data -> 33
            runAsUser: 33
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
          ports:
          - name: http
            containerPort: 80
          - name: https
            containerPort: 443
          livenessProbe:
            failureThreshold: 3
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1

---
## Expose Nginx Ingress controller
#apiVersion: v1
#kind: Service
#metadata:
#  name: nginx-ingress-controller
#  namespace: default
#spec:
#  type: LoadBalancer
#  ports:
#    - port: 80
#    #  nodePort: 30000
#      name: http
#    #- port: 18080
#    #  nodePort: 32000
#    #  name: http-mgmt
#  selector:
#    app: nginx-ingress-controller
```

## 4\. 使用`DaemonSet`将ingress control固定pod

DaemonSet能够让所有（或者特定）的节点运行同一个pod。

当节点加入到K8S集群中，pod会被（DaemonSet）调度到该节点上运行，当节点从K8S集群中被移除，被DaemonSet调度的pod会被移除，如果删除DaemonSet，所有跟这个DaemonSet相关的pods都会被删除。

在某种程度上，DaemonSet承担了RC的部分功能，它也能保证相关pods持续运行，如果一个DaemonSet的Pod被杀死、停止、或者崩溃，那么DaemonSet将会重新创建一个新的副本在这台计算节点上。

一般应用于日志收集、监控采集、分布式存储守护进程、ingress等。

**Deployment和DaemonSet的区别**  
Deployment 部署的副本 Pod 会分布在各个 Node 上，每个 Node 都可能运行好几个副本。DaemonSet 的不同之处在于：每个 Node 上最多只能运行一个副本。

主要区别：

1. The scalability is much better when using a Deployment, because you will have a Single-Pod-per-Node model when using the DaemonSet.
2. It is possible to exclusively run a Service on a dedicated set of machines using taints and tolerations with a DaemonSet.
3. On the other hand the DaemonSet allows you to access any Node directly on Port 80 and 443, where you have to setup a Service object with a Deployment.

以下是只使用标签方式，将ingress control固定node。

将要使用的node节点打上标签

```
[root@lab1 nginx-ingress]# kubectl label nodes lab4 LB=ingress
node/lab4 labeled
```

修改ingress control的`Deployment`为`DaemonSet`，并根据标签使用`nodeSelector`。

```yaml
#---
#
## 有需要创建namespace,取消该段注释
#apiVersion: v1
#kind: Namespace
#metadata:
#  name: default
#---

apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: default-http-backend
  labels:
    app: default-http-backend
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: default-http-backend
  template:
    metadata:
      labels:
        app: default-http-backend
    spec:
      terminationGracePeriodSeconds: 60
      containers:
      - name: default-http-backend
        # Any image is permissible as long as:
        # 1. It serves a 404 page at /
        # 2. It serves 200 on a /healthz endpoint
        image: registry.cn-hangzhou.aliyuncs.com/google-containers/defaultbackend:1.4
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
            scheme: HTTP
          initialDelaySeconds: 30
          timeoutSeconds: 5
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: 10m
            memory: 20Mi
          requests:
            cpu: 10m
            memory: 20Mi
---

apiVersion: v1
kind: Service
metadata:
  name: default-http-backend
  namespace: default
  labels:
    app: default-http-backend
spec:
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: default-http-backend
---

kind: ConfigMap
apiVersion: v1
metadata:
  name: nginx-configuration
  namespace: default
  labels:
    app: ingress-nginx
---

kind: ConfigMap
apiVersion: v1
metadata:
  name: tcp-services
  namespace: default
---

kind: ConfigMap
apiVersion: v1
metadata:
  name: udp-services
  namespace: default
---

apiVersion: v1
kind: ServiceAccount
metadata:
  name: nginx-ingress-serviceaccount
  namespace: default

---

apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRole
metadata:
  name: nginx-ingress-clusterrole
rules:
  - apiGroups:
      - ""
    resources:
      - configmaps
      - endpoints
      - nodes
      - pods
      - secrets
    verbs:
      - list
      - watch
  - apiGroups:
      - ""
    resources:
      - nodes
    verbs:
      - get
  - apiGroups:
      - ""
    resources:
      - services
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - "extensions"
    resources:
      - ingresses
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - ""
    resources:
        - events
    verbs:
        - create
        - patch
  - apiGroups:
      - "extensions"
    resources:
      - ingresses/status
    verbs:
      - update

---

apiVersion: rbac.authorization.k8s.io/v1beta1
kind: Role
metadata:
  name: nginx-ingress-role
  namespace: default
rules:
  - apiGroups:
      - ""
    resources:
      - configmaps
      - pods
      - secrets
      - namespaces
    verbs:
      - get
  - apiGroups:
      - ""
    resources:
      - configmaps
    resourceNames:
      # Defaults to "<election-id>-<ingress-class>"
      # Here: "<ingress-controller-leader>-<nginx>"
      # This has to be adapted if you change either parameter
      # when launching the nginx-ingress-controller.
      - "ingress-controller-leader-nginx"
    verbs:
      - get
      - update
  - apiGroups:
      - ""
    resources:
      - configmaps
    verbs:
      - create
  - apiGroups:
      - ""
    resources:
      - endpoints
    verbs:
      - get

---

apiVersion: rbac.authorization.k8s.io/v1beta1
kind: RoleBinding
metadata:
  name: nginx-ingress-role-nisa-binding
  namespace: default
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: nginx-ingress-role
subjects:
  - kind: ServiceAccount
    name: nginx-ingress-serviceaccount
    namespace: default

---

apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: nginx-ingress-clusterrole-nisa-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: nginx-ingress-clusterrole
subjects:
  - kind: ServiceAccount
    name: nginx-ingress-serviceaccount
    namespace: default
---

apiVersion: extensions/v1beta1
kind: DaemonSet  # Deployment修改成Daemonset
metadata:
  name: nginx-ingress-controller
  namespace: default 
spec:
  #replicas: 2  # 注释该段
  #selector:
  #  matchLabels:
  #    app: ingress-nginx
  template:
    metadata:
      labels:
        app: ingress-nginx
      annotations:
        prometheus.io/port: '10254'
        prometheus.io/scrape: 'true'
    spec:
      nodeSelector:  # 节点标签
        LB: ingress
      #tolerations:  # 声明可接受的污点
      #- key: "LB"
      #  operator: "Equal"
      #  value: "NIC"
      #  effect: "NoSchedule"
      serviceAccountName: nginx-ingress-serviceaccount
      hostNetwork: true  # 添加这行，绑定到主机
      containers:
        - name: nginx-ingress-controller
          image: registry.cn-hangzhou.aliyuncs.com/google_containers/nginx-ingress-controller:0.17.1
          args:
            - /nginx-ingress-controller
            #- --apiserver-host=https://192.168.105.99:8443
            - --default-backend-service=$(POD_NAMESPACE)/default-http-backend
            - --configmap=$(POD_NAMESPACE)/nginx-configuration
            - --tcp-services-configmap=$(POD_NAMESPACE)/tcp-services
            - --udp-services-configmap=$(POD_NAMESPACE)/udp-services
            - --publish-service=$(POD_NAMESPACE)/ingress-nginx
            - --annotations-prefix=nginx.ingress.kubernetes.io
            #- --report-node-internal-ip-address=true
          securityContext:
            capabilities:
                drop:
                - ALL
                add:
                - NET_BIND_SERVICE
            # www-data -> 33
            runAsUser: 33
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: POD_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace
          ports:
          - name: http
            containerPort: 80
          - name: https
            containerPort: 443
          livenessProbe:
            failureThreshold: 3
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /healthz
              port: 10254
              scheme: HTTP
            periodSeconds: 10
            successThreshold: 1
            timeoutSeconds: 1

---

## Expose Nginx Ingress controller
#apiVersion: v1
#kind: Service
#metadata:
#  name: nginx-ingress-controller
#  namespace: default
#spec:
#  type: LoadBalancer
#  ports:
#    - port: 80
#    #  nodePort: 30000
#      name: http
#    #- port: 18080
#    #  nodePort: 32000
#    #  name: http-mgmt
#  selector:
#    app: nginx-ingress-controller
```

## 5\. 配置nginx url转发

以下是配置nginx域名`ingress.test.com`的url转发规则。

```yaml
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: app-nginx-ingress
  namespace: default
spec:
  rules:
  - host: ingress.test.com
    http:
      paths:
      - path: /
        backend:
          serviceName: nginx
          servicePort: 80

  #    - path: /nginx
  #      backend:
  #        serviceName: nginx
  #        servicePort: 80
```

配置好后，`kubectl get ing`查看结果。

外部通过域名绑定Nginx Ingress controller所在的节点的IP即可访问。

参数资料：  
\[1\] https://kubernetes.io/docs/concepts/services-networking/ingress/  
\[2\] https://github.com/kubernetes/ingress-nginx/blob/master/docs/deploy/index.md  
\[3\] https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/  
\[4\] https://blog.csdn.net/waltonwang/article/details/77587003  
\[5\] https://blog.csdn.net/tiger435/article/details/73650174  
\[6\] http://blog.51cto.com/newfly/2067531
