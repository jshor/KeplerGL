var Saturn = {
	objectType: "Jovian",
	name: "Saturn",
	mass: 0.055,
	GM: 37931187,
	axialTilt: 26.73,
	semimajor: 1433449370,
	semiminor: 1431222154,
	radius: 58232,
	rotation: 15.0411, // in arcseconds
	inclination: 2.49,
	argPeriapsis: 336.013862,
	lastPeriapsis: 1056347581, // UNIX time
	nextPeriapsis: 1986336202, // UNIX time
	eccentricity: 0.055723219,
	longAscNode: 113.642811,
	texture: "Saturn.jpg",
	rings: [
		{
			innerRadius: 6630,
			outerRadius: 120700
		}
	],
	satellites: [
		{
			objectType: "Moon",
			name: "Titan",
			atmosphere: 0x948A7E,
			axialTilt: 0.1,
			semimajor: 1221930,
			semiminor: 1221423,
			radius: 2575.5,
			inclination: 0.3485,
	argPeriapsis: 275.066,
			lastPeriapsis: 1406689200,
			nextPeriapsis: 1406992500,
			eccentricity: 0.0101,
	longAscNode: 100.492
		},
		{
			objectType: "Moon",
			name: "Tethys",
			atmosphere: 0x948A7E,
			axialTilt: 0.1,
			semimajor: 294619,
			semiminor: 294618,
			radius: 531.0,
			inclination: 0.168,
	argPeriapsis: 275.066,
			lastPeriapsis: 1406689200,
			nextPeriapsis: 1406992500,
			eccentricity: 0.0101,
	longAscNode: 100.492
		}
	],
	atmosphere: 0x97893D
}