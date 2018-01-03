require.config({
    baseUrl: 'dist',
    paths: {
        'anounymous': 'ProtoUtil'
    },
    urlArgs: "_0.1"
}).onError = function (err) {
    console.log(err.requireType);
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
    }

    throw err;
};

function process(market) {
    market = market || 'cn';
    require([market, 'anounymous'], function (data) {
        $('#myTable').DataTable({
            data: data,
            pageLength: 25,
            select: 'single',
            columns: [
                { data: 'c' },
                {
                    data: 'n',
                    render: function (d, type, row) {
                        return '<a href="ts.html#{0}:{2}" target="_blank">{1}</a>'.format(row.c, d, market);
                    }
                },
                { data: 's' },
                {
                    data: 'i',
                    render: function (d, type, row) {
                        if (!d) return '--';
                        return d;
                    }
                },
                {
                    data: 'mv',
                    render: function (d, type, row) {
                        if (market === 'cn') {
                            if (d > 0) return Math.trunc(d / 1000) / 10.0;
                        }
                        else if (market === 'sg' || market === 'us') return d;
                        return '-';
                    }
                },
                {
                    data: 'nv',
                    render: function (d, type, row) {
                        if (market === 'cn') {
                            if (d > 0)
                                if (row.mv > 0) return Math.trunc(d / row.mv * 1000) / 10.0 + '%';
                        }
                        return '-';
                    }
                },
                {
                    data: 'f',
                    render: function (d, type, row) {
                        if (d === 1) return 'BUY';
                        else if (d === 2) return 'HOLD';
                        else if (d === 3) return 'SELL';
                        else if (d === -1) return 'Opt. FILTERED';
                        else if (d === -2) return 'R2 FILTERED';
                        return 'WRONG';
                    }
                }
            ]
        });
    });
}

// get market from window hash
var hash = window.location.hash;
if (hash) {
    var m = /#mrk=(world|cn|hk|us|sg)/g.exec(decodeURIComponent(hash));
    if (m && m.length === 2) {
        hash = m[1];
        process(hash);
    }
} else {
    process();
}