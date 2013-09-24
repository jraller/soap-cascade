/*jslint node:true */

/*
 * Copyright (c) 2013 Jason Aller <jraller@ucdavis.edu>
 * MIT Licensed
 */

'use strict';

var normalize = function (client, method, args) {

	function splitType(name) {
		var nameParts;
		nameParts = name.split(':');
		return {
			type: nameParts[0],
			name: nameParts[1]
		};
	}

	function elementNode(element) {
		var me = element.name,
			enumeration = [],
			which;

	//	console.log('->', element.type, element.name);

		if (element.type === 'impl') {

			if (schemas.complexTypes[element.name]) {
	//			console.log(util.inspect(schemas.complexTypes[element.name], {depth: null}));
				if (schemas.complexTypes[element.name].nsName === 'complexType') {
					if (schemas.complexTypes[element.name].children[0].nsName === 'sequence') {
						me = {};
						schemas.complexTypes[element.name].children[0].children.forEach(function (child) {
	//						console.log(util.inspect(child, {depth: null}));
							if (child.nsName === 'choice') {
								//handle choice by calling elementNode on children
								
								//handle workflow correctly
								
								me[element.name] = {};
								child.children.forEach(function (grandchild) {
									which = splitType(grandchild.$type);
									if (which.name !== 'structured-data-node') {
										me[element.name][which.name] = elementNode(which);
									} else {
										me[element.name][which.name] = 'recursive';
									}
								});
							} else {
								which = splitType(child.$type);
								if (which.type === 'impl') {
									if (which.name !== 'structured-data-node') {
										me[child.$name] = elementNode(which);
									} else {
										me[child.$name] = 'recursive';
									}
								} else {
									me[child.$name] = child.$type;
								}
							}

	/*
							if (child.$type) {
							} else {
								console.log('');
								console.log(util.inspect(child, {depth: null}));
								console.log('');
							}
	*/
						});
					} else if (schemas.complexTypes[element.name].children[0].nsName === 'complexContent') {
						if (schemas.complexTypes[element.name].children[0].children[0].nsName === 'extension') {
							if (schemas.complexTypes[element.name].children[0].children[0].children.length === 0) {
								which = splitType(schemas.complexTypes[element.name].children[0].children[0].$base);
								me = elementNode(which);
							} else {
								if (schemas.complexTypes[element.name].children[0].children[0].children[0].nsName === 'sequence') {
									me = {};
									schemas.complexTypes[element.name].children[0].children[0].children[0].children.forEach(function (child) {
										if (child.nsName === 'choice') {
											child.children.forEach(function (grandchild) {
												which = splitType(grandchild.$type);
												me[child.$name] = elementNode(which);
											});
										} else {
											which = splitType(child.$type);
											if (which.type === 'impl') {
												if (which.name !== 'structured-data-node') {
													me[child.$name] = elementNode(which);
												} else {
													me[child.$name] = 'recursive';
												}
											} else {
												me[child.$name] = child.$type;
											}
										}
									
									});
								} else {
									me = 'ERROR'
								}
							}						
						} else {
							me = 'ERROR'
						}
					}
				} else {
					me = 'ERROR'
				}
			}
			if (schemas.types[element.name]) {
	//			console.log(util.inspect(schemas.types[element.name], {depth: null}));
				if (schemas.types[element.name].nsName === 'simpleType') {
					if (schemas.types[element.name].children[0].nsName === 'restriction') {
						schemas.types[element.name].children[0].children.forEach(function(child) {
							enumeration.push(child.$value);
						});
						me = enumeration.join(', ');
					}
				} else {
					me = 'ERROR';
				}
			}
		} else if (element.type === 'xsd') {
			me = 'ERROR';
		} else {
			me = 'ERROR';
		}
		return me;
	}

	function base(name) {
		var me = {},
			typeList = [],
			which,
			pug;

		//starting with the method.$name and going to elements rather than using method.children drill down, for ease of parsing

	//	console.log(util.inspect(schemas.elements[name], {depth: null}));

	//	console.log(schemas.elements[name].nsName, schemas.elements[name].name);
	//	console.log(schemas.elements[name].children.length, schemas.elements[name].children[0].nsName);
	//	console.log(schemas.elements[name].children[0].children.length, schemas.elements[name].children[0].children[0].nsName);
		schemas.elements[name].children[0].children[0].children.forEach(function (child) {
	//		typeList.push(child.$minOccurs + ' ' + child.$maxOccurs + ' ' + child.$type + ' ' + child.$nillable);
			which = splitType(child.$type);
			if (which.type === 'impl') {
				me[which.name] = elementNode(which);
			} else if (which.type === 'xsd') {
				me[child.$name] = child.$minOccurs + ' ' + child.$maxOccurs;
			} else {
				me[which.name] = which.type;
			}
	//		console.log(util.inspect(child, {depth: null}));
		});
	//	console.log(schemas.elements[name].children[0].children[0].children.length, typeList.join(', '));

		return me;
	}


	
	var schemas = client.wsdl.definitions.schemas[client.wsdl.definitions.xmlns.intf], // grab a shortcut to the schemas
		soapArgs = {},
		util = require('util'),
		methodName = method.$name; // grab the method name

	// if there is no sortedArgs object create it
	if (!client.sortedArgs) {
		client.sortedArgs = [];
	}
	// if the current method doesn't exist add it to sorted Args
	if (!client.sortedArgs[methodName]) {
		client.sortedArgs[methodName] = base(methodName);
	}
	// use sortedArgs for the current method to build soapArgs from args
	
	
	
	
	
	

//	console.log(util.inspect(client.sortedArgs, {depth: null}));

//	console.log('');
//	console.log('method: ' + methodName);
//	console.log(util.inspect(method.input.children, {depth: null}));
//	console.log('listSites');
//	console.log(util.inspect(schema.elements.listSites, {depth: null}));
//	console.log('authentication');
//	console.log(util.inspect(schema.complexTypes.authentication, {depth: null}));

//	fs.writeFileSync('C:\\Users\\Jason\\Projects\\soap-cascade\\schema.txt', util.inspect(schema, {depth: null}), {encoding: 'utf8'});

//	console.log(util.inspect(method, {depth: null}));

//	console.log('soapArgs:');
//	console.log(util.inspect(soapArgs, {depth: null}));
	soapArgs = args; // for now
	return soapArgs;
};

module.exports = normalize;