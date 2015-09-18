{% comment %}
  We have pages anchored to a specific versions of the spec and pages that
  always show the latest published version or draft. And, if we're dealing
  with a page anchored to a specific version, that version can either be the
  upcoming version, the current version, or an archived version. This
  necessitates a bunch of different title permutations, which this include is
  responsible for generating. The cases and handled below.

  This include gets three parameters: version, is_latest_version, and
  is_upcoming_version. version is set only for the pages that are anchored to
  a specific version number. The other two parameters represent whether we're
  we're dealing with the pages that always represent the latest/draft versions.
{% endcomment %}
{% assign version = include.version %}
{% assign is_latest_version_page = include.is_latest_version %}
{% assign is_upcoming_version_page = include.is_upcoming_version %}

{% if is_latest_version_page %}
  Latest Specification (v{{ site.latest_version }})

{% elsif is_upcoming_version_page %}
  Draft for Next Specification Release

{% elsif version and version > site.latest_version %}
  Specification v{{site.latest_version|plus:0.1}} (Still in Development)

{% else %}
  Specification v{{ version }} (Archived Copy)

{% endif %}
