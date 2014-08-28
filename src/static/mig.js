    
function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}    
    
function getCoordinateMapType()  {
		//// tile coords
		function CoordMapType() {
	}

	CoordMapType.prototype.tileSize = new google.maps.Size(256,256);
	CoordMapType.prototype.maxZoom = 19;

	CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
	  var div = ownerDocument.createElement('div');
	  div.style.width = this.tileSize.width + 'px';
	  div.style.height = this.tileSize.height + 'px';
	  div.style.fontSize = '10';
	  //div.innerHTML = coord;
	  //div.style.borderStyle = 'solid';
	  //div.style.borderWidth = '1px';
	  //div.style.borderColor = '#AAAAAA';
	  div.style.backgroundColor = '#FFFFFF';
	  return div;
	};

	CoordMapType.prototype.name = 'Tile #s';
	CoordMapType.prototype.alt = 'Tile Coordinate Map Type';

		var coordinateMapType = new CoordMapType();
			
	return coordinateMapType;
}
    
	var drawnExtendedElevationMapTypeForYear = function(year)
	{
	    return new google.maps.ImageMapType({
		 bounds:  {
			14: 	 [[8818, 8818], [5812, 5812]],
			15:    [[17636, 17637], [11622, 11625]],
			16:    [[35272, 35275], [23248, 24251]],
			17: [[70544, 70551], [46496, 46503]],
			18: [[141088, 141103], [92992, 93007]],
			19: [[282176, 282207], [185984, 186015]]
			},
		getTileUrl: function(coord, zoom) {
			if(zoom < 14 || zoom > 19 ||
					this.bounds[zoom][0][0] > coord.x || coord.x > this.bounds[zoom][0][1] ||
					this.bounds[zoom][1][0] > coord.y || coord.y > this.bounds[zoom][1][1]) {
				return null;
			}			
			return ['survey/year/' + year + '/survey/SysMig/extendedElevation/t_', zoom, '_', coord.x, '_', coord.y, '.png'].join('');
		},
		tileSize: new google.maps.Size(256,256),
		name: "Extended Elevation"
	   });
	}    
	
	var drawnPlanSurveyMapTypeForYear = function(year)
	{
		return new google.maps.ImageMapType({
		 bounds:  {
			14: 	 [[8818, 8818], [5811, 5812]],
			15:    [[17636, 17637], [11622, 11625]],
			16:    [[35272, 35275], [23244, 24251]],
			17: [[70544, 70551], [46488, 46503]],
			18: [[141088, 141103], [92976, 93007]],
			19: [[282176, 282207], [185952, 186015]]
			},
		getTileUrl: function(coord, zoom) {
			if(zoom < 14 || zoom > 19 ||
					this.bounds[zoom][0][0] > coord.x || coord.x > this.bounds[zoom][0][1] ||
					this.bounds[zoom][1][0] > coord.y || coord.y > this.bounds[zoom][1][1]) {
				return null;
			}			
			return ['survey/year/'+year+'/survey/SysMig/plan/t_', zoom, '_', coord.x, '_', coord.y, '.png'].join('');
		},
		tileSize: new google.maps.Size(256,256),
		name: "Drawn Plan"
		});
	};
    
