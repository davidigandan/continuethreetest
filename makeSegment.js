const toDegrees = 180 / Math.PI;

import * as THREE from "three";
import { CSG } from "three-csg-ts";
import { BevelledCylinderGeometry } from "./BevelledCylinderGeometry";

export function makeMitreSegment(
  length = 20,
  width = 5.0,
  topAngle,
  bottomAngle,
  material = undefined,
  mitreLimit = 5
) {
  
  const radius = width / 2;
  const maxExcess = mitreLimit * radius;

  const topExcess = radius * Math.min(maxExcess, Math.abs(Math.tan(topAngle)));

  const bottomExcess =
    radius * Math.min(maxExcess, Math.abs(Math.tan(bottomAngle)));

  // Generate cylinder body
  const precutLength = topExcess + bottomExcess + length;
  const geometry = new THREE.CylinderGeometry(radius, radius, precutLength, 36);
  const cylinder = new THREE.Mesh(geometry);

  // Create topCube
  const topCubeWidth = width / Math.cos(topAngle);
  const topCubeGeometry = new THREE.BoxGeometry(
    topCubeWidth,
    topCubeWidth,
    topCubeWidth
  );
  const topCube = new THREE.Mesh(topCubeGeometry);

  // Position topCube
  topCube.geometry.translate(0, topCubeWidth / 2, 0);
  topCube.geometry.rotateZ(-topAngle); //rotate topCube
  const topShift = (length + bottomExcess - topExcess) / 2;
  topCube.geometry.translate(0, topShift, 0);

  // Top subtraction
  const topTip = CSG.intersect(cylinder, topCube);
  const slicedCylinderTemp = CSG.subtract(cylinder, topTip);

  // Generate bottom cube
  const bottomCubeWidth = width / Math.cos(bottomAngle);
  const bottomCubeGeometry = new THREE.BoxGeometry(
    bottomCubeWidth,
    bottomCubeWidth,
    bottomCubeWidth
  );
  const bottomCube = new THREE.Mesh(bottomCubeGeometry);

  // Position bottomCube
  bottomCube.geometry.translate(0, -bottomCubeWidth / 2, 0);
  bottomCube.geometry.rotateZ(bottomAngle); //rotate bottomCube
  const bottomShift = (length + topExcess - bottomExcess) / 2;
  bottomCube.geometry.translate(0, -bottomShift, 0);

  // Bottom subtraction
  const bottomTip = CSG.intersect(slicedCylinderTemp, bottomCube);
  const slicedCylinder = CSG.subtract(slicedCylinderTemp, bottomTip);

  // Move bottom to world origin
  const bottomToOrigin = precutLength / 2 - bottomExcess;
  slicedCylinder.geometry.translate(0, bottomToOrigin, 0);
  slicedCylinder.material = material;

  // Disposal
  cylinder.geometry.dispose();
  topCube.geometry.dispose();
  bottomCube.geometry.dispose();
  topTip.geometry.dispose();
  bottomTip.geometry.dispose();
  slicedCylinderTemp.geometry.dispose();

  return slicedCylinder;
}

export function makeSegment(length = 20, width = 5, material = undefined) {
  const radius = width / 2;

  // Generate cylinder body
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 36);

  const cylinder = new THREE.Mesh(geometry);

  // Move bottom to world origin
  cylinder.geometry.translate(0, length / 2, 0);
  cylinder.material = material;

  return cylinder;
}

export function makeMitreSegment2(
  length,
  width,
  topAngle,
  bottomAngle,
  material = undefined
  // mitreLimit = 5
) {
  
  const radius = width / 2;
  const radialSegments = 32;
  // Generate cylinder body
  const segmentGeometry = new BevelledCylinderGeometry(
    length,
    radius,
    topAngle,
    bottomAngle,
    radialSegments,
    1
  );
  console.log(`Segment Geo: ${segmentGeometry}`);

  const mitreSegment = new THREE.Mesh(segmentGeometry);

  // Move bottom to world origin
  mitreSegment.material = material;

  return mitreSegment;
}
