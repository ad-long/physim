<template>
	<div id="webgl"></div>
</template>

<script setup lang="ts" name="index">

import * as THREE from 'three';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ca } from 'element-plus/es/locale';

let camera, scene, renderer;
let myObjs = {};

init();
animate();
document.addEventListener('keydown', function (event) {
	onKeyDown(event, myObjs['car']);
});
document.addEventListener('keyup', function (event) {
	onKeyUp(event, myObjs['car']);
});

function init() {
	// scene
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
	scene.add(camera);

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);

	const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
	camera.add(mainLight);

	// model
	const onProgress = function (xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = xhr.loaded / xhr.total * 100;
			console.log(Math.round(percentComplete, 2) + '% downloaded');
		}
	};

	new MTLLoader()
		.setPath('obj/')
		.load('dt.mtl', function (materials) {
			materials.preload();
			new OBJLoader()
				.setMaterials(materials)
				.setPath('obj/')
				.load('dt.obj', function (object) {
					scene.add(object);
					autoLocalOneModel(object, camera, controls);
					getChildrenObj(object, myObjs);
				}, onProgress);
		});

	function autoLocalOneModel(object, camera, controls) {
		const box = new THREE.Box3().setFromObject(object);
		const boxSize = box.getSize(new THREE.Vector3()).length();
		const boxCenter = box.getCenter(new THREE.Vector3());

		const sizeToFitOnScreen = boxSize * 0.6;
		const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
		const distance = sizeToFitOnScreen / Math.tan(halfFovY);
		const direction = (new THREE.Vector3())
			.subVectors(camera.position, boxCenter)
			.multiply(new THREE.Vector3(1, 0, 1))
			.normalize();

		camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
		camera.near = boxSize / 100;
		camera.far = boxSize * 100;
		camera.updateProjectionMatrix();
		camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);

		controls.maxDistance = boxSize * 10;
		controls.target.copy(boxCenter);
		controls.update();

		mainLight.position.copy(camera.position);
		mainLight.target.position.set(boxCenter.x, boxCenter.y, boxCenter.z);
		scene.add(mainLight.target);
	}

	function getChildrenObj(object, resultMap) {
		object.traverse((v) => {
			if (v.isMesh && v.material) {
				v.castShadow = true;
				v.frustumCulled = false;

				const { name, color, map } = v.material;
				v.material = new THREE.MeshStandardMaterial({
					map,
					transparent: true,
					color,
					name
				});
				resultMap[v.name] = v;
			}
		});
	}

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);

	window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

function onKeyDown(event, car) {
	console.log(car);
	switch (event.keyCode) {
		case 38: // up
		case 87: // w
			car.moveForward = true;
			break;
		case 37: // left
		case 65: // a
			car.moveLeft = true;
			break;
		case 40: // down
		case 83: // s
			car.moveBackward = true;
			break;
		case 39: // right
		case 68: // d
			car.moveRight = true;
			break;
	}
}

function onKeyUp(event, car) {
	console.log(car);
	switch (event.keyCode) {
		case 38: // up
		case 87: // w
			car.moveForward = false;
			break;
		case 37: // left
		case 65: // a
			car.moveLeft = false;
			break;
		case 40: // down
		case 83: // s
			car.moveBackward = false;
			break;
		case 39: // right
		case 68: // d
			car.moveRight = false;
			break;
	}
}
</script>

<style scoped></style>
