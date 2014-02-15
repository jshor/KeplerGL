define([
	'jquery'
],
function($) {
	function Clock(scene) {
		this.currentDate = new Date();
		this.startDate = new Date();
		this.timeOffset = this.startDate.getTime();
		this.time = 0;
		this.scene = scene;
	}
	
	Clock.prototype.update = function() {
        var timeCurrent = new Date().getTime();
		var oldTime = this.time;
		
		this.time = Math.abs(timeCurrent - this.startDate.getTime()); // number of milliseconds since beginning of scene
		this.timeOffset += (this.time-oldTime)*this.scene.timeSpeedScale;
		this.currentDate.setTime(this.timeOffset);
	};
	
	Clock.prototype.resetTime = function() {
		this.timeOffset = this.currentDate.getTime();
	};
	
	Clock.prototype.offset = function() {
		return this.timeOffset;
	};
	
	Clock.prototype.getUXDate = function() {
		var monthName = ["January", "February", "March", "April", "May", "June", "July", "Augst", "September", "October", "November", "December"];
	
		var UXDate = monthName[this.currentDate.getMonth()] + " " 
			+ this.currentDate.getDate() + ", "
			+ this.currentDate.getFullYear() + " "
			+ (this.currentDate.getHours() < 10 ? "0" : "") + this.currentDate.getHours() + ":"
			+ (this.currentDate.getMinutes() < 10 ? "0" : "") + this.currentDate.getMinutes() + ":"
			+ (this.currentDate.getSeconds() < 10 ? "0" : "") + this.currentDate.getSeconds() + " "
			+ this.currentDate.getTimezoneOffset();
		
		return UXDate;
	};
	
	Clock.prototype.getTime = function() {
		return this.time+this.timeOffset;
	};
	
	return Clock;
});