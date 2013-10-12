/*jslint node:true */

/*
 * Copyright (c) 2013 Jason Aller <jraller@ucdavis.edu>
 * MIT Licensed
 */

'use strict';

var normalize = function (client, method, args) {
	var schemas = client.wsdl.definitions.schemas[client.wsdl.definitions.xmlns.intf], // grab a shortcut to the schemas
		soapArgs = {},
		util = require('util'),
		methodName = method.$name; // grab the method name

	String.prototype.endsWith = function (suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};

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
	//							me[element.name] = {};
								child.children.forEach(function (grandchild) {
	//								console.log(util.inspect(grandchild, {depth: null}));
									which = splitType(grandchild.$type);
									if (which.name !== 'structured-data-node') {
										me[which.name] = elementNode(which);
									} else {
										me[which.name] = ['structured-data-node'];
									}
								});
							} else if (child.nsName === 'element') {
								which = splitType(child.$type);
								if (which.type === 'impl') {
									if (which.name !== 'structured-data-node') {
										if (child.$maxOccurs === 'unbounded') {
											me[child.$name] = [elementNode(which)];
										} else {
											me[child.$name] = elementNode(which);
										}
									} else {
										me[child.$name] = ['structured-data-node'];
									}
								} else {
									me[child.$name] = child.$type;
								}
							} else {
								me = 'ERROR';
							}
						});
					} else if (schemas.complexTypes[element.name].children[0].nsName === 'complexContent') {
						if (schemas.complexTypes[element.name].children[0].children[0].nsName === 'extension') {
							me = {};
							if (schemas.complexTypes[element.name].children[0].children[0].children.length === 0) { // extension with base
								which = splitType(schemas.complexTypes[element.name].children[0].children[0].$base);
								me = elementNode(which);
							} else { // extension with base and sequence
								which = splitType(schemas.complexTypes[element.name].children[0].children[0].$base);
								me = elementNode(which);
								if (schemas.complexTypes[element.name].children[0].children[0].children[0].nsName === 'sequence') {
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
													me[child.$name] = ['structured-data-node'];
												}
											} else {
												me[child.$name] = child.$type;
											}
										}
									});
								} else {
									me = 'ERROR';
								}
							}
						} else {
							me = 'ERROR';
						}
					} else if (schemas.complexTypes[element.name].children[0].nsName === 'choice') {
						me = {};
						schemas.complexTypes[element.name].children[0].children.forEach(function (child) {
	//						console.log(util.inspect(child, {depth: null}));
							which = splitType(child.$type);
							if (which.type === 'impl') {
								if (which.name !== 'structured-data-node') {
									me[child.$name] = elementNode(which);
								} else {
									me[child.$name] = ['structured-data-node'];
								}
							} else {
								me[child.$name] = child.$type;
							}
						});
					} else {
						me = 'ERROR';
					}
				} else {
					me = 'ERROR';
				}
			}
			if (schemas.types[element.name]) {
	//			console.log(util.inspect(schemas.types[element.name], {depth: null}));
				if (schemas.types[element.name].nsName === 'simpleType') {
					if (schemas.types[element.name].children[0].nsName === 'restriction') {
						schemas.types[element.name].children[0].children.forEach(function (child) {
							enumeration.push(child.$value);
						});
						me = '';
	//					me = enumeration.join(', ');
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
		schemas.elements[name].children[0].children[0].children.forEach(function (child) {
			which = splitType(child.$type);
			if (which.type === 'impl') {
				me[which.name] = elementNode(which);
			} else if (which.type === 'xsd') {
				me[child.$name] = ''; //child.$minOccurs + ' ' + child.$maxOccurs;
			} else {
				me[which.name] = which.type;
			}
		});
		return me;
	}

	function getDescendantProp(obj, desc) {
		var arr = desc.split(".");
		while (arr.length) {
			obj = obj[arr.shift()];
		}
		return obj;
	}

	function isEmpty(obj) {
		var prop;
		for (prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				return false;
			}
		}
		return true;
	}

	function traverse(obj, parent, source) {
		var me,
			prop,
			newParent,
			value,
			target = getDescendantProp(source, parent);
			
		if (util.isArray(obj) && util.isArray(target)) {
			me = [];
			target.forEach(function (child) {
				var arr = parent.split('.');
				if (arr[arr.length - 1] !== 'structuredDataNode') {
					me.push(traverse(obj[0], '', child));
				} else {
					me.push(traverse(client.sortedArgs.structuredDataNode, '', child));
				}
			});
		} else {
			me = {};
			if (util.isArray(obj)) {
				obj = obj[0];
			}
			for (prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					if (parent.length) {
						newParent = parent + '.' + prop;
					} else {
						newParent = prop;
					}
					value = getDescendantProp(source, newParent);
					if (value && !isEmpty(value)) {
						if (typeof obj[prop] === 'object') {
							me[prop] = traverse(obj[prop], newParent, source);
						} else {
							me[prop] = value;
						}
					}
				}
			}
		}
		return me;
	}


	// if there is no sortedArgs object create it
	if (!client.sortedArgs) {
		client.sortedArgs = [];
	}
	if (!client.sortedArgs.structuredDataNode) {
		client.sortedArgs.structuredDataNode = elementNode({'type': 'impl', 'name': 'structured-data-node'});
	}
	// if the current method doesn't exist add it to sorted Args
	if (!client.sortedArgs[methodName]) {
		client.sortedArgs[methodName] = base(methodName);
	}

	// use sortedArgs for the current method to build soapArgs from args
	soapArgs = traverse(client.sortedArgs[methodName], '', args);

//	soapArgs = args; // for now
	return soapArgs;
};

module.exports = normalize;