var soap = require('..'),
	assert = require('assert'),
	client;


module.exports = {
	'SOAP Client': {

		'should create client': function (done) {
			this.timeout(5000);
			soap.createClient('http://www.webservicex.net/periodictable.asmx?WSDL', function (err, newClient) {
				assert.ok(!err);
				client = newClient;
				done();
			});
		},

		'it call the client': function (done) {
			this.timeout(5000);
			client.GetAtomicWeight({ElementName: 'Hydrogen'}, function (err, response) {
				assert.ok(!err);
				assert.equal(response.GetAtomicWeightResult[0], "<NewDataSet><Table><AtomicWeight>1.00797</AtomicWeight></Table></NewDataSet>");
				done();
			});
		}
		
/*
		'should server up WSDL': function(done) {
			request('http://localhost:15099/stockquote?wsdl', function(err, res, body) {
				assert.ok(!err);
				assert.equal(res.statusCode, 200);
				assert.ok(body.length);
				done();
			})			
		},

		'should return complete client description': function(done) {
			soap.createClient('http://localhost:15099/stockquote?wsdl', function(err, client) {
				assert.ok(!err);
				var description = client.describe(),
					expected = { input: { tickerSymbol: "string" }, output:{ price: "float" } };
				assert.deepEqual(expected , description.StockQuoteService.StockQuotePort.GetLastTradePrice );
				done();
			});
		},

		'should return correct results': function(done) {
			soap.createClient('http://localhost:15099/stockquote?wsdl', function(err, client) {
				assert.ok(!err);
				client.GetLastTradePrice({ tickerSymbol: 'AAPL'}, function(err, result) {
					assert.ok(!err);
					assert.equal(19.56, parseFloat(result.price));
					done();
				});			
			});
		}
		
		
	*/
	}
};
