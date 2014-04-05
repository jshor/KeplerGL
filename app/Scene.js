define([
	'jquery',
	'interface/Controls',
	'interface/LoadingManager',
	'three/OrbitControls',
	'three/GridHelper',
	'physics/Time',
	"objects/SolarSystem",
	'objects/Skybox'
], 
function ($, Controls, LoadingManager, OrbitControls, GridHelper, Clock, SolarSystem, Skybox) {
	function Scene() {
		// scale of km per GL unit
		this.timeSpeedScale = 1;
		this.planetSizeScale = 1;
		this.scaleConstant = 1000000000;
		
		// loading manager
		this.loader = new LoadingManager();
		
		// initialize the skybox
		this.skybox = new Skybox(this.loader);

		// zoom conditions
		this.zoomDestination = 100;
		this.zoomLevel = 90;
		this.allowZoom = false;
		this.isZoomUpdating = false;
		
		// initial conditions for scene
		this.paused = true;
		this.hoverLabel = "";
		
		// initialize user interface controls 
		this.interfaceControls = new Controls();
		
		// initialize the WebGL renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.camera	= new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 10000);
		var width = window.innerWidth;
		var height = window.innerHeight;

		// camera controls
		this.camera.position.set(180, 50, 180);
		this.camera.rotation.order = 'YXZ';
		this.controls = new THREE.OrbitControls(this.camera);		
		this.controls.minDistance = 0;
		this.controls.maxDistance = 500;
		this.controls.autoRotate = true;
		this.controls.autoRotateSpeed = 1.5;
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
		//this.renderer.shadowMapType = THREE.PCFSoftShadowMap; // options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
		this.renderer.shadowMapEnabled = true;
		document.body.appendChild(this.renderer.domElement);
		
		
		// camera rests on a plane which can repositioned for views
		this.camerapivot = new THREE.Object3D();
		this.camerapivot.add(this.camera);
		
		/* Terminology for views/perspectives:
		 *	View mode: looking at an object, generally triggered by clicking its label;
		 *  shows dialog window and zooms in on object
		 *	 - view: [object name] the object the user is looking at; when null, it defaults to Sun
		 *
		 *	Perspective mode: allows the user to view and object from another object
		 *	 - observer: [object name] observing planet where camera is at
		 *	 - lookAt: [object name] the object the camera is looking at; when null, it defaults to Sun
		 *	 - cameraLastPosition: last object in view mode
		 */
		this.view = null;
		this.observer = null;
		this.lookAt = null;
		this.cameraLastPosition = null;
		this.perspectiveMode = false;
		
		// initialize the scene 
		this.glScene = new THREE.Scene();
		this.glScene.add(this.camerapivot);
		this.zooming = false;
	};
	
	Scene.prototype.updateTime = function(t) {
		// update time for the solar system scene
		this.paused = true;
		this.clock.setTime(t);
		this.solarSystemScene.updateTime(this, t);
	};
	
	Scene.prototype.setTime = function(t) {
		// create a new solar system scene
		this.clock = new Clock(this);
		this.solarSystemScene = new SolarSystem(this, t);
		this.renderer.sortObjects = false;
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
		this.cameraLastPosition = this.camera.position;
		
		this.updateCameraFocus(new THREE.Vector3(0,0,0));
		this.interfaceControls.toggleZoomScroll();
		this.interfaceControls.setTip("Press 'Esc' to exit perspective");
		var self = this;
		
		// enable 'esc' event
		$(document).keyup(function(e) {
			if (e.keyCode == 27)
				self.leavePerspectiveMode();
		});
	};
	
	Scene.prototype.leavePerspectiveMode = function() {
		// leave perspective mode and look at the origin
		if(this.cameraLastPosition)
			this.camera.position = this.cameraLastPosition;
		this.lookAt = "Earth";
		this.perspectiveMode = false;
		this.interfaceControls.toggleZoomScroll(true);
		this.interfaceControls.setTip();
		
		// disable 'esc' event
		$(document).keyup(function(e) {
			if (e.keyCode == 13)
				return true;
		});
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
		this.interfaceControls.setTitle(objectName);
		this.viewParent = (objectParentName != undefined ? objectParentName : "");
		/* why 101.99 and not 100? because the zoom increment is 2, and the max zoom
		 * must be less than the current zoom level. Therefore, 101.99 < 100+2 */
		this.zoomLevel = 101.99-this.camera.fov*100;
		this.zoomDestination = 100; 
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
		this.skybox.render(this.renderer);
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
		
		// the speed of the camera spin increases as the radius decreases
		var autoRotateSpeed = parseInt((this.camera.fov+0.5)*2);
		if(!isNaN(autoRotateSpeed))
			this.controls.autoRotateSpeed = autoRotateSpeed;
		
		this.camera.updateProjectionMatrix();
		this.controls.update();
		this.skybox.update();
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
		return x * this.planetSizeScale / this.scaleConstant; // TBD: modify so users can change this
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
	
	Scene.prototype.windowResize = function() {
		this.interfaceControls.correctZoomScrollHeight();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	};
	
    return Scene;
});