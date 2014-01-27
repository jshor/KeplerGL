require.config({
	baseUrl: "app/",
    paths: {
		"app": "./app",
		"threejs" : "../lib/three.min",
		"threejs/OrbitControls": "../lib/OrbitControls",
		"threejs/GridHelper": "../lib/GridHelper",
		"threejs/OBJLoader": "../lib/OBJLoader",
		jquery : "../lib/jquery",
        "jquery.nouislider.min": "../lib/jquery.nouislider.min"
    },
    shim: {
        "jquery.nouislider.min": {
			deps: ["jquery"],
            exports: '$'
		},
		"threejs/OrbitControls": {
			deps: ["threejs"]
		},
		"threejs/GridHelper": {
			deps: ["threejs"]
		},
		"threejs/OBJLoader": {
			deps: ["threejs"]
		}
    },
	priority : ['jquery', 'threejs']
});

require([
	"jquery",
	"jquery.nouislider.min",
	"threejs",
	"objects/HeliocentricObject",
	"objects/SolarSystem",
	"interface/Controls",
	"physics/Astrodynamics",
	"Scene",
],
function ($) {
    // TBD: add in a loading screen, and check for webgl
	// if no webgl is present, show the user an info screen
    var Scene 		= require('Scene');
    var SolarSystem = require('objects/SolarSystem');
    var Controls 	= require('interface/Controls');
    var Astrodynamics 	= require('physics/Astrodynamics');

    var glScene 			= new Scene();
	var Astrodynamics		= new Astrodynamics();
	var solarSystemScene 	= new SolarSystem(glScene, Astrodynamics);
	
	/* position solar system objects and start the clock */
	glScene.setSolarSystemScene(solarSystemScene);
	glScene.animate(solarSystemScene);
	glScene.clockStart();
	
	$(function(){
		$( window ).resize(function() {
			glScene.windowResize();
			interfaceControls.correctZoomScrollHeight();
		});
	});
});