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
		'Amerikaanse Maagdeneilanden': 'Virgin Islands',
		'Belarus (Wit-Rusland)': 'Belarus',
		'Birma / Myanmar': 'Myanmar',
		'Britse Maagdeneilanden': 'British Virgin Islands',
		'Brunei Darussalam': 'Brunei',
		'Congo, de Republiek': 'Congo Rebubliek',
		'Congo, Democratische Republiek': 'Congo Democratische Republiek',
		'Cookeilanden': 'Cook Islands',
		'Filipijnen': 'Filippijnen',
		'Hawaï': '', // part of USA
		'Hongkong SAR': 'Hongkong',
		'Ivoorkust': 'Ivory Coast',
		'Kaaimaneilanden': 'Cayman Islands',
		'Kaapverdië': 'Cape Verde',
		'Kosovo': '',
		'Marshalleilanden': 'Marshall Eilanden',
		'Pitcairneilanden': 'Pitcairn',
		'Salomonseilanden': 'Solomon Islands',
		'Sao Tomé en Principe': '',
		'Tokelau-eilanden': 'Tokelau',
		'Tsjechië': 'Czech Republic',
		'Turks- en Caicoseilanden': 'Turks-en Caicoseilanden',
		'Verenigde Staten van Amerika': 'Verenigde Staten',
		'Zuid-Sudan': ''
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

			var isoCountry = iso3166.getByName(
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