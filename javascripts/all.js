//= require_tree .

$(document).ready(function() {
    // Build navigation list
    var documentOutlineElement = $("#document-outline");

    if(documentOutlineElement.length) {
        var articleOutline = createOutlineFromElement($('.content').eq(0));
        var navList = createArticleNavigationFromOutline(articleOutline);
        documentOutlineElement.append(navList);
    }

    // Sidebar scroll affix
    fixElement($(".sidebar"), $("footer"), 52);
    activateVersionPicker();
});

function fixElement($sidebar, $footer, offset) {
    if($sidebar.length == 0) return;

    var $window = $(window);
    var $nav = $sidebar.find('nav');
    var $list = $sidebar.find('nav > ol');

    var affixWaypoint = $sidebar.offset().top - offset;
    var windowHeight, headingHeight, footerOffsetTop, navListHidden;

    // function to set heights + css values that need to be recomputed on resize.
    var computeAndAdjustHeights = function() {
        navListHidden = !$list.is(':visible');
        windowHeight = $window.height();
        headingHeight = $sidebar.find('.sidebar-top').outerHeight(true);
        footerOffsetTop = $footer.offset().top;

        $list.css({height: 'calc(100% - ' + headingHeight + 'px)'});
    }

    var scrollHandler = function(event) {
        var scrollPosition = $window.scrollTop();
        var footerPxOnScreen = Math.max(0, (scrollPosition + windowHeight) - footerOffsetTop);

        if(scrollPosition < affixWaypoint || navListHidden) {
            $nav.css({position: ''});
        }
        else {
            $nav.css({
                'position': 'fixed',
                'top': (offset - footerPxOnScreen) + 'px',
                'bottom': (0 + footerPxOnScreen) + 'px'
            });
        }
    }

    computeAndAdjustHeights();
    $window.resize(function() { computeAndAdjustHeights(); scrollHandler(); });
    $window.scroll(scrollHandler);
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

            $(this).nextUntil('h3', 'h4').each(function() {
                childItem.children.push({
                    title: $(this).not('a').text(),
                    href: $(this).find('a').attr('href') || "#",
                    children: []
                });
            });

            item.children.push(childItem);
        });

        outline.push(item);
    });

    return outline;
}

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

function activateVersionPicker() {
    $('select.version-picker').change(function() {
        window.location.href = $(this).find(':selected').val();
    });
}
