$.cacheJSON = function(url, options) {
    options = $.extend(options || {}, {
        dataType: "json",
        cache: true,
        url: url
    });

    return $.ajax(options);
};
$(function() {
    var options = {
        title: {
            text: "指数统计数据"
        },
        chart: {
            renderTo: 'chart-0',
            zoomType: 'x',
            panning: true,
            panKey: 'shift'
        },
        credits: {
            enabled: false
        },
        xAxis: [{
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%Y%m',
                month: '%Y%m'
            },
            labels: {
                rotation: -30
            }
        }],
        yAxis: [{
            title: {
                text: "指数"
            }
        }, {
            title: {
                text: "统计数据"
            },
            opposite: true
        }],
        // plotOptions: {
        //     series: {
        //         compare: 'percent'
        //     }
        // },
        tooltip: {
            dateTimeLabelFormats: {
                day: '%Y年%m月%d日',
                month: '%Y年%m月',
                year: '%Y年%m月'
            },
            crosshairs: {
                color: 'red',
                dashStyle: 'dash'
            },
            shared: true,
            valueDecimals: 3
        },
        series: []
    };
    var height = $(window).height(),
        $chartContainer = $("#chart-0"),
        $toolbox = $("#tool-box");

    var process = function(symbol) {
        $.cacheJSON('swi/' + symbol + '.json').then(function(d) {
            var keys = Object.getOwnPropertyNames(d);
            keys.forEach(function(k, i) {
                var serie = d[k];
                if (i == 0) {
                    options.series.push({ "name": serie.n, "data": serie.d, "yAxis": 0 });
                } else {
                    options.series.push({ "name": serie.n, "data": serie.d, "yAxis": 1, visible: (i == 3 ? true : false) });
                }
            });

            $chartContainer.highcharts(options);
        });
    };


    $chartContainer.height(height - $toolbox.height() - 50);

    $toolbox.on('click', 'a', function(e) {
        var code = $(this).attr('href').substring(1, 7);
        process(code);
        e.preventDefault();
    });
});