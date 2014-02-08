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

	function HeliocentricObject(data, scene) {
		this.name = data.name;
		this.mass = data.mass;
		this.radius = data.radius;
		this.semimajor = data.semimajor;
		this.semiminor = data.semiminor;
		this.inclination = data.inclination;
		this.argPeriapsis = data.argPeriapsis;
		this.longAscNode = data.longAscNode;
		this.eccentricity = data.eccentricity;
		this.lastPeriapsis = data.lastPeriapsis;
		this.nextPeriapsis = data.nextPeriapsis;

		// stage objects
		this.scene = scene;
		this.controls = scene.interfaceControls;
		this.camera	= scene.camera;
		
		// materials
		this.material = new THREE.MeshPhongMaterial({
			map:         THREE.ImageUtils.loadTexture('app/textures/' + this.name + '.png'),
			bumpMap:     THREE.ImageUtils.loadTexture('app/textures/' + this.name + '_bump.jpg'),
			bumpScale:   0.00000005, // make it to planet scale 
			specularMap: THREE.ImageUtils.loadTexture('app/textures/' + this.name + '_spec.png'),
			specular:    new THREE.Color('gray')
		});
		this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, opacity:0.4, transparent: true});
		this.label = $("<span></span>");
		this.motion = 0;
		
		// scale all objects down to save rendering precision
		this.GM = this.scene.toScale(132712440018); // gravitational constant of the Sun
		this.radius = this.scene.planetScale(this.radius);
		this.semimajor = this.scene.toScale(this.semimajor);
		this.semiminor = this.scene.toScale(this.semiminor);
		
		// add a sphere, mesh and ellipse path
		this.geometry = new THREE.SphereGeometry(this.radius, 32, 32);
		
		/* there are three 3D objects to add:
			- reference plane: responsible for rotating long. of asc. node, big omega, about y-axis.
			- plane: the plane which the pivot point is on
				- rotates: arg. of periapsis, little omega, about y-axis
				- rotates: angle of inclination i plus Pi/2, about the x-axis
			- pivot: the point that the mesh must update its position to (but does not sit on)
			- mesh: the spherical object that holds the texture and atmosphere
		*/
		this.referencePlane = new THREE.Object3D();
		this.plane = new THREE.Object3D();
		this.pivot = new THREE.Object3D();
		this.mesh = new Mesh(data, this.scene, this.plane);
		
		// draw the ellipse and its path
		this.focus = Math.sqrt(Math.pow(this.semimajor, 2) - Math.pow(this.semiminor, 2));
		this.ellipsePath = new THREE.CurvePath();
		this.cameraPivot = new THREE.Object3D();
		
		// create geometry for the ellipse and its visible path 
		this.ellipse = new THREE.EllipseCurve(0, this.focus, this.semiminor, this.semimajor, -Math.PI/2, 3*Math.PI/2, false);
		this.ellipsePath.add(this.ellipse);
		this.ellipseGeometry = this.ellipsePath.createPointsGeometry(500);
		this.ellipseGeometry.computeTangents();
		this.line = new THREE.Line(this.ellipseGeometry, this.lineMaterial);
		this.perimeter = ramanujan(this.semimajor, this.semiminor);
		this.plane.add(this.line);
		
		// add the plane to the scene and rotate it according to its argument of periapsis and inclination
		this.scene.add(this.referencePlane);
		this.referencePlane.add(this.plane);
		
		
		var dir = new THREE.Vector3( 1, 0, 0 );
		var origin = new THREE.Vector3( 0, 0, 0 );
		var length = 1;
		var hex = 0xffff00;

		var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
		
		//this.referencePlane.add(arrowHelper );
		this.plane.add(this.pivot);
		this.plane.add(this.mesh);
		
		// rotate the plane according to the angle of inclination and the longitude of its ascending node
		this.referencePlane.rotation.x = -Math.PI/2;
		this.referencePlane.rotation.z = toRadians(this.longAscNode);
	
		this.plane.rotation.x = toRadians(this.inclination);
		this.plane.rotation.z += toRadians(this.argPeriapsis);
		var self = this;
		
		// create the label for the object (an HTML element) and add it to the DOM
		$("body").append(this.label
			.addClass("object-label").html(this.name)
			.attr("id", this.name)
			.mouseover(function() {
				scene.setMouseHover($(this).html(), true);
			})
			.mouseout(function() {
				scene.setMouseHover($(this).html(), false); 
			})
			.click(function() {
				self.scene.setPerspective(self.name, function() {
					self.dialog = new DialogWindow("objectInfo", "some stuff about planets", self.name, "Sun");
				});
				$(this).hide();
			})
		);
	};

	HeliocentricObject.prototype.getVectorPosition = function() {
		// assumes matrix world has been updated
		var vect = new THREE.Vector3();
		vect.setFromMatrixPosition(this.mesh.matrixWorld);
		
		return vect;
	};
	
	HeliocentricObject.prototype.focusOn = function(camera) {
		// add a satellite object to its orbit
		this.mesh.add(camera);
		
		// Sun rays must refocus to look at the camera
		this.scene.refocus(camera);
	};

	HeliocentricObject.prototype.setPosition = function(timestamp) {
		// takes a UNIX timestamp and positions the object for that date with respect to the Sun
		var E = OrbitalDynamics.computeEccentricAnomaly(this.eccentricity, timestamp, this.lastPeriapsis, this.nextPeriapsis);
		var theta = OrbitalDynamics.getTheta(this.eccentricity, E);
		
		// get percent of ellipse travelled
		this.motion = theta / 360;
		this.updatePosition();
		//console.log(this.name + ": θ = " + theta + ", motion: " + this.motion);
	};
	
	HeliocentricObject.prototype.updatePosition = function() {
		// find the magnitude of the vector of the orbiting object
		this.r = Math.sqrt((Math.pow(this.ellipsePath.getPoint(this.motion).x, 2) + Math.pow(this.ellipsePath.getPoint(this.motion).y, 2)));
		this.speed = Math.sqrt(Math.abs(this.GM*((2/this.r)-(1/this.semimajor))));
		
		// the motion will update every time unit with where the ellipse moves in terms of percent
		this.motion+= (this.scene.scaleSpeed((this.speed / this.perimeter), this.scene.getSpeedScale()));
		this.motion = (this.motion > 1 ? 0 : this.motion);

		// update the info in the dialog window
		if(this.name == this.scene.getPerspective() && this.dialog != undefined)
			this.dialog.updateVelocityDistance(parseFloat(this.speed).toFixed(4), parseFloat(this.r).toFixed(4));
		
		// update the mesh sphere to the new point on the ellipse, depending on the velocity at the previous vector
		var newPoint = this.ellipsePath.getPoint(this.motion);
		var vect = new THREE.Vector3();
		var uvVec = render3Dto2D(this.getVectorPosition(), this.camera);
		
		vect.setFromMatrixPosition(this.pivot.matrix);
		
		// synchronize the movement of the pivot and mesh
		this.pivot.position.x = newPoint.x;
		this.pivot.position.y = newPoint.y;
		this.mesh.position = vect;
		
		// normalize the mesh w.r.t. the Sun (one side faces the Sun)
		this.mesh.rotation.y = this.motion*2*Math.PI;
		
		// if the label is hovered on, "light up" the orbital path
		if(this.scene.hoverLabel == this.name || this.scene.perspective == this.name)
			this.line.material.opacity = 1.0;
		else
			this.line.material.opacity = 0.4;

		/* add rotation of planet */
		// TBD: do this...
		this.scene.glScene.updateMatrixWorld();
		
		if(this.name == this.scene.getPerspective()) {
			vect = new THREE.Vector3();
			vect.setFromMatrixPosition(this.pivot.matrixWorld);
			
			this.scene.updateCameraFocus(vect);
		} else {
			// show the label if the object is visible on the screen
			vect = render3Dto2D(this.getVectorPosition(), this.camera);
			
			if(vect != null && this.scene.perspective != this.name)
				this.label.show().offset({ top: vect.y, left: vect.x });
			else
				this.label.hide();
		}
	};
	
	return HeliocentricObject;
});