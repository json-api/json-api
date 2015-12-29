---
layout: page
title: Extensions
show_sidebar: true
---

Extensions enable an API to provide clients with information or functionality
beyond that described in the base JSON API specification.

Anyone can author an extension, and a single extension can be reused by
multiple APIs. Popular extensions may be implemented by off-the-shelf tools
so that developers can seamlessly take advantage of the features these
extensions provide.

## <a href="#existing-extensions" id="existing-extensions" class="headerlink"></a> Existing Extensions

Patience, my friend. A list of existing extensions is coming very soon.

## <a href="#extension-registration" id="extension-registration" class="headerlink"></a> Registering a New Extension

### <a href="#extension-registration-before" id="extension-registration-before" class="headerlink"></a> Before You Register

Please **check whether existing extension fits your needs or could be amended
to fit your needs** before registering a new extension.

- If a suitable extension already exists, consider using it. Having fewer, more
widely-deployed extensions makes it easier to develop common tools.

- If there's an existing extension that could be amented to fit your needs,
consider asking the extension's author if they would be willing to modify it as
needed. Contact them through the information in their extension's registration
and give them a week or two to reply.

### <a href="#extension-registration-template" id="extension-registration-template" class="headerlink"></a> Registration Template

If you do decide to create a new extension, you must register it. Your extension
will be **approved within a week** by one of JSON API's editors, assuming it
meets the [profile extension requirements](/format/1.1/#extending-profile-extensions-characteristics).

To submit a registration request, simply copy the markdown template below, fill
it out, and post the result as an issue on our [GitHub](https://github.com/json-api/json-api)
or a new thread on our [discussion forum](http://discuss.jsonapi.org/).

> \# [Your Extension Name Here]
>
> Add a description here (no more than a paragraph) about your extension's
> purpose and features to help other users determine if it will work for them.
>
> \# (Optional) Minimum JSON API Version
>
> If your extension only works with certain versions of JSON API, you may note
> that here. Such a restriction would be appropriate if the values your
> extension defines can only be used in objects that were not present
> before a certain JSON API version.
>
> \# Specification
>
> In this section, describe the values that can occur as your extension's data,
> and the places where those values are allowed. This description should be
> detailed enough to allow for interoperable implementations, but it otherwise
> doesn't need to be formal.
>
> For reference, your extension may define values for use at the root level of:
>
> - the [document](/format/#document-top-level)
> - a [resource object](/format/#document-resource-objects) (i.e., as a sibling of the `type` and `id` keys)
> - a [relationship object](/format/#document-resource-object-relationships-relationship-object)
> - a [link object](/format/#document-links-link-object) (i.e., as a sibling of `href`)
> - a [resource identifier object](/format/#document-resource-identifier-objects)
> - an [error object](/format/#error-objects)
>
> Make sure your extension's specification follows the
> [profile extension requirements](/format/1.1/#extending-profile-extensions-characteristics)
> listed in the main specification, especially those on key naming and what an
> extension is not allowed to do.
>
> Finally, it is **strongly encouraged** that your extension:
>
> - Reuse objects, patterns, and key names from the main JSON API specification
>   where appropriate. For instance, if your extension defines a field that
>   points to another JSON API resource, that field should hold a resource
>   identifier object. Or, if your extension defines a "type" key, it should use
>   that key as JSON API does (i.e. to hold a string indicating a resource's type).
>
> - Include a rule that tells recipients how to handle data from your extension
>   that they don't understand. This will enable your extension to be added to
>   over time without breaking message recipients designed for the extension's
>   older format. ([Learn more.](http://davidbau.com/archives/2003/12/01/theory_of_compatibility_part_1.html))
>   For this rule, JSON API recommends the text:
>
>     <i>Recipients of a document containing this extension MUST ignore members
>     in this extension's data that they do not recognize.</i>
>
> \# Registrant Contact Information
>
> \- Name: <br />
> \- Email: <br />
> \- Website (Optional): <br/>
> \- Phone (Optional):

### <a href="#extension-registration-other" id="extension-registration-other" class="headerlink"></a> Other Information

The community may give you feedback on your registration request before it's
approved, but you are not required to act on this feedback; your extension _will_
be approved if it meets the requirements.

One caveat about the process and timeline outlined above: if your extension
defines a new, fundamental mechanism for doing something "architectural" that
other extensions may need to do too, it may be held for extra consideration.
This extra review is designed to check that the proposed mechanism, were it to
become a convention, wouldn't have problematic ramifications.

Finally, if the author of an extension has died, moved out of contact, or
otherwise can't or won't make changes that are important to the community, the
JSON API editors may reassign responsibility for the extension, to allow it to
continue to evolve.

## <a href="#deprecated-extensions" id="deprecated-extensions" class="headerlink"></a> Deprecated Extensions

JSON API previously offered experimental support for a different extension
negotiation system than the one now in the specification, and it provided a
number of extensions for use with that old negotiation system. However, this
system was always experimental and has now been deprecated.

New APIs should not use the old system or any extensions designed for it.
APIs that already use these old extensions should direct clients to an
[earlier version of this page](https://github.com/json-api/json-api/blob/9c7a03dbc37f80f6ca81b16d444c960e96dd7a57/extensions/index.md)
as documentation.
