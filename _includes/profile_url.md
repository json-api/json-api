{% comment %}
  Takes the page object for a JSON:API profile spec and returns its url. 
  This file can't have whitespace outside this comment block or else the 
  output will be corrupted.
{% endcomment %}{{ include.page.url | absolute_url | split: "/" | where_exp: "item", "item != 'index'" | join: "/" }}/