var initialize = function() {
	//google.maps.visualRefresh = true;

	window.validYears = ["1976","1994","1995","1996","1997","1998","1999","2000","2001","2003","2004","2005","2007","2008","2009","2010","2011","2012","2013","2014"];
	
        var mapOptions = {
		center: new google.maps.LatLng(46.25203,13.76397),
		zoom: 16,
		maxZoom: 19,
		streetViewControl: false,
		scaleControl:true,
		scaleControlOptions: {
			position: google.maps.ControlPosition.LEFT_BOTTOM,
		},
		panControl: false,
		mapTypeId: "coordinate",
		mapTypeControlOptions: {
			mapTypeIds: []
			//style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
		}
        };
	
	var useragent = navigator.userAgent;
 if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    mapOptions.zoomControl = false;
  } 
  
	var planSurveyMapTypeOptions = {
		name: "Plan"
	}
	
	
	window.drawnExtendedElevationMapType = drawnExtendedElevationMapTypeForYear('2014');
	window.drawnPlanSurveyMapType = drawnPlanSurveyMapTypeForYear('2014');
	
        var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);

	var coordinateMapType = getCoordinateMapType();
	map.mapTypes.set("coordinate", coordinateMapType);
	
	map.overlayMapTypes.push(drawnPlanSurveyMapType);
	window.survexPlanKml = new google.maps.KmlLayer({
		//url: 'https://www.dropbox.com/s/llmwo0qldtmc9po/plan.kml'
		url: 'https://raw.github.com/clewingriffith/migovec-survey/master/src/survey/year/2012/survey/SysMig/plan2.kml'
	});
	

	  // Now attach the coordinate map type to the map's registry
	map.mapTypes.set('coordinate', coordinateMapType);
	////
	 // Create div for showing copyrights.
    copyrightNode = document.createElement('div');
    copyrightNode.id = 'copyright-control';
    copyrightNode.style.fontSize = '11px';
    copyrightNode.style.fontFamily = 'Arial, sans-serif';
    copyrightNode.style.margin = '0 2px 2px 0';
    copyrightNode.style.whiteSpace = 'nowrap';
    copyrightNode.index = 0;
    copyrightNode.innerHTML = "Cave survey &copy; ICCC &amp; JSPDT 1994-2014";
    map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(copyrightNode);

	
	window.map = map;
	window.planlabels = {};
	window.elevlabels = {};
	window.planphotos = {};
	window.elevphotos = {};
	window.displayOptions = {
		"maptype": "coordinate",
		"projection": "PLAN",
		"showDrawnSurvey": true,
		"showLineSurvey": false,
		"showLabels": true,
		"showPhotos": false,
		"year":"2014"
	};
	
	//addPlanDropDown();
	//addExtendedElevationDropDown();
	
	addStoredLabelMarkers();
	addStoredPhotoMarkers();



	
	jQuery(".fancybox").fancybox({
		helpers : {
			title: {
				type: 'outside'
			}
		}
	});
	
	jQuery("#elevation").click(function(e) {
		changeMapOptions({"projection": "EXTENDED_ELEVATION"});
		jQuery("#elevation").parent().addClass("active");
		jQuery("#plan").parent().removeClass("active");
	});
	
	jQuery("#plan").click(function(e) {
		changeMapOptions({"projection": "PLAN"});
		jQuery("#plan").parent().addClass("active");
		jQuery("#elevation").parent().removeClass("active");
	});
	
	jQuery("#labels").click(function(e) {
		jQuery("#labels").parent().toggleClass("active");
		var showsLabels = jQuery("#labels").parent().hasClass("active");
		jQuery("#labelFieldSet").prop('disabled', !showsLabels);
		changeMapOptions({"showLabels":showsLabels});
	});
	
	jQuery("#photos").click(function(e) {
		jQuery("#photos").parent().toggleClass("active");
		var showsPhotos = jQuery("#photos").parent().hasClass("active");
		jQuery("#photoFieldSet").prop('disabled', !showsPhotos);
		changeMapOptions({"showPhotos":showsPhotos});
	});
	
	jQuery("#satellite").click(function(e) {
		changeMapOptions({ "maptype": "satellite"});
		jQuery("#satellite").parent().addClass("active");
		jQuery("#terrain").parent().removeClass("active");
		jQuery("#paper").parent().removeClass("active");
	});
	
	jQuery("#terrain").click(function(e) {
		changeMapOptions({ "maptype": "terrain"});
		jQuery("#terrain").parent().addClass("active");
		jQuery("#satellite").parent().removeClass("active");
		jQuery("#paper").parent().removeClass("active");
	});
	
	jQuery("#paper").click(function(e) {
		changeMapOptions({ "maptype": "coordinate"});
		jQuery("#paper").parent().addClass("active");
		jQuery("#satellite").parent().removeClass("active");
		jQuery("#terrain").parent().removeClass("active");
	});

	jQuery( "#yearSelector" ).change(function() {
		var newYearIdx = window.validYears.indexOf( this.value);
		updateYearSelectors(newYearIdx);
		changeMapOptions({"year": this.value});
	});
	
	jQuery( "#previousYear" ).click(function() {
		var currentYear = window.displayOptions['year'];
		var currentYearIdx = window.validYears.indexOf(currentYear);
		var newYearIdx = currentYearIdx-1;
		var newYear = window.validYears[newYearIdx];
		updateYearSelectors(newYearIdx);
		changeMapOptions({"year": newYear});
	});
	
	jQuery( "#nextYear" ).click(function() {
		var currentYear = window.displayOptions['year'];
		var currentYearIdx = window.validYears.indexOf(currentYear);
		var newYearIdx = currentYearIdx+1;
		var newYear = window.validYears[newYearIdx];
		updateYearSelectors(newYearIdx);
		changeMapOptions({"year": newYear});
	});
	
	var editMode = getUrlParameter('edit');
	if(editMode == 1)
	{
		jQuery("#editPanel").removeClass("hidden");
		jQuery("#mapPanel").addClass("col-md-9"); //make the map take up less than all the space
		window.editMode = true;
		//create an overlay used purely to map from div pixels to lat lng coordinates
		var overlay = new google.maps.OverlayView();
		overlay.draw = function() {};
		overlay.setMap(window.map);
		window.overlayForProjection = overlay;
			
	
		google.maps.event.addListener(map, 'zoom_changed', function() {
			jQuery("#zoomLevelField").prop('value', map.getZoom());
			//var zoomField = document.getElementById('zoomLevelField');
			//zoomField.value=map.getZoom();
		});
		
	}
	else
	{
		window.editMode = false;
	}
};
      
