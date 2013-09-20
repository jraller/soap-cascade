/*
 * Copyright (c) 2013 Jason Aller <jraller@ucdavis.edu>
 * MIT Licensed
 */

'use strict';

<<<<<<< HEAD
var normalize = function (schema, args) {
	var soapArgs = {},
		util = require('util');

	soapArgs = args; // for now

	console.log('');
	console.log('authentication');
	console.log(util.inspect(schema.complexTypes.authentication, {depth: null}));

	return soapArgs;
};

module.exports = normalize;
=======
exports.normalize = function (schema, args) {
  var soapArgs = {};
  soapArgs = args; // for now
  return soapArgs;
};
>>>>>>> cf20f3c1d0d4fabdad912ff3950944e82bc7e0e5
