/*
 * Copyright (c) 2013 Jason Aller <jraller@ucdavis.edu>
 * MIT Licensed
 */

'use strict';

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