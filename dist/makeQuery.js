'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeQuery = undefined;

var _querystring = require('querystring');

/**
 * query string handler function
 *
 * @module makeQuery
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
var makeQuery = exports.makeQuery = function makeQuery(queryParams) {
  var queryStr = (0, _querystring.stringify)(queryParams);

  return queryStr.length > 0 ? '?' + queryStr : '';
};