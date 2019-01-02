'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeQuery = undefined;

var _querystring = require('querystring');

/**
 * Make query string out of an object that holds parameters for filter,
 * orderBy and paging
 */
var makeQuery = exports.makeQuery = function makeQuery(queryParams) {
  var queryStr = (0, _querystring.stringify)(queryParams);

  return queryStr.length > 0 ? '?' + queryStr : '';
};