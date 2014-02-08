define([
	"jquery"
],
function ($) {
	function Controls() {
	};
	
	Controls.prototype.setControls = function(scene) {
		this.lastZoomPosition = 0;
		this.scene = scene;
		
		$(document).ready(function() {
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
					$("#tourLink").html("sliding");
				},
			}).change(function() {
				scene.isZoomUpdating = false;
				$("#tourLink").html("done");
			});
			
			$("#zoomScroll .noUi-handle").append($("<div></div>"));
			
			// planet scale slider 
			$("#planetScale").noUiSlider({
				range: [0,8],
				start: 127,
				handles: 1,
				connect: "lower",
				orientation: "horizontal",
				serialization: {
					resolution: 1
				},
				slide: function() {
					scene.explore("Mercury");
				}
			});
			$("#planetScale .noUi-handle").append($("<div></div>"));
			
			// speed scale slider
			$("#speedScale").noUiSlider({
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
					$("#timeSpeed").html(parseInt($(this).val()-1));
				}
			});
			$("#speedScale .noUi-handle").append($("<div></div>"));

			
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