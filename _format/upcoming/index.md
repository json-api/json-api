---
is_upcoming_version: true
---
{% for spec_draft in site.format %}
  {% if spec_draft.version > site.latest_version %}
    {% comment %}
      The line below must be outdented (ugly as that is) or it will be parsed
      differently, since indentation can be significant in markdown (e.g. to
      indicate code blocks).
    {% endcomment %}

{{ spec_draft.content }}

  {% endif %}
{% endfor %}
