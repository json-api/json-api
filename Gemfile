source "https://rubygems.org"

# http://jekyllrb.com/docs/github-pages/
require 'json'
require 'open-uri'
versions =
  begin
    JSON.parse(open('https://pages.github.com/versions.json').read)
  rescue SocketError
    { 'github-pages' => 67 }
  end

gem 'github-pages', versions['github-pages']

gem "rake", "~> 10.0"
gem "rb-fsevent", "~> 0.9"
gem "compass", "~> 1.0"
gem "sass", "~> 3.4"
gem "launchy", "~> 2.3"
gem "redcard", "~> 1.0"
