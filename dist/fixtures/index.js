'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultState = undefined;

var _datafile = require('datafile');

var defaultState = exports.defaultState = (0, _datafile.loadJsonFileSync)(__dirname + '/stateDefault.yml');