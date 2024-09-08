hexo.extend.filter.register('before_post_render', function (data) {
  if (typeof data.tags === 'string') {
    data.tags = data.tags.split(',').map(tag => tag.trim());
  }
  return data;
});
