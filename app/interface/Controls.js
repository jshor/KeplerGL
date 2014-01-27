define([
	"jquery"
],
function ($) {
	function Controls() {
	};
	
	Controls.prototype.setControls = function(scene) {
		$(document).ready(function() {
			/* zoom scroll */
			$("#zoomScroll").noUiSlider({
				range: [-1,100],
				start: 100,
				handles: 1,
				connect: "lower",
				orientation: "vertical",
				serialization: {
					resolution: 1
				},
				slide: function() {
					scene.changeZoom($(this).val());
				},
			});
			
			$("#zoomScroll .noUi-handle").append($("<div></div>"));
			
			/* planet scale slider */
			$("#planetScale").noUiSlider({
				range: [0,255],
				start: 127,
				handles: 1,
				connect: "lower",
				orientation: "horizontal",
				serialization: {
					resolution: 1
				}
			});
			$("#planetScale .noUi-handle").append($("<div></div>"));
			
			/* speed scale slider */
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
			
			/* close the dialog box */
			$("#closeDialog").click(function() {
				$("#dialogWindow").fadeOut("normal");
				$("#dialogUnderlay").fadeOut("normal");	
			});
			
			$("#info").click(function() {
				$("#dialogWindow").fadeIn("normal");	
				$("#dialogUnderlay").fadeIn("normal");	
			});
		});
	};
	
	Controls.prototype.correctZoomScrollHeight = function() {
		$("#zoomScroll").height(window.innerHeight - 150);
	};
	
	Controls.prototype.zoomLevel = function(level) {
		$("#zoomScroll").val(level, true);
	};
	
	Controls.prototype.updateZoom = function(zoom) {
		if(!Math.abs($("#zoomScroll").val()-zoom) <= 2) {
			//$("#zoomScroll").val(zoom);
		//	$("#tourLink").html("Needs update: " + Math.abs($("#zoomScroll").val()-zoom) + " <= 2");
		} //else
		//	$("#tourLink").html("Good.");
		//$("#tourLink").html(Math.abs($("#zoomScroll").val()-zoom));
	};
	
	return Controls;
});