(function () {
	'use strict';
	var map = L.map('map', {
		zoomControl: !L.Browser.touch
	}).fitBounds([[-1, -180], [1, 180]]);
	L.hash(map);

	L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
		maxZoom: 16
	}).addTo(map);

	// control that shows state info on hover
	var info = L.extend(L.control(), {
		onAdd: function () {
			this._div = L.DomUtil.create('div', 'info');
			this.update();
			return this._div;
		},
		update: function (props) {
			this._div.innerHTML = '<h4>Travel advice Dutch foreign affairs <a href="http://www.rijksoverheid.nl/onderwerpen/reisadviezen/inhoud">source</a></h4>' +  (props ?
				'<strong>' + props.name + '</strong><br />' +
				props.advice
				: 'Hover over a country');
		}
	}).addTo(map);

	// get color depending on population density value
	function getColor(advice) {
		if (!advice) {
			return null;
		}
		switch (advice.trim()) {
		case 'Alle reizen worden ontraden':
			return '#ff0000';
		case 'Alle reizen naar bepaalde gebieden worden ontraden':
			return '#aa0000';

		case 'Niet-essentiële reizen worden ontraden':
		case 'Niet-essentiële reizen naar bepaalde gebieden worden ontraden':
			return '#FF7F00';

		case 'Extra waakzaamheid betrachten':
		case 'Waakzaamheid betrachten':
			return '#66aa00';

		case 'Geen bijzondere veiligheidsrisico\'s':
			return '#00aa00';
		default:
			return '#000000';
		}
	}



	function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 2,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.6
		});

		info.update(layer.feature.properties);
	}

	var layerStyle = function layerStyle(feature) {
		var style = {
			weight: 1,
			opacity: 1,
			color: '#666',
			dashArray: [1, 4],
		};
		var color = getColor(feature.properties.advice);
		if (color) {
			L.extend(style, {
				fillOpacity: 0.4,
				fillColor: color
			});
		}
		return style;
	};
	var geojson;

	$.getJSON('../NL-travel-advice.json', function (advice) {
		geojson = L.geoJson(null, {
			style: layerStyle,
			onEachFeature: function onEachFeature(feature, layer) {
				layer.on({
					'mouseover dblclick': highlightFeature,
					'mouseout click': function resetHighlight(e) {
						geojson.resetStyle(e.target);
						info.update();
					}
				});
			}
		}).addTo(map);

		$.ajax({
			url: '../data/world-50m-topo.json',
			dataType: 'json',
			success: function (data) {
				var world = topojson.feature(data, data.objects.countries);

				world.features.forEach(function (country) {
					L.extend(country.properties, advice[country.id], {
						id: country.id
					});

					// 'fix' geometry of Russia and Fuji
					if (country.id === 'RUS' || country.id === 'FJI') {
						country.geometry.coordinates.forEach(function (poly, key) {
							poly[0].forEach(function (coord, c) {
								if (coord[0] < -90) {
									country.geometry.coordinates[key][0][c][0] += 360;
								}
							});
						});
					}
					if (country.properties.advice) {
						geojson.addData(country);
					}
				});
			}
		});

	});

	var route = function (routeRequest, callback) {
		routeRequest = L.extend({
			origin: 'Amsterdam, The Netherlands',
			destination: 'Kaapstad',
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		}, routeRequest);
		console.log(routeRequest);

		var directionsService = new google.maps.DirectionsService();
		directionsService.route(routeRequest, function (response, status) {
			if (status !== google.maps.DirectionsStatus.OK) {
				return;
			}
			var encoded = response.routes[0]['overview_polyline'].points;

			var polyline = L.Polyline.fromEncoded(encoded, {
				color: 'black',
				weigth: 2
			}).addTo(map);

			if (callback) {
				callback(polyline, encoded);
			}
		});
	};
	// route();
})();