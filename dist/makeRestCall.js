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

/**
 * rest call function
 *
 * @module makeRestCall
 */

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
//const findCookie = (cookies, cookieName) => {
//    let result = null
//    cookies.forEach(cookie => {
//        if (!_.isUndefined(cookie[cookieName])) result = cookie[cookieName]
//    })
//    return result
//}

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

/**
 * Make REST call
 *
 * @arg {Function} dispatch - The dispatch function of the redux store
 *
 * @return {Function} - A function with the following signature:
 * `function(uriPath: String, config: Object, requestActionFun: Function, responseActionFun: Function)`,
 * where `uriPath` is the URI of the REST endpoint to call, config is the config parameters of call,
 * such as `method`, `headers`, etc., the two last parameters are redux action functions.
 * `requestActionFun` will be called immediately before the REST call started, and the `responseActionFun`
 * will be called with the REST response including the status and the body.
 *
 * @function
 */

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
            //const cookies = getCookies(hmap)
            //if (!runInBrowser()) {
            //const cookiesSet = findCookie(cookies, 'set-cookie')
            // console.log('cookiesSet: ', cookiesSet)
            // TODO: store cookies
            //}

            //console.log('response: ', uriPath, config, response, hmap)
            if (_lodash2.default.includes([302, 401, 404, 409, 500], response.status)) {
                var result = {
                    ok: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    headers: hmap,
                    cookies: getCookies(hmap)
                };
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
                            //console.log('Promise reject will happen from fetch...')
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
            // console.log('A fetch.catch happened: ', ex, JSON.stringify(config, null, '  '))
            dispatch(responseActionFun(ex));
            return ex;
        });
    };
};