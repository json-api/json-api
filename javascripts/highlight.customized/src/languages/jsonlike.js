/**
 * Language: JSON, with modifications for human readability.
 * Namely comments are allowed and key-value pairs can occur without a containing object.
 */

function(hljs) {
  var LITERALS = {literal: 'true false null'};
  var TYPES = [
    hljs.QUOTE_STRING_MODE,
    hljs.C_NUMBER_MODE,
    hljs.C_LINE_COMMENT_MODE
  ];
  var VALUE_CONTAINER = {
    className: 'value',
    end: ',', endsWithParent: true, excludeEnd: true,
    contains: TYPES,
    keywords: LITERALS
  };
  var ATTRIBUTE = {
    className: 'attribute',
    begin: '\\s*"', end: '"\\s*:\\s*', excludeBegin: true, excludeEnd: true,
    contains: [hljs.BACKSLASH_ESCAPE],
    illegal: '\\n',
    starts: VALUE_CONTAINER
  };
  var OBJECT = {
    begin: '{', end: '}',
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      ATTRIBUTE
    ],
    illegal: '\\S'
  };
  var ARRAY = {
    begin: '\\[', end: '\\]',
    contains: [hljs.inherit(VALUE_CONTAINER, {className: null})], // inherit is also a workaround for a bug that makes shared modes with endsWithParent compile only the ending of one of the parents
    illegal: '\\S'
  };
  TYPES.splice(TYPES.length, 0, OBJECT, ARRAY);

  var TYPES_OR_ATTRIBUTE = TYPES.slice(0);
  TYPES_OR_ATTRIBUTE.push(ATTRIBUTE);

  return {
    contains: TYPES_OR_ATTRIBUTE,
    keywords: LITERALS,
    illegal: '[^\\s\\:\\"]' // allow stray quotes and colons to support the "attriubtes without containing object" form.
  };
}
