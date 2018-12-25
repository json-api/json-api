{% comment %}
  When we embed the markdown from a user-provided profile specification
  inside the profile layout, we need to increment each heading level by 2.
  Kramdown, our markdown parser, provides a `header_offset` option, but
  Jekyll only allows us to set that globally -- and setting it globally 
  to two would break our other pages. So, this include lets us take arbitrary
  HTML (from rendered markdown) and does some liquid string replacements
  to offset its headings. This is pretty janky (even more so because liquid
  only allows us to do literal string replacement, not regex replacement),
  but I think it *should* work robustly, thanks to the fact that angle 
  brackets (i.e., `<` and `>`) aren't supposed to appear in HTML unencoded,
  and I imagine Kramdown respects that.
{% endcomment %}
{{ include.content
  | replace: "<h5", "<h6x"
  | replace: "<h4", "<h6x"
  | replace: "<h3", "<h5x"
  | replace: "<h2", "<h4x"
  | replace: "<h1", "<h3x"
  | replace: "</h1>", "</h3x>"
  | replace: "</h2>", "</h4x>"
  | replace: "</h3>", "</h5x>"
  | replace: "</h4>", "</h6x>"
  | replace: "</h5>", "</h6x>"
  | replace: "<h3x", "<h3"
  | replace: "<h4x", "<h4"
  | replace: "<h5x", "<h5"
  | replace: "<h6x", "<h6"
  | replace: "</h3x>", "</h3>"
  | replace: "</h4x>", "</h4>"
  | replace: "</h5x>", "</h5>"
  | replace: "</h6x>", "</h6>"
}}
