import * as THREE from 'three';
import { CSG } from 'three-csg-ts';


export default function makeSegment(length=20, width=5, topAngle, bottomAngle, material = undefined) {

const radius = width/2
const topExcess = radius*Math.tan(topAngle);
const bottomExcess = radius*Math.tan(bottomAngle);

// Generate cylinder body
const precutLength = topExcess + bottomExcess + length
const geometry = new THREE.CylinderGeometry( radius, radius, precutLength, 36 );
const cylinder = new THREE.Mesh( geometry );

// Create topCube
const topCubeWidth = (width/Math.cos(topAngle))
const topCubeGeometry = new THREE.BoxGeometry(topCubeWidth,topCubeWidth,topCubeWidth);
const topCube = new THREE.Mesh( topCubeGeometry);


// Position topCube
topCube.geometry.translate(0,topCubeWidth/2,0)
topCube.geometry.rotateZ(topAngle); //rotate topCube 
const topShift = (length+bottomExcess-topExcess) /2
topCube.geometry.translate(0,topShift,0) 


// Top subtraction
const topTip = CSG.intersect(cylinder, topCube);
const slicedCylinderTemp = CSG.subtract(cylinder, topTip);

// Generate bottom cube
const bottomCubeWidth = (width/Math.cos(bottomAngle))
const bottomCubeGeometry = new THREE.BoxGeometry(bottomCubeWidth,bottomCubeWidth,bottomCubeWidth);
const bottomCube = new THREE.Mesh( bottomCubeGeometry);

// Position bottomCube 
bottomCube.geometry.translate(0,-bottomCubeWidth/2,0) 
bottomCube.geometry.rotateZ( bottomAngle) //rotate bottomCube
const bottomShift = (length + topExcess - bottomExcess) /2
bottomCube.geometry.translate(0, -bottomShift, 0)

// Bottom subtraction
const bottomTip = CSG.intersect(slicedCylinderTemp, bottomCube);
const slicedCylinder = CSG.subtract(slicedCylinderTemp, bottomTip);

// Move bottom to world origin
const bottomToOrigin = (precutLength/2) - bottomExcess
slicedCylinder.geometry.translate(0,bottomToOrigin,0)
slicedCylinder.material = material;

// Disposal
cylinder.geometry.dispose();
topCube.geometry.dispose();
bottomCube.geometry.dispose();
topTip.geometry.dispose();
bottomTip.geometry.dispose();
slicedCylinderTemp.geometry.dispose();

// console.log('makeSegment memory use: ', renderer.info.memory);
return slicedCylinder
}

