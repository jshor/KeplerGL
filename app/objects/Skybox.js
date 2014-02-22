define([
	'jquery'
], 
function ($) {


function toRadians(x) {
	return x * Math.PI / 180;
}
	function Skybox(scene) {
		var skyGeometry = new THREE.SphereGeometry(1, 32, 32);	
		var self = this;
		
		this.camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.0001, 1000);
		this.camera.position.set(0.05, 0.05, 0.05);
		this.controls = new THREE.OrbitControls(this.camera);		
		this.controls.minDistance = 0.0002;
		this.controls.maxDistance = 0.1;
		this.scene = new THREE.Scene();
		this.scene.add(this.camera);
	
		this.skyMaterial = new THREE.MeshBasicMaterial({
			color:0xFFFFFF,
			ambient:0x000000,
			emissive:0xFFFFFF
		});
		
		scene.loader.enqueue("app/textures/milkyway.jpg");
		this.skyMaterial.map = THREE.ImageUtils.loadTexture("app/textures/milkyway.jpg", new THREE.UVMapping(), function() {
			scene.loader.onProgress("app/textures/milkyway.jpg", 1, 1);
		});
		this.skyMaterial.map.needsUpdate = true;
		this.skyMaterial.side = THREE.BackSide;
	
		this.skyBox = new THREE.Mesh( skyGeometry, this.skyMaterial );
		this.skyBox.rotation.z = Math.PI*25/32;  // get the milky way in the right place
		this.skyBox.rotation.x = Math.PI/11;
//	this.skyBox.renderDepth = 1000.0;
// scene.add(this.skyBox);
	}
	
	Skybox.prototype.render = function(renderer) {
		return renderer.render(this.scene, this.camera);
	};
	
	Skybox.prototype.update = function() {
		return this.controls.update();
	};
	
	return Skybox;
});