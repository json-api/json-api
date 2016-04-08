source "https://rubygems.org"

# http://jekyllrb.com/docs/github-pages/
require 'json'
require 'open-uri'
versions =
  begin
    versions = JSON.parse(open('https://pages.github.com/versions.json').read)
    unless $skip_print_versions == true
      require 'pp'
      STDERR.puts 'Gem versions are:'
      pp versions
      $skip_print_versions = true
    end
    versions
  rescue SocketError
    { 'github-pages' => 52 }
  end

gem 'github-pages', versions['github-pages']

gem "rake", "~> 10.0"
gem "rb-fsevent", "~> 0.9"
gem "compass", "~> 1.0"
gem "sass", "~> 3.4"
gem "launchy", "~> 2.3"
gem "redcard", "~> 1.0"
