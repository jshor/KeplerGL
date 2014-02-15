define([
	'jquery',
	'interface/Controls',
	'three/OrbitControls',
	'three/GridHelper',
	'physics/Time'
], 
function ($, Controls, OrbitControls, GridHelper, Clock) {
	function Scene() {
		// scale of km per GL unit
		this.timeSpeedScale = 1;
		this.scaleConstant = 10000000000;

		// zoom conditions
		this.zoomDestination = 100;
		this.zoomLevel = 1;
		this.allowZoom = false;
		this.isZoomUpdating = false;
		
		// initial conditions for scene
		this.paused = true;
		this.hoverLabel = "";
		
		// initialize user interface controls 
		this.interfaceControls = new Controls();
		
		// initialize the WebGL renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.camera	= new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
		var width = window.innerWidth;
		var height = window.innerHeight;

		// camera controls
		this.camera.position.set(100, 100, 100);
		this.controls = new THREE.OrbitControls(this.camera);		
		this.controls.minDistance = 0;
		this.controls.maxDistance = 100;
		this.cameraPerspectivePosition = new THREE.Vector3(0,0,0);
		this.lookAt = "Sun";
		
		// initalize time
		this.clock = new Clock(this);
		
		// initialize the scene's controls
		this.interfaceControls.setControls(this);
		this.interfaceControls.correctZoomScrollHeight();
		
		// set size of renderer and camera's position
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.physicallyBasedShading = true;
		this.renderer.autoClear = false; // To allow render overlay on top of skybox
		document.body.appendChild(this.renderer.domElement);
		
		// camera rests on a plane which can repositioned for views
		this.camerapivot = new THREE.Object3D();
		this.camerapivot.add(this.camera);
		
		/* Terminology for views/perspectives:
		 *		View mode: looking at an object, generally triggered by clicking its label;
		 *		           shows dialog window and zooms in on object
		 *			- view: [object name] the object the user is looking at; when null, it defaults to Sun
		 *		Perspective mode: allows the user to view and object from another object
		 *			- observer: [object name] observing planet where camera is at
		 *			- lookAt: [object name] the object the camera is looking at; when null, it defaults to Sun
		 *			- cameraLastPosition: last object in view mode
		 */
		this.view = null;
		this.observer = null;
		this.lookAt = null;
		this.cameraLastPosition = null;
		this.perspectiveMode = false;
		
		// initialize the scene 
		this.glScene = new THREE.Scene();
		this.glScene.add(this.camerapivot);
	//	this.glScene.add( new THREE.AxisHelper( 1 ) );
		this.zooming = false;
		
		var skyGeometry = new THREE.SphereGeometry( 1, 32, 32);	
		this.skyMaterial = new THREE.MeshLambertMaterial({
			map: THREE.ImageUtils.loadTexture("app/textures/milkyway.jpg"),
			side: THREE.BackSide,
			color:0x000000, ambient:0x000000, emissive:0x808080});

	this.cameraOrtho = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.0001, 1000);
	this.cameraOrtho.position.set(0.05, 0.05, 0.05);
		this.controlsOrtho	= new THREE.OrbitControls(this.cameraOrtho);		
		this.controlsOrtho.minDistance = 0.0002;
		this.controlsOrtho.maxDistance = 0.1;
	this.sceneOrtho = new THREE.Scene();
	this.sceneOrtho.add(this.cameraOrtho);
	
	this.skyBox = new THREE.Mesh( skyGeometry, this.skyMaterial );
	//	this.skyBox.scale.set(-1, 1, 1);
//	this.skyBox.rotation.set(0, .3, -.9);
      this.skyBox.rotation.z = Math.PI*25/32;  // get the milky way in the right place
      this.skyBox.rotation.x = Math.PI/11;
//	this.skyBox.renderDepth = 1000.0;
	
	this.sceneOrtho.add( this.skyBox );
	};
	
	Scene.prototype.setMouseHover = function(label, over) {
		this.hoverLabel = (over ? label : "");
	};
	
	Scene.prototype.enterPerspectiveMode = function(lookAt, observer) {
		// the "watch a planet from another planet" mode
		this.observer = observer;
		this.view = null;
		this.lookAt = lookAt;
		this.perspectiveMode = true;
		
		this.updateCameraFocus(new THREE.Vector3(0,0,0));
		this.interfaceControls.toggleZoomScroll();
	};
	
	Scene.prototype.leavePerspectiveMode = function() {
		// leave perspective mode and look at the origin
		this.camera.position = this.cameraLastPosition;
		this.camera.lookAt = new THREE.Vector3(0,0,0); // origin
		this.lookAt = null;
		this.perspectiveMode = false;
	};
	
	Scene.prototype.updateCameraPosition = function(vect) {
		this.camera.position = vect;
	};
	
	Scene.prototype.updateCameraFocus = function(vector) {
		// set the position vector of the camera plane
		this.camerapivot.position = vector;
	};
	
	Scene.prototype.updateCameraLookAt = function(vector) {
		this.camera.lookAt(vector);
	};
	
	Scene.prototype.setView = function(objectName, callback, objectParentName) {
		// set the object that the camera is focused on
		this.view = objectName;
		this.viewParent = (objectParentName != undefined ? objectParentName : "");
		/* why 101.99 and not 100? because the zoom increment is 2, and the max zoom
		 * must be less than the current zoom level. Therefore, 101.99 < 100+2 */
		this.zoomLevel = 101.99-this.camera.fov*100;
		this.zoomDestination = 101.99; 
		this.allowZoom = true;
		this.callback = callback;
	};
	
	Scene.prototype.getView = function(getParent) {
		// get the object that the camera is focused on, return parent if getParent=true
		return (getParent ? this.viewParent : this.view);
	};
	
	Scene.prototype.getObserver = function() {
		return this.observer;
	};
	
	Scene.prototype.getLookAt = function() {
		return this.lookAt;
	};
	
    Scene.prototype.animate = function() {
		if(this.solarSystemScene && !this.paused) {
			// if the solar system is not set to paused, update the scene
			this.clock.update();
			this.paused = this.solarSystemScene.updatePositions(this.paused, this.clock.offset()/1000);
			
			// update the time/date interface
			this.interfaceControls.updateDate(this.clock.getUXDate());
		}
		
		this.camera.updateProjectionMatrix();
		this.glScene.updateMatrixWorld();
		this.renderer.render(this.sceneOrtho, this.cameraOrtho);
		this.renderer.render(this.glScene, this.camera);
		
		// update the camera frustum
		if(!this.perspectiveMode)
			this.camera.fov = this.controls.getRadius() / (this.controls.maxDistance-this.controls.minDistance);
		else
			this.camera.fov = 1;
			
		if(this.camera.fov > 100)
			this.camera.fov = 100;
		
		if(!this.isZoomUpdating)
			this.interfaceControls.setZoom(this.camera.fov*100);

		// show/hide the title if the camera is relatively close (25% radius) to the object
		if(this.camera.fov <= 0.25)
			this.interfaceControls.toggleTitle(true);
		else
			this.interfaceControls.toggleTitle(false);
		
		this.camera.updateProjectionMatrix();
		this.controls.update();
		this.controlsOrtho.update();
		this.updateZoom();
		
		requestAnimationFrame(this.animate.bind(this));
	};
	
	Scene.prototype.changeZoom = function(zoomChange) {
		var zoomMargin = 100+1.99;
		this.zoomLevel = (zoomMargin-this.camera.fov*100 < this.zoomLevel ? zoomMargin-this.camera.fov*100 : this.zoomLevel);
		this.zoomDestination = zoomMargin-zoomChange;
		this.allowZoom = true;
	};

	Scene.prototype.updateZoom = function() {
		// update to the requested zoom level
		if(this.allowZoom) {
			if(this.zoomLevel+1 < this.zoomDestination) {
				this.controls.dolly(1-this.zoomLevel/100);
				this.zoomLevel += 2;
			} else if(this.zoomLevel-1 >= this.zoomDestination) {
				this.controls.dolly(1-this.zoomLevel/100);
				this.zoomLevel -= 2;
			} else {
				// disallow zooming if the zooming destination is reached
				this.allowZoom = false;
				
				// execute callback function
				if(this.callback)
					this.callback();
				this.callback = null;
			}
		}
	};
	
	Scene.prototype.toScale = function(x) {
		return x / this.scaleConstant;
	};
	
	Scene.prototype.planetScale = function(x) {
		return x * 100 / this.scaleConstant; // TBD: modify so users can change this
	};
	
	Scene.prototype.getSpeedScale = function() {
		return this.timeSpeedScale / this.scaleConstant;
	};
	
	Scene.prototype.scaleSpeed = function(speed) {
		/* the interval is set to update time every 1 millisecond so 1ms=1s in this scale
		   therefore, actual speed must be divided by 1000 * the scaling constant scaleConstant */
		return (speed * this.timeSpeedScale / 100) / this.scaleConstant;
	};
	
	Scene.prototype.getScaleConstant = function() {
		// scaling factor for scene
		return this.scaleConstant;
	};
	
	Scene.prototype.add = function(object) {
		this.glScene.add(object);
	};
	
	Scene.prototype.getScene = function() {
		return this.scene;
	};
	
	Scene.prototype.setSolarSystemScene = function(solarSystemScene) {
		this.solarSystemScene = solarSystemScene;
		this.renderer.sortObjects = false;
	};
	
	Scene.prototype.windowResize = function() {
		this.interfaceControls.correctZoomScrollHeight();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	};
	
    return Scene;
});