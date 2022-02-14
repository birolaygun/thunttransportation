var MapManager = function(containerId) {
	this.DEBUG = false;
	this.STYLE_ID_ROADMAP = 'streets-v11';
	this.STYLE_ID_SATELLITE = 'satellite-v9';
	this.STYLE_ID_HYBRID = 'satellite-streets-v11';
	this.STYLE_ID_TERRAIN = 'outdoors-v11';
	this.MAPQUEST_KEY = 'Gmjtd%7Cluurn96bng%2Cb5%3Do5-lrba1';
	this.MAPBOX_ACCESS_TOKEN;
	this.containerId;
	this.markerAjaxUrl;
	this.detailAjaxUrl;
	this.map;
	this.clusterMarkers = false;
	this.markerLayer = null;
	this.cachedMarkers;
	this.cachedAreas;
	this.ajaxRequest;
};
	
/**
 * debug helper
 * @returns void
 */
MapManager.prototype.debug = function(message) {
	if(this.DEBUG) {
		console.log(message);
	}
};

/**
 * 
 */
MapManager.prototype.createMap = function(defaultMapType, allowMapTypeSwitching) {
	var mapUrl = 'https://api.mapbox.com/styles/v1/mapbox/{styleId}/tiles/{z}/{x}/{y}?access_token=' + this.MAPBOX_ACCESS_TOKEN;
	var attribution ='<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox</a> <a href="http://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a> <a href="http://developer.mapquest.com/web/info/terms-of-use" target="_blank">&copy; MapQuest</a>';
	var roadmapLayer = new L.TileLayer(mapUrl, {
		styleId: this.STYLE_ID_ROADMAP,
		maxZoom: 18,
		tileSize: 512,
		zoomOffset: -1,
		attribution: attribution
	});
	
	var satelliteLayer = new L.TileLayer(mapUrl, {
		styleId: this.STYLE_ID_SATELLITE,
		maxZoom: 18,
		tileSize: 512,
		zoomOffset: -1,
		attribution: attribution
	});
	var hybridLayer = new L.TileLayer(mapUrl, {
		styleId: this.STYLE_ID_HYBRID,
		maxZoom: 18,
		tileSize: 512,
		zoomOffset: -1,
		attribution: attribution
	});
	var terrainLayer = new L.TileLayer(mapUrl, {
		styleId: this.STYLE_ID_TERRAIN,
		maxZoom: 18,
		tileSize: 512,
		zoomOffset: -1,
		attribution: attribution
	});
	switch(defaultMapType) {
		case 'G_NORMAL_MAP':
		case 'ROADMAP':
		default:
			defaultLayer = roadmapLayer;
			break;
		case 'G_SATELLITE_MAP':
		case 'SATELLITE':
			defaultLayer = satelliteLayer;
			break;
		case 'G_HYBRID_MAP':
		case 'HYBRID':
			defaultLayer = hybridLayer;
			break;
		case 'G_PHYSICAL_MAP':
		case 'TERRAIN':
			defaultLayer = terrainLayer;
			break;
	}
	this.map = new L.Map(this.containerId, {
		scrollWheelZoom: false,
//		touchZoom: true,
		layers: [defaultLayer]
	});
	this.map.attributionControl.setPrefix('');
	if(allowMapTypeSwitching) {
		var baseMaps = {
			'Map': roadmapLayer,
			'Satellite': satelliteLayer,
			'Hybrid': hybridLayer,
			'Terrain': terrainLayer
		};
		L.control.layers(baseMaps).addTo(this.map);
	}
};

/**
 * @returns void
 */
MapManager.prototype.centerMap = function(latLng, zoom) {
	if(zoom === null) {
		this.map.setView(latLng);
	} else {
		this.map.setView(latLng, zoom);
	}
};

/**
 * fit the map to an array of LatLng
 * if only one LatLng, then only zoom to 15
 */
MapManager.prototype.fitBounds = function(coordinates) {
	if(coordinates.length === 1) {
		this.map.setView(coordinates[0], 15);
	} else {
		this.map.fitBounds(coordinates, {padding: [5, 5]});
	}
};

