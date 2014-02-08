require.config({
	baseUrl: "app/",
    paths: {
		"app": "./app",
		"three": "../lib/three",
		"threejs": "../lib/three/threejs",
		"objects/HeliocentricObject": "objects/HeliocentricObject",
		"interface/DialogWindow": "interface/DialogWindow",
		jquery : "../lib/jquery/jquery",
        "jquery.nouislider.min": "../lib/jquery/jquery.nouislider.min"
    },
    shim: {
        "jquery.nouislider.min": {
			deps: ["jquery"],
            exports: '$'
		},
		"three/OrbitControls": {
			deps: ["threejs"]
		},
		"three/GridHelper": {
			deps: ["threejs"]
		},
		"three/OBJLoader": {
			deps: ["threejs"]
		}
    },
	priority : ['jquery', 'three']
});

define([
	"jquery",
	"objects/SolarSystem",
	"physics/Astrodynamics",
	"interface/Controls",
	"Scene",
],
function($, SolarSystem, Astrodynamics, Controls, Scene) {
    // TBD: add in a loading screen, and check for webgl
	// if no webgl is present, show the user an info screen
    var Scene 		= require('Scene');
    var SolarSystem = require('objects/SolarSystem');
    var Controls 	= require('interface/Controls');
    var Astrodynamics 	= require('physics/Astrodynamics');
    var DialogWindow 	= require('interface/DialogWindow');

    var glScene 			= new Scene();
	var solarSystemScene 	= new SolarSystem(glScene);
	
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