require.config({
    baseUrl: 'dist',
    paths: {
        'anounymous': 'ProtoUtil'
    },
    urlArgs: "_" + (new Date()).getTime() // development
}).onError = function (err) {
    console.log(err.requireType);
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
    }

    throw err;
};

function setIframeHeight(iframe) {
    if (iframe) {
        var iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
        if (iframeWin.document.body) {
            iframe.height = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight;
        }
    }
};

var hash = window.location.hash;
if (hash) {
    hash = hash.substring(1);
}
else {
    hash = 'wl';
}

require([hash, 'anounymous'], function (wl) {
    var x = [];
    Object.getOwnPropertyNames(wl).forEach(function (category) {
        if (Array.isArray(wl[category])) {

            x.push('<div class="ui card">');

            x.push('<div class="content">');
            x.push('<div class="header">' + category + '</div>');

            x.push('<div class="description">');
            x.push(wl[category].map(function (item) {
                return "<a href='/ts.html#{0}:{1}' target='trend'>{0}</a>".format(item, category);
            }).join(' &nbsp;&nbsp;'));
            x.push('</div>');
            x.push('</div>');

            x.push('</div>');
        }
    });

    $(function () {
        var frame = document.getElementById('trend-frame');
        $("#watchlist")
            .html(x.join(''))
            .on('click', 'a', function (e) {
                var
                    $this = $(this),
                    src = $this.attr('href');

                frame.src = src;
                setIframeHeight(frame);
                frame.contentWindow.location.reload(true);
            });
    });

});
