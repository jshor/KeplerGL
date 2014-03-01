define([
	'jquery'
], 
function ($) {


function toRadians(x) {
	return x * Math.PI / 180;
}
	function Mesh(data, scene, plane) {
		if(data.objectMesh != undefined) {
			this.mesh = new THREE.Object3D();
			var self = this;
			
			var loader = new THREE.OBJLoader( scene.loader.manager );
			loader.load( 'app/obj/iss.obj', function ( body ) {
				// load the 3D model
				body.position.y = 0;
				body.scale.set(0.000001,0.000001,0.000001);
				self.body = body;
				self.mesh.add(self.body);
			});
			
			// normalize the mesh to the orbit focus
			this.mesh.rotation.x = -Math.PI/2;						
		} else {
			// axial rotation period parameters
			this.rotation = data.rotation;
			this.nextPeriapsis = data.nextPeriapsis;
			
			// the object is a sphere (or close enough)
			this.geometry = new THREE.SphereGeometry(scene.planetScale(data.radius), 32, 32);
			this.material = new THREE.MeshPhongMaterial({
				specular: 0x808080
			});
			
			// draw the sphere
			this.mesh = new THREE.Object3D();
			this.body = new THREE.Mesh(this.geometry, this.material);
			
			if(data.texture != undefined) {
				// load textures if they're available
				if(data.texture.map != undefined) {
					scene.loader.enqueue("app/textures/map/" + data.texture.map);
					this.material.map = THREE.ImageUtils.loadTexture("app/textures/map/" + data.texture.map, new THREE.UVMapping(), function() {
						scene.loader.onProgress("app/textures/map/" + data.texture.map, 1, 1);
					});
				}
			}

			// if the item is a Jovian planet, draw its rings
			if(data.rings != undefined) {
				var ringMaterial = new THREE.MeshBasicMaterial({
					side: THREE.DoubleSide,
					transparent: true
				});
				
				// load the rings
				scene.loader.enqueue("app/textures/rings/" + data.name + ".png");
				ringMaterial.map = THREE.ImageUtils.loadTexture("app/textures/rings/" + data.name + ".png", new THREE.UVMapping(), function() {
					scene.loader.onProgress("app/textures/rings/" + data.name + ".png", 1, 1);
				});
				
				var ringGeometry = new THREE.PlaneGeometry(
					scene.planetScale(data.rings[0].outerRadius*2),
					scene.planetScale(data.rings[0].outerRadius*2),
					1, 1);
				this.rings = new THREE.Mesh(ringGeometry, ringMaterial);
				
				this.mesh.add(this.rings);
				this.rings.position.set(0,0,0);
				this.rings.rotation.x = Math.PI/2;
				
				// add a point light to the mesh to create a shadow on the ring
				this.mesh.add(this.lightplane);

				this.light = new THREE.DirectionalLight(0xffffff, .4);
				this.light.position.set(0, 0.0, -0.03);
				this.light.target = this.body;
				
				this.body.castShadow = true;
				this.rings.receiveShadow = true;
				this.light.onlyShadow = true;
				this.light.castShadow = true;
				this.light.shadowCameraVisible = true;

				var d = 0.009;
				this.light.shadowCameraLeft = -d;
				this.light.shadowCameraRight = d;
				this.light.shadowCameraTop = d;
				this.light.shadowCameraBottom = -d;

				this.light.shadowCameraNear = 0.04;
				this.light.shadowCameraFar = 0.002;
				this.light.shadowDarkness = 1;

				this.mesh.add(this.light);
				this.rings.rotation.x = Math.PI/2-toRadians(data.axialTilt);
			}
			
			// add body to the mesh
			this.mesh.add(this.body);
			
			// normalize the mesh to the orbit focus
			this.mesh.rotation.x = Math.PI/2;
			this.body.rotation.z = -toRadians(data.axialTilt);
		}
		this.mesh.add( new THREE.AxisHelper( 0.001 ) );
	}
	
	Mesh.prototype.rotate = function(t) {
		// rotate the planet according to arcseconds as a function of time
		var arcrotation = Math.abs(t*this.rotation*(Math.PI/648000)) % (2*Math.PI); // arcseconds to radians
		this.body.rotation.y = arcrotation;
	};
	
	Mesh.prototype.add = function(object) {
		return this.mesh.add(object);
	};
	
	Mesh.prototype.getObject = function() {
		return this.mesh;
	};
	
	Mesh.prototype.visible = function(visibility) {
		// show/hide the body
		this.body.visible = visibility;
		if(this.rings != undefined)
			this.rings.visible = visibility;
	};
	
	return Mesh;
});