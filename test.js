import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BevelledCylinderGeometry } from "./BevelledCylinderGeometry.js";

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
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const material = new THREE.MeshBasicMaterial({ color: "orange" });
// const bevelledCylinder = showBevelledCylinder()
const testConeGeometry = new BevelledCylinderGeometry(
  5,
  20,
  36,
  7,
  Math.PI / 4,
  Math.PI / 4
);
const testConeMesh = new THREE.Mesh(
  testConeGeometry,
  new THREE.MeshBasicMaterial({ color: "blue" })
);

const axesHelper = new THREE.AxesHelper(10);
scene.add(testConeMesh, axesHelper);
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Mesh output disposal
console.log("Current memory use:", renderer.info);
