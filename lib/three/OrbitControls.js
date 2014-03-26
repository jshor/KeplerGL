/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 *
 * customized for momentum (zoom and phi/delta) by paulkaplan
 * functions for dolly-in/dolly-out by jshor
 */
 
THREE.OrbitControls = function ( object, domElement ) {
 
  this.object = object;
  this.domElement = ( domElement !== undefined ) ? domElement : document;
 
  // API
 
  this.enabled = true;
 
  this.center = new THREE.Vector3();
 
  this.userZoom = true;
  this.userZoomSpeed = 1.0;
 
  this.userRotate = true;
  this.userRotateSpeed = 1.0;
 
  this.userPan = true;
  this.userPanSpeed = 2.0;
 
  this.autoRotate = false;
  this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
 
  this.minPolarAngle = 0; // radians
  this.maxPolarAngle = Math.PI; // radians
 
  this.minDistance = 0;
  this.maxDistance = Infinity;
 
  this.zoomDampingFactor = 0.07;
 
  this.momentumDampingFactor = 0.8;
  this.momentumScalingFactor = 0.005;
 
  this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
 
  // internals
 
  var scope = this;
 
  var EPS = 0.000001;
  var PIXELS_PER_ROUND = 1800;
 
  var rotateStart = new THREE.Vector2();
  var rotateEnd = new THREE.Vector2();
  var rotateDelta = new THREE.Vector2();
 
  var zoomStart = new THREE.Vector2();
  var zoomEnd = new THREE.Vector2();
  var zoomDelta = new THREE.Vector2();
 
  var _zoomEnd = 0;
  var _zoomStart = 0;
 
  var phiDelta = 0;
  var thetaDelta = 0;
  var scale = 1;
 
  var lastPosition = new THREE.Vector3();
 
  var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
  var state = STATE.NONE;
 
  // events
 
  var changeEvent = { type: 'change' };
 
 
  this.rotateLeft = function ( angle ) {
 
    if ( angle === undefined ) {
 
      angle = getAutoRotationAngle();
 
    }
 
    thetaDelta -= angle;
 
  };
 
  this.rotateRight = function ( angle ) {
 
    if ( angle === undefined ) {
 
      angle = getAutoRotationAngle();
 
    }
 
    thetaDelta += angle;
 
  };
 
  this.rotateUp = function ( angle ) {
 
    if ( angle === undefined ) {
 
      angle = getAutoRotationAngle();
 
    }
 
    phiDelta -= angle;
 
  };
 
  this.rotateDown = function ( angle ) {
 
    if ( angle === undefined ) {
 
      angle = getAutoRotationAngle();
 
    }
 
    phiDelta += angle;
 
  };
 
  this.pan = function ( distance ) {
 
    distance.transformDirection( this.object.matrix );
    distance.multiplyScalar( scope.userPanSpeed );
 
    this.object.position.add( distance );
    this.center.add( distance );
 
  };
  
  this.momentum = function(){
    if(!momentumOn) return;
 
    // console.log('momentum-ing: '+momentumUp+" "+momentumLeft);
 
    if(Math.abs(momentumUp + momentumLeft) < 10e-5){ momentumOn = false; return }
 
    momentumUp   *= this.momentumDampingFactor;
    momentumLeft *= this.momentumDampingFactor;
 
    thetaDelta -= this.momentumScalingFactor * momentumLeft;
    phiDelta   -= this.momentumScalingFactor * momentumUp;
 
  };
  
  this.zoomCamera = function(){
    var _this = this;
 
    var factor = 1.0 + ( _zoomEnd - _zoomStart ) * this.userZoomSpeed;
    scale *= factor;
    
 
    _zoomStart += ( _zoomEnd - _zoomStart ) * this.zoomDampingFactor;
  };
  
  this.setZoom = function(zoom) {
  //  this.radius = zoom;
  };
  
  
  this.getRadius = function () {
	return this.radius;
  };
  
  this.dolly = function(zoomChange) {
	this.disableControls = true;
	var cam = this.object.position;
	
	if(theta == undefined || phi == undefined || this.radius == undefined) {
		var r0 = Math.sqrt(Math.pow(cam.x, 2) + Math.pow(cam.y, 2) + Math.pow(cam.z, 2));
		var theta = Math.acos(cam.z/r0);
		var phi = Math.atan(cam.y/cam.x);
	}
	
	// get distance percentage from zoom scale
	var r1 = (this.maxDistance-this.minDistance)*zoomChange;
	if(r1 > 0 && !isNaN(theta) && !isNaN(phi)) {
		var x1 = r1*Math.sin(theta)*Math.cos(phi);
		var y1 = r1*Math.sin(theta)*Math.sin(phi);
		var z1 = r1*Math.cos(theta);
		
		// $(".tourLink").html("X: " + x1 + "; Y: " + y1 + "; Z: " + z1 + "; phi: " + phi + "; theta: " + theta);
		this.object.position.set(x1, y1, z1);
	}
  };
  
  this.update = function () {
    this.zoomCamera();
    this.momentum();
    // console.log(scale)
 
    var position = this.object.position;
    var offset = position.clone().sub( this.center );
 
    // angle from z-axis around y-axis
	$("#speedScale").val((this.radius/(this.maxDistance-this.minDistance)), true);
 
    var theta = Math.atan2( offset.x, offset.z );
 
    // angle from y-axis
 
    var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );
 
    if ( this.autoRotate ) {
 
      this.rotateLeft( getAutoRotationAngle() );
 
    }
 
    theta += thetaDelta;
    phi += phiDelta;
 
    // restrict phi to be between desired limits
    phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );
 
    // restrict phi to be betwee EPS and PI-EPS
    phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );
 
    this.radius = offset.length() * scale;
	
 
    // restrict radius to be between desired limits
    this.radius = Math.max( this.minDistance, Math.min( this.maxDistance, this.radius ) );
 
    offset.x = this.radius * Math.sin( phi ) * Math.sin( theta );
    offset.y = this.radius * Math.cos( phi );
    offset.z = this.radius * Math.sin( phi ) * Math.cos( theta );
 
    position.copy( this.center ).add( offset );
 
    this.object.lookAt( this.center );
 
    thetaDelta = 0;
    phiDelta = 0;
    scale = 1;
 
    if ( lastPosition.distanceTo( this.object.position ) > 0 ) {
 
      this.dispatchEvent( changeEvent );
 
      lastPosition.copy( this.object.position );
 
    }
 
  };
 
 
  function getAutoRotationAngle() {
 
    return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
 
  }
 
  function getZoomScale() {
 
    return Math.pow( 0.95, scope.userZoomSpeed );
 
  }
 
  function onMouseDown( event ) {
    
    momentumOn = false;
	scope.autoRotate = false;
	// setTimeout(function() {
		// scope.autoRotate = true;
	// }, 1000);
    momentumLeft = momentumUp = 0;
 
    if ( scope.enabled === false ) return;
    if ( scope.userRotate === false ) return;
 
    event.preventDefault();
 
    if ( event.button === 0 ) {
 
      state = STATE.ROTATE;
 
      rotateStart.set( event.clientX, event.clientY );
 
    } else if ( event.button === 1 ) {
 
      state = STATE.ZOOM;
 
      zoomStart.set( event.clientX, event.clientY );
 
    } else if ( event.button === 2 ) {
 
      state = STATE.PAN;
 
    }
 
    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mouseup', onMouseUp, false );
 
  }
 
  var momentumLeft, momentumUp;
 
  function onMouseMove( event ) {
 
    if ( scope.enabled === false ) return;
 
    event.preventDefault();
 
    if ( state === STATE.ROTATE ) {
 
      rotateEnd.set( event.clientX, event.clientY );
      rotateDelta.subVectors( rotateEnd, rotateStart );
 
      momentumLeft = event.webkitMovementX;
      momentumUp   = event.webkitMovementY;
      // momentumLeft += 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed;
      // momentumUp   += 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed;
 
      scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
      scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );
 
      rotateStart.copy( rotateEnd );
 
      } 
	else if ( state === STATE.PAN ) {
 
      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
 
      scope.pan( new THREE.Vector3( - movementX, movementY, 0 ) );
 
    }
 
  }
  
  var momentumOn = false;
 
  function onMouseUp( event ) {
	var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
	
	if(!isFirefox)
		momentumOn = true; // this kills the firefox
 
    if ( scope.enabled === false ) return;
    if ( scope.userRotate === false ) return;
 
    document.removeEventListener( 'mousemove', onMouseMove, false );
    document.removeEventListener( 'mouseup', onMouseUp, false );
 
    state = STATE.NONE;
 
  }
 
  function onMouseWheel( event ) {
 
    if ( scope.enabled === false ) return;
    if ( scope.userZoom === false ) return;
    event.preventDefault();
    event.stopPropagation();
 
    var delta = 0;
 
    if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
 
      delta = event.wheelDelta / 40;
 
    } else if ( event.detail ) { // Firefox
 
      delta = - event.detail;
 
    }
 
    _zoomStart += delta * 0.001;
 
  }
 
  function onKeyDown( event ) {
 
    if ( scope.enabled === false ) return;
    if ( scope.userPan === false ) return;
 
    switch ( event.keyCode ) {
 
      case scope.keys.UP:
        scope.pan( new THREE.Vector3( 0, 1, 0 ) );
        break;
      case scope.keys.BOTTOM:
        scope.pan( new THREE.Vector3( 0, - 1, 0 ) );
        break;
      case scope.keys.LEFT:
        scope.pan( new THREE.Vector3( - 1, 0, 0 ) );
        break;
      case scope.keys.RIGHT:
        scope.pan( new THREE.Vector3( 1, 0, 0 ) );
        break;
    }
 
  }
 
 // this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
  this.domElement.addEventListener( 'mousedown', onMouseDown, false );
  this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
  this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
  this.domElement.addEventListener( 'keydown', onKeyDown, false);
 
};
 
THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );