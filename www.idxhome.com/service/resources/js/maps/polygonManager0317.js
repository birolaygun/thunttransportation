var PolygonMapManager = function() {
	
	this.containerId;
	this.mapBoxToken;
	this.map;
	this.ajaxRequest;
	this.shapeLayer= null;
	this.polygon;
	
	// Geocode address
	this.geocodeAddress = function(address, geocodingUrl, onSuccess) {
		this.abortAjaxRequest();
		geocodingUrl += "?address=" + encodeURIComponent(address);
		this.ajaxRequest =  ihfJquery.ajax({
			type: "GET",
			url: geocodingUrl,
			dataType: "jsonp"
		}).done(function(response) {
			lat = response.features[0].geometry.coordinates[1];
			lng = response.features[0].geometry.coordinates[0];
			latLng = new L.LatLng(lat, lng);
			onSuccess(latLng);
		});
	};
	
	/**
	 * abort the last ajax request
	 */
	this.abortAjaxRequest = function() {
		if(this.ajaxRequest !== undefined && this.ajaxRequest.abort() !== undefined) {
			this.ajaxRequest.abort();
		}
	};
	
	//Create a map 
	this.createMap = function() {
		var tileUrl = "https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=" + this.mapBoxToken;
		var attribution = '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox</a> <a href="http://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a> <a href="http://developer.mapquest.com/web/info/terms-of-use" target="_blank">&copy; MapQuest</a>';
		var roadMapLayer = new L.TileLayer(tileUrl, {
			maxZoom: 18,
			tileSize: 512,
			zoomOffset: -1,
			attribution: attribution
		});
		this.map = new L.Map(
			this.containerId,
			{
				scrollWheelZoom: false,
				//touchZoom: false,
				layers: [roadMapLayer]
			}
		);
		this.map.attributionControl.setPrefix("");
	};

	this.centerMap = function(polygonCoordinates, centerAddress, zoom, geocodingUrl, callback) {
		var self = this;
		if(polygonCoordinates) {
			var bounds = self.getPolygonBounds(polygonCoordinates);
			self.map.setView(bounds.getCenter(), 10);
			setTimeout(function() {
				self.map.fitBounds(bounds);
				callback();
			}, 1000);
		} else {
			self.geocodeAddress(centerAddress, geocodingUrl, function(latLng) {
				if(zoom === null) {
					self.map.setView(latLng);
				} else {
					self.map.setView(latLng, zoom);
				}
				callback();
			});
		}
	};
	
	this.addPolygon = function(polygonCoordinates) {
		var self = this;
		var shapeOptions = {
			stroke: true,
			color: "#000000",
			weight: 4,
			opacity: 1,
			fill: true,
			fillColor: null,
			fillOpacity: 0.2,
			clickable: true
		};
		var polygonSettings = {
			allowIntersection: false,
			drawError: {
				color: "#b00b00",
				timeout: 3000,
				message: '<strong>Oh snap!<strong> you can\'t draw that!'
			},
			shapeOptions: shapeOptions
		};
		this.shapeLayer = new L.FeatureGroup();
		this.map.addLayer(this.shapeLayer);
		if(polygonCoordinates != null && polygonCoordinates.length > 0) {
			this.polygon = new L.Polygon(polygonCoordinates, shapeOptions).addTo(this.shapeLayer);
			this.shapeLayer.eachLayer(function(layer) {
				layer.editing.enable();
			});
		} else {
			this.polygon = new L.Draw.Polygon(this.map, polygonSettings);
			this.polygon.enable();
		}
	};
	
	//once map is drawn get coordinates of polygon and add it to hidden form attribute
	this.updateBoundaryFormField= function() {
		var self = this;
		var searchAreaPolygon = null;
		if(this.shapeLayer !== null) {
			this.shapeLayer.eachLayer(function(layer) {
				searchAreaPolygon = layer.toGeoJSON();
			});
			var polygonString = self.polygonToWkt(searchAreaPolygon);
			if(polygonString != null) {
				ihfJquery("#ihf-boundary").val(polygonString).trigger("change");
			}
		}
	};
	
	this.polygonToWkt = function(searchAreaPolygon) {
	   //getPath only returns one polygon, if more than one polygon was drawn. 
		var vertices = searchAreaPolygon.geometry.coordinates[0];
		var contentString = "POLYGON ((";
		var first = vertices[0];
		//Iterate over the vertices.
		for(var i = 0; i < vertices.length; i++) {
			var xy = vertices[i];
			contentString +=  xy[0] + " " + xy[1] + ", ";
		}
		if(i > 100) {
			alert("Too many points drawn. Please remove " + (i - 100) + " points.");
			return null;
		}
		//remove the trailing comma
		contentString = contentString.slice(0, -2);
		//and complete the WKT
		contentString += "))";
		//console.log(contentString);
		return contentString;
	};
	
	this.getPolygonBounds = function(latLngArray) {
		var bounds = new L.LatLngBounds();
		for (var i = 0; i < latLngArray.length; i++) {
			bounds.extend(latLngArray[i]);
		}
		return bounds; 
	};
	
	this.getPolygonPaths= function(polygonString) {
		var polygonPaths = [];
		var polygonBeginRegex="^POLYGON ?\\(\\(";
		var polygonEndRegex="\\)\\)$";
		if(!polygonString || 0 === polygonString.length) {
			 return null;
		}
		polygonString=polygonString.replace(new RegExp(polygonBeginRegex), "");
		polygonString=polygonString.replace(new RegExp(polygonEndRegex), "");
		var polygonParts = polygonString.split(",");
		for (var i = 0; i < polygonParts.length; i++) {
			//If not the last element, then add to the array of LatLng
			//The polygon from our database has the first and last point duplicated
			if ((i + 1) < polygonParts.length) {
				var onePoint=polygonParts[i].trim();
				if(onePoint != undefined) {
					var lngLat = onePoint.split(" ");
					var longitude=lngLat[0];
					var latitude=lngLat[1];
					var latLng = new L.LatLng(latitude, longitude);
					polygonPaths.push(latLng);
				}			
			}
		}
		return polygonPaths;
	};
	
	this.addResetControl = function() {
		var self = this;
		var resetControl = L.Control.extend({
			options: {
				position: "topright"
			},
			onAdd: function () {
				// create the control container with a particular class name
				var container = L.DomUtil.create("div", "ihf-polygon-reset");
				container.innerHTML = "Start Over";
				// ... initialize other DOM elements, add listeners, etc.
				return container;
			}
		});
		this.map.addControl(new resetControl());
	};
	
	this.reset = function() {
		var self = this;
		if(self.shapeLayer!= null) {
			self.shapeLayer.eachLayer(function(layer) {
				self.shapeLayer.removeLayer(layer);
			});
			if(self.polygon !== undefined && self.polygon.disable !== undefined) {
				self.polygon.disable();
				delete self.polygon;
			}
			ihfJquery("#ihf-boundary").val("").trigger("change");
			var polygonCoordinates = null;
			self.addPolygon(polygonCoordinates);
		}
	};
	
	this.updateBoundaryFromString = function(){
		var polyString = ihfJquery("#ihf-polygon-id").val();
		var contentString = "POLYGON ((";
		var points = polyString.split(",");
		for(var i = 0; i < points.length; i++) {
			var pos = points[i].indexOf("+");
			var latitude = points[i].substring(0, pos);
			var langitude = points[i].substring(pos+1)
			contentString +=  langitude + " " + latitude + ", ";
		}
		if(i > 100) {
			alert("Too many points drawn. Please remove " + (i - 100) + " points.");
			return null;
		}
		//remove the trailing comma
		contentString = contentString.slice(0, -2);
		//and complete the WKT
		contentString += "))";
		ihfJquery("#ihf-boundary").val(contentString).trigger("change");
	}
	
	this.updateMapLayer = function(event) {
		var layer = event.layer;
		layer.editing.enable();
		this.shapeLayer.addLayer(layer);
	};
	
	//initialize map with polygon
	this.initializeMapWithPolygon = function(
		mapContainerId,
		mapBoxToken,
		centerAddress,
		zoom,
		geocodingUrl,
		polygonString
	) {
		this.containerId = mapContainerId;
		this.mapBoxToken = mapBoxToken;
		var self = this;
		var polygonCoordinates = self.getPolygonPaths(polygonString);
		self.createMap();
		self.centerMap(polygonCoordinates, centerAddress, zoom, geocodingUrl, function() {
			self.addResetControl();
			self.map.on("draw:created", function (event) {
				self.updateMapLayer(event);
				self.updateBoundaryFormField();
			});
			self.addPolygon(polygonCoordinates);
			self.polygon.on("edit", function(event) {
				self.updateBoundaryFormField();
			});
			ihfJquery("#ihf-polygon-id").on("input change", function(){
				self.updateBoundaryFromString();
			});
			ihfJquery(".ihf-polygon-reset").on("click", function() {
				self.reset();
			});
		});
	};
	
};