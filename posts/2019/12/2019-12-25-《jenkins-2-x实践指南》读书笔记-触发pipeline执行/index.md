---
title: "《Jenkins 2.x实践指南》读书笔记-触发Pipeline执行"
date: "2019-12-25"
categories: 
  - "system-operations"
  - "automation"
tags: 
  - "gitlab"
  - "jenkins"
  - "pipeline"
---

\[TOC\]

# 1\. 时间触发

时间触发是指定义一个时间，时间到了就触发pipeline执行。在Jenkins pipeline中使用trigger指令来定义时间触发。

trigger指令只能被定义在pipeline块下，Jenkins内置支持cron、pollSCM，upstream三种方式。其他方式可以通过插件来实现。

## 1.1 定时执行：cron

定时执行就像cronjob，一到时间点就执行。它的使用场景通常是执行一些周期性的job，如每夜构建。

```
pipeline {
    agent any
    triggers {
        cron('0 0 * * *')
    }
    stages {
        stage('Nightly build') {
            steps {
                echo "这是一个耗时的构建，每天凌晨执行"
            }
        }
     }
}
```

Jenkins trigger cron语法采用的是UNIX cron语法（有些细微的区别）。一条cron包含5个字段，使用空格或Tab分隔，格式为：MINUTE HOUR DOM MONTH DOW。每个字段的含义为：

- MINUTE：一小时内的分钟，取值范围为0∼59。
- HOUR：一天内的小时，取值范围为0∼23。
- DOM：一个月的某一天，取值范围为1∼31。
- MONTH：月份，取值范围为1∼12。
- DOW：星期几，取值范围为0∼7。0和7代表星期天。 还可以使用以下特殊字符，一次性指定多个值。
- \*：匹配所有的值
- M-N：匹配M 到N 之间的值。
- M-N/X or\*/X：指定在M 到N 范围内，以X值为步长。
- A，B，· · ·，Z：使用逗号枚举多个值。

在一些大型组织中，会同时存在大量的同一时刻执行的定时任务，比如N 个半夜零点（`0 0 * * *`）执行的任务。这样会产生负载不均衡。在Jenkins trigger cron语法中使用“H”字符来解决这一问题，H代表hash。对于没必要准确到零点0分执行的任务，cron可以这样写：`H 0 * * *`，代表在零点0分至，H代表hash。代表在零点0分至零点59分之间任何一个时间点执行。

需要注意的是，H应用在DOM（一个月的某一天）字段时会有不准确的情况，因为10月有31天，而2月却是28天。

Jenkins trigger cron还设计了一些人性化的别名：`@yearly`、`@annually`、`@monthly`、`@weekly`、`@daily`、`@midnight`和`@hourly`。例如，`@hourly`与`H * * * *`相同，代表一小时内的任何时间；`@midnight`实际上代表在半夜12：00到凌晨2：59之间的某个时间。其他别名很少有应用场景。

## 1.2 轮询代码仓库：pollSCM

轮询代码仓库是指定期到代码仓库询问代码是否有变化，如果有变化就执行。

```
pipeline {
    agent any
    triggers {
        // 每分钟判断一次代码是否有变化
        pollSCM("H/1 * * * *")
    }
}
```

事实上，如果代码有变化，最好的方式是代码仓库主动通知Jenkins，而不是Jenkins频繁去代码仓库检查。那这种方式存在的意义是什么？ 在一些特殊情况下，比如外网的代码仓库无法调用内网的Jenkins，或者反过来，则会采用这种方式。

# 2\. 事件触发

事件触发就是发生了某个事件就触发pipeline执行。这个事件可以是你能想到的任何事件。比如手动在界面上触发、其他Job主动触发、HTTP API Webhook触发等。

## 2.1 由上游任务触发：upstream

当B任务的执行依赖A任务的执行结果时，A就被称为B的上游任务。在Jenkins 2.22及以上版本中，trigger指令开始支持upstream类型的触发条件。upstream的作用就是能让B pipeline自行决定依赖哪些上游任务。

```
// job1和job2都是任务名
triggers {
    upstream(upstreamProjects: "job1,job2", threshold: hudson.model.Result.SUCCESS)
}
```

当upstreamProjects参数接收多个任务时，使用，分隔。threshold参数是指上游任务的执行结果是什么值时触发。hudson.model.Result是一个枚举，包括以下值：

- `ABORTED`：任务被手动中止。
- `FAILURE`：构建失败。
- `SUCCESS`：构建成功。
- `UNSTABLE`：存在一些错误，但不至于构建失败。
- `NOT_BUILT`：在多阶段构建时，前面阶段的问题导致后面阶段无法执行。

注意：需要手动触发一次任务，让Jenkins加载pipeline后，trigger指令才会生效。

