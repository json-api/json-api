// lovingly adapted from http://ben.balter.com/2014/03/13/pages-anchor-links/
$(function () {
  'use strict';
  return $('h2, h3, h4, h5, h6').each(function (i, el) {
    var $el, icon, id;
    $el = $(el);
    id = $el.attr('id');
    icon = '<i class="fa fa-link"></i>';
    if (id) {
      return $el.append($('<a />')
        .addClass('header-link')
        .attr('href', '#' + id)
        .html(icon));
    }
  });
});
