import { stringify } from 'querystring'
/**
 * query string handler function
 *
 * @module redux-rest-call
 */

/**
 * Make query string out of an object that holds parameters
 *
 * @arg {Object} queryParams - The query parameters
 *
 * @return {String} - The query string
 *
 * @function
 */
export const makeQuery = queryParams => {
    const queryStr = stringify(queryParams)

    return queryStr.length > 0 ? `?${queryStr}` : ''
}
