define([
	"jquery",
	"jquery.nouislider.min"
],
function ($) {
	function Controls() {
	};
	
	Controls.prototype.setControls = function(scene) {
		this.lastZoomPosition = 0;
		this.scene = scene;
		
		// dom elements for scales (time speed and planet scale)
		var scales = $("<div></div>");
		this.timeScaleFactor = $("<sup></sup>");
		this.sizeScaleFactor = $("<sup></sup>");
		this.timeScaleFactor.html("0");
		this.timeScale = $("<div></div>");
		this.sizeScale = $("<div></div>");
		
		scales.addClass("scales");
		scales.append("Time speed: &times;10");
		scales.append(this.timeScaleFactor);
		scales.append('<br style="clear:both" />');
		scales.append(this.timeScale);
		scales.append('<br style="clear:both" />');
		scales.append("Planet scale: &times;10");
		scales.append(this.sizeScaleFactor);
		scales.append(this.sizeScale);
		scales.append('<br style="clear:both" />');
		
		var self = this;
		
		$(document).ready(function() {
			// append scales
			$("body").append(scales);
			
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
				range: [1,8],
				start: 1,
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
				range: [1,8],
				start: 1,
				step: 1,
				handles: 1,
				connect: "lower",
				orientation: "horizontal",
				serialization: {
					resolution: 1
				},
				slide: function() {
					scene.timeSpeedScale = Math.pow(10, $(this).val());
					$(self.timeScaleFactor).html(parseInt($(this).val()-1));
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
	
	return Controls;
});