## 2.2 GitLab通知触发

GitLab通知触发是指当GitLab发现源代码有变化时，触发Jenkins执行构建。

由GitLab主动通知进行构建的好处是显而易见的，这样很容易就解决了我们之前提到的轮询代码仓库时“多久轮询一次”的问题，实现每一次代码的变化都对应一次构建。

### 2.2.1 在pipeline中实现GitLab trigger

GitLab插件上实现了基于GitLab的trigger。以下是具体使用方法。

```
pipeline {
    agent any
    triggers {
        gitlab(triggerOnPush: true,
            triggerOnMergeRequest: true,
            branchFilterType: "All",
            secretToken: "t8vcxwuza023ehzcftzr5a74vkpto6xr")
    }
    stages {
        stage('build') {
            steps {
                echo 'Hello World from gitlab trigger'
            }
        }
    }
}
```

secretToken使用随机字符串生成器生成即可。如果Jenkins在内网使用，并且安全性有一定的保障，我们可以将secretToken定义为一个Jenkins全局变量，供所有的项目使用。这样做就不用为每个项目重新生成token了。 GitLab trigger方法有很多参数可配置，下面简单介绍一些常用的参数。

- `triggerOnPush`：当GitLab触发push事件时，是否执行构建。
- `triggerOnMergeRequest`：当GitLab触发mergeRequest事件时，是否执行构建。
- `branchFilterType`：只有符合条件的分支才会被触发。必选，否则无法实现触发。可以设置的值有：
    - `NameBasedFilter`：基于分支名进行过滤，多个分支名使用逗号分隔。
    - `RegexBasedFilter`：基于正则表达对分支名进行过滤。
    - All：所有分支都会被触发。
- `includeBranchesSpec`：基于branchFilterType值，输入期望包括的分支的规则。
- `excludeBranchesSpec`：基于branchFilterType值，输入期望排除的分支的规则。

### 2.2.2 使用Generic Webhook Trigger插件实现触发

安装 Generic Webhook Trigger 插件（下文使用 GWT 简称）后，Jenkins 会暴露一个 API： `＜JENKINS URL>/generic-webhook-trigger/invoke`，即由GWT插件来处理此API的请求。

以下为使用`token`示例：

```
pipeline {
    agent any
    triggers {
        GenericTrigger(
            genericVariables: [
                [
                    key: 'ref', 
                    value: '$.ref'
                ]
            ],

            token: 'secret',

            causeString: 'Triggered on $ref',
            printContributedVariables: true,
            printPostContent: true
        )
    }
    stages {
        stage("Some step") {
            steps {
                sh "echo $ref"
                sh "printenv"
            }
        }
    }
}
```

`curl -X POST -H "Content-Type: application/json" -d '{"ref": "ref/heads/master"}' -s https://jenkins.utcook.com/generic-webhook-trigger/invoke?token=secret`

![触发结果](images/1577255208327.png)

GenericTrigger触发条件由GWT插件提供。此触发条件可以说是GWT的所有内容。 可以将GenericTrigger触发条件分为5部分，这样更易于理解各参数的作用。

- 从HTTP POST请求中提取参数值。
- `token`，GWT插件用于标识Jenkins项目的唯一性。
- 根据请求参数值判断是否触发Jenkins项目的执行。
- 日志打印控制。
- Webhook响应控制。

**一个HTTP POST请求可以从三个维度提取参数，即POST body、URL参数和header** GWT插件提供了三个参数分别对这三个维度的数据进行提取。

1. genericVariables：提取POST body中的参数。

```
            genericVariables: [
                [key: 'ref', value: '$.ref'],
                [key: 'before',
                 value: '$.before',
                 expressionType: 'JSONPath',
                 regexpFilter: '',
                 defaultValue: ''
                ]
            ]
```

- `value`：JSONPath表达式，或者XPath表达式，取决于`expressionType`参数值，用于从POST body中提取值。
- `key`：从POST body中提取出的值的新变量名，可用于pipeline其他步骤。
- `expressionType`：可选，`value`的表达式类型，默认为`JSONPath`。当请求为XML内容时，必须指定XPath值。
- `defaultValue`：可选，当提取不到值，且`defaultValue`不为空时，则使用`defaultValue`作为返回值。
- `regexpFilter`：可选，过滤表达式，对提取出来的值进行过滤。`regexpFilter`做的事情其实就是`string.replaceAll(regexpFilter，"")`；。`string`是从HTTP请求中提取出来的值。

2. `genericRequestVariables`：从URL参数中提取值。

```
            genericRequestVariables: [
                [key: 'requestWithNumber', regexpFilter: '[^0-9]'],
                [key: 'requestWithString', regexpFilter: '']
            ]
```

