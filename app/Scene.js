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
		
		/* scale of km per webGL unit */
		this.timeSpeedScale = 10;
		this.scaleConstant = 100000000000;
		this.paused = true;
		
		/* initialize controls */
		this.interfaceControls = new Controls();
		
		/* initialize the WebGL renderer */
		this.renderer	= new THREE.WebGLRenderer({ antialias: true, alpha: true });//
		this.camera		= new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.0001, 5);

		/* camera controls */
		this.camera.position.set(0.05, 0.05, 0.05);
		this.controls	= new THREE.OrbitControls(this.camera);		
		this.controls.minDistance = 0.0002;
		this.controls.maxDistance = 0.1;
		
		this.startDate	= new Date().getTime();
		
		/* initialize the scene's controls */
		this.interfaceControls.setControls(this);
		this.interfaceControls.correctZoomScrollHeight();
		
		/* set size of renderer and camera's position */
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.physicallyBasedShading = true;
		document.body.appendChild(this.renderer.domElement);
		
		/* initialize time (t=0 at init) */
		this.time = 0;
		
		/* camera rests on a plane which can repositioned (useful for tours) */
		this.camerapivot = new THREE.Object3D();
		this.perspective = "Saturn";/////////////////////////////////////////////////////////////////////////////////////
		this.camerapivot.add(this.camera);
		
		/* initialize the scene */
		this.glScene = new THREE.Scene();
		this.glScene.add(this.camerapivot);
	//	this.glScene.add( new THREE.AxisHelper( 1 ) );
		this.zooming = false;
		
		var size = 0.1;
		var step = 0.01;
		var gridHelper = new THREE.GridHelper( size, step );

		gridHelper.position = new THREE.Vector3( 0 , 0 , 0 );
		gridHelper.rotation = new THREE.Euler( 0 , 0, 0 );

		//this.glScene.add( gridHelper );
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
		return this.timeSpeedScale / this.scaleConstant; // TBD: modify so users can change this
	};

	Scene.prototype.scaleSpeed = function(speed, timeSpeed) {
		/* the interval is set to update time every 1 millisecond so 1ms=1s in this scale
		   therefore, actual speed must be divided by 1000 * the scaling constant scaleConstant */
		return (speed * this.timeSpeedScale / 1000) / this.scaleConstant;
	};
	
	Scene.prototype.getScaleConstant = function() {
		return this.scaleConstant;
	};
	
	Scene.prototype.cameraFocus = function(objectName) {
		/* get or set the object that the camera is focused on */
		if(objectName != undefined)
			this.perspective = objectName;
		
		return this.perspective;
	};
	
	Scene.prototype.updateCameraFocus = function(vector) {
		/* set the vector that the camera plane is centered at */
		this.camerapivot.position = vector;
	};
	
	Scene.prototype.setSolarSystemScene = function(solarSystemScene) {
		this.solarSystemScene = solarSystemScene;
		this.renderer.sortObjects = false;
	};
	
	Scene.prototype.changeZoom = function(zoom) {
		var cam = this.camera.position;
		var tar = this.controls.target;
		var dist = Math.sqrt(Math.pow(Math.abs(cam.x-tar.x), 2)+Math.pow(Math.abs(cam.y-tar.y), 2)+Math.pow(Math.abs(cam.z-tar.z), 2));
		var distPercent = ((dist / (this.controls.maxDistance-this.controls.minDistance))*100);
		
		this.controls.dollyIn(dist*Math.abs(100-zoom));
	};
	
	Scene.prototype.getScaleConstant = function() {
		return 100000000000;
	};
	
    Scene.prototype.animate = function() {
		this.camera.updateProjectionMatrix();
		this.glScene.updateMatrixWorld();
		this.renderer.render(this.glScene, this.camera);
		
		/* change zoom of camera */
		//this.camera.fov = $("#zoomScroll").val();
		
		// distance between camera position and target position
		// should be in Math prototype class instead of scene prototype class.
		if(this.controls.target != undefined) {
			var cam = this.camera.position;
			var tar = this.controls.target;
			var dist = Math.sqrt(Math.pow(Math.abs(cam.x-tar.x), 2)+Math.pow(Math.abs(cam.y-tar.y), 2)+Math.pow(Math.abs(cam.z-tar.z), 2));
			var distPercent = ((dist / (this.controls.maxDistance-this.controls.minDistance))*100);
			this.camera.fov = distPercent;
			
			this.interfaceControls.updateZoom(distPercent);

			$("#tourLink").html(this.camera.fov);
		}
	//	this.solarSystemScene.getPlanet().zoomIn();
		this.camera.updateProjectionMatrix();
	//	console.log(this.camera.fov);
		this.controls.update();
	//	$("#zoomScroll").val(level, true); // change zoom level of interface scroll
		requestAnimationFrame(this.animate.bind(this));
	};
	
	Scene.prototype.shiftLeft = function() { // TBD: this method should be in Controls.js
		$("canvas").width($("canvas").width()+600);
		$("canvas").css({ marginTop: -150 });
		$("canvas").css({ marginLeft: -600 });
		$("#dialog").show();
		$("#dialogWindow heading").html("Mars");
	};
	
	Scene.prototype.clockStart = function() {
		var self 		= this;
		var currentDate = new Date();
		var monthName = ["January", "February", "March", "April", "May", "June", "July", "Augst", "September", "October", "November", "December"];
		
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
		//	$("#julianDateTime").html(newtime);
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
	
	Scene.prototype.showInfo = function() {
		
	};
	
	Scene.prototype.windowResize = function() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
	};
	
    return Scene;
});