function updateYearSelectors(newYearIdx)
{
	var isFirst = (newYearIdx == 0);
	var isLast = (newYearIdx >= validYears.length-1);
	jQuery("#previousYear").attr("disabled",isFirst);
	jQuery("#nextYear").attr("disabled",isLast);
	jQuery("#yearSelector").prop("selectedIndex", newYearIdx);
}

function addExtendedElevationDropDown() {
	
	var eeDivOptions = {
        		gmap: window.map,
        		label: 'Drawn survey',
        		title: "Show the drawn survey (extended elevation view)",
        		id: "mapOpt2",
			checked: true,
        		action: function(){
				this.checked = !this.checked;
				changeMapOptions({"projection": "EXTENDED_ELEVATION", "showDrawnSurvey":this.checked});
        		}
        }
        var drawnElevDiv1 = new checkBox(eeDivOptions);
	
	var divOptions3 = {
        		gmap: window.map,
        		label: 'Line survey',
        		title: "Show the survex line survey (elevation view)",
        		id: "mapOpt3",
			checked: false,
        		action: function(){
				this.checked = !this.checked;
				//alert(this.checked);
				changeMapOptions({"projection": "EXTENDED_ELEVATION", "showLineSurvey":this.checked});
        		}
        }
        var linePlanDiv1 = new checkBox(divOptions3);
	
	//create the check box items
	var checkLabels = {
        		gmap: window.map,
        		title: "Show labels ",
        		id: "labelsCheck",
        		label: "Labels",
			checked: true,
        		action: function(){
				this.checked = !this.checked;
				changeMapOptions({"projection": "EXTENDED_ELEVATION", "showLabels":this.checked});
        		}        		        		
        }
        var labelsCheckBox = new checkBox(checkLabels);
        
        var checkPhotos = {
        		gmap: window.map,
        		title: "Show Photos",
        		id: "elevphotosCheck",
        		label: "Photos",
			checked: false,
        		action: function(){
				this.checked = !this.checked;
				changeMapOptions({"projection": "EXTENDED_ELEVATION", "showPhotos":this.checked});
        		}        		        		
        }
        var photosCheckBox = new checkBox(checkPhotos);
	
	
        //create the input box items
        
        //possibly add a separator between controls        
        var sep = new separator();
        
        //put them all together to create the drop down       
        var ddDivOptions1 = {
        	items: [drawnElevDiv1, sep, photosCheckBox, labelsCheckBox], //, terrainOption, satelliteOption],
        	id: "eemyddOptsDiv"
        }
        //alert(ddDivOptions.items[1]);
        var dropDownDiv1 = new dropDownOptionsDiv(ddDivOptions1);               
    
        var extendedElevationDropDownOptions = {
        		gmap: map,
        		name: 'Elevation',
        		id: 'eeddControl',
        		//title: 'A custom drop down select with mixed elements',
        		position: google.maps.ControlPosition.TOP_RIGHT,
        		dropDown: dropDownDiv1,
			action:function() {
			    changeMapOptions({"projection": "EXTENDED_ELEVATION"});
			    checkLabels.checked = window.displayOptions["showLabels"];
			    checkPhotos.checked = window.displayOptions["showPhotos"];
			}
        }
        
        var extendedElevationDropDown = new dropDownControl(extendedElevationDropDownOptions);  
}
      
