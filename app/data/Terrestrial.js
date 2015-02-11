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
			atmosphere: 0x948A7E,
			axialTilt: 0.1,
			semimajor: 7217,
			semiminor: 7216,
			radius: 1565,
			inclination: 51.65,
			argPeriapsis: 0,
			lastPeriapsis: 1136853779,
			nextPeriapsis: 1136851334,
			eccentricity: 0.0101,
			longAscNode: 0
		}
	],
	atmosphere: 0x0089BC
}