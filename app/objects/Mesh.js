define([
	'jquery'
], 
function ($) {


function toRadians(x) {
	return x * Math.PI / 180;
}
	function Mesh(data, scene, plane) {
		if(data.objectType == "Jovian" || data.objectType == "Terrestrial" || data.objectType == "Moon") {
			var geometry = new THREE.SphereGeometry(scene.planetScale(data.radius), 32, 32);	
			var material = new THREE.MeshPhongMaterial({
				map: THREE.ImageUtils.loadTexture("app/textures/" + data.texture),
				//bumpMap: THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
				//bumpScale:   0.005,
				//specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
				specular: 0xffffff
			});
			
			/* draw the sphere */
			this.mesh = new THREE.Object3D();
			this.body = new THREE.Mesh(geometry, material);

			/* if the item is a Jovian planet, draw its rings */
			if(data.rings != undefined) {
				var ringMaterial = new THREE.MeshBasicMaterial({
					map: THREE.ImageUtils.loadTexture("app/textures/" + data.name + "_rings.png"),
					side: THREE.DoubleSide,
					transparent: true
				});
				//var ringMaterial = new THREE.MeshLambertMaterial({color: 0x22FF11});
				
				var ringGeometry = new THREE.PlaneGeometry(
					scene.planetScale(data.rings[0].outerRadius*2),
					scene.planetScale(data.rings[0].outerRadius*2),
					1, 1);
				this.rings		 = new THREE.Mesh(ringGeometry, ringMaterial);
				
				this.mesh.add(this.rings);
				this.rings.position.set(0,0,0);
				this.rings.rotation.x = Math.PI/2;
			}
			
			/* add body to the mesh */
			this.body.rotation.y = 0;
			this.mesh.add(this.body);
		this.mesh.add( new THREE.AxisHelper( 0.001 ) );
			
			/* normalize the mesh to the orbit focus */
			this.mesh.rotation.x = -Math.PI/2;
			this.mesh.rotation.x = Math.PI/2-toRadians(data.axialTilt);
		} else if(data.objectType == "Spacecraft") {
			/* load spacecraft object */
		}
		
		return this.mesh;
	}
	
	Mesh.prototype.add = function(object) {
		return this.mesh.add(object);
	};
	
	Mesh.prototype.getObject = function() {
		return this.mesh;
	};
	
	return Mesh;
});