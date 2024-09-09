hexo.extend.filter.register('before_post_render', function (data) {
  // 处理标签
  if (typeof data.tags === 'string') {
    data.tags = data.tags.split(/[\s,]+/).map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  // 处理分类
  if (typeof data.categories === 'string') {
    data.categories = data.categories.split(/[\s,]+/).map(category => category.trim()).filter(category => category.length > 0);
  }

  return data;
});
