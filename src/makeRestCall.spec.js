import expect from 'expect'
import nock from 'nock'
import { createActions } from 'redux-actions'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { makeQuery, makeRestCall } from './index'
import { defaultState } from './fixtures/'

const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const { getUserProfileRequest, getUserProfileResponse } = createActions({
    GET_USER_PROFILE_REQUEST: null,
    GET_USER_PROFILE_RESPONSE: results => results
})

const getUserProfile = queryParams => {
    return (dispatch, getState) => {
        if (getState().userProfile.getUserProfileState === 'IDLE') {
            const queryStr = makeQuery(queryParams)
            return makeRestCall(dispatch)(
                `/auth/profile${queryStr}`,
                {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json'
                    }
                },
                getUserProfileRequest,
                getUserProfileResponse
            )
        }
    }
}

describe('makeRestCall', () => {
    const responseBody = defaultState.userProfile.data

    afterEach(() => {
        nock.cleanAll()
    })

    const queryParamsStr = ''
    const queryParams = {}

    // GET /auth/profile
    it('handle 200 OK', () => {
        nock(origin)
            .get(`/auth/profile${queryParamsStr}`)
            .reply(200, responseBody)

        const expectedActions = [
            { type: 'GET_USER_PROFILE_REQUEST' },
            { type: 'GET_USER_PROFILE_RESPONSE', payload: responseBody }
        ]
        const store = mockStore({ userProfile: { getUserProfileState: 'IDLE' } })

        return store.dispatch(getUserProfile(queryParams)).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it('handle 404 ERR', () => {
        nock(origin)
            .get(`/auth/profile`)
            .reply(404, responseBody)

        const expectedPayload = {
            cookies: [],
            headers: {
                'content-type': ['application/json']
            },
            ok: false,
            status: 404,
            statusText: 'Not Found'
        }
        const expectedActions = [
            { type: 'GET_USER_PROFILE_REQUEST' },
            {
                type: 'GET_USER_PROFILE_RESPONSE',
                payload: expectedPayload
            }
        ]
        const store = mockStore({ userProfile: { getUserProfileState: 'IDLE' } })

        return store.dispatch(getUserProfile()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it('handle 500 ERR', () => {
        nock(origin)
            .get(`/auth/profile`)
            .reply(500, {})

        const expectedActions = [
            { type: 'GET_USER_PROFILE_REQUEST' },
            {
                type: 'GET_USER_PROFILE_RESPONSE',
                payload: {
                    ok: false,
                    status: 500,
                    statusText: 'Internal Server Error',
                    headers: { 'content-type': ['application/json'] },
                    cookies: []
                }
            }
        ]
        const store = mockStore({ userProfile: { getUserProfileState: 'IDLE' } })

        return store.dispatch(getUserProfile()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it('handle non-JSON response format', () => {
        nock(origin)
            .get(`/auth/profile`)
            .reply(200, 'Wrong format')

        const expectedActions = [
            { type: 'GET_USER_PROFILE_REQUEST' },
            {
                type: 'GET_USER_PROFILE_RESPONSE',
                error: true,
                payload: new TypeError('The server response is not JSON!')
            }
        ]
        const store = mockStore({ userProfile: { getUserProfileState: 'IDLE' } })

        return store.dispatch(getUserProfile()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it('handle server not responding error', () => {
        const store = mockStore({ userProfile: { getUserProfileState: 'IDLE' } })

        return store.dispatch(getUserProfile()).then(() => {
            const actions = store.getActions()
            expect(actions[1]).toHaveProperty('error', true)
        })
    })
})
