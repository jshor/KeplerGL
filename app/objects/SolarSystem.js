define([
	'jquery',
	'threejs/OBJLoader',
	'objects/HeliocentricObject',
	'objects/SatelliteObject',
	'data/Jovian',
	'data/Saturnian',
	'data/Hallean',
	'data/Uranian',
	'data/Neptunian',
], 
/* TBD: Implement camera look at and then zoom (for tours) */
function ($, OBJLoader, HeliocentricObject, SatelliteObject, Jovian, Saturnian, Hallean, Uranian, Neptunian) {
	/* TBD: Add sun mesh */
	function SolarSystem(scene, Astrodynamics) {
		/* create planets and their satellites */
		this.satellites = Array();
		this.planets	= Array();
		this.scene		= scene;
		
		/* create planet objects */
		this.createPlanets([Jupiter, Saturn, Uranus, Neptune], Astrodynamics);
			
		/* sunlight */
		this.pointLight = new THREE.PointLight( 0xffffff, 0.75, 50 );
		this.pointLight.color.setHSL(0.55, 0.9, 0.5);
		this.pointLight.color.setHSL(0.08, 0.8, 0.5);
		this.pointLight.color.setHSL(0.995, 0.5, 0.9);
		
		/* ambient light */
		scene.add(new THREE.AmbientLight(0x666666));
		 
/*
		// asteroid belt system
		var asteroidBeltGeometry = new THREE.Geometry();
		var asteroidBeltMaterial = new THREE.ParticleSystemMaterial({color: 0x808080, size: 1, sizeAttenuation: false});

		for (var i=0; i<10000; i++) {
			asteroidBeltVertex = new THREE.Vector3();
			asteroidBeltVertex.x = Math.cos(2*Math.PI/180*i)*(401000950 + (Math.random()*2 - 1)*100000700);
			asteroidBeltVertex.y = Math.random()*50000000*(i%2==0?-1:1);
			asteroidBeltVertex.z = Math.sin(2*Math.PI/180*i)*(401000950 + (Math.random()*2 - 1)*100000700);
			asteroidBeltGeometry.vertices.push(asteroidBeltVertex);
		}

		this.asteroidBelt = new THREE.ParticleSystem(asteroidBeltGeometry, asteroidBeltMaterial);
		//scene.getScene().add(this.asteroidBelt);
*/		
		// sun sprite [a plane that always looks at the camera]
		var sunTexture 	= THREE.ImageUtils.loadTexture("app/textures/sun2.png");
		var sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture, side: THREE.DoubleSide, transparent: true });
		var sunGeometry = new THREE.PlaneGeometry(0.001, 0.001, 1, 1);
		this.sunSprite 	= new THREE.Mesh(sunGeometry, sunMaterial);

		// repeat the texture
		sunTexture.wrapS = THREE.RepeatWrapping;
		sunTexture.wrapT = THREE.RepeatWrapping;

		// stretch the texture to fit the plane
		sunTexture.repeat.x = sunTexture.repeat.y = 1;

		// add the plane to a quaternion, always facing the camera
		this.sunSprite.position.set(0, 0, 0);
		this.sunSprite.lookAt(scene.camera.position);
		this.sunSprite.quaternion = scene.camera.quaternion;
		
		scene.add(this.sunSprite);
		scene.add(this.pointLight);
		
		/* load the ISS */
		
		
				var texture = new THREE.Texture();

				var loader = new THREE.ImageLoader( manager );
				loader.load( 'textures/iss.jpg', function ( image ) {

					texture.image = image;
					texture.needsUpdate = true;

				} );
		
		 var manager = new THREE.LoadingManager();
                                manager.onProgress = function ( item, loaded, total ) {

                                        console.log( item, loaded, total );

                                };
								
			var loader = new THREE.OBJLoader( manager );
									loader.load( 'app/obj/iss.obj', function ( object ) {
											//object.position.y = 0;
											scene.add( object );
											object.scale.set(0.00005,0.00005,0.00005);
											
									} );
									
									
									
		/* set positions of planets according to current timestamp */
		var timestamp = new Date();
		this.setPositions(Math.floor(timestamp.getTime()/1000));
		scene.paused = false;
	}
	
	SolarSystem.prototype.createPlanets = function(planets, Astrodynamics) {
		for(var i=0; i<planets.length; i++) {
			var obj = new HeliocentricObject(planets[i], this.scene, Astrodynamics);
			this.planets.push(obj);

			for(var j=0; j<planets[i].satellites.length; j++)
				this.satellites.push(new SatelliteObject(planets[i].satellites[j], this.scene, obj));
		}
	};
	
	SolarSystem.prototype.getObj = function() {
		return this.planets[1]; // returns saturn
	};
	
	SolarSystem.prototype.setPositions = function(timestamp) {
		/* set the positions of heliocentric objects */
		for(i=0; i<this.planets.length; i++)
			this.planets[i].setPosition(timestamp);

		/* set the positions of planetary satellites */
	//	for(i=0; i<this.satellites.length; i++)
//			this.satellites[i].setPosition(timestamp);
	};
	
	SolarSystem.prototype.updatePositions = function(pause) {
		/* update the positions of heliocentric objects */
		for(i=0; i<this.planets.length; i++)
			this.planets[i].updatePosition();

		/* update the positions of planetary satellites */
		for(i=0; i<this.satellites.length; i++)
			this.satellites[i].updatePosition();
			
		/* update the positions of the asteroid belt */
		//if(this.asteroidBelt)
		//	this.asteroidBelt.rotation.y += 0.0005;*/
	};
	
	return SolarSystem;
});
	