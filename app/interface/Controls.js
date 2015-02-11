define([
	"jquery",
	"interface/DialogWindow",
	"interface/Tour",
	"jquery.nouislider.min"
],
function ($, DialogWindow, Tour) {
	function Controls() {
	};
	
	Controls.prototype.setControls = function(scene) {
		var self = this;
		this.lastZoomPosition = 0;
		this.scene = scene;
		this.soundOn = true;
		
		// DOM elements for the time reference and tour link
		this.info = $("<div></div>");
		this.dateTime = $("<div></div>");
		this.tourLink = $("<div></div>");
		this.zoomScroll = $("<div></div>");
		this.userTip = $("<div></div>");
		this.helpToggle = $("<a></a>");
		this.soundToggle = $("<a></a>");
		
		this.dateTime.addClass("dateTime");
		this.tourLink.append($("<div></div>"));
		this.tourLink.append(" Explore a world");
		this.tourLink.addClass("tourLink");
		
		// show the "explore a world" tour window on user request
		this.tourLink.click(function() {
			self.dialog = new Tour(scene);
			// self.tour.showTour(self);
		});
		
		this.info.addClass("info");
		this.info.append(this.dateTime);
		this.info.append(this.tourLink);
		
		this.zoomScroll.attr("id", "zoomScroll");
		this.soundToggle.attr("id", "soundToggle");
		this.soundToggle.addClass("sound-on");
		this.helpToggle.attr("id", "helpToggle");
		
		// create the calendar dialog for changing the date/time of the scene when clicked
		this.dateTime.click(function() {
			self.dialog = new DialogWindow(scene, "calendar", "", self.name, "Sun", 310);
		});
		
		// DOM elements for scales (time speed and planet scale)
		this.scales = $("<div></div>");
		this.timeScaleFactor = $("<sup></sup>");
		this.sizeScaleFactor = $("<sup></sup>");
		this.timeScaleFactor.html("0");
		this.timeScale = $("<div></div>");
		this.sizeScale = $("<div></div>");
		
		this.scales.addClass("scales");
		this.scales.append("Time speed: &times;10");
		this.scales.append(this.timeScaleFactor);
		this.scales.append('<br style="clear:both" />');
		this.scales.append(this.timeScale);
		this.scales.append('<br style="clear:both" />');
		this.scales.append("Planet scale: &times;10");
		this.scales.append(this.sizeScaleFactor);
		this.scales.append(this.sizeScale);
		this.scales.append('<br style="clear:both" />');
		
		$(document).ready(function() {
			// append generated DOM elements
			$("body").append(self.scales);
			$("body").append(self.info);
			$("body").append(self.userTip);
			$("#controls").append(self.helpToggle);
			$("#controls").append(self.zoomScroll);
			$("#controls").append(self.soundToggle);
			
			// zoom scroll
			$(self.zoomScroll).noUiSlider({
				range: [0,100],
				start: 0,
				handles: 1,
				connect: "lower",
				orientation: "vertical",
				serialization: {
					resolution: 1
				},
				slide: function() {
					scene.isZoomUpdating = true;
					scene.changeZoom($(this).val());
				},
			}).change(function() {
				scene.isZoomUpdating = false;
			});
			$(self.zoomScroll).find(".noUi-handle").append($("<div></div>"));
			
			// planet scale slider 
			$(self.sizeScale).noUiSlider({
				range: [1,100],
				start: 1,
				handles: 1,
				connect: "lower",
				orientation: "horizontal",
				serialization: {
					resolution: 1
				},
				slide: function() {
					scene.planetSizeScale = $(this).val();
					self.sizeScaleFactor.html($(this).val());
				}
			});
			$(self.sizeScale).find(".noUi-handle").append($("<div></div>"));
			
			// speed scale slider
			$(self.timeScale).noUiSlider({
				range: [0,8],
				start: 0,
				step: 1,
				handles: 1,
				connect: "lower",
				orientation: "horizontal",
				serialization: {
					resolution: 1
				},
				slide: function() {
					scene.clock.resetTime();
					scene.timeSpeedScale = Math.pow(10, $(this).val());
					self.timeScaleFactor.html($(this).val());
				}
			});
			$(self.timeScale).find(".noUi-handle").append($("<div></div>"));

			// click events for sound toggle and information
			$(self.helpToggle).click(function() {
				alert('to be implemented');
			});
			$(self.soundToggle).click(function() {
				if(self.soundOn) {
				//	alert('sound on');
					self.soundOn = false;
					$(this).toggleClass("sound-off", "sound-on");
				} else {
				//	alert('sound off');
					self.soundOn = true;
					$(this).toggleClass("sound-on", "sound-off");
				}
				self.soundOn = (self.soundOn ? false : true);
			});
			
			$("#tourLink").click(function() {
				$("#dialogWindow").fadeIn("normal");	
				$("#dialogUnderlay").fadeIn("normal");	
				$("#objTitle").fadeOut("normal");	
			});
			
			$("#objTitle").click(function() {
				$(this).fadeOut("normal");	
				$(".dialogWindow").fadeIn("slow");
				$(".dialogUnderlay").fadeIn("slow");
			});
		});
	};
	
	Controls.prototype.toggleZoomScroll = function(visibility) {
		if(visibility)
			this.zoomScroll.show();
		else
			this.zoomScroll.hide();
	};
	
	Controls.prototype.setTip = function(tip) {
		if(tip != undefined)
			this.userTip.html(tip);
		else
			this.userTip.html("");
	};
	
	Controls.prototype.toggleTitle = function(show) {
		if(show && !$(".dialogWindow").is(':visible') && !$(".dialogUnderlay").is(':visible') && !this.scene.allowZoom)
			$("#objTitle").fadeIn("slow");
		else
			$("#objTitle").fadeOut("slow");
	};
	
	Controls.prototype.setTitle = function(title) {
		$("#objTitle").html(title);
	};
	
	Controls.prototype.correctZoomScrollHeight = function() {
		this.zoomScroll.height(window.innerHeight - 150);
	};
	
	Controls.prototype.setZoom = function(level) {
		this.zoomScroll.val(level, true);
	};
	
	Controls.prototype.updateDate = function(time) {
		this.dateTime.html(time);
	};
	
	Controls.prototype.getDialogBounds = function() {
		// returns the bounds that a dialog window should abide by
		var topOffset = this.info.height()+this.info.offset().top+30;
		var height = (this.scales.offset().top-this.info.height()+this.info.offset().top-80);
		
		return {
			topOffset: topOffset,
			height: height
		};
	};
	
	return Controls;
});