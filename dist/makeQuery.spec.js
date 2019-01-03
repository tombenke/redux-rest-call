'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _index = require('./index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import * as _ from 'lodash'
//import { mergeJsonFilesSync } from 'datafile'

describe('makeQuery', function () {
    var queryParams = {
        language: 'EN',
        category: 'general',
        numQuestions: 3
    };

    it('with empty params object', function () {
        (0, _expect2.default)((0, _index.makeQuery)({})).toEqual('');
    });

    it('with null params values', function () {
        (0, _expect2.default)((0, _index.makeQuery)({})).toEqual('');
    });

    it('with full params', function () {
        (0, _expect2.default)((0, _index.makeQuery)(queryParams)).toEqual('?language=EN&category=general&numQuestions=3');
    });
});