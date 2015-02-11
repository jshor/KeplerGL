define([
	'jquery',
	'objects/Mesh',
	'interface/DialogWindow',
	'physics/Astrodynamics',
	'physics/Math',
	'physics/Vector'
], 
function ($, Mesh, DialogWindow, Astrodynamics) {
	function HeliocentricObject(data, scene) {
		// data
		this.name = data.name;
		this.radius = data.radius;
		this.semimajor = data.semimajor;
		this.semiminor = data.semiminor;
		this.inclination = data.inclination;
		this.argPeriapsis = data.argPeriapsis;
		this.longAscNode = data.longAscNode;
		this.eccentricity = data.eccentricity;
		this.lastPeriapsis = data.lastPeriapsis;
		this.nextPeriapsis = data.nextPeriapsis;
		this.GMass = data.GM;
		this.atmosphere = (data.atmosphere != undefined ? data.atmosphere : 0xFFFFFF);

		// stage objects
		this.scene = scene;
		this.controls = scene.interfaceControls;
		this.camera	= scene.camera;
		
		// materials
		this.lineMaterial = new THREE.LineBasicMaterial({
			color: this.atmosphere,
			opacity: 0.4,
			transparent: true
		});
		this.label = $("<span></span>");
		this.motion = 0;
		
		// scale all objects down to save rendering precision
		this.GM = this.scene.toScale(132712440018); // gravitational constant of the Sun
		this.radius = this.scene.planetScale(this.radius);
		this.semimajor = this.scene.toScale(this.semimajor);
		this.semiminor = this.scene.toScale(this.semiminor);
		
		/* there are four 3D objects to add:
			- referencePlane: responsible for rotating long. of asc. node, big omega, about y-axis; orthogonal to solar rotational axis
			- orbitalPlane: the plane which the pivot point is on
				- rotates: arg. of periapsis, little omega, about y-axis
				- rotates: angle of inclination i plus Pi/2, about the x-axis
			- pivot: the point that the mesh must update its position to (but does not lie on)
			- mesh: Mesh() object, which is the mesh of the object
		*/
		this.referencePlane = new THREE.Object3D();
		this.orbitalPlane = new THREE.Object3D();
		this.pivot = new THREE.Object3D();
		this.mesh = new Mesh(data, this.scene, this.orbitalPlane);
		
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
		this.perimeter = Math2.ramanujan(this.semimajor, this.semiminor);
		
		// add the plane to the scene and rotate it according to its argument of periapsis and inclination
		this.orbitalPlane.add(this.line);
		this.scene.add(this.referencePlane);
		this.referencePlane.add(this.orbitalPlane);
		this.orbitalPlane.add(this.pivot);
		this.orbitalPlane.add(this.mesh.getObject());
		
		// rotate the plane according to the angle of inclination and the longitude of its ascending node
		this.referencePlane.rotation.x = -Math.PI/2;
		this.referencePlane.rotation.z = Math.PI/2+Math2.toRadians(this.longAscNode);
	
		this.orbitalPlane.rotation.x = Math2.toRadians(this.inclination);
		this.orbitalPlane.rotation.z = Math.PI/2+Math2.toRadians(this.argPeriapsis);
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
				// show the dialog window when the label is clicked
				self.scene.setView(self.name, function() {
					self.scene.dialog = new DialogWindow(self.scene, "objectInfo", self.info, self.name, "Sun");
					self.scene.controls.minDistance = self.radius+1;
				});
				$(this).hide();
			})
		);
	};

	HeliocentricObject.prototype.getVectorPosition = function() {
		// assumes matrix world has been updated first
		var vect = new THREE.Vector3();
		vect.setFromMatrixPosition(this.mesh.getObject().matrixWorld);
		
		return vect;
	};
	
	HeliocentricObject.prototype.updatePosition = function(timestamp) {
		// takes a UNIX timestamp and positions the object for that date w.r.t. the Sun
		var E = OrbitalDynamics.computeEccentricAnomaly(this.eccentricity, timestamp, this.lastPeriapsis, this.nextPeriapsis);
		var theta = OrbitalDynamics.getTheta(this.eccentricity, E);

		// get percent of ellipse travelled
		this.motion = theta / 360;
		this.motion = (this.motion > 1 || isNaN(this.motion) ? 0 : this.motion);
		
		// update the mesh sphere to the new point on the ellipse, depending on the velocity at the previous vector
		var newPoint = this.ellipsePath.getPoint(this.motion);
		var vect = new THREE.Vector3();
		var r = Vectors.magnitude(newPoint);
		var velocity = OrbitalDynamics.orbitalEnergyConservation(this.GM, r, this.semimajor);
		
		vect.setFromMatrixPosition(this.pivot.matrix);
		
		// update the info in the dialog window
		if(this.name == this.scene.getView() && this.scene.dialog != undefined)
			this.scene.dialog.updateVelocityDistance(velocity, OrbitalDynamics.toAU(r, this.scene.getScaleConstant()));
			
		// synchronize the movement of the pivot and mesh
		this.pivot.position.x = newPoint.x;
		this.pivot.position.y = newPoint.y;
		this.mesh.getObject().position = vect;
		
		// update the size of the mesh
		this.mesh.updateScale(this.scene.planetSizeScale);
		
		// normalize the mesh w.r.t. the Sun (one side always faces the Sun)
		this.mesh.getObject().rotation.y = this.motion*2*Math.PI;
		
		// if the label is hovered on, "light up" the orbital path
		if(this.scene.hoverLabel == this.name || this.scene.getView() == this.name)
			this.line.material.opacity = 1.0;
		else
			this.line.material.opacity = 0.4;

		// add rotation of planet
		this.mesh.rotate(timestamp);
		this.scene.glScene.updateMatrixWorld();
		
		if(this.name == this.scene.getView() && !this.scene.perspectiveMode) {
			// if the camera is in view mode on this object, update its position
			this.scene.updateCameraFocus(this.getVectorPosition());
		} else if(this.name == this.scene.getObserver()) {
			// if the camera is focused on this object and in view mode, update its position
			this.scene.updateCameraPosition(this.getVectorPosition());
		} else if(this.name == this.scene.getLookAt()) {
			// if the camera is looking at this object and in view mode, update its lookAt
			this.scene.updateCameraLookAt(this.getVectorPosition());
		} else {
			// show the label if the object is visible on the screen
			vect = Math2.render3Dto2D(this.getVectorPosition(), this.camera);
			
			// position the label according to the 3D-2D coords translation
			if(vect != null && this.scene.getView() != this.name)
				this.label.show().offset({ top: vect.y, left: vect.x });
			else
				this.label.hide();
		}
		
		// if the planet is in perspective mode, make it invisible
		if(this.scene.getObserver() == this.name && this.scene.perspectiveMode)
			this.mesh.visible(false);
		else
			this.mesh.visible(true);
	};
	
	return HeliocentricObject;
});