/**
 * 
 */
MapManager.prototype.centerMapToMarker = function(marker) {
	var latLng = marker.getLatLng();
	this.map.setView(latLng);
	if(marker.getPopup()._isOpen) {
		this.map.panBy([0, -75]);
	}
};

/**
 * removes previously cached areas and creates new array
 */
MapManager.prototype.resetCachedAreas = function() {
	delete this.cachedAreas;
	this.cachedAreas = [];
};

/**
 * checks if an area has been added to the array
 */
MapManager.prototype.isCachedArea = function() {
	return false;
	//always return false because we're not using this because it causes zoom and pan position to no be saved because no ajax request is made to ihf server
	for(var index in this.cachedAreas) {
		var cachedBounds = this.cachedAreas[index];
		var currentBounds = this.map.getBounds();
		if(cachedBounds.contains(currentBounds)) {
			return true;
		}
	}
	return false;
};

/**
 * cache an area
 */
MapManager.prototype.setCachedArea = function() {
	this.cachedAreas.push(this.map.getBounds());
};

/**
 * removes previously cached markers and creates new array
 */
MapManager.prototype.resetMarkerCache = function() {
	delete this.cachedMarkers;
	this.cachedMarkers = [];
};

/**
 * checks if a marker has been added to the array
 */
 MapManager.prototype.isCachedMarker = function(boardId, listingId) {
	if(this.cachedMarkers[boardId + '-' + listingId] === undefined) {
		return false;
	} else {
		return true;
	}
};

/**
 * cache a marker
 */
MapManager.prototype.setCachedMarker = function(boardId, listingId, marker) {
	this.cachedMarkers[boardId + '-' + listingId] = marker;
};

/**
 * removes and creates a new map layer. this is used to clear previous markers from the map. also, reset the marker and area cache
 */
MapManager.prototype.resetMarkerLayer = function() {
	if(this.markerLayer !== null) {
		this.map.removeLayer(this.markerLayer);
		delete this.markerLayer;
	}
	this.resetMarkerCache();
	this.resetCachedAreas();
	if(this.clusterMarkers) {
		this.markerLayer = new L.MarkerClusterGroup({showCoverageOnHover: false, maxClusterRadius: 80});
	} else {
		this.markerLayer = new L.LayerGroup();
	}
	this.map.addLayer(this.markerLayer);
	this.updateCountText();
};

/**
 * abort the last ajax request
 */
MapManager.prototype.abortAjaxRequest = function() {
	if(this.ajaxRequest !== undefined && this.ajaxRequest.abort() !== undefined) {
		this.ajaxRequest.abort();
	}
};

/**
 * updates the 'XX listings found' text based on the current map bounds
 */
MapManager.prototype.updateCountText = function() {
	var count = 0;
	var bounds = this.map.getBounds();
	this.markerLayer.eachLayer(function(marker) {
		if(bounds.contains(marker.getLatLng())) {
			count++;
		}
	});
	ihfJquery('.ihf-map-results-count').html(count + ' listings found');
};

/**
 * retrieves and updates the map with markers within the
 * current map bounds that have not been cached
 */
MapManager.prototype.updateMarkerLayer = function() {
	data = this.getMarkerRequestData();
	var self = this;
	if(!this.isCachedArea()) {
		this.ajaxRequest =  ihfJquery.ajax({
			type: 'GET',
			url: this.markerAjaxUrl,
			data: data,
			dataType: 'jsonp'
		})
		.done(function(maplistings) {
			if(maplistings.data.length > 0) {
				for(var index in maplistings.data) {
					var mapListing = maplistings.data[index];
					var latLng = new L.LatLng(mapListing.latitude, mapListing.longitude);
					var boardId = mapListing.boardId;
					var listingId = mapListing.listingNumber;
					var propertyType = mapListing.propertyType;
					self.addMarkerForMapSearch(latLng, boardId, listingId, propertyType);
				}
				//results are limited so don't cache the area if too many results were returned
				if(maplistings.length < 1000) {
					self.setCachedArea();
				}
				self.updateCountText();
			}
		});
	}
};

/**
 * helper method to return an object of query parameter used to
 * retrieve marker data
 */
