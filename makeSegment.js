import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import RenderBundle from 'three/src/renderers/common/RenderBundle.js';

export default function makeSegment(length=20, width=5, topAngle, bottomAngle) {
 // Create cylinder mesh
//  const topEndCylinderGeometry= new THREE.CylinderGeometry( 2.5, 2.5, 8, 32 );
//  const topEndCylinderMaterial = new THREE.MeshBasicMaterial( { color: 0x0000FF } );
//  const topEndCylinder = new THREE.Mesh( topEndCylinderGeometry, topEndCylinderMaterial );
//  topEndCylinder.position.set(0,11,0); //topendcylinder height is 5, so position must be half hight plus height of body
//  topEndCylinder.updateMatrix();
//  scene.add(topEndCylinder);

//  // Create cube
 const cubeWidth = width/Math.cos(topAngle)
 const cubeGeometry = new THREE.BoxGeometry(cubeWidth,cubeWidth,cubeWidth);
 const cubeMaterial = new THREE.MeshBasicMaterial( { color: "red" } );
 const cube = new THREE.Mesh( cubeGeometry, cubeMaterial);
//  cube.position.set(0,length/2,0); //position on top right of cylinder
 cube.geometry.translate(0,cubeWidth/2,0)
 cube.geometry.rotateZ(topAngle); //rotate cube 
 cube.geometry.translate(0,length/2,0)


// Generate cylinder body
const precutLength= (width/2)* (Math.tan(topAngle) + Math.tan(bottomAngle)) + length;
console.log("width", width, "topAngle", topAngle, "bottomAngle", bottomAngle, "length", length);
const geometry = new THREE.CylinderGeometry( width/2, width/2, precutLength, 32 );
const material = new THREE.MeshBasicMaterial( { color: "green" } );
const cylinder = new THREE.Mesh( geometry, material );


const topTip = CSG.intersect(cylinder, cube);
topTip.material = new THREE.MeshBasicMaterial({color: "orange"});

const slicedCylinder = CSG.subtract(cylinder, topTip);
cube.geometry.translate(0, -length/2, 0)
cube.geometry.rotateZ(-topAngle + bottomAngle + Math.PI)
cube.geometry.translate(0, -length/2 , 0)



// cube.rotateZ(-topAngle + bottomAngle + Math.PI)
// cube.rotateZ(-topAngle);
// cube.translateY(-length)

const bottomTip = CSG.intersect(cylinder,cube);
bottomTip.material = topTip.material
const finalCylinder = CSG.subtract(slicedCylinder, bottomTip);
// finalCylinder.material = new Th


// // Assemble Gemetries
// const mesh1= slicedCylinder.clone();
// mesh1.material = new THREE.MeshBasicMaterial({color: "yellow"})
// mesh1.position.set(0,14,0);



return [finalCylinder/*, cylinder, slicedCylinder ,,cube*/]
}

