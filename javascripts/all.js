//= require_tree .

$(document).ready(function() {
    // Build navigation list
    var documentOutlineElement = $("#document-outline");

    if(documentOutlineElement.length) {
        var articleOutline = createOutlineFromElement($('.content').eq(0));
        var navList = createArticleNavigationFromOutline(articleOutline);
        documentOutlineElement.append(navList);
    }

    // Scroll affix
    fixElement($(".sidebar"), 50);
});

function fixElement($sidebar, offset) {
    if($sidebar.length == 0) return;

    var $heading = $sidebar.find('nav > h1');
    var $list = $sidebar.find('nav > ol');

    var affixWaypoint = $sidebar.offset().top - offset;

    $(window).scroll(function(event) {
        var scrollPosition = $(window).scrollTop();

        if(scrollPosition >= affixWaypoint) {
            $heading.css({
              position: 'fixed',
              top: offset + 'px',
            });

            $list.css({
                position: 'fixed',
                top: (offset + $heading.outerHeight(true)) + 'px',
                bottom: '0',
                paddingBottom: offset + 'px'
            });
        } else {
            $heading.css({position: 'relative', top: '0'})
            $list.css({
                position: 'relative',
                top: '',
                bottom: '',
                paddingBottom: ''
            });
        }
    });
}

/**
 * Returns an array in the form of:
 *  [{
 *      title: "Title",
 *      href: "#anchor",
 *      children: [...]
 *  }, {
 *      title: "Title",
 *      href: "#anchor",
 *      children: [...]
 *  }];
 *
 * @param  {jQuery element} element The HTML element to create the outline from.
 * @return {array}                  Array in the form described above.
 */
function createOutlineFromElement(element) {
    var outline = [];

    $('h2', element).each(function() {
        var item = {
            title: $(this).not('a').text(),
            href: $(this).find('a').attr('href') || "#",
            children: []
        };

        $(this).nextUntil('h2', 'h3').each(function() {
            var childItem = {
                title: $(this).not('a').text(),
                href: $(this).find('a').attr('href') || "#",
                children: []
            };

            item.children.push(childItem);
        });

        outline.push(item);
    });

    return outline;
}

/**
 * Creates a nested list from an array in the form returned by `createOutlineFromElement`.
 */

/**
 * Creates a nested list from an array in the form returned by `createOutlineFromElement`.
 *
 * @param  {array}   outline The outline from which to create a navigation list.
 * @return {element}        The HTML element containing the navigation list.
 */
function createArticleNavigationFromOutline(outline) {
    var ol = document.createElement('ol');
    ol.class = "nav"

    outline.forEach(function(item) {
        var a = document.createElement('a');
        a.href = item.href;
        a.appendChild(document.createTextNode(item.title));

        var li = document.createElement('li');
        li.appendChild(a);
        if(item.children.length > 0) {
            li.appendChild(createArticleNavigationFromOutline(item.children));
        }

        ol.appendChild(li);
    });

    return ol;
}
