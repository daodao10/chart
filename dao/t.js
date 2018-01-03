define(['u', 'anounymous'], function(daoU) {
    "use strict";

    var _cagrPointClick = (function() {
        var cagr = {
            s: null,
            e: null
        };

        return function(e) {
            if (this.series.name === "P") {
                daoU.debug(Highcharts.dateFormat('%Y-%m-%d', this.x), this.y);
                if (cagr.s == null) {
                    cagr.s = {
                        x: this.x,
                        y: this.y
                    };
                } else {
                    cagr.e = {
                        x: this.x,
                        y: this.y
                    };

                    daoU.Calc.CAGR(cagr.e, cagr.s);
                }
            }
        };
    }());

    return {
        /**
         * return chart settings
         * @param  {Object} 
         * {
                security: (removed)
                source: [source data],
                formula: {slope:, intercept:, r2:},
                trendline: [lines]
                optimism: number,
                cagr: {period: # of years, CAGR: value }
            }
         * @return {[type]}
         */
        getChartOptions: function(options) {
            return {
                chart: {
                    zoomType: 'x',
                    panning: true,
                    panKey: 'shift'
                },
                title: {
                    text: '%OPT = ' + options.optimism.toFixed(3) + ', %CAGR = {1}, R2 = {0}'.format(options.formula.r2.toFixed(4), options.cagr ? (options.cagr.CAGR * 100).toFixed(2) : 0)
                },
                exporting: {
                    //filename: options.security
                    enabled: false
                },
                credits: {
                    // enabled: false,
                    text: "data from " + source,
                    href: "http://" + source,
                    style: {
                        fontSize: '12px'
                    },
                    position: {
                        align: 'right',
                        x: -20,
                        verticalAlign: 'bottom',
                        y: -20
                    }
                },
                xAxis: {
                    labels: {
                        rotation: -30
                    },
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        day: '%Y-%m-%d',
                        month: '%Y-%m'
                    }
                },
                yAxis: {
                    type: 'logarithmic',
                    title: {
                        text: 'Log2 (P)'
                    }
                },
                tooltip: {
                    dateTimeLabelFormats: {
                        day: '%Y-%m-%d',
                        week: "%A, %b %e, %Y",
                        month: '%Y-%m-%d',
                        year: '%Y-%m-%d'
                    },
                    crosshairs: {
                        color: 'red',
                        dashStyle: 'dash'
                    },
                    shared: true,
                    pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y}</b></span><br/>',
                    valueDecimals: 4
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    // line: {
                    //     lineWidth: 1
                    // },
                    series: {
                        point: {
                            events: {
                                click: _cagrPointClick
                            }
                        },
                        marker: {
                            // enabled: false,
                            radius: 2,
                            symbol: 'diamond'
                        }
                    }
                },

                series: [{
                    name: 'P',
                    data: options.source
                }, {
                    name: '50%',
                    dashStyle: 'longdash',
                    color: 'orange',
                    data: options.trendline[0]
                }, {
                    name: '100%',
                    color: 'black',
                    data: options.trendline[1]
                }, {
                    name: '75%',
                    color: 'red',
                    data: options.trendline[2]
                }, {
                    name: '25%',
                    color: 'green',
                    data: options.trendline[3]
                }, {
                    name: '0%',
                    color: 'purple',
                    data: options.trendline[4]
                }]
            }
        }
    };
});