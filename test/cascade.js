'use strict';

/*
 * manually run with mocha -R spec -u exports .\test\cascade.js
 * listSites only checks the simple case, a case with array based will be needed as well
 * editAccessRights might be a good one to use with testing the aclEntry portion with multiple entries
 */

var soap = require('..'),
	client = {},
	inquirer = require('inquirer'),
	assert = require('assert'),
	url = 'http://conference.cascadeserver.com',
	ws = '/ws/services/AssetOperationService?wsdl',
	argsOrder = {
		authentication: {
			password: '',
			username: ''
		}
	},
	argsUnorder = {
		authentication: {
			username: '',
			password: ''
		}
	},
	questions = [
		{
			type: 'input',
			name: 'serverUrl',
			message: 'Server url: ',
			'default': 'http://conference.cascadeserver.com'
		},
		{
			type: 'input',
			name: 'username',
			message: 'Username: ',
			'default': 'jraller'
		},
		{
			type: 'password',
			name: 'password',
			message: 'Password: '
		}
	];

module.exports = {
	'input': {
		'bugUser': function (done) {
			this.timeout(60 * 1000);
			console.log('');
			inquirer.prompt(questions, function (answers) {
				url = answers.serverUrl + ws;
				argsOrder.authentication.username = answers.username;
				argsOrder.authentication.password = answers.password;
				argsUnorder.authentication.username = answers.username;
				argsUnorder.authentication.password = answers.password;
				done();
			});
		}
	},
	'args order': {
		'createClient': function (done) {
			this.timeout(7500);
			soap.createClient(url, function (err, newClient) {
				assert.ok(!err);
				client = newClient;
				done();
			});
		},
		'listSites with correct order': function (done) {
			this.timeout(5000);
			client.listSites(argsOrder, function (err, response) {
				assert.ok(!err);
				if (!err) {
					assert.equal(response.listSitesReturn.success.toString(), 'true');
				}
				done();
			});
		}/*,
		'listMessages': function (done) {
			this.timeout(5000);
			client.listMessages(argsOrder, function (err, response) {
				assert.ok(!err);
				if (!err) {
					assert.equal(response.listMessagesReturn.success.toString(), 'true');
				}
				done();
			});
		},
		'listSites with correct order again': function (done) {
			this.timeout(5000);
			client.listSites(argsOrder, function (err, response) {
				assert.ok(!err);
				if (!err) {
					assert.equal(response.listSitesReturn.success.toString(), 'true');
				}
				done();
			});
		}  /*,
		'listSites with incorrect order': function (done) {
			this.timeout(5000);
			client.listSites(argsUnorder, function (err, response) {
				assert.ok(!err);
				if (!err) {
					assert.equal(response.listSitesReturn.success.toString(), 'true');
				}
				done();
			});
		} */
	}
};
