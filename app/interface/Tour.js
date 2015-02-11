define([
	"jquery",
	"interface/DialogWindow",
	'objects/Sun',
	'data/Mercurian',
	'data/Terrestrial',
	'data/Jovian',
	'data/Saturnian',
	'data/Hallean',
	'data/Uranian',
	'data/Neptunian'
],
function ($, DialogWindow, Sun, Mercurian, Terrestrial, Jovian, Saturnian, Hallean, Uranian, Neptunian) {
	
	function Tour(scene) {
		// set up accordion menu
		var self=this;
		var accordionNav	= $("<nav></nav>").addClass("menu-box");
		var accordionList	= $("<ul></ul>").addClass("menu");
		accordionNav.append(accordionList);
		
		var planets = [Mercury, Earth, Jupiter, Saturn, Uranus, Neptune, Halley];
		
		for(var i=0; i<planets.length; i++) {
			(function(i, planets, scene) {
				// add the heliocentric object and its satellites to accordion menu
				var heliocentricObjList = $("<li></li>");
				var planetName			= planets[i].name;
				var planetInfo			= planets[i].info;
				var planetRadius		= scene.planetScale(planets[i].radius);
				var heliocentricObj		= $("<a></a>")
					.attr("href", "#")
					.html(planetName)
					.click(function() {
						scene.setView(planetName, function() {
							scene.dialog = new DialogWindow(scene, "objectInfo", planetInfo, planetName, "Sun");
							scene.controls.minDistance = planetRadius+1;
						}, "Sun");
					});
					
					
				$(heliocentricObjList).append(heliocentricObj);
				
				var satelliteObjList = $("<ul></ul>");

				// create satellite objects of planet (if any), add it to the list
				for(var j=0; j<planets[i].satellites.length; j++) {
					
					var satelliteObj		= $("<li></li>");
					var satelliteName		= planets[i].satellites[j].name;
					var satelliteInfo		= planets[i].satellites[j].info;
					var satelliteRadius		= scene.planetScale(planets[i].satellites[j].radius);
					
					(function(satelliteName, satelliteName, satelliteInfo, satelliteRadius) {
						var satelliteObjLink	= $("<a></a>")
							.attr("href", "#")
							.html(satelliteName)
							.click(function() {
								scene.setView(satelliteName, function() {
									scene.dialog = new DialogWindow(scene, "objectInfo", satelliteInfo, satelliteName, planetName);
									scene.controls.minDistance = satelliteRadius+1;
								}, planetName);
							});
							
						$(satelliteObj).append(satelliteObjLink);
					}(satelliteName, satelliteName, satelliteInfo, satelliteRadius));
							
					$(satelliteObjList).append(satelliteObj);
				}
				
				// add satellite list to heliocentric list, add heliocentricObj to accordion
				$(heliocentricObjList).append(satelliteObjList);
				$(accordionList).append(heliocentricObjList);
				
				scene.dialog = new DialogWindow(scene, "tour", accordionNav, "Tour", "Sun", 400);
			}(i, planets, scene));
		}
	};
	
	return Tour;
});