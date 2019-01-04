'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _nock = require('nock');

var _nock2 = _interopRequireDefault(_nock);

var _reduxActions = require('redux-actions');

var _reduxMockStore = require('redux-mock-store');

var _reduxMockStore2 = _interopRequireDefault(_reduxMockStore);

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _index = require('./index');

var _fixtures = require('./fixtures/');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin;

var middlewares = [_reduxThunk2.default];
var mockStore = (0, _reduxMockStore2.default)(middlewares);

var _createActions = (0, _reduxActions.createActions)({
    GET_USER_PROFILE_REQUEST: null,
    GET_USER_PROFILE_RESPONSE: function GET_USER_PROFILE_RESPONSE(results) {
        return results;
    }
}),
    getUserProfileRequest = _createActions.getUserProfileRequest,
    getUserProfileResponse = _createActions.getUserProfileResponse;

var getUserProfile = function getUserProfile(queryParams) {
    return function (dispatch, getState) {
        if (getState().userProfile.getUserProfileState === 'IDLE') {
            var queryStr = (0, _index.makeQuery)(queryParams);
            return (0, _index.makeRestCall)(dispatch)('/auth/profile' + queryStr, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json'
                }
            }, getUserProfileRequest, getUserProfileResponse);
        }
    };
};

describe('makeRestCall', function () {
    var responseBody = _fixtures.defaultState.userProfile.data;

    afterEach(function () {
        _nock2.default.cleanAll();
    });

    var queryParamsStr = '';
    var queryParams = {};

    // GET /auth/profile
    it('handle 200 OK', function () {
        (0, _nock2.default)(origin).get('/auth/profile' + queryParamsStr).reply(200, responseBody);

        var expectedActions = [{ type: 'GET_USER_PROFILE_REQUEST' }, { type: 'GET_USER_PROFILE_RESPONSE', payload: responseBody }];
        var store = mockStore({ userProfile: { getUserProfileState: 'IDLE' } });

        return store.dispatch(getUserProfile(queryParams)).then(function () {
            (0, _expect2.default)(store.getActions()).toEqual(expectedActions);
        });
    });

    it('handle 404 ERR', function () {
        (0, _nock2.default)(origin).get('/auth/profile').reply(404, responseBody);

        var expectedPayload = {
            cookies: [],
            headers: {
                'content-type': ['application/json']
            },
            ok: false,
            status: 404,
            statusText: 'Not Found'
        };
        var expectedActions = [{ type: 'GET_USER_PROFILE_REQUEST' }, {
            type: 'GET_USER_PROFILE_RESPONSE',
            payload: expectedPayload
        }];
        var store = mockStore({ userProfile: { getUserProfileState: 'IDLE' } });

        return store.dispatch(getUserProfile()).then(function () {
            (0, _expect2.default)(store.getActions()).toEqual(expectedActions);
        });
    });

    it('handle 500 ERR', function () {
        (0, _nock2.default)(origin).get('/auth/profile').reply(500, {});

        var expectedActions = [{ type: 'GET_USER_PROFILE_REQUEST' }, {
            type: 'GET_USER_PROFILE_RESPONSE',
            payload: {
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                headers: { 'content-type': ['application/json'] },
                cookies: []
            }
        }];
        var store = mockStore({ userProfile: { getUserProfileState: 'IDLE' } });

        return store.dispatch(getUserProfile()).then(function () {
            (0, _expect2.default)(store.getActions()).toEqual(expectedActions);
        });
    });

    it('handle 500 ERR', function () {
        (0, _nock2.default)(origin).get('/auth/profile').reply(500, 'Wrong format');

        var expectedActions = [{ type: 'GET_USER_PROFILE_REQUEST' }, {
            type: 'GET_USER_PROFILE_RESPONSE',
            error: true,
            payload: new TypeError('The server response is not JSON!')
        }];
        var store = mockStore({ userProfile: { getUserProfileState: 'IDLE' } });

        return store.dispatch(getUserProfile()).then(function () {
            (0, _expect2.default)(store.getActions()).toEqual(expectedActions);
        });
    });
});