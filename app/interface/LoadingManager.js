define([
	"jquery"
],
function ($) {
	function LoadingManager() {
		// create the loading screen
		this.loadingPercent = $("<span></span>").html("0").addClass("percent");
		this.loadingScreen = $("<div></div>").addClass("loading-screen");
		this.loadingScreen.height(window.innerHeight);
		this.loadingScreen.width(window.innerWidth);
		
		this.loadingBox = $("<div></div>").addClass("content");
		this.loadingBox.append($("<div></div>").addClass("circle"));
		this.loadingBox.append($("<div></div>").addClass("circle1"));
		
		this.loadingScreen.append(this.loadingBox);
		this.loadingScreen.append(this.loadingPercent);
		
		$("body").append(this.loadingScreen);
		$("body").show();
		
		this.loadingPercent.css({ marginTop: window.innerHeight/2-40 });
		this.loadingBox.css({ marginTop: window.innerHeight/2-40 });
		
		this.queue = []; // queue of items to load
		this.itemsLoaded = 0;
		this.itemsTotal = 0;
		
		// create the OBJLoader manager from THREE.js
		var self = this;
		this.manager = new THREE.LoadingManager();
		this.manager.onProgress = function (item, loaded, total) {
			self.onProgress(item, loaded, total);
		};
	};
	
	LoadingManager.prototype.enqueue = function(item) {
		this.queue.push(item);
		this.itemsTotal++;
		console.log("loading: " + item);
	};
	
	LoadingManager.prototype.onProgress = function(item, loaded, total) {
		this.itemsLoaded++;
		var loadPercent = (this.itemsLoaded / this.itemsTotal*100).toFixed(0);
		console.log(loadPercent + "%");
		this.loadingPercent.html(loadPercent).append("%");
		if((this.itemsLoaded / this.itemsTotal*100) >= 100)
			this.loadingScreen.hide();
		console.log("loaded: " + item);
	};
	
	return LoadingManager;
});