define([
	'jquery',
	'interface/Controls',
	'threejs/OrbitControls',
	'threejs/GridHelper'
], 
function ($, Controls) {
	function Scene() {
		var OrbitControls 	= require('threejs/OrbitControls');
		var Controls		= require('interface/Controls');
		
		// scale of km per webGL unit
		this.timeSpeedScale = 10;
		this.scaleConstant = 100000000000;

		// initial conditions for scene
		this.zoomDestination = 100;
		this.zoomLevel = 1;
		this.allowZoom = false;
		this.isZoomUpdating = false;
		this.paused = true;
		
		// initialize user interface controls 
		this.interfaceControls = new Controls();
		
		// initialize the WebGL renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.camera	= new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.01, 1000);
		var width = window.innerWidth;
		var height = window.innerHeight;

		// camera controls
		this.camera.position.set(10, 10, 10);
		this.controls = new THREE.OrbitControls(this.camera);		
		this.controls.minDistance = 0;
		this.controls.maxDistance = 10;
		
		this.startDate = new Date().getTime();
		
		// initialize the scene's controls
		this.interfaceControls.setControls(this);
		this.interfaceControls.correctZoomScrollHeight();
		
		// set size of renderer and camera's position
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.physicallyBasedShading = true;
		this.renderer.autoClear = false; // To allow render overlay on top of sprited sphere
		document.body.appendChild(this.renderer.domElement);
		
		// initialize time (t=0 at init)
		this.time = 0;
		
		// camera rests on a plane which can repositioned (useful for tours)
		this.camerapivot = new THREE.Object3D();
		this.perspective = "Sun";/////////////////////////////////////////////////////////////////////////////////////
		this.camerapivot.add(this.camera);
		
		// initialize the scene 
		this.glScene = new THREE.Scene();
		this.glScene.add(this.camerapivot);
	//	this.glScene.add( new THREE.AxisHelper( 1 ) );
		this.zooming = false;
		
		var size = 0.1;
		var step = 0.01;
		var gridHelper = new THREE.GridHelper( size, step );

		gridHelper.position = new THREE.Vector3( 0 , 0 , 0 );
		gridHelper.rotation = new THREE.Euler( 0 , 0, 0 );
		
		var skyGeometry = new THREE.SphereGeometry( 1, 32, 32);	
		this.skyMaterial = new THREE.MeshLambertMaterial({
			map: THREE.ImageUtils.loadTexture("app/textures/milky.jpg"),
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
	
	
//		this.glScene.add( gridHelper );
		this.hoverLabel = "";
	};
	
	Scene.prototype.setMouseHover = function(label, over) {
		this.hoverLabel = (over ? label : "");
	};
	
	Scene.prototype.setPerspective = function(objectName, callback, objectParentName) {
		// set the object that the camera is focused on
		this.perspective = objectName;
		this.perspectiveParent = (objectParentName != undefined ? objectParentName : "");
		this.zoomLevel = 100-this.camera.fov*100;
		this.zoomDestination = 100;
		this.allowZoom = true;
		this.callback = callback;
	};
	
	Scene.prototype.getPerspective = function(getParent) {
		// get the object that the camera is focused on, return parent if getParent=
		return (getParent ? this.perspectiveParent : this.perspective);
	};
	
	Scene.prototype.updateCameraFocus = function(vector) {
		// set the vector that the camera plane is centered at
		this.camerapivot.position = vector;
	};
	
	Scene.prototype.setSolarSystemScene = function(solarSystemScene) {
		this.solarSystemScene = solarSystemScene;
		this.renderer.sortObjects = false;
	};
	
	Scene.prototype.changeZoom = function(zoomChange) {
		this.zoomDestination = 100-zoomChange;
		this.allowZoom = true;
	};
	
	Scene.prototype.add = function(object) {
		this.glScene.add(object);
	};
	
	Scene.prototype.getScene = function() {
		return this.scene;
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

	Scene.prototype.scaleSpeed = function(speed, timeSpeed) {
		/* the interval is set to update time every 1 millisecond so 1ms=1s in this scale
		   therefore, actual speed must be divided by 1000 * the scaling constant scaleConstant */
		return (speed * this.timeSpeedScale / 1000) / this.scaleConstant;
	};
	
	Scene.prototype.getScaleConstant = function() {
		// scaling factor for scene
		return this.scaleConstant;
	};
	
    Scene.prototype.animate = function() {
		this.camera.updateProjectionMatrix();
		this.glScene.updateMatrixWorld();
		this.renderer.render(this.sceneOrtho, this.cameraOrtho);
		this.renderer.render(this.glScene, this.camera);
		
		// update the camera frustum
		this.camera.fov = this.controls.getRadius() / (this.controls.maxDistance-this.controls.minDistance);
		
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
		
		requestAnimationFrame(this.animate.bind(this));
	};

	Scene.prototype.updateZoom = function() {
		// update to the requested zoom level
		if(this.allowZoom) {
			if(this.zoomLevel+1 <= this.zoomDestination) {
				this.controls.dolly(1-this.zoomLevel/100);
				this.zoomLevel += 2;
			} else if(this.zoomLevel-1 > this.zoomDestination) {
				this.controls.dolly(1-this.zoomLevel/100);
				this.zoomLevel -= 2;
			} else {
				this.allowZoom = false;
				
				if(this.callback)
					this.callback();
				this.callback = null;
			}
		}
	};
	
	Scene.prototype.clockStart = function() {
		var self = this;
		var currentDate = new Date();
		var monthName = ["January", "February", "March", "April", "May", "June", "July", "Augst", "September", "October", "November", "December"];
		var c = 0;
		
		// TBD: bug in Chrome: use setTimeout() instead, put calendar fns in Time.js
		this.clock 	= setInterval(function() {
			self.time += self.getSpeedScale();
			var newtime = self.startDate+(self.time * self.getScaleConstant());
			currentDate.setTime(newtime);
			
			$("#julianDateTime").html(
				monthName[currentDate.getMonth()] + " " 
					+ currentDate.getDate() + ", "
					+ currentDate.getFullYear() + " "
					+ (currentDate.getHours() < 10 ? "0" : "") + currentDate.getHours() + ":"
					+ (currentDate.getMinutes() < 10 ? "0" : "") + currentDate.getMinutes() + ":"
					+ (currentDate.getSeconds() < 10 ? "0" : "") + currentDate.getSeconds() + " "
					+ currentDate.getTimezoneOffset()
			);
			
			self.updateZoom();
			
			if(self.solarSystemScene && !self.paused) {
				self.paused = self.solarSystemScene.updatePositions(self.paused);
			}
		}, 1);
	};
	
	Scene.prototype.clockPause = function() {
		clearInterval(this.clock);
	};
	
	Scene.prototype.getTime = function() {
		return this.time;
	};
	
	Scene.prototype.windowResize = function() {
		this.interfaceControls.correctZoomScrollHeight();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	};
	
    return Scene;
});