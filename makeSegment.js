import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import RenderBundle from 'three/src/renderers/common/RenderBundle.js';

export default function makeSegment(length=20, width=5, topAngle, bottomAngle) {

// Create topCube
const topCubeWidth = (width/Math.cos(topAngle))
const topCubeGeometry = new THREE.BoxGeometry(topCubeWidth,topCubeWidth,topCubeWidth);
const topCubeMaterial = new THREE.MeshBasicMaterial( { color: "red" } );
const topCube = new THREE.Mesh( topCubeGeometry, topCubeMaterial);

topCube.geometry.translate(0,topCubeWidth/2,0)
topCube.geometry.rotateZ(topAngle); //rotate topCube 
topCube.geometry.translate(0,length/2,0)


// Generate cylinder body
const precutLength = (width/2*Math.tan(topAngle)) + (width/2*Math.tan(bottomAngle)) + length
const geometry = new THREE.CylinderGeometry( width/2, width/2, precutLength, 32 );
const material = new THREE.MeshBasicMaterial( { color: "green" } );
const cylinder = new THREE.Mesh( geometry, material );

// Adjust for 3JS recentring
const currYPosition = precutLength/2
const correctYPosition = length/2 + (width/2*Math.tan(topAngle)) //length plus top-excess
const yAdjustment= correctYPosition-currYPosition
cylinder.geometry.translate(0,yAdjustment,0)

const topTip = CSG.intersect(cylinder, topCube);
topTip.material = new THREE.MeshBasicMaterial({color: "orange"});

const slicedCylinder = CSG.subtract(cylinder, topTip);
topCube.geometry.translate(0, -length/2, 0)
topCube.geometry.rotateZ(-topAngle + bottomAngle + Math.PI)
topCube.geometry.translate(0, -length/2 , 0)




const bottomTip = CSG.intersect(cylinder,topCube);
bottomTip.material = topTip.material
const finalCylinder = CSG.subtract(slicedCylinder, bottomTip);



return [  slicedCylinder/*, slicedCylinder ,,toptopCube*/]
}

