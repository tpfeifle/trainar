'use strict';

window.ARThreeOnLoad = function() {

	ARController.getUserMediaThreeScene({cameraParam: 'data/camera_para.dat', 
	onSuccess: function(arScene, arController, arCamera) {

		document.body.className = arController.orientation;
		var clock = new THREE.Clock();
		var mixer;
		var camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set( 5, 0, 13 );

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

		function loadCollada(markerRoot) {
			var loader = new THREE.ColladaLoader();
                loader.load( 'models/stormtrooper/stormtrooper.dae', function ( collada ) {
                    var animations = collada.animations;
					var avatar = collada.scene;
					mixer = new THREE.AnimationMixer( avatar );
					
					var animation = animations[0];
					var action = mixer.clipAction( animations[ 0 ] ).play();
                    markerRoot.add( avatar );
                });
		}

		arController.loadMarker('data/patt.hiro', function(markerId) {
            var markerRoot = arController.createThreeMarker(markerId);
            loadCollada(markerRoot);
            arScene.scene.add(markerRoot);
        });
        
         arController.addEventListener('getMarker', function (ev) {
            //console.log('found marker?', ev.data.marker.pos);
        });

		var tick = function() {
			arScene.process();
			arScene.renderOn(renderer);
			requestAnimationFrame(tick);
		};
		animate();	

		function animate() {
			requestAnimationFrame( animate );
			render();
			//stats.update();
		}

		function render() {
			var delta = clock.getDelta();
			if ( mixer !== undefined ) {
				mixer.update( delta );
			}
			renderer.render( arScene, camera );
		}

		tick();

	}});

	delete window.ARThreeOnLoad;

};

if (window.ARController && ARController.getUserMediaThreeScene) {
	ARThreeOnLoad();
}



