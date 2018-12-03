---
layout: page
title: Extensions
show_sidebar: true
redirect_from: /profiles
---

> Note: This page describes features from [version 1.1](/format/1.1/) of the JSON:API spec, and links to profiles that use those new features. Version 1.1 is in its release candidate stage, so there is a (very small) probability that the spec and/or these profiles could change before v1.1 is released on January 31, 2019 (provided there are two compliant implementations by that date; if not the release will wait until such implementations exist to prove its viability).

JSON:API can be extended with profiles. These profiles enable an API to
provide clients with information or functionality beyond that described
in the base JSON:API specification.

Anyone can author a profile, and a single profile can be reused by multiple APIs.
Popular profiles may be implemented by off-the-shelf tools so that developers
can seamlessly take advantage of the features these profiles provide.

## <a href="#existing-profiles" id="existing-profiles" class="headerlink"></a> Existing Profiles

{% for category in site.profile_categories %}
  <h3 id="#profiles-category-{{ category | slugify }}">
    {{ category }}
  </h3>
  <dl class="profiles-list">
    {% for profile in site.profiles %}
      {% if profile.categories contains category %}
        <dt><a href="{% include profile_url.md page=profile %}">{{ profile.name }}</a></dt>
        <dd>{{ profile.short_description }}</dd>
      {% endif %}
    {% endfor %}
  </dl>
{% endfor %}

## <a href="#profile-creation" id="profile-creation" class="headerlink"></a> Creating a New Profile

### <a href="#profile-creation-before" id="profile-creation-before" class="headerlink"></a> Before Creating a Profile

Please **check whether an existing profile fits your needs or could be amended
to fit your needs** before developing a new one.

- If a suitable profile already exists, consider using it. Having fewer, more
widely-deployed profiles makes it easier to create shared tooling.

- If there's an existing profile that could be amended to fit your needs,
consider asking the profile's author if they would be willing to modify it as
needed. Contact them through the information in their profile's registration
and give them some time to reply.

### <a href="#profile-creation" id="profile-creation" class="headerlink"></a> Authoring Your Profile

To author your profile, [download and fill out the template](/profile_template.md).

### <a href="#profile-register" id="profile-register" class="headerlink"></a> Register & Use Your Profile

Once you've authored your profile, submit it to the JSON:API profile registry.
By registering your profile:

1. it will be listed above for others to find and reuse.

2. it will be given an official url on jsonapi.org. This will be the URL you and
   others use to apply/identify the profile.

3. one of the JSON:API's editors will review your submission to check that it
   follows the [requirements for profiles](/format/1.1/#profiles-authoring).
   These requirements can be a bit tricky, so getting an expert review ensures
   that your profile is legal for use with JSON:API.

To register your profile:

1. Choose a namespace, which is a name that uniquely identifies you or your
   organization. (All profiles authored by the same person or organization are
   registered under the same namespace, to prevent naming conflicts.) This
   namespace should be your Github username, or the name of a Github organization
   to which you belong. In unusual circumstances, you can request to use a
   different name as the namespace in your PR (see below).

2. Create a PR to [the json-api repository](https://github.com/json-api/json-api).
   In the PR, make a directory at `_profiles/{NAMESPACE}/{PROFILE_NAME}` (where
   `PROFILE_NAME` is the name of your profile, dasherized), and put your filled
   out template as the `index.md` file in that directory folder. (See [an example](https://github.com/json-api/json-api/tree/gh-pages/_profiles/ethanresnick/cursor-pagination).)

Once submitted, one of JSON:API's editors will review your profile to check that
it: 1) follows the template above; 2) complies with JSON:API's [requirements for profiles](/format/1.1/#profiles-authoring);
and 3) wouldn't cause any problems were it to become widely adopted. If your
profile meets these three criteria, it will generally be **approved within a week**.

In limited cases (e.g., if your profile defines a new, fundamental mechanism for
doing something "architectural" that other profiles may need to do too), it might
take longer for the reviewer to adequately check that the profile wouldn't have
problematic ramifications if it became widely adopted.

As part of this review, the editors or the community might also give design
feedback on your submission. You can take as much time as you'd like to act on/
respond to this feedback, and the editors will wait for you to say that your
submission is finalized before merging your PR. You are encouraged, but not
required, to act on any design feedback.

If you do change your submission after it's been reviewed, it will be re-reviewed
to make sure it still complies with the requirements for approval given above.

JSON:API's editors may occasionally reassign responsibility for a registered
profile. The most common reason for this will be to enable changes to be made
to profiles where the author of the registration has died, moved out of contact 
or is otherwise unable to make changes that are important to the community.

Even though profile registration is strongly encouraged, it is not mandatory.
If you choose not to register your profile, you can create your own URL, on
a domain you control, and use that to identify your profile. You should
self-host the filled out template at this URL.

## <a href="#prior-extensions" id="prior-extensions" class="headerlink"></a> Prior Extensions

JSON:API previously offered experimental support for a different extension
negotiation system than the one now in the specification, and it provided a
number of extensions for use with that old negotiation system. However, this
system was always experimental and has now been deprecated.

New APIs should not use the old system or any extensions designed for it.
APIs that already use these old extensions should direct clients to an
[earlier version of this page](https://github.com/json-api/json-api/blob/9c7a03dbc37f80f6ca81b16d444c960e96dd7a57/extensions/index.md)
as documentation.
