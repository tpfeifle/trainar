'use strict';

var time_delay = 1;

window.ARThreeOnLoad = function() {

	ARController.getUserMediaThreeScene({cameraParam: 'data/camera_para.dat', 
	onSuccess: function(arScene, arController, arCamera) {

		document.body.className = arController.orientation;
		var clock = new THREE.Clock();
		var mixer;
		var camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.set(5, 0, 13);

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
				arController.videoHeight *= 2;
				arController.videoWidth *= 2;
				renderer.setSize(arController.videoWidth, arController.videoHeight);
				document.body.className += ' desktop';
			}
		}

		document.body.insertBefore(renderer.domElement, document.body.firstChild);
		var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
		arScene.scene.add(ambientLight);

		var material = new THREE.MeshNormalMaterial({
						transparent : true,
						opacity: 0.5,
						side: THREE.DoubleSide
					}); 

		function loadCollada(markerRoot) {
			var loader = new THREE.ColladaLoader();
                loader.load('models/Overhead Squat.dae', function (collada) {
                    var animations = collada.animations;
					var avatar = collada.scene;
					collada.scene.traverse(function(child) {
						if(child instanceof THREE.Mesh) {
							console.log(child.material);
							child.material.transparent = true;
							child.material.opacity = 0.5;
						}
					});

					console.log(avatar);
					mixer = new THREE.AnimationMixer(avatar);
					
					var animation = animations[0];
					var action = mixer.clipAction(animations[0]).play();
                    markerRoot.add(avatar);
                });
		}

		var markerRoot;
		arController.loadMarker('data/patt.hiro', function(markerId) {
            var markerRoot = arController.createThreeMarker(markerId);
            loadCollada(markerRoot);
            arScene.scene.add(markerRoot);
        });
        
         arController.addEventListener('getMarker', function (ev) {
            //console.log('found marker?', ev.data.marker.pos);
        });

		var markerFixed = false;

		function toggleMarkerFixed() {
			markerFixed = !markerFixed;
			console.log("Marker is now " + (markerFixed ? "locked" : "free"));
		}

		document.getElementById("toggleMarkerFixedButton").onclick = () => toggleMarkerFixed();

		var tick = function() {
			if(!markerFixed) // hack, watch out
				arScene.process();
			arScene.renderOn(renderer);
			requestAnimationFrame(tick);
		};
		animate();	

		function animate() {
			requestAnimationFrame(animate);
			render();
			//stats.update();
		}

		function render() {
			var delta = clock.getDelta() * time_delay;
			if (mixer !== undefined) {
				mixer.update(delta);
			}
			renderer.render(arScene, camera);
		}

		tick();

	}});

	delete window.ARThreeOnLoad;

};

if (window.ARController && ARController.getUserMediaThreeScene) {
	ARThreeOnLoad();
}



