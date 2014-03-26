var OrbitalDynamics = {
	meanAnomaly: function(t, P) {
		// mean anomaly, in degrees (mod 1 for percentage)
		var meanAnom = t/P % 1 * 360;
		
		return meanAnom;
	},
	
	computeEccentricAnomaly: function(ecc, time, lastPeriapsis, nextPeriapsis) {
		// get eccentric anomaly as a function of time since periapsis, current time and eccentricity
		var E, F;
		var timePassed = (time - lastPeriapsis);
		var period = (nextPeriapsis - lastPeriapsis);
		var m = this.meanAnomaly(timePassed, period) / 360; // mean anomaly as a fn of time
		
		m = 2.0 * Math.PI*(m-Math.floor(m));
		E = (ecc < 0.8 ? m : Math.PI);
		F = E - ecc * Math.sin(m) - m;
		
		// numerical approximation for Kepler's second law
		for(var i=0; i<10; i++) {
			E = E - F / (1.0-ecc * Math.cos(E));
			F = E - ecc * Math.sin(E) - m;
		}
		
		return E;
	},
	
	getTheta: function(ecc, E) {
		// get angle from eccentricity and eccentric anomaly
		var min = Math.sqrt(1.0-ecc*ecc);
		var theta = Math.atan2(min*Math.sin(E), Math.cos(E)-ecc)/(Math.PI/180);
		
		return (theta < 0 ? 360+theta : theta);
	},
	
	orbitalEnergyConservation: function(GM, r, semimajor) {
		// approximation for Tsiolkolsky's rocket equation
		return Math.sqrt(Math.abs(GM*((2/r)-(1/semimajor))));
	},
	
	toAU: function(x, scale) {
		return x * scale * 6.68458712e-9;
	}
};