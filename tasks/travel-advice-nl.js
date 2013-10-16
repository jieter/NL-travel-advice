#!/usr/bin/env node

'use strict';

var http = require('http');
var async = require('async');

var cheerio = require('cheerio');
var iso3166 = require('./country');

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

function loadCountry(country, callback) {
	load(country.originalUrl, function ($) {

		country.advice = $('#content .travel-advice').text();

		callback();
	});
}

function countries(callback) {
	var base = 'http://www.rijksoverheid.nl';
	var url = base + '/onderwerpen/reisadviezen/inhoud';

	load(url, function ($) {
		var countries = [];
		$('#content li a').each(function () {
			var a = $(this);
			var nameNL = a.text();

			var isoCountry = iso3166.get(mapNL2EN(nameNL), 'nl');

			if (!isoCountry) {
				console.error('Not found in iso3166.json:', nameNL);
			}

			countries.push({
				id: isoCountry ? isoCountry.CountryCodes.iso3 : undefined,
				name: isoCountry.Name,
				'name_nl_NL': a.text(),
				originalUrl: base + a.attr('href')
			});
		});

		// fetch advice from website for each country.
		async.each(countries, loadCountry, function () {
			var result = {};
			countries.forEach(function (country) {
				result[country.id] = country;
			});

			callback(null, result);
		});

	});
}

module.exports = countries;

if (require.main === module) {
	countries(function (err, result) {
		console.log(JSON.stringify(result, null, 2));
	});
}