MapManager.prototype.getMarkerRequestData = function() {
	var sw = this.map.getBounds().getSouthWest();
	var ne = this.map.getBounds().getNorthEast();
	var zoom = this.map.getZoom();
	var centerLatitude = this.map.getCenter().lat;
	var centerLongitude = this.map.getCenter().lng;
	var data = {
		swlat: sw.lat,
		swlong: sw.lng,
		nelat: ne.lat,
		nelong: ne.lng,
		mapZoomLevel: zoom,
		centerLat: centerLatitude,
		centerLong: centerLongitude
	};
	//location
	$location = ihfJquery('#ihf-refine-map-search-form input[name=location]');
	if($location.val()) {
		data.location = $location.val();
	}
	//min price
	$minPrice = ihfJquery('#ihf-refine-map-search-form input[name=minPrice]');
	if($minPrice.val()) {
		data.minPrice = $minPrice.val();
	}
	//max price
	$maxPrice = ihfJquery('#ihf-refine-map-search-form input[name=maxPrice]');
	if($maxPrice.val()) {
		data.maxPrice = $maxPrice.val();
	}
	//bedrooms
	$bedRooms = ihfJquery('#ihf-refine-map-search-form select[name=bedRooms]');
	if($bedRooms.val()) {
		data.bedRooms = $bedRooms.val();
	}
	//bathrooms
	$bathRooms = ihfJquery('#ihf-refine-map-search-form select[name=bathRooms]');
	if($bathRooms.val()) {
		data.bathRooms = $bathRooms.val();
	}
	//propertyType
	propertyType = ihfJquery('#ihf-refine-map-search-form input:checkbox[name="propertyType"]:checked').map(function() {
		return ihfJquery(this).val();
	}).get().join(',');
	if(propertyType.length !== 0) {
		data.propertyType = propertyType;
	}
	return data;
};

/**
 * adds a single marker onto the map we use the hasMarker and setMarker methods to not include duplicates
 */
MapManager.prototype.addMarkerForMapSearch = function(latLng, boardId, listingId, propertyType) {
	if(!this.isCachedMarker(boardId, listingId)) {
		// add a marker in the given location, attach some popup content to it and open the popup
		var iconHtml = this.getPropertyTypeSpecificMarkerIconHtml(propertyType);
		var size = new L.Point(24, 24);
		var anchor = new L.Point(12, 30);
		var icon = new L.DivIcon({
			html: iconHtml,
			iconSize: size,
			iconAnchor: anchor
		});
		var marker = new L.Marker(latLng, {icon: icon});
		if(marker !== undefined) {
			this.markerLayer.addLayer(marker);
			this.setCachedMarker(boardId, listingId, marker);
			var self = this;
			marker.on('click', function(event) {
				self.openInfoWindow(this, boardId, listingId);
			});
		}
	}
};

/**
 * 
 */
MapManager.prototype.getPropertyTypeSpecificMarkerIconHtml = function(propertyType) {
	var html;
	switch(propertyType) {
		case 'SFR':
			html = '<div class="ihf-map-icon ihf-map-icon-house"><i class="fa fa-home"></i></div>';
			break;
		case 'CND':
			html = '<div class="ihf-map-icon ihf-map-icon-condo"><i class="glyphicon glyphicon-credit-card"></i></div>';
			break;
		case 'LL':
			html='<div class="ihf-map-icon ihf-map-icon-land"><i class="glyphicon glyphicon-tree-conifer"></i></div>';
			break;
		case 'COM':
			html = '<div class="ihf-map-icon ihf-map-icon-commercial"><i class="fa fa-tag"></i></div>';
			break;
		case 'RI':
			html = '<div class="ihf-map-icon ihf-map-icon-multiunit"><i class="glyphicon glyphicon-th-large"></i></div>';
			break;
		case 'MH':
			html = '<div class="ihf-map-icon ihf-map-icon-mobilehome"><i class="fa fa-road"></i></div>';
			break;
		case 'FRM':
			html = '<div class="ihf-map-icon ihf-map-icon-house"><i class="fa fa-leaf"></i></div>';
			break;
		case 'RNT':
			html = '<div class="ihf-map-icon ihf-map-icon-rental"><i class="fa fa-building-o"></i></div>';
			break;
		default:
			html = '<div class="ihf-map-icon ihf-map-icon-house"><i class="fa fa-home"></i></div>';
	}
	return html;
};

