require.config({
	baseUrl: "app/",
    paths: {
		"app": "./app",
		"three": "../lib/three",
		"threejs": "../lib/three/threejs",
		"objects/HeliocentricObject": "objects/HeliocentricObject",
		"interface/DialogWindow": "interface/DialogWindow",
		jquery : "../lib/jquery/jquery",
        "jquery.nouislider.min": "../lib/jquery/jquery.nouislider.min",
        "jquery.datetimepicker": "../lib/jquery/jquery.datetimepicker"
    },
    shim: {
        "jquery.nouislider.min": {
			deps: ["jquery"],
            exports: '$'
		},
        "jquery.datetimepicker": {
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
	"physics/Astrodynamics",
	"interface/Controls",
	"Scene",
],
function($, Astrodynamics, Controls, Scene) {
    var glScene = new Scene();
		
	// create the solar system scene and animate
	glScene.setTime(new Date());
	glScene.animate();
	
	$(function() {
		$(window).resize(function() {
			glScene.windowResize();
		});
	});
});