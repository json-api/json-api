require "redcarpet"
require "coderay"

module Highlighter
  class << self
    def registered(app)
      app.helpers Helpers
    end
    alias :included :registered
  end

  module Helpers
    def _highlight(string, language, class_name=nil)
      if language === "sequence"
        return %Q{<div class='diagram'>#{string}</div>}
      end
      result = %Q{<div class="highlight #{language} #{class_name}">}
      result += '<div class="ribbon"></div>'
      code = CodeRay.scan(string, language)
      result += code.div css: :class,
                      line_numbers: :table,
                      line_number_anchors: false

      result += %Q{</div>}
      result
    end

    def highlight(language, class_name, &block)
      concat(_highlight(capture(&block), language, class_name))
    end
  end

  class HighlightedHTML < Redcarpet::Render::HTML
    include Helpers

    #def header(text, level)
      #"<h#{level} class='anchorable-toc' id='toc_#{TOC::TableOfContents.anchorify(text)}'>#{text}</h#{level}>"
    #end

    def block_code(code, language)
      _highlight(code, language)
    end
  end
end

::Middleman::Extensions.register(:highlighter, Highlighter)
