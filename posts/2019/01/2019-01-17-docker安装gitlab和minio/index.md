---
title: "docker安装gitlab和minio"
date: "2019-01-17"
categories: 
  - "system-operations"
tags: 
  - "gitlab"
  - "minio"
---

# docker安装gitlab和minio

\[TOC\]

前面文章《GitLab在docker和Kubernetes之间折腾》中docker版本开启了lfs使用minio，但是当前docker版Gitlab-CE中是没有minio的，所以需要单独安装。

## 1\. gitlab和minio安装

```bash
mkdir -p /data/gitlab/data /data/gitlab/config /data/gitlab/logs
mkdir -p /data/minio/data /data/minio/config

docker run --detach \
  --hostname gitlab.utcook.com \
  --publish 443:443 --publish 80:80 --publish 10022:22 \
  --name gitlab \
  --restart always \
  --volume /data/gitlab/config:/etc/gitlab \
  --volume /data/gitlab/logs:/var/log/gitlab \
  --volume /data/gitlab/data:/var/opt/gitlab \
  gitlab/gitlab-ce:latest

docker run --detach -p 9000:9000 --name minio \
  -v /data/minio/data:/data \
  -v /data/minio/config:/root/.minio \
    --restart always \
  -e "MINIO_ACCESS_KEY=Z1Xh28dpKo0Oc9Xjjq35n0lCceGYxHmGwpibz2WQ9acLtiUTBHftVTKxcLiISSld" \
  -e "MINIO_SECRET_KEY=ebRmMNRHh9R9ve869SkspkC3xMOyPBmo0FGhud4JqBZu7zjuiMCu36xn7aEVNEeT" \
  minio/minio server /data

docker inspect minio  # 获取minio地址
```

## 2\. gitlab lfs启用minio和创建bucket

gitlab.rb开启lfs功能

```
### Job Artifacts
# gitlab_rails['artifacts_enabled'] = true
# gitlab_rails['artifacts_path'] = "/var/opt/gitlab/gitlab-rails/shared/artifacts"
####! Job artifacts Object Store
####! Docs: https://docs.gitlab.com/ee/administration/job_artifacts.html#using-object-storage
gitlab_rails['artifacts_object_store_enabled'] = true
gitlab_rails['artifacts_object_store_direct_upload'] = true
gitlab_rails['artifacts_object_store_background_upload'] = true
gitlab_rails['artifacts_object_store_proxy_download'] = true
gitlab_rails['artifacts_object_store_remote_directory'] = "artifacts"
gitlab_rails['artifacts_object_store_connection'] = {
'provider' => 'AWS',
'region' => 'eu-west-1',
'aws_access_key_id' => 'Z1Xh28dpKo0Oc9Xjjq35n0lCceGYxHmGwpibz2WQ9acLtiUTBHftVTKxcLiISSld',
'aws_secret_access_key' => 'ebRmMNRHh9R9ve869SkspkC3xMOyPBmo0FGhud4JqBZu7zjuiMCu36xn7aEVNEeT',
# # The below options configure an S3 compatible host instead of AWS
'aws_signature_version' => 4, # For creation of signed URLs. Set to 2 if provider does not support v4.
'endpoint' => 'http://minio地址:9000', # default: nil - Useful for S3 compliant services such as DigitalOcean Spaces
'host' => 'localhost',
'path_style' => true # Use 'host/bucket_name/object' instead of 'bucket_name.host/object'
}

### Git LFS
gitlab_rails['lfs_enabled'] = true
gitlab_rails['lfs_storage_path'] = "/var/opt/gitlab/gitlab-rails/shared/lfs-objects"
gitlab_rails['lfs_object_store_enabled'] = true
gitlab_rails['lfs_object_store_direct_upload'] = true
gitlab_rails['lfs_object_store_background_upload'] = true
gitlab_rails['lfs_object_store_proxy_download'] = true
gitlab_rails['lfs_object_store_remote_directory'] = "lfs-objects"
gitlab_rails['lfs_object_store_connection'] = {
'provider' => 'AWS',
'region' => 'eu-west-1',
'aws_access_key_id' => 'Z1Xh28dpKo0Oc9Xjjq35n0lCceGYxHmGwpibz2WQ9acLtiUTBHftVTKxcLiISSld',
'aws_secret_access_key' => 'ebRmMNRHh9R9ve869SkspkC3xMOyPBmo0FGhud4JqBZu7zjuiMCu36xn7aEVNEeT#',
# # The below options configure an S3 compatible host instead of AWS
'aws_signature_version' => 4, # For creation of signed URLs. Set to 2 if provider does not support v4.
# 'endpoint' => 'https://s3.amazonaws.com', # default: nil - Useful for S3 compliant services such as DigitalOcean Spaces
'host' => 'localhost',
'endpoint' => 'http://minio地址:9000',
'path_style' => true
# # 'path_style' => false # Use 'host/bucket_name/object' instead of 'bucket_name.host/object'
}

### GitLab uploads
###! Docs: https://docs.gitlab.com/ee/administration/uploads.html
gitlab_rails['uploads_storage_path'] = "/var/opt/gitlab/gitlab-rails/public"
gitlab_rails['uploads_base_dir'] = "uploads/-/system"
gitlab_rails['uploads_object_store_enabled'] = true
gitlab_rails['uploads_object_store_direct_upload'] = true
gitlab_rails['uploads_object_store_background_upload'] = true
gitlab_rails['uploads_object_store_proxy_download'] = true
gitlab_rails['uploads_object_store_remote_directory'] = "uploads"
gitlab_rails['uploads_object_store_connection'] = {
'provider' => 'AWS',
'region' => 'eu-west-1',
'aws_access_key_id' => 'Z1Xh28dpKo0Oc9Xjjq35n0lCceGYxHmGwpibz2WQ9acLtiUTBHftVTKxcLiISSld',
'aws_secret_access_key' => 'ebRmMNRHh9R9ve869SkspkC3xMOyPBmo0FGhud4JqBZu7zjuiMCu36xn7aEVNEeT',
# # # The below options configure an S3 compatible host instead of AWS
'host' => 'localhost',
'aws_signature_version' => 4, # For creation of signed URLs. Set to 2 if provider does not support v4.
'endpoint' => 'http://minio地址:9000', # default: nil - Useful for S3 compliant services such as DigitalOcean Spaces
'path_style' => true # Use 'host/bucket_name/object' instead of 'bucket_name.host/object'
}
```