/**
 * 
 */
MapManager.prototype.getNumericMarkerIconHtml = function(number) {
	return '<div class="ihf-map-icon">' + number + '</div>';
};


/**
 * adds a single marker onto the map
 */
MapManager.prototype.addMarkerForResultsOrDetail = function(context, latLng, popupHtml, number) {
	// add a marker in the given location, attach some popup content to it and open the popup
	var size = new L.Point(24, 24);
	var anchor = new L.Point(12, 30);
	var iconHtml = this.getNumericMarkerIconHtml(number);
	var icon = new L.DivIcon({
		html: iconHtml,
		iconSize: size,
		iconAnchor: anchor
	});
	var marker = new L.Marker(latLng, {icon: icon});
	this.markerLayer.addLayer(marker);
	if(context === 'results') {
		var popup = new L.Popup().setContent(popupHtml);
		marker.bindPopup(popup, {
			offset: [0, -35]
		});
		var self = this;
		ihfJquery('[data-map-icon="' + number + '"]').click(function() {
			marker.togglePopup();
			self.centerMapToMarker(marker);
			ihfJquery('html, body').animate({
		        scrollTop: ihfJquery('#' + self.containerId).offset().top - 50
			}, 250);
			
		});
	}
};

/**
 * lazy loads the marker popup creation and content request
 */
MapManager.prototype.openInfoWindow = function(marker, boardId, listingId) {
	if(marker.getPopup() === undefined) {
		var data = {
			boardId: boardId,
			listingNumber: listingId
		};
		var self = this;
		this.abortAjaxRequest();
		this.ajaxRequest =  ihfJquery.ajax({
			type: 'GET',
			url: self.detailAjaxUrl,
			dataType: 'jsonp',
			data: data
		})
		.done(function(response) {
			var popup = new L.Popup().setContent(response[0].content);
			marker.bindPopup(popup, {offset: [0, -35]}).openPopup();
			self.centerMapToMarker(marker);
		});
	}
};

/**
 * callback function to retrieve geo locations from mapquest
 */
MapManager.prototype.getGeoData = function(request, onSuccess) {
	var searchTerm =  ihfJquery.trim(request.term);
	var self = this;
	var url = '//www.mapquestapi.com/geocoding/v1/address?key=' + this.MAPQUEST_KEY + '&location=' + encodeURIComponent(searchTerm);
	this.abortAjaxRequest();
	this.ajaxRequest =  ihfJquery.ajax({
		type: 'GET',
		url: url,
		dataType: 'jsonp'
	})
	.done(function(response) {
		var mapCenterLatLng = self.map.getCenter();
		var data = [];
		for(var index in response.results[0].locations) {
			var place = response.results[0].locations[index];
			var label = self.generateLabel(place);
			if(label !== null) {
				data.push({
					label: label,
					value: {
						latLng: new L.LatLng(place.latLng.lat, place.latLng.lng)
					}
				});
			}
		}
		data = data.sort(function(a, b) {
			return mapCenterLatLng.distanceTo(a.value.latLng) - mapCenterLatLng.distanceTo(b.value.latLng);
		});
		onSuccess(data);
	});
};

/**
 * helper method to generate label text for autosugest
 * @return string if label can be generated
 * @return null if there is not enough info to generate label
 */
MapManager.prototype.generateLabel = function(place) {
	var valid = true;
	var label = '';
	//street
	if(place.street.length !== 0) {
		label += place.street + ', ';
	}
	//neighborhood
	if(place.adminArea6.length !== 0) {
		label += place.adminArea6 + ', ';
	}
	//city
	if(place.adminArea5.length !== 0) {
		label += place.adminArea5 + ', ';
	} else {
		valid = false;
	}
	//state
	if(place.adminArea3.length !== 0) {
		label += place.adminArea3 + ', ';
	} else {
		valid = false;
	}
	//country
	if(place.adminArea1.length !== 0 && (place.adminArea1 === 'US' || place.adminArea1 === 'CA')) {
		label += place.adminArea1;
	} else {
		valid = false;
	}
	if(valid) {
		return label;
	} else {
		return null;
	}
};