- `key`：提取出的值的新变量名，可用于pipeline其他步骤。
- `regexpFilter`：对提取出的值进行过滤。

3. `genericHeaderVariables`：从HTTP header中提取值。
    
    ```
            genericHeaderVariables: [
                [key: 'headerWithNumber', regexpFilter: '[^0-9]'],
                [key: 'headerWithString', regexpFilter: '']
            ]
    ```
    

`genericHeaderVariables`的用法与`genericRequestVariables`一样，区别是它是从HTTP header中提取值的。

**根据请求参数值判断是否触发Jenkins项目执行**

GWT并不只是根据`token`值来判断是否触发，还可以根据我们提取出的值进行判断。示例如下：

```
        GenericTrigger(
            genericVariables: [
                [key: 'refValue', value: '$.ref'],
            ],

            token: env.JOB_NAME,

            regexpFilterText: '$refValue',
            regexpFilterExpression: 'refs/heads/(master|dev)'
        )
```

- `regexpFilterText`：需要进行匹配的key。例子中，我们使用从POST body中提取出的`refValue`变量值。
- `regexpFilterExpression`：正则表达式。 如果`regexpFilterText`参数的值符合`regexpFilterExpression`参数的正则表达式，则触发执行。

**控制打印内容**

打印日志有助于调试。GWT插件提供了三个参数。

- `printPostContent`：布尔值，将Webhook请求信息打印到日志上。
- `printContributedVariables`：布尔值，将提取后的变量名及变量值打印出来。
- `causeString`：字符串类型，触发原因，可以直接引用提取后的变量，如 `causeString：'Triggered on $msg'`。

**控制响应**

- `silentResponse`：布尔类型，在正常情况下，当Webhook请求成功后，GWT插件会返回HTTP 200状态码和触发结果给调用方。但是当`silentResponse`设置为`true`时，就只返回HTTP 200状态码，不返回触发结果。

# 3\. 开发推送代码触发jenkins构建实战

## 3.1 安装Jenkins插件

- [GitLab](https://plugins.jenkins.io/gitlab-plugin)
- [Git](https://plugins.jenkins.io/git)

## 3.2 创建项目

新建gitlab项目

![新建gitlab项目](images/1574846790079.png)

新建jenkins项目

![新建jenkins项目](images/1574846746277.png)

gltlab设置集成webhook ![gltlab设置集成webhook](images/1574846380511.png)

webhook测试报错 ![测试webhook报错](images/1576654996815.png)

以上报错需要进行jenkins安装设置，取消勾选“CSRF Protection” ![jenkins安全设置](images/1576654977449.png)

## 3.3 将构建状态信息推送到Gitlab

jenkins构建项目后，可以将构建的状态信息推送到gitlab的pipeline中，并且点击pipeline会自动跳转到jenkins的构建页面下。

首先gitlab仓库的管理帐户下生成个人访问token。

![生成gitlab token](images/1576657211480.png)

然后在jenkins内，进入"Manage Jenkins" → "Configure System"，页面中找到“Gitlab”，并添加gitlab和token凭证信息。

![添加gitlab](images/1576657251930.png)

![添加gitlab token凭证](images/1574846125004.png)

修改`Jenkinsfile`，如果jenkins中未触发过任务，第一次需要手动触发，以后gitlab内代码的修改会自动触发，并将运行结果提交到gitlab pipeline中。

完整的`Jenkinsfile`：

```
pipeline {
    agent any
    triggers {
        gitlab(triggerOnPush: true,
            triggerOnMergeRequest: true,
            branchFilterType: "All",
            secretToken: "t8vcxwuza023ehzcftzr5a74vkpto6xr")
    }
    stages {
        stage('build') {
            steps {
                echo 'Hello World from gitlab trigger'
            }
        }
    }
    post {
        failure {
            updateGitlabCommitStatus name: "build", state: "failed"
        }
        success {
            updateGitlabCommitStatus name: "build", state: "success"
        }
    }
    options {
        gitLabConnection("gitlab")
    }
}
```

![修改Jenkinsfile添加post到gitlab](images/1576662964238.png)

gitlab仓库的pipeline中可查看到构建信息。 ![enter description here](images/1576663065589.png)

参考资料： \[1\] 《Jenkins 2.x实战指南》 \[2\] [https://jenkins.io/zh/doc/book/pipeline/syntax/](https://jenkins.io/zh/doc/book/pipeline/syntax/) \[3\] [https://jenkins.io/zh/doc/pipeline/steps/](https://jenkins.io/zh/doc/pipeline/steps/) \[4\] [https://blog.csdn.net/xiashei/article/details/88694027](https://blog.csdn.net/xiashei/article/details/88694027)
