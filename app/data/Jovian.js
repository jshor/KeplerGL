var Jupiter = {
	objectType: "Jovian",
	name: "Jupiter",
	mass: 0.055,
	GM: 126686534,
	axialTilt: 3.13,
	semimajor: 778547200,
	semiminor: 777620566,
	radius: 69911,
	rotation: 15.0411, // in arcseconds
	inclination: 1.31,
	argPeriapsis: 275.066,
	lastPeriapsis: 1300492800, // UNIX time
	nextPeriapsis: 1674828800, // UNIX time
	eccentricity: 0.048775,
	longAscNode: 100.492,
	texture: {
		map: "Jupiter.jpg"
	},
	satellites: [
		{
			objectType: "Moon",
			name: "Europa",
			atmosphere: 0x948A7E,
			axialTilt: 0.1,
			semimajor: 671079,
			semiminor: 671010,
			radius: 1565,
			inclination: 0.464,
			argPeriapsis: 5.718926517499346E+01,
			lastPeriapsis: 1136437860,
			nextPeriapsis: 1136486160,
			eccentricity: 0.0101,
			longAscNode: 3.487875720612225E+02,
			texture: {
				map: "Europa.jpg"
			}
		},
		{
			objectType: "Moon",
			name: "Ganymede",
			atmosphere: 0x7F7F7F,
			axialTilt: 0.33,
			semimajor: 1070412,
			semiminor: 1070410,
			radius: 2634.1,
			inclination: 0.204,
			argPeriapsis: 3.055548024810087E+02,
			lastPeriapsis: 1136341380,
			nextPeriapsis: 1137201240,
			eccentricity: 0.0011,
			longAscNode: 3.421450259947836E+02,
			texture: {
				map: "Ganymede.jpg"
			}
		},
		{
			objectType: "Moon",
			name: "Callisto",
			atmosphere: 0x463722,
			axialTilt: 0,
			semimajor: 1882709,
			semiminor: 1882605,
			radius: 2410.3,
			inclination: 0.204,
			argPeriapsis: 1.910576843073536E+01,
			lastPeriapsis: 1136710800,
			nextPeriapsis: 1138161600,
			eccentricity: 0.0074,
			longAscNode: 3.375938901353522E+02,
			texture: {
				map: "Callisto.jpg"
			}
		},
		{
			objectType: "Moon",
			name: "Io",
			atmosphere: 0xA08A59,
			radius: 3637.4,
			axialTilt: 0,
			semimajor: 421700,
			semiminor: 421692,
			radius: 13642.66,
			inclination: 0.05,
			argPeriapsis: 2.502432229764357E+02,
			lastPeriapsis: 1136183760,
			nextPeriapsis: 1136336100,
			eccentricity: 0.0041,
			longAscNode: 3.378889108567996E+02,
			texture: {
				map: "Io.jpg"
			}
		}
	],
	atmosphere: 0x988774
}