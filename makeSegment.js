import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSG } from 'three-csg-ts';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

// Setup scene, camera, renderer
// const scene = new THREE.Scene();
// scene.background = new THREE.Color( 0xFFFFFF );
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// camera.position.z=60;
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );
// // Contorls
//  const controls = new OrbitControls(camera, renderer.domElement);


export default function makeSegment() {
 // Create cylinder mesh
 const topEndCylinderGeometry= new THREE.CylinderGeometry( 2.5, 2.5, 8, 32 );
 const topEndCylinderMaterial = new THREE.MeshBasicMaterial( { color: 0x0000FF } );
 const topEndCylinder = new THREE.Mesh( topEndCylinderGeometry, topEndCylinderMaterial );
 topEndCylinder.position.set(0,11,0); //topendcylinder height is 5, so position must be half hight plus height of body
 topEndCylinder.updateMatrix();
//  scene.add(topEndCylinder);

 // Create cube
 const topEndCubeGeometry = new THREE.BoxGeometry(Math.sqrt(50), Math.sqrt(50), Math.sqrt(50));
 const topEndCubeMaterial = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
 const topEndCube = new THREE.Mesh( topEndCubeGeometry, topEndCubeMaterial);
 topEndCube.position.set(2.5,15,0); //position on top right of cylinder
 topEndCube.rotation.z = -Math.PI/4; //rotate cube -45 degrees. 
 topEndCube.updateMatrix(); //store the rotation
//  scene.add(topEndCube);

 // Perform subtraction by finding intersection
 const topTip = CSG.intersect(topEndCylinder, topEndCube);
 topTip.material = new THREE.MeshBasicMaterial({color: "orange"});


//  Generate topSlicedCylinder
 const slicedCylinder = CSG.subtract(topEndCylinder, topTip);
 slicedCylinder.material = new THREE.MeshBasicMaterial({color: "pink"});
 slicedCylinder.position.set(-5, 5, 4);
 slicedCylinder.updateMatrix();
//  scene.add(slicedCylinder);

//  Generate bottomSliced Cylinder
const bottomTip = slicedCylinder.clone()
bottomTip.material = new THREE.MeshBasicMaterial({color: "red"});
bottomTip.position.set(5,0,0)
// scene.add(bottomTip)

// Generate cylinder body
const geometry = new THREE.CylinderGeometry( 2.5, 2.5, 20, 32 );
const material = new THREE.MeshBasicMaterial( { color: "green" } );
const cylinder = new THREE.Mesh( geometry, material );
cylinder.position.set(0,0,0);
// scene.add(cylinder)

// Assemble Gemetries
const mesh1= slicedCylinder.clone();
mesh1.material = new THREE.MeshBasicMaterial({color: "yellow"})
mesh1.position.set(0,14,0);
// scene.add(mesh1)

const mesh3 = bottomTip.clone();
mesh3.material = new THREE.MeshBasicMaterial({ color: "blue" });
mesh3.position.set(0, -14, 0); // Move it below the cylinder body
mesh3.rotateZ(Math.PI);
// scene.add(mesh3);


// Merge Geometries
const firstMerge = BufferGeometryUtils.mergeGeometries([mesh1.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0,12.5,0)), cylinder.geometry])
const rotationMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0,0,1), Math.PI);
const translationMatrix = new THREE.Matrix4().makeTranslation(0,0,0)
const transformationMatrix = new THREE.Matrix4().multiplyMatrices(translationMatrix, rotationMatrix);

const finalMerge = BufferGeometryUtils.mergeGeometries([firstMerge, mesh3.geometry.applyMatrix4(transformationMatrix)])
const finalMaterial = new THREE.MeshBasicMaterial({color: "orange"})
const finalMesh = new THREE.Mesh(finalMerge, finalMaterial);
finalMesh.position.set(10,0,0);

return finalMesh;
}

// scene.add(makeSegment());
// scene.add(finalMesh)





//  // Show sliced off tip
//  const clonedTopTip = topTip.clone();
//  clonedTopTip.position.set(5, 5, 4);
//  clonedTopTip.updateMatrix();
// //  scene.add(clonedTopTip);

//  scene.add( new THREE.AxesHelper( 20 ));


//  function animate() {
// 	requestAnimationFrame(animate);
// 	controls.update();
// 	renderer.render( scene, camera );
// }
// animate();