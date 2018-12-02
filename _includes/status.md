{% comment %}
  On the different version pages, make the status message dynamic in
  the same way the title is.
{% endcomment %}

{% assign version = include.version %}
{% assign is_latest_version_page = include.is_latest_version %}
{% assign status = include.status %}

## <a href="#status" id="status" class="headerlink"></a> Status

{% comment %}
  The first paragraph in each case below aims to explain what content
  the page holds and whether that content is finalized.

  Note: all the text below must be outdented and markdownified where it's
  included for it to be rendered correctly as markdown.
{% endcomment %}

{% if is_latest_version_page %}
  This page presents the latest published version of JSON:API, which is
  currently version {{ site.latest_version }}. New versions of JSON:API **will
  always be backwards compatible** using a _never remove, only add_ strategy.
  Additions can be proposed in our [discussion forum](http://discuss.jsonapi.org/).

{% elsif version and version > site.latest_version %}
  This page will always present the most recent text for JSON:API v{{ site.latest_version|plus:0.1 }}.
  Version {{ site.latest_version|plus:0.1 }} is a **{% if status == "rc" %}release 
  candidate{% else %}working draft{% endif %}**. As such, the content on this 
  page {% if status != "rc" %}is subject to change.{% else %}is unlikely to 
  change. However, some changes may still occur if implementation experience 
  proves that they are necessary before this version is finalized.{% endif %}

  {% if include.release_date %}
  This version is expected to be finalized and released on **{{ include.release_date | date: "%B %e, %Y" }}** 
  (provided there are two compliant implementations by that date; if not the 
  release will wait until such implementations exist to prove its viability).
  {% endif %}

{% elsif version and version == site.latest_version %}
  This page presents an archived copy of JSON:API version {{ version }}. None
  of the normative text on this page will change. **Subsequent versions of
  JSON:API will remain compatible with this one**, as JSON:API uses a _never
  remove, only add_ strategy.

{% else %}
  This page presents an archived copy of JSON:API version {{ version }}. None
  of the normative text on this page will change. While {{ version }} is no
  longer the [latest version](/format/) of JSON:API, **new versions will remain
  compatible with this one**, as JSON:API uses a _never remove, only add_ strategy.
{% endif %}

{% comment %}
  Now, add a second (and sometimes third) paragraph for the different cases,
  indicating the type of feedback we want (user/implementor concerns, error
  reports, proposed additions, etc) for that case and the best way to submit it.
{% endcomment %}

{% if is_latest_version_page or (version and version <= site.latest_version) %}
  If you catch an error in the specification&rsquo;s text, or if you write an
  implementation, please let us know by opening an issue or pull request at our
  [GitHub repository](https://github.com/json-api/json-api).

{% else %}
  If you have concerns about the changes in this draft, catch an error in the
  specification&rsquo;s text, or write an implementation, please let us know by
  opening an issue or pull request at our [GitHub repository](https://github.com/json-api/json-api).

  You can also propose additions to JSON:API in our [discussion forum](http://discuss.jsonapi.org/).
  Keep in mind, though, that all new versions of JSON:API **must be backwards
  compatible** using a _never remove, only add_ strategy.
{% endif %}
