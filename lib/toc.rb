require 'redcarpet'

module TOC
  class << self
    def registered(app)
      app.helpers Helpers
    end
    alias :included :registered
  end

  module TableOfContents
    extend self

    def anchorify(text)
      text.gsub(/&#?\w+;/, '-').gsub(/\W+/, '-').gsub(/^-|-$/, '').downcase
    end
  end

  module Helpers
    def index_for(data)
      result = '<ol id="toc-list">'

      data.each_entry do |section, entries|
        next if entries.any? do |entry|
          entry[:skip_sidebar]
        end

        request_path_splits = request.path.split('/')

        current_url = request_path_splits[1]
        sub_url     = request_path_splits[2]
        intro_page  = request_path_splits.length == 3
        sub_url     = nil if intro_page
        chapter     = entries[0].url.split("/")[0]

        current = (chapter == current_url)

        result << %Q{
          <li class="level-1#{current ? ' selected' : ''}">
            <a href="/guides/#{entries[0].url}">#{section}</a>
            <ol#{current ? " class='selected'" : ''}>
        }

        entries.each do |entry|
          current_segment = entry.url.split("/")[1]

          sub_current = if current_segment and current_segment == sub_url
            true
          elsif intro_page and current_url == entry.url
            true
          else
            false
          end

          result << %Q{
            <li class="level-3#{sub_current ? ' sub-selected' : ''}">
              <a href="/guides/#{entry.url}">#{entry.title}</a>
            </li>
          }
        end

        result << '</ol></li>'
      end

      result << '</ol>'

      result
    end

    def chapter_name
      guides = data.guides

      sub_url = request.path.split('/')[1]
      heading = ''

      guides.each_entry do |section, entries|
        if entries[0].url.split('/')[0] == sub_url
          heading = section
          break
        end
      end
      heading
    end

    def chapter_heading
      name = chapter_name.strip
      return if name.blank?
      %Q{<h1>#{name}</h1>}
    end

    def section_slug
      request.path.split('/')[1]
    end

    def guide_slug
      request.path.split('/')[1..-2].join('/')
    end

    def current_section
      section_prefix = section_slug + "/"
      data.guides.find do |section, entries|
        entries.find do |entry|
          entry.url.starts_with? section_prefix
        end
      end
    end

    def current_guide
      if guide_slug == 'index.html'
        current_section[1][0]
      else
        current_section[1].find do |guide|
          guide.url == guide_slug
        end
      end
    end

    def chapter_links
      %Q{
      <footer>
        #{previous_chapter_link} #{next_chapter_link}
      </footer>
      }
    end

    def previous_chapter_link
      if previous_chapter
        %Q{
          <a class="previous-guide" href="/guides/#{previous_chapter.url}">
            \u2190 #{previous_chapter.title}
          </a>
        }
      elsif whats_before = previous_guide
        previous_chapter = whats_before[1][-1]
        %Q{
          <a class="previous-guide" href="/guides/#{previous_chapter.url}">
             \u2190 #{whats_before[0]}: #{previous_chapter.title}
          </a>
        }
      else
        ''
      end
    end

    def next_chapter_link
      if next_chapter
      %Q{
        <a class="next-guide" href="/guides/#{next_chapter.url}">
          #{next_chapter.title} \u2192
        </a>
      }
      elsif whats_next = next_guide
        next_chapter = whats_next[1][0]
        %Q{
          <a class="next-guide" href="/guides/#{next_chapter.url}">
             We're done with #{current_section[0]}. Next up: #{whats_next[0]} - #{next_chapter.title} \u2192
          </a>
        }
      else
        ''
      end
    end

    def previous_chapter
      return if not current_section

      guides = current_section[1]
      current_index = guides.find_index(current_guide)

      return unless current_index

      if current_index != 0
        guides[current_index-1]
      else
        nil
      end
    end

    def next_chapter
      return if not current_section

      guides = current_section[1]
      current_index = guides.find_index(current_guide)
      return unless current_index

      next_guide_index = current_index + 1

      if current_index < guides.length
        guides[next_guide_index]
      else
        nil
      end
    end

    def next_guide
      return if not current_section
      guide = current_section[0]
      current_guide_index = data.guides.keys.find_index(guide)

      return unless current_guide_index

      next_guide_index = current_guide_index + 1

      if current_guide_index < data.guides.length
        data.guides.entries[next_guide_index]
      else
        nil
      end
    end

    def previous_guide
      return if not current_section
      guide = current_section[0]

      current_guide_index = data.guides.keys.find_index(guide)
      return unless current_guide_index

      previous_guide_index = current_guide_index - 1

      if previous_guide_index >= 0
        data.guides.entries[previous_guide_index]
      else
        nil
      end
    end

  end
end

::Middleman::Extensions.register(:toc, TOC)
