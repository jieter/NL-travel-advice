#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var cheerio = require('cheerio');
var iso3166 = require('./country')

function load(url, callback) {
	http.get(url, function (res) {
		var body = '';
		res.on('data', function (chunk) {
			body += chunk;
		});
		res.on('end', function () {
			callback(cheerio.load(body));
		});

	}).on('error', function (err) {
		console.log(err.message);
	});
}
var mapNL2EN = function (name) {
	var map = {
		'Amerikaanse Maagdeneilanden': 'VIR',
		'Belarus (Wit-Rusland)': 'BLR',
		'Birma / Myanmar': 'MMR',
		'Britse Maagdeneilanden': 'VGB',
		'Brunei Darussalam': 'BRN',
		'Congo, de Republiek': 'COG',
		'Congo, Democratische Republiek': 'COD',
		'Cookeilanden': 'COK',
		'Filipijnen': 'PHL',
		'Hawaï': 'USA',
		'Hongkong SAR': 'HKG',
		'Ivoorkust': 'CIV',
		'Kaaimaneilanden': 'CYM',
		'Kaapverdië': 'CPV',
		'Kosovo': 'RKS',
		'Marshalleilanden': 'MHL',
		'Pitcairneilanden': 'PCN',
		'Salomonseilanden': 'SLB',
		'Sao Tomé en Principe': 'STP',
		'Tokelau-eilanden': 'TKL',
		'Tsjechië': 'CZE',
		'Turks- en Caicoseilanden': 'TCA',
		'Verenigde Staten van Amerika': 'USA',
		'Zuid-Sudan': 'SSD',
		'Somaliland': 'SOM'
	};
	if (map[name]) {
		return map[name];
	} else {
		return name;
	}
};


function countries(callback) {
	var base = 'http://www.rijksoverheid.nl';
	var url = base + '/onderwerpen/reisadviezen/inhoud';

	load(url, function ($) {
		var result = {};
		$('#content li a').each(function () {
			var a = $(this);
			var country = {
				name_nl: a.text(),
				originalUrl: base + a.attr('href')
			};

			var isoCountry = iso3166.get(
				mapNL2EN(country.name_nl),
				'nl'
			);
			if (!isoCountry) {
				console.error('Not found in iso3166.json:', country.name_nl);
			} else {
				country.id = isoCountry.CountryCodes.iso3;
				country.name = isoCountry.Name;
			}
			load(country.originalUrl, function ($) {
				var advice = $('#content .travel-advice').text();
				country.advice = advice;
				if (country.id) {
					result[country.id] = country;
					callback(result);
				}
			});

		});


	});
}

countries(function (result) {
	fs.writeFileSync('NL-travel-advice.json', JSON.stringify(result, null, 2));
});