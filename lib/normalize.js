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

	function rootElement(name) {
		var root = [],
			elements,
			elementNS,
			elementName;
	//	console.log('');

	//	console.log(util.inspect(schemas.elements[name].children[0].children[0].children.length, {depth: 1}));

		schemas.elements[name].children[0].children[0].children.forEach(function (part) {
			elements = part.$type.split(':');
			elementNS = elements[0];
			elementName = elements[1];

	//			console.log(util.inspect(schemas, {depth: 1}));

			if (elementNS === 'impl') {
				if (schemas.complexTypes[elementName]) {
	//				console.log('  call for complexTypes ' + elementNS + ' : ' + elementName);
					root.push(complexType(elementNS, elementName, part.$name));
				} else {
	//				console.log('  call for simpleType ' + elementNS + ' : ' + elementName);
					root.push(simpleType(elementName));
				}
			}
			if (elementNS === 'xsd') {
	//			console.log(util.inspect(part, {depth: 1}));
	//			console.log('  call for xsd ' + elementNS + ' : ' + elementName);
				root.push(elementNode(elementNS, elementName, part.$name));
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

	function complexType(NS, which, name) {
		var stub = {},
			typeParts,
			typeNS,
			typeName;

		stub[which] = {};
		stub[which][name] = [];

		if (name === 'asset') {
	//		console.log(util.inspect(schemas.complexTypes[which], {depth: null}));
		}

		schemas.complexTypes[which].children[0].children.forEach(function (child) {
	//		console.log(name, child.$name);

			if (child.name === 'element') {
				stub[which][name].push(child.$name);
			}
			if (child.name === 'choice') {
				child.children.forEach(function (choice) {
					console.log('choice');
					typeParts = choice.$type.split(':');
					typeNS = typeParts[0];
					typeName = typeParts[1];
					if (typeNS === 'impl') {
						console.log(util.inspect(choice, {depth: 1}));
					}
					stub[which][name].push(child.$name);
				});
			}

		});
		return stub[which];
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

	function elementNode(NS, which, name) {
		var stub = {};
		if (NS === 'xsd') {
			stub[name] = which;
		}
		if (NS === 'impl') {
			//handle impl:structured-data-nodes
		}
		return stub;
	}

/*
simpleType
	for each schema:restriction/schema:enumeration
*/

	function simpleType(which) {
		var stub = {};

		stub[which] = {};
		stub[which].enumeration = [];

	//	console.log(util.inspect(schemas.types[which], {depth: null}));

		schemas.types[which].children[0].children.forEach(function (child) {
	//		console.log(child.$value);
			stub[which].enumeration.push(child.$value);
		});


		return stub;
	}

	// if there is no sortedArgs object create it
	if (!client.sortedArgs) {
		client.sortedArgs = [];
	}
	// if the current method doesn't exist add it to sorted Args
	if (!client.sortedArgs[methodName]) {
		client.sortedArgs[methodName] = rootElement(methodName);
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

	console.log(util.inspect(method, {depth: null}));

//	console.log('soapArgs:');
//	console.log(util.inspect(soapArgs, {depth: null}));
	soapArgs = args; // for now
	return soapArgs;
};

module.exports = normalize;