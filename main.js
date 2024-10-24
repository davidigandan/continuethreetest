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

// Contorls
 const controls = new OrbitControls(camera, renderer.domElement);
 
const datapoints = [1] //add more datapoint for demopoint1
 const segments =[]
 for (let i=0; i<datapoints.length; i++) {
    segments.push(makeSegment());
 }
 

segments.forEach( (segment,i)=> {
    // segment.position.set(10*i,0,0);  //uncomment for demopoint2
    scene.add(segment);
})

 scene.add( new THREE.AxesHelper(50) );


 function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render( scene, camera );
 }
animate();