define(['anounymous'], function() {
    return {
        getChartOptions: function(title, faRecords) {
            var dataSource = 'eastmoney.com'
            return {
                chart: {
                    zoomType: 'xy'
                },
                title: {
                    text: title
                },
                credits: {
                    // enabled: false,
                    text: "data from " + dataSource,
                    href: "http://www." + dataSource
                },
                xAxis: [{
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        day: '%y-%m',
                        month: '%y-%m'
                    },
                    labels: {
                        rotation: -30
                    }
                }],
                yAxis: [{
                    title: {
                        enabled: false
                    }
                }, {
                    title: {
                        enabled: false
                    },
                    opposite: true
                }],
                tooltip: {
                    shared: true
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    verticalAlign: 'top',
                    x: 35,
                    y: -5,
                    floating: true,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                },
                series: [{
                    name: 'EPS',
                    type: 'column',
                    yAxis: 0,
                    data: faRecords.eps
                }, {
                    name: 'NAV',
                    type: 'spline',
                    yAxis: 1,
                    data: faRecords.nav,
                    marker: {
                        enabled: false
                    },
                    dashStyle: 'shortdot',
                    visible: false
                }, {
                    name: 'ROE',
                    type: 'spline',
                    yAxis: 1,
                    data: faRecords.roe
                }, {
                    name: 'OCF',
                    type: 'spline',
                    yAxis: 0,
                    data: faRecords.ocf,
                    visible: false
                }, {
                    name: 'GPM',
                    type: 'spline',
                    yAxis: 1,
                    data: faRecords.gpm,
                    visible: false
                }]
            };
        }
    };
});