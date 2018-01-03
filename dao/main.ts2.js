require.config({
    baseUrl: 'dist',
    paths: {
        'typeahead': '../assets/js/typeahead.bundle.min',
        'doT': '../assets/js/doT.min',
        'hc-theme': '../assets/highcharts/themes/grid',
        'anounymous': 'ProtoUtil',
        's-t': '../assets/js/stupidtable.min'
    },
    urlArgs: "_0.162" // urlArgs: "_" + (new Date()).getTime() // development
}).onError = function (err) {
    console.log(err.requireType);
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
    }

    throw err;
};

if (!window.Promise) {
    console.log('patch to support Promise');

    (function () {
        var script,
            scripts = document.getElementsByTagName('script');

        function loadJs(uri, isAsync, isFirst) {
            script = document.createElement('script');
            script.src = uri;
            script.async = isAsync;
            if (isFirst && scripts) {
                scripts[0].parentNode.insertBefore(script, scripts[0]);
            } else {
                document.body.appendChild(script);
            }
        }

        loadJs('assets/js/promise-6.1.0.min.js');
    } ());
}

var global = {
    category: null,
    cr: {
        t: '\u00a9\u5200\u5c0f\u4e00'
    },
    startDate: "1995-01",
    $factSet: null,
    datum: null,
    maxTryTimes: 2,
    cache: false, //true for deployment
    debug: false
};

(function ($, globalSettings) {
    $.cacheScript = function (url, options) {
        options = $.extend(options || {}, {
            dataType: "script",
            cache: globalSettings.cache,
            url: url
        });
        return $.ajax(options);
    };
    $.cacheJSON = function (url, options) {
        options = $.extend(options || {}, {
            dataType: "json",
            cache: globalSettings.cache,
            url: url
        });

        return $.ajax(options);
    };
    $.cacheTemplate = function (options) {
        var settings = {
            type: "GET",
            dataType: "html",
            cache: globalSettings.cache
        };
        if (Array.isArray(options)) {
            return Promise.all(options.map(function (element) {
                return new Promise(function (resolve, reject) {
                    $.ajax(require.s.contexts._.config.baseUrl + 'tmpl/' + element.file, settings)
                        .done(function (content, textStatus, jqXHR) {
                            resolve({ id: element.id, content: content });
                        }).fail(function (jqXHR, textStatus, errorThrown) {
                            reject(errorThrown);
                        });
                });
            }));
        } else {
            return new Promise(function (resolve, reject) {
                reject('template: cannot support');
            });
        }
    };
})(jQuery, global);

ErrorHandler = {
    _$error: null,
    init: function () {
        _$error = $("#error-panel > p");
        window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
            ErrorHandler.show(errorMsg);
        };
    },
    show: function (message) {
        _$error.text(message).parent().transition('fade');
    },
    hide: function () {
        _$error.parent().transition('hide');
    }
};

