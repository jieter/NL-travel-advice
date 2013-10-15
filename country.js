'use strict';

var fs = require('fs');

module.exports = new (function () {
	var list = JSON.parse(fs.readFileSync('iso-3166-1.json', 'utf8'));

	list = list.Results;
	list['SSD'] = {
		Name: 'South Sudan',
		CountryCodes: {
			iso3: 'SSD'
		},
		Names: {
			nl: 'Zuid-Sudan'
		}
	};
	list['RKS'] = {
		Name: 'Kosovo',
		CountryCodes: {
			iso3: 'RKS'
		},
		Names: {
			nl: 'Kosovo'
		}
	};

	var test = function (a, b) {
		var transform = function (s) {
			return s.toLowerCase()
				.replace(',', '')
				.replace(' ', '')
				.replace('-', '')
				.replace('\'', '');
		};

		return transform(a) === transform(b);
	};

	this.each = function (fn, context) {
		context = context || this;
		for (var key in list) {
			fn.call(context, list[key], key);
		}
	};

	this.get = function (q) {
		var ret = this.getByISO3(q);
		if (!ret) {
			ret = this.getByName(q);
		}
		return ret;
	};

	this.getByISO3 = function (q) {
		return this.getByCode('iso3', q);
	};

	this.getByCode = function (code, q) {
		var ret;
		this.each(function (country) {
			if (test(q, country.CountryCodes[code])) {
				ret = country;
			}
		});
		return ret;
	};

	this.getByName = function (q, language) {
		var ret;
		this.each(function (country) {

			if (language !== undefined) {
				if (test(q, country.Names[language])) {
					ret = country;
				}
			} else {
				for (var lang in country.Names) {
					if (test(q, country.Names[lang])) {
						ret = country;
					}
				}
			}
		});
		// retry without language
		if (!ret && language) {
			return this.getByName(q);
		}
		return ret;
	};

})();