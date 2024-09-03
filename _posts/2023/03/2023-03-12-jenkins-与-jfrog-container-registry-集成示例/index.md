---
title: "jenkins 与 jfrog container registry 集成示例"
date: "2023-03-12"
categories: 
  - "system-operations"
  - "automation"
  - "cloudcomputing-container"
tags: 
  - "docker"
  - "jenkins"
  - "jfrog"
---

# 1\. 示例功能

示例仓库：[https://github.com/ygqygq2/jenkins-jfrog-demo](https://github.com/ygqygq2/jenkins-jfrog-demo)

jenkins 与 jfrog container registry 集成

- \[x\] docker maven 打包，普通文件方式上传至 Artifactory，并远程 ssh 执行命令部署
- \[x\] docker maven 打包，docker 方式上传至 Artifactory，并远程 ssh docker-compose 部署

# 2\. 环境

- \[x\] Docker 20.10.12
- \[x\] Docker Compose v2.2.3
- \[x\] Jenkins 2.375.3
- \[x\] JFrog Container Registry license 7.55.6

# 3\. 小结

示例中已实现日常使用最多的 2 种打包部署方式，直接拿来用或者稍加修改就能用于实际工作中。 虽然 jfrog container registry 免费版本没有 nexus 功能齐全，但是也基本够用了。对于免费 CI/CD 工具也算多了一种选择。
