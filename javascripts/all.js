//= require_tree .

$(document).ready(function() {
    // Build navigation list
    var articleOutline = createOutlineFromElement($('.content').eq(0));
    var navList = createArticleNavigationFromOutline(articleOutline);
    $("#document-outline").append(navList);

    // Scroll affix  
    fixElement($(".sidebar"), 50);

    $(".highlight").click(function(event) {
        $(this).toggleClass('collapsed');
    });
});

function fixElement(element, offset) {
    if(element.length == 0) return;

    var affixWaypoint = element.offset().top - offset;

    $(window).scroll(function(event) {
        var scrollPosition = $(window).scrollTop();

        if(scrollPosition >= affixWaypoint) {
            element.css('position', 'fixed');
            element.css('top', offset + 'px');
        } else {
            element.css('position', 'relative');
            element.css('top', '0');
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