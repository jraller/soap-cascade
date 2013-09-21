/*jslint node:true */

/*
 * Copyright (c) 2013 Jason Aller <jraller@ucdavis.edu>
 * MIT Licensed
 */

'use strict';

var normalize = function (schema, method, args) {
	var soapArgs = {},
		util = require('util'),
//		fs = require('fs'),
		methodName = method.$name;


	console.log('');
	console.log('method: ' + methodName);
	console.log(util.inspect(method.input.children, {depth: null}));
//	console.log('listSites');
//	console.log(util.inspect(schema.elements.listSites, {depth: null}));
//	console.log('authentication');
//	console.log(util.inspect(schema.complexTypes.authentication, {depth: null}));

//	fs.writeFileSync('C:\\Users\\Jason\\Projects\\soap-cascade\\schema.txt', util.inspect(schema, {depth: null}), {encoding: 'utf8'});

	console.log('soapArgs:');
	console.log(util.inspect(soapArgs, {depth: null}));
	soapArgs = args; // for now
	return soapArgs;
};

module.exports = normalize;