require(['u', 't', 'f', 'doT', 'e', 'peg', 'e0', 'peg0', 'e1', 'peg1', 'anounymous', 'typeahead', 'hc-theme', 's-t'], function (daoU, daoT, daoF, doT, daoE, daoPEG, daoE0, daoPEG0, daoE1, daoPEG1) {
    $.cacheTemplate([
        {
            file: 't-sets.html',
            id: '__set1'
        }, {
            file: 'f-t.html',
            id: 'taFactor'
        }, {
            file: 'f-f.html',
            id: 'faFactor'
        }, {
            file: 'f-f-t.html',
            id: 'faTable'
        }]).then(function (elements) {
            var tmpls = {};
            elements.forEach(function (element) {
                if (element.id.startsWith('__')) {
                    parseTmpl(element.content, tmpls);
                } else {
                    tmpls[element.id] = doT.template(element.content);
                }
            });
            doT.tmpls = tmpls;

            $(function () {

                global.$factSet = [$('#fact-chart-0'), $('#fact-set-0'), $('#fact-chart-1'), $('#fact-chart-2'), $('#fact-set-1'), $('#fact-set-2'), $("#security-info")];
                var $category = $('#category'),
                    $sector = $('#sector'),
                    $symbol = $('#symbol');

                ErrorHandler.init();

                $('.menu .item').tab();

                // get filter from window hash
                var hash = window.location.hash;
                if (hash) {
                    var m = /#f=(-\d|\d)/g.exec(decodeURIComponent(hash)); //f=3,2,1,0,-1,-2
                    if (m && m.length === 2) {
                        hash = parseInt(m[1], 10);
                    }
                }

                // ticker-pick initialize
                (function () {
                    return Promise.all(['world', 'cn', 'hk', 'sg', 'us'].map(function (element) {
                        $category.append(buildItem(element, element.toUpperCase()));
                        return new Promise(function (resolve, reject) {
                            require([element], function (data) {
                                resolve(data.filter(function (security) {
                                    security['cat'] = element;
                                    return hash === '' || security.f === hash;
                                }));
                            });
                        });
                    }));
                } ()).then(function (data) {
                    var securities = {},
                        xx;

                    data.forEach(function (element) {
                        element.forEach(function (item, index) {
                            if (index === 0) securities[item.cat] = {};
                            if (item.s) {
                                if (!securities[item.cat][item.s]) securities[item.cat][item.s] = {};
                                securities[item.cat][item.s][item.c] = item;
                            }
                        });
                    });

                    $category.change(function (evt) {
                        var val = evt.target.value;
                        global.category = val;

                        xx = Object.keys(securities[val]).map(function (key) {
                            return buildItem(key, key.toUpperCase());
                        });
                        xx.unshift(buildItem('', '-- sector --'));
                        $sector.html(xx.join('\n'));

                        $symbol.html(buildItem('', '-- security --'));//reset
                    });
                    $sector.change(function (evt) {
                        var val = evt.target.value,
                            obj = securities[global.category][val];
                        global.sector = val;

                        xx = Object.keys(obj).map(function (key) {
                            var element = obj[key];
                            return buildItem(element.c, element.n);
                        });
                        xx.unshift(buildItem('', '-- security --'));
                        $symbol.html(xx.join('\n'));
                    });
                    $symbol.change(function (evt) {
                        var val = evt.target.value;
                        preload(securities[global.category][global.sector][val]);
                    });

                }).catch(function (err) {
                    console.log("broken: " + err.message);
                });

                // set start date
                $("#startDate").val(global.startDate)
                    .change(function () {
                        var val = $(this).val();
                        if (val && val.length > 0) {
                            val = val.replace('-', '');
                        }
                        global.startDate = val;
                    });

                // refresh
                $("#refreshBtn").click(function () {
                    load(global.period, global.maxTryTimes);
                });

                $('.message .close').on('click', function () {
                    $(this).closest('.message').transition('fade');
                });
            });

        }).catch(function (error) {
            console.error(error);
        });

    var
        onComplete = function (chart) {
            if (!global.cr.x) {
                global.cr.x = chart.plotWidth + chart.plotLeft - 100;
                global.cr.y = chart.plotHeight + chart.plotTop - 10;
            }

            chart.renderer.text(global.cr.t, global.cr.x, global.cr.y)
                .css({
                    color: '#ccc',
                    fontSize: '2em'
                }).attr({
                    zIndex: 99
                }).add();
        },
        preload = function (datum) {
            global.period = daoU.getPeriod(global.category);
            global.datum = datum;

            load(global.period, global.maxTryTimes);
        },
        load = function (period, maxTryTimes) {
            var $factSet = global.$factSet,
                /** datum:
                 * {
                 *  c: symbol,
                 *  n: name,
                 *  s: sector,
                 *  pv: peakValley
                 * }
                 */
                datum = global.datum,
                url = daoU.getCounterUrl(datum.c, global.category, period),
                jsonUrl = daoU.getFaUrl(global.category, datum.c);

            maxTryTimes--;

            // reset all panels
            for (var i = 0; i < 6; i++) {
                $factSet[i].text('');
            }
            $factSet[6].text('CAPITAL');
            ErrorHandler.hide();

            $.cacheScript(url)
                .done(function (script, textStatus) {

                    // filter source data
                    data = data.filter(function (item) {
                        return item[0] > global.startDate;
                    });

                    var options = daoU.processData(data, {
                        "period": period,
                        "pv": datum.pv
                    });
                    $factSet[0].highcharts(daoT.getChartOptions(options), onComplete);

                    var taFactor = daoU.Calc.ta(options);
                    var taFactorBak = {
                        "p": taFactor.major.p,
                        "cagr": taFactor.major.cagr,
                        "opt": taFactor.opt
                    };
                    $factSet[1].html(populateTa(taFactor))
                        .find('.tooltip').popup({
                            inline: true
                        });

                    if (global.category == 'sg' || global.category == 'us') {
                        if (datum.mv) {
                            $factSet[6].text("Shares {0} M, MarketCap: {1} M".format(datum.mv.toFixed(4), (datum.mv * taFactorBak.p).toFixed(4)));
                        }
                    }
                    else if (global.category == 'cn' && !(datum.c.startsWith('8') || datum.c.startsWith('S'))) {
                        $factSet[6].text("总股本 {0} 亿（{1}%流通），总市值 {2} 亿".format(
                            Math.trunc(datum.mv / 1000) / 10.0, (datum.mv > 0 ? Math.trunc(datum.nv / datum.mv * 1000) / 10.0 : NaN), Math.trunc(datum.mv * taFactorBak.p / 1000) / 10.0));

                        $.cacheJSON(jsonUrl).done(function (data, textStatus) {
                            var faSerie1 = daoU.toSeries(data.lastn),
                                faSerie2 = daoU.toSeries(data.ttm);

                            if (!global.debug) {
                                $factSet[2].highcharts(daoF.getChartOptions('FA - Annual', faSerie1));
                                $factSet[3].highcharts(daoF.getChartOptions('FA - TTM', faSerie2));
                            }

                            var faFactor = daoU.Calc.fa(taFactorBak, faSerie1.roe);
                            faFactor.ttm = daoU.Calc.gn(taFactorBak, faSerie2);
                            // set peg and earning
                            faFactor.peg = daoPEG[datum.c];
                            updatePEG(faFactor.peg, '201608');
                            faFactor.ee = daoE[datum.c];
                            faFactor.peg0 = daoPEG0[datum.c];
                            updatePEG(faFactor.peg0, '201703');
                            faFactor.ee0 = daoE0[datum.c];
                            faFactor.peg1 = daoPEG1[datum.c];
                            updatePEG(faFactor.peg1, '201612');
                            faFactor.ee1 = daoE1[datum.c];

                            $factSet[4].html(populateFa(faFactor))
                                .find('.tooltip').popup({
                                    inline: true
                                });

                            $factSet[5].html(doT.tmpls.faTable(data))
                                .find('table:first-child').stupidtable();
                        }).fail(function (jqxhr, textStatus, err) {
                            ErrorHandler.show("failed to load json data:" + jsonUrl);
                        });
                    }
                }).fail(function (jqxhr, textStatus, err) {
                    console.log("failed to load data:", url);
                    if (jqxhr.status === 404 && maxTryTimes > 0 && period === "monthly") {
                        console.log("try again", maxTryTimes);
                        load("daily", maxTryTimes);
                    }
                });
        },
        populateTa = function (taFactor) {
            stylish.ta(taFactor);
            taFactor.opt = daoU.trunc(taFactor.opt, 2);
            taFactor.factor = daoU.trunc(taFactor.factor, 1);
            daoU.debug("taFactor:", taFactor);

            return doT.tmpls.taFactor({
                ta: taFactor
            });
        },
        populateFa = function (faFactor) {
            stylish.fa(faFactor);
            faFactor.avg = daoU.trunc(faFactor.avg, 2);
            faFactor.gap = daoU.trunc(faFactor.gap, 3);
            daoU.debug('faFactor:', faFactor);

            return doT.tmpls.faFactor({
                fa: faFactor
            });
        },
        stylish = {
            ta: function (obj) {
                var cssClass = obj.stylish || {};
                if (obj.major.r2 < 0.3) {
                    cssClass.r2 = 'red';
                } else if (obj.major.r2 < 0.5) {
                    cssClass.r2 = 'olive';
                } else if (obj.major.r2 > 0.8) {
                    cssClass.r2 = 'green';
                } else {
                    cssClass.r2 = 'teal';
                }
                obj.stylish = cssClass;
            },
            fa: function (obj) {
                var cssClass = obj.stylish || {};
                if (obj.avg.cra <= 0) {
                    cssClass.avg = 'down red';
                } else {
                    cssClass.avg = 'up green';
                }

                var x = 10
                cssClass.gap = {};
                Object.getOwnPropertyNames(obj.gap).forEach(function (key) {
                    if (obj.gap[key] > x) {
                        cssClass.gap[key] = 'red'; //negative
                    } else if (obj.gap[key] < -x) {
                        cssClass.gap[key] = 'green'; //positive
                    } else if (obj.gap[key] <= x && obj.gap[key] >= -x) {
                        cssClass.gap[key] = 'yellow'; //warning
                    }
                });
                obj.stylish = cssClass;
            }
        },
        buildItem = function (value, text) {
            return "<option value='{0}'>{1}</option>".format(value, text);
        },
        updatePEG = function (obj, updated) {
            if (Array.isArray(obj))
                if (obj.length === 3) obj.push(updated);
                else obj[3] = updated;
        },
        parseTmpl = function (content, tmpls) {
            var
                divs = $(content),
                div;
            if (divs.length > 0) {
                for (var i = 0; i < divs.length; i++) {
                    div = divs.get(i);
                    if (div.nodeName === "DIV") {
                        tmpls[div.id] = doT.template(div.innerHTML);
                    }
                }
            }
        };
});