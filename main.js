const toDegrees = 180 / Math.PI;

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "stats-gl";
import { generateRandom } from "./analysis/generateData";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const dataset = generateRandom(0, 100, 1, 0, 50, 5);

const lineBuilder = {
  thinLine: (dataset, lineColor) => {
    const points = dataset.map(
      (point) => new THREE.Vector3(point[0], point[1], 0)
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial([color: lineColor])
    return new THREE.Line(geometry, material)
  },

  cylinderline: (dataset, lineColor, lineWidth) => {

  },

  csgMitreLine: (dataset, lineColor, lineWidth) => {

  },

  bcgMitreLine: (dataset, lineColor, lineWidth, mitreLimit) => {

  },
};

// returns either a mesh or a line object that can be added to a scene
function buildLine(
  lineType,
  lineColor,
  dataset,
  lineWidth = null,
  mitreLimit = null
) {
  const builder = lineBuilder[lineType];
  if (!builder) throw new Error(`Unknown line type: ${lineType}`);
  return builder(dataset, lineColor, lineWidth, mitreLimit)
}

const line = buildLine("thinline", "blue", dataset);
scene.add(line);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
