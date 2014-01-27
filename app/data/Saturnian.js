var Saturn = {
	objectType: "Jovian",
	name: "Saturn",
	mass: 0.055,
	axialTilt: 26.73,
	semimajor: 1433449370,
	semiminor: 1431222154,
	radius: 58232,
	inclination: 5.51,
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
			name: "Titan",
			semimajor: 1221930,
			semiminor: 1221423,
			radius: 2575.5,
			inclination: 0.3485,
			texture: "Titan.jpg"
		},
		{
			name: "Tethys",
			radius: 531.0,
			semimajor: 294619,
			semiminor: 294618,
			inclination: 0.168,
			texture: "Tethys.jpg"
		}
	]
}