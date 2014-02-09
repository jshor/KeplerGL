define([
	'jquery',
	'objects/Mesh',
	'physics/Astrodynamics',
	'interface/DialogWindow'
], 
function ($, Mesh, Astrodynamics, DialogWindow) {
	
function toRadians(x) {
	return x * Math.PI / 180;
}

function ramanujan(a, b) {
	return Math.PI*(3*(a+b)-Math.sqrt((3*a+b)*(a+3*b)));
}


function render3Dto2D(position, camera) {	 
	var div			= document.getElementsByTagName('canvas')[0];
	var pos			= position.clone();
	projScreenMat	= new THREE.Matrix4();
	
	projScreenMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
	pos.applyProjection(projScreenMat);
	
	var offset	= findOffset(div);
	var x		= (( pos.x + 1 ) * div.width / 2 + offset.left);
	var y		= (( - pos.y + 1) * div.height  / 2 + offset.top);
	
	if(x < div.width && y < div.height) {
		return { x: x, y: y };
	} else {
		return null;
	}
}

function findOffset(element) { 
  var pos = new Object();
  pos.left = pos.top = 0;        
  if (element.offsetParent)  
  { 
	do  
	{ 
	  pos.left += element.offsetLeft; 
	  pos.top += element.offsetTop; 
	} while (element = element.offsetParent); 
  } 
  return pos;
} 

	function SatelliteObject(data, scene, planet) {
		this.scene = scene;
		this.name = data.name;
		this.mass = data.mass;
		this.nextPeriapsis = data.nextPeriapsis;
		this.lastPeriapsis = data.lastPeriapsis;
		this.GM = planet.GMass;
		this.planet = planet;
		this.semimajor = data.semimajor;
		this.semiminor = data.semiminor;
		this.radius = data.radius;
		this.camera = scene.camera;
		this.inclination = data.inclination;
		this.controls = scene.interfaceControls;
		this.eccentricity = data.eccentricity;
		this.atmosphere = (data.atmosphere != undefined ? data.atmosphere : 0xFFFFFF);

		// materials
		//this.texture 		= new THREE.ImageUtils.loadTexture("app/textures/" + this.name + ".jpg");
		this.material 		= new THREE.MeshPhongMaterial({
			//map: this.texture,
			//bumpMap: THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
			//bumpScale:   0.005,
			//specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
			specular: new THREE.Color('grey')
		});
		this.lineMaterial = new THREE.LineBasicMaterial({
			color: this.atmosphere,
			opacity: 0.4,
			transparent: true
		});
		this.label = $("<span></span>");
		this.motion = 0;
		
		// scale all objects down to save rendering precision
		this.GM = this.scene.toScale(this.GM); // gravitational constant of planet
		this.radius = this.scene.planetScale(this.radius);
		this.semimajor = this.scene.planetScale(this.semimajor);
		this.semiminor = this.scene.planetScale(this.semiminor);
		
		// add a sphere, mesh and ellipse path
		this.geometry = new THREE.SphereGeometry(this.radius, 32, 32);
		
		/* there are three 3D objects to add:
			- plane: the plane which the pivot point sits on (important for rotations)
			- pivot: the point that the mesh must update its position to (but does not sit on)
			- mesh: the spherical object that holds the texture and atmosphere
		*/
		this.plane = new THREE.Object3D();
		this.pivot = new THREE.Object3D();
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		
		// draw the ellipse and its path
		this.focus = Math.sqrt(Math.pow(this.semimajor, 2) - Math.pow(this.semiminor, 2));
		this.ellipsePath = new THREE.CurvePath();
		this.cameraPivot = new THREE.Object3D();
		
		// create geometry for the ellipse and its visible path
		this.ellipse = new THREE.EllipseCurve(0, this.focus, this.semiminor, this.semimajor,  2 * Math.PI, 0, true);
		this.ellipsePath.add(this.ellipse);
		this.ellipseGeometry = this.ellipsePath.createPointsGeometry(500);
		this.ellipseGeometry.computeTangents();
		this.line = new THREE.Line(this.ellipseGeometry, this.lineMaterial);
		this.perimeter = ramanujan(this.semimajor, this.semiminor);
		this.plane.add(this.line);
		
		// add the plane to the scene and rotate it according to its argument of periapsis and inclination
		this.planet.mesh.add(this.plane);
		this.plane.add(this.pivot);
		this.plane.add(this.mesh);
		this.plane.rotation.x = Math.PI/2+toRadians(this.inclination);
		this.mesh.rotation.x = -Math.PI/2; // rotate the planet mesh to face the Sun
		var self = this;
		
		// create the label for the object (an HTML element) and add it to the DOM
		$("body").append(this.label
			.addClass("object-label").html(this.name)
	//		.css("color", "#" + self.atmosphere.toString(16))
			.attr("id", this.name)
			.mouseover(function() {
				scene.setMouseHover($(this).html(), true);
			})
			.mouseout(function() {
				scene.setMouseHover($(this).html(), false); 
			})
			.click(function() {
				self.scene.setPerspective(self.name, function() {
					self.dialog = new DialogWindow("objectInfo", "some stuff about planets", self.name, self.planet.name);
				});
				$(this).hide();
			})
		);
	};
	
	SatelliteObject.prototype.getVectorPosition = function() {
		// assumes matrix world has been updated
		var vect = new THREE.Vector3();
		vect.setFromMatrixPosition(this.mesh.matrixWorld);
		
		return vect;
	};
	
	SatelliteObject.prototype.getVectorPosition2 = function(vect) {
		// assumes matrix world has been updated
		var vecto = new THREE.Vector3();
		vecto.setFromMatrixPosition(vect.matrixWorld);
		
		return vecto;
	};

	SatelliteObject.prototype.setPosition = function(timestamp) {
		// takes a UNIX timestamp and positions the object for that date with respect to the Sun
		var E = OrbitalDynamics.computeEccentricAnomaly(this.eccentricity, timestamp, this.lastPeriapsis, this.nextPeriapsis);
		var theta = OrbitalDynamics.getTheta(this.eccentricity, E);
		
		// get percent of ellipse travelled
		this.motion = theta / 360;
		this.updatePosition();
		//console.log(this.name + ": θ = " + theta + ", motion: " + this.motion);
	};
	
	SatelliteObject.prototype.updatePosition = function() {
		// find the magnitude of the vector of the orbiting object
		this.r = Math.sqrt((Math.pow(this.ellipsePath.getPoint(this.motion).x, 2) + Math.pow(this.ellipsePath.getPoint(this.motion).y, 2)));
		this.speed = Math.sqrt(Math.abs(this.GM*((2/this.r)-(1/this.semimajor))));
		
		// the motion will update every time unit with where the ellipse moves in terms of percent
		this.motion += this.scene.scaleSpeed((this.speed / this.perimeter), this.scene.getSpeedScale());
		this.motion = (this.motion > 1 ? 0 : this.motion);

		// update the info in the dialog window
		if(this.name == this.scene.getPerspective() && this.dialog != undefined)
			this.dialog.updateVelocityDistance(parseFloat(this.speed).toFixed(4), parseFloat(this.r).toFixed(4));
		
		// update the mesh sphere to the new point on the ellipse, depending on the velocity at the previous vector
		var newPoint = this.ellipsePath.getPoint(this.motion);
		var vect = new THREE.Vector3();
		
		vect.setFromMatrixPosition(this.pivot.matrix);
		
		// synchronize the movement of the pivot, mesh and camera target
		this.pivot.position.x = newPoint.x;
		this.pivot.position.y = newPoint.y;
		this.mesh.position = vect;
		
		// normalize the mesh w.r.t. the Sun (one side always faces the Sun)
		this.mesh.rotation.y = -this.motion*2*Math.PI;
		
		// if the label is hovered on, "light up" the orbital path
		if(this.scene.hoverLabel == this.name || this.scene.perspective == this.name)
			this.line.material.opacity = 1.0;
		else
			this.line.material.opacity = 0.4;
		
		// add rotation of planet
		// TBD: do this...
		this.scene.glScene.updateMatrixWorld();
		
		if(this.name == this.scene.getPerspective()) {
			vect = new THREE.Vector3();
			vect.setFromMatrixPosition(this.mesh.matrixWorld);
			
			this.scene.updateCameraFocus(vect);
		} else {
			// show the label if the object is visible on the screen (needs fixing)
			vect = render3Dto2D(this.getVectorPosition(), this.camera);
			
			if(vect != null && (this.planet.name == this.scene.getPerspective(true) || this.planet.name == this.scene.getPerspective()))
				this.label.show().offset({ top: vect.y, left: vect.x });
			else
				this.label.hide();
		}
	};
	
	return SatelliteObject;
});