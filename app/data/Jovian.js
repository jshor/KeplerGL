var Jupiter = {
	objectType: "Jovian",
	name: "Jupiter",
	mass: 0.055,
	GM: 126686534,
	axialTilt: 3.13,
	semimajor: 778547200,
	semiminor: 777620566,
	radius: 69911,
	inclination: 1.31,
	argPeriapsis: 275.066,
	lastPeriapsis: 1300492800, // UNIX time
	nextPeriapsis: 1674828800, // UNIX time
	eccentricity: 0.048775,
	longAscNode: 100.492,
	texture: "Jupiter.jpg",
	rings: [
		{
			innerRadius: 6630,
			outerRadius: 120700
		}
	],
	satellites: [
		{
			name: "Io",
			radius: 0.055,
			semimajor: 579091,
			semiminor: 579091,
			radius: 13642.66,
			inclination: 0.05,
			argPeriapsis: 286.537,
			longAscNode: 49.562,
			texture: "Jupiter.jpg"
		}
	]
}