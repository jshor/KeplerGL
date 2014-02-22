define([
	"jquery",
	"interface/DialogWindow",
	"jquery.nouislider.min"
],
function ($, DialogWindow) {
	function Controls() {
	};
	
	Controls.prototype.setControls = function(scene) {
		var self = this;
		this.lastZoomPosition = 0;
		this.scene = scene;
		
		// DOM elements for the time reference and tour link
		this.info = $("<div></div>");
		this.dateTime = $("<div></div>");
		this.tourLink = $("<div></div>");
		
		this.dateTime.addClass("dateTime");
		this.tourLink.append($("<div></div>"));
		this.tourLink.append(" Explore a world");
		this.tourLink.addClass("tourLink");
		this.info.addClass("info");
		this.info.append(this.dateTime);
		this.info.append(this.tourLink);
		
		// create the calendar dialog for changing the date/time of the scene when clicked
		this.dateTime.click(function() {
			self.dialog = new DialogWindow(scene, "calendar", "", self.name, "Sun");
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
			
			// zoom scroll
			$("#zoomScroll").noUiSlider({
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
			
			$("#zoomScroll .noUi-handle").append($("<div></div>"));
			
			// planet scale slider 
			$(self.sizeScale).noUiSlider({
				range: [0,8],
				start: 0,
				handles: 1,
				step: 1,
				connect: "lower",
				orientation: "horizontal",
				serialization: {
					resolution: 1
				},
				slide: function() {
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
			$("#zoomScroll").show();
		else
			$("#zoomScroll").hide();
	};
	
	Controls.prototype.toggleTitle = function(show) {
		if(show && !$(".dialogWindow").is(':visible') && !$(".dialogUnderlay").is(':visible') && !this.scene.allowZoom)
			$("#objTitle").fadeIn("slow");
		else
			$("#objTitle").fadeOut("slow");
	};
	
	Controls.prototype.correctZoomScrollHeight = function() {
		$("#zoomScroll").height(window.innerHeight - 150);
	};
	
	Controls.prototype.setZoom = function(level) {
		$("#zoomScroll").val(level, true);
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