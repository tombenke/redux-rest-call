import { stringify } from 'querystring'

/**
 * Make query string out of an object that holds parameters for filter,
 * orderBy and paging
 */
export const makeQuery = queryParams => {
    const queryStr = stringify(queryParams)

    return queryStr.length > 0 ? `?${queryStr}` : ''
}