/**
 * 
 * synchronously retrieves LatLng for an address
 * @returns LatLng object
 */
MapManager.prototype.geocodeAddress = function(address, geocodingUrl, onSuccess) {
	this.abortAjaxRequest();
	this.ajaxRequest =  ihfJquery.ajax({
		url: geocodingUrl,
		data: {
			address: address
		},
        dataType: "jsonp",
        crossDomain: true,
	}).done(function(response) {
		lat = response.features[0].geometry.coordinates[1];
		lng = response.features[0].geometry.coordinates[0];
		latLng = new L.LatLng(lat, lng);
		onSuccess(latLng);
	});
};

/**
 * @returns somewhere in Kansas
 */
MapManager.prototype.getDefaultCenter = function() {
	return new L.LatLng(39.8282, -98.5795);
};

/**
 * toggles the refine search form
 */
MapManager.prototype.toggleRefineForm = function() {
	ihfJquery('.ihf-mapsearch-refine-overlay').toggle();
	ihfJquery('.ihf-map-search-refine-link').toggle();
};

/**
 *
 */ 
MapManager.prototype.getPolygonPaths = function(polygonString) {
	var polygonPaths = [];
	var polygonBeginRegex = '^POLYGON ?\\(\\(';
	var polygonEndRegex = '\\)\\)$';
	if(polygonString) {
		polygonString = polygonString.replace(new RegExp(polygonBeginRegex), '');
		polygonString = polygonString.replace(new RegExp(polygonEndRegex), '');	
		var polygonParts = polygonString.split(',');
		for(var i = 0; i < polygonParts.length; i++) {
			//If not the last element, then add to the array of LatLng
			//The polygon from our database has the first and last point duplicated
			if((i + 1) < polygonParts.length) {
				var onePoint=polygonParts[i].trim();
				if(onePoint != undefined) {
					var lngLat = onePoint.split(' ');
					var longitude = lngLat[0];
					var latitude = lngLat[1];
					var latLng = new L.LatLng(latitude, longitude);
					polygonPaths.push(latLng);
				}			
			}
		}
	}
	return polygonPaths;
};

/**
 *
 */
MapManager.prototype.addPolygonToMap = function(polygonCoordinates) {
	var shapeOptions = {
		stroke: true,
		color: '#000000',
		weight: 4,
		opacity: 1,
		fill: true,
		fillColor: null,
		fillOpacity: 0.2,
		clickable: true
	};
	var self = this;
	if(this.markerLayer != null) {
		var polygon = new L.polygon(polygonCoordinates, shapeOptions)
		polygon.addTo(this.markerLayer);
	}
}

/**
 * 
 */
 MapManager.prototype.initializeMapSearch = function(
	containerId,
	zoom,
	centerAddress,
	centerLat,
	centerLng,
	defaultMapType,
	markerAjaxUrl,
	detailAjaxUrl,
	geocodingUrl,
	mapBoxToken
) {
	this.containerId = containerId;
	this.markerAjaxUrl = markerAjaxUrl;
	this.detailAjaxUrl = detailAjaxUrl;
	this.MAPBOX_ACCESS_TOKEN = mapBoxToken;
	var geocodingUrl = geocodingUrl;
	this.createMap(defaultMapType);
	var self = this;
	var callback = function(latLng) {
		self.centerMap(latLng, zoom);
		self.clusterMarkers = true;
		self.resetMarkerLayer();
		self.updateMarkerLayer(markerAjaxUrl);
		//bind map event
		self.map.on('moveend', function() {
			self.updateCountText();
			self.updateMarkerLayer();
		});
		//bind search box event
		ihfJquery('#ihf-location').autocomplete({
			source: function(request, callback) {
				self.getGeoData(request, callback);
			},
			select: function(event, ui) {
				event.preventDefault();
				ihfJquery('#ihf-location').val(ui.item.label);
				self.centerMap(ui.item.value.latLng);
			},
			focus: function(event, ui) {
				event.preventDefault();
			}
		});
		//bind refine open / close button event
		ihfJquery('.ihf-map-search-refine-link, #ihf-refine-search-close').click(function() {
			self.toggleRefineForm();
		});
		//bind refine submit event
		ihfJquery('#ihf-main-search-form-submit').click(function() {
			self.toggleRefineForm();
			self.resetMarkerLayer();
			self.updateMarkerLayer();
		});
	};
	var latLng;
	if(centerLat.length !== 0 && centerLng.length !== 0 && centerLat !== 0 && centerLng !== 0) {
		latLng = new L.latLng(centerLat, centerLng);
		callback(latLng);
	} else if(centerAddress.length !== 0) {
		this.geocodeAddress(centerAddress, geocodingUrl, callback);
	} else {
		latLng = this.getDefaultCenter();
		callback(latLng);
	}
};

