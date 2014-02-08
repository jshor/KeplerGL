define([
	"jquery"
],
function ($) {
	function DialogWindow(type, html, title, relativeBody) {
		// kill all previous dialog windows
		$(".dialogUnderlay").fadeOut("slow", function() {
			$(this).remove();
		});
		$(".dialogWindow").fadeOut("slow", function() {
			$(this).remove();
		});
		
		// create the DOM elements for the dialog window
		this.dialogOverlay = $("<div></div>");
		this.dialogUnderlay = $("<div></div>");
		this.dialogTitle = $("<div></div>");
		this.closeBtn = $("<span></span>");
		var self = this;
		
		// add dialog to the DOM
		$("body").append(this.dialogUnderlay);
		$("body").append(this.dialogOverlay);
		
		this.closeBtn.click(function() {
			self.dialogOverlay.fadeOut("normal");
			self.dialogUnderlay.fadeOut("normal");
		});
		
		this.closeBtn.addClass("closeDialog");
		this.closeBtn.html("&times;");
		
		this.dialogUnderlay.addClass("dialogUnderlay");
		this.dialogOverlay.append(this.closeBtn);
		this.dialogOverlay.addClass("dialogWindow");
		this.dialogTitle.addClass("heading");
		
		if(type == "objectInfo") {
			// if object is a planet or a satellite, use dialog to display its info
			this.dialogInfo = $("<p></p>");
			this.dialogInfo.html(html);
			this.dialogTitle.html(title);
			this.dialogOverlay.append(this.dialogTitle);
			this.dialogOverlay.append(this.dialogInfo);
			
			// append real-time velocity and distance info
			this.velocity = $("<span></span>");
			this.distance = $("<span></span>");
			
			this.dialogOverlay.append("<br />");
			this.dialogOverlay.append("Velocity at position: ").append(this.velocity).append(" km/s");
			this.dialogOverlay.append("<br />");
			this.dialogOverlay.append("Distance from " + relativeBody + ": ").append(this.distance).append(" AU");
		}
		
		this.dialogOverlay.fadeIn("slow");
		this.dialogUnderlay.fadeIn("slow");
	};

	DialogWindow.prototype.updateVelocityDistance = function(velocity, distance) {
		// update the velocity and distance in the dialog window
		this.velocity.html(velocity);
		this.distance.html(distance);
	};
	
	return DialogWindow;
});