function addPlanDropDown() {
	/// Setup dropdown for Plan View
	     //start process to set up custom drop down
        //create the options that respond to click
        var drawnPlanOptions1 = {
        		gmap: window.map,
        		label: 'Drawn survey',
        		title: "Show the drawn survey (plan view)",
        		id: "mapOpt1",
			checked: true,
        		action: function(){
				this.checked = !this.checked;
				changeMapOptions({"projection": "PLAN", "showDrawnSurvey":this.checked});
        		}
        }
        var drawnPlanDiv1 = new checkBox(drawnPlanOptions1);
        
	var divOptions2 = {
        		gmap: window.map,
        		label: 'Line survey',
        		title: "Show the survex line survey (plan view)",
        		id: "mapOpt2",
			checked: false,
        		action: function(){
				this.checked = !this.checked;
				//alert(this.checked);
				changeMapOptions({"projection": "PLAN", "showLineSurvey":this.checked});
        		}
        }
        var linePlanDiv1 = new checkBox(divOptions2);
	
        var checkTerrain = {
        		gmap: window.map,
        		title: "Show terrain. ",
        		id: "terrainCheck",
        		name: "Terrain",
        		action: function(){
				changeMapOptions({"projection": "PLAN", "maptype": "terrain"});
        		}        		        		
        }
        var terrainOption = new optionDiv(checkTerrain);
        
        var checkSatellite = {
        		gmap: window.map,
        		title: "Show satellite imagery",
        		id: "satelliteCheck",
        		name: "Satellite",
        		action: function(){
				changeMapOptions({"projection": "PLAN", "maptype": "satellite"});
        		}        		        		
        }
        var satelliteOption = new optionDiv(checkSatellite);
        
	var checkPaper = {
		gmap:window.map,
		title:"Paper",
		id:"paperCheck",
		name:"Paper",
		action: function() {
			changeMapOptions({"projection": "PLAN", "maptype": "coordinate"});
		}
	}
	
	var paperOption = new optionDiv(checkPaper);
	
		//create the check box items
	var checkLabels = {
        		gmap: window.map,
        		title: "Show labels ",
        		id: "labelsCheck",
        		label: "Labels",
			checked: true,
        		action: function(){
				this.checked = !this.checked;
				changeMapOptions({"projection": "PLAN", "showLabels":this.checked});
        		}        		        		
        }
        var labelsCheckBox = new checkBox(checkLabels);
        
        var checkPhotos = {
        		gmap: window.map,
        		title: "Show Photos",
        		id: "planphotosCheck",
        		label: "Photos",
			checked: false,
        		action: function(){
				this.checked = !this.checked;
				changeMapOptions({"projection": "PLAN", "showPhotos":this.checked});
        		}        		        		
        }
        var photosCheckBox = new checkBox(checkPhotos);
	
        //create the input box items
        
        //possibly add a separator between controls        
        var sep = new separator();
        
        //put them all together to create the drop down       
        var ddDivOptions = {
        	items: [drawnPlanDiv1,linePlanDiv1, sep, labelsCheckBox, photosCheckBox, sep, terrainOption, satelliteOption, paperOption],
        	id: "myddOptsDiv"
        }
        //alert(ddDivOptions.items[1]);
        var dropDownDiv = new dropDownOptionsDiv(ddDivOptions);               
                
        var planDropDownOptions = {
        		gmap: map,
        		name: 'Plan',
        		id: 'ddControl',
        		//title: 'A custom drop down select with mixed elements',
        		position: google.maps.ControlPosition.TOP_RIGHT,
        		dropDown: dropDownDiv ,
			action:function() {
			   changeMapOptions({"projection": "PLAN"});   
			   checkLabels.checked = window.displayOptions["showLabels"];
			   checkPhotos.checked = window.displayOptions["showPhotos"];
			}
        }
        
        var planDropDown = new dropDownControl(planDropDownOptions);   
}
      
