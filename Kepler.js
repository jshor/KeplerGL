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
    var glScene = new Scene();
	var solarSystemScene = new SolarSystem(glScene);
	
	// position solar system objects and start animation
	glScene.setSolarSystemScene(solarSystemScene);
	glScene.animate();
	
	$(function() {
		$(window).resize(function() {
			glScene.windowResize();
		});
	});
});