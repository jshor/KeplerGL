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
			name: "Dione",
			atmosphere: 0x7C7968,
			axialTilt: 0.00,
			semimajor: 378161.813,
			semiminor: 378161.789,
			radius: 561.4,
			inclination: 28.017,
			argPeriapsis: 258.518,
			lastPeriapsis: 1407444960,
			nextPeriapsis: 1407678660,
			eccentricity: 0.0101,
			longAscNode: 169.551,
			texture: {
				map: "Dione.jpg"
			}
		},
		{
			objectType: "Moon",
			name: "Titan",
			atmosphere: 0xFDD24F,
			axialTilt: 0.00,
			semimajor: 1221623.27,
			semiminor: 1221120.05,
			radius: 2576.0,
			inclination: 27.703,
			argPeriapsis: 172.098,
			lastPeriapsis: 1407656460,
			nextPeriapsis: 1409034300,
			eccentricity: 0.0287,
			longAscNode: 169.136,
			texture: {
				map: "Titan.jpg"
			}
		},
		{
			objectType: "Moon",
			name: "Tethys",
			atmosphere: 0xC7B19A,
			axialTilt: 0.00,
			semimajor: 294310.415,
			semiminor: 294310.374,
			radius: 531.1,
			inclination: 2.761569226349059E+01,
			argPeriapsis: 1.477911220670605E+02,
			lastPeriapsis: 1407029640,
			nextPeriapsis: 1407216480,
			eccentricity: 5.271845040709983E-04,
			longAscNode: 1.673788724570120E+02,
			texture: {
				map: "Tethys.jpg"
			}
		},
		{
			objectType: "Moon",
			name: "Enceladus",
			atmosphere: 0x808080,
			axialTilt: 0.00,
			semimajor: 238420.425,
			semiminor: 237299.849,
			radius: 252.1,
			inclination: 2.804034648799505E+01,
			argPeriapsis: 1.642129238990283E+02,
			lastPeriapsis: 1416698700,
			nextPeriapsis: 1416817140,
			eccentricity: 0.0047,
			longAscNode: 1.695125025409750E+02,
			texture: {
				map: "Enceladus.jpg"
			}
		},
		{
			objectType: "Moon",
			name: "Mimas",
			atmosphere: 0xC0C0C0,
			axialTilt: 0.00,
			semimajor: 186032.598,
			semiminor: 185947.866,
			radius: 198.2,
			inclination: 2.799851647365471E+01,
			argPeriapsis: 1.445340638393475E+02,
			lastPeriapsis: 1416809160,
			nextPeriapsis: 1416890760,
			eccentricity: 2.134176888063347E-02,
			longAscNode: 1.728655888912200E+02,
			texture: {
				map: "Mimas.jpg"
			}
		},
		{
			objectType: "Moon",
			name: "Iapetus",
			atmosphere: 0x45402A,
			axialTilt: 0.00,
			semimajor: 3564936.72,
			semiminor: 3561826.506,
			radius: 734.5,
			inclination: 1.708739088112213E+01,
			argPeriapsis: 2.317682317771272E+02,
			lastPeriapsis: 1395164760,
			nextPeriapsis: 1402018440,
			eccentricity: 2.953719152844289E-02,
			longAscNode: 1.391084672763423E+02,
			texture: {
				map: "Iapetus.jpg"
			}
		},
		{
			objectType: "Moon",
			name: "Rhea",
			atmosphere: 0xE8E8E8,
			axialTilt: 0.00,
			semimajor: 527212.528,
			semiminor: 527212.0115,
			radius: 763.8,
			inclination: 2.770506780444135E+01,
			argPeriapsis: 1.695980117390074E+02,
			lastPeriapsis: 1415276220,
			nextPeriapsis: 1415663760,
			eccentricity: 9.898267554733495E-04,
			longAscNode: 1.697266419850345E+02,
			texture: {
				map: "Rhea.jpg"
			}
		}
	],
	atmosphere: 0x97893D
}