function changeMapOptions(newOptions) {
	//override the old options with the new ones.
	for(var opt in newOptions) {
		window.displayOptions[opt] = newOptions[opt];
	}
	if(window.displayOptions["maptype"] == "satellite") {
		window.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
	}
	if(window.displayOptions["maptype"] == "terrain") {
		//var mapType = window.map.mapTypes.get(google.maps.MapTypeId.TERRAIN);
		//mapType.maxZoom = 19;
		window.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
	}
	if(window.displayOptions["maptype"] == "coordinate") {
		window.map.setMapTypeId("coordinate");
	}
	if(window.displayOptions["projection"] == "EXTENDED_ELEVATION") {
		window.map.setMapTypeId("coordinate");
		/*if(window.displayOptions["showLineSurvey"]) {
			window.survexExtendedElevationKml.setMap(window.map);
		} else {
			window.survexExtendedElevationKml.setMap(null);
		}*/
		if(window.displayOptions["showDrawnSurvey"]) {
			window.map.overlayMapTypes.clear();
			window.drawnExtendedElevationMapType=drawnExtendedElevationMapTypeForYear(window.displayOptions["year"]);
			window.map.overlayMapTypes.push(window.drawnExtendedElevationMapType);
		} else {
			map.overlayMapTypes.clear();
		}
		
		if(window.displayOptions["showPhotos"]) {
			for(var p in window.elevphotos) {
				var ph = window.elevphotos[p];
				ph.setMap(window.map);
			}
		} else {
			for(var p in window.elevphotos) {
				var ph = window.elevphotos[p];
				ph.setMap(null);
			}
		}
		
		if(window.displayOptions["showLabels"]) {
			for(var l in window.elevlabels) {
				var ll = window.elevlabels[l];
				var y1 = ll.year_discovered;
				var y2 = window.displayOptions["year"];
				if(ll.year_discovered <= window.displayOptions["year"])
					ll.setMap(window.map);
				else
					ll.setMap(null);
			}
		} else {
			for(var l in window.elevlabels) {
				var ll = window.elevlabels[l];
				ll.setMap(null);
			}
		}
		//hide plan labels and photos
		for(var l in window.planlabels) {
			var ll = window.planlabels[l];
			ll.setMap(null);
		}
		for(var l in window.planphotos) {
			var ll = window.planphotos[l];
			ll.setMap(null);
		}
	}
	if(window.displayOptions["projection"] == "PLAN") {
		if(window.displayOptions["showLineSurvey"]) {
			window.survexPlanKml.setMap(window.map);
		} else {
			window.survexPlanKml.setMap(null);
		}
		if(window.displayOptions["showDrawnSurvey"]) {
			map.overlayMapTypes.clear();
			window.drawnPlanSurveyMapType=drawnPlanSurveyMapTypeForYear(window.displayOptions["year"]);
			map.overlayMapTypes.push(window.drawnPlanSurveyMapType);
		} else {
			map.overlayMapTypes.clear();
		}
		
		if(window.displayOptions["showPhotos"]) {
			for(var p in window.planphotos) {
				var ph = window.planphotos[p];
				ph.setMap(window.map);
			}
		} else {
			for(var p in window.planphotos) {
				var ph = window.planphotos[p];
				ph.setMap(null);
			}
		}
		
		if(window.displayOptions["showLabels"]) {
			for(var l in window.planlabels) {
				var ll = window.planlabels[l];
				var y1 = ll.year_discovered;
				var y2 = window.displayOptions["year"];
				if(ll.year_discovered <= window.displayOptions["year"])
					ll.setMap(window.map);
				else
					ll.setMap(null);
			}
		} else {
			for(var l in window.planlabels) {
				var ll = window.planlabels[l];
				ll.setMap(null);
			}
		}
		//hide elev labels
		for(var l in window.elevlabels) {
			var ll = window.elevlabels[l];
			ll.setMap(null);
		}
		for(var l in window.elevphotos) {
			var ll = window.elevphotos[l];
			ll.setMap(null);
		}
	}

}
      
function addMarkers(map) {        
        var marker = new google.maps.Marker({
		position:new google.maps.LatLng(0, 0.0),
		title:"Requires Enlargement",
		icon:"icons/requires_enlargement_icon.png",
		draggable:true
        });
        marker.setMap(map);
}
      
