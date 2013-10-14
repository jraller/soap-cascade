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
		// element is obj containing both a name and a type
		var name = element.name,
			type = element.type,
			me = name,
			enumeration = [],
			which;
		if (type === 'impl') { // if element is an implementation
			if (schemas.complexTypes[name]) { // if there is a complexType listed for this name
				if (schemas.complexTypes[name].nsName === 'complexType') { // if the namespace for this instance is complexType
					if (schemas.complexTypes[name].children[0].nsName === 'sequence') {
						me = {};
						schemas.complexTypes[name].children[0].children.forEach(function (child) {
							if (child.nsName === 'choice') { // handle complexContent.choice
								child.children.forEach(function (grandchild) {
									which = splitType(grandchild.$type);
									if (which.name !== 'structured-data-node') {
										me[which.name] = elementNode(which);
									} else {
										me[which.name] = ['structured-data-node']; // for structured-data-nodes stop processing and add reference
									}
								});
							} else if (child.nsName === 'element') { // handle complexContent.element
								which = splitType(child.$type);
								if (which.type === 'impl') {
									if (which.name !== 'structured-data-node') {
										if (child.$maxOccurs === 'unbounded') {
											me[child.$name] = [elementNode(which)]; // handle arrayable children
										} else {
											me[child.$name] = elementNode(which);
										}
									} else {
										me[child.$name] = ['structured-data-node']; // for structured-data-nodes stop processing and add reference
									}
								} else {
									me[child.$name] = child.$type;
								}
							} else {
								me = 'ERROR';
							}
						});
					// end of handling sequence
					} else if (schemas.complexTypes[name].children[0].nsName === 'complexContent') {
						if (schemas.complexTypes[name].children[0].children[0].nsName === 'extension') {
							me = {};
							if (schemas.complexTypes[name].children[0].children[0].children.length === 0) { // extension with base
								which = splitType(schemas.complexTypes[name].children[0].children[0].$base);
								me = elementNode(which);
							} else { // extension with base and sequence
								which = splitType(schemas.complexTypes[name].children[0].children[0].$base);
								me = elementNode(which);
								if (schemas.complexTypes[name].children[0].children[0].children[0].nsName === 'sequence') {
									schemas.complexTypes[name].children[0].children[0].children[0].children.forEach(function (child) {
										if (child.nsName === 'choice') {
											child.children.forEach(function (grandchild) {
												which = splitType(grandchild.$type);
												me[child.$name] = elementNode(which);
											});
										} else { // handling as element, could explicitly check for it and error
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
								// end of complexContent with sequence
								} else {
									me = 'ERROR';
								}
							}
						} else {
							me = 'ERROR';
						}
					// end of handing complexContent
					} else if (schemas.complexTypes[name].children[0].nsName === 'choice') {
						me = {};
						schemas.complexTypes[name].children[0].children.forEach(function (child) {
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
					// end of handling choice
					} else { // was not one of complextType, complexContent, choice
						me = 'ERROR';
					}
				} else { // if we find a complexType that is not namspaced as such
					me = 'ERROR';
				}
			} // there was not a complexType for this name
			if (schemas.types[name]) { // if there is a type for this name
				if (schemas.types[name].nsName === 'simpleType') {
					if (schemas.types[name].children[0].nsName === 'restriction') {
						schemas.types[name].children[0].children.forEach(function (child) {
							enumeration.push(child.$value);
						});
						me = '';
//						me = enumeration.join(', '); // this version would allow us to check enumerable values for syntax in the traverse function
					}
				} else {
					me = 'ERROR';
				}
			}
		} else if (type === 'xsd') { // element is not an implementation
			me = 'ERROR'; // error on type is xsd, xsd types should be handled as part of their parents
		} else {
			me = 'ERROR'; // error on type is other (not impl or xsd)
		}
		return me;
	}

	function base(name) {
		// name is method name
		var me = {},
			which;
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
		// obj is the template object to work
		// parent is the path into source
		// source is the supplied data to be reordered and trimmed
		var me, // the return object we will build
			prop, // for traversing ojects
			newParent, // for keeping track when we decend into a child
			objRef,
			value,
			target = getDescendantProp(source, parent); // using parent grab current target data to work with from source

		if (util.isArray(obj) && util.isArray(target)) { // if both the pattern and the supplied data are both arrays
			me = []; // generate an array
			target.forEach(function (child) { // working from the number of supplied items
				if (parent.endsWith('.structuredDataNode')) { // if the object is a structuredDataNode
					me.push(traverse(client.sortedArgs.structuredDataNode, '', child)); // stop using the supplied template from obj, reset parent path, recurse
				} else {
					me.push(traverse(obj[0], '', child)); // recursively process it
				}
			});
		} else { // the supplied data shouldn't be an array
			me = {};
			if (util.isArray(obj)) { // if the template is an array
				objRef = obj[0]; // grab the first entry, templates should only have one
			} else {
				objRef = obj; // else grab the obj
			}
			for (prop in objRef) { // walk the obj
				if (objRef.hasOwnProperty(prop)) {
					if (parent.length) {
						newParent = parent + '.' + prop;
					} else {
						newParent = prop;
					}
					value = getDescendantProp(source, newParent);
					if (value && !isEmpty(value)) {
						if (typeof objRef[prop] === 'object') {
							me[prop] = traverse(objRef[prop], newParent, source); // recurse
						} else {
							me[prop] = value; // handle terminal node
						}
					}
				}
			}
		}
		return me; // collect all recursion and return new soap arguments from root call
	}

	// if there is no sortedArgs object create it
	if (!client.sortedArgs) {
		client.sortedArgs = [];
	}
	if (!client.sortedArgs.structuredDataNode) { // build structured-data-node separately from calls to handle it being recursive
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
