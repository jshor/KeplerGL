define([
	"jquery"
],
function ($) {
	function LoadingManager() {
		// create the loading screen
		this.loadingScreen = $("<div></div>").addClass("loading-screen");
		this.loadingPercent = $("<span></span>").html("0");
		this.loadingScreen.height(window.innerHeight);
		this.loadingScreen.width(window.innerWidth);
		this.loadingScreen.append("<h1>Loading...</h1>");
		this.loadingScreen.append(this.loadingPercent);
		this.loadingScreen.append("%");
		
		$("body").append(this.loadingScreen);
		$("body").show();
		
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
		this.loadingPercent.html((this.itemsLoaded / this.itemsTotal*100).toFixed(0));
		if((this.itemsLoaded / this.itemsTotal*100) >= 100)
			this.loadingScreen.hide();
		console.log("loaded: " + item);
	};
	
	return LoadingManager;
});