'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeRestCall = undefined;

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _cookie = require('cookie');

var _cookie2 = _interopRequireDefault(_cookie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//require('es6-promise').polyfill()

var getHeaders = function getHeaders(headers) {
    var hmap = {};
    if (headers) {
        headers.forEach(function (value, name) {
            if (_lodash2.default.has(hmap, name)) {
                hmap[name].push(value);
            } else {
                hmap[name] = [];
                hmap[name].push(value);
            }
        });
    }
    return hmap;
};

var getCookies = function getCookies(headers) {
    if (_lodash2.default.has(headers, 'set-cookie')) {
        return _lodash2.default.map(headers['set-cookie'], function (c) {
            var cParsed = _cookie2.default.parse(c);
            return cParsed;
        });
    } else {
        return [];
    }
};
var findCookie = function findCookie(cookies, cookieName) {
    var result = null;
    cookies.forEach(function (cookie) {
        if (!_lodash2.default.isUndefined(cookie[cookieName])) result = cookie[cookieName];
    });
    return result;
};

var runInBrowser = function runInBrowser() {
    return !(typeof window === 'undefined');
};
var getWindowOrigin = function getWindowOrigin() {
    return window.location.origin || window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
};
var getOriginHost = function getOriginHost() {
    return runInBrowser() ? getWindowOrigin() : 'http://localhost';
};
var getOrigin = function getOrigin() {
    return getOriginHost() + (_lodash2.default.has(process.env, 'REST_API_PORT') ? ':' + process.env.REST_API_PORT : '');
};

var makeRestCall = exports.makeRestCall = function makeRestCall(dispatch) {
    return function (uriPath, config, requestActionFun, responseActionFun) {
        var origin = getOrigin();

        dispatch(requestActionFun());
        // console.log(`${origin}${uriPath}`, config)
        if (!runInBrowser()) {
            // Extend the call with cookies
        }
        return (0, _isomorphicFetch2.default)('' + origin + uriPath, config).then(function (response) {
            var hmap = getHeaders(response.headers);
            var cookies = getCookies(hmap);
            if (!runInBrowser()) {
                var cookiesSet = findCookie(cookies, 'set-cookie');
                // console.log('cookiesSet: ', cookiesSet)
                // TODO: store cookies
            }

            //console.log('response: ', uriPath, config, response, hmap)
            if (response.status === 401 || response.status === 404 || response.status === 302) {
                var result = new Error({
                    ok: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    headers: hmap,
                    cookies: getCookies(hmap)
                });
                dispatch(responseActionFun(result));
                return Promise.resolve(result);
            } else {
                var contentType = response.headers.get('Content-Type');
                if (_lodash2.default.includes(contentType, 'application/json')) {
                    return response.json().then(function (data) {
                        if (response.ok) {
                            //console.log('data/hmap:', data, hmap)
                            dispatch(responseActionFun(data, hmap));
                            return data;
                        } else {
                            console.log('Promise reject will happen from fetch...');
                            return Promise.reject({
                                ok: response.ok,
                                status: response.status,
                                statusText: response.statusText,
                                headers: hmap,
                                cookies: getCookies(hmap)
                            });
                        }
                    });
                }
                throw new TypeError('The server response is not JSON!');
            }
        }).catch(function (ex) {
            console.log('A fetch.catch happened: ', ex, JSON.stringify(config, null, '  '));
            dispatch(responseActionFun(new Error(ex)));
            return ex;
        });
    };
};