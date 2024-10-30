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

const segments=[]
    // segments.push(makeSegment(20,5, Math.PI/4, Math.PI/3));
    const arrayOfMeshes= makeSegment(20,5, Math.PI/4, Math.PI/3);
    arrayOfMeshes.forEach(mesh => {
        segments.push(mesh)});
    
segments.forEach( (segment,i)=> {
    // segment.position.set(10*i,0,0);  //uncomment for demopoint2
    scene.add(segment);
})

 
 function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render( scene, camera );
 }
animate();