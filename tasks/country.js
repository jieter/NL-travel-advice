'use strict';

var fs = require('fs');

var list = JSON.parse(fs.readFileSync(__dirname + '/../data/iso-3166-1.json', 'utf8'));
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

var each = function (fn, context) {
	context = context;
	for (var key in list) {
		fn.call(context, list[key], key);
	}
};

var getByCode = function (code, q) {
	var ret;
	each(function (country) {
		if (test(q, country.CountryCodes[code])) {
			ret = country;
		}
	});
	return ret;
};

var getByISO3 = function (q) {
	return getByCode('iso3', q);
};

var getByName = function (q, language) {
	var ret;
	each(function (country) {

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
		return getByName(q);
	}
	return ret;
};

module.exports = {
	get: function (q) {
		var ret = getByISO3(q);
		if (!ret) {
			ret = getByName(q);
		}
		return ret;
	},
	getByISO3: getByISO3,
	getByName: getByName,
	getByCode: getByCode
};