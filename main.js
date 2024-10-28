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
 
const datapoints = [1,2,3] //add more datapoint for demopoint1
 const segments =[]
 for (let i=0; i<datapoints.length; i++) {
    // segments.push(makeSegment(20,5, Math.PI/4, Math.PI/3));
    const arrayOfMeshes= makeSegment(20,5, Math.PI/4, Math.PI/3);
    arrayOfMeshes.forEach(mesh => {
        segments.push(mesh);
    })
 }

segments.forEach( (segment,i)=> {
    // segment.position.set(10*i,0,0);  //uncomment for demopoint2
    scene.add(segment);
})

// Create a line segment at y = 10
const lineMaterial = new THREE.LineBasicMaterial({ color: "black" });
const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-120, 10, 0),
    new THREE.Vector3(11,10, 0)
]);
const line = new THREE.Line(lineGeometry, lineMaterial);

// line 2
const width=5
const topAngle = Math.PI/4
const length = 10
const lineGeometry2 = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-120,(width/2*Math.tan(topAngle)) +length , 0),
    new THREE.Vector3(11,(width/2*Math.tan(topAngle)) +length, 0)
]);
const line2 = new THREE.Line(lineGeometry2, lineMaterial);





// Add the line to the scene
scene.add(line, line2);


 scene.add( new THREE.AxesHelper(11) );


 function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render( scene, camera );
 }
animate();