登录页面或者使用mc命令和下面脚本创建相关bucket。

```bash
wget https://dl.minio.io/client/mc/release/linux-amd64/mc -O /usr/bin/mc
chmod +x /usr/bin/mc
mc --help
```

`vim add_bucket.sh`

```bash
#!/bin/sh
# minio/mc container has Busybox Ash, be sure to be POSIX compliant and avoid Bash-isms
set -e ; # Have script exit in the event of a failed command.

# connectToMinio
# Use a check-sleep-check loop to wait for Minio service to be available
connectToMinio() {
  set -e ; # fail if we can't read the keys.
  MINIO_ENDPOINT="172.17.0.5" ;  # minio容器IP
  MINIO_PORT=9000 ;
  ACCESS="Z1Xh28dpKo0Oc9Xjjq35n0lCceGYxHmGwpibz2WQ9acLtiUTBHftVTKxcLiISSld" ;
  SECRET="ebRmMNRHh9R9ve869SkspkC3xMOyPBmo0FGhud4JqBZu7zjuiMCu36xn7aEVNEeT" ;
  set +e ; # The connections to minio are allowed to fail.
  echo "Connecting to Minio server: http://$MINIO_ENDPOINT:$MINIO_PORT" ;
  MC_COMMAND="mc config host add myminio http://$MINIO_ENDPOINT:$MINIO_PORT $ACCESS $SECRET" ;
  $MC_COMMAND ;
  STATUS=$? ;
  until [ $STATUS -eq 0 ] ;
  do
    sleep 1 ; # 1 second intervals between attempts
    $MC_COMMAND ;
    STATUS=$? ;
  done ;
  set -e ; # reset `e` as active
  return 0
}

# checkBucketExists ($bucket)
# Check if the bucket exists, by using the exit code of `mc ls`
checkBucketExists() {
  BUCKET=$1
  CMD=$(/usr/bin/mc ls myminio/$BUCKET > /dev/null 2>&1)
  return $?
}

# createBucket ($bucket, $policy, $purge)
# Ensure bucket exists, purging if asked to
createBucket() {
  BUCKET=$1
  POLICY=$2
  PURGE=$3


  # Purge the bucket, if set & exists
  # Since PURGE is user input, check explicitly for `true`
  if [ $PURGE = true ]; then
    if checkBucketExists $BUCKET ; then
      echo "Purging bucket '$BUCKET'."
      set +e ; # don't exit if this fails
      /usr/bin/mc rm -r --force myminio/$BUCKET
      set -e ; # reset `e` as active
    else
      echo "Bucket '$BUCKET' does not exist, skipping purge."
    fi
  fi

  # Create the bucket if it does not exist
  if ! checkBucketExists $BUCKET ; then
    echo "Creating bucket '$BUCKET'"
    /usr/bin/mc mb myminio/$BUCKET
  else
    echo "Bucket '$BUCKET' already exists."
  fi

  # At this point, the bucket should exist, skip checking for existance
  # Set policy on the bucket
  echo "Setting policy of bucket '$BUCKET' to '$POLICY'."
  /usr/bin/mc policy $POLICY myminio/$BUCKET
}

connectToMinio
createBucket registry none false
createBucket git-lfs none false
createBucket runner-cache none false
createBucket uploads none false
createBucket artifacts none false
createBucket backups none false
createBucket packages none false
createBucket tmp none false
createBucket pseudo none false
```
