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
//		fs = require('fs'),
		methodName = method.$name; // grab the method name
/*
message
	/wsdl:definitions/wsdl:types/schema:schema/schema:rootElement[@name = $messageName]
*/

/*
rootElement
	impl
		/wsdl:definitions/wsdl:types/schema:schema/schema:complexType[@name = substring-after($elementPartType, 'impl:')]
		/wsdl:definitions/wsdl:types/schema:schema/schema:simpleType[@name = substring-after($elementPartType, 'impl:')]
	xsd
		/
*/
	
	function rootElement() {
		var root = [],
			elements,
			elementNS,
			elementName;

//		console.log(util.inspect(method, {depth: null}));
//		root.push([elementName]);
		
		console.log('');
		
		method.input.children[0].children[0].children.forEach(function (element) {
			elements = element.$type.split(':');
			elementNS = elements[0];
			elementName = elements[1];
			console.log('call for element ' + elementNS + ' : ' + elementName);
			
//			console.log(util.inspect(schemas, {depth: 1}));
			
			if (elementNS === 'impl') {
				if (schemas.complexTypes[elementName]) {
					root.push(complexType(elementNS, elementName));
				} else {
//					root.push(simpleType(elementName));
				}
			}
			if (elementNS === 'xsd') {
//				root.push([]);
			}
		});

		return root;
	}

/*
complexType
	if named
		impl
			schema:sequence
			schema:complexContent/schema:extension
			schema:choice/schema:element
		other
			schema:sequence
			schema:complexContent/schema:extension
			schema:choice/schema:element
	if not named
		impl
			schema:sequence
			schema:complexContent/schema:extension
			schema:choice/schema:element
		other
			schema:sequence
			schema:complexContent/schema:extension
			schema:choice/schema:element
*/

	function complexType(NS, which) {
		var parts = [{complexType:[which]}];
		console.log('call for complexType ' + NS + ' : ' + which);

//		console.log(util.inspect(schemas.complexTypes[which], {depth: null}));
		
		schemas.complexTypes[which].children[0].children.forEach(function (child) {
			console.log(child.$name);
			parts.push(child.$name)
		});
		
		
		return parts;
	}

/*
extension
	/wsdl:definitions/wsdl:types/schema:schema/schema:complexType[@name = $base]
	schema:sequence
*/

	function extention() {
	}

/*
sequence
	schema:element
	schema:choice/schema:element
*/

	function sequence() {
	}

/*
element
	impl:structured-data-nodes - recursion here is possible
	impl
		/wsdl:definitions/wsdl:types/schema:schema/schema:complexType[@name = $elementType]
		/wsdl:definitions/wsdl:types/schema:schema/schema:simpleType[@name = $elementType]
	xsd
		handle
*/

	function element() {
	}

/*
simpleType
	for each schema:restriction/schema:enumeration
*/

	function simpleType() {
	}

	// if there is no sortedArgs object create it
	if (!client.sortedArgs) {
		client.sortedArgs = [];
	}
	// if the current method doesn't exist add it to sorted Args
	if (!client.sortedArgs[methodName]) {
		client.sortedArgs[methodName] = rootElement();
	}
	// use sortedArgs for the current method to build soapArgs from args

	console.log(util.inspect(client.sortedArgs, {depth: null}));

//	console.log('');
//	console.log('method: ' + methodName);
//	console.log(util.inspect(method.input.children, {depth: null}));
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