'use strict';

// curl -X GET https://api.coinbase.com/v2/prices/BTC-USD/spot?date=2017-11-05
// https://developers.coinbase.com/api/v2#get-spot-price

var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
var path = require('path');
var request = require('request');
var querystring = require('querystring');

var startDate = process.argv[2] && (moment(process.argv[2]));
var currencyPair = process.argv[3];

if (!startDate) {
	console.error('Invalid start date');
	process.exit(1);
}

if (!currencyPair) {
	console.error('Missing currency pair');
	process.exit(1);
}

var outputFilePath = path.join(__dirname, 'daily-spot-price-' + currencyPair + '-from-' + startDate.format('YYYY-MM-DD') + '.csv');
var outputFileWriteStream = fs.createWriteStream(outputFilePath);

var getData = function(date, cb) {
	var formattedDate = moment(date).format('YYYY-MM-DD');
	var params = {
		date: formattedDate,
	};
	var uri = 'https://api.coinbase.com/v2/prices/' + encodeURIComponent(currencyPair) + '/spot?' + querystring.stringify(params);
	request(uri, function(error, response, body) {
		if (error) return cb(error);
		if (response.statusCode !== 200) return cb(new Error(body));
		try {
			var data = JSON.parse(body);
		} catch (error) {
			return cb(error);
		}
		cb(null, {
			date: formattedDate,
			rate: data.data.amount,
		});
	});
};

var delay = 500;
var q = async.queue(function(task, next) {
	getData(task.date, function(error, data) {
		if (error) return next(error);
		outputFileWriteStream.write([data.date, data.rate].join(',') + '\n');
		_.delay(next, delay);
	});
}, 1/* concurrency */);

q.error = function(error) {
	console.error(error);
	outputFileWriteStream.end();
	process.exit(1);
};

q.drain = function() {
	outputFileWriteStream.end();
	process.exit();
};

var now = moment();
var date = startDate;
while (now.diff(date, 'hours') > 0) {
	q.push({ date: date });
	date = moment(date).add(1, 'day');
}
