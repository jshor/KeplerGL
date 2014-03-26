define([
	"jquery",
	"jquery.datetimepicker"
],
function ($) {
	function DialogWindow(scene, type, html, title, relativeBody) {
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
		this.glowing = true;
		this.scene = scene;
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
			this.setDialogInfo(scene, type, html, title, relativeBody);
		} else if(type == "calendar") {
			this.setCalendar();
		}
		
		this.setDialogDimensions(type);
		this.dialogOverlay.fadeIn("slow");
		this.dialogUnderlay.fadeIn("slow");
		
		$(window).resize(function() {
			self.setDialogDimensions();
		});
	};
	
	DialogWindow.prototype.setCalendar = function() {
		// set the calendar to change the time/date...
		this.dialogInfo = $("<div></div>").css("margin", "auto");
		this.dialogTitle.html("Set time/date...");
		this.dialogOverlay.append(this.dialogTitle);
		this.dialogOverlay.append(this.dialogTitle);
		this.dialogOverlay.append(this.dialogInfo);
		var self = this;
		this.dialogInfo.datetimepicker({
			format: 'm/d/Y H:i',
			inline: true,
			lang: 'en',
			onChangeDateTime: function(dp, $input){
				self.scene.updateTime($input.val())
			}
		});
	};
	
	DialogWindow.prototype.setDialogInfo = function(scene, type, html, title, relativeBody) {
		var self = this;
		// if object is a planet or a satellite, use dialog to display its info
		this.dialogInfo = $("<div></div>").addClass("dialog-info");
		this.dialogInfo.html("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
		this.dialogInfo.append("</p><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
		this.dialogInfo.append("</p><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
		this.dialogInfo.append("</p><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
		this.dialogInfo.append("</p><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
		this.dialogTitle.html(title);
		this.dialogOverlay.append(this.dialogTitle);
		this.dialogOverlay.append(this.dialogInfo);
		
		// append real-time velocity and distance info
		this.velocity = $("<span></span>");
		this.distance = $("<span></span>");
		
		// menu link for perspectives
		this.destinationList = $("<div></div>");
		this.destinationList.mouseover(function() {
			$(this).stop().show();
		});
		this.destinationList.mouseout(function() {
			$(this).stop().hide();
		});
		this.destinationList.addClass("destination-list");
		this.destinationUL = $("<ul></ul>");
		this.destinationList.append(this.destinationUL);
		
		// populate list with celestial objects
		var objs = ["Mercury", "Jupiter", "Saturn", "Uranus", "Neptune"];
		
		for(var i=0; i<objs.length; i++) {
			var listItem = $("<li></li>");
			listItem.html(objs[i]);
			if(objs[i] == title) {
				listItem.addClass("grayed-out");
			} else {
				listItem.click(function() {
					scene.enterPerspectiveMode($(this).html(), title);
				});
			}
			this.destinationUL.append(listItem);
		}
		
		// menu link for perspectives
		this.perspectiveList = $("<span></span>");
		this.perspectiveList.addClass("perspective-list");
		this.perspectiveList.html("select a destination... &raquo;");
		this.perspectiveList.mouseover(function() {
			self.destinationList.stop(true).fadeIn("fast");
			self.destinationList.offset({
				top: (self.perspectiveList.offset().top-self.destinationList.height()),
				left: self.perspectiveList.offset().left,
			});
		});
		this.perspectiveList.mouseout(function() {
			self.destinationList.delay(800).stop(true).fadeOut("fast");
		});
		
		this.dialogOverlay.append("<br />");
		this.dialogOverlay.append("Velocity at position: ").append(this.velocity).append(" km/s");
		this.dialogOverlay.append("<br />");
		this.dialogOverlay.append("Distance from " + relativeBody + ": ").append(this.distance).append(" AU");
		this.dialogOverlay.append("<br />").append("<br />");
		this.dialogOverlay.append("From &#9791; " + title + ", look at: ");
		this.dialogOverlay.append(this.perspectiveList);
		this.dialogOverlay.append(this.destinationList);
	};
	
	DialogWindow.prototype.setDialogDimensions = function(type) {
		var dialogParams = this.scene.interfaceControls.getDialogBounds();
		if(type == "calendar")
			dialogParams.height = 300;
		
		this.dialogInfo.height(dialogParams.height-200);
		this.dialogOverlay.height(dialogParams.height);
		this.dialogUnderlay.height(dialogParams.height);
		this.dialogOverlay.offset({ top: dialogParams.topOffset });
		this.dialogUnderlay.offset({ top: dialogParams.topOffset });
	};

	DialogWindow.prototype.updateVelocityDistance = function(velocity, distance) {
		// update the velocity and distance in the dialog window
		this.velocity.html(parseFloat(velocity).toFixed(4));
		this.distance.html(parseFloat(distance).toFixed(4));
	};
	
	return DialogWindow;
});