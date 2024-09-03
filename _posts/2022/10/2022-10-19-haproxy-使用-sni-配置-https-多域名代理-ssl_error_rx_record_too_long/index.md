---
title: "Haproxy 使用 sni 配置 https 多域名 proxy SSL_ERROR_RX_RECORD_TOO_LONG"
date: "2022-10-19"
categories: 
  - "system-operations"
tags: 
  - "haproxy"
  - "https"
---

Haproxy 使用 sni 配置 https 多域名 proxy 时，出现 `NSS error -12263 (SSL_ERROR_RX_RECORD_TOO_LONG) SSL received a record that exceeded the maximum permissible length.` 报错，解决办法是在 haproxy 配置中，将 `defaults` 下面的 `mode` 修改成 `tcp` 即可。 即：

```
defaults
    mode                    http
```

改成

```
defaults
    mode                    tcp
```
