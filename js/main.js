'use strict';

var time_delay = 1;

var markerRoot, loadCollada, avatar;
var audio = new Audio('models/mp3/Hip Hop Dancing.mp3');
var angle = 180;

var removeEntity;
var modelpath = 'Archiv-Movements/Hip Hop Dancing';

$('.dropdown-item').click((ev) => {
	var className = ev.target.className;
	if (className.indexOf('yoga') > -1) {
		switchCategory('yoga');
	} else if (className.indexOf('dance') > -1) {
		switchCategory('dance');
	} else if(className.indexOf('muscles') > -1) {
		switchCategory('muscles');
	}
});

$('.dance-content').css({"display": "block"});
$('.btn-primary').click((ev) => {
	switchModel($(ev.target).attr('data-title'));
});

$('.btn-faster').click(faster);
function faster() {
	console.log("faster");
	time_delay += 0.3;
	audio.playbackRate = time_delay;
	$('#speed').append('<img src="data/grellgelb.png" />');
}
$('.btn-slower').click(slower);
function slower() {
	console.log("slower");
	if(time_delay > 0.3)
		time_delay -= 0.3;
	else
		time_delay = 0;
	audio.playbackRate = time_delay;
	$('#speed img').last().remove();
}

var timer = 0;
setInterval(function() {
	$('#timer').html((""+timer++).toMMSS());
}, 1000);


String.prototype.toMMSS = function () {
	var sec_num = parseInt(this, 10); // don't forget the second param
	var minutes = Math.floor(sec_num / 60);
	var seconds = sec_num -(minutes * 60);

	if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) {seconds = "0"+seconds;}
	return minutes+':'+seconds;
}

// scale
$('#slider1').on("change", () => {
	scaleScene($('#slider1').val());
});

//rotate
$('#slider2').on("change", () => {
	rotateScene($('#slider2').val());
	angle = $('#slider2').val();
	console.log(angle);
});

$('#showMessage').on("click", () => {
	var messages = ["Awesome", "Keep it up", "Impressive"];
	$('#info').html(messages[Math.floor(Math.random() * (messages.length))])
	$('#info').css({"opacity": 1, left: Math.random()*300 + 'px', top: Math.random()*300 + 'px'});
	setTimeout(function() {
		$('#info').css({"opacity": 0, left: 0, top: 0});
	}, 1000);
});


function switchModel(model) {
	$('.title-bar').html(model);
	modelpath = 'Archiv-Movements/' + model;
	removeEntity(modelpath);
	loadCollada(markerRoot);
	if(!!audio)
		audio.pause();
	audio = new Audio('models/mp3/'+ model +'.mp3');
	audio.play();
}

function switchCategory(category) {
	$('.switch-content').css({"display": "none"});
	$('.'+category+'-content').css({"display": "block"});
}

function rotateScene(angle) {
	if(!!avatar) 
		avatar.rotation.y = -angle;
}

function scaleScene(scale) {
	if(!!avatar)
		avatar.scale.setScalar(0.001 + (scale * 0.0002));
}
window.ARThreeOnLoad = function() {

	ARController.getUserMediaThreeScene({cameraParam: 'data/camera_para.dat',
		onSuccess: function(arScene, arController, arCamera) {

			removeEntity = function(objectName) {
				var selectedObject = arScene.scene.getObjectByName(objectName);
				//selectedObject.position.add(new THREE.Vector3(-1000, 0, 0));
				console.log(arScene.scene);
				console.log(selectedObject);
				arScene.scene.remove( selectedObject );
				console.log(arScene.scene);
			}



			document.body.className = arController.orientation;
			var clock = new THREE.Clock();
			var mixer;
			var camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 10000);
			camera.position.set(5, 0, 13); //TODO useless, remove?

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
					//arController.videoHeight *= 2;
					//arController.videoWidth *= 2;
					renderer.setSize(arController.videoWidth, arController.videoHeight);
					document.body.className += ' desktop';
				}
			}
			$('#container').append(renderer.domElement);

			var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
			arScene.scene.add(ambientLight);

			var material = new THREE.MeshNormalMaterial({
				transparent : true,
				opacity: 0.5,
				side: THREE.DoubleSide
			});

			loadCollada = function(markerRoot) {
				if(!!avatar) avatar.visible = false;	
				var loader = new THREE.ColladaLoader();
				console.log(modelpath);
				loader.load('models/' + modelpath + '.dae', collada => {
					//console.log(collada);
					var animations = collada.animations;
					//avatar.normalScale.x = 2;
					//avatar.normalScale.y = 2;
					avatar = collada.scene;
					avatar.name = modelpath;
					collada.scene.traverse(child => {
						if(child instanceof THREE.Mesh) {
							console.log(child.material);
							child.material.transparent = true;
							child.material.opacity = 0.5;
						}});



					console.log(avatar);
					mixer = new THREE.AnimationMixer(avatar);

					var animation = animations[0];
					var action = mixer.clipAction(animations[0]).play();
					console.log(markerRoot);

					markerRoot.add(avatar);
				});
			}

			arController.loadMarker('data/patt.hiro', function(markerId) {
				markerRoot = arController.createThreeMarker(markerId);
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

			
		if (annyang) {
		// Let's define our first command. First the text we expect, and then the function it should call
			var commands = {
				'play': toggleMarkerFixed,
				'stop': toggleMarkerFixed,
				'faster':faster, 
				'slower':slower
			};

		// Add our commands to annyang
			annyang.addCommands(commands);

		// Start listening. You can call this here, or attach this call to an event, button, etc.
			annyang.start();
		}
		

		document.getElementById("toggleMarkerFixedButton").onclick = toggleMarkerFixed;

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