function addLabelToMap(labelData, projection) {
	var storedLabelPosition = labelData.position;
	var storedText = labelData.text_en;
	var latLng = new google.maps.LatLng(storedLabelPosition[0],storedLabelPosition[1], true);
		
	var draggableLabel = new MapLabel({
		text: storedText,
		position: latLng,
		map:window.map,
		fontSize: 12,
		align:'left',
		minZoom:labelData.zoom_level,
		maxZoom:labelData.zoom_level,
		year_discovered:labelData.year_discovered
	});
	if(window.displayOptions["projection"] == projection && window.displayOptions["showLabels"]) {
		draggableLabel.setMap(window.map);
	} else {
		draggableLabel.setMap(null);
	}

	var marker = new google.maps.Marker;
	marker.bindTo('map',draggableLabel);
	marker.bindTo('position', draggableLabel);
	marker.setDraggable(window.editMode);
	if(window.editMode == false) {
		marker.setIcon({
			path: google.maps.SymbolPath.CIRCLE,
			scale: 0
		});
	}
	
	if(window.editMode) {
		    
		draggableLabel.datakey = labelData.id;

		//create closure for label id
		//Update the position when we drag
		(function(refLabel) {
			google.maps.event.addListener(marker, "dragend",
			function (mEvent) { 
				updateLabelDatastore({
					"id": refLabel.datakey, 
					"position":[refLabel.position.lat(), refLabel.position.lng()]
				});
			});
		})(draggableLabel);
			    
		//Set the id on the data fields when we click, so that we can edit the text 
		(function(refLabel) {
			google.maps.event.addListener(marker, "mousedown",
			function (mEvent) { 
				var labelInputId = document.getElementById('labelInputId');
				var labelInputText = document.getElementById('labelInputText');
				var labelInputYearDiscovered = document.getElementById('labelInputYearDiscovered');
				labelInputId.value = refLabel.datakey;
				labelInputText.value = refLabel.text;
				labelInputYearDiscovered.value = refLabel.year_discovered;
			});
			
		})(draggableLabel);
	}
	
	if(projection == "PLAN") {
			window.planlabels[labelData.id] = draggableLabel;
	} else {
			window.elevlabels[labelData.id] = draggableLabel;
	}
	
}

function addPhotoToMap(photoData, projection) {
	var storedPhotoPosition = photoData.position;
	var photoUrl = photoData.url;
	var photoCaption = photoData.caption;
	var latLng = new google.maps.LatLng(storedPhotoPosition[0],storedPhotoPosition[1], true);
	
	var photoMarker = new google.maps.Marker({
		position: latLng,
		map: window.map,
		icon: 'static/icons/photo.png',
		datakey: photoData.id,
		photoUrl: photoData.url,
		photoId: photoData.id,
		photoCaption: photoData.caption
		//draggable: window.editMode
	});
	
	if(window.displayOptions["projection"] == projection && window.displayOptions["showPhotos"]) {
		photoMarker.setMap(window.map);
	} else {
		photoMarker.setMap(null);
	}
	


	google.maps.event.addListener(photoMarker, 'click', function() {
		   //infowindow.open(map,photoMarker);
		   jQuery.fancybox.open(
			{
			href : photoMarker.photoUrl,
			title : photoMarker.photoCaption
			});
		   document.getElementById('photoInputId').value = photoMarker.photoId;
		   document.getElementById('photoInputUrl').value = photoMarker.photoUrl;
		   document.getElementById('photoInputCaption').value = photoMarker.photoCaption;
		
	});
	
	if(window.editMode) {
		photoMarker.setDraggable(true);
		
		//create closure for label id
		//Update the position when we drag
		(function(refMarker) {
			google.maps.event.addListener(refMarker, "dragend",
			function (mEvent) { 
				updatePhotoDatastore({
					"id": refMarker.datakey, 
					"position":[refMarker.position.lat(), refMarker.position.lng()]
				});
			});
		})(photoMarker);
		
		//Set the id on the data fields when we click, so that we can edit the text 
		(function(refMarker) {
			google.maps.event.addListener(refMarker, "mousedown",
			function (mEvent) { 
				var photoInputId = document.getElementById('photoInputId');
				var photoInputUrl = document.getElementById('photoInputUrl');
				var photoInputCaption = document.getElementById('photoInputCaption');
				photoInputId.value = refMarker.photoId;
				photoInputUrl.value = refMarker.photoUrl;
				photoInputCaption.value = refMarker.photoCaption;
			});
		})(photoMarker);
		
	}
	
	if(projection == "PLAN") {
			window.planphotos[photoMarker.photoId] = photoMarker;
	} else {
			window.elevphotos[photoMarker.photoId] = photoMarker;
	}
}

