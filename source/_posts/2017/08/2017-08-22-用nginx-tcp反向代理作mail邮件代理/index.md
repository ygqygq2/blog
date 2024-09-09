---
title: "用nginx TCP反向代理作mail邮件代理"
date: "2017-08-22"
categories:
  - "system-operations"
tags:
  - "nginx"
  - "反向代理"
---

# 用 nginx TCP 反向代理作 mail 邮件代理

[TOC]

## 1\. 背景

新版本 nginx 有 TCP 反向代理功能，nginx 的 mail proxy 配置认证又太麻烦，于是就想用 TCP 反向功能作 mail 代理。

## 2\. Nginx 安装（包括 nginx_upstream_check_module）

```
cd /tmp
tar zxf pcre-8.35.tar.gz
cd pcre-8.35/
./configure --prefix=/usr/local/pcre
make
make install

cd /tmp
tar zxf openssl-1.0.2g.tar.gz
cd openssl-1.0.2g/
./config enable-tl***t
make
make install
mv -f /usr/bin/openssl /usr/bin/openssl.old
mv -f /usr/include/openssl /usr/include/openssl.old
ln -sf /usr/local/ssl/bin/openssl /usr/bin/openssl
ln -sf /usr/local/ssl/include/openssl /usr/include/openssl

cd /tmp
git clone git@github.com:yaoweibin/nginx_upstream_check_module.git

cd /tmp
tar zxf nginx-1.13.4.tar.gz
cd nginx-1.13.4/
patch -p1 < ../nginx_upstream_check_module/check_1.12.1+.patch
./configure --user=www --group=www --prefix=/usr/local/nginx --with-http_stub_status_module --with-stream=dynamic --with-stream_ssl_module --with-pcre=../pcre-8.35 --with-http_ssl_module --with-openssl=../openssl-1.0.2g --add-module=../nginx_upstream_check_module
make
make install
```

## 3\. Nginx 配置

`cat nginx.conf`

```
user  www;
worker_processes  8;

error_log  logs/info.log  info;

#pid        logs/nginx.pid;

load_module modules/ngx_stream_module.so;  # 此处要添加模块

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

    #设定请求缓冲
    server_names_hash_bucket_size 128;
    client_header_buffer_size 32k;
    large_client_header_buffers 4 32k;
    client_max_body_size 300m;
    #sendfile on;
    tcp_nopush     on;
    #keepalive_timeout 60;
    tcp_nodelay on;
    server_tokens off;
    client_body_buffer_size 512k;
    proxy_connect_timeout   20;
    proxy_send_timeout      60;
    proxy_read_timeout      20;
    proxy_buffer_size       16k;
    proxy_buffers           4 64k;
    proxy_busy_buffers_size 128k;
    proxy_temp_file_write_size 128k;
    client_header_timeout  3m;
    client_body_timeout    3m;
    send_timeout           3m;


    gzip on;#开启gzip，节省带宽
    gzip_min_length  1100;
    gzip_buffers     4 8k;
    gzip_types       text/plain text/css application/x-javascript image/bmp application/javascript;

    output_buffers   1 32k;
    postpone_output  1460;

    limit_rate_after 3m;#限速模块，前3M下载时不限速
    limit_rate 512k; #限速模块


include vhost/*.conf;

}

stream {
include stream/*.conf;
}
```

`cat stream/mail_pro.conf`

```
######### TCP 反向代理负载均衡设置 ###############
upstream mailsmtp_pro {
        server smtp.mxhichina.com:25;
}

server {
        listen 25; # 对外提供服务TCP监听
        proxy_connect_timeout 5s;
        proxy_timeout 5s;
        proxy_pass mailsmtp_pro;
}
```

## 4\. 总结

Nginx 功能强大，此文也是给想使用 TCP 反向代理的朋友作个示例参考吧。
