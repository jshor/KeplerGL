define([
	'jquery'
], 
function ($) {


function toRadians(x) {
	return x * Math.PI / 180;
}
	function Skybox(loader) {
		var skyGeometry = new THREE.SphereGeometry(10000, 32, 32);	
		var self = this;
		
		this.camera	= new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 10, 10000);
		this.camera.position.set(1, 1, 1);
		this.controls = new THREE.OrbitControls(this.camera);	
		this.controls.autoRotate = true;
		this.controls.autoRotateSpeed = 1.5;	
		this.controls.userZoom = false;
		// this.controls.minDistance = 10;
		// this.controls.maxDistance = 10;
		this.scene = new THREE.Scene();
		this.scene.add(this.camera);
	
		this.skyMaterial = new THREE.MeshBasicMaterial({
			color:0x808080,
			ambient:0x000000,
			emissive:0x808080
		});
		
		loader.enqueue("app/textures/milkyway.jpg");
		this.skyMaterial.map = THREE.ImageUtils.loadTexture("app/textures/milkyway.jpg", new THREE.UVMapping(), function() {
			loader.onProgress("app/textures/milkyway.jpg", 1, 1);
		});
		this.skyMaterial.map.needsUpdate = true;
		this.skyMaterial.side = THREE.BackSide;
	
		this.skyBox = new THREE.Mesh( skyGeometry, this.skyMaterial );
		this.skyBox.rotation.z = Math.PI*25/32;  // get the milky way in the right place
		this.skyBox.rotation.x = Math.PI/11;
	// this.skyBox.renderDepth = 10000.0;
		this.scene.add(this.skyBox);
	}
	
	Skybox.prototype.render = function(renderer) {
		return renderer.render(this.scene, this.camera);
	};
	
	Skybox.prototype.update = function() {
		return this.controls.update();
	};
	
	return Skybox;
});