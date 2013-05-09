require 'redcard/1.9'

def preview(browser=false)
  pids = [
    Process.spawn("bundle exec jekyll serve --watch"),
    Process.spawn("bundle exec scss --compass --watch stylesheets/")
  ]

  if browser
    STDERR.puts "Opening a browser to preview the site..."
    STDERR.puts "  You may need to refresh the page if the server hasn't loaded yet."
    sleep 2
    pids << Process.spawn("bundle exec launchy http://localhost:9876")
  end

  Signal.trap "INT" do
    pids.each { |pid| Process.kill :INT, pid }
  end

  Process.waitall
end

desc "Build the site and host it localhost:9876"
task :preview do
  preview
end

namespace :preview do
  desc "Build the site and open localhost:9876 in the default browser"
  task :browser do
    preview true
  end
end
