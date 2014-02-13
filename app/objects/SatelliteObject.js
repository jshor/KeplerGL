define([
	'jquery',
	'objects/Mesh',
	'physics/Astrodynamics',
	'interface/DialogWindow',
	'physics/Math',
	'physics/Vector'
], 
function ($, Mesh, Astrodynamics, DialogWindow) {
	function SatelliteObject(data, scene, planet) {
		// data
		this.name = data.name;
		this.mass = data.mass;
		this.nextPeriapsis = data.nextPeriapsis;
		this.lastPeriapsis = data.lastPeriapsis;
		this.GM = planet.GMass;
		this.planet = planet;
		this.semimajor = data.semimajor;
		this.semiminor = data.semiminor;
		this.radius = data.radius;
		this.inclination = data.inclination;
		this.eccentricity = data.eccentricity;
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
		this.GM = this.scene.toScale(this.GM); // gravitational constant of planet
		this.radius = this.scene.planetScale(this.radius);
		this.semimajor = this.scene.planetScale(this.semimajor);
		this.semiminor = this.scene.planetScale(this.semiminor);

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
		this.mesh = new Mesh(data, scene, this.orbitalPlane);

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
		this.planet.mesh.add(this.referencePlane);
		this.referencePlane.add(this.orbitalPlane);
		this.orbitalPlane.add(this.pivot);
		this.orbitalPlane.add(this.mesh.getObject());
		
		this.orbitalPlane.rotation.x = -Math.PI/2+Math2.toRadians(this.inclination);
		this.mesh.getObject().rotation.x = -Math.PI/2; // rotate the planet mesh to face the orbiting body
		
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
					self.dialog = new DialogWindow(self.scene, "objectInfo", "some stuff about planets", self.name, self.planet.name);
				});
				$(this).hide();
			})
		);
	};

	SatelliteObject.prototype.getVectorPosition = function() {
		// assumes matrix world has been updated
		var vect = new THREE.Vector3();
		vect.setFromMatrixPosition(this.mesh.getObject().matrixWorld);

		return vect;
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
		this.r = Vectors.magnitude(this.ellipsePath.getPoint(this.motion));
		this.velocity = OrbitalDynamics.orbitalEnergyConservation(this.GM, this.r, this.semimajor);
		
		// the motion will update every time unit with where the ellipse moves in terms of percent
		this.motion += (this.scene.scaleSpeed((this.velocity / this.perimeter), this.scene.getSpeedScale()));
		this.motion = (this.motion > 1 ? 0 : this.motion);

		// update the info in the dialog window
		if(this.name == this.scene.getView() && this.dialog != undefined)
			this.dialog.updateVelocityDistance(this.velocity, this.r);

		// update the mesh sphere to the new point on the ellipse, depending on the velocity at the previous vector
		var newPoint = this.ellipsePath.getPoint(this.motion);
		var vect = new THREE.Vector3();

		vect.setFromMatrixPosition(this.pivot.matrix);

		// synchronize the movement of the pivot, mesh and camera target
		this.pivot.position.x = newPoint.x;
		this.pivot.position.y = newPoint.y;
		this.mesh.getObject().position = vect;
		
		// normalize the mesh w.r.t. the Sun (one side always faces the Sun)
		this.mesh.getObject().rotation.y = this.motion*2*Math.PI;

		// if the label is hovered on, "light up" the orbital path
		if(this.scene.hoverLabel == this.name || this.scene.perspective == this.name)
			this.line.material.opacity = 1.0;
		else
			this.line.material.opacity = 0.4;

		// add rotation of satellite
		// TBD: do this...
		
		this.scene.glScene.updateMatrixWorld();

		if(this.name == this.scene.getView() && !this.scene.perspectiveMode) {
			this.scene.updateCameraFocus(this.getVectorPosition());
		} else {
			// show the label if the object is visible on the screen (needs fixing)
			vect = Math2.render3Dto2D(this.getVectorPosition(), this.camera);

			if(vect != null && (this.planet.name == this.scene.getView(true) || this.planet.name == this.scene.getView()))
				this.label.show().offset({ top: vect.y, left: vect.x });
			else
				this.label.hide();
		}
	};

	return SatelliteObject;
});