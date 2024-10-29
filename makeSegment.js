import * as THREE from 'three';
import { CSG } from 'three-csg-ts';


export default function makeSegment(length=20, width=5, topAngle, bottomAngle) {


// Generate cylinder body
const precutLength = (width/2*Math.tan(topAngle)) + (width/2*Math.tan(bottomAngle)) + length
const geometry = new THREE.CylinderGeometry( width/2, width/2, precutLength, 32 );
const material = new THREE.MeshBasicMaterial( { color: "green" } );
const cylinder = new THREE.Mesh( geometry, material );

// Remove for 3JS recentring
const currYPosition = precutLength/2
const correctYPosition = length/2 + (width/2*Math.tan(topAngle)) //length plus top-excess
const yAdjustment= correctYPosition-currYPosition
cylinder.geometry.translate(0,yAdjustment,0)

// Create topCube
const topCubeWidth = (width/Math.cos(topAngle))
const topCubeGeometry = new THREE.BoxGeometry(topCubeWidth,topCubeWidth,topCubeWidth);
const topCubeMaterial = new THREE.MeshBasicMaterial( { color: "red" } );
const topCube = new THREE.Mesh( topCubeGeometry, topCubeMaterial);


// Position topCube
topCube.geometry.rotateZ(topAngle); //rotate topCube 
topCube.geometry.translate(0,topCubeWidth/2,0)
const topShift = (length+(width/2*Math.tan(bottomAngle))- (width/2*Math.tan(topAngle))) /2
topCube.geometry.translate(0,topShift,0) 


// Top subtraction
const topTip = CSG.intersect(cylinder, topCube);
topTip.material = new THREE.MeshBasicMaterial({color: "orange"});
let slicedCylinder = CSG.subtract(cylinder, topTip);

// Generate bottom cube
const bottomCubeWidth = (width/Math.cos(bottomAngle))
const bottomCubeGeometry = new THREE.BoxGeometry(bottomCubeWidth,bottomCubeWidth,bottomCubeWidth);
const bottomCubeMaterial = new THREE.MeshBasicMaterial( { color: "blue" } );
const bottomCube = new THREE.Mesh( bottomCubeGeometry, bottomCubeMaterial);


// Position bottomCube 
bottomCube.geometry.rotateZ( bottomAngle) //rotate bottomCube
bottomCube.geometry.translate(0,-bottomCubeWidth/2,0) 
const bottomShift = (length+(width/2*Math.tan(topAngle))- (width/2*Math.tan(bottomAngle))) /2
bottomCube.geometry.translate(0, -bottomShift, 0)

// bottomCube.geometry.translate(0, -length/2 , 0)

// Bottom subtraction
// const bottomTip = CSG.intersect(slicedCylinder, bottomCube);
// topTip.material = new THREE.MeshBasicMaterial({color: "black"});
// slicedCylinder = CSG.subtract(slicedCylinder, bottomTip);

// Scale the cube for the bottom width
// let scaleFactor = Math.cos(topAngle)/Math.cos(bottomAngle);
// scaleFactor = 5;
// topCube.scale.set(scaleFactor,scaleFactor,scaleFactor);


// const bottomTip = CSG.intersect(cylinder,topCube);
// bottomTip.material = topTip.material
// const finalCylinder = CSG.subtract(slicedCylinder, bottomTip);

return [  topCube,slicedCylinder, bottomCube/*, slicedCylinder ,,toptopCube*/]
}

