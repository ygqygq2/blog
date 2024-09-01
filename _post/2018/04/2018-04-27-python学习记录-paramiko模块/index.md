---
title: "Python学习记录-paramiko模块"
date: "2018-04-27"
categories: 
  - "develop"
tags: 
  - "paramiko"
  - "python"
---

# Python学习记录-paramiko模块

\[TOC\]

[paramiko](http://www.paramiko.org/)模块基于SSH用于连接远程服务器并执行相关操作。

## 1\. `SSHClient`

用于连接远程服务器并执行基本命令

基于用户名密码连接：

```
import paramiko

# 创建SSH对象
ssh = paramiko.SSHClient()
# 允许连接不在know_hosts文件中的主机
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
# 连接服务器
ssh.connect(hostname='192.168.0.2', port=22, username='root', password='test')

# 执行命令
stdin, stdout, stderr = ssh.exec_command('df')
# 获取命令结果
result = stdout.read().decode()

# 关闭连接
ssh.close()
```

SSHClient 封装 Transport

```
import paramiko

transport = paramiko.Transport(('192.168.0.2', 22))
transport.connect(username='root', password='test')

ssh = paramiko.SSHClient()
ssh._transport = transport

stdin, stdout, stderr = ssh.exec_command('df')
print(stdout.read().decode())

transport.close()
```

基于公钥密钥连接：

```
import paramiko

private_key = paramiko.RSAKey.from_private_key_file('/home/auto/.ssh/id_rsa')

# 创建SSH对象
ssh = paramiko.SSHClient()
# 允许连接不在know_hosts文件中的主机
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
# 连接服务器
ssh.connect(hostname='192.168.0.2', port=22, username='root', key=private_key)

# 执行命令
stdin, stdout, stderr = ssh.exec_command('df')
# 获取命令结果
result = stdout.read()

# 关闭连接
ssh.close()
```

SSHClient 封装 Transport

```
import paramiko

private_key = paramiko.RSAKey.from_private_key_file('/home/auto/.ssh/id_rsa')

transport = paramiko.Transport(('hostname', 22))
transport.connect(username='root', pkey=private_key)

ssh = paramiko.SSHClient()
ssh._transport = transport

stdin, stdout, stderr = ssh.exec_command('df')

transport.close()
```

基于私钥字符串进行连接

```
import paramiko
from io import StringIO

key_str = """-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAq7gLsqYArAFco02/55IgNg0r7NXOtEM3qXpb/dabJ5Uyky/8
NEHhFiQ7deHIRIuTW5Zb0kD6h6EBbVlUMBmwJrC2oSzySLU1w+ZNfH0PE6W6fans
H80whhuc/YgP+fjiO+VR/gFcqib8Rll5UfYzf5H8uuOnDeIXGCVgyHQSmt8if1+e
7hn1MVO1Lrm9Fco8ABI7dyv8/ZEwoSfh2C9rGYgA58LT1FkBRkOePbHD43xNfAYC
tfLvz6LErMnwdOW4sNMEWWAWv1fsTB35PAm5CazfKzmam9n5IQXhmUNcNvmaZtvP
c4f4g59mdsaWNtNaY96UjOfx83Om86gmdkKcnwIDAQABAoIBAQCnDBGFJuv8aA7A
ZkBLe+GN815JtOyye7lIS1n2I7En3oImoUWNaJEYwwJ8+LmjxMwDCtAkR0XwbvY+
c+nsKPEtkjb3sAu6I148RmwWsGncSRqUaJrljOypaW9dS+GO4Ujjz3/lw1lrxSUh
IqVc0E7kyRW8kP3QCaNBwArYteHreZFFp6XmtKMtXaEA3saJYILxaaXlYkoRi4k8
S2/K8aw3ZMR4tDCOfB4o47JaeiA/e185RK3A+mLn9xTDhTdZqTQpv17/YRPcgmwz
zu30fhVXQT/SuI0sO+bzCO4YGoEwoBX718AWhdLJFoFq1B7k2ZEzXTAtjEXQEWm6
01ndU/jhAasdfasdasdfasdfa3eraszxqwefasdfadasdffsFIfAsjQb4HdkmHuC
OeJrJOd+CYvdEeqJJNnF6AbHyYHIECkj0Qq1kEfLOEsqzd5nDbtkKBte6M1trbjl
HtJ2Yb8w6o/q/6Sbj7wf/cW3LIYEdeVCjScozVcQ9R83ea05J+QOAr4nAoGBAMaq
UzLJfLNWZ5Qosmir2oHStFlZpxspax/ln7DlWLW4wPB4YJalSVovF2Buo8hr8X65
lnPiE41M+G0Z7icEXiFyDBFDCtzx0x/RmaBokLathrFtI81UCx4gQPLaSVNMlvQA
539GsubSrO4LpHRNGg/weZ6EqQOXvHvkUkm2bDDJAoGATytFNxen6GtC0ZT3SRQM
WYfasdf3xbtuykmnluiofasd2sfmjnljkt7khghmghdasSDFGQfgaFoKfaawoYeH
C2XasVUsVviBn8kPSLSVBPX4JUfQmA6h8HsajeVahxN1U9e0nYJ0sYDQFUMTS2t8
RT57+WK/0ONwTWHdu+KnaJECgYEAid/ta8LQC3p82iNAZkpWlGDSD2yb/8rH8NQg
9tjEryFwrbMtfX9qn+8srx06B796U3OjifstjJQNmVI0qNlsJpQK8fPwVxRxbJS/
pMbNICrf3sUa4sZgDOFfkeuSlgACh4cVIozDXlR59Z8Y3CoiW0uObEgvMDIfenAj
98pl3ZkCgYEAj/UCSni0dwX4pnKNPm6LUgiS7QvIgM3H9piyt8aipQuzBi5LUKWw
DlQC4Zb73nHgdREtQYYXTu7p27Bl0Gizz1sW2eSgxFU8eTh+ucfVwOXKAXKU5SeI
+MbuBfUYQ4if2N/BXn47+/ecf3A4KgB37Le5SbLDddwCNxGlBzbpBa0=
-----END RSA PRIVATE KEY-----"""

private_key = paramiko.RSAKey(file_obj=StringIO(key_str))
transport = paramiko.Transport(('10.0.1.40', 22))
transport.connect(username='root', pkey=private_key)

ssh = paramiko.SSHClient()
ssh._transport = transport

stdin, stdout, stderr = ssh.exec_command('df')
result = stdout.read()

transport.close()

print(result)
```

## 2\. `SFTPClient`

用于连接远程服务器并执行上传下载

基于用户名密码上传下载

```
import paramiko

transport = paramiko.Transport(('hostname',22))
transport.connect(username='root',password='123')

sftp = paramiko.SFTPClient.from_transport(transport)
# 将location.py 上传至服务器 /tmp/test.py
sftp.put('/tmp/location.py', '/tmp/test.py')
# 将remove_path 下载到本地 local_path
sftp.get('remove_path', 'local_path')

transport.close()
```

基于公钥密钥上传下载

```
import paramiko

private_key = paramiko.RSAKey.from_private_key_file('/home/auto/.ssh/id_rsa')

transport = paramiko.Transport(('hostname', 22))
transport.connect(username='root', pkey=private_key )

sftp = paramiko.SFTPClient.from_transport(transport)
# 将location.py 上传至服务器 /tmp/test.py
sftp.put('/tmp/location.py', '/tmp/test.py')
# 将remove_path 下载到本地 local_path
sftp.get('remove_path', 'local_path')

transport.close()
```

demo

```
#!/usr/bin/env python
# -*- coding:utf-8 -*-
import paramiko
import uuid

class Haproxy(object):

    def __init__(self):
        self.host = '172.16.103.191'
        self.port = 22
        self.username = 'root'
        self.pwd = '123'
        self.__k = None

    def create_file(self):
        file_name = str(uuid.uuid4())
        with open(file_name,'w') as f:
            f.write('sb')
        return file_name

    def run(self):
        self.connect()
        self.upload()
        self.rename()
        self.close()

    def connect(self):
        transport = paramiko.Transport((self.host,self.port))
        transport.connect(username=self.username,password=self.pwd)
        self.__transport = transport

    def close(self):

        self.__transport.close()

    def upload(self):
        # 连接，上传
        file_name = self.create_file()

        sftp = paramiko.SFTPClient.from_transport(self.__transport)
        # 将location.py 上传至服务器 /tmp/test.py
        sftp.put(file_name, '/home/root/tttttttttttt.py')

    def rename(self):

        ssh = paramiko.SSHClient()
        ssh._transport = self.__transport
        # 执行命令
        stdin, stdout, stderr = ssh.exec_command('mv /home/root/tttttttttttt.py /home/root/ooooooooo.py')
        # 获取命令结果
        result = stdout.read()


ha = Haproxy()
ha.run()
```
