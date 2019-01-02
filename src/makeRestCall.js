import fetch from 'isomorphic-fetch'
import _ from 'lodash'
import cookie from 'cookie'
/**
 * rest call function
 *
 * @module redux-rest-call
 */

const getHeaders = headers => {
    let hmap = {}
    if (headers) {
        headers.forEach(function(value, name) {
            if (_.has(hmap, name)) {
                hmap[name].push(value)
            } else {
                hmap[name] = []
                hmap[name].push(value)
            }
        })
    }
    return hmap
}

const getCookies = headers => {
    if (_.has(headers, 'set-cookie')) {
        return _.map(headers['set-cookie'], c => {
            const cParsed = cookie.parse(c)
            return cParsed
        })
    } else {
        return []
    }
}
//const findCookie = (cookies, cookieName) => {
//    let result = null
//    cookies.forEach(cookie => {
//        if (!_.isUndefined(cookie[cookieName])) result = cookie[cookieName]
//    })
//    return result
//}

const runInBrowser = () => !(typeof window === 'undefined')
const getWindowOrigin = () =>
    window.location.origin ||
    window.location.protocol +
        '//' +
        window.location.hostname +
        (window.location.port ? ':' + window.location.port : '')
const getOriginHost = () => (runInBrowser() ? getWindowOrigin() : 'http://localhost')
const getOrigin = () => getOriginHost() + (_.has(process.env, 'REST_API_PORT') ? `:${process.env.REST_API_PORT}` : '')

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

export const makeRestCall = dispatch => (uriPath, config, requestActionFun, responseActionFun) => {
    const origin = getOrigin()

    dispatch(requestActionFun())
    // console.log(`${origin}${uriPath}`, config)
    if (!runInBrowser()) {
        // Extend the call with cookies
    }
    return fetch(`${origin}${uriPath}`, config)
        .then(response => {
            const hmap = getHeaders(response.headers)
            //const cookies = getCookies(hmap)
            //if (!runInBrowser()) {
            //const cookiesSet = findCookie(cookies, 'set-cookie')
            // console.log('cookiesSet: ', cookiesSet)
            // TODO: store cookies
            //}

            //console.log('response: ', uriPath, config, response, hmap)
            if (_.includes([302, 401, 404, 409], response.status)) {
                const result = {
                    ok: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    headers: hmap,
                    cookies: getCookies(hmap)
                }
                dispatch(responseActionFun(result))
                return Promise.resolve(result)
            } else {
                const contentType = response.headers.get('Content-Type')
                if (_.includes(contentType, 'application/json')) {
                    return response.json().then(data => {
                        if (response.ok) {
                            //console.log('data/hmap:', data, hmap)
                            dispatch(responseActionFun(data, hmap))
                            return data
                        } else {
                            console.log('Promise reject will happen from fetch...')
                            return Promise.reject({
                                ok: response.ok,
                                status: response.status,
                                statusText: response.statusText,
                                headers: hmap,
                                cookies: getCookies(hmap)
                            })
                        }
                    })
                }
                throw new TypeError('The server response is not JSON!')
            }
        })
        .catch(ex => {
            console.log('A fetch.catch happened: ', ex, JSON.stringify(config, null, '  '))
            dispatch(responseActionFun(ex))
            return ex
        })
}
