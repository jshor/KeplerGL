define([
	'jquery'
],
function($) {
	function Clock(scene) {
		this.sceneCurrentDate = new Date();
		this.startDate = new Date();
		this.timeOffset = this.startDate.getTime();
		this.time = 0;
		this.scene = scene;
	}
	
	Clock.prototype.setTime = function(t) {
		this.startDate = new Date(t);
		this.sceneCurrentDate = new Date(t);
		this.timeOffset = this.sceneCurrentDate.getTime();
	};
	
	Clock.prototype.update = function() {
        var timeCurrent = new Date().getTime();
		var oldTime = this.time;
		
		this.time = (timeCurrent - this.startDate.getTime()); // number of milliseconds since beginning of scene (can be negative)
		this.timeOffset += (this.time-oldTime)*this.scene.timeSpeedScale;
		this.sceneCurrentDate.setTime(this.timeOffset);
	};
	
	Clock.prototype.resetTime = function() {
		this.timeOffset = this.sceneCurrentDate.getTime();
	};
	
	Clock.prototype.offset = function() {
		return this.timeOffset;
	};
	
	Clock.prototype.getUXDate = function() {
		var monthName = ["January", "February", "March", "April", "May", "June", "July", "Augst", "September", "October", "November", "December"];
	
		var UXDate = monthName[this.sceneCurrentDate.getMonth()] + " " 
			+ this.sceneCurrentDate.getDate() + ", "
			+ this.sceneCurrentDate.getFullYear() + " "
			+ (this.sceneCurrentDate.getHours() < 10 ? "0" : "") + this.sceneCurrentDate.getHours() + ":"
			+ (this.sceneCurrentDate.getMinutes() < 10 ? "0" : "") + this.sceneCurrentDate.getMinutes() + ":"
			+ (this.sceneCurrentDate.getSeconds() < 10 ? "0" : "") + this.sceneCurrentDate.getSeconds() + " "
			+ this.sceneCurrentDate.getTimezoneOffset();
		
		return UXDate;
	};
	
	Clock.prototype.getTime = function() {
		return this.time+this.timeOffset;
	};
	
	return Clock;
});