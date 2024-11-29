const toDegrees = 180 / Math.PI;

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BevelledCylinderGeometry } from "./MitredLineGeometry.js";
import { makeMitreSegment, makeMitreSegment2 } from "./makeSegment.js";

// Setup scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 60;
const renderer = new THREE.WebGLRenderer({ antialias: "true" });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const material = new THREE.MeshBasicMaterial({ color: "orange" });

const testConeGeometry = new BevelledCylinderGeometry(
  40,
  0.5,
  0 / toDegrees,
  80 / toDegrees,
  19,
  1
);

const testConeMesh = new THREE.Mesh(
  testConeGeometry,
  new THREE.MeshBasicMaterial({ color: "blue" })
);

// const testConeMesh = makeMitreSegment(
//   20,
//   5,
//   Math.PI / 4,
//   Math.PI / 4,
//   new THREE.MeshBasicMaterial({ color: "green" }),
// );

const marker = new THREE.SphereGeometry(0.1, 16, 16);
const markerMaterial = new THREE.MeshBasicMaterial({ color: "green" });
const markerMesh = new THREE.Mesh(marker, markerMaterial);
markerMesh.position.set(0.216941869558779, 42.7310562561766, 0.450484433951209);

const axesHelper = new THREE.AxesHelper(10);
scene.add(testConeMesh, axesHelper, markerMesh);
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Mesh output disposal
console.log("Current memory use:", renderer.info);
