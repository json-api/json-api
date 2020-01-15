---
layout: page
title: Extensions
show_sidebar: true
redirect_from: /profiles
---

> Note: This page describes features from [version 1.1](/format/1.1/) of the JSON:API spec, and links to profiles that use those new features. Version 1.1 is in development, so there is a chance that the spec and/or these profiles could change before v1.1 is released.

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

## <a href="#profile-template" id="profile-template" class="headerlink"></a> Profile Template

[Download and fill out the profile template](/profile_template.md).

## <a href="#profile-creation" id="profile-creation" class="headerlink"></a> Authoring Your Profile

Profiles are a mechanism that can be used by the sender of a document to make promises about its content, without adding to or altering the basic semantics of the JSON:API specification. For example, a profile may indicate that all resource objects will have a `timestamps` attribute field and that the members of the `timestamps` object will be formatted using the ISO 8601 date time format.

A profile is an independent specification of those promises. The following example illustrates how the aforementioned profile might be authored:

<a id="profiles-timestamp-profile"></a>
```text
# Timestamps profile

## Introduction

This page specifies a profile for the `application/vnd.api+json` media type,
as described in the [JSON:API specification](http://jsonapi.org/format/).

This profile allows every resource in a JSON:API document to represent
significant timestamps in a consistent way.

## Document Structure

Every resource object **MUST** include a `timestamps` member in its associated
`attributes` object. If this member is present, its value **MUST** be an object that
**MAY** contain at least one of the following members:

* `created`
* `updated`

The value of each member **MUST** comply with the variant of ISO 8601 used by
JavaScript's `JSON.stringify` method to format Javascript `Date` objects.
```

A profile **MAY** assign meaning to elements of the document structure whose use
is left up to each implementation, such as resource fields or members of
`attributes` or `meta` objects. A profile **MUST NOT** define/assign a meaning
to document members in areas of the document reserved for future use by the
JSON:API specification.

For example, it would be illegal for a profile to define a new key in a
document's [top-level][top level] object, or in a [links object][links], as
JSON API implementations are not allowed to add custom keys in those areas.

The scope of a profile **MUST** be clearly delineated. The elements specified
by a profile, and their meanings, **MUST NOT** change over time or else the
profile **MUST** be considered a new profile with a new URI.

> Note: When a profile changes its URI, a huge amount of interoperability is lost.
> Users that reference the new URI will not have their messages understood by
> implementations still aware only of the old URI, and vice-versa. Accordingly,
> it's important to design your profile so that it can evolve without its URI
> needing to change. See ["Revising a Profile"](#profiles-updating) for details.

Finally, a profile **MUST NOT**:

1. assume that, if it is supported, then other specific profiles will be
supported as well.

2. define fixed endpoints, HTTP headers, or header values.

3. alter the JSON structure of any concept defined in this specification,
including to allow a superset of JSON structures.

> If you create your own profile, you are **strongly encouraged to [register](/extensions/#profile-creation)
> it** with the JSON API [profile registry](/extensions/), so that others can
> find and reuse it.

#### <a href="#profiles-updating" id="profiles-updating" class="headerlink"></a> Revising a Profile

Profiles **MAY** be revised over time, e.g., to add new capabilities. However,
any such changes **MUST** be [backwards and forwards compatible](http://www.w3.org/2001/tag/doc/versioning-compatibility-strategies#terminology)
("compatible evolution"), in order to not break existing users of the profile.

For example, the hypothetical [timestamps profile] *could not* introduce a new,
required `deleted` member within the `timestamps` object, as that would be
incompatible with existing deployments of the profile, which would not include
this new member.

The timestamps profile also *could not* evolve to define a new element as a
sibling of the `timestamps` key, as that would be incompatible with the rule
that "The elements... specified by a profile... **MUST NOT** change over time."

> The practical issue with adding a sibling element is that another profile
> in use on the document might already define a sibling element of the same
> name.

However, the timestamps profile could evolve to allow other optional members,
such as `deleted`, in the `timestamps` object. This is possible because the
`timestamps` object is already a reserved element of the profile, and the profile
is subject to the default rule that new (previously unrecognized) keys will
simply be ignored by existing applications.

##### <a href="#profiles-design-for-evolution" id="profiles-design-for-evolution" class="headerlink"></a> Designing Profiles to Evolve Over Time

Fundamentally, for a profile to be able to change in a compatible way over time,
it must define -- from the beginning -- a rule describing how an application
that is only familiar with the original version of the profile should process
documents/requests that use features from an updated version of the profile.

One major approach is to simply have applications ignore (at least some types of)
unrecognized data. This allows the profile to define new, optional features;
old applications will continue to work, but simply won't process/"see" these new
capabilities.

This is essentially the strategy that JSON:API itself uses when it says that:

> Client and server implementations **MUST** ignore members not recognized by
> this specification.

Other protocols use analogous strategies. E.g., in HTTP, unknown headers are
simply ignored; they don't crash the processing of the request/response.

As a profile author, you may define your own rules for how applications should
process uses of the profile that contain unrecognized data, or you may simply
allow the default rules described in the ["Processing Profiled Documents/Requests"](#profiles-processing)
to take effect.

If you choose to use the default rules, you **SHOULD** reserve an object-valued
element anywhere you expect to potentially add new features over time.
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

Once submitted, one of JSON:API's editors will review your profile to check that it: 

1. follows the template above; 
2. is specified precisely enough to enable interoperable implementations;
3. complies with the JSON:API spec and its [requirements for profiles](/format/1.1/#profiles-authoring);
4. follows JSON:API's [recommended naming conventions](https://jsonapi.org/recommendations/#naming); and
5. wouldn't cause any problems were it to become widely adopted. 

If your profile meets these criteria, it will generally be **approved within a week**.

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
