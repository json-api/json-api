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

## <a href="#extension-creation" id="extension-creation" class="headerlink"></a> Creating a New Extension

### <a href="#extension-creation-before" id="extension-creation-before" class="headerlink"></a> Before Creating an Extension

Please **check whether an existing extension fits your needs or could be amended
to fit your needs** before developing a new extension.

- If a suitable extension already exists, consider using it. Having fewer, more
widely-deployed extensions makes it easier to create shared tooling.

- If there's an existing extension that could be amented to fit your needs,
consider asking the extension's author if they would be willing to modify it as
needed. Contact them through the information in their extension's registration
and give them a week or two to reply.

### <a href="#extension-creation-drafting" id="extension-creation-drafting" class="headerlink"></a> Drafting Your Extension

To author your extension, fill out the Markdown template below.

> \# [Your Extension Name Here]
>
> Add a description here (no more than a paragraph) about your extension's
> purpose and features to help other users determine if it will work for them.
>
> \# (Optional) Minimum JSON API Version
>
> Here, note if your extension only works with certain versions of JSON API.
> Such a restriction would be appropriate if the values your extension defines
> can only be used in objects that were not present before a certain JSON API
> version.
>
> \# Suggested Alias
>
> Put a string here that you'd like users to use as the [alias](/format/#document-aliases)
> for your extension. This can make it easier for readers to recognize your
> extension without having to check the URI.
>
> \# Specification
>
> In this section, describe the values that can occur as your extension's data,
> and the places where those values are allowed. This description should be
> detailed enough to allow for interoperable implementations, but it otherwise
> doesn't need to be formal.
>
> For reference, your extension may define values for use inside a [`meta` object][/format/#document-meta]
> that appears directly under:
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
> listed in the main specification, especially those on what an extension is
> not allowed to do.
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
>     in this extension's data whose name or format they do not recognize.</i>
>
> \# Contact Information
>
> \- Name: <br />
> \- Email: <br />
> \- Website (Optional): <br/>
> \- Phone (Optional):


### <a href="#extension-creation-registration" id="extension-creation-registration" class="headerlink"></a> Registering/Using Your Extension

Once you've drafted your extension, you can either host the resulting document
yourself or submit it to the JSON API extension registry. If you submit it to
the registry, it will be given a URI on jsonapi.org and listed above.

You are _**strongly**_ encouraged to register your extension, for two reasons:

 1. Registration allows the community to find and reuse your extension.

 2. As part of registration, one of the JSON API's editors will review your
    submission to check that it satisifies the [profile extension requirements](/format/1.1/#extending-profile-extensions-characteristics).
    These requirements can be a bit tricky, so getting an expert review ensures
    that your extension is legal for use with JSON API.

**To submit a registration request**, just post your extension's definition
(i.e., what you created by filling out the [template](#extension-creation-drafting)
above) as an issue on our [GitHub](https://github.com/json-api/json-api) or a
new thread on our [discussion forum](http://discuss.jsonapi.org/).

Your submission will be **approved within a week** by one of JSON API's editors,
assuming it meets the [profile extension requirements](/format/1.1/#extending-profile-extensions-characteristics)
and follows the template above. The community may give you feedback on your
submission before it's approved, but you are not required to act on this feedback.

One caveat: if your extension defines a new, fundamental mechanism for doing
something "architectural" that other extensions may need to do too, it may be
held for extra consideration. This extra review is designed to check that the
proposed mechanism, were it to become a convention, wouldn't have problematic
ramifications.

Finally, if the author of a registered extension dies, moves out of contact,
or otherwise can't or won't make changes that are important to the community,
the JSON API editors may reassign responsibility for the extension, to allow it
to continue to evolve.

## <a href="#prior-extensions" id="prior-extensions" class="headerlink"></a> Prior Extensions

JSON API previously offered experimental support for a different extension
negotiation system than the one now in the specification, and it provided a
number of extensions for use with that old negotiation system. However, this
system was always experimental and has now been deprecated.

New APIs should not use the old system or any extensions designed for it.
APIs that already use these old extensions should direct clients to an
[earlier version of this page](https://github.com/json-api/json-api/blob/9c7a03dbc37f80f6ca81b16d444c960e96dd7a57/extensions/index.md)
as documentation.
