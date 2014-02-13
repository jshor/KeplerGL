define([
	'jquery',
	'three/OBJLoader',
	'objects/HeliocentricObject',
	'objects/SatelliteObject',
	'data/Mercurian',
	'data/Jovian',
	'data/Saturnian',
	'data/Hallean',
	'data/Uranian',
	'data/Neptunian',
], 
/* TBD: Implement camera look at and then zoom (for tours) */
function ($, OBJLoader, HeliocentricObject, SatelliteObject, Mercurian, Jovian, Saturnian, Hallean, Uranian, Neptunian) {
	/* TBD: Add sun mesh */
	function SolarSystem(scene) {
		/* create planets and their satellites */
		this.satellites = Array();
		this.planets	= Array();
		this.scene		= scene;
		
		/* create planet objects */
		this.createPlanets([Mercury, Jupiter, Saturn, Uranus, Neptune, Halley]);
			
		/* sunlight */

		this.pointLight = new THREE.PointLight( 0xffffff, 0.95, 1000 );
		this.pointLight.color.setHSL(0.55, 0.9, 0.5);
		this.pointLight.color.setHSL(0.08, 0.8, 0.5);
		this.pointLight.color.setHSL(0.995, 0.5, 0.9);
	
		// sun sprite [a plane that always looks at the camera]
		var sunTexture 	= THREE.ImageUtils.loadTexture("app/textures/Sun.png");
		var sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture, side: THREE.DoubleSide, transparent: true });
		var sunGeometry = new THREE.PlaneGeometry(scene.toScale(150000000), scene.toScale(150000000), 1, 1);
		this.sunSprite 	= new THREE.Mesh(sunGeometry, sunMaterial);

		// repeat the texture
		sunTexture.wrapS = THREE.RepeatWrapping;
		sunTexture.wrapT = THREE.RepeatWrapping;
		
		/* sun mesh */
		
		var geometrySun = new THREE.SphereGeometry(scene.toScale(696342), 32, 32);	
		var materialSun = new THREE.MeshLambertMaterial({color:0xffffff, ambient:0xffffff, emissive:0xffffff});
		
			/* draw the sphere */
		SunMesh = new THREE.Mesh(geometrySun, materialSun);
		scene.add(SunMesh);
		
		// stretch the texture to fit the plane
		sunTexture.repeat.x = sunTexture.repeat.y = 1;

		// add the plane to a quaternion, always facing the camera
		this.sunSprite.position.set(0, 0, 0);
		this.sunSprite.lookAt(scene.camera.position);
		this.sunSprite.quaternion = scene.camera.quaternion;
		
		scene.add(this.sunSprite);
		scene.add(this.pointLight);
		
		/* skybox */
	
	var imagePrefix = "app/textures/images/";
	var directions  = ["px", "nx", "py", "ny", "pz", "nz"];
//	var directions  = ["sky1", "sky1", "sky2", "sky3", "sky4", "sky5"];
	var imageSuffix = ".jpg";
	
	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + "milkyway" + imageSuffix ),
			side: THREE.BackSide
		}));
		
		


		
		
		// add it to the scene
		
		/* load the ISS */
		
		
				var texture = new THREE.Texture();

				var loader = new THREE.ImageLoader( manager );
				loader.load( 'textures/iss.jpg', function ( image ) {

					texture.image = image;
					texture.needsUpdate = true;

				} );
		
		 var manager = new THREE.LoadingManager();
                                manager.onProgress = function ( item, loaded, total ) {

                              //          console.log( item, loaded, total );

                                };
								
			var loader = new THREE.OBJLoader( manager );
									loader.load( 'app/obj/iss.obj', function ( object ) {
											//object.position.y = 0;
											//scene.add( object );
											object.scale.set(0.00005,0.00005,0.00005);
											
									} );
									
									
									
		/* set positions of planets according to current timestamp */
		var timestamp = new Date();
		this.setPositions(Math.floor(timestamp.getTime()/1000));
		scene.paused = false;
	}
	
	SolarSystem.prototype.createPlanets = function(planets) {
		for(var i=0; i<planets.length; i++) {
			var obj = new HeliocentricObject(planets[i], this.scene);
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
		for(i=0; i<this.satellites.length; i++)
			this.satellites[i].setPosition(timestamp);
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
	