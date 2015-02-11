var Earth = {
	objectType: "Terrestrial",
	name: "Earth",
	info: "info about earth",
	mass: 0.055,
	GM: 6836529,
	axialTilt: 23.26,
	semimajor: 149598261,
	semiminor: 149556483,
	radius: 6378.0,
	rotation: 15.0411, // in arcseconds
	inclination: 1.57869,
	argPeriapsis: 114.20763,
	lastPeriapsis: 1136419200+3600*3, // UNIX time
	nextPeriapsis: 1167976800+3600*3, // UNIX time
	eccentricity: 0.01671123,
	longAscNode: 348.73936,
	texture: {
		bump: "Earth_bump.png",
		map: "Earth.jpg",
		specular: "Earth_spec.png"
	},
	satellites: [
		{
			objectType: "Moon",
			name: "Moon",
			info: "info about moon",
			atmosphere: 0x999966,
			axialTilt: 6.687,
			semimajor: 384399,
			semiminor: 383240,
			radius: 1737.1,
			inclination: 5.145,
			argPeriapsis: 0, // note: progressing by one revolution in 8.85 years
			lastPeriapsis: 1424331000,
			nextPeriapsis: 1426794000,
			eccentricity: 0.0549,
			texture: {
				map: "Moon.png",
			},
			longAscNode: 0 // note: regressing by one revolution in 18.6 years
		}
	],
	atmosphere: 0x0089BC
}