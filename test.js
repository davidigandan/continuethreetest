import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import  makeSegment  from './makeSegment'

// Setup scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xFFFFFF );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z=60;
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement)
const material = new THREE.MeshBasicMaterial({ color: "orange" })
const testMeshes = makeSegment(20,4,Math.PI/4,Math.PI/4,material)


const axesHelper = new THREE.AxesHelper(10)
scene.add(testMeshes, axesHelper)
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render( scene, camera );
 }
animate();

// Mesh output disposal
console.log('Current memory use:', renderer.info)