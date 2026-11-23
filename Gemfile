# frozen_string_literal: true

source "https://rubygems.org"

gem "jekyll", "~> 4.3"

group :jekyll_plugins do
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
  gem "jekyll-feed"
end

gem "html-proofer", "~> 5.0", group: :test

# Ruby 3.x 에서는 webrick 이 기본 번들이 아니다 (jekyll serve 용)
gem "webrick", "~> 1.8"

platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end
