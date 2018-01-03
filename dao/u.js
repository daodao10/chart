define(function () {
    "use strict";

    var MillisecondsPerYear = 365 * 24 * 60 * 60 * 1000;
    var DEBUG = false;

    /**
     * extend object
     * @param  {object} origin original object
     * @param  {object} add 
     * @return {object}
     */
    function extend(origin, add) {
        var isObject = function (value) {
            // return false;
            return Object(value) === value;
        };
        return (function () {
            if (!add || typeof add !== 'object') return origin;

            var keys = Object.keys(add); //Object.getOwnPropertyNames(add);
            var i = keys.length;
            while (i--) {
                if (isObject(origin[keys[i]])) {
                    extend(origin[keys[i]], add[keys[i]]);
                } else {
                    origin[keys[i]] = add[keys[i]];
                }
            }
            return origin;
        } (origin, add));
    }

    /**
     * according to DEBUG to call console.log()
     * @return {null}
     */
    function debug() {
        if (DEBUG) {
            var length = arguments.length;
            if (length == 1) {
                console.log(arguments[0]);
            } else if (length == 2) {
                console.log(arguments[0], arguments[1]);
            } else if (length == 3) {
                console.log(arguments[0], arguments[1], arguments[2]);
            } else if (length == 4) {
                console.log(arguments[0], arguments[1], arguments[2], arguments[3]);
            } else if (length == 5) {
                console.log(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
            } else {
                console.log(arguments);
            }
        }
    }

    /**
     * truncate the properties of object those are Number type
     * @param  {Object} obj    [description]
     * @param  {[Number]} digits [number of digit]
     * @return {[Object]}        [new Object]
     */
    function trunc(obj, digits) {
        var x = {};
        Object.getOwnPropertyNames(obj).forEach(function (key) {
            if (typeof obj[key] == 'number') {
                x[key] = obj[key].toFixed(digits);
            }
        });
        return x;
    }

    /**
     * convert string of date to timestamp
     * @param  {String} strDate [yyyyMMdd] or [yyyy-MM-dd]
     * @param  {Boolean} true - strDate [yyyyMMdd] else strDate [yyyy-MM-dd]
     * @return {long}
     */
    function toUtcDate(strDate, isCompact) {
        if (isCompact) {
            return new Date(Date.UTC(parseInt(strDate.substring(0, 4), 10), parseInt(strDate.substring(4, 6), 10) - 1, parseInt(strDate.substring(6, 8)))).getTime();
        }

        return new Date(Date.UTC(parseInt(strDate.substring(0, 4), 10), parseInt(strDate.substring(5, 7), 10) - 1, parseInt(strDate.substring(8, 10)))).getTime();
    }

    /**
     * please refer to http://trentrichardson.com/2010/04/06/compute-linear-regressions-in-javascript/
     * @type {Object}
     */
    var Trendline = {
        linear: function (y, x) {
            var lr = {},
                n = y.length,
                sum_x = 0,
                sum_y = 0,
                sum_xy = 0,
                sum_xx = 0,
                sum_yy = 0;

            for (var i = 0; i < n; i++) {
                sum_x += x[i];
                sum_y += y[i];
                sum_xy += (x[i] * y[i]);
                sum_xx += (x[i] * x[i]);
                sum_yy += (y[i] * y[i]);
            }

            lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
            lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
            lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);
            lr.toString = function () {
                return "y = {0} * x {1} {2}, r2 = {3}".format(lr['slope'], lr['intercept'] > 0 ? "+" : "-", Math.abs(lr['intercept']), lr['r2']);
            };

            return lr;
        }
    };

    /**
     * return y array or yi by slop & intercept
     * y = slope * x + intercept
     * @param {[type]}
     * @param {[type]}
     */
    var Opt = function (slope, intercept) {
        return {
            y: function (x, offset) {
                var fx = [];
                if (offset === undefined) {
                    offset = 0;
                }
                for (var i = 0; i < x.length; i++) {
                    fx.push(slope * x[i] + intercept + offset);
                }
                return fx;
            },
            yi: function (xi, offset) {
                if (offset === undefined) {
                    offset = 0;
                }
                return slope * xi + intercept + offset;
            }
        };
    };

    function _faSort(obj1, obj2) {
        return obj1[0] < obj2[0];
    }
    /**
     * 
     * @param  {Array}
     * @return {Object}
     */
    function toSeries(rows) {
        var series = {
            eps: [],
            nav: [],
            roe: [],
            ocf: [],
            gpm: []
        },
            timestamp;

        rows.forEach(function (row, index) {
            // last 5 years
            if (index > 4) {
                return;
            }
            timestamp = toUtcDate(row[0]);
            series.eps.push([timestamp, row[1]]);
            series.nav.push([timestamp, row[2]]);
            series.roe.push([timestamp, row[3]]);
            series.ocf.push([timestamp, row[4]]);
            series.gpm.push([timestamp, row[5]]);
        });
        series.eps.sort(_faSort);
        series.nav.sort(_faSort);
        series.roe.sort(_faSort);
        series.ocf.sort(_faSort);
        series.gpm.sort(_faSort);

        return series;
    }

    function _getFactorTTM(factor) {
        if (Array.isArray(factor)) {
            var quarters = Math.ceil(new Date(factor[0][0]).getMonth() / 3);
            return factor[0][1] * 4.0 / quarters;
        }
        throw new Error('arguments supported');
    }
    var Calc = {
        /**
         * average items in special Array
         * @param  {Array} factor [format: [[timestamp, value], [timestamp, value]] ]
         * @return {Number}        [description]
         */
        average: function (factor) {
            return factor.reduce(function (p, c) {
                return [0, p[1] + c[1]];
            })[1] / factor.length;
        },
        /**
         * calculate average of roe and the gaps between price vs value
         * @param  {Object} factors [description]
         * @param  {Array} serie   [ [[timestamp, value], [timestamp, value]] ]
         * @return {[Object]}         [description]
         */
        fa: function (factors, serie) {
            var ar = this.average(serie);

            var rAvgs = {
                ar: ar,
                crr: (serie[0][1] / ar - 1) * 100, // relative = current / ar - 1
                cra: serie[0][1] - ar // absolute = current - ar
            };
            rAvgs.crr = rAvgs.cra > 0 ? Math.abs(rAvgs.crr) : -Math.abs(rAvgs.crr);

            var g1 = (factors.p / factors.opt.p50 - 1) * 100;
            return {
                avg: rAvgs,
                gap: {
                    g1: g1,
                    g2: factors.cagr - ar,
                    g3: g1 - rAvgs.cra,
                    g4: g1 - rAvgs.crr
                }
            }
        },
        /**
         * Graham-Number = PB * PE
         * @param  {Object}
         * @param  {Object} 
         * @return {[type]}
         */
        gn: function (factors, series) {
            var nav = series.nav[0][1];
            var earning = _getFactorTTM(series.eps);
            return {
                pb: factors.p / nav,
                pe: factors.p / earning,
                ey: earning / factors.p * 100, //earning yield
                n: nav == 0 || earning == 0 ? 0 : factors.p * factors.p / (nav * earning)
            };
        },
        /**
         * calculate factors by the trend of price
         * @param  {Object} trend [description]
         * @return {Object}      [description]
         */
        ta: function (trend) {
            var trendline = trend.trendline,
                lastIndex = trend.trendline[0].length - 1,
                lastItem = trend.source[lastIndex],
                price = lastItem[1],
                opt = {
                    "p50": trendline[0][lastIndex][1],
                    "p100": trendline[1][lastIndex][1],
                    "p75": trendline[2][lastIndex][1],
                    "p25": trendline[3][lastIndex][1],
                    "p0": trendline[4][lastIndex][1]
                },
                factor = {
                    "sf": (opt.p100 / opt.p0 - 1) * 100,
                    "pf": (opt.p75 / opt.p25 - 1) * 100,
                    "rf": (opt.p0 / opt.p25 - 1) * 100,
                    "tp0": (opt.p0 / price - 1) * 100,
                    "tp25": (opt.p25 / price - 1) * 100,
                    "tp50": (opt.p50 / price - 1) * 100,
                    "tp75": (opt.p75 / price - 1) * 100,
                    "tp100": (opt.p100 / price - 1) * 100
                },
                r = Math.abs(factor.tp75 / factor.tp0).toFixed(2);// risk to rewards

            return {
                "major": {
                    "start": new Date(trend.source[0][0]),
                    "end": new Date(lastItem[0]),
                    "p": price,
                    "opt": trend.optimism,
                    "cagr": trend.cagr.CAGR * 100,
                    "r2": trend.formula.r2,
                    "times": trend.times
                },
                "opt": opt,
                "factor": factor,
                "r": price > opt.tp75 ? -r : (price > opt.p0 ? r : 'N.A.')
            };
        },
        /**
         * formula: POWER(end/start, 1/period)-1
         * @param {Object} start {x, y}: 
         * x : timestamp
         * y: value(price)
         * @param {[type]}
         */
        CAGR: function (start, end) {
            var fractionOfPeriod = MillisecondsPerYear / (end.x - start.x);
            var CAGR = Math.pow(end.y / start.y, fractionOfPeriod) - 1;

            var result = {
                CAGR: CAGR,
                period: 1 / fractionOfPeriod
            };
            if (DEBUG) {
                console.log("period", result.period, "Year(s)");
                console.log("CAGR", result.CAGR);
            }
            return result;
        }
    };

    var Cookie = {
        set: function (name, value) {
            var Days = 30;
            var exp = new Date();
            exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
            document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
        },
        get: function (name) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg)) {
                return unescape(arr[2]);
            }
            else {
                return null;
            }
        },
        del: function (name) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = this.get(name);
            if (cval != null) {
                document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
            }
        }
    };

    return {
        extend: extend,
        debug: debug,
        toUtcDate: toUtcDate,
        trunc: trunc,
        //Trendline: Trendline,
        //Opt: Opt,
        Calc: Calc,
        getPeriod: function (category) {
            return category === "world" ? "monthly" : "daily";
        },
        getCounterUrl: function (symbol, category, period) {
            if (period === "daily") {
                return "{0}/{1}_d.js".format(category, symbol);
            } else if (period === "monthly") {
                return "{0}/{1}_m.js".format(category, symbol);
            }

            // weekly
            return "{0}/{1}_w.js".format(category, symbol);
        },
        getFaUrl: function (category, symbol) {
            return 'fa/{0}/{1}.json'.format(category, symbol)
        },

        /**
         * process original data
         * @param  {Array} xdata   [description]
         * @param  {Object} options:
         * {
                CagrSetting:{},
                OptSetting:{},
                period: monthly | weekly | daily,
                pv: the array of the timestamp of peak & valley
                generatePV: true | false
            }
         * @return {Object}
         * {
                source: data,
                formula: lr,
                trendline: [t, t100, t75, t25, t0],
                optimism: percent,
                cagr: cagr,
                pv: options.generatePV ? options.pv : null,
                times: x times
            }
         */
        processData: function (xdata, options) {
            options = extend({
                CagrSetting: {
                    "monthly": {
                        count: 20,
                        distance: 13
                    },
                    "weekly": {
                        count: 30,
                        distance: 55
                    },
                    "daily": {
                        count: 30,
                        distance: 250
                    }
                },
                OptSetting: {
                    "monthly": {
                        count: 10,
                        distance: 3
                    },
                    "weekly": {
                        count: 10,
                        distance: 13
                    },
                    "daily": {
                        count: 30,
                        distance: 55
                    }
                },
                period: "daily",
                generatePV: false
            }, options);

            //=>  reduce loop times
            var data = [],
                x = [],
                y = [],
                // temp variables
                start,
                d, range = {};
            for (var i = 0; i < xdata.length; i++) {
                d = xdata[i];
                d[0] = toUtcDate(d[0], true);
                if (i == 0) {
                    start = d[0];
                    range.min = d[1];
                    range.max = d[1];
                }
                x.push((d[0] - start) / 10000);
                y.push(Math.log(d[1]) / Math.LN2);
                data.push(d);

                range.max = Math.max(range.max, d[1]);
                range.min = Math.min(range.min, d[1]);
            }
            // calc Xtimes
            options.times = range.max / range.min
            debug('times:', range, options.times);

            var lr = Trendline.linear(y, x);
            var o = new Opt(lr.slope, lr.intercept);
            debug(lr.toString());

            // trendlines
            var t = o.y(x).map(function (d, i) {
                return [data[i][0], Math.pow(2, d)];
            });

            x = null;
            y = null;
            range = null;

            var optPick = [];
            // array of [index, multiplier], multiplier: position / trend
            var diff = t.map(function (d, i) {
                // patch of optPick: use customized peek & valley
                if (options.pv) {
                    if (options.pv[0] == d[0]) {
                        optPick[0] = data[i][1] / d[1];
                    } else if (options.pv[1] == d[0]) {
                        optPick[1] = data[i][1] / d[1];
                    }
                }
                return [i, data[i][1] / d[1]];
            });

            if (optPick.length !== 2) {
                // automatically pick the item [minimum(diff), maximum(diff)]
                optPick = (function (srcData, count, minDistance) {
                    srcData.sort(function (obj1, obj2) {
                        return obj1[1] - obj2[1];
                    });
                    if (options.generatePV) {
                        options.pv = [data[srcData[0][0]][0], data[srcData.slice(-1)[0][0]][0]];
                    }
                    return [srcData[0][1], srcData.slice(-1)[0][1]];
                } (diff.clone(), options.OptSetting[options.period].count, options.OptSetting[options.period].distance));
            }

            debug("PV", options.pv);
            debug("OPT pick", optPick);

            if (optPick && optPick.length === 2) {
                var t100 = t.map(function (d) {
                    return [d[0], optPick[1] * d[1]];
                });
                var t75 = t.map(function (d) {
                    return [d[0], Math.sqrt(optPick[1]) * d[1]];
                });
                var t25 = t.map(function (d) {
                    return [d[0], Math.sqrt(optPick[0]) * d[1]];
                });
                var t0 = t.map(function (d) {
                    return [d[0], optPick[0] * d[1]];
                });

                // log(t100/t)(p/t)/2 + 0.5
                // => ln(p/t)/ln(t100/t) + 0.5
                var percent = (function (x, n) {
                    var result = 0;
                    if (x > 1) {
                        result = (Math.log(x) / Math.log(n[1]) / 2 + 0.5) * 100;
                    } else {
                        result = (0.5 - Math.log(x) / Math.log(n[0]) / 2) * 100;
                    }

                    debug(result);

                    return result;
                } (diff[diff.length - 1][1], optPick));
            }

            // pick 2 points to calculate CAGR
            var cagrPick = (function (srcData, count, minDistance) {
                var filter = srcData.filter(function (d) {
                    return d[1] >= 0 && d[1] < .05;
                });
                filter.sort(function (obj1, obj2) {
                    return obj1[1] - obj2[1];
                });
                if (filter.length < count) {
                    count = filter.length;
                } else {
                    filter = filter.slice(0, count);
                }

                var i = 1,
                    distance;
                for (; i < count; i++) {
                    distance = filter[i][0] - filter[0][0];
                    if (-minDistance < distance && distance < minDistance) {
                        continue;
                    }
                    break;
                }

                if (i === count || filter.length === 0) {
                    return null;
                }

                return filter[0][0] < filter[i][0] ? [filter[0][0], filter[i][0]] : [filter[i][0], filter[0][0]];

            } (diff.map(function (d, i) {
                return [i, Math.abs(d[1] - 1)];
            }), options.CagrSetting[options.period].count, options.CagrSetting[options.period].distance));

            if (cagrPick) {
                debug("CAGR pick", cagrPick);
                var cagr = Calc.CAGR({
                    x: data[cagrPick[0]][0],
                    y: data[cagrPick[0]][1]
                }, {
                        x: data[cagrPick[1]][0],
                        y: data[cagrPick[1]][1]
                    });
            }

            return {
                source: data,
                formula: lr,
                trendline: [t, t100, t75, t25, t0],
                optimism: percent,
                cagr: cagr,
                pv: options.generatePV ? options.pv : null,
                times: options.times
            };
        },

        toSeries: toSeries,

        cookie: Cookie
    };

});