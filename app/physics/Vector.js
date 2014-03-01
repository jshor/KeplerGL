var Vectors = {
	magnitude: function(v) {
		if(v != undefined) {
			if(!isNaN(v.x) && !isNaN(v.y)) {
				var sum = Math.pow(v.x, 2) + Math.pow(v.y, 2);
				sum += (!isNaN(v.z) ? v.z : 0);
				
				return Math.sqrt(sum);
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	}
};