$(document).ready(function() {
    var articleOutline = createOutlineFromArticle($('.site-content').eq(0));
    var navList = createArticleNavigationFromOutline(articleOutline);
    $("#document-outline").append(navList);

    $("#document-outline li").click(function(event) {
        $("#document-outline li").removeClass('active');
        $(this).toggleClass('active');
    })
});

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
 */
function createOutlineFromArticle(article) {
    var outline = [];

    $('h2', article).each(function() {
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
 * Creates a nested list from an array in the form returned by `createOutlineFromArticle`.
 */
function createArticleNavigationFromOutline(outline) {
    function createListFromItems(items) {
        var ol = document.createElement('ol');
        ol.class = "nav"

        items.forEach(function(item) {
            var a = document.createElement('a');
            a.href = item.href;
            a.appendChild(document.createTextNode(item.title));

            var li = document.createElement('li');
            li.appendChild(a);
            li.appendChild(createListFromItems(item.children));

            ol.appendChild(li);
        });

        return ol;
    }

    return createListFromItems(outline);
}