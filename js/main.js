'use strict';

window.ARThreeOnLoad = function() {

	ARController.getUserMediaThreeScene({cameraParam: 'data/camera_para.dat', 
	onSuccess: function(arScene, arController, arCamera) {

		document.body.className = arController.orientation;

		var renderer = new THREE.WebGLRenderer({antialias: true});
		if (arController.orientation === 'portrait') {
			var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
			var h = window.innerWidth;
			renderer.setSize(w, h);
			renderer.domElement.style.paddingBottom = (w-h) + 'px';
		} else {
			if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
				renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);
			} else {
				renderer.setSize(arController.videoWidth, arController.videoHeight);
				document.body.className += ' desktop';
			}
		}

		document.body.insertBefore(renderer.domElement, document.body.firstChild);


		function loadFbx(markerRoot) {
			// model
			var manager = new THREE.LoadingManager();
			manager.onProgress = function( item, loaded, total ) {
				console.log( item, loaded, total );
			};
			var onProgress = function( xhr ) {
				if ( xhr.lengthComputable ) {
					var percentComplete = xhr.loaded / xhr.total * 100;
					console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
				}
			};
			var onError = function( xhr ) {
				console.error( xhr );
			};
			var loader = new THREE.FBXLoader( manager );
			loader.load( 'models/fbx/xsi_man_skinning.fbx', function( object ) {
				object.scale.x = 0.1;
				object.scale.y = 0.1;
				object.scale.z = 0.1;
				//object.mixer = new THREE.AnimationMixer( object );
				//mixers.push( object.mixer );
				//var action = object.mixer.clipAction( object.animations[ 0 ] );
				//action.play();
				markerRoot.add(object);
			}, onProgress, onError );

		}

		arController.loadMarker('data/patt.hiro', function(markerId) {
            var markerRoot = arController.createThreeMarker(markerId);
            console.log(markerRoot);
            //markerRoot.add(sphere);   
            loadFbx(markerRoot);
            arScene.scene.add(markerRoot);
        });
        
         arController.addEventListener('getMarker', function (ev) {
            console.log('found marker?', ev);
        });

		var tick = function() {
			arScene.process();
			arScene.renderOn(renderer);
			requestAnimationFrame(tick);
		};

		tick();

	}});

	delete window.ARThreeOnLoad;

};

if (window.ARController && ARController.getUserMediaThreeScene) {
	ARThreeOnLoad();
}



