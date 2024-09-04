# ruby
# coding: utf-8
# frozen_string_literal: true

Gem::Specification.new do |s|
  s.name          = 'blog'
  s.version       = '0.1.0'
  s.authors       = ['Fábio Madeira', 'Contributors']
  s.email         = ['biomadeira@icloud.com']
  s.homepage      = 'https://github.com/ygqygq2/blog'
  s.summary       = "老杨的博客 - 记录 IT 人生"

  s.files         = `git ls-files -z`.split("\x0").select do |f|
    f.match(%r{^(assets|about|_(includes|layouts|data|plugins|posts)/|(LICENSE|README)((\.(txt|md)|$)))}i)
  end

  s.platform      = Gem::Platform::RUBY
  s.license       = 'MIT'

  s.add_dependency 'jekyll', '> 3.9', '< 5.0'
  s.add_dependency 'jekyll-paginate', '~> 1.1'
  s.add_dependency 'jekyll-feed', '~> 0.15'
  s.add_development_dependency 'rake', '~> 13.0'
  s.add_development_dependency 'slugify', '~> 1.0'
end
