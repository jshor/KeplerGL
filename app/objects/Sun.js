define([
	'jquery'
], 
function ($) {
	function Sun(scene) {
		// sunlight
		var pointLight = new THREE.PointLight( 0xffffff, 0.95, 1000 );
		pointLight.color.setHSL(0.55, 0.9, 0.5);
		pointLight.color.setHSL(0.08, 0.8, 0.5);
		pointLight.color.setHSL(0.995, 0.5, 0.9);
		
		// create the sun mesh
		var sunRaysMaterial = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide,
			transparent: true
		});
	
		// sun sprite [a plane that always looks at the camera]
		scene.loader.enqueue("app/textures/Sun.png");
		var sunTexture = THREE.ImageUtils.loadTexture("app/textures/Sun.png", new THREE.UVMapping(), function() {
			scene.loader.onProgress("app/textures/Sun.png", 1, 1);
			sunRaysMaterial.map = sunTexture;
		});
		
		// render the sun geometries
		var sunRaysGeometry = new THREE.PlaneGeometry(scene.toScale(150000000), scene.toScale(150000000), 1, 1);
		var sunSprite 	= new THREE.Mesh(sunRaysGeometry, sunRaysMaterial);
		var sunSphereGeometry = new THREE.SphereGeometry(scene.toScale(696342), 32, 32);	
		var sunSphereMaterial = new THREE.MeshLambertMaterial({
			color:0xffffff,
			ambient:0xffffff,
			emissive:0xffffff
		});
		
		// draw the sun's sphere
		var sunMesh = new THREE.Mesh(sunSphereGeometry, sunSphereMaterial);
		
		// stretch the texture to fit the plane
		sunTexture.wrapS = THREE.RepeatWrapping;
		sunTexture.wrapT = THREE.RepeatWrapping;
		sunTexture.transparent = true;
		sunTexture.repeat.x = sunTexture.repeat.y = 1;

		// add the plane to a quaternion, always facing the camera
		sunSprite.position.set(0, 0, 0);
		sunSprite.lookAt(scene.camera.position);
		sunSprite.quaternion = scene.camera.quaternion;
		
		scene.add(sunSprite);
		scene.add(pointLight);
		scene.add(sunMesh);
	}
	
	return Sun;
});