/**
 * shared method for results and detail. currently detail map
 * is the same as results map, except that click map icon does not
 * show popup
 */
MapManager.prototype.initializeResultsOrDetailMap = function(
	containerId,
	listings,
	context,
	mapBoxToken,
	geocodingUrl,
	polygonString
) {
	if(!listings.length > 0) {
		return;
	}
	this.containerId = containerId;
	this.MAPBOX_ACCESS_TOKEN = mapBoxToken;
	var self = this;
	var geocodingUrl = geocodingUrl;
	var getInvalidListing = function() {
		for(var index in listings) {
			var listing = listings[index];
			if(
				listing.latitude.length === 0 ||
				listing.longitude.length === 0 ||
				listing.latitude === 0 ||
				listing.longitude === 0
			) {
				return listing;
			}
		}
		return null;
	};
	
	var tryToLoadMap = function() {
		var listing = getInvalidListing();
		if(listing !== null) {
			self.debug('listing #' + listing.number + ': invalid lat lng');
			self.geocodeAddress(listing.address, geocodingUrl, function(latLng) {
				self.debug('listing #' + listing.number + ': updating listing lat lng');
				listing.latitude = latLng.lat;
				listing.longitude = latLng.lng;
				tryToLoadMap();
				});
		} else {
			//create a map
			self.createMap('ROADMAP', true);
			//iterate each listing and add it to a markerBounds array
			listingCoordinates = [];
			for(var index in listings) {
				var listing = listings[index];
				var latLng = new L.LatLng(listing.latitude, listing.longitude);
				listingCoordinates.push(latLng);
			}
			var polygonCoordinates = self.getPolygonPaths(polygonString);
			//fit the map to the marker or polygon bounds
			if(polygonCoordinates.length > 0) {
				self.fitBounds(polygonCoordinates);
			} else {
				self.fitBounds(listingCoordinates);
			}
			//reset the marker layer
			self.resetMarkerLayer();
			//iterate each listing and add a marker on the map
			for(var index in listings) {
				var listing = listings[index];
				self.debug('listing #' + listing.number + ': adding marker');
				var latLng = new L.LatLng(listing.latitude, listing.longitude);
				self.addMarkerForResultsOrDetail(context, latLng, listing.message, listing.number);
			}
			if(polygonCoordinates.length > 0) {
				self.addPolygonToMap(polygonCoordinates);
			}
		}
	};
	tryToLoadMap();
};

/**
 * 
 */
MapManager.prototype.initializeResultsMap = function(
	containerId,
	listings,
	mapBoxToken,
	geocodingUrl,
	polygonString
) {
	var context = 'results';
	this.initializeResultsOrDetailMap(containerId, listings, context, mapBoxToken, geocodingUrl, polygonString);
};

/**
 * currently detail map is the same as results map
 */
MapManager.prototype.initializeDetailMap = function(
	containerId,
	listings,
	mapBoxToken,
	geocodingUrl
) {
	var context = 'detail';
	var polygonString = '';
	this.initializeResultsOrDetailMap(containerId, listings, context, mapBoxToken, geocodingUrl, polygonString);
};