function updateLabelDatastore(labelData) {
	updateDatastore("label", labelData);
}

function updatePhotoDatastore(labelData) {
	updateDatastore("photo", labelData);
}

function updateDatastore(type, data) {
	jQuery.ajax({
		type: "PUT",
		url: "/update/" + type + "/" + data.id,
		contentType: "application/json",
		data: jQuery.toJSON(data)
		});
}
      
function addStoredLabelMarkers() {

	//var projectionType = window.displayOptions["projection"];

	jQuery.getJSON( "/labels/PLAN", 
		function( json ) {
		var labelArr = json.labels;
		for(var l=0; l<labelArr.length; l++) {
		    addLabelToMap(labelArr[l], "PLAN");
		}}
	);
	
	jQuery.getJSON( "/labels/EXTENDED_ELEVATION", 
		function( json ) {
		var labelArr = json.labels;
		for(var l=0; l<labelArr.length; l++) {
		    addLabelToMap(labelArr[l], "EXTENDED_ELEVATION");
		}}
	);
	
	if(window.editMode) {
		var labelInputText = document.getElementById('labelInputText');
		google.maps.event.addListener(window.map, 'click', clearLabelAndPhotoField);
		google.maps.event.addDomListener(labelInputText, 'keyup', updateLabelField);
		google.maps.event.addDomListener(labelInputText, 'change', saveLabelField);
		var labelInputYearDiscovered = document.getElementById('labelInputYearDiscovered');
		google.maps.event.addDomListener(labelInputYearDiscovered, 'change', saveLabelField);
                google.maps.event.addDomListener(labelInputYearDiscovered, 'input', saveLabelField);
		
	}

}

function addStoredPhotoMarkers() {
	jQuery.getJSON( "/photos/PLAN", 
		function( json ) {
		var photoArr = json.photos;
		for(var p=0; p<photoArr.length; p++) {
		    addPhotoToMap(photoArr[p], "PLAN");
		}}
	);
	
	jQuery.getJSON( "/photos/EXTENDED_ELEVATION", 
		function( json ) {
		var photoArr = json.photos;
		for(var p=0; p<photoArr.length; p++) {
		    addPhotoToMap(photoArr[p], "EXTENDED_ELEVATION");
		}}
	);
	
	if(window.editMode) {
		var photoInputUrl = document.getElementById('photoInputUrl');
		google.maps.event.addDomListener(photoInputUrl, 'change', savePhotoUrl);
		
		var photoCaption = document.getElementById('photoInputCaption');
		google.maps.event.addDomListener(photoInputCaption, 'change', savePhotoUrl);
	}
}
      
// Normalizes the coords that tiles repeat across the x axis (horizontally)
// like the standard Google map tiles.
function getNormalizedCoord(coord, zoom) {
	var y = coord.y;
	var x = coord.x;

	// tile range in one direction range is dependent on zoom level
	// 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
	var tileRange = 1 << zoom;

	// don't repeat across y-axis (vertically)
	if (y < 0 || y >= tileRange) {
		return null;
	}
	if (x < 0 || x >= tileRange) {
		return null;
	}
	return {
		x: x,
		y: y
	};
}
      
function getCanvasCenterAsLatLng() {
	var canvas = document.getElementById("map-canvas");
	var overlay = window.overlayForProjection; 
	//var overlay = new google.maps.OverlayView();
	//overlay.draw = function() {};
	//overlay.setMap(window.map);
	
	var projection = overlay.getProjection();
	var point=new google.maps.Point(0.5*(jQuery(canvas).width()),0.5*(jQuery(canvas).height()));
	var latlng = projection.fromContainerPixelToLatLng(point);
	return latlng;
}
      
function setYear(year) {
  document.getElementById('currentYear').innerHTML=year;
  
  if( window.validYears.indexOf(year) > 0 ) {
	changeMapOptions({"year": year});
  }
}

