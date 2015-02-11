define([
	'jquery',
	'objects/HeliocentricObject',
	'objects/SatelliteObject',
	'objects/Sun',
	'data/Mercurian',
	'data/Terrestrial',
	'data/Jovian',
	'data/Saturnian',
	'data/Hallean',
	'data/Uranian',
	'data/Neptunian'
],
function ($, HeliocentricObject, SatelliteObject, Sun, Mercurian, Terrestrial, Jovian, Saturnian, Hallean, Uranian, Neptunian) {
	function SolarSystem(scene, t) {
		// create planets and their satellite
		this.satellites = [];
		this.planets = [];
		this.scene = scene;
		
		// create planet objects
		this.createPlanets([Mercury, Earth, Jupiter, Saturn, Uranus, Neptune, Halley]);
		
		// create the sun
		this.sun = new Sun(scene);
		this.updateTime(scene, t);
	}
	
	SolarSystem.prototype.updateTime = function(scene, t) {
		// set positions of planets according to current timestamp
		timestamp = new Date(t);
		this.updatePositions(false, Math.floor(timestamp.getTime()/1000));
		scene.paused = false;
	};
	
	SolarSystem.prototype.createPlanets = function(planets) {
		for(var i=0; i<planets.length; i++) {
			// create the heliocentric object, add it to the list
			var obj = new HeliocentricObject(planets[i], this.scene);
			this.planets.push(obj);

			// create satellite objects of planet (if any), add it to the list
			for(var j=0; j<planets[i].satellites.length; j++)
				this.satellites.push(new SatelliteObject(planets[i].satellites[j], this.scene, obj));
		}
	};
	
	SolarSystem.prototype.getObj = function() {
		return this.planets[1]; // returns saturn (why?)
	};
	
	SolarSystem.prototype.updatePositions = function(pause, timestamp) {
		// update the positions of heliocentric objects
		for(i=0; i<this.planets.length; i++)
			this.planets[i].updatePosition(timestamp);

		// update the positions of planetary satellites
		for(i=0; i<this.satellites.length; i++)
			this.satellites[i].updatePosition(timestamp);
	};
	
	return SolarSystem;
});
	