function addTextLabel() {
	//if(window.editMode == false) {
	//	return;
	//}
	var zoomLevelField =  document.getElementById('zoomLevelField');
	var textInput = document.getElementById('labelInputText');
	var yearDiscoveredField = document.getElementById('labelInputYearDiscovered');
	var latlng = getCanvasCenterAsLatLng();
	
	var newLabelData = {
		"text_en": textInput.value,
		"position": [latlng.lat(), latlng.lng()],
		"zoom_level": zoomLevelField.value,
		"year_discovered":yearDiscoveredField.value
	}
	
	var projectionType = window.displayOptions["projection"];
	
	jQuery.ajax({
		type: "POST",
		url: "/create/label/"+ projectionType,
		contentType: "application/json",
		data: jQuery.toJSON(newLabelData)
	}).done(function( msg ) {
		newLabelData.id = msg.id;
		addLabelToMap(newLabelData, projectionType);
	});
	
}

function addNewPhoto() {

	var latlng = getCanvasCenterAsLatLng();

	var newPhotoData = {
		"url": "static/icons/miglogo.png",
		"position": [latlng.lat(), latlng.lng()],
	}
	
	var photoInputUrl = document.getElementById('photoInputUrl');
	if(photoInputUrl.value) {
		newPhotoData.url = photoInputUrl.value;
	}
	
	var projectionType = window.displayOptions["projection"];
	
	jQuery.ajax({
		type: "POST",
		url: "/create/photo/" + projectionType,
		contentType: "application/json",
		data: jQuery.toJSON(newPhotoData)
	}).done(function( msg ) {
		newPhotoData.id = msg.id;
		addPhotoToMap(newPhotoData, projectionType);
	});
}

//Called while typing into the label text field
function updateLabelField() {
	var textInput = document.getElementById('labelInputText');
	var labelInputId = document.getElementById('labelInputId');
       
	if(labelInputId.value) {
		var label;
		if(window.displayOptions["projection"] == "PLAN") {
			label = window.planlabels[labelInputId.value];
		} else {
			label = window.elevlabels[labelInputId.value];
		}
		
		if(textInput.value !== label.text) {
			label.set('text', textInput.value);
			label.set('unsaved', true);
			label.set('fontColor', 'red'); //to imply that it hasn't been saved
		}
	}
}
	
//called on hitting return on the label text field
function saveLabelField() {
	var labelInputId = document.getElementById('labelInputId');
	var labelInputYearDiscovered = document.getElementById('labelInputYearDiscovered')
	if(!isNaN(labelInputId.value)) {
		var label;
		if(window.displayOptions["projection"] == "PLAN") {
			label = window.planlabels[labelInputId.value];
		} else {
			label = window.elevlabels[labelInputId.value];
		}
		
		label.set('unsaved', false);
		label.set('fontColor', 'black'); //to show that it has been saved
		label.set('year_discovered', parseInt(labelInputYearDiscovered.value));
		
		updateLabelDatastore({
			"id": label.datakey, 
			"text_en":label.text,
			"year_discovered":labelInputYearDiscovered.value
		});
	}
	changeMapOptions({});
}

//remove the ids and replace label name with default
function clearLabelAndPhotoField() {
	var labelInputId = document.getElementById('labelInputId');
	labelInputId.value = "";
	var labelInputText = document.getElementById('labelInputText');
	labelInputText = "New Label";
	var photoInputId = document.getElementById('photoInputId');
	photoInputId.value = "";
	var photoInputUrl = document.getElementById('photoInputUrl');
	photoInputUrl.value = "static/icons/miglogo.png";
}

//called on hitting return on the photo Url or caption field
function savePhotoUrl() {
	var photoInputId = document.getElementById('photoInputId');
	var photoInputUrl = document.getElementById('photoInputUrl');
	var photoInputCaption = document.getElementById('photoInputCaption');
	
	if(!isNaN(photoInputId.value)) {
		updatePhotoDatastore({
			"id": photoInputId.value, 
			"url":photoInputUrl.value
		});
	}
	
	if(typeof(photoInputCaption.value) == 'string' && photoInputCaption.value.length > 0) {
		updatePhotoDatastore({
			"id": photoInputId.value, 
			"caption":photoInputCaption.value
		});
	}
	
	var projectionType = window.displayOptions["projection"];
	
	//update marker
	
	var marker = null;
	if(projectionType == "PLAN") {
	   marker = window.planphotos[photoInputId.value];
	} else {
	   marker = window.elevphotos[photoInputId.value];
	}
	
	marker.photoUrl = photoInputUrl.value;
	marker.photoCaption = photoInputCaption.value;
}

      
//{% if editMode %}
//window.editMode = true;
//{% else %}
window.editMode = false;
//{% endif %}
google.maps.event.addDomListener(window, 'load', initialize);      